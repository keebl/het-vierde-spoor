# Design — Reconstructie

The visual target in words. Claude reads this and the images in `design/refs/` before any
UI or illustration work, and compares its output against them before calling it done.

Drafted 2026-11-14 during the workbench repair round from `specs/visual-liveliness.md`, the
tokens at the top of `styles/app.css` and `docs/PRODUCT.md`. Lines marked `(assumption)`
are inferred and not yet confirmed by the owner. The yardstick is the ten-year-old player
the project exists for (`docs/PRODUCT.md`), not taste in the abstract.

## Mood (three to five words)
Cheerful, lively, hand-drawn, a little mysterious. "Gewoon leuk aangekleed", in the owner's
words — for a teenager, not for an adult puzzle magazine.

## References
`design/refs/` contains no images yet. Candidates, for the owner to pick three to six
(look, do not copy — no art, names or puzzles from any of them enter the code):
1. *Monument Valley* (ustwo games) — saturated pastel palette on simple architecture; how
   bright colour and calm composition coexist.
2. *Unpacking* (Witch Beam) — rooms seen from above, full of small honest objects; the
   detail level the furniture drawings should reach, and modern objects that look modern.
3. *A Little to the Left* (Max Inferno) — cheerful flat object drawings with a hand-made
   edge; the furniture's line and colour.
4. *Professor Layton* puzzle screens (Level-5) — a mystery for children that is warm, not
   grim; how a "case" can feel inviting.
5. *Hidden Folks* (Adriaan de Jongh, Sylvain Tegroeg) — dense hand-drawn scenes where every
   small thing is legible; the "draw differently, not add things" lesson.
6. The live site today, light and dark, phone and desktop — the baseline every change is
   compared against (screenshots, not a target).

## Palette
- Tokens in `styles/app.css` `:root`, never hard-coded colours: background `--bg`
  `#fff8f0`, surfaces `--surface` / `--surface-2` / `--surface-3`, text `--text` `#2a1b3d`
  with `--text-2` / `--text-3`, lines `--line` / `--line-soft`.
- Accent: pink `--accent` `#e8337f` is the click colour, and only that. The bright set
  `--pop-1` … `--pop-6` (pink, orange, yellow, teal, blue, purple) decorates: background
  blobs, the rainbow stripe under the header, the colour per difficulty level.
- Inside a case the whole page takes the world's colour (`body[data-wereld=…]`):
  background, surface, text and line shift together. The home page and the library stay
  neutral, because there all worlds sit side by side.
- On the board: a tint per room (`KAMERTINT` in `src/ui/board-rooms.js`), walls in the
  world colour, materials from `STOFFEN` in `src/ui/geschilderd.js`.

## Light and dark
Both, from day one: the theme follows the device by default and can be switched
(`body[data-thema="licht"|"donker"]`). Dark is deep purple, not near-black. Every change is
checked in both.

## Language
Dutch only, for the site and for the puzzles (`<html lang="nl">`). No English version is
planned. (assumption)

## Accessibility
- Contrast: text tokens on their surfaces aim for WCAG AA (4.5:1 for body text);
  decoration colours (`--pop-*`) never carry text or meaning on their own. (assumption: not
  yet measured)
- Labels: every control has a visible label or an `aria-label`. (assumption: not yet
  audited; `src/ui/` has seven `aria-label`s today)
- Zoom and text size: layouts must survive 200% zoom and a larger system font.
- Known gap: board cells are `rect` elements without focus, so the game cannot yet be
  played with a keyboard or a screen reader (`STATUS.md` Next, item 4).

## Typography
- Display (headings, names, mode buttons): `--display` — Baloo 2 (since 2026-11-17, chosen
  by the owner over Fredoka and Grandstander), falling back to Avenir Next and the system
  sans. Story text: `--serif` (Iowan Old Style, Palatino, Georgia). Controls, clues and
  other body text: `--sans` — Nunito, falling back to the system UI font. On the board:
  `--schrift` — Patrick Hand, a handwritten letter.
- All three web fonts are self-hosted in `styles/fonts/` (SIL OFL 1.1, licences next to
  them; Latin subset only, about 165 KB together) and declared at the top of
  `styles/app.css`. No request goes to a font service.
- Fixed scale `--t-xs` … `--t-2xl` (0.75rem to 2.4rem); every font has a system fallback so
  the site works offline.

## Shape, density, detail
- Corners rounded: `--r-sm` 10px, `--r` 16px, `--r-lg` 22px; pills for chips. Shadows: a
  short "pop" shadow (`--schaduw-pop`), not soft blur only.
- Density: generous around the board, dense inside it. Fixed spacing scale `--s1` …
  `--s8`.
- Detail level for illustrations: **rich, painted, many small elements** — gradients per
  material, light, texture, a hand-made edge on every shape (`src/ui/vormen.js`: nothing is
  a square rectangle). Not flat, not minimal.

## Motion
Subtle: the atmosphere scene moves slowly, controls respond on hover and press. Nothing
that delays play. (assumption)

## Avoid
- Sepia and brown overlays that pull everything to one muddy tone (the 2026-11-10 board
  problem).
- Six accents competing on one page; decoration colours used as click colours.
- A drawing that lies: a piece renamed to something its shape does not show.
- "Theming" by adding a frame around an unchanged room.
- Image files of any kind (`docs/PRODUCT.md` non-goal).

## Asset conventions
- Everything visible is drawn in code: icons in `src/ui/icons.js`, furniture in
  `src/ui/meubelkunst-geschilderd.js`, portraits in `src/ui/personenkunst-geschilderd.js`,
  board frames in `src/ui/bordrand.js`, card scenes in `src/ui/scenes.js`.
- No generated or raster images; `design/refs/` holds references only, never shipped.
