// =====================================================================
//  POINTER — the inverting spotlight.
//
//  A white disc with mix-blend-mode: difference. White differenced
//  against any colour returns that colour's inverse, so the disc shows
//  the NEGATIVE of whatever it passes over: cream becomes ink, ink
//  becomes cream, and the giant display type reads in reverse as the
//  disc crosses it.
//
//  That is the site's own idea rather than an effect bolted on: the page
//  is built from an ink/cream inversion between acts, and the cursor is
//  a small moving act of the same kind. It also means one element is
//  correct everywhere, with no need to know which ground it is over.
//
//  The disc lags. A tiny dot rides the exact pointer position, because
//  without it you cannot aim at a link — the lag that makes the disc
//  feel good is the same lag that would make it useless.
//
//  This file previously also drew a word highlight and a trail of tool
//  names. Both were removed: the highlight read as a slab over display
//  type, and the trail competed with the typography.
// =====================================================================

import { scene as CFG } from "../config/scene.js";

export function createPointer() {
  const C = CFG.cursor;
  const reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // A pointer that cannot hover — a touchscreen — has no cursor to
  // replace, and hiding the native one there would strand people.
  const canHover = window.matchMedia &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (reduceMotion || !canHover) {
    return { enabled: false, dispose: function () {} };
  }

  document.body.classList.add("has-pointer");

  const spot = document.createElement("div");
  spot.className = "cursor-spot";
  spot.setAttribute("aria-hidden", "true");
  spot.style.setProperty("--size", C.size + "px");
  // Appended to BODY, deliberately, not to a wrapper layer.
  //
  // mix-blend-mode blends an element with what is painted beneath it in
  // its own stacking context. The old #tools layer was positioned with a
  // z-index, which creates a stacking context — so the disc was isolated
  // inside it, had nothing underneath to invert, and vanished. Sitting
  // directly on the body it blends against the whole page.
  document.body.appendChild(spot);

  let dot = null;
  if (C.dot > 0) {
    dot = document.createElement("div");
    dot.className = "cursor-dot";
    dot.setAttribute("aria-hidden", "true");
    dot.style.setProperty("--dot", C.dot + "px");
    document.body.appendChild(dot);   // same reason as the disc
  }

  let px = -100, py = -100;    // live pointer
  let rx = -100, ry = -100;    // eased ring
  let dirty = false;

  function onMove(e) {
    px = e.clientX; py = e.clientY;
    dirty = true;
  }
  window.addEventListener("pointermove", onMove, { passive: true });

  // Re-test after a scroll: the pointer has not moved but what is under
  // it has, so a stale hover state would linger on nothing.
  function onScroll() { dirty = true; }
  window.addEventListener("scroll", onScroll, { passive: true });

  function frame() {
    rx += (px - rx) * C.ease;
    ry += (py - ry) * C.ease;
    spot.style.transform =
      "translate3d(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px,0) " +
      "translate3d(-50%,-50%,0)";

    // The dot is not eased — it is the honest pointer position.
    if (dot) {
      dot.style.transform =
        "translate3d(" + px.toFixed(1) + "px," + py.toFixed(1) + "px,0) " +
        "translate3d(-50%,-50%,0)";
    }

    if (dirty) {
      dirty = false;
      const el = document.elementFromPoint(px, py);
      spot.classList.toggle("is-link", !!(el && el.closest("a, button, [data-hover]")));
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Pressing in shrinks the disc — a physical tell that the click landed.
  function onDown() { spot.classList.add("is-down"); }
  function onUp() { spot.classList.remove("is-down"); }
  window.addEventListener("pointerdown", onDown, { passive: true });
  window.addEventListener("pointerup", onUp, { passive: true });

  // Leaving the window should not leave a ring stranded at the edge.
  function onLeave() { spot.classList.add("is-away"); if (dot) dot.classList.add("is-away"); }
  function onEnter() { spot.classList.remove("is-away"); if (dot) dot.classList.remove("is-away"); }
  document.addEventListener("pointerleave", onLeave);
  document.addEventListener("pointerenter", onEnter);

  return {
    enabled: true,
    dispose: function () {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      document.body.classList.remove("has-pointer");
      spot.remove();
      if (dot) dot.remove();
    }
  };
}
