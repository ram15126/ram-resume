// =====================================================================
//  MASCOT ART — the desk robot that sits in the corner and opens the
//  assistant. 24x24 letter maps, same technique as the icons.
//
//  Three frames: idle, blink and wave. Movement is what makes a corner
//  character get noticed, and a blink every few seconds reads as alive
//  where a static image reads as a badge and gets ignored.
//
//  Every row must be exactly 24 characters — `npm run check-art`
//  verifies that, because a short row silently shifts every pixel after
//  it and the result looks like a rendering bug rather than a typo.
// =====================================================================

export const MASCOT_SIZE = 24;

//  K black · W white · L light grey · C cyan screen
//  R brand red · A brand red, shaded
//
//  These are generated, not typed. Hand-counting 24 characters across
//  24 rows produced asymmetric pupils and a smile that the head border
//  painted over. `npm run check-art` guards the dimensions.
const IDLE = [
  "...........RR...........",
  "...........KK...........",
  "...KKKKKKKKKKKKKKKKKK...",
  "...KWWWWWWWWWWWWWWWWK...",
  "...KWLLLLLLLLLLLLLLWK...",
  "...KWLKKKKKKKKKKKKLWK...",
  "...KWLKCCCCCCCCCCKLWK...",
  "...KWLKCWWWCCWWWCKLWK...",
  "...KWLKCWKWCCWKWCKLWK...",
  "...KWLKCWWWCCWWWCKLWK...",
  "...KWLKCKCCCCCCKCKLWK...",
  "...KWLKCCKCCCCKCCKLWK...",
  "...KWLKCCCKKKKCCCKLWK...",
  "...KWLKKKKKKKKKKKKLWK...",
  "...KWLLLLLLLLLLLLLLWK...",
  "...KWWWWWWWWWWWWWWWWK...",
  "...KKKKKKKKKKKKKKKKKK...",
  "..........KKKK..........",
  "......KKKKKKKKKKKK......",
  ".....KKRRRRRRRRRRKK.....",
  ".....KKRRAAAAAARRKK.....",
  "....KKKRRRRRRRRRRKKK....",
  "......KAAAAAAAAAAK......",
  "......KKKKKKKKKKKK......"
];

const BLINK = [
  "...........RR...........",
  "...........KK...........",
  "...KKKKKKKKKKKKKKKKKK...",
  "...KWWWWWWWWWWWWWWWWK...",
  "...KWLLLLLLLLLLLLLLWK...",
  "...KWLKKKKKKKKKKKKLWK...",
  "...KWLKCCCCCCCCCCKLWK...",
  "...KWLKCCCCCCCCCCKLWK...",
  "...KWLKCKKKCCKKKCKLWK...",
  "...KWLKCCCCCCCCCCKLWK...",
  "...KWLKCKCCCCCCKCKLWK...",
  "...KWLKCCKCCCCKCCKLWK...",
  "...KWLKCCCKKKKCCCKLWK...",
  "...KWLKKKKKKKKKKKKLWK...",
  "...KWLLLLLLLLLLLLLLWK...",
  "...KWWWWWWWWWWWWWWWWK...",
  "...KKKKKKKKKKKKKKKKKK...",
  "..........KKKK..........",
  "......KKKKKKKKKKKK......",
  ".....KKRRRRRRRRRRKK.....",
  ".....KKRRAAAAAARRKK.....",
  "....KKKRRRRRRRRRRKKK....",
  "......KAAAAAAAAAAK......",
  "......KKKKKKKKKKKK......"
];

const WAVE = [
  "...........RR...........",
  "...........KK...........",
  "...KKKKKKKKKKKKKKKKKK...",
  "...KWWWWWWWWWWWWWWWWK...",
  "...KWLLLLLLLLLLLLLLWK...",
  "...KWLKKKKKKKKKKKKLWK...",
  "...KWLKCCCCCCCCCCKLWK...",
  "...KWLKCWWWCCWWWCKLWK...",
  "...KWLKCWKWCCWKWCKLWK...",
  "...KWLKCWWWCCWWWCKLWKKKK",
  "...KWLKCKCCCCCCKCKLWKLLK",
  "...KWLKCCKCCCCKCCKLWKKKK",
  "...KWLKCCCKKKKCCCKLWK...",
  "...KWLKKKKKKKKKKKKLWKKK.",
  "...KWLLLLLLLLLLLLLLWKKK.",
  "...KWWWWWWWWWWWWWWWWKKK.",
  "...KKKKKKKKKKKKKKKKKKKK.",
  "..........KKKK.......KK.",
  "......KKKKKKKKKKKK...KK.",
  ".....KKRRRRRRRRRRK......",
  ".....KKRRAAAAAARRK......",
  "....KKKRRRRRRRRRRK......",
  "......KAAAAAAAAAAK......",
  "......KKKKKKKKKKKK......"
];

export const mascotFrames = { idle: IDLE, blink: BLINK, wave: WAVE };

// Fixed palette, like the icons — the mascot does not follow the colour
// scheme, so it stays recognisable whichever appearance is chosen.
const INK = {
  K: "#000000",
  W: "#FFFFFF",
  L: "#C0C0C0",
  G: "#808080",
  D: "#404040",
  C: "#3BD6F0",
  R: "#D62828",
  A: "#8E1616",
  Y: "#FFD400"
};

const cache = new Map();

/** Render one frame to a data URL at the given pixel scale. */
export function mascotUrl(frame, scale = 3) {
  const key = frame + "@" + scale;
  if (cache.has(key)) return cache.get(key);

  const map = mascotFrames[frame] || mascotFrames.idle;
  const canvas = document.createElement("canvas");
  canvas.width = MASCOT_SIZE * scale;
  canvas.height = MASCOT_SIZE * scale;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < map.length; y++) {
    const row = map[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === "." || !INK[ch]) continue;
      ctx.fillStyle = INK[ch];
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }

  const url = canvas.toDataURL();
  cache.set(key, url);
  return url;
}
