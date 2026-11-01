// De bibliotheek: alle kant-en-klare puzzels, met filters op opdracht,
// wereld, mechaniek en niveau.

import { el } from './boards.js';
import { CATALOG } from '../content/catalog.js';
import { WORLD_BY_ID } from '../content/worlds.js';
import { ASSIGNMENT_BY_ID, ASSIGNMENTS, MECHANICS, MECHANIC_BY_ID } from '../content/assignments.js';
import { LEVELS, LEVEL_IDS } from '../engine/difficulty.js';
import { WORLDS } from '../content/worlds.js';
import { solvedIds } from './state.js';
import { puzzleId } from '../puzzle.js';

const filters = { opdracht: null, wereld: null, mechaniek: null, niveau: null };

export function renderLibrary(mount) {
  const done = solvedIds();
  mount.replaceChildren();
  mount.append(
    el('h1', { text: 'Bibliotheek' }),
    el('p', {
      class: 'lede',
      text: `${CATALOG.length} puzzels, verdeeld over ${WORLDS.length} werelden, ${ASSIGNMENTS.length} soorten opdracht en ${MECHANICS.length} mechanieken. Nieuw hier? Begin bij de instapreeks onderaan.`,
    })
  );

  const results = el('div', { class: 'cards' });

  const chip = (label, group, value) => {
    const active = filters[group] === value;
    const b = el('button', { class: 'chip', type: 'button', 'aria-pressed': String(active), text: label });
    b.addEventListener('click', () => {
      filters[group] = active ? null : value;
      renderLibrary(mount);
    });
    return b;
  };

  const rows = el('div', { class: 'filters' });
  const row = (title, kids) => el('div', { class: 'filter-row' }, [el('h3', { text: title }), ...kids]);
  rows.append(row('Opdracht', ASSIGNMENTS.map((a) => chip(a.short, 'opdracht', a.id))));
  rows.append(row('Wereld', WORLDS.map((w) => chip(`${w.icon} ${w.name}`, 'wereld', w.id))));
  rows.append(row('Mechaniek', MECHANICS.map((m) => chip(m.name, 'mechaniek', m.id))));
  rows.append(row('Niveau', LEVEL_IDS.map((l) => chip(`${l} - ${LEVELS[l].label}`, 'niveau', l))));
  mount.append(rows);

  const list = CATALOG.filter((p) =>
    (!filters.opdracht || p.opdracht === filters.opdracht) &&
    (!filters.wereld || p.wereld === filters.wereld) &&
    (!filters.mechaniek || p.mechaniek === filters.mechaniek) &&
    (!filters.niveau || p.niveau === filters.niveau)
  );

  if (!list.length) {
    mount.append(el('p', { class: 'empty', text: 'Geen puzzel met deze combinatie. Maak hem zelf: ga naar Zelf maken.' }));
    return;
  }

  for (const entry of list) {
    const world = WORLD_BY_ID.get(entry.wereld);
    const id = puzzleId(entry);
    const card = el('a', { class: 'card', href: `#/puzzel/${id}` }, [
      el('div', { class: 'card-top' }, [
        el('span', { class: 'card-world', text: `${world.icon} ${world.name}` }),
        done.has(id) ? el('span', { class: 'tag', text: 'opgelost' }) : null,
      ]),
      el('span', { class: 'card-title', text: entry.titel }),
      el('span', { class: 'card-sub', text: entry.sub }),
      el('div', { class: 'card-meta' }, [
        el('span', { class: 'tag', text: ASSIGNMENT_BY_ID.get(entry.opdracht).short }),
        el('span', { class: 'tag', text: MECHANIC_BY_ID.get(entry.mechaniek).name }),
        el('span', { class: 'tag tag-level', text: `niveau ${entry.niveau}` }),
      ]),
    ]);
    card.style.setProperty('--accent', world.accent);
    results.append(card);
  }
  mount.append(results);
}
