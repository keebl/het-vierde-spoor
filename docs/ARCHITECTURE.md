# Architecture — Het Vierde Spoor

This document explains *why* the code is shaped the way it is. The *what* is in the code.
Translated from `ARCHITECTUUR.md`, which lived at the repository root until the project
standard was adopted; the original is in git history.

**In one sentence:** a browser app with no build step that generates deduction puzzles and
verifies them on the spot, with all content in hand-written tables and one inspection
script (*the keuring*) that guards those tables.

## Overview

No bundler, no framework, no runtime dependencies. `index.html` loads `src/main.js` as an
ES module and the browser does the rest. Node exists only for the keuring (`tools/`) and a
local server (`server/serve.mjs`). The one npm dependency, `@anthropic-ai/sdk`, is used by
the tooling, never by the site.

```
index.html          loads src/main.js
src/main.js         router: #/ , #/maken , #/puzzels , #/uitleg , #/puzzel/<id>
src/puzzle.js       settings -> a playable puzzle (the only place where content,
                    engine and language meet)
src/engine/         the engine: everything that computes, knows nothing of words
src/content/        the content: everything that is words, computes nothing
src/ui/             the screen: drawing and operating
tools/              the keuring
server/serve.mjs    local server + /api/flavour for the AI layer
worker/             a Cloudflare Worker for that same API; not deployed
```

## Key decisions

| Decision | Why | ADR |
|---|---|---|
| No build step, no dependencies, no framework | A push is a deploy; nothing can go stale | `docs/decisions/0002-no-build-step.md` |
| The keuring replaces a type system | No types, no linter: the checks are the safety net | `docs/decisions/0003-the-keuring-is-the-safety-net.md` |
| Dutch is the language of the code | Written by and for a Dutch household; identifiers mirror domain words | `docs/decisions/0004-dutch-is-the-language-of-the-code.md` |

## Boundaries

The most important agreement in this project:

> **The engine knows nothing of language. The content computes nothing.**

- `src/engine/` — knows only numbers: cells, rooms as indices, people as indices. It does
  not know that room 3 is called "de bibliotheek". Must not import from `src/content/` or
  `src/ui/`.
- `src/content/` — words, names, tables. No computation. Must not import from `src/engine/`.
- `src/ui/` — drawing and interaction. May read both.
- `src/puzzle.js` — the single place where the three meet.

That separation is why a world can be added by writing only words, and why furniture can be
renamed without changing a puzzle. It is the reason the project is still comprehensible
after thirteen worlds.

### The engine (`src/engine/`)

| file | what it does |
|---|---|
| `rng.js` | deterministic random. Same seed → same puzzle, always. |
| `rooms.js` | the board: partition rooms, place furniture, draw a placement, propagate clues, count solutions. |
| `generate-rooms.js` | the generator (four steps below). Plus `extraAanwijzing` for the hint. |
| `difficulty.js` | what a level promises: board size, room count, and whether crossing out suffices or an assumption is needed. |
| `generate.js`, `assign.js`, `latin.js`, `clues.js`, `graph.js` | the three other game types. They work but are not surfaced (see `ZICHTBARE_MECHANICS`). |

The generator works in four steps, and that order is the whole trick:

1. **Pick the solution first.** Then there is always at least one.
2. **Build a pool of clues that are true in that solution.** Everything in it is true by
   construction.
3. **Add clues until the solution is pinned down.** Cheap propagation first, the expensive
   counter only when a few figures are still open.
4. **Prune everything that can be missed** — in two passes, the second only on the attempt
   that won (otherwise 16×16 costs twenty-seven seconds instead of three).

### The content (`src/content/`)

| file | what is in it |
|---|---|
| `worlds.js` | the thirteen settings: names, places, objects, times, and the sentences that world uses to talk about a floor plan. |
| `kamersoorten.js` | **the heart of the content.** Which kind of room a place is, which floor belongs to it, which furniture can stand in it, and per world what that furniture is called there. |
| `zaken.js` | the kind of case: a murder, a disappearance or a theft. Supplies words, no logic. |
| `namen.js` | which portrait belongs to which name (427 names, by hand). |
| `iconen.js` | which pictogram belongs to which word. By hand, word by word. |
| `rooms-text.js` | from a raw clue to a Dutch sentence. |
| `spelregels.js` | the rules in words, per game type. |
| `catalog.js` | the seventy-four fixed cases (settings only, no puzzle data). |
| `assignments.js` | the four assignments and the four game types, plus what is visible. |

### The screen (`src/ui/`)

| file | what it does |
|---|---|
| `player.js` | the play screen: markings, checking, hints, revealing the solution. |
| `board-rooms.js` | drawing the board: floors, walls, furniture, figures, crosses. |
| `bordrand.js` | the frame around the board, one per world. The largest file, and almost entirely drawing. |
| `meubelkunst-geschilderd.js` | the painted furniture pieces. |
| `meubelkunst.js` | the same pieces as line icons (comparison page and fallback). |
| `personenkunst-geschilderd.js` | the figures' heads. |
| `geschilderd.js` | the painting engine: how a shape gets light and shadow. |
| `vormen.js` | the building blocks of every drawing: romp, plaat, poot, bol, ton… |
| `aankleding.js` | what lies loose on a floor, per kind of room. |
| `scenes.js` | the atmosphere drawing above a puzzle and on the library cards. |
| `bordminiatuur.js` | the small floor plans on the level buttons and the three method steps. |
| `state.js` | progress and preferences in `localStorage`. |
| `thema.js` | light or dark. |
| `home.js`, `library.js`, `generator.js`, `uitleg.js` | the four other screens. |

## Data and state

- Persistence: `localStorage` only (`vierdespoor.*` keys) — progress, preferences, theme.
  No accounts, no server-side state.
- A puzzle is its settings plus a seed; nothing else is stored. The catalogue holds seeds,
  not puzzle data.
- The solution object lives in the page while playing, which is how the Check button works.

## The tables that drive everything

Nearly all content sits in hand-written tables in `kamersoorten.js`. This is the order in
which they override each other — general to specific:

```
SOORT_VAN[place]           which kind of room is this?           (required)
  VLOER_VAN[kind]          which floor belongs to that kind
  WERELDVLOER[world]       how that world shifts that floor
  VLOER_VAN_PLEK[place]    and what that one place deviates      (always wins)

MEUBELS_VAN[kind]          what can stand in such a room
  VERWANTE_SOORTEN[kind]   where it falls back when that runs out
  WERELDVERWANT[world]     or where that world falls back instead
  WERELDMEUBELS[world]     what that furniture is called in that world
  WERELDSTOF[world]        what it is made of there

VORM_VAN[place]            strip, area or corner — decides which name lands on which room
VOORZETSEL_VAN[place]      "in", "op" or "bij" the place
```

Adding a world is therefore: words in `worlds.js`, a line per room in `SOORT_VAN`, a
`WERELDMEUBELS` layer, a board frame, an atmosphere drawing, a palette in the stylesheet,
and an icon for every new word. The keuring tells you exactly what you forgot.

## Testing strategy

There is no unit test suite. The keuring is the test suite: it builds real puzzles across
every combination a user can select and asserts properties on them. See
`docs/decisions/0003-the-keuring-is-the-safety-net.md` for why, and `CLAUDE.md` for the
commands.

| script | what it verifies |
|---|---|
| `check.mjs` | builds every combination of assignment × world × game type × level, two seeds each. Over a thousand puzzles. |
| `check-catalog.mjs` | the seventy-four fixed cases. |
| `check-regels.mjs` | seventy-plus rules over every built puzzle: exactly one solution, every clue true, no clue that gives the answer away, every sentence with a capital and a full stop… |
| `check-ai-guard.mjs` | that a rewritten text keeps names, negations and numbers intact. |
| `check-weggevers.mjs` | that the intro gives nothing away that it should not. |
| `check-iconen.mjs` | that every word in the content has its own pictogram. |
| `check-kamers.mjs` | the tables above: every place a kind, every furniture piece its own drawing, no two names that look alike, every name a portrait, every room name that matches its floor. |

Every rule in `check-regels.mjs` and `check-kamers.mjs` is there because something was once
wrong that nobody saw. A few examples, because they show the kind of mistake this project
makes:

- *a grand piano in a burial vault* — a room kind ran out of furniture and the code took
  the first thing available.
- *a whetstone that looked like a rope reel* — two names shared one drawing.
- *"three markings are wrong" with nothing outlined* — the player wrote `wrong`, the board
  read `fout`.
- *"Marieke is vermoord. De buurman van nummer zes werd gevonden"* — the role was drawn
  independently of the name.
- *a snow-covered garden with green grass* — one `soort` had to be woods, alley, snow and
  conservatory at once.

If you change something and the keuring objects: the rule is almost always right. Only
change a rule when you can write down why it no longer holds — as happened with "the frame
is night", which was widened when daylight worlds arrived.

## Conventions you need to know

**Everything follows from the seed.** The same seed gives the same puzzle, on every device,
forever. Adding a new draw in the middle of an existing sequence shifts everything after
it. To draw something new, give it its own rng (`makeRng(\`${seed}:zaak\`)`), as the case
kind does.

**Names are decoration, logic is not.** Furniture gets its name after the puzzle has been
generated. Renaming can therefore never break a puzzle — which is exactly why the world
layers are safe.

**A drawing closes, a line does not.** A filled path ends in `Z`, a line does not. A
furniture piece stands on the floor (bottom ≥ 36 of 48) and has exactly one part with
`grond: true`. The keuring fails otherwise.

**No key in the repository.** `.env` is git-ignored, `.env.example` holds only a
placeholder, and no API runs online. The library's AI texts are written in advance and sit
in the repo as JSON.

## External services

- **GitHub Pages** — hosts the site from `main`. No build step; every push is a deploy.
- **Anthropic API** — optional, local only, via `server/serve.mjs` → `/api/flavour`. The
  endpoint accepts a puzzle id and nothing else. Failure mode: the site falls back to its
  own template texts without an error.
- **Cloudflare Workers** (`worker/`) — written but not deployed; the free plan's 10 ms CPU
  budget is too little to verify a puzzle. See `STATUS.md`.

## Where to go

| what you want | where |
|---|---|
| add a world | `worlds.js`, `kamersoorten.js` (`SOORT_VAN`, `WERELDMEUBELS`), `bordrand.js`, `scenes.js`, `iconen.js`, `app.css` |
| add a furniture piece | `kamersoorten.js` (`MEUBELS_VAN`), `meubelkunst-geschilderd.js`, `meubelkunst.js` |
| add a name | `worlds.js` and `namen.js` (portrait) and sometimes `iconen.js` |
| add a kind of case | `zaken.js`, plus a mark in `personenkunst-geschilderd.js` |
| make puzzles harder or easier | `difficulty.js` |
| enforce a new rule | `check-kamers.mjs` (content) or `check-regels.mjs` (puzzles) |
| something on the play screen | `player.js`, and the board itself in `board-rooms.js` |

## Known debt

- The keuring never draws the board frames, so a fault in `bordrand.js` that only breaks at
  draw time is not caught — impact: a visual regression ships. Accepted for now.
- The solution is present in the page; anyone opening the console can read it. Fine for the
  intended audience, blocking for any competitive use.
- The board cells are `rect` elements without focus, so the game cannot be played with a
  keyboard or a screen reader. Open, see `STATUS.md`.
- `src/ui/bordrand.js` is ~3000 lines and mixes drawing code with per-world data.
