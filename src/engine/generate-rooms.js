// Generator voor het kamerraster.
//
// Zelfde werkwijze als bij de andere puzzels: kies een oplossing, bouw een
// vijver van aanwijzingen die daarin waar zijn, voeg toe tot het vastligt,
// snoei alles weg wat je kunt missen.
//
// Een extra regel hier: geen enkele aanwijzing mag de dader rechtstreeks
// noemen. "X stond in de keuken" is verboden als het slachtoffer in de keuken
// ligt - dan is de puzzel in een zin voorbij.

import { bouwRooster, tekenPlaatsing, telPlaatsingen, graad, idx, rijVan, kolVan } from './rooms.js';
import { makeRng } from './rng.js';

const sleutel = (c) => JSON.stringify([c.soort, c.p, c.q, c.kamerIdx, c.m, c.ja]);

function bouwVijver(rooster, plaats, slachtoffer, rng, gewichten) {
  const { n, kamerVan, meubelOp, meubelAantal, kamers } = rooster;
  const slachtofferKamer = kamerVan[slachtoffer];
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

    // Rechtstreekse weggever: dit is precies de vraag.
    if (mijnKamer !== slachtofferKamer) zet('kamer', { p, kamerIdx: mijnKamer, ja: true });
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

    const bijLijk = buren(plaats[p]).includes(slachtoffer);
    // Grenzen aan het slachtoffer verraadt de dader niet, maar wel bijna.
    // Alleen als ontkenning toestaan.
    if (!bijLijk) zet('bijSlachtoffer', { p, ja: false });

    for (let q = 0; q < n; q++) {
      if (q === p) continue;
      const zelfde = kamerVanPersoon(p) === kamerVanPersoon(q);
      // Ook hier: "samen in de kamer van het slachtoffer" zegt het antwoord.
      if (!(zelfde && mijnKamer === slachtofferKamer)) {
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

function groeiTotVast(rooster, vijver, slachtoffer, stijl) {
  const gekozen = [];
  const gezien = new Set();
  const klaar = () =>
    stijl === 'shallow'
      ? graad(rooster, gekozen, slachtoffer).opgelost
      : telPlaatsingen(rooster, gekozen, slachtoffer).count === 1;

  for (const c of vijver) {
    if (klaar()) break;
    const k = sleutel(c);
    if (gezien.has(k)) continue;
    gezien.add(k);
    gekozen.push(c);
  }
  return klaar() ? gekozen : null;
}

function snoei(rooster, aanwijzingen, slachtoffer, stijl, rng) {
  const houd = aanwijzingen.slice();
  for (const i of rng.shuffle(houd.map((_, j) => j))) {
    if (!houd[i]) continue;
    const proef = houd.filter((c, j) => c && j !== i);
    const ok = stijl === 'shallow'
      ? graad(rooster, proef, slachtoffer).opgelost
      : telPlaatsingen(rooster, proef, slachtoffer).count === 1;
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

  // Het slachtoffer ligt in een kamer waar precies een persoon staat: die is
  // de dader. Zonder zo'n kamer heeft de vraag geen eenduidig antwoord.
  const perKamer = new Map();
  plaats.forEach((cel, p) => {
    const k = rooster.kamerVan[cel];
    if (!perKamer.has(k)) perKamer.set(k, []);
    perKamer.get(k).push(p);
  });
  const alleen = [...perKamer.entries()].filter(([, lijst]) => lijst.length === 1);
  if (!alleen.length) return null;

  const [kamerIdx, [dader]] = rng.pick(alleen);
  const vrijeCellen = [];
  for (let i = 0; i < rooster.n * rooster.n; i++) {
    if (rooster.kamerVan[i] !== kamerIdx) continue;
    if (!rooster.vrij[i]) continue;
    if (plaats.includes(i)) continue;
    vrijeCellen.push(i);
  }
  if (!vrijeCellen.length) return null;
  const slachtoffer = rng.pick(vrijeCellen);

  const vijver = bouwVijver(rooster, plaats, slachtoffer, rng, params.gewichten);
  const gegroeid = groeiTotVast(rooster, vijver, slachtoffer, params.style);
  if (!gegroeid) return null;
  if (telPlaatsingen(rooster, gegroeid, slachtoffer).count !== 1) return null;

  const aanwijzingen = snoei(rooster, gegroeid, slachtoffer, params.style, rng);
  const g = graad(rooster, aanwijzingen, slachtoffer);
  return { rooster, plaats, slachtoffer, dader, kamerIdx, aanwijzingen, graad: g };
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
