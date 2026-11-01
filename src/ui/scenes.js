// Sfeertekeningen per wereld, in code getekend.
//
// Opzet: drie dieptelagen (ver, midden, dichtbij) die naar voren toe donkerder
// worden, wat atmosfeer in de lucht, en precies een goudkleurig lichtpunt -
// een raam, een lantaarn, een vuurvlieg. Dat ene lichtje doet het meeste werk:
// het geeft de tekening een plek waar je oog naartoe gaat.
//
// De wereldkleur zit alleen hier, in de lucht van de tekening. In de bediening
// van de site blijft goud de enige accentkleur.

const NS = 'http://www.w3.org/2000/svg';
const B = 800;
const H = 150;

const maak = (naam, attrs = {}) => {
  const n = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
  return n;
};

const rechthoek = (x, y, w, h, klasse) => maak('rect', { x, y, width: w, height: h, class: klasse });
const pad = (d, klasse) => maak('path', { d, class: klasse });
const cirkel = (cx, cy, r, klasse) => maak('circle', { cx, cy, r, class: klasse });

// Rijtje verlichte ramen in een gebouw; eentje krijgt het goud.
function ramen(groep, x, y, kolommen, rijen, stap, gouden) {
  let i = 0;
  for (let r = 0; r < rijen; r++) {
    for (let k = 0; k < kolommen; k++, i++) {
      groep.append(rechthoek(x + k * stap, y + r * stap, 3, 4, i === gouden ? 'sc-licht' : 'sc-raam'));
    }
  }
}

function sterren(groep, aantal, zaad) {
  let s = zaad;
  const volgende = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < aantal; i++) {
    groep.append(cirkel(volgende() * B, volgende() * 80 + 6, volgende() * 1.1 + 0.5, 'sc-ster'));
  }
}

const SCENES = {
  // Natte straten, neon dat uitloopt in de plassen.
  noir(g) {
    sterren(g, 10, 7);
    const ver = maak('g', { class: 'sc-ver' });
    [[0, 70, 90], [80, 50, 70], [150, 82, 60], [210, 44, 80], [300, 74, 110],
     [420, 56, 64], [500, 88, 90], [590, 48, 74], [670, 78, 130]].forEach(([x, y, w]) => {
      ver.append(rechthoek(x, y, w, H - y, 'sc-ver'));
    });
    g.append(ver);

    const mid = maak('g');
    [[40, 92, 120], [260, 100, 150], [470, 96, 140], [640, 104, 160]].forEach(([x, y, w]) => {
      mid.append(rechthoek(x, y, w, H - y, 'sc-mid'));
    });
    g.append(mid);
    ramen(mid, 60, 104, 5, 3, 9, 7);
    ramen(mid, 290, 112, 6, 2, 9, 3);
    ramen(mid, 500, 108, 5, 3, 9, 11);

    // Regen.
    const regen = maak('g', { class: 'sc-regen' });
    for (let i = 0; i < 70; i++) {
      const x = (i * 97) % B;
      const y = (i * 53) % 120;
      regen.append(pad(`M ${x} ${y} l -5 14`, 'sc-regenlijn'));
    }
    g.append(regen);

    // Straatlantaarn met schijnsel.
    g.append(pad('M 120 150 L 120 86 q 0 -8 10 -8 l 14 0', 'sc-lijn'));
    g.append(cirkel(146, 80, 5, 'sc-licht'));
    g.append(cirkel(146, 80, 16, 'sc-schijn'));
    g.append(rechthoek(0, 138, B, 12, 'sc-nat'));
    g.append(rechthoek(140, 138, 12, 12, 'sc-weerschijn'));
  },

  // Een landhuis aan het eind van de oprijlaan, een raam nog verlicht.
  landhuis(g) {
    g.append(cirkel(690, 36, 15, 'sc-maan'));
    sterren(g, 14, 3);

    const bomen = maak('g');
    [[60, 150, 34], [120, 150, 26], [720, 150, 30], [770, 150, 22]].forEach(([x, y, r]) => {
      bomen.append(pad(`M ${x} ${y} l 0 -${r} M ${x} ${y - r} m -${r} 0 a ${r} ${r} 0 1 1 ${r * 2} 0 z`, 'sc-ver'));
    });
    g.append(bomen);

    const huis = maak('g');
    huis.append(pad('M 300 150 L 300 74 L 400 40 L 500 74 L 500 150 Z', 'sc-mid'));
    huis.append(pad('M 288 78 L 400 34 L 512 78 Z', 'sc-near'));
    huis.append(rechthoek(330, 20, 10, 22, 'sc-near'));
    huis.append(rechthoek(452, 24, 10, 18, 'sc-near'));
    // Zijvleugels. (Een rechthoek met negatieve hoogte bestaat niet in SVG,
    // dus rekenen vanaf de bovenkant.)
    huis.append(rechthoek(240, 104, 60, 46, 'sc-mid'));
    huis.append(rechthoek(500, 104, 60, 46, 'sc-mid'));
    g.append(huis);

    ramen(g, 318, 92, 5, 2, 18, 6);
    ramen(g, 436, 92, 4, 2, 18, 9);
    g.append(rechthoek(392, 118, 16, 32, 'sc-deur'));
    g.append(rechthoek(0, 146, B, 4, 'sc-grond'));
  },

  // Een station in de schaduw van een planeet.
  station(g) {
    sterren(g, 60, 11);
    g.append(pad(`M -60 190 a 300 300 0 0 1 560 -90 L 900 190 Z`, 'sc-planeet'));
    g.append(pad('M -40 170 a 290 290 0 0 1 520 -80', 'sc-horizon'));

    const st = maak('g');
    st.append(rechthoek(360, 56, 80, 26, 'sc-mid'));
    st.append(rechthoek(392, 36, 16, 70, 'sc-mid'));
    st.append(rechthoek(300, 60, 56, 10, 'sc-ver'));
    st.append(rechthoek(444, 60, 56, 10, 'sc-ver'));
    st.append(pad('M 300 65 L 356 65 M 444 65 L 500 65', 'sc-lijn'));
    st.append(cirkel(400, 110, 9, 'sc-mid'));
    g.append(st);
    ramen(g, 368, 64, 6, 1, 11, 2);
    g.append(cirkel(400, 32, 3.5, 'sc-licht'));
    g.append(cirkel(400, 32, 12, 'sc-schijn'));
  },

  // Bos in drie lagen, met vuurvliegen.
  woud(g) {
    const laag = (basis, hoogte, breedte, klasse, stap) => {
      const grp = maak('g');
      for (let x = -20; x < B + 40; x += stap) {
        grp.append(pad(`M ${x} ${basis} L ${x + breedte / 2} ${basis - hoogte} L ${x + breedte} ${basis} Z`, klasse));
      }
      return grp;
    };
    g.append(laag(118, 56, 58, 'sc-ver', 46));
    g.append(rechthoek(0, 112, B, 8, 'sc-mist'));
    g.append(laag(136, 72, 76, 'sc-mid', 62));
    g.append(rechthoek(0, 130, B, 8, 'sc-mist'));
    g.append(laag(152, 54, 64, 'sc-near', 54));

    [[180, 92], [250, 74], [520, 86], [600, 70], [410, 100], [690, 94]].forEach(([x, y], i) => {
      g.append(cirkel(x, y, i === 2 ? 3.5 : 2, 'sc-licht'));
      if (i === 2) g.append(cirkel(x, y, 12, 'sc-schijn'));
    });
  },

  // Gewelven die wegzakken in het donker, met een lamp.
  catacomben(g) {
    const boog = (x, b, h, klasse) =>
      pad(`M ${x} 150 L ${x} ${150 - h} a ${b / 2} ${b / 2} 0 0 1 ${b} 0 L ${x + b} 150 Z`, klasse);
    g.append(rechthoek(0, 0, B, H, 'sc-ver'));
    g.append(boog(250, 300, 118, 'sc-mid'));
    g.append(boog(300, 200, 96, 'sc-near'));
    g.append(boog(340, 120, 74, 'sc-diep'));

    // Stalactieten.
    for (let x = 20; x < B; x += 37) {
      const h = 8 + ((x * 7) % 16);
      g.append(pad(`M ${x} 0 l 5 ${h} l 5 -${h} Z`, 'sc-mid'));
    }
    g.append(cirkel(180, 104, 4.5, 'sc-licht'));
    g.append(cirkel(180, 104, 15, 'sc-schijn'));
    g.append(pad('M 180 104 L 180 88', 'sc-lijn'));
    g.append(rechthoek(0, 146, B, 4, 'sc-grond'));
  },

  // Torens en een maan; ergens brandt nog licht.
  academie(g) {
    g.append(pad('M 660 44 a 17 17 0 1 1 -14 -16 a 13 13 0 0 0 14 16 Z', 'sc-maan'));
    sterren(g, 22, 19);

    const toren = (x, b, h, klasse) => {
      const grp = maak('g');
      grp.append(rechthoek(x, 150 - h, b, h, klasse));
      grp.append(pad(`M ${x - 5} ${150 - h} L ${x + b / 2} ${150 - h - 28} L ${x + b + 5} ${150 - h} Z`, klasse));
      return grp;
    };
    g.append(toren(120, 46, 72, 'sc-ver'));
    g.append(toren(620, 40, 64, 'sc-ver'));
    g.append(toren(300, 70, 104, 'sc-mid'));
    g.append(toren(430, 56, 86, 'sc-mid'));
    g.append(rechthoek(200, 118, 420, 32, 'sc-near'));

    ramen(g, 316, 64, 4, 3, 14, 5);
    ramen(g, 444, 82, 3, 2, 14, 2);
    g.append(pad('M 310 150 L 310 132 a 8 8 0 0 1 16 0 L 326 150 Z', 'sc-deur'));
  },
};

export function sceneVoor(wereldId, accent) {
  const teken = SCENES[wereldId] ?? SCENES.noir;
  const svg = maak('svg', {
    viewBox: `0 0 ${B} ${H}`,
    class: 'scene',
    'aria-hidden': 'true',
    preserveAspectRatio: 'xMidYMax slice',
  });

  // De lucht krijgt een vleugje van de wereldkleur. Dat is de enige plek waar
  // die kleur nog voorkomt: binnen de tekening, niet in de bediening.
  const defs = maak('defs');
  const id = `lucht-${wereldId}`;
  const grad = maak('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 });
  grad.append(maak('stop', { offset: '0%', 'stop-color': accent, 'stop-opacity': '0.22' }));
  grad.append(maak('stop', { offset: '70%', 'stop-color': accent, 'stop-opacity': '0.04' }));
  grad.append(maak('stop', { offset: '100%', 'stop-color': accent, 'stop-opacity': '0' }));
  defs.append(grad);
  svg.append(defs);
  svg.append(maak('rect', { x: 0, y: 0, width: B, height: H, fill: `url(#${id})` }));

  const g = maak('g');
  teken(g);
  svg.append(g);
  return svg;
}
