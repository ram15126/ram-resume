// =====================================================================
//  VERIFY KEY — does the key in .env.local actually work?
//
//      npm run verify-key
//
//  Makes one small real call to each configured provider. Worth doing
//  before `npm run ingest`, which would otherwise send 81 chunks to an
//  endpoint that was going to reject them anyway — and worth doing
//  before deploying, because a key that works locally and not in
//  production is usually a key that was never pasted into Vercel.
// =====================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CHAT_PROVIDERS, EMBED_PROVIDERS, pick, chat, embed } from "../api/_providers.js";

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

/** Never print a key. Show only enough to tell two keys apart. */
function mask(key) {
  if (!key) return "";
  if (key.length <= 10) return "*".repeat(key.length);
  return key.slice(0, 4) + "…" + key.slice(-4) + "  (" + key.length + " chars)";
}

let failed = false;

// ---------------------------------------------------------------- chat
console.log("ANSWERS");
const c = pick(CHAT_PROVIDERS);

if (!c) {
  console.log("  No chat key found.");
  console.log("  Paste one into .env.local. Free option, no card:");
  console.log("    GEMINI_API_KEY=   ->  https://aistudio.google.com/apikey");
  console.log("  The assistant still works without it — it quotes his notes instead.");
} else {
  console.log("  provider : " + c.name);
  console.log("  model    : " + c.model);
  console.log("  key      : " + mask(c.key));
  process.stdout.write("  calling  : ");
  try {
    const out = await chat(
      c,
      "You are a test harness. Reply with exactly the word: OK",
      [{ role: "user", content: "Say OK." }],
      // Generous on purpose: thinking models draw their internal
      // reasoning from this budget, so a small probe fails on a
      // perfectly good key.
      { maxTokens: 2500, temperature: 0 }
    );
    const text = (out.text || "").trim();
    if (!text) {
      console.log("returned an empty answer.");
      console.log("  The key was accepted but the model said nothing. Try again,");
      console.log("  or check whether this model is available on your plan.");
      failed = true;
    } else {
      console.log("OK — replied " + JSON.stringify(text.slice(0, 40)));
      if (out.usage) {
        console.log("  tokens   : " + out.usage.input + " in, " + out.usage.output + " out" +
          (out.usage.thinking ? ", " + out.usage.thinking + " thinking" : ""));
      }
    }
  } catch (err) {
    console.log("FAILED");
    console.log("  " + err.message.slice(0, 300));
    if (/401|403|API_KEY|api key|unauthor/i.test(err.message)) {
      console.log("\n  That reads like a rejected key. Check for a stray space or a");
      console.log("  missing character, and that the key is enabled for this API.");
    } else if (/429|quota|rate/i.test(err.message)) {
      console.log("\n  That reads like a rate limit rather than a bad key. Wait and retry.");
    } else if (/404|not found|model/i.test(err.message)) {
      console.log("\n  That reads like the model name. Change `model` for this");
      console.log("  provider in api/_providers.js to one your account can use.");
    }
    failed = true;
  }
}

// ---------------------------------------------------------- embeddings
console.log("\nSEMANTIC SEARCH");
const e = pick(EMBED_PROVIDERS);

if (!e) {
  console.log("  No embedding key found — search will be keyword-only.");
  console.log("  Keyword search works, but misses paraphrased questions.");
} else {
  console.log("  provider : " + e.name);
  console.log("  model    : " + e.model);
  console.log("  key      : " + mask(e.key));
  process.stdout.write("  calling  : ");
  try {
    const vectors = await embed(e, ["a short test sentence"], "query");
    const dims = vectors[0] ? vectors[0].length : 0;
    if (!dims) {
      console.log("returned no vector.");
      failed = true;
    } else {
      console.log("OK — " + dims + "-dimensional vector");
      const indexPath = path.join(ROOT, "data", "index.json");
      if (fs.existsSync(indexPath)) {
        const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
        if (!index.hasVectors) {
          console.log("\n  The index has no vectors yet. Run `npm run ingest` to add them.");
        } else if (index.embedModel !== e.model) {
          console.log("\n  The index was built with " + index.embedModel + ", not " +
                      e.model + ".");
          console.log("  Re-run `npm run ingest` — vectors from two models are not comparable.");
        }
      }
    }
  } catch (err) {
    console.log("FAILED");
    console.log("  " + err.message.slice(0, 300));
    failed = true;
  }
}

// "No key" is not the same as "all good" — nothing was verified. Saying
// otherwise is how someone deploys convinced the assistant will write
// answers when it is only ever going to quote.
if (failed) {
  console.log("\nSomething is not working. Fix the above, then re-run.");
} else if (!c) {
  console.log("\nNothing to verify — no key is configured.");
  console.log("The assistant runs, but it quotes his notes rather than writing answers.");
} else if (!e) {
  console.log("\nAnswers are working. Semantic search is off, so search is keyword-only.");
  console.log("Next: npm run ingest, then npm start.");
} else {
  console.log("\nBoth working. Next: npm run ingest (adds vectors), then npm start.");
}
process.exit(failed ? 1 : 0);
