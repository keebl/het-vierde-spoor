// Uitleg. Bedoeld voor iemand die net zijn eerste puzzel heeft geopend,
// niet voor iemand die de code kent. Dus: eerst spelen, dan de begrippen.

import { el } from './boards.js';
import { WORLDS } from '../content/worlds.js';
import { ASSIGNMENTS, MECHANICS } from '../content/assignments.js';
import { LEVELS, LEVEL_IDS, KAMER_LEVELS } from '../engine/difficulty.js';

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
      text: 'Je krijgt een lijst aanwijzingen die allemaal waar zijn. Door te schrappen wat niet kan, blijft er uiteindelijk één mogelijkheid over. Raden hoeft nooit.',
    })
  );

  mount.append(
    sectie('Een Speurdoku', [
      el('div', { class: 'prose' }, [
        el('p', { text: 'Je ziet een plattegrond met kamers en meubels. Daar zet je de figuren op: één per rij en één per kolom, en nooit op een meubelstuk. Een van de figuren is het slachtoffer; waar dat lichaam ligt moet je dus net zo goed uitzoeken.' }),
        el('p', {}, [
          el('b', { text: 'Wie als enige bij het slachtoffer in de kamer blijkt te staan, is de dader. ' }),
          el('span', { text: 'Dat weet je pas als alles op zijn plek staat, en daarom moet je eerst de hele plattegrond rondkrijgen.' }),
        ]),
        el('p', { text: 'Zodra je iemand neerzet, kruist het bord zelf af waar niemand meer kan staan: de rest van die rij en kolom. Weet je het nog niet zeker, zet dan met Schetsen de beginletters van de kandidaten in een vakje. Met Uitsluiten zet je je eigen kruisjes.' }),
      ]),
    ], 'Het hoofdspel: figuren op een plattegrond, een per rij en een per kolom.')
  );

  mount.append(
    sectie('Een Kruisverhoor', [
      el('div', { class: 'prose' }, [
        el('p', {}, [
          el('b', { text: 'Elke rij hoort bij precies één kolom. ' }),
          el('span', { text: 'Had Clara de aansteker, dan had niemand anders die, en zij had verder niets anders. Daarom zet een vink in een vakje automatisch kruisjes in de rest van zijn rij en kolom.' }),
        ]),
        el('p', { text: 'Klikken loopt door drie standen: leeg, kruis (uitgesloten), vink (zeker). Een aanwijzing die je hebt verwerkt kun je wegstrepen door erop te klikken, zodat je ziet wat je nog niet hebt gebruikt.' }),
      ]),
    ], 'Kruisjes en vinkjes tot er een naam overblijft.')
  );

  mount.append(
    sectie('Als je vastloopt', [
      el('div', { class: 'prose' }, [
        el('p', { text: 'De hint vult één vakje voor je in en zegt erbij uit welke aanwijzing dat volgde. Controleer kijkt na wat je tot nu toe hebt ingevuld en omlijnt wat niet klopt — je ziet dus wel dát er iets fout staat, maar niet wat het goede antwoord is.' }),
        el('p', { text: 'Oplossing vult alles in. Dan is de puzzel natuurlijk voorbij.' }),
      ]),
    ])
  );

  mount.append(
    sectie('Wat je uitzoekt', tabel(ASSIGNMENTS.map((a) => [a.name, a.blurb])),
      'Niet elke puzzel is een misdrijf.')
  );

  mount.append(
    sectie('Soorten spel', tabel(MECHANICS.map((m) => [m.name, m.blurb])),
      'Dezelfde logica, vier verschillende vormen.')
  );

  mount.append(
    sectie('Moeilijkheidsgraad', [
      tabel(LEVEL_IDS.map((l) => {
        const lv = LEVELS[l];
        const k = KAMER_LEVELS[l];
        const omvang = `${k.n} bij ${k.n} vakjes in een Speurdoku, ${lv.slots} rijen in een raster.`;
        return [
          `${l}. ${lv.label}`,
          lv.style === 'shallow'
            ? `${omvang} Je komt er door stap voor stap uit te sluiten.`
            : `${omvang} Uitsluiten alleen brengt je er niet: ergens moet je een mogelijkheid aannemen en laten zien dat die niet kan.`,
        ];
      })),
      el('p', {
        class: 'legend',
        text: 'Boven elke puzzel staat welke van de twee het geworden is, zodat je weet of je iets over het hoofd ziet of dat er echt een aanname nodig is.',
      }),
    ], 'Van tien minuten tot een flinke zit.')
  );

  mount.append(
    sectie('Genres', tabel(WORLDS.map((w) => [`${w.icon} ${w.name}`, w.blurb])), 'Dezelfde spellen, een ander decor en een ander verhaal.')
  );

  mount.append(
    sectie('Veelgestelde vragen', [
      el('div', { class: 'prose' }, [
        el('p', {}, [
          el('b', { text: 'Moet ik ooit gokken? ' }),
          el('span', { text: 'Nee. Op de eerste drie moeilijkheidsgraden kom je er door stap voor stap uit te sluiten. Op de twee zwaarste moet je soms een mogelijkheid aannemen en laten zien dat die tot een tegenspraak leidt — dat is nog steeds redeneren.' }),
        ]),
        el('p', {}, [
          el('b', { text: 'Hoe weet ik dat een puzzel klopt? ' }),
          el('span', { text: 'Voordat een puzzel bij jou komt, is geteld hoeveel oplossingen hij heeft, en zijn de aanwijzingen die je kunt missen weggesneden. Je krijgt er dus geen die je niet rond kunt krijgen, en geen regel die er voor de sier staat.' }),
        ]),
        el('p', {}, [
          el('b', { text: 'Blijft mijn voortgang bewaard? ' }),
          el('span', { text: 'In deze browser wel, zonder account. Op een ander apparaat of in een andere browser begin je opnieuw.' }),
        ]),
        el('p', {}, [
          el('b', { text: 'Wat is die code in de link? ' }),
          el('span', { text: 'De seed. Dezelfde seed met dezelfde instellingen levert altijd exact dezelfde puzzel op, dus wie je link opent krijgt jouw puzzel en niet een andere.' }),
        ]),
        el('p', {}, [
          el('b', { text: 'Is dit een kopie van een bestaand puzzelboek? ' }),
          el('span', { text: 'Nee. Logische deductiepuzzels op een raster bestaan sinds de jaren zestig en de techniek erachter is wiskunde, vrij van rechten. Wat beschermd is — merknamen, personages, illustraties, teksten — is hier allemaal eigen werk.' }),
        ]),
      ]),
    ])
  );
}
