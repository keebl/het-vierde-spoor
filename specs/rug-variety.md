# Spec: more rug designs, one size per design

Status: approved
Date: 2026-11-19 (Guus's feedback on a live level-6 landhuis board; approved the same day with
one change: "Ik zou per [maat] maar 1 patroon aanhouden" — every size one pattern)

## Goal
Rugs on a room board look like rugs someone chose for that room: several designs, and the
same design always the same size. Guus, 2026-11-19: "de kleedjes moeten gevarieerder, en
als je een zelfde kleed neerlegt dan moet die wel dezelfde grootte zijn, een ander type
kleed mag weer een andere vorm hebben."

## What is already done (not in this spec)
PR #31: a rug is drawn with floor around it (22 % of a square on each side) instead of
edge to edge. It stays one whole rug, and a square under it that is about half covered
still counts as "op het kleed" (Guus: "gebruikers snappen dat wel"). Drawing only.

## Today
- Three designs (`kleedperzisch`, `kleedstreep`, `kleedruit`), see `REKWISIETEN_VAN` in
  `src/content/kamersoorten.js`. A `zaal` only offers the Persian rug, so a manor board
  showed it four times.
- `zoekKleed` in `src/engine/rooms.js` draws any size from `KLEEDMATEN` (2×3 … 2×1) per
  rug, so the same design came out 2×2 on one spot and 2×3 on the next.

## Proposal (revised 2026-11-19: pattern from size, no board shift)
Guus chose "Ja, omzetten" the same day, with a general rule: "het zelfde geldt voor andere
items die alleen van uiterlijk veranderen maar niet van plaats: dan hoef je de puzzel niet
opnieuw te verzinnen maar alleen het icoontje erop te wijzigen." So the engine is not
touched and no board shifts. The engine keeps choosing where a rug lies and how large it is
(`zoekKleed`, `KLEEDMATEN` in `src/engine/rooms.js`); after generation `src/puzzle.js`
gives each rug the name and drawing of its size (`KLEED_VAN_MAAT` in
`src/content/kamersoorten.js`):

| size (either way) | design | name in clues |
|---|---|---|
| 2×3 | Persian (`kleedperzisch`) | het Perzische kleed |
| 2×2 | checked (`kleedruit`) | het geruite kleed |
| 1×3 | striped runner (`kleedstreep`) | het gestreepte kleed |
| 1×2 | rag rug (`kleedlappen`, new) | het lappenkleed |

1. **One size per design, one design per size.** A size tells you the pattern and the
   other way round, on every board.
2. **Variety follows from the sizes the engine already draws**: every room kind with rugs
   now shows up to four designs instead of one.
3. Drawing for the rag rug in `board-rooms.js` (`KLEEDDESSIN`) and a legend icon, with the
   same `KLEEDMARGE` floor margin.
4. Clue text: a rug is named only when it is the only rug on its board (`typeNaam`),
   otherwise it is "een kleed"; so a rug name in a clue is always unique. Only those clue
   texts change.
5. A room kind's rug entry in `REKWISIETEN_VAN` now means "this room may have a rug", not
   which one; it stays as it is so the offer (and the rng) does not shift. The sweep rule
   "het meubilair past bij de soort ruimte" accepts any design on a rug in such a room.

### With the next board shift (phase C)
- The round rug (3×3, drawn as a circle, large rooms only) and the sheepskin (1×1, own
  outline, not in wet rooms such as the school's kleedkamer or the pool's kleedhokjes):
  the engine does not make those sizes today.
- A board preferring a design it has not used yet, and room kinds choosing among designs:
  both need the engine to pick a size per design.

## Cost
No engine change, no pool rebuild: `pool/` stays valid (`check:voorraad`). Only clue
texts that name the single rug on a board change, so `tools/vingerafdruk-kamers.txt` is
rewritten for that reason alone.

## Acceptance
- The size table maps one-to-one, every rug drawing has a size, and every rug lies with
  the design and name of its size (keuring rules in `check-kamers.mjs` and
  `check-regels.mjs`).
- `kamerVan`, `meubelOp`, the pieces and the solutions of every board are unchanged
  (compared against `main` on 100 boards of levels 1–4; `check:voorraad` for 5–6).
- Screenshot of a level-3 and a level-6 board with at least two different rugs.
- Measured, not required until phase C: on 50 manor boards one design can still appear up
  to four times, because the engine draws the sizes.
