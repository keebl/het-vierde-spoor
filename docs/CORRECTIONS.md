# Corrections — Reconstructie

Everything Guus had to point out about what he sees. Append only, newest at the bottom,
one line each, in his words. This file is the product's memory of his taste and the
workbench's list of rules that are still missing (`/portfolio-review` reads it in every
project).

Kinds: layout · spacing · type · colour · copy · flow · behaviour · missing state · other.
"Catchable": the check that should have caught it (`ui-lint`, `ui-check <rule>`,
`copy-check <rule>`, `ui-reviewer`, `copy-editor`, `ux-walk`), `new rule: <what>` when none
could yet, or `no` when it is taste nobody could have known.

| Date | Screen | Kind | What Guus said | Fix | Catchable |
|---|---|---|---|---|---|
| 2026-11-19 | Room board, rugs | layout | "Omdat het kleed strak langs de randen van de vakken ligt lijkt het nu niet echt op een kleed" — "er bestaan geen kleden die strak langs een muur liggen in het echt" | Rugs drawn with a floor margin (#31) | new rule: a piece that covers whole cells is drawn inset from the cell edges |
| 2026-11-19 | Room board, rugs | other | "de kleedjes moeten gevarieerder, en als je een zelfde kleed neerlegd hebt dan moet die wel de zelfde grote zijn" | Pattern follows from size, rag rug added (#33) | new rule: one rug design per size (keuring) |
| 2026-11-19 | Rug spec | other | "je hebt nu meerdere kleden met dezelfde patroon in verschillende maten, dat ziet er gek uit. Ik zou per maar 1 patroon aan houden" | Spec changed to one pattern per size (#33) | no |
| 2026-11-19 | Puzzle page (whole site) | spacing | "De afstand tussen de buttons (tekstvlakken/kolommen of hoe wil je ze noemen) is ongelijk sommige te dicht op elkaar en andere weer te veel afstand" — and Claude, asked "wat valt jou op", only looked at the board | One spacing rhythm, 8 / 24 (16 on a phone) / 48 px (`specs/spacing-rhythm.md`, PR after #40) | keuring rule `check:afstanden`: no typed gap or margin in `styles/app.css` |
| 2026-11-19 | Room board, decoration | other | "ik denk dat je piepkleine krukjes versieringen zijn en niet een kruk die je als aanwijzing gebruikt" | Decoration draws no kind that is also a puzzle piece (#39) | keuring rule `VERSIERING IS STUK` (#39) |
| 2026-11-19 | Puzzle page, one column (under 1100 px) | spacing | "er zit veel ruimte tussen hoe je dit bord bedient en de aanwijzingen dat mag net als wat er op het bord staat en de regels van de reconstructie aan afstand hebben" | In one column the clues panel follows the board panels at the between-groups gap (24, 16 on a phone); it had the section gap plus a hidden 16 px panel margin, 64 px (PR #41) | yes: a rendered check that sibling panels in one stack sit equally apart; `check:afstanden` only reads typed values |
