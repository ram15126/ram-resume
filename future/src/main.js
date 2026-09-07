// =====================================================================
//  MAIN — build the page, smooth the scroll, reveal on enter.
//
//  No WebGL and no three.js any more. The reference this is modelled on
//  has no canvas either; its whole feel comes from inertial scrolling,
//  reveal timing and typography, and those are the things worth copying.
// =====================================================================

import { voice } from "../config/voice.js";
import { scene as CFG } from "../config/scene.js";
import { consumeArrival } from "../../src/lib/arrival.js";
import { sound } from "../../src/lib/sound.js";
import { buildPage } from "./sections.js";
import { createPointer } from "./pointer.js";
import { mountAssistant } from "./assistant.js";

const root      = document.getElementById("page");
const warpEl    = document.getElementById("warp");
const progress  = document.getElementById("progress-fill");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The whole page is a scroll position, so a browser restoring the last
// one on reload would drop you into the middle with the hero gone.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";

document.title = voice.name + " — " + voice.fullName;

// ---------------------------------------------------------------- build
const page = buildPage(root);

// ----------------------------------------------------------- the trail
const trail = createPointer();
document.body.classList.toggle("has-trail", trail.enabled);

// ------------------------------------------------------- the assistant
const bot = mountAssistant();

// ------------------------------------------------------- smooth scroll
//  A short inertial smoother: the page is translated by a lerped scroll
//  value while the document keeps its real height, so native scrolling,
//  the scrollbar, keyboard paging and anchor links all still work. This
//  is the "expensive" feel — nothing else here creates it.
//
//  It is switched off entirely under prefers-reduced-motion, where the
//  browser's own scrolling is exactly what someone asked for.
let smooth = null;

function createSmoothScroll() {
  // Smooths the NATIVE scroll position instead of translating the page.
  //
  // The first version pinned #page and moved it with a transform. That
  // works visually, but it breaks `position: sticky` outright — a
  // transformed, fixed ancestor gives sticky nothing to stick to. The
  // reference relies on sticky section headers, so the transform
  // approach had to go. Lenis does it this way for the same reason.
  //
  // Wheel is intercepted and integrated into a target; every frame the
  // real scroll position eases toward it. Keyboard, touch, scrollbar
  // dragging and anchor jumps are left alone and simply re-sync the
  // target, so nothing that normally scrolls a page stops working.
  let current = window.scrollY;
  let target = window.scrollY;
  let lastWritten = -1;
  let raf = 0;

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function onWheel(e) {
    if (e.ctrlKey) return;                        // pinch-zoom
    if (e.target.closest("[data-native-scroll]")) return;
    e.preventDefault();
    const d = Math.max(-CFG.scroll.maxDelta,
              Math.min(CFG.scroll.maxDelta, e.deltaY)) * CFG.scroll.wheelMult;
    target = Math.max(0, Math.min(maxScroll(), target + d));
  }

  function frame() {
    // Adopt any scroll that came from somewhere else — an anchor jump,
    // the keyboard, a scrollbar drag, a programmatic scrollTo.
    //
    // This compares the real position against what we last wrote,
    // rather than trusting a "was that us?" flag. Scroll events are
    // ASYNCHRONOUS: a flag set in the handler can arrive a frame late,
    // and in that window the loop happily drags the page back to where
    // it was. That bug ate every programmatic scroll on the page,
    // including the nav's own anchor links.
    if (lastWritten >= 0 && Math.abs(window.scrollY - lastWritten) > 1) {
      current = target = window.scrollY;
    }

    const delta = target - current;
    current = Math.abs(delta) > 0.08 ? current + delta * CFG.scroll.lerp : target;

    if (Math.round(current) !== Math.round(window.scrollY)) {
      window.scrollTo(0, current);
    }
    lastWritten = window.scrollY;

    raf = requestAnimationFrame(frame);
  }

  function start() {
    document.body.classList.add("is-smooth");
    window.addEventListener("wheel", onWheel, { passive: false });
    raf = requestAnimationFrame(frame);
  }

  /** Test hook: land somewhere and settle immediately, without a frame. */
  function jump(y) {
    target = current = y;
    window.scrollTo(0, y);
    lastWritten = window.scrollY;
  }

  return { start: start, jump: jump, at: function () { return window.scrollY; } };
}

if (!reduceMotion) {
  smooth = createSmoothScroll();
  smooth.start();
}

// ---------------------------------------------------------- the reveals
//  IntersectionObserver rather than scroll maths: it fires once per
//  block, costs nothing while idle, and cannot drift out of sync with
//  the smoothed scroll position the way a scroll-progress calculation
//  would.
const revealed = new WeakSet();

function markRevealed(node) {
  if (revealed.has(node)) return;
  revealed.add(node);
  node.classList.add("is-in");

  const kids = node.querySelectorAll("[data-reveal-child]");
  kids.forEach(function (kid, i) {
    kid.style.setProperty("--delay", (i * CFG.reveal.stagger) + "ms");
    kid.classList.add("is-in");
  });
}

if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        markRevealed(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: CFG.reveal.threshold, rootMargin: "0px 0px -8% 0px" });

  root.querySelectorAll("[data-reveal]").forEach(function (n) { io.observe(n); });
} else {
  // No observer, or reduced motion: everything is simply already there.
  root.querySelectorAll("[data-reveal]").forEach(markRevealed);
}

// The hero is above the fold and must never wait for an observer.
requestAnimationFrame(function () { document.body.classList.add("is-ready"); });

// ------------------------------------------------------- scroll progress
function updateProgress() {
  const max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
  const y = window.scrollY;
  progress.style.transform = "scaleX(" + Math.min(1, Math.max(0, y / max)).toFixed(4) + ")";
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// Past the first screen the persistent CTA badge appears. It is hidden
// over the hero because it collided with the sub-line there, and the
// hero already has its own call to action.
function updateScrolled() {
  document.body.classList.toggle("is-scrolled", window.scrollY > window.innerHeight * 0.6);
}
window.addEventListener("scroll", updateScrolled, { passive: true });
updateScrolled();

// ----------------------------------------------------------- the warp
//  Played once, on arrival from 1998. Landing here directly skips it —
//  nobody should sit through a transition they did not trigger.
const arriving = consumeArrival(2026) && !reduceMotion;

if (arriving) {
  //  The other half of the journey. The 2006 desktop plays this as it
  //  departs; without it here the landing is silent under a full-screen
  //  animation, which reads as the sound having broken.
  sound.play("warp");
  document.body.classList.add("is-warping");
  warpEl.hidden = false;
  const started = performance.now();

  // Driven by a timer, not requestAnimationFrame: rAF is paused in a
  // background tab, and this overlay hides the page while it plays.
  // Someone who arrives and switches away must not come back to a
  // permanently blank site.
  const timer = setInterval(function () {
    const k = Math.min(1, (performance.now() - started) / CFG.warpMs);
    warpEl.style.setProperty("--warp", (k < 0.4 ? k / 0.4 : 1 - (k - 0.4) / 0.6).toFixed(3));
    if (k >= 1) finish();
  }, 40);

  function finish() {
    clearInterval(timer);
    document.body.classList.remove("is-warping");
    warpEl.hidden = true;
  }
  setTimeout(finish, CFG.warpMs + 700);   // belt and braces
} else {
  warpEl.hidden = true;
}

// ---------------------------------------------------- anchors & rewind
document.addEventListener("click", function (e) {
  const opener = e.target.closest("[data-open-ask]");
  if (opener) { e.preventDefault(); bot.open(); return; }

  const rewind = e.target.closest("[data-rewind]");
  if (rewind && !reduceMotion) {
    e.preventDefault();
    document.body.classList.add("is-rewinding");
    setTimeout(function () { location.href = rewind.getAttribute("href"); }, 820);
    return;
  }

  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const id = anchor.getAttribute("href").slice(1);
  const target = document.getElementById(id);
  if (!target) return;
  e.preventDefault();
  // offsetTop is right even while smoothing, because the document keeps
  // its real height and only the visual transform is offset.
  window.scrollTo({ top: target.offsetTop, behavior: reduceMotion ? "auto" : "smooth" });
});

// -------------------------------------------------------- the test hook
//  Same idea as the platformer's window.__game. Forces layout without
//  scrolling or waiting for a frame, which is the only way to check this
//  page in a backgrounded or headless browser where rAF never fires.
window.__ram = {
  revealAll: function () {
    root.querySelectorAll("[data-reveal]").forEach(markRevealed);
    return root.querySelectorAll(".is-in").length;
  },
  sections: function () {
    return [...root.querySelectorAll(".act")].map(function (s) {
      return { id: s.id, top: s.offsetTop, h: s.offsetHeight, act: s.className };
    });
  },
  goTo: function (id) {
    const t = document.getElementById(id);
    if (!t) return -1;
    if (smooth) smooth.jump(t.offsetTop); else window.scrollTo(0, t.offsetTop);
    updateProgress();
    return t.offsetTop;
  },
  scrollable: function () {
    return document.documentElement.scrollHeight - window.innerHeight;
  },
  trail: trail.enabled,
  bot: bot
};
