import { readStore, sanitizeStore, writeStore } from "./preferences.js";

export const API_URL = "api/preferences";

const hasPreferences = (store) => Object.keys(store.preferences).length > 0;

async function fetchServerStore(fetchImpl) {
  const response = await fetchImpl(API_URL, { headers: { Accept: "application/json" }, cache: "no-store" });
  const type = response.headers.get("content-type") ?? "";
  if (!response.ok || !type.includes("application/json")) throw new Error("no preferences server");
  return sanitizeStore(await response.json());
}

export async function openPreferenceStore({ storage, fetchImpl = globalThis.fetch?.bind(globalThis) }) {
  const local = readStore(storage);
  const browserBackend = { mode: "browser", store: local, save: async (next) => writeStore(storage, next) };
  if (!fetchImpl) return browserBackend;

  let store;
  try {
    store = await fetchServerStore(fetchImpl);
  } catch {
    return browserBackend;
  }

  const save = async (next) => {
    try {
      const response = await fetchImpl(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  let imported = 0;
  if (!hasPreferences(store) && hasPreferences(local) && await save(local)) {
    store = local;
    imported = Object.keys(local.preferences).length;
  }
  return { mode: "server", store, save, imported };
}
