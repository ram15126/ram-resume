// =====================================================================
//  CHECK INDEX — the publishing gate for the assistant.
//
//      npm run check
//
//  Anything in data/index.json can be quoted verbatim to a stranger by a
//  public API. This checks that nothing got in that should not have.
//
//  It exists because the source material in knowledge/_private/ is
//  marked internal for a reason: it names every client brand in the
//  workspace and describes their websites' defects, their regulatory
//  exposure and their unshipped fixes. A public assistant that answers
//  "what problems did he find at <client>?" with a detailed teardown is
//  a professional liability, not a feature.
//
//  Exit code 1 means do not deploy.
// =====================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");

// ---------------------------------------------------------------------
//  Client and project names that must NOT appear in the public index.
//  Add to this list whenever a new client is written about in _private/.
// ---------------------------------------------------------------------
const FORBIDDEN = [
  "saveyoo", "plenti", "guna foods", "gunafoods", "axon", "antarsh",
  "paper collective", "thepapercollective", "akshat jain", "akshatjain",
  "seeco", "seecowealth", "clearspot", "zoella", "zoellaenergy",
  "arusuvai", "pulse telesystems", "pulsetechnology", "toonsutra",
  "tcs", "tata consultancy", "kadarpaalam", "kadarpalam", "kabadapuram",
  "kapatapuram", "paanjajanyam", "tuber bug", "digischolar"
];

// Names he may use freely — his own roles and his own public projects.
const ALLOWED = [
  "siva comics", "sivacomics", "neoark", "neoarkdigital", "digimabble",
  "greenlane", "rocket carousel maker", "ram15126"
];

// Patterns that should never reach a public index at all.
const SECRETS = [
  { name: "Anthropic key", re: /sk-ant-[A-Za-z0-9_\-]{8,}/g },
  { name: "OpenAI key", re: /sk-[A-Za-z0-9]{32,}/g },
  { name: "Voyage key", re: /pa-[A-Za-z0-9_\-]{20,}/g },
  { name: "Google API key", re: /AIza[A-Za-z0-9_\-]{30,}/g },
  { name: "Bearer token", re: /Bearer\s+[A-Za-z0-9._\-]{20,}/g },
  { name: "Private key block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g }
];

const indexPath = path.join(ROOT, "data", "index.json");
if (!fs.existsSync(indexPath)) {
  console.error("No data/index.json. Run `npm run ingest` first.");
  process.exit(1);
}

const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
const problems = [];

// ---- forbidden names, matched on word boundaries ----
//  Substring matching produces nonsense here: "gap taxonomy" contains
//  "axon", "recipe" contains "cip". Word boundaries or the check cries
//  wolf and gets ignored, which is worse than not having it.
index.chunks.forEach(function (chunk) {
  const blob = chunk.heading + "\n" + chunk.text;
  FORBIDDEN.forEach(function (name) {
    const re = new RegExp("\\b" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "gi");
    const hits = blob.match(re);
    if (hits) {
      problems.push({
        kind: "client name",
        detail: '"' + hits[0] + '"',
        where: chunk.source + " :: " + (chunk.heading || "(no heading)")
      });
    }
  });
  SECRETS.forEach(function (secret) {
    if (secret.re.test(blob)) {
      problems.push({
        kind: "SECRET",
        detail: secret.name,
        where: chunk.source + " :: " + (chunk.heading || "(no heading)")
      });
    }
    secret.re.lastIndex = 0;
  });
});

// ---- the private folder must exist and must not be indexed ----
const privateDir = path.join(ROOT, "knowledge", "_private");
if (fs.existsSync(privateDir)) {
  const privateFiles = fs.readdirSync(privateDir);
  if (index.files.some(function (f) { return privateFiles.includes(f); })) {
    problems.push({
      kind: "PRIVATE FILE INDEXED",
      detail: "a file from knowledge/_private/ is in the index",
      where: "data/index.json"
    });
  }
}

// ---- the two sites must read identical résumé content ----
//  Both websites keep their own copy of config/content.js. They diverged
//  once already: the desktop site was corrected while the platformer
//  silently kept serving the old brand count and the old film runtime.
//  A résumé that says two different things in two places is worse than
//  one that is slightly out of date.
const twin = path.join(ROOT, "..", "interactive-resume", "config", "content.js");
if (fs.existsSync(twin)) {
  const mine = fs.readFileSync(path.join(ROOT, "config", "content.js"), "utf8");
  if (fs.readFileSync(twin, "utf8") !== mine) {
    problems.push({
      kind: "CONTENT DRIFT",
      detail: "interactive-resume/config/content.js differs from this one",
      where: "copy desktop-resume/config/content.js over it, then re-run"
    });
  }
}

// ---- report ----
console.log("Index: " + index.chunks.length + " chunks from " +
            index.files.length + " files, vectors " +
            (index.hasVectors ? "on" : "off"));

const allowedFound = ALLOWED.filter(function (name) {
  const re = new RegExp("\\b" + name + "\\b", "i");
  return index.chunks.some(function (c) { return re.test(c.heading + " " + c.text); });
});
console.log("Named on purpose: " + (allowedFound.join(", ") || "none"));

if (!problems.length) {
  console.log("\nPASS — nothing in the index that should not be public.");
  process.exit(0);
}

console.log("\nFAIL — " + problems.length + " problem(s):\n");
problems.forEach(function (p) {
  console.log("  [" + p.kind + "] " + p.detail);
  console.log("      " + p.where);
});
console.log("\nMove that content into knowledge/_private/, or describe the client");
console.log("by sector instead of by name, then re-run `npm run ingest`.");
process.exit(1);
