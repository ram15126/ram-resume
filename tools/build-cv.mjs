// =====================================================================
//  BUILD CV — config/content.js → a print-ready PDF résumé.
//
//      npm run cv
//
//  Why this exists: both websites render config/content.js, and both
//  offer the PDF as a download. Before this script the PDF was a
//  hand-made binary that nobody could regenerate, so the moment the CV
//  data was corrected the site said one thing and the downloadable said
//  another — in front of the same recruiter.
//
//  A CV is not the website. The site can carry every bullet; a printed
//  page has a hard limit. The script renders, counts the pages in the
//  PDF it just produced, and trims a bullet and re-renders until it
//  fits — so bullets in content.js are ordered by importance rather
//  than chronology, because the tail is what gets dropped.
// =====================================================================

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { content } from "../config/content.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const OUT_PDF = path.join(ROOT, "assets", "Ramakrishnan_S_Resume.pdf");
const OUT_HTML = path.join(ROOT, "assets", "resume-print.html");

// ---- what makes the page --------------------------------------------
//  A starting point, not a final answer. The script renders, counts the
//  pages in the PDF it just made, and if it spilled onto a second page
//  it drops one bullet and renders again. Hand-tuning these by eye means
//  re-tuning them every time a bullet is edited, and the failure mode is
//  a two-page "one-page CV" nobody notices until a recruiter opens it.
const START_LIMITS = {
  bulletsPerRole: 6,
  projects: 6,
  bulletsPerProject: 2
};

//  Two pages, matching the CV he already had. One page was the wrong
//  target: forcing it there cost three bullets a role and four of the
//  six projects, which is a worse CV, not a tidier one. Three concurrent
//  roles and thirteen audited brands do not fit on one side of A4 and
//  should not be squeezed until they do.
const MAX_PAGES = 2;

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  process.env.LOCALAPPDATA + "\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium"
];

//  Swap the few typographic characters that read well on screen but are
//  a coin toss through a CV parser. Applied only to the PDF — the
//  websites keep the nicer glyphs.
function atsSafe(text) {
  return String(text)
    .replace(/\u2192/g, "to")   // 43 → 65  becomes  43 to 65
    .replace(/\u00d7/g, "x");   // area × niche  becomes  area x niche
}

function esc(text) {
  return atsSafe(text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function bullets(list, limit) {
  return "<ul>" + list.slice(0, limit).map(function (b) {
    return "<li>" + esc(b) + "</li>";
  }).join("") + "</ul>";
}

// ---- the document ----------------------------------------------------
const h = content.header;

function buildHtml(cvLimits) {
return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>${esc(h.name)} — Résumé</title>
<style>
  @page { size: A4; margin: 12mm 13mm; }
  * { box-sizing: border-box; }
  /* State the light scheme and the white ground explicitly. Without
     these the page inherits the reader's dark mode, and near-black body
     text on a dark ground is unreadable — which is what anyone opening
     resume-print.html in a dark browser actually saw. */
  html { color-scheme: light; background: #ffffff; }
  body {
    background: #ffffff;
    margin: 0;
    font: 9.5pt/1.42 "Calibri", "Segoe UI", system-ui, sans-serif;
    color: #14161a;
    -webkit-print-color-adjust: exact;
    /* No ligatures. Calibri draws fi, fl and ff as single glyphs, and a
       parser reading the PDF then gets "qualiﬁed" and "workﬂows" —
       which no keyword search for "qualified" or "workflow" will ever
       match. This one line is the difference between being found and
       not. */
    font-variant-ligatures: none;
    font-feature-settings: "liga" 0, "clig" 0, "dlig" 0, "hlig" 0;
  }
  a { color: #14161a; text-decoration: none; }

  header { border-bottom: 1.6pt solid #14161a; padding-bottom: 5pt; margin-bottom: 9pt; }
  h1 { margin: 0; font-size: 18pt; letter-spacing: .2pt; }
  .tagline { margin: 2pt 0 4pt; font-size: 9.4pt; font-weight: 600; color: #3d444d; }
  .contact { font-size: 8.6pt; color: #3d444d; }
  .contact span + span::before { content: "  ·  "; color: #9aa2ab; }

  h2 {
    font-size: 8.3pt; text-transform: uppercase; letter-spacing: 1.1pt;
    margin: 8pt 0 3pt; padding-bottom: 2pt;
    border-bottom: .6pt solid #c8cdd3; color: #14161a;
  }
  section:first-of-type h2 { margin-top: 6pt; }

  .summary { margin: 0; text-align: justify; }

  .role { margin-bottom: 5.5pt; page-break-inside: avoid; }
  .role-head { display: flex; justify-content: space-between; gap: 8pt; align-items: baseline; }
  .role-title { font-weight: 700; font-size: 9.8pt; }
  .role-org { font-weight: 600; color: #3d444d; }
  .role-when { font-size: 8.4pt; color: #5b636d; white-space: nowrap; }

  ul { margin: 2pt 0 0; padding-left: 12pt; }
  li { margin-bottom: 1.1pt; text-align: justify; }

  .proj { margin-bottom: 5pt; page-break-inside: avoid; }
  .proj-name { font-weight: 700; }
  .proj-sub { color: #5b636d; font-size: 8.6pt; }

  /* Two columns per line, so a wrapped list lines up under itself rather
     than running back to the margin. Done with flex rather than a
     negative text-indent: inside a flex item the negative indent pulls
     the label outside the box and it gets clipped away entirely. */
  .skills p { display: flex; gap: 5pt; margin: 0 0 3.5pt; }
  .skills b { flex: 0 0 44pt; }
  .skills span { flex: 1 1 auto; }

  /* Deliberately NOT two columns any more. Side by side, the extracted
     text came out as "SKILLS EDUCATION" on one line with the two
     sections interleaved underneath, so a parser could not tell which
     heading owned what. A CV is read by a machine before a human; one
     column top to bottom is the only reading order both agree on. */
  .two { display: block; }
  .two > div + div { margin-top: 2pt; }
</style></head><body>

<header>
  <h1>${esc(h.name)}</h1>
  <p class="tagline">${esc(h.tagline)}</p>
  <div class="contact">
    <span>${esc(h.location)}</span><span>${esc(h.email)}</span><span>${esc(h.phone)}</span>
    <span>${esc(h.linkedin.replace("https://", ""))}</span><span>${esc(h.github.replace("https://", ""))}</span>
  </div>
</header>

<section>
  <h2>Summary</h2>
  <p class="summary">${esc(content.summary)}</p>
</section>

<section>
  <h2>Experience</h2>
  ${content.experience.map(function (job) {
    return `<div class="role">
      <div class="role-head">
        <div><span class="role-title">${esc(job.role)}</span> — <span class="role-org">${esc(job.company)}</span>, ${esc(job.location)}</div>
        <div class="role-when">${esc(job.dates)}</div>
      </div>
      ${bullets(job.bullets, cvLimits.bulletsPerRole)}
    </div>`;
  }).join("")}
</section>

<section>
  <h2>Selected projects</h2>
  ${content.projects.slice(0, cvLimits.projects).map(function (p) {
    return `<div class="proj">
      <div><span class="proj-name">${esc(p.name)}</span>${p.subtitle ? ' <span class="proj-sub">— ' + esc(p.subtitle) + "</span>" : ""}</div>
      ${bullets(p.bullets, cvLimits.bulletsPerProject)}
    </div>`;
  }).join("")}
</section>

<div class="two">
  <div>
    <section class="skills">
      <h2>Skills</h2>
      ${content.skills.groups.map(function (g) {
        return "<p><b>" + esc(g.name.split(",")[0].split(" & ")[0]) + "</b><span>" +
               esc(g.featured.map(function (s) { return s.label; }).join(", ")) + "</span></p>";
      }).join("")}
    </section>
  </div>
  <div>
    <section>
      <h2>Education</h2>
      <div class="role-head">
        <div><span class="role-title">${esc(content.education.degree)}</span></div>
        <div class="role-when">${esc(content.education.dates)}</div>
      </div>
      <div class="role-org">${esc(content.education.school)}, ${esc(content.education.location)}</div>
      <p style="margin:3pt 0 0">${esc(content.education.bullets[0])}</p>
    </section>
    <section>
      <h2>Training &amp; languages</h2>
      <p style="margin:0">${esc(content.training.join(" · "))}</p>
      <p style="margin:2pt 0 0">Languages: ${esc(content.languages.join(", "))}</p>
    </section>
  </div>
</div>

<!-- Generated from config/content.js on ${new Date().toISOString().slice(0, 10)}.
     Kept as a comment, not a footer: a build note printed on the page
     meant nothing to a recruiter and cost a line of the CV. -->
</body></html>`;
}

// ---- render ----------------------------------------------------------
const chrome = CHROME_CANDIDATES.find(function (p) {
  try { return p && fs.existsSync(p); } catch (e) { return false; }
});

if (!chrome) {
  fs.mkdirSync(path.dirname(OUT_HTML), { recursive: true });
  fs.writeFileSync(OUT_HTML, buildHtml(START_LIMITS));
  console.error("No Chrome or Edge found, so the PDF was not rendered.");
  console.error("The HTML is written — open assets/resume-print.html, print to PDF,");
  console.error("and save over assets/Ramakrishnan_S_Resume.pdf.");
  process.exit(1);
}

/** The page tree's own count is the authoritative number of pages. */
function pageCount(file) {
  const bytes = fs.readFileSync(file);
  const text = bytes.toString("latin1");
  const objects = (text.match(/\/Type\s*\/Page[^s]/g) || []).length;
  return objects || 99;
}

function render(limits) {
  fs.mkdirSync(path.dirname(OUT_HTML), { recursive: true });
  fs.writeFileSync(OUT_HTML, buildHtml(limits));

  // A fresh profile dir each run: without it Chrome attaches to the
  // already-running browser, returns instantly and writes nothing.
  const profile = path.join(ROOT, ".cv-profile");
  fs.rmSync(profile, { recursive: true, force: true });

  execFileSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-sandbox",
    "--user-data-dir=" + profile,
    // Both spellings on purpose. "--print-to-pdf-no-header" is the old
    // headless flag and is ignored by --headless=new, which is why every
    // page of the PDF carried a date and the local file:/// path it was
    // built from. "--no-pdf-header-footer" is the one that works now;
    // the old one stays for older Chrome and Edge builds.
    "--print-to-pdf-no-header",
    "--no-pdf-header-footer",
    "--print-to-pdf=" + OUT_PDF,
    "file:///" + OUT_HTML.split(path.sep).join("/")
  ], { stdio: "pipe", timeout: 60000 });

  fs.rmSync(profile, { recursive: true, force: true });

  if (!fs.existsSync(OUT_PDF)) throw new Error("Chrome exited without writing a PDF.");
  return pageCount(OUT_PDF);
}

// ---- fit to one page -------------------------------------------------
//  Trim the longest section first. Experience bullets are both the
//  biggest block and the most repetitive, so a role losing its fifth
//  bullet costs less than the projects section losing an entire project.
const attempts = [];
let limits = Object.assign({}, START_LIMITS);
let pages = 0;

for (let i = 0; i < 8; i++) {
  try {
    pages = render(limits);
  } catch (err) {
    console.error("\nChrome failed: " + (err.stderr ? String(err.stderr).slice(0, 300) : err.message));
    process.exit(1);
  }
  attempts.push(limits.bulletsPerRole + "×role/" + limits.projects + " proj → " + pages + "pp");
  if (pages <= MAX_PAGES) break;

  if (limits.bulletsPerRole > 3) limits.bulletsPerRole -= 1;
  else if (limits.projects > 2) limits.projects -= 1;
  else if (limits.bulletsPerRole > 2) limits.bulletsPerRole -= 1;
  else break;
}

const kb = (fs.statSync(OUT_PDF).size / 1024).toFixed(0);
console.log("Wrote assets/Ramakrishnan_S_Resume.pdf  (" + kb + " KB, " + pages +
            " page" + (pages === 1 ? "" : "s") + " of " + MAX_PAGES + " allowed)");
console.log("  fitting: " + attempts.join("  →  "));
console.log("  " + content.experience.length + " roles at " + limits.bulletsPerRole + " bullets each");
console.log("  " + Math.min(limits.projects, content.projects.length) + " of " +
            content.projects.length + " projects");

if (pages > MAX_PAGES) {
  console.log("\nStill over " + MAX_PAGES + " pages at the minimum settings.");
  console.log("The bullets themselves are too long — shorten them in config/content.js.");
  process.exit(1);
}
