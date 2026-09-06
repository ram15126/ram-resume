// =====================================================================
//  SCENE — motion and palette. Plain numbers and hexes.
//
//  There is no WebGL on this site any more. The cursor effect is real
//  HTML text, and the reference it is modelled on has no canvas either.
// =====================================================================

export const scene = {
  // ---- Palette ----------------------------------------------------
  //  Two colours. That restraint is most of the effect — the reference
  //  has no accent colour and no grey scale, and adding either is the
  //  fastest way to lose the look.
  colours: {
    ink:      "#191919",   // the dark acts
    cream:    "#FBF4E6",   // the light act
    inkDim:   "rgba(25, 25, 25, 0.58)",
    creamDim: "rgba(251, 244, 230, 0.62)",
    rule:     "rgba(25, 25, 25, 0.16)",
    ruleDark: "rgba(251, 244, 230, 0.18)"
  },

  // ---- Smooth scroll -------------------------------------------------
  //  The inertial feel. Lower `lerp` = heavier, longer glide.
  //  Disabled outright under prefers-reduced-motion.
  scroll: {
    lerp:      0.085,
    wheelMult: 1.0,
    maxDelta:  120        // clamp a violent trackpad flick
  },

  // ---- The cursor ----------------------------------------------------
  //  An inverting spotlight. The disc is white with mix-blend-mode
  //  difference, so it shows the negative of whatever it passes over —
  //  cream turns to ink and ink to cream. That is the site's own idea:
  //  the page is built on an ink/cream inversion between acts, and the
  //  cursor is a small moving act of the same kind.
  //
  //  The disc lags behind the pointer, so a tiny dot rides the exact
  //  position — without it you lose the precision to aim at a link.
  cursor: {
    size:      104,   // px across, at rest
    sizeLink:  168,   // over a link or button
    sizeDown:   76,   // while the mouse is held down
    ease:     0.17,   // 0 = frozen, 1 = no lag. Lower is heavier.
    dot:         6    // the exact-position dot. 0 removes it.
  },

  // ---- Reveals -------------------------------------------------------
  reveal: {
    threshold: 0.18,     // how much of a block must be in view
    stagger:    70       // ms between children of the same block
  },

  // ---- Arrival warp (played once when you land from 1998) ------------
  warpMs: 2400
};
