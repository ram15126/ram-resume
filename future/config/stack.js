// =====================================================================
//  STACK — the tools that fly out of the cursor, and the pull-quotes.
//
//  These are the two things you will want to edit most often, so they
//  live away from the résumé copy in voice.js.
// =====================================================================

// ---- Tools ----------------------------------------------------------
//  One of these is emitted at the pointer every few pixels of movement,
//  then drifts and fades. They are drawn as real HTML text, not canvas,
//  because the typography IS the effect — a tool name rendered as
//  pixels would look like a screenshot of the idea rather than the idea.
//
//  Order does not matter; they are cycled with a shuffle so the same
//  name never appears twice in a row.
export const tools = [
  // `icon` names a source and a key, tried in order until one loads:
  //
  //   si:<slug>    Simple Icons CDN. Already monochrome, so these are
  //                the crispest and are preferred wherever they exist.
  //   svgl:<slug>  svgl.app. Real SVG, in colour — flattened by CSS.
  //   fav:<domain> Google's favicon service. Raster, and the last
  //                resort: it is the only thing that covers brands too
  //                new or too small for any icon set.
  //
  // If a source 404s the image removes itself and the next is tried;
  // if all fail the cell falls back to a wordmark, which reads as
  // deliberate rather than broken. Every slug below was checked against
  // the live CDN — do not add one without checking it.
  //
  // NOTE ON THE LOGOS: these are other companies' trademarks, shown to
  // say "I use this". That is normal. What you must not do is arrange
  // them so they imply partnership or endorsement — the "Tools I run"
  // label above the wall is what keeps that clear.
  { name: "Claude Code",        icon: ["si:claude", "fav:anthropic.com"] },
  { name: "Codex",              icon: ["svgl:openai", "fav:openai.com"] },
  { name: "Cursor",             icon: ["si:cursor", "fav:cursor.com"] },
  { name: "Google Antigravity", icon: ["fav:antigravity.google"] },
  { name: "MCP",                icon: ["si:modelcontextprotocol"] },
  { name: "n8n",                icon: ["si:n8n", "svgl:n8n"] },
  { name: "GitHub",             icon: ["si:github"] },
  { name: "Vercel",             icon: ["si:vercel"] },
  { name: "Supabase",           icon: ["si:supabase"] },
  { name: "GA4",                icon: ["si:googleanalytics"] },
  { name: "Search Console",     icon: ["si:googlesearchconsole"] },
  { name: "Google Ads",         icon: ["si:googleads"] },
  { name: "Meta Ads",           icon: ["si:meta"] },
  { name: "Screaming Frog",     icon: ["fav:screamingfrog.co.uk"] },
  { name: "Schema.org",         icon: ["fav:schema.org"] },
  // llms.txt is a file convention, not a company. There is no mark to
  // show, and inventing one would be the only dishonest cell on the wall.
  { name: "llms.txt",           icon: [] },
  { name: "ElevenLabs",         icon: ["si:elevenlabs"] },
  { name: "HeyGen",             icon: ["fav:heygen.com"] },
  { name: "Higgsfield",         icon: ["fav:higgsfield.ai"] },
  { name: "Veo",                icon: ["si:googlegemini", "fav:deepmind.google"] },
  { name: "Seedance",           icon: ["fav:seed.bytedance.com"] },
  { name: "Nano Banana",        icon: ["fav:gemini.google.com"] },
  { name: "Remotion",           icon: ["svgl:remotion", "fav:remotion.dev"] },
  { name: "OpenStreetMap",      icon: ["si:openstreetmap"] },
  { name: "Figma",              icon: ["si:figma"] },
  { name: "Notion",             icon: ["si:notion"] }
];

// ---- Pull-quotes -----------------------------------------------------
//  Placeholders. Replace `text` with the real lines when you send them;
//  `attrib` can be empty and the line will simply sit on its own.
//
//  They are set in the display face at full width, one per screen, and
//  act as the beat between sections — the reference does the same thing
//  to stop a long scroll turning into a wall.
export const quotes = [
  {
    id: "q1",
    text: "Most marketers wait on a developer. I don't.",
    attrib: "",
    after: "intro"        // which section this follows
  },
  {
    id: "q2",
    text: "Every number here is one I can point at.",
    attrib: "",
    after: "shipped"
  },
  {
    id: "q3",
    text: "I killed my own report four hours before release.",
    attrib: "",
    after: "receipts"
  }
];

// ---- Layout caps -----------------------------------------------------
//  The résumé bullets are ordered by importance in voice.js, so the tail
//  is the part that can go. The PDF and the 98 desktop still carry every
//  line; this is only about what a scrolling page can hold before it
//  stops being read at all.
//
//  Raise `maxBulletsPerItem` if you would rather show everything.
export const layout = {
  maxBulletsPerItem: 4
};

// ---- Navigation ------------------------------------------------------
export const nav = [
  { label: "Work",     href: "#work" },
  { label: "Shipped",  href: "#shipped" },
  { label: "Open",     href: "#open" },
  { label: "Ask",      href: "#ask" },
  { label: "Contact",  href: "#contact" }
];
