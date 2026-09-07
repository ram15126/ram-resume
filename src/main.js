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
import { consumeArrival } from "./lib/arrival.js";
import { sound } from "./lib/sound.js";

const SEEN_KEY = "ram98:booted";

function startDesktop() {
  //  openOnLoad opens a window, and a window opening makes its own
  //  sound. Nothing has been clicked yet, so the browser will refuse to
  //  start the audio context and that sound is dropped rather than
  //  fired at someone who did not ask for it — which is the behaviour
  //  we want, and the reason the startup chime waits for a gesture too.
  (behaviour.openOnLoad || []).forEach(function (name) { launch(name); });
}

/*  The startup chime, on the first thing the visitor touches.
 *
 *  It cannot play on load: browsers will not start an audio context
 *  outside a gesture, and a site that greets a recruiter with a fanfare
 *  they did not ask for is a site they close. So it waits, plays once,
 *  and from then on the desktop just has a voice.
 */
function armStartupChime() {
  let armed = true;
  function first() {
    if (!armed) return;
    armed = false;
    sound.unlock();
    sound.play("startup");
    window.removeEventListener("pointerdown", first, true);
    window.removeEventListener("keydown", first, true);
  }
  //  Capture phase, so it fires even when the handler underneath stops
  //  the event — and before the click sound that same gesture triggers.
  window.addEventListener("pointerdown", first, true);
  window.addEventListener("keydown", first, true);
}

function init() {
  document.title = content.header.name + " — Desktop";

  initScheme();
  initWallpaper();
  // "(None)" shows the scheme's own desktop colour, so a scheme change
  // has to repaint the desktop behind the wallpaper.
  onSchemeChange(refreshWallpaper);

  armStartupChime();

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
  const arriving = consumeArrival(2006);
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
