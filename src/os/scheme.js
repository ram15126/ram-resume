// =====================================================================
//  SCHEME — applies a colour scheme to the page at runtime by writing
//  every palette value out as a CSS custom property.
//
//  Windows 98 let you change the whole system palette from Display
//  Properties → Appearance, so this OS does too. The choice is kept in
//  the visitor's own browser.
// =====================================================================

import { schemes, defaultScheme, paletteFor, fonts, brand } from "../../config/theme.js";

const STORAGE_KEY = "ram98:scheme";
const listeners = new Set();

/** camelCase -> --kebab-case, so `titleFrom` becomes `--title-from`. */
function cssName(key) {
  return "--" + key.replace(/[A-Z]/g, function (c) { return "-" + c.toLowerCase(); });
}

export function listSchemes() { return schemes; }

export function currentSchemeId() {
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { saved = null; }
  const known = schemes.some(function (s) { return s.id === saved; });
  return known ? saved : defaultScheme;
}

export function schemeName(id) {
  const found = schemes.find(function (s) { return s.id === id; });
  return found ? found.name : id;
}

/** Subscribe to scheme changes. Returns an unsubscribe function. */
export function onSchemeChange(fn) {
  listeners.add(fn);
  return function off() { listeners.delete(fn); };
}

/**
 * Write a palette onto an element as custom properties. Used both for
 * the whole page and for the little preview pane in Display Properties,
 * which shows a scheme without committing to it.
 */
export function writePalette(el, palette) {
  Object.keys(palette).forEach(function (key) {
    el.style.setProperty(cssName(key), palette[key]);
  });
}

export function applyScheme(id, remember) {
  const chosen = schemes.some(function (s) { return s.id === id; }) ? id : defaultScheme;
  writePalette(document.documentElement, paletteFor(chosen));
  document.documentElement.dataset.scheme = chosen;

  // Keep the browser UI (address bar on mobile) in step with the chrome.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", paletteFor(chosen).face);

  if (remember !== false) {
    try { localStorage.setItem(STORAGE_KEY, chosen); } catch (e) { /* private mode */ }
  }
  listeners.forEach(function (fn) { fn(chosen); });
  return chosen;
}

/** Fonts and the fixed brand colours — set once, never themed. */
export function applyStaticTheme() {
  const root = document.documentElement;
  root.style.setProperty("--font-ui", fonts.ui);
  root.style.setProperty("--font-mono", fonts.mono);
  root.style.setProperty("--font-pixel", fonts.pixel);
  root.style.setProperty("--brand-logo", brand.logo);
  root.style.setProperty("--brand-logo-dark", brand.logoDark);
}

export function initScheme() {
  applyStaticTheme();
  applyScheme(currentSchemeId(), false);
}
