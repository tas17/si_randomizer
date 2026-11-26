# Spirit Island Randomizer

A static web page that rolls a Spirit Island setup and gives launch links for
Spirit Island Digital (web link, `spiritisland://` app link, Steam link).

Launch URL format: <https://www.handelabra.com/spirit-island-launch-url-specification>

## Run

Start the small Node server (no dependencies). It serves the page and saves preferences:

```bash
npm run serve
```

Then open <http://localhost:8000>.

Preferences are saved in `data/preferences.json` (not in git), so every browser on this computer shares them.
Without this server (for example on GitHub Pages), the page saves preferences in the browser only.
Use `PORT=9000 npm run serve` for another port.

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
- `server.mjs` – serves the page and the `/api/preferences` file storage.
- `src/preferences.js` – named preferences (saved settings) and the default preference.
- `src/preferenceStore.js` – uses the server when it runs, else browser storage.
- `src/icons.js` – drawn fallback icons for spirits, adversaries and scenarios.
- `src/app.js` – the user interface. The current settings are kept in `localStorage`.

## Data sources

- Identifiers: Handelabra's canonical identifier sheet (spirits, aspects, boards, expansions, practice modes).
- Adversary and scenario identifiers, and adversary difficulties: the board game reference values, cross-checked
  with the open-source randomizers `SteveBallantine/spirit-island-randomiser` and `mccrispy/spirit-island-randomizer`.
- Spirits and aspects marked `*` in the page are not on the canonical sheet. The game ignores unknown identifiers.
