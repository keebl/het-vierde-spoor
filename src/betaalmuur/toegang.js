// Het gratis tegoed en de betaalmuur (specs/paywall-and-android.md, ADR-0007).
//
// Van elk niveau zijn twee puzzels gratis; bibliotheekzaken en zelf
// gegenereerde tellen samen (D2). Wie die twee per niveau heeft geopend,
// krijgt bij een derde nieuwe puzzel de betaalmuur in plaats van het bord.
// Een puzzel die je al opende of waar voortgang van is, blijft altijd
// speelbaar: de muur staat voor iets nieuws, nooit voor je eigen werk.
//
// Zonder login staat het tegoed in localStorage (D9). Dat is met opzet geen
// slot: wie zijn opslag wist, krijgt het tegoed terug. Een muur die een
// handige speler omzeilt kost minder dan een muur die een eerlijke speler
// buitensluit.
//
// Puur op de opslag na, en die is in te spuiten: zo draait check:betaalmuur
// in node zonder browser.

// De schakelaar. 'uit': niemand ziet een muur, de site zoals hij was.
// 'test': alleen met ?betaaltest in het adres (vóór het hekje), om te
// proberen op de echte site zonder dat een speler hem ziet. 'live': voor
// iedereen, pas als afrekenen werkt (stap 7 van het plan).
export const BETAALMUUR = 'test';

export const GRATIS_PER_NIVEAU = 2;

// De prijs als tekst, of null zolang hij niet vaststaat (D1); dan blijft de
// prijsregel op de muur weg in plaats van een verzonnen bedrag te tonen.
export const PRIJS = null;

const GEOPEND = 'vierdespoor.geopend';
const TOEGANG = 'vierdespoor.toegang';

export function muurActief(stand = BETAALMUUR, zoek = globalThis.location?.search ?? '') {
  if (stand === 'live') return true;
  if (stand === 'test') return new URLSearchParams(zoek).has('betaaltest');
  return false;
}

function lees(opslag, sleutel, standaard) {
  try {
    const waarde = JSON.parse(opslag?.getItem(sleutel) ?? 'null');
    return waarde ?? standaard;
  } catch {
    return standaard;
  }
}

// Per niveau de ids die geopend zijn, als { "3": ["id", ...] }. Wat uit de
// opslag komt kan van alles zijn; alleen lijsten van teksten tellen.
export function geopend(opslag = globalThis.localStorage) {
  const ruw = lees(opslag, GEOPEND, {});
  const uit = {};
  if (!ruw || typeof ruw !== 'object') return uit;
  for (const [niveau, ids] of Object.entries(ruw)) {
    if (Array.isArray(ids)) uit[niveau] = ids.filter((i) => typeof i === 'string');
  }
  return uit;
}

// Volledige toegang, zoals de server die het laatst gaf (stap 4): een
// tijdstip tot wanneer de bewaarde uitslag geldt. Tot de server er is,
// staat hier niets en is het antwoord nee.
export function heeftToegang(opslag = globalThis.localStorage, nu = Date.now()) {
  const t = lees(opslag, TOEGANG, null);
  return !!t && typeof t.tot === 'number' && t.tot > nu;
}

// Mag deze puzzel open? Zo ja, en hij was nog niet geteld, dan telt hij nu
// mee. `voortgang(id)` zegt of er voor die puzzel al iets bewaard is.
export function magOpenen(id, niveau, {
  opslag = globalThis.localStorage,
  voortgang = () => false,
  stand = BETAALMUUR,
  zoek = globalThis.location?.search ?? '',
  nu = Date.now(),
} = {}) {
  if (!muurActief(stand, zoek)) return true;
  if (heeftToegang(opslag, nu)) return true;
  const alles = geopend(opslag);
  const lijst = alles[niveau] ?? [];
  if (lijst.includes(id) || voortgang(id)) return true;
  if (lijst.length >= GRATIS_PER_NIVEAU) return false;
  alles[niveau] = [...lijst, id];
  try {
    opslag?.setItem(GEOPEND, JSON.stringify(alles));
  } catch {
    /* geen opslag: dan telt hij niet, en speel je gewoon */
  }
  return true;
}

// De gratis puzzels van een niveau, om op de muur terug naar te verwijzen.
export function gratisVan(niveau, opslag = globalThis.localStorage) {
  return geopend(opslag)[niveau] ?? [];
}
