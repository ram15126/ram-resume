// Greetings must be greeted; real questions must still reach retrieval.
import handler from "../api/ask.js";
function res(){const o={};return{_o:o,status(c){o.c=c;return this},json(b){o.b=b;return this}}}
async function ask(q){const r=res();await handler({method:"POST",headers:{"x-forwarded-for":"t-"+Math.random()},body:{question:q}},r);return r._o.b;}

const GREET = ["hi","hey","heyy","heyyy","hello","Hello!","yo","sup","hey there",
               "hi how are you","good morning","thanks","thank you","bye",
               "who are you","what can you do","are you a bot"];
const REAL  = ["can he code","his projects","what is his email","help me find his email",
               "what tools does he use","tell me about the audit system","who is he",
               "what is he still learning","hire him?"];

let bad=0;
console.log("SHOULD BE SMALL TALK");
for (const q of GREET) {
  const d = await ask(q);
  const ok = d.mode === "small-talk";
  if (!ok) bad++;
  console.log("  " + (ok?"PASS  ":"FAIL  ") + JSON.stringify(q) + "  -> " + d.mode);
}
console.log("\nSHOULD REACH RETRIEVAL");
for (const q of REAL) {
  const d = await ask(q);
  const ok = d.mode !== "small-talk";
  if (!ok) bad++;
  console.log("  " + (ok?"PASS  ":"FAIL  ") + JSON.stringify(q) + "  -> " + d.mode +
              (d.passages && d.passages.length ? " [" + d.passages[0].heading + "]" : ""));
}
console.log(bad ? "\n" + bad + " FAILURE(S)" : "\nAll correct.");
process.exit(bad?1:0);
