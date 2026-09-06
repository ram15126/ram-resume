<!-- What he actually uses, with honest proficiency levels. The levels matter:
     listing a tool he has touched once next to one he has shipped with is how a
     CV stops being believable. -->

# What AI tools does he use, and how deeply?

**Daily, as the core of how he works:** Claude Code — AI-assisted development,
multi-agent workflows, skill authoring, workflow orchestration and output
verification. Also Codex, Cursor and Google Antigravity; he switches deliberately
by job, using the heavier reasoning models for planning and edit passes and the
faster ones for iterative work.

**Regularly:** Claude, ChatGPT, Gemini and Perplexity for research; MCP
integrations to connect agents to external tools, APIs and data sources; n8n for
workflow automation, webhooks, lead workflows and scheduled processes.

He builds his own reusable skills rather than only consuming tools — seven of
them, each distilled from a process he had run manually first.

# What creative and video tools does he use?

Higgsfield and Seedance for image-to-video, Google Flow / Veo for generation,
ElevenLabs for voice, HeyGen for avatars, Nano Banana Pro for stills, Remotion
for programmatic motion graphics, plus Canva and CapCut.

He generates the images and video himself rather than delegating them, and treats
AI as a production layer rather than as the strategy.

# What marketing and analytics tools does he use?

Google Search Console, Google Analytics 4, Google Keyword Planner, Google Ads,
Meta Ads, Mangools, PageSpeed Insights API, and OpenStreetMap's Overpass API for
research sampling.

Honest levels: Search Console and Keyword Planner are hands-on and have driven
real diagnoses. GA4 and advanced performance analytics are a development area
rather than an expert claim, and paid media is foundational rather than advanced.

# What technical tools does he work with?

HTML, CSS, Node.js fundamentals, SQL, REST APIs, webhooks, Git and GitHub,
Supabase, Vercel, Google Apps Script and Google Sheets automation. Python and
JavaScript build scripts, Playwright for headless verification, and ffmpeg for
video assembly.

The framing that is accurate: he specifies and directs this work and verifies the
result. He does not present himself as a software engineer.

# What has he learned about the tools that is not in any documentation?

A running list, each item costing real time before it was written down:

- On Windows, several collector scripts print status icons and crash mid-output
  on the default encoding, losing findings already collected — the encoding has to
  be set before running them.
- Git Bash mangles leading-slash arguments, so any script taking a URL path
  silently receives a Windows filesystem path instead, runs, reports success, and
  produces output where every URL is meaningless. No error, only wrong results.
- The PageSpeed API rate-limits anonymous calls hard enough to burn quota
  mid-audit; the key belongs in the environment.
- Blanket video stabilisation adds tremor to already-steady AI footage rather
  than removing it.
- Never crop a video when subtitles are burned in — cropping shifts the frame and
  throws centred captions off-centre.
- Stripping an SVG's definitions block wholesale deletes the style rules defining
  class fills, and every shape falls back to black. Strip only gradients and
  filters.
- A PDF library that works elsewhere may have no image encoder on a given
  machine; another produced 117 MB files for the same decks.
- Headless screenshots clip elements when the export routine re-parents slides
  into overflow-hidden frames — render with scripting disabled for static decks.

# What languages does he speak?

English and Tamil. He works remotely across time zones with a Belgium-based team,
and has built content in Tamil, English and French.
