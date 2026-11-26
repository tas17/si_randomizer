import { createServer } from "node:http";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { emptyStore, sanitizeStore } from "./src/preferences.js";

const ROOT = dirname(fileURLToPath(import.meta.url));
const MAX_BODY = 1024 * 1024;
const API_PATH = "/api/preferences";
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
};
const PUBLIC = ["index.html", "styles.css", "src/", "images/"];

export async function readPreferences(file) {
  try {
    return sanitizeStore(JSON.parse(await readFile(file, "utf8")));
  } catch (e) {
    if (e.code === "ENOENT") return emptyStore();
    throw e;
  }
}

async function writePreferences(file, store) {
  await mkdir(dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  await writeFile(temp, `${JSON.stringify(store, null, 2)}\n`);
  await rename(temp, file);
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(body);
}

const sendJson = (res, status, value) => send(res, status, JSON.stringify(value));

function readBody(req) {
  return new Promise((ok, fail) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        fail(Object.assign(new Error("Body too large"), { status: 413 }));
        req.destroy();
      } else {
        chunks.push(chunk);
      }
    });
    req.on("end", () => ok(Buffer.concat(chunks).toString("utf8")));
    req.on("error", fail);
  });
}

async function handleApi(req, res, dataFile) {
  if (req.method === "GET") return sendJson(res, 200, await readPreferences(dataFile));
  if (req.method !== "PUT") return sendJson(res, 405, { error: "Use GET or PUT." });
  let parsed;
  try {
    parsed = JSON.parse(await readBody(req));
  } catch (e) {
    return sendJson(res, e.status ?? 400, { error: e.status ? e.message : "Body is not valid JSON." });
  }
  if (!parsed || typeof parsed !== "object" || typeof parsed.preferences !== "object") {
    return sendJson(res, 400, { error: "Expected { preferences, defaultName }." });
  }
  const store = sanitizeStore(parsed);
  await writePreferences(dataFile, store);
  return sendJson(res, 200, store);
}

async function handleStatic(req, res, root) {
  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, "Method not allowed", "text/plain");
  let path;
  try {
    path = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/+/, "");
  } catch {
    return send(res, 400, "Bad request", "text/plain");
  }
  if (path === "") path = "index.html";
  const full = resolve(root, path);
  const rel = relative(root, full).split(sep).join("/");
  const allowed = !rel.startsWith("..") && !isAbsolute(rel)
    && PUBLIC.some((p) => (p.endsWith("/") ? rel.startsWith(p) : rel === p));
  if (!allowed) return send(res, 404, "Not found", "text/plain");
  try {
    const body = await readFile(full);
    res.writeHead(200, { "Content-Type": TYPES[extname(full)] ?? "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    send(res, 404, "Not found", "text/plain");
  }
}

export function createAppServer({ root = ROOT, dataFile = join(ROOT, "data", "preferences.json") } = {}) {
  return createServer(async (req, res) => {
    try {
      const { pathname } = new URL(req.url, "http://x");
      if (pathname === API_PATH) await handleApi(req, res, dataFile);
      else await handleStatic(req, res, root);
    } catch (e) {
      console.error(e);
      if (!res.headersSent) sendJson(res, 500, { error: "Server error." });
      else res.end();
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 8000;
  createAppServer().listen(port, "127.0.0.1", () => {
    console.log(`Spirit Island Randomizer on http://localhost:${port} (preferences in data/preferences.json)`);
  });
}
