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
import { buildPuzzle, parsePuzzleId } from '../src/puzzle.js';
import { countSolutions, makeCtx } from '../src/engine/assign.js';
import { evalClue } from '../src/engine/clues.js';
import { countLatinSolutions, evalLatin } from '../src/engine/latin.js';
import {
  telPlaatsingen, evalAanwijzing, graad, idx, rijVan, kolVan, kamerBuren, naastMeubel,
} from '../src/engine/rooms.js';
import { levelParams, kamerParams } from '../src/engine/difficulty.js';

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

function keurAlgemeen(p, waar) {
  eis('elke puzzel heeft een vraag met een antwoord',
    !!p.question?.text && !!p.question?.answer, waar);
  eis('elke puzzel heeft minstens een aanwijzing',
    p.clues.length > 0, waar);

  const gezien = new Set();
  for (const c of p.clues) {
    const t = c.text ?? '';
    eis('geen gat in een zin', !/undefined|null|NaN|\[object/.test(t), waar, t);
    eis('elke zin begint met een hoofdletter', /^[A-ZÀ-Þ]/.test(t), waar, t);
    eis('elke zin eindigt met een punt', /[.!?]$/.test(t), waar, t);
    eis('geen dubbele spaties of dubbele punten', !/ {2}|\.\./.test(t), waar, t);
    // Een naam vooraan in de zin krijgt een hoofdletter, dus vergelijken we
    // zonder op hoofdletters te letten.
    const klein = t.toLowerCase();
    eis('elke naam in een aanwijzing staat ook in de zin',
      (c.names ?? []).every((x) => klein.includes(x.toLowerCase())), waar, t);
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
  const uit = telPlaatsingen(rooster, p._ruwe, 3);
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

function keur(settings, waar) {
  let p;
  try {
    p = buildPuzzle(settings);
  } catch (e) {
    fouten.push(`${waar}\n      regel: een puzzel moet te bouwen zijn\n      ${e.message}`);
    return;
  }
  gekeurd++;
  keurAlgemeen(p, waar);
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

console.log('De werelden');
for (const w of WORLDS) {
  const waar = `  ${w.name}`;
  const letters = [...w.persons, ...w.slachtoffers].map((x) => x.charAt(0).toUpperCase());
  eis('verdachten en slachtoffers hebben elk een eigen beginletter',
    new Set(letters).size === letters.length, waar, letters.join(''));
  eis('genoeg verdachten voor het grootste rooster', w.persons.length >= 12, waar);
  eis('genoeg plekken voor het grootste aantal kamers', w.places.length >= 8, waar);
  eis('genoeg voorwerpen, tijden en sporen voor zes slots',
    w.objects.length >= 6 && w.times.length >= 6 && w.hidden.length >= 6, waar);
  eis('elk slachtoffer heeft een naam en een rol',
    w.slachtoffers.length >= 1 && w.victims.length >= 1, waar);
}
console.log(`  ${WORLDS.length} werelden gekeurd`);

console.log('\nDe bibliotheek');
for (const entry of CATALOG) {
  keur(catalogSettings(entry), `  ${entry.titel} (${entry.mechaniek}, niveau ${entry.niveau})`);
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
    }
  }
}
console.log(`  ${combinaties} combinaties, ${seedsPerCombinatie} seeds elk`);

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
