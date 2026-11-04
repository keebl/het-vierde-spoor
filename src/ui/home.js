// De voordeur. Wie hier voor het eerst komt moet binnen een scherm weten:
// wat is dit, wat ga ik doen, en waar begin ik. Pas daarna het aanbod.

import { el } from './boards.js';
import { CATALOG } from '../content/catalog.js';
import { WORLDS } from '../content/worlds.js';
import { LEVELS } from '../engine/difficulty.js';
import { solvedIds, onthuldIds } from './state.js';
import { puzzleId, buildPuzzle } from '../puzzle.js';
import { renderKamerbord } from './board-rooms.js';
import { catalogSettings } from '../content/catalog.js';
import { sceneVoor } from './scenes.js';
import { genreStijl } from './genre.js';
import { WORLD_BY_ID } from '../content/worlds.js';
import { MECHANIC_BY_ID } from '../content/assignments.js';

const STAPPEN = [
  {
    kop: 'Lees de aanwijzingen',
    tekst: 'Elke aanwijzing is waar. Los van elkaar zeggen ze weinig; samen sluiten ze alles uit op één mogelijkheid na.',
  },
  {
    kop: 'Sluit uit wat niet kan',
    tekst: 'Bij een Speurdoku zet je de verdachten zelf op de plattegrond, één per rij en één per kolom. Bij een Kruisverhoor zet je kruisjes en vinkjes in een raster.',
  },
  {
    kop: 'Hou over wat moet',
    tekst: 'Wat overblijft is het antwoord. Vastgelopen? De hint vult één vakje in en zegt erbij uit welke aanwijzing dat volgde.',
  },
];

export function renderHome(mount) {
  const done = solvedIds();
  const bekeken = onthuldIds();
  const instap = CATALOG.filter((p) => p.seed.startsWith('start-'));

  mount.replaceChildren();

  // ---------------------------------------------------------------- hero
  // Een echte plattegrond naast de tekst, geen plaatje van een plattegrond:
  // het eerste wat je ziet is waar het spel over gaat. Hij wordt hier
  // gebouwd uit de eerste instappuzzel, dus hij klopt ook echt.
  const voorbeeld = instap[0] ? bordVoorbeeld(instap[0]) : null;

  mount.append(
    el('section', { class: voorbeeld ? 'hero hero-met-bord' : 'hero' }, [
      el('div', {}, [
        el('p', { class: 'eyebrow', text: 'Deductiepuzzels' }),
        el('h1', { text: 'Puzzels die je uitredeneert' }),
        el('p', {
          class: 'lede',
          text: 'Een handvol verdachten, een paar aanwijzingen, en één antwoord dat past. Je komt er door te schrappen wat niet kan. Gokken hoeft nooit, ook niet bij de moeilijkste.',
        }),
      ]),
      el('div', { class: 'hero-actions' }, [
        el('a', {
          class: 'btn btn-primary',
          href: `#/puzzel/${puzzleId(instap[0])}`,
          text: 'Begin bij de eerste zaak',
        }),
        el('a', { class: 'btn', href: '#/puzzels', text: `Alle ${CATALOG.length} puzzels` }),
      ]),
      el('p', {
        class: 'hero-note',
        text: 'Geen account nodig. Je voortgang blijft in deze browser bewaard.',
      }),
      voorbeeld,
    ])
  );

  // ------------------------------------------------------------- stappen
  mount.append(
    el('section', { class: 'section' }, [
      el('div', { class: 'section-head' }, [el('h2', { text: 'Zo werkt het' })]),
      el('div', { class: 'steps' },
        STAPPEN.map((s, i) =>
          el('div', { class: 'step' }, [
            el('div', { class: 'step-n', text: String(i + 1) }),
            el('h3', { text: s.kop }),
            el('p', { text: s.tekst }),
          ])
        )
      ),
    ])
  );

  // ------------------------------------------------------------ instap
  mount.append(
    el('section', { class: 'section' }, [
      el('div', { class: 'section-head' }, [
        el('h2', { text: 'Begin hier' }),
        el('p', { text: `${instap.length} zaken die stap voor stap zwaarder worden.` }),
      ]),
      el('div', { class: 'rows' }, instap.map((entry, i) => puzzelRij(entry, done, i + 1, bekeken))),
    ])
  );

  // ------------------------------------------------------------ werelden
  mount.append(
    el('section', { class: 'section' }, [
      el('div', { class: 'section-head' }, [
        el('h2', { text: 'Of kies een genre' }),
        el('a', { class: 'link-more', href: '#/puzzels', text: 'Alle puzzels bekijken' }),
      ]),
      el('div', { class: 'tiles' },
        WORLDS.map((w) => {
          const aantal = CATALOG.filter((p) => p.wereld === w.id).length;
          return el('a', { class: 'tile', href: `#/puzzels?wereld=${w.id}` }, [
            el('span', { class: 'tile-scene' }, sceneVoor(w.id, w.accent)),
            el('span', { class: 'tile-body' }, [
              el('span', { class: 'tile-name', text: `${w.icon} ${w.name}` }),
              el('span', { class: 'tile-sub', text: w.blurb }),
              el('span', { class: 'tile-count', text: `${aantal} puzzels` }),
            ]),
          ]);
        })
      ),
    ])
  );

  // ----------------------------------------------------------- zelf maken
  mount.append(
    el('section', { class: 'section' }, [
      el('div', { class: 'section-head' }, [el('h2', { text: 'Of maak er zelf een' })]),
      el('p', {
        class: 'lede',
        text: 'Kies wat je uitzoekt, waar het speelt, in welke vorm en hoe moeilijk. De puzzel wordt ter plekke gebouwd, en je kunt hem met een link delen.',
      }),
      el('a', { class: 'btn', href: '#/maken', text: 'Zelf een puzzel maken' }),
    ])
  );
}

// Een puzzel als rij: nummer, titel met ondertitel, en rechts de zwaarte.
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


// Een puzzel als kaart in plaats van als regel.
//
// De bibliotheek was een lijst met tekst en verder niets. Een kaart laat
// meteen zien in welke wereld je terechtkomt: de sfeertekening van dat genre
// als omslag, de kleur van dat genre eromheen, en het teken van het speltype
// op een penning in de hoek. Opgelost staat erop als stempel.
// Een plattegrond om naar te kijken, niet om in te spelen: hij staat op de
// voordeur als voorproefje. Daarom een leeg bord - niemand neergezet, geen
// kruisjes - en een link die je naar de echte puzzel brengt.
function bordVoorbeeld(entry) {
  let puzzle;
  try {
    puzzle = buildPuzzle(catalogSettings(entry));
  } catch {
    return null;
  }
  if (puzzle.kind !== 'kamer') return null;

  const leeg = {
    plaats: {},
    kruis: new Set(),
    schets: {},
    gekozen: -1,
    plaatsVanCel: () => null,
    fout: new Set(),
  };
  const bord = renderKamerbord(puzzle, leeg, { klikCel: () => {} });
  return el('a', {
    class: 'hero-bord',
    href: `#/puzzel/${puzzleId(entry)}`,
    'aria-label': `Open ${entry.titel}`,
  }, [bord, el('span', { class: 'hero-bord-label', text: entry.titel })]);
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
    [1, 2, 3, 4, 5].map((n) => el('span', { class: n <= entry.niveau ? 'dot on' : 'dot' })));

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
