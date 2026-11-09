# Het Vierde Spoor

A browser app with no build step that generates Dutch deduction puzzles and verifies them
on the spot — scope and non-goals in `docs/PRODUCT.md`. Read `STATUS.md` first.

## Commands
- Install: `npm install`
- Run / stop: `npm start` / Ctrl-C — serves on http://localhost:4173
- Test (all): `npm run check:all` — the keuring, 7 checks, 4–5 minutes
- Test (one file): `npm run check:kamers` (also `check:regels`, `check:iconen`,
  `check:catalog`, `check:weggevers`, `check:ai`, `check`)
- Test (fast): `npm run check:snel` — the 3 checks that build no puzzles, ~1 second
- Typecheck: none (plain ES modules, no TypeScript)
- Lint / format: none configured
- Build: none — `main` is deployed to GitHub Pages as-is
- Where it runs: https://keebl.github.io/het-vierde-spoor/
- One puzzle as text: `node tools/show.mjs dader grid landhuis 3 demo-7`

## Gotchas
- **Read the verdict from the `volledige keuring exit=` line and the goed/FOUT table above
  it**, not from your shell's exit code. `npm run` can report green while a check was red.
- **The keuring takes 4–5 minutes.** Start it in the background and keep working. If you
  change the engine while it runs, the verdict is worthless — kill it and restart.
- **Pushing is deploying.** `main` → GitHub Pages, no build step. Say explicitly when
  something is *not* live yet.
- **A reload that is not a reload.** Navigating to a URL the tab is already on only changes
  the hash. Use `location.reload()` before drawing conclusions. (GitHub Pages also sends
  `cache-control: max-age=600`, but that is usually not the cause.)
- **A duplicate key in an object literal is swallowed silently by JavaScript.** There is a
  keuring rule for this, but only for the tables in `kamersoorten.js`.
- **Everything follows from the seed.** Adding a draw mid-sequence shifts every puzzle
  after it. Give anything new its own rng: `makeRng(\`${seed}:zaak\`)`.
- **A new world is ~37 new words, and every word needs an icon.** Budget for it.
- **The API key is never read, echoed or committed.** `.env` is git-ignored; the owner
  types the key himself.

## Project conventions (only what differs from the global rules)
- **The code is Dutch**: identifiers, comments, commit messages, UI text. Documentation
  (this file, `docs/`, `STATUS.md`, ADRs) is English per the global rule. See
  `docs/decisions/0004-dutch-is-the-language-of-the-code.md`.
- **Comments explain *why*, usually naming the bug that caused the rule.** Match that
  density and tone; do not strip them.
- **Judge on the visible end result.** "The keuring is green" is not proof that a board
  looks right — look at it, with a screenshot, before calling anything done.
- **Fix the class, not the instance.** A reported oddity about one room is a symptom; find
  the cause, fix the category, and lock it in with a keuring rule.
- **Hide, do not delete.** When something has to come off the site, take it out of sight,
  not out of the code.
- **If a drawing lies, draw it.** A world layer can rename a piece, never re-draw it;
  reusing a drawing whose shape says something else is the bug this project keeps making.

## Where to look
- `STATUS.md` — current state and next steps
- `docs/PRODUCT.md` — scope, users, non-goals
- `docs/ARCHITECTURE.md` and `docs/decisions/` — why things are the way they are
- `specs/` — feature specs (written by `/new-feature`)
- `README.md` — the long-form tour of the game, the engine and the drawings (Dutch)
