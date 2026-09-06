// Print raw BM25 top scores for questions that SHOULD answer vs
// questions that SHOULD refuse, so the floor is set from data.
import fs from "node:fs"; import path from "node:path";
import { fileURLToPath } from "node:url";
import { bm25, expandQuery } from "../api/_retrieval.js";
import { assistant } from "../config/assistant.js";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const index = JSON.parse(fs.readFileSync(path.join(HERE,"..","data","index.json"),"utf8"));

const shouldAnswer = [
  "Can he code?","is he any good with google search","what did he do at Digimabble",
  "tell me about the corporate film","how many people does he manage",
  "what is llms.txt","does he know n8n","when does he graduate",
  "tell me about the false positives report","what is his email",
  "what does he do day to day","who is he"
];
const shouldRefuse = [
  "what is his favourite pizza topping","does he have a dog",
  "what car does he drive","what is the capital of France",
  "is he married","what did he eat yesterday","asdfgh qwerty"
];
function top(q){ const s = bm25(expandQuery(q, assistant.synonyms), index);
  let m=0; for(const v of s) if(v>m) m=v; return m; }
console.log("SHOULD ANSWER");
shouldAnswer.forEach(q=>console.log("  "+top(q).toFixed(2).padStart(7)+"  "+q));
console.log("\nSHOULD REFUSE");
shouldRefuse.forEach(q=>console.log("  "+top(q).toFixed(2).padStart(7)+"  "+q));
