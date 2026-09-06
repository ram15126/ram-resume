// =====================================================================
//  CHECK ART — validates the letter-map pixel art.
//
//  A short row silently shifts every pixel after it, and the result
//  looks like a rendering bug rather than the typo it is.
//
//  Only the mascot is covered. The desktop icons moved to canvas
//  drawing functions when the interface was reworked, and those need a
//  real canvas to exercise — they are verified in the browser instead.
// =====================================================================

import { mascotFrames, MASCOT_SIZE } from "../src/os/mascotart.js";
import { iconNames } from "../src/os/iconart.js";

let bad = 0;

console.log("MASCOT (" + MASCOT_SIZE + "x" + MASCOT_SIZE + " letter maps)");
for (const [name, map] of Object.entries(mascotFrames)) {
  if (map.length !== MASCOT_SIZE) {
    console.log("  FAIL " + name + ": " + map.length + " rows, expected " + MASCOT_SIZE);
    bad++;
  }
  map.forEach(function (row, i) {
    if (row.length !== MASCOT_SIZE) {
      console.log("  FAIL " + name + " row " + i + ": " + row.length +
                  " chars, expected " + MASCOT_SIZE);
      console.log("        " + JSON.stringify(row));
      bad++;
    }
  });
}
if (!bad) console.log("  " + Object.keys(mascotFrames).length + " frames, all square.");

console.log("\nICONS (canvas-drawn)");
console.log("  " + iconNames.length + " registered: " + iconNames.join(", "));

console.log(bad ? "\n" + bad + " problem(s)" : "\nArt OK.");
process.exit(bad ? 1 : 0);
