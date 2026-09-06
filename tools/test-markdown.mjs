// Prove the chat renderer turns the model's markdown into elements —
// and, more importantly, that it can only ever produce elements. The
// answer text is written by a language model; if a tag can survive the
// trip into the DOM, that is an XSS hole with a friendly face.
//
// A DOM small enough to fit here: nodes, text nodes, and a serializer.

const nodes = [];
function makeNode(tag) {
  const node = {
    tagName: tag, className: "", children: [], _text: null,
    appendChild(child) { this._text = null; this.children.push(child); return child; },
    get childNodes() { return this._text === null ? this.children : [1]; },
    set textContent(v) { this._text = String(v); this.children = []; },
    get textContent() {
      return this._text !== null ? this._text
        : this.children.map(c => c.textContent).join("");
    }
  };
  nodes.push(node);
  return node;
}
globalThis.document = {
  createElement: makeNode,
  createTextNode(t) { const n = makeNode("#text"); n.textContent = t; return n; }
};

function html(node) {
  if (node.tagName === "#text") return node._text;
  const inner = node._text !== null ? node._text : node.children.map(html).join("");
  const cls = node.className ? ' class="' + node.className + '"' : "";
  return "<" + node.tagName + cls + ">" + inner + "</" + node.tagName + ">";
}

const { renderMarkdown } = await import("../src/apps/assistant.js");

function render(text) {
  const root = makeNode("div");
  renderMarkdown(root, text);
  return root.children.map(html).join("");
}

// A real Gemini answer, bullets running straight on from the lead-in
// with no blank line — the shape that broke the first renderer.
const real = [
  "My day-to-day sits at the intersection of **marketing strategy** and AI orchestration.",
  "Here is what that looks like:",
  "- **Demand generation:** the LinkedIn programme for a healthcare client.",
  "- **Workflow building:** turning manual processes into reusable systems.",
  "",
  "I do not write code myself."
].join("\n");

const out = render(real);

const checks = [
  ["lead-in becomes a paragraph", /^<p class="chat-para">My day-to-day/.test(out)],
  ["bold becomes strong", out.includes("<strong>marketing strategy</strong>")],
  ["asterisks are gone", !out.includes("**")],
  ["run-on bullets become a list", /<ul class="chat-list"><li>/.test(out)],
  ["both bullets captured", (out.match(/<li>/g) || []).length === 2],
  ["bullet markers stripped", !/<li>-/.test(out)],
  ["trailing block still a paragraph", out.endsWith("I do not write code myself.</p>")],

  ["numbered list becomes ol", render("1. first\n2. second").startsWith("<ol")],
  ["heading demoted to bold", render("## Roles\ntext").startsWith('<p class="chat-para"><strong>Roles</strong></p>')],
  ["inline code kept", render("run `npm test` now").includes("<code>npm test</code>")],

  // The security property: markup in the model's output must stay text.
  ["tags never become elements", (() => {
    const root = makeNode("div");
    renderMarkdown(root, "<img src=x onerror=alert(1)> and <b>bold</b>");
    // Nothing was created but a paragraph and text nodes.
    return root.children.every(c => c.tagName === "p") &&
           root.textContent.includes("<img src=x onerror=alert(1)>");
  })()],
  ["empty answer never blanks the bubble", render("   ") === "" ],
  ["unknown markup still shown", (() => {
    const root = makeNode("div");
    renderMarkdown(root, "|table|");
    return root.textContent.includes("|table|");
  })()]
];

let bad = 0;
checks.forEach(([n, ok]) => { if (!ok) bad++; console.log((ok ? "  PASS  " : "  FAIL  ") + n); });
if (bad) console.log("\n" + out);
process.exit(bad ? 1 : 0);
