// =====================================================================
//  WINDOW MANAGER — open, focus, drag, resize, minimise, maximise,
//  close. Everything else in the OS talks to this file.
// =====================================================================

import { iconUrl } from "./iconart.js";
import { sound } from "../lib/sound.js";

const windows = new Map();   // id -> window record
let zTop = 10;
let seq = 0;
const listeners = new Set();

export function onWindowsChanged(fn) {
  listeners.add(fn);
  return function off() { listeners.delete(fn); };
}
function announce() {
  listeners.forEach(function (fn) { fn(listWindows()); });
}

export function listWindows() {
  return Array.from(windows.values()).map(function (w) {
    return { id: w.id, title: w.title, icon: w.icon, minimised: w.minimised, focused: w.focused };
  });
}

function desktopBounds() {
  const surface = document.getElementById("desktop");
  return {
    w: surface.clientWidth,
    h: surface.clientHeight
  };
}

/** Cascade each new window down and right so they never stack exactly. */
function nextPosition(width, height) {
  const b = desktopBounds();
  const step = 26;
  const n = seq % 7;
  let x = Math.round(b.w * 0.5 - width * 0.5) + (n - 3) * step;
  let y = Math.max(8, Math.round(b.h * 0.42 - height * 0.5)) + (n - 3) * step;
  x = Math.max(6, Math.min(x, b.w - width - 6));
  y = Math.max(6, Math.min(y, Math.max(6, b.h - height - 6)));
  return { x: x, y: y };
}

export function focusWindow(id) {
  const rec = windows.get(id);
  if (!rec) return;
  windows.forEach(function (w) {
    w.focused = false;
    w.el.classList.remove("is-focused");
  });
  rec.focused = true;
  rec.minimised = false;
  rec.el.classList.add("is-focused");
  rec.el.hidden = false;
  zTop += 1;
  rec.el.style.zIndex = String(zTop);
  announce();
}

export function minimiseWindow(id) {
  const rec = windows.get(id);
  if (!rec) return;
  sound.play("minimise");
  rec.minimised = true;
  rec.focused = false;
  rec.el.hidden = true;
  rec.el.classList.remove("is-focused");
  // Focus whatever is still visible and highest.
  let best = null;
  windows.forEach(function (w) {
    if (w.minimised) return;
    if (!best || Number(w.el.style.zIndex || 0) > Number(best.el.style.zIndex || 0)) best = w;
  });
  if (best) focusWindow(best.id); else announce();
}

export function toggleMaximise(id) {
  const rec = windows.get(id);
  if (!rec) return;
  sound.play(rec.maximised ? "minimise" : "maximise");
  if (rec.maximised) {
    rec.maximised = false;
    rec.el.classList.remove("is-maximised");
    Object.assign(rec.el.style, rec.restore);
  } else {
    rec.restore = {
      left: rec.el.style.left,
      top: rec.el.style.top,
      width: rec.el.style.width,
      height: rec.el.style.height
    };
    rec.maximised = true;
    rec.el.classList.add("is-maximised");
    rec.el.style.left = "0px";
    rec.el.style.top = "0px";
    rec.el.style.width = "100%";
    rec.el.style.height = "100%";
  }
  focusWindow(id);
}

export function closeWindow(id) {
  const rec = windows.get(id);
  if (!rec) return;
  sound.play("close");
  if (typeof rec.onClose === "function") rec.onClose();
  rec.el.remove();
  windows.delete(id);
  let best = null;
  windows.forEach(function (w) {
    if (w.minimised) return;
    if (!best || Number(w.el.style.zIndex || 0) > Number(best.el.style.zIndex || 0)) best = w;
  });
  if (best) focusWindow(best.id); else announce();
}

export function isOpen(id) { return windows.has(id); }

function makeTitlebarButton(glyph, label, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "titlebar-btn";
  b.setAttribute("aria-label", label);
  b.title = label;
  b.innerHTML = '<span class="glyph glyph-' + glyph + '" aria-hidden="true"></span>';
  b.addEventListener("click", function (e) {
    e.stopPropagation();
    onClick();
  });
  b.addEventListener("mousedown", function (e) { e.stopPropagation(); });
  return b;
}

/** Make a titlebar drag the window around. */
function attachDrag(rec, handle) {
  let startX = 0, startY = 0, originX = 0, originY = 0, dragging = false;

  function down(e) {
    if (rec.maximised) return;
    if (e.button !== undefined && e.button !== 0) return;
    const point = e.touches ? e.touches[0] : e;
    dragging = true;
    startX = point.clientX;
    startY = point.clientY;
    originX = rec.el.offsetLeft;
    originY = rec.el.offsetTop;
    focusWindow(rec.id);
    document.body.classList.add("is-dragging");
    e.preventDefault();
  }

  function move(e) {
    if (!dragging) return;
    const point = e.touches ? e.touches[0] : e;
    const b = desktopBounds();
    let x = originX + (point.clientX - startX);
    let y = originY + (point.clientY - startY);
    // Keep at least a strip of titlebar reachable.
    x = Math.max(-rec.el.offsetWidth + 90, Math.min(x, b.w - 60));
    y = Math.max(0, Math.min(y, b.h - 24));
    rec.el.style.left = x + "px";
    rec.el.style.top = y + "px";
  }

  function up() {
    dragging = false;
    document.body.classList.remove("is-dragging");
  }

  handle.addEventListener("mousedown", down);
  handle.addEventListener("touchstart", down, { passive: false });
  window.addEventListener("mousemove", move);
  window.addEventListener("touchmove", move, { passive: false });
  window.addEventListener("mouseup", up);
  window.addEventListener("touchend", up);
  handle.addEventListener("dblclick", function () { toggleMaximise(rec.id); });
}

/** The bottom-right grip that resizes the window. */
function attachResize(rec, grip) {
  let startX = 0, startY = 0, startW = 0, startH = 0, sizing = false;

  function down(e) {
    if (rec.maximised) return;
    const point = e.touches ? e.touches[0] : e;
    sizing = true;
    startX = point.clientX;
    startY = point.clientY;
    startW = rec.el.offsetWidth;
    startH = rec.el.offsetHeight;
    focusWindow(rec.id);
    e.preventDefault();
    e.stopPropagation();
  }
  function move(e) {
    if (!sizing) return;
    const point = e.touches ? e.touches[0] : e;
    rec.el.style.width = Math.max(rec.minWidth, startW + (point.clientX - startX)) + "px";
    rec.el.style.height = Math.max(rec.minHeight, startH + (point.clientY - startY)) + "px";
  }
  function up() { sizing = false; }

  grip.addEventListener("mousedown", down);
  grip.addEventListener("touchstart", down, { passive: false });
  window.addEventListener("mousemove", move);
  window.addEventListener("touchmove", move, { passive: false });
  window.addEventListener("mouseup", up);
  window.addEventListener("touchend", up);
}

/**
 * Open a window. If one with this id is already open, it is focused
 * instead of duplicated — same as a real taskbar.
 *
 *  opts: { id, title, icon, width, height, minWidth, minHeight,
 *          resizable, statusBar, build(bodyEl, api), onClose() }
 */
export function openWindow(opts) {
  if (windows.has(opts.id)) {
    focusWindow(opts.id);
    return windows.get(opts.id);
  }

  sound.play("open");

  const b = desktopBounds();
  const narrow = b.w < 720;
  let width = Math.min(opts.width || 520, b.w - 12);
  let height = Math.min(opts.height || 400, b.h - 12);
  if (narrow) { width = b.w - 12; height = Math.min(height, b.h - 12); }

  const el = document.createElement("section");
  el.className = "win";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-label", opts.title);
  el.style.width = width + "px";
  el.style.height = height + "px";

  const pos = nextPosition(width, height);
  el.style.left = pos.x + "px";
  el.style.top = pos.y + "px";
  seq += 1;

  // ---- title bar ----
  const bar = document.createElement("div");
  bar.className = "titlebar";

  const titleWrap = document.createElement("div");
  titleWrap.className = "titlebar-title";
  if (opts.icon) {
    const img = document.createElement("img");
    img.src = iconUrl(opts.icon, 1);
    img.alt = "";
    img.className = "titlebar-icon";
    titleWrap.appendChild(img);
  }
  const titleText = document.createElement("span");
  titleText.textContent = opts.title;
  titleWrap.appendChild(titleText);
  bar.appendChild(titleWrap);

  const btns = document.createElement("div");
  btns.className = "titlebar-buttons";
  btns.appendChild(makeTitlebarButton("min", "Minimise", function () { minimiseWindow(opts.id); }));
  if (opts.resizable !== false) {
    btns.appendChild(makeTitlebarButton("max", "Maximise", function () { toggleMaximise(opts.id); }));
  }
  btns.appendChild(makeTitlebarButton("close", "Close", function () { closeWindow(opts.id); }));
  bar.appendChild(btns);
  el.appendChild(bar);

  // ---- body ----
  const body = document.createElement("div");
  body.className = "win-body" + (opts.bodyClass ? " " + opts.bodyClass : "");
  el.appendChild(body);

  // ---- optional status bar ----
  let statusEl = null;
  if (opts.statusBar) {
    statusEl = document.createElement("div");
    statusEl.className = "statusbar";
    const cell = document.createElement("span");
    cell.className = "statusbar-cell";
    cell.textContent = typeof opts.statusBar === "string" ? opts.statusBar : "";
    statusEl.appendChild(cell);
    el.appendChild(statusEl);
  }

  const grip = document.createElement("div");
  grip.className = "resize-grip";
  grip.setAttribute("aria-hidden", "true");
  el.appendChild(grip);

  document.getElementById("windows").appendChild(el);

  const rec = {
    id: opts.id,
    title: opts.title,
    icon: opts.icon,
    el: el,
    body: body,
    minimised: false,
    maximised: false,
    focused: false,
    restore: null,
    minWidth: opts.minWidth || 280,
    minHeight: opts.minHeight || 180,
    onClose: opts.onClose
  };
  windows.set(opts.id, rec);

  const api = {
    id: opts.id,
    close: function () { closeWindow(opts.id); },
    setTitle: function (t) {
      rec.title = t;
      titleText.textContent = t;
      announce();
    },
    setStatus: function (t) { if (statusEl) statusEl.firstChild.textContent = t; },
    element: el
  };

  el.addEventListener("mousedown", function () { focusWindow(opts.id); });
  attachDrag(rec, bar);
  if (opts.resizable !== false) attachResize(rec, grip); else grip.remove();

  if (typeof opts.build === "function") opts.build(body, api);

  focusWindow(opts.id);
  if (narrow && opts.resizable !== false) toggleMaximise(opts.id);
  return rec;
}
