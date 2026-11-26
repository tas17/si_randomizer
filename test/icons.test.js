import { test } from "node:test";
import assert from "node:assert/strict";
import { ADVERSARIES, SCENARIOS, SPIRITS } from "../src/data.js";
import {
  ADVERSARY_ICONS, SCENARIO_ICONS, SPIRIT_ICONS, adversaryIcon, scenarioIcon, spiritIcon, textColorOn,
} from "../src/icons.js";

const unique = (list) => new Set(list).size === list.length;

test("every spirit, adversary and scenario has its own icon code", () => {
  assert.deepEqual(SPIRITS.filter((s) => !SPIRIT_ICONS[s.id]).map((s) => s.id), []);
  assert.deepEqual(ADVERSARIES.filter((a) => !ADVERSARY_ICONS[a.id]).map((a) => a.id), []);
  assert.deepEqual(SCENARIOS.filter((s) => !SCENARIO_ICONS[s.id]).map((s) => s.id), []);
  assert.ok(unique(Object.values(SPIRIT_ICONS).map((i) => i.abbr)));
  assert.ok(unique(Object.values(ADVERSARY_ICONS).map((i) => i.abbr)));
  assert.ok(unique(Object.values(SCENARIO_ICONS)));
});

test("icons are labelled SVG and escape names", () => {
  const markup = spiritIcon({ id: "Unknown", name: "A <b> & \"c\"" });
  assert.match(markup, /^<svg [^>]*role="img"/);
  assert.ok(!markup.includes("<b>"));
  assert.match(adversaryIcon(ADVERSARIES[0]), /aria-label="Brandenburg-Prussia"/);
  assert.match(scenarioIcon(SCENARIOS[0]), /<title>Blitz<\/title>/);
});

test("label text is readable on light and dark fills", () => {
  assert.equal(textColorOn("#f2c200"), "#1a1a1a");
  assert.equal(textColorOn("#1d4f7a"), "#ffffff");
});
