# Status — Het Vierde Spoor

Last updated: 2026-11-10

Translated and restructured from `HANDOFF.md`, which lived at the repository root until the
project standard was adopted; the original is in git history. The parts of it that are
standing guidance rather than state moved to `CLAUDE.md`.

## Now
- Nothing in progress. Working tree clean on `main` at `82ff799`; everything is live on
  https://keebl.github.io/het-vierde-spoor/ with the keuring green on all seven checks.
- This branch (`chore/adopt-standard`, pull request #1) adds the project standard and
  nothing else: no application code, dependencies or CI were touched. Until it merges,
  half the documentation exists only here.

## Next
1. **Make it look alive.** The daughter's verdict on the site: dull colours, dull
   drawings, no artistic life. The brief is written and ready to be picked up cold —
   **`specs/visual-liveliness.md`**. It covers why the design is restrained (a decision,
   not neglect), what was already tried, where every drawing lives, five directions with
   their cost, and the question that has to be answered first: is the *board* dull or the
   site around it? Those are different files.
2. **An ending when you solve it.** Today the screen only says "Opgelost". The culprit
   should appear, with a closing line and a button to the next case. Biggest gap for the
   intended player.
3. **Rename the site.** "Het Vierde Spoor" is to change; the new name has not been chosen.
   The game type was renamed to **Reconstructie** (was "Speurdoku", too close to Murdoku).
4. **Keyboard and screen reader.** Board cells are `rect` elements without focus, so the
   game cannot be played without a mouse.
5. **Modernise the base furniture set.** The daughter finds the objects too 1950s. We added
   daylight worlds instead of redrawing the base set, but that set is still a 1930s manor
   (hearth, grand piano, steamer trunk, coal bunker). Redrawing it touches every world.
6. **Names bent around a drawing.** In the swimming pool "de slippersmand" and "de
   handdoekplank" exist because an umbrella stand and a side table happened to be
   reusable. The honest fix is to draw those pieces, not to bend the name further.

## Blocked / open questions
- **TODO(guus): the new site name.** Everything else about the rename is ready.
- **Cloudflare Worker deferred.** `worker/` is written but not deployed: the free plan
  gives 10 ms CPU per request and verifying a puzzle costs up to three seconds. Works on
  the paid plan (~$5/month) or a host with a higher limit. Deliberately postponed.
- **TODO(guus): licence.** The repository is public and has no `LICENSE`. Default per the
  standard is "all rights reserved"; MIT only by decision (ADR).

## Recent decisions
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
Tests: `npm run check:all` green, 7/7 checks, 2026-11-08; `check:snel` green 2026-11-09 · Store: n/a (web) ·
Dependencies: 1 (`@anthropic-ai/sdk`, tooling only), 0 vulnerabilities (2026-11-09)
