// =====================================================================
//  TIME MACHINE — the way out of 2006.
//
//  A small Win98 utility that looks like it belongs on the desktop,
//  then very much does not: the year spins up, the screen tears, the
//  CRT collapses to a line, and the browser leaves for the 2026 site.
//
//  The whole departure is CSS and one interval. It needs no assets, so
//  it cannot half-load and it cannot strand you.
// =====================================================================

const DEST = "future/index.html?arrive=2026";
const FROM_YEAR = 2006;
const TO_YEAR = 2026;
const SPIN_MS = 2100;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** The full-screen departure. Resolves by navigating away. */
function depart() {
  const stage = el("div", "tm-stage");
  stage.setAttribute("aria-hidden", "true");

  const scan = el("div", "tm-scan");
  const flash = el("div", "tm-flash");
  const readout = el("div", "tm-readout");
  const year = el("span", "tm-year", String(FROM_YEAR));
  const status = el("span", "tm-status", "SPINNING UP");
  readout.appendChild(year);
  readout.appendChild(status);

  stage.appendChild(scan);
  stage.appendChild(readout);
  stage.appendChild(flash);
  document.body.appendChild(stage);
  document.body.classList.add("tm-departing");

  const started = Date.now();
  let done = false;

  function arrive() {
    if (done) return;
    done = true;
    clearInterval(timer);
    document.body.classList.add("tm-collapse");
    setTimeout(function () { location.href = DEST; }, 620);
  }

  // Driven by a timer, not requestAnimationFrame. rAF is paused in a
  // background tab, and this animation ends in a navigation — someone
  // who clicks Engage and switches tabs must not come back to a frozen
  // screen that never went anywhere.
  const timer = setInterval(function () {
    const k = Math.min(1, (Date.now() - started) / SPIN_MS);
    // Slow, then very fast — a machine winding up.
    const eased = Math.pow(k, 2.4);
    year.textContent = String(Math.round(FROM_YEAR + (TO_YEAR - FROM_YEAR) * eased));
    stage.style.setProperty("--k", k.toFixed(4));

    if (k > 0.42 && k < 0.8) status.textContent = "TEARING";
    else if (k >= 0.8) status.textContent = "ARRIVING " + TO_YEAR;

    if (k >= 1) arrive();
  }, 40);

  // Belt and braces: whatever happens to the animation, the trip
  // completes. Nobody gets stranded on a black screen.
  setTimeout(arrive, SPIN_MS + 900);
}

export const timeMachineApp = {
  id: "timemachine",
  title: "Time Machine",
  icon: "timemachine",
  width: 440,
  height: 380,
  minWidth: 300,
  minHeight: 300,
  statusBar: "Destination locked",
  build: function (body, api) {
    body.classList.add("pad", "col");

    const w = el("div", "well prose");

    w.appendChild(el("h2", "well-h", "Temporal relocation"));
    w.appendChild(el("p", null,
      "This machine is 2006 — the year I was born. The work on it is not: everything " +
      "here is real and current. It is just wearing a coat from the year I turned up."));
    w.appendChild(el("p", null,
      "Travel forward and you get the same résumé in the form it actually deserves: " +
      "a 3D corridor you fly through, written the way I would say it out loud."));

    const dial = el("div", "tm-dial");
    const dialFrom = el("div", "tm-dial-cell");
    dialFrom.appendChild(el("span", "tm-dial-label", "DEPARTING"));
    dialFrom.appendChild(el("span", "tm-dial-year", String(FROM_YEAR)));
    const dialArrow = el("div", "tm-dial-arrow", "▶");
    const dialTo = el("div", "tm-dial-cell is-dest");
    dialTo.appendChild(el("span", "tm-dial-label", "ARRIVING"));
    dialTo.appendChild(el("span", "tm-dial-year", String(TO_YEAR)));
    dial.appendChild(dialFrom);
    dial.appendChild(dialArrow);
    dial.appendChild(dialTo);
    w.appendChild(dial);

    w.appendChild(el("p", "audit-note",
      "Heads up: the destination is a 3D site. It needs a reasonably modern browser, " +
      "and it is heavier than this desktop. Everything here stays exactly where it is — " +
      "there is a way back."));

    body.appendChild(w);

    const actions = el("div", "toolbar end");

    const cancel = el("button", "btn", "Not yet");
    cancel.type = "button";
    cancel.addEventListener("click", function () { api.close(); });

    const go = el("button", "btn primary", "Engage");
    go.type = "button";
    go.addEventListener("click", function () {
      go.disabled = true;
      cancel.disabled = true;
      api.setStatus("Engaging…");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) { location.href = DEST; return; }
      depart();
    });

    actions.appendChild(cancel);
    actions.appendChild(go);
    body.appendChild(actions);
  }
};
