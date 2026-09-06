// Calibrate BOTH floors against real questions, using live embeddings.
import fs from "node:fs"; import path from "node:path";
import { fileURLToPath } from "node:url";
import { search } from "../api/_retrieval.js";
import { assistant } from "../config/assistant.js";
import { EMBED_PROVIDERS, pick, embed } from "../api/_providers.js";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
for (const n of [".env.local",".env"]) { const f=path.join(ROOT,n); if(!fs.existsSync(f))continue;
  fs.readFileSync(f,"utf8").split(/\r?\n/).forEach(l=>{const m=l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if(m&&m[2]&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^["']|["']$/g,"");});}
const index = JSON.parse(fs.readFileSync(path.join(ROOT,"data","index.json"),"utf8"));
const p = pick(EMBED_PROVIDERS);

const ANSWER = ["Can he code?","is he any good with google search","what did he do at Digimabble",
 "tell me about the corporate film","how many people does he manage","what is llms.txt",
 "does he know n8n","when does he graduate","tell me about the false positives report",
 "what is his email","what does he do day to day","who is he","what are his weaknesses",
 "is he a good leader","has he made mistakes","what tools does he use for video"];
const REFUSE = ["what is his favourite pizza topping","does he have a dog","what car does he drive",
 "what is the capital of France","is he married","what did he eat yesterday","asdfgh qwerty",
 "who won the world cup","what is his blood type"];

async function run(qs,label){
  console.log("\n"+label);
  const rows=[];
  for(const q of qs){
    let v = null;
    try { v = (await embed(p,[q],"query"))[0]; }
    catch(e){
      // A free-tier quota limit mid-run should not throw away the rows
      // already measured — they are the whole point of the exercise.
      console.log("  (stopped: " + e.message.split("\n")[0].slice(0,80) + ")");
      break;
    }
    const r = search(index,q,v,assistant.retrieval,assistant.synonyms);
    rows.push({q, lex:r.lexTop, sem:r.semTop, ok:r.confident, top:r.hits[0]?.heading||"-"});
    console.log("  lex "+r.lexTop.toFixed(2).padStart(6)+"  sem "+r.semTop.toFixed(3)+
      "  "+(r.confident?"ANSWER":"REFUSE")+"  "+q);
  }
  return rows;
}
const a = await run(ANSWER,"SHOULD ANSWER");
const b = await run(REFUSE,"SHOULD REFUSE");
console.log("\nSEMANTIC SEPARATION");
console.log("  should-answer sem: min "+Math.min(...a.map(r=>r.sem)).toFixed(3)+
            "  max "+Math.max(...a.map(r=>r.sem)).toFixed(3));
console.log("  should-refuse sem: min "+Math.min(...b.map(r=>r.sem)).toFixed(3)+
            "  max "+Math.max(...b.map(r=>r.sem)).toFixed(3));
console.log("\nCURRENT FLOORS  lex "+assistant.retrieval.minLexicalScore+
            "  sem "+assistant.retrieval.minSemanticScore);
console.log("  wrongly refused: "+a.filter(r=>!r.ok).map(r=>r.q).join(" | ")||"none");
console.log("  wrongly answered: "+(b.filter(r=>r.ok).map(r=>r.q).join(" | ")||"none"));
