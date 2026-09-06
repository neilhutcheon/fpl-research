import { createServer } from "node:http";
import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveProxy } from "./src/lib/proxy.js";

const HOST = "0.0.0.0";
const PORT = Number(process.env.PORT || 8000);
const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), "dist");
const UA = "Mozilla/5.0 FPL-Research-Desk";

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

async function proxyRequest(req, res, target) {
  const incoming = new URL(req.url, `http://${req.headers.host}`);
  const upstreamUrl = `${target.origin}${target.pathname}${incoming.search}`;
  try {
    const upstream = await fetch(upstreamUrl, {
      headers: {
        Accept: req.headers.accept || "application/json",
        "User-Agent": UA,
      },
    });
    const headers = {
      "content-type": upstream.headers.get("content-type") || "application/json",
      "cache-control": "public, max-age=30",
    };
    send(res, upstream.status, Buffer.from(await upstream.arrayBuffer()), headers);
  } catch (err) {
    send(res, 502, `Upstream error: ${err.message}`, { "content-type": "text/plain; charset=utf-8" });
  }
}

function contentType(filePath) {
  return MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const relative = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(DIST, relative));
  if (!filePath.startsWith(DIST)) {
    send(res, 403, "Forbidden");
    return;
  }
  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("not a file");
    res.writeHead(200, { "content-type": contentType(filePath) });
    createReadStream(filePath).pipe(res);
  } catch {
    const index = path.join(DIST, "index.html");
    res.writeHead(200, { "content-type": MIME[".html"] });
    createReadStream(index).pipe(res);
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  if (url.pathname === "/health") {
    send(res, 200, "ok", { "content-type": "text/plain; charset=utf-8" });
    return;
  }
  const target = resolveProxy(url.pathname);
  if (target) {
    proxyRequest(req, res, target);
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, HOST, () => {
  console.log(`FPL Research Desk listening on http://${HOST}:${PORT}`);
});
