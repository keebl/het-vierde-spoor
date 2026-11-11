# Status — Het Vierde Spoor

Last updated: 2026-11-11

Translated and restructured from `HANDOFF.md`, which lived at the repository root until the
project standard was adopted; the original is in git history. The parts of it that are
standing guidance rather than state moved to `CLAUDE.md`.

## Now
- Nothing in progress. Working tree clean on `main` at `c7136a5`; everything is live on
  https://keebl.github.io/het-vierde-spoor/.
- The project standard was merged on 2026-11-11 (pull request #1, merge commit `e58ee1d`):
  documentation only, no application code, dependencies or CI. `HANDOFF.md` and
  `ARCHITECTUUR.md` are gone from the root; this file and `docs/ARCHITECTURE.md` replace
  them, and standing guidance lives in `CLAUDE.md`.
- The keuring ran in full on `c7136a5` (2026-11-11) and is green on all seven checks,
  `volledige keuring exit=0`. That covers the four engine and server commits after
  `dc6ab54` — the step-bounded `naSnoei`, a `.env` parser without a backtracking regex, a
  logged dress-up failure. Twelve minutes on an idle laptop: engine 249s, sweep 370s,
  giveaways 71s, library 33s, the other three a tenth of a second each.

## Next
1. **Show her the cheerful restyle and write down what she says.** The daughter's verdict
   was: dull colours, dull drawings, no artistic life. The owner answered the opening
   question of `specs/visual-liveliness.md` with "both", and directions 1 and 5 of that
   brief were built on 2026-11-10: the single gold accent gave way to a bright set
   (`--pop-1` … `--pop-6`, pink as the click colour), colour blobs in the background, a
   rainbow stripe under the header, a colour per difficulty level, a purple dark mode, and
   brighter floors and tokens on the board. A second round the same day took on the board
   itself: lighter layers (it was sepia under four brown overlays), a colour per room
   (`KAMERTINT` in `board-rooms.js`), walls in the world's colour, brighter materials in
   `STOFFEN` — and the name bar no longer sticks, because it lay over the board while you
   scrolled. Furniture, portraits and board frames were not touched — **directions 2, 3
   and 4 of the brief are still open**. Nothing is proven until she has seen it; that is
   the next step, and it is a measurement, not a formality. The same goes for the four
   present-day worlds of 2026-11-10: write down which one she likes best, and why.
2. **An ending when you solve it.** Today the screen only says "Opgelost". The culprit
   should appear, with a closing line and a button to the next case. Biggest gap for the
   intended player.
3. **Rename the site.** "Het Vierde Spoor" is to change; the new name has not been chosen.
   The game type was renamed to **Reconstructie** (was "Speurdoku", too close to Murdoku).
4. **Keyboard and screen reader.** Board cells are `rect` elements without focus, so the
   game cannot be played without a mouse.
5. **Modernise the base furniture set.** Done for the present-day worlds (see Recent
   decisions, 2026-11-10). The base set itself is still a 1930s manor (hearth, grand piano,
   steamer trunk, coal bunker), which is right for the manor, Christmas, Halloween, the
   academy and Regenstad. Redrawing it is direction 2 of `specs/visual-liveliness.md` and a
   decision of its own, because it touches every world. The lesson stands either way: if a
   drawing lies, draw it. A world layer can rename things, not redraw them.

## Blocked / open questions
- **TODO(guus): the new site name.** Everything else about the rename is ready.
- **Cloudflare Worker deferred.** `worker/` is written but not deployed: the free plan
  gives 10 ms CPU per request and verifying a puzzle costs up to three seconds. Works on
  the paid plan (~$5/month) or a host with a higher limit. Deliberately postponed.
- **TODO(guus): licence.** The repository is public and has no `LICENSE`. Default per the
  standard is "all rights reserved"; MIT only by decision (ADR).

## Recent decisions
- 2026-11-11 — A 16×16 board now follows entirely from its seed (`edcbd24`). `naSnoei`
  stopped after 900 ms of wall-clock time, so a busy machine or a slow phone gave the same
  link different clues; it now stops after a fixed budget of 480,000 solver steps. The
  fixed cases are unchanged; of 31 measured level-6 boards, 2 got different clues (a
  one-off, agreed with the owner).
- 2026-11-10 — A drawing may never contradict its own name. The station, the school, the
  hospital, the office and the pool borrowed half their furniture from the manor and only
  renamed it ("het ruimtepak" was the knight's armour, "de tijdzuil" the longcase clock).
  All 71 such slots were swapped one-for-one for an honest modern drawing — never removed:
  `maxMeubels` was measured before and after for all thirteen existing worlds and is
  unchanged, and a fingerprint of 18 boards per world is identical to `f74d2b8`. Enforced
  by `OUDERWETS` / `MODERNE_WERELDEN` in `kamersoorten.js`, which `check-kamers.mjs` fails
  on as `OUDERWETSE TEKENING IN MODERNE WERELD`. See `specs/modern-worlds.md`.
- 2026-11-10 — Four present-day worlds, each as complete as the pool: Sterrenschip Zwaluw
  (`ruimteschip`), Hoogstad (`stad`, evening), Escaperoom Klokslag (`escaperoom`, a set,
  not a new game) and Pretpark Zonnestraal (`pretpark`, daylight). Thirteen worlds became
  seventeen, so **`wereldVoorSeed` now takes modulo seventeen: a new random puzzle lands in
  a different world than it used to.** Existing links are unaffected, because the world is
  in the URL. Accepted in the spec.
- 2026-11-10 — The restrained palette was reopened on purpose: one gold accent on cream
  became a bright set with pink as the click colour, because the player it is built for
  found it dull. The decoration sits in one block at the bottom of `styles/app.css`, and
  still uses no image files. See `specs/visual-liveliness.md` → Decision.
- 2026-11-10 — Exactly one clue per name is impossible, so every name is shown instead.
  Measured over twelve puzzles per level: five names need 6.6 clues on average to pin the
  solution, sixteen names 41.3. Forcing a balanced spread in `groeiTotVast` barely moved it
  (seven to six names without a clue, the outlier stayed at four) because `snoei` restores
  minimality afterwards; that experiment was reverted. What did work: show the name anyway,
  with the note that its spot follows from the rest.
- 2026-11-10 — The two switches left the sticky bar for the space below the board: on a
  phone their labels wrapped over three lines and bar plus header covered a quarter of the
  screen, permanently, over the puzzle.
- 2026-11-08 — Adopted the project standard — see `docs/decisions/0001-record-architecture-decisions.md`
- 2026-11-08 — Dutch stays the language of the code; docs are English — see `docs/decisions/0004-dutch-is-the-language-of-the-code.md`
- 2026-11-08 — A pool is not a lawn: `bad` became a room kind of its own with ten pieces of
  its own and no fallback route, after a planter turned up in the shallow end.
- 2026-11-08 — The keuring runs all seven checks always (`tools/keuring.mjs`); the `&&`
  chain in `package.json` hid 74 missing icons behind one budget bug.
- 2026-11-08 — Not every case is a murder: disappearances and thefts too (`zaken.js`).

## Known gaps not yet scheduled
- The keuring never draws the board frames, so a fault in `bordrand.js` that only breaks at
  draw time is not caught.
- The solution sits in the page; anyone who opens the console can read it.
- 16×16 stays cramped on a phone, even with the frame switched off.

## Health
Version: 0.1.0 (private, unreleased) · Build: no build step — a push to `main` is a deploy ·
Tests: `npm run check:all` green, 7/7 checks, 2026-11-11 (`c7136a5`) · Store: n/a (web) ·
Dependencies: 1 (`@anthropic-ai/sdk`, tooling only), 0 vulnerabilities (2026-11-09)
