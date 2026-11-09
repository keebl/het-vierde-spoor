# Status — Het Vierde Spoor

Last updated: 2026-11-09

Translated and restructured from `HANDOFF.md`, which lived at the repository root until the
project standard was adopted; the original is in git history. The parts of it that are
standing guidance rather than state moved to `CLAUDE.md`.

## Now
- Nothing in progress. Working tree clean on `main` at `236c77a`; everything is live on
  https://keebl.github.io/het-vierde-spoor/ with the keuring green on all seven checks.
- This branch (`chore/adopt-standard`) adds the project standard and nothing else: no
  application code, dependencies or CI were touched. Not pushed.

## Next
1. **An ending when you solve it.** Today the screen only says "Opgelost". The culprit
   should appear, with a closing line and a button to the next case. Biggest gap for the
   intended player.
2. **Rename the site.** "Het Vierde Spoor" is to change; the new name has not been chosen.
   The game type was renamed to **Reconstructie** (was "Speurdoku", too close to Murdoku).
3. **Keyboard and screen reader.** Board cells are `rect` elements without focus, so the
   game cannot be played without a mouse.
4. **Modernise the base furniture set.** The daughter finds the objects too 1950s. We added
   daylight worlds instead of redrawing the base set, but that set is still a 1930s manor
   (hearth, grand piano, steamer trunk, coal bunker). Redrawing it touches every world.
5. **Names bent around a drawing.** In the swimming pool "de slippersmand" and "de
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
