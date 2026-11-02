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
import { tekenAankleding } from './aankleding.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (naam, attrs = {}) => {
  const n = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  return n;
};

const CEL = 76;
const RAND = 14;
// Ruimte voor de rij- en kolomaanduiding en het kompas.
const BAND = 22;
const PLAAT = 20;
// Hoe breed is een hoofdletter ten opzichte van de lettergrootte, inclusief
// de spatiering uit de stijl. Gemeten, niet gegokt: 0.58 was te krap.
const BREED = 0.68;

// De vloer volgt het soort ruimte, niet het kamernummer: tegels in de keuken,
// parket in de bibliotheek, gras buiten. Zie src/content/kamersoorten.js.

const PENNING = ['#b8452f', '#2f6ea8', '#3f7d4f', '#8a4f9e', '#c07a1d', '#1f7f85'];

export function renderKamerbord(puzzle, state, acties) {
  const n = puzzle.n;
  const breedte = n * CEL + RAND * 2 + BAND;
  const hoogte = n * CEL + RAND * 2 + BAND;

  const svg = el('svg', {
    viewBox: `0 0 ${breedte} ${hoogte}`,
    class: 'kamerbord',
    role: 'img',
    'aria-label': `Plattegrond van ${n} bij ${n} vakjes`,
  });
  svg.append(dessins());

  const x = (c) => RAND + BAND + c * CEL;
  const y = (r) => RAND + BAND + r * CEL;
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
      fill: `url(#dessin-${v.dessin})`, opacity: 0.62,
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

  // ----------------------------------------------------------- aankleding
  // Zie src/ui/aankleding.js: versiering op de vloer, geen onderdeel van de
  // puzzel. Hoe groter de kamer, hoe meer erin ligt, en elk vakje krijgt een
  // ander motief - vier keer hetzelfde kleed is geen sfeer maar behang.
  const kleden = el('g', { class: 'aankleding' });
  for (let k = 0; k < puzzle.kamerNamen.length; k++) {
    const soort = soortVan(puzzle.kamerNamen[k]);
    const cellen = [];
    for (let i = 0; i < n * n; i++) if (kamer(i) === k && bruikbaar(i)) cellen.push(i);
    if (!cellen.length) continue;
    const aantal = Math.min(4, Math.max(1, Math.round(cellen.length / 2.5)));
    const gekozen = new Set();
    for (let t = 0; t < aantal; t++) {
      gekozen.add(cellen[((k + 1) * 2654435761 + t * 1103515245) % cellen.length]);
    }
    let nr = k;
    for (const cel of gekozen) {
      tekenAankleding(kleden, soort, x(kol(cel)) + CEL / 2, y(rij(cel)) + CEL / 2, CEL, nr++);
    }
  }
  svg.append(kleden);

  // --------------------------------------------------------------- licht
  // Elke kamer krijgt zijn eigen zachte gloed, met het licht in het midden
  // en de hoeken wat donkerder. Daardoor valt een kamer op als één ruimte in
  // plaats van als een verzameling vakjes - en het haalt de kilte eruit.
  const licht = el('g', { class: 'kamerlicht' });
  const defs2 = el('defs');
  for (let k = 0; k < puzzle.kamerNamen.length; k++) {
    const cellen = [];
    for (let i = 0; i < n * n; i++) if (kamer(i) === k) cellen.push(i);
    if (!cellen.length) continue;
    const clip = el('clipPath', { id: `kamer-${k}` });
    for (const i of cellen) {
      clip.append(el('rect', { x: x(kol(i)), y: y(rij(i)), width: CEL, height: CEL }));
    }
    defs2.append(clip);
    const minC = Math.min(...cellen.map(kol));
    const maxC = Math.max(...cellen.map(kol));
    const minR = Math.min(...cellen.map(rij));
    const maxR = Math.max(...cellen.map(rij));
    licht.append(el('rect', {
      x: x(minC), y: y(minR),
      width: (maxC - minC + 1) * CEL, height: (maxR - minR + 1) * CEL,
      fill: 'url(#kamergloed)', 'clip-path': `url(#kamer-${k})`,
    }));
  }
  svg.append(defs2);
  svg.append(licht);

  // -------------------------------------------------------------- naden
  // Dunne naad binnen een kamer, dikke muur tussen kamers.
  // Eerst een volledig vakjesraster: elke vakjesgrens krijgt een lijn, ook
  // midden in een kamer. Anders moet je uit het vloerpatroon afleiden waar
  // een vakje ophoudt, en dat lukt niet.
  const raster = el('g');
  for (let k = 1; k < n; k++) {
    raster.append(el('line', { x1: x(k), y1: y(0), x2: x(k), y2: y(n), class: 'vakjeslijn' }));
    raster.append(el('line', { x1: x(0), y1: y(k), x2: x(n), y2: y(k), class: 'vakjeslijn' }));
  }
  svg.append(raster);

  const naden = el('g');
  const muren = el('g');
  for (let i = 0; i < n * n; i++) {
    const r = rij(i);
    const c = kol(i);
    const rechts = c < n - 1 ? i + 1 : null;
    const onder = r < n - 1 ? i + n : null;
    if (rechts != null) {
      const zelfde = kamer(i) === kamer(rechts);
      if (!zelfde) {
        muren.append(el('line', { x1: x(c + 1), y1: y(r), x2: x(c + 1), y2: y(r + 1), class: 'kamermuur' }));
        muren.append(el('line', { x1: x(c + 1), y1: y(r), x2: x(c + 1), y2: y(r + 1), class: 'kamermuur-top' }));
      }
    }
    if (onder != null) {
      const zelfde = kamer(i) === kamer(onder);
      if (!zelfde) {
        muren.append(el('line', { x1: x(c), y1: y(r + 1), x2: x(c + 1), y2: y(r + 1), class: 'kamermuur' }));
        muren.append(el('line', { x1: x(c), y1: y(r + 1), x2: x(c + 1), y2: y(r + 1), class: 'kamermuur-top' }));
      }
    }
  }
  svg.append(muren);
  svg.append(el('rect', {
    x: x(0), y: y(0), width: n * CEL, height: n * CEL, class: 'buitenmuur-kamer',
  }));

  // Rij- en kolomaanduiding, plus een kompas: de aanwijzingen spreken over
  // rijen, kolommen en het noorden, dus dat moet op het bord te zien zijn.
  const randen = el('g');
  for (let k = 0; k < n; k++) {
    const kop = el('text', { x: x(k) + CEL / 2, y: y(0) - 7, 'text-anchor': 'middle', class: 'randletter' });
    kop.textContent = String(k + 1);
    randen.append(kop);
    const zij = el('text', { x: x(0) - 8, y: y(k) + CEL / 2 + 4, 'text-anchor': 'end', class: 'randletter' });
    zij.textContent = String.fromCharCode(65 + k);
    randen.append(zij);
  }
  const kx = RAND + BAND / 2 - 2;
  const ky = RAND + BAND / 2 + 2;
  randen.append(el('path', { d: `M ${kx} ${ky - 9} L ${kx + 4} ${ky + 2} L ${kx} ${ky - 0.5} L ${kx - 4} ${ky + 2} Z`, class: 'kompasnaald' }));
  const nLetter = el('text', { x: kx, y: ky + 11, 'text-anchor': 'middle', class: 'kompasletter' });
  nLetter.textContent = 'N';
  randen.append(nLetter);
  svg.append(randen);

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
      x: x(kol(i)) + 4, y: y(rij(i)) + 3, grootte: CEL - 8,
    });
    // Valt er geen tekening te maken, dan liever het lijnicoon dan niets.
    if (!kunst) {
      tekenIcoon(spullen, icoonVan(naam) ?? 'deur', {
        x: x(kol(i)) + CEL / 2 - 16, y: y(rij(i)) + CEL / 2 - 18, grootte: 32, klasse: 'meubelglyph',
      });
    }
  }
  svg.append(spullen);

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
  const h = CEL / 2;
  const q = CEL / 4;

  // Elke vloer is een eigen patroon, niet een lijntje om de zoveel pixels.
  // Hout heeft nerf en spijkers, tegels hebben voeg en glans, steen heeft
  // scheuren, gras heeft pollen. Dat is het verschil tussen een vloer en een
  // vlak met een streepje erop.

  const planken = el('pattern', { id: 'dessin-planken', width: CEL, height: q, patternUnits: 'userSpaceOnUse' });
  planken.append(el('path', { d: `M0 ${q - 0.5} H${CEL}`, class: 'dessinlijn' }));
  planken.append(el('path', { d: `M${h} 0 V${q}`, class: 'dessinlijn' }));
  planken.append(el('path', { d: `M4 ${q * 0.45} q ${CEL * 0.2} -3 ${CEL * 0.4} 0`, class: 'dessinnerf' }));
  planken.append(el('path', { d: `M${h + 6} ${q * 0.62} q ${CEL * 0.12} 3 ${CEL * 0.25} 0`, class: 'dessinnerf' }));
  planken.append(el('circle', { cx: 6, cy: q * 0.5, r: 0.9, class: 'dessinspijker' }));
  planken.append(el('circle', { cx: h + 6, cy: q * 0.5, r: 0.9, class: 'dessinspijker' }));
  defs.append(planken);

  const dwars = el('pattern', { id: 'dessin-planken-dwars', width: q, height: CEL, patternUnits: 'userSpaceOnUse' });
  dwars.append(el('path', { d: `M${q - 0.5} 0 V${CEL}`, class: 'dessinlijn' }));
  dwars.append(el('path', { d: `M0 ${h} H${q}`, class: 'dessinlijn' }));
  dwars.append(el('path', { d: `M${q * 0.45} 4 q -3 ${CEL * 0.2} 0 ${CEL * 0.4}`, class: 'dessinnerf' }));
  dwars.append(el('circle', { cx: q * 0.5, cy: 6, r: 0.9, class: 'dessinspijker' }));
  defs.append(dwars);

  const tegels = el('pattern', { id: 'dessin-tegels', width: h, height: h, patternUnits: 'userSpaceOnUse' });
  tegels.append(el('rect', { x: 0, y: 0, width: q, height: q, class: 'dessinvlak' }));
  tegels.append(el('rect', { x: q, y: q, width: q, height: q, class: 'dessinvlak' }));
  tegels.append(el('path', { d: `M0 ${q} H${h} M${q} 0 V${h}`, class: 'dessinvoeg' }));
  tegels.append(el('path', { d: `M2 2 h${q - 8}`, class: 'dessinglans' }));
  tegels.append(el('path', { d: `M${q + 2} ${q + 2} h${q - 8}`, class: 'dessinglans' }));
  defs.append(tegels);

  const ruiten = el('pattern', { id: 'dessin-ruiten', width: h, height: h, patternUnits: 'userSpaceOnUse' });
  ruiten.append(el('path', { d: `M${q} 0 L${h} ${q} L${q} ${h} L0 ${q} Z`, class: 'dessinruit' }));
  ruiten.append(el('path', { d: `M${q} ${q * 0.5} L${q * 1.5} ${q} L${q} ${q * 1.5} L${q * 0.5} ${q} Z`, class: 'dessinlijn' }));
  defs.append(ruiten);

  // Onregelmatige blokken met scheuren: een kelder of een grafgewelf.
  const steen = el('pattern', { id: 'dessin-steen', width: CEL, height: h, patternUnits: 'userSpaceOnUse' });
  steen.append(el('path', { d: `M0 ${h - 0.5} H${CEL} M0 ${q - 0.5} H${CEL}`, class: 'dessinlijn' }));
  steen.append(el('path', { d: `M${h} 0 V${q} M${q} ${q} V${h} M${CEL * 0.78} ${q} V${h}`, class: 'dessinlijn' }));
  steen.append(el('path', { d: `M${CEL * 0.12} ${q * 0.4} l 4 3 l -2 3`, class: 'dessinscheur' }));
  steen.append(el('path', { d: `M${CEL * 0.6} ${q * 1.5} l -3 4`, class: 'dessinscheur' }));
  steen.append(el('circle', { cx: CEL * 0.35, cy: q * 0.6, r: 1.1, class: 'dessinspikkel' }));
  steen.append(el('circle', { cx: CEL * 0.88, cy: q * 1.4, r: 1.3, class: 'dessinspikkel' }));
  defs.append(steen);

  // Pollen gras, niet een groen vlak.
  const gras = el('pattern', { id: 'dessin-gras', width: q, height: q, patternUnits: 'userSpaceOnUse' });
  gras.append(el('path', { d: 'M3 14 q 2 -6 4 -8 M7 14 q 1 -5 3 -7 M11 14 q 2 -4 3 -6', class: 'dessingras' }));
  gras.append(el('path', { d: `M${q * 0.7} ${q * 0.35} q 2 -5 4 -7`, class: 'dessingras' }));
  defs.append(gras);

  // Een geweven tapijt: ruitjes met een dubbele draad.
  const tapijt = el('pattern', { id: 'dessin-tapijt', width: q, height: q, patternUnits: 'userSpaceOnUse' });
  tapijt.append(el('path', { d: `M0 ${q * 0.5} H${q} M${q * 0.5} 0 V${q}`, class: 'dessinweefsel' }));
  tapijt.append(el('path', { d: `M0 0 L${q} ${q} M${q} 0 L0 ${q}`, class: 'dessindraad' }));
  defs.append(tapijt);

  // Beton: spikkels en een enkele voeg.
  const beton = el('pattern', { id: 'dessin-beton', width: h, height: h, patternUnits: 'userSpaceOnUse' });
  beton.append(el('path', { d: `M0 ${h - 0.5} H${h}`, class: 'dessinlijn' }));
  for (const [cx, cy, r] of [[6, 9, 1.1], [17, 5, 0.8], [12, 20, 1.3], [28, 14, 0.9], [23, 28, 1.1], [33, 31, 0.8]]) {
    beton.append(el('circle', { cx, cy, r, class: 'dessinspikkel' }));
  }
  defs.append(beton);

  // Warm licht in elke kamer: een zachte gloed vanuit het midden. Zonder dat
  // is een vloer een egaal vlak, en daar komt "kil" vandaan.
  const gloed = el('radialGradient', { id: 'kamergloed' });
  gloed.append(el('stop', { offset: '0%', 'stop-color': '#fff3d2', 'stop-opacity': '0.22' }));
  gloed.append(el('stop', { offset: '48%', 'stop-color': '#ffe9b8', 'stop-opacity': '0.07' }));
  gloed.append(el('stop', { offset: '100%', 'stop-color': '#2e2112', 'stop-opacity': '0.26' }));
  defs.append(gloed);

  return defs;
}

// Welke vloerpatronen bestaan er? De keuring gebruikt dit om te zien of een
// soort ruimte naar een patroon wijst dat er ook echt is - anders krijgt die
// vloer stilzwijgend geen dessin en ziet hij er kaal uit.
export const DESSINS = [
  'planken', 'planken-dwars', 'tegels', 'ruiten', 'steen', 'gras', 'tapijt', 'beton',
];

export { CEL, PENNING };

// De legenda: elk meubelstuk uit deze puzzel met zijn naam erbij. De
// aanwijzingen noemen die namen, dus je moet altijd kunnen opzoeken welk
// tekeningetje erbij hoort - zonder te hoeven raden.
export function renderLegenda(puzzle) {
  const gebruikt = [];
  const gezien = new Set();
  for (let cel = 0; cel < puzzle.n * puzzle.n; cel++) {
    const m = puzzle.meubelOp[cel];
    if (m == null || gezien.has(m)) continue;
    gezien.add(m);
    gebruikt.push(m);
  }
  gebruikt.sort((a, b) => (puzzle.meubelNamen[a] ?? '').localeCompare(puzzle.meubelNamen[b] ?? ''));

  const lijst = document.createElement('div');
  lijst.className = 'legenda';
  for (const m of gebruikt) {
    const item = document.createElement('span');
    item.className = 'legenda-item';
    const svg = el('svg', { viewBox: '0 0 48 48', width: 30, height: 30, 'aria-hidden': 'true' });
    tekenMeubel(svg, puzzle.meubelIconen?.[m], { grootte: 48 });
    item.append(svg);
    const naam = document.createElement('span');
    naam.textContent = puzzle.meubelNamen[m] ?? '';
    item.append(naam);
    lijst.append(item);
  }

  const lijk = document.createElement('span');
  lijk.className = 'legenda-item';
  const lijkSvg = el('svg', { viewBox: '0 0 48 48', width: 30, height: 30, 'aria-hidden': 'true' });
  lijkSvg.append(el('circle', { cx: 24, cy: 24, r: 21, class: 'lijkvlak' }));
  lijkSvg.append(el('path', {
    d: 'M24 11a4.5 4.5 0 1 1 0.1 0 Z M22 20l-10 5 M26 20l11 3 M24 19l-2 11l-6 6 M24 19l3 10l8 5',
    class: 'krijtlijn',
  }));
  lijk.append(lijkSvg);
  const lijkNaam = document.createElement('span');
  lijkNaam.textContent = `${puzzle.slachtofferNaam} (het lichaam)`;
  lijk.append(lijkNaam);
  lijst.append(lijk);

  const blok = document.createElement('div');
  const kop = document.createElement('p');
  kop.className = 'label';
  kop.textContent = 'Wat er op het bord staat';
  blok.append(kop, lijst);
  return blok;
}
