// De lijst om het speurdokubord, per wereld een andere.
//
// Het bord zelf was af, maar eromheen zat een bruine rechthoek met afgeronde
// hoeken - hetzelfde kader voor een kerstavond, een ruimtestation en een
// grafkelder. Dat is de plek waar je het minst naar kijkt, en precies daarom
// valt het op als hij nergens over gaat: een echt bordspel heeft zijn verhaal
// op de rand staan.
//
// Een lijst bestaat hier uit drie dingen:
//
//   1. HET MATERIAAL. Vier banden om het speelveld, met hetzelfde licht als
//      alles op het bord: van linksboven. De bovenste en de linker band
//      vangen dat licht, de onderste en de rechter liggen in de schaduw.
//      Alleen dat al maakt van een rechthoek een lijst die dikte heeft.
//   2. WAT ERLANGS LOOPT. Klinknagels, dennennaalden, regenstrepen, voegen -
//      om de zoveel eenheden een klein ding. Niet om te zien, wel om te
//      missen. Elk motief wordt meegedraaid met de band waar het op ligt,
//      anders wijst een twijgje op de zijkant de verkeerde kant op.
//   3. DE HOEKEN. Drie ornamenten, rechtsboven, linksonder en rechtsonder.
//      Linksboven niet: daar staat het kompas, en de aanwijzingen gaan over
//      het noorden.
//
// Een lijst hoort donkerder te zijn dan het speelveld. Hij is er om het bord
// in te vatten, niet om ernaast te concurreren - de eerste poging was een
// fel groene band die harder riep dan de kamers erbinnen.
//
// De hoekornamenten gaan door dezelfde motor als de meubels, zodat ze bij de
// rest horen. Wat erlangs loopt niet: dat zijn er tientallen per bord en op
// die maat is randlicht een halve pixel.

import { tekenGeschilderd, meng, zorgVoorPalet } from './geschilderd.js';
import { bol, ovaal, plaat, romp, staaf, blad, hoop, zuilvorm } from './vormen.js';
import { ORNAMENTEN } from './randornamenten.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (naam, attrs = {}) => {
  const n = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  return n;
};

const v = (stof, d, extra) => (extra ? { stof, d, ...extra } : { stof, d });
const vloer = (stof, d) => ({ stof, d, grond: true });

// Korte hulpjes voor de motieven. Ze tekenen rond de oorsprong, met de band
// die langs de x-as loopt; de lijst draait ze zelf de goede kant op.
const lijn = (g, d, kleur, dik, o = 1) => g.append(el('path', {
  d, stroke: kleur, 'stroke-width': dik, 'stroke-linecap': 'round', fill: 'none', opacity: o,
}));
const vlek = (g, cx, cy, rx, ry, kleur, o = 1) =>
  g.append(el('ellipse', { cx, cy, rx, ry, fill: kleur, opacity: o }));

// ------------------------------------------------------------- de stijlen
//
// `kern`, `koel` en `warm` zijn dezelfde drie kleuren als in geschilderd.js:
// de kleur die het materiaal heeft, waar het licht niet komt, en waar het
// vol op staat. `textuur` verwijst naar een patroon uit het palet van die
// motor, dus de nerf in deze lijst is dezelfde nerf als in een kast.

export const RANDSTIJLEN = {
  // Natte stoeptegels onder een neonreclame.
  noir: {
    kern: '#283040', koel: '#0c1019', warm: '#9ec4ea', textuur: 'korrel', ruw: 0.3, stap: 56,
    motief(g, d) {
      lijn(g, `M0 ${-d * 0.46} L0 ${d * 0.46}`, '#0d131d', 1.6, 0.5);
      lijn(g, `M1 ${-d * 0.46} L1 ${d * 0.46}`, '#b9d8f2', 0.7, 0.14);
      lijn(g, `M-12 ${-d * 0.26} l 3.4 ${d * 0.52}`, '#cfe4f8', 1, 0.3);
      lijn(g, `M-6 ${-d * 0.34} l 2.6 ${d * 0.4}`, '#cfe4f8', 0.8, 0.2);
      vlek(g, 10, d * 0.1, 6, 2.2, '#8fc0e8', 0.22);
      vlek(g, 9, d * 0.04, 3, 0.9, '#dff0ff', 0.26);
    },
    hoek: [
      vloer('water', ovaal(24, 35, 19, 7.4)),
      v('water', ovaal(23, 33.6, 12, 4.4), { glans: 1 }),
      v('metaal', zuilvorm(34, 10, 3, 4.2, 22)),
      v('donker', romp(22, 5, 20, 7, { taps: 0.03 })),
      v('vuur', plaat(23.6, 6.6, 16.8, 3.4, { zak: 0.3 }), { glans: 1 }),
      v('papier', plaat(13, 31.6, 13, 2, { zak: 0.4 }), { glans: 1 }),
    ],
  },

  // Eikenhouten lijst met koperen beslag.
  landhuis: {
    kern: '#5a3a20', koel: '#1c1019', warm: '#e5ac72', textuur: 'nerf', ruw: 0.42, stap: 40,
    motief(g, d) {
      lijn(g, `M-22 ${-d * 0.26} L22 ${-d * 0.26}`, '#f0c38a', 0.9, 0.2);
      lijn(g, `M-22 ${d * 0.3} L22 ${d * 0.3}`, '#1c1019', 1.1, 0.34);
      for (const x of [-8, 0, 8]) {
        g.append(el('circle', { cx: x, cy: 0, r: 2.6, fill: '#a9772f', opacity: 0.62 }));
        g.append(el('circle', { cx: x - 0.7, cy: -0.7, r: 1.1, fill: '#ffe2ab', opacity: 0.45 }));
      }
    },
    hoek: [
      vloer('koper', romp(5, 5, 38, 38, { taps: 0.01, bol: 0.3 })),
      v('koper', romp(10.4, 10.4, 27.2, 27.2, { taps: 0.01, bol: 0.2 })),
      v('goud', 'M24 14 Q31 21 34 24 Q31 27 24 34 Q17 27 14 24 Q17 21 24 14 Z'),
      v('goud', bol(11.6, 11.6, 2.2)),
      v('goud', bol(36.4, 11.6, 2.2)),
      v('goud', bol(11.6, 36.4, 2.2)),
      v('goud', bol(36.4, 36.4, 2.2)),
    ],
  },

  // Geklonken staalplaat met een waarschuwingsstreep.
  station: {
    kern: '#515c6b', koel: '#161d2a', warm: '#eef7ff', textuur: 'strijk', ruw: 0.3, stap: 38,
    motief(g, d) {
      lijn(g, `M-19 ${-d * 0.3} L19 ${-d * 0.3}`, '#eef7ff', 0.8, 0.16);
      lijn(g, `M-19 ${d * 0.32} L19 ${d * 0.32}`, '#111823', 1.1, 0.4);
      for (const x of [-9, 9]) {
        g.append(el('circle', { cx: x, cy: 0, r: 3, fill: '#1b2430', opacity: 0.4 }));
        g.append(el('circle', { cx: x - 0.8, cy: -0.8, r: 1.5, fill: '#e8f3ff', opacity: 0.42 }));
      }
    },
    hoek: [
      vloer('metaal', romp(4, 6, 40, 36, { taps: 0.01, bol: 0.3 })),
      v('goud', 'M8.6 35 L16.6 12 L23 12 L15 35 Z'),
      v('goud', 'M20.6 35 L28.6 12 L35 12 L27 35 Z'),
      v('goud', 'M32.6 35 L40 14 L41.4 18.6 L35 35 Z'),
      v('metaal', bol(9, 9.4, 1.9)),
      v('metaal', bol(39, 38.6, 1.9)),
    ],
  },

  // Takken met blad, en mos in de hoeken.
  woud: {
    kern: '#3a2f1f', koel: '#141d16', warm: '#d2e2a0', textuur: 'nerf', ruw: 0.44, stap: 44,
    motief(g, d) {
      lijn(g, `M-22 ${d * 0.1} Q0 ${-d * 0.18} 22 ${d * 0.1}`, '#7b6639', 2.4, 0.7);
      lijn(g, `M-22 ${d * 0.04} Q0 ${-d * 0.24} 22 ${d * 0.04}`, '#d4bb7e', 0.9, 0.34);
      for (const [x, hoek] of [[-9, -46], [2, -128], [11, -38]]) {
        const r = (hoek * Math.PI) / 180;
        const tx = x + Math.cos(r) * 8;
        const ty = Math.sin(r) * 8;
        g.append(el('path', {
          d: `M${x} 0 Q${(x + tx) / 2 - Math.sin(r) * 3.4} ${ty / 2 + Math.cos(r) * 3.4} ${tx.toFixed(1)} ${ty.toFixed(1)}`
            + ` Q${(x + tx) / 2 + Math.sin(r) * 3.4} ${ty / 2 - Math.cos(r) * 3.4} ${x} 0 Z`,
          fill: '#9cc763', opacity: 0.68,
        }));
      }
    },
    hoek: [
      vloer('houtdonker', staaf(3, 41, 43, 31, 6.4)),
      v('houtdonker', staaf(17, 37.4, 23, 19, 4)),
      v('blad', blad(23, 19, 12, 4.2, -124)),
      v('blad', blad(23, 19, 13, 4.6, -48)),
      v('blad', blad(31, 33, 10, 3.6, -16)),
      v('blad', hoop(10, 43, 15, 5)),
      v('papier', zuilvorm(36, 35.4, 3.2, 4.2, 7.6)),
      v('houtrood', 'M30.4 36 Q31.6 29.6 36 29.2 Q40.4 29.6 41.6 36 Q36 37.8 30.4 36 Z'),
    ],
  },

  // Steenblokken met voegen, en een schedel in de hoek.
  catacomben: {
    kern: '#4b463f', koel: '#191320', warm: '#cfc3ad', textuur: 'korrel', ruw: 0.38, stap: 42,
    motief(g, d) {
      lijn(g, `M0 ${-d * 0.46} L0 ${d * 0.46}`, '#160f1c', 1.8, 0.5);
      lijn(g, `M1.3 ${-d * 0.46} L1.3 ${d * 0.46}`, '#efe6d2', 0.9, 0.26);
      lijn(g, `M-21 ${-d * 0.06} L21 ${-d * 0.06}`, '#160f1c', 1.6, 0.44);
      lijn(g, `M-21 ${-d * 0.06 + 1.2} L21 ${-d * 0.06 + 1.2}`, '#efe6d2', 0.8, 0.22);
    },
    hoek: [
      vloer('papier', ovaal(24, 22, 14, 13.4)),
      v('papier', 'M14.6 29.6 Q24 26.6 33.4 29.6 Q34 37 30 39.6 Q24 41.4 18 39.6 Q14 37 14.6 29.6 Z'),
      v('donker', ovaal(18.6, 21, 4.4, 5)),
      v('donker', ovaal(29.4, 21, 4.4, 5)),
      v('donker', 'M24 25.6 Q26.4 29 24 31 Q21.6 29 24 25.6 Z'),
      v('donker', 'M18 34.4 Q24 32.8 30 34.4 Q24 36.2 18 34.4 Z'),
    ],
  },

  // Groen leer met goudstempeling en een lakzegel.
  academie: {
    kern: '#263a2a', koel: '#0c1710', warm: '#9ecda4', textuur: 'weefsel', ruw: 0.4, stap: 32,
    motief(g, d) {
      lijn(g, `M-16 ${-d * 0.28} L16 ${-d * 0.28}`, '#d8b258', 1, 0.42);
      lijn(g, `M-16 ${d * 0.3} L16 ${d * 0.3}`, '#d8b258', 0.7, 0.3);
      g.append(el('path', {
        d: 'M0 -3 L3 0 L0 3 L-3 0 Z', fill: '#e8c877', opacity: 0.55,
      }));
    },
    hoek: [
      vloer('houtrood', bol(24, 26, 13.4)),
      v('houtrood', 'M11.6 22 Q24 18.6 36.4 22 Q37.2 26 36.4 30 Q24 33.4 11.6 30 Q10.8 26 11.6 22 Z'),
      v('goud', bol(24, 26, 8)),
      v('goud', 'M24 19.6 L26.6 24.4 L32 25.4 L28 29.2 L29 34.6 L24 32 L19 34.6 L20 29.2 L16 25.4 L21.4 24.4 Z'),
      v('goud', plaat(7, 10, 34, 2)),
      v('goud', plaat(7, 13.6, 34, 1)),
    ],
  },

  // Een dennenslinger met kerstballen.
  kerst: {
    kern: '#24412a', koel: '#0d1a12', warm: '#b2e49c', textuur: 'vezel', ruw: 0.26, stap: 30,
    motief(g, d) {
      // Een twijgje dat met de band meeloopt, met naalden aan weerskanten.
      // In de eerste poging stonden er drie streepjes vanuit één punt, en
      // dat las als een pijltje naar beneden.
      lijn(g, `M-15 ${d * 0.06} Q0 ${-d * 0.1} 15 ${d * 0.06}`, '#6a4a2a', 1.6, 0.5);
      for (let i = -4; i <= 4; i++) {
        const x = i * 3.4;
        const bocht = -Math.abs(i) * 0.3;
        for (const kant of [-1, 1]) {
          lijn(
            g,
            `M${x} ${bocht} l ${2.2 + (i % 2) * 0.8} ${kant * (d * 0.33 + (i % 3) * 0.9)}`,
            kant < 0 ? '#9ed389' : '#5f9a5a',
            1.2,
            kant < 0 ? 0.52 : 0.46,
          );
        }
      }
    },
    hoek: [
      vloer('stofgroen', 'M6 41 Q10 22 24 15.4 Q38 22 42 41 Q24 45 6 41 Z'),
      v('blad', blad(24, 29, 14, 5, -122)),
      v('blad', blad(24, 29, 15, 5.4, -56)),
      v('blad', blad(24, 31.4, 12, 4.4, -172)),
      v('blad', blad(24, 31.4, 12, 4.4, -8)),
      v('goud', romp(14.8, 26.6, 2.2, 2.4, { taps: 0.1 })),
      v('houtrood', bol(16, 32.6, 5)),
      v('goud', bol(30, 30.4, 4.4)),
      v('stofblauw', bol(23, 37.6, 4)),
    ],
  },

  // Knoestig hout met spinrag, en een pompoen in de hoek.
  halloween: {
    kern: '#302216', koel: '#140d11', warm: '#dda260', textuur: 'nerf', ruw: 0.46, stap: 46,
    motief(g, d) {
      lijn(g, `M-23 ${-d * 0.2} Q0 ${d * 0.16} 23 ${-d * 0.2}`, '#6a4f33', 1.8, 0.5);
      lijn(g, `M-23 ${-d * 0.26} Q0 ${d * 0.1} 23 ${-d * 0.26}`, '#c79a63', 0.8, 0.22);
      lijn(g, `M-12 ${-d * 0.42} Q0 ${d * 0.08} 12 ${-d * 0.42}`, '#efe6d6', 0.9, 0.5);
      lijn(g, `M-8 ${-d * 0.44} Q0 ${-d * 0.08} 8 ${-d * 0.44}`, '#efe6d6', 0.8, 0.4);
      lijn(g, `M-4 ${-d * 0.46} Q0 ${-d * 0.24} 4 ${-d * 0.46}`, '#efe6d6', 0.7, 0.3);
      lijn(g, `M-12 ${-d * 0.46} L0 ${d * 0.08}`, '#efe6d6', 0.6, 0.34);
      lijn(g, `M0 ${-d * 0.48} L0 ${d * 0.08}`, '#efe6d6', 0.6, 0.34);
      lijn(g, `M12 ${-d * 0.46} L0 ${d * 0.08}`, '#efe6d6', 0.6, 0.34);
      g.append(el('circle', { cx: 0, cy: d * 0.1, r: 2, fill: '#120b0f', opacity: 0.75 }));
      g.append(el('circle', { cx: -0.6, cy: d * 0.1 - 0.6, r: 0.8, fill: '#e8b06a', opacity: 0.5 }));
    },
    hoek: [
      vloer('vuur', 'M24 14.6 Q38 14.6 40 27.4 Q41 40.4 24 41.4 Q7 40.4 8 27.4 Q10 14.6 24 14.6 Z'),
      v('vuur', 'M24 15 Q29.4 16.4 30.4 27.6 Q31 38 24 40.6 Q27 32.4 27 27.6 Q27 20.4 24 15 Z', { glans: 0.8 }),
      v('vuur', 'M24 15 Q18.6 16.4 17.6 27.6 Q17 38 24 40.6 Q21 32.4 21 27.6 Q21 20.4 24 15 Z', { glans: 0.8 }),
      v('blad', staaf(24, 15.4, 27.4, 6, 3.4)),
      v('donker', 'M15.6 25.6 L20.4 22.4 L21.4 27.2 Z'),
      v('donker', 'M32.4 25.6 L27.6 22.4 L26.6 27.2 Z'),
      v('donker', 'M16 31.6 Q20 36 24 31.6 Q28 36 32 31.6 Q28 37.4 24 36.4 Q20 37.4 16 31.6 Z'),
    ],
  },
};

// Geen wereld herkend? Dan een eenvoudige houten lijst - beter een lijst die
// nergens over gaat dan geen lijst.
const STANDAARD = RANDSTIJLEN.landhuis;

// --------------------------------------------------------------- tekenen

function verloop(defs, id, van, naar, x2, y2) {
  const g = el('linearGradient', { id, x1: '0', y1: '0', x2: String(x2), y2: String(y2) });
  g.append(el('stop', { offset: '0%', 'stop-color': van }));
  g.append(el('stop', { offset: '100%', 'stop-color': naar }));
  defs.append(g);
}

// Zet de lijst neer. `dikte` is de breedte van de band; het speelveld begint
// daarbinnen.
export function tekenBordrand(svg, { wereld, x0 = 0, y0 = 0, breedte, hoogte, dikte }) {
  const s = RANDSTIJLEN[wereld] ?? STANDAARD;
  const diep = meng(s.kern, s.koel, 0.78);

  // De banden gebruiken de textuurpatronen van de schildermotor, dus die
  // moeten er staan voordat de eerste band ernaar verwijst.
  zorgVoorPalet();

  const defs = el('defs');
  verloop(defs, 'bordrand-boven', meng(s.kern, s.warm, 0.3), s.kern, 0.1, 1);
  verloop(defs, 'bordrand-links', meng(s.kern, s.warm, 0.18), meng(s.kern, s.koel, 0.14), 1, 0.1);
  verloop(defs, 'bordrand-onder', meng(s.kern, s.koel, 0.3), meng(s.kern, s.koel, 0.6), 0.1, 1);
  verloop(defs, 'bordrand-rechts', meng(s.kern, s.koel, 0.26), meng(s.kern, s.koel, 0.58), 1, 0.1);
  svg.append(defs);

  const g = el('g', { class: 'bordrand', 'pointer-events': 'none' });

  const band = (x, y, b, h, naam) => {
    g.append(el('rect', { x: x0 + x, y: y0 + y, width: b, height: h, fill: `url(#bordrand-${naam})` }));
    if (s.textuur) {
      g.append(el('rect', {
        x: x0 + x, y: y0 + y, width: b, height: h, fill: `url(#gs-${s.textuur})`, opacity: s.ruw ?? 0.4,
      }));
    }
  };

  band(0, 0, breedte, dikte, 'boven');
  band(0, hoogte - dikte, breedte, dikte, 'onder');
  band(0, dikte, dikte, hoogte - dikte * 2, 'links');
  band(breedte - dikte, dikte, dikte, hoogte - dikte * 2, 'rechts');

  // De schuine naden in de hoeken: zonder die is het vier losse balken in
  // plaats van een lijst.
  const naad = (d) => g.append(el('path', {
    d, stroke: diep, 'stroke-width': 0.9, opacity: 0.5, fill: 'none',
  }));
  naad(`M${x0} ${y0} L${x0 + dikte} ${y0 + dikte}`);
  naad(`M${x0 + breedte} ${y0} L${x0 + breedte - dikte} ${y0 + dikte}`);
  naad(`M${x0} ${y0 + hoogte} L${x0 + dikte} ${y0 + hoogte - dikte}`);
  naad(`M${x0 + breedte} ${y0 + hoogte} L${x0 + breedte - dikte} ${y0 + hoogte - dikte}`);

  // Wat erlangs loopt. Elk motief tekent rond de oorsprong met de band langs
  // de x-as; hier wordt het naar zijn plek geschoven en meegedraaid.
  const langs = el('g', { class: 'randmotief' });
  const zet = (cx, cy, draai) => {
    const m = el('g', { transform: `translate(${(x0 + cx).toFixed(1)} ${(y0 + cy).toFixed(1)}) rotate(${draai})` });
    s.motief(m, dikte);
    langs.append(m);
  };
  const stap = s.stap ?? 44;
  for (let x = dikte + stap * 0.5; x < breedte - dikte; x += stap) {
    zet(x, dikte / 2, 0);
    zet(x, hoogte - dikte / 2, 0);
  }
  for (let y = dikte + stap * 0.5; y < hoogte - dikte; y += stap) {
    zet(dikte / 2, y, 90);
    zet(breedte - dikte / 2, y, 90);
  }
  g.append(langs);

  // Randlicht langs de buitenkant linksboven, schaduw langs rechtsonder.
  g.append(el('path', {
    d: `M${x0 + 0.8} ${y0 + hoogte} L${x0 + 0.8} ${y0 + 0.8} L${x0 + breedte - 0.8} ${y0 + 0.8}`,
    stroke: meng(s.warm, '#ffffff', 0.3), 'stroke-width': 1.5, opacity: 0.45, fill: 'none',
  }));
  g.append(el('path', {
    d: `M${x0 + breedte - 0.8} ${y0 + 0.8} L${x0 + breedte - 0.8} ${y0 + hoogte - 0.8} L${x0 + 0.8} ${y0 + hoogte - 0.8}`,
    stroke: diep, 'stroke-width': 1.5, opacity: 0.6, fill: 'none',
  }));

  // De binnenkant: een donkere sponning, zodat het speelveld in de lijst
  // ligt in plaats van ertegenaan.
  g.append(el('rect', {
    x: x0 + dikte, y: y0 + dikte, width: breedte - dikte * 2, height: hoogte - dikte * 2,
    fill: 'none', stroke: diep, 'stroke-width': 3, opacity: 0.8,
  }));
  g.append(el('rect', {
    x: x0 + dikte + 2.2, y: y0 + dikte + 2.2, width: breedte - dikte * 2 - 4.4, height: hoogte - dikte * 2 - 4.4,
    fill: 'none', stroke: meng(s.warm, '#ffffff', 0.2), 'stroke-width': 1, opacity: 0.26,
  }));

  svg.append(g);

  // De hoeken. Linksboven niet: daar staat het kompas.
  const maat = Math.min(46, dikte * 1.95);
  const hoeken = el('g', { class: 'bordhoeken', 'pointer-events': 'none' });
  for (const [hx, hy] of [
    [breedte - maat, 0],
    [0, hoogte - maat],
    [breedte - maat, hoogte - maat],
  ]) {
    tekenGeschilderd(hoeken, s.hoek, { x: x0 + hx, y: y0 + hy, grootte: maat });
  }
  svg.append(hoeken);
}

export const RANDWERELDEN = Object.keys(RANDSTIJLEN);

// ------------------------------------------------------------- de hangers
//
// Wat er op de lijst hangt en staat. Dit gaat als laatste over het bord
// heen, want het hoort eroverheen te vallen: een hangplant die netjes achter
// het speelveld blijft is geen hangplant.
//
// `lucht` is hoeveel ruimte er buiten de lijst is. Steekt een ding verder
// naar buiten dan dat, dan wordt het kleiner gemaakt in plaats van
// afgesneden - een tovenaarshoed zonder punt is geen tovenaarshoed.
export function tekenBordhangers(svg, {
  wereld, x0 = 0, y0 = 0, breedte, hoogte, dikte, luchtBoven = 0, luchtZij = 0,
}) {
  const lijst = ORNAMENTEN[wereld];
  if (!lijst?.length) return;

  const g = el('g', { class: 'bordhangers', 'pointer-events': 'none' });
  for (const o of lijst) {
    const lucht = o.kant === 'boven' ? luchtBoven : luchtZij;
    // `uit` is hoe ver het ding buiten het bord steekt, `maat` hoe groot het
    // is. Wat daar tussenin zit valt over het speelveld heen. Zo bepaalt de
    // maat vanzelf hoe diep iets het bord in hangt, en hoeft dat niet op twee
    // plekken te kloppen.
    const uit = Math.min(o.uit ?? Math.round(o.maat * 0.3), lucht);
    const maat = o.maat;

    let x;
    let y;
    if (o.kant === 'boven' || o.kant === 'onder') {
      x = x0 + dikte + o.t * (breedte - dikte * 2) - maat / 2;
      y = o.kant === 'boven' ? y0 - uit : y0 + hoogte + uit - maat;
    } else {
      y = y0 + dikte + o.t * (hoogte - dikte * 2) - maat / 2;
      x = o.kant === 'links' ? x0 - uit : x0 + breedte + uit - maat;
    }

    const houder = o.draai
      ? el('g', { transform: `rotate(${o.draai} ${(x + maat / 2).toFixed(1)} ${(y + maat / 2).toFixed(1)})` })
      : g;
    tekenGeschilderd(houder, o.delen, { x, y, grootte: maat });
    if (houder !== g) g.append(houder);
  }
  svg.append(g);
}
