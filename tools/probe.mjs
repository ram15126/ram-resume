// =====================================================================
//  PROBE — shows what a question actually retrieves, without spending
//  a token on the model. Use it whenever you add documents, to check
//  the right passages come back.
//
//      node tools/probe.mjs
//      node tools/probe.mjs "your own question here"
// =====================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { search } from "../api/_retrieval.js";
import { assistant } from "../config/assistant.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const index = JSON.parse(
  fs.readFileSync(path.join(HERE, "..", "data", "index.json"), "utf8")
);

const questions = process.argv.slice(2).length ? process.argv.slice(2) : [
  "Can he code?",
  "is he any good with google search",
  "what did he do at Digimabble",
  "tell me about the corporate film",
  "how many people does he manage",
  "what is llms.txt work he did",
  "does he know how to use n8n",
  "when does he graduate",
  "who is he",
  "what does he do day to day",
  "tell me about the false positives report",
  "what is his favourite pizza topping",
  "does he have a dog",
  "what is the capital of France"
];

for (const q of questions) {
  const r = search(index, q, null, assistant.retrieval, assistant.synonyms);
  const head = "\nQ: " + q +
    "\n   lex " + r.lexTop.toFixed(2) +
    "   sem " + r.semTop.toFixed(2) +
    "   mode " + r.mode +
    "   " + (r.confident ? "ANSWER" : "REFUSE");
  console.log(head);
  if (!r.confident) continue;
  r.hits.slice(0, 3).forEach(function (h) {
    console.log("      " + h.score.toFixed(4) + "  " +
      h.source.padEnd(18) + (h.heading || "(no heading)").slice(0, 50));
  });
}
