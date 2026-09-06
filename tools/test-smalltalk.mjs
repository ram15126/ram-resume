// Greetings must be greeted; real questions must still reach retrieval.
import handler from "../api/ask.js";
function res(){const o={};return{_o:o,status(c){o.c=c;return this},json(b){o.b=b;return this}}}
async function ask(q){const r=res();await handler({method:"POST",headers:{"x-forwarded-for":"t-"+Math.random()},body:{question:q}},r);return r._o.b;}

const GREET = ["hi","hey","heyy","heyyy","hello","Hello!","yo","sup","hey there",
               "hi how are you","good morning","thanks","thank you","bye",
               "who are you","what can you do","are you a bot",
               // Stretched spellings: collapsed rather than listed.
               "hii","hiii","heyyyy","hellooo",
               // These all used to fall through to search and get refused,
               // which is how a visitor's first message became "I do not know".
               "how are you","how r u","hows it going","wassup","whats up",
               "morning","evening","are you there","anyone there","test",
               "testing","ok","okay","hmm","lol","haha","nice one",
               // Nothing but emoji or punctuation.
               String.fromCodePoint(0x1F600),"!!!"];
const REAL  = ["can he code","his projects","what is his email","help me find his email",
               "what tools does he use","tell me about the audit system","who is he",
               "what is he still learning","hire him?",
               // The collapsing rule must not eat real words: "cool" is a
               // greeting, "tools" and "skills" are not.
               "what tools","his skills","is he good at seo"];

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
console.log("");
console.log("REFUSALS");
const refusals = (await import("../config/assistant.js")).assistant.guardrails.refusals;
[["several to rotate between", refusals.length >= 4],
 ["none sends them to his email", !refusals.some(r => /@|e-?mail/i.test(r))],
 ["each one is short", refusals.every(r => r.length < 230)]
].forEach(([n, ok]) => { if (!ok) bad++; console.log("  " + (ok ? "PASS  " : "FAIL  ") + n); });

console.log(bad ? "\n" + bad + " FAILURE(S)" : "\nAll correct.");
process.exit(bad?1:0);
