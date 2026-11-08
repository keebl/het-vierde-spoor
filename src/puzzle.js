// Van instellingen naar een speelbare puzzel. Dit is de enige plek die
// content, motor en formulering bij elkaar brengt.

import { WORLD_BY_ID, WORLDS } from './content/worlds.js';
import { ASSIGNMENT_BY_ID } from './content/assignments.js';
import { levelParams } from './engine/difficulty.js';
import { generateAssignment } from './engine/generate.js';
import { makeCtx, emptyCols } from './engine/assign.js';
import { phraseClue } from './engine/clues.js';
import { generateLatin, latinDepth } from './engine/latin.js';
import { genereerKamerpuzzel } from './engine/generate-rooms.js';
import { kamerParams } from './engine/difficulty.js';
import { zinVoor, namenIn } from './content/rooms-text.js';
import { soortVan, meubelsVoor, vormVan } from './content/kamersoorten.js';
import { makeRng } from './engine/rng.js';
import { ZAKEN } from './content/zaken.js';
import { geslachtVan } from './content/namen.js';

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

  // De moeilijkheidsgraad is een belofte: niveau 1 tot 3 is op te lossen door
  // alleen door te strepen, niveau 4 en 5 vragen een aanname die je daarna
  // weerlegt. Haalt een puzzel die belofte niet, dan zetten we dezelfde
  // instellingen nog eens op met een andere greep uit de wereld - nog steeds
  // voorspelbaar, want de variant zit in de seed.
  let spec = null;
  let gen = null;
  for (let variant = 0; variant < 6; variant++) {
    const staart = variant ? `#v${variant}` : '';
    const proefSpec = assignment.buildSpec(
      world, params, makeRng(`${seed}:spec${staart}`), mechaniek
    );
    const proef = generateAssignment(proefSpec, `${seed}${staart}`, params, assignment.forced);
    spec = proefSpec;
    gen = proef;
    const belofte = params.style === 'shallow' ? proef.depth === 1 : proef.depth > 1;
    if (belofte) break;
  }

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

  // Wat de inleiding weggeeft, is net zo goed een aanwijzing: het beperkt de
  // oplossing even hard. Als het alleen in het verhaal staat, telt een
  // puzzelaar de aanwijzingen en komt hij er een tekort - en dan lijkt de
  // puzzel niet rond te komen. Dus zetten we het er als feit bij.
  const feiten = introClues.map((c) => cap(phraseClue(c, ctx)));

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
    feiten,
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
  const { full, givens, aanwijzingen, depth } = generateLatin(n, rng, params);

  const voor = world.tijdVoorzetsel ?? 'om';
  const zin = (c) => {
    if (c.soort === 'niet') return `${symbols[c.s]} was ${voor} ${cols[c.c]} niet in ${rows[c.r]}.`;
    if (c.soort === 'voor') return `In ${rows[c.r]} was ${symbols[c.a]} er eerder dan ${symbols[c.b]}.`;
    return `In ${rows[c.r]} volgden ${symbols[c.a]} en ${symbols[c.b]} elkaar direct op.`;
  };
  const namenVan = (c) => (c.soort === 'niet'
    ? [symbols[c.s], rows[c.r], cols[c.c]]
    : [symbols[c.a], symbols[c.b], rows[c.r]]);

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
      text: `Wie was er ${voor} ${cols[qc]} in ${rows[qr]}?`,
      answer: symbols[full[qr][qc]],
      cell: [qr, qc],
    },
    rows,
    cols,
    symbols,
    givens,
    full,
    // De ruwe aanwijzingen, zodat de keuring de uniciteit mét aanwijzingen
    // kan narekenen in plaats van alleen met de gegeven vakjes.
    _ruweLatin: aanwijzingen,
    clues: aanwijzingen.map((c, i) => ({
      n: i + 1,
      text: zin(c),
      kind: c.soort,
      names: namenVan(c),
    })),
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

// ---------------------------------------------------- namen die kloppen
//
// De generator tekent eerst een plattegrond en plakt er daarna namen op.
// Deden we dat willekeurig, dan heette een vierkante klodder van tien
// vakjes "het verzonken bruggetje" en een lange strook "de droge put".
//
// Daarom meten we elke kamer eerst op - hoeveel vakjes, en hoe langgerekt
// is zijn omhullende rechthoek - en delen we de namen uit naar vorm: de
// langste kamers krijgen de namen van stroken (gang, trap, pad, brug), de
// grootste die van zalen, de kleinste die van putten en nissen. Namen
// zonder uitgesproken vorm vullen de rest.
function meetKamers(rooster) {
  const { n, kamerVan, kamers } = rooster;
  const maten = Array.from({ length: kamers }, (_, k) => ({
    k, cellen: 0, minR: n, maxR: -1, minC: n, maxC: -1,
  }));
  for (let cel = 0; cel < n * n; cel++) {
    const m = maten[kamerVan[cel]];
    if (!m) continue;
    const r = Math.floor(cel / n);
    const c = cel % n;
    m.cellen += 1;
    if (r < m.minR) m.minR = r;
    if (r > m.maxR) m.maxR = r;
    if (c < m.minC) m.minC = c;
    if (c > m.maxC) m.maxC = c;
  }
  for (const m of maten) {
    const hoog = m.maxR - m.minR + 1;
    const breed = m.maxC - m.minC + 1;
    m.lang = Math.max(hoog, breed) / Math.max(1, Math.min(hoog, breed));
  }
  return maten;
}

function noemKamers(rooster, voorraad, rng) {
  const maten = meetKamers(rooster);
  const emmer = { smal: [], groot: [], klein: [], vrij: [] };
  for (const naam of rng.shuffle(voorraad)) emmer[vormVan(naam)].push(naam);

  const namen = new Array(maten.length);
  let open = maten.slice();
  const deel = (vorm, sorteer, hoeveel) => {
    open.sort(sorteer);
    const pak = Math.max(0, Math.min(hoeveel, emmer[vorm].length, open.length));
    for (let i = 0; i < pak; i++) namen[open[i].k] = emmer[vorm].shift();
    open = open.slice(pak);
  };

  // Een strook heet alleen naar een strook als er ook echt een strook ligt.
  // 1.8 is gemeten: daaronder leest een kamer als een vlak, daarboven als
  // een gang.
  const stroken = open.filter((m) => m.lang >= 1.8).length;
  deel('smal', (a, b) => b.lang - a.lang || a.k - b.k, stroken);
  const over = open.length;
  deel('groot', (a, b) => b.cellen - a.cellen || a.k - b.k, Math.ceil(over * 0.4));
  deel('klein', (a, b) => a.cellen - b.cellen || a.k - b.k, Math.ceil(over * 0.3));
  // Wat overblijft krijgt een naam die overal past. Raken die op, dan komen
  // de overgebleven zaal- en hoeknamen alsnog aan de beurt - maar niet
  // lukraak: de grootste kamers die nog open liggen krijgen de zaalnamen en
  // de kleinste de hoeknamen, zodat een zaal nooit kleiner uitvalt dan een
  // nis. Strooknamen die over zijn gaan naar de langste kamers die er nog
  // zijn, en dus nooit naar een vlak terwijl er nog een gang ligt.
  const tekort = open.length - (emmer.vrij.length + emmer.groot.length + emmer.klein.length);
  if (tekort > 0) deel('smal', (a, b) => b.lang - a.lang || a.k - b.k, tekort);
  open.sort((a, b) => b.cellen - a.cellen || a.k - b.k);
  const rest = [...emmer.groot, ...emmer.vrij, ...emmer.smal, ...emmer.klein];
  for (const m of open) namen[m.k] = rest.shift();
  return namen;
}



function buildKamerPuzzle({ world, settings }) {
  const { seed, niveau } = settings;
  const params = kamerParams(niveau);
  // De wereld bepaalt hoeveel verschillende meubels en kamers er benoembaar
  // zijn; meer dan dat kan de motor niet gebruiken.
  // Hoeveel meubelstukken er hoogstens op het bord mogen.
  //
  // Dit stond op twintig, en dat was een gok. De namen worden per soort
  // ruimte uitgedeeld en een naam wordt maar één keer gebruikt, dus een
  // bord dat toevallig veel meubels in ruimtes van één soort legt, raakt
  // door die soort heen - en dan valt de hele puzzel om met "geen
  // meubilair meer voor zaal". Dat gebeurde bij het zwembad en de
  // dierentuin, maar het kon overal.
  //
  // Dus vragen we er nooit meer dan de krapste soort in deze wereld er
  // kan leveren. Dat is twee of drie minder dan voorheen; een bord met
  // achttien meubelstukken is geen leger bord dan een met twintig.
  const soortenHier = new Set(
    [...world.places, ...(world.plekkenXL ?? [])].map(soortVan),
  );
  const krapste = Math.min(
    ...[...soortenHier].map((s) => meubelsVoor(s, world.id).flat().length),
  );
  const gen = genereerKamerpuzzel(seed, {
    ...params,
    kamers: Math.min(params.kamers, world.places.length + (world.plekkenXL?.length ?? 0)),
    maxMeubels: Math.min(20, krapste),
  });
  const rng = makeRng(`${seed}:kamerwoorden`);

  // Elke figuur op het bord krijgt een naam. Een van hen is het slachtoffer:
  // die staat niet in de verdachtenlijst, maar wel op het bord - want waar
  // het lichaam ligt moet je zelf uitpuzzelen.
  const aantal = gen.rooster.n;
  // Wie staan er op het bord?
  //
  // Hier werd een greep gedaan uit de twaalf namen van de wereld. Bij vijf
  // bij vijf trek je er dan vijf uit twaalf, en dan kom je Albert, Bep en
  // Cor om de haverklap tegen - er zijn simpelweg niet genoeg namen om een
  // avond puzzelen mee te vullen.
  //
  // Nu gaat het in twee stappen: eerst de beginletters, dan per letter een
  // naam. Dat moet in die volgorde, want de beginletter is wat op de
  // penning staat en elke figuur hoort er een eigen te hebben (regel: alle
  // figuren hebben een eigen beginletter). Met twee namen achter elke
  // letter zijn dat bij vijf bij vijf geen twaalf maar honderdduizenden
  // mogelijke bezettingen.
  const vijver = [...world.persons, ...(world.personenXL ?? []), ...(world.personenExtra ?? [])];
  const perLetter = new Map();
  for (const naam of vijver) {
    const letter = naam.charAt(0).toUpperCase();
    if (!perLetter.has(letter)) perLetter.set(letter, []);
    perLetter.get(letter).push(naam);
  }
  const namen = rng
    .sample([...perLetter.keys()], aantal)
    .map((letter) => rng.pick(perLetter.get(letter)));
  // Het slachtoffer staat tussen de verdachten op het bord, met zijn
  // beginletter op een penning. Die letter moet dus van hem alleen zijn:
  // daarom een eigen namenlijst met beginletters die de verdachten niet
  // gebruiken (M, N en O; de verdachten gaan van A tot L en van P tot S).
  const slachtofferNaam = rng.pick(world.slachtoffers);
  namen[gen.slachtofferIdx] = slachtofferNaam;
  // Wat het slachtoffer was: de conciërge, de nachtzuster, de havenmeester.
  // Uit de lijst die bij zijn naam past, want anders staat er "Marieke is
  // vermoord. De buurman van nummer zes werd gevonden" - en dat stond er.
  // Zie `rollen` in worlds.js en GESLACHT_VAN in namen.js.
  const slachtofferRol = rng.pick(
    world.rollen?.[geslachtVan(slachtofferNaam)] ?? world.victims,
  );

  // Wat voor zaak het is: een moord, een verdwijning of een diefstal. Dat
  // verandert niets aan de logica - de motor zoekt nog steeds wie er met
  // z'n tweeën in één kamer staat - alleen aan de woorden eromheen en aan
  // het merk dat die figuur op het bord krijgt. Zie src/content/zaken.js.
  //
  // Met een eigen trekking, zodat de namen en de kamers hierboven niet
  // verschuiven: anders geeft een bestaande link ineens een ander bord.
  const zRng = makeRng(`${seed}:zaak`);
  const zaak = zRng.pick(ZAKEN);
  const zin = zRng.pick(zaak.opdracht);

  const kamerNamen = noemKamers(
    gen.rooster,
    gen.rooster.kamers <= world.places.length ? world.places : [...world.places, ...(world.plekkenXL ?? [])],
    rng,
  );
  // Een meubelstuk krijgt zijn naam van de kamer waarin het staat: in de
  // keuken een koelkast, in het grafvertrek een sarcofaag. Namen blijven
  // binnen een puzzel uniek, want de aanwijzingen verwijzen ernaar.
  const meubelNamen = [];
  const meubelIconen = [];
  const gebruikt = new Set();
  const voorraad = new Map();
  for (let cel = 0; cel < gen.rooster.n * gen.rooster.n; cel++) {
    const mi = gen.rooster.meubelOp[cel];
    if (mi == null) continue;
    const soort = soortVan(kamerNamen[gen.rooster.kamerVan[cel]]);
    if (!voorraad.has(soort)) {
      const [eigen, verwant] = meubelsVoor(soort, world.id);
      // Eerst alles wat in deze soort ruimte hoort, daarna pas wat in een
      // verwante ruimte past. Een keuken levert nooit meubilair voor een bos.
      voorraad.set(soort, [...rng.shuffle(eigen), ...rng.shuffle(verwant)]);
    }
    const keuze = voorraad.get(soort).find(([naam]) => !gebruikt.has(naam));
    if (!keuze) throw new Error(`geen meubilair meer voor ${soort}`);
    gebruikt.add(keuze[0]);
    meubelNamen[mi] = keuze[0];
    meubelIconen[mi] = keuze[1];
  }
  // Hoe de wereld een ruimte noemt, met voorzetsel en al: "in dezelfde
  // kamer", "op dezelfde plek", "in hetzelfde gewelf".
  const zelfde = (world.sameRoom ?? 'in dezelfde kamer als').replace(/ als$/, '');

  const woorden = {
    personen: namen,
    kamerNamen,
    meubelNamen,
    slachtofferNaam,
    zelfde,
    randZin: world.randZin,
    hoekZin: world.hoekZin,
  };

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
    opdracht: { id: 'dader', name: `Wie is ${zaak.antwoordwoord}?` },
    mechaniek: 'kamer',
    niveau: Number(niveau),
    niveauLabel: levelParams(niveau).label,
    depth: gen.graad.opgelost ? 1 : 2,
    intro: `${world.lead} ${zin(slachtofferNaam, slachtofferRol, zelfde, world.gestolen)}`,
    question: {
      text: zaak.vraag(slachtofferNaam, zelfde),
      answer: namen[gen.dader],
    },
    // Welke zaak het is, zodat het bord het merk kan tekenen en de
    // spelregels de goede zin kunnen laten zien.
    zaak: {
      id: zaak.id, merk: zaak.merk, rolwoord: zaak.rolwoord,
      antwoordwoord: zaak.antwoordwoord, regel: zaak.regel,
    },
    // het bord
    n: gen.rooster.n,
    kamerVan: gen.rooster.kamerVan,
    kamerNamen,
    meubelOp: gen.rooster.meubelOp,
    meubelNamen,
    meubelIconen,
    vrij: gen.rooster.vrij,
    personen: namen,
    slachtofferIdx: gen.slachtofferIdx,
    slachtofferNaam,
    oplossing: gen.plaats,
    dader: gen.dader,
    clues,
    // De woorden waarmee een aanwijzing tot een zin wordt. De speler heeft
    // ze nodig: als hij om een hint vraagt, krijgt hij een extra aanwijzing
    // die ter plekke geformuleerd moet worden.
    woorden,
    _rooster: gen.rooster,
    _ruwe: gen.aanwijzingen,
  };
}

// Welk decor hoort bij deze seed?
//
// Je kiest het genre niet meer zelf. Maar "dan maar willekeurig bij elke
// klik" breekt iets anders: typ je een seed opnieuw in, dan hoor je dezelfde
// puzzel terug te krijgen, en dat lukt niet als het decor ondertussen
// omgegooid wordt. Dus volgt de wereld uit de seed. Een nieuwe seed geeft
// een nieuw decor, dezelfde seed altijd hetzelfde.
export function wereldVoorSeed(seed) {
  let som = 0;
  for (let i = 0; i < String(seed).length; i++) {
    som = (som * 31 + String(seed).charCodeAt(i)) % 1000003;
  }
  return WORLDS[som % WORLDS.length].id;
}

export function puzzleId(settings) {
  const { opdracht, wereld, mechaniek, niveau, seed } = settings;
  return `${opdracht}.${wereld}.${mechaniek}.${niveau}.${seed}`;
}

export function parsePuzzleId(id) {
  const [opdracht, wereld, mechaniek, niveau, ...rest] = id.split('.');
  // Een link met niveau 9 moet niet "Monsterlijk (9/6)" opleveren.
  const begrensd = Math.min(6, Math.max(1, Number(niveau) || 1));
  return { opdracht, wereld, mechaniek, niveau: begrensd, seed: rest.join('.') };
}
