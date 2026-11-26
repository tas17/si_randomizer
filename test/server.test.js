import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAppServer } from "../server.mjs";
import { defaultConfig } from "../src/engine.js";
import { openPreferenceStore } from "../src/preferenceStore.js";
import { PREFERENCES_KEY } from "../src/preferences.js";

let server;
let base;
let dir;
let dataFile;

before(async () => {
  dir = await mkdtemp(join(tmpdir(), "si-randomizer-"));
  dataFile = join(dir, "data", "preferences.json");
  server = createAppServer({ dataFile });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((ok) => server.close(ok));
  await rm(dir, { recursive: true, force: true });
});

const put = (body) => fetch(`${base}/api/preferences`, {
  method: "PUT", headers: { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body),
});

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)) };
}

const fetchAt = (url, init) => fetch(new URL(url, `${base}/`), init);

test("an empty server returns an empty store", async () => {
  const r = await fetch(`${base}/api/preferences`);
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { preferences: {}, defaultName: null });
});

test("PUT saves to the file and GET returns it", async () => {
  const store = { preferences: { Solo: defaultConfig() }, defaultName: "Solo" };
  assert.equal((await put(store)).status, 200);
  const saved = JSON.parse(await readFile(dataFile, "utf8"));
  assert.equal(saved.defaultName, "Solo");
  assert.deepEqual(await (await fetch(`${base}/api/preferences`)).json(), saved);
});

test("invalid bodies are refused and keep the file", async () => {
  assert.equal((await put("{not json")).status, 400);
  assert.equal((await put([1, 2])).status, 400);
  assert.equal(JSON.parse(await readFile(dataFile, "utf8")).defaultName, "Solo");
});

test("a dangling default is dropped", async () => {
  await put({ preferences: { A: {} }, defaultName: "Missing" });
  assert.equal((await (await fetch(`${base}/api/preferences`)).json()).defaultName, null);
});

test("static files are served, private files are not", async () => {
  assert.equal((await fetch(`${base}/`)).status, 200);
  assert.match((await fetch(`${base}/src/app.js`)).headers.get("content-type"), /javascript/);
  for (const path of ["/data/preferences.json", "/server.mjs", "/.gitignore", "/src/..%2Fserver.mjs", "/src/..%2Fdata/preferences.json", "/images/..%2F..%2Fetc/passwd", "/%E0%A4%A"]) {
    assert.notEqual((await fetch(`${base}${path}`)).status, 200, path);
  }
});

test("the page uses the server and moves browser preferences into an empty file", async () => {
  await put({ preferences: {}, defaultName: null });
  const local = { preferences: { Old: defaultConfig() }, defaultName: "Old" };
  const storage = memoryStorage({ [PREFERENCES_KEY]: JSON.stringify(local) });
  const backend = await openPreferenceStore({ storage, fetchImpl: fetchAt });
  assert.equal(backend.mode, "server");
  assert.equal(backend.imported, 1);
  assert.equal(JSON.parse(await readFile(dataFile, "utf8")).defaultName, "Old");
});

test("the page keeps server preferences over browser ones", async () => {
  await put({ preferences: { Server: defaultConfig() }, defaultName: null });
  const storage = memoryStorage({ [PREFERENCES_KEY]: JSON.stringify({ preferences: { Local: {} }, defaultName: null }) });
  const backend = await openPreferenceStore({ storage, fetchImpl: fetchAt });
  assert.equal(backend.imported, 0);
  assert.deepEqual(Object.keys(backend.store.preferences), ["Server"]);
});

test("without a server the page falls back to browser storage", async () => {
  const storage = memoryStorage();
  const notFound = async () => new Response("Not found", { status: 404, headers: { "Content-Type": "text/html" } });
  const backend = await openPreferenceStore({ storage, fetchImpl: notFound });
  assert.equal(backend.mode, "browser");
  assert.ok(await backend.save({ preferences: { X: {} }, defaultName: null }));
  assert.ok(storage.getItem(PREFERENCES_KEY).includes('"X"'));

  const offline = async () => { throw new TypeError("network"); };
  assert.equal((await openPreferenceStore({ storage, fetchImpl: offline })).mode, "browser");
});
