// =====================================================================
//  ASK ABOUT ME — the chat window for the retrieval-augmented assistant.
//
//  The browser does no retrieval and holds no key. It posts a question
//  to /api/ask and renders what comes back, including which passages
//  the answer was built from. Showing the sources is not decoration:
//  it is how a recruiter can check that an answer came from something
//  he actually wrote.
// =====================================================================

import { assistant } from "../../config/assistant.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ------------------------------------------------------- markdown
//  The model is asked to answer with bold and bullets, so something
//  has to turn that into elements. Without it a reader sees literal
//  asterisks, which looks like a broken bot rather than an emphasis.
//
//  Every leaf here is written with textContent and every element is
//  built by hand — never innerHTML. Model output is untrusted text,
//  and the cheapest way to be sure a stray <script> stays harmless
//  is to make markup impossible to express in the first place.

const BULLET = /^([-*\u2022]|\d+[.)])\s+/;
const HEADING = /^#{1,6}\s+/;

/** Inline **bold**, *italic* and `code` inside one line of text. */
function renderInline(target, text) {
  const pattern = /\*\*([^*]+)\*\*|\*([^*\n]+)\*|`([^`]+)`/g;
  let last = 0;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) {
      target.appendChild(document.createTextNode(text.slice(last, m.index)));
    }
    if (m[1] !== undefined) target.appendChild(el("strong", null, m[1]));
    else if (m[2] !== undefined) target.appendChild(el("em", null, m[2]));
    else target.appendChild(el("code", null, m[3]));
    last = pattern.lastIndex;
  }
  if (last < text.length) {
    target.appendChild(document.createTextNode(text.slice(last)));
  }
}

/**
 * Render a block of markdown into the bubble.
 *
 * Blocks are split on blank lines, but the model does not reliably
 * leave one before a list — "Here is what that looks like:" followed
 * immediately by three bullets arrives as a single block. So each
 * block is walked line by line and consecutive bullets are gathered
 * into a list wherever they start.
 */
function renderMarkdown(target, text) {
  const source = String(text || "").trim();
  target.textContent = "";

  source.split(/\n{2,}/).forEach(function (block) {
    const lines = block.split("\n")
      .map(function (line) { return line.trim(); })
      .filter(Boolean);

    let i = 0;
    while (i < lines.length) {
      if (BULLET.test(lines[i])) {
        const ordered = /^\d/.test(lines[i]);
        const list = el(ordered ? "ol" : "ul", "chat-list");
        while (i < lines.length && BULLET.test(lines[i])) {
          const item = document.createElement("li");
          renderInline(item, lines[i].replace(BULLET, ""));
          list.appendChild(item);
          i++;
        }
        target.appendChild(list);
        continue;
      }

      // A heading inside a three-sentence answer is over-formatting, so
      // it is demoted to a bold line rather than given its own scale.
      if (HEADING.test(lines[i])) {
        const head = el("p", "chat-para");
        head.appendChild(el("strong", null, lines[i].replace(HEADING, "")));
        target.appendChild(head);
        i++;
        continue;
      }

      const run = [];
      while (i < lines.length && !BULLET.test(lines[i]) && !HEADING.test(lines[i])) {
        run.push(lines[i]);
        i++;
      }
      const para = el("p", "chat-para");
      renderInline(para, run.join(" "));
      target.appendChild(para);
    }
  });

  // Never leave an empty bubble: if the text was nothing but markup
  // this renderer does not understand, show it raw.
  if (!target.childNodes.length) target.textContent = source;
}

// Exported for tools/test-markdown.mjs. The renderer is the one piece
// of this file that is pure enough to test without a browser, and the
// one place where untrusted model output becomes DOM.
export { renderMarkdown };

export const assistantApp = {
  id: "assistant",
  title: assistant.windowTitle,
  icon: "assistant",
  width: 560,
  height: 520,
  minWidth: 320,
  minHeight: 360,
  statusBar: "Ready",
  build: function (body, api) {
    body.classList.add("pad", "col");

    // Sent back with each question so follow-ups have context. Capped
    // server-side too — this is not the security boundary.
    const history = [];
    let busy = false;

    const log = el("div", "well chat-log");
    log.setAttribute("role", "log");
    log.setAttribute("aria-live", "polite");
    body.appendChild(log);

    // ---------------------------------------------------------- render
    function scrollDown() { log.scrollTop = log.scrollHeight; }

    function addMessage(role, text) {
      const row = el("div", "chat-row chat-" + role);
      const who = el("span", "chat-who", role === "user" ? "You" : "Assistant");
      const bubble = el("div", "chat-bubble");
      bubble.textContent = text;
      row.appendChild(who);
      row.appendChild(bubble);
      log.appendChild(row);
      scrollDown();
      return { row: row, bubble: bubble };
    }

    /**
     * Turn one stored note into something a person can read.
     *
     * What comes back is markdown, cut into chunks by length, so a raw
     * excerpt can open mid-sentence and carry ** and > along with it.
     * Shown as it is stored it reads as a broken page rather than as
     * evidence, which defeats the whole point of showing it.
     */
    function cleanExcerpt(text) {
      let t = String(text || "")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*\n]+)\*/g, "$1")
        .replace(/^\s*#{1,6}\s+/gm, "")
        .replace(/^\s*>\s?/gm, "")
        .replace(/^\s*([-*\u2022]|\d+[.)])\s+/gm, "")
        .replace(/\s+/g, " ")
        .trim();

      // A chunk that opens mid-sentence starts at its first whole one
      // instead — "with drawn SVG art." is not evidence of anything.
      if (/^[a-z]/.test(t)) {
        const next = t.search(/[.!?]\s+[A-Z0-9]/);
        t = next === -1 ? "" : t.slice(next + 1).trim();
      }

      // End on a full stop rather than mid-word.
      if (t.length > 260) {
        const stop = t.lastIndexOf(". ", 260);
        t = stop > 90
          ? t.slice(0, stop + 1)
          : t.slice(0, 260).replace(/\s+\S*$/, "") + "…";
      }
      return t;
    }

    /**
     * The collapsible "where this came from" block under an answer.
     *
     * Grouped by section, not by chunk: ten retrieved chunks routinely
     * come from four sections, and a visitor wants to know which parts
     * of his notes an answer rests on — not how the corpus happens to
     * be cut up, which file it lives in, or which half of the search
     * found it. That is all machinery, and machinery on screen is what
     * made this window look broken.
     */
    function addSources(row, passages) {
      if (!passages || !passages.length) return;

      const seen = {};
      const sections = [];
      passages.forEach(function (p) {
        const title = p.heading || "From his notes";
        if (seen[title]) return;
        const text = cleanExcerpt(p.text);
        if (!text) return;
        seen[title] = true;
        sections.push({ title: title, text: text });
      });
      if (!sections.length) return;

      const wrap = el("div", "chat-sources");
      const toggle = el("button", "chat-sources-toggle");
      toggle.type = "button";
      toggle.textContent = "▸ Where this came from";

      const list = el("div", "chat-sources-list");
      list.hidden = true;

      sections.forEach(function (s) {
        const item = el("div", "source-item");
        item.appendChild(el("div", "source-title", s.title));
        item.appendChild(el("p", "source-text", s.text));
        list.appendChild(item);
      });

      toggle.addEventListener("click", function () {
        list.hidden = !list.hidden;
        toggle.textContent = (list.hidden ? "▸" : "▾") + " Where this came from";
        if (!list.hidden) scrollDown();
      });

      wrap.appendChild(toggle);
      wrap.appendChild(list);
      row.appendChild(wrap);
    }

    // Only claim the answer was AI-generated when it actually was. In
    // retrieval-only mode the text is his own sentences, quoted; calling
    // that "AI-generated" is the same category of wrong the whole
    // assistant is built to avoid.
    function addDisclaimer(row, mode) {
      // A greeting is neither AI-written nor quoted from his notes — it
      // is a canned reply, so it gets no provenance line at all rather
      // than a claim that is not true of it.
      if (mode === "small-talk") return;
      const text = mode === "answered"
        ? assistant.guardrails.disclaimer
        : "Quoted from his own notes, unedited.";
      row.appendChild(el("p", "chat-disclaimer", text));
    }

    // ---------------------------------------------------------- opening
    addMessage("bot", assistant.greeting);

    const chips = el("div", "chat-chips");
    assistant.suggestions.forEach(function (s) {
      const chip = el("button", "chat-chip", s);
      chip.type = "button";
      chip.addEventListener("click", function () { ask(s); });
      chips.appendChild(chip);
    });
    log.appendChild(chips);

    // ------------------------------------------------------------ input
    const form = el("form", "chat-form");
    const input = document.createElement("input");
    input.type = "text";
    input.className = "chat-input";
    input.placeholder = assistant.placeholder;
    input.maxLength = assistant.limits.maxQuestionChars;
    input.setAttribute("aria-label", "Your question");
    input.autocomplete = "off";

    const send = el("button", "btn primary", "Ask");
    send.type = "submit";

    form.appendChild(input);
    form.appendChild(send);
    body.appendChild(form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      ask(input.value);
    });

    // -------------------------------------------------------------- ask
    async function ask(question) {
      question = String(question || "").trim();
      if (!question || busy) return;

      busy = true;
      input.value = "";
      input.disabled = true;
      send.disabled = true;
      chips.remove();

      addMessage("user", question);
      const thinking = addMessage("bot", "Searching his notes…");
      thinking.bubble.classList.add("is-thinking");
      api.setStatus("Working…");

      try {
        const response = await fetch(assistant.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: question, history: history })
        });

        // A plain static server (python -m http.server) has no /api, so
        // it answers with a 404 HTML page. Say what is actually wrong
        // rather than letting JSON.parse throw something cryptic.
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
          thinking.bubble.classList.remove("is-thinking");
          thinking.bubble.textContent =
            "The assistant's backend is not running. It needs `vercel dev` " +
            "locally, or a deploy to Vercel — a plain file server cannot " +
            "answer questions. Everything else on this desktop works without it.";
          api.setStatus("No backend");
          return;
        }

        const data = await response.json();
        thinking.bubble.classList.remove("is-thinking");
        renderMarkdown(thinking.bubble, data.answer || assistant.guardrails.refusals[0]);

        // Without a model key the server quotes him rather than writing
        // a reply. Say so on the message itself — a quote presented as
        // an answer reads as a non-sequitur when the question was
        // phrased differently from his notes.
        if (data.note) {
          thinking.row.appendChild(el("p", "chat-note", data.note));
        }

        addSources(thinking.row, data.passages);
        addDisclaimer(thinking.row, data.mode);

        history.push({ role: "user", content: question });
        history.push({ role: "assistant", content: data.answer || "" });

        // Passage counts, search mode and timings are debugging output.
        // A visitor reading "10 passages · keyword + meaning · 2.1s" is
        // being shown the machine, not told anything they asked for.
        api.setStatus(
          data.mode === "refused" ? "Nothing in his notes on that"
            : data.mode === "small-talk" ? "Ready"
            : data.mode === "retrieval-only" ? "Quoted from his notes"
            : "Answered from his notes"
        );
        scrollDown();
      } catch (err) {
        thinking.bubble.classList.remove("is-thinking");
        thinking.bubble.textContent =
          "I could not reach the assistant. Check your connection, or email " +
          "him directly at ramakrishnan15126@gmail.com.";
        api.setStatus("Connection failed");
      } finally {
        busy = false;
        input.disabled = false;
        send.disabled = false;
        input.focus();
      }
    }

    setTimeout(function () { input.focus(); }, 50);
  }
};
