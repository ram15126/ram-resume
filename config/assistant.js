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
    "I answer questions about Ramakrishnan using only what he has written about " +
    "himself. Ask about his roles, his projects, how he works, or what he is " +
    "looking for. If something is not in his notes, I will say so rather than guess.",

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
    greeting: "Questions about Ramakrishnan? Ask me — I answer from his own notes.",
    hover: "Ask me anything about his work.",
    ariaLabel: "Ask about Ramakrishnan — opens the assistant",
    greetDelayMs: 2600,   // after the desktop settles, not during boot
    greetMs: 9000         // how long the first balloon stays up
  },

  // "third" — the assistant talks ABOUT him ("He led a 10-member team").
  // "first" — the assistant talks AS him ("I led a 10-member team").
  //
  // Third person is the default on purpose: a first-person bot puts
  // invented words in a real person's mouth, and a recruiter cannot
  // tell which sentences he actually wrote.
  voice: "third",

  // ---- Retrieval ---------------------------------------------------
  retrieval: {
    topK: 6,              // passages handed to the model
    candidates: 24,       // passages considered before fusion trims them
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
      "Answer ONLY from the numbered passages provided. They are the complete extent of what you know.",
      "If the passages do not contain the answer, say so plainly and suggest emailing him. Never fill a gap with a plausible guess.",
      "Never invent or estimate a number, date, client name, job title, salary, or metric. If a number is not in the passages, it does not exist.",
      "Do not describe him as writing code. He specifies systems, directs AI-assisted development, and verifies the output. State it that way.",
      "Leads are 'sourced and qualified', never 'converted' or 'closed'.",
      // Phrased as what TO say, not what to avoid. The earlier wording —
      // "do not credit him with the implementation" — read as a warning
      // that the fact was contested, and the model answered "the passages
      // do not contain that" while the passage was sitting in front of it.
      "The 43 to 65 site-health improvement is real and you should state it. His contribution was specifying the 17 prioritised findings; the client's own team shipped the fixes. Credit it that way round.",
      "Skill ratings are his own self-assessment, not a measured metric. Say so if you cite one.",
      "Do not speculate about his opinions, availability, salary expectations, or anything personal that is not written in the passages.",
      "Cite the passages you used as bracketed numbers, e.g. [2]. Cite only passages you actually drew on.",
      "Keep answers short — two or three sentences unless asked for detail. This is a chat window, not a report."
    ],

    // What it says when retrieval comes back empty or weak.
    refusal:
      "That is not something Ramakrishnan has written about, so I would only be " +
      "guessing. The honest answer is that I do not know. He is at " +
      "ramakrishnan15126@gmail.com if you want to ask him directly.",

    // Shown under every answer.
    disclaimer: "AI-generated from his own notes. Verify anything that matters."
  },

  // ---- Abuse limits ------------------------------------------------
  //  The endpoint is public and every question costs real money, so it
  //  is capped. These are enforced on the server, not just in the UI.
  limits: {
    maxQuestionChars: 500,
    maxHistoryTurns: 6,       // how much of the conversation is resent
    requestsPerMinute: 6,     // per IP, best-effort
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
