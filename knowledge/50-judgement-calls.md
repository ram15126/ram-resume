<!-- Decisions he made and why. The subject of every section is HIM — what
     he decided, what he caught, what he refused — not what a client's
     website had wrong with it.

     Client work appears only as the setting for a call he made. No client
     is named. `npm run check` fails the build if one gets in. -->

# What is the best decision he has made under pressure?

He withdrew a completed technical report hours before an external agency was due
to see it.

He had run a verification pass on his own finished work and found the extraction
method was reading only the first match of each tag, while the site emitted two
sets. Five findings were false, including the report's headline Critical.

He pulled it, corrected the score in the client's favour, and documented fourteen
categories of automated-tool false positive so the same class of error could not
reach anyone again.

The judgement: a technically impressive report built on unreliable evidence is
worth less than no report.

# What does he do that most people at his level do not?

He checks his own tools before he trusts them.

Most of the value he has added on client work is findings he **stopped**, not
findings he produced. A report withdrawn. A contact form reported dead that he
proved worked. A hero video blamed for bad performance that measurement cleared.
A sampling method thrown away because it returned businesses on three other
continents.

He describes the habit as: automated output is not automatically trustworthy.

# When has he been right against the machine?

An audit reported a client's contact form as permanently broken. He challenged
it, tested it himself, and settled it in one line: *"it worked for me — I think
it didn't work for you because you're an AI."*

He was right. A headless browser had failed to mount a lazy-loaded bot-check
widget. That became a standing rule: an automated browser failing is not evidence
a feature is broken for a real visitor.

He is careful about the limit of that rule too. On a different site the same
class of finding was re-tested and confirmed genuinely dead. The rule is not
"forms are never broken."

# What has he refused to ship?

- **A number he could not source.** A keyword research job where the paid tool
  returned nothing. The document shipped with no volume figures at all, said so
  at the top, and delivered a structural finding instead.
- **A price page with prices.** A client had not supplied rates, and inventing
  them publishes a quote every prospect would hold them to. The page explains how
  pricing is structured, and the data file carries a written warning not to fill
  it from competitors' published rates.
- **Service-by-location pages.** Seven service pages rather than thirty-five
  hybrids, avoiding the doorway-page pattern that gets small agencies suppressed.
- **Creative the product could not back up.** He audited a client's shipped app
  against the positioning that had been agreed, found the product contradicted
  it, and halted the campaign until the product caught up.

# Has he overruled his own team?

Twice on the same brief, both times arguing from research rather than taste.

He cut a comparison to an international category leader out of consumer creative:
there was no competitor in that category in the city, so there was no rival
position in a customer's head to differentiate against. **The job was category
education, not differentiation.**

Then he threw out the audience segmentation as a planning error. Segments like
"aware but not used" are not reachable for a new app with no pixel data and no
following. It became one audience across every post, differing by message rather
than by segment — because every post had to work for someone who had never heard
of the product.

# What is the hardest problem he has diagnosed?

A publishing site had almost nothing in search. Five weeks of reports had read it
as a content problem.

He got Search Console access and reframed it: **two pages indexed, thirty-two
not.** The drilldown showed all twenty URLs last crawled on 1 January 1970 — the
Unix epoch, the placeholder for *never*. Those pages had never been fetched at
all. A crawling problem, not a quality problem.

He then measured the cause live: every episode page made the crawler download
**29 MB across 21 images**, none resized, one lazy-loaded, none responsive. Not a
penalty, not an algorithm decision — a crawl budget exceeded roughly thirtyfold.

The part he insisted on, which most people would have skipped: three days later
nothing had moved, and the correct reading was not that the fix failed. **Nothing
had shipped.** He measured it — the images were byte-identical to five weeks
earlier. Three days of no movement is the expected result of no deployment.

# How does he handle a job he cannot finish cleanly?

He rescopes in writing rather than extrapolating.

On one audit the crawl tripped a host's rate limiter partway through. The
delivered report says exactly that: sitemap-wide findings are complete, URL-level
findings were verified on a named sample, and nothing is extrapolated from a
sample and presented as a total. Two candidate findings were dropped during
verification and listed under a "checked and cleared" heading.

# What does he do that is unusual for a marketer?

He builds the tool rather than working around its absence.

An audit took 45 minutes, so he asked why and then had a single-pass collector
written that probes the host, paces itself, writes incrementally and resumes.
A carousel batch kept breaking, so the fix was structural — a generator that
makes overlap impossible, plus a headless check that has to print OK before
anything is handed over.

Seven reusable skills exist for the same reason: he had already run each process
by hand often enough to know its failure modes.

# What does he think about AI-generated content?

That it is a production layer, not a strategy, and that its confident wrongness
is the main thing to design around.

Rules he enforces on his own AI work: he generates the images and video himself
rather than delegating them; prompts must be copy-pasteable or they are not
delivered; no glow, neon, bloom or plastic CGI, which is the AI tell; reuse the
inventory before regenerating; and **no fabricated metrics, ever**.

He also refuses to let a tool conclude that text is AI-written. Detectors carry a
high false-positive rate on non-native English writers, including Indian English.
His systems report markers and line numbers and let a human read the passage.

# What has he learned that contradicts standard advice?

- **Word count is coverage, not quality.** Google states there is no preferred
  length, and an analysis of 11.8 million results found no correlation with
  position. Analysis of pages cited in AI Overviews shows citation skews
  *shorter*.
- **Ranking posts by length surfaces the AI ones as "best."** On a site with
  mixed authorship it reliably calls the human essays thin.
- **A finding that appears on 100% of pages should make you suspect the method,
  not trust the finding.**
- **An HTTP 200 is not proof a file exists** — and a file existing is not proof
  it is correct.
