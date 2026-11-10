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

// Een zaadje in plaats van Math.random: een tekening die bij elke keer anders
// is, is geen tekening. Met een vast zaad blijft hij zichzelf, en kan een
// scherm­afdruk ergens over gaan.
const zaadje = (zaad) => {
  let s = zaad;
  return () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
};

function sterren(groep, aantal, zaad) {
  const volgende = zaadje(zaad);
  for (let i = 0; i < aantal; i++) {
    groep.append(cirkel(volgende() * B, volgende() * 80 + 6, volgende() * 1.1 + 0.5, 'sc-ster'));
  }
}

// De schaduwkant van een silhouet: hetzelfde vlak, maar de helft die van het
// licht af ligt. Zonder dit is een berg een driehoek en een boom een puntje;
// met dit krijgt het een kant.
const flank = (d) => pad(d, 'sc-flank');

const SCENES = {
  // Natte straten, neon dat uitloopt in de plassen.
  noir(g) {
    sterren(g, 10, 7);

    // Een skyline van kale rechthoeken is een staafdiagram. Een dak heeft een
    // terugsprong, een watertoren of een mast - daar herken je een stad aan,
    // en het kost drie regels per gebouw.
    const r = zaadje(13);
    const gebouw = (grp, x, y, w, klasse) => {
      grp.append(rechthoek(x, y, w, H - y, klasse));
      const soort = Math.floor(r() * 3);
      if (soort === 0) {
        grp.append(rechthoek(x + w * 0.18, y - 7, w * 0.44, 7, klasse));
      } else if (soort === 1) {
        grp.append(rechthoek(x + w * 0.3, y - 9, w * 0.32, 9, klasse));
        grp.append(rechthoek(x + w * 0.44, y - 19, 2, 10, klasse));
      } else {
        grp.append(pad(`M ${x} ${y} L ${x + w * 0.5} ${y - 9} L ${x + w} ${y} Z`, klasse));
      }
      grp.append(flank(`M ${x + w * 0.66} ${y} L ${x + w} ${y} L ${x + w} ${H} L ${x + w * 0.66} ${H} Z`));
    };

    const ver = maak('g');
    [[0, 70, 90], [80, 50, 70], [150, 82, 60], [210, 44, 80], [300, 74, 110],
     [420, 56, 64], [500, 88, 90], [590, 48, 74], [670, 78, 130]].forEach(([x, y, w]) => {
      gebouw(ver, x, y, w, 'sc-ver');
    });
    g.append(ver);

    const mid = maak('g');
    [[40, 92, 120], [260, 100, 150], [470, 96, 140], [640, 104, 160]].forEach(([x, y, w]) => {
      gebouw(mid, x, y, w, 'sc-mid');
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
    // Het dak steekt over, en de rechterhelft ligt van de maan af. Zonder
    // die twee is een landhuis een vijfhoek.
    huis.append(pad('M 284 80 L 400 34 L 516 80 L 500 80 L 400 44 L 300 80 Z', 'sc-near'));
    huis.append(flank('M 400 44 L 500 80 L 500 150 L 400 150 Z'));
    huis.append(rechthoek(330, 20, 10, 22, 'sc-near'));
    huis.append(rechthoek(452, 24, 10, 18, 'sc-near'));
    // Zijvleugels, met hun eigen daklijn - anders zijn het twee dozen.
    huis.append(rechthoek(240, 108, 60, 42, 'sc-mid'));
    huis.append(pad('M 232 110 L 270 96 L 308 110 Z', 'sc-near'));
    huis.append(flank('M 270 96 L 308 110 L 308 150 L 270 150 Z'));
    huis.append(rechthoek(500, 108, 60, 42, 'sc-mid'));
    huis.append(pad('M 492 110 L 530 96 L 568 110 Z', 'sc-near'));
    huis.append(flank('M 530 96 L 568 110 L 568 150 L 530 150 Z'));
    // Een portiek met twee zuilen over de voordeur.
    huis.append(pad('M 376 118 L 400 106 L 424 118 Z', 'sc-near'));
    g.append(huis);

    ramen(g, 318, 92, 5, 2, 18, 6);
    ramen(g, 436, 92, 4, 2, 18, 9);
    ramen(g, 250, 120, 3, 1, 16, 1);
    ramen(g, 512, 120, 3, 1, 16, 2);
    g.append(rechthoek(392, 118, 16, 32, 'sc-deur'));
    g.append(rechthoek(378, 118, 4, 32, 'sc-near'));
    g.append(rechthoek(418, 118, 4, 32, 'sc-near'));
    // Het licht uit de deur valt op het grind. Een huis waar iemand is
    // scheelt een wereld met een huis waar een lamp brandt.
    g.append(cirkel(400, 136, 3, 'sc-licht'));
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
    // Hier stond een rij gelijke driehoeken op gelijke afstand. Dat is geen
    // bos maar een zaagblad. Nu heeft elke boom zijn eigen hoogte, zijn eigen
    // breedte, een punt die niet in het midden staat, en een schaduwkant.
    const laag = (basis, hoogte, breedte, klasse, stap, zaad) => {
      const grp = maak('g');
      const r = zaadje(zaad);
      for (let x = -30; x < B + 40; x += stap * (0.74 + r() * 0.6)) {
        const h = hoogte * (0.66 + r() * 0.66);
        const b = breedte * (0.78 + r() * 0.5);
        const top = x + b * (0.32 + r() * 0.36);
        const voet = basis + r() * 5 - 2;
        grp.append(pad(`M ${x} ${voet} L ${top} ${voet - h} L ${x + b} ${voet} Z`, klasse));
        grp.append(flank(`M ${top} ${voet - h} L ${x + b} ${voet} L ${top} ${voet} Z`));
      }
      return grp;
    };
    g.append(laag(118, 56, 58, 'sc-ver', 46, 5));
    g.append(rechthoek(0, 112, B, 8, 'sc-mist'));
    g.append(laag(136, 72, 76, 'sc-mid', 62, 17));
    g.append(rechthoek(0, 130, B, 8, 'sc-mist'));
    g.append(laag(152, 54, 64, 'sc-near', 54, 29));

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
    // Vijf bogen die naar een punt lopen in plaats van drie die op elkaar
    // staan: dat is het verschil tussen een gang en een poort.
    g.append(boog(230, 340, 126, 'sc-mid'));
    g.append(boog(272, 256, 110, 'sc-near'));
    g.append(boog(308, 184, 92, 'sc-near'));
    g.append(boog(338, 124, 76, 'sc-diep'));
    g.append(boog(362, 76, 60, 'sc-diep'));
    // De vloer loopt mee naar achteren.
    g.append(pad('M 0 150 L 230 150 L 362 118 L 438 118 L 570 150 L 800 150 L 800 150 Z', 'sc-grond'));

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

  // Sneeuw, verlichte ramen en een boom met een ster.
  kerst(g) {
    sterren(g, 12, 23);
    const huisjes = maak('g');
    [[70, 96, 90, 34], [210, 104, 120, 28], [470, 100, 110, 30], [630, 92, 100, 36]].forEach(([x, y, b, dak]) => {
      huisjes.append(pad(`M ${x} ${y} L ${x + b / 2} ${y - dak} L ${x + b} ${y} Z`, 'sc-mid'));
      huisjes.append(rechthoek(x + 6, y, b - 12, H - y, 'sc-near'));
      huisjes.append(rechthoek(x - 2, y - 2, b + 4, 5, 'sc-sneeuw'));
    });
    g.append(huisjes);
    ramen(g, 86, 112, 3, 2, 12, 2);
    ramen(g, 228, 118, 4, 1, 12, 1);
    ramen(g, 486, 116, 3, 2, 12, 4);

    // De boom met zijn ster.
    const bx = 380;
    g.append(pad(`M ${bx} 132 L ${bx - 34} 132 L ${bx} 72 L ${bx + 34} 132 Z`, 'sc-boom'));
    g.append(pad(`M ${bx} 104 L ${bx - 24} 104 L ${bx} 56 L ${bx + 24} 104 Z`, 'sc-boom'));
    g.append(rechthoek(bx - 5, 132, 10, 12, 'sc-near'));
    g.append(cirkel(bx, 52, 4, 'sc-licht'));
    g.append(cirkel(bx, 52, 14, 'sc-schijn'));

    // Sneeuwvlokken.
    for (let i = 0; i < 60; i++) {
      g.append(cirkel((i * 131) % B, (i * 47) % 130, 1.6, 'sc-sneeuw'));
    }
    g.append(rechthoek(0, 142, B, 8, 'sc-sneeuw'));
  },

  // Kale bomen, een volle maan en pompoenen die van binnen branden.
  halloween(g) {
    g.append(cirkel(640, 44, 26, 'sc-maan'));
    sterren(g, 16, 31);

    const tak = (x, basis, hoogte) => {
      const grp = maak('g');
      grp.append(pad(`M ${x} ${basis} L ${x} ${basis - hoogte}`, 'sc-takken'));
      grp.append(pad(`M ${x} ${basis - hoogte * 0.6} L ${x - 22} ${basis - hoogte * 0.95}`, 'sc-takken'));
      grp.append(pad(`M ${x} ${basis - hoogte * 0.75} L ${x + 24} ${basis - hoogte}`, 'sc-takken'));
      grp.append(pad(`M ${x} ${basis - hoogte * 0.4} L ${x - 18} ${basis - hoogte * 0.65}`, 'sc-takken'));
      return grp;
    };
    g.append(tak(120, 140, 86), tak(300, 140, 64), tak(520, 140, 78), tak(720, 140, 58));
    g.append(rechthoek(0, 136, B, 14, 'sc-near'));

    // Een hek dat er al een paar winters staat: planken van ongelijke lengte,
    // eentje scheef, hier en daar een die eruit is. Een rij identieke latjes
    // op gelijke afstand is een streepjescode.
    const h = zaadje(41);
    for (let x = 14; x < B; x += 22 + h() * 10) {
      if (h() < 0.12) continue;
      const top = 100 + h() * 18;
      const scheef = (h() - 0.5) * 7;
      g.append(pad(
        `M ${x} 142 L ${x + scheef * 0.4} ${top + 6} L ${x + 5 + scheef} ${top} `
        + `L ${x + 10 + scheef * 0.4} ${top + 6} L ${x + 10} 142 Z`, 'sc-mid'));
    }
    g.append(pad('M 10 124 L 790 121', 'sc-takken'));

    // Pompoenen met licht erin.
    [[220, 134, 16], [410, 136, 13], [600, 133, 18]].forEach(([x, y, r], i) => {
      g.append(pad(`M ${x} ${y} m -${r} 0 a ${r} ${r * 0.8} 0 1 1 ${r * 2} 0 a ${r} ${r * 0.8} 0 1 1 -${r * 2} 0 Z`, 'sc-pompoen'));
      g.append(pad(`M ${x - 5} ${y - 3} l 4 5 l -8 0 Z`, 'sc-licht'));
      g.append(pad(`M ${x + 5} ${y - 3} l 4 5 l -8 0 Z`, 'sc-licht'));
      if (i === 2) g.append(cirkel(x, y, r + 8, 'sc-schijn'));
    });
  },

  // Een laag schoolgebouw op een avond: fietsenstalling, verlichte gangen,
  // en één lokaal waar nog iemand zit.
  school(g) {
    sterren(g, 14, 23);
    const ver = maak('g');
    [[0, 96, 150], [170, 88, 120], [300, 100, 200], [520, 84, 140], [670, 94, 160]].forEach(([x, y, w]) => {
      ver.append(rechthoek(x, y, w, H - y, 'sc-ver'));
    });
    g.append(ver);

    // Het gebouw zelf: twee lagen, een plat dak en een glazen entree.
    const mid = maak('g');
    mid.append(rechthoek(60, 70, 420, H - 70, 'sc-mid'));
    mid.append(rechthoek(480, 86, 260, H - 86, 'sc-mid'));
    mid.append(pad('M 60 70 L 480 70 M 480 86 L 740 86', 'sc-lijn'));
    g.append(mid);
    ramen(mid, 80, 80, 12, 2, 18, 9);
    ramen(mid, 500, 96, 6, 1, 20, 4);

    // De entree: een luifel met licht eronder.
    const voor = maak('g');
    voor.append(rechthoek(250, 112, 90, 38, 'sc-near'));
    voor.append(rechthoek(244, 108, 102, 5, 'sc-near'));
    g.append(voor);
    g.append(cirkel(295, 120, 3.5, 'sc-licht'));
    g.append(cirkel(295, 120, 14, 'sc-schijn'));

    // Een fietsenrek in silhouet en een vlaggenmast.
    const beugels = maak('g');
    for (let x = 580; x < 700; x += 16) {
      beugels.append(pad(`M ${x} 150 L ${x} 134 q 0 -6 6 -6 q 6 0 6 6 L ${x + 12} 150`, 'sc-takken'));
    }
    g.append(beugels);
    g.append(rechthoek(150, 56, 2, 94, 'sc-near'));
    g.append(pad('M 152 58 L 178 64 L 152 72 Z', 'sc-near'));
  },

  // Een ziekenhuisvleugel bij nacht: verlichte gangen die doorlopen, en de
  // luifel boven de spoedingang die als enige echt brandt.
  ziekenhuis(g) {
    sterren(g, 10, 41);
    const ver = maak('g');
    [[0, 62, 190], [230, 50, 160], [430, 66, 150], [620, 44, 180]].forEach(([x, y, w]) => {
      ver.append(rechthoek(x, y, w, H - y, 'sc-ver'));
    });
    g.append(ver);

    const mid = maak('g');
    mid.append(rechthoek(100, 54, 300, H - 54, 'sc-mid'));
    mid.append(rechthoek(400, 74, 320, H - 74, 'sc-mid'));
    g.append(mid);
    // Hele verdiepingen die aan staan: een ziekenhuis dooft nooit helemaal.
    for (let r = 0; r < 4; r++) {
      mid.append(rechthoek(108, 64 + r * 20, 284, 6, r === 1 ? 'sc-licht' : 'sc-raam'));
    }
    for (let r = 0; r < 3; r++) {
      mid.append(rechthoek(408, 84 + r * 20, 304, 5, 'sc-raam'));
    }

    const voor = maak('g');
    voor.append(rechthoek(170, 112, 150, 38, 'sc-near'));
    voor.append(rechthoek(160, 106, 172, 7, 'sc-near'));
    g.append(voor);
    g.append(cirkel(245, 122, 4, 'sc-licht'));
    g.append(cirkel(245, 122, 17, 'sc-schijn'));
    // Een ambulance die met zijn neus naar de ingang staat.
    g.append(pad('M 380 150 L 380 128 L 404 128 L 414 136 L 448 136 L 448 150 Z', 'sc-near'));
    g.append(cirkel(452, 132, 2.5, 'sc-licht'));
  },

  // Een kantoorwijk na sluitingstijd. Alle torens donker op één verdieping
  // na - daar brandt het nog, en daar gaat dit over.
  kantoor(g) {
    sterren(g, 18, 59);
    const ver = maak('g');
    [[0, 48, 70], [90, 30, 60], [360, 36, 64], [600, 26, 72], [700, 54, 100]].forEach(([x, y, w]) => {
      ver.append(rechthoek(x, y, w, H - y, 'sc-ver'));
    });
    g.append(ver);

    const mid = maak('g');
    [[160, 18, 110], [290, 44, 80], [450, 10, 120], [580, 50, 90]].forEach(([x, y, w]) => {
      mid.append(rechthoek(x, y, w, H - y, 'sc-mid'));
    });
    g.append(mid);
    // Rasters van ramen: bijna allemaal uit.
    ramen(mid, 172, 30, 6, 8, 16, 99);
    ramen(mid, 300, 56, 4, 6, 17, 99);
    ramen(mid, 462, 22, 6, 9, 17, 99);
    ramen(mid, 592, 62, 4, 5, 18, 99);

    // Eén verdieping die nog aan staat, over de volle breedte van de toren.
    g.append(rechthoek(462, 90, 96, 9, 'sc-licht'));
    g.append(rechthoek(452, 86, 116, 17, 'sc-schijn'));
    g.append(cirkel(510, 94, 20, 'sc-schijn'));

    // Een natte straat ervoor die het licht terugkaatst.
    g.append(rechthoek(0, 138, B, 12, 'sc-nat'));
    g.append(rechthoek(486, 138, 48, 12, 'sc-weerschijn'));
  },

  // Een openluchtbad op de warmste dag van het jaar. Dit is de eerste
  // scene die geen nacht is: geen sterren, geen enkel lichtje, maar lucht
  // en water en te veel mensen.
  zwembad(g) {
    const ver = maak('g');
    ver.append(rechthoek(0, 0, B, 64, 'sc-ver'));
    [[40, 26, 60], [150, 18, 44], [300, 30, 70], [470, 20, 52], [640, 28, 64]].forEach(([x, y, w]) => {
      ver.append(pad(`M ${x} ${y + 14} q ${w / 4} -14 ${w / 2} 0 q ${w / 4} -10 ${w / 2} 0 Z`, 'sc-sneeuw'));
    });
    g.append(ver);

    const mid = maak('g');
    mid.append(rechthoek(0, 62, B, 56, 'sc-nat'));
    for (let x = 10; x < B; x += 38) {
      mid.append(pad(`M ${x} ${72 + (x % 3) * 9} q 9 -5 18 0`, 'sc-lijn'));
    }
    for (let x = 20; x < B; x += 26) {
      mid.append(cirkel(x, 92, 3, (x / 26) % 2 ? 'sc-licht' : 'sc-sneeuw'));
    }
    g.append(mid);

    // De rand van het bad, met handdoeken erover.
    g.append(rechthoek(0, 114, B, H - 114, 'sc-near'));
    [[60, '#e8453c'], [190, '#f2a93b'], [330, '#3fb6d8'], [470, '#7cc24a'], [620, '#e05c9e'], [720, '#f4e04d']]
      .forEach(([x], i) => {
        const h = maak('rect', { x, y: 110, width: 46, height: 40, class: i % 2 ? 'sc-licht' : 'sc-pompoen' });
        g.append(h);
      });
  },

  // Een dierenpark op zondagmiddag: een haag, een hek, en net achter het
  // gaas iets groots dat wegkijkt.
  dierentuin(g) {
    const ver = maak('g');
    ver.append(rechthoek(0, 0, B, 58, 'sc-ver'));
    [[80, 22, 70], [280, 16, 54], [520, 26, 66], [690, 18, 48]].forEach(([x, y, w]) => {
      ver.append(pad(`M ${x} ${y + 12} q ${w / 4} -12 ${w / 2} 0 q ${w / 4} -9 ${w / 2} 0 Z`, 'sc-sneeuw'));
    });
    g.append(ver);

    // De giraf: een hals en een kop die boven de haag uitsteken.
    const dier = maak('g');
    dier.append(pad('M 596 128 L 604 56 q 2 -12 14 -14 l 10 -2 l 3 10 l -11 3 q -5 1 -6 7 L 610 128 Z', 'sc-mid'));
    dier.append(pad('M 620 44 l 4 -9 M 629 42 l 2 -9', 'sc-takken'));
    g.append(dier);

    // De haag en het hek.
    const mid = maak('g');
    for (let x = -10; x < B + 20; x += 40) {
      mid.append(pad(`M ${x} 126 q 20 -34 40 0 Z`, 'sc-mid'));
    }
    g.append(mid);
    g.append(rechthoek(0, 124, B, 7, 'sc-near'));
    g.append(rechthoek(0, 140, B, 7, 'sc-near'));
    for (let x = 16; x < B; x += 84) g.append(rechthoek(x, 112, 9, H - 112, 'sc-near'));
    g.append(cirkel(140, 100, 3.5, 'sc-licht'));
  },

  // Een schip in een sprong. De sterren zijn strepen geworden, er schuift
  // een planeet voorbij, en achter de motoren gloeit het spoor. Dit is wat
  // het schip van het station onderscheidt: het hangt niet, het gaat.
  ruimteschip(g) {
    sterren(g, 34, 101);
    const r = zaadje(77);
    for (let i = 0; i < 36; i++) {
      const y = r() * 128 + 4;
      const x = r() * B;
      g.append(pad(`M ${x.toFixed(1)} ${y.toFixed(1)} h ${(30 + r() * 130).toFixed(1)}`, 'sc-regenlijn'));
    }
    g.append(cirkel(690, 44, 30, 'sc-planeet'));
    g.append(pad('M 630 58 Q 690 26 752 36', 'sc-lijn'));

    const schip = maak('g');
    schip.append(pad('M 300 66 L 362 40 L 410 70 Z', 'sc-mid'));
    schip.append(pad('M 250 74 L 430 62 Q 532 60 578 76 Q 532 92 430 90 L 250 84 Z', 'sc-mid'));
    schip.append(pad('M 300 86 L 362 116 L 410 86 Z', 'sc-near'));
    schip.append(pad('M 490 68 Q 530 66 556 76 Q 530 80 490 80 Z', 'sc-near'));
    schip.append(flank('M 250 79 L 578 76 Q 532 92 430 90 L 250 84 Z'));
    g.append(schip);
    for (let x = 330; x < 470; x += 17) g.append(rechthoek(x, 74, 7, 3, 'sc-raam'));
    // Het spoor achter de motoren.
    g.append(pad('M 250 74 L 40 77 L 40 81 L 250 84 Z', 'sc-mist'));
    g.append(cirkel(250, 79, 5, 'sc-licht'));
    g.append(cirkel(250, 79, 20, 'sc-schijn'));
  },

  // Hoogstad bij avond: torens tegen een roze schemering, de helft van de
  // ramen aan, een neonbord en een metro die over het viaduct rijdt.
  stad(g) {
    sterren(g, 10, 131);
    const ver = maak('g');
    [[0, 54, 60], [70, 34, 50], [130, 60, 44], [260, 28, 56], [330, 48, 70],
     [520, 40, 48], [580, 22, 60], [650, 52, 54], [720, 36, 80]].forEach(([x, y, w]) => {
      ver.append(rechthoek(x, y, w, H - y, 'sc-ver'));
    });
    g.append(ver);

    const mid = maak('g');
    [[40, 70, 70], [180, 44, 76], [410, 30, 90], [610, 64, 84]].forEach(([x, y, w]) => {
      mid.append(rechthoek(x, y, w, H - y, 'sc-mid'));
      mid.append(flank(`M ${x + w * 0.66} ${y} L ${x + w} ${y} L ${x + w} ${H} L ${x + w * 0.66} ${H} Z`));
    });
    g.append(mid);
    ramen(mid, 52, 80, 4, 4, 14, 5);
    ramen(mid, 192, 54, 4, 6, 15, 9);
    ramen(mid, 424, 40, 5, 6, 15, 13);
    ramen(mid, 622, 74, 4, 4, 16, 2);
    // Een neonbord op de hoge toren.
    g.append(rechthoek(430, 112, 52, 8, 'sc-licht'));

    // Het viaduct met de metro erop.
    g.append(rechthoek(0, 126, B, 6, 'sc-near'));
    g.append(pad('M 120 126 L 120 112 Q 120 106 128 106 L 300 106 Q 312 106 316 116 L 318 126 Z', 'sc-near'));
    for (let x = 136; x < 300; x += 20) g.append(rechthoek(x, 110, 12, 6, 'sc-raam'));
    g.append(cirkel(312, 118, 3, 'sc-licht'));
    for (let x = 60; x < B; x += 160) g.append(rechthoek(x, 132, 8, H - 132, 'sc-near'));
  },

  // Een escaperoom van binnen: een deur met een groen uitgangsbordje, de
  // aftelklok aan de muur, een kluis, en rode lasers dwars door de kamer.
  escaperoom(g) {
    g.append(rechthoek(0, 0, B, H, 'sc-ver'));
    const mid = maak('g');
    for (let x = 0; x < B; x += 90) mid.append(rechthoek(x, 0, 2, H, 'sc-mid'));
    mid.append(rechthoek(0, 112, B, H - 112, 'sc-mid'));
    g.append(mid);

    // De deur met het bordje erboven.
    g.append(rechthoek(560, 40, 64, 76, 'sc-near'));
    g.append(cirkel(614, 82, 3, 'sc-raam'));
    g.append(rechthoek(570, 24, 44, 10, 'sc-licht'));

    // De klok: een donker vlak met rode streepjes als cijfers.
    g.append(rechthoek(250, 26, 120, 40, 'sc-near'));
    [[262, 34], [286, 34], [324, 34], [348, 34]].forEach(([x, y]) => {
      g.append(pad(`M ${x} ${y} h 12 v 12 h -12 v 12 h 12`, 'sc-lijn'));
    });
    g.append(cirkel(310, 40, 2.4, 'sc-licht'));
    g.append(cirkel(310, 52, 2.4, 'sc-licht'));

    // Een kluis en een plank met dozen.
    g.append(rechthoek(120, 74, 60, 42, 'sc-near'));
    g.append(cirkel(160, 95, 8, 'sc-mid'));
    g.append(rechthoek(680, 64, 90, 6, 'sc-near'));
    g.append(rechthoek(690, 46, 20, 18, 'sc-mid'));
    g.append(rechthoek(716, 52, 26, 12, 'sc-mid'));

    // De lasers.
    for (const [x1, x2] of [[0, 420], [180, 700], [380, 800], [-60, 260]]) {
      g.append(pad(`M ${x1} 30 L ${x2} 140`, 'sc-regenlijn'));
    }
  },

  // Een pretpark op een zonnige zaterdag: een reuzenrad, een achtbaan die
  // over de tenten heen golft, en vlaggetjes. Net als het zwembad geen
  // nacht en geen lantaarns, maar lucht en kleur.
  pretpark(g) {
    const ver = maak('g');
    ver.append(rechthoek(0, 0, B, 70, 'sc-ver'));
    [[40, 22, 60], [220, 14, 50], [430, 26, 64], [640, 16, 56]].forEach(([x, y, w]) => {
      ver.append(pad(`M ${x} ${y + 12} q ${w / 4} -12 ${w / 2} 0 q ${w / 4} -9 ${w / 2} 0 Z`, 'sc-sneeuw'));
    });
    g.append(ver);

    // Het reuzenrad.
    const rad = maak('g');
    rad.append(pad('M 600 132 L 640 70 L 680 132', 'sc-lijn'));
    rad.append(pad('M 596 70 a 44 44 0 0 1 88 0 a 44 44 0 0 1 -88 0', 'sc-lijn'));
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const x = 640 + Math.cos(a) * 44;
      const y = 70 + Math.sin(a) * 44;
      rad.append(pad(`M 640 70 L ${x.toFixed(1)} ${y.toFixed(1)}`, 'sc-lijn'));
      rad.append(rechthoek(x - 5, y, 10, 8, k % 2 ? 'sc-licht' : 'sc-pompoen'));
    }
    g.append(rad);

    // De achtbaan.
    let spoor = 'M 0 92';
    for (let x = 10; x <= 560; x += 10) spoor += ` L ${x} ${(80 + 26 * Math.sin(x / 60) + 8 * Math.sin(x / 17)).toFixed(1)}`;
    g.append(pad(spoor, 'sc-lijn'));
    for (let x = 20; x < 560; x += 34) g.append(rechthoek(x, 80 + 26 * Math.sin(x / 60), 2, 60, 'sc-mid'));

    // Tenten en vlaggetjes.
    const tent = maak('g');
    [[80, 70], [250, 60], [430, 76]].forEach(([x, b]) => {
      tent.append(pad(`M ${x} 132 L ${x + b / 2} 98 L ${x + b} 132 Z`, 'sc-mid'));
      tent.append(rechthoek(x + 4, 132, b - 8, 18, 'sc-near'));
    });
    g.append(tent);
    for (let x = 0; x < B; x += 26) {
      g.append(pad(`M ${x} 10 l 12 0 l -6 10 Z`, (x / 26) % 2 ? 'sc-licht' : 'sc-pompoen'));
    }
    g.append(rechthoek(0, 140, B, H - 140, 'sc-near'));
  },
};

// ---------------------------------------------------------------- de verf
//
// Hier stonden dertien tekeningen van platte vlakken: één kleur per
// dieptelaag, en klaar. Dat is precies waarom ze er stram uitzagen - niet
// omdat er te weinig in stond, maar omdat alles even plat was. Dezelfde
// klacht als bij het meubilair, en dezelfde oplossing: licht.
//
// Drie dingen doen het werk, en ze gelden voor alle dertien tegelijk, zodat
// er geen dertien handschriften ontstaan:
//
//   1. Elke dieptelaag krijgt een verloop in plaats van een kleur. Naar de
//      horizon toe lichter, want daar hangt de nevel. Dat is luchtperspectief
//      en het is de helft van het verschil.
//   2. Elk goudlichtje krijgt een echte gloed: een ronde uitdoving in plaats
//      van een schijf met 30% dekking. Dit gebeurt vanzelf, voor elk lichtje
//      in elke tekening - daar hoeft geen scene iets voor te doen.
//   3. Over het geheel een korrel en een vignet. Een vlak zonder korrel leest
//      als vectorwerk; met korrel leest het als iets dat geschilderd is.
//
// De kleuren zelf staan in de stylesheet, als variabelen, zodat donker en
// licht allebei kloppen zonder dat hier iets van een thema af weet.
const VERLOPEN = ['ver', 'mid', 'near', 'diep', 'grond', 'boom'];

function scenePalet() {
  let defs = document.querySelector('defs.sc-defs');
  if (defs) return defs;

  const houder = maak('svg', { class: 'sc-palet', 'aria-hidden': 'true', focusable: 'false' });
  houder.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  defs = maak('defs', { class: 'sc-defs' });

  for (const naam of VERLOPEN) {
    const grad = maak('linearGradient', { id: `sc-v-${naam}`, x1: '0', y1: '0', x2: '0', y2: '1' });
    grad.append(maak('stop', { offset: '0%', 'stop-color': `var(--sc-${naam}-top)` }));
    grad.append(maak('stop', { offset: '100%', 'stop-color': `var(--sc-${naam}-voet)` }));
    defs.append(grad);
  }

  // De gloed. Vol in het hart, en in het laatste stuk helemaal weg - een
  // gloed die aan de rand nog iets is, is een schijf.
  const gloed = maak('radialGradient', { id: 'sc-gloed' });
  gloed.append(maak('stop', { offset: '0%', 'stop-color': 'var(--sc-gloed)', 'stop-opacity': '0.75' }));
  gloed.append(maak('stop', { offset: '35%', 'stop-color': 'var(--sc-gloed)', 'stop-opacity': '0.3' }));
  gloed.append(maak('stop', { offset: '100%', 'stop-color': 'var(--sc-gloed)', 'stop-opacity': '0' }));
  defs.append(gloed);

  // Nevel op de horizon: onderin wit, naar boven weg.
  const nevel = maak('linearGradient', { id: 'sc-nevel', x1: '0', y1: '0', x2: '0', y2: '1' });
  nevel.append(maak('stop', { offset: '0%', 'stop-color': 'var(--sc-nevel)', 'stop-opacity': '0' }));
  nevel.append(maak('stop', { offset: '100%', 'stop-color': 'var(--sc-nevel)', 'stop-opacity': '0.5' }));
  defs.append(nevel);

  // Het vignet: de hoeken een tikje donkerder, zodat het midden naar voren
  // komt. Rond, niet vierkant, anders zie je de rand van het verloop.
  const vignet = maak('radialGradient', { id: 'sc-vignet' });
  vignet.append(maak('stop', { offset: '55%', 'stop-color': '#000000', 'stop-opacity': '0' }));
  vignet.append(maak('stop', { offset: '100%', 'stop-color': '#000000', 'stop-opacity': '0.22' }));
  defs.append(vignet);

  // De korrel. feTurbulence met een grove frequentie, daarna bijna helemaal
  // weggedraaid - je moet hem niet zien, je moet hem missen als hij weg is.
  const korrel = maak('filter', { id: 'sc-korrel', x: '0', y: '0', width: '100%', height: '100%' });
  korrel.append(maak('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.9', numOctaves: '3', stitchTiles: 'stitch' }));
  const grijs = maak('feColorMatrix', { type: 'matrix', values: '0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.6 0' });
  korrel.append(grijs);
  defs.append(korrel);

  houder.append(defs);
  document.body.append(houder);
  return defs;
}

// Elk lichtje krijgt zijn gloed, waar het ook staat en in welke tekening ook.
// Achter het lichtje, niet erover: anders kijk je door mist naar een lamp.
function gloedAchterLichtjes(g) {
  for (const licht of [...g.querySelectorAll('.sc-licht')]) {
    const cx = Number(licht.getAttribute('cx'));
    const cy = Number(licht.getAttribute('cy'));
    const r = Number(licht.getAttribute('r'));
    if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(r)) continue;
    const halo = maak('circle', { cx, cy, r: Math.max(r * 7, 16), fill: 'url(#sc-gloed)' });
    licht.parentNode.insertBefore(halo, licht);
  }
  // De oude platte schijf is nu dubbelop.
  for (const schijf of [...g.querySelectorAll('.sc-schijn')]) schijf.remove();
}

export function sceneVoor(wereldId, accent) {
  scenePalet();
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
  gloedAchterLichtjes(g);
  svg.append(g);

  // De wereldkleur over het geheel.
  //
  // Hiervoor zat die kleur alleen in de lucht, en waren alle dertien
  // tekeningen daaronder hetzelfde grijsblauw. Daardoor leken ze op elkaar,
  // en dat las als saai - terecht. Nu kleurt het licht de hele tekening: een
  // nachtbos is groen, een regenstad blauw, een pompoenavond oranje. Met
  // soft-light, want een dekvlak dooft de diepte die er net in zit.
  svg.append(maak('rect', { x: 0, y: 0, width: B, height: H, fill: accent, class: 'sc-tint' }));

  // Nevel over de onderste helft, dan het vignet, dan de korrel. In die
  // volgorde: nevel hoort bij de tekening, het vignet bij het beeld, en de
  // korrel ligt over allebei.
  svg.append(maak('rect', { x: 0, y: H * 0.42, width: B, height: H * 0.58, fill: 'url(#sc-nevel)' }));
  svg.append(maak('rect', { x: 0, y: 0, width: B, height: H, fill: 'url(#sc-vignet)' }));
  svg.append(maak('rect', { x: 0, y: 0, width: B, height: H, filter: 'url(#sc-korrel)', class: 'sc-korrel' }));
  return svg;
}
