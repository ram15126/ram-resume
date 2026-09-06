# Desktop Résumé — Ramakrishnan s

An interactive résumé built as a fake operating system — **Windows XP, 2006**, the year he was born. It boots, you get a desktop
with icons, and every icon opens a draggable window. Some windows hold the CV. Some
are toys that actually work.

This is the **second** interactive résumé in this repo. The first, in
`../interactive-resume/`, is a pixel-art platformer. Both are untouched by each other
and both read the same résumé wording from `config/content.js`.

## Run it locally

The site uses ES modules, so it must be served over HTTP — opening `index.html`
straight off the disk will not work.

```bash
python -m http.server 8099 --directory desktop-resume
```

Then open <http://localhost:8099>.

## What is on the desktop

| Icon | What it is |
|---|---|
| About Me | Summary, the three current roles, how he works, languages, interests |
| My Work | The three jobs, one tab each, full bullets |
| Projects | The five projects |
| Skills | Three tabs of skill meters plus the full tag list |
| Education | Degree, coursework, training |
| Gallery | Paginated case-study viewer |
| Resume.pdf | The PDF, previewed in-window and downloadable |
| Contact Me | Email, phone, LinkedIn, GitHub |
| Notepad | A working text editor, opens with `readme.txt` |
| Paint | A working pixel painter — pencil, eraser, fill, undo, save PNG |
| Audit Trainer | A small game about spotting SEO false positives |
| Display | Wallpaper switcher and colour-scheme picker |
| Time Machine | Travels forward from 2006 to the 2026 site in `future/` |
| Ask About Me | A chat assistant that answers from his own notes, with citations |

The assistant also has a **mascot launcher** in the bottom-right corner — see below.

## What to edit (and what not to)

| You want to change… | Edit this file |
|---|---|
| Any résumé text — bullets, dates, skills, projects | `config/content.js` |
| Colour schemes, wallpapers, fonts, boot timing | `config/theme.js` |
| Which icons appear, gallery items, the Notepad text, the game's findings | `config/desktop.js` |
| The PDF | don't — it is generated. Edit `config/content.js`, then `npm run cv` |
| What the assistant knows | `knowledge/*.md`, then `npm run ingest` |
| How the assistant behaves | `config/assistant.js` |

Everything under `src/` is the operating system. It should not need edits to change
content or colours. If you ask an AI to change something, tell it:
**"edit only the files in `config/`"**.

### Two things live in `config/desktop.js` rather than `config/content.js`

`content.js` is shared with the platformer site, so it is kept identical on both
sides. Where the desktop needs different wording, the override lives here:

- **`contactCopy`** — `content.js` closes with "Level complete! Thanks for playing",
  which is platformer language. The desktop uses its own closing line.
- **`notepadDoc`** — the readme is written for this site specifically.

## The future site

`future/` holds a second, entirely different site: a 3D corridor you fly through, with
the same résumé written in a blunter first-person voice under the name **RAM**. It has
its own [README](future/README.md).

The two are one journey. The **Time Machine** icon spins the year from 2006 to 2026,
tears the screen, collapses the CRT and navigates to `future/index.html?arrive=2026`,
which plays the arrival. "REWIND TO 2006" on the future site comes back to
`index.html?arrive=2006`, which plays the CRT opening back up and skips the boot screen.

Both transitions run on timers rather than `requestAnimationFrame`, because rAF is
paused in a background tab and an animation that ends in a navigation must never be
able to leave someone stuck on a black screen.

## The CV PDF

`npm run cv` regenerates `assets/Ramakrishnan_S_Resume.pdf` from
`config/content.js` via headless Chrome. **Do not hand-edit the PDF.**

Before this existed the PDF was a hand-made binary nobody could reproduce, so the
moment the CV data was corrected the websites said one thing and the downloadable
said another — in front of the same recruiter. Now there is one source of truth
and both come out of it.

The script **fits the page itself**. It renders, counts the pages in the PDF it
just made, and if it overflowed it drops a bullet and renders again, reporting
what it settled on:

```
fitting: 6×role/6 proj → 2pp
```

The target is **two pages**, matching the CV he already had. One page was tried
and rejected: forcing it there cost three bullets per role and four of the six
projects, which is a worse CV rather than a tidier one.

Because the tail is what gets trimmed, **bullets in `content.js` are ordered by
importance, not by chronology.**

After running it, copy the PDF to the platformer too — both sites ship their own
copy of it.

## Keeping the two sites in sync

Both websites keep their own `config/content.js` and their own copy of the PDF.
They have already drifted once: the desktop site was corrected while the
platformer silently kept serving the old brand count and the old film runtime.

`npm run check` now fails if the two `content.js` files differ. It runs
automatically as part of `npm run ingest`.

## The mascot

A pixel robot sits bottom-right and opens the assistant. The desktop icon stays;
both do the same thing.

It exists because the assistant was one icon among thirteen and most visitors
would never have found the most interesting thing on the site. The pattern is the
Office Assistant's — a character in the corner with a speech balloon — which is
period-correct for a Windows 98 desktop and is the reason anyone notices it. The
character is original; only the idiom is borrowed.

- **Greets once per visitor**, a few seconds after the desktop settles, then never
  again unless hovered. A balloon that reappears every session is why people
  learned to hate this pattern.
- **Blinks on an irregular timer**, and occasionally waves. The irregularity
  matters: a character blinking on a metronome reads as a loading spinner and
  gets tuned out.
- **Dims rather than disappears** while the assistant is open, because vanishing
  furniture is disorienting and it still has to be clickable.
- Respects `prefers-reduced-motion`, and pauses animation when the tab is hidden.

Edit the copy in `config/assistant.js` under `mascot`. Set `enabled: false` there
to remove it entirely.

### The art is generated, not typed

```bash
node tools/gen-mascot.mjs            # draw and validate
node tools/gen-mascot.mjs --write    # update src/os/mascotart.js
npm run check-art                    # dimensions, runs inside npm test
```

Hand-writing 24 characters across 24 rows produced, in one sitting: asymmetric
pupils, a smile the head border painted over, and a waving arm drawn straight
through the robot's own face. The generator draws with coordinates and asserts
that the wave frame never alters the head interior, so those are now impossible
rather than merely unlikely.

## Colours

The OS ships **Windows XP "Luna"** — the OS the world was actually running in 2006.
(Vista went to businesses on 30 Nov 2006 and to consumers on 30 Jan 2007, so almost
nobody had it that year.) Visitors change the scheme from **Display Properties →
Appearance**, over a live preview, with OK / Cancel / Apply. The choice is kept in
their own browser.

Five schemes ship. Be straight about what they are:

- **Signature Red** is the default and is **not** a Windows scheme. It is his own
  colour, applied to XP's shapes.
- **Luna Blue** uses the documented XP values — `#ECE9D8` dialog face, `#316AC5`
  selection, the `#0054E3` title gradient.
- **Olive Green** and **Silver** take their names and character from the other two
  schemes XP shipped, but those hexes are matched by eye. The Appearance tab says so
  on screen — leave that note in.
- **High Contrast Black** is there for accessibility.

### What actually changed from the 98 build

98 built everything from 2px bevels — a light edge top-left, a dark one bottom-right.
XP threw that out. Its whole look is three other tricks, and `styles/os.css` uses them
everywhere:

1. **Vertical gradients.** A bright gloss line at the top, deepest through the middle,
   lifting again at the bottom edge.
2. **Rounded corners.** Title bars, buttons, the Start button, the Start menu.
3. **A coloured frame.** A window *is* a block of its title colour with the content
   sitting inside it — which is why the frame is `padding` in the CSS and not a border.

Content wells kept a 1px sunken border (`#7F9DB9`) instead of a bevel. Type is Tahoma,
not MS Sans Serif. The Start menu is XP's two-column layout with the user header and a
footer. The taskbar is a blue-gradient bar with a green Start button rounded on its
right — recoloured per scheme.

**The 98 build is kept** as `styles/os.98.css.bak` and `config/theme.98.js.bak`. This
is not a git repo yet, so those files are the only copy.

### Adding a scheme

Copy any block in the `schemes` array, give it a new `id` and `name`, change the hexes.
It appears in the dropdown automatically. Each scheme lists only what it changes from
`base`.

Two rules if you write one:

- **Chrome and content are separate.** `face`/`text` are the furniture;
  `well`/`wellText`/`wellMuted`/`wellAccent` are the white content areas.
- **The brand mark never changes.** Boot logo, Start badge, tray light and the pixel
  icons use fixed colours from `brand`. Windows never recoloured its icons per scheme,
  and if these followed it every cached icon would go stale on switch.

## Wallpapers

Fourteen, all drawn from code — no image files, no dependencies. Ten are tileable
patterns in the spirit of the bitmaps Windows 98 shipped (Blue Rivets, Straw Mat,
Tiles, Circles, Pinstripe, Triangles, Waves, Bubbles, Carved Stone, Black Thatch);
three are full-bleed scenes (Clouds, Green Hills, Night Shift); and `(None)` shows
the current scheme's desktop colour, which is what Windows actually defaulted to.
Visitors can also upload their own image — it never leaves their browser.

Tiles are repeated at twice their native size. They were drawn for 640×480 screens
and look like static at today's pixel densities otherwise.

## Adding real images to the Gallery

Right now every gallery item draws a generated dithered placeholder, because no
screenshots have been added yet. To use a real image:

1. Save the file into `assets/gallery/` (e.g. `assets/gallery/audit-tool.png`).
2. In `config/desktop.js`, set that item's `src` to `"assets/gallery/audit-tool.png"`.

If a path is wrong, the app falls back to the placeholder rather than showing a
broken image.

## The assistant ("Ask About Me")

A retrieval-augmented chat window. A visitor asks a question; the server searches
his written notes, hands the best passages to Claude, and Claude answers **only**
from those passages. Every answer shows which passages it used.

### Running it

```bash
npm run ingest    # rebuild the search index from knowledge/
npm start         # dev server on http://localhost:8099 — static site AND /api
```

`npm start` runs `tools/dev-server.mjs`, which serves the static files and the API
from one process. A plain `python -m http.server` will still serve the desktop, but
the assistant will say its backend is not running, because a static file server
cannot execute `/api/ask`.

### Keys: it works with none, and free ones are enough

**No key is required.** Search runs without one, and the assistant quotes his own
sentences from the best-matching passage instead of writing an answer. That is a
real answer to most questions and it is labelled as a quote.

A key upgrades those quotes into written answers. **It does not have to be a paid
one.** The server checks for keys in order and uses whichever it finds, so
`.env.local` needs exactly one line filled in:

| Key | Cost | Covers |
|---|---|---|
| `GEMINI_API_KEY` | Free tier, no card | **Answers *and* semantic search** — the only key you need |
| `GROQ_API_KEY` | Free tier, no card | Answers. Very fast |
| `OPENROUTER_API_KEY` | Free with a `:free` model | Answers |
| `CEREBRAS_API_KEY` / `MISTRAL_API_KEY` | Free tier | Answers |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | Paid | Answers, best quality |
| `JINA_API_KEY` / `VOYAGE_API_KEY` | Free tier | Semantic search only |

Free providers are listed first on purpose, so a free key is preferred over a
paid one unless the free one is removed. Get a Gemini key at
`aistudio.google.com/apikey`.

Adding, removing or reordering providers is a data edit in
`api/_providers.js` — no adapter changes. Most of them speak the OpenAI
chat-completions format, so one adapter covers Groq, OpenRouter, Cerebras,
Mistral and OpenAI; Google and Anthropic have their own shapes.

```bash
npm run test-providers   # every adapter, fetch stubbed, no keys, no cost
```

**Vectors are stamped with the model that made them.** The index records its
embedding provider and model, and the query side refuses to use vectors from a
different one — cosine between two embedding spaces is noise that looks like a
score. Change embedding provider and you must re-run `npm run ingest`.

**If the model fails, the assistant does not.** A provider that is down,
rate-limited or out of free quota degrades to quoting his notes, with a line
saying so. Retrieval already succeeded at that point, so there is no reason to
show an error.

### Running it with a key

```bash
npm run verify-key    # one real call per provider — do this first
npm run ingest        # rebuilds the index, adding vectors if a key is present
npm start
npm run live-qa       # real questions through the real model (uses quota)
npm run models        # what models will this key actually accept?
```

`verify-key` exists because a bad model name, a rejected key and a rate limit all
look alike from the outside, and running `ingest` first sends 81 chunks to an
endpoint that was going to reject them anyway.

### What the free tier actually gives you

Measured on a real free key with `npm run quota` — not taken from documentation,
which changes:

**Free limits are per MODEL, and they differ enormously.**

| model | limit | usable publicly? |
|---|---|---|
| `gemini-3.6-flash` | **20 requests per day** | no |
| `gemini-3.5-flash` | 5 requests per minute | marginal |
| `gemini-3.5-flash-lite` | **15 requests per minute** | yes — the default |
| `gemini-3.1-flash-lite` | 15 requests per minute | yes |

The lite models stop on a per-*minute* limit rather than a daily one. That is the
difference between a site that answers all day and one that stops after twenty
questions. It is also the reason the default is a lite model rather than the
newest one.

**Cost of one question**, measured: 1 chat call + 1 embedding call, roughly 940
tokens in and 380 out, answered in about 2 seconds. Two things reduce it — repeat
questions reuse a cached embedding, and a refused question never reaches the
model at all.

**The provider limit is per project, not per visitor.** `limits.providerRequestsPerMinute`
(12, under the measured 15) is a global ceiling: past it, questions are answered
by quoting his notes with a "busy right now" note rather than queueing calls that
would be refused. Verified by bursting 16 requests from 16 addresses — 12
answered, 4 quoted, no 429s.

```bash
npm run quota           # cost per question, measured live
npm run quota -- probe  # burst until refused, and name the quota that stopped it
```

### Two Gemini traps worth knowing

**Model names go stale, and ListModels lies a little.** `gemini-2.0-flash` and
`text-embedding-004` both 404'd. Then `gemini-2.5-flash` — which *is* listed —
returned "no longer available to new users". The working pair today is
`gemini-3.5-flash-lite` and `gemini-embedding-001`. When it breaks, run
`npm run models` and pick from what comes back.

**Current Gemini flash models are thinking models, and the reasoning comes out of
`maxTokens`.** It cannot be turned off — `thinkingConfig` returns 400. A trivial
prompt spent 189 thinking tokens to produce 6 tokens of answer, and real
questions here spend 300–2400. At the original 700-token budget a question could
spend the whole allowance thinking and return nothing, which surfaced as "the
model returned nothing" and pointed at the key rather than at the number. The
budget is now 2500. The default is
therefore a lite model, which does no visible thinking at all: answers land in
about 2 seconds instead of 8–13, and cost a third less. The larger budget stays
because a non-lite model would need it.

### What it knows

The knowledge base is about **him** — how he works, what he decides, what he
catches, what he refuses, what he is still learning. Client engagements appear
only as the setting for a call he made, never as company narrative, and never by
name.

Headings are written as the question a visitor would actually type ("Can he
code?", "What is he still learning?"), because retrieval splits at every heading
and heading matches are boosted.

### Working without an Anthropic key

Search needs no key; only the writing does. Without `ANTHROPIC_API_KEY` the
server **quotes him** instead of failing: it returns his own sentences from the
best-matching passage, with the markdown stripped, clearly labelled as a quote.

It also checks whether the visitor's words appear in that passage's heading. If
they do not, the label changes to "he has not written directly about that — this
is the closest passage." Without a model there is nothing to notice that "what
car does he drive" matched a passage about *driving demand generation*, so the
framing has to do that job.

The "AI-generated" disclaimer only appears when an answer actually was generated.

### How retrieval works

Two independent searches run over the same chunks and their **rankings** are fused
with Reciprocal Rank Fusion:

- **BM25** — keyword scoring. No key, no cost. Excellent on proper nouns
  ("Digimabble", "llms.txt"). Blind to paraphrase. Headings are indexed at 4×
  weight and get a further bonus when they contain the visitor's own words —
  without that, "can he code?" reduces to one term and loses to a passage that
  merely says "Claude Code" three times.
- **Vectors** — cosine similarity over embeddings. Needs `VOYAGE_API_KEY`. Handles
  "is he any good with Google?" → SEO. Weaker on rare names.

They are combined because each covers the other's blind spot. Ranks are fused rather
than scores, because BM25 scores are unbounded and cosine sits in [-1, 1] — averaging
them would let BM25 drown out the vectors entirely.

### Why the semantic floor is 0.72, not something lower

An embedding cosine is not a probability, and unrelated text does not score near
zero. Measured against this corpus with `gemini-embedding-001`:

| | cosine |
|---|---|
| real questions | 0.58 – 0.81 |
| complete nonsense | 0.50 – 0.63 |

Those ranges **overlap**. "Does he have a dog" scores 0.629; "tell me about the
corporate film" scores 0.584. A floor anywhere inside the overlap either refuses
real questions or answers nonsense — the first version was 0.45, which let every
off-topic question straight through and made refusal *worse* than keyword-only
search had been.

So the semantic half does not decide refusals. It only **rescues** a paraphrased
question that keyword search missed, which needs a floor above anything nonsense
reaches. Lexical carries the refusal decision, because BM25 genuinely returns
0.00 when no query term appears anywhere.

Re-measure with `node tools/calibrate-hybrid.mjs` after changing embedding model.
These numbers are model-specific.

### How it decides to refuse

**The refusal is not based on the fused score.** RRF scores depend only on rank, so
the top result always scores about the same whether it is a bullseye or the least bad
of a bad bunch — RRF has no way to express "nothing here is relevant". The decision
reads the raw BM25 and cosine scores, which do carry that signal.

Thresholds live in `config/assistant.js` under `retrieval`. Calibrate them against
real questions rather than guessing:

```bash
npm run calibrate    # raw scores for questions that should answer vs refuse
npm run probe        # which passages a question actually retrieves
npm run probe "your own question"
```

Re-run `calibrate` after adding documents — the right floor moves as the corpus grows.

Refusing happens **before** Claude is called, so an off-topic question costs nothing
and cannot be talked into a plausible invention.

One exception: a question made entirely of stopwords ("who is he?") gives keyword
search nothing to score, so it falls back to the opening sections of the résumé.
That fallback keys off an **empty query**, not an empty result — otherwise every
off-topic question would get the résumé's opening handed to it.

### Unwritten sections are excluded

`npm run ingest` skips any section whose body still starts with `TODO` and lists what
it skipped. This is not tidiness: an unwritten "salary expectations" section was
outranking the real answer for "does he know n8n", purely on shared common words, and
handing the model instructions-to-the-author as if they were facts.

Until you write them, the assistant answers those questions with "he has not written
about that" — which is true.

### Guardrails

`config/assistant.js` → `guardrails.rules` is injected verbatim into the system
prompt. It carries the résumé's honesty rules: no invented numbers, leads are
sourced-and-qualified, the 43→65 move was the client's implementation, and he directs
AI-assisted development rather than writing code. Edit with care — this is what keeps
the assistant from inventing a career in front of a recruiter.

`voice` is `"third"` on purpose. A first-person bot puts invented words in a real
person's mouth and a recruiter cannot tell which sentences he actually wrote.

### Abuse limits

The endpoint is public and every question costs money. `config/assistant.js` →
`limits` caps question length, history size, and requests per IP per minute and per
day. The rate limiter is in-memory, so it resets when the function goes cold and is
not shared across concurrent instances — a speed bump, not a wall. If it is ever
actually abused, move the counters to Vercel KV.

### Tests

```bash
npm run test-api          # handler: retrieval, refusal, method and size guards
node tools/test-model-call.mjs   # the Anthropic request shape, with fetch stubbed
```

The second one stubs `fetch`, so it verifies the outgoing request and asserts the key
never appears in the response body — without needing a real key.

## Honesty rules carried over from the résumé

The wording in `content.js` is the source of truth and mirrors the PDF. Keep it that
way:

- No traffic, ranking or engagement numbers.
- Leads are **sourced and qualified**, not converted.
- The 43 → 65 health-score move was **implemented by the client** off his findings.
- The skill meters are a self-assessment. The Skills window says so in its status
  bar; do not remove that line.
- The Audit Trainer's findings are **illustrative teaching examples, not client
  data**. The intro screen says so; keep it there.

## Files

```
index.html            page shell
styles/os.css         the whole OS: bevels, windows, taskbar, every app
config/theme.js       colour schemes, wallpapers, fonts, boot behaviour
config/content.js     every résumé string (shared with the platformer site)
config/desktop.js     icons, gallery, notepad text, the game's findings
src/main.js           boot: theme into CSS, build shell, run boot screen
src/os/wm.js          window manager — open, focus, drag, resize, min/max, close
src/os/shell.js       desktop icons, taskbar, Start menu, boot screen
src/os/iconart.js     16x16 pixel icons drawn from letter maps
src/os/mascotart.js   the mascot's 24x24 frames (generated — see tools/gen-mascot.mjs)
src/os/mascot.js      the corner launcher: balloon, idle animation, click
src/os/scheme.js      applies a colour scheme as CSS custom properties
src/os/wallpaper.js   generated tile patterns and scenes + the custom upload
src/apps/registry.js  the list of installed apps
src/apps/*.js         one file per app
future/               the 2026 3D site — see future/README.md
config/assistant.js   assistant settings, guardrails, synonyms, limits
knowledge/*.md        everything the assistant knows (00-resume.md is generated)
data/index.json       generated search index — never edit, never commit by hand
api/ask.js            the server: retrieve, then ask Claude. Holds the API key.
api/_retrieval.js     BM25 + cosine + rank fusion, shared by ingest and the API
tools/ingest.mjs      knowledge/ -> data/index.json
tools/dev-server.mjs  local server: static files AND /api in one process
tools/probe.mjs       what does this question retrieve?
tools/calibrate.mjs   set the refusal thresholds from data
tools/build-cv.mjs    content.js -> the PDF, auto-fitted to the page
tools/check-index.mjs publishing gate: no client names, no keys, no content drift
assets/               the PDF, and gallery images once they exist
vercel.json           static hosting config
```

## Deploy

On Vercel: import the repository, framework preset "Other", no build command, root
directory `desktop-resume`. `api/ask.js` is picked up automatically as a serverless
function; `vercel.json` pins `data/**` into its bundle so the search index ships with
it.

Add `ANTHROPIC_API_KEY` (and `VOYAGE_API_KEY` if you have one) under Settings →
Environment Variables. **Never put a key in `config/assistant.js` or anywhere under
`src/` — those are downloaded by every visitor.**

Re-run `npm run ingest` and commit `data/index.json` whenever you change anything in
`knowledge/`. The index is a build artefact, but it is committed on purpose: the
deploy has no build step to regenerate it.

## Notes on behaviour

- **Opening an icon**: double-click, as on a real desktop. A second single click on
  an already-selected icon also opens it, so nobody gets stuck. Enter works when an
  icon has keyboard focus; on touch, one tap opens.
- **The boot screen** runs once per visitor. Returning visitors skip straight to the
  desktop (`theme.skipBootOnReturn`), and anyone with "reduce motion" enabled never
  sees it. Clicking or pressing a key skips it.
- **The wallpaper and scheme choices** are stored in the visitor's own browser. A
  wallpaper they upload never leaves their machine.
- **Previewing a scheme does not commit it.** Picking one from the dropdown repaints
  only the preview pane; OK or Apply commits, Cancel puts back what was there.
- **On narrow screens** windows open maximised, and the icon grid reflows to rows.
