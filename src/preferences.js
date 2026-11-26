import { mergeConfig } from "./engine.js";

export const PREFERENCES_KEY = "si-randomizer-preferences-v1";

const clone = (value) => JSON.parse(JSON.stringify(value));

export function emptyStore() {
  return { preferences: {}, defaultName: null };
}

const isPlainObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);

export function sanitizeStore(raw) {
  if (!isPlainObject(raw) || !isPlainObject(raw.preferences)) return emptyStore();
  const preferences = {};
  for (const [name, config] of Object.entries(raw.preferences)) {
    if (name.trim() && isPlainObject(config)) preferences[name] = config;
  }
  const defaultName = typeof raw.defaultName === "string" && preferences[raw.defaultName] ? raw.defaultName : null;
  return { preferences, defaultName };
}

export function readStore(storage) {
  try {
    return sanitizeStore(JSON.parse(storage.getItem(PREFERENCES_KEY)));
  } catch {
    return emptyStore();
  }
}

export function writeStore(storage, store) {
  try {
    storage.setItem(PREFERENCES_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

export function preferenceNames(store) {
  return Object.keys(store.preferences).sort((a, b) => a.localeCompare(b));
}

export function savePreference(store, name, config) {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("A preference needs a name.");
  return { ...store, preferences: { ...store.preferences, [trimmed]: clone(config) } };
}

export function deletePreference(store, name) {
  const preferences = { ...store.preferences };
  delete preferences[name];
  return { preferences, defaultName: store.defaultName === name ? null : store.defaultName };
}

export function renamePreference(store, from, to) {
  const trimmed = to.trim();
  if (!trimmed) throw new Error("A preference needs a name.");
  if (!store.preferences[from]) throw new Error(`No preference named "${from}".`);
  if (trimmed !== from && store.preferences[trimmed]) throw new Error(`A preference named "${trimmed}" already exists.`);
  const preferences = {};
  for (const [key, value] of Object.entries(store.preferences)) preferences[key === from ? trimmed : key] = value;
  return { preferences, defaultName: store.defaultName === from ? trimmed : store.defaultName };
}

export function setDefaultPreference(store, name) {
  if (name !== null && !store.preferences[name]) throw new Error(`No preference named "${name}".`);
  return { ...store, defaultName: name };
}

export function loadPreference(store, name) {
  const saved = store.preferences[name];
  return saved ? mergeConfig(clone(saved)) : null;
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sameConfig(a, b) {
  return stableStringify(mergeConfig(a)) === stableStringify(mergeConfig(b));
}
