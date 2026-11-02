// Elke plek moet weten wat voor soort ruimte het is, en elk meubelstuk moet
// een eigen tekening hebben die ook echt iets tekent.
//
// Zonder deze toets krijgt een nieuwe plek stilzwijgend een standaardvloer en
// willekeurig meubilair, en - erger - kan een meubelstuk het plaatje van een
// ander lenen. Dan ziet een aanrecht uit als een tafel en een slijpsteen als
// een touwhaspel. Dat is precies het soort fout dat een puzzelaar meteen ziet
// en wij niet, dus hij staat hier zwart op wit.

import { WORLDS } from '../src/content/worlds.js';
import { SOORT_VAN, VLOER_VAN, MEUBELS_VAN } from '../src/content/kamersoorten.js';
import { MEUBELKUNST } from '../src/ui/meubelkunst.js';

const fouten = [];
const meld = (soort, wat) => fouten.push(`${soort.padEnd(20)}${wat}`);

// ------------------------------------------------------------ de ruimten

const plekken = new Set(WORLDS.flatMap((w) => w.places));
for (const p of plekken) if (!SOORT_VAN[p]) meld('GEEN SOORT', p);
for (const p of Object.keys(SOORT_VAN)) if (!plekken.has(p)) meld('OVERBODIG', p);
const soorten = new Set(Object.values(SOORT_VAN));
for (const s of soorten) {
  if (!VLOER_VAN[s]) meld('GEEN VLOER', s);
  if (!MEUBELS_VAN[s]?.length) meld('GEEN MEUBELS', s);
  if (MEUBELS_VAN[s] && MEUBELS_VAN[s].length < 4) meld('TE WEINIG MEUBELS', s);
}

// --------------------------------------------- naam, tekening, een-op-een

const paren = Object.entries(MEUBELS_VAN).flatMap(([soort, lijst]) =>
  lijst.map(([naam, sleutel]) => ({ soort, naam, sleutel })));

const namen = new Map();
const sleutels = new Map();
for (const { soort, naam, sleutel } of paren) {
  if (!MEUBELKUNST[sleutel]) meld('GEEN TEKENING', `${soort}/${naam} -> ${sleutel}`);
  if (namen.has(naam) && namen.get(naam) !== sleutel) {
    meld('NAAM TWEE KEER', `${naam} (${namen.get(naam)} en ${sleutel})`);
  }
  namen.set(naam, sleutel);
  if (sleutels.has(sleutel) && sleutels.get(sleutel) !== naam) {
    meld('TEKENING GELEEND', `${sleutel}: ${sleutels.get(sleutel)} en ${naam}`);
  }
  sleutels.set(sleutel, naam);
}
for (const sleutel of Object.keys(MEUBELKUNST)) {
  if (!sleutels.has(sleutel)) meld('TEKENING ONGEBRUIKT', sleutel);
}

// ------------------------------------------------- en tekent de tekening iets?

// Een pad uitlezen tot op zijn omhullende rechthoek. Genoeg om te zien of
// een meubelstuk op de vloer staat, of het in het vierkant past, en of een
// gevuld pad wel een vlak omsluit.
function omhulsel(d) {
  const stukken = d.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g) ?? [];
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const raak = (px, py) => {
    minX = Math.min(minX, px); maxX = Math.max(maxX, px);
    minY = Math.min(minY, py); maxY = Math.max(maxY, py);
  };
  for (const stuk of stukken) {
    const cmd = stuk[0];
    const g = (stuk.slice(1).match(/-?\d*\.?\d+(?:e-?\d+)?/g) ?? []).map(Number);
    const rel = cmd === cmd.toLowerCase();
    switch (cmd.toUpperCase()) {
      case 'M':
        for (let i = 0; i + 1 < g.length; i += 2) {
          x = rel ? x + g[i] : g[i];
          y = rel ? y + g[i + 1] : g[i + 1];
          if (i === 0) { sx = x; sy = y; }
          raak(x, y);
        }
        break;
      case 'L':
        for (let i = 0; i + 1 < g.length; i += 2) {
          x = rel ? x + g[i] : g[i];
          y = rel ? y + g[i + 1] : g[i + 1];
          raak(x, y);
        }
        break;
      case 'H':
        for (const v of g) { x = rel ? x + v : v; raak(x, y); }
        break;
      case 'V':
        for (const v of g) { y = rel ? y + v : v; raak(x, y); }
        break;
      case 'C':
        for (let i = 0; i + 5 < g.length; i += 6) {
          for (let k = 0; k < 6; k += 2) {
            raak(rel ? x + g[i + k] : g[i + k], rel ? y + g[i + k + 1] : g[i + k + 1]);
          }
          x = rel ? x + g[i + 4] : g[i + 4];
          y = rel ? y + g[i + 5] : g[i + 5];
        }
        break;
      case 'A':
        for (let i = 0; i + 6 < g.length; i += 7) {
          const rx = Math.abs(g[i]);
          const ry = Math.abs(g[i + 1]);
          const ex = rel ? x + g[i + 5] : g[i + 5];
          const ey = rel ? y + g[i + 6] : g[i + 6];
          // Een boog kan buiten zijn eindpunten uitlopen: reken de koorde
          // plus de radiussen mee, dan is de omhullende nooit te klein.
          const mx = (x + ex) / 2;
          const my = (y + ey) / 2;
          raak(mx - rx, my - ry);
          raak(mx + rx, my + ry);
          x = ex;
          y = ey;
          raak(x, y);
        }
        break;
      case 'Z':
        x = sx;
        y = sy;
        break;
      default:
        break;
    }
  }
  return { minX, minY, maxX, maxY };
}

// De verplaatsing van elke boog in een pad. Een boog die nergens heen gaat,
// eindigt op zijn eigen beginpunt.
function boogStappen(d) {
  const uit = [];
  for (const stuk of d.match(/[Aa][^A-Za-z]*/g) ?? []) {
    const g = (stuk.slice(1).match(/-?\d*\.?\d+/g) ?? []).map(Number);
    for (let i = 0; i + 6 < g.length; i += 7) uit.push([g[i + 5], g[i + 6]]);
  }
  return uit;
}

for (const [sleutel, delen] of Object.entries(MEUBELKUNST)) {
  let laagste = -Infinity;
  let hoogste = Infinity;
  let links = Infinity;
  let rechts = -Infinity;
  for (const [d, kleur, soort] of delen) {
    const gesloten = /[Zz]\s*$/.test(d);
    if (soort === 'lijn') {
      if (gesloten) meld('LIJN IS DICHT', `${sleutel}: ${d}`);
    } else if (!gesloten) {
      // Een open pad met een vulling tekent niets of bijna niets. Zo was de
      // waterput zijn dak kwijt en de vleugel zijn poten.
      meld('VULLING ZONDER VLAK', `${sleutel}: ${d}`);
    }
    // Een boog die op zijn eigen beginpunt eindigt: dan is uit de code niet
    // te zien naar welke kant de cirkel valt (en dus ook niet of het
    // meubelstuk op de vloer staat). Twee halve bogen wel.
    for (const [dx, dy] of boogStappen(d)) {
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) meld('CIRKELTRUC', `${sleutel}: ${d}`);
    }
    if (!/^#[0-9a-f]{6}$/i.test(kleur)) meld('RARE KLEUR', `${sleutel}: ${kleur}`);
    const b = omhulsel(d);
    laagste = Math.max(laagste, b.maxY);
    hoogste = Math.min(hoogste, b.minY);
    links = Math.min(links, b.minX);
    rechts = Math.max(rechts, b.maxX);
    if (b.minX < -1 || b.minY < -1 || b.maxX > 49 || b.maxY > 49) {
      meld('BUITEN HET VAKJE', `${sleutel}: ${d} (${Math.round(b.minX)},${Math.round(b.minY)} - ${Math.round(b.maxX)},${Math.round(b.maxY)})`);
    }
  }
  // Een meubelstuk staat op de vloer. Zweeft het, dan is dat op het bord
  // meteen te zien - zo is het zwevende bed gevonden.
  if (laagste < 36) meld('ZWEEFT', `${sleutel}: onderkant op ${Math.round(laagste)} van 48`);
  if (rechts - links < 14) meld('TE SMAL', `${sleutel}: ${Math.round(rechts - links)} breed`);
  if (laagste - hoogste < 14) meld('TE PLAT', `${sleutel}: ${Math.round(laagste - hoogste)} hoog`);
  if (delen.length < 3) meld('TE KAAL', `${sleutel}: ${delen.length} onderdelen`);
}

console.log('');
console.log(`plekken            ${plekken.size}, allemaal met een soort`);
console.log(`soorten ruimte     ${soorten.size}, elk met vloer en meubilair`);
console.log(`meubelstukken      ${paren.length} namen, ${Object.keys(MEUBELKUNST).length} eigen tekeningen`);

if (fouten.length) {
  console.log('');
  for (const f of fouten) console.log(f);
  console.log(`\n${fouten.length} FOUTEN`);
  process.exit(1);
}
console.log('\nelke ruimte weet wat hij is, elk meubelstuk heeft zijn eigen tekening');
