// Verify the Anthropic request we WOULD send is well formed, without a
// real key. Stubs fetch, captures the outgoing request, returns a fake
// completion, and asserts the response is assembled correctly.
process.env.ANTHROPIC_API_KEY = "sk-ant-FAKE-FOR-TEST";
const real = globalThis.fetch;
let captured = null;

globalThis.fetch = async function (url, opts) {
  captured = { url, opts };
  return {
    ok: true,
    status: 200,
    headers: { get: () => "application/json" },
    json: async () => ({
      content: [{ type: "text", text: "He does not write code himself [1]." }],
      usage: { input_tokens: 1234, output_tokens: 42 }
    })
  };
};

const { default: handler } = await import("../api/ask.js");
const { assistant } = await import("../config/assistant.js");
const out = {};
const res = { status(c){ out.code=c; return this; }, json(b){ out.body=b; return this; } };
await handler({ method:"POST", headers:{}, body:{ question:"Can he code?", history:[] } }, res);
globalThis.fetch = real;

const body = JSON.parse(captured.opts.body);
const checks = [
  ["endpoint", captured.url === "https://api.anthropic.com/v1/messages"],
  ["x-api-key sent", captured.opts.headers["x-api-key"] === "sk-ant-FAKE-FOR-TEST"],
  ["anthropic-version", captured.opts.headers["anthropic-version"] === "2023-06-01"],
  ["model", body.model === "claude-sonnet-5"],
  // Read from config rather than hardcoding, so raising the budget
  // does not silently break the test that guards it.
  ["max_tokens matches config", body.max_tokens === assistant.model.maxTokens],
  ["system is a string", typeof body.system === "string"],
  ["system carries rules", body.system.includes("RULES")],
  ["system carries passages", body.system.includes("[1]")],
  ["system carries honesty rule", body.system.includes("sourced and qualified")],
  ["messages is array", Array.isArray(body.messages)],
  ["last message is the question", body.messages.at(-1).content === "Can he code?"],
  ["answer extracted", out.body.answer === "He does not write code himself [1]."],
  ["mode answered", out.body.mode === "answered"],
  ["passages returned", (out.body.passages||[]).length > 0],
  // Usage is normalised to {input,output} across providers, because
  // each one names these differently and the UI should not care which.
  ["usage normalised", out.body.usage?.input === 1234 && out.body.usage?.output === 42],
  ["key NOT leaked to client", !JSON.stringify(out.body).includes("sk-ant")]
];
let bad = 0;
checks.forEach(([n,ok]) => { if(!ok) bad++; console.log((ok?"  PASS  ":"  FAIL  ")+n); });
console.log("\nsystem prompt: " + body.system.length + " chars, " +
            (body.system.match(/^\[\d+\]/gm)||[]).length + " numbered passages");
process.exit(bad ? 1 : 0);
