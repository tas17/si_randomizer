export const EXPANSIONS = [
  { id: "base", name: "Base Game", urlId: null },
  { id: "bc", name: "Branch & Claw", urlId: "BranchAndClaw" },
  { id: "pp1", name: "Promo Pack 1", urlId: null },
  { id: "pp2", name: "Promo Pack 2", urlId: null },
  { id: "je", name: "Jagged Earth", urlId: "JaggedEarth" },
  { id: "horizons", name: "Horizons of Spirit Island", urlId: null },
  { id: "ni", name: "Nature Incarnate", urlId: "NatureIncarnate" },
];

export const COMPLEXITIES = ["Low", "Moderate", "High", "Very High"];

const aspect = (id, name, exp) => ({ id, name: name ?? id, exp });

export const SPIRITS = [
  { id: "RiverSurgesInSunlight", name: "River Surges in Sunlight", exp: "base", complexity: "Low", progression: true,
    aspects: [aspect("Sunshine", null, "je"), aspect("Travel", null, "pp2"), aspect("Haven", null, "ni")] },
  { id: "ShadowsFlickerLikeFlame", name: "Shadows Flicker Like Flame", exp: "base", complexity: "Low", progression: true,
    aspects: [aspect("Madness", null, "je"), aspect("Reach", null, "je"), aspect("Amorphous", null, "pp2"), aspect("Foreboding", null, "pp2"), aspect("DarkFire", "Dark Fire", "ni")] },
  { id: "LightningsSwiftStrike", name: "Lightning's Swift Strike", exp: "base", complexity: "Low", progression: true,
    aspects: [aspect("Pandemonium", null, "je"), aspect("Wind", null, "je"), aspect("Immense", null, "pp2"), aspect("Sparking", null, "ni")] },
  { id: "VitalStrengthOfTheEarth", name: "Vital Strength of the Earth", exp: "base", complexity: "Low", progression: true,
    aspects: [aspect("Resilience", null, "je"), aspect("Might", null, "pp2"), aspect("Nourishing", null, "ni")] },
  { id: "ASpreadOfRampantGreen", name: "A Spread of Rampant Green", exp: "base", complexity: "Moderate", progression: true,
    aspects: [aspect("Regrowth", null, "ni"), aspect("Tangles", null, "ni")] },
  { id: "Thunderspeaker", name: "Thunderspeaker", exp: "base", complexity: "Moderate", progression: true,
    aspects: [aspect("Tactician", null, "ni"), aspect("Warrior", null, "ni")] },
  { id: "BringerOfDreamsAndNightmares", name: "Bringer of Dreams and Nightmares", exp: "base", complexity: "High", progression: true,
    aspects: [aspect("Enticing", null, "ni"), aspect("Violence", null, "ni")] },
  { id: "OceansHungryGrasp", name: "Ocean's Hungry Grasp", exp: "base", complexity: "High", progression: true,
    aspects: [aspect("Deeps", null, "ni")] },
  { id: "SharpFangsBehindTheLeaves", name: "Sharp Fangs Behind the Leaves", exp: "bc", complexity: "Moderate",
    aspects: [aspect("Encircle", null, "ni"), aspect("Unconstrained", null, "ni")] },
  { id: "KeeperOfTheForbiddenWilds", name: "Keeper of the Forbidden Wilds", exp: "bc", complexity: "Moderate",
    aspects: [aspect("SpreadingHostility", "Spreading Hostility", "ni")] },
  { id: "HeartOfTheWildfire", name: "Heart of the Wildfire", exp: "pp1", complexity: "High",
    aspects: [aspect("Transforming", null, "ni")] },
  { id: "SerpentSlumberingBeneathTheIsland", name: "Serpent Slumbering Beneath the Island", exp: "pp1", complexity: "High",
    aspects: [aspect("Locus", null, "ni")] },
  { id: "DownpourDrenchesTheWorld", name: "Downpour Drenches the World", exp: "pp2", complexity: "High", aspects: [] },
  { id: "FinderOfPathsUnseen", name: "Finder of Paths Unseen", exp: "pp2", complexity: "Very High", aspects: [] },
  { id: "LureOfTheDeepWilderness", name: "Lure of the Deep Wilderness", exp: "je", complexity: "Moderate",
    aspects: [aspect("Lair", null, "ni")] },
  { id: "ManyMindsMoveAsOne", name: "Many Minds Move as One", exp: "je", complexity: "Moderate", aspects: [] },
  { id: "ShiftingMemoryOfAges", name: "Shifting Memory of Ages", exp: "je", complexity: "Moderate",
    aspects: [aspect("Intensify", null, "ni"), aspect("Mentor", null, "ni")] },
  { id: "StonesUnyieldingDefiance", name: "Stone's Unyielding Defiance", exp: "je", complexity: "Moderate", aspects: [] },
  { id: "VolcanoLoomingHigh", name: "Volcano Looming High", exp: "je", complexity: "Moderate", aspects: [] },
  { id: "GrinningTricksterStirsUpTrouble", name: "Grinning Trickster Stirs Up Trouble", exp: "je", complexity: "Moderate", aspects: [] },
  { id: "ShroudOfSilentMist", name: "Shroud of Silent Mist", exp: "je", complexity: "High",
    aspects: [aspect("Stranded", null, "ni")] },
  { id: "VengeanceAsABurningPlague", name: "Vengeance as a Burning Plague", exp: "je", complexity: "High", aspects: [] },
  { id: "FracturedDaysSplitTheSky", name: "Fractured Days Split the Sky", exp: "je", complexity: "Very High", aspects: [] },
  { id: "StarlightSeeksItsForm", name: "Starlight Seeks Its Form", exp: "je", complexity: "Very High", aspects: [] },
  { id: "DevouringTeethLurkUnderfoot", name: "Devouring Teeth Lurk Underfoot", exp: "horizons", complexity: "Low", aspects: [] },
  { id: "EyesWatchFromTheTrees", name: "Eyes Watch from the Trees", exp: "horizons", complexity: "Low", aspects: [] },
  { id: "FathomlessMudOfTheSwamp", name: "Fathomless Mud of the Swamp", exp: "horizons", complexity: "Low", aspects: [] },
  { id: "RisingHeatOfStoneAndSand", name: "Rising Heat of Stone and Sand", exp: "horizons", complexity: "Low", aspects: [] },
  { id: "SunBrightWhirlwind", name: "Sun-Bright Whirlwind", exp: "horizons", complexity: "Low", aspects: [] },
  { id: "EmberEyedBehemoth", name: "Ember-Eyed Behemoth", exp: "ni", complexity: "Moderate", aspects: [] },
  { id: "HearthVigil", name: "Hearth-Vigil", exp: "ni", complexity: "Moderate", aspects: [] },
  { id: "ToweringRootsOfTheJungle", name: "Towering Roots of the Jungle", exp: "ni", complexity: "Moderate", aspects: [] },
  { id: "BreathOfDarknessDownYourSpine", name: "Breath of Darkness Down Your Spine", exp: "ni", complexity: "High", aspects: [] },
  { id: "RelentlessGazeOfTheSun", name: "Relentless Gaze of the Sun", exp: "ni", complexity: "High", aspects: [] },
  { id: "WanderingVoiceKeensDelirium", name: "Wandering Voice Keens Delirium", exp: "ni", complexity: "High", aspects: [] },
  { id: "WoundedWatersBleeding", name: "Wounded Waters Bleeding", exp: "ni", complexity: "High", aspects: [] },
  { id: "DancesUpEarthquakes", name: "Dances Up Earthquakes", exp: "ni", complexity: "Very High", aspects: [] },
];

export const ADVERSARIES = [
  { id: "TheKingdomOfBrandenburgPrussia", name: "Brandenburg-Prussia", exp: "base", difficulty: [1, 2, 4, 6, 7, 9, 10] },
  { id: "TheKingdomOfEngland", name: "England", exp: "base", difficulty: [1, 3, 4, 6, 7, 9, 11] },
  { id: "TheKingdomOfSweden", name: "Sweden", exp: "base", difficulty: [1, 2, 3, 5, 6, 7, 8] },
  { id: "TheKingdomOfFrance", name: "France (Plantation Colony)", exp: "bc", difficulty: [2, 3, 5, 7, 8, 9, 10] },
  { id: "TheKingdomOfScotland", name: "Scotland", exp: "pp2", difficulty: [1, 3, 4, 6, 7, 8, 10] },
  { id: "TheHabsburgMonarchy", name: "Habsburg Monarchy (Livestock Colony)", exp: "je", difficulty: [2, 3, 5, 6, 8, 9, 10] },
  { id: "TheTsardomOfRussia", name: "Russia", exp: "je", difficulty: [1, 3, 4, 6, 7, 9, 11] },
  { id: "HabsburgMiningExpedition", name: "Habsburg Mining Expedition", exp: "ni", difficulty: [1, 3, 4, 5, 7, 9, 10] },
];

export const SCENARIOS = [
  { id: "Blitz", name: "Blitz", exp: "base", difficulty: 0 },
  { id: "GuardTheIslesHeart", name: "Guard the Isle's Heart", exp: "base", difficulty: 0 },
  { id: "RitualsOfTerror", name: "Rituals of Terror", exp: "base", difficulty: 3 },
  { id: "DahanInsurrection", name: "Dahan Insurrection", exp: "base", difficulty: 4 },
  { id: "SecondWave", name: "Second Wave", exp: "bc", difficulty: 1 },
  { id: "PowersLongForgotten", name: "Powers Long Forgotten", exp: "bc", difficulty: 1 },
  { id: "WardTheShores", name: "Ward the Shores", exp: "bc", difficulty: 2 },
  { id: "RitualsOfTheDestroyingFlame", name: "Rituals of the Destroying Flame", exp: "bc", difficulty: 3 },
  { id: "ADiversityOfSpirits", name: "A Diversity of Spirits", exp: "pp2", difficulty: 0 },
  { id: "VariedTerrains", name: "Varied Terrains", exp: "pp2", difficulty: 2 },
  { id: "ElementalInvocation", name: "Elemental Invocation", exp: "je", difficulty: 1 },
  { id: "DespicableTheft", name: "Despicable Theft", exp: "je", difficulty: 2 },
  { id: "TheGreatRiver", name: "The Great River", exp: "je", difficulty: 3 },
  { id: "DestinyUnfolds", name: "Destiny Unfolds", exp: "ni", difficulty: -1 },
  { id: "SurgesOfColonization", name: "Surges of Colonization", exp: "ni", difficulty: 2 },
];

export const BOARDS = [
  { id: "A", exp: ["base"] },
  { id: "B", exp: ["base"] },
  { id: "C", exp: ["base"] },
  { id: "D", exp: ["base"] },
  { id: "E", exp: ["je"] },
  { id: "F", exp: ["je", "horizons"] },
  { id: "G", exp: ["horizons"] },
  { id: "H", exp: ["horizons"] },
];

export const THEMATIC_BOARDS = [
  { id: "NorthEast", name: "North-East", exp: ["base"] },
  { id: "East", name: "East", exp: ["base"] },
  { id: "NorthWest", name: "North-West", exp: ["base"] },
  { id: "West", name: "West", exp: ["base"] },
  { id: "SouthEast", name: "South-East", exp: ["je"] },
  { id: "SouthWest", name: "South-West", exp: ["je", "horizons"] },
];

export const LAYOUTS = [
  { id: "Standard", name: "Standard (game default)", sizes: [1, 2, 3, 4] },
  { id: "Coastline", name: "Coastline", sizes: [2, 3, 4] },
  { id: "Archipelago", name: "Archipelago", sizes: [2, 3, 4] },
  { id: "Fragment", name: "Fragment", sizes: [2] },
  { id: "OppositeShores", name: "Opposite Shores", sizes: [2] },
  { id: "Sunrise", name: "Sunrise", sizes: [3] },
  { id: "Snake", name: "Snake", sizes: [3, 4] },
  { id: "Leaf", name: "Leaf", sizes: [4] },
];

export const PRACTICE_MODES = [
  { id: "StartOfGameGrowth", name: "Start-of-game Growth" },
  { id: "SkipInitialInvaderActions", name: "Skip initial Invader actions" },
  { id: "UnlimitedUndo", name: "Unlimited Undo" },
  { id: "NoBlightCard", name: "No Blight card" },
];

export const CANONICAL_SHEET_IDS = new Set([
  "BreathOfDarknessDownYourSpine", "BringerOfDreamsAndNightmares", "DancesUpEarthquakes", "DevouringTeethLurkUnderfoot",
  "DownpourDrenchesTheWorld", "EmberEyedBehemoth", "EyesWatchFromTheTrees", "FathomlessMudOfTheSwamp", "FinderOfPathsUnseen",
  "FracturedDaysSplitTheSky", "GrinningTricksterStirsUpTrouble", "HeartOfTheWildfire", "KeeperOfTheForbiddenWilds",
  "LightningsSwiftStrike", "LureOfTheDeepWilderness", "ManyMindsMoveAsOne", "OceansHungryGrasp", "RisingHeatOfStoneAndSand",
  "RiverSurgesInSunlight", "SerpentSlumberingBeneathTheIsland", "ShadowsFlickerLikeFlame", "SharpFangsBehindTheLeaves",
  "ShiftingMemoryOfAges", "ShroudOfSilentMist", "ASpreadOfRampantGreen", "StarlightSeeksItsForm", "StonesUnyieldingDefiance",
  "SunBrightWhirlwind", "Thunderspeaker", "ToweringRootsOfTheJungle", "VengeanceAsABurningPlague", "VitalStrengthOfTheEarth",
  "VolcanoLoomingHigh", "WanderingVoiceKeensDelirium",
  "Violence", "SpreadingHostility", "Pandemonium", "Wind", "Immense", "Deeps", "Sunshine", "Travel", "Haven", "Locus",
  "Madness", "Reach", "Amorphous", "Foreboding", "DarkFire", "Unconstrained", "Encircle", "Mentor", "Stranded",
  "Regrowth", "Tangles", "Tactician", "Resilience", "Might",
]);
