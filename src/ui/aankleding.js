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

const NS = 'http://www.w3.org/2000/svg';
const el = (naam, attrs = {}) => {
  const n = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  return n;
};

// ---------------------------------------------------------------- motieven

const kleed = (kleur, breed = 0.74, hoog = 0.52) => (g, cx, cy, CEL) => {
  const b = CEL * breed;
  const h = CEL * hoog;
  g.append(el('rect', { x: cx - b / 2, y: cy - h / 2, width: b, height: h, rx: 3, fill: kleur, class: 'kleed' }));
  g.append(el('rect', { x: cx - b / 2 + 5, y: cy - h / 2 + 4, width: b - 10, height: h - 8, rx: 2, fill: 'none', class: 'kleedrand' }));
  for (let f = 0; f < 7; f++) {
    const fx = cx - b / 2 + 4 + f * ((b - 8) / 6);
    g.append(el('path', { d: `M${fx} ${cy - h / 2} v-3 M${fx} ${cy + h / 2} v3`, class: 'kleedfranje' }));
  }
};

const boekenstapel = (g, cx, cy) => {
  const kleuren = ['#a8543c', '#4a6f8a', '#6f9a5a'];
  kleuren.forEach((kl, i) => {
    g.append(el('rect', {
      x: cx - 13 + i, y: cy + 6 - i * 5, width: 26 - i * 2, height: 5, rx: 1,
      fill: kl, class: 'versierlijn',
    }));
  });
};

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

const loper = (g, cx, cy, CEL) => {
  g.append(el('rect', { x: cx - CEL * 0.22, y: cy - CEL * 0.46, width: CEL * 0.44, height: CEL * 0.92, fill: '#5f7f6a', class: 'kleed' }));
  g.append(el('path', { d: `M${cx - CEL * 0.14} ${cy - CEL * 0.46} v${CEL * 0.92} M${cx + CEL * 0.14} ${cy - CEL * 0.46} v${CEL * 0.92}`, class: 'kleedrand' }));
};

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

const bladeren = (g, cx, cy) => {
  for (let b = 0; b < 4; b++) {
    const bx = cx - 18 + ((b * 13) % 36);
    const by = cy - 14 + ((b * 17) % 28);
    g.append(el('path', { d: `M${bx} ${by} q 4 -5 9 -2 q -2 6 -9 2 Z`, class: 'blad' }));
  }
};

const keien = (g, cx, cy) => {
  g.append(el('ellipse', { cx: cx - 8, cy: cy + 6, rx: 8, ry: 5.5, class: 'kei' }));
  g.append(el('ellipse', { cx: cx + 9, cy: cy - 4, rx: 5.5, ry: 4, class: 'kei' }));
};

const paddenstoelen = (g, cx, cy) => {
  for (const [dx, dy, r] of [[-7, 4, 6], [6, -2, 4.5]]) {
    g.append(el('path', { d: `M${cx + dx - r} ${cy + dy} a ${r} ${r} 0 0 1 ${r * 2} 0 Z`, class: 'paddenhoed' }));
    g.append(el('rect', { x: cx + dx - 1.5, y: cy + dy, width: 3, height: r * 0.8, class: 'paddensteel' }));
  }
};

const putdeksel = (g, cx, cy) => {
  g.append(el('circle', { cx, cy, r: 10, class: 'putdeksel' }));
  g.append(el('path', { d: `M${cx - 7} ${cy - 4} h14 M${cx - 7} ${cy} h14 M${cx - 7} ${cy + 4} h14`, class: 'putrooster' }));
};

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

const kaarsstompje = (g, cx, cy) => {
  g.append(el('ellipse', { cx, cy: cy + 7, rx: 8, ry: 4, class: 'waslaag' }));
  g.append(el('rect', { x: cx - 3, y: cy - 4, width: 6, height: 11, rx: 1, class: 'kaarsje' }));
  g.append(el('path', { d: `M${cx} ${cy - 4} q -3 -3 0 -6 q 3 3 0 6 Z`, class: 'vlammetje' }));
};

// ------------------------------------------------- wat hoort bij welke ruimte

const MOTIEVEN = {
  zaal: [kleed('#a8543c'), kandelaarvlek, kleed('#7a4a66', 0.5, 0.36), boekenstapel],
  bibliotheek: [kleed('#6f5a8e'), boekenstapel, kleed('#8a5a3c', 0.5, 0.36), kandelaarvlek],
  slaapkamer: [kleed('#b8795e'), kleed('#8e6f9e', 0.5, 0.36), voetsporen],
  gang: [loper, voetsporen, kleed('#5f7f6a', 0.5, 0.34)],
  keuken: [kruimels, plas, voetsporen],
  kelder: [putdeksel, spinnenweb, plas, keien],
  werkplaats: [olievlek, bouten, putdeksel],
  buiten: [bladeren, keien, paddenstoelen, plas],
  grafkelder: [grafscheur, spinnenweb, kaarsstompje, keien],
  laboratorium: [scherven, plas, kruimels],
  sterrenwacht: [sterrenkaartjes, kleed('#4a5a8a', 0.6, 0.42), kandelaarvlek],
};

// Welke motieven horen bij deze soort ruimte? Onbekend: dan maar niets, dat
// is beter dan een spinnenweb in een keuken.
export const motievenVoor = (soort) => MOTIEVEN[soort] ?? [];

export function tekenAankleding(g, soort, cx, cy, CEL, volgnummer) {
  const lijst = motievenVoor(soort);
  if (!lijst.length) return;
  lijst[volgnummer % lijst.length](g, cx, cy, CEL);
}
