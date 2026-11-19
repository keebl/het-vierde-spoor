// Keurt de menselijke solver van het kamerraster (src/engine/redeneer.js,
// specs/engine-extension.md fase A).
//
//   1. Per techniek een met de hand gemaakte stand waarin hij precies doet
//      wat hij moet doen: welke vakjes vallen af, wie wordt neergezet. En
//      een stand waarin hij niets mag doen.
//   2. Dezelfde puzzel geeft twee keer hetzelfde spoor.
//   3. Over de keuringsset (de kamerzaken van de bibliotheek en keur-0..9
//      op niveau 1-5, keur-0..2 op niveau 6, dezelfde lijst als
//      check-spreiding): de solver zet nooit iemand op een ander vakje dan
//      in de oplossing en streept nooit het goede vakje weg (criterium 1);
//      lost hij een puzzel helemaal op, dan vindt telPlaatsingen er precies
//      één oplossing (criterium 2); elke stap noemt zijn techniek, geldige
//      aanwijzingen en wat hij wegstreepte of neerzette (criterium 3).
//   4. Geen bord verschuift (criterium 6): elke puzzel van de keuringsset
//      heeft dezelfde vingerafdruk als in tools/vingerafdruk-kamers.txt,
//      vastgelegd op 2026-11-18 vóór fase A. Fase B laat elk bord één keer
//      verschuiven (beslissing 4 van de spec); dan schrijf je de lijst
//      opnieuw met `node tools/check-redeneer.mjs --schrijf`, in dezelfde
//      commit als de verschuiving, zodat de diff laat zien dat het bewust is.
//
//   5. De genummerde oplossing in woorden (criterium 4): elke stap heeft
//      zinnen, geen gat ("undefined"), de naam van het slachtoffer komt er
//      niet in voor (het heet "het slachtoffer" of wat de zaak het noemt),
//      en elk vakje dat genoemd wordt bestaat op dit bord. De taalregels
//      (hoofdletter, punt, uitgeschreven getallen) keurt check-regels.mjs.
//
// Onderaan staat per niveau de meting die in de spec staat: hoeveel puzzels
// de solver oplost, de mediane ketenlengte en de zwaarste techniek.
//
// Een techniek die iets wegstreept wat niet weg mag, is erger dan een die
// te weinig doet: dan laat de oplossing de speler een verkeerde redenering
// zien, of zegt de keuring later dat een puzzel met twee oplossingen er één
// heeft. Daarom eerst de kleine standen, waar je met de hand kunt nagaan
// wat er hoort te gebeuren.

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { redeneer, pasToe, TECHNIEKEN } from '../src/engine/redeneer.js';
import { telPlaatsingen } from '../src/engine/rooms.js';
import { CATALOG, catalogSettings } from '../src/content/catalog.js';
import { buildPuzzle, wereldVoorSeed } from '../src/puzzle.js';
import { oplossingInStappen } from '../src/content/redeneer-text.js';

let fouten = 0;
const fout = (titel, wat) => {
  fouten++;
  if (fouten <= 40) console.log(`FOUT  ${titel}: ${wat}`);
};
const gelijk = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const reeks = (van, tot) => Array.from({ length: tot - van + 1 }, (_, i) => van + i);

// Een leeg rooster van vier bij vier zonder meubels. kamerVan geeft per vakje
// de kamer; standaard de bovenste twee rijen kamer 0, de onderste kamer 1.
function rooster(kamerVan = reeks(0, 15).map((i) => (i < 8 ? 0 : 1))) {
  return { n: 4, kamerVan, meubelOp: new Array(16).fill(null), vrij: new Array(16).fill(true), kamers: Math.max(...kamerVan) + 1, meubelAantal: 0 };
}
const vol = () => [reeks(0, 15), reeks(0, 15), reeks(0, 15), reeks(0, 15)];
const zonder = (lijst, weg) => lijst.filter((x) => !weg.includes(x));

// [naam, techniek, rooster, aanwijzingen, dom, geplaatst, verwacht]
// verwacht: { dom: per persoon wat over moet zijn (alleen wie genoemd is),
// geplaatst: {p, cel}, aanwijzingen: [...], niets: true }
const STANDEN = [
  ['direct: een kamer', 'direct', rooster(), [{ soort: 'kamer', p: 0, kamerIdx: 0, ja: true }], vol(), null,
    { dom: { 0: reeks(0, 7) }, aanwijzingen: [0] }],
  ['direct: niet aan de rand', 'direct', rooster(), [{ soort: 'rand', p: 2, ja: false }], vol(), null,
    { dom: { 2: [5, 6, 9, 10] }, aanwijzingen: [0] }],
  ['direct: een telling van nul', 'direct', rooster(), [{ soort: 'aantalKamer', kamerIdx: 1, aantal: 0 }], vol(), null,
    { dom: { 0: reeks(0, 7), 1: reeks(0, 7), 2: reeks(0, 7), 3: reeks(0, 7) }, aanwijzingen: [0] }],
  ['direct: een aanwijzing over twee mensen is niet direct', 'direct', rooster(), [{ soort: 'noord', p: 0, q: 1 }], vol(), null,
    { niets: true }],
  ['enigeVakje', 'enigeVakje', rooster(), [], [reeks(0, 15), [5], reeks(0, 15), reeks(0, 15)], null,
    { geplaatst: { p: 1, cel: 5 } }],
  ['bezet', 'bezet', rooster(), [], [reeks(0, 15), [5], reeks(0, 15), reeks(0, 15)], [null, 5, null, null],
    { dom: { 0: zonder(reeks(0, 15), [4, 5, 6, 7, 1, 9, 13]), 3: zonder(reeks(0, 15), [4, 5, 6, 7, 1, 9, 13]) } }],
  ['laatsteInLijn: rij', 'laatsteInLijn', rooster(), [],
    [reeks(0, 15), reeks(4, 15), reeks(4, 15), reeks(4, 15)], null,
    { dom: { 0: [0, 1, 2, 3] } }],
  ['laatsteInLijn: kolom', 'laatsteInLijn', rooster(), [],
    [reeks(0, 15), ...[1, 2, 3].map(() => reeks(0, 15).filter((x) => x % 4 !== 3))], null,
    { dom: { 0: [3, 7, 11, 15] } }],
  ['laatsteInLijn: niets te doen', 'laatsteInLijn', rooster(), [], vol(), null, { niets: true }],
  ['combineer: ten noorden van', 'combineer', rooster(), [{ soort: 'noord', p: 0, q: 1 }],
    [reeks(0, 15), reeks(0, 7), reeks(0, 15), reeks(0, 15)], null,
    { dom: { 0: [0, 1, 2, 3], 1: [4, 5, 6, 7] }, aanwijzingen: [0] }],
  ['combineer: telt rij en kolom niet mee', 'combineer', rooster([0, 0, ...new Array(14).fill(1)]),
    [{ soort: 'zelfdeKamer', p: 0, q: 1, ja: true }], [[0, 8], [1, 13], reeks(0, 15), reeks(0, 15)], null,
    { niets: true }],
  ['relatie: twee mensen op één rij kan niet', 'relatie', rooster([0, 0, ...new Array(14).fill(1)]),
    [{ soort: 'zelfdeKamer', p: 0, q: 1, ja: true }], [[0, 8], [1, 13], reeks(0, 15), reeks(0, 15)], null,
    { dom: { 0: [8], 1: [13] }, aanwijzingen: [0] }],
  ['kruispunt: iemand houdt één rij', 'kruispunt', rooster(), [], [[0, 1], reeks(0, 15), reeks(0, 15), reeks(0, 15)], null,
    { dom: { 1: reeks(4, 15), 2: reeks(4, 15), 3: reeks(4, 15) } }],
  ['paar: twee mensen, twee rijen', 'paar', rooster(), [], [[0, 4], [1, 5], reeks(0, 15), reeks(0, 15)], null,
    { dom: { 2: reeks(8, 15), 3: reeks(8, 15) } }],
  ['paar: niets te doen', 'paar', rooster(), [], vol(), null, { niets: true }],
  ['telling: vol', 'telling', rooster(), [{ soort: 'aantalKamer', kamerIdx: 0, aantal: 1 }],
    [reeks(0, 7), reeks(0, 15), reeks(0, 15), reeks(0, 15)], null,
    { dom: { 1: reeks(8, 15), 2: reeks(8, 15), 3: reeks(8, 15) }, aanwijzingen: [0] }],
  ['telling: alle kandidaten erin', 'telling', rooster(), [{ soort: 'aantalKamer', kamerIdx: 1, aantal: 2 }],
    [reeks(0, 15), reeks(0, 15), reeks(0, 7), reeks(0, 7)], null,
    { dom: { 0: reeks(8, 15), 1: reeks(8, 15) }, aanwijzingen: [0] }],
  ['aanname: een proef die vastloopt', 'aanname', rooster(), [{ soort: 'noord', p: 0, q: 1 }],
    [reeks(0, 15), [0, 1, 2, 3], reeks(0, 15), reeks(0, 15)], null,
    { dom: { 1: [1, 2, 3] }, aanwijzingen: [0] }],
];

for (const [naam, techniek, r, aanwijzingen, dom, geplaatst, verwacht] of STANDEN) {
  const { stap, dom: na } = pasToe(techniek, r, aanwijzingen, dom, geplaatst);
  if (verwacht.niets) {
    if (stap) fout(naam, `deed iets: ${JSON.stringify(stap)}`);
    continue;
  }
  if (!stap) { fout(naam, 'deed niets'); continue; }
  if (stap.techniek !== techniek) fout(naam, `techniek ${stap.techniek}`);
  for (const [p, over] of Object.entries(verwacht.dom ?? {})) {
    if (!gelijk(na[p], over)) fout(naam, `persoon ${p} houdt ${JSON.stringify(na[p])}, verwacht ${JSON.stringify(over)}`);
  }
  if (verwacht.geplaatst && !gelijk(stap.geplaatst, verwacht.geplaatst)) fout(naam, `geplaatst ${JSON.stringify(stap.geplaatst)}`);
  if (verwacht.aanwijzingen && !gelijk(stap.aanwijzingen, verwacht.aanwijzingen)) fout(naam, `aanwijzingen ${JSON.stringify(stap.aanwijzingen)}`);
  // Criterium 3: elke stap noemt wat hij wegstreepte of wie hij neerzette.
  if (!stap.geplaatst && !stap.geschrapt?.length) fout(naam, 'stap zonder geschrapte vakjes en zonder plaatsing');
}

// Een heel kleine puzzel, helemaal op te lossen: wie staat waar?
{
  const r = rooster();
  const aanwijzingen = [
    { soort: 'noord', p: 0, q: 1 }, { soort: 'noord', p: 1, q: 2 }, { soort: 'noord', p: 2, q: 3 },
    { soort: 'west', p: 3, q: 2 }, { soort: 'west', p: 2, q: 0 }, { soort: 'west', p: 0, q: 1 },
  ];
  const a = redeneer(r, aanwijzingen);
  const b = redeneer(r, aanwijzingen);
  if (!a.opgelost) fout('kleine puzzel', `niet opgelost: ${JSON.stringify(a.vast)}`);
  else if (!gelijk(a.plaats, [2, 7, 9, 12])) fout('kleine puzzel', `plaats ${JSON.stringify(a.plaats)}`);
  if (!gelijk(a, b)) fout('kleine puzzel', 'twee keer opgelost, twee verschillende sporen');
  if (a.stappen.some((s, i) => s.nr !== i + 1)) fout('kleine puzzel', 'stappen niet doorgenummerd');
  // Met alleen tier 1 komt hij niet verder dan de eerste letterlijke lezing.
  const t1 = redeneer(r, aanwijzingen, { maxTier: 1 });
  if (t1.opgelost || t1.vast?.tier !== 1) fout('kleine puzzel', `tier 1 alleen: ${JSON.stringify(t1.vast)}`);
}

// ------------------------------------------------------- het spoor keuren

// Wat er mis is aan een spoor, gegeven de oplossing. Leeg is goed.
export function keurSpoor(uit, oplossing, aantalAanwijzingen) {
  const mis = [];
  for (const s of uit.stappen) {
    if (!TECHNIEKEN[s.techniek]) mis.push(`stap ${s.nr}: onbekende techniek ${s.techniek}`);
    if (!Array.isArray(s.aanwijzingen) || s.aanwijzingen.some((i) => !(i >= 0 && i < aantalAanwijzingen))) {
      mis.push(`stap ${s.nr} (${s.techniek}): ongeldige aanwijzingen ${JSON.stringify(s.aanwijzingen)}`);
    }
    if (!s.geplaatst && !s.geschrapt?.length) mis.push(`stap ${s.nr} (${s.techniek}): streept niets weg en zet niemand neer`);
    for (const g of s.geschrapt ?? []) {
      if (g.cellen.includes(oplossing[g.p])) mis.push(`stap ${s.nr}: ${s.techniek} streept het goede vakje van persoon ${g.p} weg`);
    }
    if (s.geplaatst && s.geplaatst.cel !== oplossing[s.geplaatst.p]) mis.push(`stap ${s.nr}: ${s.techniek} zet persoon ${s.geplaatst.p} verkeerd neer`);
  }
  uit.plaats.forEach((cel, p) => {
    if (cel != null && cel !== oplossing[p]) mis.push(`persoon ${p} staat op ${cel}, niet op ${oplossing[p]}`);
  });
  return mis;
}

// De weigerkant: een spoor met één verkeerde streep moet omvallen, met de
// techniek erbij.
{
  const r = rooster();
  const aanwijzingen = [{ soort: 'noord', p: 0, q: 1 }, { soort: 'noord', p: 1, q: 2 }, { soort: 'noord', p: 2, q: 3 },
    { soort: 'west', p: 3, q: 2 }, { soort: 'west', p: 2, q: 0 }, { soort: 'west', p: 0, q: 1 }];
  const uit = redeneer(r, aanwijzingen);
  const oplossing = [2, 7, 9, 12];
  if (keurSpoor(uit, oplossing, aanwijzingen.length).length) fout('weigerkant', 'een goed spoor viel om');
  const verknoeid = structuredClone(uit);
  const stap = verknoeid.stappen.find((s) => s.geschrapt.length);
  stap.geschrapt[0].cellen.push(oplossing[stap.geschrapt[0].p]);
  if (!keurSpoor(verknoeid, oplossing, aanwijzingen.length).some((m) => m.includes(stap.techniek) && m.includes('goede vakje'))) {
    fout('weigerkant', 'een streep door het goede vakje viel niet om');
  }
  const zonderReden = structuredClone(uit);
  zonderReden.stappen[0].aanwijzingen = [99];
  if (!keurSpoor(zonderReden, oplossing, aanwijzingen.length).length) fout('weigerkant', 'een stap met een onbekende aanwijzing viel niet om');
}

// Wat er mis is aan de genummerde oplossing in woorden (criterium 4).
export function keurTekst(p, uit, tekst) {
  const mis = [];
  const slachtoffer = new RegExp(`\\b${p.slachtofferNaam}\\b`);
  const verwacht = uit.plaats.filter((c) => c != null).length + (uit.opgelost ? 0 : 1);
  if (tekst.stappen.length !== verwacht) mis.push(`${tekst.stappen.length} genummerde stappen, verwacht ${verwacht}`);
  for (const st of tekst.stappen) {
    if (!st.zinnen.length) mis.push(`stap ${st.nr} zonder zinnen`);
    for (const z of st.zinnen) {
      if (typeof z !== 'string' || /undefined|null|NaN|\[object/.test(z)) { mis.push(`stap ${st.nr}: gat in "${z}"`); continue; }
      if (slachtoffer.test(z)) mis.push(`stap ${st.nr} noemt het slachtoffer bij naam: ${z}`);
      for (const [, r, k] of z.matchAll(/\b([A-Z])(\d{1,2})\b/g)) {
        if (r.charCodeAt(0) - 65 >= p.n || Number(k) < 1 || Number(k) > p.n) mis.push(`stap ${st.nr} noemt vakje ${r}${k}, dat niet op het bord staat`);
      }
    }
  }
  return mis;
}

// ----------------------------------------------------------- de keuringsset

const vingerafdruk = (p) => createHash('sha256')
  .update(JSON.stringify([p.id, p.oplossing, p._ruwe, p.slachtofferIdx, p.kamerVan, p.meubelOp, p.clues.map((c) => c.text)]))
  .digest('hex').slice(0, 16);

// `--kort` (elke pull request): niveau vijf en zes, die minuten per bord
// kosten, met minder seeds. Vol duurde deze toets op een runner 12 tot 16
// minuten (PR #33); de volle set draait 's nachts (nachtrun.yml) en voor een
// release (`npm run check:all`).
const KORT = process.argv.includes('--kort');
const SEEDS = KORT ? { 1: 10, 2: 10, 3: 10, 4: 10, 5: 3, 6: 1 } : { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10, 6: 3 };
const lijst = [];
for (const e of CATALOG) if (e.mechaniek === 'kamer') lijst.push(catalogSettings(e));
for (const [niveau, aantal] of Object.entries(SEEDS)) {
  for (let s = 0; s < aantal; s++) {
    const seed = `keur-${s}`;
    lijst.push({ opdracht: 'dader', mechaniek: 'kamer', wereld: wereldVoorSeed(seed), niveau: Number(niveau), seed });
  }
}

// De weigerkant van de tekst: het slachtoffer bij naam, en een vakje dat
// niet op het bord staat.
{
  const p = buildPuzzle(lijst[0]);
  const uit = redeneer(p._rooster, p._ruwe);
  const goed = oplossingInStappen(uit, p);
  if (keurTekst(p, uit, goed).length) fout('weigerkant', `een goede oplossing viel om: ${keurTekst(p, uit, goed)[0]}`);
  const metNaam = structuredClone(goed);
  metNaam.stappen[0].zinnen.push(`${p.slachtofferNaam} lag op A1.`);
  if (!keurTekst(p, uit, metNaam).some((m) => m.includes('bij naam'))) fout('weigerkant', 'het slachtoffer bij naam viel niet om');
  const buiten = structuredClone(goed);
  buiten.stappen[0].zinnen.push(`Bram stond op ${String.fromCharCode(65 + p.n)}1.`);
  if (!keurTekst(p, uit, buiten).some((m) => m.includes('niet op het bord'))) fout('weigerkant', 'een vakje buiten het bord viel niet om');
}

const AFDRUKKEN = new URL('vingerafdruk-kamers.txt', import.meta.url);
const SCHRIJF = process.argv.includes('--schrijf');
// Met --kort ontbreken borden; die zou --schrijf uit het bestand gooien.
if (SCHRIJF && KORT) { console.log('--schrijf en --kort samen zou vingerafdrukken weggooien'); process.exit(1); }
const vastgelegd = new Map(SCHRIJF ? [] : readFileSync(AFDRUKKEN, 'utf8').trim().split('\n').map((r) => r.split(' ')));
const nieuw = [];
const perNiveau = {};
const technieken = new Set();

for (const settings of lijst) {
  const p = buildPuzzle(settings);
  const afdruk = vingerafdruk(p);
  nieuw.push(`${p.id} ${afdruk}`);
  if (!SCHRIJF) {
    if (!vastgelegd.has(p.id)) fout(p.id, 'staat niet in tools/vingerafdruk-kamers.txt');
    else if (vastgelegd.get(p.id) !== afdruk) fout(p.id, 'het bord is verschoven (andere vingerafdruk)');
  }

  const t0 = performance.now();
  const uit = redeneer(p._rooster, p._ruwe);
  const ms = performance.now() - t0;
  for (const m of keurSpoor(uit, p.oplossing, p._ruwe.length)) fout(p.id, m);
  if (uit.opgelost) {
    const telling = telPlaatsingen(p._rooster, p._ruwe, 2, 1e7);
    if (telling.opgegeven || telling.count !== 1) {
      const zwaarste = Object.keys(uit.graad.perTechniek).sort((a, b) => TECHNIEKEN[b].tier - TECHNIEKEN[a].tier)[0];
      fout(p.id, `de solver loste op, maar telPlaatsingen vond ${telling.opgegeven ? 'geen uitsluitsel' : `${telling.count} oplossingen`} (zwaarste techniek: ${zwaarste})`);
    }
  }
  for (const m of keurTekst(p, uit, oplossingInStappen(uit, p))) fout(p.id, m);
  for (const s of uit.stappen) technieken.add(s.techniek);
  (perNiveau[p.niveau] ??= []).push({ ...uit.graad, opgelost: uit.opgelost, vast: uit.vast, ms });
}

// Elke techniek moet in de keuringsset een keer voorkomen, anders keurt de
// set hem niet echt.
for (const t of Object.keys(TECHNIEKEN)) if (!technieken.has(t)) fout('keuringsset', `techniek ${t} komt nergens voor`);

if (SCHRIJF) {
  writeFileSync(AFDRUKKEN, `${nieuw.join('\n')}\n`);
  console.log(`${nieuw.length} vingerafdrukken geschreven naar tools/vingerafdruk-kamers.txt`);
} else if (!KORT && vastgelegd.size !== nieuw.length) {
  fout('vingerafdrukken', `${vastgelegd.size} vastgelegd, ${nieuw.length} gebouwd`);
}

const mediaan = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};
console.log('\n| level | puzzles | solved | chain median | chain min–max | top tier 1/2/3/4 | hard steps median | aanname median | solver worst |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const [n, rijen] of Object.entries(perNiveau)) {
  const tiers = [1, 2, 3, 4].map((t) => rijen.filter((r) => r.topTier === t).length).join(' / ');
  const lengtes = rijen.map((r) => r.lengte);
  console.log(`| ${n} | ${rijen.length} | ${rijen.filter((r) => r.opgelost).length} | ${mediaan(lengtes)} | ${Math.min(...lengtes)}–${Math.max(...lengtes)} | ${tiers} | ${mediaan(rijen.map((r) => r.zwaar))} | ${mediaan(rijen.map((r) => r.perTechniek.aanname ?? 0))} | ${Math.max(...rijen.map((r) => r.ms)).toFixed(0)} ms |`);
}
const vast = Object.values(perNiveau).flat().filter((r) => !r.opgelost);
if (vast.length) console.log(`\nniet helemaal opgelost: ${vast.length} (${vast.map((r) => JSON.stringify(r.vast)).join(', ')})`);

console.log(`\n${STANDEN.length} standen en ${nieuw.length} puzzels gekeurd, ${fouten} fouten`);
process.exit(fouten ? 1 : 0);
