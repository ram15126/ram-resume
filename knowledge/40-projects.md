<!-- The systems and tools he has built, in more depth than a CV bullet allows.

     NAMING POLICY IN THIS FILE: his own tools and his own published research are
     named. Client work is described by sector, never by client name, unless the
     client is one of his own employers. See knowledge/README.md. -->

# What is the multi-brand SEO / AEO / GEO agent system?

An evidence-based audit system he specified and had built as a Claude Code skill.

The engineering problem it solves: four open-source SEO repositories installed
side by side give roughly 34 skills whose descriptions all say some version of
"use this for SEO." They compete to trigger, the wrong one wins, and every
description loads into context every session forever.

The architecture he signed off on: **one auto-triggering router plus 37 playbooks
that do not auto-trigger.** The router reads the request, picks exactly one
playbook, and loads only that file.

What sits in it: the router skill, 37 on-demand playbooks, a large library of
Python evidence-collector scripts, reference rubrics, and JSON-LD schema
templates.

It merges four upstream repositories under MIT and Apache-2.0 licences, with the
Apache-2.0 modification disclosure written and every licence text retained. That
compliance work was deliberate, not incidental.

**Original work, not from any upstream:** the router and its evidence rules, the
code-shipping playbook for implementing fixes in Next.js, Astro, Vite and static
codebases — the thing none of the upstreams do — the intake and changelog
playbooks, the per-brand template, the installer, and two collector scripts.

# Why does that system label findings Confirmed, Likely or Unverified?

Because the whole point of an automated audit is throughput, and throughput
without a confidence signal is how a false finding reaches a client.

Every finding carries one of the three labels, and client-facing reports carry
only the first two. It is the mechanism that turns a fast tool into a
defensible deliverable.

# What is the site collector script?

One polite pass over a site, capturing head tags, body text, hashes, image-alt
statistics, structured data and placeholder markers in a **single request per
URL**.

It exists because an early audit took 45 minutes. He asked why, and then asked
that it not happen again. The script probes the host and auto-paces before any
bulk loop, uses a real browser user agent — never a spoofed search-engine one,
which trips some hosts' rate limiting — writes incrementally so an interrupt
keeps what it has, and supports resuming.

# What is the blog audit system?

A second router with ten playbooks: audit a post, audit a whole blog, information
gain, cluster mapping, authority, AI-citation readiness, an anti-slop gate,
briefs, writing, and reporting. It shares the SEO system's scripts and references
rather than duplicating them.

Three operating principles, two of which cut against normal SEO practice:

1. **Scripts measure, agents judge.** Every number traces to a collector run or a
   cited source.
2. **Length is not quality, and on some sites it inverts.** On a site with mixed
   human and AI authorship, ranking posts by length reliably surfaces the AI posts
   as "best" and the human essays as "thin." Word count is emitted under
   *coverage*, never under anything named *quality*.
3. **Never conclude that text is AI-written.** The system reports markers, counts
   and line numbers and lets a human read the passage.

# What is the free website SEO audit tool?

A public lead-generation tool, shipped live on a client's Next.js site, that runs
a real on-page audit on any URL a stranger pastes in: title and description
length, heading structure, canonicals, image alt coverage, structured data, Open
Graph, viewport, visible word count, security headers, and robots/sitemap
presence.

Every finding carries the same Confirmed/Likely labelling used in the paid
audits, so the tool is a live demonstration of the standard rather than a
giveaway.

**The security work is the part worth talking about.** The endpoint fetches
arbitrary stranger-supplied URLs, which is a textbook server-side request forgery
target. It shipped with an SSRF guard blocking private, loopback, link-local and
reserved address ranges including the cloud metadata address, with redirects
followed manually and re-validated at every hop; rate limiting per IP with the
address hashed and never stored raw, using a database-level lock to close the
check-then-insert race; **fail-closed** behaviour, so if the datastore is
unreachable requests are refused rather than waved through; a request timeout and
a size cap; and robots.txt honoured.

**Two real bugs were caught before shipping.** The first pass validated IPv6
addresses by matching the string, but the URL parser keeps the brackets and
canonicalises mapped addresses to hex — three of six IPv6 tests failed and the
guard was rewritten as a real parser over the 16-bit groups. The second was a DNS
resolver mismatch: the guard validated using one resolution path while the fetch
connected using another, and the two can answer differently. That one was caught
by live-network verification, not by the test suite — because the mocks matched
the code they were testing.

98 of 98 tests passing. One remaining limitation, a DNS-rebinding timing window,
is documented in the code as an accepted limitation rather than hidden.

# What is the Chennai SME websites research study?

Original research, published as a citable link-earning asset.

The pipeline: 493 OpenStreetMap records for businesses inside Chennai's
administrative boundary carrying a website tag, reduced to 364 unique domains,
then to 161 after excluding institutions, chains and directory listings, of which
125 were successfully audited.

Published findings, all measured: median score 86 out of 100; **56% have no
structured data at all; 94.4% are missing at least one recommended security
header; 61.6% have images with no alt text**; 15% serve zero visible text without
JavaScript; 10% returned a dead domain, independently re-verified with a separate
lookup on a sample.

What those sites get right was recorded too: 96% on HTTPS, 87% mobile-configured,
74% with a robots.txt.

**Aggregate figures only — no business is named as having a problem.** Four sites
disallowed crawling and were honoured. OpenStreetMap credited under its licence,
the page published under Creative Commons and marked up as a dataset so it reads
to machines as citable.

# What is Rocket Carousel Maker?

A public AI carousel generator at `github.com/ram15126/Rocket-Carousel-Maker`.
It produces brand-ready social carousels from structured content inputs, pairing
AI copy generation with templated visual design and per-brand design systems.

Output to date: **86 render-verified decks and 361 exported slides**, with
automated PNG, PDF and ZIP export. Cross-compatible with Claude Code, Codex,
Cursor and Google Antigravity.

The "render-verified" part is the interesting bit. The generator exists because of
a hard correction he sent — every carousel had render issues, with elements
overlapping or breaking. The fix was structural rather than cosmetic:

- The absolute-positioned decorative numeral behind the text was removed
  entirely; it was what collided with headlines.
- Two-tone headlines became two block spans with wrapping disabled, plus an
  auto-fit that shrinks each line until the widest fits. No-wrap plus auto-fit
  makes overlap structurally impossible rather than unlikely.
- Theme variables live on the document root, never on the deck element — the
  export routine re-parents each slide, so any variable scoped to the deck stops
  cascading and the accent colour and display font silently fall back. That bug
  broke both the preview and the export.
- **Headless verification before handoff:** every deck is loaded, fonts awaited,
  slides flattened to their true pixel size, and every slide auto-checked for
  vertical overflow, line wrap and line overlap. It has to print OK.

# What is the AI video editor?

A terminal-based video editor driven by natural-language prompts instead of a
timeline interface — effects, transitions, subtitles, text overlays, multi-clip
assembly, animatics, contact sheets, graphics compositing and automatic
transcription for subtitle generation.

It was built after a client asked what editor he was using. It is packaged as a
standalone tool with its own repository.

# What other reusable systems has he built?

Seven custom skills, each distilled from a process he had already run manually
and did not want to re-explain:

- **A content engine** that spins up a complete 30-day Instagram programme for
  any new brand — intake, generator, a five-sheet workbook, calendar and
  technique documents. Self-contained, so it never leaks one brand's files into
  another's.
- **A carousel studio** that turns a spec into one self-contained HTML deck with
  in-page PDF and PNG download, no build step and no server. Six themes, eight
  slide archetypes, a nine-point anti-slop gate and a design-judgement layer.
- **A lead-generation engine** covering the whole outbound flow for any brand —
  intake, tracker, targeting document, the qualification funnel, playbook and
  sequences.
- **A prompt enhancer** that takes a rough prompt and returns a routed,
  structured one with the workspace's standing rules auto-injected.
- **A teaching skill** that researches the current state of a platform before
  answering rather than working from stale memory, uses his own brands as the
  worked examples, ends every module with a hands-on assignment, and persists
  progress so a course resumes across sessions.
- **Two animation prompt systems** for stepped hand-painted comic-to-video work,
  carrying the frame rate, shutter angle, pacing and continuity rules in the
  prompt body because the tool exposes no parameter for them.

# What has he built for lead generation?

An outbound engine built around a **7-filter qualification funnel that drops
70–85% of a raw scrape.** Premium prospects only, location by location, never
volume.

The targeting constraint is the part that makes it work, and it came from knowing
his own team's strengths rather than from a template: their edge is brand
building, organic social content and smart boosting — not paid-ads scaling. So
the target is the **"good business, weak page"** sweet spot, where content and
brand work shows an obvious before-and-after. Polished pages with big followings
and real ad campaigns are deliberately skipped as out of lane.

**The verification method that mattered:** a raw map scrape produces false "no
website" results. Every candidate is checked, and only flagged as having its own
site if a result domain name-matches the business — directory and aggregator
domains are explicitly ignored. That caught 25–30% false negatives that would
have burned the team's time on unqualified pitches.

Across NeoArk Digital the engine has **sourced and qualified 104 B2B leads across
4 tracked funnels**, supported by ICP definition, a gap taxonomy, an area × niche
coverage grid, 14 lead-magnet PDFs, comment-keyword to DM bot flows, multi-step
outbound sequences, and personalised prospect-facing demo pages used as outreach
openers.

# Has he shipped production code?

He has directed it, and it has shipped.

Twelve batches went into one client's Next.js repository over two weeks, each
verified against a production build: giving blog articles real URLs, a design
pass, the free SEO audit tool, seven service detail pages plus a pricing page,
the original research report and a research hub, and replacing AI and stock
imagery with drawn SVG art.

**Two deliberate restraints on that build-out are worth stating**, because they
are decisions rather than omissions:

1. **The pricing page shipped with no price figures.** The client had not
   supplied rates, and inventing them publishes a quote every prospect would hold
   them to. The page explains how pricing is structured instead, and the data
   file carries a written warning not to populate it from competitors' published
   rates gathered as market context.
2. **No service-by-location pages.** Seven service pages, not thirty-five
   hybrids — avoiding the doorway-page pattern that gets small agencies
   suppressed.
