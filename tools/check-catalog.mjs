// Keurt de vaste bibliotheek: bouwt elke puzzel uit de catalogus en
// controleert hem. Deze lijst staat op de site, dus hier mag niets falen.

import { CATALOG, catalogSettings } from '../src/content/catalog.js';
import { buildPuzzle } from '../src/puzzle.js';
import { countSolutions } from '../src/engine/assign.js';
import { countLatinSolutions } from '../src/engine/latin.js';
import { telPlaatsingen } from '../src/engine/rooms.js';
import { levelParams } from '../src/engine/difficulty.js';

let fails = 0;
let slowest = 0;
let slowCase = '';
const rows = [];

for (const entry of CATALOG) {
  const t = Date.now();
  let p;
  try {
    p = buildPuzzle(catalogSettings(entry));
  } catch (e) {
    console.log(`FOUT  ${entry.titel}: ${e.message}`);
    fails++;
    continue;
  }
  const ms = Date.now() - t;
  if (ms > slowest) { slowest = ms; slowCase = entry.titel; }

  const problems = [];
  if (p.kind === 'kamer') {
    if (telPlaatsingen(p._rooster, p._ruwe, p.slachtoffer, 3).count !== 1) problems.push('niet uniek');
    if (p.personen[p.dader] !== p.question.answer) problems.push('antwoord wijkt af');
  } else if (p.kind === 'assign') {
    if (countSolutions(p._spec, p._rawClues, 3).count !== 1) problems.push('niet uniek');
    for (const c of p.clues) if (/undefined|\bis is\b|  /.test(c.text)) problems.push(`rare zin: ${c.text}`);
  } else if (countLatinSolutions(p.givens, p.rows.length, 3).count !== 1) {
    problems.push('niet uniek');
  }
  // Het getallenraster heeft een eigen moeilijkheidsmaat (rastergrootte en
  // aantal gegeven cellen), dus daar geldt de shallow/deep-vergelijking niet.
  const want = levelParams(entry.niveau).style;
  const got = p.kind === 'latin'
    ? `${p.rows.length}x${p.rows.length} raster`
    : p.kind === 'kamer'
      ? `${p.n}x${p.n} kamers ${p.depth === 1 ? 'shallow' : 'deep'}`
      : p.depth === 1 ? 'shallow' : 'deep';

  if (problems.length) {
    console.log(`FOUT  ${entry.titel}: ${problems.join(' | ')}`);
    fails++;
  }
  rows.push(
    `${String(entry.niveau)}  ${entry.titel.padEnd(32)} ${String(p.clues.length).padStart(2)} aanw.  ${
      p.kind === 'latin' || p.kind === 'kamer' || got === want ? got : `${got} (gevraagd: ${want})`
    }  ${ms}ms`
  );
}

console.log(rows.join('\n'));
console.log(`\n${CATALOG.length} catalogus-puzzels, ${fails} fouten, langzaamste ${slowest}ms (${slowCase})`);
process.exit(fails ? 1 : 0);
