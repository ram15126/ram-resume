// =====================================================================
//  INGEST — reads knowledge/*.md, splits it into chunks, optionally
//  embeds them, and writes data/index.json.
//
//  Run it every time you change anything in knowledge/:
//
//      npm run ingest
//
//  Without VOYAGE_API_KEY it still produces a working keyword index.
//  With the key it adds vectors and search becomes hybrid.
// =====================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tokenize } from "../api/_retrieval.js";
import { EMBED_PROVIDERS, pick, embed, batchSize } from "../api/_providers.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const KNOWLEDGE = path.join(ROOT, "knowledge");
const OUT = path.join(ROOT, "data", "index.json");

// Chunk sizing. Small enough that a passage is about one idea, big
// enough that it still makes sense pulled out on its own.
const TARGET_CHARS = 900;
const OVERLAP_CHARS = 150;
const MIN_CHARS = 120;

// ------------------------------------------------------------ env file
//  Read .env.local without a dependency. Vercel injects real env vars
//  in production; this is only for running locally.
function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const file = path.join(ROOT, name);
    if (!fs.existsSync(file)) continue;
    fs.readFileSync(file, "utf8").split(/\r?\n/).forEach(function (line) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) return;
      const value = match[2].replace(/^["']|["']$/g, "");
      if (value && !process.env[match[1]]) process.env[match[1]] = value;
    });
  }
}

// -------------------------------------------------------------- chunking
/**
 * Split one markdown document by its headings, then split any section
 * that is still too long on paragraph boundaries.
 *
 * Splitting on headings rather than a blind character count matters:
 * a chunk that begins mid-sentence under no heading is unusable as a
 * cited passage, and the heading is what tells the model (and the
 * reader) what the passage is even about.
 */
/**
 * A section whose body is still an unwritten placeholder must not be
 * indexed. If it is, a question like "does he know n8n" can retrieve
 * the empty "salary expectations" section purely because both mention
 * common words — the placeholder outranks the real answer and the
 * model is handed instructions-to-the-author as if they were facts.
 *
 * Skipping them means an unwritten section is answered with an honest
 * "he has not written about that", which is correct.
 */
function isPlaceholder(body) {
  const stripped = body.replace(/<!--[\s\S]*?-->/g, "").trim();
  if (!stripped) return true;
  return /^TODO\b/i.test(stripped);
}

export function chunkMarkdown(text, source, skipped) {
  const lines = text.split(/\r?\n/);
  const sections = [];
  let heading = "";
  let buffer = [];

  function flush() {
    const body = buffer.join("\n").replace(/<!--[\s\S]*?-->/g, "").trim();
    if (!body) { buffer = []; return; }
    if (isPlaceholder(body)) {
      skipped.push(source + " :: " + (heading || "(no heading)"));
      buffer = [];
      return;
    }
    sections.push({ heading: heading, body: body });
    buffer = [];
  }

  lines.forEach(function (line) {
    const match = line.match(/^(#{1,6})\s+(.*)$/);
    if (match) {
      flush();
      heading = match[2].trim();
    } else {
      buffer.push(line);
    }
  });
  flush();

  const chunks = [];
  sections.forEach(function (section) {
    if (section.body.length <= TARGET_CHARS) {
      chunks.push({ source: source, heading: section.heading, text: section.body });
      return;
    }

    const paragraphs = section.body.split(/\n\s*\n/);
    let current = "";
    const firstChunkOfSection = chunks.length;

    function push(body) {
      const trimmed = body.trim();
      if (trimmed.length >= MIN_CHARS) {
        chunks.push({ source: source, heading: section.heading, text: trimmed });
      } else if (trimmed && chunks.length > firstChunkOfSection) {
        // Too small to stand alone — glue it onto the previous chunk
        // rather than emitting a fragment nobody could cite.
        //
        // Only onto a chunk from THIS section. The check used to be
        // `chunks.length`, which happily appended a section's opening
        // line to the tail of the section before it — so one heading's
        // text ended up filed under a different heading's answer.
        chunks[chunks.length - 1].text += "\n" + trimmed;
      }
    }

    paragraphs.forEach(function (para) {
      // Split only when what we already have could stand on its own.
      // Testing `current` alone splits after a short opening line,
      // emitting a fragment and leaving the real content to start from
      // a truncated overlap — which is how a section came to begin
      // "plainly, because…" with its first word filed elsewhere.
      if ((current + "\n\n" + para).length > TARGET_CHARS &&
          current.length >= MIN_CHARS) {
        push(current);
        // Carry the tail of the previous chunk forward, so a sentence
        // straddling a boundary is still findable from both sides.
        //
        // Resume at a sentence boundary where there is one. Cutting at
        // the first space instead leaves a chunk starting "plainly,
        // because…" — harmless for scoring, but it reads as a broken
        // quote the moment that chunk is shown to someone.
        const tail = current.slice(-OVERLAP_CHARS);
        const sentence = tail.search(/(?<=[.!?])\s+(?=[A-Z])/);
        const cut = sentence !== -1 ? sentence : tail.indexOf(" ");
        current = (cut === -1 ? tail : tail.slice(cut + 1)).trimStart() + "\n\n" + para;
      } else {
        current = current ? current + "\n\n" + para : para;
      }
    });
    push(current);
  });

  return chunks;
}

// ------------------------------------------------------------ embeddings
async function embedAll(provider, texts) {
  const vectors = [];
  const BATCH = batchSize(provider);

  for (let i = 0; i < texts.length; i += BATCH) {
    const got = await embed(provider, texts.slice(i, i + BATCH), "document");
    got.forEach(function (v) {
      // Round hard. Four decimals is far more precision than cosine
      // similarity needs and it roughly halves the file, which matters
      // because the whole index is bundled into the serverless function.
      vectors.push(v.map(function (n) { return Math.round(n * 1e4) / 1e4; }));
    });
    process.stdout.write("  embedded " + Math.min(i + BATCH, texts.length) +
                         "/" + texts.length + "\r");
  }
  process.stdout.write("\n");
  return vectors;
}

// ------------------------------------------------------------------ main
async function main() {
  loadEnv();

  if (!fs.existsSync(KNOWLEDGE)) {
    console.error("No knowledge/ folder. Create it and add .md files.");
    process.exit(1);
  }

  // Only top-level files are indexed. Subdirectories — knowledge/_private/ in
  // particular — are deliberately skipped: that is where the internal source
  // documents live, which name every client brand and describe their websites'
  // defects. Anything indexed here can be quoted to a stranger by a public API,
  // so what goes in the index is a publishing decision, not a filing one.
  const entries = fs.readdirSync(KNOWLEDGE, { withFileTypes: true });
  const skippedDirs = entries
    .filter(function (e) { return e.isDirectory(); })
    .map(function (e) { return e.name; });

  const files = entries
    .filter(function (e) { return e.isFile(); })
    .map(function (e) { return e.name; })
    .filter(function (f) { return /\.(md|txt)$/i.test(f) && f.toLowerCase() !== "readme.md"; })
    .sort();

  if (skippedDirs.length) {
    console.log("  (not indexed: " + skippedDirs.map(function (d) { return d + "/"; }).join(", ") + ")");
  }

  if (!files.length) {
    console.error("knowledge/ has no .md or .txt files to index.");
    console.error("Add at least one, then run this again.");
    process.exit(1);
  }

  let chunks = [];
  const skipped = [];
  files.forEach(function (file) {
    const raw = fs.readFileSync(path.join(KNOWLEDGE, file), "utf8");
    const made = chunkMarkdown(raw, file, skipped);
    console.log("  " + file.padEnd(34) + made.length + " chunks");
    chunks = chunks.concat(made);
  });

  if (skipped.length) {
    console.log("\n  Skipped " + skipped.length + " section(s) still marked TODO:");
    skipped.forEach(function (s) { console.log("    - " + s); });
    console.log("  Write them and re-run. Until then the assistant will say");
    console.log("  he has not written about those, which is the honest answer.");
  }

  if (!chunks.length) {
    console.error("Nothing to index — the files are empty.");
    process.exit(1);
  }

  // ---- keyword statistics ----
  const df = {};
  let totalLength = 0;

  // Headings are weighted, because they are written as the question a
  // visitor would actually ask. Without this, "can he code?" loses its
  // exact heading match to a passage that merely says "Claude Code"
  // three times — the tool list beats the answer.
  const HEADING_WEIGHT = 4;

  const built = chunks.map(function (chunk) {
    const headingTerms = tokenize(chunk.heading);
    let terms = tokenize(chunk.text);
    for (let i = 0; i < HEADING_WEIGHT; i++) terms = terms.concat(headingTerms);
    const tf = {};
    terms.forEach(function (t) { tf[t] = (tf[t] || 0) + 1; });
    Object.keys(tf).forEach(function (t) { df[t] = (df[t] || 0) + 1; });
    totalLength += terms.length;
    return {
      source: chunk.source,
      heading: chunk.heading,
      text: chunk.text,
      tf: tf,
      length: terms.length
    };
  });

  // ---- optional vectors ----
  const provider = pick(EMBED_PROVIDERS);
  let hasVectors = false;

  if (provider) {
    console.log("\nEmbedding " + built.length + " chunks with " + provider.name +
                " (" + provider.model + ")…");
    try {
      const vectors = await embedAll(
        provider,
        built.map(function (c) { return (c.heading ? c.heading + "\n" : "") + c.text; })
      );
      built.forEach(function (c, i) { c.vector = vectors[i]; });
      hasVectors = true;
    } catch (err) {
      console.error("\nEmbedding failed: " + err.message);
      console.error("Writing a keyword-only index instead. Search still works.");
    }
  } else {
    console.log("\nNo embedding key found — building a keyword-only index.");
    console.log("Search works now. Add GEMINI_API_KEY (free) and re-run for");
    console.log("semantic search, which also matches paraphrased questions.");
  }

  const index = {
    builtAt: new Date().toISOString(),
    hasVectors: hasVectors,
    // Stamped so the query side can refuse to compare vectors made by a
    // different model. Cosine between two embedding spaces is noise that
    // looks like a score.
    embedProvider: hasVectors ? provider.id : null,
    embedModel: hasVectors ? provider.model : null,
    files: files,
    avgLength: totalLength / built.length,
    df: df,
    chunks: built
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(index));

  const kb = (fs.statSync(OUT).size / 1024).toFixed(0);
  console.log("\nWrote data/index.json");
  console.log("  " + built.length + " chunks from " + files.length + " files");
  console.log("  " + Object.keys(df).length + " unique terms");
  console.log("  vectors: " + (hasVectors ? "yes — " + provider.name + " / " + provider.model : "no"));
  console.log("  size: " + kb + " KB");
}

// Only run the pipeline when this file is executed directly. Without the
// guard, importing it to test chunkMarkdown re-runs the entire ingest.
const runDirectly = process.argv[1] &&
  pathToFileURL(process.argv[1]).href === import.meta.url;

if (runDirectly) {
  main().catch(function (err) {
    console.error(err);
    process.exit(1);
  });
}
