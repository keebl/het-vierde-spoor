// De voortgang op het pad (specs/level-path.md, plan stap 5).
//
// Eén sleutel in localStorage, `vierdespoor.pad`:
//   { versie: 1, stappen: { "<k>": { sterren: 0-3, opgelost: bool } } }
// Per stapnummer, niet per puzzel: verandert een stap in een latere versie
// van het pad, dan houdt de speler zijn sterren (spec, randgevallen). De
// sync (src/sync/samenvoegen.js) leest en schrijft precies deze vorm.
//
// Alles hier neemt de opslag als argument, zodat de keuring het zonder
// browser kan toetsen (tools/check-pad.mjs).

import { meldWijziging } from '../sync/melding.js';

export const PAD_SLEUTEL = 'vierdespoor.pad';
// Waar een kapotte of onbekende waarde heen gaat, in plaats van weg.
export const PAD_RESERVE = 'vierdespoor.pad.kapot';
const VERSIE = 1;

const isObject = (x) => x != null && typeof x === 'object' && !Array.isArray(x);
const leeg = () => ({ versie: VERSIE, stappen: {} });

// De sterrenregel: drie zonder Hint en zonder Controleer, twee bij precies
// één keer hulp, één bij meer. `hulp` is het aantal keer Hint plus
// Controleer samen.
export function sterrenVoor(hulp) {
  const h = Math.max(0, Number(hulp) || 0);
  return h === 0 ? 3 : h === 1 ? 2 : 1;
}

// Lees de voortgang. Kapot, of van een versie die we niet kennen: dan geen
// voortgang, en de oude waarde gaat naar de reserve (nooit een fout).
export function leesPad(opslag = globalThis.localStorage) {
  let ruw = null;
  try {
    ruw = opslag.getItem(PAD_SLEUTEL);
  } catch {
    return leeg();
  }
  if (ruw == null) return leeg();
  let pad = null;
  try { pad = JSON.parse(ruw); } catch { pad = null; }
  if (!isObject(pad) || pad.versie !== VERSIE || !isObject(pad.stappen)) {
    try { opslag.setItem(PAD_RESERVE, ruw); } catch { /* dan niet */ }
    return leeg();
  }
  const stappen = {};
  for (const [k, s] of Object.entries(pad.stappen)) {
    const n = Number(k);
    if (!Number.isInteger(n) || n < 1 || !isObject(s)) continue;
    const sterren = Number.isInteger(s.sterren) && s.sterren >= 0 && s.sterren <= 3 ? s.sterren : 0;
    stappen[k] = { sterren, opgelost: s.opgelost === true };
  }
  return { versie: VERSIE, stappen };
}

// Of er bewaard kan worden (privémodus, geblokkeerde opslag).
export function opslagWerkt(opslag = globalThis.localStorage) {
  try {
    const proef = `${PAD_SLEUTEL}.proef`;
    opslag.setItem(proef, '1');
    opslag.removeItem(proef);
    return true;
  } catch {
    return false;
  }
}

// Zonder opslag werkt het pad voor deze sessie (spec): dan staat de stand
// hier in het geheugen.
let geheugen = null;

export function padStand(opslag = globalThis.localStorage) {
  return opslagWerkt(opslag) ? leesPad(opslag) : (geheugen ??= leeg());
}

// Stap k is opgelost met `hulp` keer Hint of Controleer. Sterren gaan
// alleen omhoog. Geeft { sterren, eerder }: wat deze keer opleverde en
// wat er al stond.
export function losStapOp(k, hulp, opslag = globalThis.localStorage) {
  const pad = padStand(opslag);
  const oud = pad.stappen[String(k)] ?? { sterren: 0, opgelost: false };
  const nu = sterrenVoor(hulp);
  pad.stappen[String(k)] = { sterren: Math.max(oud.sterren, nu), opgelost: true };
  if (opslagWerkt(opslag)) {
    try { opslag.setItem(PAD_SLEUTEL, JSON.stringify(pad)); } catch { /* vol: dan niet */ }
  } else {
    geheugen = pad;
  }
  meldWijziging('pad', String(k), opslag);
  return { sterren: nu, eerder: oud.sterren };
}

// De eerste stap die nog niet is opgelost: daar is de speler. Stap k+1
// gaat open als k opgelost is (Oplossing telt niet; zie losStapOp, die
// alleen bij zelf oplossen wordt aangeroepen). `aantal` stappen in totaal;
// alles opgelost geeft aantal + 1 (het eind).
export function huidigeStap(pad, aantal) {
  for (let k = 1; k <= aantal; k++) if (!pad.stappen[String(k)]?.opgelost) return k;
  return aantal + 1;
}

export function isOpen(pad, k) {
  return k === 1 || !!pad.stappen[String(k - 1)]?.opgelost || !!pad.stappen[String(k)]?.opgelost;
}

export function totaalSterren(pad, aantal) {
  let som = 0;
  for (let k = 1; k <= aantal; k++) som += pad.stappen[String(k)]?.sterren ?? 0;
  return som;
}
