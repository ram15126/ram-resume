// Real end-to-end questions through whichever provider is configured.
// Costs real quota — run it deliberately, not on every save.
import fs from "node:fs"; import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
for (const n of [".env.local", ".env"]) { const f = path.join(ROOT, n);
  if (!fs.existsSync(f)) continue;
  fs.readFileSync(f, "utf8").split(/\r?\n/).forEach(l => {
    const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && m[2] && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }); }
const { default: handler } = await import("../api/ask.js");
function res(){ const o={}; return { _o:o, status(c){o.c=c;return this}, json(b){o.b=b;return this} }; }

const QS = process.argv.slice(2).length ? process.argv.slice(2) : [
  "Can he code?",
  "what is he still learning",
  "tell me about the 43 to 65 result",
  "how many leads has he generated",
  "what is the capital of France"
];

for (const q of QS) {
  const r = res();
  await handler({ method:"POST", headers:{}, body:{ question:q, history:[] } }, r);
  const d = r._o.b;
  console.log("\nQ: " + q);
  console.log("A: " + String(d.answer).replace(/\s+/g," "));
  const bits = [d.mode];
  if (d.provider) bits.push("via " + d.provider);
  if (d.debug) bits.push(d.debug.search + " lex " + d.debug.lexTop.toFixed(1) + " sem " + d.debug.semTop.toFixed(2));
  if (d.usage) bits.push(d.usage.input + "in/" + d.usage.output + "out" + (d.usage.thinking ? "/" + d.usage.thinking + "think" : ""));
  console.log("   [" + bits.join(" · ") + "]");
  if (d.note) console.log("   note: " + d.note);
}
