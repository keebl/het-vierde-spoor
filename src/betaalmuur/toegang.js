// Het gratis tegoed en de betaalmuur (specs/paywall-and-android.md, ADR-0007).
//
// Wat gratis is (D2, herzien 2026-11-20, Guus "Ja, met de drie"):
// - zonder account: twee puzzels van niveau 1, 2 en 3, en één proefpuzzel
//   van niveau 4, zodat niemand blind koopt;
// - ingelogd daarbovenop: de puzzel van de dag, één per dag uit niveau 1
//   tot en met 3, voor iedereen dezelfde;
// - niveau 5 en 6, en alles voorbij het tegoed: alleen met volledige
//   toegang, en die opent alles, printen ook.
// Bibliotheekzaken en zelf gegenereerde puzzels tellen samen. Een puzzel
// die je al opende of waar voortgang van is, blijft altijd speelbaar: de
// muur staat voor iets nieuws, nooit voor je eigen werk.
//
// Zonder login staat het tegoed in localStorage (D9). Dat is met opzet geen
// slot: wie zijn opslag wist, krijgt het tegoed terug. Een muur die een
// handige speler omzeilt kost minder dan een muur die een eerlijke speler
// buitensluit.
//
// Puur op de opslag na, en die is in te spuiten: zo draait check:betaalmuur
// in node zonder browser.

import { puzzleId, wereldVoorSeed } from '../puzzle.js';

// De schakelaar. 'uit': niemand ziet een muur, de site zoals hij was.
// 'test': alleen met ?betaaltest in het adres (vóór het hekje), om te
// proberen op de echte site zonder dat een speler hem ziet. 'live': voor
// iedereen, pas als afrekenen werkt (stap 7 van het plan).
export const BETAALMUUR = 'test';

// Hoeveel nieuwe puzzels per niveau gratis zijn, zonder account.
export const GRATIS = { 1: 2, 2: 2, 3: 2, 4: 1, 5: 0, 6: 0 };

// De prijs als tekst, of null zolang hij niet vaststaat (D1); dan blijft de
// prijsregel op de muur weg in plaats van een verzonnen bedrag te tonen.
export const PRIJS = null;

const GEOPEND = 'vierdespoor.geopend';
const DAGEN = 'vierdespoor.dagpuzzels';
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

function schrijf(opslag, sleutel, waarde) {
  try {
    opslag?.setItem(sleutel, JSON.stringify(waarde));
  } catch {
    /* geen opslag: dan telt hij niet, en speel je gewoon */
  }
}

const tekstLijst = (x) => (Array.isArray(x) ? x.filter((i) => typeof i === 'string') : []);

// Per niveau de ids die geopend zijn, als { "3": ["id", ...] }. Wat uit de
// opslag komt kan van alles zijn; alleen lijsten van teksten tellen.
export function geopend(opslag = globalThis.localStorage) {
  const ruw = lees(opslag, GEOPEND, {});
  const uit = {};
  if (!ruw || typeof ruw !== 'object') return uit;
  for (const [niveau, ids] of Object.entries(ruw)) uit[niveau] = tekstLijst(ids);
  return uit;
}

// De datum zoals de speler hem ziet (zijn eigen klok, niet UTC): de puzzel
// van de dag wisselt om middernacht waar je woont.
export function vandaag(nu = new Date()) {
  const d = new Date(nu);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// De puzzel van de dag: voor iedereen dezelfde, het niveau loopt rond (1, 2,
// 3, 1, ...). Een eigen seed per datum, zodat geen andere puzzel verschuift.
export function puzzelVanDeDag(datum = vandaag()) {
  const dagnummer = Math.floor(Date.parse(`${datum}T12:00:00Z`) / 86400000);
  const niveau = (dagnummer % 3) + 1;
  const seed = `dag-${datum}`;
  return puzzleId({ opdracht: 'dader', wereld: wereldVoorSeed(seed), mechaniek: 'kamer', niveau, seed });
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
  ingelogd = false,
  stand = BETAALMUUR,
  zoek = globalThis.location?.search ?? '',
  nu = Date.now(),
} = {}) {
  if (!muurActief(stand, zoek)) return true;
  if (heeftToegang(opslag, nu)) return true;
  if (voortgang(id)) return true;
  // Een puzzel van de dag die je ooit opende, blijft van jou, ook na die dag.
  const dagen = tekstLijst(lees(opslag, DAGEN, []));
  if (dagen.includes(id)) return true;
  if (ingelogd && id === puzzelVanDeDag(vandaag(nu))) {
    schrijf(opslag, DAGEN, [...dagen, id].slice(-60));
    return true;
  }
  const alles = geopend(opslag);
  const lijst = alles[niveau] ?? [];
  if (lijst.includes(id)) return true;
  if (lijst.length >= (GRATIS[niveau] ?? 0)) return false;
  alles[niveau] = [...lijst, id];
  schrijf(opslag, GEOPEND, alles);
  return true;
}

// De gratis puzzels van een niveau, om op de muur terug naar te verwijzen.
export function gratisVan(niveau, opslag = globalThis.localStorage) {
  return geopend(opslag)[niveau] ?? [];
}
