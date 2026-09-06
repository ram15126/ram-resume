// =====================================================================
//  NOTEPAD — a real, editable text editor. Opens with readme.txt.
//  Word wrap toggles, the status bar counts, and you can save the file
//  to your machine. It behaves like the thing it is imitating.
// =====================================================================

import { notepadDoc } from "../../config/desktop.js";

export const notepadApp = {
  id: "notepad",
  title: notepadDoc.filename + " — Notepad",
  icon: "notepad",
  width: 560,
  height: 440,
  statusBar: " ",
  bodyClass: "flat",
  build: function (body, api) {
    body.classList.add("col");

    // ---- menu bar ----
    const menu = document.createElement("div");
    menu.className = "menubar";

    const wrapBtn = document.createElement("button");
    wrapBtn.type = "button";
    wrapBtn.className = "menu-item is-checked";
    wrapBtn.textContent = "Word Wrap";

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "menu-item";
    clearBtn.textContent = "New";

    const restoreBtn = document.createElement("button");
    restoreBtn.type = "button";
    restoreBtn.className = "menu-item";
    restoreBtn.textContent = "Reopen readme.txt";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "menu-item";
    saveBtn.textContent = "Save As…";

    menu.appendChild(clearBtn);
    menu.appendChild(restoreBtn);
    menu.appendChild(saveBtn);
    menu.appendChild(wrapBtn);
    body.appendChild(menu);

    // ---- the editor ----
    const area = document.createElement("textarea");
    area.className = "notepad-area";
    area.spellcheck = false;
    area.value = notepadDoc.body;
    area.setAttribute("aria-label", "Notepad document");
    body.appendChild(area);

    function count() {
      const chars = area.value.length;
      const lines = area.value.split("\n").length;
      api.setStatus("Ln " + lines + "    Ch " + chars);
    }
    area.addEventListener("input", count);
    count();

    wrapBtn.addEventListener("click", function () {
      const on = wrapBtn.classList.toggle("is-checked");
      area.style.whiteSpace = on ? "pre-wrap" : "pre";
      area.style.overflowX = on ? "hidden" : "auto";
    });

    clearBtn.addEventListener("click", function () {
      area.value = "";
      api.setTitle("Untitled — Notepad");
      count();
      area.focus();
    });

    restoreBtn.addEventListener("click", function () {
      area.value = notepadDoc.body;
      api.setTitle(notepadDoc.filename + " — Notepad");
      count();
    });

    saveBtn.addEventListener("click", function () {
      const blob = new Blob([area.value], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "note.txt";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  }
};
