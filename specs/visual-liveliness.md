# Spec: make it look alive

Status: accepted (directions 1 and 5)
Date: 2026-11-10

## Decision (2026-11-10)

The owner answered the first question: **both** — the site and the puzzles. His words:
livelier, cheerful colours that appeal to teenagers, less minimalist, "gewoon leuk
aangekleed". That reopens the palette decision at the top of `styles/app.css`:

- The single gold accent is replaced by a bright set (`--pop-1` … `--pop-6`: pink,
  orange, yellow, teal, blue, purple). Pink is the click colour; the others decorate.
- Cream paper becomes a light page with soft colour blobs; dark mode becomes deep purple
  instead of near-black.
- Inside a case the page still takes the world's colour, but stronger, and the world
  accent is a saturated version of the world colour instead of a hint on rust.
- On the board: brighter floors per room kind and brighter token colours. The furniture
  drawings, portraits and frames are not touched in this round (directions 2–4 stay open).
- Still no image files: every decoration is CSS or inline SVG.

Handover brief. Written to be opened cold in a new session: everything you need is
here or linked from here. The code is Dutch, this document is English — see
`docs/decisions/0004-dutch-is-the-language-of-the-code.md` on branch `chore/adopt-standard`.

## The complaint

From the player the whole project exists for — the owner's ten-year-old daughter, who
finished the puzzle book *Murdoku* and wanted more:

> "ik vind het er gewoon niet zo leuk uit zien"

Her father asked what she meant and relayed it:

> "met het ziet er niet leuk uit bedoelt ze dat we saaie kleuren en plaatjes gebruiken.
> Ik denk dat het de artistieke levendigheid mist."

So: **dull colours, dull drawings, no artistic life.** That is the whole brief. She is the
yardstick (`docs/PRODUCT.md`), not the owner and not taste in the abstract.

## Why it looks the way it does (read before changing anything)

This is not neglect. The restraint is a decision, written down at the top of
`styles/app.css`:

- **One accent colour.** Gold/rust `#a3551f`, used only for things you click. An earlier
  version gave every world its own accent and the result was six colours competing on a
  cream page.
- **Cream paper, not black.** `--bg: #f7f2e8`. The metaphor is a puzzle book lying open on
  a table.
- **The page takes the world's colour when you open a case** — background, surface, text
  and line shift together. The library and the home page stay cream, because there all
  thirteen worlds sit side by side and one colour would take sides.
- **Everything is drawn in code.** No image files anywhere, deliberately
  (`docs/PRODUCT.md` non-goals). Furniture, portraits, board frames, floor motifs, card
  art, icons: all SVG built at runtime.

The point: *livelier* cannot mean *add things* — that lesson is already in this project's
history (a scifi frame around a wooden living room does not count as theming). It means
**draw differently**, and here it probably also means **the palette decision has to be
revisited**, which is a product decision the owner should sign off on.

## What was already tried (2026-11-09, commit `99e0d63`)

The library cards' atmosphere drawings used to be flat planes: one colour per depth layer,
and all thirteen the same grey-blue. A painting pass was added in `src/ui/scenes.js`:

- a gradient per depth layer (aerial perspective),
- the world's colour over the whole drawing via `soft-light`, not just the sky,
- a real radial glow behind every light instead of a 30%-opacity disc,
- horizon haze, a vignette, and film grain,
- four silhouettes redrawn because they read mechanically (forest = identical triangles at
  a fixed step; skyline = plain rectangles; fence = identical pickets; manor = a pentagon).

That helped the cards and did not touch the rest. **Her verdict came after that change**,
so assume the cards are no longer the worst offender — or verify that with her first.

## Where the drawing lives

| File | What |
|---|---|
| `src/ui/geschilderd.js` | The painting engine: materials (`STOFFEN`), light, edge and depth masks, textures. Everything that makes a shape look like wood or metal. **Change this and all ~120 furniture pieces change at once.** |
| `src/ui/vormen.js` | The shape vocabulary (`romp`, `plaat`, `poot`, `bol`, `ton`, `kap`, `hoop`…). The handwriting: no square rectangles, everything tapers or sags a little. |
| `src/ui/meubelkunst-geschilderd.js` | ~120 furniture drawings, 48×48, built from those shapes. |
| `src/ui/meubelkunst.js` | The older flat line-art set, still required for every base name (`check-kamers.mjs` enforces it) but not what the board shows. |
| `src/ui/personenkunst-geschilderd.js` | The portraits: hair, skin, clothing, the mark on the figure the case is about. |
| `src/ui/bordrand.js` | 3000 lines: a decorated frame per world. |
| `src/ui/aankleding.js` | Floor motifs per room kind — a rug, a puddle, leaves, ripples. Deliberately subliminal. |
| `src/ui/board-rooms.js` | The board itself: floor patterns (`DESSINS`), walls, room names, the compass. |
| `src/ui/scenes.js` | The card art (13 worlds) + the painting layer described above. |
| `src/ui/icons.js` | ~270 line pictograms for the clue list and the legend. |
| `styles/app.css` | The site palette, the world palettes (`body[data-wereld=…]`), dark mode. |

## Directions worth considering

Ordered by how much they change, not by preference. Pick with the owner; do not do all of
them at once, because then nobody can tell which one she reacted to.

1. **Saturation and contrast in the world palettes.** The cheapest real lever. The worlds
   currently sit in a narrow, muted band. Compare them side by side first (there is a
   scratch page, `vergelijk.html`, and `iconen.html` for the pictograms) before touching
   anything.
2. **The base furniture set is a 1930s manor** — hearth, grand piano, steamer trunk, coal
   bunker — and every world renames those pieces rather than redrawing them. She has
   already said the objects look too old-fashioned once before; daylight worlds were added
   instead of redrawing the set. This is the deferred item, and it is the biggest one: it
   touches every world. See `STATUS.md` → "Modernise the base furniture set".
3. **Light on the board.** The painting engine gives every piece the same light from the
   same angle. Lamps, candles and windows on the board do not actually cast anything. A
   warm pool of light around a light source would change the whole feel of a room, in one
   place in the code.
4. **The portraits.** Twelve hairstyles and a handful of skin tones carry 427 names. They
   are the thing a player looks at most (they sit in the sticky bar all game) and they are
   the least varied drawings in the project.
5. **The chrome.** Cream paper plus one accent is the restrained end of the scale. If the
   verdict is that the *site* is dull rather than the drawings, this is where it lives —
   and it means reopening the decision at the top of `styles/app.css`, which is a product
   call, not a styling tweak.

## Constraints you may not quietly break

- **No image files.** Drawn in code, or not at all.
- **A drawing may not lie.** A world layer may rename a piece, never re-draw it as
  something else. Reusing a drawing whose shape says something different is the bug this
  project keeps making: a filing rack sold as a hay rack, a grandfather clock in a shower.
- **`npm run check:all`** (7 checks, 4–5 min) must be green before anything ships; read the
  verdict from the `volledige keuring exit=` line and the goed/FOUT table, not from the
  shell's exit code. `npm run check:snel` (~1 s) during the work. `check-kamers.mjs`
  enforces the drawing rules: filled paths close with `Z`, bounds −1..49, bottom ≥ 36,
  width and height ≥ 14, at least 3 parts, exactly one part with `grond: true`, and a
  material that exists.
- **Pushing is deploying.** `main` → GitHub Pages, no build step.
- **Everything follows from the seed.** Adding a draw mid-sequence shifts every existing
  puzzle. Give anything new its own rng: `makeRng(\`${seed}:something\`)`.

## How to know it worked

Not from the keuring — it never draws the board frames and it cannot see a palette. The
only verification that counts:

1. Screenshots, looked at, before claiming anything is done. Several worlds, light **and**
   dark, phone **and** desktop.
2. Her. Change one thing at a time, show it to her, write down what she says. She is ten;
   she will not give you a design critique, but she will say which one she likes, and that
   is the measurement.

## First question for the owner

Which is dull — the board you play on, or the site around it? The answer points at
completely different files, and the brief as relayed does not separate them. A screenshot
from her of the screen she was looking at is worth more than any amount of guessing.
