// Toetst het gratis tegoed van de betaalmuur (src/betaalmuur/toegang.js):
// twee nieuwe puzzels van niveau 1 tot en met 3, één van niveau 4, geen van
// 5 en 6, de puzzel van de dag alleen ingelogd, een geopende of begonnen
// puzzel blijft open, de schakelaar laat in 'uit' alles door, en 'live' kan niet zonder
// prijs, en wat de server over de toegang zegt komt goed in de cache (stap 4). Met een nep-opslag, zonder browser of netwerk.

import { magOpenen, magPadStap, padGrensZichtbaar, PAD_GRATIS, muurActief, heeftToegang, isTester, zetTester, verwerkToegang, vergeetToegang, TOEGANG_GELDIG_MS, gratisVan, puzzelVanDeDag, vandaag, BETAALMUUR, PRIJS, GRATIS } from '../src/betaalmuur/toegang.js';
import { parsePuzzleId } from '../src/puzzle.js';
import { PAD } from '../src/content/pad.js';
import { existsSync } from 'node:fs';

let fouten = 0;
const zeg = (goed, wat) => { if (!goed) fouten++; console.log(`${goed ? 'ok  ' : 'FOUT'}  ${wat}`); };

const nepOpslag = (begin = {}) => {
  const m = new Map(Object.entries(begin));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), m };
};
const live = { stand: 'live', zoek: '' };

zeg(['uit', 'test', 'live'].includes(BETAALMUUR), `schakelaar heeft een bekende stand (${BETAALMUUR})`);
zeg(BETAALMUUR !== 'live' || !!PRIJS, "'live' alleen met een vastgestelde prijs");
// De testerslink zet in elke browser alles open, voor wie hem kent. Goed om
// te testen, niet als de muur echt staat: Guus, 2026-11-20, "uit vóór live".
// Een geheime code helpt op een statische site niet (hij staat dan in de
// broncode); wie testers na live nog wil, doet dat via de server (stap 4).
const testerslink = existsSync(new URL('../tester.html', import.meta.url));
zeg(BETAALMUUR !== 'live' || !testerslink, "'live' alleen zonder tester.html (go-live-blokkade)");
zeg(JSON.stringify(GRATIS) === '{"1":2,"2":2,"3":2,"4":1,"5":0,"6":0}', 'tegoed per niveau volgens D2 (2/2/2/1/0/0)');

zeg(!muurActief('uit', '?betaaltest'), "'uit' toont nooit een muur");
zeg(!muurActief('test', ''), "'test' zonder ?betaaltest: geen muur");
zeg(muurActief('test', '?betaaltest'), "'test' met ?betaaltest: muur");
zeg(muurActief('live', ''), "'live': muur");

{
  const opslag = nepOpslag();
  const uit = ['a', 'b', 'c'].map((id) => magOpenen(id, 3, { opslag, stand: 'uit' }));
  zeg(uit.every(Boolean) && !opslag.m.size, "'uit': alles open en niets geteld");
}
{
  const opslag = nepOpslag();
  const r = ['a', 'b', 'c'].map((id) => magOpenen(id, 3, { opslag, ...live }));
  zeg(r.join() === 'true,true,false', 'derde nieuwe puzzel van een niveau: muur');
  zeg(magOpenen('a', 3, { opslag, ...live }), 'een al geopende puzzel blijft open');
  zeg(magOpenen('x', 4, { opslag, ...live }), 'een ander niveau heeft zijn eigen tegoed');
  zeg(!magOpenen('y', 4, { opslag, ...live }), 'niveau 4: één proefpuzzel, de tweede niet');
  zeg(!magOpenen('z', 5, { opslag, ...live }) && !magOpenen('z', 6, { opslag, ...live }), 'niveau 5 en 6: niets gratis');
  zeg(magOpenen('c', 3, { opslag, ...live, voortgang: (i) => i === 'c' }), 'een begonnen puzzel blijft open');
  zeg(gratisVan(3, opslag).join() === 'a,b', 'de muur kent de gratis puzzels van het niveau');
}
{
  const nu = Date.parse('2026-11-20T12:00:00Z');
  const geldig = nepOpslag({ 'vierdespoor.geopend': '{"3":["a","b"]}', 'vierdespoor.toegang': JSON.stringify({ tot: nu + 1000 }) });
  zeg(magOpenen('c', 3, { opslag: geldig, ...live, nu }), 'met volledige toegang: geen muur');
  const verlopen = nepOpslag({ 'vierdespoor.toegang': JSON.stringify({ tot: nu - 1 }) });
  zeg(!heeftToegang(verlopen, nu), 'verlopen toegang telt niet');
  zeg(!heeftToegang(nepOpslag({ 'vierdespoor.toegang': '{"tot":"altijd"}' }), nu), 'toegang zonder geldig tijdstip telt niet');
}
{
  const kapot = nepOpslag({ 'vierdespoor.geopend': '{kapot' });
  zeg(magOpenen('a', 2, { opslag: kapot, ...live }), 'onleesbare opslag: begint opnieuw, gooit niet');
  const vreemd = nepOpslag({ 'vierdespoor.geopend': '{"2":[1,2,3]}' });
  zeg(magOpenen('a', 2, { opslag: vreemd, ...live }), 'geen teksten in de lijst: tellen niet mee');
  const stuk = { getItem: () => { throw new Error('geblokkeerd'); }, setItem: () => { throw new Error('geblokkeerd'); } };
  zeg(magOpenen('a', 2, { opslag: stuk, ...live }), 'geblokkeerde opslag: spelen kan');
}

{
  const dagen = ['2026-11-20', '2026-11-21', '2026-11-22', '2026-11-23'].map(puzzelVanDeDag);
  const niveaus = dagen.map((id) => parsePuzzleId(id).niveau);
  zeg(niveaus.every((n) => n >= 1 && n <= 3) && new Set(niveaus.slice(0, 3)).size === 3, `puzzel van de dag loopt rond over 1-3 (${niveaus.join(',')})`);
  zeg(puzzelVanDeDag('2026-11-20') === puzzelVanDeDag('2026-11-20'), 'puzzel van de dag is voor iedereen dezelfde');
  zeg(vandaag(new Date(2026, 10, 20, 23, 59)) === '2026-11-20', 'vandaag volgt de eigen klok');
  const nu = new Date(2026, 10, 20, 12).getTime();
  const id = puzzelVanDeDag('2026-11-20');
  const niveau = parsePuzzleId(id).niveau;
  const vol = nepOpslag({ 'vierdespoor.geopend': JSON.stringify({ [niveau]: ['a', 'b'] }) });
  zeg(!magOpenen(id, niveau, { opslag: vol, ...live, nu }), 'uitgelogd: de puzzel van de dag telt als gewone puzzel');
  zeg(magOpenen(id, niveau, { opslag: vol, ...live, nu, ingelogd: true }), 'ingelogd: de puzzel van de dag mag, ook met een vol tegoed');
  zeg(gratisVan(niveau, vol).length === 2, 'de puzzel van de dag kost geen tegoed');
  const morgen = new Date(2026, 10, 21, 12).getTime();
  zeg(magOpenen(id, niveau, { opslag: vol, ...live, nu: morgen }), 'een geopende puzzel van de dag blijft van jou, ook de dag erna');
  zeg(!magOpenen(puzzelVanDeDag('2026-11-19'), parsePuzzleId(puzzelVanDeDag('2026-11-19')).niveau, { opslag: nepOpslag({ 'vierdespoor.geopend': '{"1":["a","b"],"2":["a","b"],"3":["a","b"]}' }), ...live, nu, ingelogd: true }), 'de puzzel van gisteren, nooit geopend: niet gratis');
}
{
  // De testerslink (tester.html): alles open, met ?uit weer het gewone tegoed.
  const opslag = nepOpslag({ 'vierdespoor.geopend': '{"3":["a","b"]}' });
  zetTester(true, opslag);
  zeg(isTester(opslag) && magOpenen('c', 3, { opslag, ...live }) && magOpenen('x', 6, { opslag, ...live }), 'tester: alles open, ook niveau 6');
  zeg(gratisVan(3, opslag).length === 2, 'tester: kost geen tegoed');
  zetTester(false, opslag);
  zeg(!isTester(opslag) && !magOpenen('d', 3, { opslag, ...live }), 'tester uit: weer het gewone tegoed');
  zeg(!isTester(nepOpslag({ 'vierdespoor.tester': '"ja"' })), 'alleen precies true telt als tester');
}

{
  // Het pad (Guus, 2026-11-25, ask-8d1f2961 "A"): de eerste 18 stappen gratis,
  // zonder het tegoed van een niveau aan te spreken; daarna volledige toegang.
  // De teksten zeggen "van 5 bij 5 en 6 bij 6": dat moet ook zo blijven.
  zeg(PAD_GRATIS === 18, 'het pad heeft 18 gratis stappen');
  zeg(PAD.slice(0, PAD_GRATIS).every((s) => s.maat === 5 || s.maat === 6) && PAD[PAD_GRATIS].maat > 6,
    'de gratis stappen zijn precies de stappen van 5 bij 5 en 6 bij 6');
  const opslag = nepOpslag();
  zeg([1, 3, 18].every((k) => magPadStap(k, `pad-${k}`, { opslag, ...live })), 'pad: stap 1 tot en met 18 mag open');
  zeg(gratisVan(1, opslag).length === 0, 'pad: de gratis stappen kosten geen tegoed');
  zeg(!magPadStap(19, 'pad-19', { opslag, ...live }), 'pad: stap 19 zonder toegang niet');
  zeg(magPadStap(19, 'pad-19', { opslag, ...live, voortgang: () => true }), 'pad: een begonnen stap blijft speelbaar');
  zeg(magPadStap(60, 'pad-60', { opslag, stand: 'test', zoek: '' }), 'pad: zonder muur mag alles');
  zeg(padGrensZichtbaar({ opslag, ...live }) && !padGrensZichtbaar({ opslag, stand: 'test', zoek: '' }), 'pad: grens alleen met de muur aan');
  zetTester(true, opslag);
  zeg(magPadStap(60, 'pad-60', { opslag, ...live }) && !padGrensZichtbaar({ opslag, ...live }), 'pad: een tester loopt door, zonder grens');
}

{
  // Stap 4: de eigen rijen van reconstructie.toegang in de cache. Wat van
  // het netwerk komt, is niet te vertrouwen; alleen een geldige, niet
  // ingetrokken rij opent.
  const nu = Date.parse('2026-11-25T12:00:00Z');
  const opslag = nepOpslag();
  const rij = { toegekend: '2026-11-25T11:59:00+00:00', ingetrokken: null };
  zeg(verwerkToegang([rij], opslag, nu) && heeftToegang(opslag, nu), 'toegang: een gekochte rij opent');
  zeg(heeftToegang(opslag, nu + TOEGANG_GELDIG_MS - 1) && !heeftToegang(opslag, nu + TOEGANG_GELDIG_MS + 1),
    'toegang: geldt dertig dagen zonder contact, daarna niet (criterium 8)');
  zeg(magOpenen('z', 6, { opslag, ...live, nu }), 'toegang: niveau 6 opent met een gelezen aankoop');
  zeg(!verwerkToegang([{ ...rij, ingetrokken: '2026-11-26T09:00:00+00:00' }], opslag, nu) && !heeftToegang(opslag, nu),
    'toegang: een terugbetaling sluit weer (criterium 6)');
  verwerkToegang([rij], opslag, nu);
  zeg(!verwerkToegang([], opslag, nu) && !heeftToegang(opslag, nu), 'toegang: geen rij meer, geen toegang');
  const vreemd = [null, 'ja', { toegekend: 'gisteren', ingetrokken: null }, { toegekend: 5 }, { ingetrokken: null }];
  zeg(!verwerkToegang(vreemd, opslag, nu) && !verwerkToegang({ toegekend: rij.toegekend }, opslag, nu) && !verwerkToegang(null, opslag, nu),
    'toegang: vreemde antwoorden openen niets');
  zeg(verwerkToegang([{ ...rij, ingetrokken: '2026-11-20T00:00:00Z' }, rij], opslag, nu), 'toegang: één geldige aankoop naast een teruggedraaide is genoeg');
  vergeetToegang(opslag);
  zeg(!heeftToegang(opslag, nu), 'toegang: na uitloggen weg');
  const stuk = { getItem() { throw new Error('geblokkeerd'); }, setItem() { throw new Error('geblokkeerd'); }, removeItem() { throw new Error('geblokkeerd'); } };
  let gooit = false;
  try { verwerkToegang([rij], stuk, nu); vergeetToegang(stuk); } catch { gooit = true; }
  zeg(!gooit, 'toegang: geblokkeerde opslag gooit niet');
}

console.log(`\n${fouten} fouten`);
process.exit(fouten ? 1 : 0);
