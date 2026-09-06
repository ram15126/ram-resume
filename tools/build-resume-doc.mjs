// =====================================================================
//  BUILD RESUME DOC — turns config/content.js into a markdown document
//  the assistant can index.
//
//  It is generated rather than hand-written so the assistant can never
//  drift from what the site itself displays. If you correct a bullet in
//  content.js, `npm run ingest` regenerates this and the assistant
//  learns the correction in the same step.
//
//  DO NOT hand-edit knowledge/00-resume.md — it is overwritten.
//  Everything you write yourself goes in the other knowledge/ files.
// =====================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { content } from "../config/content.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "..", "knowledge", "00-resume.md");

const out = [];
function line(text) { out.push(text === undefined ? "" : text); }

line("<!-- GENERATED FILE — do not edit by hand.");
line("     Source: config/content.js   Rebuild: npm run ingest -->");
line();

line("# Who he is");
line();
line(content.header.name + " — " + content.header.tagline + ".");
line("Based in " + content.header.location + ".");
line("Contact: " + content.header.email + ", " + content.header.phone + ".");
line("LinkedIn: " + content.header.linkedin + " · GitHub: " + content.header.github);
line();

line("# Summary");
line();
line(content.summary);
line();

line("# How he works");
line();
line("He does not write code himself. He specifies the system, directs AI-assisted");
line("development, and verifies every output before it reaches a client. The");
line("specification, the judgement calls and the verification are his; the typing is");
line("not. This is how he ships marketing tools, automations and AI creative without");
line("a developer.");
line();

// ---- roles -----------------------------------------------------------
content.experience.forEach(function (job) {
  line("# Role: " + job.role + " at " + job.company);
  line();
  line(job.company + " · " + job.location + " · " + job.dates + ".");
  line("All three of his roles run concurrently and are all current.");
  line();
  job.bullets.forEach(function (b) { line("- " + b); });
  line();
});

// ---- projects --------------------------------------------------------
content.projects.forEach(function (project) {
  line("# Project: " + project.name);
  line();
  if (project.subtitle) { line(project.subtitle + "."); line(); }
  project.bullets.forEach(function (b) { line("- " + b); });
  if (project.link) { line(); line("Link: " + project.link); }
  line();
});

// ---- skills ----------------------------------------------------------
content.skills.groups.forEach(function (group) {
  line("# Skills: " + group.name);
  line();
  line("Self-assessed strengths in this area (his own rating out of 5, not a");
  line("measured metric): " +
    group.featured.map(function (s) { return s.label + " " + s.level + "/5"; }).join(", ") + ".");
  line();
  line("Everything else he lists here: " + group.all.join(", ") + ".");
  line();
});

// ---- education -------------------------------------------------------
line("# Education");
line();
line(content.education.degree + ", " + content.education.school + ", " +
     content.education.location + " (" + content.education.dates + ").");
line();
content.education.bullets.forEach(function (b) { line("- " + b); });
line();

line("# Training");
line();
content.training.forEach(function (t) { line("- " + t); });
line();

line("# Languages and interests");
line();
line("Languages: " + content.languages.join(", ") + ".");
line("Interests: " + content.interests + ".");
line();

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, out.join("\n"));
console.log("Wrote knowledge/00-resume.md from config/content.js");
