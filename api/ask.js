// =====================================================================
//  /api/ask — the server half of the assistant.
//
//  Flow:
//    1. validate and rate-limit the request
//    2. embed the question (only if an embedding key exists)
//    3. retrieve passages: BM25 + optional vectors, fused
//    4. if nothing scores well enough, refuse WITHOUT calling a model
//    5. otherwise ask whichever model provider has a key, grounded
//       on those passages only
//
//  Step 4 matters twice over: it is what stops the assistant inventing
//  a career, and it means unanswerable questions cost nothing.
//
//  Works with no key at all: search still runs and it quotes his own
//  notes. A key upgrades those quotes into written answers.
//
//  The API key lives here and only here. It is never sent to a browser.
// =====================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { search, tokenize } from "./_retrieval.js";
import { assistant } from "../config/assistant.js";
import { CHAT_PROVIDERS, EMBED_PROVIDERS, pick, chat, embed } from "./_providers.js";

// Read the index with fs rather than a JSON import attribute. Import
// attributes need a recent runtime and are not always picked up by
// serverless file-tracing, which would deploy a function whose index is
// missing. vercel.json pins data/** into the bundle to match.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const index = JSON.parse(
  fs.readFileSync(path.join(HERE, "..", "data", "index.json"), "utf8")
);

// ------------------------------------------------------------ rate limit
//  In-memory, so it resets whenever the function goes cold and is not
//  shared between concurrent instances. It is a speed bump, not a wall.
//  For a portfolio site that is the right trade; if this ever gets
//  abused, move the counters to Vercel KV.
const hits = new Map();

//  The provider's free limit is per PROJECT — every visitor draws on the
//  same allowance. Tracking calls globally lets a busy moment degrade to
//  quoting instead of queueing up requests that will be refused anyway.
const providerCalls = [];

function providerBudgetLeft() {
  const now = Date.now();
  while (providerCalls.length && now - providerCalls[0] > 60_000) providerCalls.shift();
  return providerCalls.length < assistant.limits.providerRequestsPerMinute;
}

function rateLimit(ip) {
  const now = Date.now();
  const record = hits.get(ip) || { minute: [], day: [] };

  record.minute = record.minute.filter(function (t) { return now - t < 60_000; });
  record.day = record.day.filter(function (t) { return now - t < 86_400_000; });

  if (record.minute.length >= assistant.limits.requestsPerMinute) {
    return "You are asking faster than I can keep up. Give it a minute.";
  }
  if (record.day.length >= assistant.limits.requestsPerDay) {
    return "That is the daily limit for one visitor. Email him directly at " +
           "ramakrishnan15126@gmail.com.";
  }

  record.minute.push(now);
  record.day.push(now);
  hits.set(ip, record);

  // Keep the map from growing without bound across a warm instance.
  if (hits.size > 5000) {
    for (const [key, value] of hits) {
      if (!value.day.length) hits.delete(key);
      if (hits.size <= 2500) break;
    }
  }
  return null;
}

// ------------------------------------------------------------- embedding
/**
 * Embed the question with the SAME provider and model that built the
 * index. Vectors from two different models are not comparable — cosine
 * between them is noise that looks like a score — so a mismatch turns
 * semantic search off rather than silently returning nonsense.
 */
//  Every question costs one embedding call, and a free tier runs out.
//  The suggestion chips are asked verbatim over and over, so a small
//  cache removes most of the repeat traffic for nothing.
const queryVectors = new Map();
const QUERY_CACHE_MAX = 300;

async function embedQuestion(question) {
  if (!index.hasVectors) return null;
  const provider = pick(EMBED_PROVIDERS);
  if (!provider) return null;

  const cacheKey = question.trim().toLowerCase();
  if (queryVectors.has(cacheKey)) return queryVectors.get(cacheKey);
  if (index.embedProvider !== provider.id || index.embedModel !== provider.model) {
    console.error("Embedding mismatch: index built with " + index.embedProvider +
      "/" + index.embedModel + ", key present for " + provider.id + "/" +
      provider.model + ". Re-run `npm run ingest`. Using keyword search only.");
    return null;
  }
  const vectors = await embed(provider, [question], "query");
  const vector = vectors[0] || null;

  if (vector) {
    if (queryVectors.size >= QUERY_CACHE_MAX) {
      queryVectors.delete(queryVectors.keys().next().value);
    }
    queryVectors.set(cacheKey, vector);
  }
  return vector;
}

// ---------------------------------------------------------------- prompt
function buildSystemPrompt(passages) {
  const voice = assistant.voice === "first"
    ? "Answer in the first person, as Ramakrishnan himself."
    : "Answer in the third person, about Ramakrishnan. You are his assistant, not him.";

  const numbered = passages.map(function (p, i) {
    const label = p.heading ? p.heading + " (" + p.source + ")" : p.source;
    return "[" + (i + 1) + "] " + label + "\n" + p.text;
  }).join("\n\n---\n\n");

  return [
    "You answer questions about Ramakrishnan S for visitors to his portfolio site,",
    "many of whom are recruiters or potential clients.",
    "",
    voice,
    "",
    "RULES — these are absolute:",
    assistant.guardrails.rules.map(function (r, i) { return (i + 1) + ". " + r; }).join("\n"),
    "",
    "PASSAGES — everything you know about him is below. Nothing else is known.",
    "",
    numbered
  ].join("\n");
}

// ------------------------------------------------------- extractive answer
/**
 * Compose a readable answer from the retrieved text alone, for when no
 * no model provider key is configured.
 *
 * This is extraction, not generation: it returns his own sentences,
 * unaltered, from the single best-matching passage. That is a real
 * answer to most questions and it is honest about being quoted rather
 * than written — which a wall of six raw passages is not.
 */
function extractAnswer(passages) {
  const best = passages[0];
  if (!best) return null;

  // The passages are markdown. Strip the syntax before quoting, or the
  // answer arrives with "**Daily:**" and "> " in it and reads as a
  // leaked internal file rather than a reply.
  const plain = best.text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(^|\W)\*([^*\n]+)\*(?=\W|$)/g, "$1$2")
    .replace(/`([^`]+)`/g, "$1");

  // Split on sentence ends, keeping the terminator. Guard against the
  // abbreviations and decimals this corpus is full of — "B.Com",
  // "llms.txt", "43 to 65", "2.5" — which a naive split on "." shreds.
  const sentences = plain
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z“"'(])/)
    .filter(function (x) { return x.trim().length > 0; });

  // A chunk can still begin mid-sentence — it may open with the overlap
  // carried forward from the chunk before it. Quoting that verbatim
  // produces an answer starting "plainly, because…", so drop a leading
  // fragment whenever there is a whole sentence behind it to use.
  while (sentences.length > 1 && !/^["'“(]?[A-Z0-9]/.test(sentences[0].trim())) {
    sentences.shift();
  }

  let answer = "";
  for (const sentence of sentences) {
    if (answer && (answer + " " + sentence).length > 420) break;
    answer = answer ? answer + " " + sentence : sentence;
  }
  return answer.trim();
}

// ------------------------------------------------------------------ main
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  const ip = (req.headers["x-forwarded-for"] || "local").split(",")[0].trim();
  const limited = rateLimit(ip);
  if (limited) {
    res.status(429).json({ answer: limited, passages: [], limited: true });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  const question = String(body.question || "").trim();
  if (!question) {
    res.status(400).json({ error: "No question." });
    return;
  }
  if (question.length > assistant.limits.maxQuestionChars) {
    res.status(400).json({
      answer: "That question is longer than I accept. Try a shorter one.",
      passages: []
    });
    return;
  }

  // Prior turns, so follow-ups like "what about the second one?" work.
  const history = Array.isArray(body.history)
    ? body.history.slice(-assistant.limits.maxHistoryTurns * 2)
        .filter(function (m) { return m && (m.role === "user" || m.role === "assistant") && m.content; })
        .map(function (m) { return { role: m.role, content: String(m.content).slice(0, 2000) }; })
    : [];

  // ---- retrieve ----
  let queryVector = null;
  try {
    queryVector = await embedQuestion(question);
  } catch (err) {
    // Degrade to keyword-only rather than failing the request. A
    // slightly worse answer beats an error message.
    console.error("Query embedding failed, falling back to keywords:", err.message);
  }

  const result = search(
    index, question, queryVector, assistant.retrieval, assistant.synonyms
  );
  const passages = result.hits;

  const cited = passages.map(function (p, i) {
    return { n: i + 1, source: p.source, heading: p.heading, via: p.via, text: p.text };
  });

  // ---- nothing relevant: refuse without spending a token ----
  //  `confident` reads the raw search scores rather than the fused rank
  //  score — see the note in _retrieval.js. Refusing here rather than
  //  letting the model decide means an unanswerable question costs
  //  nothing and cannot be talked into a plausible-sounding invention.
  if (!passages.length || !result.confident) {
    res.status(200).json({
      answer: assistant.guardrails.refusal,
      passages: [],
      grounded: false,
      mode: "refused",
      debug: { lexTop: result.lexTop, semTop: result.semTop, search: result.mode }
    });
    return;
  }

  // ---- no model key: quote him rather than fail ----
  //  Search works without a key; only the writing needs one. Returning
  //  his own sentences from the best-matching passage answers most
  //  questions properly, and is clearly labelled as a quote so nobody
  //  mistakes it for a composed reply.
  const provider = pick(CHAT_PROVIDERS);
  const overBudget = provider && !providerBudgetLeft();

  if (!provider || overBudget) {
    const quoted = extractAnswer(passages);

    // Does the passage actually answer THIS question, or is it just the
    // least-bad match? Without a model there is nothing to notice the
    // difference, so check whether the visitor's own words appear in the
    // passage's heading. "What car does he drive" matches a passage
    // about driving demand generation; presenting that as an answer
    // would be worse than admitting it is only the nearest thing.
    const asked = tokenize(question);
    const headingWords = tokenize(passages[0] ? passages[0].heading || "" : "");
    // A question made entirely of stopwords ("who is he?") leaves nothing
    // to compare against a heading. That is not evidence it is off-topic
    // — retrieval deliberately answers those from the opening sections —
    // so it must not be labelled as an unanswered question.
    const onTopic = asked.length === 0 ||
      asked.some(function (t) { return headingWords.indexOf(t) !== -1; });

    res.status(200).json({
      answer: quoted || assistant.guardrails.refusal,
      note: !quoted ? null : (overBudget
        ? "Busy right now, so this is quoted straight from his notes rather than " +
          "written for your question. Ask again in a minute for a composed answer."
        : onTopic
        ? "Quoted from his notes — no model key is configured, so this is his own " +
          "wording rather than an answer written for your question."
        : "He has not written directly about that. This is the closest passage in " +
          "his notes, quoted as-is — it may not answer what you asked."),
      passages: cited,
      grounded: true,
      mode: "retrieval-only",
      debug: { lexTop: result.lexTop, semTop: result.semTop, search: result.mode }
    });
    return;
  }

  // ---- ask the model ----
  try {
    // Counted before the call, not after: two requests arriving together
    // would both see an empty window and both go out otherwise.
    providerCalls.push(Date.now());

    const completion = await chat(
      provider,
      buildSystemPrompt(passages),
      history.concat([{ role: "user", content: question }]),
      { maxTokens: assistant.model.maxTokens, temperature: assistant.model.temperature }
    );
    const answer = completion.text;

    if (!answer) {
      // An empty completion is not an answer. Fall back to quoting him
      // rather than showing a blank bubble.
      const quoted = extractAnswer(passages);
      res.status(200).json({
        answer: quoted || assistant.guardrails.refusal,
        note: "The model returned nothing, so this is quoted from his notes instead.",
        passages: cited,
        grounded: true,
        mode: "retrieval-only",
        provider: provider.id,
        debug: { lexTop: result.lexTop, semTop: result.semTop, search: result.mode }
      });
      return;
    }

    res.status(200).json({
      answer: answer,
      passages: cited,
      grounded: true,
      mode: "answered",
      provider: provider.id,
      usage: completion.usage,
      debug: { lexTop: result.lexTop, semTop: result.semTop, search: result.mode }
    });
  } catch (err) {
    // A provider being down, rate-limited or out of free quota is the
    // most likely failure here, and it should not take the assistant
    // with it. Retrieval already worked, so quote him instead.
    console.error("Model call failed (" + provider.id + "):", err.message);
    const quoted = extractAnswer(passages);
    res.status(200).json({
      answer: quoted || assistant.guardrails.refusal,
      note: "The model is not responding right now, so this is quoted directly " +
            "from his notes. He is at ramakrishnan15126@gmail.com.",
      passages: cited,
      grounded: true,
      mode: "retrieval-only",
      provider: provider.id,
      debug: { lexTop: result.lexTop, semTop: result.semTop, search: result.mode }
    });
  }
}
