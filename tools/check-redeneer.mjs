// Keurt de menselijke solver van het kamerraster (src/engine/redeneer.js,
// specs/engine-extension.md fase A).
//
//   1. Per techniek een met de hand gemaakte stand waarin hij precies doet
//      wat hij moet doen: welke vakjes vallen af, wie wordt neergezet. En
//      een stand waarin hij niets mag doen.
//   2. Dezelfde puzzel geeft twee keer hetzelfde spoor.
//
// Een techniek die iets wegstreept wat niet weg mag, is erger dan een die
// te weinig doet: dan laat de oplossing de speler een verkeerde redenering
// zien, of zegt de keuring later dat een puzzel met twee oplossingen er één
// heeft. Daarom eerst de kleine standen, waar je met de hand kunt nagaan
// wat er hoort te gebeuren.

import { redeneer, pasToe } from '../src/engine/redeneer.js';

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

console.log(`\n${STANDEN.length} standen gekeurd, ${fouten} fouten`);
process.exit(fouten ? 1 : 0);
