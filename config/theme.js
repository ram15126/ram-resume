// =====================================================================
//  THEME — the ONLY file to edit for colours and the look of the OS.
//
//  This is Windows XP, "Luna" — the OS the world was actually running
//  in 2006. (Vista shipped to businesses on 30 Nov 2006 and to
//  consumers on 30 Jan 2007, so almost nobody had it that year.)
//
//  HONESTY NOTE: the Luna Blue values below are the documented ones —
//  the #ECE9D8 dialog face, #316AC5 selection, the #0054E3 title
//  gradient. Olive Green and Silver take their names and character from
//  the two other schemes XP shipped, but those hexes are matched by eye.
//  "Signature Red" is not a Windows scheme at all; it is Ramakrishnan's
//  own colour, and it is the default here.
// =====================================================================

// ---------------------------------------------------------------------
//  The base palette — everything the Luna schemes share. Each scheme
//  below lists ONLY what it changes.
// ---------------------------------------------------------------------
const base = {
  // ---- Chrome: the beige-grey XP used in place of 98's #C0C0C0 ----
  face:        "#ECE9D8",
  faceLight:   "#FFFFFF",
  highlight:   "#FFFFFF",
  shadow:      "#ACA899",   // XP's dialog shadow, not 98's #808080
  shadowDark:  "#716F64",
  text:        "#000000",
  textDisabled:"#ACA899",

  // ---- Content areas ----
  well:        "#FFFFFF",
  wellText:    "#000000",
  wellAccent:  "#003399",   // section headings inside content
  wellMuted:   "#5A5A5A",
  wellAlt:     "#F4F3EE",
  wellRule:    "#D6D3C6",
  wellBorder:  "#7F9DB9",   // XP's sunken field border
  link:        "#0000EE",

  // ---- Title bars ----
  //  XP's title gradient runs vertically: a bright gloss line at the
  //  very top, deepest through the middle, lifting again at the bottom.
  titleGloss:  "#4E9EFF",
  titleFrom:   "#0054E3",
  titleMid:    "#0A6BE8",
  titleTo:     "#3D95FF",
  titleText:   "#FFFFFF",
  titleIdle:   "#7A96DF",
  titleIdleTo: "#A8C0E8",
  titleIdleText: "#E8EFFB",
  winBorder:   "#0054E3",   // the coloured frame around a window

  // ---- Selection ----
  accent:      "#316AC5",   // XP highlight blue
  accentDark:  "#20489B",
  accentText:  "#FFFFFF",

  // ---- Taskbar and Start ----
  taskFrom:    "#3C81F3",   // the light strip along the top
  taskMid:     "#245EDB",
  taskTo:      "#1941A5",
  startFrom:   "#5EA226",   // the green Start button
  startMid:    "#3C8B1E",
  startTo:     "#2E6B16",
  startText:   "#FFFFFF",
  trayFrom:    "#1290E9",   // the recessed clock area
  trayTo:      "#149AF3",

  // ---- Start menu ----
  menuHeader:  "#0A5BC4",
  menuLeft:    "#FFFFFF",
  menuRight:   "#D3E5FA",
  menuFooter:  "#0A5BC4",

  // ---- Desktop ----
  desktop:     "#004E98",
  iconLabel:   "#FFFFFF",
  iconLabelBg: "#316AC5",

  // ---- Status colours used inside apps ----
  ok:          "#107C10",
  warn:        "#9C6500",
  bad:         "#B01B1B",
  info:        "#003399"
};

export const schemes = [
  {
    id: "signature-red",
    name: "Signature Red",
    palette: {
      titleGloss: "#E8564E", titleFrom: "#B01B1B", titleMid: "#C22323",
      titleTo: "#D62828", winBorder: "#B01B1B",
      titleIdle: "#C09A9A", titleIdleTo: "#DCC4C4",
      accent: "#A61E1E", accentDark: "#7C1616", iconLabelBg: "#A61E1E",
      wellAccent: "#A61E1E",
      taskFrom: "#D8564E", taskMid: "#A81E1E", taskTo: "#7A1414",
      trayFrom: "#C23A32", trayTo: "#D14840",
      menuHeader: "#9E1A1A", menuFooter: "#9E1A1A", menuRight: "#F6E2E2",
      desktop: "#5E1414"
    }
  },
  {
    id: "luna-blue",
    name: "Luna Blue",
    palette: {}                       // the documented XP default
  },
  {
    id: "olive-green",
    name: "Olive Green",
    palette: {
      titleGloss: "#B6CE92", titleFrom: "#7BA05B", titleMid: "#88AD68",
      titleTo: "#A3C47E", winBorder: "#7BA05B",
      titleIdle: "#B4C4A4", titleIdleTo: "#D2DCC8",
      accent: "#7BA05B", accentDark: "#5A7A40", iconLabelBg: "#7BA05B",
      wellAccent: "#4A6B2E",
      taskFrom: "#A7C57E", taskMid: "#7BA05B", taskTo: "#587A3C",
      trayFrom: "#8FB56A", trayTo: "#9CC077",
      menuHeader: "#6D9050", menuFooter: "#6D9050", menuRight: "#E4EDD8",
      desktop: "#4A6B2E"
    }
  },
  {
    id: "silver",
    name: "Silver",
    palette: {
      face: "#EBEBF2", shadow: "#B4B4C4", shadowDark: "#7A7A8E",
      titleGloss: "#D8D8E4", titleFrom: "#7A7A8E", titleMid: "#9696AA",
      titleTo: "#B9B9CC", winBorder: "#7A7A8E",
      titleIdle: "#B0B0C0", titleIdleTo: "#D4D4DE",
      accent: "#6C6C86", accentDark: "#4E4E64", iconLabelBg: "#6C6C86",
      wellAccent: "#3E3E52", wellAlt: "#F2F2F6", wellRule: "#DADAE2",
      taskFrom: "#C8C8D6", taskMid: "#9A9AAE", taskTo: "#72728A",
      trayFrom: "#A8A8BC", trayTo: "#B6B6C8",
      startFrom: "#8E8EA4", startMid: "#6C6C86", startTo: "#52526A",
      menuHeader: "#6C6C86", menuFooter: "#6C6C86", menuRight: "#E6E6EE",
      desktop: "#5A5A70"
    }
  },
  {
    id: "high-contrast-black",
    name: "High Contrast Black",
    palette: {
      face: "#000000", faceLight: "#000000", highlight: "#FFFFFF",
      shadow: "#FFFFFF", shadowDark: "#FFFFFF",
      text: "#FFFFFF", textDisabled: "#A0A0A0",
      well: "#000000", wellText: "#FFFFFF", link: "#40C0FF",
      wellAccent: "#40C0FF", wellMuted: "#B0B0B0",
      wellAlt: "#1A1A1A", wellRule: "#606060", wellBorder: "#FFFFFF",
      titleGloss: "#000000", titleFrom: "#000000", titleMid: "#000000",
      titleTo: "#000000", titleText: "#FFFFFF", winBorder: "#FFFFFF",
      titleIdle: "#000000", titleIdleTo: "#000000", titleIdleText: "#A0A0A0",
      accent: "#0000C0", accentDark: "#000080", iconLabelBg: "#0000C0",
      taskFrom: "#FFFFFF", taskMid: "#000000", taskTo: "#000000",
      startFrom: "#000000", startMid: "#000000", startTo: "#000000",
      trayFrom: "#000000", trayTo: "#000000",
      menuHeader: "#000000", menuLeft: "#000000", menuRight: "#000000",
      menuFooter: "#000000",
      desktop: "#000000",
      ok: "#00E000", warn: "#E0C000", bad: "#FF6060", info: "#40C0FF"
    }
  }
];

export const defaultScheme = "signature-red";

/** Merge a scheme's overrides onto the base palette. */
export function paletteFor(schemeId) {
  const found = schemes.find(function (s) { return s.id === schemeId; });
  return Object.assign({}, base, found ? found.palette : {});
}

// ---------------------------------------------------------------------
//  Wallpapers, drawn from code — no image files anywhere.
//    none  — the scheme's own desktop colour
//    tile  — a small pattern repeated
//    scene — one full-bleed picture stretched to fit
// ---------------------------------------------------------------------
//  Windows XP shipped photographs, and by 2006 those were what a
//  desktop looked like. The ten tiled patterns the 98 build used
//  (Blue Rivets, Straw Mat, Black Thatch and the rest) were a 1998
//  thing and XP dropped them, so they are no longer offered here.
//  Their drawing code is still in src/os/wallpaper.js under `tiles`,
//  so putting one back is a single line in this list.
export const wallpapers = [
  { id: "bliss",            name: "Bliss",            type: "scene" },
  { id: "royale",           name: "Energy Blue",      type: "scene" },
  { id: "ripple",           name: "Ripple",           type: "scene" },
  { id: "peace",            name: "Peace",            type: "scene" },
  { id: "wind",             name: "Wind",             type: "scene" },
  { id: "azul",             name: "Azul",             type: "scene" },
  { id: "crystal",          name: "Crystal",          type: "scene" },
  { id: "vortex",           name: "Vortex",           type: "scene" },
  { id: "radiance",         name: "Radiance",         type: "scene" },
  { id: "autumn",           name: "Autumn",           type: "scene" },
  { id: "red-moon-desert",  name: "Red Moon Desert",  type: "scene" },
  { id: "stonehenge",       name: "Stonehenge",       type: "scene" },
  { id: "purple-flower",    name: "Purple Flower",    type: "scene" },
  { id: "night",            name: "Night Shift",      type: "scene" },
  { id: "none",             name: "(None)",           type: "none"  }
];

export const defaultWallpaper = "bliss";

// ---------------------------------------------------------------------
//  The brand mark on the boot screen and the Start button. Windows did
//  not recolour its logo when you changed scheme, and neither does this.
// ---------------------------------------------------------------------
export const brand = {
  logo:     "#D62828",
  logoDark: "#8E1616"
};

// ---- Type ----
//  XP used Tahoma for its UI, not 98's MS Sans Serif.
export const fonts = {
  ui:    "Tahoma, 'Segoe UI', 'DejaVu Sans', Verdana, system-ui, sans-serif",
  mono:  "'Lucida Console', 'DejaVu Sans Mono', Consolas, monospace",
  pixel: "'Press Start 2P', 'Courier New', monospace"
};

// ---- Behaviour ----
export const behaviour = {
  bootMs: 2600,
  skipBootOnReturn: true,
  openOnLoad: ["about"]
};
