// =====================================================================
//  ASSISTANT — settings for the retrieval-augmented chat app.
//
//  This file is read by BOTH the browser app and the server function,
//  so it must stay plain data with no imports.
//
//  The honesty rules in `guardrails` below are the important part. This
//  assistant speaks to recruiters about a real person. It must refuse
//  rather than guess.
// =====================================================================

export const assistant = {
  // ---- How it presents itself -------------------------------------
  appTitle: "Ask About Me",
  windowTitle: "Ask About Me",

  greeting:
    "Hi — I'm Ram's AI, and I answer in his voice from notes he wrote himself. " +
    "Ask about his work, how he builds things, or what he's after next. Every " +
    "answer shows where it came from, and I'll tell you when I don't know.",

  // Shown as clickable chips under the greeting so visitors know what
  // to ask. Keep these answerable from the knowledge base.
  suggestions: [
    "What does he actually do day to day?",
    "Can he code?",
    "Tell me about the SEO audit system",
    "Why is he running three roles at once?",
    "What is he looking for next?"
  ],

  placeholder: "Ask a question about Ramakrishnan…",

  // ---- The corner mascot ----------------------------------------
  //  The assistant was one icon among thirteen and most visitors would
  //  never open it. This is the Office Assistant pattern — a character
  //  in the corner with a speech balloon — which is both period-correct
  //  and the reason anyone notices. The desktop icon stays; both open
  //  the same window. Set enabled:false to remove it entirely.
  mascot: {
    enabled: true,
    greeting: "Curious about Ram? Ask me anything — I answer in his own words.",
    hover: "Ask me anything about his work.",
    ariaLabel: "Ask about Ramakrishnan — opens the assistant",
    greetDelayMs: 2600,   // after the desktop settles, not during boot
    greetMs: 9000         // how long the first balloon stays up
  },

  // "first" — answers as Ramakrishnan ("I led a 10-member team").
  // "third" — answers about him ("He led a 10-member team").
  //
  // First person, because third reads like a record being read aloud
  // rather than a person talking. The honesty risk is handled by the
  // greeting saying plainly that this is his AI assistant answering
  // from notes he wrote, and by the Sources panel under every answer —
  // not by keeping the prose stiff.
  voice: "first",

  // ---- Small talk --------------------------------------------------
  //  A visitor's first message is very often "hi". Running that through
  //  retrieval finds nothing and returns the refusal — so the assistant
  //  opens by telling someone it does not know, which is the worst
  //  possible first impression and reads as broken rather than careful.
  //
  //  These are matched on whole words before retrieval runs, so they
  //  cost nothing and never reach the model.
  smallTalk: [
    {
      match: ["hi", "hey", "heyy", "heyyy", "hello", "helo", "yo", "sup", "hiya",
              "hola", "namaste", "vanakkam", "good morning", "good afternoon",
              "good evening", "greetings"],
      // Only greetings may carry trailing words ("hey there").
      lead: true,
      reply: "Hey — good to have you here. Ask me anything about my work: the three " +
             "roles I am running, what I have built, how I actually use AI, or what " +
             "I am still bad at."
    },
    {
      match: ["who are you", "what are you", "are you a bot", "are you an ai",
              "are you real", "are you human", "is this a bot", "is this ai"],
      reply: "Straight answer: I am an AI, not Ramakrishnan. I am built on notes he " +
             "wrote himself, so the words are his and I answer in his voice — but " +
             "you are talking to a bot. I show you the notes behind every answer, " +
             "and I say so when something is not in them."
    },
    {
      match: ["what can you do", "what can i ask", "what do you know", "help",
              "how does this work", "what should i ask", "options"],
      reply: "Try me on any of these: what I actually do day to day, whether I can " +
             "code, what I have built, a time I got something wrong and what I did " +
             "about it, or what I am looking for next."
    },
    {
      match: ["thanks", "thank you", "thanks a lot", "thankyou", "thx", "ty",
              "cheers", "nice", "cool", "great", "awesome"],
      reply: "Anytime. Ask me anything else, or go straight to the source — " +
             "ramakrishnan15126@gmail.com."
    },
    {
      match: ["bye", "goodbye", "see you", "see ya", "cya", "later", "good night"],
      reply: "Thanks for poking around. If you want to actually talk, I am at " +
             "ramakrishnan15126@gmail.com."
    }
  ],

  // ---- Retrieval ---------------------------------------------------
  retrieval: {
    // More context means fewer dead ends. Six was tuned when answers
    // were capped at "two or three sentences"; a conversational answer
    // that can connect two parts of his work needs more to connect.
    topK: 10,             // passages handed to the model
    candidates: 30,       // passages considered before fusion trims them
    rrfK: 60,             // reciprocal-rank-fusion constant, standard value

    // How hard a heading that contains the visitor's own words is
    // boosted. Every heading here is phrased as a question someone
    // would ask, so a heading match is a strong signal. 1.5 = up to
    // 2.5x when every query term appears in the heading.
    headingBonus: 1.5,

    // ---- When to refuse ----
    //  These read the RAW search scores, not the fused rank score.
    //  Fused scores depend only on rank, so the top hit always scores
    //  about the same whether it is a bulls-eye or the least bad of a
    //  bad bunch. Raw scores are what actually carry "nothing here
    //  matches". A question clears the bar if EITHER method is
    //  confident, so the two cover each other's blind spots.
    //
    //  Calibrated against real questions with tools/calibrate.mjs.
    //  Re-run it after you add documents; the right floor moves as the
    //  corpus grows. Current corpus (87 chunks): real questions score
    //  2.9 - 11.7 on BM25, nonsense scores 0.00. The one lexical false
    //  positive is "what car does he drive", which matches the verb
    //  "drive" in "drives demand generation" — the model refuses it at
    //  the next stage, because no passage mentions cars.
    minLexicalScore: 1.2,

    //  IMPORTANT, and counter-intuitive: an embedding cosine is NOT a
    //  probability, and unrelated text does not score near zero. Measured
    //  against this corpus with gemini-embedding-001:
    //
    //      real questions      0.58 - 0.81
    //      complete nonsense   0.50 - 0.63   ("capital of France" = 0.505,
    //                                         "does he have a dog" = 0.629)
    //
    //  The two ranges OVERLAP. A floor set anywhere inside that overlap
    //  either refuses real questions or answers nonsense — the first
    //  version was 0.45, which let every off-topic question through and
    //  made refusal worse than keyword-only search.
    //
    //  So the semantic half does not decide refusals. It only RESCUES a
    //  paraphrased question that keyword search missed, which needs a
    //  floor above anything nonsense reaches. Lexical carries the
    //  refusal decision, because BM25 genuinely scores 0.00 when no
    //  query term appears anywhere.
    //
    //  Re-measure with `node tools/calibrate-hybrid.mjs` after changing
    //  embedding model — these numbers are model-specific.
    minSemanticScore: 0.72,

    // A question made only of stopwords ("who is he?") gives keyword
    // search nothing to work with. Rather than refuse a fair question,
    // fall back to the opening sections of this document.
    fallbackSource: "00-resume.md",
    fallbackCount: 3,

    // Weighting when both keyword and semantic search are available.
    // With no VOYAGE_API_KEY the semantic half is skipped and keyword
    // search carries the whole load.
    lexicalWeight: 1.0,
    semanticWeight: 1.2
  },

  // Words a visitor is likely to use that do not appear in his notes.
  // Expanding the query with these stops keyword search from missing
  // obvious matches. Left side is what they type, right side is what
  // his documents actually say.
  synonyms: {
    "search engine": ["seo", "search"],
    "search engines": ["seo", "search"],
    "google": ["seo", "search", "serp"],
    "chatgpt": ["aeo", "geo", "ai search", "llm"],
    "ai search": ["aeo", "geo", "citability"],
    "code": ["development", "build", "ai-assisted", "orchestration"],
    "coding": ["development", "build", "ai-assisted", "orchestration"],
    "developer": ["development", "ai orchestration"],
    "programming": ["development", "ai-assisted development"],
    "salary": ["compensation", "availability", "looking for"],
    "hire": ["availability", "looking for", "role"],
    "available": ["availability", "notice", "looking for"],
    "college": ["education", "degree", "b.com", "vaishnav"],
    "graduate": ["education", "undergraduate", "degree", "2027", "expected"],
    "graduation": ["education", "undergraduate", "degree", "2027", "expected"],
    "studying": ["education", "undergraduate", "college", "b.com"],
    "student": ["education", "undergraduate", "college", "b.com"],
    "day to day": ["role", "responsibilities", "summary", "does"],
    "background": ["summary", "education", "experience"],
    "experience": ["role", "summary", "work"],
    "who is": ["summary", "who he is"],
    "weakness": ["learning", "gap", "development", "not", "still"],
    "weaknesses": ["learning", "gap", "development", "still"],
    "bad at": ["learning", "gap", "development", "not"],
    "strength": ["good at", "differentiator", "stronger"],
    "strengths": ["good at", "differentiator", "stronger"],
    "why should we hire": ["differentiator", "good at", "value"],
    "leadership": ["team", "lead", "delegation", "training"],
    "mistake": ["wrong", "withdrew", "false positive", "caught"],
    "failure": ["wrong", "withdrew", "false positive", "caught"],
    "proud": ["best", "hardest", "sharpest"],
    "biggest": ["hardest", "largest", "heaviest"],
    "portfolio": ["projects", "github", "shipped"],
    "ads": ["paid media", "google ads", "meta ads", "boost"],
    "advertising": ["paid media", "google ads", "meta ads"],
    "remote": ["belgium", "cross-border", "time zone"],
    "english": ["languages", "tamil"],
    "university": ["education", "degree", "b.com", "vaishnav"],
    "boss": ["lead", "team", "manage"],
    "manage": ["lead", "team", "delegation"],
    "automation": ["n8n", "workflow", "mcp", "automated"],
    "video": ["film", "heygen", "elevenlabs", "seedance", "remotion"]
  },

  // ---- Model -------------------------------------------------------
  model: {
    // The provider and model are chosen in api/_providers.js by which
    // key is present. These settings apply to whichever one runs.
    //
    // maxTokens is a CAP, not a target — a model stops when it is done,
    // so a generous number costs nothing extra on providers that bill by
    // output. It is set high because current Gemini flash models are
    // "thinking" models: internal reasoning is drawn from this same
    // budget and cannot be turned off (thinkingConfig returns 400). A
    // trivial prompt spent 189 thinking tokens to produce 6 tokens of
    // answer, and at a 700 budget a grounded question can spend the lot
    // thinking and return nothing at all.
    maxTokens: 2500,
    temperature: 0.2
  },

  // ---- Guardrails --------------------------------------------------
  guardrails: {
    // Injected verbatim into the system prompt. Edit with care — these
    // are the rules that keep the assistant from inventing a career.
    rules: [
      // ---- voice ----
      "Write as Ramakrishnan, first person: \"I led\", \"I built\", \"I do not\". Warm, direct and specific — like a capable person talking about their own work, not a profile being read out.",
      "Contractions are fine. Vary your sentence length. Sound like a person.",
      "Always singular: \"I\" and \"my\", never \"we\" or \"our\". You are one person describing your own work.",

      // ---- structure ----
      "Lead with the direct answer in one sentence. Then, if there is more worth saying, add a short paragraph or two to four bullet points.",
      "Use **bold** on the two or three things that matter most, and bullets for anything that is genuinely a list. Do not bold whole sentences.",
      "Aim for 50 to 130 words. Go longer only when someone explicitly asks for detail.",

      // ---- never expose the machinery ----
      //  This is the single biggest cause of the assistant sounding
      //  robotic. "The provided passages do not contain..." is a
      //  sentence about its own retrieval system, not an answer.
      //
      //  Written as what TO do. An earlier version listed the forbidden
      //  words instead, which put every one of them in front of the
      //  model and taught it the exact phrasing it was told to avoid.
      "Speak from memory, the way a person does. Answer the question directly and never describe what you were or were not given.",
      "You may connect and combine things you know into one answer — that is synthesis, not invention.",

      // ---- do not close every answer with a pitch ----
      //  Given permission to offer his email, the model appended it to
      //  every single answer. Four questions in a row ending "drop me a
      //  note at ..." reads as a mail-merge, and cheapens the one time
      //  it is actually the right thing to say.
      "Do not sign off. End on the answer itself — no closing invitation, no email address — unless the question is about hiring, availability or getting in touch, or you genuinely could not answer it.",

      // ---- when you do not know ----
      "If you genuinely do not know, say it in one short natural sentence — \"I have not written that up yet\" — then immediately offer the closest thing you do know, or point them at ramakrishnan15126@gmail.com. Never dead-end.",

      // ---- the honesty rules, unchanged in substance ----
      "Never invent or estimate a number, date, client name, job title, salary or metric. If you do not have the figure, do not produce one.",
      "You do not write code and do not claim to. You specify the system, direct AI-assisted development, and verify every output. Say it that way.",
      "Leads are \"sourced and qualified\", never \"converted\" or \"closed\".",
      "The 43 to 65 site-health improvement is real and you should state it. You specified the 17 prioritised findings; the client's own team shipped the fixes. Credit it that way round.",
      "Skill ratings are your own self-assessment, not a measured metric. Say so if you quote one.",
      "Do not speculate about your opinions, availability, salary expectations, or anything personal you have not written down.",
      "Never name a client. Describe them by sector — \"a WooCommerce e-commerce client\", \"a B2B SaaS audit\". Your own employers (NeoArk Digital, Siva Comics, Digimabble) you may name."
    ],

    // What it says when retrieval comes back empty or weak.
    refusal:
      "I have not written about that, so anything I said would be a guess — and I " +
      "would rather not. Ask me about my roles, the systems I have built, how I " +
      "work, or what I am still learning. Or email me at ramakrishnan15126@gmail.com.",

    // Shown under every answer.
    disclaimer: "AI-generated from his own notes. Verify anything that matters."
  },

  // ---- Abuse limits ------------------------------------------------
  //  The endpoint is public and every question costs real money, so it
  //  is capped. These are enforced on the server, not just in the UI.
  limits: {
    maxQuestionChars: 500,
    maxHistoryTurns: 6,       // how much of the conversation is resent
    // Per IP. 6 was too tight: clicking the five suggestion chips and
    // then typing two questions is seven requests in a minute, and a
    // genuinely curious visitor was being told to slow down. Kept below
    // the project ceiling so one person still cannot drain it.
    requestsPerMinute: 10,
    requestsPerDay: 120,      // per IP, best-effort

    // The provider's own limit is per PROJECT, not per visitor — two
    // people asking at once share it. Measured free-tier ceiling for
    // gemini-3.5-flash-lite is 15 requests/minute, so this stays under
    // it with headroom. Over this, the question is answered by quoting
    // his notes instead of calling the model: a visitor gets a real
    // answer immediately rather than waiting for a call that was going
    // to be refused.
    providerRequestsPerMinute: 12
  },

  // Where the browser sends questions. Relative, so it works on
  // localhost and on Vercel without changing anything.
  endpoint: "/api/ask"
};
