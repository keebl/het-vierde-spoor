// De bibliotheek. Vier keuzelijsten in plaats van negentien knoppen, en de
// puzzels gegroepeerd per decor zodat je iets leest in plaats van scant.

import { el } from './boards.js';
import { puzzelRij } from './home.js';
import { CATALOG } from '../content/catalog.js';
import { WORLDS, WORLD_BY_ID } from '../content/worlds.js';
import { ASSIGNMENTS, MECHANICS } from '../content/assignments.js';
import { LEVELS, LEVEL_IDS } from '../engine/difficulty.js';
import { solvedIds } from './state.js';

const FILTERS = [
  { key: 'opdracht', label: 'Wat je uitzoekt', opties: () => ASSIGNMENTS.map((a) => [a.id, a.name]) },
  { key: 'wereld', label: 'Decor', opties: () => WORLDS.map((w) => [w.id, `${w.icon} ${w.name}`]) },
  { key: 'mechaniek', label: 'Vorm', opties: () => MECHANICS.map((m) => [m.id, m.name]) },
  { key: 'niveau', label: 'Zwaarte', opties: () => LEVEL_IDS.map((l) => [String(l), `${l} - ${LEVELS[l].label}`]) },
];

export function renderLibrary(mount, query = {}) {
  const done = solvedIds();
  const actief = {};
  for (const f of FILTERS) if (query[f.key]) actief[f.key] = query[f.key];

  const lijst = CATALOG.filter((p) =>
    FILTERS.every((f) => !actief[f.key] || String(p[f.key]) === String(actief[f.key]))
  );

  mount.replaceChildren();
  mount.append(
    el('p', { class: 'eyebrow', text: 'Bibliotheek' }),
    el('h1', { text: 'Alle puzzels' }),
    el('p', {
      class: 'lede',
      text: 'Veertig zaken, verdeeld over zes decors en vijf zwaartes. Elke puzzel is met logica op te lossen en heeft precies één antwoord.',
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

  if (Object.keys(actief).length) {
    const wis = el('button', { class: 'btn btn-sm btn-quiet', type: 'button', text: 'Filters wissen' });
    wis.addEventListener('click', () => { location.hash = '#/puzzels'; });
    balk.append(wis);
  }

  balk.append(el('span', {
    class: 'filter-count',
    text: lijst.length === CATALOG.length ? `${lijst.length} puzzels` : `${lijst.length} van ${CATALOG.length}`,
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
    mount.append(el('div', { class: 'rows' }, lijst.map((e) => puzzelRij(e, done))));
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
        el('div', { class: 'rows' }, vanWereld.map((e) => puzzelRij(e, done))),
      ])
    );
  }
}

function toQuery(obj) {
  const paren = Object.entries(obj).filter(([, v]) => v);
  if (!paren.length) return '';
  return '?' + paren.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
}
