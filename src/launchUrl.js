import { EXPANSIONS, PRACTICE_MODES } from "./data.js";

export const WEB_BASE = "http://play.spiritislanddigital.com/screen/NewGame?";
export const APP_BASE = "spiritisland://screen/NewGame?";
export const STEAM_APP_ID = 1236720;

const LAYOUT_PAIRS = {
  Coastline: {
    2: [[0, 0, 1, 2]],
    3: [[0, 0, 1, 2], [1, 0, 2, 2]],
    4: [[0, 0, 1, 2], [1, 0, 2, 2], [2, 0, 3, 2]],
  },
  Archipelago: {
    2: [[0, 3, 1, 3]],
    3: [[0, 3, 1, 3], [1, 0, 2, 2]],
    4: [[0, 3, 1, 3], [0, 0, 2, 2], [2, 3, 3, 3], [1, 2, 3, 0]],
  },
  Fragment: { 2: [[0, 2, 1, 1]] },
  OppositeShores: { 2: [[0, 1, 1, 1]] },
  Sunrise: { 3: [[0, 2, 1, 1], [1, 0, 2, 1]] },
  Snake: {
    3: [[0, 2, 1, 2], [1, 1, 2, 1]],
    4: [[0, 2, 1, 2], [1, 1, 2, 1], [2, 2, 3, 2]],
  },
  Leaf: { 4: [[0, 0, 1, 1], [1, 0, 2, 2], [2, 1, 3, 2], [3, 1, 0, 1]] },
};

export function layoutString(layout, boards) {
  const pairs = LAYOUT_PAIRS[layout]?.[boards.length];
  if (!pairs) return null;
  return pairs.map(([a, sa, b, sb]) => `${boards[a]}${sa}:${boards[b]}${sb}`).join(",");
}

export function launchParams(result, config) {
  const params = [];
  const add = (key, value) => {
    if (value !== null && value !== undefined && value !== "") params.push([key, String(value)]);
  };

  add("spirits", result.spirits.map((s) => s.id).join(","));
  add("boards", result.boards.join(","));
  if (!result.thematic) add("layout", layoutString(result.layout, result.boards));
  if (result.adversary) {
    add("adversary", result.adversary.id);
    if (result.adversary.level > 0) add("adversaryLevel", result.adversary.level);
    if (result.support) {
      add("supportingAdversary", result.support.id);
      if (result.support.level > 0) add("supportingAdversaryLevel", result.support.level);
    }
  }
  add("scenario", result.scenario);

  const expansions = EXPANSIONS.filter((e) => e.urlId && config.owned[e.id]).map((e) => e.urlId);
  add("useExpansions", expansions.join(","));
  if (expansions.length) add("useTokens", 1);
  if (config.events && (config.owned.bc || config.owned.je)) add("useEvents", 1);

  add("progressionSpirits", result.spirits.filter((s) => s.progression).map((s) => s.id).join(","));
  add("practiceModes", PRACTICE_MODES.filter((p) => config.practiceModes[p.id]).map((p) => p.id).join(","));
  add("aspects", result.spirits.filter((s) => s.aspect).map((s) => s.aspect).join(","));
  return params;
}

const query = (params) => params.map(([k, v]) => `${k}=${v}`).join("&");

export function launchUrls(result, config) {
  const q = query(launchParams(result, config));
  const app = APP_BASE + q;
  return {
    web: WEB_BASE + q,
    app,
    steam: `steam://run/${STEAM_APP_ID}/?url=${encodeURIComponent(app)}`,
  };
}
