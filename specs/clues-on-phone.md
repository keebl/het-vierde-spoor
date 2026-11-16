# Spec: Reading the clues next to the board on a phone

Status: approved
Date: 2026-11-16

## Goal
A player on a phone can read what is said about a suspect and place that suspect on the
board without scrolling between the two: choosing a name in the name row shows that
name's clues right under it, and the name row with those clues stays in view over the
board.

## Users and context
The tester feedback of 2026-11-16 (`STATUS.md`, Next, first bullet, point 1): an adult on a
phone, easy puzzles, scrolled back and forth between the clues, the board and the
furniture on it, and forgot whose clue it was on the way back. The primary player
(`docs/PRODUCT.md`) also plays on a phone. Applies to the Reconstructie game type
(`puzzle.kind === 'kamer'`), the only one on the site.

### Measured today (2026-11-16, 375×812, local server on `6d3cab9`)
| | Level 1, `dader.landhuis.kamer.1.kamer-1` (5×5) | Level 4, `dader.landhuis.kamer.4.kamer-7` (9×9) |
|---|---|---|
| Name row (palette) | 836–950 px, 114 px high (names + mode row) | same |
| Board | 998–1344 px, 346 px high | 998–1343 px, 345 px high |
| First clue | 1708 px (364 px below the board) | 1707 px |
| Last clue | 2262 px (918 px below the board) | 3578 px (2235 px, 2.75 screens below the board) |
| Clues | 7 | 21, in 10 name groups |

The existing floating "Aanwijzingen (n)" button opens the clue column as a sheet over the
bottom 55% of the screen (`aanwijzingenKnop` in `src/ui/player.js`). With the board
scrolled up under it, the sheet starts at 365 px. The bottom third of a 9×9 board is
hidden, and the sheet spends ~140 px on "De vraag", so two clues are readable at a time.
Tapping a clue strikes it through.

The palette has not been sticky since 2026-11-10, because the whole bar (names plus the
mode row) lay over the board while scrolling (`.palet` in `styles/app.css`). The comment
above `personenPalet` in `player.js` still says it sticks. That comment is wrong and gets
fixed in this change.

Desktop (≥ 1100 px) already shows the clue column beside the board, sticky, grouped per
name (`.play` grid in `app.css`). That stays.

## Scope (in)
- On a narrow screen (< 1100 px, the same breakpoint as the clue sheet today): the row of
  names sticks to the top of the viewport while you scroll past the board.
- Directly under the sticky names, a **clue box** shows the clues about the chosen name:
  every clue in which that name occurs, as first or second name. The box sticks together
  with the names. It is at most about four lines high and scrolls inside itself when
  there are more.
- Choosing a name stays one tap. It shows that name's clues *and* arms it for placing,
  as today. Tapping a placed figure on the board (which already selects it) also shows
  its clues.
- In Uitsluiten or Schetsen mode, the box keeps showing the clues of the last chosen name.
- An extra chip **"Iedereen"** at the end of the name row shows the clues about nobody in
  particular (counts such as "in de keuken stonden precies twee mensen") and the fixed
  facts ("Wat vaststaat"). Choosing it does not arm anything for placing.
- Requested hints (`state.extra`) appear in the box under the names they mention, like
  any other clue.
- Tapping a clue in the box strikes it through, exactly as in the list. Both show the same
  struck state.
- **Clue numbers disappear everywhere**: phone, desktop, print, and the "V1." of the fixed
  facts. Their order means nothing to the player. The cross-reference "Staat ook in
  aanwijzing 5, 15" is replaced by the clue sentences themselves under the second name.
- The full clue list stays under the board on a phone, for overview and for print.
- The floating "Aanwijzingen" button and its sheet are hidden on the phone ("hide, do not
  delete": the code stays, the CSS takes it out of sight).
- Desktop: layout unchanged. Choosing a name scrolls that name's group into view in the
  clue column.

## Non-goals (out)
- Highlighting suspects, rooms, furniture, rows or columns on the board when a clue is
  chosen. Considered and rejected by Guus on 2026-11-16: the problem is seeing clues and
  board together, not finding things on the board.
- A "pin this clue" mode, or a gesture other than a tap to strike a clue through.
- The look of the palette itself: one row or two rows of names, a third "Plaatsen" mode
  button, and how the active mode is shown. Other sessions are changing those (tester
  points 2 and 3). This spec needs only that there *is* a row of name buttons with a
  chosen one. The mode row (Uitsluiten/Schetsen/…) does **not** stick.
- The button row under the board (Controleer, Printen, next puzzle). Another session
  owns it.
- The hidden game types (`latin` and other kinds): they keep their current clue panel.
- Changing which clues a puzzle gets, or their wording.

## Acceptance criteria
1. Given a Reconstructie puzzle at 375×812, when the player scrolls so that the board's
   top edge passes the top of the viewport, then the row of names stays visible at the
   top of the viewport.
2. Given the same, then the mode row (Uitsluiten, Schetsen, any further mode) scrolls
   away with the page and does not stick.
3. Given a chosen name, then the clue box directly under the sticky names lists every
   clue whose first or second name is that person, including requested hints, and no
   other clue.
4. Given a clue that names two people, then it appears in the box for each of them, as
   the same sentence.
5. Given a chosen person about whom no clue speaks, then the box shows the existing
   sentence "Hierover staat niets. Deze plek volgt uit de rest…".
6. Given the clue box has more clues than fit, then the box is at most about four text
   lines high (a fixed `max-height`) and scrolls inside itself, without scrolling the
   page.
7. Given 375×812 and a 9×9 puzzle (level 4), when the board is scrolled up against the
   sticky block, then the whole board and the full sticky block (names plus box) are
   visible at the same time.
8. When the player taps a name, then that name is armed for placing (as today) and the
   box shows its clues, in one tap.
9. When the player taps a placed figure on the board, then the box shows that figure's
   clues.
10. Given Uitsluiten or Schetsen is active, then the box still shows the clues of the last
    chosen name.
11. When the player taps "Iedereen", then the box shows the general clues and the fixed
    facts, and no name is armed for placing.
12. When the player taps a clue in the box, then it is struck through in the box and in
    the full list, and the strike survives a reload (same `state.struck` as today).
13. Given any puzzle on any screen width, and in print, then no clue or fixed fact shows a
    number, and no text refers to a clue by number.
14. Given a narrow screen (< 1100 px), then the floating "Aanwijzingen" button is not
    shown.
15. Given a desktop width (≥ 1100 px), then the layout is the one of today (clue column
    beside the board, sticky), and choosing a name scrolls its group into view inside
    that column.
16. Given a puzzle just opened, before any name is chosen, then the box shows the clues of
    the name that is chosen by default (`state.gekozen`, today the first name).
17. Given light and dark mode, then names, box and struck clues are legible in both
    (text tokens on their surfaces, `docs/DESIGN.md`).

## Edge cases and error states
- 16×16 puzzle: sixteen names plus "Iedereen" in the name row. Whatever the palette
  session decides (one scrolling row or two rows), the sticky part must stay low enough
  that criterion 7 holds for the board size on a phone. Measure at 16×16 as well.
- Landscape phone (812×375): the sticky block plus board cannot fit. The box may then
  shrink to two lines. The page must stay scrollable, and the sticky block must never
  cover more than half the viewport height.
- The victim ("de bestolene", `palet-lijk`) is a name in the row like the others and has
  its own clues.
- A puzzle with no general clues and no fixed facts: "Iedereen" is not shown.
- Struck clue: stays in the box, greyed and struck, as in the list. It is not hidden.
- Print: the sticky block and box do not print. The full list prints, without numbers
  (check with `tools/printproef.mjs`).
- The solved state and `specs/solved-ending.md` (not built yet): the sticky block must
  not cover the ending.

## Data and privacy
No new data. Reads the puzzle's clues and their raw form (`puzzle._ruwe`, `state.extra`).
Strike state stays `state.struck` in `localStorage`, keyed by the internal clue number,
which stays internal. Nothing personal.

## Design direction (UI features)
`docs/DESIGN.md`: tokens only (`--bg`, `--surface`, `--line-soft`, `--text-2`), pink
`--accent` only for the chosen name. Board density stays "dense inside, generous around".
The sticky block is a quiet surface with a soft line underneath, not a heavy bar: the
2026-11-10 complaint was a bar lying *over* the board. The box uses the compact clue
spacing of the desktop column (`.aanwijzingen-kolom .clue` at ≥ 1100 px). No reference
images in `design/refs/` yet; the baseline is the phone screenshots of the test plan.

## Performance budget
Choosing a name updates the box within one frame (no full re-render of the board needed
for this; `draw()` today rebuilds both, which is fine if it stays < 100 ms on a 16×16).

## Test plan
- Unit, valid input: the grouping becomes a pure function (clues per person, including
  second names and hints; general clues apart), checked from a `tools/check-*.mjs` script
  over the library: every clue lands under each person it names, and every clue lands
  somewhere (criteria 3, 4, 11).
- Refusal or failure: a person with no clues gets the "Hierover staat niets" sentence
  (criterion 5); a puzzle with no general clues has no "Iedereen" chip; clue text
  contains no number reference (criterion 13), checked by the same script over all
  library puzzles.
- Integration and contract: `perNaam` and the new box use the same grouping function, so
  list and box cannot disagree; strike state is shared (criterion 12), checked by hand.
- Security: n/a — no input crosses a boundary; clue text is set with `text`, not HTML, as
  today.
- Regression: desktop layout (criterion 15) and print (no sticky block, list prints) are
  compared against screenshots and a print PDF taken before the change.
- Sanity and smoke: `npm run check:snel` after each step, `npm run check:all` before the
  pull request (read the `volledige keuring exit=` line); after deploy, open
  https://reconstructie.app/ on a phone width and play one level-1 case to the end.
- Component / E2E and manual check: phone screenshots at 375×812 in the browser pane,
  light and dark, for `dader.landhuis.kamer.1.kamer-1` (5×5),
  `dader.landhuis.kamer.4.kamer-7` (9×9) and one level-6 case (16×16): page top, board
  scrolled under the sticky block, a long box scrolled inside, "Iedereen" chosen. Plus one
  desktop screenshot at 1440 wide and a print PDF via `tools/printproef.mjs`. Look at
  each before calling it done.

## Open questions
- Exact box height: "about four lines" is the starting point; tune on the 9×9
  screenshots so criterion 7 holds on a real phone (Safari's bars take ~150 px off 812).
- Does the tester also want this on a tablet in portrait (768–1099 px)? It gets it by the
  breakpoint; nobody has asked.

## Plan (added before building)
Approved by Guus on 2026-11-16. Each step is one commit; run `npm run check:snel` after
each, `npm run check:all` (in the background, ~12 minutes) once before the pull request.
Take the "before" screenshots and print PDF of step 0 first: they are the regression
baseline.

0. **Baseline** — no code. Phone screenshots of the three cases of the test plan (light
   and dark), one desktop screenshot at 1440 wide, one print PDF
   (`node tools/printproef.mjs`). Save them outside the repo (scratchpad); they are not
   committed. — 15 min.
1. **Grouping as a pure function, check first** — new module `src/aanwijzingen.js`
   (no DOM), exporting the per-person grouping that `perNaam` in `src/ui/player.js` does
   today: for each person index, the clues that name them as `p` *or* `q`, plus the
   general clues and fixed facts apart. Write `tools/check-aanwijzingen.mjs` first,
   loading the library the way `tools/check-catalog.mjs` does (`CATALOG`,
   `catalogSettings`, `buildPuzzle`): every clue lands under each person it names, every
   clue lands somewhere, no clue text contains a number reference. Add it to
   `tools/keuring.mjs` (it builds puzzles, so not in `--snel`) and to `package.json` as
   `check:aanwijzingen`. Then make `perNaam` use the new function. — 1.5 h.
   Criteria 3, 4, 5.
2. **Numbers out** — `cluePanel` and `perNaam` in `player.js`: drop the `clue-n` span
   for clues and fixed facts; replace the "Staat ook in aanwijzing …" line by listing the
   clue itself under the second name (from step 1); keep `clue.n` as the internal key of
   `state.struck`. Update the hint comment ("doorlopende nummers"). Remove the now-unused
   `.clue-n` rules in `styles/app.css`, including print. Check: desktop and print
   against the baseline. — 1 h. Criterion 13.
3. **The clue box and "Iedereen"** — `personenPalet` in `player.js`: an "Iedereen" chip
   after the names (not shown when there are no general clues or facts), and a box
   under the names row (not under the mode row), filled from step 1 for the chosen
   person. Add `state.leesNaam` (the last chosen person, or `'iedereen'`) so the box
   survives Uitsluiten/Schetsen (`gekozen` becomes -1 there). Set it in `zetNeer` when a
   name is chosen and where a tap on a placed figure selects it. Clue buttons in the box
   reuse `knopVoor` so strike state is shared. Keep the box's `scrollTop` across
   `draw()`, as `clueCol` already does. Fix the stale "plakt bovenaan" comment above
   `personenPalet`. — 2 h. Criteria 8–12, 16.
4. **Sticky on a phone, button hidden** — `styles/app.css`, under
   `@media screen and (max-width: 1099px)`: the names row plus the box `position:
   sticky; top: 0` inside `.boards` (so it lets go once the board has passed); the mode
   row stays static; box `max-height` of about four lines with `overflow-y: auto;
   overscroll-behavior: contain`; at `max-height: 500px` (landscape) two lines and the
   whole block capped at 50vh. Hide `.aanwijzingen-knop` there (do not delete
   `aanwijzingenKnop`). On desktop, hide the box (the column does that job). Print: hide
   the box. — 1.5 h. Criteria 1, 2, 6, 7, 14, 17.
5. **Desktop: scroll the group into view** — when `leesNaam` changes at ≥ 1100 px,
   scroll that person's `.clue-groep` into view inside `.aanwijzingen-kolom` (the
   column, not the page). — 45 min. Criterion 15.
6. **Prove it** — the screenshots and print PDF of the test plan, compared with the
   baseline; look at each. `CHANGELOG.md` under `## [Unreleased]` (Changed: clues of the
   chosen name next to the board on a phone; numbers gone). `STATUS.md`: tester point 1
   built. Set this spec to `Status: built`. — 1 h.

Risks:
- **Overlap with the palette session** (`personenPalet`, `.palet*` CSS) and the button
  row session. Build after those have merged, or rebase on them before step 3. Hook the
  box under whatever the names row turns out to be, not under a specific layout.
- **Sticky can silently fail**: any ancestor with `overflow` other than `visible`
  (`.boards`, `.play`, `main`) disables it. Check computed styles in the browser pane if
  it does not stick.
- **The 2026-11-10 complaint returns** if the sticky block grows (two name rows of 16
  plus the box). Criterion 7 on the 16×16 screenshot is the guard; shrink the box before
  adding anything.
- **`draw()` rebuilds the palette** on every tap; the box's scroll position and focus
  must survive that (same bug class as the clue column, see the comment in `draw`).
- No engine or seed change: the keuring should stay green unchanged; a red engine check
  means something outside this spec was touched.
