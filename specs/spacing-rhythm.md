# Spec: one spacing rhythm across the site

Status: approved
Date: 2026-11-19 (Guus on the live puzzle page: "De afstand tussen de buttons
(tekstvlakken/kolommen of hoe wil je ze noemen) is ongelijk sommige te dicht op elkaar en
andere weer te veel afstand. Hoe zorgen er voor dat dit er netjes uit komt te zien." Chose
"Spec + decoratie nu" via mission control, ask-5a1c7e20. Approved 2026-11-19: "dit ziet er goed uit ga je gang", with the
recommended answer to the open question.)

## Goal
Every gap on the site says how two things relate, and the same relation always gets the
same gap: things in one group sit close, groups sit further apart, sections further still.
A machine check keeps it that way, so the next change cannot quietly break it.

## Today
`styles/app.css` (3 300 lines) already has a scale, `--s1` … `--s8` (4, 8, 12, 16, 24, 32,
48, 72 px), but nothing says which step is for what, and 51 spacing values are typed by
hand (`gap: 3px`, `gap: 5px`, `margin-bottom: 2mm`, `calc(var(--s2) - var(--s6))`). Measured
on the puzzle page (`#/puzzel/dader.landhuis.kamer.3.demo-4`):

| Between | 1300 px wide | 827 px wide |
|---|---|---|
| Neerzetten · Schetsen · Uitsluiten (one group) | 3 | 3 |
| name buttons, and their rows | 8 | 8 |
| names → mode buttons | 8 | 8 |
| mode buttons → board | 25 | — |
| board → switches under it | **0** | 16 |
| switches → first fold-out | 32 | — |
| fold-out → fold-out | 12, then **64** | 28, 80, 48 |
| right-column fold-outs | 12 | — |
| left column → right column | 48 | — |

The same relation (one fold-out after another) gets 12, 28, 48, 64 or 80 px; a group of
buttons gets 3 px while separate groups get 8.

## Proposal
1. **Three roles, named in `app.css`**, each pointing at the existing scale:
   - `--ruimte-binnen` = 8 px — inside one group: buttons that belong together, name chips,
     a label and its value.
   - `--ruimte-tussen` = 24 px on a wide screen, 16 px on a phone — between groups in one section: names
     → modes → board → switches; fold-out → fold-out.
   - `--ruimte-sectie` = 48 px — between sections: the board block and the explanation
     under it, the story and the board, page header and content.
   Padding inside a box (fold-outs, cards) is its own token, `--ruimte-in` = 12/16 px, the
   same for every box.
2. **Every spacing value in `app.css` uses one of these four** (or `0`). The hand-typed
   ones go. A value that is really fixed by something else (print in `mm`, the board
   frame drawn in SVG) gets `/* ui-lint: allow — <reason> */`.
3. **Buttons that belong together sit in one grid**: same height, same gap
   (`--ruimte-binnen`); mode buttons, the Controleer/Printen/Volgende row, the level tiles
   on the front page, the switches.
4. **The guard**:
   - `tests/ui/ui-check.json` with the four screens (front page, library, one puzzle page,
     explanation) at phone (390) and desktop (1300) width, light and dark;
     `/Users/guus/.claude/bin/ui-check` must report no `uneven-gaps`, `crowded`,
     `tight-padding` or `misaligned` on them.
   - A keuring rule (`check:iconen` already lints content; this one lints `styles/app.css`):
     no `gap`, `margin` or `padding` with a typed length outside the allow comments. Runs in
     `check:snel`, so every PR sees it.

The scale itself stays. Moving to the workbench kit's `--space-*` names and its
components is a separate step (kit README: screens adopt the kit when touched); this spec
only gives the existing scale its roles, so that step becomes a rename.

## Non-goals
- No new look: colours, fonts, sizes of text and buttons stay as they are.
- The board drawing itself (SVG inside the frame) and the print sheets' layout.
- Adopting the workbench `kit.css` components.

## Acceptance criteria
1. Given the puzzle page at 390 and 1300 px, when measured, then every gap from the table
   above is 8, 16/24 or 48 px according to its role, and the board → switches gap is not 0.
2. Given `styles/app.css`, when the new keuring rule runs, then it finds no typed spacing
   length outside an allow comment, and `node tools/keuring.mjs --snel` ends with
   `volledige keuring exit=0`.
3. Given the four screens in `tests/ui/ui-check.json`, when ui-check runs, then it reports
   no `uneven-gaps`, `crowded`, `tight-padding` or `misaligned` warning.
4. Given a deliberately wrong gap (`gap: 5px`) in `app.css`, when the keuring runs, then
   the new rule fails with the line number.
5. Before/after screenshots of the four screens at both widths are in the PR, and Guus has
   looked at them.

## Build plan
1. Add the four role tokens next to `--s1`…`--s8` in `styles/app.css`.
2. Puzzle page first (the screen Guus pointed at): replace each gap with its role; fix
   board → switches; mode buttons in one grid. Screenshot before/after at 390 and 1300.
3. Front page, library, explanation, the closing sheet and the menu: same pass.
4. Remove the remaining hand-typed values or give them an allow comment with a reason.
5. Keuring rule `de afstanden` in `tools/check-afstanden.mjs`, wired into `check:snel`
   and `package.json` (`check:afstanden`); prove it fails on `gap: 5px`.
6. `tests/ui/ui-check.json` for the four screens; run ui-check, fix what it reports.
7. CHANGELOG line, `docs/CORRECTIONS.md` row marked fixed, one PR (or one per screen if
   the diff gets large), with the screenshots.

Estimate: half a day to a day. Risk: the sticky name/mode bar and the phone clue box were
tuned by hand (CHANGELOG, "On a phone, the name pills ... line up on one grid"); they are
re-checked at 390 px in step 2.

## Decided
Between groups: 24 px on a wide screen, 16 px on a phone (the recommendation; Guus,
2026-11-19).
