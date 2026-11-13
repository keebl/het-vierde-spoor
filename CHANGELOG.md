# Changelog

All notable, user-facing changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: SemVer.

There are no releases yet: the project is unversioned in practice and a push to `main` is a
deploy. `package.json` says `0.1.0` and has never been bumped. Entries below start at the
day the changelog was introduced; everything before that is in git history only.

## [Unreleased]

### Changed
- The site is now called **Reconstructie** and lives at https://reconstructie.app/. The
  old address keebl.github.io/het-vierde-spoor redirects there; saved progress is kept.
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
