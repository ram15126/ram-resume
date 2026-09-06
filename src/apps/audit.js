// =====================================================================
//  AUDIT TRAINER — the mini-game.
//
//  Raw output from an automated SEO crawler appears one line at a time.
//  You decide: real finding, or an artefact of how the tool measured?
//  Getting it wrong is the point — that is what makes the closing note
//  land.
//
//  The findings are illustrative teaching cases, not client data.
// =====================================================================

import { auditRounds, auditCopy } from "../../config/desktop.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function shuffled(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = copy[i]; copy[i] = copy[j]; copy[j] = swap;
  }
  return copy;
}

export const auditApp = {
  id: "audit",
  title: "Audit Trainer",
  icon: "magnifier",
  width: 580,
  height: 480,
  minWidth: 340,
  minHeight: 360,
  statusBar: "Ready",
  build: function (body, api) {
    body.classList.add("pad", "col");

    let deck = [];
    let index = 0;
    let score = 0;
    let answered = false;

    const w = el("div", "well prose audit");
    body.appendChild(w);

    const actions = el("div", "toolbar audit-actions");
    body.appendChild(actions);

    // ------------------------------------------------------ screens
    function renderIntro() {
      w.innerHTML = "";
      actions.innerHTML = "";

      w.appendChild(el("h2", "well-h", "Is this finding real?"));
      w.appendChild(el("p", null, auditCopy.intro));

      const note = el("p", "audit-note");
      note.textContent = "Eight rounds. The findings below are illustrative teaching examples, not client data.";
      w.appendChild(note);

      const start = el("button", "btn primary", "Start");
      start.type = "button";
      start.addEventListener("click", begin);
      actions.appendChild(start);
      api.setStatus("Ready");
    }

    function begin() {
      deck = shuffled(auditRounds);
      index = 0;
      score = 0;
      renderRound();
    }

    function renderRound() {
      answered = false;
      const round = deck[index];
      w.innerHTML = "";
      actions.innerHTML = "";

      const head = el("div", "audit-head");
      head.appendChild(el("span", "audit-count", "Finding " + (index + 1) + " of " + deck.length));
      head.appendChild(el("span", "audit-score", "Score " + score));
      w.appendChild(head);

      const card = el("div", "audit-card");
      card.appendChild(el("span", "audit-tool", round.tool));
      card.appendChild(el("h3", "audit-finding", round.finding));
      card.appendChild(el("p", "audit-detail", "How it was measured: " + round.detail));
      w.appendChild(card);

      const verdict = el("div", "audit-verdict");
      verdict.hidden = true;
      w.appendChild(verdict);

      const yes = el("button", "btn", "Real finding");
      yes.type = "button";
      const no = el("button", "btn", "False positive");
      no.type = "button";

      function answer(saidReal) {
        if (answered) return;
        answered = true;
        const right = saidReal === round.real;
        if (right) score += 1;

        yes.disabled = true;
        no.disabled = true;
        (round.real ? yes : no).classList.add("is-correct");
        if (!right) (saidReal ? yes : no).classList.add("is-wrong");

        verdict.hidden = false;
        verdict.className = "audit-verdict " + (right ? "is-right" : "is-wrong");
        verdict.appendChild(el("strong", null, right ? "Correct." : "Not this one."));
        verdict.appendChild(el("p", null, round.why));

        const next = el("button", "btn primary", index === deck.length - 1 ? "See result" : "Next finding");
        next.type = "button";
        next.addEventListener("click", function () {
          index += 1;
          if (index >= deck.length) renderResult(); else renderRound();
        });
        actions.appendChild(next);
        next.focus();

        api.setStatus("Score " + score + " of " + (index + 1));
      }

      yes.addEventListener("click", function () { answer(true); });
      no.addEventListener("click", function () { answer(false); });
      actions.appendChild(yes);
      actions.appendChild(no);

      api.setStatus("Finding " + (index + 1) + " of " + deck.length);
    }

    function renderResult() {
      w.innerHTML = "";
      actions.innerHTML = "";

      const pct = Math.round((score / deck.length) * 100);
      w.appendChild(el("h2", "well-h", "You caught " + score + " of " + deck.length + "."));

      const bar = el("div", "audit-bar");
      const fill = el("div", "audit-bar-fill");
      fill.style.width = pct + "%";
      bar.appendChild(fill);
      w.appendChild(bar);

      let verdict;
      if (pct === 100) verdict = "Nothing got past you. That is the standard a client report has to meet.";
      else if (pct >= 75) verdict = "Good instincts. The ones that slip through are the expensive ones.";
      else if (pct >= 50) verdict = "About half. This is why an automated report cannot go out unread.";
      else verdict = "Most of those would have reached the client. That is the whole problem.";
      w.appendChild(el("p", null, verdict));

      const close = el("blockquote", "audit-close");
      close.appendChild(el("p", null, auditCopy.closing));
      w.appendChild(close);

      w.appendChild(el("p", "audit-note",
        "Every finding in a report I write is labelled Confirmed, Likely or Unverified, with a reproducible verification step attached."));

      const again = el("button", "btn", "Play again");
      again.type = "button";
      again.addEventListener("click", begin);
      actions.appendChild(again);

      api.setStatus("Finished — " + score + " of " + deck.length);
    }

    renderIntro();
  }
};
