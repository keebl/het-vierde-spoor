// Het kamerraster: personen staan op vakjes in plaats van in een tabel.
//
// Regels:
//   - een rooster van n bij n vakjes, verdeeld in kamers
//   - op sommige vakjes staat een meubelstuk; daar kan niemand staan
//   - er staat precies een persoon per rij en precies een persoon per kolom
//   - het slachtoffer ligt op een vast vakje; de dader is degene die als
//     enige in diezelfde kamer stond
//
// De oplossing is dus een plaatsing: welke persoon staat op welk vakje. Dat
// is een ander probleem dan de toewijzingspuzzels in assign.js, vandaar een
// eigen solver.

import { makeRng } from './rng.js';

export const idx = (n, r, c) => r * n + c;
export const rijVan = (n, i) => Math.floor(i / n);
export const kolVan = (n, i) => i % n;

const BUREN = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function burenVan(n, i) {
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
        for (const b of burenVan(n, cel)) if (kamerVan[b] === -1) kandidaten.push(b);
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
    const b = burenVan(n, i).find((x) => kamerVan[x] !== -1);
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
    const volgorde = rng.shuffle([...Array(n * n).keys()]);
    let gezet = 0;
    for (const cel of volgorde) {
      if (gezet >= aantalMeubels) break;
      // Niet elke kamer volbouwen: elke kamer houdt minstens twee vrije vakjes.
      const kamer = kamerVan[cel];
      const vrijInKamer = vrij.filter((v, i) => v && kamerVan[i] === kamer).length;
      if (vrijInKamer <= 2) continue;
      meubelOp[cel] = gezet;
      vrij[cel] = false;
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
  kamer: {
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
  leegKamer: {
    eval(c, ctx) {
      let onbekend = false;
      for (let p = 0; p < ctx.plaats.length; p++) {
        const cel = ctx.plaats[p];
        if (cel == null) { onbekend = true; continue; }
        if (ctx.rooster.kamerVan[cel] === c.kamerIdx) return false;
      }
      return onbekend ? null : true;
    },
  },
  naast: {
    eval(c, ctx) {
      const cel = ctx.plaats[c.p];
      if (cel == null) return null;
      const raak = burenVan(ctx.rooster.n, cel).some((b) => ctx.rooster.meubelOp[b] === c.m);
      return raak === c.ja;
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
      const n = ctx.rooster.n;
      const afstand = Math.abs(rijVan(n, a) - rijVan(n, b)) + Math.abs(kolVan(n, a) - kolVan(n, b));
      return (afstand === 1) === c.ja;
    },
  },
  bijSlachtoffer: {
    eval(c, ctx) {
      const cel = ctx.plaats[c.p];
      if (cel == null) return null;
      return burenVan(ctx.rooster.n, cel).includes(ctx.slachtoffer) === c.ja;
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
export function telPlaatsingen(rooster, aanwijzingen, slachtoffer, cap = 2) {
  const { n, vrij } = rooster;
  const plaats = new Array(n).fill(null);
  const ctx = { rooster, plaats, slachtoffer };

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

  const persoonVrij = new Array(n).fill(true);
  const kolVrij = new Array(n).fill(true);
  let gevonden = 0;
  let eerste = null;

  const magNog = (p) => {
    for (const c of perPersoon.get(p) ?? []) if (evalAanwijzing(c, ctx) === false) return false;
    for (const c of altijd) if (evalAanwijzing(c, ctx) === false) return false;
    return true;
  };

  const zoek = (r) => {
    if (r === n) {
      for (const c of aanwijzingen) if (evalAanwijzing(c, ctx) !== true) return;
      gevonden++;
      if (!eerste) eerste = plaats.slice();
      return;
    }
    for (let p = 0; p < n; p++) {
      if (!persoonVrij[p]) continue;
      for (let c = 0; c < n; c++) {
        if (!kolVrij[c]) continue;
        const cel = idx(n, r, c);
        if (!vrij[cel] || cel === slachtoffer) continue;
        plaats[p] = cel;
        persoonVrij[p] = false;
        kolVrij[c] = false;
        if (magNog(p)) zoek(r + 1);
        plaats[p] = null;
        persoonVrij[p] = true;
        kolVrij[c] = true;
        if (gevonden >= cap) return;
      }
    }
  };

  zoek(0);
  return { count: gevonden, plaatsing: eerste };
}

// ------------------------------------------------- menselijk doorredeneren

// Mogelijkhedenraster: per persoon de vakjes waar die nog kan staan. Alleen
// wegstrepen wat aantoonbaar onmogelijk is, net als bij de andere puzzels.
function beginDomeinen(rooster, slachtoffer) {
  const { n, vrij } = rooster;
  const dom = [];
  for (let p = 0; p < n; p++) {
    const s = new Set();
    for (let i = 0; i < n * n; i++) if (vrij[i] && i !== slachtoffer) s.add(i);
    dom.push(s);
  }
  return dom;
}

function filter(set, test) {
  let veranderd = false;
  for (const v of [...set]) if (!test(v)) { set.delete(v); veranderd = true; }
  return veranderd;
}

function propageerAanwijzing(rooster, dom, c, slachtoffer) {
  const { n, kamerVan, meubelOp } = rooster;
  let veranderd = false;
  switch (c.soort) {
    case 'kamer':
      veranderd = filter(dom[c.p], (cel) => (kamerVan[cel] === c.kamerIdx) === c.ja) || veranderd;
      break;
    case 'zelfdeKamer': {
      const kamersQ = new Set([...dom[c.q]].map((cel) => kamerVan[cel]));
      const kamersP = new Set([...dom[c.p]].map((cel) => kamerVan[cel]));
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
    case 'leegKamer':
      for (const d of dom) veranderd = filter(d, (cel) => kamerVan[cel] !== c.kamerIdx) || veranderd;
      break;
    case 'naast':
      veranderd = filter(dom[c.p], (cel) =>
        burenVan(n, cel).some((b) => meubelOp[b] === c.m) === c.ja) || veranderd;
      break;
    case 'opRij':
      veranderd = filter(dom[c.p], (cel) => {
        const r = rijVan(n, cel);
        for (let k = 0; k < n; k++) if (meubelOp[idx(n, r, k)] === c.m) return true;
        return false;
      }) || veranderd;
      break;
    case 'noord': {
      const maxQ = Math.max(...[...dom[c.q]].map((cel) => rijVan(n, cel)));
      const minP = Math.min(...[...dom[c.p]].map((cel) => rijVan(n, cel)));
      veranderd = filter(dom[c.p], (cel) => rijVan(n, cel) < maxQ) || veranderd;
      veranderd = filter(dom[c.q], (cel) => rijVan(n, cel) > minP) || veranderd;
      break;
    }
    case 'west': {
      const maxQ = Math.max(...[...dom[c.q]].map((cel) => kolVan(n, cel)));
      const minP = Math.min(...[...dom[c.p]].map((cel) => kolVan(n, cel)));
      veranderd = filter(dom[c.p], (cel) => kolVan(n, cel) < maxQ) || veranderd;
      veranderd = filter(dom[c.q], (cel) => kolVan(n, cel) > minP) || veranderd;
      break;
    }
    case 'buren': {
      if (c.ja) {
        veranderd = filter(dom[c.p], (cel) => burenVan(n, cel).some((b) => dom[c.q].has(b))) || veranderd;
        veranderd = filter(dom[c.q], (cel) => burenVan(n, cel).some((b) => dom[c.p].has(b))) || veranderd;
      }
      break;
    }
    case 'bijSlachtoffer':
      veranderd = filter(dom[c.p], (cel) => burenVan(n, cel).includes(slachtoffer) === c.ja) || veranderd;
      break;
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
  for (let r = 0; r < n; r++) {
    const kandidaten = [];
    for (let p = 0; p < n; p++) if ([...dom[p]].some((cel) => rijVan(n, cel) === r)) kandidaten.push(p);
    if (kandidaten.length === 1) {
      const p = kandidaten[0];
      veranderd = filter(dom[p], (cel) => rijVan(n, cel) === r) || veranderd;
    }
  }
  for (let k = 0; k < n; k++) {
    const kandidaten = [];
    for (let p = 0; p < n; p++) if ([...dom[p]].some((cel) => kolVan(n, cel) === k)) kandidaten.push(p);
    if (kandidaten.length === 1) {
      const p = kandidaten[0];
      veranderd = filter(dom[p], (cel) => kolVan(n, cel) === k) || veranderd;
    }
  }
  return veranderd;
}

export function graad(rooster, aanwijzingen, slachtoffer) {
  const dom = beginDomeinen(rooster, slachtoffer);
  let rondes = 0;
  let veranderd = true;
  const kapot = () => dom.some((d) => d.size === 0);

  while (veranderd && !kapot()) {
    veranderd = false;
    for (const c of aanwijzingen) veranderd = propageerAanwijzing(rooster, dom, c, slachtoffer) || veranderd;
    veranderd = propageerRijenKolommen(rooster, dom) || veranderd;
    if (veranderd) rondes++;
  }
  const opgelost = dom.every((d) => d.size === 1);
  return { opgelost, rondes, open: dom.filter((d) => d.size > 1).length };
}
