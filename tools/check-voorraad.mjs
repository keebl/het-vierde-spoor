// De voorraad en de bouwtijd (specs/engine-extension.md stap 11, criteria
// 21 en 23).
//
//   1. Een bewaard bord is precies wat je uit zijn id bouwt: per niveau tien
//      borden uit pool/niveau-N.json opnieuw bouwen en vergelijken. Een
//      verschil betekent dat de motor veranderd is zonder dat de voorraad
//      opnieuw gebouwd is (node tools/pool.mjs).
//   2. De bouwtijd per niveau blijft binnen de begroting van de laptop, over
//      keur-0..9. De begroting staat in BEGROTING; een drukke machine mag
//      SPEELRUIMTE keer zo traag zijn, anders valt de keuring om op wie er
//      toevallig naast draait (zie CLAUDE.md, de keuring op een drukke
//      laptop).

import { readFileSync, existsSync } from 'node:fs';
import { bouwKamerGen, genNaarData, wereldVoorSeed, BORDVERSIE } from '../src/puzzle.js';
import { VOORRAAD_NIVEAUS } from '../src/content/voorraad.js';
import { SCHATTING } from '../src/ui/bouwer.js';

// Seconden, slechtste geval op de laptop. Niveau 1-3, 5 en 6 uit de spec
// (niveau 6 is hier nog zestien bij zestien, dus de begroting van het
// latere niveau zeven). Niveau 4 en 5 bouwen in de worker met een balk, en
// dan telt de doorlooptijd nauwelijks (Guus, 2026-11-18): 4 s, en voor
// niveau vijf 120 s (keuring fase B mat 67 s in de voorraad en 106 s in de
// spreiding; "volgens mij gingen wij asynchroom bouwen, de doorlooptijd
// boeit me dan niet zo").
export const BEGROTING = { 1: 0.25, 2: 0.25, 3: 0.25, 4: 4, 5: 120, 6: 15 };
const SPEELRUIMTE = Number(process.env.BEGROTING_SPEELRUIMTE ?? 1.5);

// `--kort` (elke pull request): drie borden per niveau en drie seeds voor de
// bouwtijd in plaats van tien. Deze toets duurde 17 minuten op een runner en
// hield elke pull request zo lang op (PR #33); bijna alles daarvan was niveau
// vijf. De volle toets draait 's nachts (nachtrun.yml) en voor een release
// (`npm run check:all`).
const AANTAL = process.argv.includes('--kort') ? 3 : 10;

let fouten = 0;
const fout = (waar, wat) => { fouten++; console.log(`FOUT  ${waar}: ${wat}`); };

for (const niveau of VOORRAAD_NIVEAUS) {
  const pad = new URL(`../pool/niveau-${niveau}.json`, import.meta.url);
  if (!existsSync(pad)) { fout(`niveau ${niveau}`, 'pool/niveau-N.json ontbreekt (node tools/pool.mjs)'); continue; }
  const bestand = JSON.parse(readFileSync(pad, 'utf8'));
  if (bestand.versie !== BORDVERSIE) fout(`niveau ${niveau}`, `de voorraad is van versie ${bestand.versie}, de motor is ${BORDVERSIE} (node tools/pool.mjs)`);
  const pool = bestand.borden ?? {};
  const ids = Object.keys(pool);
  const stap = Math.max(1, Math.floor(ids.length / AANTAL));
  let gekeurd = 0;
  for (let i = 0; i < ids.length && gekeurd < AANTAL; i += stap) {
    const [opdracht, wereld, mechaniek, n, ...rest] = ids[i].split('.');
    const settings = { opdracht, wereld, mechaniek, niveau: Number(n), seed: rest.join('.') };
    const nu = JSON.stringify(genNaarData(bouwKamerGen(settings)));
    if (nu !== JSON.stringify(pool[ids[i]])) fout(ids[i], 'het bewaarde bord wijkt af van wat het id nu bouwt');
    gekeurd++;
  }
  console.log(`voorraad niveau ${niveau}: ${ids.length} borden, ${gekeurd} opnieuw gebouwd`);
}

console.log('\nniveau  traagste  begroting');
for (const [niveau, begroting] of Object.entries(BEGROTING)) {
  let traagst = 0;
  for (let s = 0; s < AANTAL; s++) {
    const seed = `keur-${s}`;
    const t0 = performance.now();
    bouwKamerGen({ opdracht: 'dader', mechaniek: 'kamer', wereld: wereldVoorSeed(seed), niveau: Number(niveau), seed });
    traagst = Math.max(traagst, (performance.now() - t0) / 1000);
  }
  console.log(`  ${niveau}      ${traagst.toFixed(2)}s     ${begroting}s`);
  if (traagst > begroting * SPEELRUIMTE) fout(`niveau ${niveau}`, `bouwen duurde ${traagst.toFixed(2)} s, begroting ${begroting} s`);
}

// Het bouwscherm belooft SCHATTING seconden op een telefoon. Die belofte mag
// nooit korter zijn dan wat de laptop al mag kosten; anders zegt het scherm
// "hooguit 90 seconden" bij een bord van twee minuten (fase B).
for (const [niveau, begroting] of Object.entries(BEGROTING)) {
  if (!(SCHATTING[niveau] >= begroting)) fout(`niveau ${niveau}`, `het bouwscherm belooft ${SCHATTING[niveau]} s, de begroting is ${begroting} s`);
}

console.log(`\n${fouten} fouten`);
process.exit(fouten ? 1 : 0);
