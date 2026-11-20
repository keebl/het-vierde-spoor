# Reconstructie (was: Het Vierde Spoor)

A browser app with no build step that generates Dutch deduction puzzles and verifies them
on the spot — scope and non-goals in `docs/PRODUCT.md`. Read `STATUS.md` first.

## Commands
- Install: `npm install`
- Run / stop: `npm start` / Ctrl-C — serves on http://localhost:4173; this is the variant
  Claude runs, without secrets (the site works without the AI key)
- Run with secrets (AI texts on; Guus's own Terminal only, Claude never runs it):
  `~/.claude/bin/secrets-run -- npm start` — values come from Bitwarden via the `bws:`
  references in `.env.example`
- Test (all): `npm run check:all` — the keuring, 15 checks. The motor and the sweep judge
  the level 5–6 room boards from `pool/` (`--voorraad`, about three and four minutes);
  `npm run check` and `npm run check:regels` without the flag build every board (about 13
  and 29 minutes) and run nightly in `.github/workflows/nachtrun.yml`. CI on a pull
  request adds `--kort` (`node tools/keuring.mjs --kort`): the spread, the reasoning and the
  store check take a smaller level 5–6 sample; `check:all` and the nightly run stay full
- Test (one file): `npm run check:kamers` (also `check:regels`, `check:iconen`,
  `check:catalog`, `check:aanwijzingen`, `check:spreiding`, `check:afstanden`, `check:ritme`, `check:weggevers`,
  `check:ai`, `check:redeneer`, `check:sync`, `check:daglimiet`, `check`). `check:ritme` opens the four screens of `tests/ui/ui-check.json`
  in a headless Chromium at 390, 800 and 1300 px and fails when blocks that look the same sit
  unequally apart or off the scale (`tools/ritme-meting.js`), about three minutes; it needs a
  browser, so not in the sandbox (paste `tools/ritme-meting.js` into the browser pane and call
  `meetRitme()` there). `check:afstanden` refuses a
  typed gap or margin in `styles/app.css` (`specs/spacing-rhythm.md`), well under a second. `check:daglimiet` checks the
  daily cap on paid AI calls (`AI_DAILY_CALL_LIMIT`, `server/daglimiet.mjs`), well under a second. `check:sync` checks the optional
  account sync (`specs/accounts-and-sync.md`) with a fake database, no network, ~0.1 s. `check:spreiding` checks the room-board clue rules of
  `specs/harder-clues.md` (no row/column clues, caps per name and per kind, no
  2-cell clue from level 3) over the library and a seed sample, about a minute. `check:redeneer` runs the human
  solver (`src/engine/redeneer.js`) over the same sample: no wrong strike, every full
  solve proven unique by `telPlaatsingen`, and board fingerprints equal to
  `tools/vingerafdruk-kamers.txt` (rewrite with `--schrijf` only when boards shift on
  purpose), about a minute and a half
- Test (fast): `npm run check:snel` — the 6 checks that build no puzzles, ~1 second
- Typecheck: none (plain ES modules, no TypeScript)
- Lint / format: none configured
- Static check in place of typecheck/lint: `npm run check:snel` — the content lint
  (icons, room kinds, AI guard), ~1 second; read the `volledige keuring exit=` line
- Build: none — `main` is deployed to GitHub Pages as-is
- Where it runs: https://reconstructie.app/ (GitHub Pages; DNS at Cloudflare, set with
  `node tools/cloudflare-dns.mjs status|github-pages`, token in `.env`)
- One puzzle as text: `node tools/show.mjs dader grid landhuis 3 demo-7`
- Print proof as PDF (server must run): `node tools/printproef.mjs /tmp/proef "http://localhost:4173/#/puzzel/<id>"`
  — not inside the session sandbox; there, `tools/printweergave.js` in the browser pane

## Tools
<!-- One line per service: job: service — how Claude reaches it — the name here. Services and access paths: `_workbench/standard/toolbox.json`. No keys, tokens or e-mail addresses. -->
- Code, pull requests and hosting: GitHub (incl. GitHub Pages) — `gh` CLI — repository
  `keebl/het-vierde-spoor`, Pages from `main` `/`, custom domain `reconstructie.app`
- DNS and registrar: Cloudflare — `node tools/cloudflare-dns.mjs` (token in `.env`), else
  plugin `cloudflare` (waits for a sign-in via /mcp) or dash.cloudflare.com — zone
  `reconstructie.app`
- AI layer worker (not deployed, see STATUS.md): Cloudflare Workers — plugin `cloudflare`
  (not signed in on 2026-11-14), `npx wrangler` (not on the PATH) — worker `vierdespoor-ai`
  per `worker/wrangler.toml`; the account listed no workers on 2026-11-14
- Static analysis: SonarCloud — browser, sonarcloud.io (sign in: the project is not
  visible anonymously) — project `keebl_het-vierde-spoor` in organisation `keebl`, config
  in `.sonarcloud.properties`; results arrive as a check and a comment on each pull request

## Gotchas
- **Read the verdict from the `volledige keuring exit=` line and the goed/FOUT table above
  it**, not from your shell's exit code. `npm run` can report green while a check was red.
- **The keuring takes about twelve minutes, more on a busy machine.** Start it in the background and keep
  working. If you change the engine while it runs, the verdict is worthless — kill it and
  restart.
- **Pushing is deploying.** `main` → GitHub Pages, no build step. Say explicitly when
  something is *not* live yet.
- **A reload that is not a reload.** Navigating to a URL the tab is already on only changes
  the hash. Use `location.reload()` before drawing conclusions. (GitHub Pages also sends
  `cache-control: max-age=600`, but that is usually not the cause.)
- **A duplicate key in an object literal is swallowed silently by JavaScript.** There is a
  keuring rule for this, but only for the tables in `kamersoorten.js`.
- **Everything follows from the seed, including where we stop.** Adding a draw
  mid-sequence shifts every puzzle after it. Give anything new its own rng:
  `makeRng(\`${seed}:zaak\`)`. And never bound work by a clock: `naSnoei` counts solver
  steps, because a 900 ms wall clock made the same link depend on how busy the machine was.
- **A new world is ~37 new words, and every word needs an icon.** Budget for it. A world
  set in the present goes in `MODERNE_WERELDEN`, and the keuring then refuses every
  `OUDERWETS` drawing in it, including through the fallback to a related kind.
- **Two furniture names in one kind must not end in the same word** (`-bank`, `-tafel`,
  `-kast`), counting the kind's fallback. A two-word name ("de rij stoeltjes") does not
  count. This is most of the work when naming a new world.
- **A board frame draws anything you must be able to read inside `b.rechtop(x, y)`**, or
  it comes out rotated on three of the four sides.
- **Check printing with a PDF, not by reasoning about `@media print`.** Headless
  `--print-to-pdf` hangs on this site (the scene never stops animating, so virtual time
  never runs out) and macOS has no `timeout`; use `tools/printproef.mjs`, which drives
  Brave over DevTools. A closed `<details>` prints only its summary. **Brave cannot start
  inside a session's Bash sandbox**; there, paste `tools/printweergave.js` into the
  browser pane (it shows the `@media print` rules on screen, not the page breaks) and
  leave the PDF to the owner's terminal.
- **`git switch -c` half-fails inside the session sandbox** (`could not lock config file
  .git/config`), so the shell stays on the branch it was on. Chained with `&&`, the
  commands after it stop; run one at a time and the next merge lands on `main`. To try a
  merge locally, check `git branch --show-current` first, or merge in a scratch clone.
- **A push piped into `| tail -1` can fail silently.** A new worktree branch has no
  upstream, so a bare `git push` errors, and the tail swallows the message (PR #16
  reported a push that never happened). Push with `git push -u origin HEAD` and confirm
  with `git ls-remote origin <branch>`.
- **Spacing has three layouts on the puzzle page** (phone, one column up to 1099 px, two
  columns). Check all three, not just phone and desktop: the one-column width is where a 64 px
  gap hid on 2026-11-19. `check:ritme` measures all three.
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
- **Looks change, places do not.** When an item only changes its appearance and not its
  place (a rug's pattern, an icon), rename or redraw it after generation, in the content
  layer; never re-generate the puzzle, so boards, solutions and `pool/` stay the same
  (Guus, 2026-11-19).

## Where to look
- `STATUS.md` — current state and next steps
- `docs/PRODUCT.md` — scope, users, non-goals
- `docs/ARCHITECTURE.md` and `docs/decisions/` — why things are the way they are
- `specs/` — feature specs (written by `/new-feature`)
- `README.md` — the long-form tour of the game, the engine and the drawings (Dutch)
