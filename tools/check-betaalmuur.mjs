// Toetst het gratis tegoed van de betaalmuur (src/betaalmuur/toegang.js):
// twee nieuwe puzzels per niveau, een geopende of begonnen puzzel blijft
// open, de schakelaar laat in 'uit' alles door, en 'live' kan niet zonder
// prijs. Met een nep-opslag, zonder browser of netwerk.

import { magOpenen, muurActief, heeftToegang, gratisVan, BETAALMUUR, PRIJS, GRATIS_PER_NIVEAU } from '../src/betaalmuur/toegang.js';

let fouten = 0;
const zeg = (goed, wat) => { if (!goed) fouten++; console.log(`${goed ? 'ok  ' : 'FOUT'}  ${wat}`); };

const nepOpslag = (begin = {}) => {
  const m = new Map(Object.entries(begin));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), m };
};
const live = { stand: 'live', zoek: '' };

zeg(['uit', 'test', 'live'].includes(BETAALMUUR), `schakelaar heeft een bekende stand (${BETAALMUUR})`);
zeg(BETAALMUUR !== 'live' || !!PRIJS, "'live' alleen met een vastgestelde prijs");
zeg(GRATIS_PER_NIVEAU === 2, 'twee gratis per niveau (D2)');

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

console.log(`\n${fouten} fouten`);
process.exit(fouten ? 1 : 0);
