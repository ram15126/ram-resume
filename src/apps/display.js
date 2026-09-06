// =====================================================================
//  DISPLAY PROPERTIES — two tabs, as Windows 98 had them.
//
//  Background : which wallpaper covers the desktop, or upload your own.
//  Appearance : which colour scheme the whole OS uses, with the little
//               live preview pane the real dialog had. Picking a scheme
//               in the list previews it; OK or Apply commits it.
// =====================================================================

import {
  listWallpapers, currentWallpaperId, applyWallpaper, wallpaperName,
  setCustomWallpaper, wallpaperPreview
} from "../os/wallpaper.js";
import {
  listSchemes, currentSchemeId, applyScheme, schemeName, writePalette
} from "../os/scheme.js";
import { paletteFor } from "../../config/theme.js";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * The miniature desktop the Appearance tab shows: an inactive window
 * behind an active one, with a button and some window text — enough
 * to judge a scheme before committing to it. Every colour inside it
 * comes from custom properties, so previewing is just a matter of
 * writing a different palette onto this one element.
 */
function buildPreview() {
  const stage = el("div", "scheme-preview");

  const back = el("div", "sp-win sp-back");
  const backBar = el("div", "sp-bar sp-bar-idle");
  backBar.appendChild(el("span", null, "Inactive Window"));
  backBar.appendChild(el("span", "sp-btns", "_ □ ×"));
  back.appendChild(backBar);
  back.appendChild(el("div", "sp-body"));
  stage.appendChild(back);

  const front = el("div", "sp-win sp-front");
  const frontBar = el("div", "sp-bar sp-bar-active");
  frontBar.appendChild(el("span", null, "Active Window"));
  frontBar.appendChild(el("span", "sp-btns", "_ □ ×"));
  front.appendChild(frontBar);

  const frontBody = el("div", "sp-body");
  const well = el("div", "sp-well");
  well.appendChild(el("span", "sp-text", "Window Text"));
  well.appendChild(el("span", "sp-selected", "Selected"));
  frontBody.appendChild(well);
  frontBody.appendChild(el("span", "sp-button", "Button"));
  front.appendChild(frontBody);
  stage.appendChild(front);

  return stage;
}

export const displayApp = {
  id: "display",
  title: "Display Properties",
  icon: "display",
  width: 460,
  height: 500,
  minWidth: 320,
  minHeight: 380,
  statusBar: " ",
  build: function (body, api) {
    body.classList.add("pad", "col", "tabbed");

    // Held until OK or Apply, so a visitor can browse schemes and back
    // out — the real dialog worked the same way.
    const committed = currentSchemeId();
    let pending = committed;

    // ---------------------------------------------------------- tabs
    const strip = el("div", "tabstrip");
    const panels = el("div", "tabpanels");

    function addTab(label, build) {
      const tab = el("button", "tab", label);
      tab.type = "button";
      const panel = el("div", "well tabpanel prose");
      build(panel);
      if (panels.children.length === 0) tab.classList.add("is-active");
      else panel.hidden = true;
      tab.addEventListener("click", function () {
        strip.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("is-active"); });
        Array.from(panels.children).forEach(function (p) { p.hidden = true; });
        tab.classList.add("is-active");
        panel.hidden = false;
      });
      strip.appendChild(tab);
      panels.appendChild(panel);
    }

    // ---------------------------------------------------- Background
    let renderWalls = function () {};
    addTab("Background", function (panel) {
      panel.appendChild(el("h2", "well-h", "Wallpaper"));

      const grid = el("div", "wall-grid");
      panel.appendChild(grid);

      renderWalls = function () {
        grid.innerHTML = "";
        const active = currentWallpaperId();
        listWallpapers().forEach(function (def) {
          const b = el("button", "wall-option" + (def.id === active ? " is-active" : ""));
          b.type = "button";
          const img = document.createElement("img");
          img.src = wallpaperPreview(def);
          img.alt = "";
          b.appendChild(img);
          b.appendChild(el("span", null, def.name));
          b.addEventListener("click", function () {
            applyWallpaper(def.id);
            renderWalls();
            api.setStatus("Wallpaper: " + def.name);
          });
          grid.appendChild(b);
        });
      };
      renderWalls();

      panel.appendChild(el("h2", "well-h", "Use your own"));
      panel.appendChild(el("p", "audit-note",
        "The image stays in your browser for this visit only. Nothing is uploaded anywhere."));

      const file = document.createElement("input");
      file.type = "file";
      file.accept = "image/*";
      file.className = "file-input";
      file.setAttribute("aria-label", "Choose a wallpaper image");
      file.addEventListener("change", function () {
        const chosen = file.files && file.files[0];
        if (!chosen) return;
        const reader = new FileReader();
        reader.onload = function () {
          setCustomWallpaper(String(reader.result));
          renderWalls();
          api.setStatus("Wallpaper: your own image");
        };
        reader.readAsDataURL(chosen);
      });
      panel.appendChild(file);
    });

    // ---------------------------------------------------- Appearance
    let preview = null;
    let select = null;
    addTab("Appearance", function (panel) {
      preview = buildPreview();
      panel.appendChild(preview);

      const row = el("div", "field-row scheme-row");
      row.appendChild(el("label", "field-label", "Scheme"));

      select = document.createElement("select");
      select.className = "os-select";
      listSchemes().forEach(function (s) {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = s.name;
        select.appendChild(opt);
      });
      select.value = committed;
      select.addEventListener("change", function () {
        pending = select.value;
        writePalette(preview, paletteFor(pending));
        api.setStatus("Preview: " + schemeName(pending) + " — press Apply to keep it");
      });
      row.appendChild(select);
      panel.appendChild(row);

      writePalette(preview, paletteFor(committed));

      panel.appendChild(el("p", "audit-note",
        "\"Luna Blue\" uses the documented Windows XP values. \"Olive Green\" and " +
        "\"Silver\" take their names and character from the other two schemes XP " +
        "shipped, but those colours are matched by eye rather than sampled from the " +
        "originals. \"Signature Red\" is not a Windows scheme at all — it is mine."));
    });

    body.appendChild(strip);
    body.appendChild(panels);

    // -------------------------------------------------------- footer
    const actions = el("div", "toolbar end");

    const ok = el("button", "btn primary", "OK");
    ok.type = "button";
    ok.addEventListener("click", function () {
      applyScheme(pending);
      api.close();
    });

    const cancel = el("button", "btn", "Cancel");
    cancel.type = "button";
    cancel.addEventListener("click", function () {
      applyScheme(committed);
      api.close();
    });

    const apply = el("button", "btn", "Apply");
    apply.type = "button";
    apply.addEventListener("click", function () {
      applyScheme(pending);
      renderWalls();               // "(None)" follows the scheme's desktop colour
      api.setStatus("Scheme: " + schemeName(pending));
    });

    actions.appendChild(ok);
    actions.appendChild(cancel);
    actions.appendChild(apply);
    body.appendChild(actions);

    api.setStatus("Scheme: " + schemeName(committed) +
                  "   ·   Wallpaper: " + wallpaperName(currentWallpaperId()));
  }
};
