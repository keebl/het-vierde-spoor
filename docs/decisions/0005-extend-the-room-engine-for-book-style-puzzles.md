# ADR-0005: Extend the room engine for book-style puzzles

Date: 2026-11-17
Status: proposed (accepted when Guus approves it together with `specs/engine-extension.md`)

## Context

The room board ("Reconstructie", `mechaniek: 'kamer'`) is built by
`src/engine/generate-rooms.js` in four steps: pick a solution, build a pool of true clues
(`bouwVijver`), add clues until the solution is unique (`groeiTotVast`), prune what can be
missed (`snoei`, then `naSnoei` with a fixed budget of solver steps). Uniqueness is proven
by an exact counter (`telPlaatsingen` in `rooms.js`). Difficulty is a style switch:
`shallow` (solvable by the propagation in `graad`) or `deep` (needs an assumption).

Two things are wrong with the result, and the tester said both:

1. **Clues are too easy and too alike.** PR #15 removed row and column clues, spread clues
   over names, and capped clues per name. The caps had to be relaxed under the stop rule
   (3 / 4 / 5 per name, none on level 6), level 6 got *more* clues per name (3.96), and
   building got slower (level 6 up to 16 s, the keuring 22 minutes). A filter on a random
   pool cannot produce "one short clue per person": the pool has no clue strong enough
   on its own and nothing that makes a weak clue strong.
2. **Difficulty is measured in clues, not in thinking.** `graad` counts propagation rounds
   but cannot say *which* deduction a player needs, so the generator can neither aim for a
   chain of a given length nor explain the solution.

Guus owns a commercial puzzle book in the same genre and shared photos (copyrighted:
mechanics only; no wording, names, art or puzzles are copied). Its puzzles differ from
ours in exactly the places above:

- about **one short clue per person**, mostly about an **object or a cell** (on a rug, on
  a chair, in a bed, in front of a window, next to a fire, not next to a tree, in a
  corner, "the only person on a chair", same row *and* same room as an object);
- **objects people stand, sit or lie on**, and **many copies** of the same object
  (several chairs, several rugs), where our furniture blocks its cell and every piece is
  unique by name;
- a few **relational** clues (alone with, directly above, exactly N columns from);
- **roles** found through an object or hidden ("the bandit"), and clues measured from a
  role; **person attributes** that restrict areas (class, gender-only rooms, class-wide
  rules); **special cells** with a rule ("whoever stands here is alone"); **global**
  hints ("no empty room");
- at most one person per row and column on **rectangular** boards (hardest: 12×12 to
  12×14 with about 12 people, so some columns stay empty);
- difficulty from the **length of the human deduction chain**, and a printed solution
  that is a numbered list of those deductions.

Guus asked to extend the engine, not replace it. Long generation is acceptable if it is
predictable and shown to the player.

## Decision

Keep the four-step pipeline and the seed discipline. Change what each step works with,
and add one new module: a human-style solver.

### 1. What stays, what changes

| Part | Decision |
|---|---|
| Pick the solution first (`poging`, `tekenPlaatsing`) | **Stays.** Extended to draw objects, roles, attributes and special cells from their own rngs, *after* the placement, so the placement draw does not shift. |
| Pool of true clues (`bouwVijver`) | **Stays as the source of candidates.** New clue kinds join `SOORTEN` with the same `eval` contract; each also gets a `propageer` and an `uitleg` (below). |
| Grow until unique (`groeiTotVast`) | **Replaced for book-style levels by a template builder** (`bouwPerPersoon`): first exactly one *own* clue per non-victim person, drawn from the object vocabulary and chosen by how much the human solver gains from it; then the fewest relational / global clues that let the human solver finish. The random-order grower stays for the old levels (hide, do not delete). |
| Prune (`snoei`, `naSnoei`) | **Stays**, with a new acceptance test: a clue may only go if the *human solver* still finishes within the level's technique set. A person's only own clue is never pruned (the template is the point). |
| Uniqueness proof (`telPlaatsingen`) | **Stays as the proof of record** and as the keuring's cross-check. In the build loop it is mostly replaced: a sound human solver that places everyone has proven uniqueness, and is much cheaper than counting. The counter still runs once on the accepted puzzle. |
| Difficulty (`difficulty.js`, `style`) | **Replaced by a target band** per level: allowed techniques, chain length (min–max), and how many "hard" steps. `shallow` / `deep` map to the top technique tier. |
| Caps per name from #15 | **Become a consequence, not a filter.** The template gives each name one own clue; the cap that remains is "one own clue per name, at most two lines in the name's list", checked by the keuring. `maxPerNaam` and `soortDeel` stay for old levels. |
| Board (`bouwRooster`) | **Extended**: rows ≠ columns, people ≤ rows, a rule per board "exactly one" (today) or "at most one" (book) per row and column; objects get a *type* and a *posture* (see 3). |

### 2. A human-style solver with named techniques

New module `src/engine/redeneer.js` (the *redeneerder*). It works on the same candidate
grid as `domeinenVan` (person × cell) and applies **named techniques**, cheapest first,
recording each step:

```
{ techniek, aanwijzingen: [clue ids], geplaatst: [{p, cel}], weg: [{p, cel}] }
```

Techniques, by tier (a tier is what a level may require):

| tier | technique (engine id) | what the player does |
|---|---|---|
| 1 | `direct` | one clue alone strikes cells ("on a chair" → only chair cells) |
| 1 | `bezet` | a placed person blocks their row, column, and (for "alone") room |
| 2 | `enigeVakje` | the last free cell for this person |
| 2 | `laatsteInLijn` | the last free cell in this row, column or room for someone who must be there |
| 2 | `combineer` | two clues on one person intersect ("the only chair not next to a table") |
| 3 | `kruispunt` | a person or room confined to one row/column → cross out the rest of that line (pointing / claiming) |
| 3 | `paar` | *k* people confined to *k* lines → those lines are theirs (naked subset) |
| 3 | `relatie` | above / below / N columns from / alone with, against the candidates of the other person |
| 3 | `telling` | counts and global rules ("no empty room", "exactly one next to a cabinet", class rules) |
| 4 | `aanname` | assume, follow tiers 1–3, reach a contradiction (today's `deep`) |

Every technique is **sound** (it only removes what is impossible), so a run that places
everyone proves the solution is unique. A run that stalls before the level's top tier
means "not solvable at this level" and the attempt is rejected.

The solver returns a **trace**. From it come:

- **the grade**: chain length (steps that place someone or strike a whole line), top tier,
  number of tier-3 and tier-4 steps. A level is a band on these numbers, not a clue count;
- **the step text**: the engine emits only ids; `src/content/redeneer-text.js` turns a
  step into Dutch ("Fenna zat op een stoel. De enige stoel die niet naast een tafel staat,
  is die in de keuken: daar zat Fenna."), keeping *the engine knows nothing of language*;
- **dense steps for print**: consecutive steps are grouped per placement, the way the
  book's solution reads as about five dense paragraphs on its hardest boards;
- **better hints**: `extraAanwijzing` can later offer "the next step" instead of a new clue.

### 3. Board features

The engine stays language-free: it knows **types**, not names.

- **Object type and posture** per object: `blok` (nobody can stand there — today's
  furniture), `sta` (stand on: rug, mat), `zit` (sit on: chair, bench, saddle), `lig`
  (lie in: bed, hammock), `rijd` (an animal or vehicle). A typed object can occur several
  times on one board; clues refer to the type ("op een stoel") or to a unique landmark
  ("naast de vleugel"). Today every piece is unique, so the type is new data.
- **Wall features**: windows on a cell edge (`raam`), drawn on the wall, not on a cell.
- **Outdoor blockers** that clues name negatively ("not next to a tree") are `blok`
  objects with a type.
- **Special cells**: a marker per cell with a rule: `alleen` / `nietAlleen` (alone = the
  only person in that room).
- **Area classes and person attributes**: `kamerKlasse[k]` (e.g. a class-only or a
  gender-only area) and per person `klasse` and `geslacht` (gender already exists for
  names in `namen.js`: `GESLACHT_VAN`).
- **Roles**: per puzzle a few role slots (`verzamelaar` through an object, `verborgen`
  for the hidden one); clues may have a role as subject or reference point.

Content follows the existing table pattern in `kamersoorten.js`: `MEUBELS_VAN` entries
gain a type and a posture; the type must match the drawing. **"If a drawing lies, draw
it"** decides the drawing work: a `zit` piece must look like a seat a figure can sit on, a
`lig` piece like a bed, a `sta` piece like something flat on the floor, and the figure's
token is drawn *on* it without hiding it. A keuring rule in `check-kamers.mjs` fails when a
world offers a type with no honest drawing (and `OUDERWETS` still applies in
`MODERNE_WERELDEN`). Estimated drawing work, per world: see the spec (base set ~8 new
pieces shared by the old-style worlds, ~8 for the modern set, a window per board frame,
and per-world extras only where a world has animals or vehicles).

### 4. Determinism

- Every new draw has its own rng, derived from the attempt: `${seed}#kamer${t}:objecten`,
  `:rollen`, `:klassen`, `:speciaal`, `:perpersoon`. The placement draw and everything
  before it are untouched.
- Nothing is bounded by a clock. The human solver counts **technique applications**; the
  builder counts **solver steps**, like `NASNOEI_STAPPEN`. A budget that runs out
  rejects the attempt, the same way on every device.
- Progress reporting (below) reads the attempt counter; it never decides anything.
- Book-style boards get a **generator version in the puzzle id**, so links and library
  cases made before the switch keep their board (open question 1 in the spec).

### 5. Performance and resources

Measured 2026-11-17 on the PR #15 engine (Node, one core, laptop also running other
sessions; seeds `meet-0..N`): see the spec's performance section for the table. In
short: levels 1–4 build in well under a second, level 5 in 2–4 s, level 6 (16×16) is the
outlier. Building uses one CPU core at 100 % and a few tens of MB of heap.

- **Generation moves to a module Web Worker** (`new Worker(url, { type: 'module' })`, no
  build step needed) with a progress bar driven by the attempt counter and an up-front
  estimate per level. The page never freezes; a cancel button stops the worker.
- **The next puzzle is built in the background** while the player solves the current
  one, so "Volgende puzzel" is usually instant.
- **Library cases of the slow levels are pre-generated** into a JSON file in the repo,
  produced by a tool from their seeds; the keuring rebuilds them and fails on any
  difference, so the seed stays the source of truth.
- Proposed maximum build time (worst case on a mid-range phone): levels 1–3 1 s, level 4
  3 s, level 5 15 s, level 6 30 s. The keuring fails a level whose sample exceeds the
  laptop equivalent.

## Consequences

- Positive: clue style and difficulty come from one model (the trace), so "one short clue
  per person" and "five dense steps" are targets the builder aims at, not filters that
  throw attempts away.
- Positive: the printed and in-app solution text comes for free from the trace.
- Positive: build time should fall for book-style levels, because the exact counter
  leaves the inner loop. This is an expectation, not a measurement; step 1 of the spec
  measures it.
- Negative: a second builder path lives next to the old one until the old levels are
  retired, and a version segment in the id must be carried by the router and library.
- Negative: real drawing work in every world (types, postures, windows, special-cell
  marker), and the token-on-object rendering in `board-rooms.js`.
- Negative: every technique must be proven sound; a wrong technique produces a puzzle
  with two solutions that the human trace calls unique. Mitigation: the exact counter
  stays as the proof of record and the keuring cross-checks every trace.

## Alternatives considered

- **Keep tuning caps on the random grower (PR #15 path).** Measured out of reach: caps of
  2–3 fail from level 3 up, and every refused candidate costs build time.
- **Replace the engine with a SAT/CP solver library.** Faster uniqueness proofs, but a
  runtime dependency (ADR-0002), no human-readable steps, and it would not tell us which
  deduction a player needs.
- **Write the step text from the exact solver's search tree.** A backtracking tree is not
  how a person reasons; it would read as "try this, then that".
- **Hand-made puzzles.** Contradicts the product: an endless supply from a seed.
