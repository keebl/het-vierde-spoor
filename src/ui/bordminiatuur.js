// Een plattegrondje van een paar vierkante centimeter.
//
// Op de pagina "Begin nieuwe puzzel" stonden zes lege vakjes met een cijfer
// erin en "16 bij 16, aanname nodig" eronder. Dat is te lezen maar niet te
// zien: wie nog nooit een Reconstructie heeft gedaan weet niet of zestien
// bij zestien groot of klein is, en of een kamer een hok is of een zaal.
//
// Dit tekent het gewoon. Geen plaatje erbij, maar het ding zelf in het
// klein: een echt rooster van dat niveau, met zijn echte kamers, zijn
// meubels en één figuur. Het komt uit dezelfde motor als het bord, dus
// het kan niet iets anders laten zien dan wat je krijgt.

import { makeRng } from '../engine/rng.js';
import { bouwRooster } from '../engine/rooms.js';

const NS = 'http://www.w3.org/2000/svg';
const maak = (naam, attrs = {}) => {
  const n = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  return n;
};

export function bordminiatuur(niveau, { n, kamers, meubelDeel }) {
  const svg = maak('svg', {
    viewBox: '0 0 100 100',
    class: 'minibord',
    'aria-hidden': 'true',
    focusable: 'false',
  });

  let rooster;
  try {
    // Een vast zaad per niveau: het kaartje hoort er elke keer hetzelfde uit
    // te zien, anders is het geen aanduiding maar een lichtkrant.
    rooster = bouwRooster(n, makeRng(`mini:${niveau}`), { kamers, meubelDeel, maxMeubels: 20 });
  } catch {
    return svg;
  }

  const cel = 100 / n;
  const { kamerVan, meubelOp } = rooster;
  const op = (r, c) => r * n + c;

  svg.append(maak('rect', { x: 0, y: 0, width: 100, height: 100, class: 'mini-vloer' }));

  // De vakjeslijnen zijn dun; de muren tussen twee kamers zijn dik. Dat
  // verschil is het hele plaatje: zonder muren is het ruitjespapier.
  const dun = [];
  for (let i = 1; i < n; i++) {
    dun.push(`M${(i * cel).toFixed(2)} 0V100`, `M0 ${(i * cel).toFixed(2)}H100`);
  }
  svg.append(maak('path', { d: dun.join(''), class: 'mini-ruit' }));

  const muren = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const hier = kamerVan[op(r, c)];
      if (c + 1 < n && kamerVan[op(r, c + 1)] !== hier) {
        muren.push(`M${((c + 1) * cel).toFixed(2)} ${(r * cel).toFixed(2)}v${cel.toFixed(2)}`);
      }
      if (r + 1 < n && kamerVan[op(r + 1, c)] !== hier) {
        muren.push(`M${(c * cel).toFixed(2)} ${((r + 1) * cel).toFixed(2)}h${cel.toFixed(2)}`);
      }
    }
  }
  svg.append(maak('path', { d: muren.join(''), class: 'mini-muur' }));
  svg.append(maak('rect', { x: 0, y: 0, width: 100, height: 100, class: 'mini-muur mini-omtrek' }));

  // De meubels als blokjes, en één figuur in het goud - hetzelfde ene
  // lichtpunt dat in elke sfeertekening de boel bij elkaar houdt.
  const blokjes = [];
  let vrijVak = null;
  for (let i = 0; i < n * n; i++) {
    const r = Math.floor(i / n);
    const c = i % n;
    if (meubelOp[i] != null) {
      const m = cel * 0.26;
      blokjes.push(`M${(c * cel + m).toFixed(2)} ${(r * cel + m).toFixed(2)}h${(cel - 2 * m).toFixed(2)}v${(cel - 2 * m).toFixed(2)}h${(2 * m - cel).toFixed(2)}Z`);
    } else if (vrijVak == null && r > n / 3 && c > n / 3) {
      vrijVak = [r, c];
    }
  }
  svg.append(maak('path', { d: blokjes.join(''), class: 'mini-meubel' }));

  if (vrijVak) {
    const [r, c] = vrijVak;
    svg.append(maak('circle', {
      cx: (c * cel + cel / 2).toFixed(2),
      cy: (r * cel + cel / 2).toFixed(2),
      r: Math.max(1.6, cel * 0.3).toFixed(2),
      class: 'mini-figuur',
    }));
  }
  return svg;
}

// ------------------------------------------------------- de drie stappen
//
// Onder "Zo werkt het" stonden drie alinea's met een cijfer ervoor. Lezen
// hoe je uitsluit is iets anders dan het zien gebeuren, dus staat er nu bij
// elke stap een plaatje van diezelfde stap: de aanwijzingen, het bord
// waarop je streept, en het ene vakje dat overblijft.
const KRUISJES = [1, 2, 3, 5, 7, 8, 9, 11, 13, 14];

export function stapplaatje(stap) {
  const svg = maak('svg', {
    viewBox: '0 0 100 100',
    class: 'stapbeeld',
    'aria-hidden': 'true',
    focusable: 'false',
  });

  if (stap === 0) {
    // Drie aanwijzingen onder elkaar, de bovenste de hare.
    svg.append(maak('rect', { x: 6, y: 10, width: 88, height: 80, rx: 6, class: 'mini-vloer' }));
    const regels = [[18, 62], [30, 74], [42, 50], [54, 68], [66, 40]];
    regels.forEach(([y, w], i) => {
      svg.append(maak('rect', {
        x: 16, y, width: w, height: 6, rx: 3,
        class: i === 2 ? 'mini-figuur' : 'mini-meubel',
      }));
    });
    return svg;
  }

  const n = 4;
  const cel = 100 / n;
  svg.append(maak('rect', { x: 0, y: 0, width: 100, height: 100, class: 'mini-vloer' }));
  const dun = [];
  for (let i = 1; i < n; i++) dun.push(`M${i * cel} 0V100`, `M0 ${i * cel}H100`);
  svg.append(maak('path', { d: dun.join(''), class: 'mini-ruit' }));
  svg.append(maak('path', { d: `M50 0V100M0 50H100`, class: 'mini-muur' }));
  svg.append(maak('rect', { x: 0, y: 0, width: 100, height: 100, class: 'mini-muur mini-omtrek' }));

  // Stap twee streept weg, stap drie houdt er één over.
  const weg = stap === 1 ? KRUISJES : KRUISJES.concat([4, 6, 10, 12]);
  const kruis = [];
  for (const i of weg) {
    const r = Math.floor(i / n);
    const c = i % n;
    const x = c * cel + cel * 0.3;
    const y = r * cel + cel * 0.3;
    const d = cel * 0.4;
    kruis.push(`M${x} ${y}l${d} ${d}M${x + d} ${y}l${-d} ${d}`);
  }
  svg.append(maak('path', { d: kruis.join(''), class: 'mini-kruis' }));

  if (stap === 2) {
    svg.append(maak('circle', { cx: cel * 0.5, cy: cel * 0.5, r: cel * 0.28, class: 'mini-figuur' }));
  }
  return svg;
}
