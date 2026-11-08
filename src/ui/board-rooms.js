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
import { tekenGeschilderd, meng, zetWereldstof } from './geschilderd.js';
import { tekenBordrand, tekenBordhangers } from './bordrand.js';
import { GESCHILDERD } from './meubelkunst-geschilderd.js';
import { tekenPersoon, tekenMerk, slachtofferElement } from './personenkunst-geschilderd.js';
import { icoonVan } from '../content/iconen.js';
import { geslachtVan } from '../content/namen.js';
import { soortVan, VLOER_VAN, VLOER_VAN_PLEK, WERELDVLOER, WERELDSTOF } from '../content/kamersoorten.js';
import { tekenAankleding, tekenSnippers } from './aankleding.js';

// Een meubelstuk zetten. De tekeningen staan in meubelkunst-geschilderd.js
// als lijstjes onderdelen; geschilderd.js doet het licht. Dat is één laag
// meer dan "teken plaatje X", en die laag is precies waar het verschil zit
// tussen een prent en een pictogram.
const tekenMeubel = (ouder, naam, opties) => tekenGeschilderd(ouder, GESCHILDERD[naam], opties);

const NS = 'http://www.w3.org/2000/svg';
const el = (naam, attrs = {}) => {
  const n = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  return n;
};

const CEL = 76;
// De lijst om het bord. Zie src/ui/bordrand.js: per wereld een hele nacht,
// met verte, gebladerte en licht erin.
//
// Hij was vierentwintig breed, en dat was de reden dat er niets op kon
// staan: een derde van een vakje is ruimte voor een streep, niet voor een
// bos. Nu is hij een hele cel breed op een klein bord en nog altijd twee
// derde op het grootste - genoeg voor een verte, een middengrond en iets
// vlak voor je neus. Op een bord van twaalf bij twaalf krimpt hij mee,
// anders wordt de puzzel zelf te klein op een telefoon.
const randVan = (n) => Math.round(Math.max(58, Math.min(104, 760 / n)));
// Lucht buiten de lijst. Dit was ruimte voor dingen die over het bord heen
// staken; die staan nu in de band zelf, dus er hoeft alleen nog plek te zijn
// voor de slagschaduw onder het bord.
const LUCHT_BOVEN = 18;
const LUCHT_ZIJ = 14;
// Ruimte voor de rij- en kolomaanduiding en het kompas.
const BAND = 22;
const PLAAT = 20;
// Hoe breed is een hoofdletter ten opzichte van de lettergrootte, inclusief
// de spatiering uit de stijl. Gemeten, niet gegokt: 0.58 was te krap.
const BREED = 0.68;

// De vloer volgt het soort ruimte, niet het kamernummer: tegels in de keuken,
// parket in de bibliotheek, gras buiten. Zie src/content/kamersoorten.js.

const PENNING = ['#b8452f', '#2f6ea8', '#3f7d4f', '#8a4f9e', '#c07a1d', '#1f7f85'];

// Uit de hand getrokken lijnen.
//
// Alles op dit bord was kaarsrecht, en daardoor zag het eruit als een
// bouwtekening. Een getrokken lijn beeft een beetje en loopt in het midden
// iets uit de koers. Dat is precies wat een plattegrond van een spelbord
// onderscheidt van een plattegrond van een aannemer.
//
// De beving is berekend uit de coordinaten zelf, dus hij is altijd hetzelfde
// op dezelfde plek - hij danst niet bij elke klik. En twee lijnstukken die
// hetzelfde eindpunt delen, krijgen daar dezelfde afwijking, dus ze sluiten
// netjes op elkaar aan.
function beving(a, b) {
  const h = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return h - Math.floor(h) - 0.5;
}

function schetspad(x1, y1, x2, y2, amp = 1.5) {
  const ax = x1 + beving(x1, y1) * amp;
  const ay = y1 + beving(y1, x1) * amp;
  const bx = x2 + beving(x2, y2) * amp;
  const by = y2 + beving(y2, x2) * amp;
  // Het midden wijkt wat verder uit: dat maakt de lijn een streek in plaats
  // van een scheve lijn.
  const mx = (x1 + x2) / 2 + beving(x1 + x2, y1 - y2) * amp * 2.2;
  const my = (y1 + y2) / 2 + beving(y1 - y2, x1 + x2) * amp * 2.2;
  return `M${ax.toFixed(1)} ${ay.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
}

// Een kleur lichter of donkerder maken. Boven de 1 is lichter.
//
// Hiermee krijgt elk vakje zijn eigen tint. Een vloer waar elke plank precies
// even donker is, is geen vloer maar een vlak - dat is waar "kil" vandaan
// kwam.
export function schuif(hex, factor) {
  const n = parseInt(hex.slice(1), 16);
  const kanaal = (v) => Math.max(0, Math.min(255, Math.round(v * factor)));
  const r = kanaal((n >> 16) & 255);
  const g = kanaal((n >> 8) & 255);
  const b = kanaal(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Meubels die zelf licht geven. Die werpen een warme plek op de vloer, en
// dat is het verschil tussen een kamer met een haard en een kamer met een
// tekening van een haard erin.
const LICHTBRONNEN = new Set([
  'haard', 'fornuis', 'vuur', 'kaarsentafel', 'distilleerketel', 'ketel',
]);

export function renderKamerbord(puzzle, state, acties, opties = {}) {
  // Waar het meubilair in deze wereld van gemaakt is. Zie WERELDSTOF; de
  // ruil gaat er aan het eind van deze functie weer af, zodat de portretjes
  // in het palet en de tegels op de voorpagina hun eigen kleur houden.
  zetWereldstof(WERELDSTOF[puzzle.world?.id]);
  const n = puzzle.n;
  // De sierlijst eromheen kost ruimte: bij vijf bij vijf is hij ruim een
  // derde van de breedte. Op een breed scherm is dat sfeer, op een telefoon
  // eet hij het bord op. Daarom kun je hem uitzetten; dan blijft er een
  // smalle kader over waar de rij- en kolomletters in passen.
  const metRand = opties.rand !== false;
  const RAND = metRand ? randVan(n) : 6;
  // Het bord zelf, en daaromheen de lucht waar de ornamenten in steken.
  const bordB = n * CEL + RAND * 2 + BAND;
  const bordH = n * CEL + RAND * 2 + BAND;
  const breedte = bordB + LUCHT_ZIJ * 2;
  const hoogte = bordH + LUCHT_BOVEN + LUCHT_ZIJ;

  const svg = el('svg', {
    viewBox: `0 0 ${breedte} ${hoogte}`,
    class: 'kamerbord',
    role: 'img',
    'aria-label': `Plattegrond van ${n} bij ${n} vakjes`,
  });
  svg.append(dessins());

  // Het blad waar het bord op ligt. Dit stond eerst als achtergrondkleur op
  // de svg zelf, maar dan vult hij ook de lucht eromheen en kan er niets
  // meer buiten het bord uitsteken.
  svg.append(el('rect', {
    x: LUCHT_ZIJ + 3, y: LUCHT_BOVEN + 6, width: bordB, height: bordH,
    rx: 14, fill: 'rgba(40, 28, 14, 0.34)', filter: 'url(#vager)',
  }));
  svg.append(el('rect', {
    x: LUCHT_ZIJ, y: LUCHT_BOVEN, width: bordB, height: bordH,
    rx: 12, class: 'bordblad',
  }));

  if (metRand) {
    tekenBordrand(svg, {
      wereld: puzzle.world?.id,
      x0: LUCHT_ZIJ, y0: LUCHT_BOVEN, breedte: bordB, hoogte: bordH, dikte: RAND,
    });
  }

  const x = (c) => LUCHT_ZIJ + RAND + BAND + c * CEL;
  const y = (r) => LUCHT_BOVEN + RAND + BAND + r * CEL;
  const rij = (i) => Math.floor(i / n);
  const kol = (i) => i % n;
  const kamer = (i) => puzzle.kamerVan[i];
  const idx = (r, c) => r * n + c;
  // Een vakje waar een figuur zou kunnen staan: alles behalve een meubelstuk.
  const bruikbaar = (i) => puzzle.meubelOp[i] == null;

  // ---------------------------------------------------------------- vloer
  // De soort zegt wat voor ruimte het is, de wereld waar hij van gemaakt is.
  // Zie WERELDVLOER in kamersoorten.js.
  const wv = WERELDVLOER[puzzle.world?.id];
  const vloerVan = (i) => {
    const plek = puzzle.kamerNamen[kamer(i)];
    // Een plek die zijn eigen vloer heeft, krijgt die - ook als de wereld
    // normaal iets anders zou omruilen. Zie VLOER_VAN_PLEK.
    const eigen = VLOER_VAN_PLEK[plek];
    if (eigen) return eigen;
    const basis = VLOER_VAN[soortVan(plek)] ?? VLOER_VAN.zaal;
    if (!wv) return basis;
    return {
      vul: meng(basis.vul, wv.tint, wv.kracht),
      lijn: meng(basis.lijn, wv.tint, wv.kracht),
      dessin: wv.dessin?.[basis.dessin] ?? basis.dessin,
    };
  };

  const vloer = el('g');
  for (let i = 0; i < n * n; i++) {
    const v = vloerVan(i);
    // Elk vakje zijn eigen tint. Niet zichtbaar als je ernaar zoekt, wel
    // zodra je het weglaat: dan is het weer een vlak.
    const toon = 0.92 + ((i * 2654435761) % 160) / 1000;
    vloer.append(el('rect', {
      x: x(kol(i)), y: y(rij(i)), width: CEL, height: CEL, fill: schuif(v.vul, toon),
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

  // ------------------------------------------------------- wandschaduw
  // Langs elke muur loopt een donkere band over de vloer: de schaduw die de
  // muur werpt. Dit ene laagje doet meer voor de diepte dan alle andere bij
  // elkaar - zonder dit is de plattegrond een schema, met dit is het een
  // ruimte waar je in kijkt.
  const DIEP = 19;
  const wand = el('g', { class: 'wandschaduw' });
  for (let i = 0; i < n * n; i++) {
    const r = rij(i);
    const c = kol(i);
    const anders = (rr, cc) =>
      rr < 0 || cc < 0 || rr >= n || cc >= n || kamer(rr * n + cc) !== kamer(i);
    if (anders(r - 1, c)) {
      wand.append(el('rect', { x: x(c), y: y(r), width: CEL, height: DIEP, fill: 'url(#wandrand-n)' }));
    }
    if (anders(r + 1, c)) {
      wand.append(el('rect', { x: x(c), y: y(r + 1) - DIEP, width: CEL, height: DIEP, fill: 'url(#wandrand-z)' }));
    }
    if (anders(r, c - 1)) {
      wand.append(el('rect', { x: x(c), y: y(r), width: DIEP, height: CEL, fill: 'url(#wandrand-w)' }));
    }
    if (anders(r, c + 1)) {
      wand.append(el('rect', { x: x(c + 1) - DIEP, y: y(r), width: DIEP, height: CEL, fill: 'url(#wandrand-o)' }));
    }
  }
  svg.append(wand);

  // ----------------------------------------------------------- aankleding
  // Zie src/ui/aankleding.js: versiering op de vloer, geen onderdeel van de
  // puzzel. Hoe groter de kamer, hoe meer erin ligt, en elk vakje krijgt een
  // ander motief - vier keer hetzelfde kleed is geen sfeer maar behang.
  const kleden = el('g', { class: 'aankleding' });
  for (let k = 0; k < puzzle.kamerNamen.length; k++) {
    const soort = soortVan(puzzle.kamerNamen[k]);
    // De naam van de kamer komt verderop op de vloer te staan. Daar leggen
    // we niets neer: een kleed half onder een naam leest als een balkje
    // achter de letters, en dat was nou juist wat eruit moest.
    const naamrij = langsteVrijeRij(puzzle, n, k);
    const onderNaam = new Set();
    if (naamrij) {
      for (let c = naamrij.c; c < naamrij.c + naamrij.lengte; c++) onderNaam.add(naamrij.r * n + c);
    }

    const cellen = [];
    for (let i = 0; i < n * n; i++) if (kamer(i) === k && bruikbaar(i)) cellen.push(i);
    if (!cellen.length) continue;

    // Eerst stond er hoogstens één ding per twee vakjes, en bleef de helft
    // van de vloer leeg. Een kamer waar niets ligt ziet eruit als een kamer
    // waar niemand komt. Nu krijgt bijna elk vrij vakje iets, en wat
    // overblijft krijgt in elk geval wat stof en krassen.
    cellen.forEach((cel, t) => {
      const mx = x(kol(cel)) + CEL / 2;
      const my = y(rij(cel)) + CEL / 2;
      // Op de rij waar straks de naam komt te staan mag wel iets liggen,
      // maar niet in het midden: daar lopen de letters. Alles schuift naar
      // de onderrand en wordt wat kleiner.
      const bijNaam = onderNaam.has(cel);
      // beving() geeft een getal tussen -0.5 en 0.5, dus los loopt van 0 tot
      // 0.5.
      //
      // Hier stond bijna op elk vrij vakje iets, groot en midden op het
      // vakje. Daarmee leek elk vakje bezet: je kon niet meer zien waar je
      // nog iemand neer mocht zetten, want een kruk in het midden van een
      // vakje ziet er precies zo uit als een meubelstuk dat het vakje
      // blokkeert. Nu krijgt ongeveer een op de drie vakjes iets, het is
      // kleiner, en het ligt in een hoek. Het midden van een vakje blijft
      // leeg, want dat is waar een figuur komt te staan.
      const los = Math.abs(beving(cel * 3, k * 7));
      if (los < 0.34 || bijNaam) {
        tekenSnippers(kleden, cel, mx, my);
        return;
      }

      // Alleen uitwijken naar een kant waar de kamer doorloopt. Anders
      // schuift een kleed de muur in, en dan ligt het half in de gang.
      const vrij = (dr, dc) => {
        const r = rij(cel) + dr;
        const c = kol(cel) + dc;
        return r >= 0 && c >= 0 && r < n && c < n && kamer(r * n + c) === k;
      };
      // Naar welke hoek het schuift. Liefst naar een kant waar de kamer
      // doorloopt - anders schuift het de muur in en ligt het half in de
      // gang - maar het gaat hoe dan ook uit het midden weg.
      const ruwX = beving(cel, k * 5);
      const ruwY = beving(k * 5, cel);
      const kantX = Math.sign(ruwX) || 1;
      const kantY = Math.sign(ruwY) || 1;
      const naarX = vrij(0, kantX) ? kantX : -kantX;
      const naarY = vrij(kantY, 0) ? kantY : -kantY;
      const dx = naarX * CEL * (0.26 + Math.abs(ruwX) * 0.1);
      const dy = naarY * CEL * (0.24 + Math.abs(ruwY) * 0.1);

      // Klein: het is aankleding in een hoek, geen inboedel. Niet alles even
      // groot, want allemaal even groot leest als een stempel.
      const maat = 0.5 + Math.abs(beving(cel * 11, k + 3)) * 0.34;
      const draai = el('g', {
        transform: `translate(${mx.toFixed(1)} ${my.toFixed(1)}) scale(${maat.toFixed(2)}) translate(${(-mx).toFixed(1)} ${(-my).toFixed(1)}) rotate(${(beving(cel, k) * 15).toFixed(2)} ${mx} ${my}) translate(${dx.toFixed(1)} ${dy.toFixed(1)})`,
      });
      kleden.append(draai);
      tekenAankleding(draai, soort, mx, my, CEL, k + t);

    });
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
    const vak = {
      x: x(minC), y: y(minR),
      width: (maxC - minC + 1) * CEL, height: (maxR - minR + 1) * CEL,
      'clip-path': `url(#kamer-${k})`,
    };
    licht.append(el('rect', { ...vak, fill: 'url(#kamergloed)' }));
    // En er overheen het schuine licht: linksboven lichter, rechtsonder
    // donkerder. Dat geeft de kamer een hoek om in te staan.
    licht.append(el('rect', { ...vak, fill: 'url(#kamerschuin)' }));
  }
  svg.append(defs2);
  svg.append(licht);

  // -------------------------------------------------------------- naden
  // Dunne naad binnen een kamer, dikke muur tussen kamers.
  // Eerst een volledig vakjesraster: elke vakjesgrens krijgt een lijn, ook
  // midden in een kamer. Anders moet je uit het vloerpatroon afleiden waar
  // een vakje ophoudt, en dat lukt niet.
  const raster = el('g');
  // Per vakje een eigen streek in plaats van een lijn over het hele bord:
  // dan beeft hij ook per vakje, en dat leest als met de hand getrokken.
  for (let k = 1; k < n; k++) {
    for (let j = 0; j < n; j++) {
      raster.append(el('path', { d: schetspad(x(k), y(j), x(k), y(j + 1), 1.5), class: 'vakjeslijn' }));
      raster.append(el('path', { d: schetspad(x(j), y(k), x(j + 1), y(k), 1.5), class: 'vakjeslijn' }));
    }
  }
  svg.append(raster);

  const muren = el('g');
  // Een muur is geen streep maar een muur: een donkere voet met een lichter
  // bovenvlak erop, alsof je van schuin boven op een maquette kijkt. Dat is
  // wat een plattegrond een gebouw maakt in plaats van een schema.
  // De drie lijnen van een muur beven samen: eerst de streek, en dan
  // dezelfde streek een paar pixels verschoven. Anders waaieren ze uiteen.
  const muurStreek = (d, dx, dy) => {
    muren.append(el('path', { d, class: 'muurvoet' }));
    muren.append(el('path', { d, class: 'muurtop', transform: `translate(${dx} ${dy})` }));
    muren.append(el('path', { d, class: 'muurglans', transform: `translate(${dx * 1.75} ${dy * 1.75})` }));
  };
  // Dwarsnerf op het bovenvlak van de muur: zonder die streepjes is een muur
  // een balk kleur, en daar leest geen materiaal in.
  const muurNerf = (x1, y1, x2, y2, dx, dy) => {
    const lengte = Math.hypot(x2 - x1, y2 - y1);
    const stappen = Math.max(2, Math.round(lengte / 11));
    for (let st = 1; st < stappen; st++) {
      const t = st / stappen;
      const px = x1 + (x2 - x1) * t + dx;
      const py = y1 + (y2 - y1) * t + dy;
      // Haaks op de muur, en net niet over de hele breedte.
      const hx = ((y2 - y1) / lengte) * 2.4;
      const hy = ((x1 - x2) / lengte) * 2.4;
      muren.append(el('path', {
        d: `M${(px - hx).toFixed(1)} ${(py - hy).toFixed(1)} L${(px + hx).toFixed(1)} ${(py + hy).toFixed(1)}`,
        class: 'muurnerf',
      }));
    }
  };
  const muurVert = (cx, y1, y2) => {
    muurStreek(schetspad(cx, y1, cx, y2, 2.0), -2, 0);
    muurNerf(cx, y1, cx, y2, -2, 0);
  };
  const muurHor = (x1, x2, cy) => {
    muurStreek(schetspad(x1, cy, x2, cy, 2.0), 0, -2);
    muurNerf(x1, cy, x2, cy, 0, -2);
  };

  for (let i = 0; i < n * n; i++) {
    const r = rij(i);
    const c = kol(i);
    const rechts = c < n - 1 ? i + 1 : null;
    const onder = r < n - 1 ? i + n : null;
    if (rechts != null && kamer(i) !== kamer(rechts)) muurVert(x(c + 1), y(r), y(r + 1));
    if (onder != null && kamer(i) !== kamer(onder)) muurHor(x(c), x(c + 1), y(r + 1));
  }
  svg.append(muren);

  // De buitenmuur: dezelfde opbouw, maar helemaal rond.
  const buiten = el('g');
  const hoeken = [
    [x(0), y(0), x(n), y(0)],
    [x(n), y(0), x(n), y(n)],
    [x(n), y(n), x(0), y(n)],
    [x(0), y(n), x(0), y(0)],
  ];
  for (const [ax, ay, bx, by] of hoeken) {
    const d = schetspad(ax, ay, bx, by, 1.6);
    buiten.append(el('path', { d, class: 'buitenmuur-voet' }));
    buiten.append(el('path', { d, class: 'buitenmuur-top' }));
  }
  svg.append(buiten);

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
  const kx = LUCHT_ZIJ + RAND + BAND / 2 - 2;
  const ky = LUCHT_BOVEN + RAND + BAND / 2 + 2;
  randen.append(el('path', { d: `M ${kx} ${ky - 9} L ${kx + 4} ${ky + 2} L ${kx} ${ky - 0.5} L ${kx - 4} ${ky + 2} Z`, class: 'kompasnaald' }));
  const nLetter = el('text', { x: kx, y: ky + 11, 'text-anchor': 'middle', class: 'kompasletter' });
  nLetter.textContent = 'N';
  randen.append(nLetter);
  svg.append(randen);

  // ------------------------------------------------------------ kamernamen
  // De naam staat op de grond geschreven, zoals op een bouwtekening. Eerst
  // stond hij in een balkje dat werd neergezet waar het paste, en dat trok
  // het beeld scheef: je zag de balk en niet de kamer. Nu loopt hij over het
  // midden van de kamer, een slag scheef, met een lichte gloed eronder zodat
  // hij op elke vloer leesbaar blijft. De meubels komen er bovenop te staan,
  // want de naam ligt op de vloer.
  const namen = el('g', { class: 'kamernamen' });
  for (let k = 0; k < puzzle.kamerNamen.length; k++) {
    const cellen = [];
    for (let i = 0; i < n * n; i++) if (kamer(i) === k) cellen.push(i);
    if (!cellen.length) continue;

    // Op een vrij stuk vloer, niet over de meubels heen: anders valt de
    // naam half achter een kast en kun je hem niet lezen. We zoeken de
    // langste rij vakjes in deze kamer waar niets op staat.
    const run = langsteVrijeRij(puzzle, n, k);
    if (!run) continue;
    const breedKamer = run.lengte * CEL;

    const naam = puzzle.kamerNamen[k].toUpperCase();
    let regels = [naam];
    let groot = (breedKamer - 10) / (naam.length * BREED);
    if (groot < 9) {
      regels = splits(naam);
      groot = (breedKamer - 10) / (Math.max(...regels.map((t) => t.length)) * BREED);
    }
    // Kleiner dan het was, en in stappen van een halve punt. Zeventien was
    // zo groot dat de naam het bord ging regeren in plaats van het te
    // dienen; en doordat elke kamer zijn eigen uitgerekende maat kreeg,
    // stonden er op één bord acht verschillende lettergroottes door elkaar.
    // Afronden op een halve punt geeft er in de praktijk nog drie of vier.
    groot = Math.max(7, Math.min(12.5, groot));
    groot = Math.round(groot * 2) / 2;

    // Recht op de middellijn van de rij vakjes waar de naam op ligt. Hier
    // kreeg elke naam een eigen scheve hoek van een paar graden - bedoeld
    // als handschrift, maar met tien namen op een bord ziet het eruit als
    // tien stickers die scheef zijn opgeplakt. Zonder die draai lopen alle
    // namen met de vakjes mee.
    const cx = x(run.c) + (run.lengte * CEL) / 2;
    // Bovenin het vakje, niet in het midden. Een kruisje staat midden in
    // een vakje, en een naam die daar ook staat wordt doormidden gesneden:
    // "DE HOO✕DGANG". Boven de kruisjes langs blijft hij heel, en onderin
    // is al bezet door de schetsletters.
    const cy = y(run.r) + CEL * 0.2;
    const groep = el('g');
    // De letterbreedte van een geschreven letter laat zich niet uitrekenen,
    // dus leggen we hem vast: nooit breder dan de vrije rij waar hij op
    // staat. Zo loopt een lange naam niet de buurkamer in.
    const ruimte = run.lengte * CEL - 10;
    regels.forEach((tekst, i) => {
      const geschat = tekst.length * groot * BREED;
      const t = el('text', {
        x: cx,
        y: cy + (i - (regels.length - 1) / 2) * (groot + 3) + groot * 0.34,
        'text-anchor': 'middle',
        class: 'kamernaam',
        'font-size': groot.toFixed(1),
        textLength: Math.min(ruimte, geschat).toFixed(1),
        lengthAdjust: 'spacingAndGlyphs',
      });
      t.textContent = tekst;
      groep.append(t);
    });
    namen.append(groep);
  }
  svg.append(namen);

  // ----------------------------------------------------------- meubels
  const spullen = el('g');
  // Eerst het licht dat een haard of een kaars op de vloer werpt, want dat
  // ligt onder alles - ook onder de meubels van de buren.
  for (let i = 0; i < n * n; i++) {
    const m = puzzle.meubelOp[i];
    if (m == null) continue;
    if (!LICHTBRONNEN.has(puzzle.meubelIconen?.[m])) continue;
    spullen.append(el('circle', {
      cx: x(kol(i)) + CEL / 2, cy: y(rij(i)) + CEL / 2,
      r: CEL * 1.05, fill: 'url(#lampgloed)',
    }));
  }
  for (let i = 0; i < n * n; i++) {
    const m = puzzle.meubelOp[i];
    if (m == null) continue;
    const naam = puzzle.meubelNamen[m];
    // Een schaduw onder het meubel, anders zweeft het boven de vloer. Vaag
    // getrokken: een scherpe ovaal onder een kast is geen schaduw maar een
    // mat.
    spullen.append(el('ellipse', {
      cx: x(kol(i)) + CEL / 2 + 3, cy: y(rij(i)) + CEL - 11,
      rx: CEL * 0.36, ry: 7.5, class: 'meubelschaduw', filter: 'url(#vaag)',
    }));
    const scheef = el('g', {
      transform: `rotate(${(beving(i, m) * 5).toFixed(2)} ${x(kol(i)) + CEL / 2} ${y(rij(i)) + CEL / 2})`,
    });
    spullen.append(scheef);
    const kunst = tekenMeubel(scheef, puzzle.meubelIconen?.[m], {
      x: x(kol(i)) + 2, y: y(rij(i)) + 1, grootte: CEL - 4,
    });
    // Valt er geen tekening te maken, dan liever het lijnicoon dan niets.
    if (!kunst) {
      tekenIcoon(scheef, icoonVan(naam) ?? 'deur', {
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

    // Iedereen staat er hetzelfde bij, ook het slachtoffer: een mens, geen
    // krijtcontour. Dat die ene dood is zie je aan het kruis erdoorheen.
    const maat = CEL - 16;
    tekenPersoon(g, {
      index: pi,
      letter: (puzzle.personen[pi] ?? '?').charAt(0).toUpperCase(),
      geslacht: geslachtVan(puzzle.personen[pi] ?? ''),
      x: cx - maat / 2,
      y: cy - maat / 2,
      grootte: maat,
    });
    if (pi === puzzle.slachtofferIdx) {
      tekenMerk(g, { teken: puzzle.zaak?.merk, x: cx - maat / 2, y: cy - maat / 2, grootte: maat });
    }
    // Na een controle: een ring om de penning. Rood om wat verkeerd staat,
    // groen om wat klopt. Alleen rood zou je laten zoeken naar wat je mag
    // laten staan; met allebei lees je de uitslag in één oogopslag af.
    if (state.fout?.has(cel)) g.append(el('circle', { cx, cy, r: 30, class: 'penningfout' }));
    else if (state.goed?.has(cel)) g.append(el('circle', { cx, cy, r: 30, class: 'penninggoed' }));
    geplaatst.append(g);
  }
  svg.append(geplaatst);

  // ------------------------------------------------------------- kruisjes
  // Zodra iemand staat, kan er in diezelfde rij en kolom niemand meer bij.
  // Die kruisjes zet het bord zelf, want ze volgen dwingend uit de regel -
  // ze met de hand laten zetten is bezigheidstherapie.
  // Of het bord ze zelf zet, is een keuze van de speler: handig als je
  // snel wilt, hinderlijk als je het zelf wilt doorzien. Zie
  // kruisjesVanzelf in state.js en de knop in de werkbalk.
  const vanzelf = new Set();
  for (const cel of (opties.kruisjesVanzelf === false ? [] : Object.values(state.plaats))) {
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
    // Twee keer hetzelfde pad: een lichte baan eronder en het kruis
    // erbovenop. Zonder die baan verdwijnt een kruisje in een vloer met
    // tegels of gras - het stond er wel, maar je zag het niet.
    const d = `M ${cx - 11} ${cy - 11} l 22 22 M ${cx + 11} ${cy - 11} l -22 22`;
    const zacht = vanzelf.has(cel);
    kruisjes.append(el('path', { d, class: zacht ? 'kruisbaan kruisbaan-vanzelf' : 'kruisbaan' }));
    kruisjes.append(el('path', { d, class: zacht ? 'kruisje kruisje-vanzelf' : 'kruisje' }));
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
        x: x(kol(cel)) + 11 + (k % 4) * 16,
        y: y(rij(cel)) + CEL - 23 + Math.floor(k / 4) * 15,
        class: 'schetsletter',
      });
      t.textContent = (puzzle.personen[fi] ?? '?').charAt(0).toUpperCase();
      schetsen.append(t);
    });
  }
  svg.append(schetsen);


  // -------------------------------------------------------------- vignet
  // De hoeken van het bord wat donkerder. Het oog gaat daardoor naar het
  // midden, en het bord ligt op tafel in plaats van dat het een plaatje is.
  svg.append(el('rect', {
    x: x(0), y: y(0), width: n * CEL, height: n * CEL,
    fill: 'url(#bordvignet)', class: 'bordvignet', 'pointer-events': 'none',
  }));

  // ------------------------------------------------------------ klikvlak
  const klik = el('g');
  for (let i = 0; i < n * n; i++) {
    const vak = el('rect', {
      x: x(kol(i)), y: y(rij(i)), width: CEL, height: CEL,
      class: 'klikvak', 'data-cel': i,
    });
    const m = puzzle.meubelOp[i];
    if (m != null) {
      vak.classList.add('klikvak-dicht');
      // Hoe heet dat ding? Een aanwijzing noemt "de gieterplank", en dan
      // moet je op het bord kunnen opzoeken welk tekeningetje dat is
      // zonder eerst de hele legenda door te lezen. Wijs het aan en de
      // naam staat er; tik erop en hij komt onder het bord te staan, want
      // op een telefoon bestaat aanwijzen niet.
      const naam = puzzle.meubelNamen?.[m];
      if (naam) {
        const titel = el('title');
        titel.textContent = naam;
        vak.append(titel);
        vak.addEventListener('click', () => acties.klikMeubel?.(naam));
      }
    } else {
      vak.addEventListener('click', () => acties.klikCel(i));
    }
    klik.append(vak);
  }
  svg.append(klik);

  // Als laatste, zodat het over het speelveld heen valt.
  if (metRand) {
    tekenBordhangers(svg, {
      wereld: puzzle.world?.id,
      x0: LUCHT_ZIJ, y0: LUCHT_BOVEN, breedte: bordB, hoogte: bordH, dikte: RAND,
      luchtBoven: LUCHT_BOVEN, luchtZij: LUCHT_ZIJ,
    });
  }

  zetWereldstof(null);
  return svg;
}

// De langste aaneengesloten reeks vakjes van een kamer op een rij.
// De langste rij aaneengesloten vakjes van deze kamer waar geen meubel op
// staat. Daar past de naam zonder achter een kast te verdwijnen.
function langsteVrijeRij(puzzle, n, k) {
  let beste = null;
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      const vrij = (i) => puzzle.kamerVan[i] === k && puzzle.meubelOp[i] == null;
      if (!vrij(r * n + c)) { c++; continue; }
      const start = c;
      while (c < n && vrij(r * n + c)) c++;
      const lengte = c - start;
      if (!beste || lengte > beste.lengte) beste = { r, c: start, lengte };
    }
  }
  return beste;
}

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

// De vloerpatronen. De plattegrond gebruikt ze ook: een keuken hoort op
// beide borden dezelfde tegels te hebben, anders zijn het twee huizen.
export function dessins() {
  const defs = el('defs');
  const h = CEL / 2;
  const q = CEL / 4;

  // Elke vloer is een eigen patroon, niet een lijntje om de zoveel pixels.
  // Hout heeft nerf en spijkers, tegels hebben voeg en glans, steen heeft
  // scheuren, gras heeft pollen. Dat is het verschil tussen een vloer en een
  // vlak met een streepje erop.

  // Planken van verschillende breedte, met noesten en nerf die niet in elke
  // plank op dezelfde plek zit. Het patroon beslaat twee vakjes, dus de
  // herhaling valt pas op als je ernaar zoekt - en dat was precies het
  // probleem met de oude tegel van negentien pixels.
  const plankmaat = CEL * 2;
  const pk = (k) => {
    const v = Math.sin(k * 12.9898 + 7.3) * 43758.5453;
    return v - Math.floor(v);
  };
  const planken = el('pattern', {
    id: 'dessin-planken', width: plankmaat, height: plankmaat, patternUnits: 'userSpaceOnUse',
  });
  let yy = 0;
  let rijnr = 0;
  while (yy < plankmaat) {
    const dikte = 14 + pk(rijnr) * 11;
    planken.append(el('path', { d: `M0 ${yy.toFixed(1)} H${plankmaat}`, class: 'dessinlijn' }));
    // Iets lichtere of donkerdere plank: geen twee planken zijn gelijk.
    planken.append(el('rect', {
      x: 0, y: yy, width: plankmaat, height: dikte,
      class: pk(rijnr + 40) > 0.5 ? 'dessinplank-licht' : 'dessinplank-donker',
    }));
    // De kopse naden liggen nooit onder elkaar.
    const naad = pk(rijnr + 80) * plankmaat;
    planken.append(el('path', { d: `M${naad.toFixed(1)} ${yy.toFixed(1)} v${dikte.toFixed(1)}`, class: 'dessinlijn' }));
    planken.append(el('circle', { cx: (naad - 5).toFixed(1), cy: (yy + dikte * 0.5).toFixed(1), r: 0.9, class: 'dessinspijker' }));
    planken.append(el('circle', { cx: (naad + 5).toFixed(1), cy: (yy + dikte * 0.5).toFixed(1), r: 0.9, class: 'dessinspijker' }));
    for (let nf = 0; nf < 3; nf++) {
      const nx = pk(rijnr * 5 + nf) * plankmaat;
      const ny = yy + 3 + pk(rijnr * 5 + nf + 11) * (dikte - 6);
      planken.append(el('path', {
        d: `M${nx.toFixed(1)} ${ny.toFixed(1)} q ${(CEL * 0.22).toFixed(1)} ${(pk(nf + rijnr) * 4 - 2).toFixed(1)} ${(CEL * 0.46).toFixed(1)} 0`,
        class: 'dessinnerf',
      }));
    }
    // Een noest, af en toe.
    if (pk(rijnr + 120) > 0.55) {
      const kx = pk(rijnr + 160) * plankmaat;
      const ky = yy + dikte * 0.5;
      planken.append(el('ellipse', { cx: kx.toFixed(1), cy: ky.toFixed(1), rx: 3.2, ry: 2.1, class: 'dessinnoest' }));
      planken.append(el('ellipse', { cx: kx.toFixed(1), cy: ky.toFixed(1), rx: 1.5, ry: 1, class: 'dessinnoest-kern' }));
    }
    yy += dikte;
    rijnr++;
  }
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
  //
  // Dit patroon was eerst een tegel van negentien pixels met drie sprietjes
  // erin, en dan zie je geen gras maar behang: precies dezelfde drie
  // sprietjes, vierhonderd keer. Nu is de tegel twee vakjes groot en staat
  // er in elke tegel iets anders - pollen van verschillende hoogte, een paar
  // klaverblaadjes, hier en daar een bloempje.
  const grasmaat = CEL * 2;
  const gras = el('pattern', {
    id: 'dessin-gras', width: grasmaat, height: grasmaat, patternUnits: 'userSpaceOnUse',
  });
  const gr = (k) => {
    const h = Math.sin(k * 12.9898 + 4.1) * 43758.5453;
    return h - Math.floor(h);
  };
  for (let t = 0; t < 54; t++) {
    const gx = gr(t) * grasmaat;
    const gy = gr(t + 70) * grasmaat;
    const hoog = 6 + gr(t + 140) * 9;
    const helt = (gr(t + 210) - 0.5) * 7;
    const dik = gr(t + 280) > 0.6 ? 'dessingras dessingras-dik' : 'dessingras';
    gras.append(el('path', {
      d: `M${gx.toFixed(1)} ${gy.toFixed(1)} q ${(helt * 0.4).toFixed(1)} ${(-hoog * 0.6).toFixed(1)} ${helt.toFixed(1)} ${(-hoog).toFixed(1)}`,
      class: dik,
    }));
    // Een pol is meer dan één spriet.
    if (gr(t + 350) > 0.45) {
      gras.append(el('path', {
        d: `M${(gx + 3).toFixed(1)} ${gy.toFixed(1)} q ${(-helt * 0.3).toFixed(1)} ${(-hoog * 0.5).toFixed(1)} ${(-helt * 0.7).toFixed(1)} ${(-hoog * 0.8).toFixed(1)}`,
        class: dik,
      }));
    }
  }
  for (let t = 0; t < 7; t++) {
    const bx = gr(t + 420) * grasmaat;
    const by = gr(t + 490) * grasmaat;
    gras.append(el('circle', { cx: bx.toFixed(1), cy: by.toFixed(1), r: 1.9, class: 'dessinbloem' }));
    gras.append(el('circle', { cx: (bx + 4).toFixed(1), cy: (by + 3).toFixed(1), r: 1.4, class: 'dessinbloem' }));
  }
  for (let t = 0; t < 9; t++) {
    const kx = gr(t + 560) * grasmaat;
    const ky = gr(t + 630) * grasmaat;
    gras.append(el('ellipse', {
      cx: kx.toFixed(1), cy: ky.toFixed(1), rx: 4 + gr(t + 700) * 5, ry: 2.5 + gr(t + 770) * 3,
      class: 'dessinpol',
    }));
  }
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

  // Vloerplaat: geschroefde stalen platen met een traanplaatreliëf. Dit is
  // wat een ruimtestation onder je voeten heeft in plaats van parket. De
  // naden lopen over twee vakjes, de schroeven zitten in de hoeken, en het
  // reliëf is een rij schuine streepjes - genoeg om metaal te lezen, niet
  // zoveel dat het een ruitjesvloer wordt.
  const plaatmaat = CEL * 2;
  const plaat = el('pattern', {
    id: 'dessin-plaat', width: plaatmaat, height: plaatmaat, patternUnits: 'userSpaceOnUse',
  });
  plaat.append(el('path', { d: `M0 0 H${plaatmaat} M0 ${CEL} H${plaatmaat}`, class: 'dessinlijn' }));
  plaat.append(el('path', { d: `M0 0 V${plaatmaat} M${CEL} 0 V${plaatmaat}`, class: 'dessinlijn' }));
  for (const [sx, sy] of [[0, 0], [CEL, 0], [0, CEL], [CEL, CEL]]) {
    for (const [dx, dy] of [[5, 5], [CEL - 5, 5], [5, CEL - 5], [CEL - 5, CEL - 5]]) {
      plaat.append(el('circle', { cx: sx + dx, cy: sy + dy, r: 1.5, class: 'dessinspijker' }));
    }
    for (let k = 0; k < 4; k++) {
      const ox = sx + 13 + k * 8;
      const oy = sy + 16 + (k % 2) * 13;
      plaat.append(el('path', { d: `M${ox} ${oy} l5 5`, class: 'dessindraad' }));
    }
  }
  defs.append(plaat);

  // Bestrating: stoeptegels van ongelijke maat, met voegen waar vuil in
  // zit en hier en daar een scheur. Dit is wat er onder een steegje, een
  // binnenplaats, een schoolplein en een dakterras hoort te liggen - die
  // kregen allemaal gras, omdat ze allemaal "buiten" heetten.
  const stoepmaat = CEL * 2;
  const bestrating = el('pattern', {
    id: 'dessin-bestrating', width: stoepmaat, height: stoepmaat, patternUnits: 'userSpaceOnUse',
  });
  const bk = (k) => {
    const v = Math.sin(k * 7.1234 + 2.9) * 28461.7;
    return v - Math.floor(v);
  };
  let sy = 0;
  let rij = 0;
  while (sy < stoepmaat) {
    const hoog = 17 + bk(rij) * 9;
    bestrating.append(el('path', { d: `M0 ${sy.toFixed(1)} H${stoepmaat}`, class: 'dessinvoeg' }));
    let sx = (rij % 2) * -12 + bk(rij + 90) * 8;
    while (sx < stoepmaat) {
      const breed = 22 + bk(rij * 7 + sx) * 16;
      bestrating.append(el('path', { d: `M${sx.toFixed(1)} ${sy.toFixed(1)} v${hoog.toFixed(1)}`, class: 'dessinvoeg' }));
      // Niet elke tegel is even licht: ze zijn op verschillende momenten
      // gelegd en verschillend sleets geworden.
      if (bk(sx + rij * 13) > 0.62) {
        bestrating.append(el('rect', {
          x: (sx + 1).toFixed(1), y: (sy + 1).toFixed(1),
          width: (breed - 2).toFixed(1), height: (hoog - 2).toFixed(1),
          class: 'dessinvlak',
        }));
      }
      if (bk(sx * 3 + rij) > 0.86) {
        bestrating.append(el('path', {
          d: `M${(sx + breed * 0.3).toFixed(1)} ${(sy + hoog * 0.2).toFixed(1)} l${(breed * 0.25).toFixed(1)} ${(hoog * 0.5).toFixed(1)}`,
          class: 'dessinscheur',
        }));
      }
      sx += breed;
    }
    sy += hoog;
    rij++;
  }
  for (let t = 0; t < 14; t++) {
    bestrating.append(el('circle', {
      cx: (bk(t + 11) * stoepmaat).toFixed(1), cy: (bk(t + 77) * stoepmaat).toFixed(1),
      r: (0.6 + bk(t + 140) * 0.9).toFixed(1), class: 'dessinspikkel',
    }));
  }
  defs.append(bestrating);

  // Sneeuw: geen vlak wit, maar ribbels waar de wind overheen is gegaan,
  // een paar kuiltjes en wat glinstering. Een besneeuwde tuin met gras
  // erin was precies het soort scheefheid waar je overheen leest tot
  // iemand het aanwijst.
  const sneeuwmaat = CEL * 2;
  const sneeuw = el('pattern', {
    id: 'dessin-sneeuw', width: sneeuwmaat, height: sneeuwmaat, patternUnits: 'userSpaceOnUse',
  });
  const sk = (k) => {
    const v = Math.sin(k * 15.731 + 4.1) * 19483.3;
    return v - Math.floor(v);
  };
  for (let t = 0; t < 7; t++) {
    const rx = 14 + sk(t) * 24;
    sneeuw.append(el('ellipse', {
      cx: (sk(t + 30) * sneeuwmaat).toFixed(1), cy: (sk(t + 60) * sneeuwmaat).toFixed(1),
      rx: rx.toFixed(1), ry: (rx * 0.3).toFixed(1), class: 'dessinvlak',
    }));
  }
  for (let t = 0; t < 9; t++) {
    const x = sk(t + 120) * sneeuwmaat;
    const y = sk(t + 150) * sneeuwmaat;
    sneeuw.append(el('path', {
      d: `M${x.toFixed(1)} ${y.toFixed(1)} q${(9 + sk(t) * 8).toFixed(1)} ${(-2 - sk(t + 9) * 3).toFixed(1)} ${(19 + sk(t) * 14).toFixed(1)} 0`,
      class: 'dessinnerf',
    }));
  }
  for (let t = 0; t < 22; t++) {
    sneeuw.append(el('circle', {
      cx: (sk(t + 200) * sneeuwmaat).toFixed(1), cy: (sk(t + 260) * sneeuwmaat).toFixed(1),
      r: (0.5 + sk(t + 300) * 0.7).toFixed(1), class: 'dessinglans',
    }));
  }
  defs.append(sneeuw);

  // Water: het ondiepe bad, het pinguïnbad. Rimpels die in één richting
  // lopen met een lichtstreep erop, en een paar vlekken waar de zon op
  // staat. Een egaal blauw vlak leest als verf, niet als water.
  const watermaat = CEL * 2;
  const water = el('pattern', {
    id: 'dessin-water', width: watermaat, height: watermaat, patternUnits: 'userSpaceOnUse',
  });
  const wk = (k) => {
    const v = Math.sin(k * 9.317 + 1.7) * 23157.1;
    return v - Math.floor(v);
  };
  for (let t = 0; t < 26; t++) {
    const x = wk(t) * watermaat;
    const y = wk(t + 40) * watermaat;
    const b = 16 + wk(t + 80) * 22;
    water.append(el('path', {
      d: `M${x.toFixed(1)} ${y.toFixed(1)} q${(b / 2).toFixed(1)} ${(-2.4 - wk(t) * 2.4).toFixed(1)} ${b.toFixed(1)} 0`,
      class: 'dessinrimpel',
    }));
  }
  for (let t = 0; t < 9; t++) {
    water.append(el('ellipse', {
      cx: (wk(t + 130) * watermaat).toFixed(1), cy: (wk(t + 170) * watermaat).toFixed(1),
      rx: (10 + wk(t + 200) * 14).toFixed(1), ry: (3 + wk(t + 230) * 3).toFixed(1),
      class: 'dessinglans',
    }));
  }
  defs.append(water);

  // Warm licht in elke kamer: een zachte gloed vanuit het midden. Zonder dat
  // is een vloer een egaal vlak, en daar komt "kil" vandaan.
  const gloed = el('radialGradient', { id: 'kamergloed' });
  // De kleur van dat licht staat in de stylesheet, want hij hoort bij de
  // wereld: kaarslicht in een landhuis, tl-licht op een ruimtestation. Een
  // warme gloed over een stalen vloer maakt er weer hout van.
  gloed.append(el('stop', { offset: '0%', class: 'gloedkern', 'stop-opacity': '0.30' }));
  gloed.append(el('stop', { offset: '48%', class: 'gloedmid', 'stop-opacity': '0.10' }));
  gloed.append(el('stop', { offset: '100%', class: 'gloedrand', 'stop-opacity': '0.30' }));
  defs.append(gloed);

  // Het licht valt schuin in: linksboven is de vloer lichter dan rechtsonder.
  // Eén verloop over de hele kamer, en daardoor leest een kamer als een
  // ruimte met een hoek in plaats van als een vlak.
  const schuin = el('linearGradient', { id: 'kamerschuin', x1: '0', y1: '0', x2: '0.85', y2: '1' });
  schuin.append(el('stop', { offset: '0%', 'stop-color': '#fffaf0', 'stop-opacity': '0.38' }));
  schuin.append(el('stop', { offset: '46%', 'stop-color': '#fff6e4', 'stop-opacity': '0.05' }));
  schuin.append(el('stop', { offset: '100%', 'stop-color': '#1d1206', 'stop-opacity': '0.34' }));
  defs.append(schuin);

  // ------------------------------------------------------- wandschaduw
  // Een muur werpt schaduw op de vloer ernaast. Zonder dat zweeft de muur
  // boven de plattegrond en blijft het een schema; mét dat zie je meteen
  // waar de ruimte ophoudt. Vier richtingen, want een muur kan aan elke
  // kant van een vakje staan.
  const randen = { n: ['0', '0', '0', '1'], z: ['0', '1', '0', '0'], w: ['0', '0', '1', '0'], o: ['1', '0', '0', '0'] };
  for (const [naam, [x1, y1, x2, y2]] of Object.entries(randen)) {
    const g = el('linearGradient', { id: `wandrand-${naam}`, x1, y1, x2, y2 });
    g.append(el('stop', { offset: '0%', 'stop-color': '#241708', 'stop-opacity': '0.40' }));
    g.append(el('stop', { offset: '55%', 'stop-color': '#241708', 'stop-opacity': '0.09' }));
    g.append(el('stop', { offset: '100%', 'stop-color': '#241708', 'stop-opacity': '0' }));
    defs.append(g);
  }

  // Zachte schaduwen en gloed. Een vervaagde vlek leest als licht; een
  // scherp omlijnde ovaal leest als een sticker.
  for (const [id, mate] of [['vaag', 3.4], ['vager', 6.5]]) {
    const f = el('filter', { id, x: '-60%', y: '-60%', width: '220%', height: '220%' });
    f.append(el('feGaussianBlur', { stdDeviation: mate }));
    defs.append(f);
  }

  // Het licht van een haard, een kaars of een fornuis op de vloer eromheen.
  const lamp = el('radialGradient', { id: 'lampgloed' });
  lamp.append(el('stop', { offset: '0%', 'stop-color': '#ffcf72', 'stop-opacity': '0.55' }));
  lamp.append(el('stop', { offset: '45%', 'stop-color': '#ffb545', 'stop-opacity': '0.22' }));
  lamp.append(el('stop', { offset: '100%', 'stop-color': '#ff9e2a', 'stop-opacity': '0' }));
  defs.append(lamp);

  // Een vignet over het hele bord: de hoeken wat donkerder, zodat het bord
  // op tafel ligt in plaats van tegen een muur hangt.
  const vignet = el('radialGradient', { id: 'bordvignet' });
  vignet.append(el('stop', { offset: '0%', 'stop-color': '#2a1c0c', 'stop-opacity': '0' }));
  vignet.append(el('stop', { offset: '64%', 'stop-color': '#2a1c0c', 'stop-opacity': '0' }));
  vignet.append(el('stop', { offset: '100%', 'stop-color': '#2a1c0c', 'stop-opacity': '0.30' }));
  defs.append(vignet);

  return defs;
}

// Welke vloerpatronen bestaan er? De keuring gebruikt dit om te zien of een
// soort ruimte naar een patroon wijst dat er ook echt is - anders krijgt die
// vloer stilzwijgend geen dessin en ziet hij er kaal uit.
export const DESSINS = [
  'planken', 'planken-dwars', 'tegels', 'ruiten', 'steen', 'gras', 'tapijt', 'beton',
  // 'plaat' stond hier niet in terwijl hij wel bestaat en wel gebruikt
  // wordt - alleen niet door een soort maar door de wereldlaag van het
  // ruimtestation. De keuring keek dus langs een heel dessin heen.
  'plaat', 'bestrating', 'sneeuw', 'water',
];

export { CEL, PENNING };

// De legenda: elk meubelstuk uit deze puzzel met zijn naam erbij. De
// aanwijzingen noemen die namen, dus je moet altijd kunnen opzoeken welk
// tekeningetje erbij hoort - zonder te hoeven raden.
export function renderLegenda(puzzle) {
  // Hetzelfde materiaal als op het bord. Zonder dit staat er een stalen
  // wachtklok op het station en een houten eronder in de legenda, en dan
  // zoek je het tekeningetje op dat er net niet is.
  zetWereldstof(WERELDSTOF[puzzle.world?.id]);
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
  lijk.append(slachtofferElement(
    puzzle.slachtofferIdx,
    (puzzle.slachtofferNaam ?? '?').charAt(0).toUpperCase(),
    30,
    geslachtVan(puzzle.slachtofferNaam ?? ''),
    puzzle.zaak?.merk,
  ));
  const lijkNaam = document.createElement('span');
  lijkNaam.textContent = puzzle.slachtofferNaam;
  lijk.append(lijkNaam);
  lijst.append(lijk);

  zetWereldstof(null);

  const blok = document.createElement('div');
  const kop = document.createElement('p');
  kop.className = 'label';
  kop.textContent = 'Wat er op het bord staat';
  blok.append(kop, lijst);
  return blok;
}
