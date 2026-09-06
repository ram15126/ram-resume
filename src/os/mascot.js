// =====================================================================
//  MASCOT — the corner character that opens the assistant.
//
//  The assistant is the most interesting thing on this desktop and it
//  was hidden behind one icon among thirteen. This is the same pattern
//  the Office Assistant used: a character in the corner with a speech
//  balloon, which is both period-correct and the reason anyone notices
//  it at all.
//
//  It does not replace the desktop icon. Both open the same window.
// =====================================================================

import { assistant } from "../../config/assistant.js";
import { mascotUrl } from "./mascotart.js";
import { launch } from "../apps/registry.js";
import { onWindowsChanged } from "./wm.js";

const SEEN_KEY = "ram98:mascot-greeted";

let img = null;
let balloon = null;
let blinkTimer = null;
let hideTimer = null;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function setFrame(frame) {
  if (img) img.src = mascotUrl(frame, 3);
}

/**
 * Blink on a loop, and wave occasionally.
 *
 * Deliberately irregular: a character that blinks on a fixed metronome
 * reads as a spinning loading icon, which people learn to ignore. The
 * random gap is what makes it read as alive.
 */
function startIdleLoop() {
  function schedule() {
    const gap = 2600 + Math.random() * 4200;
    blinkTimer = setTimeout(function () {
      if (document.hidden) { schedule(); return; }   // don't animate unseen
      const wave = Math.random() < 0.22;
      setFrame(wave ? "wave" : "blink");
      setTimeout(function () {
        setFrame("idle");
        schedule();
      }, wave ? 620 : 140);
    }, gap);
  }
  schedule();
}

function showBalloon(text, autoHideMs) {
  if (!balloon) return;
  balloon.querySelector(".mascot-balloon-text").textContent = text;
  balloon.hidden = false;
  clearTimeout(hideTimer);
  if (autoHideMs) {
    hideTimer = setTimeout(function () { balloon.hidden = true; }, autoHideMs);
  }
}

function hideBalloon() {
  clearTimeout(hideTimer);
  if (balloon) balloon.hidden = true;
}

export function buildMascot() {
  const copy = assistant.mascot;
  if (!copy || copy.enabled === false) return;

  const root = el("div", "mascot");
  root.id = "mascot";

  // ---- speech balloon ----
  balloon = el("div", "mascot-balloon");
  balloon.hidden = true;

  const text = el("p", "mascot-balloon-text", copy.greeting);
  balloon.appendChild(text);

  const dismiss = el("button", "mascot-balloon-close", "×");
  dismiss.type = "button";
  dismiss.setAttribute("aria-label", "Dismiss");
  dismiss.addEventListener("click", function (e) {
    e.stopPropagation();
    hideBalloon();
  });
  balloon.appendChild(dismiss);
  root.appendChild(balloon);

  // ---- the character ----
  const button = el("button", "mascot-btn");
  button.type = "button";
  button.setAttribute("aria-label", copy.ariaLabel || "Open the assistant");
  button.title = copy.ariaLabel || "Open the assistant";

  img = document.createElement("img");
  img.className = "mascot-img";
  img.alt = "";
  img.src = mascotUrl("idle", 3);
  img.draggable = false;
  button.appendChild(img);

  button.addEventListener("click", function () {
    hideBalloon();
    launch("assistant");
  });
  button.addEventListener("mouseenter", function () {
    if (balloon.hidden) showBalloon(copy.hover || copy.greeting, 0);
  });
  root.addEventListener("mouseleave", function () { hideBalloon(); });

  root.appendChild(button);
  document.body.appendChild(root);

  startIdleLoop();

  // ---- greet once, after the desktop has settled ----
  //  Only on a visitor's first arrival. A balloon that reappears every
  //  session is the reason people learned to hate this pattern.
  let greeted = false;
  try { greeted = localStorage.getItem(SEEN_KEY) === "1"; } catch (e) { greeted = false; }

  if (!greeted) {
    setTimeout(function () {
      if (document.getElementById("assistant-open")) return;
      showBalloon(copy.greeting, copy.greetMs || 9000);
      try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) { /* private mode */ }
    }, copy.greetDelayMs || 2600);
  }

  // ---- get out of the way when the assistant is already open ----
  onWindowsChanged(function (wins) {
    const open = wins.some(function (w) { return w.id === "assistant" && !w.minimised; });
    root.classList.toggle("is-dimmed", open);
    if (open) hideBalloon();
  });
}
