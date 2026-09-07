// =====================================================================
//  ASSISTANT — the RAG bot, as a docked chat panel with an avatar.
//
//  It imports `../../config/assistant.js` — the SAME file the 98 desktop
//  app and the server function read. Not a copy. The guardrails in there
//  are what stop this thing inventing a career for a real person, and
//  two drifting copies of a rule like "leads are sourced and qualified,
//  never converted" is exactly how a site ends up lying on one page and
//  telling the truth on another.
//
//  Everything that carries trust on the desktop version is carried here
//  too, deliberately:
//
//    - the source passages behind every answer, openable
//    - a disclaimer that distinguishes an AI-written answer from his own
//      sentences quoted back
//    - the refusal text when retrieval finds nothing
//    - an honest message when the backend simply is not running
//
//  Dropping any of those would make it look better and be worse.
//
//  THE AVATAR IS ORIGINAL. It is not Grok's mark, or any other
//  company's: putting a real AI product's logo on a personal portfolio
//  implies an association that does not exist. It is drawn here in the
//  site's own language — monochrome, geometric, no gradients.
// =====================================================================

import { assistant } from "../../config/assistant.js";
import { voice } from "../config/voice.js";
import { renderMarkdown, toSections } from "../../src/lib/markdown.js";
import { sound } from "../../src/lib/sound.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/*  The avatar: three concentric arcs turning at different rates around a
    core that breathes. Reads as "thinking" without a face, a gradient or
    a borrowed logo — and differential rotation is the cheapest way to
    make a static mark feel alive. */
const AVATAR_SVG =
  '<svg viewBox="0 0 48 48" class="bot-mark" aria-hidden="true">' +
    '<g class="bot-arc bot-arc-1">' +
      '<circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" ' +
        'stroke-width="1.5" stroke-dasharray="30 90" stroke-linecap="round"/>' +
    '</g>' +
    '<g class="bot-arc bot-arc-2">' +
      '<circle cx="24" cy="24" r="13.5" fill="none" stroke="currentColor" ' +
        'stroke-width="1.5" stroke-dasharray="18 60" stroke-linecap="round"/>' +
    '</g>' +
    '<g class="bot-arc bot-arc-3">' +
      '<circle cx="24" cy="24" r="8" fill="none" stroke="currentColor" ' +
        'stroke-width="1.5" stroke-dasharray="10 40" stroke-linecap="round"/>' +
    '</g>' +
    '<circle class="bot-core" cx="24" cy="24" r="3.4" fill="currentColor"/>' +
  '</svg>';

const CLOSE_SVG =
  '<svg viewBox="0 0 48 48" class="bot-close" aria-hidden="true">' +
    '<path d="M16 16 L32 32 M32 16 L16 32" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round"/>' +
  '</svg>';

export function mountAssistant() {
  const history = [];
  let busy = false;
  let open = false;
  let lastFocus = null;

  // ---- launcher ------------------------------------------------------
  const launcher = el("button", "bot-launcher");
  launcher.type = "button";
  launcher.setAttribute("aria-label", "Ask about Ramakrishnan — opens a chat");
  launcher.setAttribute("aria-expanded", "false");
  launcher.innerHTML = AVATAR_SVG + CLOSE_SVG;
  launcher.appendChild(el("span", "bot-pulse"));

  // A one-time nudge. Nobody clicks a mystery circle, and this is the
  // only thing on the page that answers back.
  const tip = el("span", "bot-tip", "Ask me about him");
  launcher.appendChild(tip);

  // ---- panel ---------------------------------------------------------
  const panel = el("aside", "bot-panel");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("aria-label", "Ask about Ramakrishnan");
  panel.hidden = true;

  const head = el("header", "bot-head");
  const ident = el("div", "bot-ident");
  ident.innerHTML = AVATAR_SVG;
  const identText = el("div", "bot-ident-text");
  identText.appendChild(el("span", "bot-name", "RAM.bot"));
  identText.appendChild(el("span", "bot-sub", "Answers from his own notes"));
  ident.appendChild(identText);
  head.appendChild(ident);

  const closeBtn = el("button", "bot-close-btn", "Close");
  closeBtn.type = "button";
  head.appendChild(closeBtn);
  panel.appendChild(head);

  const body = el("div", "bot-body");
  // The smooth-scroll driver checks for this and leaves the wheel alone,
  // so the transcript scrolls instead of the page behind it.
  body.setAttribute("data-native-scroll", "");
  panel.appendChild(body);

  // ---- transcript ----------------------------------------------------
  const log = el("div", "ask-log");
  log.setAttribute("role", "log");
  log.setAttribute("aria-live", "polite");

  function addMessage(who, text) {
    const row = el("div", "ask-row is-" + who);
    row.appendChild(el("span", "ask-who", who === "user" ? "You" : "RAM.bot"));
    // A div, not a p: a rendered answer contains paragraphs and lists,
    // and the browser silently breaks those out of a <p> parent.
    const bubble = el("div", "ask-text", text);
    row.appendChild(bubble);
    log.appendChild(row);
    scrollDown();
    return { row: row, bubble: bubble };
  }

  function scrollDown() { body.scrollTop = body.scrollHeight; }

  /*  Where the answer came from. This is the whole trust mechanism — an
      answer you cannot check is just a confident voice — but the chunk
      numbers, filenames and search-mode labels it used to print were
      debugging output wearing a trust mechanism's clothes. Grouped into
      sections by the shared helper, same as the desktop window. */
  function addSources(row, passages) {
    const sections = toSections(passages);
    if (!sections.length) return;

    const wrap = el("div", "ask-sources");
    const toggle = el("button", "ask-sources-toggle");
    toggle.type = "button";
    toggle.textContent = "Where this came from";

    const list = el("div", "ask-sources-list");
    list.hidden = true;

    sections.forEach(function (section) {
      const item = el("div", "ask-source");
      item.appendChild(el("div", "ask-source-title", section.title));
      item.appendChild(el("p", "ask-source-text", section.text));
      list.appendChild(item);
    });

    toggle.addEventListener("click", function () {
      list.hidden = !list.hidden;
      toggle.classList.toggle("is-open", !list.hidden);
      if (!list.hidden) scrollDown();
    });

    wrap.appendChild(toggle);
    wrap.appendChild(list);
    row.appendChild(wrap);
  }

  /*  Only claim the answer was AI-generated when it actually was. With no
      model key the server quotes his own sentences back, and calling that
      "AI-generated" is the same category of wrong this assistant exists
      to avoid. */
  function addDisclaimer(row, mode) {
    // A greeting is neither AI-written nor quoted from his notes — it is
    // a canned line, so it gets no provenance claim at all rather than
    // one that is untrue of it.
    if (mode === "small-talk") return;
    row.appendChild(el("p", "ask-disclaimer",
      mode === "answered"
        ? assistant.guardrails.disclaimer
        : "Quoted from his own notes, unedited."));
  }

  // ---- opening -------------------------------------------------------
  addMessage("bot", assistant.greeting);

  const chips = el("div", "ask-chips");
  assistant.suggestions.forEach(function (s) {
    const chip = el("button", "ask-chip", s);
    chip.type = "button";
    chip.addEventListener("click", function () { ask(s); });
    chips.appendChild(chip);
  });
  log.appendChild(chips);
  body.appendChild(log);

  // ---- input ---------------------------------------------------------
  const form = el("form", "ask-form");
  const input = document.createElement("input");
  input.type = "text";
  input.className = "ask-input";
  input.placeholder = assistant.placeholder;
  input.maxLength = assistant.limits.maxQuestionChars;
  input.setAttribute("aria-label", "Your question about Ramakrishnan");
  input.autocomplete = "off";

  const send = el("button", "ask-send", "Ask");
  send.type = "submit";

  form.appendChild(input);
  form.appendChild(send);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    ask(input.value);
  });

  const status = el("p", "ask-status", "");

  const foot = el("div", "bot-foot");
  foot.appendChild(form);
  foot.appendChild(status);
  panel.appendChild(foot);

  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  // ---- open / close --------------------------------------------------
  function openPanel() {
    if (open) return;
    open = true;
    lastFocus = document.activeElement;
    panel.hidden = false;
    // Next frame, so the transition has a start state to animate from.
    requestAnimationFrame(function () {
      document.body.classList.add("bot-open");
      launcher.classList.add("is-open");
      launcher.setAttribute("aria-expanded", "true");
      launcher.setAttribute("aria-label", "Close the chat");
    });
    tip.remove();
    setTimeout(function () { input.focus(); }, 260);
  }

  function closePanel() {
    if (!open) return;
    open = false;
    document.body.classList.remove("bot-open");
    launcher.classList.remove("is-open");
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-label", "Ask about Ramakrishnan — opens a chat");
    setTimeout(function () { if (!open) panel.hidden = true; }, 360);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  launcher.addEventListener("click", function () {
    open ? closePanel() : openPanel();
  });
  closeBtn.addEventListener("click", closePanel);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) closePanel();
  });

  // ---- ask -----------------------------------------------------------
  async function ask(question) {
    question = String(question || "").trim();
    if (!question || busy) return;

    busy = true;
    sound.play("click");
    input.value = "";
    input.disabled = true;
    send.disabled = true;
    if (chips.parentNode) chips.remove();

    addMessage("user", question);
    const thinking = addMessage("bot", "Searching his notes");
    thinking.bubble.classList.add("is-thinking");
    launcher.classList.add("is-busy");
    status.textContent = "Working…";

    try {
      const response = await fetch(assistant.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question, history: history })
      });

      // A plain static server has no /api, so it answers with a 404 HTML
      // page. Say what is actually wrong rather than letting JSON.parse
      // throw something cryptic.
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        thinking.bubble.classList.remove("is-thinking");
        thinking.bubble.textContent =
          "The assistant's backend is not running. It needs `vercel dev` locally, " +
          "or a deploy to Vercel — a plain file server cannot answer questions. " +
          "Everything else on this site works without it.";
        sound.play("error");
        status.textContent = "No backend";
        return;
      }

      const data = await response.json();
      thinking.bubble.classList.remove("is-thinking");
      sound.play("notify");
      renderMarkdown(thinking.bubble, data.answer || assistant.guardrails.refusals[0]);

      if (data.note) thinking.row.appendChild(el("p", "ask-note", data.note));

      addSources(thinking.row, data.passages);
      addDisclaimer(thinking.row, data.mode);

      history.push({ role: "user", content: question });
      history.push({ role: "assistant", content: data.answer || "" });

      // Passage counts, search mode and timings are debugging output. A
      // visitor reading "10 passages · keyword + meaning · 1.4s" is being
      // shown the machine, not told anything they asked for.
      status.textContent =
        data.mode === "refused" ? "Nothing in his notes on that"
          : data.mode === "small-talk" ? "Ready"
          : data.mode === "retrieval-only" ? "Quoted from his notes"
          : "Answered from his notes";
      scrollDown();
    } catch (err) {
      thinking.bubble.classList.remove("is-thinking");
      thinking.bubble.textContent =
        "I could not reach the assistant. Check your connection, or email him " +
        "directly at " + voice.contact.email + ".";
      sound.play("error");
      status.textContent = "Connection failed";
    } finally {
      busy = false;
      launcher.classList.remove("is-busy");
      input.disabled = false;
      send.disabled = false;
      if (open) input.focus();
    }
  }

  return { open: openPanel, close: closePanel, ask: ask };
}
