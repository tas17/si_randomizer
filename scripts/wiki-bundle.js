(async () => {
  const S = {
    spirits: {
      RiverSurgesInSunlight: "River Surges in Sunlight", ShadowsFlickerLikeFlame: "Shadows Flicker Like Flame",
      LightningsSwiftStrike: "Lightning's Swift Strike", VitalStrengthOfTheEarth: "Vital Strength of the Earth",
      ASpreadOfRampantGreen: "A Spread of Rampant Green", Thunderspeaker: "Thunderspeaker",
      BringerOfDreamsAndNightmares: "Bringer of Dreams and Nightmares", OceansHungryGrasp: "Ocean's Hungry Grasp",
      SharpFangsBehindTheLeaves: "Sharp Fangs Behind the Leaves", KeeperOfTheForbiddenWilds: "Keeper of the Forbidden Wilds",
      HeartOfTheWildfire: "Heart of the Wildfire", SerpentSlumberingBeneathTheIsland: "Serpent Slumbering Beneath the Island",
      DownpourDrenchesTheWorld: "Downpour Drenches the World", FinderOfPathsUnseen: "Finder of Paths Unseen",
      LureOfTheDeepWilderness: "Lure of the Deep Wilderness", ManyMindsMoveAsOne: "Many Minds Move as One",
      ShiftingMemoryOfAges: "Shifting Memory of Ages", StonesUnyieldingDefiance: "Stone's Unyielding Defiance",
      VolcanoLoomingHigh: "Volcano Looming High", GrinningTricksterStirsUpTrouble: "Grinning Trickster Stirs Up Trouble",
      ShroudOfSilentMist: "Shroud of Silent Mist", VengeanceAsABurningPlague: "Vengeance as a Burning Plague",
      FracturedDaysSplitTheSky: "Fractured Days Split the Sky", StarlightSeeksItsForm: "Starlight Seeks Its Form",
      DevouringTeethLurkUnderfoot: "Devouring Teeth Lurk Underfoot", EyesWatchFromTheTrees: "Eyes Watch from the Trees",
      FathomlessMudOfTheSwamp: "Fathomless Mud of the Swamp", RisingHeatOfStoneAndSand: "Rising Heat of Stone and Sand",
      SunBrightWhirlwind: "Sun-Bright Whirlwind", EmberEyedBehemoth: "Ember-Eyed Behemoth", HearthVigil: "Hearth-Vigil",
      ToweringRootsOfTheJungle: "Towering Roots of the Jungle", BreathOfDarknessDownYourSpine: "Breath of Darkness Down Your Spine",
      RelentlessGazeOfTheSun: "Relentless Gaze of the Sun", WanderingVoiceKeensDelirium: "Wandering Voice Keens Delirium",
      WoundedWatersBleeding: "Wounded Waters Bleeding", DancesUpEarthquakes: "Dances Up Earthquakes",
    },
    adversaries: {
      TheKingdomOfBrandenburgPrussia: "Brand-Prussia Flag", TheKingdomOfEngland: "England Flag",
      TheKingdomOfSweden: "Sweden Flag", TheKingdomOfFrance: "France Flag", TheKingdomOfScotland: "Scotland WrinkledFlag",
      TheHabsburgMonarchy: "Habsburg Monarchy (Livestock Colony) WrinkledFlag", TheTsardomOfRussia: "Russia WrinkledFlag",
      HabsburgMiningExpedition: "Habsburg Mining Expedition Flag",
    },
    scenarios: {
      Blitz: "Blitz", GuardTheIslesHeart: "Guard the Isle's Heart", RitualsOfTerror: "Rituals of Terror",
      DahanInsurrection: "Dahan Insurrection", SecondWave: "Second Wave", PowersLongForgotten: "Powers Long Forgotten",
      WardTheShores: "Ward the Shores", RitualsOfTheDestroyingFlame: "Rituals of the Destroying Flame",
      ADiversityOfSpirits: "A Diversity of Spirits", VariedTerrains: "Varied Terrains", ElementalInvocation: "Elemental Invocation",
      DespicableTheft: "Despicable Theft", TheGreatRiver: "The Great River", DestinyUnfolds: "Destiny Unfolds",
      SurgesOfColonization: "Surges of Colonization",
    },
  };
  const items = Object.entries(S).flatMap(([kind, m]) => Object.entries(m).map(([id, t]) => ({ kind, id, file: `File:${t}.png` })));
  const info = {};
  for (let i = 0; i < items.length; i += 40) {
    const titles = encodeURIComponent(items.slice(i, i + 40).map((x) => x.file).join("|"));
    const j = await fetch(`/api.php?action=query&format=json&prop=imageinfo&iiprop=url&iiurlwidth=160&titles=${titles}`).then((r) => r.json());
    const norm = Object.fromEntries((j.query.normalized || []).map((r) => [r.to, r.from]));
    for (const p of Object.values(j.query.pages)) info[norm[p.title] ?? p.title] = p.imageinfo?.[0];
  }
  const out = {};
  const failed = [];
  for (const x of items) {
    const url = info[x.file]?.thumburl || info[x.file]?.url;
    try {
      const r = await fetch(url);
      const b = new Uint8Array(await r.arrayBuffer());
      if (!r.ok || b[0] !== 0x89 || b[1] !== 0x50) throw new Error(`${r.status} ${r.headers.get("content-type")}`);
      let s = "";
      for (let k = 0; k < b.length; k += 0x8000) s += String.fromCharCode(...b.subarray(k, k + 0x8000));
      out[`${x.kind}/${x.id}`] = btoa(s);
    } catch (e) {
      failed.push(`${x.kind}/${x.id}: ${e.message}`);
    }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: "application/json" }));
  a.download = "si-images.json";
  document.body.append(a);
  a.click();
  a.remove();
  console.log(`saved ${Object.keys(out).length}, failed ${failed.length}`, failed);
})();
