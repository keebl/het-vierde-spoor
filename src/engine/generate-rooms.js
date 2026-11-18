// Generator voor het kamerraster.
//
// Zelfde werkwijze als bij de andere puzzels: kies een oplossing, bouw een
// vijver van aanwijzingen die daarin waar zijn, voeg toe tot het vastligt,
// snoei alles weg wat je kunt missen.
//
// Het slachtoffer is zelf een van de figuren op het bord. Waar het lichaam
// ligt moet je dus net zo goed uitpuzzelen, en pas als alles staat zie je wie
// er als enige bij in de kamer stond. Geen aanwijzing noemt het slachtoffer:
// zijn plek is wat overblijft (zie zet() in bouwVijver).
//
// Een extra regel: geen enkele aanwijzing mag de dader rechtstreeks noemen.
// "X stond in dezelfde kamer als het slachtoffer" is daarom verboden - dat is
// letterlijk de vraag.

import {
  bouwRooster, richIn, tekenPlaatsing, telPlaatsingen, graad, domeinenVan, evalAanwijzing, idx, rijVan, kolVan,
  kamerBuren, naastMeubel, typeOp, typeTelling, naastType, inKamerhoek,
} from './rooms.js';
import { makeRng } from './rng.js';
import { redeneer } from './redeneer.js';

// Een poging die de solver niet binnen zijn budget rond krijgt, gooien we weg.
class TeZwaar extends Error {}

const sleutel = (c) => JSON.stringify([c.soort, c.p, c.q, c.kamerIdx, c.m, c.ja, c.t, c.t2, c.kamer2, c.ref, c.rel, c.a, c.b, c.aantal]);

// Hoeveel vrije vakjes een aanwijzing over één persoon, helemaal alleen op
// een leeg bord, voor die persoon openlaat.
export function vakjesOver(rooster, c) {
  const plaats = new Array(rooster.n).fill(null);
  const ctx = { rooster, plaats };
  let uit = 0;
  for (let cel = 0; cel < rooster.n * rooster.n; cel++) {
    if (!rooster.vrij[cel]) continue;
    plaats[c.p] = cel;
    // !== false: "de enige op een stoel" weet met één persoon nog niets
    // over de anderen (null), maar sluit dit vakje ook niet uit.
    if (evalAanwijzing(c, ctx) !== false) uit++;
  }
  return uit;
}

// minVrij: een aanwijzing over één persoon die in zijn eentje minder dan
// zoveel vakjes openlaat, komt niet in de vijver. "Lies stond naast de
// piano" met maar twee vakjes naast de piano wijst haar plek bijna aan,
// en dat is wat de dochter "te makkelijk" noemde (2026-11-16). Zie
// minVrij in KAMER_LEVELS.
function bouwVijver(rooster, plaats, slachtofferIdx, rng, gewichten, { minVrij = 0 } = {}) {
  const { n, kamerVan, meubelOp, kamers } = rooster;
  // De oude soorten (naast, opRij, opKolom, aantalNaast) gaan over de
  // blokken; over stukken waar je op zit gaan de soorten van stap 7.
  // Alleen blokken met een eigen naam: de naamloze (extraDeel) komen in geen
  // aanwijzing.
  const meubelAantal = rooster.benoemdAantal ?? rooster.blokAantal ?? rooster.meubelAantal;
  const vijver = [];
  const zet = (soort, c) => {
    if (!gewichten[soort]) return;
    if (minVrij && c.p != null && c.q == null && vakjesOver(rooster, { ...c, soort }) < minVrij) return;
    // Over het slachtoffer wordt niets gezegd, ook niet in de aanwijzing van
    // een ander ("Bram stond ten noorden van Max"). Elke puzzel gaf het
    // slachtoffer een eigen rijtje aanwijzingen, en dat leest alsof het een
    // verdachte is (de dochter, 2026-11-16). Waar het lichaam ligt volgt
    // nu uit de rest: het vakje dat over is als alle anderen staan, en de
    // tellingen, die over iedereen gaan en dus mogen blijven.
    if (c.p === slachtofferIdx || c.q === slachtofferIdx || c.ref === slachtofferIdx) return;
    vijver.push({ ...c, soort, gewicht: gewichten[soort] });
  };

  const kamerVanPersoon = (p) => kamerVan[plaats[p]];

  for (let p = 0; p < n; p++) {
    const mijnKamer = kamerVanPersoon(p);

    // Waar het lichaam ligt moet je uitpuzzelen, dus van het slachtoffer
    // mag niet rechtstreeks gezegd worden in welke kamer het lag. Ontkenningen
    // ("niet in de bibliotheek") mogen wel: die helpen zonder te verklappen.
    // 'kamer' is de directe aanwijzing - "Bram stond in de keuken" - en
    // daarmee de grootste weggever die er is: daar is geen redenering voor
    // nodig. De uitsluiting "Bram stond niet in de keuken" is het
    // tegenovergestelde en juist het nuttigste gereedschap. Ze hebben
    // daarom elk hun eigen gewicht, zodat een hoog niveau de ene kan
    // schrappen zonder de andere kwijt te raken.
    if (p !== slachtofferIdx) zet('kamer', { p, kamerIdx: mijnKamer, ja: true });
    for (let k = 0; k < kamers; k++) {
      if (k !== mijnKamer) zet('kamerNiet', { p, kamerIdx: k, ja: false });
    }

    for (let m = 0; m < meubelAantal; m++) {
      // Naast betekent: pal ernaast en in dezelfde kamer. Een meubelstuk aan
      // de andere kant van de muur levert dus "niet naast" op.
      zet('naast', { p, m, ja: naastMeubel(rooster, plaats[p], m) });
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
        zet('buren', { p, q, ja: kamerBuren(rooster, a).includes(b) });
      }
    }

    // Waar stond je ten opzichte van de buitenmuur?
    const r = rijVan(n, plaats[p]);
    const k = kolVan(n, plaats[p]);
    const aanRand = r === 0 || k === 0 || r === n - 1 || k === n - 1;
    const inHoek = (r === 0 || r === n - 1) && (k === 0 || k === n - 1);
    zet('rand', { p, ja: aanRand });
    zet('hoek', { p, ja: inHoek });

    for (let m = 0; m < meubelAantal; m++) {
      let opKolom = false;
      for (let q = 0; q < n; q++) if (meubelOp[idx(n, q, k)] === m) opKolom = true;
      if (opKolom) zet('opKolom', { p, m });
    }
  }

  // ---- fase B: stukken om op te zitten, ramen, hoeken, en "of"-zinnen
  // (specs/props-and-either-clues.md, specs/engine-extension.md stap 7).
  // Alleen wat het niveau een gewicht geeft komt in de vijver (zet).
  const typen = [...typeTelling(rooster).keys()].sort();
  for (let p = 0; p < n; p++) {
    const cel = plaats[p];
    const mijnType = typeOp(rooster, cel);
    const mijnKamer = kamerVan[cel];
    if (mijnType) zet('op', { p, t: mijnType });
    for (const t of typen) {
      if (t !== mijnType && gewichten.nietOp) zet('nietOp', { p, t });
      if (gewichten.naastType) zet('naastType', { p, t, ja: naastType(rooster, cel, t) });
    }
    if (mijnType && gewichten.enigeOp && plaats.filter((x) => typeOp(rooster, x) === mijnType).length === 1) {
      zet('enigeOp', { p, t: mijnType });
    }
    if (rooster.ramen?.length) zet('voorRaam', { p, ja: rooster.raamCel.has(cel) });
    zet('hoekKamer', { p, ja: inKamerhoek(rooster, cel) });
    for (let m = 0; m < (rooster.benoemdAantal ?? rooster.blokAantal ?? 0); m++) {
      const c = { soort: 'rijEnKamerAls', p, m };
      if (evalAanwijzing(c, { rooster, plaats }) === true) zet('rijEnKamerAls', { p, m });
    }
    // Een "of" tussen twee kamers of twee typen: de ware en één andere. De
    // twee samen laten minstens minVrij vakjes open (criterium 7): anders
    // is het een directe aanwijzing in vermomming.
    for (let k = 0; k < kamers && gewichten.kamerOf; k++) {
      if (k === mijnKamer) continue;
      const [a, b] = mijnKamer < k ? [mijnKamer, k] : [k, mijnKamer];
      zet('kamerOf', { p, kamerIdx: a, kamer2: b });
    }
    for (let k = 0; k < kamers && gewichten.nietNiet; k++) {
      for (let k2 = k + 1; k2 < kamers; k2++) {
        if (k === mijnKamer || k2 === mijnKamer) continue;
        zet('nietNiet', { p, kamerIdx: k, kamer2: k2 });
      }
    }
    if (mijnType && gewichten.typeOf) {
      for (const t of typen) if (t !== mijnType) zet('typeOf', { p, ...(mijnType < t ? { t: mijnType, t2: t } : { t, t2: mijnType }) });
    }
    // "en": twee ware halven over dezelfde persoon. De kamer met een stuk,
    // de kamer met een meubel ernaast, een stuk met een raam.
    if (gewichten.en) {
      const halven = [];
      halven.push({ soort: 'kamer', kamerIdx: mijnKamer, ja: true });
      if (mijnType) halven.push({ soort: 'op', t: mijnType });
      for (let m = 0; m < (rooster.benoemdAantal ?? rooster.blokAantal ?? 0); m++) if (naastMeubel(rooster, cel, m)) halven.push({ soort: 'naast', m, ja: true });
      for (const t of typen) if (naastType(rooster, cel, t)) halven.push({ soort: 'naastType', t, ja: true });
      if (rooster.raamCel?.has(cel)) halven.push({ soort: 'voorRaam', ja: true });
      for (let i = 0; i < halven.length; i++) {
        for (let j = i + 1; j < halven.length; j++) {
          const a = halven[i];
          const b = halven[j];
          // Twee halven over hetzelfde ding zeggen niets extra.
          if (a.soort === b.soort) continue;
          zet('en', { p, a, b });
        }
      }
    }
  }
  // Twee mensen: precies één van beiden zat op het paard.
  if (gewichten.ofwelPersoon) {
    for (let p = 0; p < n; p++) {
      for (let q = p + 1; q < n; q++) {
        const tp = typeOp(rooster, plaats[p]);
        const tq = typeOp(rooster, plaats[q]);
        if (tp && tp !== tq) zet('ofwelPersoon', { p, q, a: { soort: 'op', t: tp } });
        if (tq && tq !== tp) zet('ofwelPersoon', { p, q, a: { soort: 'op', t: tq } });
        const kp = kamerVan[plaats[p]];
        if (kp !== kamerVan[plaats[q]]) zet('ofwelPersoon', { p, q, a: { soort: 'kamer', kamerIdx: kp, ja: true } });
      }
    }
  }
  // Wie op het enige stuk van een type stond, ten opzichte van een ander.
  if (gewichten.wieOp) {
    for (const t of typen) {
      const op = plaats.map((x, q) => (typeOp(rooster, x) === t ? q : -1)).filter((q) => q >= 0);
      if (op.length !== 1 || op[0] === slachtofferIdx) continue;
      const wie = op[0];
      for (let r = 0; r < n; r++) {
        if (r === wie || r === slachtofferIdx) continue;
        const a = plaats[wie];
        const b = plaats[r];
        if (rijVan(n, a) < rijVan(n, b)) zet('wieOp', { t, ref: r, rel: 'noord' });
        if (kolVan(n, a) < kolVan(n, b)) zet('wieOp', { t, ref: r, rel: 'west' });
      }
    }
  }
  for (const t of typen) {
    if (!gewichten.aantalOp) break;
    zet('aantalOp', { t, aantal: plaats.filter((x) => typeOp(rooster, x) === t).length });
  }

  // Aanwijzingen over iedereen tegelijk: hoeveel mensen stonden er in deze
  // kamer, hoeveel naast dit meubelstuk. Die zeggen niets over een persoon en
  // dwingen je juist het geheel te overzien.
  const perKamer = new Map();
  plaats.forEach((cel) => {
    const kk = kamerVan[cel];
    perKamer.set(kk, (perKamer.get(kk) ?? 0) + 1);
  });
  for (let k = 0; k < kamers; k++) zet('aantalKamer', { kamerIdx: k, aantal: perKamer.get(k) ?? 0 });

  for (let m = 0; m < meubelAantal; m++) {
    let aantal = 0;
    for (const cel of plaats) if (naastMeubel(rooster, cel, m)) aantal++;
    zet('aantalNaast', { m, aantal });
  }

  return vijver
    .map((c) => ({ c, s: rng() / c.gewicht }))
    .sort((a, b) => a.s - b.s)
    .map((e) => e.c);
}

// Hoeveel aanwijzingen we vooruit kijken bij het kiezen van de volgende.
// Zie groeiTotVast. Gemeten op meet-0..19: met twaalf bleef op niveau drie
// nog een op de drie namen boven het plafond steken, met dertig niet meer;
// daarboven won niets.
const VENSTER = 30;

// Hoe vaak één soort aanwijzing in een puzzel mag voorkomen: een kwart
// (soortDeel in KAMER_LEVELS), en nooit minder dan twee - bij zes
// aanwijzingen zou een kwart er één zijn, en dan mag "naast" niet eens twee
// keer. "Ten noorden van" stond er op niveau zes negen keer in (de dochter,
// 2026-11-16: "ze lijken te veel op elkaar").
export const maxPerSoort = (aantal, deel = 0.25) => Math.max(2, Math.ceil(deel * aantal));

// Over wie gaat deze aanwijzing, zoals de speler hem ziet? Een aanwijzing
// over twee mensen staat bij allebei (src/aanwijzingen.js), dus telt hij
// ook voor allebei. Een telling gaat over niemand in het bijzonder.
const namenVan = (c) => (c.p == null ? (c.ref != null ? [c.ref] : []) : c.q == null || c.q === c.p ? [c.p] : [c.p, c.q]);

// Voeg aanwijzingen toe tot de puzzel vastligt.
//
// Dit nam de vijver van voor naar achter, en dat gaf namen met een stapel
// aanwijzingen: bij Het Rietveld College op Makkelijk hadden Imke, Pien en
// Quincy er elk drie, en op niveau zes was het gemiddelde drieënhalf per
// naam (de dochter, 2026-11-16: "te veel hints per persoon"). Een plafond
// hier al afdwingen werkt niet - gemeten: groeien gaat ver voorbij wat het
// snoeien overlaat, en met een plafond van zelfs drie boven het doel lukte
// op niveau drie geen enkele puzzel. Dus spreidt de bouwer hier alleen, en
// wordt het plafond pas na het snoeien gekeurd (genereerKamerpuzzel).
//
// Van de eerstvolgende VENSTER kandidaten in de vijver wint die over de naam
// met de minste aanwijzingen tot nu toe; bij gelijkspel de eerste, zodat de
// gewichten van het niveau blijven tellen. Geen nieuwe trekking: de keuze
// volgt uit de volgorde van de vijver, en die uit de seed.
function groeiTotVast(rooster, vijver, stijl, budget, slachtofferIdx) {
  const gekozen = [];
  const gezien = new Set();
  const perNaam = new Array(rooster.n).fill(0);

  // Het uniek maken is de dure stap: bij twaalf bij twaalf kost een telling
  // veel meer dan het doorstrepen. Dus eerst goedkoop doorstrepen, en de
  // teller pas aan het werk zetten als er nog maar een paar figuren open
  // staan. Anders rekent hij na elke toegevoegde aanwijzing de hele boom na.
  const klaar = () => {
    const g = graad(rooster, gekozen);
    if (stijl === 'shallow') return g.opgelost;
    if (g.open > 4) return false;
    const uit = telPlaatsingen(rooster, gekozen, 2, budget);
    // Weet de solver het niet binnen zijn budget, dan is deze poging niets
    // waard: we kunnen niet bewijzen dat de oplossing uniek is.
    if (uit.opgegeven) throw new TeZwaar();
    return uit.count === 1;
  };

  // Een telling gaat over niemand, maar mag niet altijd voorgaan: die doet
  // mee alsof hij over de minst bedeelde naam gaat.
  const minste = () => Math.min(...perNaam.filter((_, p) => p !== slachtofferIdx));
  const druk = (c) => {
    const namen = namenVan(c);
    return namen.length ? Math.max(...namen.map((p) => perNaam[p])) : minste();
  };

  const rest = vijver.slice();
  let begin = 0;
  while (!klaar()) {
    let beste = -1;
    let besteDruk = Infinity;
    let bekeken = 0;
    for (let i = begin; i < rest.length && bekeken < VENSTER; i++) {
      const c = rest[i];
      if (c && gezien.has(sleutel(c))) rest[i] = null;
      if (!rest[i]) {
        if (i === begin) begin++;
        continue;
      }
      bekeken++;
      const d = druk(c);
      if (d < besteDruk) {
        besteDruk = d;
        beste = i;
      }
    }
    if (beste < 0) return null;
    const c = rest[beste];
    rest[beste] = null;
    gezien.add(sleutel(c));
    gekozen.push(c);
    for (const p of namenVan(c)) perNaam[p]++;
  }
  return gekozen;
}

function snoei(rooster, aanwijzingen, stijl, rng, budget) {
  const houd = aanwijzingen.slice();
  // Aanwijzingen die we hier overslaan om tijd te sparen. Ze krijgen hun
  // eerlijke beurt in naSnoei, maar dan één keer en niet bij elke poging.
  const overgeslagen = [];

  // Wie het drukst bedeeld is, raakt als eerste iets kwijt. Eerst lukraak
  // (de trekking blijft dezelfde), en dan steeds de aanwijzing over de naam
  // die nu de meeste heeft - zo zakt de drukste naam het eerst naar zijn
  // plafond, in plaats van dat het toeval beslist wie er drie houdt.
  const perNaam = new Array(rooster.n).fill(0);
  for (const c of houd) for (const p of namenVan(c)) perNaam[p]++;
  const druk = (c) => Math.max(0, ...namenVan(c).map((p) => perNaam[p]));
  const volgorde = rng.shuffle(houd.map((_, j) => j));
  while (volgorde.length) {
    let pos = 0;
    for (let j = 1; j < volgorde.length; j++) {
      if (druk(houd[volgorde[j]]) > druk(houd[volgorde[pos]])) pos = j;
    }
    const i = volgorde.splice(pos, 1)[0];
    const proef = houd.filter((c, j) => c && j !== i);
    let ok;
    if (stijl === 'shallow') {
      ok = graad(rooster, proef).opgelost;
    } else {
      // Blijven er na doorstrepen te veel figuren open, dan is deze
      // aanwijzing bijna zeker nodig en hoeft de dure teller er niet aan.
      if (graad(rooster, proef).open > 4) {
        overgeslagen.push(i);
        continue;
      }
      const uit = telPlaatsingen(rooster, proef, 2, budget);
      if (uit.opgegeven) throw new TeZwaar();
      ok = uit.count === 1;
    }
    if (ok) {
      for (const p of namenVan(houd[i])) perNaam[p]--;
      houd[i] = null;
    }
  }
  return { aanwijzingen: houd.filter(Boolean), overgeslagen: overgeslagen.map((i) => houd[i]).filter(Boolean) };
}

// De tweede snoeironde, over de aanwijzingen die hierboven zijn
// overgeslagen.
//
// Zonder deze ronde bleven er aanwijzingen in staan die je gewoon kon
// weglaten - ze waren alleen overgeslagen omdat de goedkope voorselectie er
// geen uitsluitsel over gaf. Gemeten over vierentwintig puzzels tot en met
// niveau vier: twaalf van de tweehonderdvierenzestig.
//
// Twee dingen houden hem betaalbaar. Hij draait één keer, op de poging die
// het geworden is, en niet bij elk van de vierentwintig pogingen - dat
// scheelt het verschil tussen drie en zevenentwintig seconden op een bord
// van zestien bij zestien. En hij heeft een werkbudget: elke beurt is een
// volledige telling, en die kost op zestien bij zestien ruim een seconde.
// Wat binnen het budget past wordt nagerekend, de rest blijft staan.
//
// Dat budget telt solverstappen en geen milliseconden. Hier stond eerst een
// klok van 900 ms, en dan hangt de puzzel af van hoe druk de machine is: op
// 2026-11-10 gaf een halloween-bord op niveau zes andere aanwijzingen
// terwijl er een keuring naast draaide. Dezelfde link moet op elke telefoon
// hetzelfde bord geven, dus alles volgt uit de seed, ook waar we ophouden.
//
// 480.000 stappen is één volle telling op zestien bij zestien (30.000 per
// rij, zie poging) en gemeten iets meer dan wat er op een rustige laptop in
// 900 ms paste. Zo blijven de borden in de bibliotheek wat ze waren, en
// verschuift er niets op de kleinere roosters: die waren al binnen de klok
// klaar, dus ook binnen dit budget. We kijken voor elke beurt of er nog
// budget over is, en breken een lopende telling niet af - een afgebroken
// telling kost werk en levert niets op.
const NASNOEI_STAPPEN = 480000;

function naSnoei(rooster, aanwijzingen, overgeslagen, budget) {
  if (!overgeslagen.length) return aanwijzingen;
  const houd = aanwijzingen.slice();
  let gebruikt = 0;
  for (const c of overgeslagen) {
    const i = houd.indexOf(c);
    if (i < 0) continue;
    if (gebruikt >= NASNOEI_STAPPEN) break;
    const proef = houd.filter((x, j) => x && j !== i);
    const uit = telPlaatsingen(rooster, proef, 2, budget);
    gebruikt += uit.stappen;
    if (uit.opgegeven) continue;
    if (uit.count === 1) houd[i] = null;
  }
  return houd.filter(Boolean);
}

function poging(params, rng, sleutel = 'x') {
  // Hoe groter het rooster, hoe meer stappen de solver mag doen voordat we
  // de poging weggooien. Zonder die ruimte lukt twaalf bij twaalf vaak niet.
  const budget = 30000 * params.n;
  const rooster = bouwRooster(params.n, rng, {
    kamers: params.kamers,
    meubelDeel: params.meubelDeel,
    maxMeubels: params.maxMeubels,
  });
  // De inrichting: de inhoud noemt de kamers en zegt wat er in elke kamer
  // kan liggen; richIn zet het neer. Elk met een eigen rng, zodat rooster,
  // plaatsing en aanwijzingen hieronder uit dezelfde trekking blijven komen.
  if (params.inrichting) {
    const inrichting = params.inrichting(rooster, makeRng(`${sleutel}:kamernamen`));
    rooster.kamerNamen = inrichting.kamerNamen;
    richIn(rooster, inrichting, makeRng(`${sleutel}:rekwisieten`), makeRng(`${sleutel}:ramen`), {
      perKamer: params.rekwisieten,
    });
  }
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

  const vijver = bouwVijver(rooster, plaats, slachtofferIdx, rng, params.gewichten, { minVrij: params.minVrij });
  const gegroeid = groeiTotVast(rooster, vijver, params.style, budget, slachtofferIdx);
  if (!gegroeid) return null;
  const controle = telPlaatsingen(rooster, gegroeid, 2, budget);
  if (controle.opgegeven || controle.count !== 1) return null;

  const gesnoeid = snoei(rooster, gegroeid, params.style, rng, budget);
  const aanwijzingen = gesnoeid.aanwijzingen;
  const g = graad(rooster, aanwijzingen);
  return {
    rooster, plaats, slachtofferIdx, dader, kamerIdx, aanwijzingen, graad: g,
    overgeslagen: gesnoeid.overgeslagen, budget,
  };
}

// ------------------------------------------------- de sjabloonbouwer
//
// specs/engine-extension.md stap 8 (met props-and-either-clues.md B2).
// De oude bouwer (groeiTotVast + snoei) gooit aanwijzingen op een stapel tot
// het vastligt en snoeit dan; zo krijgt de ene naam er vijf en de andere
// geen. Een puzzel uit een boek werkt andersom: iedereen krijgt één eigen
// aanwijzing, liefst over iets op het bord, en een paar zinnen over twee
// mensen of over iedereen maken het rond.
//
//   1. Per persoon (niet het slachtoffer) één eigen aanwijzing, gekozen op
//      winst: welke kandidaat, naast wat er al ligt, streept het meest weg.
//      Een niveau kan eisen dat er een "of" en een stuk bij zit (B2).
//   2. Dan relationele en algemene aanwijzingen op winst, tot het uniek is,
//      hooguit ceil(personen / 3) (criterium 10).
//   3. Wat daarvan weg kan, gaat weg.
//   4. De menselijke solver moet hem oplossen, binnen de band van het niveau
//      (criterium 7).
//
// De oude bouwer blijft staan, ongebruikt (hide, do not delete).

const EIGEN = new Set(['kamer', 'kamerNiet', 'kamerOf', 'nietNiet', 'naast', 'rand', 'hoek', 'op', 'nietOp',
  'enigeOp', 'typeOf', 'naastType', 'voorRaam', 'hoekKamer', 'rijEnKamerAls', 'en']);
// Over iets op het bord (criterium 11).
const OVER_STUK = new Set(['naast', 'op', 'nietOp', 'enigeOp', 'typeOf', 'naastType', 'voorRaam', 'rijEnKamerAls']);
export const overStuk = (c) => OVER_STUK.has(c.soort)
  || (c.soort === 'en' && (OVER_STUK.has(c.a.soort) || OVER_STUK.has(c.b.soort)));
export const isOf = (c) => ['kamerOf', 'typeOf', 'ofwelPersoon'].includes(c.soort);
export const opIets = (c) => ['op', 'enigeOp', 'typeOf'].includes(c.soort)
  || (c.soort === 'en' && (c.a.soort === 'op' || c.b.soort === 'op'));
export const isEigen = (c) => EIGEN.has(c.soort) && c.q == null;

const maat = (rooster, lijst) => {
  const { dom, kapot } = domeinenVan(rooster, lijst);
  return kapot ? -1 : dom.reduce((s, d) => s + d.size, 0);
};

// Kies uit de kandidaten (in vijvervolgorde) de eerste `greep` en neem die
// met de meeste winst; gelijk = de eerste, zodat de gewichten tellen.
function besteOpWinst(rooster, basis, kandidaten, greep, meet = (l) => maat(rooster, l)) {
  const vanaf = meet(basis);
  let beste = null;
  let besteWinst = -1;
  for (const c of kandidaten.slice(0, greep)) {
    const m = meet([...basis, c]);
    if (m < 0) continue;
    const winst = vanaf - m;
    if (winst > besteWinst) { besteWinst = winst; beste = c; }
  }
  return beste;
}

export const BOUWREDEN = {};
const reden = (r) => { BOUWREDEN[r] = (BOUWREDEN[r] ?? 0) + 1; return null; };

export function bouwPerPersoon(rooster, plaats, slachtofferIdx, rng, params, budget) {
  const { n } = rooster;
  const bouw = params.bouw;
  const vijver = bouwVijver(rooster, plaats, slachtofferIdx, rng, { ...bouw.eigen, ...bouw.samen }, { minVrij: bouw.minVrij ?? params.minVrij });
  // Op de grote borden kiest de bouwer op het aantal oplossingen dat
  // overblijft (tot TELPLAFOND), en pas daarna op wat het doorstrepen
  // wegstreept (Guus, 2026-11-18, voorstel b). Doorstrepen alleen ziet niet
  // dat twee aanwijzingen samen iets uitsluiten wat elk apart niet doen.
  const TELPLAFOND = 200;
  const meet = bouw.opTelling
    ? (lijst) => {
      const m = maat(rooster, lijst);
      if (m < 0) return -1;
      const uit = telPlaatsingen(rooster, lijst, TELPLAFOND, budget);
      const aantal = uit.opgegeven ? TELPLAFOND : uit.count;
      return aantal * 1e6 + m;
    }
    : (lijst) => maat(rooster, lijst);
  const eigenVan = new Map();
  const samen = [];
  for (const c of vijver) {
    if (isEigen(c) && c.p != null) {
      if (!eigenVan.has(c.p)) eigenVan.set(c.p, []);
      eigenVan.get(c.p).push(c);
    } else if (!isEigen(c)) {
      samen.push(c);
    }
  }
  const personen = rng.shuffle([...Array(n).keys()].filter((p) => p !== slachtofferIdx));
  if (personen.some((p) => !eigenVan.get(p)?.length)) return reden('geen eigen kandidaat');

  // Eisen van het niveau: een "of" en iets op een stuk (B2, criterium 11),
  // en minstens de helft over iets op het bord.
  const eigen = [];
  const eisen = [];
  if (bouw.eisOf) eisen.push(isOf);
  if (bouw.eisOp) eisen.push(opIets);
  // Niet te veel van één soort (regel 4 van check-spreiding): "ze lijken te
  // veel op elkaar" (de dochter, 2026-11-16).
  // Tegen het kleinste totaal dat er kan komen: één per verdachte.
  const perSoortMax = maxPerSoort(n - 1, params.soortDeel);
  const vol = (c) => eigen.filter((x) => x.soort === c.soort).length >= perSoortMax;
  for (const p of personen) {
    let kandidaten = eigenVan.get(p);
    if (kandidaten.some((c) => !vol(c))) kandidaten = kandidaten.filter((c) => !vol(c));
    const eis = eisen.find((e) => kandidaten.some(e));
    if (eis) kandidaten = kandidaten.filter(eis);
    const stukNodig = eigen.filter(overStuk).length * 2 < eigen.length + 1;
    if (!eis && stukNodig && kandidaten.some(overStuk)) kandidaten = kandidaten.filter(overStuk);
    const c = besteOpWinst(rooster, eigen, kandidaten, bouw.greep ?? 10, meet);
    if (!c) return reden('eigen zonder winst');
    if (eis) eisen.splice(eisen.indexOf(eis), 1);
    eigen.push(c);
  }
  // Een eis die niemand kon halen (niemand zit ergens op), dan is deze
  // poging niets: een andere plaatsing wel.
  if (eisen.length) return reden('eis niet gehaald');

  // Verbeterronde: per persoon kijken of een andere eigen aanwijzing, naast
  // alle andere, meer wegstreept. Op de grote borden is de eerste keuze vaak
  // gulzig verkeerd: wat bij de derde persoon veel streepte, doet niets
  // meer als de rest erbij ligt.
  for (let ronde = 0; ronde < (bouw.rondes ?? 0); ronde++) {
    let beter = false;
    for (let i = 0; i < eigen.length; i++) {
      const p = eigen[i].p;
      const anderen = eigen.filter((_, j) => j !== i);
      const nu = meet(eigen);
      const houdEis = isOf(eigen[i]) || opIets(eigen[i]);
      let kandidaten = eigenVan.get(p).filter((c) => c.soort === eigen[i].soort || anderen.filter((x) => x.soort === c.soort).length < perSoortMax);
      if (houdEis) kandidaten = kandidaten.filter((c) => (isOf(eigen[i]) ? isOf(c) : opIets(c)));
      if (overStuk(eigen[i]) && anderen.filter(overStuk).length * 2 < eigen.length) kandidaten = kandidaten.filter(overStuk);
      const c = besteOpWinst(rooster, anderen, kandidaten, bouw.greepRonde ?? 40, meet);
      if (c && c !== eigen[i] && meet([...anderen, c]) < nu) { eigen[i] = c; beter = true; }
    }
    if (!beter) break;
  }

  const uniek = (lijst) => {
    if (graad(rooster, lijst).opgelost) return true;
    if (params.style === 'shallow') return false;
    const uit = telPlaatsingen(rooster, lijst, 2, budget);
    if (uit.opgegeven) throw new TeZwaar();
    return uit.count === 1;
  };

  const max = bouw.maxErbij ?? Math.ceil(n / 3);
  const erbij = [];
  const perNaam = new Array(n).fill(1);
  perNaam[slachtofferIdx] = 0;
  const rest = samen.slice();
  while (!uniek([...eigen, ...erbij])) {
    if (erbij.length >= max) return reden('te veel erbij');
    // Niemand komt op meer dan twee regels (criterium 10).
    const mag = rest.filter((c) => namenVan(c).every((p) => perNaam[p] < 2));
    const c = besteOpWinst(rooster, [...eigen, ...erbij], mag, bouw.greepSamen ?? 30, meet);
    if (!c) return reden('geen erbij');
    rest.splice(rest.indexOf(c), 1);
    erbij.push(c);
    for (const p of namenVan(c)) perNaam[p]++;
  }
  // Wat van het erbij weg kan, gaat weg.
  for (let i = erbij.length - 1; i >= 0; i--) {
    const zonder = erbij.filter((_, j) => j !== i);
    if (uniek([...eigen, ...zonder])) erbij.splice(i, 1);
  }
  return [...eigen, ...erbij];
}

// Ligt het spoor van de menselijke solver binnen de band van het niveau?
// Geeft hoeveel het ernaast zit (0 = goed).
export function bandMis(spoor, band) {
  if (!spoor.opgelost) return 10;
  if (!band) return 0;
  const g = spoor.graad;
  let mis = 0;
  if (g.topTier > band.maxTier) mis += g.topTier - band.maxTier;
  if (band.minTier && g.topTier < band.minTier) mis += band.minTier - g.topTier;
  if (g.lengte < band.min) mis += (band.min - g.lengte) / Math.max(1, band.min);
  if (band.max && g.lengte > band.max) mis += (g.lengte - band.max) / band.max;
  return mis;
}

function pogingPerPersoon(params, rng, sleutelTekst) {
  const budget = 30000 * params.n;
  const rooster = bouwRooster(params.n, rng, {
    kamers: params.kamers, meubelDeel: params.meubelDeel, maxMeubels: params.maxMeubels,
    extraDeel: params.bouw.extraDeel ?? 0,
  });
  if (params.inrichting) {
    const inrichting = params.inrichting(rooster, makeRng(`${sleutelTekst}:kamernamen`));
    rooster.kamerNamen = inrichting.kamerNamen;
    richIn(rooster, inrichting, makeRng(`${sleutelTekst}:rekwisieten`), makeRng(`${sleutelTekst}:ramen`), {
      perKamer: params.rekwisieten,
    });
  }
  const plaats = tekenPlaatsing(rooster, rng);
  if (!plaats) return null;
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
  const aanwijzingen = bouwPerPersoon(rooster, plaats, slachtofferIdx, makeRng(`${sleutelTekst}:sjabloon`), params, budget);
  if (!aanwijzingen) return null;
  const spoor = redeneer(rooster, aanwijzingen, { maxTier: params.bouw.band?.maxTier ?? 4, budget: 5_000_000 });
  return {
    rooster, plaats, slachtofferIdx, dader, kamerIdx, aanwijzingen,
    graad: graad(rooster, aanwijzingen), spoor, mis: bandMis(spoor, params.bouw.band),
  };
}

// Pas als vaststaat welke poging het wordt, gaat de dure tweede snoeironde
// eroverheen. Daarvoor zou hij vierentwintig keer voor niets draaien.
function afronden(kandidaat) {
  const aanwijzingen = naSnoei(
    kandidaat.rooster, kandidaat.aanwijzingen, kandidaat.overgeslagen ?? [], kandidaat.budget,
  );
  return { ...kandidaat, aanwijzingen, graad: graad(kandidaat.rooster, aanwijzingen) };
}

// Hoeveel de aanwijzingen boven de plafonds van het niveau uitkomen: per naam
// wat er boven maxPerNaam zit, opgeteld. Nul is goed. Een poging met
// overschot wordt niet meteen genomen; lukt geen enkele, dan wint die met
// het kleinste (zie genereerKamerpuzzel), en dan valt de keuring erover.
export function overschot(aanwijzingen, params) {
  const perNaam = new Map();
  for (const c of aanwijzingen) for (const p of namenVan(c)) perNaam.set(p, (perNaam.get(p) ?? 0) + 1);
  let uit = 0;
  const plafond = params.maxPerNaam ?? Infinity;
  for (const aantal of perNaam.values()) uit += Math.max(0, aantal - plafond);
  const perSoort = new Map();
  for (const c of aanwijzingen) perSoort.set(c.soort, (perSoort.get(c.soort) ?? 0) + 1);
  const maxSoort = maxPerSoort(aanwijzingen.length, params.soortDeel);
  for (const aantal of perSoort.values()) uit += Math.max(0, aantal - maxSoort);
  return uit;
}

export function genereerKamerpuzzel(seed, params, pogingen = null) {
  // Grote roosters mislukken vaker, dus die krijgen meer pogingen.
  //
  // Tot en met niveau drie zijn het er honderd. Sinds de plafonds per naam en
  // per soort (specs/harder-clues.md) valt daar een poging vaker af, maar een
  // poging kost op zeven bij zeven een paar milliseconden: met tien haalde
  // niveau drie zes van de twintig seeds, met honderd twintig van de twintig.
  pogingen = pogingen ?? (params.n >= 9 ? 24 : 100);
  // Met een sjabloon (KAMER_LEVELS.bouw) bouwt de nieuwe bouwer. `voortgang`
  // krijgt na elke poging (t, pogingen): daar loopt de balk in de app op.
  if (params.bouw) {
    let besteB = null;
    const totaal = params.bouw.pogingen ?? pogingen;
    for (let t = 0; t < totaal; t++) {
      params.voortgang?.(t, totaal);
      let k = null;
      try {
        k = pogingPerPersoon(params, makeRng(`${seed}#kamer${t}`), `${seed}#kamer${t}`);
      } catch (e) {
        if (!(e instanceof TeZwaar) && !/rooster/.test(e.message)) throw e;
      }
      if (!k) continue;
      k.poging = t;
      if (k.mis === 0) return k;
      if (!besteB || k.mis < besteB.mis) besteB = k;
    }
    if (!besteB) throw new Error('kon geen kamerpuzzel bouwen voor deze instellingen');
    return besteB;
  }
  let beste = null;
  for (let t = 0; t < pogingen; t++) {
    params.voortgang?.(t, pogingen);
    const rng = makeRng(`${seed}#kamer${t}`);
    let kandidaat;
    try {
      kandidaat = poging(params, rng, `${seed}#kamer${t}`);
    } catch (e) {
      // TeZwaar of een onbruikbaar rooster: volgende poging.
      continue;
    }
    if (!kandidaat) continue;
    // Op de grote borden laat de eerste snoeironde een flink deel staan dat
    // de tweede er nog af haalt: gemeten 27 tot 39 aanwijzingen voor, rond
    // de 22 na. Keuren op de plafonds vóór die tweede ronde gooide goede
    // pogingen weg - dat kostte op niveau vijf tien seconden. Dus wordt elke
    // poging eerst afgerond en dan gekeurd, ook een die van vorm niet deugt.
    // Eerst gebeurde dat alleen bij een goede vorm, en dan vergeleek de
    // terugval hieronder een afgeronde poging met een niet-afgeronde: een
    // latere poging met een lager getal vóór het snoeien kon dan winnen, en
    // de puzzel kwam er met overbodige aanwijzingen uit (review op #15).
    // (Tot en met niveau drie slaat de eerste ronde niets over en is
    // afronden gratis.)
    const af = afronden({ ...kandidaat, poging: t });
    const vorm = params.style === 'deep'
      ? (af.graad.opgelost ? 10 : 0)
      : (af.graad.opgelost ? Math.max(0, af.aanwijzingen.length - (params.maxClues ?? 99)) : 10);
    const mis = vorm + overschot(af.aanwijzingen, params);
    if (mis === 0) return af;
    if (!beste || mis < beste.mis) beste = { ...af, mis };
  }
  if (!beste) throw new Error('kon geen kamerpuzzel bouwen voor deze instellingen');
  return beste;
}


// ------------------------------------------------------------------- hint
//
// Een hint was: het bord vult de eerstvolgende figuur voor je in. Dat is
// geen hint maar een stukje oplossing - je leert er niets van en de rest
// van de puzzel wordt er niet makkelijker van, alleen korter.
//
// Nu krijg je een extra aanwijzing: een zin die net zo waar is als de
// andere, die er nog niet bij stond, en waar je vanaf je eigen bord ook
// echt mee verder kunt. Drie eisen:
//
//   - nooit "X stond in de keuken". Dat is de grootste weggever die er is
//     (zie het commentaar bij bouwVijver) en daarmee precies wat een hint
//     niet hoort te zijn.
//   - hij gaat over iemand die nog niet goed op het bord staat. Een
//     aanwijzing over iemand die je al hebt staan, is geen hulp.
//   - van de kandidaten wint degene die, gegeven wat er al goed staat, de
//     meeste mogelijkheden wegstreept. Dat is gemeten en niet geraden: we
//     rekenen de domeinen door mét en zonder de kandidaat.
//
// 'bekend' zijn de figuren die de speler al goed heeft neergezet. Die gaan
// als gewone aanwijzingen mee in de meting, zodat de hint beoordeeld wordt
// vanaf de stand van het bord en niet vanaf nul.
//
// Rij en kolom staan er niet meer in (specs/harder-clues.md): een rij- en
// een kolomaanwijzing samen wezen iemand precies één vakje aan, in 29 van de
// 29 gemeten gevallen. De beoordelingen in rooms.js blijven bestaan.
const HINTGEWICHTEN = {
  kamerNiet: 1, naast: 1, zelfdeKamer: 1,
  noord: 1, west: 1, buren: 1, rand: 1, hoek: 1,
  aantalKamer: 1, aantalNaast: 1,
};

// Niet elke kandidaat doorrekenen: bij zestien bij zestien zijn het er
// duizenden en dan staat de browser te wachten. Een greep van veertig is
// ruim genoeg om een goede te vinden.
const PROEFGREEP = 40;

const maatVan = (dom) => dom.reduce((som, d) => som + d.size, 0);

export function extraAanwijzing(rooster, plaats, slachtofferIdx, bestaand, bekend, rng) {
  const vijver = bouwVijver(rooster, plaats, slachtofferIdx, rng, HINTGEWICHTEN);
  const al = new Set(bestaand.map(sleutel));
  const staatGoed = new Set(bekend.map((c) => c.p));

  const kandidaten = vijver.filter((c) => {
    if (al.has(sleutel(c))) return false;
    // Een aanwijzing over twee mensen die allebei al goed staan, vertelt je
    // niets meer. Een telling gaat over iedereen en mag altijd mee.
    if (c.p == null) return true;
    if (staatGoed.has(c.p) && (c.q == null || staatGoed.has(c.q))) return false;
    return true;
  });
  if (!kandidaten.length) return null;

  const basis = domeinenVan(rooster, bekend).dom;
  const vanaf = maatVan(basis);

  let beste = null;
  let besteWinst = -1;
  for (const c of kandidaten.slice(0, PROEFGREEP)) {
    const winst = vanaf - maatVan(domeinenVan(rooster, [...bekend, c]).dom);
    if (winst > besteWinst) {
      besteWinst = winst;
      beste = c;
    }
  }
  // Levert geen enkele kandidaat iets op, dan geven we de eerste terug: een
  // ware zin die er nog niet stond is nog altijd beter dan "geen hint".
  return beste ?? kandidaten[0];
}

// De figuren die al goed staan, als aanwijzingen die de meting kan lezen.
// Exact welk vakje kent de solver niet als aanwijzing, de kamer wel - en
// voor het afwegen van een hint is dat nauwkeurig genoeg.
export function bekendAlsAanwijzingen(rooster, plaats, geplaatst) {
  const uit = [];
  for (const [p, cel] of Object.entries(geplaatst)) {
    const pi = Number(p);
    if (cel == null || cel !== plaats[pi]) continue;
    uit.push({ soort: 'kamer', p: pi, kamerIdx: rooster.kamerVan[cel], ja: true });
  }
  return uit;
}
