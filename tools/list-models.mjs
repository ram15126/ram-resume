// =====================================================================
//  LIST MODELS — what will this key actually accept?
//
//      npm run models
//
//  Model names go stale, and a name that worked last year returns 404
//  today. This exists because diagnosing that from an error message is
//  guesswork, and because the listing itself is not fully reliable:
//  a model can appear here and still refuse the call with "no longer
//  available to new users". Treat the output as candidates to try, not
//  as a guarantee.
//
//  Only Google exposes a listing endpoint on the free tier, so that is
//  what this covers.
// =====================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");

for (const name of [".env.local", ".env"]) {
  const file = path.join(ROOT, name);
  if (!fs.existsSync(file)) continue;
  fs.readFileSync(file, "utf8").split(/\r?\n/).forEach(function (line) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) return;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (value && !process.env[m[1]]) process.env[m[1]] = value;
  });
}

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.log("No GEMINI_API_KEY in .env.local.");
  console.log("This tool only lists Google models — other providers publish");
  console.log("their model names on their own dashboards.");
  process.exit(1);
}

for (const version of ["v1beta", "v1"]) {
  const url = "https://generativelanguage.googleapis.com/" + version +
    "/models?pageSize=200&key=" + encodeURIComponent(key);
  const r = await fetch(url);
  console.log("\n" + version + "  (HTTP " + r.status + ")");
  if (!r.ok) {
    console.log("  " + (await r.text()).slice(0, 200));
    continue;
  }
  const j = await r.json();
  const chat = [];
  const embed = [];
  (j.models || []).forEach(function (m) {
    const name = m.name.replace("models/", "");
    const methods = m.supportedGenerationMethods || [];
    if (methods.includes("generateContent")) chat.push(name);
    if (methods.includes("embedContent") || methods.includes("batchEmbedContents")) embed.push(name);
  });
  console.log("  chat      : " + (chat.join(", ") || "(none)"));
  console.log("  embedding : " + (embed.join(", ") || "(none)"));
}

console.log("\nSet the chosen names as `model` on the gemini entries in");
console.log("api/_providers.js, then run `npm run verify-key` to confirm the");
console.log("call actually succeeds — a listed model is not always a usable one.");
