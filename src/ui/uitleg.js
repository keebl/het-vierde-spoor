// Uitleg. Bedoeld voor iemand die net zijn eerste puzzel heeft geopend,
// niet voor iemand die de code kent. Dus: eerst spelen, dan de begrippen.

import { el } from './boards.js';
import { WORLDS } from '../content/worlds.js';
import { ASSIGNMENTS, MECHANICS } from '../content/assignments.js';
import { LEVELS, LEVEL_IDS } from '../engine/difficulty.js';

const tabel = (rijen) =>
  el('table', { class: 'deftable' }, [
    el('tbody', {}, rijen.map(([kop, uitleg]) =>
      el('tr', {}, [el('th', { scope: 'row', text: kop }), el('td', { text: uitleg })])
    )),
  ]);

const sectie = (titel, kids, onderkop) =>
  el('section', { class: 'section' }, [
    el('div', { class: 'section-head' }, [
      el('h2', { text: titel }),
      onderkop ? el('p', { text: onderkop }) : null,
    ]),
    ...[].concat(kids),
  ]);

export function renderUitleg(mount) {
  mount.replaceChildren();

  mount.append(
    el('p', { class: 'eyebrow', text: 'Uitleg' }),
    el('h1', { text: 'Hoe je deze puzzels oplost' }),
    el('p', {
      class: 'lede',
      text: 'Je krijgt een lijst aanwijzingen die allemaal waar zijn. Samen laten ze precies één mogelijkheid heel. Je zoekt die niet door te raden, maar door alles weg te strepen wat niet kan.',
    })
  );

  mount.append(
    sectie('Het raster', [
      el('div', { class: 'prose' }, [
        el('p', {}, [
          el('b', { text: 'Elke rij hoort bij precies één kolom. ' }),
          el('span', { text: 'Had mevrouw Dufour de aansteker, dan had niemand anders die, en zij had verder niets anders. Daarom zet een vink in een vakje automatisch kruisjes in de rest van zijn rij en kolom.' }),
        ]),
        el('p', { text: 'Klikken loopt door drie standen: leeg, kruis (uitgesloten), vink (zeker). Een aanwijzing die je hebt verwerkt kun je wegstrepen door erop te klikken, zodat je ziet wat je nog niet hebt gebruikt.' }),
        el('p', { text: 'Loop je vast, dan verklapt de hint één vakje en zegt erbij uit welke aanwijzing dat volgt. Controleer zegt alleen of wat je tot nu toe hebt ingevuld klopt, zonder iets weg te geven.' }),
      ]),
    ], 'De kern van elke puzzel, in drie alinea’s.')
  );

  mount.append(
    sectie('Wat je uitzoekt', tabel(ASSIGNMENTS.map((a) => [a.name, a.blurb])),
      'Niet elke puzzel is een misdrijf.')
  );

  mount.append(
    sectie('Soorten spel', tabel(MECHANICS.map((m) => [m.name, m.blurb])),
      'Dezelfde logica, drie manieren om hem voor je neus te krijgen.')
  );

  mount.append(
    sectie('Moeilijkheidsgraad', [
      tabel(LEVEL_IDS.map((l) => {
        const lv = LEVELS[l];
        return [
          `${l}. ${lv.label}`,
          `${lv.slots} rijen, ${lv.cats} kolomgroepen. ${
            lv.style === 'shallow'
              ? 'Gegarandeerd op te lossen door stap voor stap door te strepen.'
              : 'Doorstrepen alleen brengt je er niet: je moet ergens iets aannemen en die aanname onderuithalen.'
          }`,
        ];
      })),
      el('p', {
        class: 'legend',
        text: 'Boven elke puzzel staat welke van de twee het geworden is, zodat je weet of je iets over het hoofd ziet of dat er echt een aanname nodig is.',
      }),
    ], 'Vijf stappen, van tien minuten tot een avond.')
  );

  mount.append(
    sectie('Waar het speelt', tabel(WORLDS.map((w) => [`${w.icon} ${w.name}`, w.blurb])))
  );

  mount.append(
    sectie('Veelgestelde vragen', [
      el('div', { class: 'prose' }, [
        el('p', {}, [
          el('b', { text: 'Kan een puzzel meerdere antwoorden hebben? ' }),
          el('span', { text: 'Nee. Voordat een puzzel bij jou komt, is machinaal geteld hoeveel oplossingen er zijn; alleen puzzels met er precies één komen erdoor. Ook is elke aanwijzing getoetst: aanwijzingen die je kunt missen zijn weggesneden.' }),
        ]),
        el('p', {}, [
          el('b', { text: 'Moet ik ooit gokken? ' }),
          el('span', { text: 'Nee. Op de eerste drie zwaartes kom je er door puur door te strepen. Op de laatste twee moet je soms iets aannemen en aantonen dat het niet kan — dat is nog steeds redeneren, geen gok.' }),
        ]),
        el('p', {}, [
          el('b', { text: 'Blijft mijn voortgang bewaard? ' }),
          el('span', { text: 'In deze browser wel, zonder account. Op een ander apparaat of in een andere browser begin je opnieuw.' }),
        ]),
        el('p', {}, [
          el('b', { text: 'Wat is die code onder een puzzel? ' }),
          el('span', { text: 'De seed. Dezelfde seed met dezelfde instellingen levert altijd exact dezelfde puzzel op, dus een gedeelde link geeft bij iedereen hetzelfde raster.' }),
        ]),
        el('p', {}, [
          el('b', { text: 'Is dit een kopie van een bestaand puzzelboek? ' }),
          el('span', { text: 'Nee. Logische deductiepuzzels op een raster bestaan sinds de jaren zestig en de techniek erachter is wiskunde, vrij van rechten. Wat beschermd is — merknamen, personages, illustraties, teksten — is hier allemaal eigen werk. Je vindt hier geen bestaande puzzel terug.' }),
        ]),
      ]),
    ])
  );
}
