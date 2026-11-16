# Spec: harder, more varied clues on the room board

Status: approved
Date: 2026-11-16 (interview and approval by Guus the same day, via the main session:
"ja, spec goedgekeurd met de stopregel")

## Goal
The player of a Reconstructie (room board) gets clues that make her combine: no pair of
clues that hands her a cell, no name with a pile of clues, no kind repeated over and over.
Point (a) of the daughter's second round of feedback (`STATUS.md`, Next, 2026-11-16).

## Users and context
The owner's daughter and testers (`docs/PRODUCT.md`), on a phone and a laptop, on every
level of the room board (`mechaniek: 'kamer'`). Her words: clues are too easy, too alike
and repeat a lot; "same row as X" plus "same column as Y" already says where someone
stands, so say which room someone is in instead; at most one clue per person, none too
easy. Guus added from his own game (Het Rietveld College, Makkelijk): "veel hints per
naam" — Imke, Pien and Quincy had three each.

## What we measured (2026-11-16, before the change)
Seeds `meet-0..19` per level (level 5: 10, level 6: 5), world from the seed. Clues per
person are counted the way the player lists them since PR #10: a clue about two people
counts under both names.

| level | clues | clues per name, avg | busiest name | names with > 1 | most-repeated kind per puzzle |
|---|---|---|---|---|---|
| 1 | 6.2 | 1.75 | 2.5 | 61% | 2.2 |
| 2 | 8.1 | 1.94 | 3.0 | 66% | 2.2 |
| 3 | 10.8 | 2.39 | 3.8 | 76% | 3.3 |
| 4 | 16.4 | 2.66 | 4.4 | 77% | 4.4 |
| 5 | 22.9 | 2.92 | 4.8 | 85% | 5.3 |
| 6 | 34.4 | 3.57 | 5.4 | 93% | 9.4 ("ten noorden van") |

- `opRij` / `opKolom` ("op dezelfde rij / in dezelfde kolom als <meubel>") are 19–25% of all
  clues on levels 2–6. A person who gets both is pinned to exactly one free cell: 29 of 29
  cases. One row clue alone leaves 10–18% of the free cells, as strong as a room clue
  (19–24%). `kamerNiet` leaves 75–86%, `rand` ~50%, `naast` 37–58%.
- Experiment (a copy of `generate-rooms.js` with a per-name cap in `groeiTotVast`, rows and
  columns removed, `kamer` weight ≥ 4): with the cap the builder fails often. Cap 1: level 3
  and up 0/20. Cap 2: level 1 20/20, level 3 1–4/20. Cap 3: level 3 5–8/20, level 4 1/20.
  Without a cap, but without rows and columns, every level builds 20/20 with about the same
  number of clues. **So the caps below are not reachable by adding a filter to today's
  builder; step 1 of the plan has to make the builder spread clues on purpose.**

## Decisions from the interview (2026-11-16)
1. **One clue per name is the aim, with a hard upper bound per level** (1A): the builder
   prefers a name that has the fewest clues so far; no name may exceed **2 on levels 1–3**
   and **3 on levels 4–6**. Clues about everyone (`aantalKamer`, `aantalNaast`, listed under
   "Iedereen") do not count toward any name.
2. **Row and column clues are gone** (2A) on every level, in puzzles and in hints. The room
   clue (`kamer`, "X stond in de bibliotheek") takes their place on every level.
3. **"Too easy"** (3A): from level 3 up, no clue about one person may on its own leave that
   person ≤ 2 free cells of the board.
4. **Repetition** (4A): no clue kind (`soort`) may make up more than
   `max(2, ceil(0.25 × number of clues))` of a puzzle. A keuring rule locks 1–4 in.
5. **Every room board may shift** (5): no version key in the seed. Existing links and the
   library's room cases show a different board after this change.
6. **A two-person clue counts toward both names** (6A), as the player sees it.

## Scope (in)
- Generator for the room board: `src/engine/generate-rooms.js` (`bouwVijver`,
  `groeiTotVast`, `snoei`, `naSnoei`, `extraAanwijzing`'s `HINTGEWICHTEN`) and its weights
  in `src/engine/difficulty.js` (`KAMER_LEVELS`).
- The rules text in `src/content/spelregels.js` (the row/column sentence goes).
- A keuring rule over a fixed set of seeds per level plus the room cases of the library.
- `STATUS.md`, `CHANGELOG.md` and the README passage on clue kinds, where they name rows
  and columns.

## Non-goals (out)
- The other mechanics (`grid`, `latin`): their clues are untouched.
- Clue sentence wording, the AI layer, the per-name list in the player (PR #10).
- Hints asked for by the player do not count toward the caps: they are extra on request.
  They do lose rows and columns, and they keep refusing `kamer`.
- Removing the `opRij` / `opKolom` evaluators and sentences from `rooms.js` and
  `rooms-text.js` (hide, do not delete): the weights go to 0 and the pool no longer offers
  them.
- Points (b), (c) and (d) of the same feedback round.

## Acceptance criteria
1. Given any room puzzle of any level, when it is built, then no clue has `soort` `opRij`
   or `opKolom`.
2. Given an extra hint asked for on any room puzzle, when it is chosen, then it is not
   `opRij`, `opKolom` or `kamer`.
3. Given a room puzzle of level 1, 2 or 3, when its clues are grouped per name with the
   player's own grouping (`aanwijzingenPerPersoon` in `src/aanwijzingen.js`), then no
   name has more than 2 clues.
4. Given a room puzzle of level 4, 5 or 6, grouped the same way, then no name has more
   than 3 clues.
5. Given a clue about two people, when it is counted for criteria 3 and 4, then it counts
   for both names.
6. Given a clue about everyone (`aantalKamer`, `aantalNaast`), when it is counted for
   criteria 3 and 4, then it counts for no name.
7. Given a room puzzle with k clues, then no single `soort` occurs more than
   `max(2, ceil(0.25 × k))` times.
8. Given a room puzzle of level 3 or higher, when any clue about one person is evaluated
   on its own against the empty board, then it leaves that person at least 3 free cells.
9. Given the measuring sample of the "What we measured" section, when it is run again after
   the change, then the average clues per name is lower than before on every level.
10. Given any room puzzle, then the victim is still named in no clue and no hint (PR #11
    holds), and the solution is still unique.
11. Given the room cases of the library and the keuring sample, when the keuring runs, then
    a check fails on any puzzle that breaks criteria 1–8 or 10, and names the puzzle id and
    the rule.
12. Given the rules sheet of the room board, then it no longer mentions "op dezelfde rij" or
    "in dezelfde kolom" as a clue kind; the sentence "precies één figuur per rij en precies
    één per kolom" (the board rule) stays.
13. Given a seed, when the same puzzle is built twice, on any machine, then it gives the
    same board and clues (everything follows from the seed; any new draw has its own rng).

## Edge cases and error states
- **A level cannot meet its caps.** The builder gives up on an attempt and tries the next
  (as today); if no attempt meets the caps, `genereerKamerpuzzel` returns the attempt with
  the lowest overshoot (the existing `mis` mechanism), never an unsolvable or non-unique
  puzzle. The keuring then fails on that seed, so it cannot ship silently.
- **The caps prove out of reach in step 1.** If, after the builder spreads on purpose, a
  level builds fewer than 19 of 20 sample seeds within the caps, or level 6 takes more than
  11 s per puzzle (today's upper bound, `difficulty.js`), the build stops and asks Guus via
  the main session whether to raise that level's cap by one. The measured numbers go into
  this spec as an amendment.
- **A small room.** A `kamer` clue for a room of 1–2 free cells is "too easy" under
  criterion 8 from level 3 up; on levels 1–2 it is allowed.
- **Victim's room pair.** `kamer` is never about the victim (unchanged), and `zelfdeKamer`
  with the victim stays forbidden.
- **Library progress.** Solved marks are stored per puzzle id; after this change a solved
  library case shows a new board under the same mark. Accepted by Guus under decision 5.

## Data and privacy
No new data. Nothing personal. Boards change for the same ids (decision 5).

## Design direction (UI features)
n/a — no screen changes; only the rules-sheet text loses one sentence.

## Flow and sketch (UI features)
Show it: n/a — generator change; no new screen, route or flow.

## Performance budget (when it matters)
Building a puzzle may not get slower than today's measured upper bounds by more than 50%:
levels 1–4 under 0.2 s, level 5 under 1 s, level 6 under 11 s on an idle laptop. The
keuring's total time may grow by at most two minutes.

## Test plan
- Unit, valid input: for each level, the sample seeds build, are unique, and meet criteria
  1, 3–8 (new check, see Integration).
- Refusal or failure: the new check is fed a hand-made puzzle per rule (a row clue, a name
  with 3 clues on level 2, a kind at 40%, a 2-cell clue on level 3, a clue naming the victim)
  and must fail on each; a hint request on a board where only `kamer` would help still
  returns no `kamer`.
- Integration and contract: the new rule runs inside `npm run check:all` (in
  `tools/check-aanwijzingen.mjs` or a new `tools/check-spreiding.mjs` listed in
  `tools/keuring.mjs`), over the library's room cases and seeds `keur-0..9` on levels 1–5
  plus `keur-0..2` on level 6; per-name counts come from `aanwijzingenPerPersoon`, the
  player's own grouping, so the check and the screen cannot disagree.
- Security: n/a — no input boundary, identity or personal data is touched.
- Regression: the PR #11 rule (no clue or hint names the victim) and the existing
  uniqueness checks stay green; criterion 13 is checked by building one seed per level twice
  in one run and comparing.
- Sanity and smoke: after the change, the full keuring (`npm run check:all`, read the
  `volledige keuring exit=` line); the measuring script re-run with its table pasted into the
  PR; after deploy, the `docs/RELEASE.md` Verify step on reconstructie.app.
- Component / E2E and manual check: screenshot of one level-2 and one level-5 board with
  the per-name list open, in the browser pane, looked at before calling it done; then the
  daughter plays a fresh case (STATUS Next).

## Open questions
- None blocking. The caps per level may be amended after step 1 (see Edge cases).

## Plan (added before building)
1. **Spread on purpose, measure** (2 h) — `src/engine/generate-rooms.js`: in
   `groeiTotVast`, refuse a clue that would push a name over its cap (pair clues count for
   both, `aantal*` for none), and prefer among the next candidates the one about the name
   with the fewest clues, tie-broken by the existing weighted order. Pass the cap in via
   `KAMER_LEVELS` (`maxPerNaam: 2 | 3`). `snoei` only removes clues, so it cannot break a
   cap. Re-run the measuring sample (script kept in the build's PR description, not in the
   repo) per level: builds within caps out of 20, s/puzzle. Stop and ask (Edge cases) if a
   level falls short. Tests first: the refusal fixtures of the Test plan for the cap.
2. **Rows and columns out, room in** (1 h) — `src/engine/difficulty.js`: `opRij` and
   `opKolom` to 0 on every level, `kamer` ≥ 4 on every level (tune with step 1's numbers);
   `HINTGEWICHTEN` in `generate-rooms.js` drops both. `src/content/spelregels.js`: remove
   the row/column clue sentence. Tests first: criteria 1 and 2.
3. **Too easy and repetition** (1–2 h) — in `bouwVijver`, from level 3 up, skip a
   one-person clue that leaves ≤ 2 free cells (count with `evalAanwijzing` over the free
   cells, as the measuring script did); in `groeiTotVast`, refuse a clue whose kind is at
   `max(2, ceil(0.25 × maxClues))` (the final share is checked by the keuring on the real
   count). Tests first: criteria 7 and 8.
4. **Keuring rule** (1–2 h) — new check per the Test plan, wired into `tools/keuring.mjs`
   (in `ZWAAR`, since it builds puzzles) and a `check:spreiding` script in `package.json`
   if it is a new file; add the rule to `CLAUDE.md` Commands.
5. **Look and record** (1 h) — screenshots of a level-2 and level-5 board with the per-name
   list; full keuring in the background; `CHANGELOG.md` under Unreleased (Changed: clues on
   the room board), `STATUS.md` (point (a) built, daughter to verify), README passage on
   clue kinds.

Risks:
- **Caps out of reach on levels 3–6** (measured: a plain filter fails). Mitigation: step 1
  measures first and stops for a decision instead of tuning silently.
- **Level 6 build time** grows with every refused candidate. Mitigation: the performance
  budget above, measured in step 1.
- **Everything shifts**: every room board and library case changes; any catalog title or
  subtitle that describes a specific board (`src/content/catalog.js`) must be re-read.
- **Determinism**: a new random draw mid-sequence shifts puzzles; give any new draw its own
  rng (`makeRng(\`${seed}:spreiding\`)`), never a clock (`NASNOEI_STAPPEN` pattern).
