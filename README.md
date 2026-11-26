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

## Files

- `src/data.js` – spirits, aspects, adversaries (difficulty per level), scenarios, boards, layouts.
- `src/engine.js` – the randomizer (pure, the random source is injectable).
- `src/launchUrl.js` – builds the launch URLs and the board layout side pairs.
- `src/app.js` – the user interface. Settings are kept in `localStorage`.

## Data sources

- Identifiers: Handelabra's canonical identifier sheet (spirits, aspects, boards, expansions, practice modes).
- Adversary and scenario identifiers, and adversary difficulties: the board game reference values, cross-checked
  with the open-source randomizers `SteveBallantine/spirit-island-randomiser` and `mccrispy/spirit-island-randomizer`.
- Spirits and aspects marked `*` in the page are not on the canonical sheet. The game ignores unknown identifiers.
