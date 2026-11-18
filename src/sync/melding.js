// Het enige stukje sync dat het spel kent. state.js roept meldWijziging()
// aan als er iets verandert dat mee mag reizen; deze module onthoudt wat
// er nog verstuurd moet worden en geeft een seintje aan sync.js, als die
// geladen is. Supabase komt hier niet voor: wie niet inlogt, laadt nooit
// meer dan dit bestand (specs/accounts-and-sync.md, criterium 1).

export const META = 'vierdespoor.sync';
// supabase-js bewaart zijn sessie onder deze sleutel (zie sessie.js). Staat
// hij er niet, dan is er niemand ingelogd en hoeft er niets bijgehouden te
// worden behalve de tijden van de voorkeuren.
export const SESSIE = 'vierdespoor.sessie';

const luisteraars = new Set();

export function leesMeta(opslag = globalThis.localStorage) {
  try {
    const m = JSON.parse(opslag.getItem(META) || '{}');
    return m && typeof m === 'object' && !Array.isArray(m) ? m : {};
  } catch {
    return {};
  }
}

export function schrijfMeta(m, opslag = globalThis.localStorage) {
  try {
    opslag.setItem(META, JSON.stringify(m));
  } catch {
    /* geen opslag: dan synchroniseert het ook niet, en speelt het gewoon */
  }
}

export function heeftSessie(opslag = globalThis.localStorage) {
  try {
    return !!opslag.getItem(SESSIE);
  } catch {
    return false;
  }
}

// soort: 'puzzel' (sleutel = puzzel-id), 'pad' (sleutel = stapnummer) of
// 'voorkeur' (sleutel = 'niveau', 'kruisjes' of 'panelen').
//
// Van een voorkeur onthouden we altijd wanneer hij gekozen is, ook zonder
// account: bij de eerste keer inloggen wint dan de nieuwste keuze, en niet
// zomaar die van het apparaat dat toevallig als eerste verstuurt.
export function meldWijziging(soort, sleutel, opslag = globalThis.localStorage) {
  try {
    const m = leesMeta(opslag);
    if (soort === 'voorkeur') {
      m.tijden = { ...(m.tijden ?? {}), [sleutel]: new Date().toISOString() };
    }
    if (heeftSessie(opslag)) {
      // Per sleutel een volgnummer, geen vlag: verandert iets opnieuw terwijl
      // een ronde onderweg is, dan ziet sync.js een ander nummer dan het
      // verstuurde en laat het open voor de volgende ronde.
      const open = m.open ?? {};
      const lijst = { puzzel: 'puzzels', pad: 'pad', voorkeur: 'voorkeuren' }[soort];
      if (lijst) {
        m.teller = (Number.isInteger(m.teller) ? m.teller : 0) + 1;
        const oud = open[lijst] && typeof open[lijst] === 'object' && !Array.isArray(open[lijst]) ? open[lijst] : {};
        open[lijst] = { ...oud, [String(sleutel)]: m.teller };
        m.open = open;
      }
    }
    schrijfMeta(m, opslag);
  } catch {
    /* een melding mag het spel nooit laten struikelen */
  }
  for (const f of luisteraars) {
    try { f(soort, sleutel); } catch { /* idem */ }
  }
}

export function bijWijziging(f) {
  luisteraars.add(f);
  return () => luisteraars.delete(f);
}
