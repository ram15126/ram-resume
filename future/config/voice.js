// =====================================================================
//  VOICE — every word on the future site.
//
//  The FACTS here are identical to config/content.js and the PDF. Only
//  the delivery changed: shorter, blunter, first person, no hedging.
//
//  RULES THAT DO NOT BEND, whatever the tone:
//    - No traffic, ranking or engagement numbers. There aren't any
//      verified ones, and inventing them to sound impressive is the
//      exact thing this site claims not to do.
//    - Leads are SOURCED AND QUALIFIED. Not converted. Not closed.
//    - The 43 -> 65 health score was implemented BY THE CLIENT off his
//      findings. He specified, they shipped it.
//    - He directs AI-assisted development. He does not write the code.
//      The site says so out loud rather than blurring it.
//
//  Confidence comes from the specificity. Every number below is one he
//  can point at. That is what makes the swagger land instead of read
//  as noise.
// =====================================================================

export const voice = {
  name: "RAM",
  fullName: "Ramakrishnan S",
  origin: "Chennai, India",

  // ---- Landing ----
  hero: {
    kicker: "MARKETING · AI ORCHESTRATION · SEARCH",

    // One line, one breath. Set on a single line at every width down to
    // a small phone — if you swap it, keep it under about 45 characters
    // or it will start wrapping on narrow screens.
    //
    // Swap-ins that also work, if you want a different edge:
    //   "I build the engines. Campaigns are the easy part."
    //   "One marketer. The output of a team."
    //   "Marketing that ships like software."
    //   "I don't run campaigns. I build what runs them."
    line: "I build the machines that do the marketing.",

    sub: "Three marketing jobs at once. Ten people reporting to me. Nine client brands audited. One degree still in progress. Zero developers on payroll.",
    scrollHint: "SCROLL TO TRAVEL"
  },

  // ---- The stations you fly between, in order ----
  //  year   : shown on the HUD as you arrive
  //  kicker : small label above the title
  //  body   : the paragraphs
  //  items  : optional list — bullets, roles, projects
  stations: [
    {
      id: "who",
      year: 2026,
      kicker: "WHO",
      title: "RAM",

      // Display headings are set in Archivo Black at up to 92px. Keep
      // them SHORT — six or seven words. Anything longer stops being a
      // headline and becomes three screens of shouting.
      headline: "I scope it. AI builds it. I verify it.",

      body: [
        "I'm a Marketing Management undergraduate running three concurrent marketing roles — an agency I co-founded, an SEO and content programme, and remote demand generation for a healthcare AI product out of Belgium.",
        "Most marketers wait on a developer, a designer and an editor. I don't. I scope the system, direct AI to build it, and verify every output before it reaches a client — so a lead-generation engine, an audit tool and a two-and-a-half-minute film can all ship in the same quarter.",
        "The strategy, the judgement and the verification are mine. The typing isn't, and I'm not going to pretend it is."
      ],
      items: []
    },

    {
      id: "work",
      year: 2026,
      kicker: "THE WORK",
      title: "Three jobs. All current.",
      body: [
        "Not a career history. A calendar."
      ],
      items: [
        {
          label: "Co-Founder",
          org: "NeoArk Digital · Chennai",
          when: "Jan 2026 — now",
          lines: [
            "Full-service agency: SEO, social, performance, lead gen, branding, growth.",
            "I lead a 10-member team and own delegation, quality review and delivery across concurrent accounts.",
            "I'm the client's contact from requirement gathering to review call to retention.",
            "I took people with no technical background and trained them to independent delivery — AI fluency, agency process, AI-assisted website building, AI-driven lead gen.",
            "I designed the outbound engine — ICP, gap taxonomy, a 7-filter qualification funnel, an area × niche coverage grid — and directed its build. It sourced and qualified 104 B2B leads across 4 tracked funnels.",
            "Built the DM-to-lead stack: comment-keyword bot flows, 14 lead-magnet PDFs, multi-step outbound, personalised prospect-facing demo pages used as openers.",
            "Automated the recurring stuff — content workbooks, carousels, lead trackers, client PDF dossiers — down to a single command."
          ]
        },
        {
          label: "Marketing & SEO Intern",
          org: "Siva Comics · Chennai",
          when: "Jun 2026 — now",
          lines: [
            "SEO, AEO and GEO audit programmes across 9 client brands. Client-facing reports, prioritized and effort-ranked, every finding with a reproducible verification step attached.",
            "Specified 17 prioritized findings for a WordPress e-commerce client. They implemented them. Site health went 43 → 65.",
            "Topical maps, cluster architectures, content briefs, 30-day editorial plans with information-gain gating. AI-citation plans, answer blocks, llms.txt — so the content is citable by AI search.",
            "Directed a fully AI-generated 2.5-minute corporate heritage film: 25 scenes, 38 clips, ElevenLabs voiceover, 17 cuts, two client review calls.",
            "Built a 30-day Instagram content system and run social for multiple brands."
          ]
        },
        {
          label: "Marketing Intern",
          org: "Digimabble · Belgium, remote",
          when: "Jan 2026 — now",
          lines: [
            "Demand gen for Greenlane AI — a B2B healthcare SaaS marketing an AI assistant to doctors and private practices.",
            "I own the LinkedIn programme: positioning, planning, copy, publishing, aimed at healthcare decision-makers.",
            "Cold email sequences to doctors and practices — list building, segmentation, copy, sequencing, follow-up.",
            "Competitor positioning, category trends and audience research feeding content strategy and product messaging.",
            "Cross-border, cross-timezone, no hand-holding."
          ]
        }
      ]
    },

    {
      id: "built",
      year: 2026,
      kicker: "SHIPPED",
      title: "Five things I specified and shipped.",
      body: [
        "None of these existed before I scoped them. All of them work."
      ],
      items: [
        {
          label: "Multi-brand SEO / AEO / GEO agent system",
          org: "Claude Code skill · MCP integrations",
          when: "",
          lines: [
            "One auto-triggering router dispatching 37 on-demand playbooks over 78 evidence-collector scripts.",
            "Consolidated four overlapping open-source SEO repos into a single context-efficient skill, with full MIT and Apache-2.0 licence compliance.",
            "I wrote the evidence rules: every finding is labelled Confirmed, Likely or Unverified. Client reports carry measured claims only."
          ]
        },
        {
          label: "Free Website SEO Audit Tool",
          org: "Live on a client Next.js site",
          when: "",
          lines: [
            "A public lead-gen tool that runs a live on-page audit on any URL a visitor submits — titles, headings, canonicals, alt coverage, structured data, Open Graph, security headers, sitemap.",
            "Directed the build, the security hardening and the abuse rate limiting. Verified against a 98-test suite and a live run before release."
          ]
        },
        {
          label: "The State of Chennai SME Websites 2026",
          org: "Original research · OpenStreetMap / Overpass API",
          when: "",
          lines: [
            "161 Chennai small-business sites, sampled from OpenStreetMap, published CC BY 4.0 with Dataset schema as a citable link-earning asset.",
            "56% with no structured data. 61.6% missing image alt text. 94.4% missing a recommended security header. Aggregate only.",
            "I threw away my first sample — a web search that returned businesses on three other continents. Honoured robots.txt, excluded four sites that disallowed crawling."
          ]
        },
        {
          label: "Rocket Carousel Maker",
          org: "github.com/ram15126/Rocket-Carousel-Maker",
          when: "",
          lines: [
            "AI tool that turns structured content prompts into brand-ready social carousels.",
            "86 render-verified decks. 361 exported slides. Automated PNG, PDF and ZIP export, per-brand design systems.",
            "Cross-compatible with Claude Code, Codex, Cursor and Google Antigravity."
          ]
        },
        {
          label: "AI Video Editor",
          org: "github.com/ram15126",
          when: "",
          lines: [
            "A terminal video editor driven by natural language instead of a timeline.",
            "Effects, transitions, subtitles, text overlays, animatics, multi-clip assembly, contact sheets, automatic transcription."
          ]
        }
      ]
    },

    {
      id: "receipts",
      year: 2026,
      kicker: "RECEIPTS",
      title: "Numbers I can point at.",
      body: [
        "Every one of these is countable. That's the only reason it's here."
      ],
      items: [],
      stats: [
        { value: "9",    label: "client brands audited" },
        { value: "500+", label: "URLs covered" },
        { value: "10",   label: "people on my team" },
        { value: "104",  label: "B2B leads sourced and qualified" },
        { value: "161",  label: "sites in my own research study" },
        { value: "361",  label: "carousel slides shipped" },
        { value: "78",   label: "evidence collectors I specified" },
        { value: "38",   label: "clips in the film I directed" }
      ]
    },

    {
      id: "honest",
      year: 2026,
      kicker: "OPEN",
      title: "What I'm not.",
      body: [
        "Every portfolio tells you what it's good at. Here's the other half — because you'd find out in week one anyway, and I'd rather you hear it from me."
      ],
      items: [
        {
          label: "I'm not a developer.",
          org: "",
          when: "",
          lines: [
            "I have never written production code and I'm not going to imply otherwise. I specify the system, direct AI-assisted development, and verify the output. That's a real skill and it is not the same skill as engineering."
          ]
        },
        {
          label: "I don't have traffic graphs for you.",
          org: "",
          when: "",
          lines: [
            "Most of this work is recent enough that the numbers aren't in yet, and I won't show you a chart I can't defend. If you want ranking screenshots from someone three months into an engagement, you want somebody else."
          ]
        },
        {
          label: "I killed my own report four hours before release.",
          org: "",
          when: "",
          lines: [
            "A finished technical report, client waiting. Then I caught that five of its findings were artefacts of how the tool measured, not problems on the site. I pulled the whole thing.",
            "Then I documented 14 categories of automated-tool false positive so it could not happen to a client again. That's the day I'd point at if you asked me to prove I'm worth trusting with your account."
          ]
        },
        {
          label: "I'm early.",
          org: "",
          when: "",
          lines: [
            "B.Com Marketing Management, D.G. Vaishnav College, Chennai — graduating 2027. Coursework in brand management, international marketing, CRM, consumer behaviour and entrepreneurship. Design Thinking project leading research and user-insight synthesis for a campus plastic-reduction initiative.",
            "I'm not a ten-year veteran. I'm moving fast and I document everything. Judge me on the work above."
          ]
        }
      ]
    },

    {
      id: "stack",
      year: 2026,
      kicker: "STACK",
      title: "What I actually run.",
      body: [],
      items: [],
      groups: [
        {
          name: "Search & Content",
          tags: [
            "SEO", "AEO", "GEO", "AI citability", "answer blocks", "llms.txt",
            "topical maps", "topic clusters", "information gain", "search intent mapping",
            "keyword research", "on-page", "content briefs", "editorial planning",
            "competitor analysis", "GA4", "Search Console", "Google Ads", "Meta Ads",
            "CRO", "funnel analysis", "CTR", "CPC", "CPA", "ROAS"
          ]
        },
        {
          name: "AI & Automation",
          tags: [
            "Claude Code", "Codex", "Cursor", "Google Antigravity", "n8n", "MCP",
            "agent orchestration", "multi-agent systems", "skill authoring",
            "prompt engineering", "context engineering", "output verification",
            "GitHub", "Vercel", "Supabase", "Higgsfield", "HeyGen", "ElevenLabs",
            "Veo / Flow", "Seedance", "Nano Banana", "Remotion"
          ]
        },
        {
          name: "Demand & Brand",
          tags: [
            "demand generation", "B2B SaaS marketing", "lead generation",
            "cold email", "LinkedIn", "brand strategy", "positioning",
            "marketing psychology", "account management", "stakeholder reporting",
            "team training", "client retention"
          ]
        }
      ]
    }
  ],

  // ---- Closing ----
  contact: {
    kicker: "OPEN TO WORK",
    title: "Tell me what's broken.",
    body: "Marketing roles or freelance. Chennai, or remote anywhere. I reply to email fastest, and I'll tell you straight if I'm not the right person for it.",
    email: "ramakrishnan15126@gmail.com",
    phone: "+91 8124806650",
    linkedin: "https://linkedin.com/in/ramakrishnan15126",
    github: "https://github.com/ram15126",
    pdf: "../assets/Ramakrishnan_S_Resume.pdf",
    rewind: "../index.html?arrive=2006"
  },

  // ---- HUD ----
  hud: {
    fromYear: 2006,
    toYear: 2026,
    departLabel: "REWIND TO 2006"
  }
};
