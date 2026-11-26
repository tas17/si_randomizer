import { test } from "node:test";
import assert from "node:assert/strict";
import { ADVERSARIES, SCENARIOS, SPIRITS } from "../src/data.js";
import {
  ADVERSARY_ICONS, SCENARIO_ICONS, SPIRIT_FOCUS, SPIRIT_ICONS, adversaryIcon, focusBox, scenarioIcon, spiritIcon, textColorOn,
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

test("every spirit has a focus point inside its image", () => {
  for (const s of SPIRITS) {
    const f = SPIRIT_FOCUS[s.id];
    assert.ok(f, s.id);
    assert.ok(f[0] >= 0 && f[0] <= 100 && f[1] >= 0 && f[1] <= 100 && f[2] >= 1, s.id);
  }
});

test("the crop centres the focus point and never shows an empty edge", () => {
  const box = focusBox(160, 100, 40, [50, 50, 2]);
  assert.deepEqual(box, { width: 128, height: 80, left: -44, top: -20 });
  const corner = focusBox(160, 100, 40, [0, 0, 2]);
  assert.equal(corner.left, 0);
  assert.equal(corner.top, 0);
  const far = focusBox(160, 100, 40, [100, 100, 2]);
  assert.equal(far.left, 40 - far.width);
  assert.equal(far.top, 40 - far.height);
});
