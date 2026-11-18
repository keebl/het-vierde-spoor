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
  // Eerst de vaste zaken van de bibliotheek, dan voorraad-seeds tot er
  // `aantal` zijn die hun sjabloon halen (mis 0): offline bouwen en daarna
  // kiezen, zoals een puzzelboek dat ook doet. Een seed die het niet haalt
  // slaan we over; "Nieuwe puzzel" kiest alleen uit wat hier staat.
  const uit = {};
  const t0 = Date.now();
  for (const s of CATALOG.filter((e) => e.mechaniek === 'kamer' && e.niveau === niveau).map(catalogSettings)) {
    uit[puzzleId(s)] = genNaarData(bouwKamerGen(s));
  }
  const seeds = [];
  for (let i = 0; seeds.length < aantal && i < aantal * 3; i++) {
    const seed = `voorraad-${i}`;
    const s = { opdracht: 'dader', mechaniek: 'kamer', wereld: wereldVoorSeed(seed), niveau, seed };
    const gen = bouwKamerGen(s);
    if (gen.mis) continue;
    uit[puzzleId(s)] = genNaarData(gen);
    seeds.push(seed);
  }
  aantallen[niveau] = seeds;
  const lijst = Object.keys(uit);
  writeFileSync(new URL(`../pool/niveau-${niveau}.json`, import.meta.url), `${JSON.stringify({ versie: BORDVERSIE, borden: uit })}\n`);
  console.log(`niveau ${niveau}: ${lijst.length} borden in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}
writeFileSync(new URL('../src/content/voorraad.js', import.meta.url), `// Geschreven door tools/pool.mjs: welke voorraad-seeds er per niveau in
// pool/niveau-N.json liggen (alleen die hun sjabloon halen).

export const VOORRAAD_NIVEAUS = ${JSON.stringify(VOORRAAD_NIVEAUS)};
export const VOORRAAD = ${JSON.stringify(aantallen)};
`);
