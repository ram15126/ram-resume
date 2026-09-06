# RAM · 2026 — the future site

Modelled on [airborne.studio](https://www.airborne.studio/). Reached by travelling
forward from the Windows 98 desktop one folder up, or directly at `/future/`.

## Run it

```bash
python -m http.server 8123 --directory desktop-resume
```

Then <http://localhost:8123/future/>. For the arrival transition, use the Time Machine
on the desktop, or open `/future/index.html?arrive=2026`.

## What was worth copying from the reference

The reference has **no canvas and no WebGL** — five muted looping videos and Lenis
smooth scroll, nothing else. Its whole feel is typography, restraint and scroll timing.
So this site has no WebGL either; three.js is gone.

Five rules carry it, and breaking any one of them loses the look:

1. **Two colours.** Ink `#191919`, cream `#FBF4E6`. No accent, no grey scale. Adding a
   third is the fastest way to lose it.
2. **Two typefaces, hard split.** One shouts — display, huge, uppercase, **0.8
   line-height**. One speaks — grotesk, weight 500, ~1.45 leading. There is no third
   voice, and 11px/600/uppercase is the *only* small-text style.
3. **Zero border radius.** Enforced globally. Square is doing real work.
4. **A fixed frame with a 12-column feel**, sections lapped by `-1px` so a background
   seam can never show as a hairline.
5. **The inversion.** Ink acts, then cream, then ink. That colour flip is the chapter
   device that carries a long page.

Gravity and Neue Haas Grotesk are commercial. **Archivo Black + Archivo** are the
closest free pair, and being one superfamily they sit together better than a borrowed
match would.

## Structure

```
ACT 1 · ink     hero, intro
   quote
ACT 2 · cream   work, shipped, receipts, open, stack   (+ quotes between)
ACT 3 · ink     contact
```

## The scroll

An inertial smoother: `#page` is pinned and translated by a lerped scroll value, while a
spacer in normal flow carries the real height. **Pinning the body and giving it a height
does not work** — a fixed body has no scrollable overflow, so the page cannot move at
all. That mistake cost a debugging pass; the spacer is the fix.

Native scrolling, the scrollbar, keyboard paging and anchor links all still work,
because the document keeps its true height and only the visual is offset. The whole
thing is switched off under `prefers-reduced-motion`, where the browser's own scrolling
is exactly what was asked for.

Reveals use IntersectionObserver, not scroll maths — it fires once per block, costs
nothing while idle, and cannot drift out of sync with the smoothed position. Display
headings rise word by word out of a clipping box; a masked reveal reads as deliberate
where a plain fade reads as a slow page.

## The cursor trail

Move the pointer and tool names peel off it, drift along the direction of travel, rise
and fade. They are **real DOM nodes, not canvas** — the typography is the effect, and a
tool name rasterised into a texture would look like a picture of the idea rather than
the idea.

A fixed pool of 26 nodes is recycled, so however long someone swirls the cursor the page
never grows an element. Names come from a shuffled bag, so the same one never lands
twice in a row and every tool shows before any repeats. `mix-blend-mode: difference`
keeps them legible over both ink and cream.

Off on touch devices (`hover: hover and pointer: fine`) and under reduced motion.

## Scroll devices and hover

Taken from what the reference actually runs, not from guesswork — its DOM shows
`sticky top-0`, `animate-[marquee_40s_linear_infinite]`, a `fab-pop` badge, a 3.5s
`testimonial-progress`, `data-lenis-prevent`, and `data-trail-safe`.

**Sticky section labels.** Each act's eyebrow parks under the nav and rides down until
its section ends. This is why the smooth scroll had to be rewritten: the first version
translated a pinned `#page`, and **a transformed, fixed ancestor gives `position: sticky`
nothing to stick to**. Now the native scroll position is eased instead, so sticky works
and so does everything else that depends on real scrolling.

**Marquee.** The tools run as an infinite strip. The track holds exactly two identical
copies and translates by `-50%`, so the seam lands on a duplicate of the first frame and
the loop is invisible. The timing function must be `linear` — any easing shows the wrap
as a stutter. Pauses on hover; off under reduced motion.

**Rotating badge.** Bottom-right, text on an SVG `textPath` so it turns as one ring.
Pops in after 900ms, spins in 18s, speeds to 6s on hover. `mix-blend-mode: difference`
keeps it legible over ink and cream alike.

**Row hover.** A ruled row fills from the left and inverts. The fill colour is set
**explicitly per act, never `currentColor`** — `currentColor` changes on hover, so the
fill would resolve to whatever the text just became and vanish against its own
background. That was a real bug; the fix is `.act-cream .item::before { background: var(--ink) }`
and the inverse. Fill and text share one 0.3s duration so they arrive together.

**Underline sweep.** Nav and contact links grow a rule from the left, transitioning
`width` over 0.3s — the reference does exactly this rather than fading.

**The cursor is an inverting spotlight.** A white disc with
`mix-blend-mode: difference`, which returns the inverse of whatever is beneath it — cream
becomes ink, ink becomes cream, and the display type reads in negative as the disc
crosses it. It grows over links, shrinks on press.

That is the site's own idea rather than an effect bolted on: the page is built from an
ink/cream inversion between acts, so the cursor is a small moving act of the same kind.
It also means one element is correct on every ground, with no need to know which.

**It must live on `<body>`, not inside a wrapper.** `mix-blend-mode` blends an element
with what is painted beneath it *in its own stacking context*. The first version put the
disc inside a positioned `#tools` layer with a `z-index`, which creates a stacking
context — so the disc was isolated inside it, had nothing underneath to invert, and
simply did not appear. That layer is now gone.

**The disc lags, so a small dot rides the true pointer position.** The lag is what makes
it feel good and is also what would make links impossible to aim at; the dot resolves
both.

*Removed along the way:* a word highlight (a marker over 287px display type read as a
slab, not a selection) and a trail of tool names peeling off the cursor (it competed with
the typography instead of supporting it). The tools live on in the marquee and the logo
wall, which is where they build trust rather than noise.

**Tool logos — a three-tier fallback chain.** Each tool in `config/stack.js` carries an
`icon` array tried in order until one loads:

| Prefix | Source | Notes |
|---|---|---|
| `si:` | Simple Icons CDN | Already monochrome. Preferred wherever it exists. |
| `svgl:` | svgl.app | Real SVG, in colour. Covers newer AI tools Simple Icons lacks. |
| `fav:` | Google favicon service | Raster. Last resort, but the only thing that covers brands too new or too small for any icon set. |

A source that 404s falls through to the next; when the chain runs out the image removes
itself and the cell shows a wordmark. **Every slug was checked against the live CDN** —
25 of 26 resolve. Do not add one without checking it, and note that Simple Icons *does*
have `cursor` but does *not* have `openai`, `remotion` or `schemadotorg`.

`llms.txt` is the one deliberate wordmark: it is a file convention, not a company, and
inventing a mark for it would be the only dishonest cell on the wall.

**Colour sources are desaturated, not crushed.** The first version used
`brightness(0.35)` to force a silhouette, which turned every favicon shipping an *opaque*
background into a black blob — Schema.org, Higgsfield and Screaming Frog all did it.
Plain `grayscale(1)` keeps a light-backed favicon light with its mark dark, which is what
actually reads on cream.

> **On the logos:**> **On the logos:** these are other companies' trademarks, shown to say "I use this".
> That is normal. What you must not do is arrange them so they imply partnership or
> endorsement — the "Tools I run" label above the wall is what keeps that clear.

Nothing shifts layout on hover anywhere — the reference never nudges position, only
colour and fill.

## The assistant

The same RAG bot as the 98 desktop, presented as a **docked chat panel** with an avatar
launcher in the bottom-right — the conventional chatbot pattern, so nobody has to be
told what it is.

**The avatar is original.** Three concentric arcs turning at different rates around a
core that breathes: it reads as "thinking" with no face, no gradient and no borrowed
mark. It is deliberately *not* Grok's logo or any other product's — a real AI company's
mark on a personal portfolio implies an association that does not exist.

**It imports `../../config/assistant.js` — the SAME file** the desktop app and the server
function read. Not a copy. The guardrails in there are what stop it inventing a career
for a real person, and two drifting copies of a rule like *"leads are sourced and
qualified, never converted"* is precisely how a site ends up lying on one page and
telling the truth on another.

Everything that carries trust on the desktop version is carried here too:

- **the source passages behind every answer**, one click away — an answer you cannot
  check is just a confident voice
- **a disclaimer that distinguishes** an AI-written answer from his own sentences quoted
  back. With no model key the server quotes him verbatim, and calling that
  "AI-generated" is the same category of wrong the assistant exists to avoid
- **the refusal text** when retrieval finds nothing
- **an honest failure message** when the backend is not running — `python -m http.server`
  has no `/api`, so it says so plainly rather than letting `JSON.parse` throw

There is only ONE instance. An earlier version also put the assistant in an inline
section; two transcripts of the same bot with separate histories is confusing and
duplicates state, so the section was removed and the nav's "Ask" link opens the panel.

The rotating **OPEN TO WORK badge moved to the bottom-left** — the launcher owns the
right corner now, and two floating circles in one corner is a pile, not a layout. The
badge is also hidden over the hero, where it collided with the sub-line and competed
with the hero's own call to action; it arrives once you scroll past the first screen.

## What to edit

### Keeping it short

`display()` sets its text in Archivo Black at up to 92px. **Headings must be six or
seven words.** An early version passed a whole paragraph in and the intro grew to three
screens of shouting; a station can now carry a short `headline` alongside its longer
`title`, and the paragraph belongs in `body`.

Résumé bullets are capped by `layout.maxBulletsPerItem` in `config/stack.js` (currently
4). Bullets in `voice.js` are ordered by importance, so the tail is what gets dropped.
The PDF and the 98 desktop still carry every line — raise the cap if you would rather
show everything here too.

| You want to change… | Edit this file |
|---|---|
| Every word of the résumé | `config/voice.js` |
| The tools that fly out of the cursor | `config/stack.js` → `tools` |
| The pull-quotes between sections | `config/stack.js` → `quotes` |
| Nav links | `config/stack.js` → `nav` |
| The assistant's greeting, suggestions, guardrails | `../config/assistant.js` (shared with the 98 desktop — edit once) |
| Palette, scroll feel, trail behaviour, reveal timing | `config/scene.js` |

`src/` is the engine and should not need edits for content or looks.

## The content rule

`config/voice.js` says the same things as the desktop site's `config/content.js` and the
PDF. Only the delivery changed. **The facts do not move:** no traffic or ranking numbers
(there are no verified ones); leads are *sourced and qualified*, not converted; the
43 → 65 health score was implemented **by the client**; he directs AI-assisted
development rather than writing the code.

## Test hook

`requestAnimationFrame` does not fire in a background tab, and this pane cannot
screenshot scrolled states, so:

```js
window.__ram.revealAll();     // force every reveal, no scrolling
window.__ram.goTo('work');    // jump and paint synchronously
window.__ram.sections();      // ids, offsets, heights
window.__ram.scrollable();    // px of real scroll range
```

To *see* a mid-page section in a headless or hidden pane, move it to the top —
`document.getElementById('page').prepend(document.getElementById('work'))` — because the
initial paint works even when scrolled repaints do not.

## Files

```
index.html            shell — no canvas, no three.js
styles/future.css     the whole type and colour system
config/voice.js       every word of the résumé
config/stack.js       tools, pull-quotes, nav
config/scene.js       palette, scroll, trail, reveals
src/main.js           smooth scroll, reveals, warp, anchors
src/sections.js       builds the page as flowing HTML
src/tools.js          the cursor trail
```
