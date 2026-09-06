// =====================================================================
//  MARKDOWN — the small part of it the assistant actually emits.
//
//  Both front ends show the same answers: the Windows desktop's "Ask
//  About Me" window and the 2026 site's RAM.bot panel. They had their
//  own copies of everything else and drifted apart, so the renderer
//  lives here once and both import it.
//
//  Nothing in this file ever assigns innerHTML. Answers are written by
//  a language model and excerpts come from files on disk; building
//  nodes by hand means markup in either can only ever be characters on
//  screen. That is the whole security argument, and it is why the
//  grammar below is deliberately tiny.
// =====================================================================

const BULLET = /^([-*\u2022]|\d+[.)])\s+/;
const HEADING = /^#{1,6}\s+/;

function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Inline **bold**, *italic* and `code` inside one line of text. */
function renderInline(target, text) {
  const pattern = /\*\*([^*]+)\*\*|\*([^*\n]+)\*|`([^`]+)`/g;
  let last = 0;
  let m;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) {
      target.appendChild(document.createTextNode(text.slice(last, m.index)));
    }
    if (m[1] !== undefined) target.appendChild(make("strong", null, m[1]));
    else if (m[2] !== undefined) target.appendChild(make("em", null, m[2]));
    else target.appendChild(make("code", null, m[3]));
    last = pattern.lastIndex;
  }
  if (last < text.length) {
    target.appendChild(document.createTextNode(text.slice(last)));
  }
}

/**
 * Render an answer into `target`, replacing whatever was there.
 *
 * Blocks are separated by blank lines, but the model does not reliably
 * leave one before a list — "Here is what that looks like:" followed
 * straight by three bullets arrives as a single block. So each block is
 * walked line by line and consecutive bullets are gathered into a list
 * wherever they begin.
 */
export function renderMarkdown(target, text) {
  const source = String(text || "").trim();
  target.textContent = "";

  source.split(/\n{2,}/).forEach(function (block) {
    const lines = block.split("\n")
      .map(function (line) { return line.trim(); })
      .filter(Boolean);

    let i = 0;
    while (i < lines.length) {
      if (BULLET.test(lines[i])) {
        const ordered = /^\d/.test(lines[i]);
        const list = make(ordered ? "ol" : "ul", "md-list");
        while (i < lines.length && BULLET.test(lines[i])) {
          const item = document.createElement("li");
          renderInline(item, lines[i].replace(BULLET, ""));
          list.appendChild(item);
          i++;
        }
        target.appendChild(list);
        continue;
      }

      // A heading inside a three-sentence answer is over-formatting, so
      // it is demoted to a bold line rather than given its own scale.
      if (HEADING.test(lines[i])) {
        const head = make("p", "md-para");
        head.appendChild(make("strong", null, lines[i].replace(HEADING, "")));
        target.appendChild(head);
        i++;
        continue;
      }

      const run = [];
      while (i < lines.length && !BULLET.test(lines[i]) && !HEADING.test(lines[i])) {
        run.push(lines[i]);
        i++;
      }
      const para = make("p", "md-para");
      renderInline(para, run.join(" "));
      target.appendChild(para);
    }
  });

  // Never leave an empty bubble: if the text was nothing but markup
  // this renderer does not understand, show it raw.
  if (!target.childNodes.length) target.textContent = source;
}

/**
 * Turn one stored note into something a person can read.
 *
 * What comes back is markdown, cut into chunks by length, so a raw
 * excerpt can open mid-sentence and carry ** and > along with it. Shown
 * as it is stored it reads as a broken page rather than as evidence,
 * which defeats the point of showing it at all.
 */
export function cleanExcerpt(text) {
  let t = String(text || "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/^\s*#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*([-*\u2022]|\d+[.)])\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();

  // A chunk that opens mid-sentence starts at its first whole one
  // instead — "with drawn SVG art." is not evidence of anything.
  if (/^[a-z]/.test(t)) {
    const next = t.search(/[.!?]\s+[A-Z0-9]/);
    t = next === -1 ? "" : t.slice(next + 1).trim();
  }

  // End on a full stop rather than mid-word.
  if (t.length > 260) {
    const stop = t.lastIndexOf(". ", 260);
    t = stop > 90
      ? t.slice(0, stop + 1)
      : t.slice(0, 260).replace(/\s+\S*$/, "") + "\u2026";
  }
  return t;
}

/**
 * Group retrieved chunks into the sections they came from.
 *
 * Ten chunks routinely come from four sections. A visitor wants to know
 * which parts of his notes an answer rests on — not how the corpus
 * happens to be cut up, which file it lives in, or which half of the
 * search found it.
 */
export function toSections(passages) {
  const seen = {};
  const sections = [];
  (passages || []).forEach(function (p) {
    const title = p.heading || "From his notes";
    if (seen[title]) return;
    const text = cleanExcerpt(p.text);
    if (!text) return;
    seen[title] = true;
    sections.push({ title: title, text: text });
  });
  return sections;
}
