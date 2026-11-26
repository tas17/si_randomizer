import {
  ADVERSARIES, BOARDS, COMPLEXITIES, EXPANSIONS, LAYOUTS, PRACTICE_MODES, SCENARIOS, SPIRITS, THEMATIC_BOARDS,
} from "./data.js";

export const MAX_PLAYERS = 4;
export const SUPPORT_SHARE = { min: 0.5, max: 0.75 };
const MAP_ATTEMPTS = 20;

export class RollError extends Error {}

export function defaultConfig() {
  return {
    owned: Object.fromEntries(EXPANSIONS.map((e) => [e.id, true])),
    players: { min: 2, max: 2 },
    extraBoardChance: 0,
    complexities: Object.fromEntries(COMPLEXITIES.map((c) => [c, true])),
    spiritStatus: {},
    aspectChance: 50,
    aspectBanned: {},
    progressionChance: 0,
    thematicChance: 0,
    layouts: Object.fromEntries(LAYOUTS.map((l) => [l.id, l.id === "Standard"])),
    boardBanned: {},
    allowNoAdversary: false,
    adversaries: Object.fromEntries(ADVERSARIES.map((a) => [a.id, { on: true, min: 0, max: 6 }])),
    supportChance: 0,
    scenarioChance: 30,
    scenarios: Object.fromEntries(SCENARIOS.map((s) => [s.id, true])),
    difficulty: { enabled: true, min: 3, max: 6 },
    islandDifficulty: {
      thematic: 1,
      extraBoard: 4,
      layouts: Object.fromEntries(LAYOUTS.map((l) => [l.id, l.id === "Archipelago" ? 1 : 0])),
    },
    events: true,
    practiceModes: Object.fromEntries(PRACTICE_MODES.map((p) => [p.id, false])),
  };
}

export function mergeConfig(saved) {
  const base = defaultConfig();
  if (!saved || typeof saved !== "object") return base;
  const out = { ...base, ...saved };
  for (const key of ["owned", "complexities", "layouts", "scenarios", "practiceModes", "players", "difficulty"]) {
    out[key] = { ...base[key], ...(saved[key] ?? {}) };
  }
  out.islandDifficulty = {
    ...base.islandDifficulty,
    ...(saved.islandDifficulty ?? {}),
    layouts: { ...base.islandDifficulty.layouts, ...(saved.islandDifficulty?.layouts ?? {}) },
  };
  out.adversaries = Object.fromEntries(
    ADVERSARIES.map((a) => [a.id, { ...base.adversaries[a.id], ...(saved.adversaries?.[a.id] ?? {}) }]),
  );
  return out;
}

const owns = (config, exp) => (Array.isArray(exp) ? exp.some((e) => config.owned[e]) : !!config.owned[exp]);

export const spiritById = (id) => SPIRITS.find((s) => s.id === id);
export const adversaryById = (id) => ADVERSARIES.find((a) => a.id === id);
export const scenarioById = (id) => SCENARIOS.find((s) => s.id === id);

const randInt = (rng, min, max) => min + Math.floor(rng() * (max - min + 1));
const pick = (rng, list) => list[Math.floor(rng() * list.length)];
const chance = (rng, percent) => rng() * 100 < percent;

function shuffle(rng, list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function availableAspects(config, spirit) {
  return spirit.aspects.filter((a) => owns(config, a.exp) && !config.aspectBanned[`${spirit.id}/${a.id}`]);
}

function rollSpiritExtras(config, rng, spirit) {
  const aspects = availableAspects(config, spirit);
  return {
    id: spirit.id,
    aspect: aspects.length && chance(rng, config.aspectChance) ? pick(rng, aspects).id : null,
    progression: !!spirit.progression && chance(rng, config.progressionChance),
  };
}

function rollSpirits(config, rng, previous, locks) {
  const lockedSlots = new Map();
  for (const index of locks.spirits ?? []) {
    const slot = previous?.spirits?.[index];
    if (slot) lockedSlots.set(index, slot);
  }

  const forced = SPIRITS.filter((s) => owns(config, s.exp) && config.spiritStatus[s.id] === "force");
  const pool = SPIRITS.filter(
    (s) => owns(config, s.exp) && config.complexities[s.complexity] && config.spiritStatus[s.id] !== "ban",
  );

  let count;
  if (locks.map && previous) {
    count = previous.spirits.length;
  } else {
    const min = Math.max(1, Math.min(config.players.min, config.players.max));
    const max = Math.min(MAX_PLAYERS, Math.max(config.players.min, config.players.max));
    count = randInt(rng, min, max);
  }
  const lockedIds = new Set([...lockedSlots.values()].map((s) => s.id));
  const missingForced = forced.filter((s) => !lockedIds.has(s.id));
  if (!(locks.map && previous)) {
    count = Math.min(MAX_PLAYERS, Math.max(count, lockedSlots.size + missingForced.length, Math.max(-1, ...lockedSlots.keys()) + 1));
  }

  const taken = new Set(lockedIds);
  const fresh = [];
  for (const spirit of missingForced) {
    if (fresh.length + lockedSlots.size >= count) break;
    fresh.push(spirit);
    taken.add(spirit.id);
  }
  const remaining = shuffle(rng, pool.filter((s) => !taken.has(s.id)));
  while (fresh.length + lockedSlots.size < count) {
    const next = remaining.shift();
    if (!next) throw new RollError("Not enough spirits in the pool for this player count.");
    fresh.push(next);
  }

  const shuffledFresh = shuffle(rng, fresh);
  const spirits = [];
  for (let i = 0; i < count; i++) {
    spirits.push(lockedSlots.has(i) ? lockedSlots.get(i) : rollSpiritExtras(config, rng, shuffledFresh.shift()));
  }
  return spirits;
}

function rollMap(config, rng, playerCount) {
  const warnings = [];
  const extraBoard = playerCount < MAX_PLAYERS && chance(rng, config.extraBoardChance);
  const boardCount = playerCount + (extraBoard ? 1 : 0);

  const thematicPool = THEMATIC_BOARDS.filter((b) => owns(config, b.exp));
  if (chance(rng, config.thematicChance)) {
    if (thematicPool.length >= boardCount) {
      const boards = shuffle(rng, thematicPool).slice(0, boardCount).map((b) => b.id);
      return { extraBoard, thematic: true, boards, layout: null, warnings };
    }
    warnings.push(`Not enough thematic boards for ${boardCount} boards: standard boards used.`);
  }

  const pool = BOARDS.filter((b) => owns(config, b.exp) && !config.boardBanned[b.id]);
  if (pool.length < boardCount) throw new RollError(`Not enough island boards for ${boardCount} boards.`);
  const boards = shuffle(rng, pool).slice(0, boardCount).map((b) => b.id);

  const layouts = LAYOUTS.filter((l) => config.layouts[l.id] && l.sizes.includes(boardCount));
  let layout = "Standard";
  if (layouts.length) layout = pick(rng, layouts).id;
  else warnings.push(`No selected layout supports ${boardCount} boards: standard layout used.`);

  return { extraBoard, thematic: false, boards, layout, warnings };
}

export function combinedAdversaryDifficulty(adv, support) {
  if (!adv) return { min: 0, max: 0 };
  const a = adversaryById(adv.id).difficulty[adv.level];
  if (!support) return { min: a, max: a };
  const s = adversaryById(support.id).difficulty[support.level];
  const high = Math.max(a, s);
  const low = Math.min(a, s);
  return { min: high + low * SUPPORT_SHARE.min, max: high + low * SUPPORT_SHARE.max };
}

export function totalDifficulty(adversary, support, scenarioId, island = 0) {
  const base = combinedAdversaryDifficulty(adversary, support);
  const scenario = scenarioId ? scenarioById(scenarioId).difficulty : 0;
  return { min: base.min + scenario + island, max: base.max + scenario + island };
}

export function islandDifficulty(config, map) {
  const mods = config.islandDifficulty;
  const parts = [];
  if (map.thematic) parts.push({ label: "Thematic boards", value: mods.thematic });
  else if (map.layout) parts.push({ label: `${LAYOUTS.find((l) => l.id === map.layout)?.name ?? map.layout} layout`, value: mods.layouts[map.layout] ?? 0 });
  if (map.extraBoard) parts.push({ label: "Extra board", value: mods.extraBoard });
  const nonZero = parts.filter((p) => p.value);
  return { total: nonZero.reduce((sum, p) => sum + p.value, 0), parts: nonZero };
}

function levelOptions(config, adversaryIds) {
  const out = [];
  for (const adv of ADVERSARIES) {
    const setting = config.adversaries[adv.id];
    if (!adversaryIds.includes(adv.id) || !setting?.on) continue;
    const lo = Math.max(0, Math.min(setting.min, setting.max));
    const hi = Math.min(6, Math.max(setting.min, setting.max));
    for (let level = lo; level <= hi; level++) out.push({ id: adv.id, level });
  }
  return out;
}

function pickHierarchically(rng, tuples, keys) {
  let rest = tuples;
  for (const key of keys) {
    const values = [...new Set(rest.map(key))];
    const chosen = pick(rng, values);
    rest = rest.filter((t) => key(t) === chosen);
  }
  return pick(rng, rest);
}

function rollOpposition(config, rng, previous, locks, island) {
  const warnings = [];
  const ownedAdversaries = ADVERSARIES.filter((a) => owns(config, a.exp)).map((a) => a.id);
  const ownedScenarios = SCENARIOS.filter((s) => owns(config, s.exp) && config.scenarios[s.id]).map((s) => s.id);

  const adversaryOptions = locks.adversary && previous
    ? [previous.adversary]
    : [...(config.allowNoAdversary ? [null] : []), ...levelOptions(config, ownedAdversaries)];
  const supportPool = locks.support && previous ? [previous.support] : levelOptions(config, ownedAdversaries);
  const scenarioPool = locks.scenario && previous ? [previous.scenario] : ownedScenarios;

  const wantSupport = locks.support && previous ? !!previous.support : chance(rng, config.supportChance);
  const wantScenario = locks.scenario && previous ? !!previous.scenario : chance(rng, config.scenarioChance);

  const build = (useSupport, useScenario) => {
    const supports = useSupport ? supportPool : [null];
    const scenarios = useScenario ? scenarioPool : [null];
    const tuples = [];
    for (const adversary of adversaryOptions) {
      for (const support of supports) {
        if (support && (!adversary || support.id === adversary.id)) continue;
        for (const scenario of scenarios) {
          if (useScenario && !scenario) continue;
          const difficulty = totalDifficulty(adversary, support, scenario, island);
          if (config.difficulty.enabled
            && (difficulty.max < config.difficulty.min || difficulty.min > config.difficulty.max)) continue;
          tuples.push({ adversary, support, scenario, difficulty });
        }
      }
    }
    return tuples;
  };

  const attempts = [[wantSupport, wantScenario]];
  if (!(locks.scenario && previous)) attempts.push([wantSupport, !wantScenario]);
  if (!(locks.support && previous)) attempts.push([!wantSupport, wantScenario]);
  if (!(locks.scenario && previous) && !(locks.support && previous)) attempts.push([!wantSupport, !wantScenario]);

  for (const [useSupport, useScenario] of attempts) {
    const tuples = build(useSupport, useScenario);
    if (!tuples.length) continue;
    if (useSupport !== wantSupport) {
      warnings.push(wantSupport ? "No supporting adversary fits the difficulty range." : "A supporting adversary was needed to reach the difficulty range.");
    }
    if (useScenario !== wantScenario) {
      warnings.push(wantScenario ? "No scenario fits the difficulty range." : "A scenario was needed to reach the difficulty range.");
    }
    const chosen = pickHierarchically(rng, tuples, [
      (t) => t.adversary?.id ?? "",
      (t) => t.support?.id ?? "",
      (t) => t.scenario ?? "",
      (t) => t.adversary?.level ?? -1,
      (t) => t.support?.level ?? -1,
    ]);
    return { ...chosen, warnings };
  }
  throw new RollError("No adversary / scenario combination fits the settings and the difficulty range.");
}

export function roll(config, rng = Math.random, previous = null, locks = {}) {
  const spirits = rollSpirits(config, rng, previous, locks);
  const mapLocked = !!(locks.map && previous);
  let map;
  let island;
  let opposition;
  for (let attempt = 0; !opposition; attempt++) {
    map = mapLocked
      ? { extraBoard: previous.extraBoard, thematic: previous.thematic, boards: previous.boards, layout: previous.layout, warnings: [] }
      : rollMap(config, rng, spirits.length);
    island = islandDifficulty(config, map);
    try {
      opposition = rollOpposition(config, rng, previous, locks, island.total);
    } catch (e) {
      if (!(e instanceof RollError) || mapLocked || island.total === 0 || attempt >= MAP_ATTEMPTS) throw e;
    }
  }
  return {
    spirits,
    extraBoard: map.extraBoard,
    thematic: map.thematic,
    boards: map.boards,
    layout: map.layout,
    adversary: opposition.adversary,
    support: opposition.support,
    scenario: opposition.scenario,
    difficulty: opposition.difficulty,
    island,
    warnings: [...map.warnings, ...opposition.warnings],
  };
}
