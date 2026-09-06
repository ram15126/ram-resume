// =====================================================================
//  SECTIONS — the page, built as normal flowing HTML.
//
//  The previous version stacked fixed panels and cross-faded them on
//  scroll progress. This does not: sections sit in ordinary document
//  flow and you scroll through them, because that is what the reference
//  does and it is what makes the smooth scroll feel like anything. A
//  fixed panel has nothing to glide past.
//
//  Three acts, and the colour inverts between them:
//    1  ink    — hero, intro
//    2  cream  — work, shipped, receipts, open, stack
//    3  ink    — contact
//
//  Every block carries data-reveal so main.js can bring it in as it
//  enters view. Children marked data-reveal-child stagger.
// =====================================================================

import { voice } from "../config/voice.js";
import { quotes, nav, tools, layout } from "../config/stack.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** An 11px uppercase eyebrow — the reference's only small-text style. */
function eyebrow(index, label) {
  // Wrapped, because the sticky element must be the wrapper: a sticky
  // box only travels within its own parent, so it needs a parent that
  // spans the whole section rather than just the label's own line.
  const wrap = el("div", "eyebrow-wrap");
  const p = el("p", "eyebrow");
  if (index) p.appendChild(el("span", "eyebrow-index", index));
  p.appendChild(el("span", null, label));
  wrap.appendChild(p);
  return wrap;
}

/** A display heading, split into words so each can rise separately. */
function display(text, className) {
  const h = el("h2", className || "display");
  // Chips must never fly over a headline; the effect belongs in the
  // negative space, not on top of the largest type on the page.
  h.setAttribute("data-trail-safe", "");
  text.split(" ").forEach(function (word, i) {
    const span = el("span", "word");
    span.style.setProperty("--w", String(i));
    span.appendChild(el("span", "word-inner", word));
    h.appendChild(span);
    h.appendChild(document.createTextNode(" "));
  });
  return h;
}

/*  An infinite marquee. The content is duplicated once and the track is
    translated by exactly -50%, so the seam lands on an identical copy
    and the loop is invisible. The reference runs its own at 40s linear;
    linear matters — any easing makes the wrap visible as a stutter. */
function buildMarquee(items, actClass) {
  const s = el("section", "act marquee-act " + (actClass || "act-ink"));
  const track = el("div", "marquee-track");
  for (let pass = 0; pass < 2; pass++) {
    const run = el("div", "marquee-run");
    run.setAttribute("aria-hidden", pass === 1 ? "true" : "false");
    items.forEach(function (t) {
      const cell = el("span", "marquee-item");
      const logo = toolLogo(t, "tool-logo marquee-logo");
      if (logo) cell.appendChild(logo);
      cell.appendChild(el("span", "marquee-word", t.name || t));
      run.appendChild(cell);
      run.appendChild(el("span", "marquee-dot", "·"));
    });
    track.appendChild(run);
  }
  s.appendChild(track);
  return s;
}

/*  Resolve one entry of a tool's icon chain into a URL.
    Simple Icons is asked for a BLACK mark, so it needs no flattening on
    the cream acts and only an invert on the ink ones. */
function iconURL(spec) {
  const i = spec.indexOf(":");
  const kind = spec.slice(0, i);
  const key = spec.slice(i + 1);
  if (kind === "si")   return "https://cdn.simpleicons.org/" + key + "/000000";
  if (kind === "svgl") return "https://svgl.app/library/" + key + ".svg";
  if (kind === "fav")  return "https://www.google.com/s2/favicons?domain=" + key + "&sz=128";
  return null;
}

/*  A brand mark, tried down the chain until one loads.

    Every source can fail — a CDN drops a slug, a domain changes — so a
    failure walks to the next entry and, when the chain runs out, removes
    the image so the cell shows its wordmark instead. A broken-image icon
    on a wall meant to build trust would do the opposite. */
function toolLogo(tool, className) {
  const chain = (tool && tool.icon) || [];
  if (!chain.length) return null;

  const img = document.createElement("img");
  img.className = className || "tool-logo";
  img.alt = "";
  img.loading = "lazy";
  img.decoding = "async";
  img.setAttribute("aria-hidden", "true");

  let step = 0;
  function load() {
    const url = iconURL(chain[step]);
    if (!url) { fail(); return; }
    // Simple Icons is already a flat monochrome mark; the other two are
    // in colour and get flattened by CSS, so the class says which.
    img.dataset.mono = chain[step].indexOf("si:") === 0 ? "1" : "0";
    img.src = url;
  }
  function fail() {
    step += 1;
    if (step < chain.length) { load(); return; }
    const cell = img.closest(".logo-cell");
    if (cell) cell.classList.add("no-mark");
    img.remove();
  }
  img.addEventListener("error", fail);
  load();
  return img;
}

/*  The logo wall. Trust device: it says "these are real tools I use"
    faster than a paragraph can. The label above it matters — it keeps
    the wall a statement of use, not an implied partnership. */
function buildLogoWall(items) {
  const wrap = el("div", "logo-wall");
  wrap.setAttribute("data-reveal-child", "");
  items.forEach(function (t, i) {
    const cell = el("div", "logo-cell");
    cell.style.setProperty("--w", String(i));
    const logo = toolLogo(t);
    if (logo) cell.appendChild(logo);
    else cell.classList.add("no-mark");
    cell.appendChild(el("span", "logo-name", t.name || t));
    wrap.appendChild(cell);
  });
  return wrap;
}

/*  The circular badge, bottom right. Text rides an SVG circle so it can
    rotate as one ring; the reference pops its own in on load. */
function buildBadge(label) {
  const a = el("a", "badge");
  a.href = "#contact";
  a.setAttribute("aria-label", "Open to work — jump to contact");
  const ring = label.toUpperCase() + " · ";
  a.innerHTML =
    '<svg viewBox="0 0 100 100" class="badge-ring" aria-hidden="true">' +
      '<defs><path id="badge-path" fill="none" ' +
        'd="M 50,50 m -34,0 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0"/></defs>' +
      '<text><textPath href="#badge-path" startOffset="0">' +
        (ring + ring) +
      '</textPath></text>' +
    '</svg>' +
    '<span class="badge-dot" aria-hidden="true"></span>';
  return a;
}

function section(id, actClass) {
  const s = el("section", "act " + actClass);
  s.id = id;
  const inner = el("div", "frame");
  s.appendChild(inner);
  return { section: s, inner: inner };
}

// ---------------------------------------------------------------- item
function buildItem(item, i) {
  const card = el("article", "item");
  card.setAttribute("data-reveal-child", "");
  card.setAttribute("data-trail-safe", "");
  card.style.setProperty("--w", String(i));

  const head = el("header", "item-head");
  head.appendChild(el("h3", "item-label", item.label));
  if (item.org) head.appendChild(el("p", "item-org", item.org));
  if (item.when) head.appendChild(el("p", "item-when", item.when));
  card.appendChild(head);

  if (item.lines && item.lines.length) {
    const ul = el("ul", "item-lines");
    item.lines.slice(0, layout.maxBulletsPerItem).forEach(function (line) {
      ul.appendChild(el("li", null, line));
    });
    card.appendChild(ul);
  }
  return card;
}

function buildStats(stats) {
  const grid = el("div", "stat-grid");
  stats.forEach(function (s, i) {
    const cell = el("div", "stat");
    cell.setAttribute("data-reveal-child", "");
    cell.style.setProperty("--w", String(i));
    cell.appendChild(el("span", "stat-value", s.value));
    cell.appendChild(el("span", "stat-label", s.label));
    grid.appendChild(cell);
  });
  return grid;
}

function buildGroups(groups) {
  const wrap = el("div", "stack-groups");
  groups.forEach(function (g, i) {
    const block = el("div", "stack-group");
    block.setAttribute("data-reveal-child", "");
    block.style.setProperty("--w", String(i));
    block.appendChild(el("h3", "stack-name", g.name));
    const tags = el("div", "tag-cloud");
    g.tags.forEach(function (t) { tags.appendChild(el("span", "tag", t)); });
    block.appendChild(tags);
    wrap.appendChild(block);
  });
  return wrap;
}

/** A full-width pull-quote — the beat between sections. */
function buildQuote(q) {
  const s = el("section", "act act-quote");
  s.setAttribute("data-trail-safe", "");
  s.id = "quote-" + q.id;
  s.setAttribute("data-reveal", "");
  const inner = el("div", "frame");
  const fig = el("figure", "quote");
  fig.appendChild(display(q.text, "display quote-text"));
  if (q.attrib) fig.appendChild(el("figcaption", "quote-attrib", q.attrib));
  inner.appendChild(fig);
  s.appendChild(inner);
  return s;
}

// ================================================================ build
export function buildPage(root) {
  // ---- nav ----
  const header = el("header", "nav");
  const mark = el("a", "nav-mark", voice.name);
  mark.href = "#hero";
  header.appendChild(mark);
  const links = el("nav", "nav-links");
  nav.forEach(function (n) {
    const a = el("a", "nav-link", n.label);
    a.href = n.href;
    // The assistant is a docked panel, not a section, so its nav entry
    // opens the panel rather than scrolling to an anchor that is not there.
    if (n.href === "#ask") a.setAttribute("data-open-ask", "");
    links.appendChild(a);
  });
  header.appendChild(links);
  root.appendChild(header);

  // ---- ACT 1 · ink ------------------------------------------------
  const hero = section("hero", "act-ink act-hero");
  hero.inner.appendChild(eyebrow("", voice.hero.kicker));
  const name = el("h1", "hero-name", voice.name);
  hero.inner.appendChild(name);
  hero.inner.appendChild(el("p", "hero-line", voice.hero.line));
  hero.inner.appendChild(el("p", "hero-sub", voice.hero.sub));
  const hint = el("p", "hero-hint", voice.hero.scrollHint);
  hero.inner.appendChild(hint);
  root.appendChild(hero.section);

  // ---- sections from voice.js -------------------------------------
  //  who + the closing contact are handled separately; the rest map
  //  straight across.
  const byId = {};
  voice.stations.forEach(function (st) { byId[st.id] = st; });

  // intro (ink) — the WHO statement, set large
  const who = byId.who;
  if (who) {
    const s = section("intro", "act-ink");
    s.section.setAttribute("data-reveal", "");
    s.inner.appendChild(eyebrow("01", who.kicker));
    s.inner.appendChild(display(who.headline || who.title));
    const rest = el("div", "body-cols");
    rest.setAttribute("data-trail-safe", "");
    // All of the body paragraphs now — the first one is no longer being
    // spent as a headline.
    who.body.forEach(function (p) {
      const col = el("p", "body-text");
      col.setAttribute("data-reveal-child", "");
      col.textContent = p;
      rest.appendChild(col);
    });
    s.inner.appendChild(rest);
    root.appendChild(s.section);
  }

  const quoteAfter = {};
  quotes.forEach(function (q) { quoteAfter[q.after] = q; });
  if (quoteAfter.intro) root.appendChild(buildQuote(quoteAfter.intro));

  // The stack, as a moving strip. It says "here is everything I run"
  // without spending a whole section on it.
  root.appendChild(buildMarquee(tools, "act-ink"));

  // ---- ACT 2 · cream ----------------------------------------------
  const creamOrder = ["work", "built", "receipts", "honest", "stack"];
  const numbering = { work: "02", built: "03", receipts: "04", honest: "05", stack: "06" };
  const anchor = { work: "work", built: "shipped", receipts: "receipts", honest: "open", stack: "stack" };

  creamOrder.forEach(function (key) {
    const st = byId[key];
    if (!st) return;

    const s = section(anchor[key], "act-cream");
    s.section.setAttribute("data-reveal", "");
    s.inner.appendChild(eyebrow(numbering[key], st.kicker));
    s.inner.appendChild(display(st.headline || st.title));

    if (st.body && st.body.length) {
      const body = el("div", "body-lead");
      body.setAttribute("data-trail-safe", "");
      st.body.forEach(function (p) { body.appendChild(el("p", "body-text", p)); });
      s.inner.appendChild(body);
    }
    if (st.stats) s.inner.appendChild(buildStats(st.stats));
    if (key === "stack") {
      const label = el("p", "logo-wall-label", "Tools I run");
      s.inner.appendChild(label);
      s.inner.appendChild(buildLogoWall(tools));
    }
    if (st.groups) s.inner.appendChild(buildGroups(st.groups));
    if (st.items && st.items.length) {
      const list = el("div", "item-list");
      st.items.forEach(function (item, i) { list.appendChild(buildItem(item, i)); });
      s.inner.appendChild(list);
    }

    root.appendChild(s.section);

    const q = quoteAfter[key] || quoteAfter[anchor[key]];
    if (q) root.appendChild(buildQuote(q));
  });

  // ---- ACT 3 · ink -------------------------------------------------
  const c = voice.contact;
  const last = section("contact", "act-ink act-contact");
  last.section.setAttribute("data-reveal", "");
  last.inner.appendChild(eyebrow("07", c.kicker));
  last.inner.appendChild(display(c.title));
  last.inner.appendChild(el("p", "body-lead body-text", c.body));

  const links2 = el("div", "contact-links");
  links2.setAttribute("data-trail-safe", "");
  [
    { label: "Email",    value: c.email,                 href: "mailto:" + c.email },
    { label: "Phone",    value: c.phone,                 href: "tel:" + c.phone.replace(/\s/g, "") },
    { label: "LinkedIn", value: "in/ramakrishnan15126",  href: c.linkedin },
    { label: "GitHub",   value: "ram15126",              href: c.github },
    { label: "Résumé",   value: "PDF, one page",         href: c.pdf }
  ].forEach(function (link, i) {
    const a = el("a", "contact-link");
    a.href = link.href;
    a.setAttribute("data-reveal-child", "");
    a.style.setProperty("--w", String(i));
    if (link.href.indexOf("http") === 0) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    a.appendChild(el("span", "contact-label", link.label));
    a.appendChild(el("span", "contact-value", link.value));
    links2.appendChild(a);
  });
  last.inner.appendChild(links2);

  const rewind = el("a", "rewind-btn", voice.hud.departLabel);
  rewind.href = c.rewind;
  rewind.setAttribute("data-rewind", "true");
  last.inner.appendChild(rewind);

  root.appendChild(last.section);
  root.appendChild(buildBadge("Open to work"));

  return {
    hero: hero.section,
    sections: [...root.querySelectorAll(".act")]
  };
}
