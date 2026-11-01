// Generator voor het kamerraster.
//
// Zelfde werkwijze als bij de andere puzzels: kies een oplossing, bouw een
// vijver van aanwijzingen die daarin waar zijn, voeg toe tot het vastligt,
// snoei alles weg wat je kunt missen.
//
// Het slachtoffer is zelf een van de figuren op het bord. Waar het lichaam
// ligt moet je dus net zo goed uitpuzzelen, en pas als alles staat zie je wie
// er als enige bij in de kamer stond.
//
// Een extra regel: geen enkele aanwijzing mag de dader rechtstreeks noemen.
// "X stond in dezelfde kamer als het slachtoffer" is daarom verboden - dat is
// letterlijk de vraag.

import { bouwRooster, tekenPlaatsing, telPlaatsingen, graad, idx, rijVan, kolVan } from './rooms.js';
import { makeRng } from './rng.js';

const sleutel = (c) => JSON.stringify([c.soort, c.p, c.q, c.kamerIdx, c.m, c.ja]);

function bouwVijver(rooster, plaats, slachtofferIdx, rng, gewichten) {
  const { n, kamerVan, meubelOp, meubelAantal, kamers } = rooster;
  const vijver = [];
  const zet = (soort, c) => {
    if (!gewichten[soort]) return;
    vijver.push({ ...c, soort, gewicht: gewichten[soort] });
  };

  const kamerVanPersoon = (p) => kamerVan[plaats[p]];
  const buren = (cel) => {
    const r = rijVan(n, cel);
    const k = kolVan(n, cel);
    const uit = [];
    if (r > 0) uit.push(idx(n, r - 1, k));
    if (r < n - 1) uit.push(idx(n, r + 1, k));
    if (k > 0) uit.push(idx(n, r, k - 1));
    if (k < n - 1) uit.push(idx(n, r, k + 1));
    return uit;
  };

  for (let p = 0; p < n; p++) {
    const mijnKamer = kamerVanPersoon(p);

    // Waar het lichaam ligt moet je uitpuzzelen, dus van het slachtoffer
    // mag niet rechtstreeks gezegd worden in welke kamer het lag. Ontkenningen
    // ("niet in de bibliotheek") mogen wel: die helpen zonder te verklappen.
    if (p !== slachtofferIdx) zet('kamer', { p, kamerIdx: mijnKamer, ja: true });
    for (let k = 0; k < kamers; k++) {
      if (k !== mijnKamer) zet('kamer', { p, kamerIdx: k, ja: false });
    }

    for (let m = 0; m < meubelAantal; m++) {
      const raakt = buren(plaats[p]).some((b) => meubelOp[b] === m);
      zet('naast', { p, m, ja: raakt });
      if (!raakt) continue;
    }
    for (let m = 0; m < meubelAantal; m++) {
      const r = rijVan(n, plaats[p]);
      let opRij = false;
      for (let k = 0; k < n; k++) if (meubelOp[idx(n, r, k)] === m) opRij = true;
      if (opRij) zet('opRij', { p, m });
    }

    for (let q = 0; q < n; q++) {
      if (q === p) continue;
      const zelfde = kamerVanPersoon(p) === kamerVanPersoon(q);
      // "X stond in dezelfde kamer als het slachtoffer" is de vraag zelf.
      const raaktLijk = p === slachtofferIdx || q === slachtofferIdx;
      if (!(zelfde && raaktLijk)) {
        zet('zelfdeKamer', { p, q, ja: zelfde });
      }
      if (p < q) {
        const a = plaats[p];
        const b = plaats[q];
        if (rijVan(n, a) < rijVan(n, b)) zet('noord', { p, q });
        else zet('noord', { p: q, q: p });
        if (kolVan(n, a) < kolVan(n, b)) zet('west', { p, q });
        else zet('west', { p: q, q: p });
        const naastElkaar = Math.abs(rijVan(n, a) - rijVan(n, b)) + Math.abs(kolVan(n, a) - kolVan(n, b)) === 1;
        zet('buren', { p, q, ja: naastElkaar });
      }
    }
  }

  const bezet = new Set(plaats.map((cel) => kamerVan[cel]));
  for (let k = 0; k < kamers; k++) if (!bezet.has(k)) zet('leegKamer', { kamerIdx: k });

  return vijver
    .map((c) => ({ c, s: rng() / c.gewicht }))
    .sort((a, b) => a.s - b.s)
    .map((e) => e.c);
}

function groeiTotVast(rooster, vijver, stijl) {
  const gekozen = [];
  const gezien = new Set();
  const klaar = () =>
    stijl === 'shallow'
      ? graad(rooster, gekozen).opgelost
      : telPlaatsingen(rooster, gekozen).count === 1;

  for (const c of vijver) {
    if (klaar()) break;
    const k = sleutel(c);
    if (gezien.has(k)) continue;
    gezien.add(k);
    gekozen.push(c);
  }
  return klaar() ? gekozen : null;
}

function snoei(rooster, aanwijzingen, stijl, rng) {
  const houd = aanwijzingen.slice();
  for (const i of rng.shuffle(houd.map((_, j) => j))) {
    if (!houd[i]) continue;
    const proef = houd.filter((c, j) => c && j !== i);
    const ok = stijl === 'shallow'
      ? graad(rooster, proef).opgelost
      : telPlaatsingen(rooster, proef).count === 1;
    if (ok) houd[i] = null;
  }
  return houd.filter(Boolean);
}

function poging(params, rng) {
  const rooster = bouwRooster(params.n, rng, {
    kamers: params.kamers,
    meubelDeel: params.meubelDeel,
    maxMeubels: params.maxMeubels,
  });
  const plaats = tekenPlaatsing(rooster, rng);
  if (!plaats) return null;

  // Welke figuur is het slachtoffer? Eentje die uiteindelijk met precies een
  // ander in dezelfde kamer blijkt te staan - die ander is de dader. Zonder
  // zo'n paar heeft de vraag geen eenduidig antwoord.
  const perKamer = new Map();
  plaats.forEach((cel, p) => {
    const k = rooster.kamerVan[cel];
    if (!perKamer.has(k)) perKamer.set(k, []);
    perKamer.get(k).push(p);
  });
  const paren = [...perKamer.entries()].filter(([, lijst]) => lijst.length === 2);
  if (!paren.length) return null;

  const [kamerIdx, paar] = rng.pick(paren);
  const slachtofferIdx = rng.pick(paar);
  const dader = paar.find((p) => p !== slachtofferIdx);

  const vijver = bouwVijver(rooster, plaats, slachtofferIdx, rng, params.gewichten);
  const gegroeid = groeiTotVast(rooster, vijver, params.style);
  if (!gegroeid) return null;
  if (telPlaatsingen(rooster, gegroeid).count !== 1) return null;

  const aanwijzingen = snoei(rooster, gegroeid, params.style, rng);
  const g = graad(rooster, aanwijzingen);
  return { rooster, plaats, slachtofferIdx, dader, kamerIdx, aanwijzingen, graad: g };
}

export function genereerKamerpuzzel(seed, params, pogingen = 10) {
  let beste = null;
  for (let t = 0; t < pogingen; t++) {
    const rng = makeRng(`${seed}#kamer${t}`);
    let kandidaat;
    try {
      kandidaat = poging(params, rng);
    } catch {
      continue;
    }
    if (!kandidaat) continue;
    const mis = params.style === 'deep'
      ? (kandidaat.graad.opgelost ? 10 : 0)
      : (kandidaat.graad.opgelost ? Math.max(0, kandidaat.aanwijzingen.length - (params.maxClues ?? 99)) : 10);
    if (mis === 0) return { ...kandidaat, poging: t };
    if (!beste || mis < beste.mis) beste = { ...kandidaat, mis, poging: t };
  }
  if (!beste) throw new Error('kon geen kamerpuzzel bouwen voor deze instellingen');
  return beste;
}
