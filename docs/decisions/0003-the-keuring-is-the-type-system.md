# ADR-0003: The keuring is the type system

Date: 2026-11-08
Status: accepted (reconstructed — written during `/adopt` from `tools/` and commit history;
the decision itself predates this file)

## Context
There is no TypeScript here, and most of what can go wrong is not a type error anyway. The
failures this project actually produces are: a generated puzzle with two solutions or none,
a clue that gives the answer away, a room name that does not match its floor, a drawing
that depicts something other than its name, a duplicate key in a content table that
JavaScript swallows in silence. None of those are caught by a compiler, and none are
caught by testing a handful of examples — they appear in *one* combination of assignment ×
world × game type × level × seed.

## Decision
Every rule is written as a check that is computed over **every settable combination**, and
all of them run from one entry point (`npm run check:all` → `tools/keuring.mjs`, seven
checks, four to five minutes). A rule only counts as enforced when it is in there. When a
fault is reported, the fix is the category plus a new check, not the single instance.

## Consequences
- Positive: a whole class of faults can only be made once. The rules in
  `tools/check-kamers.mjs` and `tools/check-regels.mjs` each exist because of a specific
  bug, and the comment above each one names it.
- Positive: the owner does not have to report per puzzle. Puzzles are generated; the unit
  that matters is the room name, the furniture piece, the world.
- Negative: four to five minutes per full run. Mitigated by `npm run check:snel` (the three
  checks that build no puzzles, about a second) for work in progress.
- Negative: the checks are code too and can be wrong. They have been twice: a budget
  exhaustion read as "zero solutions", and an `&&` chain that stopped at the first red
  check and hid six others. Both are fixed; the second is why `tools/keuring.mjs` exists.

## Alternatives considered
- TypeScript — would catch none of the faults above. Still an option for the engine's
  internal shapes, but it is not what is failing.
- Unit tests on examples — a fixed set of seeds proves nothing about the combination that
  breaks.
