// De aankleding van een kamer: wat er op de vloer ligt zonder dat het ertoe
// doet.
//
// Dit is versiering en niets anders. Er gaat geen aanwijzing over, het staat
// niet in de legenda, en het blokkeert geen vakje. Waarom het er dan is: een
// plattegrond met alleen vloer en meubels voelt als een bouwtekening. Een
// kleed, een stapel boeken, een plas water, een spinnenweb in de hoek - dat
// is wat een ruimte een ruimte maakt.
//
// Elke soort ruimte heeft zijn eigen motieven, en per vakje wordt er een
// andere gekozen. Hetzelfde kleed vier keer onder elkaar is geen sfeer maar
// behang.

import { tekenGeschilderd } from './geschilderd.js';
import {
  romp, plaat, poot, bol, ovaal, bak, kruik, kussen as kussenvorm,
  staaf, vlam, blad, rol, zuilvorm, hoop,
} from './vormen.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (naam, attrs = {}) => {
  const n = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  return n;
};

// ---------------------------------------------------------------- motieven
//
// Wat op de vloer LIGT - een plas, een voetspoor, een scheur, stof - blijft
// vlak. Daar hoort geen randlicht op: een plas met een glimrand langs de
// bovenkant is geen plas meer maar een schaal.
//
// Wat op de vloer STAAT gaat door dezelfde motor als de meubels. Anders staat
// er een geschilderde kast naast een ingekleurd krukje, en dan valt het bord
// uit elkaar - precies wat er gebeurde toen alleen de meubels om waren.

const v = (stof, d, extra) => (extra ? { stof, d, ...extra } : { stof, d });
const vloer = (stof, d) => ({ stof, d, grond: true });
const streep = (stof, dik, d) => ({ lijn: true, stof, dik, d });

// Een ding neerzetten in zijn eigen vierkant van 48 bij 48, midden op het
// vakje. `maat` is hoe groot het staat ten opzichte van het vakje: een krukje
// hoort kleiner te zijn dan een kast, anders is het geen aankleding meer.
const prop = (delen, maat = 0.52, zak = 0.04) => (g, cx, cy, CEL) => {
  const grootte = CEL * maat;
  tekenGeschilderd(g, delen, {
    x: cx - grootte / 2, y: cy - grootte / 2 + CEL * zak, grootte,
  });
};

// Een kleur lichter of donkerder maken, zodat een kleed een rand en een
// medaillon kan hebben die bij zijn eigen kleur horen.
function schuif(hex, factor) {
  const n = parseInt(hex.slice(1), 16);
  const kanaal = (v) => Math.max(0, Math.min(255, Math.round(v * factor)));
  return `#${((kanaal((n >> 16) & 255) << 16) | (kanaal((n >> 8) & 255) << 8) | kanaal(n & 255))
    .toString(16).padStart(6, '0')}`;
}

// Een kleed was een rechthoek met een randje. Dat is geen kleed, dat is een
// gekleurd vlak. Een echt kleed heeft een geweven rand, een medaillon in het
// midden, franje die niet overal even lang is, en een hoek die omkrult.
const kleed = (kleur, breed = 0.74) => (g, cx, cy, CEL) => {
  const donker = schuif(kleur, 0.7);
  const licht = schuif(kleur, 1.28);
  const grootte = CEL * breed * 1.04;
  tekenGeschilderd(g, [
    { kleur, grond: true, d: 'M2.6 11 Q24 8 45.4 11 Q47 24 45.4 37 Q24 40 2.6 37 Q1 24 2.6 11 Z' },
    { kleur: donker, d: 'M6 14 Q24 11.6 42 14 Q43.2 24 42 34 Q24 36.4 6 34 Q4.8 24 6 14 Z' },
    { kleur, d: 'M9.4 16.6 Q24 14.6 38.6 16.6 Q39.6 24 38.6 31.4 Q24 33.4 9.4 31.4 Q8.4 24 9.4 16.6 Z' },
    { kleur: licht, d: 'M24 17.4 L32 24 L24 30.6 L16 24 Z' },
    { kleur: donker, d: 'M24 20.6 L28 24 L24 27.4 L20 24 Z' },
    { lijn: true, kleur: donker, dik: 0.6, d: 'M12 12.4 L14 35.6 M20 11.4 L21 36.6 M28 11.4 L27 36.6 M36 12.4 L34 35.6' },
    { lijn: true, kleur: licht, dik: 0.9, d: 'M2.4 13 L-0.2 11.6 M2.2 19 L-0.4 18.2 M2.4 25 L-0.2 25 M2.2 31 L-0.4 31.8 M45.6 13 L48.2 11.6 M45.8 19 L48.4 18.2 M45.6 25 L48.2 25 M45.8 31 L48.4 31.8' },
    { kleur: schuif(kleur, 0.88), d: 'M45.4 28.6 Q45.8 33.4 45.4 37 Q39.4 37.6 34.6 36.4 Q40.6 33.4 45.4 28.6 Z' },
  ], { x: cx - grootte / 2, y: cy - grootte / 2, grootte });
};
const boekenstapel = prop([
  vloer('houtrood', romp(8, 30, 32, 6, { taps: 0.02 })),
  v('stofblauw', romp(10, 24, 29, 6, { taps: 0.02 })),
  v('papier', romp(12, 18, 26, 6, { taps: 0.02 })),
  v('stofgroen', romp(14, 12, 23, 6, { taps: 0.02 })),
  streep('donker', 0.9, 'M9 33 Q24 32 39 33 M11 27 Q24 26 38.4 27 M13 21 Q24 20 37.4 21 M15 15 Q24 14 36.4 15'),
], 0.48);
const kandelaarvlek = (g, cx, cy) => {
  g.append(el('ellipse', { cx, cy, rx: 13, ry: 9, class: 'waslaag' }));
  g.append(el('ellipse', { cx: cx + 4, cy: cy + 3, rx: 5, ry: 3, class: 'waslaag' }));
};

const voetsporen = (g, cx, cy) => {
  for (let i = 0; i < 3; i++) {
    const vx = cx - 12 + i * 11;
    const vy = cy - 8 + (i % 2) * 13;
    g.append(el('ellipse', { cx: vx, cy: vy, rx: 3.6, ry: 6, class: 'voetspoor' }));
  }
};

const loper = prop([
  vloer('stofgroen', 'M15 2 Q24 0.6 33 2 Q34.4 24 33 46 Q24 47.4 15 46 Q13.6 24 15 2 Z'),
  v('stofgroen', 'M17.4 5 Q24 4 30.6 5 Q31.6 24 30.6 43 Q24 44 17.4 43 Q16.4 24 17.4 5 Z'),
  streep('houtdonker', 0.8, 'M20 4.4 Q19.4 24 20 43.6 M28 4.4 Q28.6 24 28 43.6'),
], 0.96, 0);
const spinnenweb = (g, cx, cy, CEL) => {
  const hx = cx - CEL * 0.34;
  const hy = cy - CEL * 0.34;
  g.append(el('path', {
    d: `M${hx} ${hy} L${hx + 26} ${hy} M${hx} ${hy} L${hx + 20} ${hy + 20} M${hx} ${hy} L${hx} ${hy + 26}`,
    class: 'web',
  }));
  g.append(el('path', { d: `M${hx + 8} ${hy} q -1 8 -8 8 M${hx + 17} ${hy} q -2 17 -17 17`, class: 'web' }));
};

const plas = (g, cx, cy) => {
  g.append(el('path', {
    d: `M${cx - 14} ${cy} q 4 -8 14 -7 q 11 1 13 7 q -3 7 -13 7 q -11 0 -14 -7 Z`,
    class: 'plas',
  }));
  g.append(el('path', { d: `M${cx - 6} ${cy - 2} q 5 -2 9 0`, class: 'plasglans' }));
};

const bladeren = prop([
  vloer('blad', blad(10, 34, 13, 4, -20)),
  v('blad', blad(24, 38, 12, 3.6, -150)),
  v('houtrood', blad(32, 30, 11, 3.4, 40)),
  v('houtrood', blad(18, 28, 10, 3, -60)),
], 0.58);
const keien = prop([
  vloer('steen', bol(15, 33, 7)),
  v('steenkoel', bol(28, 36, 6)),
  v('steen', bol(36, 30, 4.6)),
  v('steenkoel', bol(22, 27, 3.4)),
], 0.5);
const paddenstoelen = prop([
  vloer('papier', zuilvorm(17, 28, 4, 5.4, 12)),
  v('houtrood', 'M8.6 28.6 Q10.4 19.4 17 19 Q23.6 19.4 25.4 28.6 Q17 31 8.6 28.6 Z'),
  v('papier', bol(13, 24.4, 1.4)),
  v('papier', bol(20.6, 23.4, 1.6)),
  v('papier', zuilvorm(32, 32, 3, 4, 8)),
  v('houtrood', 'M26.4 32.4 Q27.8 25.6 32 25.4 Q36.2 25.6 37.6 32.4 Q32 34.2 26.4 32.4 Z'),
  v('blad', hoop(24, 41, 20, 3.4)),
], 0.52);
const putdeksel = prop([
  vloer('metaal', ovaal(24, 32, 15, 7)),
  v('donker', ovaal(24, 32, 12.4, 5.4)),
  v('metaal', ovaal(24, 31.4, 11, 4.6)),
  streep('donker', 0.9, 'M14 30 Q24 28.6 34 30 M13.6 33 Q24 31.6 34.4 33 M14.6 35.4 Q24 34.2 33.4 35.4'),
  v('donker', bol(24, 32, 1.4)),
], 0.58);
const olievlek = (g, cx, cy) => {
  g.append(el('path', {
    d: `M${cx - 13} ${cy + 2} q 2 -9 12 -8 q 12 1 13 8 q -2 8 -13 8 q -11 0 -12 -8 Z`,
    class: 'olie',
  }));
  g.append(el('circle', { cx: cx + 12, cy: cy + 9, r: 2.5, class: 'olie' }));
};

const bouten = (g, cx, cy) => {
  for (const [dx, dy] of [[-9, -5], [2, 6], [10, -3]]) {
    g.append(el('circle', { cx: cx + dx, cy: cy + dy, r: 2.6, class: 'bout' }));
  }
};

const scherven = (g, cx, cy) => {
  g.append(el('path', { d: `M${cx - 10} ${cy + 4} l 7 -9 l 4 9 Z`, class: 'scherf' }));
  g.append(el('path', { d: `M${cx + 4} ${cy - 2} l 8 -5 l 1 8 Z`, class: 'scherf' }));
  g.append(el('ellipse', { cx: cx - 2, cy: cy + 8, rx: 10, ry: 4, class: 'chemie' }));
};

const kruimels = (g, cx, cy) => {
  g.append(el('ellipse', { cx, cy, rx: 12, ry: 7, class: 'meelvlek' }));
  for (const [dx, dy] of [[-10, 6], [8, -7], [13, 5], [-14, -4]]) {
    g.append(el('circle', { cx: cx + dx, cy: cy + dy, r: 1.6, class: 'kruimel' }));
  }
};

const sterrenkaartjes = (g, cx, cy) => {
  g.append(el('path', { d: `M${cx - 12} ${cy - 6} l 20 -3 l 2 12 l -20 3 Z`, class: 'papier' }));
  g.append(el('path', { d: `M${cx - 6} ${cy - 2} l 2 2 M${cx + 2} ${cy + 2} l 2 2`, class: 'papierlijn' }));
};

const grafscheur = (g, cx, cy) => {
  g.append(el('path', { d: `M${cx - 14} ${cy - 10} l 6 8 l -4 6 l 9 8`, class: 'grafscheur' }));
  g.append(el('path', { d: `M${cx + 4} ${cy - 8} l 5 7 l -3 5`, class: 'grafscheur' }));
};

const kaarsstompje = prop([
  vloer('papier', hoop(24, 40, 18, 4)),
  v('papier', zuilvorm(24, 27, 7, 8, 12)),
  v('vuur', vlam(24, 27, 5, 7)),
  v('goud', vlam(24, 26, 3, 4), { glans: 1 }),
], 0.44);
// ---------------------------------------------------- meer dan vlekken
//
// Met alleen kleden en vlekken blijft een kamer leeg: je ziet vloer, en daar
// ligt iets op. Wat een ruimte bewoond maakt zijn de dingen die er staan en
// die niemand heeft opgeruimd - een kruk, een plant, een krant die iemand
// heeft laten vallen. Ze blokkeren geen vakje en er gaat geen aanwijzing
// over; ze staan er omdat kamers zo zijn.

const kamerplant = prop([
  v('blad', blad(24, 30, 15, 4, -95)),
  v('blad', blad(24, 30, 14, 3.6, -140)),
  v('blad', blad(24, 30, 14, 3.6, -50)),
  v('blad', blad(24, 30, 12, 3.2, -170)),
  v('blad', blad(24, 30, 12, 3.2, -10)),
  vloer('houtrood', bak(24, 26, 22, 16, 14)),
  v('houtrood', plaat(12.4, 25.4, 23.2, 3, { zak: 0.6 })),
], 0.58);
const kruk = prop([
  vloer('hout', plaat(10, 20, 28, 4, { zak: 0.8 })),
  v('houtdonker', poot(13, 24, 5, 16, { schuin: -1.4 })),
  v('houtdonker', poot(30, 24, 5, 16, { schuin: 1.4 })),
  v('houtdonker', plaat(14, 33, 20, 2.4, { zak: 0.5 })),
], 0.5);
const krant = prop([
  vloer('papier', 'M6 31 Q24 26.4 42 30 Q42.6 35 42 39.4 Q24 42.6 6 39 Z'),
  v('papier', 'M6 31 Q15 28.6 23.6 29.6 Q24 34.4 23.6 39.4 Q15 41 6 39 Z'),
  streep('donker', 0.8, 'M9 33 Q15 32 21 32.4 M9 35.4 Q15 34.4 21 34.8 M27 32.4 Q33 31.8 39 32.4 M27 34.8 Q33 34.2 39 34.8 M27 37.2 Q33 36.6 39 37.2'),
], 0.52);
const kussen = prop([
  vloer('stof', kussenvorm(9, 22, 30, 18, { bol: 3 })),
  v('stof', kussenvorm(14, 25, 20, 10, { bol: 2 }), { glans: 1 }),
  v('goud', bol(24, 30.6, 1.8)),
  streep('stof', 1, 'M15 26 Q16 32 15 38 M33 26 Q32 32 33 38'),
], 0.5);
const flessen = prop([
  vloer('glas', kruik(14, 14, 4, 3.4, 19, 11, 21)),
  v('touw', romp(12.3, 12.6, 3.4, 2.6, { taps: 0, bol: 0.1 })),
  v('glas', kruik(26, 18, 3.6, 3, 22.6, 9.4, 17.4)),
  v('koper', kruik(36, 20, 3, 2.6, 24.4, 8, 15.6)),
], 0.5);
const jutezak = prop([
  vloer('touw', 'M12 40 Q8.4 28 13.6 20 Q16 16.4 18 14.4 Q24 17 30 14.4 Q32 16.4 34.4 20 Q39.6 28 36 40 Q24 42.4 12 40 Z'),
  v('touw', 'M18 14.4 Q24 17 30 14.4 Q29 11 27.4 8.6 Q24 10.4 20.6 8.6 Q19 11 18 14.4 Z'),
  streep('houtdonker', 1.4, 'M18.4 15.4 Q24 18 29.6 15.4'),
  streep('houtdonker', 0.9, 'M16 22 Q15 31 16.4 39 M31.6 22 Q33 31 31.6 39'),
], 0.52);
const emmer = prop([
  v('metaal', 'M12 22 Q24 6 36 22 Q34.6 22.8 33.4 22.6 Q24 10 14.6 22.6 Q13.4 22.8 12 22 Z'),
  vloer('metaal', bak(24, 22, 24, 18, 18)),
  v('metaal', plaat(11.6, 21.4, 24.8, 2.6, { zak: 0.6 }), { glans: 1 }),
  v('water', ovaal(24, 23, 10.4, 2.6)),
], 0.48);
const gereedschap = prop([
  vloer('hout', staaf(12, 38, 38, 30, 3.6)),
  v('metaal', 'M9.4 36.6 Q13 34.4 17.4 35.4 Q18 38 17.4 40.4 Q13 41.6 9.4 39.6 Z'),
  v('houtrood', staaf(14, 26, 36, 22, 3.2)),
  v('metaal', staaf(14, 26, 6, 28.4, 2.4)),
  v('metaal', bol(39.6, 30.4, 1.6)),
], 0.54);
const varens = prop([
  vloer('blad', blad(24, 40, 16, 4, -80)),
  v('blad', blad(24, 40, 15, 3.6, -55)),
  v('blad', blad(24, 40, 15, 3.6, -110)),
  v('blad', blad(24, 40, 13, 3.2, -32)),
  v('blad', blad(24, 40, 13, 3.2, -133)),
  v('houtdonker', hoop(24, 41.4, 12, 3)),
], 0.58);
const wortels = prop([
  vloer('houtdonker', staaf(6, 34, 24, 38, 4)),
  v('houtdonker', staaf(24, 38, 42, 33, 4)),
  v('houtdonker', staaf(16, 36.6, 13, 42, 3)),
  v('houtdonker', staaf(32, 36.6, 36, 42, 3)),
  v('blad', hoop(24, 41.4, 14, 3.4)),
], 0.58);
const bloempol = prop([
  v('blad', blad(24, 40, 14, 3.4, -85)),
  v('blad', blad(20, 40, 12, 3, -105)),
  v('blad', blad(28, 40, 12, 3, -65)),
  v('houtrood', bol(24, 25, 3)),
  v('goud', bol(24, 25, 1.3)),
  v('stofblauw', bol(18.6, 28, 2.6)),
  v('goud', bol(18.6, 28, 1.1)),
  v('stof', bol(29.4, 29, 2.4)),
  vloer('blad', hoop(24, 41.6, 18, 4)),
], 0.56);
const struik = prop([
  vloer('houtdonker', staaf(24, 41, 24, 30, 3.4)),
  v('houtdonker', staaf(24, 34, 17, 28, 2.4)),
  v('houtdonker', staaf(24, 32, 31, 27, 2.4)),
  v('blad', bol(17, 25, 6.4)),
  v('blad', bol(30, 24, 6.8)),
  v('blad', bol(24, 19, 6.6)),
  v('blad', bol(24, 27, 6.4)),
  v('blad', blad(30, 24, 8, 3, -30)),
], 0.62);
const botjes = prop([
  vloer('papier', rol(9, 32, 26, 4, { rond: 2 })),
  v('papier', bol(9.4, 34, 2.4)),
  v('papier', bol(34.6, 34, 2.4)),
  v('papier', rol(14, 38, 20, 3.4, { rond: 1.8 })),
  v('papier', bol(14.4, 39.6, 2)),
  v('papier', bol(33.6, 39.6, 2)),
], 0.52);
const urn = prop([
  vloer('steen', kruik(24, 14, 3.4, 7, 18, 24, 22)),
  v('steen', plaat(14, 12.6, 20, 3, { zak: 0.5 })),
  v('steenkoel', plaat(13, 24, 22, 3, { zak: 0.8 })),
  v('koper', bol(24, 10.6, 2.4)),
], 0.48);
const buisjes = prop([
  v('glas', zuilvorm(16, 16, 5, 4.6, 18)),
  v('glas', zuilvorm(24, 14, 5, 4.6, 20)),
  v('glas', zuilvorm(32, 17, 5, 4.6, 17)),
  v('stofgroen', plaat(13.8, 28, 4.4, 3.6)),
  v('houtrood', plaat(21.8, 28, 4.4, 3.6)),
  v('stofblauw', plaat(29.8, 29, 4.4, 3.6)),
  vloer('hout', plaat(10, 33, 28, 5, { zak: 0.6 })),
  v('houtdonker', plaat(11, 37.6, 26, 2.4, { zak: 0.4 })),
], 0.52);
const vijzel = prop([
  v('steen', staaf(30, 30, 40, 16, 4.4)),
  v('steen', bol(40.4, 15.4, 3)),
  vloer('steen', bak(22, 24, 22, 14, 16)),
  v('steenkoel', plaat(10.6, 23.4, 22.8, 3, { zak: 0.7 })),
  v('blad', hoop(22, 26.4, 12, 3)),
], 0.5);
const pantoffels = prop([
  vloer('stof', 'M6 34 Q10 29.6 17 30 Q23 30.4 23 34.6 Q23 39 16 39.4 Q8 39.6 6 34 Z'),
  v('stof', 'M8.6 32.6 Q12 30.6 16.6 31.4 Q18 33.4 16.6 34.6 Q11.6 34.4 8.6 32.6 Z', { glans: 0.8 }),
  v('stof', 'M25 36 Q29 31.6 36 32 Q42 32.4 42 36.6 Q42 41 35 41.4 Q27 41.6 25 36 Z'),
  v('stof', 'M27.6 34.6 Q31 32.6 35.6 33.4 Q37 35.4 35.6 36.6 Q30.6 36.4 27.6 34.6 Z', { glans: 0.8 }),
], 0.52);
const rolpapier = prop([
  vloer('papier', rol(7, 30, 30, 7, { rond: 2.6 })),
  v('papier', rol(11, 37, 26, 6, { rond: 2.4 })),
  v('touw', romp(18, 29.4, 3.4, 8.4, { taps: 0, bol: 0.2 })),
  streep('houtdonker', 0.9, 'M9 33.4 Q8.4 36 9 38.4'),
], 0.52);
const brievenbakje = prop([
  v('papier', plaat(12.6, 22.6, 23, 3.6, { zak: 0.5 })),
  v('papier', plaat(11, 26, 26, 4, { zak: 0.6 })),
  streep('donker', 0.8, 'M15 24.4 Q22 23.8 29 24.2'),
  vloer('metaal', 'M7 30 Q24 27.4 41 30 Q41.6 35 41 39.4 Q24 42 7 39.4 Q6.4 35 7 30 Z'),
  v('metaal', plaat(6.6, 29.4, 34.8, 2.4)),
], 0.5);
// ------------------------------------------------- wat hoort bij welke ruimte

const MOTIEVEN = {
  zaal: [
    kleed('#a8543c'), kamerplant, kandelaarvlek, kruk, kleed('#7a4a66', 0.5),
    krant, boekenstapel, kussen, kamerplant, kleed('#8a6a3c', 0.46),
  ],
  bibliotheek: [
    kleed('#6f5a8e'), boekenstapel, kruk, kandelaarvlek, krant,
    kleed('#8a5a3c', 0.5), rolpapier, boekenstapel, kamerplant,
  ],
  slaapkamer: [
    kleed('#b8795e'), pantoffels, kussen, kleed('#8e6f9e', 0.5),
    voetsporen, kamerplant, kruk, kussen,
  ],
  gang: [
    loper, voetsporen, brievenbakje, kleed('#5f7f6a', 0.5),
    kamerplant, kruk, voetsporen,
  ],
  keuken: [kruimels, emmer, plas, jutezak, voetsporen, kruk, kruimels, flessen],
  kelder: [putdeksel, flessen, spinnenweb, jutezak, plas, keien, flessen, emmer],
  werkplaats: [olievlek, gereedschap, bouten, emmer, putdeksel, jutezak, gereedschap],
  buiten: [
    struik, bladeren, varens, keien, bloempol, paddenstoelen, wortels,
    plas, struik, varens, bladeren, bloempol,
  ],
  grafkelder: [grafscheur, urn, spinnenweb, botjes, kaarsstompje, keien, urn, botjes],
  laboratorium: [scherven, buisjes, plas, vijzel, kruimels, flessen, buisjes],
  sterrenwacht: [
    sterrenkaartjes, rolpapier, kleed('#4a5a8a', 0.6), kandelaarvlek,
    kruk, boekenstapel, rolpapier,
  ],
};

// Welke motieven horen bij deze soort ruimte? Onbekend: dan maar niets, dat
// is beter dan een spinnenweb in een keuken.
export const motievenVoor = (soort) => MOTIEVEN[soort] ?? [];

// Stof, krasjes en kruimels: wat er op een vloer ligt zonder dat het iets is.
//
// Een vakje waar helemaal niets op staat valt op als een gat. Dit vult zo'n
// vakje zonder dat je denkt "daar ligt iets" - precies de bedoeling, want er
// ligt niets.
export function tekenSnippers(g, zaad, cx, cy) {
  const ruis = (k) => {
    const h = Math.sin(zaad * 12.9898 + k * 78.233) * 43758.5453;
    return h - Math.floor(h);
  };
  for (let s = 0; s < 5; s++) {
    const sx = cx - 26 + ruis(s) * 52;
    const sy = cy - 26 + ruis(s + 9) * 52;
    if (ruis(s + 20) > 0.55) {
      g.append(el('path', {
        d: `M${sx.toFixed(1)} ${sy.toFixed(1)} l ${(2 + ruis(s + 3) * 6).toFixed(1)} ${(ruis(s + 4) * 4 - 2).toFixed(1)}`,
        class: 'kras',
      }));
    } else {
      g.append(el('circle', {
        cx: sx.toFixed(1), cy: sy.toFixed(1), r: (0.8 + ruis(s + 5) * 1.5).toFixed(1), class: 'stofje',
      }));
    }
  }
}

export function tekenAankleding(g, soort, cx, cy, CEL, volgnummer) {
  const lijst = motievenVoor(soort);
  if (!lijst.length) return;
  lijst[volgnummer % lijst.length](g, cx, cy, CEL);
}
