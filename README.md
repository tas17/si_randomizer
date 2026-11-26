# Spirit Island Randomizer

A static web page that rolls a Spirit Island setup and gives launch links for
Spirit Island Digital (web link, `spiritisland://` app link, Steam link).

Launch URL format: <https://www.handelabra.com/spirit-island-launch-url-specification>

## Run

The page uses ES modules, so serve it over HTTP (opening `index.html` as a file does not work):

```bash
npm run serve
```

Then open <http://localhost:8000>.

## Test

```bash
npm test
```

## Images (optional, not in git)

The result shows real Spirit Island art when `images/<spirits|adversaries|scenarios>/<id>.png` exists,
and a drawn icon when it does not. The art is © Greater Than Games, so `images/` is in `.gitignore`.

The images come from the Spirit Island Wiki, which blocks scripts (Cloudflare). To get them:

1. Open <https://spiritislandwiki.com> in your browser and wait until a wiki page loads.
2. Open the browser console on that page, paste the content of `scripts/wiki-bundle.js` and press Enter.
   It saves `si-images.json` (about 3 MB) to your Downloads folder.
3. Unpack it:

   ```bash
   node scripts/import-images.mjs ~/Downloads/si-images.json
   ```

## Files

- `src/data.js` – spirits, aspects, adversaries (difficulty per level), scenarios, boards, layouts.
- `src/engine.js` – the randomizer (pure, the random source is injectable).
- `src/launchUrl.js` – builds the launch URLs and the board layout side pairs.
- `src/preferences.js` – named preferences (saved settings) and the default preference.
- `src/icons.js` – drawn fallback icons for spirits, adversaries and scenarios.
- `src/app.js` – the user interface. Settings and preferences are kept in `localStorage`, so they stay in one browser.

## Data sources

- Identifiers: Handelabra's canonical identifier sheet (spirits, aspects, boards, expansions, practice modes).
- Adversary and scenario identifiers, and adversary difficulties: the board game reference values, cross-checked
  with the open-source randomizers `SteveBallantine/spirit-island-randomiser` and `mccrispy/spirit-island-randomizer`.
- Spirits and aspects marked `*` in the page are not on the canonical sheet. The game ignores unknown identifiers.
