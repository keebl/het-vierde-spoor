# Spec: undo, and sketch letters that know when they are impossible

Status: approved
Date: 2026-11-16 (approved by Guus the same day: "Akkoord, bouw maar" — all four recommendations D1–D4)

## Goal
Two player wishes from the daughter's second round of feedback (`STATUS.md`, Next,
"Daughter, second round, 2026-11-16", points (b) and (c)): a pencil letter stops showing
where a placed figure has made it impossible, and one tap (or Ctrl/Cmd+Z) takes back the
last thing she did on the board.

## Users and context
The owner's daughter (`docs/PRODUCT.md`), on a phone and a laptop, while solving a
Reconstructie (`kind: 'kamer'`) puzzle. Everything lives in the player, `src/ui/player.js`;
the board drawing is `src/ui/board-rooms.js`.

Today:
- Sketch letters are `state.schets[cel]` (a sorted list of figure indexes), toggled in
  `zetNeer` in Schetsen mode. Placing a figure deletes the letters of the cell it lands on
  and nothing else.
- Automatic crosses ("Kruisjes vanzelf") are not stored: `renderKamerbord` derives them
  from `state.plaats` on every draw. Own crosses are `state.kruis`.
- There is no history; a mistake is undone by hand.

## Scope (in)
- **(b) Sketch letters.** When figure P stands on cell X, a letter is impossible and is
  not shown:
  1. P's own letter in every other cell (P stands in one place);
  2. every letter in cell X (X is taken);
  3. every other figure's letter in X's row and X's column (one suspect per row and
     per column).
- **(c) Undo.** A "Terug" button (arrow back) and Ctrl/Cmd+Z undo the last board action:
  place, pick up (remove from the board), sketch a letter on or off, own cross on or off.
  The automatic crosses of a placement come and go with it, because they are derived.
- The history is part of the saved state per puzzle, so it survives a reload.

## Non-goals (out)
- Redo (Ctrl/Cmd+Shift+Z). Can be added later; not asked for.
- Undoing non-board actions: choosing a name or a mode, striking a clue, Hint, Controleer,
  Oplossing, Begin opnieuw, the two switches under the board.
- Undo for the other puzzle kinds (assign, latin): they are not shown to players.
- Un-solving: undoing after the puzzle is solved does not make it unsolved
  ("opgelost blijft opgelost", as `BORDVERSIE` already says).

## Decisions (approved 2026-11-16)
- **D1 — hide or delete.** Recommendation: *hide* impossible letters at draw time (derived,
  like the automatic crosses), not delete them from `state.schets`. Picking the figure up
  again brings the letters back, so trying a figure somewhere costs no notes. Also drop
  today's delete of the cell's letters on placement, for the same reason.
- **D2 — the switch.** Recommendation: "Kruisjes vanzelf" off also turns off cases 1 and 3
  (the board deduces nothing for you). Case 2 always applies: a figure covers its cell.
- **D3 — history size.** Recommendation: at most 30 steps per puzzle, stored with the
  progress; the stored history is dropped when the puzzle is solved, revealed or reset
  (localStorage holds up to 120 puzzles and a failed write loses all progress).
- **D4 — place.** Recommendation: the button sits at the end of the mode row under the
  names (Neerzetten · Schetsen · Uitsluiten · ↶ Terug), styled as an action, not a mode,
  and disabled when there is nothing to undo.

## Acceptance criteria
1. Given P placed on X, then P's sketch letter is not drawn in any other cell.
2. Given P placed on X, then no sketch letter is drawn in X.
3. Given P placed on X, then no letter of another figure is drawn in X's row or column.
4. Given P is picked up again, then the letters hidden by 1–3 are drawn again (D1).
5. Given "Kruisjes vanzelf" is off, then 1 and 3 do not apply; 2 still does (D2).
6. Given a placement, when Terug is tapped, then the figure is off the board, its
   automatic crosses are gone and any letter it hid is back.
7. Given a figure picked up from the board, when Terug is tapped, then it stands on its
   cell again.
8. Given a sketch letter or own cross toggled, when Terug is tapped, then it is toggled back.
9. Given a click that changes nothing on the board (choosing a name, choosing a mode,
   tapping a figure to pick it), then no undo step is recorded.
10. Given focus is not in a text field, when Ctrl+Z (Cmd+Z on a Mac) is pressed, then the
    same happens as tapping Terug; the browser's own undo is not triggered.
11. Given nothing to undo, then Terug is disabled and Ctrl/Cmd+Z does nothing.
12. Given three actions and a reload, when Terug is tapped three times, then the board is
    as it was before the first of them (D3).
13. Given Begin opnieuw or Oplossing, then the history is empty.
14. Given 31 actions, then only the last 30 can be undone (D3).
15. Given a solved puzzle, when Terug moves a figure off, then the puzzle stays solved and
    the ending sheet is not shown again.
16. On a 390 px wide screen the mode row with Terug fits on one line without horizontal
    scrolling.

## Edge cases and error states
- localStorage unavailable or full: undo works in memory for the page's life; saving fails
  silently as it does today.
- Saved state from before this change (no `geschiedenis`): starts with an empty history.
- Saved history of an older board version: dropped together with the rest (`BORDVERSIE`).
- Undo after the player navigates to another puzzle: each puzzle has its own history; the
  keyboard listener is removed when the player is no longer on the page.
- Undo of a step that moved the chosen figure: the chosen name stays what it is now.

## Data and privacy
Adds `geschiedenis` (a list of up to 30 board snapshots: `plaats`, `kruis`, `schets`) to
the existing per-puzzle progress in localStorage (`vierdespoor.v1`). Nothing personal,
nothing leaves the device.

## Design direction (UI features)
Matches the existing mode buttons in `.palet-standen` (`styles/app.css`): same height
and radius, an arrow glyph in the token, the word "Terug"; outlined, never filled, because
it is not a mode. No new colours.

## Flow and sketch (UI features)
Show it: n/a — no new screen or route; one button in an existing row and a change in what
the board draws. Screenshots on phone and desktop width in the PR instead.

## Performance budget (when it matters)
Undo redraws once, same cost as a click on the board (< 100 ms).

## Test plan
- Unit, valid input: n/a as automated test — the player has no unit-test harness (the
  keuring tests engine and content). Covered by the manual check below.
- Refusal or failure: criteria 9, 11 (nothing recorded / nothing to undo), 13, and the
  missing-`geschiedenis` and storage-unavailable edge cases, checked in the browser pane.
- Integration and contract: the saved-state shape — an old save without `geschiedenis`
  loads; a reload restores the history (criterion 12).
- Security: n/a — no new input crosses a boundary; the saved state is read with the
  existing defaults (`Array.isArray` guard as for `extra`).
- Regression: `npm run check:all` stays green; the existing placement, pick-up and
  automatic-cross behaviour is unchanged apart from criteria 1–5.
- Sanity and smoke: `npm run check:snel`; after merge, the "Verify" step of
  `docs/RELEASE.md`.
- Component / E2E and manual check: in the browser pane, every criterion above on one
  puzzle at desktop width and at 390 px; screenshots of both in the PR.

## Open questions
- None; D1–D4 approved as recommended.

## Plan (added before building)
1. Sketch hiding — `src/ui/board-rooms.js` (the schetsletters loop next to the derived
   crosses): skip a letter when its figure stands elsewhere, or another figure stands in
   its row or column, unless `opties.kruisjesVanzelf === false`; `src/ui/player.js`
   `zetNeer`: stop deleting the cell's letters on placement. Update the "Hoe je dit bord
   bedient" text. Check by hand in the browser pane. ~1 h.
2. Undo — `src/ui/player.js`: a board snapshot (`plaats`, `kruis`, `schets`) before each
   board click in `onCell`, pushed only when the board changed; `actions.terug`; the
   history in `persist` and `bewaardeStand` (`Array.isArray` guard, cap 30, dropped once
   solved / on reveal and reset); a Ctrl/Cmd+Z keydown listener removed when the player is
   gone (the `beforeprint` pattern); the Terug button at the end of `.palet-standen` with
   its CSS in `styles/app.css`. ~1.5 h.
3. Verify — every acceptance criterion in the browser pane at 390 px and desktop width,
   `npm run check:snel`, `npm run check:all` in the background, CHANGELOG line, PR. ~1 h.

Risks: the mode row overflowing on a phone (criterion 16); localStorage size (capped and
dropped on solve); a keyboard listener that outlives the player.
