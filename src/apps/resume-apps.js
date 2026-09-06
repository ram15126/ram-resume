// =====================================================================
//  RÉSUMÉ APPS — the windows that hold actual CV content.
//  Every string comes from config/content.js. Nothing is written here.
// =====================================================================

import { content } from "../../config/content.js";
import { contactCopy } from "../../config/desktop.js";
import { iconImg } from "../os/iconart.js";

// ---------------------------------------------------------------- utils
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function bulletList(items) {
  const ul = el("ul", "bullets");
  items.forEach(function (b) { ul.appendChild(el("li", null, b)); });
  return ul;
}

/** A sunken content well, the inset white area Win98 puts text in. */
function well(className) {
  return el("div", "well" + (className ? " " + className : ""));
}

/** Tabs, the classic Win98 property-sheet control. */
function tabs(body, defs) {
  const strip = el("div", "tabstrip");
  const panels = el("div", "tabpanels");

  defs.forEach(function (def, i) {
    const tab = el("button", "tab", def.label);
    tab.type = "button";
    tab.setAttribute("role", "tab");

    const panel = well("tabpanel");
    panel.setAttribute("role", "tabpanel");
    def.build(panel);

    if (i === 0) { tab.classList.add("is-active"); } else { panel.hidden = true; }

    tab.addEventListener("click", function () {
      strip.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("is-active"); });
      Array.from(panels.children).forEach(function (p) { p.hidden = true; });
      tab.classList.add("is-active");
      panel.hidden = false;
    });

    strip.appendChild(tab);
    panels.appendChild(panel);
  });

  body.appendChild(strip);
  body.appendChild(panels);
}

// -------------------------------------------------------------- About Me
export const aboutApp = {
  id: "about",
  title: "About Me",
  icon: "computer",
  width: 560,
  height: 430,
  statusBar: content.header.location,
  build: function (body) {
    body.classList.add("pad");

    const head = el("div", "id-card");
    const badge = el("div", "id-badge");
    badge.appendChild(iconImg("computer", 3, ""));
    head.appendChild(badge);

    const idText = el("div", "id-text");
    idText.appendChild(el("h1", "id-name", content.header.name));
    idText.appendChild(el("p", "id-role", content.header.tagline));
    const meta = el("p", "id-meta");
    meta.textContent = content.header.location + "  ·  " + content.header.email + "  ·  " + content.header.phone;
    idText.appendChild(meta);
    head.appendChild(idText);
    body.appendChild(head);

    const w = well("prose");
    w.appendChild(el("p", null, content.summary));

    w.appendChild(el("h2", "well-h", "Right now"));
    const roles = el("ul", "role-list");
    content.experience.forEach(function (job) {
      const li = el("li");
      li.appendChild(el("strong", null, job.role));
      li.appendChild(el("span", null, " — " + job.company + ", " + job.location));
      li.appendChild(el("span", "dim", "  " + job.dates));
      roles.appendChild(li);
    });
    w.appendChild(roles);

    w.appendChild(el("h2", "well-h", "How I work"));
    w.appendChild(el("p", null,
      "I do not write code. I specify the system, direct AI-assisted development, and verify every output before it reaches a client. " +
      "This desktop, the audit tools, the automations — all built that way."));

    w.appendChild(el("h2", "well-h", "Languages"));
    w.appendChild(el("p", null, content.languages.join(", ")));

    w.appendChild(el("h2", "well-h", "Interests"));
    w.appendChild(el("p", null, content.interests));

    body.appendChild(w);
  }
};

// -------------------------------------------------------------- My Work
export const workApp = {
  id: "work",
  title: "My Work",
  icon: "folder",
  width: 620,
  height: 460,
  statusBar: content.experience.length + " roles, all current",
  build: function (body) {
    body.classList.add("pad");
    tabs(body, content.experience.map(function (job) {
      return {
        label: job.company,
        build: function (panel) {
          panel.classList.add("prose");
          const h = el("div", "job-head");
          h.appendChild(el("h2", "job-role", job.role));
          h.appendChild(el("p", "job-org", job.company + " · " + job.location));
          h.appendChild(el("p", "job-dates", job.dates));
          panel.appendChild(h);
          panel.appendChild(bulletList(job.bullets));
        }
      };
    }));
  }
};

// ------------------------------------------------------------- Projects
export const projectsApp = {
  id: "projects",
  title: "Projects",
  icon: "document",
  width: 620,
  height: 470,
  statusBar: content.projects.length + " projects",
  build: function (body) {
    body.classList.add("pad");
    const w = well("prose");

    content.projects.forEach(function (p, i) {
      const card = el("article", "proj");
      const head = el("div", "proj-head");
      head.appendChild(iconImg("document", 2, ""));
      const titles = el("div");
      titles.appendChild(el("h2", "proj-name", p.name));
      titles.appendChild(el("p", "proj-sub", p.subtitle));
      head.appendChild(titles);
      card.appendChild(head);

      card.appendChild(bulletList(p.bullets));

      if (p.link) {
        const a = el("a", "proj-link", p.linkLabel || p.link);
        a.href = p.link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        card.appendChild(a);
      }
      w.appendChild(card);
      if (i < content.projects.length - 1) w.appendChild(el("hr", "rule"));
    });

    body.appendChild(w);
  }
};

// ---------------------------------------------------------------- Skills
export const skillsApp = {
  id: "skills",
  title: "Skills",
  icon: "chart",
  width: 600,
  height: 460,
  statusBar: "Bars are a self-assessment, not a measured metric",
  build: function (body) {
    body.classList.add("pad");
    tabs(body, content.skills.groups.map(function (group) {
      return {
        label: group.name.split(",")[0].split(" & ")[0],
        build: function (panel) {
          panel.classList.add("prose");
          panel.appendChild(el("h2", "well-h", group.name));

          group.featured.forEach(function (s) {
            const row = el("div", "meter-row");
            row.appendChild(el("span", "meter-label", s.label));
            const track = el("div", "meter");
            for (let i = 0; i < 5; i++) {
              const seg = el("span", "meter-seg" + (i < s.level ? " is-on" : ""));
              track.appendChild(seg);
            }
            row.appendChild(track);
            panel.appendChild(row);
          });

          panel.appendChild(el("h3", "well-h small", "Everything else"));
          const tagWrap = el("div", "tags");
          group.all.forEach(function (t) { tagWrap.appendChild(el("span", "tag", t)); });
          panel.appendChild(tagWrap);
        }
      };
    }));
  }
};

// ------------------------------------------------------------- Education
export const educationApp = {
  id: "education",
  title: "Education",
  icon: "book",
  width: 540,
  height: 400,
  statusBar: content.education.dates,
  build: function (body) {
    body.classList.add("pad");
    const w = well("prose");
    const ed = content.education;

    w.appendChild(el("h2", "well-h", ed.degree));
    w.appendChild(el("p", "job-org", ed.school + " · " + ed.location));
    w.appendChild(el("p", "job-dates", ed.dates));
    w.appendChild(bulletList(ed.bullets));

    w.appendChild(el("hr", "rule"));
    w.appendChild(el("h2", "well-h", "Training"));
    w.appendChild(bulletList(content.training));

    body.appendChild(w);
  }
};

// ---------------------------------------------------------------- Resume
export const resumeApp = {
  id: "resume",
  title: "Resume.pdf",
  icon: "pdf",
  width: 620,
  height: 520,
  statusBar: "Ramakrishnan_S_Resume.pdf",
  build: function (body) {
    body.classList.add("pad", "col");

    const toolbar = el("div", "toolbar");
    const dl = el("a", "btn", "Download");
    dl.href = content.header.pdf;
    dl.setAttribute("download", "Ramakrishnan_S_Resume.pdf");
    toolbar.appendChild(dl);

    const open = el("a", "btn", "Open in new tab");
    open.href = content.header.pdf;
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    toolbar.appendChild(open);
    body.appendChild(toolbar);

    const w = well("fill");
    const frame = document.createElement("iframe");
    frame.className = "pdf-frame";
    frame.src = content.header.pdf;
    frame.title = "Résumé PDF";
    w.appendChild(frame);

    const fallback = el("p", "pdf-fallback",
      "If the preview does not load, use the Download button above.");
    w.appendChild(fallback);

    body.appendChild(w);
  }
};

// --------------------------------------------------------------- Contact
export const contactApp = {
  id: "contact",
  title: "Contact Me",
  icon: "envelope",
  width: 480,
  height: 380,
  resizable: true,
  statusBar: "Chennai, Tamil Nadu · open to remote",
  build: function (body) {
    body.classList.add("pad");
    const w = well("prose");

    w.appendChild(el("h2", "well-h", contactCopy.heading));
    w.appendChild(el("p", null, contactCopy.line));

    const rows = [
      { label: "Email",    value: content.header.email,    href: "mailto:" + content.header.email },
      { label: "Phone",    value: content.header.phone,    href: "tel:" + content.header.phone.replace(/\s/g, "") },
      { label: "LinkedIn", value: "in/ramakrishnan15126",  href: content.header.linkedin },
      { label: "GitHub",   value: "ram15126",              href: content.header.github },
      { label: "Location", value: content.header.location, href: "" }
    ];

    const table = el("div", "field-table");
    rows.forEach(function (r) {
      const row = el("div", "field-row");
      row.appendChild(el("label", "field-label", r.label));
      const box = el("div", "field-value");
      if (r.href) {
        const a = el("a", null, r.value);
        a.href = r.href;
        if (r.href.indexOf("http") === 0) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
        box.appendChild(a);
      } else {
        box.textContent = r.value;
      }
      row.appendChild(box);
      table.appendChild(row);
    });
    w.appendChild(table);

    const actions = el("div", "toolbar end");
    const mail = el("a", "btn primary", "Send an email");
    mail.href = "mailto:" + content.header.email;
    actions.appendChild(mail);
    w.appendChild(actions);

    body.appendChild(w);
  }
};
