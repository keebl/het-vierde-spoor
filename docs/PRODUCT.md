# Product — Het Vierde Spoor

## Problem
The puzzle book *Murdoku* by Manuel Garand contains a finite number of deduction puzzles.
The owner's daughter finished it and wanted more; there are no more. This project is the
machine that makes as many as she wants, each with exactly one solution, each solvable by
reasoning alone.

That is also the yardstick: **would she spend an hour on this?** Not whether the code is
elegant.

## Users
- **The owner's daughter** — the primary user. Plays on a phone and on a laptop, at home,
  for fun. Knows the format from the book; needs no explanation of the genre.
- **Anyone who finds the public link** — secondary. Gets the same site; no account, no
  onboarding beyond the Uitleg page.

## Scope (what it does)
- Generates a Reconstructie puzzle on demand: figures on a floor plan, one per row and one
  per column, never on a furniture piece, from a seed.
- Guarantees exactly one solution and verifies it before the puzzle reaches the player.
- Thirteen settings with their own names, rooms, furniture, board frame and atmosphere
  drawing; the setting follows from the seed and is not chosen by the player.
- Three kinds of case: a murder, a disappearance, a theft.
- Six difficulty levels, 5×5 up to 16×16. Levels 1–3 are solvable by elimination alone;
  4–6 require an assumption and a contradiction.
- Playing aids: Uitsluiten (own crosses), Schetsen (candidate letters), automatic crosses
  (switchable), Controleer (green/red rings), Hint (a genuine extra clue), Oplossing.
- A library of seventy-four fixed cases, reachable at `#/puzzels`.
- Every puzzle has its own URL, so it can be bookmarked or shared.
- Light and dark mode, following the device by default.

## Non-goals (what it deliberately does not do)
- **No accounts and no cross-device progress.** Progress lives in `localStorage`, per
  browser. (assumption: this stays true; it is a deliberate simplification, not a backlog
  item)
- **No choosing the setting.** You choose how hard; the decor you get. Removing that choice
  was a deliberate decision — it removed the feeling that you must configure something
  before you may start.
- **No server for gameplay.** Everything is computed in the visitor's browser; that is why
  no API key needs to exist online.
- **No monetisation, no ads, no tracking.**
- **The AI never supplies logic.** Claude may rewrite story text; every rewritten clue must
  keep its proper names, negation, numbers and either/or, or the original sentence stands.
- **No image files.** Everything visible is drawn in code.

## Success criteria
- A generated puzzle has exactly one solution and is solvable without guessing — machine
  verified for every combination of assignment × world × game type × level before release.
- Levels 1–3 are solvable by elimination alone; the breadcrumb above each puzzle states
  honestly which of the two it became.
- The daughter keeps asking for more puzzles. (the real criterion; not measurable in CI)

## Platforms
Web only — any modern browser, phone and desktop. Static hosting on GitHub Pages. See
`docs/ARCHITECTURE.md` for the stack.

## Data, privacy and money
- Personal data: **none**. No accounts, no analytics, no server-side storage. Only
  `localStorage` keys under `vierdespoor.*` for progress, preferences and theme — on the
  visitor's own device.
- Accounts: no.
- Monetisation: none. Not a trader under the DSA.

## Open product questions
- TODO(guus): the new name for the site. "Het Vierde Spoor" is to change; the game type is
  now called Reconstructie.
- TODO(guus): licence for the public repository — "all rights reserved" by default, or MIT
  by decision.
- TODO(guus): whether the three hidden game types (Kruisverhoor, Rondgang, Dienstrooster)
  ever come back into view. They work and are verified; they are simply not surfaced.
