# Changelog

All notable, user-facing changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: SemVer.

There are no releases yet: the project is unversioned in practice and a push to `main` is a
deploy. `package.json` says `0.1.0` and has never been bumped. Entries below start at the
day the changelog was introduced; everything before that is in git history only.

## [Unreleased]

### Changed
- On a wide screen (1100 px and up) the clues stand beside the board in a column that
  stays in view and scrolls on its own, so you no longer scroll back and forth between
  board and clues. The puzzle page uses more of the screen width, and the case text with
  the question beside it follows the same two columns.
- On a phone or narrow window a floating "Aanwijzingen" button opens the clues as a sheet
  over the lower half of the screen; the board stays playable above it.
- Printing puts the board on the first sheet and the clues on the second.

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
