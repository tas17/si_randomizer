import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultConfig, roll, RollError, totalDifficulty, mergeConfig } from "../src/engine.js";
import { launchUrls, layoutString } from "../src/launchUrl.js";

function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test("every roll respects the difficulty range", () => {
  const config = defaultConfig();
  config.difficulty = { enabled: true, min: 7, max: 9 };
  config.supportChance = 50;
  config.scenarioChance = 50;
  for (let i = 0; i < 300; i++) {
    const r = roll(config, seeded(i));
    assert.ok(r.difficulty.max >= 7 && r.difficulty.min <= 9, JSON.stringify(r.difficulty));
    if (r.support) assert.notEqual(r.support.id, r.adversary.id);
  }
});

test("player count, unique spirits and boards", () => {
  const config = defaultConfig();
  config.players = { min: 1, max: 4 };
  config.extraBoardChance = 100;
  for (let i = 0; i < 200; i++) {
    const r = roll(config, seeded(i));
    const n = r.spirits.length;
    assert.ok(n >= 1 && n <= 4);
    assert.equal(new Set(r.spirits.map((s) => s.id)).size, n);
    assert.equal(r.boards.length, n < 4 ? n + 1 : n);
    assert.equal(new Set(r.boards).size, r.boards.length);
  }
});

test("forced spirits always appear and banned never do", () => {
  const config = defaultConfig();
  config.spiritStatus = { Thunderspeaker: "force", RiverSurgesInSunlight: "ban" };
  for (let i = 0; i < 100; i++) {
    const ids = roll(config, seeded(i)).spirits.map((s) => s.id);
    assert.ok(ids.includes("Thunderspeaker"));
    assert.ok(!ids.includes("RiverSurgesInSunlight"));
  }
});

test("owned expansions limit content", () => {
  const config = defaultConfig();
  config.owned = { base: true };
  config.players = { min: 4, max: 4 };
  for (let i = 0; i < 50; i++) {
    const r = roll(config, seeded(i));
    assert.deepEqual([...r.boards].sort(), ["A", "B", "C", "D"]);
    for (const s of r.spirits) assert.equal(s.aspect, null);
  }
});

test("impossible difficulty throws RollError", () => {
  const config = defaultConfig();
  config.difficulty = { enabled: true, min: 40, max: 50 };
  assert.throws(() => roll(config, seeded(1)), RollError);
});

test("locks keep the locked parts", () => {
  const config = defaultConfig();
  config.players = { min: 3, max: 3 };
  const first = roll(config, seeded(3));
  const second = roll(config, seeded(99), first, { spirits: [1], adversary: true, map: true });
  assert.deepEqual(second.spirits[1], first.spirits[1]);
  assert.deepEqual(second.adversary, first.adversary);
  assert.deepEqual(second.boards, first.boards);
});

test("supporting adversary difficulty uses 50-75% of the lower one", () => {
  const d = totalDifficulty({ id: "TheKingdomOfEngland", level: 3 }, { id: "TheKingdomOfSweden", level: 2 }, "WardTheShores");
  assert.deepEqual(d, { min: 6 + 1.5 + 2, max: 6 + 2.25 + 2 });
});

test("launch URL matches the specification example", () => {
  const config = mergeConfig({ owned: { base: true, bc: true, pp1: false, pp2: false, je: false, horizons: false, ni: false } });
  config.practiceModes.StartOfGameGrowth = true;
  const result = {
    spirits: [
      { id: "SharpFangsBehindTheLeaves", aspect: null, progression: false },
      { id: "VitalStrengthOfTheEarth", aspect: null, progression: true },
    ],
    boards: ["A", "B"], thematic: false, layout: "Fragment",
    adversary: { id: "TheKingdomOfSweden", level: 3 }, support: null, scenario: "Blitz",
  };
  const urls = launchUrls(result, config);
  assert.equal(
    urls.web,
    "http://play.spiritislanddigital.com/screen/NewGame?spirits=SharpFangsBehindTheLeaves,VitalStrengthOfTheEarth"
      + "&boards=A,B&layout=A2:B1&adversary=TheKingdomOfSweden&adversaryLevel=3&scenario=Blitz"
      + "&useExpansions=BranchAndClaw&useTokens=1&useEvents=1&progressionSpirits=VitalStrengthOfTheEarth"
      + "&practiceModes=StartOfGameGrowth",
  );
});

test("steam URL matches the specification example", () => {
  const config = mergeConfig({ owned: { base: true, bc: false, pp1: false, pp2: false, je: false, horizons: false, ni: false } });
  const result = {
    spirits: [{ id: "SunBrightWhirlwind", aspect: null }, { id: "RiverSurgesInSunlight", aspect: null }],
    boards: ["East", "West"], thematic: true, layout: null,
    adversary: { id: "TheKingdomOfEngland", level: 0 }, support: null, scenario: null,
  };
  assert.equal(
    launchUrls(result, config).steam,
    "steam://run/1236720/?url=spiritisland%3A%2F%2Fscreen%2FNewGame%3Fspirits%3DSunBrightWhirlwind%2CRiverSurgesInSunlight%26boards%3DEast%2CWest%26adversary%3DTheKingdomOfEngland",
  );
});

test("standard layout is left to the game", () => {
  assert.equal(layoutString("Standard", ["A", "B"]), null);
  assert.equal(layoutString("Archipelago", ["A", "B"]), "A3:B3");
});

test("island modifiers count toward the difficulty range", () => {
  const config = defaultConfig();
  config.layouts = { Standard: false, Archipelago: true };
  config.players = { min: 2, max: 2 };
  config.extraBoardChance = 50;
  config.difficulty = { enabled: true, min: 2, max: 4 };
  for (let i = 0; i < 200; i++) {
    const r = roll(config, seeded(i));
    const expected = 1 + (r.extraBoard ? 4 : 0);
    assert.equal(r.island.total, expected);
    assert.ok(r.difficulty.min >= r.island.total);
    assert.ok(r.difficulty.max >= 2 && r.difficulty.min <= 4);
    assert.equal(r.extraBoard, false);
  }
});

test("thematic boards ignore the layout modifier", () => {
  const config = defaultConfig();
  config.thematicChance = 100;
  config.layouts = { Standard: false, Archipelago: true };
  config.difficulty.enabled = false;
  const r = roll(config, seeded(5));
  assert.equal(r.thematic, true);
  assert.deepEqual(r.island.parts, [{ label: "Thematic boards", value: 1 }]);
});

test("old saved configs get the island modifiers", () => {
  const config = mergeConfig({ players: { min: 1, max: 1 }, islandDifficulty: { extraBoard: 3 } });
  assert.equal(config.islandDifficulty.extraBoard, 3);
  assert.equal(config.islandDifficulty.thematic, 1);
  assert.equal(config.islandDifficulty.layouts.Archipelago, 1);
});
