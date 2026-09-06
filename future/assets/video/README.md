# Generated clips

Drop the files here, then switch them on in `../../config/scene.js` under `clips`.
Nothing probes for them, so a file that is not here costs nothing and never shows
up as a 404 in a visitor's console. Everything works without them.

| File | Switch | What it does |
|---|---|---|
| `hero.mp4` | `clips.hero` | Loops behind the name on the landing screen. |
| `nebula.mp4` | `clips.nebula` | Ambient backdrop behind the corridor. Loops. |
| `warp.mp4` | `clips.warp` | Plays over the arrival from 1998. The WebGL warp runs underneath either way. |

## Art direction — read this before generating

The site is **near-monochrome**: black space, ice white, one cold blue cast. No cyan,
no magenta, no neon, no warm colour anywhere. Value and temperature do all the work.
A clip with saturated colour in it will look pasted on.

Every clip must also be **mostly black**, because text sits on top of it.

## Prompts

**hero.mp4** — 16:9, 8s, loopable

> Slow orbit around a single icy grey asteroid tumbling in a pitch-black void, a soft
> white dust tail streaming behind it and catching the light. Cratered, rocky, pale
> blue-grey surface. Lit by one distant cold light source from the left. Photoreal,
> cinematic, deep blacks, fine film grain, shallow depth of field. Desaturated, almost
> monochrome. The asteroid sits in the right third of frame; the left half stays empty
> black. Extremely slow rotation, no cuts. No text, no words, no logos, no people, no
> planets, no spacecraft, no colour casts, no lens flares.

*Left half must stay empty — the name sits there.*

**nebula.mp4** — 16:9, 8s, loopable

> Slow silent drift through a vast dark field of interstellar dust. Almost entirely
> black, with faint soft clouds of cold grey and pale blue-white. Extremely slow
> lateral camera drift, almost still. Tiny distant stars. Very low contrast in the
> clouds so the frame stays predominantly black. Photoreal, cinematic, fine film
> grain, desaturated and almost monochrome. Continuous motion, no cuts. No text, no
> words, no logos, no people, no planets, no spacecraft, no bright flares, no colour.

**warp.mp4** — 16:9, 8s

> First-person camera accelerating forward through deep space at impossible speed. The
> shot begins in near-total darkness with a single thin horizontal white line of light
> across the centre of frame, like an old CRT television collapsing. The line explodes
> outward into thousands of stretched white and pale blue-grey star streaks rushing
> past the camera, forming a long tunnel. Speed builds to a violent peak with white
> light bleeding across the frame, then decelerates smoothly, streaks shortening back
> into still points, settling into calm dark space scattered with small distant stars.
> Photoreal, cinematic, volumetric light, subtle lens distortion, deep blacks, high
> contrast, desaturated and almost monochrome. No text, no words, no numbers, no
> logos, no people, no planets, no spacecraft, no colour. Ends on a calm, almost-black
> starfield.

*Start and end frames matter more than the middle: it must begin on black with one
white line and end on near-black, or the cuts into and out of it will show.*

Export 1080p MP4, keep them short and compressed. This is a portfolio, not a showreel host.
