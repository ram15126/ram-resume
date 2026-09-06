// =====================================================================
//  BOOT — apply the colour scheme, build the shell, run the boot screen.
// =====================================================================

import { behaviour } from "../config/theme.js";
import { content } from "../config/content.js";
import { buildDesktopIcons, buildTaskbar, buildStartMenu, runBoot } from "./os/shell.js";
import { buildMascot } from "./os/mascot.js";
import { initScheme, onSchemeChange } from "./os/scheme.js";
import { initWallpaper, refreshWallpaper } from "./os/wallpaper.js";
import { launch } from "./apps/registry.js";

const SEEN_KEY = "ram98:booted";

function startDesktop() {
  (behaviour.openOnLoad || []).forEach(function (name) { launch(name); });
}

function init() {
  document.title = content.header.name + " — Desktop";

  initScheme();
  initWallpaper();
  // "(None)" shows the scheme's own desktop colour, so a scheme change
  // has to repaint the desktop behind the wallpaper.
  onSchemeChange(refreshWallpaper);

  buildDesktopIcons();
  buildStartMenu();
  buildTaskbar();
  buildMascot();

  let seen = false;
  try { seen = localStorage.getItem(SEEN_KEY) === "1"; } catch (e) { seen = false; }
  try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) { /* private mode */ }

  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Coming back from 2026: play the CRT opening back up, and skip the
  // boot screen — they have already been here.
  const arriving = new URLSearchParams(location.search).get("arrive") === "2006";
  if (arriving && !reduceMotion) {
    document.body.classList.add("tm-arriving");
    setTimeout(function () { document.body.classList.remove("tm-arriving"); }, 900);
  }

  if (arriving || (behaviour.skipBootOnReturn && seen) || reduceMotion) {
    document.getElementById("boot").hidden = true;
    startDesktop();
  } else {
    runBoot(behaviour.bootMs, startDesktop);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
