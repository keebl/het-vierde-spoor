# UX — Reconstructie

The functional design: who uses the product for what, the flows, every screen with its
real copy, and the principles behind them. Guus walks the clickable prototype in
`design/prototype/` before anything is built; his approval is the line
`UX approved: YYYY-MM-DD` in `STATUS.md` (workbench `specs/functional-design.md`).
No visual design here: palette, type and images belong in `docs/DESIGN.md`.

Started 2026-11-18 in `--feature` mode for `specs/engine-extension.md` (phase A, step 4:
the numbered solution). Only the flows and screens that feature touches are here.

## Users and jobs
- The daughter — When I give up on a board or press Oplossing, I want to see how it could
  be solved step by step, so I can learn the trick instead of only seeing the answer.
- The daughter — When I solved a board myself, I want to compare my route with the book-style
  solution, so I can see whether I found the short way.
- The owner — When I print a board for her, I want the solution on paper too but out of
  sight, so she can check afterwards without spoiling it.

## Flows
### See how it is solved (after Oplossing)
- Trigger: the player presses "Oplossing" on a room board.
- Steps: Puzzle → Confirm → Solution shown → (opens) Numbered steps
- End state: the board is filled in and the numbered steps are readable under it.
- Unhappy path: the human solver stalls (allowed in phase A): the steps stop with
  "Vanaf hier is een aanname nodig." followed by where the rest stood.

### Compare after solving it yourself
- Trigger: the player solves the board ("Opgelost" sheet).
- Steps: Puzzle → Solved → Numbered steps
- End state: the steps are available under the board, closed by default.
- Unhappy path: none; the player can ignore the block.

### Print with the solution
- Trigger: "Printen".
- Steps: Puzzle → Print
- End state: page 1 story, question, board and clues; the numbered solution starts on a new
  page, headed "Oplossing".
- Unhappy path: a closed `<details>` prints only its summary, so print opens it.

## Screens
### Puzzle (room board, unsolved)
- Purpose: play; nothing about the solution is visible.
- Content, in priority order: story, question, board, clues per name, toolbar.
- Primary action: Controleer · Secondary: Hint, Oplossing, Begin opnieuw, Printen
- Copy: unchanged from today.

### Confirm
- Purpose: one misclick must not end the puzzle (exists today).
- Copy: "De hele oplossing invullen? Daarmee is de puzzel voorbij."

### Solution shown (after Oplossing)
- Purpose: the answer and the route to it.
- Content, in priority order: note "De oplossing staat op het bord. Het antwoord: Clara.",
  the filled board, the block "Zo los je hem op" open, numbered steps.
- Primary action: Volgende puzzel · Secondary: Begin opnieuw
- Copy: block title "Zo los je hem op", sub-line "In 7 stappen, zonder te gokken." or
  "In 9 stappen; op een paar plekken moet je iets aannemen en kijken of het vastloopt."

### Solved by yourself
- Purpose: compare.
- Content: the existing ending sheet, then under the board the block closed:
  "Zo kon je hem oplossen (7 stappen)".

### Numbered steps (the block itself)
- Purpose: a book-style solution: per step the reasoning, ending with who stood where.
- Content: an ordered list; each item a few sentences, the last sentence in bold is the
  placement ("Clara stond dus op D2, in de dienstgang.").
- Stall: last item "Vanaf hier is een aanname nodig." then the remaining placements.

### Print
- Content: page 1 as today; then a page break and "Oplossing" with the numbered steps.

## Principles
- The solution teaches, not only tells, so we show reasoning before the placement in every step.
- Nothing spoils an unsolved board, so we show the steps only after Oplossing or a solve,
  and on paper only after a page break.
- Same words as the board, so steps name cells the way the board edge does (B3, rij B, kolom 3).

## Review log
- 2026-11-18 — "Goedgekeurd" (forwarded verbatim by the main session): 1A, 2A, 3A, 4A — no change
