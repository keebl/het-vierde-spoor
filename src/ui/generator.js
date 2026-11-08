// Zelf een puzzel maken. Vier keuzes en een seed; dezelfde seed geeft altijd
// dezelfde puzzel, dus wat je maakt kun je delen.

import { el } from './boards.js';
import { ASSIGNMENTS, MECHANIC_BY_ID, ZICHTBARE_MECHANICS } from '../content/assignments.js';
import { LEVELS, ZICHTBARE_LEVEL_IDS, KAMER_LEVELS } from '../engine/difficulty.js';
import { bordminiatuur } from './bordminiatuur.js';
import { randomSeed } from '../engine/rng.js';
import { puzzleId, wereldVoorSeed } from '../puzzle.js';
import { laatsteNiveau, zetNiveau } from './state.js';

// De Reconstructie staat voorop: dat is het hoofdspel, en dan hoort het ook de
// stand te zijn waar je op uitkomt als je niets kiest.
//
// Het decor staat hier niet meer bij. Je koos uit acht genres, en dat is
// eraf: je krijgt er een, je kiest er geen. Daarmee is dit scherm terug tot
// wat het hoort te zijn - hoe zwaar, en welke seed als je er een wilt
// terughalen. De wereld zit nog wel in de seed, zodat een gedeelde link
// precies dezelfde puzzel geeft.
const keuze = {
  opdracht: 'dader',
  wereld: 'noir',
  mechaniek: 'kamer',
  niveau: laatsteNiveau(),
  seed: randomSeed(),
};



// Welke opdrachten je nog kunt kiezen: alleen die met een soort spel dat te
// zien is. Zolang dat alleen de Reconstructie is, blijft 'Wie was het?' over.
// Zonder deze zeef kies je een opdracht waar geen Reconstructie bij kan, en krijg
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
    el('p', { class: 'eyebrow', text: 'Nieuwe zaak' }),
    el('h1', { text: 'Nog een puzzel' }),
    el('p', {
      class: 'lede',
      text: 'Kies hoe zwaar je het wilt hebben en druk op de knop. Het decor krijg je, dat kies je niet: elke puzzel speelt ergens anders. Hij wordt ter plekke gebouwd en ter plekke nagerekend.',
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

  // Eén opdracht over, dus geen veld: een keuzerij met één knop is geen
  // keuze maar een mededeling. Hetzelfde gold voor 'Soort spel' hieronder.
  if (TEKIEZEN.length > 1) {
    form.append(field('Opdracht', TEKIEZEN.map((a) => optButton('opdracht', a.id, a.name, a.blurb))));
  }
  // Het soort spel staat er niet meer bij: voorlopig is alles een Reconstructie.
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
      // Het plattegrondje staat bovenaan de knop: je ziet eerst hoe groot het
      // bord is en leest daarna pas hoe het heet.
      keuze.mechaniek === 'kamer' ? bordminiatuur(l, KAMER_LEVELS[l]) : null,
      el('b', { text: String(l) }),
      el('span', { class: 'opt-name', text: p.label }),
      // Bij een Reconstructie zegt "vier rijen" niets: daar gaat het om de maat
      // van het bord. Dus staat er bij dat speltype wat er echt verandert.
      el('small', {
        text: keuze.mechaniek === 'kamer'
          ? `${KAMER_LEVELS[l].n} bij ${KAMER_LEVELS[l].n}, ${p.style === 'shallow' ? 'doorstrepen' : 'aanname nodig'}`
          : `${p.slots} rijen, ${p.style === 'shallow' ? 'doorstrepen' : 'aanname nodig'}`,
      }),
    ]);
    b.addEventListener('click', () => { keuze.niveau = l; zetNiveau(l); renderGenerator(mount); });
    return b;
  }), 'levels'));

  // Geen seedveld meer.
  //
  // Hier stond een invulveld met "spoor-1216" erin, eerst open en daarna
  // achter een klepje. Allebei fout: een seed is een intern nummer, en wie
  // hem ziet weet niet wat hij ermee moet. Wat iemand eigenlijk wil is een
  // puzzel kunnen bewaren, en daar is geen account voor nodig en ook geen
  // nummer om over te typen - de puzzel heeft al een eigen link. Op de
  // puzzel zelf staat daarom de knop "Bewaar deze puzzel", die hem
  // kopieert met de uitleg dat je er een bladwijzer van kunt maken.
  //
  // De seed zit nog wel in die link, dus hij doet nog steeds wat hij deed.
  // Hij staat alleen niet meer in het zicht van iemand die gewoon wil
  // beginnen.

  // Geen schakelaar voor de verhaalteksten.
  //
  // Hier stond "AI-teksten: aan/uit". Twee dingen klopten daar niet aan:
  // het is geen keuze van de speler of een zin mooier geschreven is, en
  // hij stond standaard uit - dus hij deed nooit iets tenzij je hem had
  // gevonden. Nu staan ze aan zodra er iets achter zit (zie aiEnabled), en
  // online zit er met opzet niets achter. Dan hoeft er ook niets te staan.

  const go = el('button', { class: 'btn btn-primary btn-groot', type: 'button', text: 'Begin nieuwe puzzel' });
  go.addEventListener('click', () => {
    if (!keuze.seed) keuze.seed = randomSeed();
    keuze.wereld = wereldVoorSeed(keuze.seed);
    const heen = puzzleId(keuze);
    // Een volgende klik hoort een andere puzzel te geven, niet dezelfde.
    // Wil je er een terug, dan typ je de seed gewoon weer in.
    keuze.seed = randomSeed();
    location.hash = `#/puzzel/${heen}`;
  });
  form.append(el('div', { class: 'row-inline' }, [go]));

  mount.append(form);
}
