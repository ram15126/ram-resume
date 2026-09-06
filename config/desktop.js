// =====================================================================
//  DESKTOP — what sits on the desktop, and the content for the apps
//  that are NOT straight résumé sections (gallery, notepad, the game).
//
//  Résumé wording lives in config/content.js. Colours live in
//  config/theme.js. This file is the furniture in between.
// =====================================================================

// ---- Desktop icons, in the order they appear down the left column ----
//  app  : which app the icon opens (see src/apps/registry.js)
//  icon : which pixel icon to draw (see src/os/iconart.js)
export const desktopIcons = [
  // Travelling forward is the most important thing a visitor can do
  // here, so it sits first rather than thirteenth in the grid.
  { app: "timemachine", label: "Time Machine", icon: "timemachine" },
  { app: "assistant", label: "Ask About Me",  icon: "assistant" },
  { app: "about",     label: "About Me",      icon: "computer" },
  { app: "work",      label: "My Work",       icon: "folder" },
  { app: "projects",  label: "Projects",      icon: "document" },
  { app: "skills",    label: "Skills",        icon: "chart" },
  { app: "education", label: "Education",     icon: "book" },
  { app: "gallery",   label: "Gallery",       icon: "camera" },
  { app: "resume",    label: "Resume.pdf",    icon: "pdf" },
  { app: "contact",   label: "Contact Me",    icon: "envelope" },
  { app: "notepad",   label: "Notepad",       icon: "notepad" },
  { app: "paint",     label: "Paint",         icon: "paint" },
  { app: "audit",     label: "Audit Trainer", icon: "magnifier" },
  { app: "display",   label: "Display",       icon: "display" }
];

// ---- Start menu: extra links that are not desktop icons ----
export const startLinks = [
  { label: "LinkedIn", href: "https://linkedin.com/in/ramakrishnan15126" },
  { label: "GitHub",   href: "https://github.com/ram15126" },
  { label: "Email",    href: "mailto:ramakrishnan15126@gmail.com" }
];

// The 98 build put this down the left edge of the Start menu. XP has
// no such strip, so it is kept but hidden — see styles/os.css.
export const startMenuSpine = "RAM 06";

// The Contact window's own wording. content.js has a version of this
// written for the platformer ("Level complete! Thanks for playing"),
// which does not fit a desktop. Both sites keep their own closing line
// and share everything else.
export const contactCopy = {
  heading: "Let's talk",
  line: "I am open to marketing roles and freelance work, on-site in Chennai or remote. The fastest way to reach me is email."
};

// ---- Notepad: the document that is already open when you launch it ----
export const notepadDoc = {
  filename: "readme.txt",
  body: [
    "HOW THIS SITE WAS MADE",
    "======================",
    "",
    "I build the machines that do the marketing.",
    "",
    "Most marketers wait on a developer, a designer and an editor.",
    "I do not. Every tool, automation and site I ship - including",
    "this one - is built the same way: I scope the system, direct",
    "AI-assisted development, and verify every output before it",
    "reaches anyone. The strategy, the judgement and the",
    "verification are mine. The typing is not.",
    "",
    "That is also how I work for clients. It is why I can ship a",
    "lead-generation engine, an SEO audit tool and a 2.5-minute",
    "corporate film in the same quarter, without a developer.",
    "",
    "WHAT IS IN HERE",
    "---------------",
    "",
    "  About Me       who I am and what I am doing right now",
    "  My Work        three concurrent roles, what I actually did",
    "  Projects       five things I specified and shipped",
    "  Skills         marketing, AI / automation, leadership",
    "  Education      B.Com Marketing Management, 2027",
    "  Gallery        selected work",
    "  Audit Trainer  a small game about false positives",
    "  Resume.pdf     the one-page version, downloadable",
    "  Time Machine   travel forward to 2026",
    "",
    "Notepad and Paint work. Try them.",
    "",
    "- Ramakrishnan S",
    "  Chennai, Tamil Nadu"
  ].join("\n")
};

// ---- Gallery -------------------------------------------------------
//  Each item can carry an image. Until you drop real screenshots in,
//  the app draws a generated placeholder plate with the caption, so the
//  window is never empty or broken.
//
//  To use a real image: save it into assets/gallery/ and set
//  src: "assets/gallery/your-file.png"
export const galleryItems = [
  {
    title: "Corporate heritage film",
    meta: "Siva Comics — 2.5 min, 25 scenes, 38 clips",
    src: "",
    caption: "Fully AI-generated heritage film with ElevenLabs voiceover, directed through 17 cuts and two client review calls."
  },
  {
    title: "Free Website SEO Audit Tool",
    meta: "Shipped on a client Next.js site",
    src: "",
    caption: "A public lead-generation tool that runs a live on-page audit on any URL a visitor submits. Verified against a 98-test suite and a live run before release."
  },
  {
    title: "Rocket Carousel Maker",
    meta: "86 render-verified decks, 361 slides",
    src: "",
    caption: "AI carousel generator with automated PNG, PDF and ZIP export and per-brand design systems."
  },
  {
    title: "The State of Chennai SME Websites 2026",
    meta: "161 sites sampled from OpenStreetMap, CC BY 4.0",
    src: "",
    caption: "Original research published as a citable link-earning asset, with Dataset schema and aggregate findings only."
  },
  {
    title: "Outbound lead-generation engine",
    meta: "NeoArk Digital — 104 leads, 4 tracked funnels",
    src: "",
    caption: "ICP definition, gap taxonomy, a 7-filter qualification funnel and an area × niche coverage grid."
  },
  {
    title: "Multi-brand SEO / AEO / GEO agent system",
    meta: "1 router, 37 playbooks, 78 evidence collectors",
    src: "",
    caption: "Every finding labelled Confirmed, Likely or Unverified, so client reports carry only measured claims."
  }
];

// ---- Audit Trainer ---------------------------------------------------
//  A small game, not a real audit. You are shown raw output from an
//  automated SEO crawler and must decide whether each line is a real
//  finding or an artefact of how the tool measured it.
//
//  The examples below are illustrative teaching cases, not client data.
export const auditRounds = [
  {
    tool: "Crawler",
    finding: "412 pages missing meta description",
    detail: "Crawl completed in 3 seconds. 412 of 415 URLs returned no meta description tag.",
    real: false,
    why: "A 3-second crawl of 415 URLs means the crawler read raw HTML and never executed JavaScript. The descriptions are injected client-side. Re-run with rendering enabled before this goes anywhere near a report."
  },
  {
    tool: "Accessibility",
    finding: "61.6% of images have no alt attribute",
    detail: "Sampled every image element in the rendered DOM across 161 pages.",
    real: true,
    why: "Measured on the rendered DOM, across a defined sample, with the sample size stated. This one survives — a genuine accessibility and image-search gap."
  },
  {
    tool: "Link checker",
    finding: "1,204 broken outbound links",
    detail: "All 1,204 returned HTTP 403, every one from the same edge provider.",
    real: false,
    why: "A uniform 403 from a single provider is bot blocking, not a broken link. The pages load fine for a human. Reporting this sends the client chasing 1,204 non-problems."
  },
  {
    tool: "Duplicate content",
    finding: "88 pages flagged as duplicate content",
    detail: "Matched on full-page text, including header, navigation and footer.",
    real: false,
    why: "On a thin page the shared header, nav and footer are most of the text, so the tool is matching the template, not the content. Re-run against the main content region only."
  },
  {
    tool: "Structured data",
    finding: "No structured data on 56% of pages",
    detail: "Checked for JSON-LD, Microdata and RDFa in the rendered DOM.",
    real: true,
    why: "All three markup formats were checked, in the rendered DOM. Nothing was missed by looking in the wrong place. A real gap, worth a recommendation."
  },
  {
    tool: "Performance",
    finding: "LCP 8.4s — fails Core Web Vitals",
    detail: "Single lab run, throttled 3G, cold cache, from a datacentre 8,000 km away.",
    real: false,
    why: "One cold lab run over simulated 3G from the wrong continent is not the field experience. Check CrUX field data before telling a client their site fails."
  },
  {
    tool: "Security headers",
    finding: "94.4% missing a recommended security header",
    detail: "Read response headers directly from 161 origins.",
    real: true,
    why: "Response headers come straight from the origin. There is no rendering or sampling step to get wrong. Confirmed."
  },
  {
    tool: "Indexation",
    finding: "Site has 0 indexed pages",
    detail: "The site: search operator returned no results at time of check.",
    real: false,
    why: "The site: operator is not an index count and is unreliable at small scale. Search Console's Pages report is the source. A site: result should never appear in a deliverable."
  }
];

export const auditCopy = {
  intro: "Automated SEO tools are confidently wrong a great deal of the time. Below is raw crawler output. Your job is the one I actually do — decide what is real before it reaches a client.",
  closing: "I once pulled a finished technical report hours before release because five of its findings were artefacts of how the tool measured, not problems on the site. Then I documented 14 categories of false positive so they could not reach a client again."
};
