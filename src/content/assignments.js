// Opdrachten: wat moet je uitzoeken? Elke opdracht bepaalt welke rollen er
// in de puzzel zitten, hoe die rollen zich in het Nederlands uitdrukken,
// welk feit je gratis krijgt (de inleiding) en wat de vraag is.
//
// "Moord" is hier dus een opdracht naast andere, geen aanname van de motor.

import { buildGraph } from '../engine/graph.js';

// ------------------------------------------------------------------ rollen
// objectRank bepaalt wie onderwerp en wie lijdend voorwerp wordt in een zin.
// Lage rank = hoort vooraan ("Mevrouw Dufour had ..."), hoge rank = achteraan.

const rolePerson = (items, name = 'Verdachte') => ({
  id: 'person',
  name,
  items,
  objectRank: 0,
  subj: (n) => n,
  where: (n) => `waar ${n} is`,
  pos: (s, o) => `${s} was samen met ${o}.`,
  neg: (s, o) => `${s} was niet samen met ${o}.`,
});

const roleObject = (items, name = 'Voorwerp') => ({
  id: 'object',
  name,
  items,
  objectRank: 4,
  subj: (o) => `degene die ${o} bij zich had`,
  where: (o) => `waar ${o} is`,
  pos: (s, o) => `${s} had ${o} bij zich.`,
  neg: (s, o) => `${s} had ${o} niet bij zich.`,
});

// Een spoor wordt niet gedragen, het ligt ergens. Dus niet "had bij zich"
// maar "in dezelfde ruimte als" - dat klopt voor mensen en voor dingen.
const roleTrace = (items, name, sameRoom) => ({
  id: 'object',
  name,
  items,
  objectRank: 4,
  subj: (o) => o,
  where: (o) => `waar ${o} ligt`,
  pos: (s, o) => `${s} bevindt zich in ${sameRoom} ${o}.`,
  neg: (s, o) => `${s} bevindt zich niet in ${sameRoom} ${o}.`,
});

const rolePlace = (items, name = 'Plek') => ({
  id: 'place',
  name,
  items,
  objectRank: 6,
  subj: (p) => `wie zich in ${p} bevond`,
  where: (p) => p,
  pos: (s, p) => `${s} bevond zich in ${p}.`,
  neg: (s, p) => `${s} bevond zich niet in ${p}.`,
});

// Dezelfde plekken, maar nu als ankercategorie (de rijen van de puzzel).
const rolePlaceAnchor = (items, name = 'Plek') => ({
  ...rolePlace(items, name),
  subj: (p) => p,
  where: (p) => p,
  pos: (s, p) => `${s} bevindt zich in ${p}.`,
  neg: (s, p) => `${s} bevindt zich niet in ${p}.`,
});

const roleTime = (items, unit, name = 'Moment') => ({
  id: 'time',
  name,
  items,
  ordered: true,
  objectRank: 8,
  subj: (t) => `wie er om ${t} was`,
  where: (t) => `waar het om ${t} was`,
  pos: (s, t) => `${s} was er om ${t}.`,
  neg: (s, t) => `${s} was er niet om ${t}.`,
  cmp: (a, b) => `${a} was er eerder dan ${b}.`,
  gap: (a, b, d) =>
    `Tussen ${a} en ${b} zit precies ${d} ${d === 1 ? unit.one : unit.many}.`,
});

const roleHidden = (items, sameRoom, name = 'Wat er ligt') => ({
  id: 'hidden',
  name,
  items,
  objectRank: 2,
  subj: (f) => f,
  where: (f) => `waar ${f} is`,
  pos: (s, o) => `${s} bevindt zich in ${sameRoom} ${o}.`,
  neg: (s, o) => `${s} bevindt zich niet in ${sameRoom} ${o}.`,
});

const pick = (pool, n, rng) => rng.sample(pool, n).map((name, i) => ({ id: `i${i}`, name }));
const take = (pool, n) => pool.slice(0, n).map((name, i) => ({ id: `i${i}`, name }));

function withGraph(spec, world, rng) {
  const g = buildGraph(spec.anchor.items.length, rng);
  g.phrAdj = world.map.adj;
  g.phrNotAdj = world.map.notAdj;
  g.phrHops = world.map.hops;
  g.phrDegree = world.map.degree;
  spec.graph = g;
  return spec;
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// --------------------------------------------------------------- opdrachten

export const ASSIGNMENTS = [
  {
    id: 'dader',
    name: 'Wie deed het?',
    short: 'Dader',
    blurb: 'Een misdrijf, een handvol verdachten, en genoeg tegenstrijdigheden om ze een voor een af te strepen.',
    mechanics: ['kamer', 'grid', 'map'],
    buildSpec(world, params, rng, mechanic) {
      const n = params.slots;
      if (mechanic === 'map') {
        const spec = {
          anchor: rolePlaceAnchor(pick(world.places, n, rng), cap(world.roomWord)),
          cats: [
            rolePerson(pick(world.persons, n, rng)),
            roleObject(pick(world.objects, n, rng)),
          ],
        };
        // Geen momentcategorie op een kaart: een ruimte heeft geen tijdstip.
        // De plattegrond zelf levert hier de extra moeilijkheid.
        return withGraph(spec, world, rng);
      }
      const spec = {
        anchor: rolePerson(pick(world.persons, n, rng)),
        cats: [
          roleObject(pick(world.objects, n, rng)),
          rolePlace(pick(world.places, n, rng)),
        ],
      };
      if (params.cats >= 3) spec.cats.push(roleTime(take(world.times, n), world.timeUnit));
      return spec;
    },
    // Het misdrijf zelf levert een feit: waar het gebeurde en wat er lag.
    forced(spec, sol, rng) {
      const n = spec.anchor.items.length;
      const slot = rng.int(n);
      const objCat = 'object';
      const placeId = spec.anchor.id === 'place' ? spec.anchor.id : 'place';
      const objItem = sol[objCat][slot];
      const placeItem = placeId === spec.anchor.id ? slot : sol[placeId][slot];
      return [{
        kind: 'same',
        a: { c: objCat, i: objItem },
        b: { c: placeId, i: placeItem },
        intro: true,
        slot,
      }];
    },
    question(spec, sol, forced, world) {
      const slot = forced[0].slot;
      const personCol = spec.anchor.id === 'person' ? null : sol.person;
      const idx = personCol ? personCol[slot] : slot;
      const cat = spec.anchor.id === 'person' ? spec.anchor : spec.cats.find((c) => c.id === 'person');
      return {
        text: 'Wie is de dader?',
        catId: 'person',
        slot,
        answer: cat.items[idx].name,
      };
    },
    intro(world, spec, sol, forced, slachtoffer) {
      const f = forced[0];
      const objName = spec.cats.find((c) => c.id === 'object').items[f.a.i].name;
      const placeCat = spec.anchor.id === 'place' ? spec.anchor : spec.cats.find((c) => c.id === 'place');
      const placeName = placeCat.items[f.b.i].name;
      return `${world.lead} ${slachtoffer.charAt(0).toUpperCase()}${slachtoffer.slice(1)} werd aangetroffen in ${placeName}, met ${objName} ernaast. Wie daar toen was, is de dader.`;
    },
  },

  {
    id: 'vinden',
    name: 'Waar is het?',
    short: 'Vinden',
    blurb: 'Geen slachtoffer, wel iets dat verborgen is. Je leidt uit de omgeving af waar het moet zitten.',
    mechanics: ['map', 'grid'],
    buildSpec(world, params, rng, mechanic) {
      const n = params.slots;
      const spec = {
        anchor: rolePlaceAnchor(pick(world.places, n, rng), cap(world.roomWord)),
        cats: [
          roleHidden(take(world.hidden, n), world.sameRoom),
          roleTrace(pick(world.objects, n, rng), 'Spoor', world.sameRoom),
        ],
      };
      if (params.cats >= 3) spec.cats.push(rolePerson(pick(world.persons, n, rng), 'Wie er was'));
      return mechanic === 'map' ? withGraph(spec, world, rng) : spec;
    },
    forced: null,
    question(spec, sol, forced, world) {
      const target = 0; // hidden[0] is altijd het gezochte
      const slot = sol.hidden.indexOf(target);
      return {
        text: `Waar bevindt zich ${spec.cats.find((c) => c.id === 'hidden').items[target].name}?`,
        catId: spec.anchor.id,
        slot,
        answer: spec.anchor.items[slot].name,
      };
    },
    intro(world, spec, sol) {
      const target = spec.cats.find((c) => c.id === 'hidden').items[0].name;
      return `${world.findLead} Het is op precies één van deze plekken. Welke, dat volgt uit de aanwijzingen.`;
    },
  },

  {
    id: 'toewijzing',
    name: 'Wie heeft wat?',
    short: 'Toewijzing',
    blurb: 'Zonder misdrijf: een gezelschap, hun bezittingen en hun plekken door elkaar.',
    mechanics: ['grid'],
    buildSpec(world, params, rng) {
      const n = params.slots;
      const spec = {
        anchor: rolePerson(pick(world.persons, n, rng), 'Persoon'),
        cats: [
          roleObject(pick(world.objects, n, rng), 'Meegebracht'),
          rolePlace(pick(world.places, n, rng)),
        ],
      };
      if (params.cats >= 3) spec.cats.push(roleTime(take(world.times, n), world.timeUnit, 'Aangekomen'));
      return spec;
    },
    forced: null,
    question(spec, sol, forced, world, rng) {
      const objCat = spec.cats.find((c) => c.id === 'object');
      const item = rng.int(spec.anchor.items.length);
      const slot = sol.object.indexOf(item);
      return {
        text: `Wie had ${objCat.items[item].name} bij zich?`,
        catId: spec.anchor.id,
        slot,
        answer: spec.anchor.items[slot].name,
      };
    },
    intro(world) {
      return `${world.assignLead} Los het raster op en de rest volgt.`;
    },
  },

  {
    id: 'reconstructie',
    name: 'Wie was waar wanneer?',
    short: 'Reconstructie',
    blurb: 'Een tijdlijn met gaten: iedereen komt op elke plek en op elk moment precies één keer voor.',
    mechanics: ['latin'],
    buildSpec: null,
    forced: null,
  },
];

export const ASSIGNMENT_BY_ID = new Map(ASSIGNMENTS.map((a) => [a.id, a]));

export const MECHANICS = [
  { id: 'kamer', name: 'Speurdoku', icon: '▣', blurb: 'Zet de figuren zelf op de plattegrond: één per rij, één per kolom, zoals bij sudoku.' },
  { id: 'grid', name: 'Kruisverhoor', icon: '▦', blurb: 'Kruisjes en vinkjes in een raster tot er een naam overblijft.' },
  { id: 'map', name: 'Rondgang', icon: '🗺', blurb: 'Een kaart met deuren; de aanwijzingen gaan over wat waaraan grenst.' },
  { id: 'latin', name: 'Dienstrooster', icon: '◧', blurb: 'Rijen zijn plekken, kolommen zijn momenten, en iedereen komt er één keer in voor.' },
];

export const MECHANIC_BY_ID = new Map(MECHANICS.map((m) => [m.id, m]));
