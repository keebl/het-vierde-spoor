# Spec: four modern worlds and a shared modern furniture set

Status: approved (2026-11-10: four worlds, escape room as the "maze", shared modern set
also in existing worlds, everything released together)
Date: 2026-11-10

## Goal
The player (the owner's ten-year-old daughter) finds the worlds and objects too old-fashioned.
She gets four new, modern worlds to play in, and the modern worlds that already exist get
contemporary objects next to the ones they have. Nothing existing is removed.

## Users and context
The daughter, on a phone and a laptop, at home. She does not choose the world: "Begin nieuwe
puzzel" picks one from the seed (`wereldVoorSeed` in `src/puzzle.js`). New worlds therefore
show up simply by playing; the library (`#/puzzels`) can also list fixed cases in them.

## Phase 1 — make the existing modern worlds honest (do this first)

Reported by the owner on 2026-11-10 after the restyle: "modern colours with old icons — a
knight in a spaceship and an old-fashioned mirror, that cannot be". Audit of what each world
can actually put on a board (`meubelsVoor` over its room kinds and fallbacks):

- **station**: ~38 slots renamed but still drawn as a 1930s manor piece — `het ruimtepak` is
  the knight's armour, `de tijdzuil` the grandfather clock, `de antennemast` the scarecrow,
  `de druktank` the oak barrel, `het wandscherm` the gilt mirror, `de warmtecel` the hearth,
  `de persoonlijke locker` the steamer trunk, `het ankerblok` a tree stump, and so on.
- **ziekenhuis / kantoor**: `de spiegel bij de lift` / `de liftspiegel` are the antique
  cheval mirror; `het linnenrek` is the wine rack; `het olievat` the oak barrel; `de
  omgevallen parasol` a fallen log; `de terrasbrander` a campfire.
- **school**: `de kledingkist` (steamer trunk), `de zoutton` (barrel), `de schoolklok`
  (pendulum clock), `de stapel stoeptegels` (log pile).
- **zwembad**: `de chloorton` (barrel), `de stapel ligbedden` (log pile), `de barbecue`
  (campfire), `de zwemtas` (trunk), `de slippersmand`, `de handdoekplank` (already noted in
  `HANDOFF.md`).

Constraint that shapes the fix: every room kind supplies exactly 18 names (6 own + 12 from
two related kinds), and `buildKamerPuzzle` caps furniture at the scarcest kind
(`maxMeubels = min(20, krapste)`). Dropping a piece lowers that cap and **changes every
existing board in that world**. So each lying slot is swapped one-for-one for an honest
modern drawing — never removed. About 22 modern drawings already exist and are unused in
the station (screen, locker, office chair, vending machine, radiator, column clock, waste
container, …); the rest must be drawn: an estimated **25–30 new modern pieces** across the
five worlds, which become the shared modern set below.

Phase 1 is built first, but the owner chose (2026-11-10) to release everything together:
phase 1 and the four new worlds go live in one push, after one full keuring.

## Scope (in)
Four new worlds, each complete in the same way as the most recent pair (`zwembad`,
`dierentuin`):

| id | Name (working title) | Feel | Light |
|---|---|---|---|
| `ruimteschip` | Het Ruimteschip (name to be chosen) | A ship *travelling*: cockpit, hyperdrive core, sleep pods, cargo bay, holodeck, mess hall, airlock. Neon, motion, starfield streaks — clearly not the static `station`. | night/space |
| `stad` | Moderne stad | Skyscraper flat with game room, metro station, shopping mall, rooftop terrace, skatepark, food court, cinema. | evening, lit windows |
| `escaperoom` | Escape room | A modern escape-room venue: code-safe room, laser corridor, mirror hall, lab room, lobby, control room. | indoor, coloured light |
| `pretpark` | Pretpark / festival | Roller coaster, haunted house, food trucks, stage, bumper cars, ticket booth, Ferris wheel. | daylight |

For **each** world, everything a world currently has:
- the world entry in `src/content/worlds.js` (names, roles, victims, objects, places,
  times, hidden things, leads, `gestolen`, accent colour);
- room kinds and floors (`kamersoorten.js`: `WERELDVLOER`, `VLOER_VAN_PLEK`, the world layer
  with `zelfde`/`anders`, `WERELDSTOF`, the fallback table);
- **newly drawn furniture** for everything that is not genuinely the same object as an
  existing drawing, in `meubelkunst-geschilderd.js` (plus the flat base drawing in
  `meubelkunst.js` that `check-kamers.mjs` requires);
- a board frame (`bordrand.js`, `RANDSTIJLEN`), an atmosphere drawing (`scenes.js`),
  wall material and light colour (`app.css`), a dark palette (`body[data-thema="donker"]
  [data-wereld=…]`);
- an icon for every new word (`icons.js`, `iconen.js`) — `check-iconen.mjs` must pass;
- fixed cases in the library: at least one per world (`src/content/catalog.js`).

**Shared modern set**: about 15 newly drawn pieces — laptop, gaming chair, flat-screen TV,
game console, beanbag, modern sofa, smart fridge, coffee machine, projector, standing desk,
charging station, vending machine, monitor wall, speaker, LED floor lamp — **added** to the
room kinds of the existing modern worlds (`school`, `kantoor`, `ziekenhuis`, and where they
fit `zwembad`/`dierentuin`) and used by the new worlds. Existing pieces stay.

## Non-goals (out)
- Redrawing or removing the 1930s base set (direction 2 of `visual-liveliness.md` stays a
  separate decision).
- New portraits or hairstyles (direction 4).
- Letting the player choose a world.
- Image files of any kind.
- A new game mechanic for the escape room or a maze-shaped board: it is a setting, the
  puzzle stays a Reconstructie.

## Acceptance criteria
Phase 1:
P1. `kamersoorten.js` has a named list of old-fashioned drawings (at least: harnas,
    staandespiegel, wandspiegel, haard, staandeklok, gangklok, hutkoffer, vat, kolenkist,
    wastafel, vogelverschrikker, put, houtstapel, vuur, stam, boomstronk, regenton,
    chronometer, zandloper, distilleerketel, kruidenkast, slijpsteen, voetenbank).
P2. `check-kamers.mjs` fails with a named error when `station`, `school`, `ziekenhuis`,
    `kantoor` or `zwembad` can place a drawing from that list on a board.
P3. That check passes on `main`.
P4. `maxMeubels` per world is unchanged (18 for the five, 10 for `zwembad`'s pool), so
    existing boards keep their layout.
P5. Every new drawing passes the drawing rules in `check-kamers.mjs` and is used in at least
    one world.
P6. A rendered legend of each of the five worlds, reviewed by eye, shows no piece whose
    drawing contradicts its name.

New worlds:
1. `WORLDS` contains `ruimteschip`, `stad`, `escaperoom` and `pretpark`, and all 13 existing
   worlds are unchanged in id and content.
2. For each new world, `npm run check:all` reports all seven checks green, including the
   sweep over every assignment × world × game type × level.
3. Every new world produces a solvable, uniquely solvable puzzle at levels 1 to 6.
4. `check-iconen.mjs` reports zero words without an icon.
5. `check-kamers.mjs` passes, and no room in a new world receives a furniture piece whose
   drawing shows a different object than its name (reviewed per world against a rendered
   legend, not only by the check).
6. Every new world has its own board frame, atmosphere drawing, floor tint, wall colour and
   dark palette; none falls back to `STANDAARD` (the manor frame).
7. The ~15 shared modern pieces are each drawn once, pass `check-kamers.mjs`, and appear on
   boards of `school`, `kantoor` and `ziekenhuis` alongside the existing pieces.
8. An existing puzzle URL (it contains its world id) renders the same board as before the
   change.
9. The library shows at least one fixed case per new world, and each is solvable.
10. In each new world, light and dark, phone (375 px) and desktop, the page has no
    horizontal scroll and the board, room names and tokens are legible (screenshots).

## Edge cases and error states
- **The seed → world mapping shifts.** `wereldVoorSeed` takes the seed modulo the number of
  worlds, so after adding four, a new random seed lands in a different world than it would
  have. Existing links are safe (the world is in the URL); only never-yet-made puzzles
  change. Accepted.
- **Furniture budget per room kind.** `buildKamerPuzzle` computes how many pieces the
  scarcest kind can supply; a world with few pieces per kind fails with "geen meubilair
  meer voor …". Each new kind needs enough pieces for a 16×16 board.
- **Water or other special floors** (e.g. a pool in the theme park): needs its own kind, as
  `bad` did, or furniture from the lawn ends up in the water.
- **Dutch words**: names, rooms and objects must read naturally in every clue template
  (`randZin`, `hoekZin`, `sameRoom`, articles).
- **Keuring run time** grows with each world (the sweep is ~12 minutes now); start it in the
  background.

## Data and privacy
No new data. Content is static text and drawings. No personal data.

## Design direction (UI features)
`docs/DESIGN.md` does not exist; the reference is the cheerful style from
`specs/visual-liveliness.md` and the existing painted engine (`geschilderd.js`, `vormen.js`):
new furniture is drawn at the same detail level as the current painted set, light from the
top left, built from the shape vocabulary, not flat icons. Modern means: clean shapes,
screens that glow, bright plastic and fabric colours, LED accents.

## Performance budget
A 16×16 board in a new world renders no slower than the slowest existing world (measure the
render time of `renderKamerbord` before and after).

## Test plan
- Automated: `npm run check:snel` during the work, `npm run check:all` before release.
- Manual: for each new world a puzzle at level 1 and level 6, light and dark, phone and
  desktop, screenshot; open the legend ("Wat er op het bord staat") and check every piece
  against its name.
- Measurement: show her the four worlds and write down which one she likes and why.

## Open questions
- Final Dutch names for the four worlds (working titles above). Suggestions are welcome; if
  none, I propose them in the first build step.
- Does the escape room need a "time is ticking" mood (countdown clock in the frame), or is
  that too stressful for her? Default: yes, as decoration only.

## Plan (added before building)
Work on a branch (`feat/modern-worlds`); nothing reaches `main` until step 14 — pushing
`main` is deploying. Run `npm run check:snel` after every step, commit after every step.

1. **Old-fashioned list and its check** — `src/content/kamersoorten.js` (export
   `OUDERWETS`, `MODERNE_WERELDEN`), `tools/check-kamers.mjs` (new error
   `OUDERWETSE TEKENING IN MODERNE WERELD`). Test first: the check must go red and list
   every offending slot from the audit. Commit the check with the list of offenders in the
   commit body; keep the branch red until step 5. — 1 h
2. **Swap with drawings that already exist** — the five world layers in `WERELDMEUBELS`.
   Use the free modern drawings (radiator, bureaustoel, klokzuil, beeldscherm, archiefkast,
   lockerkast, brandblusser, wachtbank, afvalcontainer, prullenbak, balie, automaat,
   koffieautomaat, rolkar, dossierrek, douchepaal, …) wherever the name honestly matches;
   rename the slot when needed (`'het harnas': ['de brandblusser', 'brandblusser']`).
   Write down what is still red: that is the drawing list for steps 3–5. Measure
   `maxMeubels` per world before and after (scratch script over `meubelsVoor`); it must not
   change. — 1–2 h
3. **Draw modern pieces, batch 1 (~10)** — `src/ui/meubelkunst-geschilderd.js` (painted,
   built from `vormen.js`, light from the top left, same detail level as `lockerkast`,
   `automaat`, `serverrek`), plus the flat base in `src/ui/meubelkunst.js`. Render all
   drawings on a scratch gallery (import `GESCHILDERD` + `tekenGeschilderd` in the browser
   console) and look at them at 44 and 68 px before using them. Candidates: laptop desk,
   gaming chair, flat-screen TV, game console, beanbag, modern sofa, smart fridge,
   projector, standing desk, charging station, monitor wall, speaker, LED floor lamp,
   space-suit rack, oxygen tank, hologram table, crew bunk, airlock door, storage drum
   (plastic), robot vacuum, water cooler, glass display case. — 2 h
4. **Batch 2 (~10)** — same files. — 2 h
5. **Batch 3 and close phase 1** — remaining drawings, finish the swaps; `check-kamers`
   green; legend of each of the five worlds rendered and reviewed by eye (P6). — 2 h
6. **`ruimteschip`: content** — `worlds.js` entry, `SOORT_VAN` for its places,
   `WERELDVLOER`, `WERELDSTOF`, `WERELDMEUBELS` (`volledig: true`), `WERELDVERWANT`,
   new room-specific drawings, icons in `icons.js`/`iconen.js` until `check-iconen` is
   green. Follow the `zwembad` commit history as the template. — 2 h
7. **`ruimteschip`: look** — `bordrand.js` frame (`RANDSTIJLEN`), `scenes.js` drawing,
   wall and light colours and dark palette in `app.css`. Screenshot level 1 and 6. — 2 h
8. **`stad`: content** — as step 6. — 2 h
9. **`stad`: look** — as step 7. — 2 h
10. **`escaperoom`: content** — as step 6; the countdown clock is decoration in the frame
    only. — 2 h
11. **`escaperoom`: look** — as step 7. — 2 h
12. **`pretpark`: content** — as step 6; a pond or water ride needs the `bad` approach (own
    kind, no fallback), never lawn furniture in water. — 2 h
13. **`pretpark`: look** — as step 7 (daylight: frame with `dag: true`). — 2 h
14. **Library, shared set, release** — at least one fixed case per new world in
    `catalog.js`; shared modern pieces added to `school`/`kantoor`/`ziekenhuis` room kinds
    (keeping 18 per kind); `npm run check:all` green (background, ~20 min with four more
    worlds); screenshots light/dark × phone/desktop for all four; `HANDOFF.md`; merge to
    `main`, push, verify live. — 2 h

Risks:
- **`maxMeubels` drift** shifts existing boards; guarded by measuring in step 2 and by the
  one-for-one rule. Consider adding the per-world value as a check in step 1.
- **Drawing quality** is the real cost: ~25–30 phase-1 pieces plus ~10 per new world.
  Look at each one at board size; a drawing that is not clearly the named thing is the bug
  this project keeps making.
- **Keuring run time** grows by about a third; always in the background.
- **Seed → world mapping** shifts for new random puzzles (accepted, see edge cases).
- **Dutch grammar** of new names in every clue template; read a generated puzzle per world.
