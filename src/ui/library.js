// De bibliotheek. Vier keuzelijsten in plaats van negentien knoppen, en de
// puzzels gegroepeerd per decor zodat je iets leest in plaats van scant.

import { el } from './boards.js';
import { puzzelKaart } from './home.js';
import { CATALOG } from '../content/catalog.js';
import { ASSIGNMENTS, mechaniekZichtbaar } from '../content/assignments.js';
import { LEVELS, LEVEL_IDS, ZICHTBARE_LEVEL_IDS, KAMER_LEVELS } from '../engine/difficulty.js';
import { solvedIds, onthuldIds } from './state.js';
import { puzzleId } from '../puzzle.js';

// Twee keuzelijsten is genoeg. 'Soort spel' is eruit omdat er voorlopig maar
// één soort te zien is, en 'Wat je uitzoekt' omdat dat bijna altijd hetzelfde
// is. Minder knoppen boven de lijst, meer lijst.
// Het genrefilter is eruit: je kiest nergens op de site meer een decor, en
// dan hoort hier ook geen lijst met acht genres te staan. Via de link
// (#/puzzels?wereld=noir) werkt het nog wel - zie EXTRA_FILTERS.
const FILTERS = [
  { key: 'niveau', label: 'Moeilijkheidsgraad', opties: () => ZICHTBARE_LEVEL_IDS.map((l) => [String(l), `${l} - ${LEVELS[l].label}`]) },
];

// Alleen de Speurdoku's. Zie ZICHTBARE_MECHANICS in assignments.js.
const TEZIEN = CATALOG.filter((p) => mechaniekZichtbaar(p.mechaniek) && ZICHTBARE_LEVEL_IDS.includes(p.niveau));

// Het decorfilter blijft wel werken via de link (#/puzzels?wereld=noir), want
// de tegels op de voorpagina wijzen daarheen.
const EXTRA_FILTERS = ['opdracht', 'wereld'];

export function renderLibrary(mount, query = {}) {
  const done = solvedIds();
  const bekeken = onthuldIds();
  const actief = {};
  for (const f of FILTERS) if (query[f.key]) actief[f.key] = query[f.key];

  for (const k of EXTRA_FILTERS) if (query[k]) actief[k] = query[k];
  if (query.open === '1') actief.open = '1';

  const alleSleutels = [...FILTERS.map((f) => f.key), ...EXTRA_FILTERS];
  const alleenOpen = query.open === '1';
  const lijst = TEZIEN
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
      text: `${TEZIEN.length} zaken in ${ZICHTBARE_LEVEL_IDS.length} moeilijkheidsgraden, van vijf verdachten tot zestien. Hoe hoger het niveau, hoe verder je moet doorredeneren voordat er iets vastligt.`,
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

  const opgelost = TEZIEN.filter((p) => done.has(puzzleId(p))).length;
  balk.append(el('span', {
    class: 'filter-count',
    text: lijst.length === TEZIEN.length
      ? `${opgelost} van ${TEZIEN.length} opgelost`
      : `${lijst.length} van ${TEZIEN.length} puzzels · ${opgelost} opgelost`,
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

  // Gegroepeerd op moeilijkheid, niet op decor.
  //
  // Eerst stond de lijst per wereld: eerst alle catacomben, dan alle
  // landhuizen. Dan kies je een decor en werk je dat af, en loopt de
  // moeilijkheid binnen zo'n blokje alle kanten op. Wat je als speler zoekt
  // is "iets van mijn niveau", niet "nog een keer dat decor". Dus staan de
  // niveaus nu onder elkaar en lopen de decors er doorheen: in één kop zie
  // je een woud naast een ruimtestation naast een crypte.
  if (actief.niveau) {
    mount.append(el('div', { class: 'kaarten' }, lijst.map((e) => puzzelKaart(e, done, bekeken))));
    return;
  }

  for (const niveau of ZICHTBARE_LEVEL_IDS) {
    const vanNiveau = lijst.filter((p) => p.niveau === niveau);
    if (!vanNiveau.length) continue;
    const L = LEVELS[niveau];
    const K = KAMER_LEVELS[niveau];
    mount.append(
      el('section', { class: 'section' }, [
        el('div', { class: 'section-head' }, [
          el('h2', { text: `${niveau} · ${L.label}` }),
          el('p', { text: `${K.n} verdachten op een plattegrond van ${K.n} bij ${K.n}, in ${K.kamers} kamers.` }),
        ]),
        el('div', { class: 'kaarten' }, vanNiveau.map((e) => puzzelKaart(e, done, bekeken))),
      ])
    );
  }
}

function toQuery(obj) {
  const paren = Object.entries(obj).filter(([, v]) => v);
  if (!paren.length) return '';
  return '?' + paren.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
}
