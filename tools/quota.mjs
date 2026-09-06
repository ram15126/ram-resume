// =====================================================================
//  QUOTA — what can this key actually serve?
//
//      npm run quota           report measured cost per question
//      npm run quota -- probe  ALSO burst-test to find the real limit
//
//  The API publishes no quota headers, so limits are only observable
//  from a 429 — whose body names the exact quota that was exceeded.
//  `probe` deliberately triggers one, on embeddings (the cheap call),
//  and stops at the first refusal.
//
//  Published numbers change; this measures instead. The authoritative
//  live view is https://ai.dev/rate-limit.
// =====================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CHAT_PROVIDERS, EMBED_PROVIDERS, pick, chat, embed } from "../api/_providers.js";
import { assistant } from "../config/assistant.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");

for (const name of [".env.local", ".env"]) {
  const file = path.join(ROOT, name);
  if (!fs.existsSync(file)) continue;
  fs.readFileSync(file, "utf8").split(/\r?\n/).forEach(function (line) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) return;
    const v = m[2].replace(/^["']|["']$/g, "");
    if (v && !process.env[m[1]]) process.env[m[1]] = v;
  });
}

const PROBE = process.argv.slice(2).includes("probe");
const c = pick(CHAT_PROVIDERS);
const e = pick(EMBED_PROVIDERS);
const index = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "index.json"), "utf8"));

console.log("CONFIGURED");
console.log("  answers   : " + (c ? c.name + " / " + c.model : "none — quoting only, costs nothing"));
console.log("  embeddings: " + (e ? e.name + " / " + e.model : "none — keyword only, costs nothing"));
console.log("  index     : " + index.chunks.length + " chunks, vectors " +
            (index.hasVectors ? "on" : "off"));

// ---------------------------------------------------------------------
//  What one visitor question actually costs
// ---------------------------------------------------------------------
if (c) {
  console.log("\nCOST OF ONE QUESTION  (measured, not estimated)");
  const question = "What is he good at?";
  let embedCalls = 0;

  if (e && index.hasVectors) {
    await embed(e, [question], "query");
    embedCalls = 1;
  }

  const passages = index.chunks.slice(0, assistant.retrieval.topK);
  const system = "PASSAGES\n\n" + passages.map(function (p, i) {
    return "[" + (i + 1) + "] " + p.heading + "\n" + p.text;
  }).join("\n\n---\n\n");

  const started = Date.now();
  let out = null;
  try {
    out = await chat(c, system, [{ role: "user", content: question }], {
      maxTokens: assistant.model.maxTokens,
      temperature: assistant.model.temperature
    });
  } catch (err) {
    // Being refused here is not a failure of the tool — it is the
    // measurement. Report which quota stopped it and its value.
    console.log("  REFUSED — this is the limit you asked about:");
    const id = err.message.match(/"quotaId":\s*"([^"]+)"/);
    const val = err.message.match(/"quotaValue":\s*"?(\d+)"?/);
    const retry = err.message.match(/"retryDelay":\s*"([^"]+)"/);
    console.log("    quota : " + (id ? id[1] : "(not named in the response)"));
    if (val) console.log("    limit : " + val[1]);
    if (retry) console.log("    resets in: " + retry[1]);
    console.log("\n  Free limits are PER MODEL. If this is a per-day quota,");
    console.log("  switch `model` on the gemini entry in api/_providers.js —");
    console.log("  the lite models are capped per minute instead, which is far");
    console.log("  more usable. `npm run models` lists the options.");
    process.exit(0);
  }
  const seconds = (Date.now() - started) / 1000;

  const u = out.usage || {};
  console.log("  requests  : 1 chat" + (embedCalls ? " + 1 embedding" : ""));
  console.log("  tokens in : " + (u.input ?? "?") + "   (the 6 passages plus the rules)");
  console.log("  tokens out: " + (u.output ?? "?") +
              (u.thinking ? "   thinking: " + u.thinking : ""));
  console.log("  total     : " + ((u.input || 0) + (u.output || 0) + (u.thinking || 0)) + " tokens");
  console.log("  latency   : " + seconds.toFixed(1) + "s");

  const perQuestion = (u.input || 0) + (u.output || 0) + (u.thinking || 0);
  if (perQuestion) {
    console.log("\n  CAPACITY MATHS — divide your own limit by these:");
    console.log("    a 1,000,000 token/day allowance  ->  ~" +
                Math.floor(1000000 / perQuestion).toLocaleString() + " questions/day");
    console.log("    a 250,000 token/day allowance    ->  ~" +
                Math.floor(250000 / perQuestion).toLocaleString() + " questions/day");
    console.log("    a 200 request/day allowance      ->  200 questions/day (requests bind first)");
    console.log("  Whichever limit is smallest is the one you actually hit.");
  }

  console.log("\n  Two things reduce this:");
  console.log("    - repeat questions reuse a cached embedding (the suggestion chips)");
  console.log("    - a refused question costs NOTHING — it never reaches the model");
}

// ---------------------------------------------------------------------
//  Find the real per-minute limit
// ---------------------------------------------------------------------
if (PROBE && e) {
  console.log("\nPROBING THE PER-MINUTE LIMIT");
  console.log("  Bursting embedding calls until one is refused. Capped at 60.");
  let ok = 0;
  let quotaText = null;

  for (let i = 0; i < 60; i++) {
    try {
      await embed(e, ["probe " + i], "query");
      ok++;
    } catch (err) {
      quotaText = err.message;
      break;
    }
  }

  console.log("  accepted before refusal: " + ok);
  if (!quotaText) {
    console.log("  No refusal inside 60 calls — the per-minute limit is above that,");
    console.log("  or a longer window is the binding one.");
  } else {
    const m = quotaText.match(/"quotaId":\s*"([^"]+)"/) ||
              quotaText.match(/quota metric[^\n]*/i);
    const v = quotaText.match(/"quotaValue":\s*"?(\d+)"?/);
    console.log("  quota hit : " + (m ? m[1] || m[0] : "(name not in the response)"));
    if (v) console.log("  limit     : " + v[1]);
    const retry = quotaText.match(/"retryDelay":\s*"([^"]+)"/);
    if (retry) console.log("  retry in  : " + retry[1]);
    console.log("\n  Raw refusal, trimmed:");
    console.log("  " + quotaText.replace(/\s+/g, " ").slice(0, 500));
  }
} else if (e) {
  console.log("\nTo measure the actual per-minute limit:  npm run quota -- probe");
  console.log("  It burns a little quota on purpose. Embeddings, not chat.");
}

console.log("\nLive usage and the published numbers: https://ai.dev/rate-limit");
