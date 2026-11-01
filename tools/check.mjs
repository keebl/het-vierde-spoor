// Keuring van de motor. Bouwt puzzels over alle combinaties en controleert
// de dingen die echt moeten kloppen:
//   - precies een oplossing (inclusief de feiten uit de inleiding)
//   - het antwoord op de vraag volgt uit die oplossing
//   - elke aanwijzing levert een leesbare Nederlandse zin op
//   - de redeneerdiepte past bij het gekozen niveau

import { WORLDS } from '../src/content/worlds.js';
import { ASSIGNMENTS } from '../src/content/assignments.js';
import { buildPuzzle } from '../src/puzzle.js';
import { countSolutions } from '../src/engine/assign.js';
import { countLatinSolutions } from '../src/engine/latin.js';
import { telPlaatsingen } from '../src/engine/rooms.js';
import { LEVEL_IDS, levelParams } from '../src/engine/difficulty.js';

const combos = [];
for (const a of ASSIGNMENTS) {
  for (const m of a.mechanics ?? []) {
    for (const w of WORLDS) for (const l of LEVEL_IDS) combos.push({ a: a.id, m, w: w.id, l });
  }
}

const seeds = Number(process.argv[2] ?? 2);
let built = 0, fails = 0, depthMiss = 0, slowest = 0, slowCase = '';
const perLevel = {};
const clueCounts = [];
const depthTally = {};
const t0 = Date.now();

for (const { a, m, w, l } of combos) {
  for (let s = 0; s < seeds; s++) {
    const settings = { opdracht: a, wereld: w, mechaniek: m, niveau: l, seed: `keur-${s}` };
    const label = `${a}/${m}/${w}/n${l}/s${s}`;
    const t1 = Date.now();
    let p;
    try {
      p = buildPuzzle(settings);
    } catch (e) {
      console.log(`FOUT  ${label}: ${e.message}`);
      fails++;
      continue;
    }
    const ms = Date.now() - t1;
    if (ms > slowest) { slowest = ms; slowCase = label; }
    built++;

    const problems = [];
    if (p.kind === 'kamer') {
      const { count } = telPlaatsingen(p._rooster, p._ruwe, 3);
      if (count !== 1) problems.push(`${count} oplossingen`);
      if (p.personen[p.dader] !== p.question.answer) problems.push('antwoord wijkt af');
      // Waar het lichaam ligt moet je uitpuzzelen: geen aanwijzing mag de
      // kamer van het slachtoffer rechtstreeks noemen, en geen aanwijzing mag
      // zeggen wie er bij hem stond.
      for (const c of p._ruwe) {
        if (c.soort === 'kamer' && c.ja && c.p === p.slachtofferIdx) problems.push('verraadt waar het lichaam ligt');
        if (c.soort === 'zelfdeKamer' && c.ja && (c.p === p.slachtofferIdx || c.q === p.slachtofferIdx)) {
          problems.push('verraadt de dader');
        }
      }
      for (const c of p.clues) {
        if (!c.text || /undefined|NaN/.test(c.text)) problems.push(`rare zin: ${c.text}`);
      }
      clueCounts.push(p.clues.length);
    } else if (p.kind === 'assign') {
      const { count } = countSolutions(p._spec, p._rawClues, 3);
      if (count !== 1) problems.push(`${count} oplossingen`);

      // Klopt het antwoord met de oplossing?
      const q = p.question;
      const cat = q.catId === p.anchor.id ? p.anchor : p.cats.find((c) => c.id === q.catId);
      const idx = q.catId === p.anchor.id ? q.slot : p.solution[q.catId][q.slot];
      if (cat.items[idx] !== q.answer) problems.push(`antwoord wijkt af: ${q.answer} vs ${cat.items[idx]}`);

      for (const c of p.clues) {
        if (!c.text || /undefined|NaN|\[object/.test(c.text)) problems.push(`rare zin: ${c.text}`);
      }
      if (!p.clues.length) problems.push('geen aanwijzingen');
      if (/undefined/.test(p.intro)) problems.push('rare inleiding');
      clueCounts.push(p.clues.length);
    } else {
      const { count } = countLatinSolutions(p.givens, p.rows.length, 3, p._ruweLatin ?? []);
      if (count !== 1) problems.push(`${count} oplossingen`);
      const [r, c] = p.question.cell;
      if (p.symbols[p.full[r][c]] !== p.question.answer) problems.push('antwoord wijkt af');
    }

    const want = levelParams(l).style;
    const got = p.depth === 1 ? 'shallow' : 'deep';
    depthTally[got] = (depthTally[got] ?? 0) + 1;
    perLevel[l] ??= { n: 0, miss: 0, want, rounds: [], clues: [] };
    perLevel[l].n++;
    perLevel[l].rounds.push(p.kind === 'assign' ? (p._grade?.rounds ?? 0) : 0);
    perLevel[l].clues.push(p.clues.length);
    if (want !== got) { depthMiss++; perLevel[l].miss++; }

    if (problems.length) {
      console.log(`FOUT  ${label}: ${problems.join(' | ')}`);
      fails++;
    }
  }
}

const secs = ((Date.now() - t0) / 1000).toFixed(1);
const avg = clueCounts.length ? (clueCounts.reduce((a, b) => a + b, 0) / clueCounts.length).toFixed(1) : 0;
console.log('');
console.log(`gebouwd           ${built} puzzels in ${secs}s`);
console.log(`fouten            ${fails}`);
console.log(`stijl mismatch    ${depthMiss} (${((depthMiss / built) * 100).toFixed(0)}%)`);
console.log(`stijlverdeling    ${JSON.stringify(depthTally)}`);
console.log(`aanwijzingen gem. ${avg}`);
console.log(`langzaamste       ${slowest}ms (${slowCase})`);
console.log('');
console.log('niveau  wil        mis    aanwijzingen  rondes');
for (const l of Object.keys(perLevel)) {
  const r = perLevel[l];
  const avgR = (r.rounds.reduce((a, b) => a + b, 0) / r.rounds.length).toFixed(1);
  const avgC = (r.clues.reduce((a, b) => a + b, 0) / r.clues.length).toFixed(1);
  console.log(`  ${l}     ${r.want.padEnd(9)}  ${String(r.miss).padStart(2)}/${r.n}   ${avgC.padStart(5)}        ${avgR}`);
}
process.exit(fails ? 1 : 0);
