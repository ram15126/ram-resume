// =====================================================================
//  SHELL — the desktop icon grid, the taskbar and the Start menu.
// =====================================================================

import { desktopIcons, startLinks, startMenuSpine } from "../../config/desktop.js";
import { content } from "../../config/content.js";
import { iconUrl, iconImg } from "./iconart.js";
import { launch } from "../apps/registry.js";
import { onWindowsChanged, focusWindow, minimiseWindow, listWindows } from "./wm.js";
import { sound } from "../lib/sound.js";

/** Small DOM helper — the same shape the apps use. */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ---------------------------------------------------------------- icons
export function buildDesktopIcons() {
  const layer = document.getElementById("icons");
  layer.innerHTML = "";

  desktopIcons.forEach(function (def) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "desk-icon";
    btn.dataset.app = def.app;
    btn.appendChild(iconImg(def.icon, 2, ""));
    const label = document.createElement("span");
    label.className = "desk-icon-label";
    label.textContent = def.label;
    btn.appendChild(label);

    // Double click opens, as it should. But a portfolio cannot afford
    // to hide its content behind a gesture some visitors will not try,
    // so a second click on an already-selected icon opens it as well —
    // which is what a slow double click feels like anyway. Keyboard
    // Enter and a single tap on touch also open.
    btn.addEventListener("click", function (e) {
      if (e.detail === 0) { selectIcon(btn); launch(def.app); return; }  // Enter
      const wasSelected = btn.classList.contains("is-selected");
      //  Selecting ticks; opening is announced by the window itself, so
      //  a single click does not fire two sounds on top of each other.
      if (!wasSelected) sound.play("click");
      selectIcon(btn);
      if (wasSelected) launch(def.app);
    });
    btn.addEventListener("dblclick", function () {
      selectIcon(btn);
      launch(def.app);
    });
    btn.addEventListener("touchend", function (e) {
      e.preventDefault();
      selectIcon(btn);
      launch(def.app);
    });

    layer.appendChild(btn);
  });

  document.getElementById("desktop").addEventListener("mousedown", function (e) {
    if (e.target.closest(".desk-icon")) return;
    selectIcon(null);
  });
}

function selectIcon(btn) {
  document.querySelectorAll(".desk-icon.is-selected").forEach(function (el) {
    el.classList.remove("is-selected");
  });
  if (btn) btn.classList.add("is-selected");
}

// -------------------------------------------------------------- taskbar
export function buildTaskbar() {
  const startBtn = document.getElementById("start-button");
  startBtn.innerHTML = "";
  const logo = document.createElement("img");
  logo.src = iconUrl("start", 1);
  logo.alt = "";
  logo.className = "start-logo";
  startBtn.appendChild(logo);
  const startText = document.createElement("span");
  startText.textContent = "start";
  startBtn.appendChild(startText);

  startBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    sound.play("menu");
    toggleStartMenu();
  });

  const quickBtn = buildQuickLaunch();
  maybeShowTravelHint(quickBtn);

  onWindowsChanged(renderTaskButtons);
  renderTaskButtons(listWindows());
  buildSoundToggle();
  startClock();
}

function renderTaskButtons(wins) {
  const strip = document.getElementById("task-buttons");
  strip.innerHTML = "";
  wins.forEach(function (w) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "task-btn" + (w.focused && !w.minimised ? " is-active" : "");
    if (w.icon) {
      const img = document.createElement("img");
      img.src = iconUrl(w.icon, 1);
      img.alt = "";
      b.appendChild(img);
    }
    const span = document.createElement("span");
    span.textContent = w.title;
    b.appendChild(span);
    b.addEventListener("click", function () {
      //  minimiseWindow makes its own sound; focusing needs one here.
      if (w.focused && !w.minimised) { minimiseWindow(w.id); return; }
      sound.play("click");
      focusWindow(w.id);
    });
    strip.appendChild(b);
  });
}

/*  The speaker in the system tray.
 *
 *  Every Windows of this era put one here, so it is both the
 *  period-correct place for it and the first place anyone looks when a
 *  web page makes a noise they did not ask for. A mute you cannot find
 *  in one glance is worse than no sound at all.
 *
 *  Drawn rather than set in text: an emoji speaker is the wrong century
 *  and renders differently on every platform, and this has to stay
 *  legible at eleven pixels.
 */
const SPEAKER =
  '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">' +
    '<path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor"/>' +
    '<g class="tray-waves" fill="none" stroke="currentColor" stroke-width="1.4">' +
      '<path d="M11 5.4a3.6 3.6 0 0 1 0 5.2"/>' +
      '<path d="M12.9 3.6a6.2 6.2 0 0 1 0 8.8"/>' +
    '</g>' +
    '<path class="tray-mute" d="M11 5.5l4 5M15 5.5l-4 5" fill="none" ' +
      'stroke="currentColor" stroke-width="1.4"/>' +
  '</svg>';

function buildSoundToggle() {
  const slot = document.querySelector(".tray-icon");
  if (!slot) return;

  const btn = el("button", "tray-sound");
  btn.type = "button";
  btn.innerHTML = SPEAKER;            // a constant in this file, no input
  slot.replaceWith(btn);

  sound.onChange(function (on) {
    btn.classList.toggle("is-muted", !on);
    btn.title = on ? "Sound on - click to mute" : "Sound off - click to unmute";
    btn.setAttribute("aria-label", btn.title);
    btn.setAttribute("aria-pressed", String(on));
  });

  btn.addEventListener("click", function () {
    //  Toggled first, so switching sound ON is confirmed by a sound.
    //  The click is still the live gesture, which is the only thing
    //  that lets the audio context start at all.
    if (sound.toggle()) sound.play("click");
  });
}

function startClock() {
  const clockEl = document.getElementById("clock");
  function tick() {
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, "0");
    const suffix = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    clockEl.textContent = h + ":" + m + " " + suffix;
    clockEl.title = now.toDateString();
  }
  tick();
  setInterval(tick, 15000);
}


// ---------------------------------------------------------- quick launch
//  XP kept a strip of one-click shortcuts beside Start. The one thing a
//  visitor most needs to find here is the way forward to 2026, and a
//  desktop icon in a grid of fourteen is not it.
function buildQuickLaunch() {
  const bar = document.getElementById("taskbar");
  const strip = el("div", "quick-launch");

  const btn = el("button", "quick-btn");
  btn.type = "button";
  btn.title = "Travel forward to 2026";
  btn.setAttribute("aria-label", "Travel forward to 2026");
  btn.appendChild(iconImg("timemachine", 1, ""));
  btn.appendChild(el("span", "quick-label", "2026"));
  btn.addEventListener("click", function () {
    dismissTravelHint();
    launch("timemachine");
  });

  strip.appendChild(btn);
  bar.insertBefore(strip, document.getElementById("task-buttons"));
  return btn;
}

// ------------------------------------------------------- the balloon tip
//  XP popped a balloon out of the taskbar for anything it wanted you to
//  notice, so this is the period-correct way to point at something. It
//  shows once per visitor, sits bottom-left so it never collides with
//  the assistant mascot bottom-right, and goes away on its own.
const HINT_KEY = "ram06:travelHintSeen";

function hintSeen() {
  try { return localStorage.getItem(HINT_KEY) === "1"; } catch (e) { return false; }
}

function dismissTravelHint() {
  try { localStorage.setItem(HINT_KEY, "1"); } catch (e) { /* private mode */ }
  const tip = document.getElementById("travel-tip");
  if (tip) tip.remove();
  const btn = document.querySelector(".quick-btn");
  if (btn) btn.classList.remove("is-nudging");
}

function maybeShowTravelHint(btn) {
  if (hintSeen() || !btn) return;
  const reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) btn.classList.add("is-nudging");

  setTimeout(function () {
    if (hintSeen()) return;
    const tip = el("div", "tip-balloon");
    tip.id = "travel-tip";
    tip.setAttribute("role", "status");

    const close = el("button", "tip-close", "\u00D7");
    close.type = "button";
    close.setAttribute("aria-label", "Close");
    close.addEventListener("click", dismissTravelHint);
    tip.appendChild(close);

    tip.appendChild(el("strong", null, "This desktop is 2006. The work is not."));
    tip.appendChild(el("span", null,
      "Click here to travel forward and see it the way it actually looks."));

    const go = el("button", "tip-go", "Travel to 2026");
    go.type = "button";
    go.addEventListener("click", function () {
      dismissTravelHint();
      launch("timemachine");
    });
    tip.appendChild(go);

    const tail = el("i", "tip-tail");
    tip.appendChild(tail);
    document.body.appendChild(tip);

    // Point the tail at the button itself rather than at a guessed
    // offset — the Start button's width changes with the scheme and the
    // viewport, so a fixed number lands on the wrong thing.
    const btnBox = btn.getBoundingClientRect();
    const tipBox = tip.getBoundingClientRect();
    const want = btnBox.left + btnBox.width / 2 - tipBox.left - 6;
    tail.style.left = Math.max(12, Math.min(tipBox.width - 24, want)) + "px";

    // It has had its moment; do not nag.
    setTimeout(function () {
      const still = document.getElementById("travel-tip");
      if (still) still.classList.add("is-going");
      setTimeout(dismissTravelHint, 600);
    }, 14000);
  }, 3200);
}

// ----------------------------------------------------------- start menu
let menuOpen = false;

export function buildStartMenu() {
  const menu = document.getElementById("start-menu");
  menu.innerHTML = "";

  // ---- header: avatar and user name, as XP had it ----
  const header = el("div", "start-header");
  const avatar = el("div", "start-avatar");
  avatar.appendChild(iconImg("computer", 2, ""));
  header.appendChild(avatar);
  header.appendChild(el("span", "start-user", content.header.name.split(" ")[0]));
  menu.appendChild(header);

  // ---- the two columns ----
  const columns = el("div", "start-columns");

  //  Left: the programs. Right: the "places" — XP put My Documents,
  //  My Computer and Control Panel there, so the résumé sections that
  //  read as destinations go on the right and the tools on the left.
  const PLACES = ["about", "work", "projects", "resume", "contact"];

  const list = el("div", "start-list");
  const places = el("div", "start-places");

  desktopIcons.forEach(function (def) {
    const item = el("button", "start-item");
    item.type = "button";
    item.appendChild(iconImg(def.icon, 2, ""));
    item.appendChild(el("span", null, def.label));
    item.addEventListener("click", function () {
      closeStartMenu();
      launch(def.app);
    });
    (PLACES.indexOf(def.app) !== -1 ? places : list).appendChild(item);
  });

  const sep = el("div", "start-sep");
  places.appendChild(sep);

  startLinks.forEach(function (link) {
    const a = el("a", "start-item");
    a.href = link.href;
    if (link.href.indexOf("http") === 0) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    a.appendChild(iconImg("envelope", 2, ""));
    a.appendChild(el("span", null, link.label));
    a.addEventListener("click", closeStartMenu);
    places.appendChild(a);
  });

  columns.appendChild(list);
  columns.appendChild(places);
  menu.appendChild(columns);

  // ---- footer: XP had Log Off and Turn Off Computer ----
  const footer = el("div", "start-footer");
  const off = el("button", "start-foot-btn");
  off.type = "button";
  off.appendChild(el("span", "start-foot-icon"));
  off.appendChild(el("span", null, "Travel Forward"));
  off.addEventListener("click", function () {
    closeStartMenu();
    launch("timemachine");
  });
  footer.appendChild(off);
  menu.appendChild(footer);

  // The 98 build had a rotated brand strip. XP has nothing like it, but
  // other code may still look for the node, so it is kept and hidden.
  const spine = el("div", "start-spine");
  spine.setAttribute("aria-hidden", "true");
  spine.textContent = startMenuSpine;
  menu.appendChild(spine);

  document.addEventListener("click", function (e) {
    if (!menuOpen) return;
    if (e.target.closest("#start-menu") || e.target.closest("#start-button")) return;
    closeStartMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuOpen) closeStartMenu();
  });
}

function toggleStartMenu() { menuOpen ? closeStartMenu() : openStartMenu(); }

function openStartMenu() {
  menuOpen = true;
  document.getElementById("start-menu").hidden = false;
  document.getElementById("start-button").classList.add("is-pressed");
  document.getElementById("start-button").setAttribute("aria-expanded", "true");
}

function closeStartMenu() {
  menuOpen = false;
  document.getElementById("start-menu").hidden = true;
  document.getElementById("start-button").classList.remove("is-pressed");
  document.getElementById("start-button").setAttribute("aria-expanded", "false");
}

// ----------------------------------------------------------- boot screen
export function runBoot(ms, onDone) {
  const boot = document.getElementById("boot");
  const bar = document.getElementById("boot-bar-fill");
  const nameEl = document.getElementById("boot-name");
  const roleEl = document.getElementById("boot-role");

  nameEl.textContent = content.header.name;
  roleEl.textContent = content.header.tagline.split("|")[0].trim();

  let finished = false;
  function finish(delay) {
    if (finished) return;
    finished = true;
    document.removeEventListener("keydown", skip);
    boot.removeEventListener("click", skip);
    boot.classList.add("is-done");
    setTimeout(function () {
      boot.hidden = true;
      onDone();
    }, delay);
  }

  // Driven by a timer rather than requestAnimationFrame: rAF is paused
  // in a background tab, which would leave a visitor who opened this in
  // a new tab staring at a frozen boot screen when they switch to it.
  const started = Date.now();
  const timer = setInterval(function () {
    if (finished) { clearInterval(timer); return; }
    const t = Math.min(1, (Date.now() - started) / ms);
    bar.style.width = Math.round(t * 100) + "%";
    if (t >= 1) { clearInterval(timer); finish(320); }
  }, 60);

  // Any key or click skips the boot.
  function skip() {
    bar.style.width = "100%";
    finish(180);
  }
  document.addEventListener("keydown", skip);
  boot.addEventListener("click", skip);
}
