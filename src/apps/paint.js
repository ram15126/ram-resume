// =====================================================================
//  PAINT — a working pixel painter. Pencil, eraser, fill, a 16-colour
//  palette, brush sizes, undo, clear and save-as-PNG.
//  Draws on a low-resolution canvas scaled up, so strokes stay blocky.
// =====================================================================

const PALETTE = [
  "#000000", "#7F7F7F", "#880015", "#ED1C24", "#FF7F27", "#FFF200",
  "#22B14C", "#00A2E8", "#3F48CC", "#A349A4", "#FFFFFF", "#C3C3C3",
  "#B97A57", "#FFAEC9", "#FFC90E", "#EFE4B0"
];

const GRID_W = 96;   // canvas is 96x64 "pixels", scaled up on screen
const GRID_H = 64;

export const paintApp = {
  id: "paint",
  title: "untitled — Paint",
  icon: "paint",
  width: 600,
  height: 470,
  minWidth: 380,
  minHeight: 340,
  statusBar: " ",
  bodyClass: "flat",
  build: function (body, api) {
    body.classList.add("row");

    // ---------------------------------------------------------- state
    let colour = "#000000";
    let tool = "pencil";
    let brush = 1;
    let drawing = false;
    let last = null;
    const history = [];

    // ------------------------------------------------------ tool rail
    const rail = document.createElement("div");
    rail.className = "paint-rail";

    const toolDefs = [
      { id: "pencil", label: "Pencil" },
      { id: "eraser", label: "Eraser" },
      { id: "fill",   label: "Fill" }
    ];
    const toolBtns = {};
    toolDefs.forEach(function (t) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "paint-tool" + (t.id === tool ? " is-active" : "");
      b.textContent = t.label;
      b.addEventListener("click", function () {
        tool = t.id;
        Object.keys(toolBtns).forEach(function (k) { toolBtns[k].classList.remove("is-active"); });
        b.classList.add("is-active");
        status();
      });
      toolBtns[t.id] = b;
      rail.appendChild(b);
    });

    const sizeWrap = document.createElement("div");
    sizeWrap.className = "paint-sizes";
    [1, 2, 4].forEach(function (n) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "paint-size" + (n === brush ? " is-active" : "");
      b.textContent = n + "px";
      b.addEventListener("click", function () {
        brush = n;
        sizeWrap.querySelectorAll(".paint-size").forEach(function (x) { x.classList.remove("is-active"); });
        b.classList.add("is-active");
        status();
      });
      sizeWrap.appendChild(b);
    });
    rail.appendChild(sizeWrap);

    const undoBtn = document.createElement("button");
    undoBtn.type = "button";
    undoBtn.className = "paint-tool";
    undoBtn.textContent = "Undo";
    rail.appendChild(undoBtn);

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "paint-tool";
    clearBtn.textContent = "Clear";
    rail.appendChild(clearBtn);

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "paint-tool";
    saveBtn.textContent = "Save PNG";
    rail.appendChild(saveBtn);

    body.appendChild(rail);

    // --------------------------------------------------- canvas + swatches
    const main = document.createElement("div");
    main.className = "paint-main";

    const stage = document.createElement("div");
    stage.className = "paint-stage well";
    const canvas = document.createElement("canvas");
    canvas.width = GRID_W;
    canvas.height = GRID_H;
    canvas.className = "paint-canvas";
    canvas.setAttribute("aria-label", "Drawing canvas");
    stage.appendChild(canvas);
    main.appendChild(stage);

    const swatches = document.createElement("div");
    swatches.className = "paint-swatches";
    const current = document.createElement("span");
    current.className = "paint-current";
    current.style.background = colour;
    swatches.appendChild(current);

    PALETTE.forEach(function (c) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "paint-swatch";
      b.style.background = c;
      b.setAttribute("aria-label", "Colour " + c);
      b.addEventListener("click", function () {
        colour = c;
        current.style.background = c;
        if (tool === "eraser") { tool = "pencil"; toolBtns.eraser.classList.remove("is-active"); toolBtns.pencil.classList.add("is-active"); }
        status();
      });
      swatches.appendChild(b);
    });
    main.appendChild(swatches);
    body.appendChild(main);

    // ------------------------------------------------------- drawing
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    function blank() {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, GRID_W, GRID_H);
    }
    blank();

    function pushHistory() {
      history.push(ctx.getImageData(0, 0, GRID_W, GRID_H));
      if (history.length > 24) history.shift();
    }

    function status() {
      api.setStatus(tool.charAt(0).toUpperCase() + tool.slice(1) + "   " + brush + "px   " + colour);
    }
    status();

    function pointToCell(e) {
      const rect = canvas.getBoundingClientRect();
      const point = e.touches ? e.touches[0] : e;
      const x = Math.floor((point.clientX - rect.left) / rect.width * GRID_W);
      const y = Math.floor((point.clientY - rect.top) / rect.height * GRID_H);
      // Clamp just outside the canvas: a stroke dragged off the edge
      // still ends at the edge instead of walking thousands of cells.
      return {
        x: Math.max(-2, Math.min(GRID_W + 1, x)),
        y: Math.max(-2, Math.min(GRID_H + 1, y))
      };
    }

    function dot(cell) {
      ctx.fillStyle = tool === "eraser" ? "#FFFFFF" : colour;
      const half = Math.floor(brush / 2);
      ctx.fillRect(cell.x - half, cell.y - half, brush, brush);
    }

    // A mouse moving quickly fires far fewer events than there are
    // pixels under it, so fill in the line between the last point and
    // this one. Without this, fast strokes come out as dotted trails.
    function paintAt(cell) {
      if (!last) { dot(cell); last = cell; return; }
      let x = last.x, y = last.y;
      const dx = Math.abs(cell.x - x), sx = x < cell.x ? 1 : -1;
      const dy = -Math.abs(cell.y - y), sy = y < cell.y ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        dot({ x: x, y: y });
        if (x === cell.x && y === cell.y) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x += sx; }
        if (e2 <= dx) { err += dx; y += sy; }
      }
      last = cell;
    }

    function floodFill(cell) {
      if (cell.x < 0 || cell.y < 0 || cell.x >= GRID_W || cell.y >= GRID_H) return;
      const img = ctx.getImageData(0, 0, GRID_W, GRID_H);
      const data = img.data;
      const idx = function (x, y) { return (y * GRID_W + x) * 4; };
      const start = idx(cell.x, cell.y);
      const target = [data[start], data[start + 1], data[start + 2]];

      const hex = colour.replace("#", "");
      const fill = [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16)
      ];
      if (target[0] === fill[0] && target[1] === fill[1] && target[2] === fill[2]) return;

      const stack = [[cell.x, cell.y]];
      while (stack.length) {
        const point = stack.pop();
        const x = point[0], y = point[1];
        if (x < 0 || y < 0 || x >= GRID_W || y >= GRID_H) continue;
        const i = idx(x, y);
        if (data[i] !== target[0] || data[i + 1] !== target[1] || data[i + 2] !== target[2]) continue;
        data[i] = fill[0]; data[i + 1] = fill[1]; data[i + 2] = fill[2]; data[i + 3] = 255;
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
      ctx.putImageData(img, 0, 0);
    }

    function down(e) {
      e.preventDefault();
      pushHistory();
      const cell = pointToCell(e);
      if (tool === "fill") { floodFill(cell); return; }
      drawing = true;
      last = null;
      paintAt(cell);
    }
    function move(e) {
      if (!drawing) return;
      e.preventDefault();
      paintAt(pointToCell(e));
    }
    function up() { drawing = false; last = null; }

    canvas.addEventListener("mousedown", down);
    canvas.addEventListener("touchstart", down, { passive: false });
    window.addEventListener("mousemove", move);
    canvas.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);

    undoBtn.addEventListener("click", function () {
      const prev = history.pop();
      if (prev) ctx.putImageData(prev, 0, 0);
    });

    clearBtn.addEventListener("click", function () {
      pushHistory();
      blank();
    });

    saveBtn.addEventListener("click", function () {
      // Scale up 6x on the way out so the saved file is not tiny.
      const out = document.createElement("canvas");
      out.width = GRID_W * 6;
      out.height = GRID_H * 6;
      const octx = out.getContext("2d");
      octx.imageSmoothingEnabled = false;
      octx.drawImage(canvas, 0, 0, out.width, out.height);
      const a = document.createElement("a");
      a.href = out.toDataURL("image/png");
      a.download = "painting.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  }
};
