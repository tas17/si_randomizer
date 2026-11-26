export const SPIRIT_ICONS = {
  RiverSurgesInSunlight: { abbr: "RS", color: "#2b7bb9" },
  ShadowsFlickerLikeFlame: { abbr: "SF", color: "#4b3b6b" },
  LightningsSwiftStrike: { abbr: "LS", color: "#e0b400" },
  VitalStrengthOfTheEarth: { abbr: "VS", color: "#7a5a32" },
  ASpreadOfRampantGreen: { abbr: "Gr", color: "#3c8a3c" },
  Thunderspeaker: { abbr: "TS", color: "#c56a1e" },
  BringerOfDreamsAndNightmares: { abbr: "BD", color: "#6b4fa0" },
  OceansHungryGrasp: { abbr: "OG", color: "#1d4f7a" },
  SharpFangsBehindTheLeaves: { abbr: "Fa", color: "#b5651d" },
  KeeperOfTheForbiddenWilds: { abbr: "KW", color: "#2f6b3a" },
  HeartOfTheWildfire: { abbr: "HW", color: "#c0392b" },
  SerpentSlumberingBeneathTheIsland: { abbr: "Se", color: "#6b5b3a" },
  DownpourDrenchesTheWorld: { abbr: "DD", color: "#3a8fb7" },
  FinderOfPathsUnseen: { abbr: "FP", color: "#2f8a89" },
  LureOfTheDeepWilderness: { abbr: "LW", color: "#4f7d3a" },
  ManyMindsMoveAsOne: { abbr: "MM", color: "#a66a2c" },
  ShiftingMemoryOfAges: { abbr: "SM", color: "#8a6d4a" },
  StonesUnyieldingDefiance: { abbr: "SU", color: "#6e6a63" },
  VolcanoLoomingHigh: { abbr: "VL", color: "#a8321e" },
  GrinningTricksterStirsUpTrouble: { abbr: "GT", color: "#d07a1a" },
  ShroudOfSilentMist: { abbr: "Sh", color: "#7d8fa3" },
  VengeanceAsABurningPlague: { abbr: "VP", color: "#6a7a2a" },
  FracturedDaysSplitTheSky: { abbr: "FD", color: "#8a6fb5" },
  StarlightSeeksItsForm: { abbr: "St", color: "#3b4a8a" },
  DevouringTeethLurkUnderfoot: { abbr: "DT", color: "#9b4a2a" },
  EyesWatchFromTheTrees: { abbr: "EW", color: "#3f7d4f" },
  FathomlessMudOfTheSwamp: { abbr: "FM", color: "#6b5a3a" },
  RisingHeatOfStoneAndSand: { abbr: "RH", color: "#c9933a" },
  SunBrightWhirlwind: { abbr: "SW", color: "#4ba3d9" },
  EmberEyedBehemoth: { abbr: "EB", color: "#b8452a" },
  HearthVigil: { abbr: "HV", color: "#c77b3a" },
  ToweringRootsOfTheJungle: { abbr: "TR", color: "#2e6b36" },
  BreathOfDarknessDownYourSpine: { abbr: "BoD", color: "#3a2f4f" },
  RelentlessGazeOfTheSun: { abbr: "RG", color: "#d9a31a" },
  WanderingVoiceKeensDelirium: { abbr: "WV", color: "#7a6ab0" },
  WoundedWatersBleeding: { abbr: "WW", color: "#8a2f4a" },
  DancesUpEarthquakes: { abbr: "DE", color: "#8a5a2a" },
};

export const ADVERSARY_ICONS = {
  TheKingdomOfBrandenburgPrussia: { abbr: "BP", color: "#1f1f1f", trim: "#e8e8e8" },
  TheKingdomOfEngland: { abbr: "En", color: "#c8102e", trim: "#f4f4f4" },
  TheKingdomOfSweden: { abbr: "Sw", color: "#006aa7", trim: "#fecc00" },
  TheKingdomOfFrance: { abbr: "Fr", color: "#0055a4", trim: "#ef4135" },
  TheKingdomOfScotland: { abbr: "Sc", color: "#005eb8", trim: "#f4f4f4" },
  TheHabsburgMonarchy: { abbr: "HM", color: "#f2c200", trim: "#1a1a1a" },
  TheTsardomOfRussia: { abbr: "Ru", color: "#0039a6", trim: "#d52b1e" },
  HabsburgMiningExpedition: { abbr: "HX", color: "#5a5a5a", trim: "#f2c200" },
};

export const SCENARIO_ICONS = {
  Blitz: "Bz",
  GuardTheIslesHeart: "GH",
  RitualsOfTerror: "RT",
  DahanInsurrection: "DI",
  SecondWave: "2W",
  PowersLongForgotten: "PL",
  WardTheShores: "WS",
  RitualsOfTheDestroyingFlame: "RF",
  ADiversityOfSpirits: "DS",
  VariedTerrains: "VT",
  ElementalInvocation: "EI",
  DespicableTheft: "DT",
  TheGreatRiver: "GR",
  DestinyUnfolds: "DU",
  SurgesOfColonization: "SC",
};

const DIFFICULTY_COLORS = ["#3c8a3c", "#3c8a3c", "#8aa63a", "#d9a31a", "#d0702a", "#b8352a"];

export function scenarioColor(difficulty) {
  return DIFFICULTY_COLORS[Math.max(0, Math.min(DIFFICULTY_COLORS.length - 1, difficulty + 1))];
}

export function textColorOn(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#1a1a1a" : "#ffffff";
}

const escapeXml = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function label(abbr, fill, y = 16) {
  const size = abbr.length > 2 ? 10 : 12.5;
  return `<text x="16" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-weight="700" font-size="${size}" fill="${textColorOn(fill)}">${escapeXml(abbr)}</text>`;
}

function svg(name, body, height = 32) {
  return `<svg class="icon" viewBox="0 0 32 ${height}" width="32" height="${height}" role="img" aria-label="${escapeXml(name)}"><title>${escapeXml(name)}</title>${body}</svg>`;
}

export function spiritIcon(spirit) {
  const icon = SPIRIT_ICONS[spirit.id] ?? { abbr: spirit.name.slice(0, 2), color: "#5d6b63" };
  return svg(spirit.name,
    `<circle cx="16" cy="16" r="15" fill="${icon.color}"/><circle cx="16" cy="16" r="12.5" fill="none" stroke="#ffffff" stroke-opacity="0.35" stroke-width="1.2"/>${label(icon.abbr, icon.color)}`);
}

export function adversaryIcon(adversary) {
  const icon = ADVERSARY_ICONS[adversary.id] ?? { abbr: adversary.name.slice(0, 2), color: "#5d6b63", trim: "#e8e8e8" };
  const shield = "M16 1.5 L29.5 5.5 V16 C29.5 25 23 30.5 16 34 C9 30.5 2.5 25 2.5 16 V5.5 Z";
  return svg(adversary.name,
    `<path d="${shield}" fill="${icon.color}" stroke="${icon.trim}" stroke-width="2.5" stroke-linejoin="round"/>${label(icon.abbr, icon.color, 16.5)}`, 36);
}

export function scenarioIcon(scenario) {
  const abbr = SCENARIO_ICONS[scenario.id] ?? scenario.name.slice(0, 2);
  const fill = scenarioColor(scenario.difficulty);
  return svg(scenario.name,
    `<rect x="5.5" y="5.5" width="21" height="21" rx="3" transform="rotate(45 16 16)" fill="${fill}"/>${label(abbr, fill)}`);
}
