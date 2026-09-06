<!-- His operating doctrine. Every rule here came from a specific failure he
     caught in a real deliverable, which is why it is worth publishing: it is
     evidence of judgement, not a list of opinions.

     SAFE TO PUBLISH: no client is named or criticised anywhere in this file. -->

# How does he actually work with AI?

He does not write code and does not claim to. The division of labour is fixed:

- **His:** the brief, the creative direction, the architecture decision, the
  judgement calls, and the final call on every output.
- **The AI's:** research, structuring, prompt writing, build scripts, assembly,
  encoding, and holding context across weeks so nothing has to be re-explained.
- **His again, and this is where most of the value sits:** review. Frame by
  frame, finding by finding, line by line.

The pattern repeats through everything: he decides, the AI executes the
mechanical part, he reviews the real output, he corrects, repeat. Almost
nothing survives in its first form.

# What is his single most important professional principle?

Automated output is not automatically trustworthy.

The approach is never "the AI generated it, so it must be correct." It is "use
AI to increase throughput, then verify the output before it becomes a business
deliverable."

This is not a slogan. It is enforced with a labelling standard, a verification
block on every finding, and an automated gate that has to pass before anything
publishes.

# What is his evidence standard?

Every finding in a report he writes carries one of three labels:

- **Confirmed** — a script measured it. He fetched it and read it.
- **Likely** — reasoned from fetched content.
- **Unverified** — an assumption, and marked as one.

Client-facing work carries only the first two.

Every finding also ships with a **verify block**: for a visible problem, the
exact page URL plus the term to search for on it; for an invisible one — schema,
headers, canonicals, sitemap contents, indexability — the raw evidence quoted
inline plus a command or free browser tool that reproduces it.

The reason is practical: these reports get forwarded. A claim the reader cannot
check is worthless. A claim they check and find wrong is unrecoverable in front
of a client.

# What rules does he apply to reporting?

- **Run every command before publishing it.** A verification step that does not
  reproduce is worse than none.
- **Verify tool warnings before reporting them.** An HTTP 200 is not proof a
  file exists — and a file existing is not proof it is correct.
- **Never report "broken" from automation alone.** A headless browser failing to
  fire an IntersectionObserver is not evidence a feature is broken for a real
  visitor.
- **A finding that appears on 100% of pages should raise suspicion of the
  method, not confidence in the finding.**
- **Record what is already correct**, not only what is broken. It prevents
  regressions and it is why clients trust the rest of the report.
- **No invented numbers.** Name the tool that would supply the figure instead.
- **Never promise rankings.** Give ranges, and name the assumption.
- **Capture the baseline before changing anything** — the only step that cannot
  be done retroactively.
- **Compare like with like.** The same extraction method on both dates, or the
  trend is fabricated.
- **One brand per deliverable.** Never carry a fact between clients.

# What happened when a report was wrong?

He withdrew a completed technical report hours before an external agency was due
to see it.

The verification pass found that the render script extracted head tags with a
first-match-only selector, while the site emitted two sets — static defaults plus
correct per-route tags appended by the framework. Only the static set was ever
read. **Five findings were false, including the report's Critical.** Canonicals
were correct on 29 of 29 pages, not broken on all 29. The score was revised from
46 to 55 — in the client's favour.

He then documented fourteen categories of automated-tool false positive so the
same class of error could not reach a client again.

The lesson he wrote down from it: *a finding that appears on 100% of pages should
raise suspicion of the method, not confidence in the finding.*

# What kinds of false positive has he caught?

A representative register, all caught before a client saw them:

- **A contact form reported dead** — a headless browser had failed to mount a
  lazy-loaded bot-check widget. It worked fine for a real visitor. On a different
  site the same class of finding was re-tested and confirmed genuinely dead, so
  the rule is not "forms are never broken" — it is "an automated browser failing
  is not evidence."
- **A hero video blamed for destroying Core Web Vitals** — disproved by
  measurement. The page returned 99/100 mobile with a 2.1s LCP. "Big video means
  bad LCP" is intuitive, widely repeated, and was false there. It survived only
  as a data-cost finding, downgraded from Critical to High.
- **"1,182 images missing alt text"** — a valueless alt attribute is
  spec-equivalent to an empty one. The true count of genuinely missing alt
  attributes was zero.
- **"100% duplicate title tags"** — inline SVG icon-sprite accessible-name
  elements, sixteen in the document body and one in the head.
- **"Offer is missing price"** on a page that takes payment — the price was
  present, nested one level deeper than the checker looked, and valid.
- **A link checker reporting 1,204 broken outbound links** — all returning the
  same status from the same provider. That is bot blocking, not broken links.
- **`curl -L` reporting 200** — the flag follows redirects silently; the URL
  actually returned a clean 301.

A measurement trap also went into the record: a raw keyword count rose after a
client's fixes, implying a regression. It had not regressed — the extra matches
were inside newly added structured data. **Baseline comparisons must use the same
extraction method on both dates, or they fabricate trends.**

# How does he handle research sampling?

By checking the sample before trusting the study.

For a piece of original research on small-business websites, the first attempt
sourced its sample by web search and was thrown away — the search tool is
US-biased, and a query for Chennai businesses returned businesses *named*
"Chennai" in Massachusetts, Oregon and Qatar. He switched to OpenStreetMap via
the public Overpass API, taking businesses inside the city's administrative
boundary that carried a website tag.

The published study reports **aggregate figures only**. No business is named as
having a problem — these are real local businesses who did not ask to be audited,
and they are prospects. Sites that disallowed crawling were honoured and
excluded. The source data was credited under its licence and the page published
under Creative Commons so it can be cited.

# What are his rules for AI-generated creative?

Learned the hard way, each from a specific bad output:

- **He generates the images and video himself.** The AI writes prompts; it does
  not produce the visual assets. He owns the look.
- **Copy-pasteable or it does not count.** A prompt that has to be reformatted
  before pasting into the tool is not a delivered prompt.
- **Maximum detail and explicit beat-by-beat action direction.** Never a vague
  three-line prompt.
- **Total temporal consistency** — nothing appears, disappears, morphs,
  duplicates, warps or resizes mid-clip. This rule exists because he caught a
  train in one shot rendering as two trains, merging and resizing.
- **Two-phase generation for any new shot:** still prompt first, he generates the
  image, then the motion prompt is written against what is actually in frame.
  Never both at once.
- **Batches of five**, never a big dump.
- **Reuse before regenerating.** One inventory sweep across roughly 200 existing
  images cut a long regeneration list down to six genuinely new shots.
- **No glow, no neon, no bloom, no HDR over-processing, no plastic CGI sheen.**
  This is the single most repeated correction he gives, and it is what separates
  a real design from AI slop.
- **No fabricated metrics, ever.** Modest real proof beats grand invented proof.

# How does he brief design work?

- **Covers are reference-anchored remixes, not originals.** Keep the reference's
  composition, lighting and type treatment; change one identity-breaking detail
  so it is not recognisable as a copy; re-grade to the brand palette; swap the
  headline in using the reference's own type treatment rather than a fixed brand
  font.
- **Every slide must carry real value.** No half-empty slides, no blank space.
- **Variation within one system** — vary the base colour and the motif per deck,
  keep the accent constant. All-decks-look-the-same is a failure; so is every
  deck being its own design.
- **Design hierarchy and boldness**, so people actually read the slide.
- **The strip test:** remove the illustration. Is the idea still interesting in
  words alone? If not, the idea is the problem, not the artwork.
- **Do not start with design. Start with thinking.** Plan, research, find a
  unique idea, write, get the copy approved — *then* design.

# How does he think about content strategy?

- **Topical authority, not scattered posts.** In his own words: *"we need blogs
  which are interconnected under a big topic — if we pick a topic like AI
  automation we have to cover all the topics in it one by one, rather than
  posting 20 random blogs with no connections."*
- **Broad-match titles over niche ones.** He killed a plan targeting an obscure
  proper noun and replaced it with the widely-searched umbrella term, then pulled
  the volume data himself to prove the swap.
- **Word count is coverage, never quality.** Google states there is no preferred
  word count. A well-known analysis of 11.8 million results found no correlation
  between length and ranking position. And analysis of pages cited across AI
  Overviews shows citation skews *shorter* — 350 to 1,000 words takes far more
  citations than content over 2,000 words.
- **Never conclude that text is AI-written.** Detectors carry a high
  false-positive rate on non-native English writers, including Indian English.
  His systems report markers, counts and line numbers, and let a human read the
  passage.
- **Information gain.** Content has to add something that is not already on the
  first page of results, or there is no reason for it to exist.

# What does he do when the data does not exist?

He ships without the number and says so.

On one keyword research job the paid tool returned nothing — the account was out
of quota and the token was rejected. The document shipped with **no search-volume
or difficulty figures at all**, stated that at the top, explained what it would
take to get real ones, and delivered the structural finding instead: the client's
product names were built from ingredient words nobody searches for, measured
across all 43 product pages.

Shipping a document with a hole in it and a note explaining the hole is the
correct outcome. Filling the hole with a plausible number is not.

# How does he prefer to learn?

Identify a real problem, research the concept, build something, test it, use it
in a real workflow, document the result, improve the process. A portfolio-first
model rather than passive course consumption.

His standing instruction when learning something new: explain it in simple words
first, then teach the real terminology, and explain *why* we are doing it and
what benefit it produces — not just what to do.
