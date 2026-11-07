// De speelborden. Drie varianten, een gedeelde afspraak: een bord krijgt de
// puzzel plus de markeringen van de speler, en meldt elke wijziging terug.

import { tekenIcoon, icoonElement } from './icons.js';
import { icoonVan } from '../content/iconen.js';
import { soortVan, VLOER_VAN, meubelsVoor } from '../content/kamersoorten.js';
import { dessins, schuif } from './board-rooms.js';
import { tekenGeschilderd } from './geschilderd.js';
import { GESCHILDERD } from './meubelkunst-geschilderd.js';
import { tekenAankleding } from './aankleding.js';
import { portretElement } from './personenkunst-geschilderd.js';

const el = (tag, attrs = {}, kids = []) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  }
  for (const kid of [].concat(kids)) if (kid) node.append(kid);
  return node;
};

export const cellKey = (slot, item) => `${slot},${item}`;

// ------------------------------------------------------- kruisjesraster

// Een blok: rijen zijn de items van de ene categorie, kolommen die van de
// andere. Klikken loopt door leeg -> kruis -> vink. Een vink zet de rest van
// zijn rij en kolom automatisch op kruis, want dat volgt altijd.
//
// Blokken tegen het anker (verdachte x voorwerp) en blokken tussen twee
// categorieën onderling (voorwerp x plek) werken precies hetzelfde; alleen
// de koppen verschillen. Vandaar één functie.
export function renderBlok(puzzle, blok, marks, onChange, wrong) {
  const n = puzzle.anchor.items.length;
  const table = el('table', { class: 'grid' });
  // Mensen krijgen hun eigen kop, geen poppetje. Dezelfde kop als op de
  // knoppen en op het speurdokubord, dus je herkent ze over de puzzelsoorten
  // heen; vier keer hetzelfde poppetje zei niets. Welke categorie de mensen
  // zijn verschilt per puzzel - soms staan ze in de rijen, soms in de
  // kolommen - dus het gaat op de categorie zelf, niet op waar hij staat.
  const merkVan = (cat, i, naam, maat) => (cat.id === 'person'
    ? portretElement(i, naam.charAt(0).toUpperCase(), maat)
    : icoonElement(naam, maat - 6));

  const head = el('tr', {}, [el('th', { class: 'corner' })]);
  blok.kolom.items.forEach((item, i) => {
    head.append(el('th', { class: 'col-head' }, [
      el('span', { class: 'kop-staand' }, [merkVan(blok.kolom, i, item, 26), el('span', { text: item })]),
    ]));
  });
  table.append(el('thead', {}, head));

  const body = el('tbody');
  for (let slot = 0; slot < n; slot++) {
    const naam = blok.rij.items[slot];
    const merk = merkVan(blok.rij, slot, naam, 26);
    const row = el('tr', {}, [
      el('th', { scope: 'row' }, [
        el('span', { class: 'kop-liggend' }, [merk, el('span', { text: naam })]),
      ]),
    ]);
    for (let item = 0; item < n; item++) {
      const key = cellKey(slot, item);
      const state = marks[key] ?? '';
      const btn = el('button', {
        class: 'mark',
        type: 'button',
        'data-state': state,
        'data-wrong': wrong?.has(`${blok.id}:${key}`) ? '1' : null,
        'aria-label': `${naam} / ${blok.kolom.items[item]}`,
        text: state === 'yes' ? '✔' : state === 'no' ? '✕' : '',
      });
      btn.addEventListener('click', () => onChange(blok.id, slot, item));
      row.append(el('td', { class: 'cell' }, btn));
    }
    body.append(row);
  }
  table.append(body);

  const kop = blok.soort === 'anker'
    ? blok.kolom.name
    : `${blok.rij.name} × ${blok.kolom.name}`;
  return el('div', { class: blok.soort === 'paar' ? 'blok blok-paar' : 'blok' }, [
    el('p', { class: 'label', text: kop }),
    el('div', { class: 'board-wrap' }, table),
  ]);
}

// -------------------------------------------------------- plattegrond

// De kaart is om te lezen, niet om in te vullen; invullen gebeurt in de
// matrixen. Daarom tekenen we hem als een echte plattegrond: ruimtes delen
// hun muren, een doorgang is een gat in die muur met een deurblad en een
// draaicirkel, en een dichte muur is gewoon dicht. Zo zie je in een oogopslag
// waar je wel en niet langs kunt - en dat is precies waar de aanwijzingen
// over gaan.

const NS = 'http://www.w3.org/2000/svg';
const svgEl = (naam, attrs = {}) => {
  const node = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) if (v != null) node.setAttribute(k, v);
  return node;
};

// Welk meubelstuk hoort bij welke ruimte?
//
// Een plattegrond met in elke kamer hetzelfde flauwe pictogram vertelt je
// alleen hoe de kamer heet, en dat staat er al bij. Eén geschilderd
// meubelstuk vertelt wat voor kamer het IS - en het is hetzelfde meubelstuk
// dat op het speurdokubord in zo'n kamer staat, dus het is één huis.
//
// De keuze ligt vast per naam, dus dezelfde plek krijgt altijd hetzelfde
// meubelstuk. En geen twee ruimtes op één kaart krijgen hetzelfde: twee keer
// dezelfde kist naast elkaar leest als een fout, ook al is het er geen.
function kiesMeubels(namen, wereld) {
  const gebruikt = new Set();
  return namen.map((naam, i) => {
    const lijst = meubelsVoor(soortVan(naam), wereld)[0];
    if (!lijst?.length) return null;
    let h = i * 7;
    for (let k = 0; k < naam.length; k++) h = (h * 31 + naam.charCodeAt(k)) % 100003;
    for (let stap = 0; stap < lijst.length; stap++) {
      const [, sleutel] = lijst[(h + stap) % lijst.length];
      if (!gebruikt.has(sleutel) && GESCHILDERD[sleutel]) {
        gebruikt.add(sleutel);
        return GESCHILDERD[sleutel];
      }
    }
    return GESCHILDERD[lijst[h % lijst.length][1]] ?? null;
  });
}

const KAMER_B = 172;
const KAMER_H = 124;
const RAND = 26;
const DEUR = 40;

export function renderMap(puzzle) {
  const g = puzzle.graph;
  const breedte = g.cols * KAMER_B + RAND * 2;
  const hoogte = g.rows * KAMER_H + RAND * 2 + 34;

  const svg = svgEl('svg', {
    viewBox: `0 0 ${breedte} ${hoogte}`,
    role: 'img',
    'aria-label': `Plattegrond van ${puzzle.world.name} met ${g.n} ruimtes en hun doorgangen`,
  });

  svg.append(vloerPatroon());
  svg.append(dessins());

  const meubels = kiesMeubels(puzzle.anchor.items, puzzle.world?.id);

  const bijPositie = new Map(g.layout.map((p, i) => [`${p.row},${p.col}`, i]));
  const kamer = (r, c) => bijPositie.get(`${r},${c}`);
  const x = (c) => RAND + c * KAMER_B;
  const y = (r) => RAND + r * KAMER_H;
  // puzzle.graph is een platte kopie zonder functies, dus de verbindingen
  // leiden we hier af uit de lijst doorgangen.
  const sleutel = (a, b) => (a < b ? `${a},${b}` : `${b},${a}`);
  const doorgangen = new Set(g.edges.map(([a, b]) => sleutel(a, b)));
  const verbonden = (a, b) => a != null && b != null && doorgangen.has(sleutel(a, b));

  // Vloeren eerst, zodat de muren er bovenop liggen. Elke ruimte krijgt de
  // vloer die bij zijn soort hoort - dezelfde tegels, planken of steen als op
  // het speurdokubord. Een ruimte waarvan we de soort niet kennen houdt de
  // oude bouwtekeningvloer.
  const vloeren = svgEl('g', { class: 'plan-vloer' });
  g.layout.forEach((pos, i) => {
    const vak = { x: x(pos.col), y: y(pos.row), width: KAMER_B, height: KAMER_H };
    const v = VLOER_VAN[soortVan(puzzle.anchor.items[i])];
    if (!v) {
      vloeren.append(svgEl('rect', { ...vak, class: 'vloer' }));
      return;
    }
    // Elke ruimte zijn eigen tint. Niet te zien als je ernaar zoekt, wel
    // zodra je het weglaat: dan is het weer een vlak.
    const toon = 0.93 + ((i * 2654435761) % 140) / 1000;
    vloeren.append(svgEl('rect', { ...vak, fill: schuif(v.vul, toon) }));
    vloeren.append(svgEl('rect', { ...vak, fill: `url(#dessin-${v.dessin})`, opacity: 0.5 }));
  });
  svg.append(vloeren);

  // Muren. Elke ruimte tekent zijn eigen boven- en linkerzijde, plus de
  // onder- en rechterzijde als daar niets meer naast ligt. Zo komt elke
  // gedeelde muur precies een keer op de kaart.
  const muren = svgEl('g');
  g.layout.forEach((pos, i) => {
    const { row, col } = pos;
    const boven = kamer(row - 1, col);
    const links = kamer(row, col - 1);
    const onder = kamer(row + 1, col);
    const rechts = kamer(row, col + 1);

    tekenMuur(muren, x(col), y(row), x(col) + KAMER_B, y(row), boven == null, verbonden(i, boven), 'h', 1);
    tekenMuur(muren, x(col), y(row), x(col), y(row) + KAMER_H, links == null, verbonden(i, links), 'v', 1);
    if (onder == null) tekenMuur(muren, x(col), y(row) + KAMER_H, x(col) + KAMER_B, y(row) + KAMER_H, true, false, 'h', -1);
    if (rechts == null) tekenMuur(muren, x(col) + KAMER_B, y(row), x(col) + KAMER_B, y(row) + KAMER_H, true, false, 'v', -1);
  });
  svg.append(muren);

  // Inhoud van de ruimtes: een groot, bleek icoon als achtergrond, het
  // nummer in een cirkel, en de naam.
  g.layout.forEach((pos, i) => {
    const groep = svgEl('g');
    const cx = x(pos.col) + KAMER_B / 2;
    const cy = y(pos.row) + KAMER_H / 2;
    const naam = puzzle.anchor.items[i];

    const soort = soortVan(naam);
    if (soort) {
      // Eén ding erbij, in de hoek rechtsboven. Dat is de enige plek die in
      // een ruimte van 172 bij 124 echt vrij is: linksboven staat het
      // nummer, het midden is het meubelstuk, onderin ligt de naam over de
      // hele breedte, en halverwege elke muur kan een doorgang zitten. Zet
      // je er daar toch iets neer, dan ligt er een kleed in een deuropening
      // of achter de letters - en dan is het weer een naambalk.
      //
      // Behalve in de ruimte rechtsboven: daar staat het kompas al.
      const hoekBezet = pos.row === 0 && pos.col === g.cols - 1;
      if (!hoekBezet) {
        tekenAankleding(groep, soort, x(pos.col) + KAMER_B - 28, y(pos.row) + 28, 52, i * 3);
      }
    }

    // Eén geschilderd meubelstuk in plaats van een bleek pictogram. Valt er
    // geen te kiezen - een plek zonder soort - dan blijft het pictogram.
    const meubel = meubels[i];
    if (meubel) tekenGeschilderd(groep, meubel, { x: cx - 34, y: cy - 52, grootte: 68 });
    else tekenIcoon(groep, icoonVan(naam), { x: cx - 29, y: cy - 40, grootte: 58, klasse: 'kamer-glyph' });

    groep.append(svgEl('circle', { cx: x(pos.col) + 22, cy: y(pos.row) + 22, r: 11, class: 'kamer-bol' }));
    const nr = svgEl('text', { x: x(pos.col) + 22, y: y(pos.row) + 26, class: 'kamer-nr', 'text-anchor': 'middle' });
    nr.textContent = i + 1;
    groep.append(nr);

    regels(naam, 20).slice(0, 2).forEach((regel, k) => {
      const t = svgEl('text', { x: cx, y: cy + 30 + k * 15, class: 'kamer-naam', 'text-anchor': 'middle' });
      t.textContent = regel;
      groep.append(t);
    });
    svg.append(groep);
  });

  svg.append(kompas(breedte - RAND - 16, RAND + 16));

  const onderschrift = svgEl('text', {
    x: RAND, y: hoogte - 14, class: 'plan-titel',
  });
  onderschrift.textContent = 'PLATTEGROND';
  svg.append(onderschrift);

  // Kleine legenda: laat zien hoe een doorgang eruitziet, zodat niemand hoeft
  // te raden wat het boogje betekent.
  const lx = breedte - RAND - 92;
  const ly = hoogte - 18;
  const legenda = svgEl('g');
  legenda.append(svgEl('line', { x1: lx, y1: ly, x2: lx + 9, y2: ly, class: 'muur' }));
  legenda.append(svgEl('path', { d: `M ${lx + 9} ${ly} L ${lx + 9} ${ly + 9}`, class: 'deurblad' }));
  legenda.append(svgEl('path', { d: `M ${lx + 9} ${ly + 9} A 9 9 0 0 0 ${lx + 18} ${ly}`, class: 'deurboog' }));
  legenda.append(svgEl('line', { x1: lx + 18, y1: ly, x2: lx + 27, y2: ly, class: 'muur' }));
  const tekst = svgEl('text', { x: lx + 34, y: ly + 4, class: 'plan-legenda' });
  tekst.textContent = 'doorgang';
  legenda.append(tekst);
  svg.append(legenda);

  return el('figure', { class: 'map-figure' }, svg);
}

// Een muurzijde. Is er een doorgang, dan laten we een gat vallen en zetten
// er een deurblad met draaicirkel in; anders is het gewoon een dichte muur.
function tekenMuur(ouder, x1, y1, x2, y2, buitenmuur, doorgang, richting, kant) {
  const klasse = buitenmuur ? 'muur muur-buiten' : 'muur';
  if (!doorgang) {
    ouder.append(svgEl('line', { x1, y1, x2, y2, class: klasse }));
    return;
  }

  const mid = richting === 'h' ? (x1 + x2) / 2 : (y1 + y2) / 2;
  const half = DEUR / 2;

  if (richting === 'h') {
    ouder.append(svgEl('line', { x1, y1, x2: mid - half, y2: y1, class: klasse }));
    ouder.append(svgEl('line', { x1: mid + half, y1, x2, y2, class: klasse }));
    const hx = mid - half;
    const blad = `M ${hx} ${y1} L ${hx} ${y1 + DEUR * kant}`;
    const boog = `M ${hx} ${y1 + DEUR * kant} A ${DEUR} ${DEUR} 0 0 ${kant > 0 ? 0 : 1} ${hx + DEUR} ${y1}`;
    ouder.append(svgEl('path', { d: blad, class: 'deur-onder' }));
    ouder.append(svgEl('path', { d: boog, class: 'deur-onder' }));
    ouder.append(svgEl('path', { d: blad, class: 'deurblad' }));
    ouder.append(svgEl('path', { d: boog, class: 'deurboog' }));
  } else {
    ouder.append(svgEl('line', { x1, y1, x2: x1, y2: mid - half, class: klasse }));
    ouder.append(svgEl('line', { x1, y1: mid + half, x2, y2, class: klasse }));
    const hy = mid - half;
    const blad = `M ${x1} ${hy} L ${x1 + DEUR * kant} ${hy}`;
    const boog = `M ${x1 + DEUR * kant} ${hy} A ${DEUR} ${DEUR} 0 0 ${kant > 0 ? 1 : 0} ${x1} ${hy + DEUR}`;
    ouder.append(svgEl('path', { d: blad, class: 'deur-onder' }));
    ouder.append(svgEl('path', { d: boog, class: 'deur-onder' }));
    ouder.append(svgEl('path', { d: blad, class: 'deurblad' }));
    ouder.append(svgEl('path', { d: boog, class: 'deurboog' }));
  }
}

function vloerPatroon() {
  const defs = svgEl('defs');
  const pat = svgEl('pattern', {
    id: 'vloertegels', width: 16, height: 16, patternUnits: 'userSpaceOnUse',
  });
  pat.append(svgEl('rect', { width: 16, height: 16, class: 'vloerbasis' }));
  pat.append(svgEl('path', { d: 'M16 0 L0 0 0 16', class: 'vloerlijn' }));
  defs.append(pat);
  return defs;
}

function kompas(cx, cy) {
  const g = svgEl('g', { class: 'kompas' });
  g.append(svgEl('circle', { cx, cy, r: 13 }));
  g.append(svgEl('path', { d: `M ${cx} ${cy - 10} L ${cx + 4} ${cy + 2} L ${cx} ${cy - 1} L ${cx - 4} ${cy + 2} Z`, class: 'kompas-naald' }));
  const n = svgEl('text', { x: cx, y: cy + 11, 'text-anchor': 'middle', class: 'kompas-n' });
  n.textContent = 'N';
  g.append(n);
  return g;
}

// Naam over hooguit twee regels verdelen.
function regels(tekst, max) {
  const woorden = tekst.split(' ');
  const uit = [];
  let huidig = '';
  for (const w of woorden) {
    if ((huidig + ' ' + w).trim().length > max) { uit.push(huidig.trim()); huidig = w; }
    else huidig += ' ' + w;
  }
  if (huidig.trim()) uit.push(huidig.trim());
  return uit;
}

// ------------------------------------------------------ getallenraster

// De symbolen van het dienstrooster zijn mensen, dus staan hier dezelfde
// koppen als overal elders.
export function latinLegenda(puzzle) {
  return el('div', { class: 'swatches' },
    puzzle.symbols.map((naam, i) =>
      el('span', { class: 'swatch' }, [
        portretElement(i, naam.charAt(0).toUpperCase(), 24),
        el('span', { text: naam }),
      ])
    )
  );
}

export function renderLatin(puzzle, marks, onChange, wrong) {
  const n = puzzle.rows.length;
  const table = el('table', { class: 'latin' });
  const head = el('tr', {}, [el('th', { text: '' })]);
  for (const c of puzzle.cols) head.append(el('th', { text: c }));
  table.append(el('thead', {}, head));

  const body = el('tbody');
  const [tr, tc] = puzzle.question.cell;
  for (let r = 0; r < n; r++) {
    const row = el('tr', {}, [el('th', { scope: 'row', text: puzzle.rows[r] })]);
    for (let c = 0; c < n; c++) {
      const given = puzzle.givens[r][c];
      const key = `${r},${c}`;
      const val = given != null ? given : marks[key];
      const btn = el('button', {
        class: 'latin-cell',
        type: 'button',
        'data-locked': given != null ? '1' : null,
        'data-target': r === tr && c === tc ? '1' : null,
        'data-wrong': wrong?.has(key) ? '1' : null,
        'aria-label': `${puzzle.rows[r]}, ${puzzle.cols[c]}`,
        text: val != null ? puzzle.symbols[val] : '·',
      });
      if (given == null) btn.addEventListener('click', () => onChange(r, c));
      row.append(el('td', { class: 'cell' }, btn));
    }
    body.append(row);
  }
  table.append(body);
  return el('div', { class: 'board-wrap' }, table);
}

export { el };
