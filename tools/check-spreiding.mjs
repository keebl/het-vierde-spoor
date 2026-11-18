// Keurt de spreiding van de aanwijzingen op het kamerbord
// (specs/harder-clues.md). De dochter vond de aanwijzingen te makkelijk en te
// eentonig: "zelfde rij als X" plus "zelfde kolom als Y" wees iemand gewoon
// aan, sommige namen hadden er drie of meer, en "ten noorden van" stond er
// negen keer in. Per puzzel:
//
//   1. geen aanwijzing op rij of kolom (opRij, opKolom);
//   2. een opgevraagde hint is geen rij, kolom of kamer;
//   3. geen naam heeft meer aanwijzingen dan het plafond van het niveau
//      (maxPerNaam; niveau zes heeft er nog geen), geteld met de indeling
//      van de speler zelf: een aanwijzing over twee mensen telt bij
//      allebei, een telling bij niemand;
//   4. geen soort komt vaker voor dan zijn deel (maxPerSoort: een kwart,
//      op niveau zes een derde);
//   5. vanaf niveau 3 laat geen aanwijzing over één persoon, alleen op een
//      leeg bord, die persoon minder dan drie vakjes;
//   6. geen aanwijzing of hint noemt het slachtoffer, en er is precies één
//      oplossing;
//   7. dezelfde seed geeft twee keer hetzelfde bord;
//   8. tot en met niveau drie is geen aanwijzing overbodig: haal er één weg
//      en doorstrepen lost het bord niet meer op. (Daarboven rekent de
//      tweede snoeironde met een werkbudget, dus daar is het geen belofte.)
//      Een review op #15 vond een terugval die een niet-afgeronde poging kon
//      kiezen; deze regel had dat gevangen.
//
// Over de kamerzaken van de bibliotheek en keur-0..9 op niveau 1-5 plus
// keur-0..2 op niveau 6. Eerst de weigerkant: per regel een met de hand
// verknoeide puzzel waarop de toets moet omvallen. Een toets die nooit
// omvalt, keurt niets.

import { CATALOG, catalogSettings } from '../src/content/catalog.js';
import { buildPuzzle, wereldVoorSeed } from '../src/puzzle.js';
import { aanwijzingenPerPersoon } from '../src/aanwijzingen.js';
import {
  extraAanwijzing, maxPerSoort, vakjesOver, isEigen, overStuk, opIets, isOf, bandMis,
} from '../src/engine/generate-rooms.js';
import { redeneer } from '../src/engine/redeneer.js';
import { telPlaatsingen, graad } from '../src/engine/rooms.js';
import { kamerParams } from '../src/engine/difficulty.js';
import { makeRng } from '../src/engine/rng.js';
import { zinVoor } from '../src/content/rooms-text.js';

const VERBODEN = new Set(['opRij', 'opKolom']);
const VERBODEN_HINT = new Set(['opRij', 'opKolom', 'kamer']);

export function keur(p, { hint = null, uniek = true } = {}) {
  const fouten = [];
  const params = kamerParams(p.niveau);
  const ruw = p._ruwe;

  for (const c of ruw) if (VERBODEN.has(c.soort)) fouten.push(`regel 1: ${c.soort}`);
  if (hint && VERBODEN_HINT.has(hint.soort)) fouten.push(`regel 2: hint is ${hint.soort}`);

  // Met een sjabloon (engine-extension stap 8) zijn de plafonds strenger:
  // twee regels per naam (criterium 10) in plaats van drie tot vijf.
  const sjabloon = !!params.bouw;
  const plafond = sjabloon ? 2 : params.maxPerNaam;
  const { perPersoon } = aanwijzingenPerPersoon(p);
  perPersoon.forEach((lijst, i) => {
    if (plafond != null && lijst.length > plafond) {
      fouten.push(`regel 3: ${p.personen[i]} heeft ${lijst.length} aanwijzingen (max ${plafond})`);
    }
  });
  if (sjabloon) {
    // Regel 9: elke verdachte precies één eigen aanwijzing (criterium 9).
    const eigen = ruw.filter(isEigen);
    p.personen.forEach((_, i) => {
      if (i === p.slachtofferIdx) return;
      const aantal = eigen.filter((c) => c.p === i).length;
      if (aantal !== 1) fouten.push(`regel 9: ${p.personen[i]} heeft ${aantal} eigen aanwijzingen`);
    });
    // Regel 10: relationeel en algemeen samen hooguit ceil(personen / 3).
    const samen = ruw.length - eigen.length;
    const max = Math.ceil(p.personen.length / 3);
    if (samen > max) fouten.push(`regel 10: ${samen} aanwijzingen over twee of iedereen (max ${max})`);
    // Regel 11: minstens de helft over iets op het bord; vanaf niveau drie
    // een stuk om op te zitten en een "of" (criterium 11 van beide specs).
    if (eigen.filter(overStuk).length * 2 < eigen.length) fouten.push(`regel 11: ${eigen.filter(overStuk).length} van ${eigen.length} eigen aanwijzingen over het bord`);
    if (p.niveau >= 3 && !ruw.some(opIets)) fouten.push('regel 11: geen aanwijzing over iemand op een stuk');
    if (p.niveau >= 3 && !ruw.some(isOf)) fouten.push('regel 11: geen "of"');
    // Regel 12: de menselijke solver lost hem op, binnen de band (criterium 7).
    if (uniek) {
      const mis = bandMis(redeneer(p._rooster, ruw), params.bouw.band);
      if (mis) fouten.push(`regel 12: buiten de band van niveau ${p.niveau} (mis ${mis.toFixed(2)})`);
    }
  }

  const perSoort = new Map();
  for (const c of ruw) perSoort.set(c.soort, (perSoort.get(c.soort) ?? 0) + 1);
  const max = maxPerSoort(ruw.length, params.soortDeel);
  for (const [soort, aantal] of perSoort) {
    if (aantal > max) fouten.push(`regel 4: ${soort} ${aantal} van ${ruw.length} keer (max ${max})`);
  }

  const minVrij = params.bouw?.minVrij ?? params.minVrij;
  if (minVrij) {
    for (const c of ruw) {
      if (c.p == null || c.q != null) continue;
      const over = vakjesOver(p._rooster, c);
      if (over < minVrij) fouten.push(`regel 5: ${c.soort} over ${p.personen[c.p]} laat ${over} vakjes`);
    }
  }

  for (const c of [...ruw, ...(hint ? [hint] : [])]) {
    // Ook niet als de ander in een paar, een "ofwel" of een "wie op het
    // kleed" (Guus, 2026-11-18): de naam komt in geen enkele aanwijzing voor.
    if (c.p === p.slachtofferIdx || c.q === p.slachtofferIdx || c.ref === p.slachtofferIdx) fouten.push(`regel 6: ${c.soort} noemt het slachtoffer`);
    if (zinVoor(c, p.woorden).includes(p.slachtofferNaam)) fouten.push(`regel 6: de zin noemt ${p.slachtofferNaam}`);
  }
  if (uniek) {
    const uit = telPlaatsingen(p._rooster, ruw, 2, 30000 * p._rooster.n);
    if (uit.opgegeven || uit.count !== 1) fouten.push(`regel 6: ${uit.opgegeven ? 'niet uit te rekenen' : `${uit.count} oplossingen`}`);
  }
  if (params.style === 'shallow') {
    ruw.forEach((c, i) => {
      // Een eigen aanwijzing hoort er ook als hij niets toevoegt: iedereen
      // krijgt er één (criterium 9).
      if (sjabloon && isEigen(c)) return;
      if (graad(p._rooster, ruw.filter((_, j) => j !== i)).opgelost) {
        fouten.push(`regel 8: ${c.soort}${c.p != null ? ` over ${p.personen[c.p]}` : ''} is overbodig`);
      }
    });
  }
  return fouten;
}

// Een kopie met andere ruwe aanwijzingen, met zinnen erbij zoals de speler ze
// leest, zodat de indeling per naam precies zo telt als op het scherm.
function metAanwijzingen(p, ruw) {
  return {
    ...p,
    _ruwe: ruw,
    clues: ruw.map((c, i) => ({ n: i + 1, text: zinVoor(c, p.woorden), kind: c.soort })),
  };
}

let fouten = 0;
const fout = (titel, wat) => {
  fouten++;
  if (fouten <= 40) console.log(`FOUT  ${titel}: ${wat}`);
};

// ---------------------------------------------------------------- weigerkant

const bouw = (niveau, seed) => buildPuzzle({
  opdracht: 'dader', mechaniek: 'kamer', wereld: wereldVoorSeed(seed), niveau, seed,
});

// Een niveau-3-bord met een aanwijzing over één verdachte die in zijn eentje
// hoogstens twee vakjes laat: een kleine kamer, een meubelstuk met weinig
// buren, een hoek. Niet elk bord heeft er een, dus zoeken we er een paar af.
function tweeVakjes() {
  for (let s = 0; s < 20; s++) {
    const p = bouw(3, `weiger-${s}`);
    const r = p._rooster;
    const wie = p.personen.findIndex((_, i) => i !== p.slachtofferIdx);
    const kandidaten = [
      ...Array.from({ length: r.kamers }, (_, k) => ({ soort: 'kamer', p: wie, kamerIdx: k, ja: true })),
      ...Array.from({ length: r.meubelAantal }, (_, m) => ({ soort: 'naast', p: wie, m, ja: true })),
      { soort: 'hoek', p: wie, ja: true },
    ];
    const c = kandidaten.find((x) => vakjesOver(r, x) <= 2);
    if (c) {
      // Alleen deze ene aanwijzing, zodat geen andere regel eerst valt.
      return [p, [c]];
    }
  }
  throw new Error('geen bord met een aanwijzing van twee vakjes gevonden');
}

{
  const p2 = bouw(2, 'weiger-0');
  const verdachte = (p) => p.personen.findIndex((_, i) => i !== p.slachtofferIdx);
  const ander = (p) => p.personen.findIndex((_, i) => i !== p.slachtofferIdx && i !== verdachte(p));
  const v2 = verdachte(p2);
  const meubel = p2._ruwe.find((c) => c.m != null)?.m ?? 0;
  const proeven = [
    ['een rijaanwijzing', p2, [...p2._ruwe, { soort: 'opRij', p: v2, m: meubel }], 'regel 1'],
    ['een kolomaanwijzing', p2, [...p2._ruwe, { soort: 'opKolom', p: v2, m: meubel }], 'regel 1'],
    // Vier keer over dezelfde naam op niveau 2 (plafond 3), elk een andere
    // soort zodat alleen regel 3 kan vallen. Een paaraanwijzing telt bij
    // beide namen - de laatste zet de teller van de verdachte op vier.
    ['vier aanwijzingen over één naam', p2, [
      { soort: 'rand', p: v2, ja: true },
      { soort: 'hoek', p: v2, ja: false },
      { soort: 'naast', p: v2, m: meubel, ja: false },
      { soort: 'buren', p: v2, q: ander(p2), ja: false },
    ], 'regel 3'],
    ['een soort voor veertig procent', p2, [
      ...p2._ruwe.filter((c) => c.soort !== 'aantalKamer').slice(0, 6),
      ...[0, 1, 2, 3].map((k) => ({ soort: 'aantalKamer', kamerIdx: k, aantal: 0 })),
    ], 'regel 4'],
    ['een aanwijzing die twee vakjes laat', ...tweeVakjes(), 'regel 5'],
    // Een ware aanwijzing erbij op een bord dat al vastlag: die is overbodig.
    // Niveau 2 bouwt met een sjabloon: een eigen aanwijzing mag overbodig
    // zijn, een over twee mensen niet.
    ['een overbodige aanwijzing', p2, [...p2._ruwe, (() => {
      const n = p2._rooster.n;
      const [a, b] = [v2, ander(p2)];
      return Math.floor(p2.oplossing[a] / n) < Math.floor(p2.oplossing[b] / n) ? { soort: 'noord', p: a, q: b } : { soort: 'noord', p: b, q: a };
    })()], 'regel 8'],
    ['twee eigen aanwijzingen voor één naam', p2, [...p2._ruwe, { soort: 'rand', p: v2, ja: true }], 'regel 9'],
    ['een aanwijzing over het slachtoffer', p2, [...p2._ruwe, { soort: 'rand', p: p2.slachtofferIdx, ja: true }], 'regel 6'],
    ['een "wie op" met het slachtoffer als ander', p2, [...p2._ruwe, { soort: 'wieOp', t: 'kruk', ref: p2.slachtofferIdx, rel: 'noord' }], 'regel 6'],
    ['een "ofwel" met het slachtoffer', p2, [...p2._ruwe, { soort: 'ofwelPersoon', p: v2, q: p2.slachtofferIdx, a: { soort: 'kamer', kamerIdx: 0, ja: true } }], 'regel 6'],
  ];
  for (const [wat, p, ruw, regel] of proeven) {
    const uit = keur(metAanwijzingen(p, ruw), { uniek: false });
    if (!uit.some((f) => f.startsWith(regel))) fout('weigerkant', `${wat} viel niet om op ${regel} (${uit.join('; ') || 'geen fout'})`);
  }
  // Regel 2: een hint over een kamer moet omvallen.
  if (!keur(metAanwijzingen(p2, [{ soort: 'opRij', p: v2, m: meubel }]), { hint: { soort: 'kamer', p: v2 }, uniek: false })
    .some((f) => f.startsWith('regel 2'))) {
    fout('weigerkant', 'een kamerhint viel niet om op regel 2');
  }

  // Een hint vraagt nooit om een kamer, een rij of een kolom, ook niet als
  // er niets anders meer over is: vraag hints tot de vijver leeg is.
  const al = [...p2._ruwe];
  let hints = 0;
  for (let i = 0; i < 2000; i++) {
    const h = extraAanwijzing(p2._rooster, p2.oplossing, p2.slachtofferIdx, al, [], makeRng(`weiger:${i}`));
    if (!h) break;
    hints++;
    if (VERBODEN_HINT.has(h.soort)) { fout('weigerkant', `hint ${hints} is ${h.soort}`); break; }
    al.push(h);
  }
  if (hints < 5) fout('weigerkant', `maar ${hints} hints tot de vijver leeg was`);
}

// ---------------------------------------------------------------- de puzzels

const SEEDS = { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 3 };
const lijst = [];
for (const e of CATALOG) if (e.mechaniek === 'kamer') lijst.push([e.titel, catalogSettings(e)]);
for (const [niveau, aantal] of Object.entries(SEEDS)) {
  for (let s = 0; s < aantal; s++) {
    const seed = `keur-${s}`;
    lijst.push([`n${niveau}/${seed}`, { opdracht: 'dader', mechaniek: 'kamer', wereld: wereldVoorSeed(seed), niveau: Number(niveau), seed }]);
  }
}

const perNiveau = {};
let puzzels = 0;
for (const [titel, settings] of lijst) {
  let p;
  const t0 = Date.now();
  try {
    p = buildPuzzle(settings);
  } catch (e) {
    fout(titel, e.message);
    continue;
  }
  const ms = Date.now() - t0;
  puzzels++;
  const hint = extraAanwijzing(p._rooster, p.oplossing, p.slachtofferIdx, p._ruwe, [], makeRng(`${p.id}:spreidinghint`));
  for (const f of keur(p, { hint })) fout(`${titel} (${p.id})`, f);

  const s = (perNiveau[p.niveau] ??= { puzzels: 0, namen: 0, aanwijzingen: 0, drukst: 0, ms: 0 });
  const { perPersoon } = aanwijzingenPerPersoon(p);
  const tellen = perPersoon.filter((_, i) => i !== p.slachtofferIdx).map((l) => l.length);
  s.puzzels++;
  s.namen += tellen.length;
  s.aanwijzingen += tellen.reduce((a, b) => a + b, 0);
  s.drukst = Math.max(s.drukst, ...tellen);
  s.ms = Math.max(s.ms, ms);
}

// Regel 7: alles volgt uit de seed. Eén bord per niveau nog een keer bouwen
// en vergelijken - een nieuwe trekking zonder eigen rng, of een klok in de
// bouwer, zou hier een ander bord geven.
for (let niveau = 1; niveau <= 6; niveau++) {
  const settings = { opdracht: 'dader', mechaniek: 'kamer', wereld: wereldVoorSeed('keur-0'), niveau, seed: 'keur-0' };
  const a = buildPuzzle(settings);
  const b = buildPuzzle(settings);
  const vingerafdruk = (p) => JSON.stringify([p.oplossing, p._ruwe, p.slachtofferIdx]);
  if (vingerafdruk(a) !== vingerafdruk(b)) fout(`n${niveau}/keur-0`, 'regel 7: twee keer gebouwd, twee verschillende borden');
}

console.log('\nniveau  puzzels  per naam  drukste  traagste');
for (const [n, s] of Object.entries(perNiveau)) {
  console.log(`  ${n}      ${String(s.puzzels).padStart(3)}      ${(s.aanwijzingen / s.namen).toFixed(2)}      ${s.drukst}      ${(s.ms / 1000).toFixed(2)}s`);
}
console.log(`\n${puzzels} kamerpuzzels gekeurd, ${fouten} fouten`);
process.exit(fouten ? 1 : 0);
