# Spec: extend the room engine for room puzzles

Status: draft
Date: 2026-11-17
Decision record: `docs/decisions/0005-extend-the-room-engine-for-book-style-puzzles.md`

## Goal
The player of a room board gets puzzles that feel hand-made: about one short clue per
person, mostly about objects on the board, and a difficulty that comes from a chain of
deductions she can follow afterwards in a numbered solution, in the app and on paper.

## Users and context
The owner's daughter (primary) and testers (`docs/PRODUCT.md`), on a phone and a laptop.
She knows the genre from a commercial puzzle book that Guus owns; its mechanics, not its
wording, names, art or puzzles, are the model. Her verdict on today's clues (2026-11-16):
too easy, too alike, too many per name. PR #15 spread and capped clues but could not reach
one per name (caps 3 / 4 / 5, none on level 6) and made level 6 slower.

## What we measured (2026-11-17, PR #15 engine, before this change)
Node 22, one core, Apple-silicon laptop that was also running other sessions (load
average about 2), seeds `meet-0..19` (level 5: 12, level 6: 8), world-independent engine
call with `maxMeubels: 18`. Heap is `process.memoryUsage().heapUsed` at its highest after
a build; RSS includes Node's own ~45 MB.

| level | board | median | p90 | worst | CPU | peak heap | max RSS |
|---|---|---|---|---|---|---|---|
| 1 | 5×5 | 4 ms | 16 ms | 17 ms | 1 core | 10 MB | 65 MB |
| 2 | 6×6 | 16 ms | 63 ms | 67 ms | 1 core | 17 MB | 77 MB |
| 3 | 7×7 | 148 ms | 696 ms | 743 ms | 1 core | 49 MB | 133 MB |
| 4 | 9×9 | 139 ms | 516 ms | 689 ms | 1 core | 21 MB | 93 MB |
| 5 | 12×12 | 2.2 s | 4.3 s | 4.4 s | 1 core | 39 MB | 126 MB |
| 6 | 16×16 | 5.9 s | 15.0 s | 15.0 s | 1 core | 40 MB | 126 MB |

**Mid-range phone: estimated, not measured.** Single-thread JavaScript on a mid-range
Android phone is typically 3–5× slower than on an Apple-silicon laptop; a recent iPhone is
close to the laptop. Estimate with factor 4: level 5 median ~9 s, worst ~18 s; level 6
median ~24 s, worst ~60 s (this board becomes level 7). Memory is not the constraint (a browser tab has hundreds of MB;
the build needs tens). The cost is one core at 100 % for that time, so battery and heat on
a phone, and a frozen page today because building runs on the main thread.

## Decisions
1. **Extend, not replace** (ADR-0005): same pipeline, a new human-style solver, and a
   template builder for every level. The old grower stays in the code, unused.
2. **The human solver comes first** and changes no board: it grades and explains today's
   puzzles before any generator change.
3. **One own clue per person** is built in, not filtered: the caps of #15 become a keuring
   rule ("one own clue, at most two lines per name").
4. **Every board shifts once** (Guus, 2026-11-17, "Alles verschuift"): no version key.
   When the template builder lands (step 8), every room board and library case changes.
5. **The victim: nothing** (Guus, 2026-11-17, "Niets"): no clue or hint names the victim,
   as since PR #11. The book's victim clue is not adopted.
6. **Seven levels** (Guus, 2026-11-17): level 6 becomes 12×14 with about 12 people (at
   most one per column); today's 16×16 becomes level 7.
7. **A slowly growing store of built puzzles** (Guus, 2026-11-17): what is built and not
   played is kept for later, with a hard maximum. Where it lives: see Performance.

## Scope (in)
- `src/engine/redeneer.js` (new): the human solver, its techniques, trace and grade.
- `src/content/redeneer-text.js` (new): Dutch text for each step, for the app and print.
- `src/engine/rooms.js`: rectangular boards, "at most one" per row and column, object
  types and postures, standable objects, windows, special cells; new clue kinds in
  `SOORTEN` with `eval` and `propageer`.
- `src/engine/generate-rooms.js`: the template builder `bouwPerPersoon`, pruning against
  the human solver, own rngs per new draw, version switch.
- `src/engine/difficulty.js`: a target band per level (techniques, chain length).
- `src/content/kamersoorten.js` and the drawing files: type and posture per piece, new
  honest drawings, windows, the special-cell marker, classes and roles per world.
- `src/ui/`: token drawn on an object, windows, special-cell marker, the solution as
  numbered steps, building in a Web Worker with an estimate and a progress bar, prefetch
  of the next puzzle.
- Tools and keuring: soundness cross-check of every trace, clue-shape rules, build-time
  budget per level, pre-generated library cases.

## Non-goals (out)
- Copying anything from the book: wording, names, art, puzzles or its title. Mechanics only.
- The other mechanics (`grid`, `latin`).
- Removing the old grower, the exact counter or the #15 caps from the code (hide, do not
  delete).
- A server or shared online store for puzzles (see Performance, option C).
- The AI layer and paid printing (`specs/paid-printing.md`), except that print shows the
  numbered steps.
- New worlds. Existing worlds get the drawings the new types need, nothing more.
- A server for building puzzles (ADR-0002, `docs/PRODUCT.md`: no server for gameplay).

## Acceptance criteria

Human solver and solution text
1. Given any room puzzle of any level, when the human solver runs on its clues, then it
   either places every person or stops with "needs a technique above tier N"; it never
   places a person on a cell that differs from the solution.
2. Given a puzzle the human solver solves completely, when the exact counter
   (`telPlaatsingen`, cap 2) runs on the same clues, then it finds exactly one solution.
3. Given a solved trace, then every step names its technique id, the clue ids it used, and
   the cells it struck or the person it placed.
4. Given a solved trace, when it is turned into text, then each step is one or more Dutch
   sentences that name only people, rooms and objects of that puzzle, and the victim only
   as "het slachtoffer" or by name in the case rule.
5. Given a solved puzzle in the app, when the player opens the solution, then she sees the
   numbered steps; on print, the numbered steps appear under the board.
6. Given the steps of criterion 1 applied to today's puzzles (step 1 of the plan), then no
   board, clue or puzzle id changes.

Grading
7. Given a room level, when a puzzle is accepted, then its trace's chain length and
   top technique tier lie inside that level's band in `difficulty.js`.
8. Given the keuring sample of a room level, then the median chain length rises
   strictly from each level to the next.

Clues
9. Given a room puzzle, then every non-victim person is the subject of exactly one
   own clue (a clue about that person alone).
10. Given a room puzzle, then no name appears in more than two lines of the player's
    per-name list (`aanwijzingenPerPersoon`), and relational plus global clues together
    number at most `ceil(persons / 3)`.
11. Given a room puzzle, then at least half of the own clues are object clues (on,
    in, next to, in front of, not next to a type of object; the only person on a type).
12. Given any clue, when it is evaluated in the solution, then it is true (as today).

Board
13. Given a book-style board, then it may be rectangular and hold fewer people than rows
    or columns, with at most one person per row and per column.
14. Given an object of posture `sta`, `zit`, `lig` or `rijd`, then a person may stand on
    it, the board draws the object visibly under that person's token, and the clue
    sentence uses the matching verb ("stond op", "zat op", "lag in", "zat op" / "reed op").
15. Given a special cell with rule `alleen`, then the person on it is the only person in
    that room in the solution; with `nietAlleen`, at least one other person is in that room.
16. Given a room with a class or gender rule, then in the solution only people with that
    attribute stand in it.
17. Given a role clue ("exactly three columns left of the bandit"), then the role is
    either found through its object clue or follows from the trace, and the trace places
    the role-holder before or in the step that uses it.

Drawings
18. Given any world and any object type the generator may put there, then that world has
    an honest drawing for it, and in a present-day world it is not an `OUDERWETS` drawing;
    the keuring fails otherwise.

Determinism
19. Given a seed and a level, when the puzzle is built twice, in Node and in the browser
    worker, then board, clues and trace are identical.
20. Given a room puzzle, then no part of its build depends on elapsed time: every
    budget counts solver steps or technique applications.
21. Given a stored puzzle and the same id rebuilt from its seed, then both are identical;
    the keuring rebuilds a sample of every committed pool and fails on any difference.

Performance
22. Given any level, when a puzzle is built in the app, then the page stays responsive,
    an estimate is shown before building starts, and a progress bar moves at least once
    per second until it is ready; a cancel button stops the build.
23. Given the keuring sample per room level on the CI runner, then the worst build
    time stays under the laptop budget in the Performance section; the keuring fails
    otherwise.
24. Given a player solving a puzzle, when she presses "Volgende puzzel", then the next
    puzzle of that level is already built in the background, unless she pressed within
    its build time.
25. Given the per-browser store is full, when a new unplayed puzzle is added, then the
    oldest unplayed puzzle of that level is dropped, and the store never exceeds its
    maximum; when the browser refuses storage, the app builds as if there were no store.

## Edge cases and error states
- **The template builder cannot finish a board.** As today: next attempt; after the
  last attempt the one with the smallest miss (`mis`) is returned and the keuring fails on
  that seed. Never an unsolvable or non-unique puzzle.
- **The human solver stalls on one of today's puzzles** (phase A) that the exact solver proves unique.
  Allowed in phase A (grading only, criterion 6); the solution view then shows the
  steps it found and the line "vanaf hier is een aanname nodig", followed by the remaining
  placements.
- **Unsound technique** (a bug): the keuring's cross-check (criterion 2) fails with the
  puzzle id and the technique id.
- **Worker not available** (very old browser): build on the main thread with the old
  "even geduld" behaviour.
- **The player leaves while building**: the worker is terminated; nothing is stored.
- **Two people on one object** where only one fits (one chair, one bed): an object holds
  one person, like a cell does.
- **"Alone" with a special cell in a one-cell room**: the generator does not put a
  special cell in a room smaller than three free cells.
- **A role nobody can find**: rejected by criterion 17.
- **Phone slower than estimated**: the estimate comes from the level table, the progress
  bar from attempts, so the bar is honest even when the estimate is wrong.

## Data and privacy
No new personal data. Gender per name already exists (`GESLACHT_VAN` in `namen.js`) and
is a property of fictional names. Pre-generated library cases are puzzle data in the repo.

## Design direction (UI features)
Follows `docs/DESIGN.md` and the existing board style. New visual pieces: objects a token
stands, sits or lies on (the token smaller and offset so the object stays readable),
windows drawn in the wall line, a special-cell marker that reads as a rule (not as
decoration), the numbered solution list in the existing clue typography, and a progress
bar in the colour of the level.

## Flow and sketch (UI features)
Show it: due before the UI steps (steps 7 and 9 of the Plan) — `/functional-design
--feature engine-extension` for the solution view, the build progress screen and the
token-on-object drawing. The engine steps (1–6) change no screen except the solution view
in step 2, which is sketched first.

## Performance budget
Maximum build time per level, **worst case on a mid-range phone** (estimated as 4× the
laptop until measured on a real phone); the keuring checks the laptop equivalent:

| level | phone, worst | laptop, worst (keuring) | shown to the player |
|---|---|---|---|
| 1–3 | 1 s | 0.25 s | nothing (instant) |
| 4 | 3 s | 0.75 s | spinner |
| 5 | 15 s | 4 s | estimate + progress bar |
| 6 (12×14) | 30 s | 8 s | estimate + progress bar |
| 7 (16×16) | 60 s | 15 s | estimate + progress bar |

- **Web Worker**: the build runs in a module worker; the main thread only shows progress.
- **Prefetch**: while a puzzle is played, the next one of that level is built in the
  worker at low priority (it yields between attempts).
- Memory: under 100 MB of heap for a build, checked in the keuring sample.

### The growing store (Guus's idea, 2026-11-17)
A puzzle is fully decided by its id (seed, level, world), so a stored result is the same
puzzle anyone would build; storing it only saves computation. Measured size of one built
puzzle: about 2 KB (level 5, 0.4 KB gzipped); estimated 3 KB for level 6 and 4 KB for
level 7. Levels 1–4 build in under a second and are not stored. Three places, because the
site is static on GitHub Pages:

| | A. per browser (IndexedDB) | B. pool in the repo | C. shared server store |
|---|---|---|---|
| What | every puzzle built in this browser and not played (prefetch, cancelled "next") | a tool on the laptop builds seeds in the background and commits one JSON per level; "Nieuwe puzzel" picks an unplayed seed from it | browsers upload what they built; everyone draws from it |
| Grows | while she plays | each time the tool runs (e.g. weekly) | with every visitor |
| Maximum | 100 per level, levels 5–7: 300 puzzles ≈ 0.9 MB | 300 per level, levels 5–7: 900 puzzles ≈ 2.7 MB raw, ~0.6 MB gzipped, one file per level (~0.6–1.2 MB raw), loaded only when that level is chosen | — |
| Cost | none | none; building 300 level-7 puzzles ≈ 30 min of one laptop core (median 6 s); keuring rebuilds a sample of 10 per level (~2 min) | a Cloudflare Worker on the paid plan (~$5/month, the free 10 ms CPU cannot verify a puzzle) plus storage; every upload must be rebuilt and checked before others get it |
| Shared between devices | no | yes | yes |
| Risk | Safari may clear site storage after 7 days without a visit; then it simply builds again | repo grows ~3 MB per full refresh of the pool (git keeps history) | a server, an API key online, abuse handling — against `docs/PRODUCT.md` ("no server for gameplay") |

**Recommended: A and B together.** B makes the first level-5–7 puzzle instant on any
device; A keeps what this browser built on top of it. C is a non-goal.

- **Library cases** of levels 5–7 are stored in B the same way (about 25 cases, ~75 KB).

## Test plan
- Unit, valid input: per technique, a hand-made position where it applies and the exact
  strike it must make; per new clue kind, `eval` true in the solution and `propageer`
  sound on 200 random partial boards (compared against the exact counter).
- Refusal or failure: hand-made puzzles that break each rule (two own clues for one name,
  a third line for a name, a role used before it is found, a special cell broken, a
  present-day world with an `OUDERWETS` chair, a trace step with a wrong strike); the
  keuring must fail on each with the puzzle id and rule.
- Integration and contract: the human solver against `telPlaatsingen` over the whole
  keuring sample (criterion 2); the step text through `check-regels.mjs`' sentence rules;
  the worker and the main thread give identical output for one seed per level
  (criterion 19, in the browser pane).
- Security: n/a — no input boundary, identity or personal data is added; the worker gets
  only settings and a seed.
- Regression: step 1 builds the full keuring sample before and after and compares every
  puzzle's fingerprint (criterion 6); the PR #11 victim rule and the #15 rules stay green
  on old levels.
- Sanity and smoke: `npm run check:snel` per step, the full keuring (`npm run check:all`,
  read the `volledige keuring exit=` line) before each merge, the measuring script re-run
  per level with the table in the PR, the `docs/RELEASE.md` Verify step after deploy.
- Component / E2E and manual check: screenshots per UI step (solution view, token on a
  chair, window, special cell, progress bar on phone width); a print proof of the
  numbered solution with `tools/printproef.mjs` (owner's terminal); then the daughter
  plays a room level 3 and level 6 board and her verdict goes into `STATUS.md`.

## Open questions
Answered by Guus on 2026-11-17 (decisions 4–7): every board shifts; level 6 is 12×14 and
level 7 is 16×16; the victim gets nothing; a growing store with a maximum. Still open:
where the store lives (A, B or both; recommended both) and its maxima.

## Plan (build order)
Each step is 1–2 hours unless marked, ends green on `npm run check:snel`, and steps that
change the engine end with a full keuring in the background.

**Phase A — the human solver with step text (no board changes)**
1. **Techniques tier 1–2** — `src/engine/redeneer.js` (new): candidate grid shared with
   `domeinenVan`, techniques `direct`, `bezet`, `enigeVakje`, `laatsteInLijn`,
   `combineer`, the trace format. Tests first: one hand-made position per technique in a
   new `tools/check-redeneer.mjs`.
2. **Tier 3–4 and the grade** (2 h) — `kruispunt`, `paar`, `relatie`, `telling`,
   `aanname` (depth 1); grade = chain length, top tier, hard steps. Tests first: the
   soundness cross-check against `telPlaatsingen` over the keuring sample (criterion 2).
3. **Step text** — `src/content/redeneer-text.js`, grouping into dense steps; sentence
   rules in `check-regels.mjs`. Tests first: criterion 4 per technique.
4. **Solution view and print** — `src/ui/player.js`: the numbered steps behind
   "Oplossing", and under the board in `@media print`. Sketch first
   (`/functional-design --feature engine-extension`). Screenshot and print check.
5. **Measure today's puzzles** (1 h) — grade the keuring sample per level; record chain
   lengths and tiers in this spec as the baseline for the bands; confirm criterion 6
   (fingerprints unchanged).

**Phase B — building on the solver, object clues (room levels)**
6. **Board model** (2 h) — `rooms.js`: rectangular boards, "at most one", object type and
   posture, standable objects, windows on edges. Old levels keep "exactly one" and square
   boards; fingerprints of old levels unchanged.
7. **Object clue kinds** (2 h) — `SOORTEN`: `op` (on / in a type), `naastType`,
   `voorRaam`, `nietNaastType`, `hoekKamer`, `hoekRooster`, `enigeOp`,
   `rijEnKamerAls`; `eval`, `propageer`, `uitleg` each, and their sentences in
   `rooms-text.js`. Tests first: soundness fixtures per kind.
8. **Template builder** (2 h) — `bouwPerPersoon` in `generate-rooms.js`: one own clue per
   person by solver gain, then the fewest relational / global clues; prune against the
   human solver; bands per level in `difficulty.js`; own rngs; version in the id. Tests
   first: criteria 7, 9–11 as keuring rules.
9. **Drawings for types and postures** (2 × 2 h) — `MEUBELS_VAN` gets type and posture;
   chairs, rugs, beds, windows, trees in the base and modern sets; token-on-object in
   `board-rooms.js`; the keuring rule of criterion 18. Screenshots per world group.
10. **Web Worker and progress** (2 h) — `src/engine/worker.js`, progress per attempt,
    estimate per level, cancel, prefetch of the next puzzle; main-thread fallback.
    Criteria 19, 22, 24, checked in the browser pane at phone width.
11. **The store and build-time budget** (2 h) — (A) an IndexedDB store per browser with
    its maximum and eviction; (B) `tools/pool.mjs` that builds and writes one JSON per
    level 5–7 plus the library cases; a keuring check that rebuilds a sample and
    compares (criterion 21), and the budget check of criterion 23.

**Phase C — roles, attributes, special cells**
12. **Relational clues** — `alleenMet`, `rechtBoven`/`rechtOnder`, `preciesNRijen` /
    `precieskolommen`, `linksboven`; technique `relatie` extended.
13. **Special cells** — `alleen` / `nietAlleen` markers: engine rule, propagation,
    marker drawing, sentence.
14. **Roles** — role through an object (collector, hunter) and hidden role (bandit);
    clues with a role as reference; criterion 17.
15. **Attributes and area rules** (2 h) — classes per world (content), gender-only and
    class-only rooms, class-wide rules; global hints ("geen lege kamer", "precies één
    persoon naast een kast").
16. **Levels 6 and 7** (2 h) — level 6 becomes 12×14 with about 12 people and about five
    dense steps; 16×16 moves to a new level 7 (`difficulty.js`, level buttons, catalog,
    `ZICHTBARE_LEVEL_IDS`); the band of 7 demands a longer chain than 6 (criterion 8);
    measure both, daughter test.

Risks:
- **Unsound technique** → two solutions shipped as unique. Mitigation: the exact counter
  stays the proof of record and the keuring cross-checks every trace (criterion 2).
- **One own clue per person is out of reach on large boards**, as the caps were in #15.
  Mitigation: object clues are far stronger than today's vocabulary (a type with three
  copies leaves three cells); step 8 measures before tuning and stops for Guus under the
  same stop rule as #15 (fewer than 19 of 20 seeds, or over budget).
- **Drawing work is larger than estimated** (17 worlds). Mitigation: types are shared
  across worlds through the base and modern sets; a world without an honest drawing for a
  type simply does not offer that type (the keuring enforces it).
- **Determinism**: every new draw has its own rng; the version in the id isolates the
  switch.
- **Main-thread fallback** on old browsers keeps today's frozen-page behaviour.
