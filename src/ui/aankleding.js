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
const kleed = (kleur, breed = 0.74, hoog = 0.52) => (g, cx, cy, CEL) => {
  const b = CEL * breed;
  const h = CEL * hoog;
  const l = cx - b / 2;
  const t = cy - h / 2;
  const donker = schuif(kleur, 0.74);
  const licht = schuif(kleur, 1.22);

  // Het kleed ligt ergens op, dus er hoort schaduw onder.
  g.append(el('rect', {
    x: l + 1.5, y: t + 2.5, width: b, height: h, rx: 3, class: 'kleedschaduw',
  }));
  g.append(el('rect', { x: l, y: t, width: b, height: h, rx: 3, fill: kleur, class: 'kleed' }));
  // De brede band langs de rand.
  g.append(el('rect', {
    x: l + 3, y: t + 3, width: b - 6, height: h - 6, rx: 2, fill: 'none',
    stroke: donker, 'stroke-width': 3.2, opacity: 0.85,
  }));
  g.append(el('rect', {
    x: l + 5.5, y: t + 5.5, width: b - 11, height: h - 11, rx: 2, fill: 'none', class: 'kleedrand',
  }));
  // Het medaillon in het midden.
  g.append(el('path', {
    d: `M${cx} ${cy - h * 0.26} L${cx + b * 0.17} ${cy} L${cx} ${cy + h * 0.26} L${cx - b * 0.17} ${cy} Z`,
    fill: licht, stroke: donker, 'stroke-width': 1, opacity: 0.9,
  }));
  g.append(el('path', {
    d: `M${cx} ${cy - h * 0.13} L${cx + b * 0.085} ${cy} L${cx} ${cy + h * 0.13} L${cx - b * 0.085} ${cy} Z`,
    fill: donker, opacity: 0.55,
  }));
  // Het weefsel: schuine draden die je net ziet.
  for (let w = 1; w < 7; w++) {
    const wx = l + (b / 7) * w;
    g.append(el('path', { d: `M${wx.toFixed(1)} ${t + 4} l 4 ${(h - 8).toFixed(1)}`, class: 'kleeddraad' }));
  }
  // Franje, en niet elke sliert even lang.
  for (let f = 0; f < 11; f++) {
    const fx = l + 3 + f * ((b - 6) / 10);
    const boven = 2.4 + ((f * 7) % 3);
    const onder = 2.2 + ((f * 5) % 4);
    g.append(el('path', {
      d: `M${fx.toFixed(1)} ${t} v${(-boven).toFixed(1)} M${fx.toFixed(1)} ${(t + h).toFixed(1)} v${onder.toFixed(1)}`,
      class: 'kleedfranje',
    }));
  }
  // Een omgeslagen hoek. Een kleed dat kaarsrecht ligt heeft niemand ooit
  // gelegd.
  g.append(el('path', {
    d: `M${(l + b).toFixed(1)} ${(t + h - 9).toFixed(1)} l 0 9 l -10 0 z`,
    fill: schuif(kleur, 0.88), stroke: donker, 'stroke-width': 1,
  }));
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

// ---------------------------------------------------- meer dan vlekken
//
// Met alleen kleden en vlekken blijft een kamer leeg: je ziet vloer, en daar
// ligt iets op. Wat een ruimte bewoond maakt zijn de dingen die er staan en
// die niemand heeft opgeruimd - een kruk, een plant, een krant die iemand
// heeft laten vallen. Ze blokkeren geen vakje en er gaat geen aanwijzing
// over; ze staan er omdat kamers zo zijn.

const kamerplant = (g, cx, cy) => {
  g.append(el('ellipse', { cx, cy: cy + 11, rx: 11, ry: 4, class: 'propschaduw' }));
  for (const [ex, ey, kr] of [[-10, -4, -14], [10, -4, 14], [0, -8, 0], [-6, -2, -8], [6, -2, 8]]) {
    g.append(el('path', {
      d: `M${cx} ${cy + 2} q ${ex} ${ey - 6} ${kr} ${ey - 10} q ${-kr * 0.4} ${6} ${-kr} ${-ey + 12} Z`,
      class: 'propblad',
    }));
  }
  g.append(el('path', {
    d: `M${cx - 8} ${cy + 1} l 2 11 h 12 l 2 -11 z`, class: 'proppot',
  }));
  g.append(el('path', { d: `M${cx - 8.5} ${cy + 1} h 17`, class: 'proprand' }));
  g.append(el('path', { d: `M${cx - 5} ${cy + 4} l 1 6`, class: 'propglans' }));
};

const kruk = (g, cx, cy) => {
  g.append(el('ellipse', { cx: cx + 2, cy: cy + 12, rx: 12, ry: 4, class: 'propschaduw' }));
  g.append(el('ellipse', { cx, cy: cy - 3, rx: 12, ry: 5, class: 'prophout' }));
  g.append(el('path', { d: `M${cx - 12} ${cy - 3} v 3 a 12 5 0 0 0 24 0 v -3`, class: 'prophout' }));
  g.append(el('path', { d: `M${cx - 8} ${cy + 1} l -2 10 M${cx + 8} ${cy + 1} l 2 10 M${cx} ${cy + 2} v 10`, class: 'proppoot' }));
  g.append(el('path', { d: `M${cx - 7} ${cy - 5} a 9 3 0 0 1 12 0`, class: 'propglans' }));
};

const krant = (g, cx, cy) => {
  g.append(el('path', {
    d: `M${cx - 15} ${cy + 7} l 2 -14 l 28 -2 l -1 14 z`, class: 'proppapier',
  }));
  g.append(el('path', { d: `M${cx - 1} ${cy - 8} l -1 14`, class: 'proplijn' }));
  for (let r = 0; r < 4; r++) {
    g.append(el('path', {
      d: `M${cx - 12} ${cy - 5 + r * 3} h 9 M${cx + 2} ${cy - 6 + r * 3} h 10`, class: 'propletter',
    }));
  }
};

const kussen = (g, cx, cy) => {
  g.append(el('ellipse', { cx: cx + 1, cy: cy + 8, rx: 13, ry: 4, class: 'propschaduw' }));
  g.append(el('path', {
    d: `M${cx - 14} ${cy - 2} q 2 -10 14 -9 q 13 1 14 9 q -1 10 -14 10 q -13 -1 -14 -10 z`,
    class: 'propstof',
  }));
  g.append(el('path', { d: `M${cx - 9} ${cy - 6} q 9 -3 18 1`, class: 'propglans' }));
  for (const [dx, dy] of [[-13, -2], [13, -1], [0, 8]]) {
    g.append(el('circle', { cx: cx + dx, cy: cy + dy, r: 1.8, class: 'propkwast' }));
  }
};

const flessen = (g, cx, cy) => {
  g.append(el('ellipse', { cx, cy: cy + 11, rx: 14, ry: 4, class: 'propschaduw' }));
  for (const [dx, hoogte] of [[-9, 16], [0, 20], [9, 14]]) {
    g.append(el('path', {
      d: `M${cx + dx - 4} ${cy + 10} v${-hoogte + 8} l 2 -4 v-4 h 4 v 4 l 2 4 v${hoogte - 8} z`,
      class: 'propglas',
    }));
    g.append(el('path', { d: `M${cx + dx - 2.5} ${cy + 8} v${-hoogte + 10}`, class: 'propglans' }));
  }
};

const jutezak = (g, cx, cy) => {
  g.append(el('ellipse', { cx: cx + 2, cy: cy + 11, rx: 13, ry: 4, class: 'propschaduw' }));
  g.append(el('path', {
    d: `M${cx - 11} ${cy + 10} q -3 -14 3 -18 q 2 -6 8 -6 q 7 0 8 6 q 7 5 3 18 z`,
    class: 'propjute',
  }));
  g.append(el('path', { d: `M${cx - 8} ${cy - 8} q 8 -4 16 0`, class: 'proptouw' }));
  g.append(el('path', { d: `M${cx - 6} ${cy + 1} q 6 2 12 -1 M${cx - 7} ${cy + 6} q 7 2 14 -1`, class: 'propnaad' }));
};

const emmer = (g, cx, cy) => {
  g.append(el('ellipse', { cx: cx + 1, cy: cy + 12, rx: 10, ry: 3.5, class: 'propschaduw' }));
  g.append(el('path', { d: `M${cx - 10} ${cy - 6} l 2 17 h 16 l 2 -17 z`, class: 'propmetaal' }));
  g.append(el('ellipse', { cx, cy: cy - 6, rx: 10, ry: 3.5, class: 'propmetaal-licht' }));
  g.append(el('path', { d: `M${cx - 10} ${cy - 7} a 10 12 0 0 1 20 0`, class: 'propbeugel' }));
  g.append(el('path', { d: `M${cx - 6} ${cy - 2} l 1 11`, class: 'propglans' }));
};

const gereedschap = (g, cx, cy) => {
  g.append(el('path', { d: `M${cx - 14} ${cy + 4} l 18 -6`, class: 'propsteel' }));
  g.append(el('path', { d: `M${cx + 3} ${cy - 4} l 8 -3 l 3 6 l -8 3 z`, class: 'propmetaal' }));
  g.append(el('path', { d: `M${cx - 12} ${cy + 9} l 14 -4 l 1 3 l -14 4 z`, class: 'propsleutel' }));
  g.append(el('circle', { cx: cx + 4, cy: cy + 4, r: 3.4, class: 'propsleutel' }));
  g.append(el('circle', { cx: cx + 4, cy: cy + 4, r: 1.4, class: 'propgat' }));
};

const varens = (g, cx, cy) => {
  for (const [bx, by, kant] of [[-11, 6, -1], [4, 9, 1], [-2, 2, -1]]) {
    const wx = cx + bx;
    const wy = cy + by;
    g.append(el('path', { d: `M${wx} ${wy} q ${kant * 5} -12 ${kant * 13} -19`, class: 'propvaren' }));
    for (let v = 1; v < 6; v++) {
      const t = v / 6;
      const px = wx + kant * 5 * 2 * t * (1 - t) + kant * 13 * t * t;
      const py = wy - 12 * 2 * t * (1 - t) - 19 * t * t;
      g.append(el('path', { d: `M${px.toFixed(1)} ${py.toFixed(1)} l ${(kant * -5).toFixed(1)} -3`, class: 'propvaren' }));
    }
  }
};

const wortels = (g, cx, cy) => {
  g.append(el('path', {
    d: `M${cx - 22} ${cy + 8} q 10 -5 16 -1 q 7 5 14 1 M${cx - 18} ${cy - 4} q 9 4 15 0 q 6 -4 12 1`,
    class: 'propwortel',
  }));
  g.append(el('path', { d: `M${cx - 6} ${cy + 7} q 2 -6 0 -11`, class: 'propwortel' }));
};

const bloempol = (g, cx, cy) => {
  for (const [dx, dy, kl] of [[-8, 2, 'propbloem-a'], [3, -4, 'propbloem-b'], [9, 5, 'propbloem-a'], [-2, 8, 'propbloem-b']]) {
    const bx = cx + dx;
    const by = cy + dy;
    g.append(el('path', { d: `M${bx} ${by + 8} q -2 -5 0 -8`, class: 'propsteeltje' }));
    for (let b = 0; b < 5; b++) {
      const hoek = (b / 5) * Math.PI * 2;
      g.append(el('ellipse', {
        cx: (bx + Math.cos(hoek) * 2.6).toFixed(1), cy: (by + Math.sin(hoek) * 2.6).toFixed(1),
        rx: 2.1, ry: 1.5, class: kl,
      }));
    }
    g.append(el('circle', { cx: bx, cy: by, r: 1.5, class: 'prophart' }));
  }
};

const struik = (g, cx, cy) => {
  g.append(el('ellipse', { cx, cy: cy + 10, rx: 15, ry: 4, class: 'propschaduw' }));
  // Een struik is geen groene bol. Eerst de massa, dan de takken die eruit
  // steken, en dan los blad erover: dat is het verschil tussen struikgewas
  // en een stip.
  for (const [dx, dy, r] of [[-8, 2, 9], [7, 3, 8], [0, -4, 10], [-3, 6, 7], [6, -3, 6]]) {
    g.append(el('circle', { cx: cx + dx, cy: cy + dy, r, class: 'propstruik' }));
  }
  g.append(el('path', {
    d: `M${cx - 2} ${cy + 9} q -1 -8 -6 -12 M${cx + 1} ${cy + 9} q 2 -9 7 -12`,
    class: 'proptak',
  }));
  for (const [dx, dy, hoek] of [
    [-13, -2, -40], [-6, -10, -15], [4, -11, 20], [12, -4, 45],
    [-11, 5, -60], [10, 6, 60], [0, -14, 0],
  ]) {
    const bx = cx + dx;
    const by = cy + dy;
    g.append(el('path', {
      d: `M${bx} ${by} q 3 -5 7 -5 q -1 5 -7 5 z`,
      class: 'propstruikblad',
      transform: `rotate(${hoek} ${bx} ${by})`,
    }));
  }
  for (const [dx, dy, r] of [[-9, -1, 4], [3, -6, 3.5]]) {
    g.append(el('circle', { cx: cx + dx, cy: cy + dy, r, class: 'propstruik-licht' }));
  }
};

const botjes = (g, cx, cy) => {
  g.append(el('path', {
    d: `M${cx - 13} ${cy + 2} l 18 -5 M${cx - 13} ${cy + 2} m -2 -2 a 2.6 2.6 0 1 0 0.1 0 M${cx - 15} ${cy + 4} a 2.6 2.6 0 1 0 0.1 0`,
    class: 'propbot',
  }));
  g.append(el('path', { d: `M${cx + 3} ${cy + 8} l 11 -4`, class: 'propbot' }));
};

const urn = (g, cx, cy) => {
  g.append(el('ellipse', { cx: cx + 1, cy: cy + 11, rx: 10, ry: 3.5, class: 'propschaduw' }));
  g.append(el('path', {
    d: `M${cx - 5} ${cy - 10} h 10 l -1 4 q 8 4 8 10 q 0 7 -12 7 q -12 0 -12 -7 q 0 -6 8 -10 z`,
    class: 'propsteen',
  }));
  g.append(el('path', { d: `M${cx - 6} ${cy + 1} q 4 -4 10 -3`, class: 'propglans' }));
};

const buisjes = (g, cx, cy) => {
  g.append(el('path', { d: `M${cx - 12} ${cy + 7} h 24 v 3 h -24 z`, class: 'prophout' }));
  for (const [dx, kl] of [[-8, 'propvocht-a'], [0, 'propvocht-b'], [8, 'propvocht-a']]) {
    g.append(el('path', { d: `M${cx + dx - 3} ${cy - 8} v 12 q 3 3 6 0 v -12 z`, class: 'propglas' }));
    g.append(el('path', { d: `M${cx + dx - 3} ${cy - 1} v 5 q 3 3 6 0 v -5 z`, class: kl }));
  }
};

const vijzel = (g, cx, cy) => {
  g.append(el('ellipse', { cx: cx + 1, cy: cy + 10, rx: 11, ry: 3.5, class: 'propschaduw' }));
  g.append(el('path', { d: `M${cx - 10} ${cy - 4} q 2 13 10 13 q 8 0 10 -13 z`, class: 'propsteen' }));
  g.append(el('ellipse', { cx, cy: cy - 4, rx: 10, ry: 3.4, class: 'propsteen-licht' }));
  g.append(el('path', { d: `M${cx + 3} ${cy - 6} l 9 -9`, class: 'propstamper' }));
};

const pantoffels = (g, cx, cy) => {
  for (const [dx, dy, kant] of [[-8, 2, -1], [8, -3, 1]]) {
    g.append(el('path', {
      d: `M${cx + dx - 5} ${cy + dy + 5} q -2 -9 5 -9 q 7 0 6 6 q -1 5 -6 5 q -4 0 -5 -2 z`,
      class: 'propstof',
    }));
    g.append(el('path', { d: `M${cx + dx - 3} ${cy + dy - 2} q 4 -2 7 1`, class: 'propglans' }));
  }
};

const rolpapier = (g, cx, cy) => {
  g.append(el('path', { d: `M${cx - 16} ${cy + 3} l 30 -7 l 2 7 l -30 7 z`, class: 'proppapier' }));
  g.append(el('path', { d: `M${cx - 16} ${cy + 3} a 3 4 0 1 0 0.1 0 M${cx + 14} ${cy - 4} a 3 4 0 1 0 0.1 0`, class: 'proprol' }));
  g.append(el('path', { d: `M${cx - 9} ${cy + 1} l 18 -4`, class: 'proplijn' }));
};

const brievenbakje = (g, cx, cy) => {
  g.append(el('ellipse', { cx: cx + 1, cy: cy + 9, rx: 13, ry: 3.5, class: 'propschaduw' }));
  g.append(el('path', { d: `M${cx - 14} ${cy - 2} h 28 l -2 10 h -24 z`, class: 'prophout' }));
  g.append(el('path', { d: `M${cx - 11} ${cy - 3} l 3 -7 l 20 -1 l -2 8 z`, class: 'proppapier' }));
  g.append(el('path', { d: `M${cx - 6} ${cy - 6} l 14 -1`, class: 'proplijn' }));
};

// ------------------------------------------------- wat hoort bij welke ruimte

const MOTIEVEN = {
  zaal: [
    kleed('#a8543c'), kamerplant, kandelaarvlek, kruk, kleed('#7a4a66', 0.5, 0.36),
    krant, boekenstapel, kussen, kamerplant, kleed('#8a6a3c', 0.46, 0.34),
  ],
  bibliotheek: [
    kleed('#6f5a8e'), boekenstapel, kruk, kandelaarvlek, krant,
    kleed('#8a5a3c', 0.5, 0.36), rolpapier, boekenstapel, kamerplant,
  ],
  slaapkamer: [
    kleed('#b8795e'), pantoffels, kussen, kleed('#8e6f9e', 0.5, 0.36),
    voetsporen, kamerplant, kruk, kussen,
  ],
  gang: [
    loper, voetsporen, brievenbakje, kleed('#5f7f6a', 0.5, 0.34),
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
    sterrenkaartjes, rolpapier, kleed('#4a5a8a', 0.6, 0.42), kandelaarvlek,
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
