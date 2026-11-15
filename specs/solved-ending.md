# Spec: an ending when the puzzle is solved

Status: approved
Date: 2026-11-15 (approved by Guus the same day)

## Goal
When the player places the last figure correctly, the game gives her a payoff: a sheet
slides over the board with the answer figure's portrait and name, one closing line that
fits the case, and a button to the next case — so solving a puzzle feels like closing a
case instead of reading a green line of text.

## Users and context
The owner's daughter (`docs/PRODUCT.md`), on a phone and a laptop, at the moment she
finishes a Reconstructie puzzle. Today the only feedback is the note
"Opgelost. Het antwoord: …" under the board (`src/ui/player.js`, `onCell` and
`actions.check`), and `STATUS.md` names the missing payoff as both the biggest gap and a
product risk ("the one player loses interest").

## Decisions from the interview (2026-11-15)
- **Form:** a sheet (dialog) over the board, not a separate page and not an inline card.
  Closing it shows the solved board again.
- **Content:** the answer figure's portrait (large) with name and role word
  (`zaak.antwoordwoord`: de dader / de laatste getuige / de dief), and one short closing
  line per case type. No time, no hint count, no victim portrait.
- **Next case:** a puzzle from the library opens the next *unsolved* library case of the
  same level; if all are solved, or the puzzle was generated, a new random puzzle of the
  same level (the same id recipe as the start button on the home page).
- **Solution requested** (`state.onthuld`): a quieter version — portrait and name, no
  closing line, no celebration, a line inviting her to try the next one herself. The
  next-case button stays.
- **Reopening a solved puzzle:** the sheet appears every time a solved puzzle is opened.
- **Motion:** short and lively — sheet slides in, the portrait pops, a handful of
  confetti shapes in the `--pop-*` colours, all drawn in code, under one second, and none
  of it under `prefers-reduced-motion`.

## Scope (in)
- An ending sheet for `kind: 'kamer'` puzzles (the only visible game type), opened when
  the puzzle becomes solved by placing figures (`onCell`), by Controleer finding it
  complete (`actions.check`), by a hint that completes it, by Oplossing (`actions.reveal`,
  quiet version), and on opening a puzzle whose saved progress says `solved`.
- A closing line per case type (`moord`, `verdwijning`, `diefstal`), three variants each,
  stored with the case words in `src/content/zaken.js`, chosen from the puzzle's own seed.
- A "Volgende zaak" button and a close control on the sheet.
- A small "Ontknoping" control in the toolbar of a solved puzzle that reopens the sheet
  after it was closed.
- A keuring rule that every closing line fits its case type.

## Non-goals (out)
- The three hidden game types (`assign`, `latin` and the other non-`kamer` kinds): they
  keep today's note. They are not surfaced, so they get no ending until they are.
- Time taken, hint counts, scores, streaks, statistics.
- Sound.
- A new drawing: the sheet reuses `portretElement` from
  `src/ui/personenkunst-geschilderd.js`. (A dedicated "caught" pose is a later idea, not
  this spec.)
- AI-rewritten closing lines. The closing line is never sent to the AI layer.
- Sharing the result.

## Acceptance criteria
1. Given an unsolved `kamer` puzzle, when the player places the last figure and every
   figure stands on its solution cell, then the ending sheet opens.
2. Given the sheet opened by solving, then it shows the answer figure's portrait, their
   name, the role word of the case (de dader / de laatste getuige / de dief), and exactly
   one closing line.
3. Given a murder, a disappearance or a theft, then the closing line comes from that case
   type's own list and names the answer figure and the victim / missing person / person
   robbed by name.
4. Given the same puzzle id opened twice, on any machine, then the closing line is the
   same both times.
5. Given the closing line is chosen with ``makeRng(`${seed}:ontknoping`)``, then every
   other text, clue and board of every puzzle is unchanged — a fingerprint of the
   library and of 18 boards per world matches `main` before the change.
6. Given the player pressed Oplossing, then the sheet opens in its quiet form: portrait,
   name and role word, a line that says the solution was shown (not found), no closing
   line and no confetti.
7. Given the sheet is open, when the player presses Escape or the close control, then the
   sheet closes, the solved board is visible, and focus returns to the control that was
   focused before the sheet opened (or the "Ontknoping" control).
8. Given the sheet opens, then keyboard focus is on the "Volgende zaak" button and Tab
   cannot leave the sheet while it is open.
9. Given a solved puzzle is opened again (link, library, reload), then the sheet opens
   again, without confetti, in the form that matches how it was solved (`onthuld` or not).
10. Given a solved puzzle whose sheet was closed, then a toolbar control "Ontknoping"
    reopens it.
11. Given a library puzzle of level N, when the player presses "Volgende zaak", then the
    next library case of level N that this browser has not solved opens; given there is
    none, a new random puzzle of level N opens.
12. Given a generated puzzle of level N, when the player presses "Volgende zaak", then a
    new random puzzle of level N opens, its world following from its seed as on the home
    page.
13. Given the device asks for reduced motion, then the sheet appears without sliding,
    popping or confetti.
14. Given light mode, dark mode and each world colour, then the sheet's text meets the
    contrast of the surrounding page (it uses the same tokens: `--surface`, `--text`, the
    world colours via `body[data-wereld]`).
15. Given a 375 px wide screen, then the sheet fits without horizontal scrolling and the
    "Volgende zaak" button is visible without scrolling.
16. Given the player prints a solved puzzle (button or Cmd+P), then the sheet, the
    confetti and the "Ontknoping" control do not appear on paper.
17. Given the AI layer re-renders the puzzle after dressing it up (`dressUp` in
    `src/main.js` calls `renderPlayer` again), then at most one sheet is open and the
    confetti does not play twice.
18. Given the keuring runs, then a rule fails when any closing line contradicts its case
    type (the same word table as the title rule in `tools/check-regels.mjs`), when it
    lacks the answer name or the victim name, or when it uses "hij", "hem", "zij" or
    "haar" for either of them.

## Edge cases and error states
- **Solved, then a figure moved off its cell:** `state.solved` stays true today; the sheet
  does not reopen on every click. The "Ontknoping" control stays. (Behaviour of
  `solved` itself is unchanged by this spec.)
- **Reset after solving:** the sheet closes if open, the "Ontknoping" control disappears.
- **Solved by Controleer** while every cell was already filled: same as AC 1.
- **Library exhausted for a level:** falls back to a random puzzle (AC 11).
- **No `localStorage`** (private mode): the sheet works for this visit; on reload the
  puzzle is not known as solved, so no sheet — same as today's progress behaviour.
- **Old saved progress** without `onthuld` reads as found-by-yourself; acceptable.
- **`<dialog>` unsupported:** every browser the site targets supports `showModal`; no
  fallback.

## Data and privacy
No new data. The sheet reads `state.solved` and `state.onthuld`, which are already
saved per puzzle under `vierdespoor.*` in `localStorage`. "Next unsolved" reads the same
progress keys the library already reads. Nothing leaves the device.

## Design direction (UI features)
- `docs/DESIGN.md` applies in full: tokens only (no hard-coded colours), `--display` for
  the name, `--serif` for the closing line, `--r-lg` corners, `--schaduw-pop`, the
  world colour inside a case, purple dark mode.
- Detail level: rich, not minimal. The portrait is the painted one, large (about 120 px
  on a phone, 160 px on desktop), on a coloured disc in the world accent; confetti are
  hand-edged shapes in the `--pop-1` … `--pop-6` colours, drawn as inline SVG, like the
  background blobs. The primary button uses the pink click colour; nothing else on the
  sheet does.
- The case mark (`zaak.merk`: kruis / vraag / slot) may appear small next to the role
  word, so the three case types look different at a glance.
- `design/refs/` is still empty; the reference is the live site plus the Professor Layton
  "case solved" warmth named in `docs/DESIGN.md`.

## Closing lines (draft wording, Dutch)
Three per case, picked with ``makeRng(`${seed}:ontknoping`)``. Names are repeated rather
than replaced by pronouns (the same rule as the `opdracht` lines in `zaken.js`).
`dader` is the answer name, `naam` the victim/missing/robbed person, `zelfde` the world's
"in dezelfde kamer" phrase, `ding` the stolen object.

- moord
  - `${dader} stond als enige bij ${naam} ${zelfde}. De zaak is gesloten.`
  - `Het klopt: ${dader} was de enige bij ${naam}. ${dader} heeft het gedaan.`
  - `Niemand anders stond bij ${naam} ${zelfde}. ${dader} is de dader.`
- verdwijning
  - `${dader} stond als enige bij ${naam} ${zelfde}. ${dader} heeft ${naam} het laatst gezien.`
  - `Het spoor van ${naam} loopt naar ${dader}: de enige die ${naam} nog sprak.`
  - `Niemand anders was bij ${naam} ${zelfde}. ${dader} weet meer.`
- diefstal
  - `${dader} stond als enige bij ${naam} ${zelfde}. ${dader} heeft ${ding}.`
  - `Het klopt: ${dader} was de enige bij ${naam}. ${dader} is de dief.`
  - `Niemand anders kwam bij ${naam} ${zelfde}. Zoek ${ding} maar bij ${dader}.`

Quiet line (solution shown): `Dit was ${antwoordwoord}. De volgende vind je zelf?`

## Performance budget
- The sheet opens within 100 ms of the solving click; no puzzle is built before the
  player presses "Volgende zaak".
- The animation finishes within one second and never blocks the buttons.

## Test plan
- **Keuring rule first** (`tools/check-regels.mjs`): for every library case and a sweep
  of generated `kamer` puzzles, build the closing line and check it against the case's
  contradiction table (shared with the title rule), the presence of both names, and the
  absence of pronouns for them. Make it fail first by adding a deliberately wrong line,
  then remove it.
- **Fingerprint:** before and after, compare the library's titles/clues and 18 boards per
  world with `main` (the method used for `specs/modern-worlds.md`); must be identical.
- **`npm run check:snel`** green, then **`npm run check:all`** in the background, verdict
  from the `volledige keuring exit=` line.
- **Browser pane** (`npm start`, http://localhost:4173), with screenshots:
  1. a level-1 library case solved by hand → sheet with confetti (light);
  2. the same in dark mode;
  3. phone width 375 px;
  4. a case solved with Oplossing → quiet sheet;
  5. reload of a solved case → sheet again, no confetti;
  6. Escape closes, focus check via `document.activeElement`, Tab stays inside;
  7. "Volgende zaak" from a library case and from a generated case lands on the right
     level;
  8. one of each case type (moord, verdwijning, diefstal) to read the three lines.
- **Print:** `node tools/printproef.mjs /tmp/proef "http://localhost:4173/#/puzzel/<id>"`
  on a solved case; the PDF shows no sheet.

## Open questions
- None blocking. Wording of the closing lines can be tuned after the daughter has seen it.

## Plan (added before building)
Each step is one commit; run `npm run check:snel` after each, and look at the board in
the browser pane after every UI step.

1. **Closing lines and their keuring rule (tests first) — ~1.5 h.**
   - First, in `tools/check-regels.mjs`, next to the title rule (around the
     `de titel spreekt de zaak niet tegen` check): lift the contradiction table into a
     small shared helper, and add a rule `de slotzin past bij de zaak` that builds the
     closing line for every `kamer` puzzle it already builds and checks: no contradicting
     word, the answer name present, the victim name present, no `hij|hem|zij|haar`. Add a
     deliberately wrong line to see it fail, then remove it.
   - Then add `slot: [...]` (three functions per case) and one `stilSlot` line to the
     three entries of `ZAKEN` in `src/content/zaken.js`, following the existing
     `opdracht` pattern and its "repeat the name" comment.
   - In `src/puzzle.js`, where the `kamer` puzzle is assembled (`zRng` at
     `${seed}:zaak`), pick the line with its own ``makeRng(`${seed}:ontknoping`)`` and
     store the finished sentence on `puzzle.zaak.slot`, plus `puzzle.zaak.antwoordIdx`
     (or reuse the answer index already there) so the sheet can draw the portrait.
     Never draw from `zRng` or any existing rng.
   - Fingerprint before/after: library titles, clues and 18 boards per world identical
     to `main` (AC 5).
2. **Next-case helper — ~1 h.** Move `nieuwePuzzel(niveau)` out of `src/ui/home.js` into
   a shared module (e.g. `src/ui/volgende.js`) and add `volgendeZaak(puzzle)`: for a
   catalog id, the next entry of the same level in `CATALOG` order (as `library.js`
   lists it, via `TEZIEN`) not in `solvedIds()`; otherwise `nieuwePuzzel(niveau)`. Home
   imports it from there; no behaviour change on the home page.
3. **The sheet — ~2 h.** New `src/ui/ontknoping.js` exporting
   `openOntknoping(puzzle, { onthuld, feest })`: a native `<dialog>` opened with
   `showModal()` (focus trap and Escape for free), with `portretElement` at 120/160 px on
   a world-accent disc, name in `--display`, role word plus the small `zaak.merk` mark,
   the closing line in `--serif` (or the quiet line), a primary "Volgende zaak" link
   (`href` from step 2) that receives focus, and a close button. On close, return focus
   to the opener. Guard against a second open dialog (AC 17): one module-level
   reference, closed and replaced on re-render.
4. **Wire it into the player — ~1 h.** In `src/ui/player.js`: open with `feest: true`
   where `state.solved` turns true in `onCell`, `actions.check` and `actions.hint`; with
   `onthuld: true` in `actions.reveal`; on render when `saved.solved` (no confetti);
   close it in `actions.reset`. Add the "Ontknoping" control to the toolbar for a solved
   `kamer` puzzle. Leave the existing note text as it is for non-`kamer` kinds.
5. **Styling, motion, print — ~1.5 h.** In `styles/app.css`, next to the decoration
   block at the bottom: `.ontknoping` sheet (tokens only, `--r-lg`, `--schaduw-pop`,
   world colours, purple dark mode), slide-in and pop keyframes, confetti as inline SVG
   shapes with a hand-made edge (`src/ui/vormen.js`) in `--pop-1` … `--pop-6`; all
   animation off under the existing `prefers-reduced-motion` block; `.ontknoping`,
   `::backdrop` and the toolbar control hidden in the existing `@media print` block.
6. **Verify — ~1 h.** The browser-pane checks 1–8 of the test plan with screenshots
   (light, dark, 375 px, quiet, reload, keyboard, next case, three case types), the print
   proof PDF, then `npm run check:all` in the background and the
   `volledige keuring exit=` line. CHANGELOG `## [Unreleased]` → Added; STATUS Next
   item 2 marked done (pending her verdict). Open a pull request; do not push to `main`.

Risks:
- **Shifting existing puzzles.** Any draw from an existing rng changes every puzzle after
  it. Mitigation: only the new `:ontknoping` rng, and the fingerprint in step 1.
- **Double render after AI dress-up.** `renderPlayer` runs twice for dressed puzzles; a
  naive open would stack dialogs or replay confetti. Mitigation: the single-instance
  guard in step 3, and `feest` only on the solving action, never on render.
- **Sheet every reopen may annoy.** Guus chose it; if the daughter finds it in the way,
  switching to "only the button" is a one-line change in step 4.
- **Portrait size.** The painted portraits were drawn for 24–48 px; at 160 px detail may
  look thin. Look at it in step 6; a better large portrait is a separate drawing task,
  not this spec.
