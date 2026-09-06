// Prove the free (Gemini) path works end to end, with fetch stubbed.
process.env.GEMINI_API_KEY = "TEST-GEMINI-KEY";
const real = globalThis.fetch;
let seen = null;
globalThis.fetch = async function (url, opts) {
  seen = { url: String(url), body: opts.body };
  return { ok: true, status: 200, text: async () => "",
    json: async () => ({ candidates: [{ content: { parts: [{ text:
      "He does not write code himself. He specifies the system and verifies the output [1]." }] } }] }) };
};
const { default: handler } = await import("../api/ask.js");
const out = {};
const res = { status(c){ out.c=c; return this }, json(b){ out.b=b; return this } };
await handler({ method:"POST", headers:{}, body:{ question:"can he code", history:[] } }, res);
globalThis.fetch = real;

// The prompt is inspected through the JSON request body, so a marker
// has to be escaped the same way the body escaped it.
const escaped = (t) => JSON.stringify(t).slice(1, -1);
const p0 = (out.b.passages || [])[0] || {};
const marker = p0.heading || String(p0.text || "").split(/[.\n]/)[0];

const checks = [
  ["provider selected", out.b.provider === "gemini"],
  ["mode answered", out.b.mode === "answered"],
  ["answer returned", /does not write code/.test(out.b.answer)],
  ["passages cited", (out.b.passages||[]).length > 0],
  ["gemini endpoint used", /generativelanguage\.googleapis\.com/.test(seen.url)],
  ["system prompt carries the rules", /HOW TO ANSWER:/.test(seen.body) &&
                                      /1\. /.test(seen.body)],
  ["system prompt carries his notes", marker.length > 3 &&
                                      seen.body.includes(escaped(marker))],
  // The word "passages" in the prompt is what taught the model to say
  // "the provided passages do not contain that" — a sentence about the
  // retrieval system, aimed at a person who asked about a career.
  ["prompt never calls them passages", !/passages/i.test(seen.body)],
  ["prompt speaks in the first person", /You ARE Ramakrishnan/.test(seen.body)],
  ["key never returned to the client", !JSON.stringify(out.b).includes("TEST-GEMINI-KEY")]
];
let bad = 0;
checks.forEach(([n,ok]) => { if(!ok) bad++; console.log((ok?"  PASS  ":"  FAIL  ")+n); });
process.exit(bad ? 1 : 0);
