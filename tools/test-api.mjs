// Exercise api/ask.js without Vercel: fake req/res, real handler.
import handler from "../api/ask.js";

function fakeRes() {
  const out = {};
  return {
    _out: out,
    status(c) { out.code = c; return this; },
    json(b) { out.body = b; return this; }
  };
}
async function ask(question) {
  const res = fakeRes();
  await handler({ method: "POST", headers: {}, body: { question, history: [] } }, res);
  return res._out;
}

const cases = ["Can he code?", "when does he graduate", "what is the capital of France", ""];
for (const q of cases) {
  const r = await ask(q);
  console.log("\nQ: " + JSON.stringify(q) + "  ->  HTTP " + r.code);
  if (!r.body) { console.log("   (no body)"); continue; }
  console.log("   mode: " + r.body.mode + "   passages: " + (r.body.passages||[]).length);
  console.log("   " + String(r.body.answer || r.body.error).slice(0, 150));
  if (r.body.debug) console.log("   debug: " + JSON.stringify(r.body.debug));
}

// method guard + oversize guard
const r405 = fakeRes(); await handler({ method: "GET", headers: {} }, r405);
console.log("\nGET -> HTTP " + r405._out.code);
const rBig = fakeRes();
await handler({ method:"POST", headers:{}, body:{ question:"x".repeat(900) } }, rBig);
console.log("900-char question -> HTTP " + rBig._out.code);
