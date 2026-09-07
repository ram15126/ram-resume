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
import { renderMarkdown, toSections } from "../lib/markdown.js";
import { sound } from "../lib/sound.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

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
     * The collapsible "where this came from" block under an answer.
     * Grouped into sections by the shared helper, so this window and the
     * 2026 site show a visitor the same thing.
     */
    function addSources(row, passages) {
      const sections = toSections(passages);
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
        toggle.textContent = (list.hidden ? "▸" : "▾") +
          " Where this came from";
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
      sound.play("click");
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
          sound.play("error");
          api.setStatus("No backend");
          return;
        }

        const data = await response.json();
        thinking.bubble.classList.remove("is-thinking");
        //  The answer can take a couple of seconds, by which time a
        //  visitor may well be reading something else on the desktop.
        sound.play("notify");
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
        sound.play("error");
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
