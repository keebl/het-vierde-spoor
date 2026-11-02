// Verdachten als portretjes, in dezelfde stijl als het meubilair: gevuld, in
// kleur, met een dunne donkere omlijning.
//
// Twaalf mensen per wereld moeten uit elkaar te houden zijn, en kleur alleen
// is daar te weinig voor - zeker op een afdruk in zwart-wit. Daarom varieert
// er meer dan de kleur: haarkleur, kapsel en huidtint, en in de hoek staat de
// beginletter. Alles volgt uit het volgnummer van de persoon, dus hetzelfde
// nummer geeft altijd hetzelfde portret.

const NS = 'http://www.w3.org/2000/svg';

export const KLEDING = ['#b8452f', '#2f6ea8', '#3f7d4f', '#8a4f9e', '#c07a1d', '#1f7f85', '#a8456b', '#4b5d8a'];
const KLEDING_DONKER = ['#8f3324', '#24557f', '#30603c', '#6a3c7a', '#955e14', '#176166', '#833552', '#3a4a6f'];
const HAAR = ['#2e2119', '#6b4423', '#c8973f', '#8c9199', '#13100e', '#8c5a2b'];
const HUID = ['#f2cfa8', '#dcae7f', '#b07f4c', '#8a5a33'];

const el = (naam, attrs = {}) => {
  const n = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  return n;
};

// Kapsels. Elk is een vorm die over de bovenkant van het hoofd valt.
function haar(g, stijl, kleur) {
  const lijn = (node) => {
    node.setAttribute('stroke', '#3f3228');
    node.setAttribute('stroke-width', '1.4');
    node.setAttribute('stroke-linejoin', 'round');
    return node;
  };
  if (stijl === 0) {
    // kort
    g.append(lijn(el('path', { d: 'M14 22a10 10 0 0 1 20 0v-3a10 10 0 0 0-20 0Z', fill: kleur })));
  } else if (stijl === 1) {
    // lang
    g.append(lijn(el('path', { d: 'M13 21a11 11 0 0 1 22 0v14h-4V22a7 7 0 0 0-14 0v13h-4Z', fill: kleur })));
  } else if (stijl === 2) {
    // opgestoken
    g.append(lijn(el('path', { d: 'M14 22a10 10 0 0 1 20 0v-3a10 10 0 0 0-20 0Z', fill: kleur })));
    g.append(lijn(el('circle', { cx: 24, cy: 8, r: 5, fill: kleur })));
  } else {
    // pet
    g.append(lijn(el('path', { d: 'M14 20a10 10 0 0 1 20 0Z', fill: kleur })));
    g.append(lijn(el('path', { d: 'M11 20h26v3H11Z', fill: kleur })));
  }
}

// Zet een portret neer, passend in een vierkant van `grootte` bij `grootte`.
export function tekenPersoon(ouder, { index = 0, letter = '', x = 0, y = 0, grootte = 48, metLetter = true } = {}) {
  const kleding = KLEDING[index % KLEDING.length];
  const kledingDonker = KLEDING_DONKER[index % KLEDING_DONKER.length];
  const huid = HUID[(index * 3) % HUID.length];
  const haarkleur = HAAR[(index * 5) % HAAR.length];
  const kapsel = (index * 2 + Math.floor(index / 4)) % 4;

  const g = el('g', { class: 'persoonkunst' });
  g.setAttribute('transform', `translate(${x} ${y}) scale(${grootte / 48})`);

  // Dezelfde contour als het meubilair: dat houdt het bord één tekening in
  // plaats van losse plaatjes.
  const lijn = (node) => {
    node.setAttribute('stroke', '#3f3228');
    node.setAttribute('stroke-width', '1.4');
    node.setAttribute('stroke-linejoin', 'round');
    return node;
  };

  g.append(lijn(el('rect', { x: 2, y: 2, width: 44, height: 44, rx: 9, fill: kleding, class: 'portretvlak' })));
  // schouders
  g.append(lijn(el('path', { d: 'M8 46a16 16 0 0 1 32 0Z', fill: kledingDonker })));
  // hals en hoofd
  g.append(el('rect', { x: 21, y: 28, width: 6, height: 6, fill: huid }));
  g.append(lijn(el('circle', { cx: 24, cy: 22, r: 10, fill: huid })));
  haar(g, kapsel, haarkleur);
  // ogen, met wat meer leven erin: een wit vlekje maakt een oog een oog
  g.append(el('circle', { cx: 20.5, cy: 23, r: 1.6, fill: '#2b241c' }));
  g.append(el('circle', { cx: 27.5, cy: 23, r: 1.6, fill: '#2b241c' }));
  g.append(el('circle', { cx: 21, cy: 22.5, r: 0.5, fill: '#fffdf7' }));
  g.append(el('circle', { cx: 28, cy: 22.5, r: 0.5, fill: '#fffdf7' }));
  // een mond, en blosjes
  g.append(el('path', { d: 'M21.5 27q2.5 2 5 0', fill: 'none', stroke: '#8a5a44', 'stroke-width': 1.2, 'stroke-linecap': 'round' }));
  g.append(el('circle', { cx: 17.5, cy: 25.5, r: 2, fill: '#d98f7a', opacity: 0.45 }));
  g.append(el('circle', { cx: 30.5, cy: 25.5, r: 2, fill: '#d98f7a', opacity: 0.45 }));

  if (metLetter && letter) {
    g.append(lijn(el('circle', { cx: 39, cy: 39, r: 8, fill: '#fffdf7', class: 'letterbadge' })));
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
