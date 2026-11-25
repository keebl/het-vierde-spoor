// De voordeur. Wie hier voor het eerst komt moet binnen een scherm weten:
// wat is dit, wat ga ik doen, en waar begin ik.
//
// Er stond hier een muur met keuzes: acht genretegels, een instaplijst en
// een link naar de bibliotheek. Dat is eraf. Je kiest nog maar één ding -
// hoe zwaar - en klikt er nog eens op; het decor krijg je, je kiest het niet.
// Dat scheelt niet alleen knoppen: het haalt ook het gevoel weg dat je
// eerst iets moet uitzoeken voordat je mag beginnen.
//
// De bibliotheek (vaste zaken per moeilijkheidsgraad, en de puzzels die je
// zelf begonnen bent) staat in het menu bovenaan, onder "Alle puzzels". De
// knoppen "Begin nieuwe puzzel" en "Of kies er een uit de lijst" zijn weg
// (2026-11-18): twee knoppen onder zes niveaus waren drie keuzes te veel.

import { el } from './boards.js';
import { ZICHTBARE_LEVEL_IDS, LEVELS, KAMER_LEVELS } from '../engine/difficulty.js';
import { laatsteNiveau, zetNiveau } from './state.js';
import { puzzleId, buildPuzzle } from '../puzzle.js';
import { nieuwePuzzel } from './volgende.js';
import { renderKamerbord } from './board-rooms.js';
import { bordminiatuur, stapplaatje } from './bordminiatuur.js';
import { genreStijl } from './genre.js';
import { WORLD_BY_ID } from '../content/worlds.js';
import { LEVEL_IDS } from '../engine/difficulty.js';
import { MECHANIC_BY_ID } from '../content/assignments.js';
import { sceneVoor } from './scenes.js';
import { padStand, huidigeStap } from './pad-voortgang.js';
import { AANTAL_STAPPEN } from './pad.js';

const STAPPEN = [
  {
    kop: 'Lees de aanwijzingen',
    tekst: 'Elke aanwijzing is waar. Los van elkaar zeggen ze weinig; samen sluiten ze alles uit op één mogelijkheid na. Ze staan gegroepeerd onder de naam waar ze over gaan.',
  },
  {
    kop: 'Sluit uit wat niet kan',
    tekst: 'Je zet de verdachten zelf op de plattegrond, één per rij en één per kolom. Met Uitsluiten zet je kruisjes, met Schetsen krabbel je een beginletter in een vakje waar iemand nog zou kunnen staan.',
  },
  {
    kop: 'Hou over wat moet',
    tekst: 'Wat overblijft is het antwoord. Vastgelopen? Een hint geeft je geen stukje oplossing maar een extra aanwijzing, gekozen op wat je er vanaf jouw bord mee kunt.',
  },
];

export function renderHome(mount) {
  let niveau = laatsteNiveau();
  if (!ZICHTBARE_LEVEL_IDS.includes(niveau)) niveau = ZICHTBARE_LEVEL_IDS[0];

  mount.replaceChildren();

  const niveaus = el('div', { class: 'niveaukiezer' }, ZICHTBARE_LEVEL_IDS.map((l) => {
    const p = LEVELS[l];
    const k = KAMER_LEVELS[l];
    const b = el('button', {
      class: 'opt level-btn',
      type: 'button',
      'aria-pressed': String(niveau === l),
    }, [
      // Een plattegrondje van dat niveau, uit dezelfde motor als het bord.
      // "Zestien bij zestien" is een getal; dit is wat je krijgt.
      bordminiatuur(l, k),
      el('b', { text: String(l) }),
      el('span', { class: 'opt-name', text: p.label }),
      el('small', { text: `${k.n} bij ${k.n}, ${p.style === 'shallow' ? 'doorstrepen' : 'aanname nodig'}` }),
      el('span', { class: 'level-start', text: 'Klik nog eens: beginnen' }),
    ]);
    // Eerste klik kiest, tweede klik begint. Er stond een aparte knop
    // "Begin nieuwe puzzel" onder: Guus (2026-11-18) wilde die weg - wie
    // een niveau al gekozen heeft, klikt er vanzelf nog eens op.
    b.addEventListener('click', () => {
      if (niveau === l && b.getAttribute('aria-pressed') === 'true') {
        location.hash = `#/puzzel/${nieuwePuzzel(l)}`;
        return;
      }
      niveau = l;
      zetNiveau(l);
      for (const knop of niveaus.children) {
        knop.setAttribute('aria-pressed', String(knop === b));
      }
    });
    return b;
  }));
  // ---------------------------------------------------------------- hero
  // Een echte plattegrond naast de tekst, geen plaatje van een plattegrond:
  // het eerste wat je ziet is waar het spel over gaat. Hij wordt hier
  // gebouwd, dus hij klopt ook echt.
  mount.append(
    el('section', { class: 'hero hero-met-bord' }, [
      el('div', {}, [
        el('p', { class: 'eyebrow', text: 'Deductiepuzzels' }),
        // Het laatste woord in kleur: zie .markeer in de opmaak.
        el('h1', {}, ['Puzzels die je ', el('span', { class: 'markeer', text: 'uitredeneert' })]),
        el('p', {
          class: 'lede',
          text: 'Je krijgt een paar verdachten en een lijstje aanwijzingen. Streep weg wat niet kan, en er blijft één antwoord over. Gokken hoeft nooit, ook niet bij de moeilijkste.',
        }),
      ]),
      // Het pad, boven de niveaus: één klik om verder te gaan
      // (specs/level-path.md, criterium 10).
      padKnop(),
      el('p', { class: 'label', text: 'Hoe zwaar wil je het hebben? Kies een niveau en klik er nog eens op om te beginnen.' }),
      niveaus,
      el('p', {
        class: 'hero-note',
        text: 'Elke keer een nieuw decor en een nieuwe zaak. Geen account nodig; je voortgang blijft in deze browser bewaard.',
      }),
      bordVoorbeeld(),
    ])
  );

  // ------------------------------------------------------------- stappen
  mount.append(
    el('section', { class: 'section' }, [
      el('div', { class: 'section-head' }, [el('h2', { text: 'Zo werkt het' })]),
      el('div', { class: 'steps' },
        STAPPEN.map((s, i) =>
          el('div', { class: 'step' }, [
            stapplaatje(i),
            el('div', { class: 'step-n', text: String(i + 1) }),
            el('h3', { text: s.kop }),
            el('p', { text: s.tekst }),
          ])
        )
      ),
    ])
  );
}

// "Begin het pad" zonder voortgang, anders verder waar je was. Aan het eind
// naar het pad zelf, waar het eindbericht staat.
function padKnop() {
  const pad = padStand();
  const hier = huidigeStap(pad, AANTAL_STAPPEN);
  const begonnen = Object.keys(pad.stappen).length > 0;
  const [href, tekst] = hier > AANTAL_STAPPEN
    ? ['#/pad', 'Verder op het pad']
    : begonnen ? [`#/pad/${hier}`, `Verder op het pad · stap ${hier}`] : ['#/pad/1', 'Begin het pad'];
  return el('div', { class: 'pad-knop-blok' }, [
    el('a', { class: 'btn btn-primary btn-groot', href, text: tekst }),
    el('p', { class: 'hero-note', text: 'Elke stap een tikje zwaarder, van 5 bij 5 tot 16 bij 16.' }),
  ]);
}

// Een plattegrond om naar te kijken, niet om in te spelen: hij staat op de
// voordeur als voorproefje. Daarom een leeg bord - niemand neergezet, geen
// kruisjes. Vaste instellingen, want een voorbeeld hoort er elke keer
// hetzelfde uit te zien; de puzzel die je krijgt is wél steeds een andere.
function bordVoorbeeld() {
  let puzzle;
  try {
    puzzle = buildPuzzle({
      opdracht: 'dader', wereld: 'landhuis', mechaniek: 'kamer', niveau: 1, seed: 'voordeur',
    });
  } catch {
    return null;
  }

  const leeg = {
    plaats: {},
    kruis: new Set(),
    schets: {},
    gekozen: -1,
    plaatsVanCel: () => null,
    fout: new Set(),
    goed: new Set(),
  };
  const bord = renderKamerbord(puzzle, leeg, { klikCel: () => {} });
  return el('span', { class: 'hero-bord' }, [bord]);
}

// ------------------------------------------------- nog in gebruik door de
// verborgen bibliotheek (#/puzzels). Zie de opmerking boven aan dit bestand.

export function puzzelRij(entry, done, nummer, bekeken = new Set()) {
  const id = puzzleId(entry);
  const niveau = LEVELS[entry.niveau];

  const bolletjes = el('span', { class: 'dots', title: `Niveau ${entry.niveau}: ${niveau.label}` },
    [1, 2, 3, 4, 5].map((n) =>
      el('span', { class: n <= entry.niveau ? 'dot on' : 'dot' })
    )
  );

  return el('a', { class: nummer != null ? 'row-item' : 'row-item plain', href: `#/puzzel/${id}` }, [
    nummer != null ? el('span', { class: 'row-n', text: String(nummer) }) : null,
    el('span', { class: 'row-body' }, [
      el('span', { class: 'row-title', text: entry.titel }),
      el('span', { class: 'row-sub', text: entry.sub }),
    ]),
    el('span', { class: 'row-meta' }, [
      done.has(id)
        ? el('span', { class: 'done-mark', text: '✓ opgelost' })
        : bekeken.has(id)
          ? el('span', { class: 'bekeken-mark', text: 'oplossing bekeken' })
          : null,
      el('span', { text: niveau.label }),
      bolletjes,
    ]),
  ]);
}

export function puzzelKaart(entry, done, bekeken = new Set()) {
  const id = puzzleId(entry);
  const wereld = WORLD_BY_ID.get(entry.wereld);
  const niveau = LEVELS[entry.niveau];
  const speltype = MECHANIC_BY_ID.get(entry.mechaniek);

  // Drie zaken in hetzelfde genre krijgen dezelfde tekening. Door per puzzel
  // een ander stuk ervan te laten zien, lijken ze toch niet op elkaar.
  let som = 0;
  for (let i = 0; i < id.length; i++) som = (som * 31 + id.charCodeAt(i)) % 1000;
  const verschuiving = [-13, -5, 4, 12][som % 4];
  const beeld = el('span', { class: 'kaart-beeld' }, [
    sceneVoor(entry.wereld, wereld?.accent),
    el('span', { class: 'kaart-merk', title: speltype?.name ?? '', text: speltype?.icon ?? '' }),
  ]);
  beeld.firstChild.style.transform = `translateX(${verschuiving}%) scale(1.22)`;

  const bolletjes = el('span', { class: 'dots', title: `Niveau ${entry.niveau}: ${niveau.label}` },
    LEVEL_IDS.map((n) => el('span', { class: n <= entry.niveau ? 'dot on' : 'dot' })));

  return el('a', {
    class: 'kaart',
    href: `#/puzzel/${id}`,
    style: genreStijl(wereld),
  }, [
    beeld,
    done.has(id) ? el('span', { class: 'kaart-stempel', text: 'opgelost' }) : null,
    bekeken.has(id) && !done.has(id)
      ? el('span', { class: 'kaart-stempel kaart-stempel-grijs', text: 'bekeken' })
      : null,
    el('span', { class: 'kaart-tekst' }, [
      el('span', { class: 'kaart-titel', text: entry.titel }),
      el('span', { class: 'kaart-sub', text: entry.sub }),
      el('span', { class: 'kaart-voet' }, [
        el('span', { text: `${speltype?.name ?? ''} · ${niveau.label}` }),
        bolletjes,
      ]),
    ]),
  ]);
}
