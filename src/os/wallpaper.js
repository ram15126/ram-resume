// =====================================================================
//  WALLPAPER — the desktop background.
//
//  Windows 98 shipped small tileable bitmaps that repeated across the
//  screen. These are drawn from code at their native pixel size and
//  then repeated the same way, with smoothing off, so they stay crisp
//  and blocky rather than blurring like a scaled photo.
//
//  Every pattern here is drawn to tile seamlessly: anything that
//  crosses an edge is also drawn wrapped round to the other side.
// =====================================================================

import { wallpapers, defaultWallpaper, paletteFor } from "../../config/theme.js";
import { currentSchemeId } from "./scheme.js";

const STORAGE_KEY = "ram98:wallpaper";

// ---------------------------------------------------------------------
//  helpers
// ---------------------------------------------------------------------

function surface(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  return { canvas: canvas, ctx: ctx };
}

// A deterministic pseudo-random, so a pattern looks identical each load.
function makeRandom(seed) {
  let s = seed >>> 0;
  return function next() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/**
 * Draw something nine times — once in place and once for each edge and
 * corner it might overhang. This is what makes a circle or a blob tile
 * seamlessly instead of being clipped at the edge of the tile.
 */
function wrapped(ctx, size, cx, cy, draw) {
  for (let ox = -1; ox <= 1; ox++) {
    for (let oy = -1; oy <= 1; oy++) {
      draw(cx + ox * size, cy + oy * size);
    }
  }
}

function disc(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ring(ctx, x, y, r, stroke, width) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width || 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

// ---------------------------------------------------------------------
//  Tile patterns. Each returns a canvas that repeats seamlessly.
// ---------------------------------------------------------------------
const tiles = {
  // A navy metal plate with rivets at the corners — the Win98 classic.
  "blue-rivets": function () {
    const s = surface(32, 32), ctx = s.ctx;
    ctx.fillStyle = "#000060";
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = "#101880";
    ctx.fillRect(1, 1, 30, 30);
    // bevel
    ctx.fillStyle = "#3040C0";
    ctx.fillRect(1, 1, 30, 1);
    ctx.fillRect(1, 1, 1, 30);
    ctx.fillStyle = "#000040";
    ctx.fillRect(1, 30, 30, 1);
    ctx.fillRect(30, 1, 1, 30);
    // rivets
    [[5, 5], [26, 5], [5, 26], [26, 26]].forEach(function (p) {
      disc(ctx, p[0], p[1], 2, "#5868D8");
      disc(ctx, p[0] - 0.5, p[1] - 0.5, 1, "#98A8F8");
    });
    return s.canvas;
  },

  // Basket weave in straw tones.
  "straw-mat": function () {
    const s = surface(16, 16), ctx = s.ctx;
    ctx.fillStyle = "#C0A870";
    ctx.fillRect(0, 0, 16, 16);
    function band(x, y, w, h, horizontal) {
      ctx.fillStyle = "#D8C494";
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = "#A08C54";
      for (let i = 0; i < (horizontal ? h : w); i += 2) {
        if (horizontal) ctx.fillRect(x, y + i, w, 1);
        else ctx.fillRect(x + i, y, 1, h);
      }
      ctx.fillStyle = "#7C6838";
      ctx.fillRect(x, y + h - 1, w, 1);
      ctx.fillRect(x + w - 1, y, 1, h);
    }
    band(0, 0, 8, 8, true);
    band(8, 8, 8, 8, true);
    band(8, 0, 8, 8, false);
    band(0, 8, 8, 8, false);
    return s.canvas;
  },

  // A grid of small bevelled tiles.
  "tiles": function () {
    const s = surface(32, 32), ctx = s.ctx;
    ctx.fillStyle = "#606878";
    ctx.fillRect(0, 0, 32, 32);
    [[0, 0], [16, 0], [0, 16], [16, 16]].forEach(function (p) {
      ctx.fillStyle = "#8C94A8";
      ctx.fillRect(p[0] + 1, p[1] + 1, 14, 14);
      ctx.fillStyle = "#B4BCD0";
      ctx.fillRect(p[0] + 1, p[1] + 1, 14, 1);
      ctx.fillRect(p[0] + 1, p[1] + 1, 1, 14);
      ctx.fillStyle = "#4C5464";
      ctx.fillRect(p[0] + 1, p[1] + 14, 14, 1);
      ctx.fillRect(p[0] + 14, p[1] + 1, 1, 14);
    });
    return s.canvas;
  },

  // Overlapping outlined circles.
  "circles": function () {
    const s = surface(32, 32), ctx = s.ctx;
    ctx.fillStyle = "#204048";
    ctx.fillRect(0, 0, 32, 32);
    [[0, 0], [16, 16], [32, 0], [0, 32], [32, 32]].forEach(function (p) {
      wrapped(ctx, 32, p[0], p[1], function (x, y) {
        ring(ctx, x, y, 11, "#48808C", 1);
        ring(ctx, x, y, 7, "#68A8B4", 1);
      });
    });
    return s.canvas;
  },

  // Fine diagonal pinstripes.
  "pinstripe": function () {
    const s = surface(8, 8), ctx = s.ctx;
    ctx.fillStyle = "#404860";
    ctx.fillRect(0, 0, 8, 8);
    ctx.fillStyle = "#6C7898";
    for (let i = 0; i < 8; i++) ctx.fillRect(i, (i * 1) % 8, 1, 1);
    for (let i = 0; i < 8; i++) ctx.fillRect(i, (i + 4) % 8, 1, 1);
    return s.canvas;
  },

  // Two-tone triangles.
  "triangles": function () {
    const s = surface(16, 16), ctx = s.ctx;
    ctx.fillStyle = "#186860";
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = "#38A090";
    for (let y = 0; y < 8; y++) ctx.fillRect(8 - y, y, y * 2, 1);
    ctx.fillStyle = "#0C4038";
    for (let y = 0; y < 8; y++) ctx.fillRect(y, 8 + y, (8 - y) * 2, 1);
    return s.canvas;
  },

  // Rolling wave lines.
  "waves": function () {
    const s = surface(32, 16), ctx = s.ctx;
    ctx.fillStyle = "#103058";
    ctx.fillRect(0, 0, 32, 16);
    for (let x = 0; x < 32; x++) {
      const y = 8 + Math.round(Math.sin((x / 32) * Math.PI * 2) * 4);
      ctx.fillStyle = "#2C6098";
      ctx.fillRect(x, y, 1, 2);
      ctx.fillStyle = "#5898D0";
      ctx.fillRect(x, y, 1, 1);
      ctx.fillStyle = "#1C4070";
      ctx.fillRect(x, (y + 8) % 16, 1, 1);
    }
    return s.canvas;
  },

  // Bubbles with a highlight.
  "bubbles": function () {
    const s = surface(32, 32), ctx = s.ctx;
    ctx.fillStyle = "#0C3050";
    ctx.fillRect(0, 0, 32, 32);
    const spots = [[7, 9, 5], [23, 6, 4], [16, 21, 6], [29, 26, 3], [3, 26, 3]];
    spots.forEach(function (p) {
      wrapped(ctx, 32, p[0], p[1], function (x, y) {
        disc(ctx, x, y, p[2], "#1C5888");
        ring(ctx, x, y, p[2], "#58A0D8", 1);
        disc(ctx, x - p[2] * 0.35, y - p[2] * 0.35, Math.max(1, p[2] * 0.22), "#B0D8F8");
      });
    });
    return s.canvas;
  },

  // Mottled stone with an embossed feel.
  "carved-stone": function () {
    const s = surface(24, 24), ctx = s.ctx;
    const rand = makeRandom(2027);
    ctx.fillStyle = "#8C8878";
    ctx.fillRect(0, 0, 24, 24);
    for (let y = 0; y < 24; y++) {
      for (let x = 0; x < 24; x++) {
        const n = rand();
        if (n > 0.82) ctx.fillStyle = "#A8A494";
        else if (n < 0.18) ctx.fillStyle = "#706C60";
        else continue;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    // a few carved pits, wrapped so they tile
    [[6, 7], [17, 15], [11, 20]].forEach(function (p) {
      wrapped(ctx, 24, p[0], p[1], function (x, y) {
        disc(ctx, x, y, 3, "#7A7668");
        ring(ctx, x, y, 3, "#5C5A50", 1);
        ring(ctx, x - 0.5, y - 0.5, 2, "#B4B0A0", 1);
      });
    });
    return s.canvas;
  },

  // Dark cross-hatched thatch.
  "black-thatch": function () {
    const s = surface(8, 8), ctx = s.ctx;
    ctx.fillStyle = "#181818";
    ctx.fillRect(0, 0, 8, 8);
    ctx.fillStyle = "#383838";
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(i, i, 1, 1);
      ctx.fillRect(i, 7 - i, 1, 1);
    }
    ctx.fillStyle = "#505050";
    ctx.fillRect(0, 0, 1, 1);
    ctx.fillRect(4, 4, 1, 1);
    return s.canvas;
  }
};

// ---------------------------------------------------------------------
//  Full-bleed scenes — one picture stretched across the desktop.
// ---------------------------------------------------------------------
const scenes = {
  // XP's default: a green hill under a big blue sky with soft cumulus.
  // Not a copy of the photograph — Microsoft owns that. This is the same
  // idea drawn from code: rolling green, deep blue, fat white clouds.
  bliss: function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    const rand = makeRandom(2006);

    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.78);
    sky.addColorStop(0, "#1E5FBF");
    sky.addColorStop(0.45, "#4E97DE");
    sky.addColorStop(1, "#A8D2F0");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    function cloud(cx, cy, scale, alpha) {
      const puffs = [[0,0,9],[8,-4,7],[16,0,8],[-8,2,6],[24,3,6],[8,4,10]];
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "#FFFFFF";
      puffs.forEach(function (pf) {
        disc(ctx, cx + pf[0]*scale, cy + pf[1]*scale, pf[2]*scale, "#FFFFFF");
      });
      ctx.globalAlpha = alpha * 0.5;
      ctx.fillStyle = "#D8E8F8";
      puffs.forEach(function (pf) {
        disc(ctx, cx + pf[0]*scale, cy + (pf[1]+3.5)*scale, pf[2]*scale*0.72, "#D8E8F8");
      });
      ctx.globalAlpha = 1;
    }
    for (let i = 0; i < 6; i++) {
      cloud(rand() * w, h * 0.10 + rand() * h * 0.34, 0.5 + rand() * 0.85, 0.75 + rand() * 0.25);
    }

    // The hill: a single soft crest rising from the left.
    const grass = ctx.createLinearGradient(0, h * 0.52, 0, h);
    grass.addColorStop(0, "#7DBE3C");
    grass.addColorStop(0.4, "#5DA82C");
    grass.addColorStop(1, "#3C7C1C");
    ctx.fillStyle = grass;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x++) {
      const t = x / w;
      const y = h * (0.70 - 0.16 * Math.sin(Math.PI * (0.15 + t * 0.72)) - 0.03 * Math.sin(t * 9));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // A lighter band along the crest, where the light catches it.
    ctx.globalAlpha = 0.30;
    ctx.strokeStyle = "#B4E06C";
    ctx.lineWidth = Math.max(2, h * 0.012);
    ctx.beginPath();
    for (let x = 0; x <= w; x++) {
      const t = x / w;
      const y = h * (0.70 - 0.16 * Math.sin(Math.PI * (0.15 + t * 0.72)) - 0.03 * Math.sin(t * 9));
      if (x === 0) ctx.moveTo(x, y + 2); else ctx.lineTo(x, y + 2);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
    return s.canvas;
  },

  // Deep blue with a soft radial lift — XP's "Azul".
  azul: function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    ctx.fillStyle = "#0A2A5E";
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w * 0.5, h * 0.55, 0, w * 0.5, h * 0.55, w * 0.75);
    g.addColorStop(0, "rgba(80,150,220,0.85)");
    g.addColorStop(0.55, "rgba(24,70,140,0.5)");
    g.addColorStop(1, "rgba(6,20,50,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "#9FD0FF";
      ctx.lineWidth = h * 0.03;
      ctx.beginPath();
      for (let x = 0; x <= w; x++) {
        const y = h * (0.4 + i * 0.16) + Math.sin(x / (w * 0.09) + i) * h * 0.05;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    return s.canvas;
  },

  // Warm amber leaf-light — XP's "Autumn".
  autumn: function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    const rand = makeRandom(77);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#6B3A08");
    g.addColorStop(0.5, "#B4620E");
    g.addColorStop(1, "#E8A32A");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const x = rand() * w, y = rand() * h;
      const r = 3 + rand() * (w * 0.03);
      ctx.globalAlpha = 0.10 + rand() * 0.18;
      disc(ctx, x, y, r, rand() > 0.5 ? "#FFD98A" : "#7A3C06");
    }
    ctx.globalAlpha = 1;
    return s.canvas;
  },

  // Cool faceted glass — XP's "Crystal".
  crystal: function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    const rand = makeRandom(1313);
    ctx.fillStyle = "#08121E";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) {
      const x = rand() * w, y = rand() * h;
      const size = w * (0.06 + rand() * 0.16);
      ctx.globalAlpha = 0.08 + rand() * 0.16;
      ctx.fillStyle = rand() > 0.5 ? "#5FD8F0" : "#2A6FA8";
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.7, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.7, y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return s.canvas;
  },

  // XP shipped photographs. These are not copies of them - Microsoft
  // owns those files. Each takes the same subject and mood and draws it
  // from code, so the site still needs no image assets at all.

  // "Ripple" - rings spreading across deep water.
  ripple: function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#052F4A");
    g.addColorStop(0.55, "#0A5C86");
    g.addColorStop(1, "#0E86AE");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.36, cy = h * 0.42;
    ctx.lineWidth = Math.max(1, h * 0.006);
    for (let i = 1; i < 26; i++) {
      const r = i * (w * 0.045);
      ctx.globalAlpha = Math.max(0, 0.34 - i * 0.011);
      ctx.strokeStyle = "#BFEDFF";
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.34, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = Math.max(0, 0.20 - i * 0.008);
      ctx.strokeStyle = "#02202F";
      ctx.beginPath();
      ctx.ellipse(cx, cy, r + h * 0.012, r * 0.34 + h * 0.004, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const sh = ctx.createLinearGradient(0, h * 0.30, w, h * 0.62);
    sh.addColorStop(0, "rgba(255,255,255,0)");
    sh.addColorStop(0.5, "rgba(200,240,255,0.22)");
    sh.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sh;
    ctx.fillRect(0, 0, w, h);
    return s.canvas;
  },

  // "Peace" - a still dawn sky with nothing in it.
  peace: function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#0B2B63");
    g.addColorStop(0.4, "#3E7AB8");
    g.addColorStop(0.72, "#9FC4DE");
    g.addColorStop(0.9, "#F0D6AE");
    g.addColorStop(1, "#F7E8C8");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    const rand = makeRandom(21);
    for (let i = 0; i < 9; i++) {
      const cy = h * (0.55 + rand() * 0.30);
      const cw = w * (0.20 + rand() * 0.45);
      const cx = rand() * w;
      ctx.globalAlpha = 0.10 + rand() * 0.16;
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.ellipse(cx, cy, cw, h * (0.012 + rand() * 0.022), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    return s.canvas;
  },

  // "Radiance" - gold light thrown up from below the horizon.
  radiance: function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    ctx.fillStyle = "#2A1402";
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.5, cy = h * 1.02;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * 1.25);
    g.addColorStop(0, "#FFE9A8");
    g.addColorStop(0.25, "#F0A628");
    g.addColorStop(0.6, "#8A3E06");
    g.addColorStop(1, "rgba(20,8,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI - Math.PI;
      ctx.globalAlpha = 0.05 + (i % 3) * 0.03;
      ctx.fillStyle = "#FFD98A";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a - 0.028) * h * 1.6, cy + Math.sin(a - 0.028) * h * 1.6);
      ctx.lineTo(cx + Math.cos(a + 0.028) * h * 1.6, cy + Math.sin(a + 0.028) * h * 1.6);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    return s.canvas;
  },

  // "Red Moon Desert" - dunes under a pale moon.
  "red-moon-desert": function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.62);
    sky.addColorStop(0, "#1A0605");
    sky.addColorStop(0.55, "#5E1508");
    sky.addColorStop(1, "#B8451A");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    const mx = w * 0.72, my = h * 0.22, mr = h * 0.085;
    const mg = ctx.createRadialGradient(mx, my, 0, mx, my, mr * 3.4);
    mg.addColorStop(0, "rgba(255,236,206,0.55)");
    mg.addColorStop(1, "rgba(255,236,206,0)");
    ctx.fillStyle = mg;
    ctx.beginPath(); ctx.arc(mx, my, mr * 3.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#FFEAC4";
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();

    const bands = [
      { y: 0.60, amp: 0.055, f: 1.6, c: "#9E3312" },
      { y: 0.72, amp: 0.045, f: 2.3, c: "#71200B" },
      { y: 0.85, amp: 0.038, f: 3.1, c: "#430F05" }
    ];
    bands.forEach(function (b) {
      ctx.fillStyle = b.c;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x++) {
        const t = x / w;
        ctx.lineTo(x, h * (b.y - b.amp * Math.sin(t * Math.PI * b.f + b.f)));
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    });
    return s.canvas;
  },

  // "Stonehenge" - trilithons against a dusk sky.
  stonehenge: function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#12193C");
    sky.addColorStop(0.45, "#4A3A6A");
    sky.addColorStop(0.78, "#C9662E");
    sky.addColorStop(1, "#F0A64A");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#0B0A14";
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x++) {
      ctx.lineTo(x, h * 0.86 + Math.sin(x / (w * 0.12)) * h * 0.008);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#0B0A14";
    [0.16, 0.40, 0.66, 0.87].forEach(function (gx, i) {
      const bw = w * (0.035 - i * 0.003);
      const bh = h * (0.30 - i * 0.03);
      const base = h * 0.87;
      ctx.fillRect(w * gx - bw * 1.6, base - bh, bw, bh);
      ctx.fillRect(w * gx + bw * 0.6, base - bh, bw, bh);
      ctx.fillRect(w * gx - bw * 1.8, base - bh - h * 0.035, bw * 3.6, h * 0.038);
    });
    return s.canvas;
  },

  // "Wind" - grass bending, seen from ground level.
  wind: function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#7FB6E8");
    sky.addColorStop(0.55, "#CFE6F5");
    sky.addColorStop(1, "#EAF4E2");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    const rand = makeRandom(9);
    const blades = Math.round(w * 0.55);
    for (let i = 0; i < blades; i++) {
      const x = rand() * w;
      const len = h * (0.22 + rand() * 0.52);
      const lean = (0.25 + rand() * 0.5) * w * 0.10;
      const dark = rand();
      ctx.strokeStyle = dark > 0.66 ? "#2E5E1A" : dark > 0.33 ? "#4C8B24" : "#7FBA38";
      ctx.globalAlpha = 0.45 + rand() * 0.5;
      ctx.lineWidth = Math.max(0.8, h * (0.002 + rand() * 0.004));
      ctx.beginPath();
      ctx.moveTo(x, h);
      ctx.quadraticCurveTo(x + lean * 0.4, h - len * 0.55, x + lean, h - len);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    return s.canvas;
  },

  // "Purple Flower" - a macro, petals radiating from a bright centre.
  "purple-flower": function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.7);
    bg.addColorStop(0, "#4A1B62");
    bg.addColorStop(1, "#140720");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const cx = w * 0.5, cy = h * 0.52, pr = Math.min(w, h) * 0.42;
    for (let i = 0; i < 12; i++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((i / 12) * Math.PI * 2);
      const pg = ctx.createLinearGradient(0, 0, 0, -pr);
      pg.addColorStop(0, "#8E3FB0");
      pg.addColorStop(0.6, "#C061D8");
      pg.addColorStop(1, "#F0BCEE");
      ctx.fillStyle = pg;
      ctx.globalAlpha = 0.88;
      ctx.beginPath();
      ctx.ellipse(0, -pr * 0.55, pr * 0.17, pr * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, pr * 0.24);
    cg.addColorStop(0, "#FFF6C8");
    cg.addColorStop(0.6, "#F2C64A");
    cg.addColorStop(1, "rgba(180,120,20,0)");
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.arc(cx, cy, pr * 0.24, 0, Math.PI * 2); ctx.fill();
    return s.canvas;
  },

  // "Vortex" - light wound into a spiral.
  vortex: function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    ctx.fillStyle = "#03141C";
    ctx.fillRect(0, 0, w, h);
    const cx = w * 0.5, cy = h * 0.5;
    ctx.globalCompositeOperation = "lighter";
    for (let arm = 0; arm < 5; arm++) {
      ctx.beginPath();
      for (let t = 0; t < 220; t++) {
        const k = t / 220;
        const ang = arm * (Math.PI * 2 / 5) + k * 4.2;
        const r = k * Math.min(w, h) * 0.62;
        const x = cx + Math.cos(ang) * r;
        const y = cy + Math.sin(ang) * r * 0.72;
        if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = arm % 2 ? "rgba(80,220,235,0.30)" : "rgba(150,240,255,0.22)";
      ctx.lineWidth = Math.max(1.5, h * 0.012);
      ctx.stroke();
    }
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.30);
    cg.addColorStop(0, "rgba(220,255,255,0.75)");
    cg.addColorStop(1, "rgba(220,255,255,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    return s.canvas;
  },

  // "Energy Blue" - the Royale look Media Center wore in 2005-06, and
  // the most specifically-2006 thing in this list.
  royale: function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#021B3C");
    g.addColorStop(0.6, "#053A70");
    g.addColorStop(1, "#02132A");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 4; i++) {
      const off = i * h * 0.045;
      const rg = ctx.createLinearGradient(0, h * 0.3, w, h * 0.8);
      rg.addColorStop(0, "rgba(60,170,235,0)");
      rg.addColorStop(0.45, "rgba(150,230,255," + (0.30 - i * 0.06) + ")");
      rg.addColorStop(1, "rgba(60,170,235,0)");
      ctx.strokeStyle = rg;
      ctx.lineWidth = h * (0.055 - i * 0.010);
      ctx.beginPath();
      ctx.moveTo(-w * 0.05, h * 0.78 + off);
      ctx.bezierCurveTo(w * 0.30, h * 0.30 + off, w * 0.66, h * 0.86 + off, w * 1.05, h * 0.24 + off);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
    return s.canvas;
  },

  clouds: function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    const rand = makeRandom(7);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#3F78E8");
    grad.addColorStop(0.55, "#5C94FC");
    grad.addColorStop(1, "#9CC8FF");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    function cloud(cx, cy, scale) {
      const puffs = [[0, 0, 7], [6, -3, 6], [12, 0, 7], [-6, 1, 5], [18, 2, 5], [6, 3, 8]];
      ctx.fillStyle = "#FFFFFF";
      puffs.forEach(function (p) {
        disc(ctx, cx + p[0] * scale, cy + p[1] * scale, p[2] * scale, "#FFFFFF");
      });
      puffs.forEach(function (p) {
        disc(ctx, cx + p[0] * scale, cy + (p[1] + 3) * scale, p[2] * scale * 0.75,
          "rgba(190,215,255,0.55)");
      });
    }
    for (let i = 0; i < 7; i++) cloud(rand() * w, 12 + rand() * (h - 40), 0.55 + rand() * 0.7);
    return s.canvas;
  },

  hills: function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#5C94FC");
    grad.addColorStop(1, "#A8D8FF");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#FCD800";
    ctx.fillRect(w - 34, 12, 14, 14);
    ctx.fillRect(w - 36, 14, 18, 10);
    [{ c: "#2E8B37", a: 7, b: 0.62, f: 17 },
     { c: "#3CB043", a: 9, b: 0.74, f: 11 },
     { c: "#00A800", a: 6, b: 0.86, f: 7 }].forEach(function (band) {
      ctx.fillStyle = band.c;
      for (let x = 0; x < w; x++) {
        const y = Math.round(h * band.b - Math.sin(x / band.f) * band.a);
        ctx.fillRect(x, y, 1, h - y);
      }
    });
    return s.canvas;
  },

  night: function (w, h) {
    const s = surface(w, h), ctx = s.ctx;
    const rand = makeRandom(41);
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#0B1026");
    grad.addColorStop(0.6, "#1B2450");
    grad.addColorStop(1, "#33306B");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = rand() > 0.75 ? "#FFFFFF" : "#B9C6FF";
      ctx.fillRect(Math.floor(rand() * w), Math.floor(rand() * h * 0.7), 1, 1);
    }
    disc(ctx, w * 0.78, h * 0.2, 9, "#F4F1DE");
    disc(ctx, w * 0.75, h * 0.18, 8, "#1B2450");
    ctx.fillStyle = "#0B1026";
    for (let x = 0; x < w; x++) {
      const y = h - 14 - Math.round(Math.sin(x / 9) * 4 + Math.sin(x / 23) * 5);
      ctx.fillRect(x, y, 1, h - y);
    }
    return s.canvas;
  }
};

// ---------------------------------------------------------------------
//  state
// ---------------------------------------------------------------------
let custom = null;         // a data URL the visitor uploaded this session
const tileCache = new Map();
const sceneCache = new Map();

function tileCanvas(id) {
  if (!tileCache.has(id)) {
    const make = tiles[id];
    tileCache.set(id, make ? make() : tiles["blue-rivets"]());
  }
  return tileCache.get(id);
}

function sceneCanvas(id, w, h) {
  const key = id + "@" + w + "x" + h;
  if (!sceneCache.has(key)) {
    const make = scenes[id];
    sceneCache.set(key, make ? make(w, h) : scenes.clouds(w, h));
  }
  return sceneCache.get(key);
}

export function listWallpapers() {
  const list = wallpapers.slice();
  if (custom) list.push({ id: "custom", name: "Custom (uploaded)", type: "image", src: custom });
  return list;
}

export function currentWallpaperId() {
  let saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { saved = null; }
  const known = listWallpapers().some(function (w) { return w.id === saved; });
  return known ? saved : defaultWallpaper;
}

export function wallpaperName(id) {
  const found = listWallpapers().find(function (w) { return w.id === id; });
  return found ? found.name : id;
}

/** Paint the desktop with one wallpaper definition. */
function paint(def) {
  const root = document.getElementById("desktop");
  if (!root) return;
  const desktopColour = paletteFor(currentSchemeId()).desktop;

  root.style.backgroundColor = desktopColour;
  root.style.backgroundRepeat = "repeat";
  root.style.backgroundPosition = "top left";
  root.style.imageRendering = "pixelated";

  if (!def || def.type === "none") {
    root.style.backgroundImage = "none";
    return;
  }
  if (def.type === "image" && def.src) {
    root.style.backgroundImage = 'url("' + def.src + '")';
    root.style.backgroundRepeat = "no-repeat";
    root.style.backgroundSize = "cover";
    root.style.backgroundPosition = "center";
    root.style.imageRendering = "auto";
    return;
  }
  if (def.type === "scene") {
    // Drawn large and left smooth. The 98 build rendered these at
    // 200x125 and stretched them with image-rendering:pixelated, which
    // was right for a tiled 1998 pattern and very wrong for an XP
    // photographic wallpaper - it came out blocky and soft at once.
    const canvas = sceneCanvas(def.id, 1280, 800);
    root.style.backgroundImage = 'url("' + canvas.toDataURL() + '")';
    root.style.backgroundRepeat = "no-repeat";
    root.style.backgroundSize = "cover";
    root.style.backgroundPosition = "center";
    root.style.imageRendering = "auto";
    return;
  }
  // tile
  const canvas = tileCanvas(def.id);
  root.style.backgroundImage = 'url("' + canvas.toDataURL() + '")';
  // Repeat at twice native size: the patterns were drawn for 640x480
  // screens and look like static at today's pixel densities otherwise.
  root.style.backgroundSize = (canvas.width * 2) + "px " + (canvas.height * 2) + "px";
}

export function applyWallpaper(id) {
  const def = listWallpapers().find(function (w) { return w.id === id; });
  paint(def);
  try { localStorage.setItem(STORAGE_KEY, id); } catch (e) { /* private mode */ }
}

/** Repaint without changing the choice — used when the scheme changes,
 *  because "(None)" shows the scheme's own desktop colour. */
export function refreshWallpaper() {
  const def = listWallpapers().find(function (w) { return w.id === currentWallpaperId(); });
  paint(def);
}

export function setCustomWallpaper(dataUrl) {
  custom = dataUrl;
  applyWallpaper("custom");
}

/** A small preview image for Display Properties. */
export function wallpaperPreview(def) {
  if (def.type === "image") return def.src;
  if (def.type === "none") {
    const s = surface(64, 40);
    s.ctx.fillStyle = paletteFor(currentSchemeId()).desktop;
    s.ctx.fillRect(0, 0, 64, 40);
    return s.canvas.toDataURL();
  }
  if (def.type === "scene") return sceneCanvas(def.id, 160, 100).toDataURL();

  const tile = tileCanvas(def.id);
  const s = surface(64, 40);
  const pattern = s.ctx.createPattern(tile, "repeat");
  s.ctx.fillStyle = pattern;
  s.ctx.fillRect(0, 0, 64, 40);
  return s.canvas.toDataURL();
}

export function initWallpaper() {
  refreshWallpaper();
}
