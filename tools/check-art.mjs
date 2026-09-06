// Every pixel-art row must be exactly as wide as the map is tall.
// A short row silently shifts every pixel after it, and the result looks
// like a rendering bug rather than the typo it is.
import { iconMaps } from "../src/os/iconart.js";
import { mascotFrames, MASCOT_SIZE } from "../src/os/mascotart.js";

let bad = 0;
function check(label, map, size) {
  const rows = map.length;
  if (rows !== size) { console.log("  FAIL " + label + ": " + rows + " rows, expected " + size); bad++; }
  map.forEach((row, i) => {
    if (row.length !== size) {
      console.log("  FAIL " + label + " row " + i + ": " + row.length + " chars, expected " + size);
      console.log("        " + JSON.stringify(row));
      bad++;
    }
  });
}
console.log("ICONS (16x16)");
Object.keys(iconMaps).forEach(n => check(n, iconMaps[n], 16));
console.log("MASCOT (" + MASCOT_SIZE + "x" + MASCOT_SIZE + ")");
Object.keys(mascotFrames).forEach(n => check(n, mascotFrames[n], MASCOT_SIZE));
console.log(bad ? "\n" + bad + " problem(s)" : "\nAll maps are square and complete.");
process.exit(bad ? 1 : 0);
