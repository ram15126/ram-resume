// =====================================================================
//  RETRIEVAL — the search half of the RAG pipeline.
//
//  Two independent searches run over the same chunks:
//
//    BM25      keyword scoring. Always available, no API key, no cost.
//              Strong on names and jargon ("Digimabble", "llms.txt").
//              Blind to paraphrase.
//
//    Vectors   cosine similarity over embeddings. Needs VOYAGE_API_KEY.
//              Strong on paraphrase ("is he any good with Google?").
//              Weak on rare proper nouns it has never seen.
//
//  Their rankings are combined with Reciprocal Rank Fusion, which needs
//  no score calibration between the two — it only cares about position.
//  This is deliberately hybrid: either method alone has a blind spot
//  the other covers.
//
//  Shared by tools/ingest.mjs (build time) and api/ask.js (query time),
//  so tokenisation is guaranteed identical on both sides. If it drifted,
//  every keyword search would silently degrade.
// =====================================================================

const STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "can", "did",
  "do", "does", "for", "from", "had", "has", "have", "he", "her", "him", "his",
  "how", "i", "if", "in", "into", "is", "it", "its", "me", "my", "of", "on",
  "or", "our", "out", "she", "so", "some", "than", "that", "the", "their",
  "them", "then", "there", "these", "they", "this", "to", "up", "was", "we",
  "were", "what", "when", "where", "which", "who", "why", "will", "with",
  "would", "you", "your", "about", "tell", "please", "just", "any"
]);

/**
 * Very light suffix stripping. Not a real stemmer — a real one would
 * mangle the domain terms this corpus is full of (SEO, AEO, GEO, n8n).
 * This only folds the endings that actually cost us matches.
 */
function stem(word) {
  if (word.length <= 4) return word;
  for (const suffix of ["ingly", "edly", "ing", "ies", "ed", "es", "s"]) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      let base = word.slice(0, word.length - suffix.length);
      if (suffix === "ies") base += "y";
      return base;
    }
  }
  return word;
}

export function tokenize(text) {
  return String(text)
    .toLowerCase()
    // Keep dots and plus inside tokens so "llms.txt", "b.com", "c++"
    // survive; strip them when they are punctuation at an edge.
    .replace(/[^a-z0-9.+\-\s]/g, " ")
    .split(/\s+/)
    .map(function (t) { return t.replace(/^[.\-+]+|[.\-+]+$/g, ""); })
    .filter(function (t) { return t.length > 1 && !STOPWORDS.has(t); })
    .map(stem);
}

/** Add domain synonyms so a visitor's wording can reach his wording. */
export function expandQuery(question, synonyms) {
  const lower = " " + String(question).toLowerCase() + " ";
  const extra = [];
  Object.keys(synonyms || {}).forEach(function (phrase) {
    if (lower.indexOf(phrase) !== -1) extra.push(...synonyms[phrase]);
  });
  return tokenize(question).concat(extra.flatMap(tokenize));
}

// ------------------------------------------------------------------ BM25
//  Okapi BM25. k1 damps the effect of a term appearing many times in
//  one chunk; b controls how much a long chunk is penalised.
const K1 = 1.4;
const B = 0.75;

export function bm25(queryTerms, index) {
  const N = index.chunks.length;
  const scores = new Float64Array(N);

  queryTerms.forEach(function (term) {
    const df = index.df[term];
    if (!df) return;                        // term appears nowhere
    const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));

    for (let i = 0; i < N; i++) {
      const tf = index.chunks[i].tf[term];
      if (!tf) continue;
      const len = index.chunks[i].length;
      const norm = tf * (K1 + 1) /
        (tf + K1 * (1 - B + B * (len / index.avgLength)));
      scores[i] += idf * norm;
    }
  });

  return scores;
}

// ---------------------------------------------------------------- vectors
export function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// -------------------------------------------------------------------- RRF
/**
 * Reciprocal Rank Fusion. Each ranked list contributes weight/(k + rank)
 * to every document it ranks. Documents both lists agree on rise to the
 * top; a document only one list found can still surface if it ranked
 * very highly there.
 *
 * The point of RRF over score-averaging: BM25 scores are unbounded and
 * cosine scores sit in [-1, 1]. Averaging them would let BM25 drown out
 * the vectors entirely. Ranks are comparable; raw scores are not.
 */
export function fuse(rankedLists, k) {
  const totals = new Map();
  rankedLists.forEach(function (list) {
    list.order.forEach(function (docIndex, rank) {
      const add = list.weight / (k + rank + 1);
      totals.set(docIndex, (totals.get(docIndex) || 0) + add);
    });
  });
  return Array.from(totals.entries())
    .sort(function (a, b) { return b[1] - a[1]; })
    .map(function (entry) { return { index: entry[0], score: entry[1] }; });
}

/** Turn a score array into a ranked list of the best `limit` indexes. */
function rankTop(scores, limit) {
  const order = [];
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] > 0) order.push(i);
  }
  order.sort(function (a, b) { return scores[b] - scores[a]; });
  return order.slice(0, limit);
}

function present(index, docIndex, score, lexOrder, semOrder) {
  const chunk = index.chunks[docIndex];
  return {
    score: score,
    text: chunk.text,
    source: chunk.source,
    heading: chunk.heading,
    // Which method found it — surfaced in the UI so the retrieval is
    // inspectable rather than a black box.
    via: [
      lexOrder.indexOf(docIndex) !== -1 ? "keyword" : null,
      semOrder.indexOf(docIndex) !== -1 ? "meaning" : null
    ].filter(Boolean)
  };
}

/**
 * Run the full search.
 *
 * Returns { hits, confident, lexTop, semTop, mode }.
 *
 * `confident` is deliberately NOT derived from the fused score. RRF
 * scores are a function of rank alone, so the top result always scores
 * about 1/(k+1) whether it is a perfect match or the least bad of a bad
 * bunch — RRF has no way to say "nothing here is relevant". The refusal
 * decision therefore reads the RAW scores, which do carry that signal:
 * BM25 lands at 0 when no query term appears anywhere, and cosine falls
 * away when nothing is close in meaning.
 *
 * Fusion still decides the ORDER. It just does not decide whether we
 * should be answering at all.
 */
export function search(index, question, queryVector, settings, synonyms) {
  const terms = expandQuery(question, synonyms);
  const lists = [];
  let lexTop = 0;
  let semTop = 0;

  const lexScores = bm25(terms, index);

  // ---- heading-match bonus ----
  //  Every heading in the knowledge base is written as the question a
  //  visitor would actually ask, so a heading that contains the query's
  //  own words is a much stronger signal than a body that happens to
  //  repeat one of them.
  //
  //  Without this, "can he code?" loses. It reduces to the single term
  //  "code", synonym expansion widens it toward development and
  //  orchestration, and a passage listing "Claude Code, Codex, Cursor"
  //  outscores the section literally titled "Can he code?".
  //
  //  Scored on the RAW query terms, not the expanded ones — the whole
  //  point is that the visitor's own words matched, and expansion would
  //  hand the bonus to every passage the synonyms reach.
  const coreTerms = tokenize(question);
  if (coreTerms.length) {
    for (let i = 0; i < index.chunks.length; i++) {
      if (!lexScores[i]) continue;
      const headingTokens = tokenize(index.chunks[i].heading || "");
      if (!headingTokens.length) continue;
      let matched = 0;
      coreTerms.forEach(function (t) {
        if (headingTokens.indexOf(t) !== -1) matched += 1;
      });
      if (matched) {
        lexScores[i] *= 1 + settings.headingBonus * (matched / coreTerms.length);
      }
    }
  }

  for (const s of lexScores) if (s > lexTop) lexTop = s;
  const lexOrder = rankTop(lexScores, settings.candidates);
  if (lexOrder.length) {
    lists.push({ order: lexOrder, weight: settings.lexicalWeight });
  }

  let semOrder = [];
  if (queryVector && index.hasVectors) {
    const semScores = new Float64Array(index.chunks.length);
    for (let i = 0; i < index.chunks.length; i++) {
      const vec = index.chunks[i].vector;
      semScores[i] = vec ? cosine(queryVector, vec) : 0;
      if (semScores[i] > semTop) semTop = semScores[i];
    }
    semOrder = rankTop(semScores, settings.candidates);
    if (semOrder.length) {
      lists.push({ order: semOrder, weight: settings.semanticWeight });
    }
  }

  const confident =
    lexTop >= settings.minLexicalScore ||
    semTop >= settings.minSemanticScore;

  // A question made entirely of stopwords ("who is he?", "tell me about
  // him") tokenises to nothing, so BM25 has no term to score. That is a
  // perfectly reasonable question to ask a personal assistant, so fall
  // back to the opening sections of the résumé — which is what a human
  // would answer "who is he" with.
  //
  // The condition is `terms.length === 0`, NOT `lists.length === 0`.
  // Those look interchangeable and are not: "what is the capital of
  // France" produces real terms that simply match nothing, and must be
  // refused. Keying the fallback off an empty result instead of an
  // empty query would hand the résumé's opening to every off-topic
  // question ever asked.
  if (!terms.length) {
    const fallback = [];
    for (let i = 0; i < index.chunks.length && fallback.length < settings.fallbackCount; i++) {
      if (index.chunks[i].source === settings.fallbackSource) {
        fallback.push(present(index, i, 0, [], []));
      }
    }
    return {
      hits: fallback,
      confident: fallback.length > 0,
      lexTop: 0,
      semTop: 0,
      mode: "fallback"
    };
  }

  const fused = fuse(lists, settings.rrfK).slice(0, settings.topK);

  return {
    hits: fused.map(function (hit) {
      return present(index, hit.index, hit.score, lexOrder, semOrder);
    }),
    confident: confident,
    lexTop: lexTop,
    semTop: semTop,
    mode: semOrder.length ? "hybrid" : "keyword"
  };
}
