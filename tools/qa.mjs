import handler from "../api/ask.js";
function res(){const o={};return{_o:o,status(c){o.c=c;return this},json(b){o.b=b;return this}}}
async function ask(q){const r=res();await handler({method:"POST",headers:{},body:{question:q}},r);return r._o.b}
const qs=[
 "who is he",
 "can he code",
 "what is he good at",
 "tell me about a mistake he made",
 "has he ever been right when the AI was wrong",
 "what is he still learning",
 "does he have leadership experience",
 "what does he think about AI content",
 "what car does he drive",
 "is he married"
];
for(const q of qs){
  const d=await ask(q);
  console.log("\nQ: "+q);
  console.log("   ["+d.mode+"] "+String(d.answer).replace(/\s+/g," ").slice(0,190));
  if(d.note) console.log("   note: "+d.note.slice(0,100));
  if(d.passages?.length) console.log("   src: "+d.passages[0].source+" :: "+d.passages[0].heading);
}
