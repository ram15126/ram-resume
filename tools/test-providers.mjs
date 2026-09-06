// =====================================================================
//  TEST PROVIDERS — verify every adapter builds a correct request and
//  parses the response shape that provider actually returns.
//
//      node tools/test-providers.mjs
//
//  `fetch` is stubbed, so this needs no keys and costs nothing. It is
//  the only way to check the adapters you are not currently using — the
//  one you have configured is the one that never breaks silently.
// =====================================================================

import { CHAT_PROVIDERS, EMBED_PROVIDERS, chat, embed, pick } from "../api/_providers.js";

const real = globalThis.fetch;
let captured = null;

function stub(payload) {
  globalThis.fetch = async function (url, opts) {
    captured = { url: String(url), opts: opts };
    return {
      ok: true,
      status: 200,
      text: async () => "",
      json: async () => payload
    };
  };
}

const CHAT_RESPONSES = {
  anthropic: { content: [{ type: "text", text: "ANSWER" }] },
  gemini: { candidates: [{ content: { parts: [{ text: "ANSWER" }] } }] },
  openai: { choices: [{ message: { content: "ANSWER" } }] }
};

const EMBED_RESPONSES = {
  voyage: { data: [{ index: 0, embedding: [0.1, 0.2] }] },
  gemini: { embeddings: [{ values: [0.1, 0.2] }] },
  openai: { data: [{ index: 0, embedding: [0.1, 0.2] }] }
};

let failures = 0;
function check(label, ok, detail) {
  if (!ok) failures++;
  console.log("  " + (ok ? "PASS  " : "FAIL  ") + label + (detail && !ok ? "  (" + detail + ")" : ""));
}

console.log("CHAT ADAPTERS");
for (const def of CHAT_PROVIDERS) {
  const p = Object.assign({}, def, { key: "TEST-KEY-" + def.id });
  stub(CHAT_RESPONSES[p.kind]);
  let answer = null, err = null;
  try {
    answer = await chat(p, "SYSTEM PROMPT", [{ role: "user", content: "QUESTION" }],
                        { maxTokens: 700, temperature: 0.2 });
  } catch (e) { err = e; }

  const body = captured && captured.opts.body ? JSON.parse(captured.opts.body) : {};
  // Gemini names the model in the URL path, everyone else in the body,
  // so check both rather than assuming one shape.
  const sent = JSON.stringify(body) + " " + (captured ? captured.url : "");
  const headers = (captured && captured.opts.headers) || {};
  const keyInUrl = captured && captured.url.includes("TEST-KEY-");
  const keyInHeader = JSON.stringify(headers).includes("TEST-KEY-");

  console.log("\n " + p.name + " (" + p.kind + ")");
  check("no error", !err, err && err.message);
  check("answer parsed", answer && answer.text === "ANSWER", JSON.stringify(answer));
  check("model sent", sent.includes(p.model));
  check("system prompt sent", sent.includes("SYSTEM PROMPT"));
  check("question sent", sent.includes("QUESTION"));
  check("key authenticated", keyInUrl || keyInHeader);
}

console.log("\n\nEMBEDDING ADAPTERS");
for (const def of EMBED_PROVIDERS) {
  const p = Object.assign({}, def, { key: "TEST-KEY-" + def.id });
  stub(EMBED_RESPONSES[p.kind]);
  let vectors = null, err = null;
  try {
    vectors = await embed(p, ["DOCUMENT TEXT"], "query");
  } catch (e) { err = e; }

  const body = captured && captured.opts.body ? JSON.parse(captured.opts.body) : {};
  const sent = JSON.stringify(body);

  console.log("\n " + p.name + " (" + p.kind + ")");
  check("no error", !err, err && err.message);
  check("vector parsed", Array.isArray(vectors) && vectors[0] && vectors[0].length === 2);
  check("model sent", sent.includes(p.model));
  check("text sent", sent.includes("DOCUMENT TEXT"));
  // Several providers embed queries and documents differently; using the
  // wrong one measurably hurts recall, so check the role reached them.
  if (p.kind !== "openai") {
    check("query role sent", /QUERY|query/.test(sent));
  }
}

console.log("\n\nSELECTION ORDER");
const env1 = { GROQ_API_KEY: "g", ANTHROPIC_API_KEY: "a" };
check("free provider preferred over paid", pick(CHAT_PROVIDERS, env1).id === "groq");
const env2 = { ANTHROPIC_API_KEY: "a" };
check("falls through to the only key present", pick(CHAT_PROVIDERS, env2).id === "anthropic");
check("no keys -> null", pick(CHAT_PROVIDERS, {}) === null);
const env3 = { GEMINI_API_KEY: "x" };
check("one Gemini key covers chat and embeddings",
      pick(CHAT_PROVIDERS, env3).id === "gemini" && pick(EMBED_PROVIDERS, env3).id === "gemini");

globalThis.fetch = real;
console.log(failures ? "\n" + failures + " FAILURE(S)" : "\nAll adapters OK.");
process.exit(failures ? 1 : 0);
