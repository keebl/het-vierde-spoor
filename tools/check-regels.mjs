// De regelkeuring. Hier staan de spelregels van alle vier de speltypen als
// narekenbare eisen, en elke puzzel moet er zonder uitzondering aan voldoen.
//
// Waarom apart van de andere keuringen: die controleren of een puzzel te
// bouwen en uniek oplosbaar is. Deze controleert of de regels zelf kloppen -
// of elke zin waar is in de oplossing, of "naast" niet door een muur heen
// gaat, of het antwoord volgt uit de regels in plaats van uit een toeval.
//
// Gebruik: node tools/check-regels.mjs [seeds per combinatie]
//
// Hij keurt twee verzamelingen:
//   1. de vaste bibliotheek (dat is wat mensen zien)
//   2. een veegronde over elke combinatie van opdracht, wereld, speltype en
//      moeilijkheidsgraad, met een paar seeds per combinatie - dus ook de
//      puzzels die nog niet bestaan maar straks gegenereerd worden.

import { CATALOG, catalogSettings } from '../src/content/catalog.js';
import { WORLDS } from '../src/content/worlds.js';
import { ASSIGNMENTS, MECHANICS } from '../src/content/assignments.js';
import { buildPuzzle, parsePuzzleId, puzzleId } from '../src/puzzle.js';
import { countSolutions, makeCtx } from '../src/engine/assign.js';
import { evalClue, catsTouched } from '../src/engine/clues.js';
import { blokkenVan } from '../src/ui/blokken.js';
import { countLatinSolutions, evalLatin } from '../src/engine/latin.js';
import {
  telPlaatsingen, evalAanwijzing, graad, idx, rijVan, kolVan, kamerBuren, naastMeubel,
} from '../src/engine/rooms.js';
import { levelParams, kamerParams, KAMER_LEVELS, LEVEL_IDS } from '../src/engine/difficulty.js';
import { keepsNames } from '../src/ai/opdracht.js';
import { readFileSync } from 'node:fs';
import { soortVan, meubelsVoor, vormVan } from '../src/content/kamersoorten.js';

const seedsPerCombinatie = Number(process.argv[2] ?? 2);

const fouten = [];
let gekeurd = 0;
const regelsGeraakt = new Map();

function eis(naam, goed, waar, detail = '') {
  regelsGeraakt.set(naam, (regelsGeraakt.get(naam) ?? 0) + 1);
  if (goed) return true;
  fouten.push(`${waar}\n      regel: ${naam}${detail ? `\n      ${detail}` : ''}`);
  return false;
}

// ---------------------------------------------------------------- algemeen

// De taalregels voor een zin die een puzzelaar te zien krijgt. Ze gelden
// voor onze eigen zinnen en net zo goed voor een herschrijving die we
// publiceren.
function keurZin(t, waar, namen = []) {
  eis('geen gat in een zin', !/undefined|null|NaN|\[object/.test(t), waar, t);
  eis('elke zin begint met een hoofdletter', /^[A-ZÀ-Þ]/.test(t), waar, t);
  eis('elke zin eindigt met een punt', /[.!?]$/.test(t), waar, t);
  eis('geen dubbele spaties of dubbele punten', !/ {2}|\.\./.test(t), waar, t);
  eis('geen woord dat zichzelf herhaalt', !/\b([a-zà-ÿ]+) \1\b/i.test(t), waar, t);
  eis('getallen staan uitgeschreven',
    !/(^|[^\d:])\d+(?![\d:])/.test(t.replace(/\d{1,2}:\d{2}/g, '')), waar, t);
  const klein = t.toLowerCase();
  eis('elke naam in een aanwijzing staat ook in de zin',
    namen.every((x) => klein.includes(x.toLowerCase())), waar, t);
}

function keurAlgemeen(p, waar) {
  eis('elke puzzel heeft een vraag met een antwoord',
    !!p.question?.text && !!p.question?.answer, waar);
  eis('elke puzzel heeft minstens een aanwijzing',
    p.clues.length > 0, waar);

  const gezien = new Set();
  for (const c of p.clues) {
    const t = c.text ?? '';
    // "waar de envelop ligt ligt precies twee deuren van" - een zin waarin
    // hetzelfde woord twee keer achter elkaar staat, is bijna altijd een
    // sjabloon dat tegen een ander sjabloon aan botst. Een naam vooraan in
    // de zin krijgt een hoofdletter, dus namen vergelijken we zonder op
    // hoofdletters te letten.
    keurZin(t, waar, c.names ?? []);
    eis('geen twee aanwijzingen met dezelfde zin', !gezien.has(t), waar, t);
    gezien.add(t);
  }
  eis('elke aanwijzing noemt iets bij naam',
    p.clues.every((c) => (c.names ?? []).length > 0), waar);
  const terug = parsePuzzleId(p.id);
  eis('een link naar een puzzel leidt terug naar dezelfde puzzel',
    terug.opdracht === p.settings.opdracht && terug.wereld === p.settings.wereld
    && terug.mechaniek === p.settings.mechaniek && String(terug.niveau) === String(p.settings.niveau)
    && terug.seed === p.settings.seed, waar, p.id);
  eis('de inleiding verklapt het antwoord niet',
    !(p.intro ?? '').includes(p.question.answer), waar,
    `${p.question.answer} staat in de inleiding`);
}

// ------------------------------------------------- speurdoku (kamerraster)

function keurKamer(p, waar) {
  const { n, kamerVan, meubelOp, vrij, oplossing } = p;
  const rooster = p._rooster;

  // Regel 1: elke kamer is aaneengesloten, anders is "dezelfde kamer" onzin.
  for (let k = 0; k < p.kamerNamen.length; k++) {
    const cellen = [];
    for (let i = 0; i < n * n; i++) if (kamerVan[i] === k) cellen.push(i);
    let bereikt = new Set();
    if (cellen.length) {
      const stapel = [cellen[0]];
      bereikt = new Set(stapel);
      while (stapel.length) {
        const cel = stapel.pop();
        const r = rijVan(n, cel);
        const c = kolVan(n, cel);
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nc < 0 || nr >= n || nc >= n) continue;
          const b = idx(n, nr, nc);
          if (kamerVan[b] === k && !bereikt.has(b)) { bereikt.add(b); stapel.push(b); }
        }
      }
    }
    eis('elke kamer is een aaneengesloten geheel',
      cellen.length > 0 && bereikt.size === cellen.length, waar, p.kamerNamen[k]);
  }

  // Regel 2: op een meubelstuk staat niemand.
  eis('niemand staat op een meubelstuk',
    oplossing.every((cel) => vrij[cel] && meubelOp[cel] == null), waar);

  // Regel 3: precies een figuur per rij en per kolom.
  const rijen = new Set(oplossing.map((cel) => rijVan(n, cel)));
  const kolommen = new Set(oplossing.map((cel) => kolVan(n, cel)));
  eis('precies een figuur per rij', rijen.size === n && oplossing.length === n, waar);
  eis('precies een figuur per kolom', kolommen.size === n && oplossing.length === n, waar);

  // Regel 4: elke aanwijzing is waar in de oplossing.
  const ctx = { rooster, plaats: oplossing };
  for (let i = 0; i < p._ruwe.length; i++) {
    eis('elke aanwijzing is waar in de oplossing',
      evalAanwijzing(p._ruwe[i], ctx) === true, waar, p.clues[i]?.text);
  }

  // Regel 5: de oplossing is de enige die aan alle aanwijzingen voldoet.
  // Het budget schaalt mee met het bord, net als in de generator (zie
  // poging() in generate-rooms.js). Op het standaardbudget gaf de teller
  // het op bij zestien bij zestien, en dan staat er "1 (solver gaf op)" -
  // wat betekent: hij vond er één maar kan niet bewijzen dat het de enige
  // is. Dat is geen fout van de puzzel maar van de vraag die we stelden.
  const uit = telPlaatsingen(rooster, p._ruwe, 3, 30000 * p.n);
  eis('precies een oplossing', !uit.opgegeven && uit.count === 1, waar,
    `gevonden: ${uit.count}${uit.opgegeven ? ' (solver gaf op)' : ''}`);

  // Regel 6: naast is naast, niet door een muur heen.
  for (let i = 0; i < p._ruwe.length; i++) {
    const c = p._ruwe[i];
    if (c.soort === 'naast' && c.ja) {
      const cel = oplossing[c.p];
      const m = [...Array(n * n).keys()].find((x) => meubelOp[x] === c.m);
      eis('wie naast een meubelstuk staat, staat in dezelfde kamer',
        kamerVan[cel] === kamerVan[m] && naastMeubel(rooster, cel, c.m), waar, p.clues[i]?.text);
    }
    if (c.soort === 'buren' && c.ja) {
      eis('twee mensen die naast elkaar staan, staan in dezelfde kamer',
        kamerVan[oplossing[c.p]] === kamerVan[oplossing[c.q]]
        && kamerBuren(rooster, oplossing[c.p]).includes(oplossing[c.q]), waar, p.clues[i]?.text);
    }
    if (c.soort === 'aantalNaast') {
      let telling = 0;
      for (const cel of oplossing) if (naastMeubel(rooster, cel, c.m)) telling++;
      eis('een telling naast een meubelstuk telt alleen dezelfde kamer',
        telling === c.aantal, waar, p.clues[i]?.text);
    }
  }

  // Regel 6b: een aanwijzing mag alleen verwijzen naar wat op het bord staat.
  for (let i = 0; i < p._ruwe.length; i++) {
    const c = p._ruwe[i];
    if (c.kamerIdx != null) {
      eis('een aanwijzing noemt alleen kamers die op het bord staan',
        c.kamerIdx >= 0 && c.kamerIdx < p.kamerNamen.length && !!p.kamerNamen[c.kamerIdx],
        waar, p.clues[i]?.text);
    }
    if (c.m != null) {
      eis('een aanwijzing noemt alleen meubels die op het bord staan',
        !!p.meubelNamen[c.m] && p.meubelOp.includes(c.m), waar, p.clues[i]?.text);
    }
    for (const pers of [c.p, c.q]) {
      if (pers == null) continue;
      eis('een aanwijzing noemt alleen figuren die op het bord staan',
        pers >= 0 && pers < n && !!p.personen[pers], waar, p.clues[i]?.text);
    }
  }

  // Regel 6c: in elke kamer kan iemand staan, anders is de naam zinloos.
  for (let k = 0; k < p.kamerNamen.length; k++) {
    let vrije = 0;
    for (let i = 0; i < n * n; i++) if (kamerVan[i] === k && vrij[i]) vrije++;
    eis('in elke kamer is plaats voor iemand', vrije > 0, waar, p.kamerNamen[k]);
  }

  // Regel 7: het slachtoffer staat met precies een ander in de kamer, en dat
  // is de dader. Anders heeft de vraag geen eenduidig antwoord.
  const kamerSlachtoffer = kamerVan[oplossing[p.slachtofferIdx]];
  const samen = oplossing
    .map((cel, i) => ({ cel, i }))
    .filter(({ cel, i }) => i !== p.slachtofferIdx && kamerVan[cel] === kamerSlachtoffer);
  eis('bij het slachtoffer staat precies een ander', samen.length === 1, waar,
    `${samen.length} anderen in ${p.kamerNamen[kamerSlachtoffer]}`);
  eis('de dader is die ander', samen.length === 1 && samen[0].i === p.dader, waar);
  eis('het antwoord is de naam van de dader',
    p.personen[p.dader] === p.question.answer, waar);

  // Regel 8: geen aanwijzing verklapt waar het lichaam ligt of wie erbij stond.
  for (let i = 0; i < p._ruwe.length; i++) {
    const c = p._ruwe[i];
    const raaktLijk = c.p === p.slachtofferIdx || c.q === p.slachtofferIdx;
    eis('geen aanwijzing zegt in welke kamer het slachtoffer lag',
      !(c.soort === 'kamer' && c.ja && c.p === p.slachtofferIdx), waar, p.clues[i]?.text);
    eis('geen aanwijzing zet iemand bij het slachtoffer in de kamer',
      !(c.soort === 'zelfdeKamer' && c.ja && raaktLijk), waar, p.clues[i]?.text);
  }

  // De naam van een kamer moet bij zijn vorm passen. Noem je een vierkante
  // klodder "het verzonken bruggetje", dan leest de hele plattegrond als
  // iets wat de computer bij elkaar heeft gegooid. De generator deelt de
  // namen daarom uit op vorm; hier wordt nagerekend dat dat ook gelukt is.
  {
    const maten = new Map();
    for (let cel = 0; cel < p.n * p.n; cel++) {
      const k = p.kamerVan[cel];
      const r = Math.floor(cel / p.n);
      const c = cel % p.n;
      const m = maten.get(k) ?? { cellen: 0, minR: p.n, maxR: -1, minC: p.n, maxC: -1 };
      m.cellen += 1;
      m.minR = Math.min(m.minR, r); m.maxR = Math.max(m.maxR, r);
      m.minC = Math.min(m.minC, c); m.maxC = Math.max(m.maxC, c);
      maten.set(k, m);
    }
    const vorm = new Map();
    for (const [k, m] of maten) {
      const hoog = m.maxR - m.minR + 1;
      const breed = m.maxC - m.minC + 1;
      m.lang = Math.max(hoog, breed) / Math.max(1, Math.min(hoog, breed));
      vorm.set(k, vormVan(p.kamerNamen[k]));
    }
    const van = (soort) => [...maten].filter(([k]) => vorm.get(k) === soort);
    const stroken = van('smal');
    const anders = [...maten].filter(([k]) => vorm.get(k) !== 'smal');
    for (const [k, m] of stroken) {
      const langer = anders.every(([, o]) => m.lang >= o.lang);
      eis('een strooknaam ligt op de langste kamer die er is', langer, waar,
        `${p.kamerNamen[k]} (${m.lang.toFixed(1)})`);
    }
    // Alleen te vergelijken als er ook echt een hoeknaam op het bord staat.
    // Zonder die vergelijking werd de ondergrens oneindig en faalde elke
    // zaalnaam - de regel klopte niet, de puzzels wel.
    const hoeken = van('klein');
    if (hoeken.length) {
      const kleinste = Math.min(...hoeken.map(([, m]) => m.cellen));
      for (const [k, m] of van('groot')) {
        eis('een zaalnaam ligt op een grotere kamer dan een hoeknaam',
          m.cellen >= kleinste, waar, `${p.kamerNamen[k]} (${m.cellen} vakjes)`);
      }
    }
  }

  // Regel 9: namen moeten los van elkaar te noemen zijn.
  const uniek = (lijst) => new Set(lijst).size === lijst.length;
  eis('alle figuren hebben een eigen naam', uniek(p.personen), waar, p.personen.join(', '));
  eis('alle figuren hebben een eigen beginletter',
    uniek(p.personen.map((x) => x.charAt(0).toUpperCase())), waar, p.personen.join(', '));
  eis('alle kamers hebben een eigen naam', uniek(p.kamerNamen), waar);
  const meubels = p.meubelNamen.filter(Boolean);
  eis('alle meubelstukken hebben een eigen naam', uniek(meubels), waar, meubels.join(', '));
  eis('elk meubelstuk op het bord heeft een naam en een tekening',
    p.meubelOp.every((m) => m == null || (p.meubelNamen[m] && p.meubelIconen[m])), waar);

  // Regel 9b: het meubilair past bij de ruimte. Een koelkast hoort niet in
  // een bos, en dat is precies wat er gebeurde toen het meubilair van een
  // soort ruimte opraakte en de code het eerste het beste pakte.
  for (let cel = 0; cel < n * n; cel++) {
    const m = p.meubelOp[cel];
    if (m == null) continue;
    const soort = soortVan(p.kamerNamen[kamerVan[cel]]);
    const mag = meubelsVoor(soort, p.world?.id).flat().map(([naam]) => naam);
    eis('het meubilair past bij de soort ruimte',
      mag.includes(p.meubelNamen[m]), waar,
      `${p.meubelNamen[m]} in ${p.kamerNamen[kamerVan[cel]]} (${soort})`);
  }

  // Regel 10: de belofte van de moeilijkheidsgraad.
  const params = kamerParams(p.niveau);
  const g = graad(rooster, p._ruwe);
  if (params.style === 'shallow') {
    eis('tot en met niveau 3 is doorstrepen genoeg', g.opgelost, waar,
      `${g.open} figuren blijven open`);
  }
  eis('het rooster heeft de maat van de moeilijkheidsgraad', n === params.n, waar);
}

// ------------------------------------------- kruisverhoor en rondgang (grid)

function keurAssign(p, waar) {
  const spec = p._spec;
  const n = spec.anchor.items.length;

  // Regel 1: elke categorie verdeelt haar items een-op-een over de slots.
  for (const cat of spec.cats) {
    const kolom = p.solution[cat.id];
    eis('elke categorie is precies een-op-een verdeeld',
      kolom.length === n && new Set(kolom).size === n && kolom.every((v) => v >= 0 && v < n),
      waar, cat.name);
  }

  // Regel 2: elke aanwijzing is waar in de oplossing, de inleiding ook.
  const ctx = makeCtx(spec, p.solution);
  for (const c of p._rawClues) {
    eis('elke aanwijzing is waar in de oplossing', evalClue(c, ctx) === true, waar, c.kind);
  }

  // Regel 3: er is precies een oplossing.
  const uit = countSolutions(spec, p._rawClues, 3);
  eis('precies een oplossing', uit.count === 1, waar, `gevonden: ${uit.count}`);

  // Regel 4: het antwoord volgt uit die oplossing.
  const vraagCat = p.question.catId === spec.anchor.id
    ? spec.anchor
    : spec.cats.find((c) => c.id === p.question.catId);
  const antwoordIdx = p.question.catId === spec.anchor.id
    ? p.question.slot
    : p.solution[p.question.catId][p.question.slot];
  eis('het antwoord volgt uit de oplossing',
    vraagCat.items[antwoordIdx].name === p.question.answer, waar,
    `${vraagCat.items[antwoordIdx]?.name} tegen ${p.question.answer}`);

  // Regel 5: op een plattegrond moet de kaart zelf klopppen.
  if (p.graph) {
    const g = spec.graph;
    eis('de kaart hangt aan elkaar',
      [...Array(g.n).keys()].every((i) => g.dist(0, i) < Infinity), waar);
    for (const c of p._rawClues) {
      if (c.kind === 'adj') {
        const sa = slotVan(spec, p.solution, c.a);
        const sb = slotVan(spec, p.solution, c.b);
        eis('een grens-aanwijzing klopt met de deuren op de kaart',
          g.isEdge(sa, sb) === c.positive, waar);
      }
      if (c.kind === 'hops') {
        const sa = slotVan(spec, p.solution, c.a);
        const sb = slotVan(spec, p.solution, c.b);
        eis('een afstand-aanwijzing klopt met de deuren op de kaart',
          g.dist(sa, sb) === c.d, waar);
      }
    }
  }

  // Regel 5b: het feit dat de inleiding weggeeft, staat er ook echt in.
  const introClues = p._rawClues.filter((c) => c.intro);
  for (const c of introClues) {
    for (const key of ['a', 'b']) {
      const ref = c[key];
      if (!ref) continue;
      const cat = ref.c === spec.anchor.id ? spec.anchor : spec.cats.find((x) => x.id === ref.c);
      eis('wat de inleiding gratis weggeeft, staat in de inleiding',
        p.intro.toLowerCase().includes(cat.items[ref.i].name.toLowerCase()), waar,
        cat.items[ref.i].name);
    }
  }

  // Regel 5c: een aanwijzing die precies twee categorieën aan elkaar knoopt,
  // moet je ergens kunnen noteren. Daarvoor heeft het raster ook blokken
  // tussen de categorieën onderling nodig: zonder het blok voorwerp x plek
  // kun je "degene met de bankbiljetten was in het hotel" nergens kwijt.
  const blokken = new Set(blokkenVan(p).flatMap((b) => [`${b.rij.id}|${b.kolom.id}`, `${b.kolom.id}|${b.rij.id}`]));
  for (const c of p._rawClues) {
    const raakt = [...catsTouched(c)];
    if (raakt.length !== 2) continue;
    eis('een aanwijzing tussen twee categorieen is op het bord te noteren',
      blokken.has(`${raakt[0]}|${raakt[1]}`), waar, `${c.kind}: ${raakt.join(' x ')}`);
  }

  // Regel 6: de belofte van de moeilijkheidsgraad.
  const params = levelParams(p.niveau);
  eis('de moeilijkheidsgraad doet wat hij belooft',
    params.style === 'shallow' ? p.depth === 1 : p.depth > 1, waar,
    `${params.style} gevraagd, diepte ${p.depth}`);
  eis('niet meer aanwijzingen dan de moeilijkheidsgraad toestaat',
    p.clues.length <= params.maxClues + 2, waar, `${p.clues.length} aanwijzingen`);
}

function slotVan(spec, solution, ref) {
  if (ref.c === spec.anchor.id) return ref.i;
  return solution[ref.c].indexOf(ref.i);
}

// ------------------------------------------------------- dienstrooster (latin)

function keurLatin(p, waar) {
  const n = p.rows.length;
  eis('het rooster is vierkant', p.cols.length === n && p.symbols.length === n, waar);

  for (let r = 0; r < n; r++) {
    eis('iedereen staat een keer op elke plek',
      new Set(p.full[r]).size === n, waar, p.rows[r]);
  }
  for (let c = 0; c < n; c++) {
    const kolom = p.full.map((rij) => rij[c]);
    eis('op elk moment is iedereen op precies een plek',
      new Set(kolom).size === n, waar, p.cols[c]);
  }

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      eis('een gegeven vakje klopt met de oplossing',
        p.givens[r][c] == null || p.givens[r][c] === p.full[r][c], waar);
    }
  }

  for (let i = 0; i < (p._ruweLatin ?? []).length; i++) {
    eis('elke aanwijzing is waar in de oplossing',
      evalLatin(p._ruweLatin[i], p.full, n) === true, waar, p.clues[i]?.text);
  }

  const uit = countLatinSolutions(p.givens, n, 3, p._ruweLatin ?? []);
  eis('precies een oplossing', uit.count === 1, waar, `gevonden: ${uit.count}`);

  const [qr, qc] = p.question.cell;
  eis('het antwoord volgt uit de oplossing',
    p.symbols[p.full[qr][qc]] === p.question.answer, waar);
  eis('de vraag gaat over een vakje dat je zelf moet invullen',
    p.givens[qr][qc] == null, waar);
}

// --------------------------------------------------------------- de rondes

// De titel en het regeltje eronder beloven van alles: "vier verdachten",
// "zes bij zes", "zeven reizigers". Die getallen moeten kloppen met de
// puzzel die je krijgt. Toen de niveaus van maat veranderden, klopte de
// helft niet meer - en dat zie je pas als je de puzzel opent.
// "Een" staat er niet bij: "een nacht", "een deur", "een tijdlijn" zijn geen
// beloftes over de maat van de puzzel.
const TELWOORDEN = {
  twee: 2, drie: 3, vier: 4, vijf: 5, zes: 6,
  zeven: 7, acht: 8, negen: 9, tien: 10, elf: 11, twaalf: 12,
  // Sinds niveau 6 bestaat kan een titel ook zestien beloven, en dan moet
  // die belofte net zo goed nagerekend worden als de rest.
  dertien: 13, veertien: 14, vijftien: 15, zestien: 16,
};

// Alleen getallen die over de puzzel zelf gaan. "Tien minuten werk" en "twee
// keer op dezelfde rij" tellen niet mee.
const TELBAAR = new RegExp(
  '\\b(' + Object.keys(TELWOORDEN).join('|') + ')\\s+'
  + '(?:\\w+\\s+)?(verdachten|figuren|mensen|familieleden|bemanningsleden|reizigers'
  + '|getuigen|afdalers|aanwezigen|gasten|leerlingen|kamers|gewelven|modules|zalen'
  + '|plekken|ruimtes|panden|rijen|kolommen|vakjes|sporen|pakketten|jassen|gaven'
  + '|meesterproeven|klokslagen|kwartier)\\b',
  'gi'
);

// "Zes bij zes" is een belofte over de maat van het bord, en die heeft zijn
// eigen vorm.
const MAAT = new RegExp(
  '\\b(' + Object.keys(TELWOORDEN).join('|') + ')\\s+bij\\s+(' + Object.keys(TELWOORDEN).join('|') + ')\\b',
  'gi'
);

function keurBelofte(p, entry, waar) {
  const echte = new Set([p.clues.length]);
  if (p.kind === 'kamer') {
    echte.add(p.n).add(p.personen.length).add(p.kamerNamen.length);
  } else if (p.kind === 'latin') {
    echte.add(p.rows.length);
  } else {
    echte.add(p.anchor.items.length).add(p.cats.length);
    if (p.graph) echte.add(p.graph.n);
  }

  const tekst = `${entry.titel} ${entry.sub}`;
  for (const m of tekst.matchAll(TELBAAR)) {
    const getal = TELWOORDEN[m[1].toLowerCase()];
    eis('wat de titel belooft, krijg je ook',
      echte.has(getal), waar, `"${m[0]}" terwijl het er ${[...echte].sort((a, b) => a - b).join(' of ')} zijn`);
  }
  for (const m of tekst.matchAll(MAAT)) {
    const a = TELWOORDEN[m[1].toLowerCase()];
    const b = TELWOORDEN[m[2].toLowerCase()];
    eis('wat de titel belooft, krijg je ook',
      a === b && echte.has(a), waar, `"${m[0]}" terwijl het bord ${p.n ?? '?'} bij ${p.n ?? '?'} is`);
  }
  eis('geen tweede puzzel die ook "begin hier" zegt',
    !/begin hier/i.test(tekst), waar, tekst);
}

function keur(settings, waar, entry = null) {
  let p;
  try {
    p = buildPuzzle(settings);
  } catch (e) {
    fouten.push(`${waar}\n      regel: een puzzel moet te bouwen zijn\n      ${e.message}`);
    return;
  }
  gekeurd++;
  keurAlgemeen(p, waar);
  if (entry) keurBelofte(p, entry, waar);
  if (p.kind === 'kamer') keurKamer(p, waar);
  else if (p.kind === 'assign') keurAssign(p, waar);
  else keurLatin(p, waar);

  // Dezelfde instellingen moeten dezelfde puzzel geven, anders is een link
  // naar een puzzel niets waard.
  const nogmaals = buildPuzzle(settings);
  eis('dezelfde instellingen geven dezelfde puzzel',
    JSON.stringify(nogmaals.clues) === JSON.stringify(p.clues)
    && nogmaals.question.answer === p.question.answer, waar);
}

// ------------------------------------- de vooraf herschreven teksten

// Wat op de live site staat, is net zo goed inhoud als onze eigen zinnen.
// Dus geldt hetzelfde: de logica mag er niet door veranderen, en de taal
// moet kloppen.
console.log('De vooraf herschreven teksten');
let aiTeksten = {};
try {
  aiTeksten = JSON.parse(readFileSync(new URL('../src/content/ai-teksten.json', import.meta.url), 'utf8'));
} catch {
  console.log('  (nog geen ai-teksten.json; overgeslagen)');
}
const catalogusIds = new Map(CATALOG.map((e) => [puzzleId(catalogSettings(e)), e]));
let herschreven = 0;
for (const [id, tekst] of Object.entries(aiTeksten)) {
  const entry = catalogusIds.get(id);
  const waar = `  ${entry?.titel ?? id}`;
  if (!eis('een herschreven tekst hoort bij een puzzel uit de bibliotheek', !!entry, waar, id)) continue;

  const p = buildPuzzle(catalogSettings(entry));
  herschreven++;
  // Een herschreven inleiding is optioneel: sinds 2026-11-13 staan er geen
  // meer in, omdat ze klonken als een taalmodel en de eigen zinnen beter
  // waren. Is er wel een, dan wordt die nagerekend zoals altijd.
  if (typeof tekst.intro === 'string') {
    keurZin(tekst.intro, waar);
    eis('de herschreven inleiding verklapt het antwoord niet',
      !(tekst.intro ?? '').includes(p.question.answer), waar);
    // De inleiding van een moordzaak geeft een feit weg dat je nodig hebt:
    // waar het gebeurde en wat er lag. Laat de herschrijving dat vallen, dan
    // is de puzzel niet meer op te lossen. Dit is de enige plek waar de AI de
    // logica zou kunnen raken, dus hier wordt hij nagerekend.
    const klein = (tekst.intro ?? '').toLowerCase();
    for (const c of (p._rawClues ?? []).filter((x) => x.intro)) {
      for (const key of ['a', 'b']) {
        const ref = c[key];
        if (!ref) continue;
        const cat = ref.c === p._spec.anchor.id
          ? p._spec.anchor
          : p._spec.cats.find((x) => x.id === ref.c);
        const naam = cat.items[ref.i].name;
        eis('het gratis feit staat ook in de herschreven inleiding',
          klein.includes(naam.toLowerCase()), waar, `${naam} ontbreekt`);
      }
    }
    // Het slachtoffer moet er ook in blijven staan: de vraag gaat over hem.
    if (p.kind === 'kamer') {
      eis('het slachtoffer staat ook in de herschreven inleiding',
        klein.includes(p.slachtofferNaam.toLowerCase()), waar, p.slachtofferNaam);
    }
  }
  eis('er zijn evenveel herschreven aanwijzingen als aanwijzingen',
    (tekst.aanwijzingen ?? []).length === p.clues.length, waar,
    `${(tekst.aanwijzingen ?? []).length} tegen ${p.clues.length}`);

  const perNummer = new Map((tekst.aanwijzingen ?? []).map((a) => [Number(a.n), a.tekst]));
  for (const c of p.clues) {
    const zin = perNummer.get(c.n);
    if (!eis('elke aanwijzing heeft een herschrijving met hetzelfde nummer', typeof zin === 'string', waar, `nummer ${c.n}`)) continue;
    keurZin(zin, waar, c.names ?? []);
    // Dit is de regel waar alles aan hangt: een herschrijving mag de logica
    // niet aanraken. Komt hij er niet door, dan hoort hij niet gepubliceerd.
    eis('een herschreven aanwijzing houdt namen, ontkenning, getallen en keuze intact',
      keepsNames(c.text, zin, c.names ?? []), waar, `${c.text}  ->  ${zin}`);
  }
}
console.log(`  ${herschreven} puzzels met een herschreven tekst`);

console.log('\nDe werelden');
for (const w of WORLDS) {
  const waar = `  ${w.name}`;
  // De beginletter staat op de penning op het bord, en elke figuur in een
  // puzzel hoort er een eigen te hebben (zie regel 9 hierboven, die dat per
  // puzzel narekent). Hier staat wat de wereld daarvoor moet aanleveren.
  //
  // Eerder stond hier: alle namen samen hebben een eigen beginletter. Dat
  // klopte toen er precies twaalf verdachten en drie slachtoffers waren en
  // ze allemaal tegelijk op het bord konden staan. Sinds de namen per
  // beginletter getrokken worden - eerst welke letters, dan per letter een
  // naam - zijn er juist meerdere namen achter dezelfde letter, en dat is
  // precies de bedoeling: daar komt de variatie vandaan. Wat moet kloppen
  // is tweeërlei.
  const verdachtenletters = new Set(
    [...w.persons, ...(w.personenXL ?? []), ...(w.personenExtra ?? [])]
      .map((x) => x.charAt(0).toUpperCase()),
  );
  const slachtofferletters = new Set(w.slachtoffers.map((x) => x.charAt(0).toUpperCase()));
  const botsendeLetters = [...slachtofferletters].filter((l) => verdachtenletters.has(l));
  eis('een slachtoffer begint nooit als een verdachte',
    botsendeLetters.length === 0, waar,
    `${botsendeLetters.join('')} komt aan beide kanten voor`);
  // Het grootste rooster is zestien bij zestien, met elf kamers. Zet je
  // daar een wereld naast die twaalf namen heeft, dan valt de generator om
  // op een plek waar je het pas merkt als iemand niveau zes kiest.
  // Het grootste rooster is zestien bij zestien met elf kamers. Zet je daar
  // een wereld naast die twaalf namen heeft, dan valt de generator om op een
  // plek waar je het pas merkt als iemand niveau zes kiest. De extra namen
  // en plekken staan apart omdat ze de bestaande puzzels niet mogen
  // verschuiven; voor de maat tellen ze gewoon mee.
  const grootste = KAMER_LEVELS[Math.max(...LEVEL_IDS)];
  const alleNamen = [...w.persons, ...(w.personenXL ?? [])];
  const allePlekken = [...w.places, ...(w.plekkenXL ?? [])];
  eis('genoeg verdachten voor het grootste rooster',
    alleNamen.length >= grootste.n, waar, `${alleNamen.length} namen`);
  // Het bord van zestien bij zestien zet zestien figuren neer, en er wordt
  // één naam per beginletter getrokken. Zijn er minder dan zestien letters,
  // dan loopt de trekking leeg en valt de puzzel om.
  eis('genoeg verschillende beginletters voor het grootste rooster',
    verdachtenletters.size >= grootste.n, waar,
    `${verdachtenletters.size} letters: ${[...verdachtenletters].sort().join('')}`);
  eis('genoeg plekken voor het grootste aantal kamers',
    allePlekken.length >= grootste.kamers, waar, `${allePlekken.length} plekken`);
  eis('genoeg voorwerpen, tijden en sporen voor zes slots',
    w.objects.length >= 6 && w.times.length >= 6 && w.hidden.length >= 6, waar);
  eis('elk slachtoffer heeft een naam en een rol',
    w.slachtoffers.length >= 1 && w.victims.length >= 1, waar);

  // Het woord waarmee een wereld een ruimte aanduidt - "in dezelfde zaal",
  // "in hetzelfde gewelf" - staat in de vraag en in elke aanwijzing over
  // twee mensen bij elkaar. Als datzelfde woord ook in een kamernaam zit,
  // dan leest de vraag als een hint: "in welke zaal stond hij" terwijl er
  // precies een zaal op het bord ligt. Het woord moet dus van geen enkele
  // plek in die wereld een deel van de naam zijn.
  const ruimtewoord = (w.sameRoom ?? '')
    .replace(/^(in|op) (dezelfde|hetzelfde) /, '')
    .replace(/ als$/, '')
    .toLowerCase();
  if (ruimtewoord) {
    const botsing = allePlekken.filter((plek) => plek.toLowerCase().includes(ruimtewoord));
    eis('het woord voor een ruimte zit in geen enkele kamernaam',
      botsing.length === 0, waar, `"${ruimtewoord}" zit in ${botsing.join(', ')}`);
  }
}
console.log(`  ${WORLDS.length} werelden gekeurd`);

console.log('\nDe bibliotheek');
const titels = new Set();
for (const entry of CATALOG) {
  const waar = `  ${entry.titel} (${entry.mechaniek}, niveau ${entry.niveau})`;
  eis('elke puzzel heeft een eigen titel', !titels.has(entry.titel), waar, entry.titel);
  titels.add(entry.titel);
  keur(catalogSettings(entry), waar, entry);
}
console.log(`  ${CATALOG.length} puzzels gekeurd`);

console.log('\nDe veegronde: elke combinatie die iemand kan instellen');
let combinaties = 0;
for (const a of ASSIGNMENTS) {
  for (const m of MECHANICS) {
    if (!a.mechanics.includes(m.id)) continue;
    for (const w of WORLDS) {
      for (const niveau of [1, 2, 3, 4, 5]) {
        combinaties++;
        for (let s = 0; s < seedsPerCombinatie; s++) {
          keur({ opdracht: a.id, wereld: w.id, mechaniek: m.id, niveau, seed: `regel-${s}` },
            `  ${a.id}/${w.id}/${m.id}/n${niveau}/seed regel-${s}`);
        }
      }
      // Niveau zes krijgt bij de Reconstructie een eigen, dunnere ronde. Een
      // bord van zestien bij zestien kost zeven tot elf seconden om te
      // bouwen; alles wat voor de andere niveaus geldt zou hier uren duren.
      // Daarom hier een seed per wereld in plaats van per combinatie - de
      // overige mechanieken zijn op niveau zes net zo snel als op vijf en
      // gaan wel de volle ronde door.
      if (m.id !== 'kamer') {
        combinaties++;
        for (let s = 0; s < seedsPerCombinatie; s++) {
          keur({ opdracht: a.id, wereld: w.id, mechaniek: m.id, niveau: 6, seed: `regel-${s}` },
            `  ${a.id}/${w.id}/${m.id}/n6/seed regel-${s}`);
        }
      }
    }
  }
}
for (const w of WORLDS) {
  const a = ASSIGNMENTS.find((x) => x.mechanics.includes('kamer'));
  combinaties++;
  keur({ opdracht: a.id, wereld: w.id, mechaniek: 'kamer', niveau: 6, seed: 'regel-xl' },
    `  ${a.id}/${w.id}/kamer/n6/seed regel-xl`);
}
console.log(`  ${combinaties} combinaties, ${seedsPerCombinatie} seeds elk`);
console.log('  (niveau zes bij de Reconstructie: een seed per wereld, want');
console.log('   zestien bij zestien kost zeven tot elf seconden per stuk)');

console.log(`\n${regelsGeraakt.size} regels nagerekend over ${gekeurd} puzzels:`);
for (const [naam, aantal] of [...regelsGeraakt].sort()) {
  console.log(`  ${String(aantal).padStart(6)}x  ${naam}`);
}

if (fouten.length) {
  console.log(`\n${fouten.length} overtredingen:`);
  for (const f of fouten.slice(0, 40)) console.log(`  ${f}`);
  if (fouten.length > 40) console.log(`  ... en nog ${fouten.length - 40}`);
  process.exit(1);
}
console.log('\nalle puzzels houden zich aan alle regels');
