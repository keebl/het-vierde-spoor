// Verdachten, opnieuw getekend voor de geschilderde motor.
//
// Het oude portret is een cirkel voor het hoofd, een cirkel voor elk oog en
// een boogje voor de mond. Dat leest als een smiley, niet als iemand die daar
// stond. Wat eraan ontbreekt is niet meer detail maar een kop: een kaak die
// naar de kin toe smaller wordt, een jukbeen waar licht op valt, een schaduw
// onder de neus, en haar dat in slierten valt in plaats van als een muts over
// het hoofd ligt.
//
// Twaalf mensen per puzzel moeten uit elkaar te houden blijven, ook in het
// klein en ook op een afdruk in zwart-wit. Daarom blijft alles wat dat deed
// staan: eigen kleding, eigen haarkleur, eigen kapsel, eigen huidtint en de
// beginletter in de hoek.

import { tekenGeschilderd, meng } from './geschilderd.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (naam, attrs = {}) => {
  const n = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  return n;
};

export const KLEDING = ['#b8452f', '#2f6ea8', '#3f7d4f', '#8a4f9e', '#c07a1d', '#1f7f85', '#a8456b', '#4b5d8a'];
const HAAR = ['#2e2119', '#6b4423', '#c8973f', '#8c9199', '#13100e', '#8c5a2b'];
const HUID = ['#f0cba3', '#dcae7f', '#b07f4c', '#8a5a33'];

// De kapsels. Elk is een vorm die over het hoofd valt én een paar slierten
// die eruit hangen - juist die slierten maken het haar in plaats van een kap.
const KAPSELS = [
  // kort, met een scheiding
  (kleur) => [
    { kleur, d: 'M13.2 22.4 q-0.6 -11.6 10.8 -11.8 q11.4 0.2 10.8 11.8 q-1.6 -6 -7.4 -7.2 q-6.4 -1.4 -14.2 7.2 Z' },
    { kleur, d: 'M31 15.6 q3.6 2.2 3.8 7 q-2.6 -3.4 -5.4 -4.6 Z' },
  ],
  // lang, tot op de schouders
  (kleur) => [
    { kleur, d: 'M12.6 21.8 q-0.8 -12 11.4 -12.2 q12.2 0.2 11.4 12.2 l0.4 13.6 q-2.6 1 -4.8 0 l-0.6 -13 q-0.8 -6.6 -6.4 -6.8 q-5.6 0.2 -6.4 6.8 l-0.6 13 q-2.2 1 -4.8 0 Z' },
    { kleur, d: 'M15 24 q1.6 6.4 0.2 12.6 q-2 -0.6 -2.6 -2.6 q-0.6 -5.6 2.4 -10 Z' },
  ],
  // opgestoken, met een losse lok
  (kleur) => [
    { kleur, d: 'M13.4 22.2 q-0.6 -11.4 10.6 -11.6 q11.2 0.2 10.6 11.6 q-2 -6.2 -8 -7.2 q-6 -1 -13.2 7.2 Z' },
    { kleur, d: 'M24 3.4 q5.2 0 5.2 5 q0 5 -5.2 5 q-5.2 0 -5.2 -5 q0 -5 5.2 -5 Z' },
    { kleur, d: 'M14.4 20.6 q-1.4 5.2 -0.6 10 q-1.8 -1 -2.2 -3.4 q-0.4 -4 2.8 -6.6 Z' },
  ],
  // een pet met een klep. De klep moet bóven de ogen blijven: lager en je
  // kijkt tegen een blinddoek aan.
  (kleur) => [
    { kleur, d: 'M14 17.2 q-0.4 -8.4 10 -8.6 q10.4 0.2 10 8.6 q-10 -2.4 -20 0 Z' },
    { kleur, d: 'M10.8 16.8 q13.2 -2.6 26.4 0 q0.4 1.6 0 3 q-13.2 2.2 -26.4 0 q-0.4 -1.5 0 -3 Z' },
    { kleur, d: 'M18 9.6 q6 -2 12 0 q-6 1 -12 0 Z' },
  ],
];

// Zet een portret neer, passend in een vierkant van `grootte` bij `grootte`.
export function tekenPersoon(ouder, { index = 0, letter = '', x = 0, y = 0, grootte = 48, metLetter = true } = {}) {
  const kleding = KLEDING[index % KLEDING.length];
  const huid = HUID[(index * 3) % HUID.length];
  const haarkleur = HAAR[(index * 5) % HAAR.length];
  const kapsel = KAPSELS[(index * 2 + Math.floor(index / 4)) % KAPSELS.length];

  const delen = [
    // De penning zelf, een slag onregelmatig zodat hij geslagen lijkt en niet
    // uitgesneden.
    {
      kleur: kleding, grond: true,
      d: 'M24 1.6 q13.4 0 16.4 4.6 q3.6 5.4 3.6 17.8 q0 12.4 -3.6 17.8 q-3 4.6 -16.4 4.6 q-13.4 0 -16.4 -4.6 q-3.6 -5.4 -3.6 -17.8 q0 -12.4 3.6 -17.8 q3 -4.6 16.4 -4.6 Z',
    },
    // Schouders en kraag.
    { kleur: meng(kleding, '#1a1030', 0.3), d: 'M7.4 45.6 q1.6 -11.4 16.6 -11.6 q15 0.2 16.6 11.6 q-16.6 2.4 -33.2 0 Z' },
    { kleur: meng(kleding, '#fff0c8', 0.28), d: 'M18.6 35.4 q5.4 4.6 10.8 0 q2.2 0.8 3 2.6 q-6.8 4.6 -16.8 0 q0.8 -1.8 3 -2.6 Z' },
    // De hals, met de schaduw van de kin erop.
    { kleur: meng(huid, '#2a1526', 0.26), d: 'M20.4 28.4 q3.6 1.4 7.2 0 l0.4 7.2 q-4 1.6 -8 0 Z' },
    // De kop: breed bij de slapen, smaller naar de kin, met een kaaklijn die
    // niet rond is.
    {
      kleur: huid,
      d: 'M24 10.6 q9.8 0 10.2 9.6 q0.2 5.2 -1.8 9 q-2.6 4.8 -8.4 5.2 q-5.8 -0.4 -8.4 -5.2 q-2 -3.8 -1.8 -9 q0.4 -9.6 10.2 -9.6 Z',
    },
    // Het oor, want zonder oor is het een masker.
    { kleur: meng(huid, '#2a1526', 0.12), d: 'M13.8 20.8 q-2 -0.4 -2.2 2 q-0.2 2.4 2.4 2.8 Z' },
    { kleur: meng(huid, '#2a1526', 0.12), d: 'M34.2 20.8 q2 -0.4 2.2 2 q0.2 2.4 -2.4 2.8 Z' },
  ];

  const g = el('g', { class: 'persoonkunst-geschilderd' });
  g.setAttribute('transform', `translate(${x} ${y}) scale(${grootte / 48})`);
  tekenGeschilderd(g, delen, { grootte: 48 });
  tekenGeschilderd(g, kapsel(haarkleur), { grootte: 48 });

  // Het gezicht gaat er met de hand overheen: dit zijn geen vormen met licht
  // erop maar trekken, en die horen dun en donker te blijven.
  const trek = (d, kleur, dik = 1.1, extra = {}) =>
    g.append(el('path', {
      d, fill: 'none', stroke: kleur, 'stroke-width': dik,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', ...extra,
    }));
  const diep = meng(huid, '#2a1020', 0.6);

  // Wenkbrauwen: ze staan niet horizontaal, en dat is het halve gezicht.
  trek('M18.4 19.4 q2.6 -1.4 5 -0.4', meng(haarkleur, '#000000', 0.2), 1.5);
  trek('M24.6 19 q2.4 -1 5 0.4', meng(haarkleur, '#000000', 0.2), 1.5);
  // Ogen: een bovenooglid dat zwaarder is dan de rest, en een lichtpunt.
  g.append(el('path', { d: 'M18.6 22.6 q2.6 -2 5.2 0 q-2.6 2.4 -5.2 0 Z', fill: '#fffdf7', opacity: 0.9 }));
  g.append(el('path', { d: 'M24.2 22.6 q2.6 -2 5.2 0 q-2.6 2.4 -5.2 0 Z', fill: '#fffdf7', opacity: 0.9 }));
  g.append(el('circle', { cx: 21.2, cy: 22.6, r: 1.5, fill: '#271d18' }));
  g.append(el('circle', { cx: 26.8, cy: 22.6, r: 1.5, fill: '#271d18' }));
  g.append(el('circle', { cx: 20.7, cy: 22.1, r: 0.55, fill: '#fffdf7' }));
  g.append(el('circle', { cx: 26.3, cy: 22.1, r: 0.55, fill: '#fffdf7' }));
  trek('M18.4 21.4 q2.8 -2.2 5.6 0', diep, 1.2);
  trek('M24.4 21.4 q2.8 -2.2 5.6 0', diep, 1.2);
  // De neus is een schaduw, geen lijn.
  trek('M24 23.4 q-1.4 2.6 0.4 3.4 q1 0.4 1.8 -0.4', diep, 1.1, { opacity: 0.75 });
  // De mond, net niet symmetrisch.
  trek('M21.4 29.4 q2.8 1.8 5.4 -0.4', meng(huid, '#5e1f28', 0.55), 1.3);
  // Licht op het jukbeen, de kant waar het licht vandaan komt.
  g.append(el('path', {
    d: 'M16.4 23.6 q1.4 3.4 4 5.4 q-3.4 -0.6 -5 -3.4 Z',
    fill: meng(huid, '#ffffff', 0.5), opacity: 0.5,
  }));

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
