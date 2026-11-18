# Product — Reconstructie

## Name
Name: Reconstructie — final (2026-11-14)

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
- **Anyone who finds the public link** — secondary. Gets the same site; no account needed,
  no onboarding beyond the Uitleg page.

## Why now
She finished the book and asked for more, and there is no second volume to buy (assumption:
no sequel is out). A generator that verifies its own puzzles is cheap to build now and gives
her an endless supply; the longer the wait, the more likely she moves on to something else.

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
- Optional sign-in with Google, so solved puzzles, path stars and three preferences follow
  the player to her other devices.

## Non-goals (what it deliberately does not do)
- **No mandatory accounts.** Signing in with Google is optional and only carries your game
  to your other devices. Without an account, progress lives in `localStorage`, per browser.
  (changed 2026-11-18 with `specs/accounts-and-sync.md`; was "no accounts and no
  cross-device progress")
- **No choosing the setting.** You choose how hard; the decor you get. Removing that choice
  was a deliberate decision — it removed the feeling that you must configure something
  before you may start.
- **No server for gameplay.** Everything is computed in the visitor's browser; that is why
  no API key needs to exist online. The one server is a small database (Supabase, EU) that
  keeps a signed-in player's progress; when it is unreachable, playing is unaffected.
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
UI: yes

## Data, privacy and money
- Personal data: none without an account. With an account: the Google e-mail address and
  an internal id (Supabase Auth), and the player's progress (solved and revealed
  puzzles, path stars, three preferences), to show it on all her devices. Deleted with
  "Account verwijderen". No analytics, no tracking. Without an account only
  `localStorage` keys under `vierdespoor.*` for progress, preferences and theme — on the
  visitor's own device.
- Accounts: optional, Google sign-in only (`docs/decisions/0006-optional-accounts-with-supabase.md`).
  Hidden in production until the shared database closes its other apps to strangers.
- Monetisation: none. Not a trader under the DSA.

## Open product questions
- TODO(guus): licence for the public repository — "all rights reserved" by default, or MIT
  by decision.
- TODO(guus): whether the three hidden game types (Kruisverhoor, Rondgang, Dienstrooster)
  ever come back into view. They work and are verified; they are simply not surfaced.
