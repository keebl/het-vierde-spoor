# UX — Reconstructie

The functional design: who uses the product for what, the flows, every screen with its
real copy, and the principles behind them. Guus walks the clickable prototype in
`design/prototype/` before anything is built; his approval is the line
`UX approved: YYYY-MM-DD` in `STATUS.md` (workbench `specs/functional-design.md`).
No visual design here: palette, type and images belong in `docs/DESIGN.md`.

Started 2026-11-18 in `--feature` mode for `specs/engine-extension.md` (phase A, step 4:
the numbered solution). Only the flows and screens that feature touches are here.
Extended 2026-11-18 for `specs/level-path.md` (the level path); its parts are marked
"(level path)".

## Users and jobs
- The daughter — When I give up on a board or press Oplossing, I want to see how it could
  be solved step by step, so I can learn the trick instead of only seeing the answer.
- The daughter — When I solved a board myself, I want to compare my route with the book-style
  solution, so I can see whether I found the short way.
- The owner — When I print a board for her, I want the solution on paper too but out of
  sight, so she can check afterwards without spoiling it.
- The daughter (level path) — When I finish a puzzle, I want a next one that is only a
  little harder, so I keep improving without hitting a wall like 9×9 to 12×12.
- The daughter (level path) — When I open the site, I want to see how far I got and what is
  next, so I can carry on in one click.

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

### Walk the path (level path)
- Trigger: "Verder op het pad · stap 14" on the front page, or "Het pad" in the menu.
- Steps: Front page → Path → Path stop (puzzle) → Path stop solved → Path (next stop open)
- End state: the stop shows its stars, the next stop is open and highlighted.
- Unhappy path: the player presses Oplossing. Then the closing sheet says the step does not
  count, and the next stop stays locked.

### Open a locked stop (level path)
- Trigger: a shared or old link to `#/pad/30` while the player is at stop 14.
- Steps: Locked stop
- End state: the path is shown with stop 30 locked and a button to stop 14.

### End of the path (level path)
- Trigger: the last stop is solved.
- Steps: Path stop solved → Path (end)
- End state: the end message and a button to Monsterlijk free play.

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

### Front page (level path)
- Purpose: one click to carry on.
- Content, in priority order: intro, the path button, the level picker as today.
- Primary action: "Verder op het pad · stap 14" (before any progress: "Begin het pad")
- Secondary: a level in the picker (first click chooses, second starts)
- Copy under the button: "Elke stap een tikje zwaarder, van 5 bij 5 tot 16 bij 16."

### Path (level path)
- Purpose: see where you are and what is next.
- Content, in priority order: title "Het pad", progress line "Stap 14 van 100 · 31 sterren",
  the winding path with numbered stops. Each stop shows its stars (0–3) or a lock, and the
  current stop is larger with "Hier ben je". A sign marks each new board size ("Nu 8 bij 8").
- Primary action: the current stop ("Speel stap 14") · Secondary: any solved stop (replay)
- Copy for a locked stop on tap: "Nog op slot. Los eerst stap 14 op."
- Copy when storage is blocked: "Je voortgang wordt in deze browser niet bewaard."

### Path stop (puzzle) (level path)
- Purpose: play, knowing this is a path step.
- Content: the normal puzzle; the breadcrumb reads "Het pad · stap 14 van 100 · 8 bij 8".
- Copy: everything else as today.

### Path stop solved (level path)
- Purpose: reward and the next step.
- Content, in priority order: "Zaak gesloten", the stars (big), the portrait and name, the
  closing line, "Volgende stap".
- Copy for stars: "3 sterren — zonder hint en zonder controleren." · "2 sterren — met één
  hulpje." · "1 ster — opgelost met hulp." · Replay with fewer stars: "Je houdt je 3 sterren."
- Copy after Oplossing: "Deze stap telt nog niet: je liet de oplossing invullen. Probeer hem
  opnieuw om stap 15 te openen." Primary action then: "Opnieuw proberen".
- Primary action: "Volgende stap" · Secondary: "Bekijk het bord", "Naar het pad"

### Locked stop (level path)
- Purpose: a link never spoils a later step.
- Copy: "Stap 30 is nog op slot. Je bent bij stap 14." Primary action: "Naar stap 14".

### End of the path (level path)
- Copy: "Je bent aan het eind van het pad. Honderd stappen, van 5 bij 5 tot 16 bij 16."
  Primary action: "Speel Monsterlijk" · Secondary: replay any stop for more stars.

## Principles
- The solution teaches, not only tells, so we show reasoning before the placement in every step.
- Nothing spoils an unsolved board, so we show the steps only after Oplossing or a solve,
  and on paper only after a page break.
- Same words as the board, so steps name cells the way the board edge does (B3, rij B, kolom 3).
- (level path) Never a wall, so we make each step only a little harder and measure it.
- (level path) Help is allowed, so we keep a step that used Hint but award fewer stars;
  only Oplossing does not count.
- (level path) Progress is shown, never taken away, so stars only go up and a changed puzzle
  keeps its number's stars.

## Review log
- 2026-11-18 — "Goedgekeurd" (forwarded verbatim by the main session): 1A, 2A, 3A, 4A — no change
- 2026-11-18 (level path) — "Goedgekeurd": path button above the levels, stars above the
  portrait; "maak het wel een beetje creatief en speels gebruik de drawthings optie als je
  leuke afbeeldingen nodig hebt" (goes to the visual half) — no change to the sketch
