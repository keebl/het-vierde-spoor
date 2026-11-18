# Spec: Level path

Status: approved (Guus, 2026-11-18)
Date: 2026-11-18

## Goal
Give the player a route of about 100 fixed puzzles that gets harder very slowly, from 5×5 to
16×16, in the style of a mobile puzzle game's level map. Each stop is unlocked by solving the
previous one and earns one to three stars.

## Users and context
The owner's daughter (primary) on phone and laptop, and anyone with the link. Today she picks
one of six levels; the jump between levels (for example 9×9 to 12×12) is large. The path
gives her a "next step" that is always only a little harder. Web only, `localStorage` per
browser.

## Scope (in)
- **A new page "Het pad"** (`#/pad`) in the menu: a winding path of numbered stops. Each stop
  shows its board size, its stars (0–3) and a lock when it is not open yet. The current stop
  is highlighted and the page scrolls to it.
- **The front page** gets a large button above the level picker: "Verder op het pad ·
  stap 14". Before any progress it reads "Begin het pad". The level picker and its
  second-click start stay as they are.
- **About 100 stops, fixed for everyone.** Stop k has a fixed seed and fixed generator
  settings, so stop 14 is the same puzzle on every device.
- **Very gradual difficulty, including in-between sizes.** Board sizes run 5, 6, 7, 8, 9,
  10, 11, 12, 13, 14, 16, with about 9 stops per size. Within a size, the early stops use
  stronger clues and fewer rooms, and the late ones approach the next size. Elimination
  only (`shallow`) up to 8×8. From 9×9, assumption and contradiction (`deep`), with an easy
  first deep stop.
- **Measured order.** A tool builds every stop offline, has the human solver
  (`src/engine/redeneer.js`) measure each stop's difficulty, and checks that difficulty
  never falls by more than a set tolerance from one stop to the next. Stops that break
  this are re-drawn with another seed. The result is committed as data
  (`src/content/pad.js`: per stop the settings and the seed, plus whatever the stored form
  of big boards needs, following the phase B pool).
- **Locking.** Stop k+1 opens when stop k is solved by the player. Using Hint still counts;
  using Oplossing does not, and that stop must be played again.
- **Stars.** 3 stars for no Hint and no Controleer; 2 for exactly one of the two, used once;
  1 for anything more. Replaying a stop can raise its stars, never lower them.
- **The closing sheet on a path stop** shows the stars earned and a "Volgende stap" button
  in place of "Volgende zaak". The "one level harder" suggestion from #23 does not appear
  there, because the path itself is the next step.
- **End of the path.** After the last stop, the page shows "Je bent aan het eind van het pad"
  with a button to Monsterlijk free play.

## Non-goals (out)
- **Accounts and progress across devices.** Guus wants Google sign-in, so that becomes its
  own spec (`specs/accounts-and-sync.md`). It changes two product non-goals (no accounts, no
  gameplay server) and needs a backend and an account-deletion flow. This spec keeps
  progress in one versioned `localStorage` key, so a later sync can take it over unchanged.
- An endless path, lives, timers, energy, or anything that makes you wait or pay.
- Changing the six levels or the library. Free play stays as it is.
- Choosing the setting per stop (it follows from the seed, as everywhere).

## Acceptance criteria
1. Given no progress, when the player opens `#/pad`, then stop 1 is open and every other
   stop shows a lock.
2. Given stop k is solved without Oplossing, when the path is shown, then stop k+1 is open.
3. Given stop k was finished with Oplossing, when the path is shown, then stop k+1 stays
   locked and stop k shows no stars.
4. Given a locked stop, when its URL is opened directly, then the page shows the path with
   that stop locked and a link to the current stop, not the puzzle.
5. Given a stop solved with no Hint and no Controleer, when it closes, then it shows 3
   stars. One Hint or one Controleer gives 2 stars; more than one use in total gives 1.
6. Given a stop has 3 stars, when it is replayed and solved with 1 star, then it still shows
   3 stars.
7. Given the same stop number on two devices, when it is built, then the board, the clues
   and the setting are identical.
8. Given the committed path data, when the keuring runs, then every stop has exactly one
   solution, the human solver solves it with no wrong strike, and measured difficulty never
   drops by more than the tolerance from one stop to the next.
9. Given stops 1 up to the last 8×8 stop, when the keuring runs, then each one solves by
   elimination alone.
10. Given progress at stop 14, when the front page loads, then the button reads "Verder op
    het pad · stap 14" and opens stop 14.
11. Given the last stop is solved, when the path is shown, then the end message and the
    Monsterlijk button appear.
12. Given a path stop on a phone (375 px wide), when the page loads, then the path fits the
    width with no horizontal scroll and the current stop is in view.
13. Given every stop on the path, when the keuring builds them, then the board sizes in
    path order never decrease.

## Edge cases and error states
- **Corrupt or old progress key:** treat it as no progress. Keep the bad value under a
  backup key, never throw.
- **Path data changes in a later release, with stops re-drawn:** progress is stored by stop
  number, and stars stay with the number. A stop whose puzzle changed is not reset.
- **`localStorage` blocked (private mode):** the path works for the session, and a single
  line says progress will not be saved.
- **Slow build of a big stop:** use the phase B Worker with its progress bar, or the stored
  board, so no build blocks the page.
- **Opening a stop's puzzle from the library or a shared link:** it plays as a normal
  puzzle. Progress counts only when it was opened from the path (the `#/pad/<k>` route).

## Data and privacy
One new `localStorage` key, `vierdespoor.pad`: `{ versie: 1, stappen: { "<k>": { sterren:
0–3, opgelost: bool } } }`. No personal data, nothing leaves the device. Hint and Controleer
counts per path stop are kept in the existing per-puzzle state until the stop is solved.

## Costs and load
- CI minutes: Linux, about 1–2 minutes more per run for the path check, which builds or
  loads 100 stops. macOS: none.
- API calls and paid services: none.
- Hosting plan: none. The path data is a static file of tens of kB.
- Mac load: a one-off offline run of the path tool, probably 30–90 minutes for the big
  stops (through `~/.claude/bin/heavy`), repeated only when the generator changes.

## Design direction (UI features)
Playful and creative (Guus, 2026-11-18). He allows Draw Things images (`/image`) for the path.
That conflicts with the product non-goal "No image files. Everything visible is drawn in
code" in `docs/PRODUCT.md`. The build session puts this to Guus as a card before adding any
image file: an exception for the path backdrop only, recorded in PRODUCT.md, or drawn in
code.
`docs/DESIGN.md` applies: the existing colourful, drawn style with the level colours of the
picker (`--pop-1..6`). The path is drawn in SVG, with no image files, at the same level of
detail as the board miniatures. Each stop is a round token in the colour of its board size,
with stars below it. The section where the size changes gets a small drawn sign ("8 bij 8").
No reference image yet: the sketch round will settle it.

## Flow and sketch (UI features)
Flows and screens: `docs/UX.md` (parts marked "level path"). Sketch:
`design/prototype/level-path/index.html`. Walkthrough 2026-11-18, verdict "Goedgekeurd". Answers: path button above the
levels; stars above the portrait on the closing sheet. On direction (top-down vs climbing)
he did not choose, and asked instead: "maak het wel een beetje creatief en speels gebruik de
drawthings optie als je leuke afbeeldingen nodig hebt". The build keeps top-down (the
recommendation) and makes the path playful in the visual half.

## Performance budget (when it matters)
- The path page draws in under 300 ms on a laptop, without building any puzzle.
- Opening a stop up to 9×9 takes the same time as today. Bigger stops follow the phase B
  Worker budget or load a stored board.

## Test plan
- Unit, valid input: star rule (0/1/2+ uses), unlock rule, progress-key read and write, and
  the end of the path.
- Refusal or failure: Oplossing does not unlock (criterion 3), a locked stop's URL is
  refused (criterion 4), a corrupt key falls back to no progress, and blocked storage still
  plays.
- Integration and contract: a keuring check `check:pad` covers every stop for uniqueness,
  the human solver, the difficulty tolerance, non-decreasing sizes and `shallow` up to 8×8
  (criteria 8, 9 and 13), plus fingerprints of all stops so a builder change that moves a
  stop is seen.
- Security: n/a. No input crosses a boundary except `localStorage` and the route number,
  both of which are validated (number in range, schema of the key).
- Regression: n/a. This is new behaviour; the existing `check:redeneer` fingerprints guard
  free play.
- Sanity and smoke: `npm run check:snel` and `check:pad` locally. After deploy, open
  `#/pad`, solve stop 1, and see stop 2 open with stars.
- Component / E2E and manual check: screenshots of the path page at 375 px and at desktop,
  in light and dark mode, plus the closing sheet on a path stop.

## Open questions
- The difficulty measure: which number from the human solver (steps, deepest assumption,
  share of eliminations) best matches how hard it feels? Proposed: calibrate on the
  existing levels and take a weighted step count. To settle in plan step 1.
- In-between sizes (8, 10, 11, 13, 14) need generator settings and enough furniture names
  per world (the 20-name cap that phase B found). Phase B's denser-board work decides
  whether that is enough.

## Plan (added before building)
Builds only after engine-extension phase B is merged.

1. **Difficulty measure.** Run `redeneer.js` over the keuring sample per level and pick the
   measure that orders levels 1–6 and the existing library correctly. Files:
   `tools/meet-zwaarte.mjs`. Write the ordering test first. About 2 h.
2. **Settings for in-between sizes.** Add interpolated generator settings for 8, 10, 11, 13
   and 14, with room count, furniture share and clue weights, following `KAMER_LEVELS`.
   Files: `src/engine/difficulty.js`. The test (each size builds 20 unique boards) comes
   first. About 2 h.
3. **Path tool and data.** `tools/pad.mjs` draws seeds per stop, measures difficulty,
   re-draws stops that break the order and writes `src/content/pad.js`. Big stops are stored
   as in the phase B pool. About 2 h, plus the offline run.
4. **`check:pad`** with criteria 7, 8, 9 and 13, and fingerprints. About 1 h.
5. **Progress and stars.** `src/ui/state.js` (key `vierdespoor.pad`), counting Hint and
   Controleer per stop in `player.js`, and the unlock rule. Unit tests for criteria 2, 3, 5
   and 6 come first. About 2 h.
6. **Path page.** `src/ui/pad.js`, the `#/pad/<k>` route in `src/main.js` and the menu link,
   with an SVG path that is responsive (criteria 1, 4, 11 and 12). About 2 h.
7. **Front-page button and closing sheet.** `home.js` and `ontknoping.js` (criterion 10,
   stars, "Volgende stap"). About 1 h.
8. **Screenshots and the full keuring.** About 1 h.

Risks: in-between sizes may not build cleanly with only 20 furniture names, which depends
on phase B. The difficulty measure may not match how hard a puzzle feels, so Guus plays
stops 1–20 before the release. A later builder change moves stops; the fingerprints catch
that, and progress stays by number.
