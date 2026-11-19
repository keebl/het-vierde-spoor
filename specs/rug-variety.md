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

## Proposal
1. **One size per design, one design per size**, turning allowed (h×b or b×h). Two
   designs never share a size, so a size tells you the pattern and the other way round:

   | design | name in clues | size |
   |---|---|---|
   | Persian (`kleedperzisch`) | het Perzische kleed | 2×3 |
   | checked (`kleedruit`) | het geruite kleed | 2×2 |
   | striped (`kleedstreep`) | het gestreepte kleed | 1×3 (runner) |
   | round (new) | het ronde kleed | 3×3, drawn as a circle; large rooms only |
   | rag rug (new) | het lappenkleed | 1×2 |
   | sheepskin (new, not in modern worlds' wet rooms) | de schapenvacht | 1×1 |

   A design that does not fit in a room is skipped there; no smaller fallback (that was
   the inconsistency).
2. **More designs per room kind**: every kind that has rugs offers at least two, and a
   board prefers a design it has not used yet before repeating one.
3. Drawings for the three new designs in `board-rooms.js` (`KLEEDDESSIN`), with the same
   floor margin; the round rug and the sheepskin get their own outline, not a rectangle.

## Cost
Engine change: every board shifts once. Rewrite `tools/vingerafdruk-kamers.txt`, rebuild
`pool/` (300 seeds per level 5 and 6) and run the full keuring before the PR.

## Acceptance
- No board has the same design in two sizes, and the size table maps one-to-one (new
  keuring rule in `check-kamers.mjs`).
- On a sample of 50 manor boards no single design appears more than twice.
- Screenshot of a level-3 and a level-6 board with at least two different rugs.

