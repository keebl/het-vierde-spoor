// De speler. Houdt de markeringen van de speler bij, tekent het bord dat bij
// de mechaniek hoort, en kan controleren, hinten en de oplossing geven.

import { el, renderBlok, renderMap, renderLatin, latinLegenda, cellKey } from './boards.js';
import { blokkenVan } from './blokken.js';
import {
  loadProgress, saveProgress, clearProgress, randAan, zetRand,
  paneelOpen, zetPaneel, kruisjesVanzelf, zetKruisjesVanzelf,
} from './state.js';
import { MECHANIC_BY_ID } from '../content/assignments.js';
import { spelregelsVan } from '../content/spelregels.js';
import { genreStijl } from './genre.js';
import { CATALOG, catalogSettings } from '../content/catalog.js';
import { puzzleId } from '../puzzle.js';
import { sceneVoor } from './scenes.js';
import { renderKamerbord, renderLegenda, PENNING } from './board-rooms.js';
import { portretElement, slachtofferElement } from './personenkunst-geschilderd.js';
import { geslachtVan } from '../content/namen.js';
import { LEVEL_IDS } from '../engine/difficulty.js';
import { telwoord, hoofdletter } from '../content/woorden.js';
import { extraAanwijzing, bekendAlsAanwijzingen } from '../engine/generate-rooms.js';
import { zinVoor } from '../content/rooms-text.js';
import { makeRng } from '../engine/rng.js';

export function renderPlayer(puzzle, mount) {
  const saved = loadProgress(puzzle.id) ?? {};
  const state = {
    marks: saved.marks ?? (puzzle.kind === 'assign' ? emptyMarks(puzzle) : {}),
    // kamerraster: welke persoon staat op welk vakje, plus de kruisjes die
    // de speler zelf zet om een vakje uit te sluiten.
    plaats: saved.plaats ?? {},
    kruis: new Set(saved.kruis ?? []),
    schets: saved.schets ?? {},
    schetsAan: false,
    gekozen: 0,
    plaatsVanCel(cel) {
      for (const [p, c] of Object.entries(this.plaats)) if (c === cel) return Number(p);
      return null;
    },
    struck: new Set(saved.struck ?? []),
    note: null,
    wrong: new Set(),
    // Na een controle: welke vakjes goed staan en welke niet. Het bord leest
    // deze twee. Ze heetten eerder allebei 'wrong', en het kamerbord keek
    // naar 'fout' - dat bestond niet, dus kwam er na "drie kloppen niet"
    // geen enkele markering op het bord te staan. Daar was de controle dus
    // een mededeling in plaats van een aanwijzing.
    fout: new Set(),
    goed: new Set(),
    // Hints zijn extra aanwijzingen. Ze staan hier als ruwe aanwijzing en
    // niet als zin, want de zin kan de puzzel altijd opnieuw maken en de
    // ruwe vorm is wat de volgende hint nodig heeft om zichzelf niet te
    // herhalen. Ze blijven bewaard: wie terugkomt is zijn hints niet kwijt.
    extra: Array.isArray(saved.extra) ? saved.extra : [],
    solved: !!saved.solved,
    // Wie de oplossing opvraagt heeft hem niet zelf gevonden. Dat houden we
    // apart bij, zodat de lijst niet doet alsof je hem hebt opgelost.
    onthuld: !!saved.onthuld,
  };

  const persist = () => {
    saveProgress(puzzle.id, {
      marks: state.marks,
      plaats: state.plaats,
      kruis: [...state.kruis],
      schets: state.schets,
      struck: [...state.struck],
      extra: state.extra,
      solved: state.solved,
      onthuld: state.onthuld,
      titel: puzzle.title,
    });
  };

  mount.replaceChildren();
  mount.append(head(puzzle));

  const boards = el('div', { class: 'boards' });
  const notes = el('div');
  const clueCol = el('div');

  // Eén kolom, in de volgorde waarin je werkt: eerst het bord, dan de
  // legenda, dan de aanwijzingen. De aanwijzingen stonden in een smalle
  // kolom naast het bord; nu staan ze eronder, zoals gevraagd.
  const play = el('div', { class: 'play' }, [boards, clueCol, notes]);
  mount.append(play);

  const draw = () => {
    const aantal = puzzle.clues.length + (state.extra?.length ?? 0);
    clueCol.replaceChildren(klepje(
      'aanwijzingen', `Aanwijzingen (${aantal})`, true, [cluePanel(puzzle, state, draw, persist)],
    ));
    boards.replaceChildren(...boardNodes(puzzle, state, onCell, toonMeubel, actions));
    notes.replaceChildren(toolbar(puzzle, state, actions), noteNode(state));
  };

  // Tikken op een meubelstuk: de naam eronder. Aanwijzen met de muis geeft
  // hem als tooltip (zie het klikvlak in board-rooms.js), maar op een
  // telefoon bestaat aanwijzen niet.
  function toonMeubel(naam) {
    state.note = { kind: 'ok', text: `Dat is ${naam}.` };
    draw();
  }

  function onCell(...args) {
    if (puzzle.kind === 'latin') cycleLatin(puzzle, state, ...args);
    else if (puzzle.kind === 'kamer') zetNeer(puzzle, state, ...args);
    else cycleMark(puzzle, state, ...args);
    state.wrong = new Set();
    state.fout = new Set();
    state.goed = new Set();
    state.note = null;
    if (isSolved(puzzle, state)) {
      state.solved = true;
      state.note = { kind: 'good', text: `Opgelost. Het antwoord: ${puzzle.question.answer}.` };
    }
    persist();
    draw();
  }

  const actions = {
    check() {
      const { wrong, goed, filled, total } = inspect(puzzle, state);
      state.wrong = wrong;
      state.fout = wrong;
      state.goed = goed;
      // Een controle hoort te laten zien wat er aan de hand is, niet het
      // alleen te tellen. Groen om wat klopt, rood om wat niet klopt, en in
      // het bericht staan beide aantallen - anders weet je na "vier kloppen
      // niet" nog steeds niet welke van je twaalf je mag laten staan.
      const juist = goed.size;
      if (wrong.size) {
        state.note = {
          kind: 'bad',
          text: juist
            ? hoofdletter(`${telwoord(juist)} ${juist === 1 ? 'staat' : 'staan'} goed (groen omcirkeld), ${telwoord(wrong.size)} ${wrong.size === 1 ? 'staat' : 'staan'} verkeerd (rood).`)
            : hoofdletter(`${telwoord(wrong.size)} ${wrong.size === 1 ? 'staat' : 'staan'} verkeerd. ${wrong.size === 1 ? 'Die is' : 'Die zijn'} rood omcirkeld.`),
        };
      } else if (filled < total) {
        state.note = {
          kind: 'ok',
          text: `Alles wat er staat is goed: ${telwoord(juist)} van de ${total}. Nog ${telwoord(total - filled)} te gaan.`,
        };
      } else {
        state.solved = true;
        state.note = { kind: 'good', text: `Helemaal goed. Het antwoord: ${puzzle.question.answer}.` };
      }
      persist();
      draw();
    },
    hint() {
      state.wrong = new Set();
      state.fout = new Set();
      state.goed = new Set();
      const hint = puzzle.kind === 'kamer' ? kamerHint(puzzle, state) : nextHint(puzzle, state);
      state.note = hint
        ? { kind: 'ok', text: hint.text }
        : { kind: 'ok', text: 'Er valt niets meer bij te zeggen: alles wat waar is, staat er al.' };
      if (isSolved(puzzle, state)) state.solved = true;
      persist();
      draw();
    },
    reveal() {
      // Eén misklik mag een puzzel niet verpesten.
      const bezig = Object.keys(state.plaats).length || Object.keys(state.marks).length;
      if (bezig && !window.confirm('De hele oplossing invullen? Daarmee is de puzzel voorbij.')) return;
      fillSolution(puzzle, state);
      state.onthuld = true;
      state.wrong = new Set();
      state.fout = new Set();
      state.goed = new Set();
      state.solved = true;
      state.note = { kind: 'ok', text: `De oplossing staat op het bord. Het antwoord: ${puzzle.question.answer}.` };
      persist();
      draw();
    },
    reset() {
      const bezig = Object.keys(state.plaats).length || Object.keys(state.marks).length || state.kruis.size;
      if (bezig && !window.confirm('Alles wissen en opnieuw beginnen?')) return;
      state.onthuld = false;
      state.marks = puzzle.kind === 'assign' ? emptyMarks(puzzle) : {};
      state.plaats = {};
      state.kruis = new Set();
      state.schets = {};
      state.struck = new Set();
      state.wrong = new Set();
      state.fout = new Set();
      state.goed = new Set();
      state.solved = false;
      state.note = null;
      clearProgress(puzzle.id);
      draw();
    },
    kruisjes() {
      // De kruisjes die het bord zelf zet zodra iemand staat. Ze volgen
      // dwingend uit de regel, dus ze schelen werk - maar ze nemen je ook
      // de stap af die je misschien juist zelf wilde zetten.
      zetKruisjesVanzelf(!kruisjesVanzelf());
      state.note = {
        kind: 'ok',
        text: kruisjesVanzelf()
          ? 'Het bord kruist weer zelf af waar niemand meer kan staan.'
          : 'Het bord kruist niets meer vanzelf af; je zet ze zelf met Uitsluiten.',
      };
      draw();
    },
    rand() {
      // De sierlijst eromheen aan of uit. Hij kost bij een klein bord ruim
      // een derde van de breedte; op een telefoon staat hij daarom vanzelf
      // uit, en wie hem wil kan hem aanzetten.
      zetRand(!randAan());
      state.note = {
        kind: 'ok',
        text: randAan()
          ? 'De lijst staat weer om het bord.'
          : 'De lijst is eraf; het bord mag de hele breedte hebben.',
      };
      draw();
    },
    print() {
      // Een dichtgeklapt blok drukt niet af. Wie de puzzel meeneemt naar de
      // trein moet de regels er wel bij hebben.
      const regels = document.querySelector('.spelregels');
      const stond = regels?.open;
      if (regels) regels.open = true;
      window.print();
      if (regels) regels.open = !!stond;
    },
    async share() {
      const url = location.href;
      try {
        await navigator.clipboard.writeText(url);
        state.note = {
          kind: 'ok',
          text: 'Link gekopieerd. Bewaar hem of maak er een bladwijzer van: deze link geeft altijd exact deze puzzel terug, met hetzelfde decor en dezelfde namen.',
        };
      } catch {
        state.note = { kind: 'ok', text: url };
      }
      draw();
    },
  };

  draw();
}

// ----------------------------------------------------------------- kop

function head(puzzle) {
  const mech = MECHANIC_BY_ID.get(puzzle.mechaniek);
  const deel = (tekst) => el('span', { text: tekst });
  const sep = () => el('span', { class: 'sep', text: '·' });

  // Een puzzel uit de bibliotheek heeft een eigen naam - "Eerste zaak",
  // "Natte voeten". Die stond nergens op de pagina; er stond alleen het
  // algemene "Regenstad: Wie deed het?". Nu staat de echte naam boven, en in
  // de tab, en het algemene eronder.
  const uitCatalogus = CATALOG.find((e) => puzzleId(catalogSettings(e)) === puzzle.id);
  const kop = uitCatalogus?.titel ?? puzzle.title;
  try {
    document.title = `${kop} · Het Vierde Spoor`;
  } catch {
    /* geen document, geen titel */
  }

  const crumbs = el('div', { class: 'crumbs' }, [
    el('a', { href: `#/puzzels?wereld=${puzzle.world.id}`, text: `${puzzle.world.icon} ${puzzle.world.name}` }),
    sep(),
    deel(mech?.name ?? puzzle.mechaniek),
    sep(),
    deel(`${puzzle.niveauLabel} (${puzzle.niveau}/${LEVEL_IDS.length})`),
    sep(),
    deel(puzzle.depth === 1 ? 'doorstrepen volstaat' : 'aanname nodig'),
  ]);

  return el('div', { class: 'puzzel-genre', style: genreStijl(puzzle.world) }, [
    el('div', { class: 'scene-wrap' }, sceneVoor(puzzle.world.id, puzzle.world.accent)),
    el('div', { class: 'puzzle-head' }, [
      crumbs,
      el('h1', { text: kop }),
      // De ondertitel is de algemene naam van de zaak ("Regenstad: Wie stond
      // er alleen?"). Bij een zelfgemaakte puzzel is dat precies wat er al
      // boven staat, en dan stond er twee keer dezelfde regel.
      kop === puzzle.title ? null : el('p', { class: 'puzzel-ondertitel', text: puzzle.title }),
      el('p', { class: 'intro', text: puzzle.intro }),
      el('div', { class: 'question' }, [
        el('span', { class: 'label', text: 'De vraag' }),
        el('b', { text: puzzle.question.text }),
      ]),
      spelregelBlok(puzzle),
    ]),
  ]);
}

// De spelregels bij de puzzel. Dichtgeklapt, want wie het spel kent heeft ze
// niet nodig - maar wie zich afvraagt of "naast" ook door een muur heen gaat,
// hoeft er niet naar te raden.
function spelregelBlok(puzzle) {
  const regels = spelregelsVan(puzzle.mechaniek);
  if (!regels) return el('span', {});
  const lijst = el('ul', { class: 'regellijst' });
  for (const r of regels.regels) lijst.append(el('li', { text: r }));
  // De zin over de figuur waar het om draait, hangt af van wat voor zaak
  // het is: een moord, een verdwijning of een diefstal.
  if (puzzle.zaak?.regel) lijst.append(el('li', { text: puzzle.zaak.regel }));

  // Wat "tegen de rotswand" betekent.
  //
  // Elke wereld heeft eigen woorden voor de buitenrand van het bord: tegen
  // de buitenmuur, tegen de rotswand, aan de rand van het woud, tegen de
  // glazen gevel. Die staan in een aanwijzing alsof het een ding is - en
  // dan zoek je op het bord naar een rotswand die er niet staat. Het is
  // geen ding maar een plek: de buitenste ring vakjes. Dat stond nergens.
  const w = puzzle.woorden;
  if (w?.randZin) {
    lijst.append(el('li', {
      text: `"${hoofdletter(w.randZin)}" is geen voorwerp maar een plek: het betekent op de buitenste rij of kolom van het bord.`,
    }));
  }
  if (w?.hoekZin) {
    lijst.append(el('li', {
      text: `"${hoofdletter(w.hoekZin)}" betekent op een van de vier hoekvakjes.`,
    }));
  }
  const blok = el('details', { class: 'spelregels' }, [
    el('summary', { text: regels.kop }),
    lijst,
  ]);
  return blok;
}

function cluePanel(puzzle, state, draw, persist) {
  if (puzzle.kind === 'latin' && !puzzle.clues.length) {
    return el('div', {}, [
      el('p', { class: 'label', text: 'Hoe dit werkt' }),
      el('p', {
        class: 'row-sub',
        text: 'Elke naam komt in elke rij precies één keer voor, en in elke kolom precies één keer. De grijze vakjes staan vast. Klik een leeg vakje om er namen door te lopen.',
      }),
      el('p', { class: 'legend', text: 'Het omlijnde vakje is waar de vraag over gaat.' }),
      latinLegenda(puzzle),
    ]);
  }

  // De feiten uit de inleiding staan hier nog een keer, genummerd als V1, V2.
  // Ze beperken de oplossing net zo hard als een aanwijzing; stonden ze
  // alleen in het verhaal, dan kom je bij het natellen een aanwijzing tekort.
  const feitenBlok = (puzzle.feiten ?? []).length
    ? el('div', { class: 'feiten' }, [
      el('p', { class: 'label', text: 'Wat vaststaat' }),
      el('div', { class: 'clues' }, puzzle.feiten.map((tekst, i) => el('div', { class: 'clue clue-feit' }, [
        el('span', { class: 'clue-n', text: `V${i + 1}.` }),
        el('span', { class: 'clue-text', text: tekst }),
      ]))),
    ])
    : null;

  const knopVoor = (clue) => {
    const done = state.struck.has(clue.n);
    const btn = el('button', {
      class: 'clue',
      type: 'button',
      'aria-pressed': String(done),
    }, [
      el('span', { class: 'clue-n', text: `${clue.n}.` }),
      el('span', { class: 'clue-text', text: clue.text }),
    ]);
    btn.addEventListener('click', () => {
      if (done) state.struck.delete(clue.n);
      else state.struck.add(clue.n);
      persist();
      draw();
    });
    return btn;
  };

  // De hints die de speler heeft opgevraagd, als gewone aanwijzingen achter
  // de andere. Ze krijgen doorlopende nummers, want ze zijn niet minder waar
  // dan de rest - je hebt ze alleen zelf gevraagd.
  const extraClues = (state.extra ?? []).map((c, i) => ({
    n: puzzle.clues.length + i + 1,
    text: zinVoor(c, puzzle.woorden),
    ruw: c,
  }));

  const blokken = [feitenBlok];

  if (puzzle.kind === 'kamer') {
    blokken.push(...perNaam(puzzle, extraClues, knopVoor));
  } else {
    const list = el('div', { class: 'clues' });
    for (const clue of puzzle.clues) list.append(knopVoor(clue));
    blokken.push(list);
  }

  // Bij het speurdoku staan de extra aanwijzingen al bij de naam waar ze
  // over gaan; nog een keer apart eronder zou dezelfde zin twee keer zijn.
  if (extraClues.length && puzzle.kind !== 'kamer') {
    const lijst = el('div', { class: 'clues' });
    for (const clue of extraClues) lijst.append(knopVoor(clue));
    blokken.push(
      el('p', { class: 'label', text: `Extra aanwijzingen (${extraClues.length})` }),
      lijst,
    );
  }

  blokken.push(el('p', { class: 'legend', text: 'Klik een aanwijzing weg als je hem hebt gebruikt.' }));
  return el('div', {}, blokken);
}

// De aanwijzingen op een hoop was bij zestien bij zestien een lijst van
// vierenvijftig zinnen waarin je niet terugvond wat er over Hendrik gezegd
// was. Nu staan ze onder de naam waar ze over gaan.
//
// Elke aanwijzing staat één keer, onder de eerste naam die erin voorkomt, en
// houdt zijn eigen nummer. Komt iemand als tweede naam voor - "Ada stond ten
// noorden van Bram" staat bij Ada - dan krijgt Bram eronder een verwijzing
// naar dat nummer. Zonder dat zou je bij Bram de helft missen.
//
// Tellingen ("in de keuken stonden precies twee mensen") gaan over niemand
// in het bijzonder en staan apart, onderaan.
function perNaam(puzzle, extraClues, knopVoor) {
  const ruw = puzzle._ruwe ?? [];
  const alle = [...puzzle.clues.map((c, i) => ({ clue: c, r: ruw[i] })),
                ...extraClues.map((c) => ({ clue: c, r: c.ruw }))];

  const groepen = new Map();
  const ookIn = new Map();
  const algemeen = [];
  for (const { clue, r } of alle) {
    if (!r || r.p == null) {
      algemeen.push(clue);
      continue;
    }
    if (!groepen.has(r.p)) groepen.set(r.p, []);
    groepen.get(r.p).push(clue);
    if (r.q != null) {
      if (!ookIn.has(r.q)) ookIn.set(r.q, []);
      ookIn.get(r.q).push(clue.n);
    }
  }

  const uit = [];

  // Iedereen op het bord langs, in de volgorde van het palet, zodat de
  // lijst dezelfde volgorde heeft als de penningen erboven.
  for (let p = 0; p < puzzle.personen.length; p++) {
    const mijn = groepen.get(p) ?? [];
    const verwijzingen = ookIn.get(p) ?? [];
    if (!mijn.length && !verwijzingen.length) continue;
    const kop = el('p', { class: 'clue-kop' }, [
      el('span', { class: 'clue-kop-naam', text: puzzle.personen[p] }),
      p === puzzle.slachtofferIdx
        ? el('span', { class: 'clue-kop-merk', text: puzzle.zaak?.rolwoord ?? 'het slachtoffer' })
        : null,
    ]);
    const lijst = el('div', { class: 'clues' });
    for (const clue of mijn) lijst.append(knopVoor(clue));
    uit.push(el('div', { class: 'clue-groep' }, [
      kop,
      lijst,
      verwijzingen.length
        ? el('p', {
          class: 'clue-ook',
          text: `Staat ook in ${verwijzingen.length === 1 ? 'aanwijzing' : 'de aanwijzingen'} ${verwijzingen.join(', ')}.`,
        })
        : null,
    ]));
  }

  if (algemeen.length) {
    const lijst = el('div', { class: 'clues' });
    for (const clue of algemeen) lijst.append(knopVoor(clue));
    uit.push(el('div', { class: 'clue-groep' }, [
      el('p', { class: 'clue-kop' }, [el('span', { class: 'clue-kop-naam', text: 'Over iedereen' })]),
      lijst,
    ]));
  }
  return uit;
}



// Een blok achter een klepje, met de stand onthouden. De legenda en de
// aanwijzingen zijn allebei dingen die je soms nodig hebt en soms in de weg
// vindt zitten - en op een telefoon schelen ze een scherm.
function klepje(sleutel, kop, standaard, inhoud) {
  const open = paneelOpen(sleutel, standaard);
  const blok = el('details', { class: 'paneel', open: open ? '' : null }, [
    el('summary', { text: kop }),
    el('div', { class: 'paneel-binnen' }, inhoud),
  ]);
  blok.addEventListener('toggle', () => zetPaneel(sleutel, blok.open));
  return blok;
}

function boardNodes(puzzle, state, onCell, toonMeubel, actions) {
  if (puzzle.kind === 'kamer') {
    const vanzelf = kruisjesVanzelf();
    return [
      personenPalet(puzzle, state, onCell),
      el('div', { class: 'board-wrap' }, renderKamerbord(
        puzzle, state, { klikCel: onCell, klikMeubel: toonMeubel },
        { rand: randAan(), kruisjesVanzelf: vanzelf },
      )),
      bordschakelaars({
        kruisjes: actions.kruisjes, rand: actions.rand,
        kruisjesAan: vanzelf, randAan: randAan(),
      }),
      klepje('legenda', 'Wat er op het bord staat', false, [renderLegenda(puzzle)]),
      klepje('uitleg', 'Hoe je dit bord bedient', false, [
        el('p', {
          class: 'legend',
          text: `Kies een figuur en klik een leeg vakje om hem neer te zetten. Klik je op een figuur die al op het bord staat, dan pak je die op; klik je er nog een keer op, dan gaat hij eraf. Met Schetsen zet je in plaats daarvan zijn beginletter in het vakje, als notitie van wie daar zou kunnen staan. Er staat precies één verdachte per rij en per kolom, en niemand staat op een meubelstuk. Met Uitsluiten zet je je eigen kruisjes.${vanzelf ? ' Zodra je iemand neerzet, kruist het bord zelf af waar niemand meer kan staan; dat kun je uitzetten met de knop Kruisjes vanzelf.' : ' Het bord zet zelf geen kruisjes - dat staat uit.'}`,
        }),
      ]),
    ];
  }
  if (puzzle.kind === 'latin') {
    return [renderLatin(puzzle, state.marks, onCell, state.wrong)];
  }
  const nodes = [];
  if (puzzle.graph) nodes.push(renderMap(puzzle));
  const blokken = blokkenVan(puzzle);
  for (const blok of blokken.filter((b) => b.soort === 'anker')) {
    nodes.push(renderBlok(puzzle, blok, state.marks[blok.id] ?? {}, onCell, state.wrong));
  }
  const paren = blokken.filter((b) => b.soort === 'paar');
  if (paren.length) {
    nodes.push(el('p', {
      class: 'label blok-kop',
      text: paren.length === 1 ? 'En tussen die twee onderling' : 'En tussen de categorieën onderling',
    }));
    // Het voorbeeld komt uit deze puzzel. Eerder stond er een vaste zin met
    // een hotel in, en dat hotel bestond in de meeste puzzels niet.
    const v = paren[0];
    const voorbeeld = `${v.rij.items[0]} en ${v.kolom.items[0]} bij elkaar horen`;
    nodes.push(el('p', {
      class: 'legend',
      text: `Hier noteer je wat je weet zonder dat er een verdachte bij genoemd wordt - bijvoorbeeld dat ${voorbeeld}. Je hebt deze blokken niet nodig om de vraag te beantwoorden, maar met zo'n aanwijzing kom je er wel sneller.`,
    }));
    for (const blok of paren) {
      nodes.push(renderBlok(puzzle, blok, state.marks[blok.id] ?? {}, onCell, state.wrong));
    }
  }
  nodes.push(el('p', {
    class: 'legend',
    text: 'Klik een vakje om te wisselen tussen leeg, kruis en vink. Een vink streept de rest van zijn rij en kolom automatisch door.',
  }));
  return nodes;
}

// De verdachten als penningen om op te pakken. De gekozen penning licht op.
//
// Twee rijen, niet één. Uitsluiten en Schetsen stonden achter de laatste
// verdachte aan, en op een bord met zestien namen betekende dat: eerst
// zestien penningen voorbij schuiven voordat je bij je potlood bent. Nu
// staan de namen boven en de twee standen eronder, altijd op dezelfde plek.
// Verder dan die twee gaat deze balk niet: wat je maar één keer instelt
// staat onder het bord, zie bordschakelaars.
//
// De hele balk plakt bovenaan vast zodra je naar beneden scrolt (zie .palet
// in de opmaak). Daarmee staan de namen en het bord altijd samen op één
// scherm, ook op een telefoon.
function personenPalet(puzzle, state, onCell) {
  const balk = el('div', { class: 'palet' });
  const namen = el('div', { class: 'palet-namen' });
  const standen = el('div', { class: 'palet-standen' });
  balk.append(namen, standen);
  puzzle.personen.forEach((naam, i) => {
    const geplaatst = state.plaats[i] != null;
    const isLijk = i === puzzle.slachtofferIdx;
    const knop = el('button', {
      class: isLijk ? 'palet-knop palet-lijk' : 'palet-knop',
      type: 'button',
      'aria-pressed': String(state.gekozen === i),
      'data-geplaatst': geplaatst ? '1' : null,
    }, [
      el('span', { class: 'palet-portret' }, isLijk
        ? slachtofferElement(i, naam.charAt(0).toUpperCase(), 26, geslachtVan(naam), puzzle.zaak?.merk)
        : portretElement(i, naam.charAt(0).toUpperCase(), 26, geslachtVan(naam))),
      el('span', { text: naam }),
    ]);
    knop.addEventListener('click', () => onCell(null, i));
    namen.append(knop);
  });

  const kruis = el('button', {
    class: 'palet-knop palet-kruis',
    type: 'button',
    'aria-pressed': String(state.gekozen === -1),
  }, [el('span', { class: 'palet-fiche', text: '✕' }), el('span', { text: 'Uitsluiten' })]);
  kruis.addEventListener('click', () => onCell(null, -1));
  standen.append(kruis);

  // Schetsstand: klikken zet dan de beginletter van de gekozen figuur in het
  // vakje in plaats van de figuur zelf.
  const schets = el('button', {
    class: 'palet-knop palet-schets',
    type: 'button',
    'aria-pressed': String(state.schetsAan),
  }, [el('span', { class: 'palet-fiche', text: '✎' }), el('span', { text: 'Schetsen' })]);
  schets.addEventListener('click', () => onCell(null, -2));
  standen.append(schets);

  return balk;
}

// De twee schakelaars die bij het bord horen, maar niet in de plakkende balk.
//
// Ze stonden er wel, naast Uitsluiten en Schetsen, en dat kostte te veel.
// Op een telefoon braken hun teksten over twee en drie regels; de balk werd
// daardoor 144 pixels hoog en dekte samen met de kop een kwart van het scherm
// af - en die balk plakt, dus dat kwart zat permanent over de puzzel heen.
//
// Het verschil is wat je ermee doet. Uitsluiten en Schetsen zijn standen:
// je wisselt er voortdurend tussen terwijl je puzzelt, dus die horen binnen
// handbereik te blijven. Deze twee zet je één keer per puzzel goed. Die
// mogen onder het bord staan, waar ze de ruimte hebben.
//
// Ze zien er ook met opzet anders uit: hoekig, met het woordje "aan" of
// "uit" erin, omdat ze niets veranderen aan wat een klik op het bord doet.
function bordschakelaars(acties) {
  const schakel = (naam, aan, fn) => {
    const b = el('button', {
      class: 'palet-schakel',
      type: 'button',
      'aria-pressed': String(aan),
    }, [
      el('span', { class: 'palet-schakel-naam', text: naam }),
      el('span', { class: 'palet-schakel-stand', text: aan ? 'aan' : 'uit' }),
    ]);
    b.addEventListener('click', fn);
    return b;
  };
  return el('div', { class: 'bordschakelaars' }, [
    schakel('Kruisjes vanzelf', acties.kruisjesAan, acties.kruisjes),
    schakel('Lijst om het bord', acties.randAan, acties.rand),
  ]);
}

function toolbar(puzzle, state, actions) {
  const bar = el('div', { class: 'toolbar' });
  const add = (label, fn, primary) => {
    const b = el('button', { class: primary ? 'btn btn-primary' : 'btn', type: 'button', text: label });
    b.addEventListener('click', fn);
    bar.append(b);
  };
  add('Controleer', actions.check, true);
  add('Hint', actions.hint);
  add('Oplossing', actions.reveal);
  add('Begin opnieuw', actions.reset);
  add('Printen', actions.print);
  add('Bewaar deze puzzel', actions.share);
  return bar;
}

function noteNode(state) {
  if (!state.note) return el('div');
  const cls = state.note.kind === 'good' ? 'note note-good' : state.note.kind === 'bad' ? 'note note-bad' : 'note';
  return el('div', { class: cls, text: state.note.text });
}

// Welk vakje hoort er in dit blok aan te staan? Bij een ankerblok is de rij
// een slot en zoeken we het item van de kolomcategorie op. Bij een paarblok
// is de rij zelf ook een item: dan zoeken we eerst bij welk slot die hoort.
function juisteKolom(puzzle, blok, rij) {
  const slot = blok.soort === 'anker' ? rij : puzzle.solution[blok.rij.id].indexOf(rij);
  return puzzle.solution[blok.kolom.id][slot];
}

// -------------------------------------------------------- markeringen

function emptyMarks(puzzle) {
  const marks = {};
  for (const blok of blokkenVan(puzzle)) marks[blok.id] = {};
  return marks;
}

function cycleMark(puzzle, state, catId, slot, item) {
  const n = puzzle.anchor.items.length;
  const cat = (state.marks[catId] ??= {});
  const key = cellKey(slot, item);
  const next = { '': 'no', no: 'yes', yes: '' }[cat[key] ?? ''];
  cat[key] = next;
  if (next === '') delete cat[key];
  if (next === 'yes') {
    for (let i = 0; i < n; i++) if (i !== item) cat[cellKey(slot, i)] = 'no';
    for (let s = 0; s < n; s++) if (s !== slot) cat[cellKey(s, item)] = 'no';
  }
}

function cycleLatin(puzzle, state, r, c) {
  const n = puzzle.rows.length;
  const key = `${r},${c}`;
  const cur = state.marks[key];
  const next = cur == null ? 0 : cur + 1 >= n ? null : cur + 1;
  if (next == null) delete state.marks[key];
  else state.marks[key] = next;
}

// Klik op het palet (cel === null) kiest een verdachte of het kruis.
// Klik op een vakje zet die verdachte neer, haalt hem weg, of wisselt.
function zetNeer(puzzle, state, cel, keuze) {
  if (cel === null) {
    if (keuze === -2) {
      state.schetsAan = !state.schetsAan;
      if (state.schetsAan && state.gekozen === -1) state.gekozen = 0;
      return;
    }
    state.gekozen = keuze;
    if (keuze === -1) state.schetsAan = false;
    return;
  }
  // Schetsen: de letter van de gekozen figuur erbij of eraf.
  if (state.schetsAan && state.gekozen >= 0) {
    const lijst = state.schets[cel] ?? [];
    state.schets[cel] = lijst.includes(state.gekozen)
      ? lijst.filter((f) => f !== state.gekozen)
      : [...lijst, state.gekozen].sort((a, b) => a - b);
    if (!state.schets[cel].length) delete state.schets[cel];
    return;
  }
  if (state.gekozen === -1) {
    if (state.kruis.has(cel)) state.kruis.delete(cel);
    else state.kruis.add(cel);
    return;
  }
  // Op een bezet vakje klikken pakt die figuur op; hij wordt niet overschreven.
  //
  // Hiervoor zette een klik op een bezet vakje de figuur neer die je eerder
  // had gekozen, en gooide hij degene die er stond eraf. Dat is wat een
  // stempel doet, en het is precies verkeerd om: wie op een poppetje klikt
  // bedoelt dát poppetje, niet het poppetje van drie klikken geleden. Je
  // verloor er bovendien zwijgend een zet mee.
  //
  // Nu is een bezet vakje een figuur om op te pakken. Nog een keer klikken
  // op dezelfde haalt hem van het bord. Neerzetten gaat alleen op een leeg
  // vakje - dat is de ene stap die je erbij krijgt, en in ruil daarvoor
  // kan een misklik nooit meer iemand wegvegen.
  const hier = state.plaatsVanCel(cel);
  if (hier != null) {
    if (hier === state.gekozen) delete state.plaats[hier];
    else state.gekozen = hier;
    return;
  }
  if (state.gekozen < 0) return;
  state.plaats[state.gekozen] = cel;
  state.kruis.delete(cel);
  delete state.schets[cel];
}

function fillSolution(puzzle, state) {
  if (puzzle.kind === 'kamer') {
    state.plaats = {};
    puzzle.oplossing.forEach((cel, p) => { state.plaats[p] = cel; });
    return;
  }
  if (puzzle.kind === 'latin') {
    for (let r = 0; r < puzzle.rows.length; r++) {
      for (let c = 0; c < puzzle.rows.length; c++) {
        if (puzzle.givens[r][c] == null) state.marks[`${r},${c}`] = puzzle.full[r][c];
      }
    }
    return;
  }
  state.marks = emptyMarks(puzzle);
  const n = puzzle.anchor.items.length;
  for (const blok of blokkenVan(puzzle)) {
    for (let rij = 0; rij < n; rij++) {
      const item = juisteKolom(puzzle, blok, rij);
      for (let i = 0; i < n; i++) state.marks[blok.id][cellKey(rij, i)] = i === item ? 'yes' : 'no';
    }
  }
}

// Wat staat er fout, en hoe vol is het bord?
function inspect(puzzle, state) {
  const wrong = new Set();
  const goed = new Set();
  let filled = 0;
  let total = 0;
  if (puzzle.kind === 'kamer') {
    total = puzzle.n;
    for (let p = 0; p < puzzle.n; p++) {
      const cel = state.plaats[p];
      if (cel == null) continue;
      filled++;
      if (cel !== puzzle.oplossing[p]) wrong.add(cel);
      else goed.add(cel);
    }
    return { wrong, goed, filled, total };
  }
  if (puzzle.kind === 'latin') {
    const n = puzzle.rows.length;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (puzzle.givens[r][c] != null) continue;
        total++;
        const v = state.marks[`${r},${c}`];
        if (v == null) continue;
        filled++;
        if (v !== puzzle.full[r][c]) wrong.add(`${r},${c}`);
        else goed.add(`${r},${c}`);
      }
    }
    return { wrong, goed, filled, total };
  }
  const n = puzzle.anchor.items.length;
  for (const blok of blokkenVan(puzzle)) {
    const marks = state.marks[blok.id] ?? {};
    // De paarblokken zijn kladpapier: fouten erin wijzen we aan, maar je
    // hoeft ze niet in te vullen om de puzzel opgelost te hebben.
    const telt = blok.soort === 'anker';
    for (let slot = 0; slot < n; slot++) {
      if (telt) total++;
      const correct = juisteKolom(puzzle, blok, slot);
      let picked = null;
      for (let i = 0; i < n; i++) if (marks[cellKey(slot, i)] === 'yes') picked = i;
      if (picked == null) {
        // een kruis op het juiste vakje is ook fout
        if (marks[cellKey(slot, correct)] === 'no') wrong.add(`${blok.id}:${cellKey(slot, correct)}`);
        continue;
      }
      if (telt) filled++;
      if (picked !== correct) wrong.add(`${blok.id}:${cellKey(slot, picked)}`);
      else if (telt) goed.add(`${blok.id}:${cellKey(slot, picked)}`);
    }
  }
  return { wrong, goed, filled, total };
}

function isSolved(puzzle, state) {
  const { wrong, filled, total } = inspect(puzzle, state);
  return wrong.size === 0 && filled === total;
}

// Een hint bij het speurdoku: een extra aanwijzing, geen stukje oplossing.
//
// Hiervoor zette de hint de eerstvolgende figuur voor je neer. Dat werkt
// wel, maar je leert er niets van en je houdt er een kortere puzzel aan
// over in plaats van een begrijpelijkere. Nu komt er een zin bij, onderaan
// de lijst, net zo waar als de andere - en gekozen op wat hij jou oplevert
// vanaf de stand van jouw bord. De motor doet die afweging; zie
// extraAanwijzing in generate-rooms.js.
function kamerHint(puzzle, state) {
  if (!puzzle._rooster) return null;
  const bekend = bekendAlsAanwijzingen(puzzle._rooster, puzzle.oplossing, state.plaats);
  const bestaand = [...(puzzle._ruwe ?? []), ...state.extra];
  const extra = extraAanwijzing(
    puzzle._rooster,
    puzzle.oplossing,
    puzzle.slachtofferIdx,
    bestaand,
    bekend,
    makeRng(`${puzzle.id}:hint${state.extra.length}`),
  );
  if (!extra) return null;
  state.extra = [...state.extra, extra];
  const nummer = puzzle.clues.length + state.extra.length;
  return {
    text: `Erbij als aanwijzing ${nummer}: ${zinVoor(extra, puzzle.woorden)}`,
  };
}

// De eerstvolgende stap verklappen, met de aanwijzing die erover gaat.
// Dit is nog de hint van de andere soorten puzzels; het speurdoku heeft
// sinds kort een echte extra aanwijzing (zie kamerHint hierboven).
function nextHint(puzzle, state) {
  if (puzzle.kind === 'latin') {
    const n = puzzle.rows.length;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (puzzle.givens[r][c] != null) continue;
        if (state.marks[`${r},${c}`] === puzzle.full[r][c]) continue;
        state.marks[`${r},${c}`] = puzzle.full[r][c];
        return { text: `In ${puzzle.rows[r]} tijdens ${puzzle.cols[c]}: ${puzzle.symbols[puzzle.full[r][c]]}.` };
      }
    }
    return null;
  }

  const n = puzzle.anchor.items.length;
  const shown = (puzzle._rawClues ?? []).filter((c) => !c.intro);
  for (const cat of puzzle.cats) {
    const marks = (state.marks[cat.id] ??= {});
    for (let slot = 0; slot < n; slot++) {
      const correct = puzzle.solution[cat.id][slot];
      if (marks[cellKey(slot, correct)] === 'yes') continue;
      for (let i = 0; i < n; i++) marks[cellKey(slot, i)] = i === correct ? 'yes' : 'no';
      for (let s = 0; s < n; s++) if (s !== slot) marks[cellKey(s, correct)] = 'no';

      const idx = shown.findIndex((c) =>
        ['a', 'b', 'c2'].some((k) => c[k] && c[k].c === cat.id && c[k].i === correct)
      );
      const waar = `${puzzle.anchor.items[slot]}: ${cat.items[correct]}.`;
      return {
        text: idx >= 0 ? `${waar} Dat volgt uit aanwijzing ${idx + 1}, samen met wat er al staat.` : waar,
      };
    }
  }
  return null;
}
