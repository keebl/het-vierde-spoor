// De bibliotheek. Vier keuzelijsten in plaats van negentien knoppen, en de
// puzzels gegroepeerd per decor zodat je iets leest in plaats van scant.

import { el } from './boards.js';
import { puzzelKaart } from './home.js';
import { CATALOG } from '../content/catalog.js';
import { WORLDS, WORLD_BY_ID } from '../content/worlds.js';
import { ASSIGNMENTS, MECHANICS } from '../content/assignments.js';
import { LEVELS, LEVEL_IDS } from '../engine/difficulty.js';
import { solvedIds, onthuldIds } from './state.js';
import { puzzleId } from '../puzzle.js';

// Twee keuzelijsten is genoeg. 'Wat je uitzoekt' en 'Decor' zijn eruit: de
// puzzels staan al per decor gegroepeerd, en wat je uitzoekt is bijna altijd
// hetzelfde. Minder knoppen boven de lijst, meer lijst.
const FILTERS = [
  { key: 'mechaniek', label: 'Soort spel', opties: () => MECHANICS.map((m) => [m.id, m.name]) },
  { key: 'wereld', label: 'Genre', opties: () => WORLDS.map((w) => [w.id, `${w.icon} ${w.name}`]) },
  { key: 'niveau', label: 'Moeilijkheidsgraad', opties: () => LEVEL_IDS.map((l) => [String(l), `${l} - ${LEVELS[l].label}`]) },
];

// Het decorfilter blijft wel werken via de link (#/puzzels?wereld=noir), want
// de tegels op de voorpagina wijzen daarheen.
const EXTRA_FILTERS = ['opdracht'];

export function renderLibrary(mount, query = {}) {
  const done = solvedIds();
  const bekeken = onthuldIds();
  const actief = {};
  for (const f of FILTERS) if (query[f.key]) actief[f.key] = query[f.key];

  for (const k of EXTRA_FILTERS) if (query[k]) actief[k] = query[k];
  if (query.open === '1') actief.open = '1';

  const alleSleutels = [...FILTERS.map((f) => f.key), ...EXTRA_FILTERS];
  const alleenOpen = query.open === '1';
  const lijst = CATALOG
    .filter((p) => alleSleutels.every((k) => !actief[k] || String(p[k]) === String(actief[k])))
    .filter((p) => !alleenOpen || !done.has(puzzleId(p)))
    // Oplopend in moeilijkheid: je wilt niet van Meesterlijk naar Beginner
    // springen terwijl je een lijst afwerkt.
    .sort((a, b) => a.niveau - b.niveau || a.titel.localeCompare(b.titel));

  mount.replaceChildren();
  mount.append(
    el('p', { class: 'eyebrow', text: 'Bibliotheek' }),
    el('h1', { text: 'Alle puzzels' }),
    el('p', {
      class: 'lede',
      text: `${CATALOG.length} zaken in vier soorten spel en vijf moeilijkheidsgraden. Hoe hoger het niveau, hoe verder je moet doorredeneren voordat er iets vastligt.`,
    })
  );

  // --------------------------------------------------------- keuzelijsten
  const balk = el('div', { class: 'filters' });
  for (const f of FILTERS) {
    const sel = el('select', { 'aria-label': f.label });
    sel.append(el('option', { value: '', text: f.label }));
    for (const [waarde, naam] of f.opties()) {
      const opt = el('option', { value: waarde, text: naam });
      if (String(actief[f.key] ?? '') === waarde) opt.selected = true;
      sel.append(opt);
    }
    sel.addEventListener('change', () => {
      const volgende = { ...actief };
      if (sel.value) volgende[f.key] = sel.value;
      else delete volgende[f.key];
      location.hash = `#/puzzels${toQuery(volgende)}`;
    });
    balk.append(el('span', { class: 'select-wrap' }, sel));
  }

  const openKnop = el('button', {
    class: 'btn btn-sm',
    type: 'button',
    'aria-pressed': String(alleenOpen),
    text: 'Alleen nog niet opgelost',
  });
  openKnop.addEventListener('click', () => {
    const volgende = { ...actief };
    if (!alleenOpen) volgende.open = '1';
    location.hash = `#/puzzels${toQuery(volgende)}`;
  });
  balk.append(openKnop);

  if (Object.keys(actief).length || alleenOpen) {
    const wis = el('button', { class: 'btn btn-sm btn-quiet', type: 'button', text: 'Filters wissen' });
    wis.addEventListener('click', () => { location.hash = '#/puzzels'; });
    balk.append(wis);
  }

  const opgelost = CATALOG.filter((p) => done.has(puzzleId(p))).length;
  balk.append(el('span', {
    class: 'filter-count',
    text: lijst.length === CATALOG.length
      ? `${opgelost} van ${CATALOG.length} opgelost`
      : `${lijst.length} van ${CATALOG.length} puzzels · ${opgelost} opgelost`,
  }));
  mount.append(balk);

  if (!lijst.length) {
    mount.append(
      el('div', { class: 'empty' }, [
        el('p', { text: 'Geen puzzel met deze combinatie.' }),
        el('a', { class: 'btn', href: '#/maken', text: 'Maak hem zelf' }),
      ])
    );
    return;
  }

  // Zonder decorfilter groeperen we per decor: dat geeft de lijst koppen en
  // leesrust. Met een filter aan is een platte lijst duidelijker.
  if (actief.wereld) {
    mount.append(el('div', { class: 'kaarten' }, lijst.map((e) => puzzelKaart(e, done, bekeken))));
    return;
  }

  for (const w of WORLDS) {
    const vanWereld = lijst.filter((p) => p.wereld === w.id);
    if (!vanWereld.length) continue;
    mount.append(
      el('section', { class: 'section' }, [
        el('div', { class: 'section-head' }, [
          el('h2', { text: `${w.icon} ${WORLD_BY_ID.get(w.id).name}` }),
          el('p', { text: w.blurb }),
        ]),
        el('div', { class: 'kaarten' }, vanWereld.map((e) => puzzelKaart(e, done, bekeken))),
      ])
    );
  }
}

function toQuery(obj) {
  const paren = Object.entries(obj).filter(([, v]) => v);
  if (!paren.length) return '';
  return '?' + paren.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
}
