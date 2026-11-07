// Zelf een puzzel maken. Vier keuzes en een seed; dezelfde seed geeft altijd
// dezelfde puzzel, dus wat je maakt kun je delen.

import { el } from './boards.js';
import { WORLDS } from '../content/worlds.js';
import { ASSIGNMENTS, MECHANIC_BY_ID, ZICHTBARE_MECHANICS } from '../content/assignments.js';
import { LEVELS, ZICHTBARE_LEVEL_IDS, KAMER_LEVELS } from '../engine/difficulty.js';
import { randomSeed } from '../engine/rng.js';
import { puzzleId } from '../puzzle.js';
import { aiEnabled, setAiEnabled } from '../ai/flavour.js';
import { aiEndpoint } from '../ai/endpoint.js';

// Speurdoku staat voorop: dat is het hoofdspel, en dan hoort het ook de
// stand te zijn waar je op uitkomt als je niets kiest.
const keuze = {
  opdracht: 'dader',
  wereld: 'noir',
  mechaniek: 'kamer',
  niveau: 3,
  seed: randomSeed(),
};

// Welke opdrachten je nog kunt kiezen: alleen die met een soort spel dat te
// zien is. Zolang dat alleen het Speurdoku is, blijft 'Wie was het?' over.
// Zonder deze zeef kies je een opdracht waar geen Speurdoku bij kan, en krijg
// je stilzwijgend een ander soort puzzel dan je ziet staan.
const TEKIEZEN = ASSIGNMENTS.filter(
  (a) => a.mechanics.some((m) => ZICHTBARE_MECHANICS.some((z) => z.id === m)),
);

export function renderGenerator(mount) {
  if (!TEKIEZEN.some((a) => a.id === keuze.opdracht)) keuze.opdracht = TEKIEZEN[0].id;
  const assignment = ASSIGNMENTS.find((a) => a.id === keuze.opdracht);
  const kanZien = assignment.mechanics.filter((m) => ZICHTBARE_MECHANICS.some((z) => z.id === m));
  if (!kanZien.includes(keuze.mechaniek)) keuze.mechaniek = kanZien[0];

  mount.replaceChildren();
  mount.append(
    el('p', { class: 'eyebrow', text: 'Generator' }),
    el('h1', { text: 'Maak je eigen puzzel' }),
    el('p', {
      class: 'lede',
      text: 'Kies wat je wilt uitzoeken, waar het speelt, in welke vorm en hoe moeilijk. De puzzel wordt ter plekke gebouwd; met dezelfde seed krijg je hem altijd terug.',
    })
  );

  const form = el('div', { class: 'form' });

  const optButton = (group, value, name, note, disabled) => {
    const b = el('button', {
      class: 'opt',
      type: 'button',
      'aria-pressed': String(keuze[group] === value),
      disabled: disabled ? '' : null,
    }, [
      el('span', { class: 'opt-name', text: name }),
      note ? el('small', { text: note }) : null,
    ]);
    if (!disabled) {
      b.addEventListener('click', () => {
        keuze[group] = value;
        renderGenerator(mount);
      });
    }
    return b;
  };

  const field = (label, kids, cls = 'options') =>
    el('div', { class: 'field' }, [el('span', { class: 'label', text: label }), el('div', { class: cls }, kids)]);

  form.append(field('Opdracht', TEKIEZEN.map((a) => optButton('opdracht', a.id, a.name, a.blurb))));
  form.append(field('Genre', WORLDS.map((w) => optButton('wereld', w.id, `${w.icon} ${w.name}`, w.blurb))));
  // Het soort spel staat er niet meer bij: voorlopig is alles een Speurdoku.
  // Zie ZICHTBARE_MECHANICS in assignments.js. Zodra er meer dan één soort
  // te zien is, komt dit veld terug.
  if (ZICHTBARE_MECHANICS.length > 1) {
    form.append(field('Soort spel', ZICHTBARE_MECHANICS.map((m) => {
      const can = assignment.mechanics.includes(m.id);
      return optButton('mechaniek', m.id, m.name, can ? m.blurb : `Niet mogelijk bij ${assignment.name.toLowerCase()}`, !can);
    })));
  }
  form.append(field('Niveau', ZICHTBARE_LEVEL_IDS.map((l) => {
    const p = LEVELS[l];
    const b = el('button', {
      class: 'opt level-btn',
      type: 'button',
      'aria-pressed': String(keuze.niveau === l),
    }, [
      el('b', { text: String(l) }),
      el('span', { class: 'opt-name', text: p.label }),
      // Bij een Speurdoku zegt "vier rijen" niets: daar gaat het om de maat
      // van het bord. Dus staat er bij dat speltype wat er echt verandert.
      el('small', {
        text: keuze.mechaniek === 'kamer'
          ? `${KAMER_LEVELS[l].n} bij ${KAMER_LEVELS[l].n}, ${p.style === 'shallow' ? 'doorstrepen' : 'aanname nodig'}`
          : `${p.slots} rijen, ${p.style === 'shallow' ? 'doorstrepen' : 'aanname nodig'}`,
      }),
    ]);
    b.addEventListener('click', () => { keuze.niveau = l; renderGenerator(mount); });
    return b;
  }), 'levels'));

  const seedInput = el('input', { type: 'text', value: keuze.seed, 'aria-label': 'Seed' });
  seedInput.addEventListener('input', () => { keuze.seed = seedInput.value.trim(); });
  const dice = el('button', { class: 'btn', type: 'button', text: 'Nieuwe seed' });
  dice.addEventListener('click', () => { keuze.seed = randomSeed(); renderGenerator(mount); });
  form.append(field('Seed', [seedInput, dice], 'row-inline'));

  // De AI-laag herschrijft alleen de stijl van de teksten. Elke herschreven
  // aanwijzing wordt nagekeken op het behoud van alle eigennamen; faalt dat,
  // dan blijft de originele zin staan.
  // Zonder eindpunt valt er niets te herschrijven: dan staat de site ergens
  // waar geen server bij hoort. De knop daar laten staan alsof hij iets doet,
  // is misleidend.
  const kan = !!aiEndpoint();
  const aiBtn = el('button', {
    class: 'opt',
    type: 'button',
    'aria-pressed': String(kan && aiEnabled()),
    disabled: kan ? null : 'disabled',
  }, [
    el('span', {
      class: 'opt-name',
      text: kan ? (aiEnabled() ? 'AI-teksten: aan' : 'AI-teksten: uit') : 'AI-teksten: niet beschikbaar',
    }),
    el('small', {
      text: kan
        ? 'Laat de verhaalteksten herschrijven door Claude. De logica blijft altijd die van de generator: een herschrijving die een naam, een ontkenning, een getal of een keuze aantast, wordt niet gebruikt.'
        : 'De puzzels uit de bibliotheek hebben hun herschreven tekst al bij zich. Voor een zelfgemaakte puzzel is er een server met een API-key nodig, en die hoort niet bij deze site. Draai hem lokaal met npm start, dan kan het wel.',
    }),
  ]);
  if (kan) {
    aiBtn.addEventListener('click', () => { setAiEnabled(!aiEnabled()); renderGenerator(mount); });
  }
  form.append(field('Verhaalteksten', [aiBtn]));

  const go = el('button', { class: 'btn btn-primary', type: 'button', text: 'Maak de puzzel' });
  go.addEventListener('click', () => {
    if (!keuze.seed) keuze.seed = randomSeed();
    const heen = puzzleId(keuze);
    // Een volgende klik hoort een andere puzzel te geven, niet dezelfde.
    // Wil je er een terug, dan typ je de seed gewoon weer in.
    keuze.seed = randomSeed();
    location.hash = `#/puzzel/${heen}`;
  });
  form.append(el('div', { class: 'row-inline' }, [go]));

  mount.append(form);
}
