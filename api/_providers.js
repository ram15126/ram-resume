// =====================================================================
//  PROVIDERS — who writes the answer, and who makes the embeddings.
//
//  Nothing here is hardcoded to one company. The server uses whichever
//  key it finds, checking the list in order, so the assistant works with
//  a free key and gets better with a paid one without a code change.
//
//  Most of these speak the OpenAI chat-completions format, so one
//  adapter covers them all — only the base URL and the model name
//  differ. Google and Anthropic have their own shapes and get their own
//  adapters.
// =====================================================================

// ---------------------------------------------------------------------
//  CHAT — in preference order. First key found wins.
//  Free tiers first, so someone with no budget still gets real answers.
// ---------------------------------------------------------------------
export const CHAT_PROVIDERS = [
  {
    id: "gemini",
    name: "Google Gemini",
    env: "GEMINI_API_KEY",
    // Model names churn — `npm run models` lists what a key can call.
    //
    // FREE-TIER LIMITS ARE PER MODEL, and they differ enormously.
    // Measured on a real free key (npm run quota -- probe):
    //
    //   gemini-3.6-flash        20 requests per DAY      unusable publicly
    //   gemini-3.5-flash         5 requests per minute
    //   gemini-3.5-flash-lite   15 requests per minute   daily cap not reached
    //   gemini-3.1-flash-lite   15 requests per minute   daily cap not reached
    //
    // The lite models stop on a per-MINUTE limit rather than a daily
    // one, which is the difference between a site that answers all day
    // and one that stops after twenty questions.
    model: "gemini-3.5-flash-lite",
    kind: "gemini",
    signup: "aistudio.google.com/apikey",
    note: "Free tier, no card required. The same key also powers semantic search."
  },
  {
    id: "groq",
    name: "Groq",
    env: "GROQ_API_KEY",
    model: "llama-3.3-70b-versatile",
    kind: "openai",
    base: "https://api.groq.com/openai/v1",
    signup: "console.groq.com/keys",
    note: "Free tier, no card required. Very fast, which suits a chat window."
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    env: "OPENROUTER_API_KEY",
    model: "meta-llama/llama-3.3-70b-instruct:free",
    kind: "openai",
    base: "https://openrouter.ai/api/v1",
    signup: "openrouter.ai/keys",
    note: "Models with a :free suffix cost nothing. Swap the model id to change."
  },
  {
    id: "cerebras",
    name: "Cerebras",
    env: "CEREBRAS_API_KEY",
    model: "llama-3.3-70b",
    kind: "openai",
    base: "https://api.cerebras.ai/v1",
    signup: "cloud.cerebras.ai",
    note: "Free tier."
  },
  {
    id: "mistral",
    name: "Mistral",
    env: "MISTRAL_API_KEY",
    model: "mistral-small-latest",
    kind: "openai",
    base: "https://api.mistral.ai/v1",
    signup: "console.mistral.ai",
    note: "Free tier on their own plan."
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    env: "ANTHROPIC_API_KEY",
    model: "claude-sonnet-5",
    kind: "anthropic",
    signup: "console.anthropic.com",
    note: "Paid, pay-as-you-go. Best quality if the budget is there."
  },
  {
    id: "openai",
    name: "OpenAI",
    env: "OPENAI_API_KEY",
    model: "gpt-4o-mini",
    kind: "openai",
    base: "https://api.openai.com/v1",
    signup: "platform.openai.com",
    note: "Paid."
  }
];

// ---------------------------------------------------------------------
//  EMBEDDINGS — for semantic search. Also optional.
//
//  The index records which provider and model produced its vectors.
//  Vectors from two different models are not comparable — cosine between
//  them is noise, not similarity — so a mismatch disables semantic
//  search rather than quietly returning nonsense.
// ---------------------------------------------------------------------
export const EMBED_PROVIDERS = [
  {
    id: "gemini",
    name: "Google Gemini",
    env: "GEMINI_API_KEY",
    model: "gemini-embedding-001",
    kind: "gemini",
    // This model defaults to 3072 dimensions. The whole index is bundled
    // into the serverless function, so it is asked for 768 instead —
    // ample for a corpus this size and a quarter of the bytes.
    dims: 768,
    signup: "aistudio.google.com/apikey"
  },
  {
    id: "jina",
    name: "Jina AI",
    env: "JINA_API_KEY",
    model: "jina-embeddings-v3",
    kind: "openai",
    base: "https://api.jina.ai/v1",
    dims: 512,
    signup: "jina.ai/embeddings"
  },
  {
    id: "voyage",
    name: "Voyage AI",
    env: "VOYAGE_API_KEY",
    model: "voyage-3.5-lite",
    kind: "voyage",
    dims: 512,
    signup: "dash.voyageai.com"
  },
  {
    id: "openai",
    name: "OpenAI",
    env: "OPENAI_API_KEY",
    model: "text-embedding-3-small",
    kind: "openai",
    base: "https://api.openai.com/v1",
    dims: 512,
    signup: "platform.openai.com"
  }
];

/** The first provider in the list whose key is present, or null. */
export function pick(providers, env) {
  for (const p of providers) {
    const key = (env || process.env)[p.env];
    if (key && key.trim()) return Object.assign({}, p, { key: key.trim() });
  }
  return null;
}

// =====================================================================
//  CHAT
// =====================================================================

/**
 * Ask a provider to write an answer.
 *   provider : from pick(CHAT_PROVIDERS)
 *   system   : the grounded system prompt
 *   messages : [{role:"user"|"assistant", content}]
 * Returns { text, usage } where usage is normalised to
 * { input, output } — each provider names those differently, and a free
 * tier is exactly where someone needs to see them.
 * Throws on a non-OK response.
 */
export async function chat(provider, system, messages, opts) {
  const maxTokens = (opts && opts.maxTokens) || 700;
  const temperature = (opts && opts.temperature) != null ? opts.temperature : 0.2;

  if (provider.kind === "anthropic") {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": provider.key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: maxTokens,
        temperature: temperature,
        system: system,
        messages: messages
      })
    });
    if (!r.ok) throw new Error(provider.name + " " + r.status + ": " + (await r.text()).slice(0, 1200));
    const j = await r.json();
    return {
      text: (j.content || [])
        .filter(function (b) { return b.type === "text"; })
        .map(function (b) { return b.text; })
        .join("").trim(),
      usage: j.usage
        ? { input: j.usage.input_tokens, output: j.usage.output_tokens }
        : null
    };
  }

  if (provider.kind === "gemini") {
    // Gemini keeps the system prompt in its own field and calls the
    // assistant role "model".
    const contents = messages.map(function (m) {
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      };
    });
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" +
      provider.model + ":generateContent?key=" + encodeURIComponent(provider.key);
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: contents,
        generationConfig: { maxOutputTokens: maxTokens, temperature: temperature }
      })
    });
    if (!r.ok) throw new Error(provider.name + " " + r.status + ": " + (await r.text()).slice(0, 1200));
    const j = await r.json();
    const cand = (j.candidates || [])[0];
    const usage = j.usageMetadata
      ? {
          input: j.usageMetadata.promptTokenCount,
          output: j.usageMetadata.candidatesTokenCount,
          thinking: j.usageMetadata.thoughtsTokenCount
        }
      : null;
    if (!cand) return { text: "", usage: usage, finish: "NO_CANDIDATE" };

    // Only `text` parts. A thinking model also returns a
    // `thoughtSignature` on the part, which is not the answer.
    const text = ((cand.content && cand.content.parts) || [])
      .map(function (p) { return p.text || ""; })
      .join("").trim();

    // An empty answer with MAX_TOKENS means the reasoning consumed the
    // whole budget before any answer was written. Say that plainly —
    // otherwise it surfaces as "the model returned nothing", which
    // points at the key rather than at the number that caused it.
    if (!text && cand.finishReason === "MAX_TOKENS") {
      throw new Error(
        provider.name + ": the token budget ran out during internal reasoning " +
        "before any answer was produced (" + (usage && usage.thinking) +
        " thinking tokens, cap " + maxTokens + "). Raise model.maxTokens in " +
        "config/assistant.js."
      );
    }

    return { text: text, usage: usage, finish: cand.finishReason };
  }

  // OpenAI-compatible: Groq, OpenRouter, Cerebras, Mistral, OpenAI.
  const r = await fetch(provider.base + "/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + provider.key
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: maxTokens,
      temperature: temperature,
      messages: [{ role: "system", content: system }].concat(messages)
    })
  });
  if (!r.ok) throw new Error(provider.name + " " + r.status + ": " + (await r.text()).slice(0, 1200));
  const j = await r.json();
  return {
    text: ((j.choices || [])[0]?.message?.content || "").trim(),
    usage: j.usage
      ? { input: j.usage.prompt_tokens, output: j.usage.completion_tokens }
      : null
  };
}

// =====================================================================
//  EMBEDDINGS
// =====================================================================

/**
 * Embed a batch of texts.
 *   role : "document" when indexing, "query" when searching. Several
 *          providers embed the two asymmetrically and using the wrong
 *          one measurably hurts recall.
 * Returns an array of number arrays, in input order.
 */
export async function embed(provider, texts, role) {
  if (provider.kind === "voyage") {
    const r = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + provider.key
      },
      body: JSON.stringify({
        model: provider.model,
        input: texts,
        input_type: role === "query" ? "query" : "document",
        output_dimension: provider.dims
      })
    });
    if (!r.ok) throw new Error("Voyage " + r.status + ": " + (await r.text()).slice(0, 1200));
    const j = await r.json();
    return j.data
      .sort(function (a, b) { return a.index - b.index; })
      .map(function (d) { return d.embedding; });
  }

  if (provider.kind === "gemini") {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" +
      provider.model + ":batchEmbedContents?key=" + encodeURIComponent(provider.key);
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: texts.map(function (t) {
          const req = {
            model: "models/" + provider.model,
            content: { parts: [{ text: t }] },
            taskType: role === "query" ? "RETRIEVAL_QUERY" : "RETRIEVAL_DOCUMENT"
          };
          if (provider.dims) req.outputDimensionality = provider.dims;
          return req;
        })
      })
    });
    if (!r.ok) throw new Error("Gemini " + r.status + ": " + (await r.text()).slice(0, 1200));
    const j = await r.json();
    return (j.embeddings || []).map(function (e) { return e.values; });
  }

  // OpenAI-compatible embeddings: Jina, OpenAI.
  const body = { model: provider.model, input: texts };
  if (provider.id === "openai") body.dimensions = provider.dims;
  const r = await fetch(provider.base + "/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + provider.key
    },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(provider.name + " " + r.status + ": " + (await r.text()).slice(0, 1200));
  const j = await r.json();
  return j.data
    .sort(function (a, b) { return a.index - b.index; })
    .map(function (d) { return d.embedding; });
}

/** How many texts to send in one embedding call. */
export function batchSize(provider) {
  if (provider.kind === "gemini") return 100;
  if (provider.kind === "voyage") return 96;
  return 64;
}
