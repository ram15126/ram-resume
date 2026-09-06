// =====================================================================
//  DEV SERVER — serves the static site AND /api/ask from one process,
//  so the assistant can be tested locally without the Vercel CLI.
//
//      npm start          then open http://localhost:8099
//
//  Production does not use this file at all. On Vercel the static files
//  are served by their CDN and api/ask.js runs as a serverless function.
//  This only reproduces that pairing on your own machine.
// =====================================================================

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");
const PORT = Number(process.env.PORT || 8099);

// Load .env.local before importing the handler, which reads the keys
// at request time from process.env.
for (const name of [".env.local", ".env"]) {
  const file = path.join(ROOT, name);
  if (!fs.existsSync(file)) continue;
  fs.readFileSync(file, "utf8").split(/\r?\n/).forEach(function (line) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) return;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (value && !process.env[m[1]]) process.env[m[1]] = value;
  });
}

const { default: askHandler } = await import("../api/ask.js");
const { CHAT_PROVIDERS, EMBED_PROVIDERS, pick } = await import("../api/_providers.js");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function readBody(req) {
  return new Promise(function (resolve) {
    let data = "";
    req.on("data", function (c) {
      data += c;
      if (data.length > 100_000) req.destroy();   // nothing legitimate is this big
    });
    req.on("end", function () {
      try { resolve(JSON.parse(data || "{}")); } catch (e) { resolve({}); }
    });
  });
}

const server = http.createServer(async function (req, res) {
  const url = new URL(req.url, "http://localhost");

  // ---- API ----
  if (url.pathname === "/api/ask") {
    req.body = await readBody(req);
    const shim = {
      status: function (code) { res.statusCode = code; return shim; },
      json: function (payload) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify(payload));
        return shim;
      }
    };
    try {
      await askHandler(req, shim);
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ answer: "Dev server error: " + err.message, passages: [] }));
    }
    return;
  }

  // ---- static ----
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/") rel = "/index.html";

  // Refuse anything outside the project, any env file, and the same
  // paths .vercelignore keeps off the public host.
  //
  // That last part matters: without it a tunnelled or shared dev server
  // hands out the internal work documents that production does not, and
  // a difference between local and deployed behaviour is exactly the
  // kind nobody thinks to check.
  const target = path.join(ROOT, rel);
  const blocked = /(^|[\\/])\.env/.test(rel) ||
                  /^[\\/](knowledge|tools)([\\/]|$)/.test(rel);
  if (!target.startsWith(ROOT) || blocked) {
    res.statusCode = 403;
    res.end("Forbidden");
    return;
  }

  fs.readFile(target, function (err, data) {
    if (err) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      res.end("Not found: " + rel);
      return;
    }
    res.setHeader("Content-Type", TYPES[path.extname(target).toLowerCase()] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-store");   // so edits show up on reload
    res.end(data);
  });
});

server.listen(PORT, function () {
  console.log("RAM 98 dev server  ->  http://localhost:" + PORT);
  const c = pick(CHAT_PROVIDERS);
  const e = pick(EMBED_PROVIDERS);
  console.log("  answers         : " + (c ? c.name + " (" + c.model + ")"
    : "no key — quoting his notes instead. See .env.example"));
  console.log("  semantic search : " + (e ? e.name + " (" + e.model + ")"
    : "off — keyword only"));
});
