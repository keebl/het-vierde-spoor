// De voorraad in de repo (specs/engine-extension.md stap 11, optie B).
//
// Bouwt op de laptop de borden van de trage niveaus vooraf, zodat de eerste
// puzzel van niveau vijf of zes op elk apparaat meteen klaarligt. Per niveau
// één bestand pool/niveau-N.json: { id: bord als data }. Daarin de vaste
// zaken van de bibliotheek en `voorraad-0` tot en met `voorraad-(aantal-1)`;
// "Nieuwe puzzel" kiest op die niveaus uit die seeds (src/content/voorraad.js).
//
// Een bord volgt helemaal uit zijn id, dus dit bespaart alleen rekenwerk; de
// keuring bouwt een steekproef opnieuw en eist hetzelfde (check-voorraad.mjs).
//
// Gebruik: node tools/pool.mjs [aantal per niveau, standaard 40]
// (de spec staat 300 toe; een volle ververs kost op niveau zes ruim een half
// uur van één laptopkern).

import { writeFileSync, mkdirSync } from 'node:fs';
import { CATALOG, catalogSettings } from '../src/content/catalog.js';
import { bouwKamerGen, genNaarData, puzzleId, wereldVoorSeed, BORDVERSIE } from '../src/puzzle.js';
import { VOORRAAD_NIVEAUS } from '../src/content/voorraad.js';

const aantal = Number(process.argv[2] ?? 40);
mkdirSync(new URL('../pool/', import.meta.url), { recursive: true });
const aantallen = {};
for (const niveau of VOORRAAD_NIVEAUS) {
  const lijst = CATALOG.filter((e) => e.mechaniek === 'kamer' && e.niveau === niveau).map(catalogSettings);
  for (let i = 0; i < aantal; i++) {
    const seed = `voorraad-${i}`;
    lijst.push({ opdracht: 'dader', mechaniek: 'kamer', wereld: wereldVoorSeed(seed), niveau, seed });
  }
  const uit = {};
  const t0 = Date.now();
  for (const s of lijst) uit[puzzleId(s)] = genNaarData(bouwKamerGen(s));
  writeFileSync(new URL(`../pool/niveau-${niveau}.json`, import.meta.url), `${JSON.stringify({ versie: BORDVERSIE, borden: uit })}\n`);
  aantallen[niveau] = aantal;
  console.log(`niveau ${niveau}: ${lijst.length} borden in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
writeFileSync(new URL('../src/content/voorraad.js', import.meta.url), `// Geschreven door tools/pool.mjs: hoeveel voorraad-seeds er per niveau in
// pool/niveau-N.json liggen. Zie ook VOORRAAD_NIVEAUS.

export const VOORRAAD_NIVEAUS = ${JSON.stringify(VOORRAAD_NIVEAUS)};
export const VOORRAAD = ${JSON.stringify(aantallen)};
`);
