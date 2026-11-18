// De Nederlandse zinnen van het kamerraster. Apart gehouden, zodat de motor
// niets van taal hoeft te weten.

import { telwoord, hoofdletter } from './woorden.js';
import { voorzetselVan, REKWISIETTYPEN } from './kamersoorten.js';

// Hoe je een stuk van type t noemt. Ligt er maar één van op het bord, dan
// bij zijn eigen naam ("op de leren fauteuil", "op het paard"); liggen er
// meer, dan het type met "een" ("op een kruk"). Zo zegt een zin nooit "de
// kruk" als er drie zijn.
function stukWoord(t, w) {
  const T = REKWISIETTYPEN[t];
  if ((w.typeAantal?.[t] ?? 0) === 1 && w.typeNaam?.[t]) return w.typeNaam[t];
  return `een ${T.een}`;
}

// Hoe iemand op een stuk van type t was: "zat op een stoel", "lag in het
// bed", "reed op het paard". Het werkwoord komt van het type
// (REKWISIETTYPEN), niet van de aanwijzing.
export function opZin(t, w, { tijd = 'was', ontkend = false } = {}) {
  const T = REKWISIETTYPEN[t];
  const ww = tijd === 'meer' ? T.was.replace(/^(zat|lag|stond|reed)$/, (x) => ({ zat: 'zaten', lag: 'lagen', stond: 'stonden', reed: 'reden' })[x]) : T[tijd];
  return `${ww}${ontkend ? ' niet' : ''} ${T.vz} ${stukWoord(t, w)}`;
}

// Het gezegde van een aanwijzing over één persoon, zonder de persoon:
// "stond in de keuken", "zat op een stoel". Hiermee worden de samengestelde
// zinnen gebouwd ("en", "of", "ofwel ... ofwel").
export function gezegde(c, w) {
  const K = c.kamerIdx != null ? w.kamerNamen[c.kamerIdx] : null;
  const K2 = c.kamer2 != null ? w.kamerNamen[c.kamer2] : null;
  const M = c.m != null ? w.meubelNamen[c.m] : null;
  const V = K ? voorzetselVan(K) : 'in';
  const V2 = K2 ? voorzetselVan(K2) : 'in';
  const RAND = w.randZin ?? 'tegen de buitenmuur';
  const HOEK = w.hoekZin ?? 'in een hoek van het gebouw';
  switch (c.soort) {
    case 'kamer':
    case 'kamerNiet':
      return c.ja ? `stond ${V} ${K}` : `stond niet ${V} ${K}`;
    case 'kamerOf':
      return `stond ${V} ${K} of ${V2} ${K2}`;
    case 'nietNiet':
      return `stond niet ${V} ${K} en ook niet ${V2} ${K2}`;
    case 'naast':
      return c.ja ? `stond naast ${M}` : `stond niet naast ${M}`;
    case 'rand':
      return c.ja ? `stond ${RAND}` : `stond niet ${RAND}`;
    case 'hoek':
      return c.ja ? `stond ${HOEK}` : `stond niet ${HOEK}`;
    case 'op':
      return opZin(c.t, w);
    case 'nietOp':
      return opZin(c.t, w, { ontkend: true });
    case 'typeOf':
      return koppel(opZin(c.t, w), opZin(c.t2, w), 'of');
    case 'naastType':
      return c.ja ? `stond naast ${stukWoord(c.t, w)}` : `stond niet naast ${stukWoord(c.t, w)}`;
    case 'voorRaam':
      return c.ja ? 'stond voor een raam' : 'stond niet voor een raam';
    case 'hoekKamer':
      return c.ja ? 'stond in een hoek, met aan twee kanten een muur' : 'stond niet in een hoek';
    case 'rijEnKamerAls':
      return `stond op dezelfde rij als ${M}, en ${V0(c, w)}`;
    case 'opRij':
      return `stond op dezelfde rij als ${M}`;
    case 'opKolom':
      return `stond in dezelfde kolom als ${M}`;
    default:
      return null;
  }
}
// Twee gezegden aan elkaar: hetzelfde werkwoord niet twee keer. "stond in
// de dienstgang en naast de console", niet "... en stond naast de console".
export function koppel(a, b, voeg) {
  const wa = a.split(' ')[0];
  const wb = b.split(' ')[0];
  return wa === wb ? `${a} ${voeg} ${b.slice(wb.length + 1)}` : `${a} ${voeg} ${b}`;
}

// "in dezelfde kamer", of wat de wereld een ruimte noemt.
const V0 = (c, w) => `${(w.zelfde ?? 'in dezelfde kamer')}`;

export function zinVoor(c, w) {
  const P = w.personen[c.p];
  const Q = c.q != null ? w.personen[c.q] : null;
  const K = c.kamerIdx != null ? w.kamerNamen[c.kamerIdx] : null;
  const M = c.m != null ? w.meubelNamen[c.m] : null;

  // "in de keuken", maar "op het hertenpad" en "bij de dampende poel".
  const V = K ? voorzetselVan(K) : 'in';
  // "dezelfde kamer", of wat de wereld een ruimte noemt: in het woud is het
  // geen kamer maar een plek, op het station een module.
  const ZELFDE = w.zelfde ?? 'in dezelfde kamer';
  // De buitenrand van het bord heet niet overal hetzelfde: een bos heeft
  // geen buitenmuur.
  const RAND = w.randZin ?? 'tegen de buitenmuur';
  const HOEK = w.hoekZin ?? 'in een hoek van het gebouw';

  // Samengestelde en nieuwe soorten over één persoon: persoon + gezegde.
  if (['kamerOf', 'nietNiet', 'op', 'nietOp', 'typeOf', 'naastType', 'voorRaam', 'hoekKamer', 'rijEnKamerAls'].includes(c.soort)) {
    return hoofdletter(`${P} ${gezegde(c, w)}.`);
  }

  switch (c.soort) {
    case 'en': {
      const a = gezegde({ ...c.a, p: c.p }, w);
      const b = gezegde({ ...c.b, p: c.p }, w);
      return hoofdletter(`${P} ${koppel(a, b, 'en')}.`);
    }
    case 'enigeOp': {
      const T = REKWISIETTYPEN[c.t];
      const ww = { zat: 'zat', lag: 'lag', stond: 'stond', reed: 'reed' }[T.was];
      return hoofdletter(`${P} was de enige die ${T.vz} ${stukWoord(c.t, w)} ${ww}.`);
    }
    case 'aantalOp': {
      const T = REKWISIETTYPEN[c.t];
      const stuk = (w.typeAantal?.[c.t] ?? 0) === 1 ? w.typeNaam[c.t] : `een ${T.een}`;
      if (c.aantal === 0) return hoofdletter(`niemand ${T.was} ${T.vz} ${stuk}.`);
      if (c.aantal === 1) return hoofdletter(`precies één persoon ${T.was} ${T.vz} ${stuk}.`);
      return hoofdletter(`precies ${telwoord(c.aantal)} mensen ${opZin(c.t, w, { tijd: 'meer' })}.`);
    }
    case 'ofwelPersoon':
      return hoofdletter(`ofwel ${P}, ofwel ${Q} ${gezegde({ ...c.a, p: c.p }, w)}.`);
    case 'wieOp': {
      const T = REKWISIETTYPEN[c.t];
      const R = w.personen[c.ref];
      const wie = `wie ${T.vz} ${stukWoord(c.t, w)} ${T.was}`;
      const rel = c.rel === 'noord' ? `stond ten noorden van ${R}`
        : c.rel === 'west' ? `stond ten westen van ${R}` : `stond ${ZELFDE} als ${R}`;
      return hoofdletter(`${wie}, ${rel}.`);
    }
    case 'kamer':
    case 'kamerNiet':
      return hoofdletter(c.ja ? `${P} stond ${V} ${K}.` : `${P} stond niet ${V} ${K}.`);
    case 'zelfdeKamer':
      return hoofdletter(c.ja
        ? `${P} en ${Q} stonden ${ZELFDE}.`
        : `${P} en ${Q} stonden niet ${ZELFDE}.`);
    // "Precies één iemand" stond hier, en dat is geen Nederlands.
    case 'aantalKamer': {
      if (c.aantal === 0) return hoofdletter(`${V} ${K} stond niemand.`);
      if (c.aantal === 1) return hoofdletter(`${V} ${K} stond precies één persoon.`);
      return hoofdletter(`${V} ${K} stonden precies ${telwoord(c.aantal)} mensen.`);
    }
    case 'aantalNaast': {
      if (c.aantal === 0) return hoofdletter(`er stond niemand naast ${M}.`);
      if (c.aantal === 1) return hoofdletter(`er stond precies één persoon naast ${M}.`);
      return hoofdletter(`er stonden ${telwoord(c.aantal)} mensen naast ${M}.`);
    }
    case 'rand':
      return hoofdletter(c.ja ? `${P} stond ${RAND}.` : `${P} stond niet ${RAND}.`);
    case 'hoek':
      return hoofdletter(c.ja ? `${P} stond ${HOEK}.` : `${P} stond niet ${HOEK}.`);
    case 'opKolom':
      return hoofdletter(`${P} stond in dezelfde kolom als ${M}.`);
    case 'naast':
      return hoofdletter(c.ja ? `${P} stond naast ${M}.` : `${P} stond niet naast ${M}.`);
    case 'opRij':
      return hoofdletter(`${P} stond op dezelfde rij als ${M}.`);
    case 'noord':
      return hoofdletter(`${P} stond ten noorden van ${Q}.`);
    case 'west':
      return hoofdletter(`${P} stond ten westen van ${Q}.`);
    case 'buren':
      return hoofdletter(c.ja
        ? `${P} en ${Q} stonden pal naast elkaar.`
        : `${P} en ${Q} stonden niet pal naast elkaar.`);
    default:
      return '';
  }
}

// De namen waar een aanwijzing naar verwijst. Nodig om een herschreven
// versie van de AI-laag te kunnen keuren.
export function namenIn(c, w) {
  const uit = [];
  if (c.p != null) uit.push(w.personen[c.p]);
  if (c.q != null) uit.push(w.personen[c.q]);
  if (c.ref != null) uit.push(w.personen[c.ref]);
  if (c.kamerIdx != null) uit.push(w.kamerNamen[c.kamerIdx]);
  if (c.kamer2 != null) uit.push(w.kamerNamen[c.kamer2]);
  if (c.m != null) uit.push(w.meubelNamen[c.m]);
  for (const h of [c.a, c.b]) {
    if (!h) continue;
    if (h.kamerIdx != null) uit.push(w.kamerNamen[h.kamerIdx]);
    if (h.kamer2 != null) uit.push(w.kamerNamen[h.kamer2]);
    if (h.m != null) uit.push(w.meubelNamen[h.m]);
  }
  return uit;
}
