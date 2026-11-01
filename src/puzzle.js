// Van instellingen naar een speelbare puzzel. Dit is de enige plek die
// content, motor en formulering bij elkaar brengt.

import { WORLD_BY_ID } from './content/worlds.js';
import { ASSIGNMENT_BY_ID } from './content/assignments.js';
import { levelParams } from './engine/difficulty.js';
import { generateAssignment } from './engine/generate.js';
import { makeCtx, emptyCols } from './engine/assign.js';
import { phraseClue } from './engine/clues.js';
import { generateLatin, latinDepth } from './engine/latin.js';
import { genereerKamerpuzzel } from './engine/generate-rooms.js';
import { kamerParams } from './engine/difficulty.js';
import { zinVoor, namenIn } from './content/rooms-text.js';
import { makeRng } from './engine/rng.js';

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function buildPuzzle(settings) {
  const { opdracht, wereld, mechaniek, niveau, seed } = settings;
  const world = WORLD_BY_ID.get(wereld);
  const assignment = ASSIGNMENT_BY_ID.get(opdracht);
  if (!world) throw new Error(`onbekende wereld: ${wereld}`);
  if (!assignment) throw new Error(`onbekende opdracht: ${opdracht}`);
  if (!assignment.mechanics.includes(mechaniek)) {
    throw new Error(`${assignment.name} werkt niet met ${mechaniek}`);
  }
  if (mechaniek === 'kamer') return buildKamerPuzzle({ world, settings });
  const params = levelParams(niveau);
  return mechaniek === 'latin'
    ? buildLatinPuzzle({ world, params, settings })
    : buildAssignPuzzle({ world, assignment, params, settings });
}

function buildAssignPuzzle({ world, assignment, params, settings }) {
  const { seed, mechaniek } = settings;
  const specRng = makeRng(`${seed}:spec`);
  const spec = assignment.buildSpec(world, params, specRng, mechaniek);
  const gen = generateAssignment(spec, seed, params, assignment.forced);

  const ctx = makeCtx(spec, emptyCols(spec));
  const introClues = gen.clues.filter((c) => c.intro);
  const clues = gen.clues
    .filter((c) => !c.intro)
    .map((c, i) => ({
      n: i + 1,
      text: cap(phraseClue(c, ctx)),
      kind: c.kind,
      // De eigennamen in deze aanwijzing. Een herschreven versie moet ze alle
      // woordelijk bevatten, anders klopt de logica niet meer.
      names: clueNames(c, spec),
    }));

  const sRng = makeRng(`${seed}:slachtoffer`);
  const slachtoffer = sRng.pick(world.victims);
  const qRng = makeRng(`${seed}:vraag`);
  const question = assignment.question(spec, gen.solution, introClues, world, qRng);
  const intro = assignment.intro(world, spec, gen.solution, introClues, slachtoffer);

  return {
    kind: 'assign',
    id: puzzleId(settings),
    seed,
    settings: { ...settings },
    title: `${world.name}: ${assignment.name}`,
    world: { id: world.id, name: world.name, icon: world.icon, accent: world.accent },
    opdracht: { id: assignment.id, name: assignment.name },
    mechaniek,
    niveau: Number(settings.niveau),
    niveauLabel: params.label,
    depth: gen.depth,
    intro,
    question,
    anchor: { id: spec.anchor.id, name: spec.anchor.name, items: spec.anchor.items.map((i) => i.name) },
    cats: spec.cats.map((c) => ({
      id: c.id,
      name: c.name,
      ordered: !!c.ordered,
      items: c.items.map((i) => i.name),
    })),
    graph: spec.graph
      ? {
          n: spec.graph.n,
          rows: spec.graph.rows,
          cols: spec.graph.cols,
          layout: spec.graph.layout,
          edges: spec.graph.edgeList,
        }
      : null,
    clues,
    solution: gen.solution,
    _grade: gen.grade,
    _spec: spec,
    _rawClues: gen.clues,
  };
}

function buildLatinPuzzle({ world, params, settings }) {
  const { seed } = settings;
  const n = Math.max(4, params.slots);
  const rng = makeRng(`${seed}:latijn`);
  const rows = rng.sample(world.places, n);
  const cols = world.times.slice(0, n);
  const symbols = rng.sample(world.persons, n);
  const { full, givens, depth } = generateLatin(n, rng, params);

  const open = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (givens[r][c] == null) open.push([r, c]);
  const [qr, qc] = open.length ? rng.pick(open) : [0, 0];

  return {
    kind: 'latin',
    id: puzzleId(settings),
    seed,
    settings: { ...settings },
    title: `${world.name}: Wie was waar wanneer?`,
    world: { id: world.id, name: world.name, icon: world.icon, accent: world.accent },
    opdracht: { id: 'reconstructie', name: 'Wie was waar wanneer?' },
    mechaniek: 'latin',
    niveau: Number(settings.niveau),
    niveauLabel: params.label,
    depth,
    intro: `${world.reconLead} Iedereen was precies één keer op elke plek, en op elk moment op precies één plek.`,
    question: {
      text: `Wie was er in ${rows[qr]} tijdens ${cols[qc]}?`,
      answer: symbols[full[qr][qc]],
      cell: [qr, qc],
    },
    rows,
    cols,
    symbols,
    givens,
    full,
    clues: [],
  };
}

// Alle itemnamen waar een aanwijzing naar verwijst.
function clueNames(clue, spec) {
  const byId = new Map([[spec.anchor.id, spec.anchor]]);
  for (const c of spec.cats) byId.set(c.id, c);
  const out = [];
  for (const key of ['a', 'b', 'c2']) {
    const ref = clue[key];
    if (ref) out.push(byId.get(ref.c).items[ref.i].name);
  }
  return out;
}

function buildKamerPuzzle({ world, settings }) {
  const { seed, niveau } = settings;
  const params = kamerParams(niveau);
  // De wereld bepaalt hoeveel verschillende meubels en kamers er benoembaar
  // zijn; meer dan dat kan de motor niet gebruiken.
  const gen = genereerKamerpuzzel(seed, {
    ...params,
    kamers: Math.min(params.kamers, world.places.length),
    maxMeubels: world.meubels.length,
  });
  const rng = makeRng(`${seed}:kamerwoorden`);

  // Elke figuur op het bord krijgt een naam. Een van hen is het slachtoffer:
  // die staat niet in de verdachtenlijst, maar wel op het bord - want waar
  // het lichaam ligt moet je zelf uitpuzzelen.
  const aantal = gen.rooster.n;
  const namen = rng.sample(world.persons, aantal);
  const slachtofferNaam = rng.pick(world.victims);
  namen[gen.slachtofferIdx] = slachtofferNaam;

  const kamerNamen = rng.sample(world.places, gen.rooster.kamers);
  const meubelNamen = rng.sample(world.meubels, gen.rooster.meubelAantal);
  const woorden = { personen: namen, kamerNamen, meubelNamen, slachtofferNaam };

  const clues = gen.aanwijzingen.map((c, i) => ({
    n: i + 1,
    text: zinVoor(c, woorden),
    kind: c.soort,
    names: namenIn(c, woorden),
  }));

  return {
    kind: 'kamer',
    id: puzzleId(settings),
    seed,
    settings: { ...settings },
    title: `${world.name}: Wie stond er alleen?`,
    world: { id: world.id, name: world.name, icon: world.icon, accent: world.accent },
    opdracht: { id: 'dader', name: 'Wie deed het?' },
    mechaniek: 'kamer',
    niveau: Number(niveau),
    niveauLabel: levelParams(niveau).label,
    depth: gen.graad.opgelost ? 1 : 2,
    intro: `${world.lead} Niemand weet meer wie waar stond, en zelfs waar ${slachtofferNaam} lag is onduidelijk. Zet iedereen op zijn plek: wie dan als enige bij ${slachtofferNaam} in de kamer blijkt te staan, is de dader.`,
    question: {
      text: `Wie stond er als enige bij ${slachtofferNaam} in dezelfde kamer?`,
      answer: namen[gen.dader],
    },
    // het bord
    n: gen.rooster.n,
    kamerVan: gen.rooster.kamerVan,
    kamerNamen,
    meubelOp: gen.rooster.meubelOp,
    meubelNamen,
    vrij: gen.rooster.vrij,
    personen: namen,
    slachtofferIdx: gen.slachtofferIdx,
    slachtofferNaam,
    oplossing: gen.plaats,
    dader: gen.dader,
    clues,
    _rooster: gen.rooster,
    _ruwe: gen.aanwijzingen,
  };
}

export function puzzleId(settings) {
  const { opdracht, wereld, mechaniek, niveau, seed } = settings;
  return `${opdracht}.${wereld}.${mechaniek}.${niveau}.${seed}`;
}

export function parsePuzzleId(id) {
  const [opdracht, wereld, mechaniek, niveau, ...rest] = id.split('.');
  return { opdracht, wereld, mechaniek, niveau: Number(niveau), seed: rest.join('.') };
}
