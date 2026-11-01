// Het kamerraster-bord.
//
// Hier mag het wel vol zijn: elke kamer heeft zijn eigen vloer, meubels staan
// als blokken op het rooster, het slachtoffer ligt er als krijtcontour, en de
// verdachten zijn penningen die je zelf neerzet. Dat is het verschil tussen
// een puzzel die je leest en een puzzel waar je naar kijkt.
//
// Licht bord op een donkere pagina: dat leest als een speelbord dat voor je
// op tafel ligt.

import { tekenIcoon } from './icons.js';
import { tekenMeubel } from './meubelkunst.js';
import { tekenPersoon } from './personenkunst.js';
import { icoonVan } from '../content/iconen.js';
import { soortVan, VLOER_VAN } from '../content/kamersoorten.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (naam, attrs = {}) => {
  const n = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  return n;
};

const CEL = 76;
const RAND = 18;
const PLAAT = 20;
// Hoe breed is een hoofdletter ten opzichte van de lettergrootte, inclusief
// de spatiering uit de stijl. Gemeten, niet gegokt: 0.58 was te krap.
const BREED = 0.68;

// De vloer volgt het soort ruimte, niet het kamernummer: tegels in de keuken,
// parket in de bibliotheek, gras buiten. Zie src/content/kamersoorten.js.

const PENNING = ['#b8452f', '#2f6ea8', '#3f7d4f', '#8a4f9e', '#c07a1d', '#1f7f85'];

export function renderKamerbord(puzzle, state, acties) {
  const n = puzzle.n;
  const breedte = n * CEL + RAND * 2;
  const hoogte = n * CEL + RAND * 2;

  const svg = el('svg', {
    viewBox: `0 0 ${breedte} ${hoogte}`,
    class: 'kamerbord',
    role: 'img',
    'aria-label': `Plattegrond van ${n} bij ${n} vakjes`,
  });
  svg.append(dessins());

  const x = (c) => RAND + c * CEL;
  const y = (r) => RAND + r * CEL;
  const rij = (i) => Math.floor(i / n);
  const kol = (i) => i % n;
  const kamer = (i) => puzzle.kamerVan[i];
  const idx = (r, c) => r * n + c;
  // Een vakje waar een figuur zou kunnen staan: alles behalve een meubelstuk.
  const bruikbaar = (i) => puzzle.meubelOp[i] == null;

  // ---------------------------------------------------------------- vloer
  const vloerVan = (i) => VLOER_VAN[soortVan(puzzle.kamerNamen[kamer(i)])] ?? VLOER_VAN.zaal;

  const vloer = el('g');
  for (let i = 0; i < n * n; i++) {
    const v = vloerVan(i);
    vloer.append(el('rect', {
      x: x(kol(i)), y: y(rij(i)), width: CEL, height: CEL, fill: v.vul,
    }));
    vloer.append(el('rect', {
      x: x(kol(i)), y: y(rij(i)), width: CEL, height: CEL,
      fill: `url(#dessin-${v.dessin})`, opacity: 0.5,
    }));
  }

  // Sleetplekken en vlekken. Vast per vakje, dus ze springen niet rond bij
  // elke klik - en ze blijven schaars, anders wordt het rommelig.
  for (let i = 0; i < n * n; i++) {
    const ruis = (i * 2654435761) % 1000;
    if (ruis > 240) continue;
    const vx = x(kol(i)) + 14 + (ruis % 40);
    const vy = y(rij(i)) + 16 + ((ruis * 7) % 40);
    vloer.append(el('ellipse', {
      cx: vx, cy: vy, rx: 6 + (ruis % 7), ry: 4 + (ruis % 5),
      class: 'vloervlek',
    }));
  }
  svg.append(vloer);

  // -------------------------------------------------------------- naden
  // Dunne naad binnen een kamer, dikke muur tussen kamers.
  const naden = el('g');
  const muren = el('g');
  for (let i = 0; i < n * n; i++) {
    const r = rij(i);
    const c = kol(i);
    const rechts = c < n - 1 ? i + 1 : null;
    const onder = r < n - 1 ? i + n : null;
    if (rechts != null) {
      const zelfde = kamer(i) === kamer(rechts);
      (zelfde ? naden : muren).append(el('line', {
        x1: x(c + 1), y1: y(r), x2: x(c + 1), y2: y(r + 1),
        class: zelfde ? 'naad' : 'kamermuur',
      }));
    }
    if (onder != null) {
      const zelfde = kamer(i) === kamer(onder);
      (zelfde ? naden : muren).append(el('line', {
        x1: x(c), y1: y(r + 1), x2: x(c + 1), y2: y(r + 1),
        class: zelfde ? 'naad' : 'kamermuur',
      }));
    }
  }
  svg.append(naden, muren);
  svg.append(el('rect', {
    x: RAND, y: RAND, width: n * CEL, height: n * CEL, class: 'buitenmuur-kamer',
  }));

  // ----------------------------------------------------------- meubels
  const spullen = el('g');
  for (let i = 0; i < n * n; i++) {
    const m = puzzle.meubelOp[i];
    if (m == null) continue;
    const naam = puzzle.meubelNamen[m];
    // Een schaduwtje onder het meubel, anders zweeft het boven de vloer.
    spullen.append(el('ellipse', {
      cx: x(kol(i)) + CEL / 2, cy: y(rij(i)) + CEL - 13,
      rx: CEL * 0.3, ry: 5, class: 'meubelschaduw',
    }));
    const kunst = tekenMeubel(spullen, puzzle.meubelIconen?.[m], {
      x: x(kol(i)) + 7, y: y(rij(i)) + 6, grootte: CEL - 14,
    });
    // Valt er geen tekening te maken, dan liever het lijnicoon dan niets.
    if (!kunst) {
      tekenIcoon(spullen, icoonVan(naam) ?? 'deur', {
        x: x(kol(i)) + CEL / 2 - 16, y: y(rij(i)) + CEL / 2 - 18, grootte: 32, klasse: 'meubelglyph',
      });
    }
  }
  svg.append(spullen);

  // ------------------------------------------------------------ penningen
  // Kleur alleen is niet genoeg om twaalf mensen uit elkaar te houden, en op
  // een afdruk in zwart-wit valt kleur helemaal weg. Daarom staat de
  // beginletter op de penning - en daarom heeft iedereen in een puzzel een
  // eigen beginletter.
  const geplaatst = el('g');
  for (const [p, cel] of Object.entries(state.plaats)) {
    const pi = Number(p);
    if (cel == null) continue;
    const g = el('g', { class: 'penning' });
    const cx = x(kol(cel)) + CEL / 2;
    const cy = y(rij(cel)) + CEL / 2;

    if (pi === puzzle.slachtofferIdx) {
      // Het slachtoffer is geen penning maar een krijtcontour: je ziet meteen
      // dat dat het lichaam is, en in welke kamer het dus ligt.
      g.append(el('circle', { cx, cy, r: 27, class: 'lijkvlak' }));
      g.append(el('path', {
        d: `M ${cx} ${cy - 17} a 5.5 5.5 0 1 1 0.1 0 Z
            M ${cx - 2} ${cy - 7} l -13 6 M ${cx + 2} ${cy - 7} l 14 4
            M ${cx} ${cy - 8} l -3 14 l -8 8 M ${cx} ${cy - 8} l 4 13 l 10 6`,
        class: 'krijtlijn',
      }));
    } else {
      const maat = CEL - 16;
      tekenPersoon(g, {
        index: pi,
        letter: (puzzle.personen[pi] ?? '?').charAt(0).toUpperCase(),
        x: cx - maat / 2,
        y: cy - maat / 2,
        grootte: maat,
      });
    }
    if (state.fout?.has(cel)) g.append(el('circle', { cx, cy, r: 30, class: 'penningfout' }));
    geplaatst.append(g);
  }
  svg.append(geplaatst);

  // ------------------------------------------------------------- kruisjes
  // Zodra iemand staat, kan er in diezelfde rij en kolom niemand meer bij.
  // Die kruisjes zet het bord zelf, want ze volgen dwingend uit de regel -
  // ze met de hand laten zetten is bezigheidstherapie.
  const vanzelf = new Set();
  for (const cel of Object.values(state.plaats)) {
    if (cel == null) continue;
    const r = rij(cel);
    const c = kol(cel);
    for (let i = 0; i < n; i++) {
      for (const buur of [idx(r, i), idx(i, c)]) {
        if (buur === cel) continue;
        if (!bruikbaar(buur)) continue;
        if (state.plaatsVanCel(buur) != null) continue;
        vanzelf.add(buur);
      }
    }
  }

  const kruisjes = el('g');
  const alleKruisjes = new Set([...state.kruis, ...vanzelf]);
  for (const cel of alleKruisjes) {
    if (state.plaatsVanCel(cel) != null) continue;
    if (!bruikbaar(cel)) continue;
    const cx = x(kol(cel)) + CEL / 2;
    const cy = y(rij(cel)) + CEL / 2;
    kruisjes.append(el('path', {
      d: `M ${cx - 9} ${cy - 9} l 18 18 M ${cx + 9} ${cy - 9} l -18 18`,
      class: vanzelf.has(cel) ? 'kruisje kruisje-vanzelf' : 'kruisje',
    }));
  }
  svg.append(kruisjes);

  // --------------------------------------------------------- kamerplaatjes
  // Het bordje gaat op de langste aaneengesloten rij van de kamer staan en
  // krijgt precies de breedte van die rij. Zo kan het nooit over een andere
  // kamer heen vallen. Past de naam niet, dan krimpt de letter of breekt de
  // naam over twee regels.
  const borden = el('g');
  for (let k = 0; k < puzzle.kamerNamen.length; k++) {
    const run = langsteRij(puzzle, n, k);
    if (!run) continue;
    const naam = puzzle.kamerNamen[k].toUpperCase();
    const ruimte = run.lengte * CEL - 12;
    const midden = x(run.c) + (run.lengte * CEL) / 2;

    let groot = 9;
    let regels = [naam];
    if (naam.length * groot * BREED > ruimte) {
      groot = Math.max(6.5, ruimte / (naam.length * BREED));
      if (groot < 8) {
        regels = splits(naam);
        groot = Math.min(9, ruimte / (Math.max(...regels.map((t) => t.length)) * BREED));
      }
    }

    const hoogte = regels.length * (groot + 3) + 7;
    borden.append(el('rect', {
      x: midden - ruimte / 2, y: y(run.r) + 5, width: ruimte, height: hoogte,
      rx: 4, class: 'kamerplaat',
    }));
    regels.forEach((tekst, i) => {
      const t = el('text', {
        x: midden, y: y(run.r) + 5 + (groot + 3) * (i + 1), 'text-anchor': 'middle',
        class: 'kamerplaat-tekst', 'font-size': groot.toFixed(1),
      });
      t.textContent = tekst;
      borden.append(t);
    });
  }
  svg.append(borden);

  // ---------------------------------------------------------- schetsletters
  // Potloodnotities: de beginletters van iedereen die hier nog zou kunnen
  // staan. Je legt niets vast, je houdt alleen bij wat je al weet - precies
  // wat je bij een puzzel op papier in de hoek van een vakje zou krabbelen.
  const schetsen = el('g');
  for (const [celTekst, figuren] of Object.entries(state.schets ?? {})) {
    const cel = Number(celTekst);
    if (!figuren.length) continue;
    if (!bruikbaar(cel)) continue;
    if (state.plaatsVanCel(cel) != null) continue;
    figuren.forEach((fi, k) => {
      // Onderin het vakje: het naambordje van de kamer zit bovenin.
      const t = el('text', {
        x: x(kol(cel)) + 10 + (k % 4) * 15,
        y: y(rij(cel)) + CEL - 24 + Math.floor(k / 4) * 14,
        class: 'schetsletter',
      });
      t.textContent = (puzzle.personen[fi] ?? '?').charAt(0).toUpperCase();
      schetsen.append(t);
    });
  }
  svg.append(schetsen);


  // ------------------------------------------------------------ klikvlak
  const klik = el('g');
  for (let i = 0; i < n * n; i++) {
    const vak = el('rect', {
      x: x(kol(i)), y: y(rij(i)), width: CEL, height: CEL,
      class: 'klikvak', 'data-cel': i,
    });
    if (puzzle.meubelOp[i] != null) vak.classList.add('klikvak-dicht');
    else vak.addEventListener('click', () => acties.klikCel(i));
    klik.append(vak);
  }
  svg.append(klik);

  return svg;
}

// De langste aaneengesloten reeks vakjes van een kamer op een rij.
function langsteRij(puzzle, n, k) {
  let beste = null;
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (puzzle.kamerVan[r * n + c] !== k) { c++; continue; }
      const start = c;
      while (c < n && puzzle.kamerVan[r * n + c] === k) c++;
      const lengte = c - start;
      if (!beste || lengte > beste.lengte) beste = { r, c: start, lengte };
    }
  }
  return beste;
}

// Naam over twee regels verdelen, zo gelijk mogelijk.
function splits(naam) {
  const woorden = naam.split(' ');
  if (woorden.length === 1) return [naam];
  let beste = null;
  for (let i = 1; i < woorden.length; i++) {
    const a = woorden.slice(0, i).join(' ');
    const b = woorden.slice(i).join(' ');
    const verschil = Math.abs(a.length - b.length);
    if (!beste || verschil < beste.verschil) beste = { verschil, regels: [a, b] };
  }
  return beste.regels;
}

function dessins() {
  const defs = el('defs');

  const planken = el('pattern', { id: 'dessin-planken', width: 76, height: 19, patternUnits: 'userSpaceOnUse' });
  planken.append(el('path', { d: 'M0 0.5 H76 M0 18.5 H76', class: 'dessinlijn' }));
  planken.append(el('path', { d: 'M38 0 V19', class: 'dessinlijn' }));
  defs.append(planken);

  const dwars = el('pattern', { id: 'dessin-planken-dwars', width: 19, height: 76, patternUnits: 'userSpaceOnUse' });
  dwars.append(el('path', { d: 'M0.5 0 V76 M18.5 0 V76', class: 'dessinlijn' }));
  dwars.append(el('path', { d: 'M0 38 H19', class: 'dessinlijn' }));
  defs.append(dwars);

  const tegels = el('pattern', { id: 'dessin-tegels', width: 38, height: 38, patternUnits: 'userSpaceOnUse' });
  tegels.append(el('rect', { x: 0, y: 0, width: 19, height: 19, class: 'dessinvlak' }));
  tegels.append(el('rect', { x: 19, y: 19, width: 19, height: 19, class: 'dessinvlak' }));
  defs.append(tegels);

  const ruiten = el('pattern', { id: 'dessin-ruiten', width: 26, height: 26, patternUnits: 'userSpaceOnUse' });
  ruiten.append(el('path', { d: 'M13 0 L26 13 L13 26 L0 13 Z', class: 'dessinlijn' }));
  defs.append(ruiten);

  return defs;
}

export { CEL, PENNING };
