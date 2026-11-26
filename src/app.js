import {
  ADVERSARIES, BOARDS, CANONICAL_SHEET_IDS, COMPLEXITIES, EXPANSIONS, LAYOUTS, PRACTICE_MODES, SCENARIOS, SPIRITS,
  THEMATIC_BOARDS,
} from "./data.js";
import {
  adversaryById, availableAspects, defaultConfig, mergeConfig, roll, RollError, scenarioById, spiritById,
} from "./engine.js";
import { launchUrls } from "./launchUrl.js";

const STORAGE_KEY = "si-randomizer-config-v1";
const STATUS_CYCLE = { allow: "force", force: "ban", ban: "allow" };
const STATUS_LABEL = { allow: "Random", force: "Always", ban: "Never" };

let config = loadConfig();
let result = null;
let error = null;
let locks = { spirits: [] };
const openSections = new Set(["expansions", "difficulty"]);

function loadConfig() {
  try {
    return mergeConfig(JSON.parse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return defaultConfig();
  }
}

function saveConfig() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith("on")) el.addEventListener(key.slice(2), value);
    else if (key === "class") el.className = value;
    else if (key in el && typeof value !== "string") el[key] = value;
    else el.setAttribute(key, value === true ? "" : value);
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

const owns = (exp) => (Array.isArray(exp) ? exp.some((e) => config.owned[e]) : !!config.owned[exp]);
const expName = (id) => EXPANSIONS.find((e) => e.id === id)?.name ?? id;
const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, ""));

function changed({ rerender = false } = {}) {
  saveConfig();
  if (rerender) renderSettings();
}


function doRoll() {
  try {
    result = roll(config, Math.random, result, locks);
    error = null;
    const count = result.spirits.length;
    locks.spirits = locks.spirits.filter((i) => i < count);
  } catch (e) {
    if (!(e instanceof RollError)) throw e;
    error = e.message;
  }
  renderResult();
}

function lockButton(isLocked, toggle) {
  return h("button", {
    type: "button",
    class: "lock",
    "aria-pressed": String(isLocked),
    title: isLocked ? "Locked: kept on next roll" : "Lock this item",
    onclick: () => { toggle(); renderResult(); },
  }, isLocked ? "Locked" : "Lock");
}

function levelText(level) {
  return level === 0 ? "base level" : `level ${level}`;
}

function renderResult() {
  const root = document.getElementById("result");
  root.replaceChildren();
  if (error) root.append(h("div", { class: "error" }, error));
  if (!result) {
    if (!error) root.append(h("p", { class: "muted" }, "Set your options below, then roll."));
    return;
  }

  const rows = [];
  result.spirits.forEach((slot, i) => {
    const spirit = spiritById(slot.id);
    const aspect = spirit.aspects.find((a) => a.id === slot.aspect);
    const locked = locks.spirits.includes(i);
    rows.push(h("div", { class: "row" },
      h("span", { class: "label" }, `Player ${i + 1} · board ${result.boards[i]}`),
      h("span", { class: "value" },
        h("strong", {}, spirit.name),
        aspect && h("span", { class: "tag" }, `Aspect: ${aspect.name}`),
        slot.progression && h("span", { class: "tag" }, "Power Progression"),
        h("span", { class: "tag" }, spirit.complexity)),
      lockButton(locked, () => {
        locks.spirits = locked ? locks.spirits.filter((x) => x !== i) : [...locks.spirits, i];
      })));
  });

  const mapText = result.thematic
    ? `Thematic boards: ${result.boards.join(", ")}`
    : `${LAYOUTS.find((l) => l.id === result.layout)?.name ?? result.layout} · boards ${result.boards.join(", ")}`;
  rows.push(h("div", { class: "row" },
    h("span", { class: "label" }, "Island"),
    h("span", { class: "value" }, mapText,
      result.extraBoard && h("span", { class: "tag" }, `Extra board ${result.boards.at(-1)}`)),
    lockButton(!!locks.map, () => { locks.map = !locks.map; })));

  const adv = result.adversary && adversaryById(result.adversary.id);
  rows.push(h("div", { class: "row" },
    h("span", { class: "label" }, "Adversary"),
    h("span", { class: "value" }, adv
      ? [h("strong", {}, adv.name), ` – ${levelText(result.adversary.level)}`,
        h("span", { class: "tag" }, `difficulty ${adv.difficulty[result.adversary.level]}`)]
      : "None"),
    lockButton(!!locks.adversary, () => { locks.adversary = !locks.adversary; })));

  const sup = result.support && adversaryById(result.support.id);
  rows.push(h("div", { class: "row" },
    h("span", { class: "label" }, "Supporting"),
    h("span", { class: "value" }, sup
      ? [h("strong", {}, sup.name), ` – ${levelText(result.support.level)}`,
        h("span", { class: "tag" }, `difficulty ${sup.difficulty[result.support.level]}`)]
      : "None"),
    lockButton(!!locks.support, () => { locks.support = !locks.support; })));

  const scen = result.scenario && scenarioById(result.scenario);
  rows.push(h("div", { class: "row" },
    h("span", { class: "label" }, "Scenario"),
    h("span", { class: "value" }, scen
      ? [h("strong", {}, scen.name), h("span", { class: "tag" }, `difficulty ${scen.difficulty}`)]
      : "None"),
    lockButton(!!locks.scenario, () => { locks.scenario = !locks.scenario; })));

  const d = result.difficulty;
  rows.push(h("div", { class: "row" },
    h("span", { class: "label" }, "Difficulty"),
    h("span", { class: "value difficulty" }, d.min === d.max ? fmt(d.min) : `${fmt(d.min)} – ${fmt(d.max)}`,
      result.support && h("span", { class: "tag" }, "higher + 50–75% of lower adversary")),
    h("span")));

  const urls = launchUrls(result, config);
  const copy = (text, btn) => {
    navigator.clipboard?.writeText(text).then(() => {
      btn.textContent = "Copied";
      setTimeout(() => { btn.textContent = "Copy web link"; }, 1500);
    });
  };
  const copyBtn = h("button", { type: "button", onclick: (e) => copy(urls.web, e.currentTarget) }, "Copy web link");

  root.append(
    h("div", { class: "result-grid" }, rows),
    result.warnings.map((w) => h("div", { class: "warn" }, w)),
    h("div", { class: "links" },
      h("a", { class: "btn main", href: urls.web, target: "_blank", rel: "noopener" }, "Launch (web link)"),
      h("a", { class: "btn", href: urls.app }, "Open app (spiritisland://)"),
      h("a", { class: "btn", href: urls.steam }, "Launch with Steam"),
      copyBtn),
    h("div", { class: "url" }, urls.web),
  );
}


function section(id, title, ...content) {
  return h("details", {
    class: "card",
    open: openSections.has(id),
    ontoggle: (e) => (e.currentTarget.open ? openSections.add(id) : openSections.delete(id)),
  }, h("summary", {}, title), content);
}

function checkbox(label, checked, onChange, extra) {
  return h("label", { class: "check" },
    h("input", { type: "checkbox", checked, onchange: (e) => onChange(e.target.checked) }),
    h("span", {}, label), extra);
}

function numberInput(value, min, max, onChange, attrs = {}) {
  return h("input", {
    type: "number", value: String(value), min: String(min), max: String(max), step: "1", ...attrs,
    onchange: (e) => {
      const n = Math.max(min, Math.min(max, Number(e.target.value) || 0));
      e.target.value = String(n);
      onChange(n);
    },
  });
}

function percentSlider(label, key) {
  const out = h("span", {}, `${config[key]}%`);
  return h("div", { class: "field" },
    h("span", {}, label, " – ", out),
    h("input", {
      type: "range", min: "0", max: "100", step: "5", value: String(config[key]),
      oninput: (e) => { config[key] = Number(e.target.value); out.textContent = `${config[key]}%`; },
      onchange: () => changed(),
    }));
}

function levelSelect(value, onChange) {
  return h("select", { onchange: (e) => onChange(Number(e.target.value)) },
    [0, 1, 2, 3, 4, 5, 6].map((l) => h("option", { value: String(l), selected: l === value }, l === 0 ? "Base" : String(l))));
}

function expansionsSection() {
  return section("expansions", "Owned content",
    h("p", { class: "muted" }, "Only owned content is rolled. The game also ignores content you do not own."),
    h("div", { class: "grid" }, EXPANSIONS.map((e) =>
      checkbox(e.name, !!config.owned[e.id], (v) => { config.owned[e.id] = v; changed({ rerender: true }); }))));
}

function playersSection() {
  const boards = BOARDS.filter((b) => owns(b.exp));
  const thematic = THEMATIC_BOARDS.filter((b) => owns(b.exp));
  return section("players", "Players and island",
    h("div", { class: "field" }, h("span", {}, "Number of spirits (1–4)"),
      h("div", { class: "inline" },
        "from", numberInput(config.players.min, 1, 4, (n) => { config.players.min = n; changed(); }),
        "to", numberInput(config.players.max, 1, 4, (n) => { config.players.max = n; changed(); }))),
    percentSlider("Chance of an extra island board (no spirit)", "extraBoardChance"),
    percentSlider("Chance of thematic boards", "thematicChance"),
    h("p", { class: "muted" }, `Thematic boards owned: ${thematic.map((b) => b.name).join(", ") || "none"}. The game uses a fixed layout for them.`),
    h("div", { class: "field" }, h("span", {}, "Allowed layouts (standard boards)"),
      h("div", { class: "grid" }, LAYOUTS.map((l) =>
        checkbox(`${l.name}`, !!config.layouts[l.id], (v) => { config.layouts[l.id] = v; changed(); },
          h("span", { class: "muted" }, `(${l.sizes.join("/")} boards)`))))),
    h("div", { class: "field" }, h("span", {}, "Allowed island boards"),
      h("div", { class: "inline" }, boards.map((b) =>
        checkbox(b.id, !config.boardBanned[b.id], (v) => { config.boardBanned[b.id] = !v; changed(); })))));
}

function difficultySection() {
  return section("difficulty", "Difficulty target",
    checkbox("Only roll setups in this difficulty range", config.difficulty.enabled,
      (v) => { config.difficulty.enabled = v; changed(); }),
    h("div", { class: "inline", style: "margin-top:8px" },
      "from", numberInput(config.difficulty.min, -1, 30, (n) => { config.difficulty.min = n; changed(); }),
      "to", numberInput(config.difficulty.max, -1, 30, (n) => { config.difficulty.max = n; changed(); })),
    h("p", { class: "muted" },
      "Difficulty = adversary difficulty at its level + scenario difficulty. With a supporting adversary: ",
      "the higher adversary difficulty + 50–75% of the lower one (Nature Incarnate rule). ",
      "The randomizer adapts adversary levels, the supporting adversary and the scenario to hit the range."));
}

function adversariesSection() {
  const owned = ADVERSARIES.filter((a) => owns(a.exp));
  return section("adversaries", "Adversaries",
    checkbox("Allow no adversary", config.allowNoAdversary, (v) => { config.allowNoAdversary = v; changed(); }),
    percentSlider("Chance of a supporting adversary", "supportChance"),
    h("p", { class: "muted" }, "The supporting adversary uses the same pool and level range. Supporting adversaries need game version 2.7.1 or later."),
    h("div", { class: "table-wrap" }, h("table", {},
      h("thead", {}, h("tr", {}, h("th", {}, "Use"), h("th", {}, "Adversary"), h("th", {}, "Min level"),
        h("th", {}, "Max level"), h("th", {}, "Difficulty by level"))),
      h("tbody", {}, owned.map((a) => {
        const s = config.adversaries[a.id];
        return h("tr", {},
          h("td", {}, h("input", { type: "checkbox", checked: s.on, "aria-label": `Use ${a.name}`, onchange: (e) => { s.on = e.target.checked; changed(); } })),
          h("td", {}, a.name),
          h("td", {}, levelSelect(s.min, (n) => { s.min = n; changed(); })),
          h("td", {}, levelSelect(s.max, (n) => { s.max = n; changed(); })),
          h("td", { class: "muted" }, a.difficulty.join(" · ")));
      })))));
}

function scenariosSection() {
  const owned = SCENARIOS.filter((s) => owns(s.exp));
  return section("scenarios", "Scenarios",
    percentSlider("Chance of a scenario", "scenarioChance"),
    h("div", { class: "grid" }, owned.map((s) =>
      checkbox(s.name, !!config.scenarios[s.id], (v) => { config.scenarios[s.id] = v; changed(); },
        h("span", { class: "muted" }, `(${s.difficulty})`)))));
}

function spiritsSection() {
  const owned = SPIRITS.filter((s) => owns(s.exp));
  return section("spirits", "Spirits and aspects",
    h("div", { class: "field" }, h("span", {}, "Allowed complexity"),
      h("div", { class: "inline" }, COMPLEXITIES.map((c) =>
        checkbox(c, !!config.complexities[c], (v) => { config.complexities[c] = v; changed(); })))),
    percentSlider("Chance of an aspect (when the spirit has allowed aspects)", "aspectChance"),
    percentSlider("Chance of Power Progression (base game spirits)", "progressionChance"),
    h("p", { class: "muted" },
      "Click the status button to cycle: Random → Always → Never. Click an aspect to allow or forbid it. ",
      "Items marked * are not on Handelabra's canonical identifier sheet yet; the game ignores unknown identifiers."),
    h("div", { class: "inline", style: "margin-bottom:8px" },
      h("button", { type: "button", onclick: () => { config.spiritStatus = {}; changed({ rerender: true }); } }, "Reset all to Random")),
    h("div", { class: "grid" }, owned.map((s) => {
      const status = config.spiritStatus[s.id] ?? "allow";
      const aspects = s.aspects.filter((a) => owns(a.exp));
      return h("div", { class: "spirit", "data-status": status },
        h("div", { class: "head" },
          h("div", {}, h("div", {}, s.name, CANONICAL_SHEET_IDS.has(s.id) ? "" : " *"),
            h("div", { class: "muted" }, `${s.complexity} · ${expName(s.exp)}`)),
          h("button", {
            type: "button", class: "status", "data-status": status,
            onclick: () => {
              const next = STATUS_CYCLE[status];
              if (next === "allow") delete config.spiritStatus[s.id];
              else config.spiritStatus[s.id] = next;
              changed({ rerender: true });
            },
          }, STATUS_LABEL[status])),
        aspects.length > 0 && h("div", { class: "chips" }, aspects.map((a) => {
          const key = `${s.id}/${a.id}`;
          const allowed = !config.aspectBanned[key];
          return h("button", {
            type: "button", class: "chip", "aria-pressed": String(allowed),
            title: allowed ? "Allowed" : "Forbidden",
            onclick: () => {
              if (allowed) config.aspectBanned[key] = true;
              else delete config.aspectBanned[key];
              changed({ rerender: true });
            },
          }, a.name, CANONICAL_SHEET_IDS.has(a.id) ? "" : " *");
        })));
    })));
}

function optionsSection() {
  const eventsPossible = config.owned.bc || config.owned.je;
  return section("options", "Game options",
    checkbox("Use Event cards", config.events, (v) => { config.events = v; changed(); },
      !eventsPossible && h("span", { class: "muted" }, "(needs Branch & Claw or Jagged Earth)")),
    h("div", { class: "field", style: "margin-top:12px" }, h("span", {}, "Practice modes"),
      h("div", { class: "grid" }, PRACTICE_MODES.map((p) =>
        checkbox(p.name, !!config.practiceModes[p.id], (v) => { config.practiceModes[p.id] = v; changed(); })))),
    h("button", {
      type: "button",
      onclick: () => {
        if (!confirm("Reset all settings to default?")) return;
        config = defaultConfig();
        changed({ rerender: true });
      },
    }, "Reset all settings"));
}

function renderSettings() {
  document.getElementById("settings").replaceChildren(
    expansionsSection(), difficultySection(), playersSection(), adversariesSection(), scenariosSection(),
    spiritsSection(), optionsSection(),
  );
}

document.getElementById("roll").addEventListener("click", doRoll);
renderSettings();
renderResult();
