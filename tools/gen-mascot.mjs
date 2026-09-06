// =====================================================================
//  GEN MASCOT — draws the mascot frames and prints them as letter maps.
//
//      node tools/gen-mascot.mjs > /dev/null   (inspect)
//      node tools/gen-mascot.mjs --write       (update mascotart.js)
//
//  The maps are generated rather than typed. Hand-counting 24 characters
//  across 24 rows produced asymmetric pupils, a smile the head border
//  painted over, and a waving arm drawn straight through the robot's
//  own face. Drawing with coordinates makes those impossible.
// =====================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const N = 24;
const HEAD = { x0: 3, x1: 20, y0: 2, y1: 16 };   // arms must clear this

const blank = () => Array.from({ length: N }, () => Array(N).fill("."));
const put = (g, x, y, c) => { if (x >= 0 && x < N && y >= 0 && y < N) g[y][x] = c; };
const hline = (g, y, x0, x1, c) => { for (let x = x0; x <= x1; x++) put(g, x, y, c); };
const vline = (g, x, y0, y1, c) => { for (let y = y0; y <= y1; y++) put(g, x, y, c); };
function rect(g, x0, y0, x1, y1, c, fill = true) {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (fill || y === y0 || y === y1 || x === x0 || x === x1) put(g, x, y, c);
  }
}

function build({ eyes = "open", wave = false } = {}) {
  const g = blank();

  // antenna
  put(g, 11, 0, "R"); put(g, 12, 0, "R");
  put(g, 11, 1, "K"); put(g, 12, 1, "K");

  // head shell, bevelled like every other surface on this desktop
  rect(g, HEAD.x0, HEAD.y0, HEAD.x1, HEAD.y1, "K", false);
  rect(g, 4, 3, 19, 15, "W");
  rect(g, 5, 4, 18, 14, "L");
  rect(g, 6, 5, 17, 13, "K");
  rect(g, 7, 6, 16, 12, "C");

  // eyes — one mirrored offset, so they cannot drift apart
  if (eyes === "open") {
    for (const ex of [8, 13]) { rect(g, ex, 7, ex + 2, 9, "W"); put(g, ex + 1, 8, "K"); }
  } else {
    hline(g, 8, 8, 10, "K"); hline(g, 8, 13, 15, "K");
  }

  // Smile as a three-row arc. Two rows read as a flat bar at this size,
  // which looks like a frown — and an unfriendly mascot is worse than
  // no mascot.
  put(g, 8, 10, "K");  put(g, 15, 10, "K");
  put(g, 9, 11, "K");  put(g, 14, 11, "K");
  hline(g, 12, 10, 13, "K");

  // body — deliberately chunky. A small base under a large head reads
  // as a television on a stand rather than a character.
  hline(g, 17, 10, 13, "K");
  rect(g, 6, 18, 17, 23, "K", false);
  rect(g, 7, 19, 16, 22, "R");
  hline(g, 22, 7, 16, "A");
  hline(g, 20, 9, 14, "A");        // a seam, so it is not a flat slab

  // arms
  vline(g, 5, 19, 21, "K"); put(g, 4, 21, "K");
  if (!wave) {
    vline(g, 18, 19, 21, "K"); put(g, 19, 21, "K");
  } else {
    // Raised beside the head, never across it: the shell owns x3..x20,
    // so the arm lives at x21..x22 where nothing can collide with it.
    // Shaft from the shoulder to head height, then a wider hand. Running
    // it the full height instead reads as a black slab parked beside the
    // robot rather than as an arm.
    vline(g, 21, 13, 18, "K");     // forearm
    vline(g, 22, 13, 18, "K");
    rect(g, 20, 9, 23, 11, "K");   // hand, wider than the arm
    rect(g, 21, 10, 22, 10, "L");  // a lighter palm, so it is not one slab
  }
  return g.map((r) => r.join(""));
}

const frames = { IDLE: build(), BLINK: build({ eyes: "closed" }), WAVE: build({ wave: true }) };

// Fail loudly rather than emit a map that renders as a glitch.
for (const [name, rows] of Object.entries(frames)) {
  if (rows.length !== N) throw new Error(name + " has " + rows.length + " rows");
  rows.forEach((r, i) => {
    if (r.length !== N) throw new Error(name + " row " + i + " is " + r.length + " chars");
  });
  // An arm must not paint over the face.
  if (name === "WAVE") {
    for (let y = HEAD.y0; y <= HEAD.y1; y++) {
      for (let x = HEAD.x0 + 1; x < HEAD.x1; x++) {
        if (rows[y][x] !== frames.IDLE[y][x]) {
          throw new Error("WAVE alters the head interior at " + x + "," + y);
        }
      }
    }
  }
}

const block = Object.entries(frames)
  .map(([n, rows]) => "const " + n + " = [\n" +
    rows.map((r) => '  "' + r + '"').join(",\n") + "\n];")
  .join("\n\n");

if (process.argv.includes("--write")) {
  const HERE = path.dirname(fileURLToPath(import.meta.url));
  const file = path.join(HERE, "..", "src", "os", "mascotart.js");
  const src = fs.readFileSync(file, "utf8");
  const start = src.indexOf("const IDLE = [");
  const end = src.indexOf("export const mascotFrames");
  fs.writeFileSync(file, src.slice(0, start) + block + "\n\n" + src.slice(end));
  console.error("Wrote " + file);
} else {
  console.error("Validated. Pass --write to update src/os/mascotart.js");
}
console.log(block);
