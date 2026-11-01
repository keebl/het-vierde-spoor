// De inleiding verklapt waar het lichaam lag en wat ernaast lag; beide horen
// bij de dader. Een aanwijzing die zoiets aan een persoon koppelt is dus het
// antwoord zelf. Deze toets loopt de hele catalogus plus een brede steekproef
// na om te bewijzen dat dat nergens gebeurt.
// Toetst dat geen enkele aanwijzing het antwoord rechtstreeks noemt.
import { CATALOG, catalogSettings } from '../src/content/catalog.js';
import { buildPuzzle } from '../src/puzzle.js';
import { WORLDS } from '../src/content/worlds.js';

function weggevers(p) {
  if (p.kind !== 'assign' || p.opdracht.id !== 'dader') return [];
  const intro = p._rawClues.filter((c) => c.intro);
  if (!intro.length) return [];
  const verboden = new Set();
  for (const c of intro) for (const k of ['a', 'b']) if (c[k]) verboden.add(`${c[k].c}:${c[k].i}`);
  const fout = [];
  for (const c of p._rawClues) {
    if (c.intro || c.kind !== 'same') continue;
    const a = `${c.a.c}:${c.a.i}`;
    const b = `${c.b.c}:${c.b.i}`;
    if ((verboden.has(a) && c.b.c === 'person') || (verboden.has(b) && c.a.c === 'person')) fout.push(c);
  }
  return fout;
}

let totaal = 0, fout = 0;
for (const e of CATALOG) {
  const p = buildPuzzle(catalogSettings(e));
  totaal++;
  const w = weggevers(p);
  if (w.length) { fout++; console.log(`WEGGEVER  ${e.titel}`); }
}
for (const w of WORLDS) {
  for (const m of ['grid', 'map']) {
    for (let n = 1; n <= 5; n++) {
      for (let s = 0; s < 3; s++) {
        const p = buildPuzzle({ opdracht: 'dader', wereld: w.id, mechaniek: m, niveau: n, seed: `wg-${s}` });
        totaal++;
        if (weggevers(p).length) { fout++; console.log(`WEGGEVER  dader/${m}/${w.id}/n${n}/s${s}`); }
      }
    }
  }
}
console.log(`\n${totaal} daderpuzzels gecontroleerd, ${fout} met een weggever`);
process.exit(fout ? 1 : 0);
