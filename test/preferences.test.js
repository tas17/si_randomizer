import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultConfig } from "../src/engine.js";
import {
  deletePreference, emptyStore, loadPreference, preferenceNames, readStore, renamePreference, sameConfig,
  savePreference, setDefaultPreference, writeStore,
} from "../src/preferences.js";

function memoryStorage() {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)) };
}

test("saved preferences round-trip through storage", () => {
  const storage = memoryStorage();
  const config = defaultConfig();
  config.players = { min: 1, max: 1 };
  let store = savePreference(emptyStore(), "  Solo  ", config);
  store = setDefaultPreference(store, "Solo");
  assert.ok(writeStore(storage, store));

  const back = readStore(storage);
  assert.equal(back.defaultName, "Solo");
  assert.deepEqual(loadPreference(back, "Solo").players, { min: 1, max: 1 });
});

test("a saved preference does not change when the live config changes", () => {
  const config = defaultConfig();
  const store = savePreference(emptyStore(), "A", config);
  config.players.min = 4;
  assert.equal(loadPreference(store, "A").players.min, 2);
});

test("deleting the default preference clears the default", () => {
  let store = savePreference(emptyStore(), "A", defaultConfig());
  store = setDefaultPreference(store, "A");
  store = deletePreference(store, "A");
  assert.equal(store.defaultName, null);
  assert.deepEqual(preferenceNames(store), []);
});

test("renaming keeps the default and refuses duplicates", () => {
  let store = savePreference(emptyStore(), "A", defaultConfig());
  store = savePreference(store, "B", defaultConfig());
  store = setDefaultPreference(store, "A");
  store = renamePreference(store, "A", "C");
  assert.equal(store.defaultName, "C");
  assert.deepEqual(preferenceNames(store), ["B", "C"]);
  assert.throws(() => renamePreference(store, "B", "C"));
});

test("empty names and unknown defaults are refused", () => {
  assert.throws(() => savePreference(emptyStore(), "   ", defaultConfig()));
  assert.throws(() => setDefaultPreference(emptyStore(), "missing"));
});

test("corrupt or dangling storage falls back safely", () => {
  const storage = memoryStorage();
  storage.setItem("si-randomizer-preferences-v1", "{not json");
  assert.deepEqual(readStore(storage), emptyStore());
  storage.setItem("si-randomizer-preferences-v1", JSON.stringify({ preferences: {}, defaultName: "gone" }));
  assert.equal(readStore(storage).defaultName, null);
});

test("config comparison ignores key order", () => {
  const a = defaultConfig();
  const b = defaultConfig();
  a.spiritStatus = { Thunderspeaker: "force", OceansHungryGrasp: "ban" };
  b.spiritStatus = { OceansHungryGrasp: "ban", Thunderspeaker: "force" };
  assert.ok(sameConfig(a, b));
  b.players.max = 3;
  assert.ok(!sameConfig(a, b));
});
