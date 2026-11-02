// De Nederlandse zinnen van het kamerraster. Apart gehouden, zodat de motor
// niets van taal hoeft te weten.

import { telwoord, hoofdletter } from './woorden.js';
import { voorzetselVan } from './kamersoorten.js';

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

  switch (c.soort) {
    case 'kamer':
      return hoofdletter(c.ja ? `${P} stond ${V} ${K}.` : `${P} stond niet ${V} ${K}.`);
    case 'zelfdeKamer':
      return hoofdletter(c.ja
        ? `${P} en ${Q} stonden ${ZELFDE}.`
        : `${P} en ${Q} stonden niet ${ZELFDE}.`);
    case 'aantalKamer': {
      if (c.aantal === 0) return hoofdletter(`${V} ${K} stond niemand.`);
      if (c.aantal === 1) return hoofdletter(`${V} ${K} stond precies één iemand.`);
      return hoofdletter(`${V} ${K} stonden precies ${telwoord(c.aantal)} mensen.`);
    }
    case 'aantalNaast': {
      if (c.aantal === 0) return hoofdletter(`er stond niemand naast ${M}.`);
      if (c.aantal === 1) return hoofdletter(`precies één iemand stond naast ${M}.`);
      return hoofdletter(`er stonden ${telwoord(c.aantal)} mensen naast ${M}.`);
    }
    case 'rand':
      return hoofdletter(c.ja
        ? `${P} stond tegen de buitenmuur.`
        : `${P} stond niet tegen de buitenmuur.`);
    case 'hoek':
      return hoofdletter(c.ja
        ? `${P} stond in een hoek van het gebouw.`
        : `${P} stond niet in een hoek van het gebouw.`);
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
  if (c.kamerIdx != null) uit.push(w.kamerNamen[c.kamerIdx]);
  if (c.m != null) uit.push(w.meubelNamen[c.m]);
  return uit;
}
