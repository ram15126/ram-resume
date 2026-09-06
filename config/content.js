// =====================================================================
//  CONTENT — the ONLY file to edit for résumé text.
//
//  Source of truth: reconciled 6 Sep 2026 against four internal
//  work-memory documents (kept, unindexed, in knowledge/_private/).
//  Both websites and the PDF (`npm run cv`) render this file.
//
//  RULES:
//   - No traffic, ranking or engagement numbers.
//   - Leads are "sourced and qualified", never converted or closed.
//   - The 43→65 health-score move was implemented by the CLIENT off his
//     findings. Never credit him with the implementation.
//   - Employers are named. Clients are described by sector, never named —
//     both websites are public and render this file.
//   - Every number must be reproducible from the source documents. Where
//     two sources disagreed the conservative figure was kept; conflicts
//     are logged in knowledge/_private/FINDINGS-from-source-review.md.
//
//  HOUSE STYLE — this is a résumé, not a report:
//   - One idea per bullet. Aim for 15–25 words, hard ceiling around 30.
//   - Lead with the verb and the result. Cut every clause that only
//     explains what a reader can already infer.
//   - Bullets are ordered by importance, not chronology — the CV
//     generator trims from the bottom to fit the page.
//   - In `skills.all`, group related items under one label rather than
//     listing every variation. A 40-item wall of tags reads as padding.
// =====================================================================

export const content = {
  header: {
    name: "Ramakrishnan S",
    tagline: "AI-Driven Digital Marketing | SEO, AEO & GEO | Content Strategy & Marketing Automation",
    location: "Chennai, Tamil Nadu",
    email: "ramakrishnan15126@gmail.com",
    phone: "+91 8124806650",
    linkedin: "https://linkedin.com/in/ramakrishnan15126",
    github: "https://github.com/ram15126",
    pdf: "assets/Ramakrishnan_S_Resume.pdf"
  },

  summary:
    "Marketing Management undergraduate (B.Com, 2027) running three concurrent roles — agency leadership, SEO and content strategy, and remote B2B SaaS demand generation. Audited 13 brands across 500+ URLs. Leads a 10-member team. Builds marketing tools by specifying the system, directing the build, and verifying every output.",

  // The three signposts the character runs past in Level 1
  roles: [
    { label: "Co-Founder", org: "NeoArk Digital" },
    { label: "Marketing & SEO Intern", org: "Siva Comics" },
    { label: "Marketing Intern", org: "Digimabble" }
  ],

  // Skill bars: "level" is a self-rating from 1 to 5 shown as a filled bar.
  // Adjust freely — it is your own assessment, not a measured metric.
  skills: {
    groups: [
      {
        name: "Marketing, Content & Search",
        featured: [
          { label: "SEO / AEO / GEO", level: 5 },
          { label: "Content Strategy", level: 5 },
          { label: "Demand Generation", level: 4 },
          { label: "Keyword Research", level: 4 },
          { label: "GA4 & Search Console", level: 3 }
        ],
        all: [
          "Technical SEO", "On-Page SEO", "AEO & GEO", "AI citability & llms.txt",
          "Topical authority, maps & clustering", "Information gain",
          "Keyword research & search intent", "Content briefs & editorial planning",
          "Growth & demand generation", "B2B SaaS marketing",
          "Lead generation & cold email outreach", "LinkedIn & social media marketing",
          "Brand strategy & positioning", "Competitor & market analysis",
          "Google stack (GA4, Search Console, Ads, Keyword Planner)", "Meta Ads",
          "Funnel analysis & CRO", "Performance metrics (CTR, CPC, CPA, ROAS)"
        ]
      },
      {
        name: "AI & Automation",
        featured: [
          { label: "AI Agent Orchestration", level: 5 },
          { label: "Claude Code / Codex / Cursor", level: 5 },
          { label: "Prompt & Context Engineering", level: 5 },
          { label: "n8n & MCP Workflows", level: 4 },
          { label: "Generative Video Production", level: 4 }
        ],
        all: [
          "Agentic coding (Claude Code, Codex, Cursor, Antigravity)",
          "Multi-agent systems & agent routing", "AI skill authoring",
          "MCP integrations", "n8n workflow automation", "APIs & webhooks",
          "Prompt & context engineering", "AI output verification",
          "Generative video (Higgsfield, Veo, Seedance)",
          "Voice & avatar (ElevenLabs, HeyGen)",
          "Image generation (Nano Banana)", "Motion graphics (Remotion)",
          "Web stack (HTML, CSS, Node.js, SQL)",
          "Git, Vercel, Supabase"
        ]
      },
      {
        name: "Leadership & Delivery",
        featured: [
          { label: "Team Leadership", level: 4 },
          { label: "Client Communication", level: 5 },
          { label: "Coaching & Mentoring", level: 4 },
          { label: "Learning Agility", level: 5 },
          { label: "Stakeholder Reporting", level: 4 }
        ],
        all: [
          "Team leadership & delegation", "Coaching, mentoring & onboarding",
          "Client communication & account management",
          "Requirement gathering & scoping", "Stakeholder reporting",
          "Quality assurance & process documentation",
          "Cross-cultural remote collaboration", "Creative problem solving",
          "Learning agility & rapid upskilling"
        ]
      }
    ]
  },

  experience: [
    {
      company: "NeoArk Digital",
      role: "Co-Founder",
      location: "Chennai, Tamil Nadu",
      dates: "Jan 2026 – Present",
      sign: "NEOARK",
      bullets: [
        "Lead a 10-member team across concurrent client accounts — delegation, quality review and delivery.",
        "Built an outbound engine (ICP, 7-filter funnel, area × niche grid) that sourced and qualified 104 B2B leads across 4 funnels.",
        "Ran a marketplace launch end to end: market research, brand book, 30-day content calendar, LinkedIn kit and six carousels.",
        "Set the brand's positioning law and encoded it as an automated copy gate that blocks publishing on a banned-word fail.",
        "Audited a client's shipped app against agreed positioning and halted the creative when the product contradicted it.",
        "Trained non-technical team members to independent delivery in AI fluency, agency process and AI-assisted builds.",
        "Built the DM-to-lead stack: keyword bot flows, 14 lead magnets, outbound sequences and personalised demo pages.",
        "Built design systems for two agency brands, with headless render checks catching overflow and overlap before handoff.",
        "Automated recurring deliverables — workbooks, carousels, trackers, client dossiers — down to a single command.",
        "Primary client contact: requirements, review calls, progress reporting and retention."
      ]
    },
    {
      company: "Siva Comics",
      role: "Marketing & SEO Intern",
      location: "Chennai, Tamil Nadu",
      dates: "Jun 2026 – Present",
      sign: "SIVA",
      bullets: [
        "Ran SEO, AEO and GEO audits across 13 brands and 500+ URLs, every finding shipped with a reproducible verification step.",
        "Specified 17 prioritised findings for an e-commerce client; client-side implementation moved site health 43 → 65.",
        "Withdrew a finished report hours before release after catching five extraction artefacts, then documented 14 false-positive categories.",
        "Directed a 2-minute AI-generated heritage film for a global IT services client: 24 shots, 38 clips, 17 cuts, two review calls.",
        "Built topical maps, content briefs and 30-day editorial plans; authored AI-citation plans, answer blocks and llms.txt.",
        "Built a 30-day Instagram content system and manage social pages for multiple brands."
      ]
    },
    {
      company: "Digimabble",
      role: "Marketing Intern",
      location: "Belgium (Remote)",
      dates: "Jan 2026 – Present",
      sign: "DIGIMABBLE",
      bullets: [
        "Drive demand generation for Greenlane AI, a healthcare B2B SaaS product sold to doctors and private practices.",
        "Run the product's LinkedIn programme end to end: positioning, planning, copywriting and publishing.",
        "Write and run cold email sequences to medical practices — list building, segmentation, copy and follow-up.",
        "Research competitor positioning and audience segments to inform content strategy and messaging.",
        "Deploy AI workflows that shorten research and content production cycles."
      ]
    }
  ],

  projects: [
    {
      name: "Multi-Brand SEO / AEO / GEO Agent System",
      subtitle: "Claude Code skill · 1 router, 37 playbooks, 78 collectors",
      link: "",
      linkLabel: "",
      bullets: [
        "Merged four open-source SEO repos into one auto-triggering router that loads exactly one playbook per request.",
        "Every finding is labelled Confirmed, Likely or Unverified, so client reports carry only measured claims."
      ]
    },
    {
      name: "Free Website SEO Audit Tool",
      subtitle: "Shipped on a client Next.js site",
      link: "",
      linkLabel: "",
      bullets: [
        "Public lead-gen tool auditing any URL a visitor submits — titles, headings, canonicals, alt text, schema, security headers.",
        "Hardened against SSRF with per-hop redirect validation and fail-closed rate limiting; verified by a 98-test suite."
      ]
    },
    {
      name: "Rocket Carousel Maker",
      subtitle: "AI carousel generator",
      link: "https://github.com/ram15126/Rocket-Carousel-Maker",
      linkLabel: "github.com/ram15126/Rocket-Carousel-Maker",
      bullets: [
        "Generates brand-ready carousels from structured prompts, with per-brand design systems and PNG, PDF and ZIP export.",
        "86 render-verified decks and 361 slides; headless checks reject any slide that overflows, wraps or overlaps."
      ]
    },
    {
      name: "The State of Chennai SME Websites 2026",
      subtitle: "Original research · OpenStreetMap / Overpass API",
      link: "",
      linkLabel: "",
      bullets: [
        "Sampled 161 Chennai businesses from OpenStreetMap and audited 125, after discarding a web-search sample that returned three other continents.",
        "Published under CC BY 4.0 with Dataset schema; aggregate findings only, and four sites that disallowed crawling were excluded."
      ]
    },
    {
      name: "Seven Reusable AI Skills",
      subtitle: "Claude Code skills built from processes run manually first",
      link: "",
      linkLabel: "",
      bullets: [
        "A 30-day content engine, a carousel studio with an anti-slop gate, a lead-gen engine, a prompt router and a teaching skill.",
        "Each encodes rules learned from real corrections rather than from a template."
      ]
    },
    {
      name: "AI Video Editor",
      subtitle: "Prompt-based terminal video editor",
      link: "https://github.com/ram15126",
      linkLabel: "github.com/ram15126",
      bullets: [
        "Edits video from natural-language prompts instead of a timeline — effects, transitions, subtitles, overlays and multi-clip assembly.",
        "Covers animatics, contact sheets and automatic transcription for subtitles."
      ]
    }
  ],

  education: {
    school: "D.G. Vaishnav College",
    degree: "B.Com, Marketing Management",
    location: "Chennai, Tamil Nadu",
    dates: "2024 – 2027 (Expected)",
    bullets: [
      "Coursework: Marketing Management, Brand Management, International Marketing, CRM, Entrepreneurship, Consumer Behavior.",
      "Design Thinking project: led research, surveys and user-insight synthesis for a campus plastic-reduction initiative.",
      "CRM case studies on BMW, Toyota, Zepto and Montblanc; International Marketing analysis of Netflix."
    ]
  },

  training: [
    "Digital Marketing Workshop",
    "Design Thinking Workshop",
    "Social Media Marketing Workshop",
    "Meta Ads & Performance Marketing Training"
  ],

  languages: ["English", "Tamil"],

  interests: "AI-powered marketing, growth strategy, SEO/AEO/GEO, marketing automation, marketing analytics",

  contact: {
    heading: "Level complete!",
    line: "Thanks for playing. Let's talk about what your brand needs next."
  }
};
