// Uitleg. Bedoeld voor iemand die net zijn eerste puzzel heeft geopend,
// niet voor iemand die de code kent. Dus: eerst spelen, dan de begrippen.
//
// Hier stonden ook het Kruisverhoor, de Rondgang en het Dienstrooster, en
// een tabel met wat je zoal uitzoekt. Die speltypes zijn er nog wel - de
// motor maakt ze, de keuring rekent ze na - maar ze staan nergens in het
// zicht (zie ZICHTBARE_MECHANICS in assignments.js), en dan hoort er ook
// geen uitleg van te staan. Komt er een terug, dan komt zijn stuk terug.

import { el } from './boards.js';
import { LEVELS, ZICHTBARE_LEVEL_IDS, KAMER_LEVELS } from '../engine/difficulty.js';

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

const vraag = (kop, antwoord) => el('p', {}, [
  el('b', { text: `${kop} ` }),
  el('span', { text: antwoord }),
]);

export function renderUitleg(mount) {
  mount.replaceChildren();

  mount.append(
    el('p', { class: 'eyebrow', text: 'Uitleg' }),
    el('h1', { text: 'Hoe je deze puzzels oplost' }),
    el('p', {
      class: 'lede',
      text: 'Je krijgt een plattegrond en een lijst aanwijzingen die allemaal waar zijn. Door te schrappen wat niet kan, blijft er uiteindelijk één plaatsing over. Raden hoeft nooit.',
    })
  );

  mount.append(
    sectie('Het spel', [
      el('div', { class: 'prose' }, [
        el('p', { text: 'Je ziet een plattegrond met kamers en meubels. Daar zet je de figuren op: één per rij en één per kolom, en nooit op een meubelstuk. Eén van die figuren is waar de zaak om draait, en die staat gemerkt op het bord: met een kruis als er iemand vermoord is, een vraagteken als er iemand verdwenen is, een opengebroken slot als er iets gestolen is. Waar die figuur stond moet je dus net zo goed uitzoeken.' }),
        el('p', {}, [
          el('b', { text: 'Wie als enige bij die figuur in de kamer blijkt te staan, is het antwoord. ' }),
          el('span', { text: 'De dader, de dief, of degene die de vermiste het laatst zag — boven de puzzel staat welke van de drie het is. Dat weet je pas als alles op zijn plek staat, en daarom moet je eerst de hele plattegrond rondkrijgen.' }),
        ]),
        el('p', {}, [
          el('b', { text: 'Naast is naast. ' }),
          el('span', { text: 'Staat er dat iemand naast de werkbank stond, dan bedoelen we pal ernaast — erboven, eronder, links of rechts — én in dezelfde kamer. Door een muur heen sta je niet naast iets, en schuin telt nooit.' }),
        ]),
        el('p', {}, [
          el('b', { text: 'De rand van het bord is een plek, geen voorwerp. ' }),
          el('span', { text: 'Elke wereld heeft daar eigen woorden voor: tegen de buitenmuur, tegen de rotswand, aan de rand van het woud. Dat betekent telkens hetzelfde — op de buitenste rij of kolom. Zinnen over rijen, kolommen en het noorden gaan over de hele plattegrond en lopen wél door muren heen; daarvoor staat er een kompas naast het bord.' }),
        ]),
      ]),
    ], 'Figuren op een plattegrond, één per rij en één per kolom.')
  );

  mount.append(
    sectie('Het bord bedienen', [
      el('div', { class: 'prose' }, [
        el('p', { text: 'Kies een figuur uit de balk boven het bord en klik een leeg vakje aan: daar komt hij te staan. Klik je op een figuur die al op het bord staat, dan pak je die op; klik er nog een keer op en hij gaat eraf.' }),
        el('p', {}, [
          el('b', { text: 'Schetsen en Uitsluiten. ' }),
          el('span', { text: 'Weet je het nog niet zeker, zet dan met Schetsen de beginletters van de kandidaten in een vakje. Met Uitsluiten zet je je eigen kruisjes in vakjes waar niemand meer kan staan.' }),
        ]),
        el('p', {}, [
          el('b', { text: 'Kruisjes vanzelf. ' }),
          el('span', { text: 'Zodra je iemand neerzet, kruist het bord uit zichzelf af waar niemand meer kan staan: de rest van die rij en kolom. Dat scheelt werk, maar het neemt je ook een stap af — met de knop onder het bord zet je het uit.' }),
        ]),
        el('p', {}, [
          el('b', { text: 'Wat is dat ding? ' }),
          el('span', { text: 'Wijs een meubelstuk aan met de muis en de naam verschijnt; op een telefoon tik je erop en komt hij onder het bord te staan. De hele lijst staat onder het bord, achter "Wat er op het bord staat".' }),
        ]),
        el('p', {}, [
          el('b', { text: 'De lijst om het bord. ' }),
          el('span', { text: 'De sierlijst eromheen kost ruimte: op een klein bord is hij ruim een derde van de breedte. Op een telefoon staat hij daarom vanzelf uit; met de knop onder het bord zet je hem aan.' }),
        ]),
      ]),
    ])
  );

  mount.append(
    sectie('Als je vastloopt', [
      el('div', { class: 'prose' }, [
        el('p', {}, [
          el('b', { text: 'Controleer ' }),
          el('span', { text: 'kijkt na wat er staat: wat klopt krijgt een groene ring, wat niet klopt een rode. Je ziet dus wél dát iets fout staat, maar niet wat het goede antwoord is.' }),
        ]),
        el('p', {}, [
          el('b', { text: 'Hint ' }),
          el('span', { text: 'vult niets voor je in. Hij geeft je een extra aanwijzing, onderaan de lijst, net zo waar als de andere — gekozen op wat hij jou oplevert vanaf de stand van jouw bord, en nooit van de soort "die stond in de keuken".' }),
        ]),
        el('p', {}, [
          el('b', { text: 'Oplossing ' }),
          el('span', { text: 'vult alles in. Dan is de puzzel natuurlijk voorbij; hij telt daarna niet meer als opgelost.' }),
        ]),
        el('p', {}, [
          el('b', { text: 'Bewaar deze puzzel ' }),
          el('span', { text: 'kopieert de link. Elke puzzel heeft een eigen adres: bewaar het of maak er een bladwijzer van, dan krijg je exact deze puzzel terug — hetzelfde decor, dezelfde namen, dezelfde aanwijzingen.' }),
        ]),
      ]),
    ])
  );

  mount.append(
    sectie('Moeilijkheidsgraad', [
      tabel(ZICHTBARE_LEVEL_IDS.map((l) => {
        const lv = LEVELS[l];
        const k = KAMER_LEVELS[l];
        const omvang = `${k.n} bij ${k.n} vakjes, ${k.kamers} kamers.`;
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
    sectie('Veelgestelde vragen', [
      el('div', { class: 'prose' }, [
        vraag('Moet ik ooit gokken?', 'Nee. Op de eerste drie moeilijkheidsgraden kom je er door stap voor stap uit te sluiten. Op de drie zwaarste moet je soms een mogelijkheid aannemen en laten zien dat die tot een tegenspraak leidt — dat is nog steeds redeneren.'),
        vraag('Hoe weet ik dat een puzzel klopt?', 'Voordat een puzzel bij jou komt, is geteld hoeveel oplossingen hij heeft, en zijn de aanwijzingen die je kunt missen weggesneden. Je krijgt er dus geen die je niet rond kunt krijgen, en geen aanwijzing die er voor de sier staat.'),
        vraag('Kan ik kiezen waar het speelt?', 'Nee. Je kiest hoe zwaar je het wilt hebben; het decor krijg je. Elke nieuwe puzzel speelt ergens anders, en is ook niet altijd een moord: het kan net zo goed een verdwijning of een diefstal zijn.'),
        vraag('Blijft mijn voortgang bewaard?', 'In deze browser wel, zonder account. Op een ander apparaat of in een andere browser begin je opnieuw. Puzzels die je zelf begonnen bent staan onder "Alle puzzels", bij hun eigen moeilijkheidsgraad.'),
        vraag('Wat is die code in de link?', 'De seed. Dezelfde seed levert altijd exact dezelfde puzzel op, dus wie jouw link opent krijgt jouw puzzel en niet een andere.'),
        vraag('Lijkt dit niet op Murdoku?',
          'Ja, en dat is geen toeval. Murdoku is het puzzelboek van Manuel Garand waarin je verdachten in een sudokuraster zet en degene die bij het slachtoffer overblijft de dader is. Mijn dochter is er dol op, en toen het boek uit was wilde ze meer. Daar is deze site voor gemaakt: om er zelf nieuwe te kunnen maken, zo veel als ze wil.'),
        vraag('Mag dat zomaar?',
          'De vorm wel. Logische deductiepuzzels op een raster bestaan sinds de jaren zestig, en de techniek erachter — een latijns vierkant met aanwijzingen die precies één invulling overlaten — is wiskunde en vrij van rechten. Wat niet vrij is, zijn de dingen die een boek tot dát boek maken: de naam, de teksten, de personages, de illustraties. Die zijn hier allemaal eigen werk, tot aan elke getekende stoel toe.'),
      ]),
    ])
  );
}
