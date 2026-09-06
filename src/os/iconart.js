// =====================================================================
//  ICON ART — Windows XP style icons, drawn with canvas gradients.
//
//  The 98 build used 16x16 letter maps: one character per pixel, hard
//  edges, sixteen flat colours. That is exactly right for 1998 and
//  exactly wrong for XP, whose icons were 48px, glossy, gradient-filled
//  and soft-shadowed. Scaling pixel art up makes it look MORE like 1998,
//  not less — so these are redrawn rather than resized.
//
//  Every icon is a function that paints into a 48x48 design space. The
//  renderer scales that space to whatever size is asked for, so the same
//  drawing serves the 16px title bar and the 48px About window without
//  going soft.
//
//  Three conventions do most of the work, and they are what read as XP:
//    - a vertical gradient on every surface, light at the top
//    - a gloss highlight over the upper half, fading out
//    - a soft drop shadow, offset down
// =====================================================================

import { brand } from "../../config/theme.js";

const BOX = 48;                 // the design space every icon draws into

// ---------------------------------------------------------------------
//  drawing helpers
// ---------------------------------------------------------------------

/** Rounded-rectangle path. */
function rr(ctx, x, y, w, h, r) {
  const m = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + m, y);
  ctx.arcTo(x + w, y, x + w, y + h, m);
  ctx.arcTo(x + w, y + h, x, y + h, m);
  ctx.arcTo(x, y + h, x, y, m);
  ctx.arcTo(x, y, x + w, y, m);
  ctx.closePath();
}

/** Vertical gradient between two points, from a list of [stop, colour]. */
function lg(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(function (s) { g.addColorStop(s[0], s[1]); });
  return g;
}

function shadowOn(ctx, blur, dy, alpha) {
  ctx.shadowColor = "rgba(0,0,0," + alpha + ")";
  ctx.shadowBlur = blur;
  ctx.shadowOffsetY = dy;
}
function shadowOff(ctx) {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

/**
 * Lay a gloss over the top of whatever path was last built. Call it
 * straight after filling a shape — it re-uses the current path as a
 * clip, so the highlight follows the shape rather than being a
 * rectangle sitting on top of it.
 */
function gloss(ctx, x, y, w, h, strength) {
  ctx.save();
  ctx.clip();
  ctx.fillStyle = lg(ctx, x, y, x, y + h * 0.55, [
    [0, "rgba(255,255,255," + strength + ")"],
    [1, "rgba(255,255,255,0)"]
  ]);
  ctx.fillRect(x, y, w, h * 0.55);
  ctx.restore();
}

/** A sheet of paper — the base for several icons. */
function page(ctx, small) {
  const x = 10, y = 4, w = 28, h = 40, fold = 9;
  shadowOn(ctx, small ? 1 : 2.5, 1.5, 0.4);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w - fold, y);
  ctx.lineTo(x + w, y + fold);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fillStyle = lg(ctx, x, y, x, y + h, [[0, "#FFFFFF"], [1, "#DCE3EC"]]);
  ctx.fill();
  shadowOff(ctx);

  ctx.strokeStyle = "#8FA3B8";
  ctx.lineWidth = 1;
  ctx.stroke();

  // the turned corner
  ctx.beginPath();
  ctx.moveTo(x + w - fold, y);
  ctx.lineTo(x + w, y + fold);
  ctx.lineTo(x + w - fold, y + fold);
  ctx.closePath();
  ctx.fillStyle = "#C3D0DE";
  ctx.fill();
  ctx.strokeStyle = "#8FA3B8";
  ctx.stroke();

  return { x: x, y: y, w: w, h: h };
}

/** The ruled lines inside a page. */
function ruleLines(ctx, p, count, colour) {
  ctx.fillStyle = colour || "#9BB0C6";
  for (let i = 0; i < count; i++) {
    const ly = p.y + 15 + i * 5;
    const lw = (i % 3 === 2) ? p.w * 0.45 : p.w * 0.70;
    ctx.fillRect(p.x + 4, ly, lw, 1.6);
  }
}

/** A monitor body, shared by My Computer and Display Properties. */
function monitor(ctx, small, screenPainter) {
  // stand
  ctx.fillStyle = lg(ctx, 0, 36, 0, 45, [[0, "#D9DEE6"], [1, "#8A93A2"]]);
  ctx.beginPath();
  ctx.moveTo(19, 34); ctx.lineTo(29, 34); ctx.lineTo(32, 44); ctx.lineTo(16, 44);
  ctx.closePath();
  ctx.fill();
  rr(ctx, 12, 42, 24, 4, 2);
  ctx.fillStyle = lg(ctx, 0, 42, 0, 46, [[0, "#E7EBF1"], [1, "#7E8796"]]);
  ctx.fill();

  // case
  shadowOn(ctx, small ? 1 : 3, 1.5, 0.42);
  rr(ctx, 3, 5, 42, 31, 4);
  ctx.fillStyle = lg(ctx, 0, 5, 0, 36, [[0, "#F4F6F9"], [0.5, "#D5DBE4"], [1, "#A8B1BF"]]);
  ctx.fill();
  shadowOff(ctx);
  ctx.strokeStyle = "#79828F";
  ctx.lineWidth = 1;
  ctx.stroke();

  // screen recess
  rr(ctx, 6, 8, 36, 23, 2);
  ctx.fillStyle = "#2B3340";
  ctx.fill();

  // the screen itself
  rr(ctx, 7, 9, 34, 21, 1.5);
  ctx.save();
  ctx.clip();
  screenPainter(ctx);
  if (!small) {
    // diagonal glass sheen
    ctx.fillStyle = "rgba(255,255,255,0.20)";
    ctx.beginPath();
    ctx.moveTo(7, 30); ctx.lineTo(24, 9); ctx.lineTo(34, 9); ctx.lineTo(11, 30);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------------
//  the icons
// ---------------------------------------------------------------------
const ICONS = {

  computer: function (ctx, small) {
    monitor(ctx, small, function (c) {
      c.fillStyle = lg(c, 0, 9, 0, 30, [[0, "#4FA8F5"], [0.5, "#1E6FD0"], [1, "#0B3E86"]]);
      c.fillRect(7, 9, 34, 21);
    });
  },

  display: function (ctx, small) {
    monitor(ctx, small, function (c) {
      c.fillStyle = "#12335F";
      c.fillRect(7, 9, 34, 21);
      // four swatches, so it reads as "appearance" not "my computer"
      const cols = ["#E0453C", "#4FA8F5", "#7BC043", "#F2C230"];
      cols.forEach(function (col, i) {
        c.fillStyle = col;
        rr(c, 11 + (i % 2) * 13, 12 + Math.floor(i / 2) * 9, 11, 7, 1.5);
        c.fill();
      });
    });
  },

  folder: function (ctx, small) {
    shadowOn(ctx, small ? 1 : 2.5, 1.5, 0.4);
    // back sheet with the tab
    ctx.beginPath();
    ctx.moveTo(4, 14);
    ctx.lineTo(16, 14);
    ctx.lineTo(20, 10);
    ctx.lineTo(44, 10);
    ctx.lineTo(44, 38);
    ctx.lineTo(4, 38);
    ctx.closePath();
    ctx.fillStyle = lg(ctx, 0, 10, 0, 38, [[0, "#FFD98A"], [1, "#E0A030"]]);
    ctx.fill();
    shadowOff(ctx);
    ctx.strokeStyle = "#B47C18";
    ctx.lineWidth = 1;
    ctx.stroke();

    // the front panel, opening toward you
    ctx.beginPath();
    ctx.moveTo(7, 19);
    ctx.lineTo(45, 19);
    ctx.lineTo(41, 39);
    ctx.lineTo(3, 39);
    ctx.closePath();
    ctx.fillStyle = lg(ctx, 0, 19, 0, 39, [[0, "#FFE9B0"], [0.45, "#FFC64A"], [1, "#E39A18"]]);
    ctx.fill();
    if (!small) gloss(ctx, 3, 19, 42, 20, 0.45);
    ctx.strokeStyle = "#B47C18";
    ctx.stroke();
  },

  document: function (ctx, small) {
    const p = page(ctx, small);
    ruleLines(ctx, p, small ? 3 : 5);
  },

  notepad: function (ctx, small) {
    shadowOn(ctx, small ? 1 : 2.5, 1.5, 0.4);
    rr(ctx, 9, 7, 30, 37, 2);
    ctx.fillStyle = lg(ctx, 0, 7, 0, 44, [[0, "#FFFFFF"], [1, "#E4E9F0"]]);
    ctx.fill();
    shadowOff(ctx);
    ctx.strokeStyle = "#8FA3B8";
    ctx.lineWidth = 1;
    ctx.stroke();

    // red margin and blue rules
    ctx.fillStyle = "#E0655C";
    ctx.fillRect(15, 9, 1.4, 33);
    ctx.fillStyle = "#A8C0DA";
    for (let i = 0; i < (small ? 3 : 6); i++) {
      ctx.fillRect(17, 14 + i * 5, 19, 1.4);
    }
    // spiral binding
    ctx.strokeStyle = "#7E8796";
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      const sx = 13 + i * 7;
      ctx.beginPath();
      ctx.arc(sx, 7, 2.6, Math.PI * 0.15, Math.PI * 0.85, true);
      ctx.stroke();
    }
  },

  pdf: function (ctx, small) {
    const p = page(ctx, small);
    ruleLines(ctx, p, small ? 2 : 3);
    // the red badge across the lower half
    shadowOn(ctx, small ? 0 : 2, 1, 0.35);
    rr(ctx, 6, 27, 27, 13, 2.5);
    ctx.fillStyle = lg(ctx, 0, 27, 0, 40, [[0, "#E8564E"], [1, "#B0140E"]]);
    ctx.fill();
    shadowOff(ctx);
    if (!small) {
      gloss(ctx, 6, 27, 27, 13, 0.4);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 9px Tahoma, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("PDF", 19.5, 34);
    }
  },

  chart: function (ctx, small) {
    const p = page(ctx, small);
    const bars = [
      { x: 15, h: 11, a: "#7BC043", b: "#3F8A18" },
      { x: 22, h: 18, a: "#4FA8F5", b: "#1257A8" },
      { x: 29, h: 24, a: "#F0645C", b: "#B0140E" }
    ];
    bars.forEach(function (b) {
      const top = 38 - b.h;
      rr(ctx, b.x, top, 5.5, b.h, 1);
      ctx.fillStyle = lg(ctx, 0, top, 0, 38, [[0, b.a], [1, b.b]]);
      ctx.fill();
      if (!small) gloss(ctx, b.x, top, 5.5, b.h, 0.5);
    });
    ctx.fillStyle = "#8FA3B8";
    ctx.fillRect(13, 38, 24, 1.4);
  },

  book: function (ctx, small) {
    shadowOn(ctx, small ? 1 : 2.5, 1.5, 0.42);
    rr(ctx, 7, 7, 34, 34, 2);
    ctx.fillStyle = lg(ctx, 0, 7, 0, 41, [[0, brand.logo], [1, brand.logoDark]]);
    ctx.fill();
    shadowOff(ctx);
    if (!small) gloss(ctx, 7, 7, 34, 34, 0.35);

    // spine
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(7, 7, 5, 34);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(12, 7, 1.5, 34);

    // page block down the outer edge
    ctx.fillStyle = lg(ctx, 36, 0, 41, 0, [[0, "#FFFFFF"], [1, "#C9CFD8"]]);
    ctx.fillRect(36, 10, 5, 28);
    if (!small) {
      ctx.fillStyle = "rgba(0,0,0,0.14)";
      for (let i = 0; i < 5; i++) ctx.fillRect(36, 12 + i * 5, 5, 1);
    }
  },

  envelope: function (ctx, small) {
    shadowOn(ctx, small ? 1 : 2.5, 1.5, 0.4);
    rr(ctx, 4, 13, 40, 24, 2);
    ctx.fillStyle = lg(ctx, 0, 13, 0, 37, [[0, "#FFFFFF"], [1, "#D9E0EA"]]);
    ctx.fill();
    shadowOff(ctx);
    ctx.strokeStyle = "#8FA3B8";
    ctx.lineWidth = 1;
    ctx.stroke();

    // the flap, folded down
    ctx.beginPath();
    ctx.moveTo(4, 14);
    ctx.lineTo(24, 29);
    ctx.lineTo(44, 14);
    ctx.lineTo(44, 13);
    ctx.lineTo(4, 13);
    ctx.closePath();
    ctx.fillStyle = lg(ctx, 0, 13, 0, 29, [[0, "#F2F5F9"], [1, "#B9C5D4"]]);
    ctx.fill();
    ctx.strokeStyle = "#8FA3B8";
    ctx.stroke();

    if (!small) {
      // the two creases running back to the corners
      ctx.strokeStyle = "#C2CDD9";
      ctx.beginPath();
      ctx.moveTo(4, 36); ctx.lineTo(19, 25);
      ctx.moveTo(44, 36); ctx.lineTo(29, 25);
      ctx.stroke();
    }
  },

  camera: function (ctx, small) {
    // viewfinder hump
    rr(ctx, 17, 9, 14, 7, 2);
    ctx.fillStyle = lg(ctx, 0, 9, 0, 16, [[0, "#6E7885"], [1, "#3C444F"]]);
    ctx.fill();

    // body
    shadowOn(ctx, small ? 1 : 3, 1.5, 0.42);
    rr(ctx, 4, 14, 40, 25, 4);
    ctx.fillStyle = lg(ctx, 0, 14, 0, 39, [[0, "#8A94A2"], [0.5, "#5A6472"], [1, "#333B45"]]);
    ctx.fill();
    shadowOff(ctx);
    if (!small) gloss(ctx, 4, 14, 40, 25, 0.30);

    // lens
    ctx.beginPath();
    ctx.arc(24, 27, 10, 0, Math.PI * 2);
    ctx.fillStyle = lg(ctx, 0, 17, 0, 37, [[0, "#D3D9E1"], [1, "#767F8B"]]);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(24, 27, 7.5, 0, Math.PI * 2);
    ctx.fillStyle = lg(ctx, 0, 20, 0, 35, [[0, "#26456E"], [1, "#08111F"]]);
    ctx.fill();
    if (!small) {
      ctx.beginPath();
      ctx.arc(21.5, 24.5, 2.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fill();
      // flash
      rr(ctx, 34, 18, 6, 4, 1);
      ctx.fillStyle = "#FFE9A8";
      ctx.fill();
    }
  },

  paint: function (ctx, small) {
    // palette
    shadowOn(ctx, small ? 1 : 2.5, 1.5, 0.4);
    ctx.beginPath();
    ctx.ellipse(23, 28, 19, 15, -0.18, 0, Math.PI * 2);
    ctx.fillStyle = lg(ctx, 0, 13, 0, 43, [[0, "#F6E2BF"], [1, "#C79A5E"]]);
    ctx.fill();
    shadowOff(ctx);
    ctx.strokeStyle = "#9A7238";
    ctx.lineWidth = 1;
    ctx.stroke();

    // thumb hole
    ctx.beginPath();
    ctx.ellipse(30, 33, 4.5, 3.4, -0.18, 0, Math.PI * 2);
    ctx.fillStyle = "#8A6530";
    ctx.fill();

    // paint wells
    const dots = [
      [14, 22, "#E0453C"], [22, 19, "#4FA8F5"],
      [31, 22, "#F2C230"], [14, 32, "#7BC043"]
    ];
    dots.forEach(function (d) {
      ctx.beginPath();
      ctx.arc(d[0], d[1], small ? 3 : 3.6, 0, Math.PI * 2);
      ctx.fillStyle = d[2];
      ctx.fill();
      if (!small) {
        ctx.beginPath();
        ctx.arc(d[0] - 1, d[1] - 1, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fill();
      }
    });

    if (!small) {
      // brush laid across it
      ctx.save();
      ctx.translate(34, 12);
      ctx.rotate(0.72);
      ctx.fillStyle = lg(ctx, 0, 0, 0, 5, [[0, "#D8A860"], [1, "#8A6530"]]);
      ctx.fillRect(0, 0, 20, 4.5);
      ctx.fillStyle = "#C9CFD8";
      ctx.fillRect(18, -0.5, 5, 5.5);
      ctx.fillStyle = "#3C444F";
      ctx.fillRect(23, 0.5, 5, 3.5);
      ctx.restore();
    }
  },

  magnifier: function (ctx, small) {
    // handle first, so the ring sits on top of it
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = lg(ctx, 28, 28, 44, 44, [[0, "#8A94A2"], [1, "#3C444F"]]);
    ctx.lineWidth = small ? 5 : 6.5;
    ctx.beginPath();
    ctx.moveTo(29, 29); ctx.lineTo(42, 42);
    ctx.stroke();
    ctx.restore();

    // glass
    shadowOn(ctx, small ? 1 : 3, 1.5, 0.4);
    ctx.beginPath();
    ctx.arc(20, 20, 14, 0, Math.PI * 2);
    ctx.fillStyle = lg(ctx, 0, 6, 0, 34, [[0, "#EAF4FF"], [1, "#9EC4E8"]]);
    ctx.fill();
    shadowOff(ctx);

    // rim
    ctx.beginPath();
    ctx.arc(20, 20, 14, 0, Math.PI * 2);
    ctx.strokeStyle = lg(ctx, 0, 6, 0, 34, [[0, "#E4E9F0"], [1, "#6B7480"]]);
    ctx.lineWidth = small ? 3 : 4;
    ctx.stroke();

    if (!small) {
      ctx.beginPath();
      ctx.arc(16, 15, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.fill();
    }
  },

  timemachine: function (ctx, small) {
    // outer glow
    if (!small) {
      const g = ctx.createRadialGradient(24, 24, 4, 24, 24, 22);
      g.addColorStop(0, "rgba(120,200,255,0.55)");
      g.addColorStop(1, "rgba(120,200,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, BOX, BOX);
    }
    // ring
    ctx.beginPath();
    ctx.arc(24, 24, 17, 0, Math.PI * 2);
    ctx.strokeStyle = lg(ctx, 0, 7, 0, 41, [[0, "#DFF3FF"], [0.5, "#3EA8E8"], [1, "#0B4E82"]]);
    ctx.lineWidth = small ? 4 : 5.5;
    ctx.stroke();

    // face
    ctx.beginPath();
    ctx.arc(24, 24, 13, 0, Math.PI * 2);
    ctx.fillStyle = lg(ctx, 0, 11, 0, 37, [[0, "#123152"], [1, "#03111F"]]);
    ctx.fill();

    // hands, pointing forward in time
    ctx.strokeStyle = "#EAF6FF";
    ctx.lineCap = "round";
    ctx.lineWidth = small ? 1.8 : 2.2;
    ctx.beginPath();
    ctx.moveTo(24, 24); ctx.lineTo(24, 15);
    ctx.moveTo(24, 24); ctx.lineTo(31, 27);
    ctx.stroke();

    if (!small) {
      ctx.beginPath();
      ctx.arc(24, 24, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = brand.logo;
      ctx.fill();
      // a highlight arc on the ring
      ctx.beginPath();
      ctx.arc(24, 24, 17, Math.PI * 1.15, Math.PI * 1.65);
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  },

  assistant: function (ctx, small) {
    // antenna
    ctx.strokeStyle = "#7E8796";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(24, 10); ctx.lineTo(24, 5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(24, 4, 2.6, 0, Math.PI * 2);
    ctx.fillStyle = brand.logo;
    ctx.fill();

    // head
    shadowOn(ctx, small ? 1 : 3, 1.5, 0.42);
    rr(ctx, 7, 10, 34, 30, 7);
    ctx.fillStyle = lg(ctx, 0, 10, 0, 40, [[0, "#F4F6F9"], [0.5, "#D5DBE4"], [1, "#9AA3B1"]]);
    ctx.fill();
    shadowOff(ctx);
    ctx.strokeStyle = "#79828F";
    ctx.lineWidth = 1;
    ctx.stroke();
    if (!small) gloss(ctx, 7, 10, 34, 30, 0.5);

    // visor
    rr(ctx, 11, 16, 26, 14, 5);
    ctx.fillStyle = lg(ctx, 0, 16, 0, 30, [[0, "#1D4E86"], [1, "#04182E"]]);
    ctx.fill();

    // eyes
    [17.5, 30.5].forEach(function (ex) {
      ctx.beginPath();
      ctx.arc(ex, 23, small ? 2.4 : 3, 0, Math.PI * 2);
      ctx.fillStyle = "#6FE3FF";
      ctx.fill();
    });
    if (!small) {
      ctx.fillStyle = "rgba(255,255,255,0.28)";
      ctx.beginPath();
      ctx.moveTo(11, 30); ctx.lineTo(23, 16); ctx.lineTo(30, 16); ctx.lineTo(15, 30);
      ctx.closePath();
      ctx.fill();
      // mouth grille
      ctx.fillStyle = "#7E8796";
      for (let i = 0; i < 3; i++) ctx.fillRect(19 + i * 4, 34, 2.6, 2.6);
    }
  },

  /** The Start button badge: four panes, skewed, in the brand red. */
  start: function (ctx, small) {
    const panes = [
      [7, 8, brand.logo], [26, 6, brand.logoDark],
      [7, 26, brand.logoDark], [26, 24, brand.logo]
    ];
    ctx.save();
    ctx.transform(1, 0, -0.12, 1, 4, 0);
    panes.forEach(function (p) {
      // Flat colour first, then the gloss painted over the same path.
      rr(ctx, p[0], p[1], 16, 15, 2);
      ctx.fillStyle = p[2];
      ctx.fill();
      if (!small) {
        ctx.fillStyle = lg(ctx, 0, p[1], 0, p[1] + 15, [
          [0, "rgba(255,255,255,0.55)"],
          [0.5, "rgba(255,255,255,0)"],
          [1, "rgba(0,0,0,0.25)"]
        ]);
        ctx.fill();
      }
    });
    ctx.restore();
  }
};

// ---------------------------------------------------------------------
//  renderer
// ---------------------------------------------------------------------
const cache = new Map();

/**
 * Render one icon to a data URL.
 *
 * `scale` keeps the meaning it had in the 98 build — the icon comes out
 * 16 * scale CSS pixels — so every existing caller still works. The
 * canvas itself is drawn at twice that, and the <img> is given an
 * explicit size, so the result stays sharp on a high-density screen.
 */
export function iconUrl(name, scale) {
  const size = 16 * (scale || 1);
  const key = name + "@" + size;
  if (cache.has(key)) return cache.get(key);

  const draw = ICONS[name];
  if (!draw) return "";

  const dpr = 2;
  const canvas = document.createElement("canvas");
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  // Map the 48-unit design space onto whatever size was asked for.
  const k = (size * dpr) / BOX;
  ctx.scale(k, k);

  // Below about 20px there is no room for gloss, grilles or lettering —
  // real icon sets shipped a separate simplified small version, and this
  // is the same idea in one function.
  draw(ctx, size <= 20);

  const url = canvas.toDataURL();
  cache.set(key, url);
  return url;
}

/** An <img> for an icon, sized correctly, ready to drop into the DOM. */
export function iconImg(name, scale, alt) {
  const size = 16 * (scale || 1);
  const img = document.createElement("img");
  img.src = iconUrl(name, scale);
  img.alt = alt || "";
  img.width = size;
  img.height = size;
  // The class name is a leftover from the 98 build, when these really
  // were pixel art. Kept because several stylesheets target it.
  img.className = "pixel-icon";
  img.draggable = false;
  return img;
}

/** The names available, so a config typo can be caught early. */
export const iconNames = Object.keys(ICONS);
