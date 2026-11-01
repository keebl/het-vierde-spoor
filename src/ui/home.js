// De voordeur. Wie hier voor het eerst komt moet binnen een scherm weten:
// wat is dit, wat ga ik doen, en waar begin ik. Pas daarna het aanbod.

import { el } from './boards.js';
import { CATALOG } from '../content/catalog.js';
import { WORLDS } from '../content/worlds.js';
import { LEVELS } from '../engine/difficulty.js';
import { solvedIds } from './state.js';
import { puzzleId } from '../puzzle.js';
import { sceneVoor } from './scenes.js';

const STAPPEN = [
  {
    kop: 'Lees de aanwijzingen',
    tekst: 'Elke aanwijzing is waar. Samen sluiten ze alles uit op één mogelijkheid na.',
  },
  {
    kop: 'Streep door wat niet kan',
    tekst: 'Klik in het raster: een kruis voor uitgesloten, een vink voor zeker. Een vink streept de rest van zijn rij en kolom vanzelf door.',
  },
  {
    kop: 'Hou over wat moet',
    tekst: 'Wat overblijft is het antwoord. Vastgelopen? De hint wijst de aanwijzing aan die je over het hoofd ziet.',
  },
];

export function renderHome(mount) {
  const done = solvedIds();
  const instap = CATALOG.filter((p) => p.seed.startsWith('start-'));

  mount.replaceChildren();

  // ---------------------------------------------------------------- hero
  mount.append(
    el('section', { class: 'hero' }, [
      el('div', {}, [
        el('p', { class: 'eyebrow', text: 'Deductiepuzzels' }),
        el('h1', { text: 'Puzzels waar je je weg naartoe redeneert' }),
        el('p', {
          class: 'lede',
          text: 'Een handvol verdachten, een paar aanwijzingen, en precies één antwoord dat klopt. Je lost ze op door uit te sluiten wat niet kan, nooit door te gokken: elke puzzel is vooraf nagerekend op precies één oplossing.',
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
        el('p', { text: 'Vijf zaken die stap voor stap zwaarder worden.' }),
      ]),
      el('div', { class: 'rows' }, instap.map((entry, i) => puzzelRij(entry, done, i + 1))),
    ])
  );

  // ------------------------------------------------------------ werelden
  mount.append(
    el('section', { class: 'section' }, [
      el('div', { class: 'section-head' }, [
        el('h2', { text: 'Of kies een decor' }),
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
        text: 'Kies wat je uitzoekt, waar het speelt, hoe je het oplost en hoe zwaar het mag zijn. De puzzel wordt ter plekke gebouwd en nagerekend, en je kunt hem delen met een link.',
      }),
      el('a', { class: 'btn', href: '#/maken', text: 'Zelf een puzzel maken' }),
    ])
  );
}

// Een puzzel als rij: nummer, titel met ondertitel, en rechts de zwaarte.
export function puzzelRij(entry, done, nummer) {
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
      done.has(id) ? el('span', { class: 'done-mark', text: '✓ opgelost' }) : null,
      el('span', { text: niveau.label }),
      bolletjes,
    ]),
  ]);
}
