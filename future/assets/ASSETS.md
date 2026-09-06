# Asset plan — every prompt, ready to paste

**UPDATE — 6 Sep: Part A is largely cancelled.**

The hero and the backdrop are now a real-time WebGL vortex, built from the two
black-hole references. Nothing in Part A is needed for it. The only 2026 asset still
worth generating is the warp pair (**A4 + A5 -> M2**), and even that is optional — the
procedural warp already works.

Part B and Part C stand unchanged. Part C is where the value is.

---

Two sites, two completely different looks, so **two locked blocks**. Do not mix them.

- **PART A — 2026 site.** Near-monochrome, cold, expensive. Black void, ice white.
- **PART B — 1998 desktop.** Saturated, naive, low-resolution, optimistic.
- **PART C — the four you must not generate.**

Every prompt below is complete. Copy the whole code block, paste, generate. The look
block is already inside each one — that repetition is the entire point. Consistency
comes from the text being byte-identical between generations, not from it being well
written, so do not tidy it, shorten it or paraphrase it.

The meteor was only ever a look reference. Nothing here has to be a meteor.

---

## THE CONSISTENCY TRICK — read this first

Wording alone **will** drift, because the model re-rolls the palette on every
generation. The fix is not a better prompt:

1. Generate **A1** until you have one you genuinely love. That is your keyframe.
2. For every other 2026 asset, attach A1 as a **style / reference image** and add:
   *"Match the colour grade, contrast, lighting direction and film grain of the
   reference image exactly."*
3. Same model, same seed if the tool exposes one.
4. No style-reference input? Generate all of Part A **in one session**. Drift between
   sessions is far worse than within one.

**And do not over-invest in matching.** If they still drift, send them anyway — I can
lock any clip to the palette at runtime with a CSS grade: desaturate, crush the blacks,
tint to the ice cast. Two lines, no regeneration. Near enough is genuinely enough.

Specs: stills **16:9, 1920×1080**. Videos **16:9, 1080p, 8s, MP4, no audio**.

---
---

# PART A — the 2026 site

## A1 · Hero keyframe — SHARD (recommended)

Contrasts with the round gates the site already has. **The composition constraint is
not negotiable:** object upper-right, centre and lower half empty black. RAM sits there.
If it lands mid-frame, regenerate — do not fix it with motion later.

```
A single large angular shard of dark stone floating in an empty void, tilted off-axis,
positioned small in the upper-right quadrant of the frame. Sharp fractured facets, one
edge catching a distant cold white light, the rest falling into complete shadow. Fine
pale dust drifts away from it toward the right edge of frame. The centre and the entire
lower half of the frame are empty black space with a few tiny distant stars.

COLOUR AND LIGHT — follow exactly:
Strictly near-monochrome with a cold blue-grey cast. Blacks are pure and crushed
(#05070B). Shadows are cold charcoal (#0B111A). Mid-tones are cold steel blue-grey
(#3A4653 to #6F8497). Highlights are ice white (#C3D8EA) rising to pure white (#FFFFFF).
Saturation is near zero throughout.
Approximately 80% of the frame is near-black negative space, 15% mid-grey, and no more
than 5% bright highlight.
Single distant cold white key light. No fill light.
Photoreal, cinematic, extremely low key, deep blacks, fine film grain, subtle lens
softness.
FORBIDDEN: cyan, teal, turquoise, magenta, pink, purple, violet, orange, amber, gold,
brown, green, any warm light, any colour temperature shift, any coloured rim light, any
lens flare, any glow bloom, any neon.
FORBIDDEN: text, words, letters, numbers, logos, watermarks, people, faces, planets,
moons, spacecraft, buildings.
```

## A2 · Hero keyframe — RING (alternative)

Rhymes with the corridor gates you fly through. Risk: may feel redundant beside them.

```
A single thin metallic ring floating edge-on in an empty void, tilted in perspective,
positioned small in the upper-right quadrant of the frame. Brushed dark metal surface,
one arc of the ring catching a distant cold white light, the opposite arc in complete
shadow. Fine pale dust drifts through and away from it toward the right edge of frame.
The centre and the entire lower half of the frame are empty black space with a few tiny
distant stars.

COLOUR AND LIGHT — follow exactly:
Strictly near-monochrome with a cold blue-grey cast. Blacks are pure and crushed
(#05070B). Shadows are cold charcoal (#0B111A). Mid-tones are cold steel blue-grey
(#3A4653 to #6F8497). Highlights are ice white (#C3D8EA) rising to pure white (#FFFFFF).
Saturation is near zero throughout.
Approximately 80% of the frame is near-black negative space, 15% mid-grey, and no more
than 5% bright highlight.
Single distant cold white key light. No fill light.
Photoreal, cinematic, extremely low key, deep blacks, fine film grain, subtle lens
softness.
FORBIDDEN: cyan, teal, turquoise, magenta, pink, purple, violet, orange, amber, gold,
brown, green, any warm light, any colour temperature shift, any coloured rim light, any
lens flare, any glow bloom, any neon.
FORBIDDEN: text, words, letters, numbers, logos, watermarks, people, faces, planets,
moons, spacecraft, buildings.
```

## A3 · Hero keyframe — FRACTURED SPHERE (alternative)

The most dramatic of the three.

```
A single dark grey sphere floating in an empty void, its surface split by deep
fractures, positioned small in the upper-right quadrant of the frame. Cold white light
escapes from within the cracks in thin hard lines. The unlit surface falls into complete
shadow. Fine pale dust drifts away from it toward the right edge of frame. The centre
and the entire lower half of the frame are empty black space with a few tiny distant
stars.

COLOUR AND LIGHT — follow exactly:
Strictly near-monochrome with a cold blue-grey cast. Blacks are pure and crushed
(#05070B). Shadows are cold charcoal (#0B111A). Mid-tones are cold steel blue-grey
(#3A4653 to #6F8497). Highlights are ice white (#C3D8EA) rising to pure white (#FFFFFF).
Saturation is near zero throughout.
Approximately 80% of the frame is near-black negative space, 15% mid-grey, and no more
than 5% bright highlight.
Single distant cold white key light. No fill light.
Photoreal, cinematic, extremely low key, deep blacks, fine film grain, subtle lens
softness.
FORBIDDEN: cyan, teal, turquoise, magenta, pink, purple, violet, orange, amber, gold,
brown, green, any warm light, any colour temperature shift, any coloured rim light, any
lens flare, any glow bloom, any neon.
FORBIDDEN: text, words, letters, numbers, logos, watermarks, people, faces, planets,
moons, spacecraft, buildings.
```

## A4 · Warp — OPENING frame

```
Pure black frame with a single thin horizontal line of bright white light stretched
across the exact centre, edge to edge, glowing softly and bleeding slightly into the
darkness above and below it, like the phosphor of an old CRT television collapsing to a
line. Everything else is absolute black.

COLOUR AND LIGHT — follow exactly:
Strictly near-monochrome with a cold blue-grey cast. Blacks are pure and crushed
(#05070B). Shadows are cold charcoal (#0B111A). Mid-tones are cold steel blue-grey
(#3A4653 to #6F8497). Highlights are ice white (#C3D8EA) rising to pure white (#FFFFFF).
Saturation is near zero throughout.
Approximately 80% of the frame is near-black negative space, 15% mid-grey, and no more
than 5% bright highlight.
Single distant cold white key light. No fill light.
Photoreal, cinematic, extremely low key, deep blacks, fine film grain, subtle lens
softness.
FORBIDDEN: cyan, teal, turquoise, magenta, pink, purple, violet, orange, amber, gold,
brown, green, any warm light, any colour temperature shift, any coloured rim light, any
lens flare, any glow bloom, any neon.
FORBIDDEN: text, words, letters, numbers, logos, watermarks, people, faces, planets,
moons, spacecraft, buildings.
```

## A5 · Warp — CLOSING frame

```
Calm, almost entirely black deep space scattered with small distant white and pale
blue-grey stars, seen head-on. Very faint cold grey dust in the far background. No focal
object, no horizon, no motion blur — completely still and quiet.

COLOUR AND LIGHT — follow exactly:
Strictly near-monochrome with a cold blue-grey cast. Blacks are pure and crushed
(#05070B). Shadows are cold charcoal (#0B111A). Mid-tones are cold steel blue-grey
(#3A4653 to #6F8497). Highlights are ice white (#C3D8EA) rising to pure white (#FFFFFF).
Saturation is near zero throughout.
Approximately 80% of the frame is near-black negative space, 15% mid-grey, and no more
than 5% bright highlight.
Single distant cold white key light. No fill light.
Photoreal, cinematic, extremely low key, deep blacks, fine film grain, subtle lens
softness.
FORBIDDEN: cyan, teal, turquoise, magenta, pink, purple, violet, orange, amber, gold,
brown, green, any warm light, any colour temperature shift, any coloured rim light, any
lens flare, any glow bloom, any neon.
FORBIDDEN: text, words, letters, numbers, logos, watermarks, people, faces, planets,
moons, spacecraft, buildings.
```

## A6 · Nebula backdrop

Squint at the result. If anything draws your eye, it is too loud — this sits behind
every word on the site at 55% opacity.

```
A vast field of interstellar dust seen in deep space. Almost entirely black, with faint
soft diffuse clouds of cold grey occupying the edges of the frame and leaving the centre
dark and empty. Tiny distant stars scattered throughout. Very low contrast within the
clouds. No focal subject, no bright core.

COLOUR AND LIGHT — follow exactly:
Strictly near-monochrome with a cold blue-grey cast. Blacks are pure and crushed
(#05070B). Shadows are cold charcoal (#0B111A). Mid-tones are cold steel blue-grey
(#3A4653 to #6F8497). Highlights are ice white (#C3D8EA) rising to pure white (#FFFFFF).
Saturation is near zero throughout.
Approximately 80% of the frame is near-black negative space, 15% mid-grey, and no more
than 5% bright highlight.
Single distant cold white key light. No fill light.
Photoreal, cinematic, extremely low key, deep blacks, fine film grain, subtle lens
softness.
FORBIDDEN: cyan, teal, turquoise, magenta, pink, purple, violet, orange, amber, gold,
brown, green, any warm light, any colour temperature shift, any coloured rim light, any
lens flare, any glow bloom, any neon.
FORBIDDEN: text, words, letters, numbers, logos, watermarks, people, faces, planets,
moons, spacecraft, buildings.
```

## A7 · Station artifact — OPTIONAL, generate one only

Idea: each of the six stations gets its own form drifting far behind the panel, so they
feel like different places rather than the same corridor six times. Risk: six objects
behind six panels of text is as likely to read as clutter as depth. Generate one, then
we decide.

```
A single large monolithic slab of dark grey rock floating in an empty void, rotated
slightly off-axis, edge-lit so that only its silhouette and one edge catch a distant
cold white light. The slab occupies the right side of frame; the left two-thirds is
empty black.

COLOUR AND LIGHT — follow exactly:
Strictly near-monochrome with a cold blue-grey cast. Blacks are pure and crushed
(#05070B). Shadows are cold charcoal (#0B111A). Mid-tones are cold steel blue-grey
(#3A4653 to #6F8497). Highlights are ice white (#C3D8EA) rising to pure white (#FFFFFF).
Saturation is near zero throughout.
Approximately 80% of the frame is near-black negative space, 15% mid-grey, and no more
than 5% bright highlight.
Single distant cold white key light. No fill light.
Photoreal, cinematic, extremely low key, deep blacks, fine film grain, subtle lens
softness.
FORBIDDEN: cyan, teal, turquoise, magenta, pink, purple, violet, orange, amber, gold,
brown, green, any warm light, any colour temperature shift, any coloured rim light, any
lens flare, any glow bloom, any neon.
FORBIDDEN: text, words, letters, numbers, logos, watermarks, people, faces, planets,
moons, spacecraft, buildings.
```

---

## Motion prompts — turning the stills into video

### M1 · `hero.mp4` — Image to Video, start frame = your chosen A1/A2/A3

```
Extremely slow tumbling rotation of the object and a gentle drift of the surrounding
dust. The camera holds almost completely still. No cuts, no camera shake, no zoom, no
push in, no change in lighting, no change in colour. The framing stays exactly as in the
reference image: the object remains in the upper-right quadrant and the centre and lower
half of frame remain empty black.
```

### M2 · `warp.mp4` — **Frames to Video**, first frame = A4, last frame = A5

Use Frames to Video, not text-to-video. It is the only way to guarantee the clip begins
and ends on the exact frames the cuts need.

```
The line of light explodes outward into thousands of stretched white and pale blue-grey
star streaks rushing past the camera at impossible speed, forming a long tunnel. Speed
builds to a violent peak with white light bleeding across the frame, then decelerates
smoothly, the streaks shortening back into still points until the field is calm.
Volumetric light, subtle lens distortion, deep blacks, fine film grain. Strictly
monochrome — no colour at any point. No text, no logos, no objects, no spacecraft.
```

### M3 · `nebula.mp4` — Image to Video, start frame = A6

```
Extremely slow lateral drift of the dust, almost imperceptible. The camera holds still.
No cuts, no zoom, no push in, no brightening, no change in colour. The frame stays
predominantly black throughout.
```

Videos go in `future/assets/video/`, then flip the matching switch in
`future/config/scene.js` → `clips`.

---
---

# PART B — the 1998 desktop

Completely different rules. This is 1998: saturated, low-resolution, cheerfully naive.
**Do not use the Part A look block here.**

The desktop already ships fourteen procedural wallpapers I drew in code, and they are
period-correct. These generated ones are extra variety, not a fix for anything — so they
are genuinely optional.

Specs: **1920 × 1080** stills. They land in `desktop-resume/assets/wallpaper/` and I
will register them in `config/theme.js`.

## B1 · "Clouds" — the era-correct photographic wallpaper

```
A photograph of a bright blue daytime sky filled with soft white cumulus clouds, shot
looking straight up. Slightly overexposed and washed out. No horizon, no ground, no
aircraft, no birds.

STYLE — follow exactly:
Late-1990s desktop wallpaper. Scanned 35mm photograph, slightly soft focus, mild JPEG
softness, visible film grain. Colours are saturated but slightly faded, as if displayed
on a 1998 CRT monitor. Limited colour depth, gentle dithering and banding in the
gradients, as though reduced to a 256-colour palette.
FORBIDDEN: text, words, letters, numbers, logos, watermarks, people, buildings, modern
HDR look, lens flare, vignette, bokeh, cinematic colour grading.
```

## B2 · "Cyberspace" — 1998's idea of the future

This one is the good joke. It is what people in 1998 thought 2026 would look like,
sitting on the desktop one click away from what it actually looks like.

```
A retro-futuristic digital landscape: a glowing wireframe grid stretching to a distant
horizon under a dark starry sky, with a polished chrome sphere hovering above the grid
reflecting the scene. A bright lens flare on the horizon.

STYLE — follow exactly:
Late-1990s CD-ROM cover art and 3D screensaver aesthetic. Early ray-traced computer
graphics, hard specular highlights, obviously synthetic surfaces, low polygon count.
Saturated electric blue, purple and magenta. Limited colour depth with visible dithering
and banding, as though reduced to a 256-colour palette. Slightly soft, low resolution.
FORBIDDEN: text, words, letters, numbers, logos, watermarks, people, photorealism,
modern rendering, ray-traced global illumination, cinematic colour grading.
```

## B3 · "Marble" — the abstract desktop pattern

```
An abstract swirling pattern of deep blue, teal and white, like polished marble or oil
on water, filling the entire frame evenly with no focal point.

STYLE — follow exactly:
Late-1990s desktop wallpaper texture. Flat, evenly lit, no depth of field, no shadows.
Saturated but slightly faded colours as displayed on a 1998 CRT monitor. Limited colour
depth with visible dithering and banding, as though reduced to a 256-colour palette.
Slightly soft and low resolution.
FORBIDDEN: text, words, letters, numbers, logos, watermarks, people, objects, faces,
photorealism, cinematic colour grading.
```

---
---

# PART C — the four you must NOT generate

These are the highest-value items on the whole list and none of them needs an AI.

## C1 · Your photograph — for the dithered portrait

The 98 desktop has no picture of you, and the reference site you sent me got a lot of
its character from a 1-bit dithered portrait. I want to add that, and it has to be a
**real photo of you**. I will threshold-dither it in code so it comes out as period
black-and-white — you do not need to edit it.

Send a plain head-and-shoulders photo, good light, plain background, looking at or just
past the camera. Higher resolution is better; dithering eats detail.

**Do not generate a face.** A synthetic portrait presented as you is impersonation, and
it would be the single most damaging thing you could put on a site whose best section is
about refusing to overstate.

## C2 · Gallery screenshots

The six plates in the desktop Gallery are placeholders. They need **real screenshots of
real work**: the audit tool running, a carousel deck, a frame from the film, the research
page, the lead tracker, the agent system.

A generated image of "an SEO audit tool" shown as your project is fabricated evidence.
On a site whose strongest station is about refusing to show numbers you cannot defend,
that is the one thing that would undo all of it.

Drop files in `desktop-resume/assets/gallery/`, then set `src` per item in
`desktop-resume/config/desktop.js`.

## C3 · `og.jpg` — the social card

Right now, sharing either link on LinkedIn or WhatsApp shows a blank preview. For a
marketer that is the most expensive gap on this list.

Screenshot the real 2026 hero, crop to **1200 × 630**, save as `future/assets/og.jpg`.
Do the same for the desktop site if you want a separate card. A generated one would be a
picture of a site that does not exist. Tell me when they are in and I will wire the meta
tags on both.

## C4 · Favicons

Nothing needed from you — I will draw both procedurally, matching each site's own mark.
