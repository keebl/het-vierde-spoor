// Verdachten, getekend als koppen in plaats van als smileys.
//
// Het oude portret is een cirkel voor het hoofd, een cirkel per oog en een
// boogje voor de mond. De eerste poging hier had al licht en een kaak, maar
// bleef karig: een kop bestaat uit meer dan een omtrek met twee ogen erin.
//
// Wat er nu bij staat, en waarom:
//
//   DE VORM VAN HET GEZICHT. Een wenkbrauwboog werpt schaduw op de oogkas.
//   De neus heeft een verlichte kant en een schaduwkant en een schaduw
//   eronder. De jukbeenderen vangen licht, de slapen en de kaakrand niet.
//   Zonder die vlakken is een gezicht een masker.
//
//   OGEN DIE KIJKEN. Oogwit, een iris met een eigen kleur, een pupil, een
//   lichtpunt, een zwaar bovenooglid en een lichte rand onder. Zes dingen
//   waar er eerst twee stonden, en het is het verschil tussen iemand en een
//   poppetje.
//
//   HAAR IN LOKKEN. Een haarkleurige vorm over het hoofd is een badmuts.
//   Haar valt in strengen die elk hun eigen licht vangen, met een paar
//   losse slierten die niet meedoen.
//
//   EEN KOP DIE VAN IEMAND IS. Baarden, snorren, brillen, een pet, een sjaal
//   - juist die maken twaalf mensen uit elkaar te houden, veel sterker dan
//   twaalf kleuren dat doen. En ze moeten het ook doen op een afdruk in
//   zwart-wit, waar kleur helemaal wegvalt.
//
// Alles volgt uit het volgnummer, dus hetzelfde nummer geeft altijd dezelfde
// kop. De beginletter in de hoek blijft staan: dat is het enige dat ook bij
// twaalf verdachten op een vakje van veertig pixels altijd werkt.

import { tekenGeschilderd, meng } from './geschilderd.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (naam, attrs = {}) => {
  const n = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  return n;
};

export const KLEDING = ['#b8452f', '#2f6ea8', '#3f7d4f', '#8a4f9e', '#c07a1d', '#1f7f85', '#a8456b', '#4b5d8a'];
const HAAR = ['#2e2119', '#6b4423', '#c8973f', '#8c9199', '#13100e', '#8c5a2b', '#a33f22'];
const HUID = ['#f0cba3', '#dcae7f', '#b07f4c', '#8a5a33'];
const OGEN = ['#4a6b3f', '#3a5c82', '#6b4a2a', '#4e4a52'];

// ------------------------------------------------------------------- haar
//
// Elk kapsel bestaat uit drie dingen: wat achter het hoofd valt, de massa
// die erop ligt, en de lokken die er licht uit halen. De lokken zijn geen
// versiering - zonder lokken is het een muts.

const lok = (kleur, d, lichter = 0.18) => ({ kleur: meng(kleur, '#ffe8b0', lichter), d });

const KAPSELS = [
  // kort, met een scheiding aan de lichte kant
  (kleur) => ({
    achter: [],
    voor: [
      { kleur, d: 'M13.8 19.4 q0.2 -10.4 10.2 -10.6 q10 0.2 10.2 10.6 q-1.4 -3.6 -5.2 -4.4 q-3.4 2.4 -7.6 1.2 q-4.6 -1.4 -7.6 3.2 Z' },
      lok(kleur, 'M15.4 17.2 q2.4 -5 7.6 -5.8 q-4.4 2.2 -6.2 6.6 Z', 0.26),
      lok(kleur, 'M30.4 12.6 q3.6 2 4 6.4 q-2.4 -3.2 -5.4 -4.4 Z', 0.1),
      { lijn: true, kleur, dik: 0.8, d: 'M17 15.8 q3.2 -3.2 7.2 -4 M26.4 12.2 q3.2 1.4 4.6 4.6' },
    ],
  }),
  // lang: de massa valt áchter het hoofd en is breder dan de schedel, met
  // alleen een pony erop. Liep de vorm om het gezicht heen, dan las het als
  // een capuchon in plaats van als haar - dat was het eerste wat opviel.
  (kleur) => ({
    achter: [
      { kleur: meng(kleur, '#1a1030', 0.26), d: 'M24 6.2 q13.2 0 13.2 13.4 l0.6 14.8 q-27.6 1.6 -27.6 0 l0.6 -14.8 q0 -13.4 13.2 -13.4 Z' },
      lok(kleur, 'M12.6 20.6 q-0.4 7 0.4 13.6 q-2 -0.8 -2.4 -3 q-0.6 -6.2 2 -10.6 Z', 0.16),
      lok(kleur, 'M35.4 20.6 q0.4 7 -0.4 13.6 q2 -0.8 2.4 -3 q0.6 -6.2 -2 -10.6 Z', 0.04),
    ],
    voor: [
      { kleur, d: 'M13.6 18.2 q0.2 -10 10.4 -10.2 q10.2 0.2 10.4 10.2 q-2.4 -4.6 -6.4 -5 q-3 2.6 -6.8 1.4 q-4.4 -1.4 -7.6 3.6 Z' },
      lok(kleur, 'M15.4 15.4 q3.4 -4.8 8.4 -5.2 q-5 2.6 -6.8 6.4 Z', 0.28),
      lok(kleur, 'M27 10.6 q4.6 1 6.4 5.6 q-3.2 -3.2 -6.4 -5.6 Z', 0.12),
      { lijn: true, kleur, dik: 0.8, d: 'M17.4 13.6 q3.4 -2.4 6.8 -2.6' },
    ],
  }),
  // opgestoken, met een losse lok langs de slaap
  (kleur) => ({
    achter: [],
    voor: [
      { kleur, d: 'M13.8 18.4 q0.2 -9.6 10.2 -9.8 q10 0.2 10.2 9.8 q-2.4 -5.4 -7.2 -6.2 q-6.6 -1 -13.2 6.2 Z' },
      { kleur, d: 'M24 1.8 q5.8 0 5.8 5.4 q0 5.4 -5.8 5.4 q-5.8 0 -5.8 -5.4 q0 -5.4 5.8 -5.4 Z' },
      lok(kleur, 'M20.4 3.6 q3.8 -1.4 7 0.8 q-3.6 -0.4 -7 -0.8 Z', 0.3),
      lok(kleur, 'M14.2 17.6 q-1.2 5.6 -0.4 10.8 q-1.8 -1 -2.2 -3.4 q-0.4 -4.4 2.6 -7.4 Z', 0.22),
      { lijn: true, kleur, dik: 0.9, d: 'M16.8 15.4 q3.6 -3.6 7.2 -4' },
    ],
  }),
  // een pet met een klep. De klep blijft boven de wenkbrauwen.
  (kleur) => ({
    achter: [],
    voor: [
      { kleur, d: 'M14.4 15.4 q-0.4 -8.4 9.6 -8.6 q10 0.2 9.6 8.6 q-9.6 -2.2 -19.2 0 Z' },
      lok(kleur, 'M16.2 13.2 q3.2 -4.2 7.6 -4.4 q-4.4 2 -6.4 5.2 Z', 0.2),
      { kleur: meng(kleur, '#1a1030', 0.18), d: 'M11 15 q13 -2.4 26 0 q0.4 1.5 0 2.8 q-13 2 -26 0 q-0.4 -1.4 0 -2.8 Z' },
      { kleur: meng(kleur, '#ffe8b0', 0.3), d: 'M19.8 7.6 q4.2 -1.3 8.4 0 q-4.2 0.8 -8.4 0 Z' },
    ],
  }),
  // kalend: alleen nog haar langs de zijkant en in de nek
  (kleur) => ({
    achter: [],
    voor: [
      { kleur, d: 'M13.6 24.4 q-1.6 -8.2 2 -12.4 q-0.8 5.8 1.4 9.4 q-2 0.6 -3.4 3 Z' },
      { kleur, d: 'M34.4 24.4 q1.6 -8.2 -2 -12.4 q0.8 5.8 -1.4 9.4 q2 0.6 3.4 3 Z' },
      lok(kleur, 'M14.4 14.6 q0.6 4.6 2 6.8 q-2.4 -1.6 -2.8 -6.8 Z', 0.24),
      { lijn: true, kleur, dik: 0.8, d: 'M15 15.4 q0.4 4 1.6 6' },
    ],
  }),
  // een dikke bos met een pony die over het voorhoofd valt
  (kleur) => ({
    achter: [
      { kleur: meng(kleur, '#1a1030', 0.24), d: 'M24 5.4 q13.8 0 13.8 13.6 l0.4 9.8 q-28.4 1.6 -28.4 0 l0.4 -9.8 q0 -13.6 13.8 -13.6 Z' },
    ],
    voor: [
      { kleur, d: 'M13.2 18.6 q-0.6 -11.4 10.8 -11.6 q11.4 0.2 10.8 11.6 q-1.8 -4 -5.2 -4.8 q-3 3.2 -7.4 1.8 q-5.2 -1.6 -9 3 Z' },
      lok(kleur, 'M15.6 15.4 q4 -5.2 9.4 -5.4 q-5.4 2.6 -7.6 6.6 Z', 0.28),
      lok(kleur, 'M26.6 10.6 q5 1 7 6 q-3.6 -3.4 -7 -6 Z', 0.12),
      lok(kleur, 'M13.8 20 q0.6 -4.6 3.4 -6.6 q-2 3.4 -2 6.8 Z', 0.2),
      { lijn: true, kleur, dik: 0.9, d: 'M18 13.4 q3.6 -2.6 7 -2.8 M28 12.4 q2.8 1.8 4 4.6' },
    ],
  }),
];

// ---------------------------------------------------------- gezichtshaar

const GEZICHTSHAAR = [
  // Drie van de zeven dragen iets. Had iedereen een snor, dan onderscheidde
  // een snor niemand meer - precies wat er gebeurde.
  () => [],
  () => [],
  () => [],
  // snor
  (kleur) => [
    { kleur, d: 'M18.6 27.4 q2.8 -1.8 5.4 -0.6 q2.6 -1.2 5.4 0.6 q-1.4 2 -4 1.6 q-1.4 -0.3 -1.4 -1 q0 0.7 -1.4 1 q-2.6 0.4 -4 -1.6 Z' },
    { lijn: true, kleur: meng(kleur, '#ffe8b0', 0.3), dik: 0.7, d: 'M20 27.4 q2 -0.8 3.6 -0.2' },
  ],
  // sik
  (kleur) => [
    { kleur, d: 'M18.8 27 q2.6 -1.6 5.2 -0.6 q2.6 -1 5.2 0.6 q-1.4 1.8 -3.8 1.5 q-1.4 -0.2 -1.4 -0.9 q0 0.7 -1.4 0.9 q-2.4 0.3 -3.8 -1.5 Z' },
    { kleur, d: 'M21.4 31 q2.6 -1 5.2 0 q0.4 3 -2.6 4.2 q-3 -1.2 -2.6 -4.2 Z' },
  ],
  // volle baard, in strengen
  (kleur) => [
    { kleur, d: 'M16.4 25.6 q1.2 7 7.6 9.6 q6.4 -2.6 7.6 -9.6 q1 5.8 -1.4 9.2 q-2.6 3.6 -6.2 3.8 q-3.6 -0.2 -6.2 -3.8 q-2.4 -3.4 -1.4 -9.2 Z' },
    { kleur: meng(kleur, '#ffe8b0', 0.22), d: 'M17.6 27.4 q1.4 5.4 6.2 7.6 q-4.8 -0.8 -6.2 -7.6 Z' },
    { kleur, d: 'M18.6 27.2 q2.8 -1.8 5.4 -0.6 q2.6 -1.2 5.4 0.6 q-1.4 2 -4 1.6 q-1.4 -0.3 -1.4 -1 q0 0.7 -1.4 1 q-2.6 0.4 -4 -1.6 Z' },
    { lijn: true, kleur: meng(kleur, '#1a1030', 0.3), dik: 0.7, d: 'M21.4 31 q0.5 3 2.6 4.6 M26.6 31 q-0.5 3 -2.6 4.6' },
  ],
];

// ------------------------------------------------------------------ brillen

const BRILLEN = [
  // Drie keer "geen", want met een bril op elke neus is een bril geen
  // kenmerk meer. Zo draagt er ongeveer een op de drie een bril, en dat
  // onderscheidt hem juist.
  () => null,
  () => null,
  () => null,
  // rond, van metaal
  (g, trek) => {
    for (const cx of [21, 27]) {
      g.append(el('circle', { cx, cy: 22.4, r: 3.6, fill: 'rgba(222,240,255,.16)', stroke: '#6c7682', 'stroke-width': 1.1 }));
      g.append(el('path', { d: `M${cx - 2.6} ${20.4} q2 -1.4 4 -0.4`, fill: 'none', stroke: 'rgba(255,255,255,.55)', 'stroke-width': 0.9, 'stroke-linecap': 'round' }));
    }
    trek('M24.6 22.4 h-1.2', '#6c7682', 1.1);
    trek('M17.4 22 l-3.2 -0.6 M30.6 22 l3.2 -0.6', '#6c7682', 1.1);
  },
  // hoekig, van hoorn
  (g, trek) => {
    for (const x of [17.2, 24.4]) {
      g.append(el('rect', { x, y: 19.8, width: 6.4, height: 4.8, rx: 1.4, fill: 'rgba(222,240,255,.14)', stroke: '#3a2a22', 'stroke-width': 1.3 }));
    }
    trek('M24.4 22 h-0.8', '#3a2a22', 1.3);
    trek('M17 21.4 l-3 -0.8 M31 21.4 l3 -0.8', '#3a2a22', 1.2);
  },
];

// ---------------------------------------------------------------- de kraag
//
// Een hals die zomaar in een vlak kleding overgaat ziet eruit als een
// badpak. Er hoort iets te zitten: een kraag, een sjaal, een boordje.

const KRAGEN = [
  (kleding) => [
    { kleur: meng(kleding, '#fff0c8', 0.3), d: 'M18.4 35.6 q5.6 4.6 11.2 0 q2.4 0.8 3.4 2.6 q-7.4 4.8 -18 0 q1 -1.8 3.4 -2.6 Z' },
    { kleur: meng(kleding, '#1a1030', 0.4), d: 'M21.4 36.6 q2.6 2 5.2 0 l-2.6 5 Z' },
  ],
  (kleding) => [
    { kleur: meng(kleding, '#1a1030', 0.45), d: 'M15.4 37 q8.6 5.4 17.2 0 q2.6 1.4 3.6 3.6 q-11.6 6 -24.4 0 q1 -2.2 3.6 -3.6 Z' },
    { kleur: meng(kleding, '#fff0c8', 0.22), d: 'M17 38.6 q7 3.8 14 0 q-7 2.2 -14 0 Z' },
  ],
  // een sjaal
  (kleding) => [
    { kleur: meng(kleding, '#fff0c8', 0.42), d: 'M14.8 37.4 q9.2 6 18.4 0 q3 1.6 3.4 4.4 q-11.4 5.6 -25.2 0 q0.4 -2.8 3.4 -4.4 Z' },
    { kleur: meng(kleding, '#1a1030', 0.3), d: 'M26.6 39.8 q3 0.6 3.8 3.4 q-2 2.2 -5 2.6 q-0.8 -3.4 1.2 -6 Z' },
  ],
];

// Zet een portret neer, passend in een vierkant van `grootte` bij `grootte`.
export function tekenPersoon(ouder, { index = 0, letter = '', x = 0, y = 0, grootte = 48, metLetter = true } = {}) {
  // Elke eigenschap heeft zijn eigen stap door de lijst, anders lopen twee
  // verdachten gelijk op en krijg je twee keer dezelfde kop.
  const kleding = KLEDING[index % KLEDING.length];
  const huid = HUID[(index * 3) % HUID.length];
  const haarkleur = HAAR[(index * 5) % HAAR.length];
  const oogkleur = OGEN[(index * 7) % OGEN.length];
  const kapsel = KAPSELS[(index * 3 + Math.floor(index / 5)) % KAPSELS.length];
  const baard = GEZICHTSHAAR[(index * 4 + Math.floor(index / 2)) % GEZICHTSHAAR.length];
  const bril = BRILLEN[(index * 7 + Math.floor(index / 2)) % BRILLEN.length];
  const kraag = KRAGEN[(index * 2) % KRAGEN.length];

  const haren = kapsel(haarkleur);
  const schaduwHuid = meng(huid, '#4a1f2c', 0.34);
  const diepHuid = meng(huid, '#3a1222', 0.58);

  const g = el('g', { class: 'persoonkunst-geschilderd' });
  g.setAttribute('transform', `translate(${x} ${y}) scale(${grootte / 48})`);

  // --------------------------------------------------------- penning en romp
  tekenGeschilderd(g, [
    {
      kleur: kleding, grond: true,
      d: 'M24 1.6 q13.4 0 16.4 4.6 q3.6 5.4 3.6 17.8 q0 12.4 -3.6 17.8 q-3 4.6 -16.4 4.6 q-13.4 0 -16.4 -4.6 q-3.6 -5.4 -3.6 -17.8 q0 -12.4 3.6 -17.8 q3 -4.6 16.4 -4.6 Z',
    },
    // Een lichte plek achter het hoofd: daardoor komt de kop naar voren in
    // plaats van dat hij in de achtergrond zakt. Zacht, en breder dan het
    // hoofd - werd hij smaller en lichter, dan las hij als de voering van
    // een capuchon.
    { kleur: meng(kleding, '#fff4d8', 0.12), glans: 0.12, d: 'M24 3.8 q15.4 0 15.4 16 q0 16 -15.4 16 q-15.4 0 -15.4 -16 q0 -16 15.4 -16 Z' },
    // Schouders, met een plooi die het licht vangt.
    { kleur: meng(kleding, '#1a1030', 0.26), d: 'M6.6 46 q1.4 -12.4 17.4 -12.6 q16 0.2 17.4 12.6 q-17.4 2.6 -34.8 0 Z' },
    { kleur: meng(kleding, '#fff0c8', 0.16), d: 'M9.6 44.6 q2.4 -8.4 10.4 -9.8 q-6.2 3.6 -7.6 10.2 Z' },
  ], { grootte: 48 });

  tekenGeschilderd(g, kraag(kleding), { grootte: 48 });

  // ------------------------------------------------------------------- kop
  //
  // De kop gaat als één geheel een slag groter. In de eerste versie besloeg
  // het gezicht nog geen helft van de penning, en dan is alle moeite voor
  // de oogkas en de neus weggegooid: je ziet het niet. Alles wat bij de kop
  // hoort zit in deze groep, dus het haar en de baard schalen mee.
  const kop = el('g', { transform: 'translate(24 23) scale(1.22) translate(-24 -23)' });
  g.append(kop);

  if (haren.achter.length) tekenGeschilderd(kop, haren.achter, { grootte: 48 });
  tekenGeschilderd(kop, [
    // De hals ligt in de schaduw van de kin: daar is hij het donkerst.
    { kleur: meng(huid, '#2a1526', 0.3), d: 'M20.2 28.2 q3.8 1.4 7.6 0 l0.4 8 q-4.2 1.6 -8.4 0 Z' },
    {
      kleur: huid,
      d: 'M24 10.4 q9.9 0 10.3 9.7 q0.2 5.3 -1.9 9.1 q-2.6 4.9 -8.4 5.3 q-5.8 -0.4 -8.4 -5.3 q-2.1 -3.8 -1.9 -9.1 q0.4 -9.7 10.3 -9.7 Z',
    },
    { kleur: meng(huid, '#2a1526', 0.14), d: 'M13.6 20.6 q-2.2 -0.4 -2.4 2.2 q-0.2 2.6 2.6 3 Z' },
    { kleur: meng(huid, '#2a1526', 0.14), d: 'M34.4 20.6 q2.2 -0.4 2.4 2.2 q0.2 2.6 -2.6 3 Z' },
  ], { grootte: 48 });

  // De vlakken van het gezicht. Dit zijn geen lijnen maar schaduw en licht,
  // dus ze gaan er als zachte vormen overheen.
  const vlek = (d, kleur, dekking) => kop.append(el('path', { d, fill: kleur, opacity: dekking }));
  // Slaap en kaakrand aan de donkere kant.
  vlek('M32.8 17.6 q2 5.4 0.4 10.4 q-1.6 4.2 -6 5.6 q4.2 -3.4 5.6 -16 Z', schaduwHuid, 0.5);
  // De schaduw onder de wenkbrauwboog.
  vlek('M16.8 19.8 q7.2 -3 14.4 0 q-0.6 1.8 -2 2 q-5.2 -1.6 -10.4 0 q-1.4 -0.2 -2 -2 Z', schaduwHuid, 0.34);
  // Licht op het jukbeen, aan de kant waar het licht vandaan komt.
  vlek('M15.8 23.2 q1.6 4 4.4 6.2 q-3.8 -0.8 -5.4 -3.8 Z', meng(huid, '#ffffff', 0.55), 0.5);
  // Het kuiltje boven de lip en de schaduw onder de kin.
  vlek('M20.8 32.2 q3.2 2.2 6.4 0 q-3.2 3 -6.4 0 Z', schaduwHuid, 0.3);

  // De neus: een verlichte kant, een schaduwkant, en een schaduw eronder.
  vlek('M24 21 q-1.6 3.2 -2.2 5 q1 0.8 2.2 0.8 Z', meng(huid, '#fff4e0', 0.6), 0.75);
  vlek('M24 21 q1.6 3.2 2.2 5 q-1 0.8 -2.2 0.8 Z', schaduwHuid, 0.55);
  vlek('M21.4 26.2 q2.6 1.6 5.2 0 q-0.6 1.4 -2.6 1.4 q-2 0 -2.6 -1.4 Z', diepHuid, 0.4);
  kop.append(el('circle', { cx: 22.2, cy: 26.2, r: 0.52, fill: diepHuid, opacity: 0.8 }));
  kop.append(el('circle', { cx: 25.8, cy: 26.2, r: 0.52, fill: diepHuid, opacity: 0.8 }));

  const trek = (d, kleur, dik = 1.1, dekking = 1) =>
    kop.append(el('path', {
      d, fill: 'none', stroke: kleur, 'stroke-width': dik, opacity: dekking,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    }));

  // ------------------------------------------------------------------ ogen
  //
  // Zes onderdelen per oog. Het bovenooglid is het zwaarste - dat is wat een
  // oog een oog maakt en een stip een stip.
  for (const [cx, kant] of [[21, -1], [27, 1]]) {
    // De kas ligt dieper dan de rest van het gezicht.
    vlek(`M${cx - 3.6} 22.4 q3.6 -3.4 7.2 0 q-3.6 3.6 -7.2 0 Z`, schaduwHuid, 0.3);
    kop.append(el('path', {
      d: `M${cx - 3.2} 22.4 q3.2 -2.8 6.4 0 q-3.2 3 -6.4 0 Z`, fill: '#fbf6ec',
    }));
    vlek(`M${cx - 3.2} 22.4 q3.2 -2.8 6.4 0 q-1.6 -0.8 -6.4 0 Z`, '#8a7a6a', 0.35);
    kop.append(el('circle', { cx: cx + kant * 0.25, cy: 22.5, r: 1.85, fill: oogkleur }));
    kop.append(el('circle', { cx: cx + kant * 0.25, cy: 22.5, r: 1.85, fill: 'none', stroke: meng(oogkleur, '#000000', 0.5), 'stroke-width': 0.6 }));
    kop.append(el('circle', { cx: cx + kant * 0.25, cy: 22.5, r: 0.85, fill: '#1c1512' }));
    kop.append(el('circle', { cx: cx + kant * 0.25 - 0.7, cy: 21.9, r: 0.55, fill: '#fffdf7' }));
    // Het bovenooglid, zwaar; en een lichte rand onder.
    trek(`M${cx - 3.3} 22.2 q3.3 -3.2 6.6 0`, diepHuid, 1.35);
    trek(`M${cx - 2.6} 23.6 q2.6 1.6 5.2 0`, meng(huid, '#fff4e0', 0.5), 0.75, 0.8);
  }
  // Wenkbrauwen staan niet horizontaal, en dat is het halve gezicht.
  const brauw = meng(haarkleur, '#000000', 0.15);
  kop.append(el('path', { d: 'M17.6 19.6 q3.2 -2.2 6.2 -0.8 q-0.2 1 -0.9 1.2 q-2.6 -0.9 -5.3 0.8 Z', fill: brauw }));
  kop.append(el('path', { d: 'M30.4 19.4 q-3.2 -2 -6.2 -0.6 q0.2 1 0.9 1.2 q2.6 -0.9 5.3 0.6 Z', fill: brauw }));

  // ------------------------------------------------------------------ mond
  kop.append(el('path', { d: 'M20.6 29.2 q1.8 -1.3 3.4 -0.3 q1.6 -1 3.4 0.3 q-3.4 1.2 -6.8 0 Z', fill: meng(huid, '#5e1f28', 0.62) }));
  kop.append(el('path', { d: 'M20.8 29.4 q3.2 2.4 6.4 0 q-1.5 2.3 -3.2 2.3 q-1.7 0 -3.2 -2.3 Z', fill: meng(huid, '#8a3340', 0.48) }));
  trek('M20.6 29.3 q3.4 1 6.8 0', meng(huid, '#4a1420', 0.7), 0.85, 0.85);
  vlek('M22 31 q2 1 4 0 q-2 1.2 -4 0 Z', meng(huid, '#ffffff', 0.6), 0.45);

  // ------------------------------------------- haar, baard, bril, en de letter
  const baardharen = baard(haarkleur);
  if (baardharen.length) tekenGeschilderd(kop, baardharen, { grootte: 48 });
  tekenGeschilderd(kop, haren.voor, { grootte: 48 });
  bril(kop, trek);

  // Een smalle lichte rand langs de linkerkant van de kop: het licht komt
  // van linksboven, dus daar staat hij vol in.
  trek('M14.2 25.4 q-1.4 -6.4 1.4 -11 q1.8 -3 5.4 -3.8', meng(huid, '#fffaf0', 0.75), 1.15, 0.6);

  if (metLetter && letter) {
    tekenGeschilderd(g, [{ stof: 'papier', d: 'M39 31.2 q7.8 0 7.8 7.8 q0 7.8 -7.8 7.8 q-7.8 0 -7.8 -7.8 q0 -7.8 7.8 -7.8 Z' }], { grootte: 48 });
    const t = el('text', { x: 39, y: 42.5, 'text-anchor': 'middle', class: 'portretletter' });
    t.textContent = letter;
    g.append(t);
  }

  ouder.append(g);
  return g;
}

// Een los portretje voor naast een naam in het palet.
export function portretElement(index, letter, grootte = 24) {
  const svg = el('svg', { viewBox: '0 0 48 48', width: grootte, height: grootte, 'aria-hidden': 'true' });
  tekenPersoon(svg, { index, letter, grootte: 48, metLetter: false });
  return svg;
}

// ------------------------------------------------------- het slachtoffer
//
// Het slachtoffer was een krijtcontour: een omtrek van een lichaam op de
// grond, zoals op een plattegrond van een plaats delict. Dat leest als een
// symbool, niet als iemand die er stond, en het staat los van de stijl van
// de andere elf. Nu is het slachtoffer gewoon een van de figuren, met een
// kruis erdoorheen. Het kruis is rood en dik, en daarmee iets anders dan de
// donkere kruisjes waarmee je zelf vakjes wegstreept.
export function tekenSlachtofferkruis(ouder, { x = 0, y = 0, grootte = 48 } = {}) {
  const r = grootte * 0.4;
  const cx = x + grootte / 2;
  const cy = y + grootte / 2;
  const d = `M${(cx - r).toFixed(1)} ${(cy - r).toFixed(1)} L${(cx + r).toFixed(1)} ${(cy + r).toFixed(1)}`
    + ` M${(cx + r).toFixed(1)} ${(cy - r).toFixed(1)} L${(cx - r).toFixed(1)} ${(cy + r).toFixed(1)}`;
  ouder.append(el('path', { d, class: 'lijkbaan' }));
  ouder.append(el('path', { d, class: 'lijkkruis' }));
}

// Hetzelfde portretje als de anderen, maar doorgekruist.
export function slachtofferElement(index, letter, grootte = 24) {
  const svg = el('svg', { viewBox: '0 0 48 48', width: grootte, height: grootte, 'aria-hidden': 'true' });
  tekenPersoon(svg, { index, letter, grootte: 48, metLetter: false });
  tekenSlachtofferkruis(svg, { grootte: 48 });
  return svg;
}
