// De pagina "Het pad" (specs/level-path.md, plan stap 6; schermen in
// docs/UX.md, schets in design/prototype/level-path/).
//
// Een slingerend pad van genummerde stappen, van boven naar beneden. Elke
// stap is een rond muntje in de kleur van zijn niveau, met zijn sterren
// eronder of een slotje. Waar de bordmaat verandert staat een bordje op het
// pad ("Nu 8 bij 8"). Alles getekend in SVG, geen plaatjes (PRODUCT.md).
//
// Het pad tekent zonder één puzzel te bouwen: alles wat hier staat komt uit
// src/content/pad.js en de voortgang (prestatiebegroting: onder 300 ms).

import { el } from './boards.js';
import { PAD } from '../content/pad.js';
import { padStand, huidigeStap, isOpen, totaalSterren, opslagWerkt } from './pad-voortgang.js';
import { NIVEAU_VAN_MAAT } from '../engine/difficulty.js';
import { nieuwePuzzel } from './volgende.js';

export const AANTAL_STAPPEN = PAD.length;

const SVG = 'http://www.w3.org/2000/svg';
const svgEl = (naam, attrs = {}, kinderen = []) => {
  const node = document.createElementNS(SVG, naam);
  for (const [k, v] of Object.entries(attrs)) if (v != null) node.setAttribute(k, v);
  for (const kind of [].concat(kinderen)) if (kind) node.append(kind);
  return node;
};

// Stap k (1 tot en met AANTAL_STAPPEN) of null.
export function stapVan(k) {
  const n = Number(k);
  return Number.isInteger(n) && n >= 1 && n <= PAD.length ? PAD[n - 1] : null;
}

// "1 ster", "3 sterren".
export const sterrenTekst = (n) => `${n} ${n === 1 ? 'ster' : 'sterren'}`;

// De maat van het pad. Breedte 360, en het pad slingert over drie banen:
// midden, rechts, midden, links. Zo staan twee stappen nooit naast elkaar.
const BREED = 360;
const BAAN = { l: 72, m: 180, r: 288 };
const PATROON = ['m', 'r', 'm', 'l'];
const RIJ = 84;       // tussen twee stappen
const BORDJE = 64;    // extra ruimte waar een nieuwe maat begint
const BOVEN = 24;

// Waar elke stap en elk bordje staat. Puur, zodat het eenmaal gerekend wordt.
function indeling() {
  const stops = [];
  const bordjes = [];
  let y = BOVEN;
  let vorigeMaat = null;
  PAD.forEach((s, i) => {
    if (s.maat !== vorigeMaat) {
      y += BORDJE / 2;
      bordjes.push({ y, maat: s.maat });
      y += BORDJE / 2 + 12;
      vorigeMaat = s.maat;
    }
    stops.push({ k: i + 1, x: BAAN[PATROON[i % PATROON.length]], y: y + 28, maat: s.maat });
    y += RIJ;
  });
  return { stops, bordjes, hoogte: y + 16 };
}

// Een ster als pad, middelpunt (cx, cy), straal r: vijf punten, iets
// bollig, zoals de snippers op het blad.
function ster(cx, cy, r) {
  const punten = [];
  for (let i = 0; i < 10; i++) {
    const hoek = -Math.PI / 2 + (i * Math.PI) / 5;
    const straal = i % 2 ? r * 0.48 : r;
    punten.push(`${(cx + Math.cos(hoek) * straal).toFixed(1)},${(cy + Math.sin(hoek) * straal).toFixed(1)}`);
  }
  return `M${punten.join('L')}Z`;
}

// Drie sterren naast elkaar, `aantal` gevuld. Ook voor het blad.
export function sterrenRij(aantal, { r = 7, gat = 3 } = {}) {
  const g = svgEl('g', { class: 'pad-sterren' });
  for (let i = 0; i < 3; i++) {
    const cx = (i - 1) * (2 * r + gat);
    g.append(svgEl('path', { d: ster(cx, 0, r), class: i < aantal ? 'pad-ster pad-ster-aan' : 'pad-ster' }));
  }
  return g;
}

// Het hangslotje op een gesloten stap.
function slotje(cx, cy) {
  return svgEl('g', { class: 'pad-slot', 'aria-hidden': 'true' }, [
    svgEl('path', { d: `M${cx - 5},${cy - 2}v-4a5,5 0 0 1 10,0v4`, class: 'pad-slot-beugel' }),
    svgEl('rect', { x: cx - 8, y: cy - 2, width: 16, height: 12, rx: 3, class: 'pad-slot-kast' }),
  ]);
}

// Het slingerpad door een rij punten: van elk punt verticaal weg en
// verticaal aankomen, dan is elke bocht zacht.
function slinger(punten) {
  if (!punten.length) return '';
  let d = `M${punten[0].x},${punten[0].y}`;
  for (let i = 1; i < punten.length; i++) {
    const a = punten[i - 1];
    const b = punten[i];
    const midden = (a.y + b.y) / 2;
    d += `C${a.x},${midden} ${b.x},${midden} ${b.x},${b.y}`;
  }
  return d;
}

// opties.opSlot: het nummer van een gesloten stap waarvan de link werd
// geopend (criterium 4). Dan staat bovenaan dat hij op slot zit, met een
// knop naar waar de speler is.
export function renderPad(mount, { opSlot = null } = {}) {
  const pad = padStand();
  const aantal = PAD.length;
  const hier = huidigeStap(pad, aantal);
  const sterren = totaalSterren(pad, aantal);
  const aanHetEind = hier > aantal;

  try { document.title = 'Het pad · Reconstructie'; } catch { /* geen document */ }

  const melding = el('p', { class: 'pad-melding', role: 'status' });

  const kop = [el('h1', { text: 'Het pad' })];
  if (opSlot) {
    kop.push(
      el('p', { class: 'lede pad-slotregel', text: `Stap ${opSlot} is nog op slot. Je bent bij stap ${Math.min(hier, aantal)}.` }),
      el('div', { class: 'pad-acties' }, [
        el('a', { class: 'btn btn-primary btn-groot', href: `#/pad/${Math.min(hier, aantal)}`, text: `Naar stap ${Math.min(hier, aantal)}` }),
      ]),
    );
  } else if (aanHetEind) {
    kop.push(
      el('p', { class: 'lede', text: 'Je bent aan het eind van het pad. Honderd stappen, van 5 bij 5 tot 16 bij 16.' }),
      el('p', { class: 'pad-stand', text: `${sterren} van de ${aantal * 3} sterren` }),
      el('div', { class: 'pad-acties' }, [
        el('a', { class: 'btn btn-primary btn-groot', href: `#/puzzel/${nieuwePuzzel(6)}`, text: 'Speel Monsterlijk' }),
      ]),
    );
  } else {
    kop.push(
      el('p', { class: 'pad-stand', text: `Stap ${hier} van ${aantal} · ${sterrenTekst(sterren)}` }),
      el('div', { class: 'pad-acties' }, [
        el('a', { class: 'btn btn-primary btn-groot', href: `#/pad/${hier}`, text: `Speel stap ${hier}` }),
      ]),
    );
  }
  if (!opslagWerkt()) kop.push(el('p', { class: 'pad-opslag', text: 'Je voortgang wordt in deze browser niet bewaard.' }));
  kop.push(melding);

  const { stops, bordjes, hoogte } = indeling();
  const svg = svgEl('svg', {
    class: 'pad-kaart',
    viewBox: `0 0 ${BREED} ${hoogte}`,
    role: 'list',
    'aria-label': `De ${aantal} stappen van het pad`,
  });

  // Het pad zelf: een brede zachte weg, en het stuk dat je al liep in kleur.
  const tot = Math.min(hier, aantal);
  svg.append(
    svgEl('path', { d: slinger(stops), class: 'pad-weg' }),
    svgEl('path', { d: slinger(stops), class: 'pad-weg-streep' }),
    svgEl('path', { d: slinger(stops.slice(0, tot)), class: 'pad-weg-gelopen' }),
  );

  // De bordjes waar een nieuwe maat begint. Op de weg, als een spandoek:
  // de weg loopt erachter langs.
  for (const b of bordjes) {
    const tekst = `Nu ${b.maat} bij ${b.maat}`;
    const breed = 22 + tekst.length * 8.2;
    svg.append(svgEl('g', { class: `pad-bordje niveau-${NIVEAU_VAN_MAAT[b.maat]}`, 'aria-hidden': 'true' }, [
      svgEl('rect', { x: BREED / 2 - breed / 2, y: b.y - 15, width: breed, height: 30, rx: 8, class: 'pad-bordje-plank' }),
      svgEl('text', { x: BREED / 2, y: b.y + 5, 'text-anchor': 'middle', class: 'pad-bordje-tekst' }, document.createTextNode(tekst)),
    ]));
  }

  let hierKnoop = null;
  for (const s of stops) {
    const stand = pad.stappen[String(s.k)];
    const open = isOpen(pad, s.k);
    const isHier = s.k === hier;
    const r = isHier ? 30 : 22;
    const niveau = NIVEAU_VAN_MAAT[s.maat];
    const klasse = ['pad-stop', `niveau-${niveau}`, open ? null : 'pad-dicht', isHier ? 'pad-hier' : null, stand?.opgelost ? 'pad-gedaan' : null]
      .filter(Boolean).join(' ');
    const label = !open
      ? `Stap ${s.k}, op slot`
      : isHier
        ? `Stap ${s.k}, hier ben je`
        : stand?.opgelost
          ? `Stap ${s.k}, ${sterrenTekst(stand.sterren)}, opnieuw spelen`
          : `Stap ${s.k}`;
    const inhoud = [
      isHier ? svgEl('circle', { cx: s.x, cy: s.y, r: r + 7, class: 'pad-hier-ring' }) : null,
      svgEl('circle', { cx: s.x, cy: s.y, r, class: 'pad-munt' }),
      svgEl('text', { x: s.x, y: s.y + (isHier ? 8 : 6), 'text-anchor': 'middle', class: 'pad-nummer' }, document.createTextNode(String(s.k))),
      open ? null : slotje(s.x + r - 4, s.y + r - 8),
    ];
    if (stand?.opgelost) {
      const rij = sterrenRij(stand.sterren);
      rij.prepend(svgEl('rect', { x: -27, y: -10, width: 54, height: 20, rx: 10, class: 'pad-sterren-plank' }));
      rij.setAttribute('transform', `translate(${s.x} ${s.y + r + 13})`);
      inhoud.push(rij);
    } else if (isHier) {
      inhoud.push(svgEl('text', { x: s.x, y: s.y + r + 24, 'text-anchor': 'middle', class: 'pad-hier-tekst' }, document.createTextNode('Hier ben je')));
    }

    let knoop;
    if (open) {
      knoop = svgEl('a', { href: `#/pad/${s.k}`, class: klasse, role: 'listitem', 'aria-label': label }, inhoud);
    } else {
      // Op slot: geen link, wel iets dat zegt waarom niet (docs/UX.md).
      knoop = svgEl('g', { class: klasse, role: 'listitem', tabindex: '0', 'aria-label': label }, inhoud);
      const zeg = () => { melding.textContent = `Nog op slot. Los eerst stap ${tot} op.`; };
      knoop.addEventListener('click', zeg);
      knoop.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zeg(); }
      });
    }
    if (s.k === tot) hierKnoop = knoop;
    svg.append(knoop);
  }

  mount.replaceChildren(
    el('section', { class: 'pad-pagina' }, [
      el('div', { class: 'pad-kop' }, kop),
      el('div', { class: 'pad-kaart-wrap' }, svg),
    ])
  );

  // De huidige stap in beeld (criterium 12). Na het tekenen, anders is er
  // nog niets om naartoe te scrollen; route() zet de pagina eerst bovenaan.
  // Bij een gesloten link niet: dan staat bovenaan wat er aan de hand is.
  if (hierKnoop && !aanHetEind && !opSlot) {
    requestAnimationFrame(() => {
      if (hierKnoop.isConnected && tot > 2) hierKnoop.scrollIntoView({ block: 'center' });
    });
  }
}
