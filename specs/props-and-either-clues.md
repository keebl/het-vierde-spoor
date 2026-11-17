# Spec: props to stand, sit or ride on, and "either" clues

Status: draft
Date: 2026-11-17 (asked by Guus the same evening: "accessoires waar personages op kunnen
staan of zitten, bv een stoel, paard, een kleed" and "aanwijzingen mogen creatiever, bv
persoon y stond in ruimte a of b"; use the book photos he sent as input)
Builds on: `specs/engine-extension.md` (approved, not started), ADR 0005

## Goal
On a room board, some pieces are no longer walls in disguise: a person can sit on a
chair, lie on a bed, stand on a rug or ride a horse, and the board shows it. The clues use
that ("Pien zat op een stoel"), and they get new shapes that make the player hold two
possibilities at once ("Joep stond in de keuken of in de serre") instead of handing her a
cell.

## Users and context
The owner's daughter (primary) and testers (`docs/PRODUCT.md`), phone and laptop, all
room levels (`mechaniek: 'kamer'`). Her verdicts so far: clues too easy, too alike, too
many per name (2026-11-16), drawings dull (2026-11-10). Guus's input (2026-11-17): eight
photos of a commercial puzzle book he owns, sent "niet namaken, hier zit copyright op".
Mechanics only; no wording, names, art, layouts or puzzles are copied.

## What the book photos show that we do not have (2026-11-17)
Read from the six photos of puzzles and worked solutions (four boards, twelve solution
pages). Only the mechanics are listed; the wording below is ours.

| # | mechanic in the photos | today in Reconstructie | where it goes |
|---|---|---|---|
| 1 | People stand **on** pieces: chairs, rugs, beds, animals to ride. Most clues are about the piece someone is on ("only person on a chair", "lay in the bed", "sat on a camel") | every piece blocks its cell (rule 2 in `rooms.js`) | **this spec**, part A |
| 2 | A **rug covers several cells** (2×1 up to 3×2); every cell of it is standable | one piece = one cell | **this spec**, part A |
| 3 | Animals are pieces: some are ridden, some only stand in the way | no animals as pieces | **this spec**, part A |
| 4 | The **token is drawn on the piece**, smaller, so both stay readable | token replaces the cell | **this spec**, part A |
| 5 | A clue combines two facts about one person ("in that room, on a camel"; "same row as a TV and in the same room") | one fact per clue | **this spec**, part B (`en`) |
| 6 | The worked solutions reason in **either/or** ("A or B must stand on row 1", "row 4 or row 7") | no either/or anywhere | **this spec**, part B (`of` clues) |
| 7 | Clues about "the only one" of a kind ("the only person on a chair") | `aantalNaast` only | **this spec**, part B (`enigeOp`) |
| 8 | Windows in the wall, "in front of a window" | none | engine-extension step 6–7 |
| 9 | Special cells ("must be alone" / "must not be alone") | none | engine-extension step 13 |
| 10 | Roles found through a piece (collector, hunter), hidden role | none | engine-extension step 14 |
| 11 | Rooms only for one class or gender; global hints ("no empty room", "exactly one person next to a cupboard") | `aantalKamer` only | engine-extension step 15 |
| 12 | Rectangular boards, fewer people than rows | square, one per row and column | engine-extension steps 6 and 16 |
| 13 | Numbered worked solution | none | engine-extension phase A |

Rows 8–13 are already approved in `specs/engine-extension.md`; this spec does not repeat
them. Rows 1–4 were a single line there (criterion 14, "posture"); this spec works them
out, because they are what Guus asked for and they carry most of the drawing work.

## Decisions (proposed; Guus decides the ones marked "open")
1. **Props are pieces with a posture.** Every entry of `MEUBELS_VAN` (base set, modern
   set and world layers) gets a posture: `blok` (default: nobody stands there, as today),
   `zit` (chair, bench, stool, throne, swing), `lig` (bed, hammock, lounger, sickbed),
   `sta` (rug, mat, stage, platform, diving board) or `rijd` (horse, pony, donkey, camel;
   in present-day worlds a bicycle, scooter, bumper car, carousel horse). A piece of
   posture other than `blok` holds at most one person, like a cell.
2. **A rug is the only multi-cell piece**, a rectangle of 2–6 cells inside one room. Beds
   and tables stay one cell (a two-cell bed is a drawing problem for later). Every cell of
   a rug is standable; "op het kleed" is true on any of them.
3. **Honest drawings only** (`CLAUDE.md`: if a drawing lies, draw it). A world offers a
   posture only where it has an honest drawing for it; the keuring fails otherwise. A
   pool gets no horse; a spaceship gets no rug unless it is drawn as a ship's mat.
4. **"Of" means one of the two, and the sentence says which kind.** For places the
   person can only be in one anyway: "Joep stond in de keuken of in de serre." For two
   people: "Ofwel Joep, ofwel Aya zat op het paard" (exactly one of them). Never a bare
   inclusive "of" between two people: a twelve-year-old reads it as exclusive, and a
   clue that means something else than it seems to say is a bug.
5. **Never "als … dan …"** (conditionals). They are the hardest shape to read and the
   book does not use them in clues either.
6. **One board shift, not two** (Guus, 2026-11-17: "Ja, in fase B"): parts A and B land
   inside engine-extension phase B (after its step 6, before its template builder in
   step 8), so every board shifts once, as decided earlier that day ("Alles verschuift").
   Building them now on today's engine was rejected: boards would shift twice.
7. **Which levels get which shape** (open, recommendation in the table under Part B).

## Part A — props on the board

### Engine (`src/engine/rooms.js`, `generate-rooms.js`)
- Rule 2 becomes: "Op een vakje met een meubelstuk staat niemand, behalve als je erop
  kunt zitten, liggen, staan of rijden." The rule list at the top of `rooms.js` and the
  player's rules (`src/content/spelregels.js`) change with it.
- `rooster.houdingOp[cel]`: the posture of the piece on that cell, `null` when empty.
  `rooster.kleedVan[cel]`: rug id for rug cells.
- The furniture placer puts 1–3 standable pieces per room on levels 1–3 and 2–5 on
  levels 4+, from the room kind's list; a rug only in a room with a free 2×2 or 3×2
  block. Its own rng: `makeRng(\`${seed}:rekwisieten\`)`, so nothing else in the seed
  sequence moves (`CLAUDE.md`: everything follows from the seed).
- "Naast een stoel" stays as it is (orthogonal, same room); "op een stoel" is new. A
  person on a chair is not next to that chair.

### New clue kinds (`SOORTEN`)
| kind | sentence (examples) | true when |
|---|---|---|
| `op` | "Pien zat op een stoel." / "Joep lag in een bed." / "Aya stond op het kleed." / "Quincy reed op het paard." | the person's cell holds a piece of that type |
| `nietOp` | "Imke zat niet op een stoel." | the person's cell holds no piece of that type (an empty cell counts) |
| `enigeOp` | "Olivier was de enige die op een stoel zat." | the person is on that type and nobody else is |
| `aantalOp` | "Er zaten precies twee mensen." / "Niemand stond op een kleed." | count of people with that posture or type |

The verb comes from the posture, not from the clue: `zit` → "zat op", `lig` → "lag in"
(bed) or "lag op" (lounger, mat), `sta` → "stond op", `rijd` → "reed op" for animals and
bicycles, "zat in" for a bumper car. The verb per piece lives with the piece in
`kamersoorten.js`, next to its name, so a world layer that renames a piece also says how
you are on it.

### Drawing (`src/ui/board-rooms.js`, `meubelkunst*.js`, `personenkunst*.js`)
- A standable piece is drawn first; the token on it is drawn at 70 % size, shifted up
  and to the right, so the piece stays recognisable under it (book row 4). The sketch
  letter and the cross of "Uitsluiten" sit on the free corner.
- A rug is one drawing over its rectangle, under the floor pattern's grout lines but
  above the floor; its cells keep their own hit areas.
- New honest drawings, at the detail level of `docs/DESIGN.md` and today's pieces:
  stool, bench, rug (three patterns), mat, hammock, horse, pony, donkey, carousel
  horse, bicycle, scooter, bumper car, swing. Chairs and beds that exist are reused
  where the drawing already shows a seat or a mattress; anything that does not gets a
  new one.
- Per world group, which standable pieces it may use: historical worlds (landhuis, noir,
  academie, kerst, halloween, catacomben) chairs, benches, beds, rugs, horse (stable,
  courtyard, garden); nature (woud, dierentuin) logs to sit on, moss mats, pony,
  donkey; present-day (`MODERNE_WERELDEN`) office chairs, sofas, mats, bicycles,
  scooters; pretpark adds bumper cars, carousel horses, swings; zwembad loungers and the
  diving board; ruimteschip and station seats and bunks only. The exact list per room
  kind is part of build step A3 and is checked by the keuring.

## Part B — new clue shapes

| kind | sentence (examples) | true when | from level (proposal) |
|---|---|---|---|
| `kamerOf` | "Joep stond in de keuken of in de serre." | the person is in one of the two rooms | 1 (replaces part of the direct `kamer` clues) |
| `typeOf` | "Pien zat op een stoel of lag in een bed." | the person is on one of the two types | 2 |
| `en` | "Aya stond in de bibliotheek, naast de open haard." / "Quincy zat op een stoel in de serre." | both halves hold; the halves are two existing kinds about the same person | 3 |
| `ofwelPersoon` | "Ofwel Joep, ofwel Imke reed op het paard." | exactly one of the two people satisfies the half | 4 |
| `nietNiet` | "Olivier stond niet in de keuken en ook niet in de gang." | neither | 2 |
| `wieOp` | "Wie op het kleed stond, stond ten noorden van Pien." | the one person on that piece or type stands north of / in the same room as / next to the other; the piece must hold exactly one person | 5 |

- `kamerOf` and `typeOf` never name two rooms or types that leave the person only one
  free cell together (the "not too easy" rule of `specs/harder-clues.md`, `minVrij`).
- `en` counts as one own clue for the one-clue-per-person rule (engine-extension
  criterion 9); it is the main tool for reaching that rule on large boards.
- `ofwelPersoon` and `wieOp` name two people and count as relational clues for the cap
  of engine-extension criterion 10.
- Every new kind gets `eval` (as today), a `propageer` for the engine-extension human
  solver, and a step text in `src/content/redeneer-text.js` ("Joep staat in de keuken of
  de serre; in de serre is alles al bezet, dus staat Joep in de keuken").
- Sentences live in `src/content/rooms-text.js`; `namenIn` learns the new fields so the
  AI-layer guard keeps working.

## Scope (in)
- Parts A and B above: engine, content, drawings, text, keuring rules.
- The player's rules text (`spelregels.js`) and the Uitleg page: one line about sitting
  and standing on pieces, one example of an "of" clue.
- Print: tokens on pieces and rugs print like the screen (checked with
  `tools/printweergave.js`, PDF in the owner's terminal).

## Non-goals (out)
- Copying anything from the book.
- Conditionals ("als … dan …"), "minstens één van" between people, clues about three or
  more people at once.
- Pieces that move, or a person on two cells.
- Multi-cell beds, tables or animals (only rugs span cells).
- The other mechanics (`grid`, `latin`).
- Everything already in `specs/engine-extension.md` rows 8–13 above.

## Acceptance criteria

Board and engine
1. Given a room board, then every piece has a posture, and a person stands on a piece
   only if its posture is not `blok`; the keuring checks this over its whole sample.
2. Given a piece of posture `zit`, `lig`, `sta` or `rijd`, then at most one person is on
   it, and for a rug at most one person per cell.
3. Given a rug, then it is a rectangle of 2–6 cells inside one room.
4. Given a room board of level 1–3, then it holds at least one standable piece in at
   least half its rooms; from level 4, at least two in at least half its rooms.
5. Given the same seed and level, then props and rugs are placed identically in Node and
   the browser, and adding them moves no other draw (own rng).

Clues
6. Given any new clue kind, when evaluated in the solution, then it is true; the keuring
   fails otherwise with the puzzle id and the kind.
7. Given a `kamerOf` or `typeOf` clue, then the two options together leave the person at
   least `minVrij` free cells for that level at the moment the clue is first needed.
8. Given an `ofwelPersoon` clue, then in the solution exactly one of the two people
   satisfies it.
9. Given a `wieOp` clue, then exactly one person is on that piece or type in the
   solution.
10. Given a clue sentence, then its verb matches the posture of the piece ("zat op" a
    chair, "lag in" a bed, "reed op" a horse); `check-regels.mjs` rejects a mismatch.
11. Given a puzzle of level 3 or higher, then at least one clue is an `op`, `enigeOp`,
    `typeOf` or `en` clue about a piece someone is on, and at least one is an "of"
    shape (`kamerOf`, `typeOf` or `ofwelPersoon`).
12. Given the victim, then no new clue names it (as since PR #11).

Drawing
13. Given a token on a piece, then the piece is still visible next to the token at
    375 px (screenshot per posture).
14. Given a world and a posture the generator may put there, then the world has an
    honest drawing for it, and a present-day world gets no `OUDERWETS` drawing; the
    keuring fails otherwise.
15. Given print, then tokens on pieces and rugs appear on paper as on screen.

## Edge cases and error states
- **A rug under a sketch letter or a cross**: the mark sits on the cell, the rug stays.
- **A standable piece next to a wall**: "naast" still means same room; a person on a
  chair against the wall is not "next to" the piece on the other side.
- **A world without a single honest standable piece** (should not happen after A3): the
  generator places none, the `op` kinds are not offered, the keuring reports the world.
- **Old saved games**: boards shift (decision 6), half-played boards restart, as at
  every earlier shift.
- **AI layer** rewriting a clue: `namenIn` covers the new fields; a rewrite that drops
  "of" or changes the verb is refused by the existing guard.

## Data and privacy
No personal data. Gender is not used by this spec.

## Design direction
`docs/DESIGN.md` and the existing board style. Standable pieces are drawn at the same
detail as today's furniture, never as flat placeholders ("minimal" is not a safe
default). The token-on-piece offset is the same in every world. Rugs use the world's
palette (`STOFFEN`), not a new colour.

## Flow and sketch
No new screens. Show it before build step A4: a sketch of one level-3 board with a
chair, a rug, a bed and a horse, a token on each, at 375 px and at desktop width, via
`/functional-design --feature props-and-either-clues`.

## Test plan
- Unit, valid input: per new kind, `eval` true in the solution over the keuring sample;
  `propageer` sound on 200 random partial boards against `telPlaatsingen`.
- Refusal: hand-made boards with a person on a `blok` piece, two people on one chair, a
  rug across a wall, a "zat op" sentence on a rug, an `ofwelPersoon` where both hold;
  the keuring fails on each with the id and rule.
- Determinism: one seed per level built twice, in Node and in the browser pane; same
  board, props and clues.
- Visual: screenshots per posture and per world group (historical, nature, present-day,
  pretpark), phone and desktop; print view via `tools/printweergave.js`.
- Regression: `npm run check:all` green, read from the `volledige keuring exit=` line;
  `check:spreiding` stays green.
- Manual: the daughter plays a fresh level-3 and level-5 board; her verdict goes into
  `STATUS.md`.

## Plan (build order)
Slots into `specs/engine-extension.md` phase B. Each step is 1–2 hours, ends green on
`npm run check:snel`, and engine steps end with a full keuring in the background.

- **A1 (with engine-extension step 6)** — posture per piece, `houdingOp`, rugs as
  rectangles, rule 2 rewritten; placer with its own rng. Tests first: criteria 1–3, 5.
- **A2 (with step 7)** — kinds `op`, `nietOp`, `enigeOp`, `aantalOp`: `eval`,
  `propageer`, sentences with the verb per piece. Tests first: criteria 6, 10.
- **B1 (with step 7)** — kinds `kamerOf`, `typeOf`, `nietNiet`, `en`; then
  `ofwelPersoon`, `wieOp`. Tests first: criteria 7–9, 12.
- **A3 (with step 9, 2 × 2 h)** — postures and verbs for every existing piece in
  `kamersoorten.js`; the new drawings; the list per room kind; keuring rule of
  criterion 14.
- **A4 (with step 9)** — token-on-piece and rug drawing in `board-rooms.js`; screenshots
  per world group at 375 px and desktop; print check. Criteria 13, 15.
- **B2 (with step 8)** — the template builder offers the new kinds per level (table in
  Part B), and criterion 11 becomes a keuring rule; measure clues per name before and
  after on `meet-0..19`.

## Open questions
1. (Answered 2026-11-17: inside engine-extension phase B, one board shift.)
2. Decision 7: the "from level" column in Part B as proposed?
3. Horses and other rideable animals: also in the historical indoor worlds (a rocking
   horse in the nursery, a horse in the stable), or only outside rooms? Recommendation:
   only where a room kind makes it honest (stable, courtyard, meadow, fairground).
