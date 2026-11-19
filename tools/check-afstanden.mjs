// Elke afstand tussen dingen op de site komt uit de schaal in styles/app.css
// (--s1 … --s8, en de drie rollen --ruimte-binnen, -tussen en -sectie).
// Deze toets faalt op een gap of marge met een getypte lengte: `gap: 5px`,
// `margin-top: 1.2rem`.
//
// Waarom: er stonden acht verschillende afstanden door elkaar, tussen twee
// klepjes 12, 28, 48, 64 of 80 pixels, en het bord plakte tegen de
// schakelaars eronder (Guus, 2026-11-19: "sommige te dicht op elkaar en
// andere weer te veel afstand"; specs/spacing-rhythm.md). Eén getypte
// waarde is zo weer binnen.
//
// Uitzonderingen staan op hun eigen regel met een reden erbij:
// `/* ui-lint: allow — <reden> */`. De printversie (@media print) telt
// niet: papier rekent in millimeters.
//
// node tools/check-afstanden.mjs [bestand]   (standaard styles/app.css)

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const bestand = process.argv[2] ?? fileURLToPath(new URL('../styles/app.css', import.meta.url));
const regels = readFileSync(bestand, 'utf8').split('\n');

const AFSTAND = /(?:^|[\s;{])((?:row-|column-)?gap|margin(?:-(?:top|bottom|left|right|block|inline)(?:-(?:start|end))?)?)\s*:\s*([^;}]*)/g;
// Een getal met een lengte-eenheid, buiten var(...) gerekend. 0 zonder
// eenheid, auto en var(--…) mogen; calc() met alleen tokens ook.
const GETYPT = /(?<![\w-])-?\d*\.?\d+(px|rem|em|mm|pt|vh|vw|ch)\b/;

const fouten = [];
let diepte = 0;
let printTot = -1; // diepte waarop het @media print-blok sluit

regels.forEach((regel, i) => {
  const zonderCommentaar = regel.replace(/\/\*.*?\*\//g, '');
  if (printTot < 0 && /@media[^{]*\bprint\b/.test(zonderCommentaar) && !/\bscreen\b/.test(zonderCommentaar)) {
    printTot = diepte;
  }
  if (printTot < 0 && !/ui-lint: allow — \S/.test(regel)) {
    for (const [, eigenschap, waarde] of zonderCommentaar.matchAll(AFSTAND)) {
      const kaal = waarde.replace(/var\([^()]*\)/g, '');
      if (GETYPT.test(kaal)) fouten.push(`${i + 1}: ${eigenschap}: ${waarde.trim()}`);
    }
  }
  for (const teken of zonderCommentaar) {
    if (teken === '{') diepte++;
    if (teken === '}') {
      diepte--;
      if (diepte === printTot) printTot = -1;
    }
  }
});

for (const f of fouten) console.log(`GETYPTE AFSTAND   ${f}`);
console.log(fouten.length
  ? `\n${fouten.length} FOUTEN: gebruik --ruimte-binnen, --ruimte-tussen, --ruimte-sectie of --s1…--s8`
  : 'elke afstand komt uit de schaal');
process.exit(fouten.length ? 1 : 0);
