// =====================================================================
//  GALLERY — a paginated case-study viewer.
//
//  If an item has no image yet, the app draws a generated plate in its
//  place, using an ordered-dither pattern so the window never looks
//  broken or empty while you gather real screenshots.
//
//  To use a real image: put the file in assets/gallery/ and set its
//  path as `src` on that item in config/desktop.js.
// =====================================================================

import { galleryItems } from "../../config/desktop.js";
import { fonts, brand } from "../../config/theme.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// 4x4 Bayer matrix — the classic ordered-dither threshold pattern.
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

/** A generated stand-in plate: dithered gradient, index number, title. */
function placeholderPlate(item, n, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  // Dithered diagonal gradient in the hero red.
  const img = ctx.createImageData(width, height);
  const data = img.data;
  // Fixed brand red rather than the current scheme's accent: the plate
  // is cached as a data URL, so a scheme switch would leave it stale.
  const hex = brand.logo.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const t = ((x / width) * 0.65 + (y / height) * 0.35);
      const level = Math.round(t * 16);
      const on = level > BAYER[y % 4][x % 4];
      const i = (y * width + x) * 4;
      if (on) { data[i] = r; data[i + 1] = g; data[i + 2] = b; }
      else { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; }
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // A big index number, knocked out of the pattern.
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold " + Math.round(height * 0.44) + "px " + fonts.ui;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(n).padStart(2, "0"), width / 2, height / 2 - height * 0.05);

  // A solid strip so the note stays readable over the dither.
  const stripH = 22;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, height - stripH, width, stripH);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, height - stripH, width, 1);
  ctx.fillStyle = "#5A5A5A";
  ctx.font = "11px " + fonts.ui;
  ctx.fillText("image not added yet", width / 2, height - stripH / 2);

  return canvas.toDataURL();
}

export const galleryApp = {
  id: "gallery",
  title: "Gallery",
  icon: "camera",
  width: 620,
  height: 500,
  minWidth: 340,
  minHeight: 360,
  statusBar: " ",
  build: function (body, api) {
    body.classList.add("pad", "col");

    let index = 0;

    const stage = el("div", "well gallery-stage");
    const plate = document.createElement("img");
    plate.className = "gallery-plate";
    plate.alt = "";
    stage.appendChild(plate);
    body.appendChild(stage);

    const caption = el("div", "gallery-caption");
    body.appendChild(caption);

    const nav = el("div", "toolbar gallery-nav");
    const prev = el("button", "btn", "◀ Prev");
    prev.type = "button";
    const next = el("button", "btn", "Next ▶");
    next.type = "button";

    const pager = el("div", "gallery-pager");
    const pageBtns = galleryItems.map(function (_, i) {
      const b = el("button", "page-btn", String(i + 1));
      b.type = "button";
      b.addEventListener("click", function () { show(i); });
      pager.appendChild(b);
      return b;
    });

    nav.appendChild(prev);
    nav.appendChild(next);
    nav.appendChild(pager);
    body.appendChild(nav);

    function show(i) {
      index = (i + galleryItems.length) % galleryItems.length;
      const item = galleryItems[index];

      if (item.src) {
        plate.src = item.src;
        plate.alt = item.title;
        plate.classList.remove("is-placeholder");
        plate.onerror = function () {
          plate.onerror = null;
          plate.src = placeholderPlate(item, index + 1, 320, 200);
          plate.classList.add("is-placeholder");
        };
      } else {
        plate.src = placeholderPlate(item, index + 1, 320, 200);
        plate.alt = item.title + " — image not added yet";
        plate.classList.add("is-placeholder");
      }

      caption.innerHTML = "";
      caption.appendChild(el("h2", "gallery-title", item.title));
      caption.appendChild(el("p", "gallery-meta", item.meta));
      caption.appendChild(el("p", "gallery-text", item.caption));

      pageBtns.forEach(function (b, n) { b.classList.toggle("is-active", n === index); });
      api.setStatus("Item " + (index + 1) + " of " + galleryItems.length);
    }

    prev.addEventListener("click", function () { show(index - 1); });
    next.addEventListener("click", function () { show(index + 1); });

    body.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });

    show(0);
  }
};
