// De zwaartemaat van het pad kalibreren (specs/level-path.md, plan stap 1).
//
// Meet src/engine/zwaarte.js over de keuringsset per niveau (keur-0..9 en de
// kamerzaken van de bibliotheek; niveau vijf en zes uit pool/, die bouwen
// minuten) en eist dat de mediaan per niveau stijgt: een maat die niveau
// drie zwaarder noemt dan niveau vier, kan het pad niet ordenen. Drukt per
// niveau de mediaan, het minimum en het maximum af.
//
// Gebruik: node tools/meet-zwaarte.mjs   (ongeveer een halve minuut)

import { readFileSync } from 'node:fs';
import { CATALOG, catalogSettings } from '../src/content/catalog.js';
import { bouwKamerGen, genUitData, puzzleId, wereldVoorSeed } from '../src/puzzle.js';
import { redeneer } from '../src/engine/redeneer.js';
import { zwaarte } from '../src/engine/zwaarte.js';

const mediaan = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

export function meetNiveau(niveau) {
  const pool = niveau >= 5 ? JSON.parse(readFileSync(new URL(`../pool/niveau-${niveau}.json`, import.meta.url))).borden : null;
  const instellingen = [
    ...CATALOG.filter((e) => e.mechaniek === 'kamer' && e.niveau === niveau).map(catalogSettings),
    ...Array.from({ length: 10 }, (_, i) => {
      const seed = pool ? `voorraad-${i}` : `keur-${i}`;
      return { opdracht: 'dader', mechaniek: 'kamer', wereld: wereldVoorSeed(seed), niveau, seed };
    }),
  ];
  const uit = [];
  for (const s of instellingen) {
    const data = pool?.[puzzleId(s)];
    if (pool && !data) continue;
    const gen = data ? genUitData(data) : bouwKamerGen(s);
    const spoor = redeneer(gen.rooster, gen.aanwijzingen);
    if (spoor.opgelost) uit.push(zwaarte(gen.rooster.n, spoor.graad));
  }
  return uit;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let vorige = -Infinity;
  let fouten = 0;
  for (const niveau of [1, 2, 3, 4, 5, 6]) {
    const z = meetNiveau(niveau);
    const m = mediaan(z);
    console.log(`niveau ${niveau}: mediaan ${m}, ${Math.min(...z)}–${Math.max(...z)} (${z.length} borden)`);
    if (!(m > vorige)) { fouten++; console.log(`FOUT  niveau ${niveau} is niet zwaarder dan het niveau eronder`); }
    vorige = m;
  }
  console.log(fouten ? `${fouten} fouten` : 'de maat ordent de niveaus');
  process.exit(fouten ? 1 : 0);
}
