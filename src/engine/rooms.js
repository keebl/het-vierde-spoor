// Het kamerraster: personen staan op vakjes in plaats van in een tabel.
//
// De spelregels, op een rij - dit is de enige plek waar ze staan, en
// tools/check-regels.mjs rekent ze na over elke puzzel:
//
//   1. Een rooster van n bij n vakjes, verdeeld in aaneengesloten kamers.
//   2. Op sommige vakjes staat een meubelstuk; daar kan niemand staan.
//   3. Er staat precies een figuur per rij en precies een figuur per kolom.
//   4. Het slachtoffer is zelf een van die figuren: waar het lichaam ligt moet
//      je dus net zo goed uitpuzzelen. De dader is de enige verdachte die
//      uiteindelijk bij het slachtoffer in de kamer blijkt te staan.
//   5. NAAST betekent pal boven, onder, links of rechts EN in dezelfde kamer.
//      Een muur ertussen is geen "naast": je staat niet naast de werkbank als
//      die aan de andere kant van de muur staat. Dat geldt voor mensen naast
//      een meubelstuk en voor twee mensen naast elkaar. Diagonaal is nooit
//      naast.
//   6. RIJ, KOLOM, NOORD, WEST, BUITENMUUR en HOEK gaan over de plattegrond
//      als geheel en lopen dus wel door muren heen. Noord is boven.
//
// De oplossing is dus een plaatsing: welke persoon staat op welk vakje. Dat
// is een ander probleem dan de toewijzingspuzzels in assign.js, vandaar een
// eigen solver.

import { makeRng } from './rng.js';

export const idx = (n, r, c) => r * n + c;
export const rijVan = (n, i) => Math.floor(i / n);
export const kolVan = (n, i) => i % n;

const BUREN = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// Buurvakjes op het raster, muren niet meegerekend. Alleen voor het bouwen
// van kamers en voor regels die over de plattegrond als geheel gaan.
function rasterBuren(n, i) {
  const r = rijVan(n, i);
  const c = kolVan(n, i);
  const uit = [];
  for (const [dr, dc] of BUREN) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < n && nc >= 0 && nc < n) uit.push(idx(n, nr, nc));
  }
  return uit;
}

// Buurvakjes binnen dezelfde kamer. Dit is wat "naast" betekent: door een
// muur heen sta je niet naast iets. Elke aanwijzing met het woord "naast"
// erin rekent hiermee, zodat de zin klopt met het plaatje.
// Deze stond bovenaan in de meting: hij werd voor elk vakje van elke
// aanwijzing opnieuw uitgerekend, en maakte daarbij twee lijstjes aan. De
// plattegrond verandert tijdens het bouwen nooit, dus nu rekenen we hem een
// keer per rooster uit en kijken we daarna alleen nog op.
function burenTabel(rooster) {
  if (rooster._buren) return rooster._buren;
  const { n, kamerVan } = rooster;
  const tabel = new Array(n * n);
  for (let i = 0; i < n * n; i++) {
    tabel[i] = rasterBuren(n, i).filter((b) => kamerVan[b] === kamerVan[i]);
  }
  rooster._buren = tabel;
  return tabel;
}

export function kamerBuren(rooster, i) {
  return burenTabel(rooster)[i];
}

// Welke meubelstukken naast dit vakje staan, ook een keer per rooster.
function meubelBurenTabel(rooster) {
  if (rooster._meubelBuren) return rooster._meubelBuren;
  const { n, meubelOp } = rooster;
  const buren = burenTabel(rooster);
  const tabel = new Array(n * n);
  for (let i = 0; i < n * n; i++) {
    const uit = [];
    for (const b of buren[i]) {
      const m = meubelOp[b];
      if (m != null && !uit.includes(m)) uit.push(m);
    }
    tabel[i] = uit;
  }
  rooster._meubelBuren = tabel;
  return tabel;
}

// Staat dit vakje naast dit meubelstuk? Een meubelstuk aan de andere kant van
// de muur telt niet mee.
export function naastMeubel(rooster, cel, m) {
  return meubelBurenTabel(rooster)[cel].includes(m);
}

// Op welke rijen en kolommen staat een meubelstuk? Hiermee is "staat op
// dezelfde rij als" een opzoeking in plaats van een scan over het hele
// rooster, en dat scheelt bij zestien bij zestien zestien keer zoveel werk.
function meubelAssen(rooster) {
  if (rooster._meubelAssen) return rooster._meubelAssen;
  const { n, meubelOp } = rooster;
  const rijen = new Map();
  const kolommen = new Map();
  for (let i = 0; i < n * n; i++) {
    const m = meubelOp[i];
    if (m == null) continue;
    if (!rijen.has(m)) rijen.set(m, new Set());
    if (!kolommen.has(m)) kolommen.set(m, new Set());
    rijen.get(m).add(rijVan(n, i));
    kolommen.get(m).add(kolVan(n, i));
  }
  rooster._meubelAssen = { rijen, kolommen };
  return rooster._meubelAssen;
}

// ------------------------------------------------------------- het rooster

// Kamers groeien vanuit losse zaadvakjes tot het hele rooster verdeeld is.
// Daardoor is elke kamer gegarandeerd aaneengesloten.
function verdeelKamers(n, aantal, rng) {
  const totaal = n * n;
  const kamerVan = new Array(totaal).fill(-1);
  const zaden = rng.sample([...Array(totaal).keys()], aantal);
  const randen = zaden.map((z) => [z]);
  zaden.forEach((z, k) => { kamerVan[z] = k; });

  let open = totaal - aantal;
  while (open > 0) {
    let gegroeid = false;
    for (let k = 0; k < aantal && open > 0; k++) {
      const kandidaten = [];
      for (const cel of randen[k]) {
        for (const b of rasterBuren(n, cel)) if (kamerVan[b] === -1) kandidaten.push(b);
      }
      if (!kandidaten.length) continue;
      const keuze = rng.pick(kandidaten);
      kamerVan[keuze] = k;
      randen[k].push(keuze);
      open--;
      gegroeid = true;
    }
    if (!gegroeid) break;
  }
  // Mocht er iets overblijven (kan bij ongelukkige zaden), hang het aan een buur.
  for (let i = 0; i < totaal; i++) {
    if (kamerVan[i] !== -1) continue;
    const b = rasterBuren(n, i).find((x) => kamerVan[x] !== -1);
    kamerVan[i] = b !== undefined ? kamerVan[b] : 0;
  }
  return kamerVan;
}

// Bestaat er uberhaupt een geldige plaatsing? (Een per rij, een per kolom,
// alleen op vrije vakjes.) Zonder die garantie heeft genereren geen zin.
function heeftPlaatsing(n, vrij) {
  const kolVoorRij = new Array(n).fill(-1);
  const kolBezet = new Array(n).fill(false);
  const zoek = (r) => {
    if (r === n) return true;
    for (let c = 0; c < n; c++) {
      if (kolBezet[c] || !vrij[idx(n, r, c)]) continue;
      kolBezet[c] = true;
      kolVoorRij[r] = c;
      if (zoek(r + 1)) return true;
      kolBezet[c] = false;
    }
    return false;
  };
  return zoek(0);
}

// maxMeubels begrenst hoeveel verschillende meubels er in het rooster komen.
// De wereld levert de namen, en er mogen er nooit meer gevraagd worden dan er
// namen zijn - anders staat er "undefined" in een aanwijzing.
export function bouwRooster(n, rng, { kamers, meubelDeel = 0.22, maxMeubels = Infinity }) {
  for (let poging = 0; poging < 40; poging++) {
    const kamerVan = verdeelKamers(n, kamers, rng);
    const meubelOp = new Array(n * n).fill(null);
    const vrij = new Array(n * n).fill(true);

    const aantalMeubels = Math.min(maxMeubels, Math.max(2, Math.round(n * n * meubelDeel)));

    // Hoeveel meubels er hoogstens in één kamer mogen.
    //
    // Hiervoor werden ze alleen over het hele bord uitgestrooid, en dan
    // komt er bij toeval een kamer van drie vakjes met vier dingen erin.
    // Dat ziet eruit als een rommelhok, en erger: een aanwijzing als "Bram
    // stond naast de weegschaal" helpt je niet meer als er drie dingen
    // naast elkaar staan. Een meubelstuk moet een herkenningspunt zijn,
    // geen stapel.
    //
    // Eén per vier vakjes, en nooit meer dan drie. Dat laat een grote zaal
    // nog steeds gevuld ogen en houdt een nis leeg.
    const grootte = new Array(kamers).fill(0);
    for (let i = 0; i < n * n; i++) grootte[kamerVan[i]]++;
    const ruimteVoor = grootte.map((g) => Math.min(3, Math.max(1, Math.floor(g / 4))));
    const inKamer = new Array(kamers).fill(0);

    const volgorde = rng.shuffle([...Array(n * n).keys()]);
    let gezet = 0;
    for (const cel of volgorde) {
      if (gezet >= aantalMeubels) break;
      const kamer = kamerVan[cel];
      if (inKamer[kamer] >= ruimteVoor[kamer]) continue;
      // Niet elke kamer volbouwen: elke kamer houdt minstens twee vrije vakjes.
      const vrijInKamer = vrij.filter((v, i) => v && kamerVan[i] === kamer).length;
      if (vrijInKamer <= 2) continue;
      meubelOp[cel] = gezet;
      vrij[cel] = false;
      inKamer[kamer]++;
      gezet++;
    }
    if (gezet < 2) continue;
    if (!heeftPlaatsing(n, vrij)) continue;

    return { n, kamerVan, meubelOp, vrij, kamers, meubelAantal: gezet };
  }
  throw new Error('kon geen bruikbaar rooster bouwen');
}

// Een willekeurige geldige plaatsing: persoon p staat op plaats[p].
export function tekenPlaatsing(rooster, rng) {
  const { n, vrij } = rooster;
  const kolBezet = new Array(n).fill(false);
  const kolVoorRij = new Array(n).fill(-1);

  const zoek = (r) => {
    if (r === n) return true;
    for (const c of rng.shuffle([...Array(n).keys()])) {
      if (kolBezet[c] || !vrij[idx(n, r, c)]) continue;
      kolBezet[c] = true;
      kolVoorRij[r] = c;
      if (zoek(r + 1)) return true;
      kolBezet[c] = false;
    }
    return false;
  };
  if (!zoek(0)) return null;

  // Wie staat op welke rij? Dat is nog een vrije keuze.
  const personen = rng.shuffle([...Array(n).keys()]);
  const plaats = new Array(n);
  personen.forEach((p, r) => { plaats[p] = idx(n, r, kolVoorRij[r]); });
  return plaats;
}

// ------------------------------------------------------------ aanwijzingen

export const SOORTEN = {
  // 'kamer' zegt in welke kamer iemand stond, 'kamerNiet' in welke niet. Het
  // is dezelfde berekening; ze staan los van elkaar omdat de generator de
  // directe variant op hoge niveaus wil kunnen schrappen zonder de
  // uitsluiting kwijt te raken. Zie KAMER_LEVELS in engine/difficulty.js.
  kamer: {
    eval(c, ctx) {
      const cel = ctx.plaats[c.p];
      if (cel == null) return null;
      return (ctx.rooster.kamerVan[cel] === c.kamerIdx) === c.ja;
    },
  },
  kamerNiet: {
    eval(c, ctx) {
      const cel = ctx.plaats[c.p];
      if (cel == null) return null;
      return (ctx.rooster.kamerVan[cel] === c.kamerIdx) === c.ja;
    },
  },
  zelfdeKamer: {
    eval(c, ctx) {
      const a = ctx.plaats[c.p];
      const b = ctx.plaats[c.q];
      if (a == null || b == null) return null;
      return (ctx.rooster.kamerVan[a] === ctx.rooster.kamerVan[b]) === c.ja;
    },
  },
  // Hoeveel mensen stonden er in deze kamer? Een aanwijzing over iedereen
  // tegelijk, in plaats van over een persoon.
  aantalKamer: {
    eval(c, ctx) {
      let zeker = 0;
      let onbekend = 0;
      for (let p = 0; p < ctx.plaats.length; p++) {
        const cel = ctx.plaats[p];
        if (cel == null) { onbekend++; continue; }
        if (ctx.rooster.kamerVan[cel] === c.kamerIdx) zeker++;
      }
      if (zeker > c.aantal) return false;
      if (zeker + onbekend < c.aantal) return false;
      return onbekend === 0 ? zeker === c.aantal : null;
    },
  },

  // Hoeveel mensen stonden er naast dit meubelstuk?
  aantalNaast: {
    eval(c, ctx) {
      let zeker = 0;
      let onbekend = 0;
      for (let p = 0; p < ctx.plaats.length; p++) {
        const cel = ctx.plaats[p];
        if (cel == null) { onbekend++; continue; }
        if (naastMeubel(ctx.rooster, cel, c.m)) zeker++;
      }
      if (zeker > c.aantal) return false;
      if (zeker + onbekend < c.aantal) return false;
      return onbekend === 0 ? zeker === c.aantal : null;
    },
  },

  // Tegen de buitenmuur, of juist niet.
  rand: {
    eval(c, ctx) {
      const cel = ctx.plaats[c.p];
      if (cel == null) return null;
      const n = ctx.rooster.n;
      const r = rijVan(n, cel);
      const k = kolVan(n, cel);
      const aanRand = r === 0 || k === 0 || r === n - 1 || k === n - 1;
      return aanRand === c.ja;
    },
  },

  // In een hoek van het gebouw.
  hoek: {
    eval(c, ctx) {
      const cel = ctx.plaats[c.p];
      if (cel == null) return null;
      const n = ctx.rooster.n;
      const r = rijVan(n, cel);
      const k = kolVan(n, cel);
      const inHoek = (r === 0 || r === n - 1) && (k === 0 || k === n - 1);
      return inHoek === c.ja;
    },
  },

  // Dezelfde kolom als een meubelstuk (de tegenhanger van opRij).
  opKolom: {
    eval(c, ctx) {
      const cel = ctx.plaats[c.p];
      if (cel == null) return null;
      const n = ctx.rooster.n;
      const k = kolVan(n, cel);
      for (let r = 0; r < n; r++) if (ctx.rooster.meubelOp[idx(n, r, k)] === c.m) return true;
      return false;
    },
  },

  naast: {
    eval(c, ctx) {
      const cel = ctx.plaats[c.p];
      if (cel == null) return null;
      return naastMeubel(ctx.rooster, cel, c.m) === c.ja;
    },
  },
  opRij: {
    eval(c, ctx) {
      const cel = ctx.plaats[c.p];
      if (cel == null) return null;
      const n = ctx.rooster.n;
      const r = rijVan(n, cel);
      let raak = false;
      for (let k = 0; k < n; k++) if (ctx.rooster.meubelOp[idx(n, r, k)] === c.m) raak = true;
      return raak;
    },
  },
  noord: {
    eval(c, ctx) {
      const a = ctx.plaats[c.p];
      const b = ctx.plaats[c.q];
      if (a == null || b == null) return null;
      return rijVan(ctx.rooster.n, a) < rijVan(ctx.rooster.n, b);
    },
  },
  west: {
    eval(c, ctx) {
      const a = ctx.plaats[c.p];
      const b = ctx.plaats[c.q];
      if (a == null || b == null) return null;
      return kolVan(ctx.rooster.n, a) < kolVan(ctx.rooster.n, b);
    },
  },
  buren: {
    eval(c, ctx) {
      const a = ctx.plaats[c.p];
      const b = ctx.plaats[c.q];
      if (a == null || b == null) return null;
      return kamerBuren(ctx.rooster, a).includes(b) === c.ja;
    },
  },
};

export const evalAanwijzing = (c, ctx) => SOORTEN[c.soort].eval(c, ctx);

// Welke personen raakt deze aanwijzing?
function personenIn(c) {
  const uit = [];
  if (c.p != null) uit.push(c.p);
  if (c.q != null) uit.push(c.q);
  return uit;
}

// --------------------------------------------------------------- de solver

// Telt plaatsingen tot aan cap. Rij voor rij: wie staat hier, en in welke
// kolom? Rijen zijn daarmee automatisch allemaal verschillend.
// budget begrenst hoeveel stappen de solver mag doen. Zonder zo'n grens kan
// een ongelukkige combinatie van rooster en aanwijzingen minutenlang doorgaan,
// en dan staat iemand te wachten op een puzzel. Loopt hij eruit, dan zegt hij
// eerlijk "ik weet het niet" (opgegeven) en gooit de generator die poging weg.
export function telPlaatsingen(rooster, aanwijzingen, cap = 2, budget = 120000) {
  const { n } = rooster;
  const plaats = new Array(n).fill(null);
  const ctx = { rooster, plaats };

  // Eerst doorstrepen wat aantoonbaar onmogelijk is. Dat maakt de lijst
  // kandidaten per figuur meestal klein, en daarmee de zoektocht kort. Blind
  // rij voor rij zoeken liep boven acht bij acht vast: negen bij negen kostte
  // dertig seconden.
  const { dom, kapot } = domeinenVan(rooster, aanwijzingen);
  if (kapot) return { count: 0, plaatsing: null };
  const kandidaten = dom.map((d) => [...d]);

  const perPersoon = new Map();
  const altijd = [];
  for (const c of aanwijzingen) {
    const pers = personenIn(c);
    if (!pers.length) { altijd.push(c); continue; }
    for (const p of pers) {
      if (!perPersoon.has(p)) perPersoon.set(p, []);
      perPersoon.get(p).push(c);
    }
  }

  const rijVrij = new Array(n).fill(true);
  const kolVrij = new Array(n).fill(true);
  let gevonden = 0;
  let eerste = null;
  let stappen = 0;
  let opgegeven = false;

  const magNog = (p) => {
    for (const c of perPersoon.get(p) ?? []) if (evalAanwijzing(c, ctx) === false) return false;
    for (const c of altijd) if (evalAanwijzing(c, ctx) === false) return false;
    return true;
  };

  const zoek = (gedaan) => {
    if (opgegeven) return;
    if (++stappen > budget) { opgegeven = true; return; }
    if (gedaan === n) {
      for (const c of aanwijzingen) if (evalAanwijzing(c, ctx) !== true) return;
      gevonden++;
      if (!eerste) eerste = plaats.slice();
      return;
    }

    // Pak de figuur met de minste mogelijkheden: die kapt de boom het snelst.
    let beste = -1;
    let besteOpties = null;
    for (let p = 0; p < n; p++) {
      if (plaats[p] != null) continue;
      const opties = [];
      for (const cel of kandidaten[p]) {
        if (rijVrij[rijVan(n, cel)] && kolVrij[kolVan(n, cel)]) opties.push(cel);
      }
      if (!opties.length) return;
      if (beste === -1 || opties.length < besteOpties.length) {
        beste = p;
        besteOpties = opties;
      }
      if (opties.length === 1) break;
    }

    for (const cel of besteOpties) {
      const r = rijVan(n, cel);
      const k = kolVan(n, cel);
      plaats[beste] = cel;
      rijVrij[r] = false;
      kolVrij[k] = false;
      if (magNog(beste)) zoek(gedaan + 1);
      plaats[beste] = null;
      rijVrij[r] = true;
      kolVrij[k] = true;
      if (gevonden >= cap) return;
    }
  };

  zoek(0);
  return { count: gevonden, plaatsing: eerste, opgegeven };
}

// ------------------------------------------------- menselijk doorredeneren

// Mogelijkhedenraster: per persoon de vakjes waar die nog kan staan. Alleen
// wegstrepen wat aantoonbaar onmogelijk is, net als bij de andere puzzels.
function beginDomeinen(rooster) {
  const { n, vrij } = rooster;
  const dom = [];
  for (let p = 0; p < n; p++) {
    const s = new Set();
    for (let i = 0; i < n * n; i++) if (vrij[i]) s.add(i);
    dom.push(s);
  }
  return dom;
}

// Tijdens het lopen uit een Set verwijderen mag: wat al weg is wordt niet
// meer bezocht. Hier stond eerst `[...set]`, en dat maakte bij elke aanroep
// een lijst van maximaal tweehonderdzesenvijftig vakjes aan - per aanwijzing,
// per ronde. Dat was de derde hete plek in de meting.
function filter(set, test) {
  let veranderd = false;
  for (const v of set) if (!test(v)) { set.delete(v); veranderd = true; }
  return veranderd;
}

function propageerAanwijzing(rooster, dom, c) {
  const { n, kamerVan, meubelOp } = rooster;
  let veranderd = false;
  switch (c.soort) {
    case 'kamer':
    case 'kamerNiet':
      veranderd = filter(dom[c.p], (cel) => (kamerVan[cel] === c.kamerIdx) === c.ja) || veranderd;
      break;
    case 'zelfdeKamer': {
      const kamersQ = new Set();
      for (const cel of dom[c.q]) kamersQ.add(kamerVan[cel]);
      const kamersP = new Set();
      for (const cel of dom[c.p]) kamersP.add(kamerVan[cel]);
      if (c.ja) {
        veranderd = filter(dom[c.p], (cel) => kamersQ.has(kamerVan[cel])) || veranderd;
        veranderd = filter(dom[c.q], (cel) => kamersP.has(kamerVan[cel])) || veranderd;
      } else {
        if (kamersQ.size === 1) {
          const [k] = kamersQ;
          veranderd = filter(dom[c.p], (cel) => kamerVan[cel] !== k) || veranderd;
        }
        if (kamersP.size === 1) {
          const [k] = kamersP;
          veranderd = filter(dom[c.q], (cel) => kamerVan[cel] !== k) || veranderd;
        }
      }
      break;
    }
    case 'aantalKamer':
      // Alleen de nul is makkelijk door te rekenen: dan kan niemand daar staan.
      if (c.aantal === 0) {
        for (const d of dom) veranderd = filter(d, (cel) => kamerVan[cel] !== c.kamerIdx) || veranderd;
      }
      break;
    case 'rand':
      veranderd = filter(dom[c.p], (cel) => {
        const r = rijVan(n, cel);
        const k = kolVan(n, cel);
        return (r === 0 || k === 0 || r === n - 1 || k === n - 1) === c.ja;
      }) || veranderd;
      break;
    case 'hoek':
      veranderd = filter(dom[c.p], (cel) => {
        const r = rijVan(n, cel);
        const k = kolVan(n, cel);
        return ((r === 0 || r === n - 1) && (k === 0 || k === n - 1)) === c.ja;
      }) || veranderd;
      break;
    case 'opKolom': {
      const kolommen = meubelAssen(rooster).kolommen.get(c.m) ?? new Set();
      veranderd = filter(dom[c.p], (cel) => kolommen.has(kolVan(n, cel))) || veranderd;
      break;
    }
    case 'naast':
      veranderd = filter(dom[c.p], (cel) =>
        naastMeubel(rooster, cel, c.m) === c.ja) || veranderd;
      break;
    case 'opRij': {
      const rijen = meubelAssen(rooster).rijen.get(c.m) ?? new Set();
      veranderd = filter(dom[c.p], (cel) => rijen.has(rijVan(n, cel))) || veranderd;
      break;
    }
    case 'noord': {
      let maxQ = -Infinity;
      for (const cel of dom[c.q]) { const r = rijVan(n, cel); if (r > maxQ) maxQ = r; }
      let minP = Infinity;
      for (const cel of dom[c.p]) { const r = rijVan(n, cel); if (r < minP) minP = r; }
      veranderd = filter(dom[c.p], (cel) => rijVan(n, cel) < maxQ) || veranderd;
      veranderd = filter(dom[c.q], (cel) => rijVan(n, cel) > minP) || veranderd;
      break;
    }
    case 'west': {
      let maxQ = -Infinity;
      for (const cel of dom[c.q]) { const k = kolVan(n, cel); if (k > maxQ) maxQ = k; }
      let minP = Infinity;
      for (const cel of dom[c.p]) { const k = kolVan(n, cel); if (k < minP) minP = k; }
      veranderd = filter(dom[c.p], (cel) => kolVan(n, cel) < maxQ) || veranderd;
      veranderd = filter(dom[c.q], (cel) => kolVan(n, cel) > minP) || veranderd;
      break;
    }
    case 'buren': {
      if (c.ja) {
        veranderd = filter(dom[c.p], (cel) => kamerBuren(rooster, cel).some((b) => dom[c.q].has(b))) || veranderd;
        veranderd = filter(dom[c.q], (cel) => kamerBuren(rooster, cel).some((b) => dom[c.p].has(b))) || veranderd;
      }
      break;
    }
  }
  return veranderd;
}

// Een rij en een kolom bevatten elk precies een persoon.
function propageerRijenKolommen(rooster, dom) {
  const { n } = rooster;
  let veranderd = false;

  for (let p = 0; p < n; p++) {
    if (dom[p].size !== 1) continue;
    const [cel] = dom[p];
    const r = rijVan(n, cel);
    const k = kolVan(n, cel);
    for (let q = 0; q < n; q++) {
      if (q === p) continue;
      veranderd = filter(dom[q], (x) => rijVan(n, x) !== r && kolVan(n, x) !== k) || veranderd;
    }
  }

  // Kan maar een persoon op deze rij staan, dan staat die daar ook.
  //
  // Dit telde per rij en per kolom opnieuw, en maakte daarbij voor elke
  // persoon een lijst van al zijn vakjes aan: bij zestien bij zestien zijn
  // dat zestien rijen keer zestien personen keer een lijst van maximaal
  // tweehonderdzesenvijftig. Het telt nog steeds per rij opnieuw - een rij
  // die hierboven is dichtgetrokken moet de volgende rij wél zien, anders
  // komt er een ronde bij en verandert de moeilijkheidsgraad - maar nu
  // zonder lijstjes en met afbreken zodra er een tweede kandidaat is.
  for (let r = 0; r < n; r++) {
    let enige = -1;
    let aantal = 0;
    for (let p = 0; p < n; p++) {
      let heeft = false;
      for (const cel of dom[p]) if (rijVan(n, cel) === r) { heeft = true; break; }
      if (!heeft) continue;
      aantal++;
      enige = p;
      if (aantal > 1) break;
    }
    if (aantal === 1) veranderd = filter(dom[enige], (cel) => rijVan(n, cel) === r) || veranderd;
  }
  for (let k = 0; k < n; k++) {
    let enige = -1;
    let aantal = 0;
    for (let p = 0; p < n; p++) {
      let heeft = false;
      for (const cel of dom[p]) if (kolVan(n, cel) === k) { heeft = true; break; }
      if (!heeft) continue;
      aantal++;
      enige = p;
      if (aantal > 1) break;
    }
    if (aantal === 1) veranderd = filter(dom[enige], (cel) => kolVan(n, cel) === k) || veranderd;
  }
  return veranderd;
}

// De mogelijkhedenlijst per figuur na alles wat je puur doorstrepend kunt
// afleiden. De solver gebruikt hem om niet blind te hoeven zoeken.
export function domeinenVan(rooster, aanwijzingen) {
  const dom = beginDomeinen(rooster);
  let veranderd = true;
  while (veranderd && !isKapot(rooster, dom)) {
    veranderd = false;
    for (const c of aanwijzingen) veranderd = propageerAanwijzing(rooster, dom, c) || veranderd;
    veranderd = propageerRijenKolommen(rooster, dom) || veranderd;
  }
  return { dom, kapot: isKapot(rooster, dom) };
}

function isKapot(rooster, dom) {
  const n = rooster.n;
  for (let p = 0; p < n; p++) if (dom[p].size === 0) return true;
  return false;
}

export function graad(rooster, aanwijzingen) {
  const dom = beginDomeinen(rooster);
  let rondes = 0;
  let veranderd = true;
  const kapot = () => dom.some((d) => d.size === 0);

  while (veranderd && !kapot()) {
    veranderd = false;
    for (const c of aanwijzingen) veranderd = propageerAanwijzing(rooster, dom, c) || veranderd;
    veranderd = propageerRijenKolommen(rooster, dom) || veranderd;
    if (veranderd) rondes++;
  }
  const opgelost = dom.every((d) => d.size === 1);
  return { opgelost, rondes, open: dom.filter((d) => d.size > 1).length };
}
