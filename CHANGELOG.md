# Changelog

All notable, user-facing changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: SemVer.

There are no releases yet: the project is unversioned in practice and a push to `main` is a
deploy. `package.json` says `0.1.0` and has never been bumped. Entries below start at the
day the changelog was introduced; everything before that is in git history only.

## [Unreleased]

### Added
- A Reconstructie board now explains its solution: after Oplossing, or after you solve it
  yourself, "Zo los je hem op" lists numbered steps in Dutch, each ending with who stood
  where. On paper the steps follow on their own page headed "Oplossing". No board changed.
- Solving a Reconstructie now ends the case: a sheet slides over the board with the
  answer's portrait, name and role, one closing line that fits the case (murder,
  disappearance or theft), a little confetti and a "Volgende zaak" button. After
  Oplossing the sheet is quieter. It opens again when you reopen a solved case, and an
  "Ontknoping" button brings it back after closing.
- A "Volgende puzzel" button next to Controleer and Printen. Both it and "Volgende zaak"
  follow the library's order: the next unsolved case of your level, then the first
  unsolved case of the next level.
- A "Terug" button (an arrow back) next to Neerzetten · Schetsen · Uitsluiten, and
  Ctrl+Z / Cmd+Z, undo the last move on the board: placing or removing a figure, a
  sketch letter or a cross. Up to 30 steps per puzzle, kept when you reload.

### Changed
- On a phone, the name pills, the clue box under them and the mode buttons line up on one
  grid: equal heights, the same border and the same edges left and right. "Iedereen" is no
  longer italic.
- New fonts: Baloo 2 for headings, names and buttons, Nunito for clues and other text.
  All fonts now come from the site itself instead of Google Fonts.
- Clues on the room board are harder and more varied. "Same row as" and "same column as"
  are gone (together they pointed at one cell); "X stood in the library" takes their
  place. Clues are spread over the names: at most 3 per name on levels 1–3, 4 on level 4,
  5 on level 5, and on level 6 as few as the builder manages. No kind of clue makes up
  more than a quarter of a puzzle (a third on level 6), and from level 3 no clue puts
  someone on two cells or fewer by itself. Every room board and library case changes;
  building a level-5 or level-6 puzzle takes a few seconds longer.
- A sketch letter no longer shows where a placed figure makes it impossible: that
  figure's letter elsewhere, any letter under it, and other figures' letters in its row
  and column. Pick the figure up and the letters come back. With "Kruisjes vanzelf" off
  the board leaves your letters alone.
- No clue or hint names the victim any more, not even in another suspect's clue. Where
  the victim stands follows from the rest of the board. In the clue list the victim's
  name carries one fixed line saying so, instead of a group of clues of its own. Every
  Reconstructie board is generated anew: an existing link gives a different puzzle, and
  a half-played one starts again from an empty board (solved stays solved).
- On a phone, choosing a name shows what the clues say about that person in a small box
  right under the names, and the names with that box stay at the top while you scroll
  past the board. An "Iedereen" chip shows the clues about nobody in particular. The
  floating "Aanwijzingen" button is gone on a phone; on desktop, choosing a name scrolls
  its group into view in the clue column.
- Clues no longer have numbers, anywhere. A clue that names two people now appears under
  both names as the same sentence, instead of "Staat ook in aanwijzing 5".
- The bar above the board has three modes, Neerzetten, Schetsen and Uitsluiten, of which
  exactly one is on and shown filled and bold. Placing a suspect used to be what you had
  with the other two off, and had no button of its own.
- On a phone every suspect is in view above the board, in smaller tokens over several
  lines, instead of in one row you had to scroll sideways to find the rest.
- The site is now called **Reconstructie** and lives at https://reconstructie.app/. The
  old address keebl.github.io/het-vierde-spoor redirects there; saved progress is kept.
- New logo: an R drawn as the walls of a floor plan, with a figure in the room its bowl
  forms, on the pink-to-orange tile. Used for the favicon and in the header.
- On a wide screen (1100 px and up) the clues stand in a right-hand column that starts
  beside the puzzle and stays in view while you scroll; the question and the rules stand
  beside the case text above it. When there is room the clues are set in two columns,
  so a long list usually fits without scrolling. More space between the question, the
  rules and the buttons.
- On a phone or narrow window a floating "Aanwijzingen" button opens the clues as a sheet
  over the lower half of the screen; the board stays playable above it.
- Printing gives two sheets: the case, the question and the board on the first; the
  rules and the clues, in two columns, on the second. On-screen controls no longer
  print as empty headings, and the rules print open also with Cmd+P.
- The decorated frame around the board is about a third thinner; the squares stay the
  same size. The scene picture above the case is lower on a wide screen.
- A long case text is folded to three lines with a "Lees verder" link on a phone.
- The whole site is wider (1240 px, text up to 74 characters). On the explanation page
  the headings stand in a column beside the text, and the six levels on the front page
  are laid out as three and three.

### Fixed
- Puzzle page on a wide screen: opening the rules no longer pushes the story and the board
  down (the rules now open at the top of the clues column), the names and the Neerzetten ·
  Schetsen · Uitsluiten row stay under the header while you scroll down the board, and every
  collapsible heading (rules, clues, board legend, controls) has the same look.
- A missing woman was referred to as "him" in the intro ("heeft hem als laatste
  gesproken"). The case sentences now repeat the name instead of using a pronoun.
- Puzzle titles that contradicted the puzzle. "Wie stond er alleen?" asked the opposite of
  the answer (the culprit is the one who was *not* alone), and fixed library titles
  promised a body, a lie or an emptied safe above a case that turned out to be a theft or
  a disappearance. The keuring now refuses a title that contradicts the case.
- "Precies één iemand" in clues is now "precies één persoon".
- A stolen item no longer names a second owner ("Nordin, de conciërge, ... de sleutelbos
  van de conciërge"; "de startkaart van de kapitein van Nuru").

### Added
- Project standard adopted (CLAUDE.md, STATUS.md, docs, specs, security baseline).
- Two daylight settings: Het Openluchtbad and Dierenpark De Wildhoek. Until then all
  eleven settings played at night.
- Cases other than murder: a disappearance or a theft, each with its own wording, its own
  mark on the figure in question, and its own word for the answer.
- A floor plan of its own on each difficulty level on the home page, and a picture per
  step under "Zo werkt het".

### Changed
- Plainer story text. The opening line of each setting no longer gives away a death before
  the case is known (it read "it was already too late" above a theft), the case sentences
  are shorter, and stock phrases such as "which one follows from the clues" are gone. The
  model-written intros are no longer used.
- The atmosphere drawings on the library cards are painted rather than flat: a gradient per
  depth layer, the setting's colour over the whole drawing, a real glow around each light,
  haze, a vignette and grain. Four silhouettes redrawn.
- Fewer furniture pieces per room (at most one per four squares, never more than three), so
  a clue like "Bram stood next to the weighing scale" points at a landmark and not a pile.
- A pool is a pool: the two pools and the penguin pool have their own kind of room with
  their own ten pieces, instead of sharing the lawn's furniture.

### Changed
- Every name now appears in the clue list, including a name no clue says anything about.
  It used to be skipped, so a board of five showed four names, which reads as a bug. It is
  not missing but redundant: that spot follows from the rest, and the list now says so.

### Fixed
- On a phone the sticky bar covered a quarter of the screen, permanently, over the puzzle:
  the two switches wrapped their labels over two and three lines. They moved below the
  board, where they fit on one line; Uitsluiten and Schetsen stay in the bar.
- `het hooirek` was drawn as a bookcase, in a giraffe stable.
- Clue sets were not minimal: twelve of two hundred and sixty-four clues could be removed.
- Check showed no difference between right and wrong; placements now get a green or red
  ring.
- Roles no longer contradict the victim's name ("Marieke is dead. The neighbour at number
  six was found").
