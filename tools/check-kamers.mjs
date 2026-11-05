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
import { GESCHILDERD } from '../src/ui/meubelkunst-geschilderd.js';
import { STOFFEN } from '../src/ui/geschilderd.js';
import { RANDSTIJLEN } from '../src/ui/bordrand.js';
import { ORNAMENTEN } from '../src/ui/randornamenten.js';
import { DESSINS } from '../src/ui/board-rooms.js';
import { motievenVoor } from '../src/ui/aankleding.js';

const fouten = [];
const meld = (soort, wat) => fouten.push(`${soort.padEnd(20)}${wat}`);

// ------------------------------------------------------------ de ruimten

const plekken = new Set(WORLDS.flatMap((w) => w.places));
for (const p of plekken) if (!SOORT_VAN[p]) meld('GEEN SOORT', p);
for (const p of Object.keys(SOORT_VAN)) if (!plekken.has(p)) meld('OVERBODIG', p);
const soorten = new Set(Object.values(SOORT_VAN));
for (const s of soorten) {
  if (!VLOER_VAN[s]) meld('GEEN VLOER', s);
  const dessin = VLOER_VAN[s]?.dessin;
  if (dessin && !DESSINS.includes(dessin)) meld('DESSIN BESTAAT NIET', `${s} -> ${dessin}`);
  // Een ruimte zonder aankleding ziet er kaal uit; dat is precies de klacht
  // waar de motieven voor zijn.
  const motieven = motievenVoor(s);
  if (!motieven.length) meld('GEEN AANKLEDING', s);
  // Bijna elk vrij vakje krijgt iets. Met drie motieven zie je dan drie keer
  // hetzelfde kleed onder elkaar, en dat leest als behang in plaats van als
  // een kamer - precies de klacht waar deze ronde over ging.
  if (motieven.length && motieven.length < 6) {
    meld('TE WEINIG AANKLEDING', `${s}: ${motieven.length} motieven, minstens 6`);
  }
  for (const m of motieven) {
    if (typeof m !== 'function') meld('AANKLEDING GEEN TEKENING', s);
  }
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
  if (!GESCHILDERD[sleutel]) meld('GEEN GESCHILDERDE TEKENING', `${soort}/${naam} -> ${sleutel}`);
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
for (const sleutel of Object.keys(GESCHILDERD)) {
  if (!sleutels.has(sleutel)) meld('GESCHILDERDE TEKENING ONGEBRUIKT', sleutel);
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
      case 'Q':
      case 'S':
        for (let i = 0; i + 3 < g.length; i += 4) {
          raak(rel ? x + g[i] : g[i], rel ? y + g[i + 1] : g[i + 1]);
          x = rel ? x + g[i + 2] : g[i + 2];
          y = rel ? y + g[i + 3] : g[i + 3];
          raak(x, y);
        }
        break;
      case 'T':
        for (let i = 0; i + 1 < g.length; i += 2) {
          x = rel ? x + g[i] : g[i];
          y = rel ? y + g[i + 1] : g[i + 1];
          raak(x, y);
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

// Dezelfde regels gelden voor beide sets: de oude tekeningen (nog in gebruik
// op de vergelijkpagina) en de geschilderde (die op het bord staan). Wat de
// toets per onderdeel wil weten is steeds hetzelfde: een gevuld pad sluit een
// vlak, een lijn is open, het past in het vierkant, en het meubelstuk staat
// op de vloer.
function keurTekening(label, delen) {
  let laagste = -Infinity;
  let hoogste = Infinity;
  let links = Infinity;
  let rechts = -Infinity;
  for (const { d, lijn, stof, kleur } of delen) {
    const gesloten = /[Zz]\s*$/.test(d);
    if (lijn) {
      if (gesloten) meld('LIJN IS DICHT', `${label}: ${d}`);
    } else if (!gesloten) {
      // Een open pad met een vulling tekent niets of bijna niets. Zo was de
      // waterput zijn dak kwijt en de vleugel zijn poten.
      meld('VULLING ZONDER VLAK', `${label}: ${d}`);
    }
    // Een boog die op zijn eigen beginpunt eindigt: dan is uit de code niet
    // te zien naar welke kant de cirkel valt (en dus ook niet of het
    // meubelstuk op de vloer staat). Twee halve bogen wel.
    for (const [dx, dy] of boogStappen(d)) {
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) meld('CIRKELTRUC', `${label}: ${d}`);
    }
    if (kleur != null && !/^#[0-9a-f]{6}$/i.test(kleur)) meld('RARE KLEUR', `${label}: ${kleur}`);
    // Een materiaal dat niet bestaat valt stil terug op hout, en dan sta je
    // naar een koperen ketel te kijken die van hout is.
    if (stof != null && !STOFFEN[stof]) meld('MATERIAAL BESTAAT NIET', `${label}: ${stof}`);
    const b = omhulsel(d);
    laagste = Math.max(laagste, b.maxY);
    hoogste = Math.min(hoogste, b.minY);
    links = Math.min(links, b.minX);
    rechts = Math.max(rechts, b.maxX);
    if (b.minX < -1 || b.minY < -1 || b.maxX > 49 || b.maxY > 49) {
      meld('BUITEN HET VAKJE', `${label}: ${d} (${Math.round(b.minX)},${Math.round(b.minY)} - ${Math.round(b.maxX)},${Math.round(b.maxY)})`);
    }
  }
  // Een meubelstuk staat op de vloer. Zweeft het, dan is dat op het bord
  // meteen te zien - zo is het zwevende bed gevonden.
  if (laagste < 36) meld('ZWEEFT', `${label}: onderkant op ${Math.round(laagste)} van 48`);
  if (rechts - links < 14) meld('TE SMAL', `${label}: ${Math.round(rechts - links)} breed`);
  if (laagste - hoogste < 14) meld('TE PLAT', `${label}: ${Math.round(laagste - hoogste)} hoog`);
  if (delen.length < 3) meld('TE KAAL', `${label}: ${delen.length} onderdelen`);
  // Precies één onderdeel raakt de grond. Nul betekent dat er geen
  // contactschaduw staat en het ding zweeft; meer dan één is modder.
  const staan = delen.filter((o) => o.grond).length;
  if (delen.some((o) => 'grond' in o) || delen.some((o) => o.stof)) {
    if (staan === 0) meld('GEEN CONTACT', label);
    if (staan > 1) meld('TE VEEL CONTACT', `${label}: ${staan} onderdelen op de grond`);
  }
}

for (const [sleutel, delen] of Object.entries(MEUBELKUNST)) {
  keurTekening(`oud/${sleutel}`, delen.map(([d, kleur, soort]) => ({ d, kleur, lijn: soort === 'lijn' })));
}
for (const [sleutel, delen] of Object.entries(GESCHILDERD)) {
  keurTekening(sleutel, delen);
}

// ------------------------------------------------- de lijst om het bord

// Elke wereld hoort zijn eigen lijst te hebben. Valt een wereld erbuiten, dan
// krijgt hij stilzwijgend de houten standaardlijst en ziet een ruimtestation
// eruit als een landhuis - precies het soort fout dat niemand meldt omdat het
// er niet kapot uitziet, alleen verkeerd.
for (const w of WORLDS) {
  if (!RANDSTIJLEN[w.id]) meld('GEEN BORDRAND', w.id);
}
for (const id of Object.keys(RANDSTIJLEN)) {
  if (!WORLDS.some((w) => w.id === id)) meld('BORDRAND ONGEBRUIKT', id);
}
for (const [id, stijl] of Object.entries(RANDSTIJLEN)) {
  for (const sleutel of ['kern', 'koel', 'warm']) {
    if (!/^#[0-9a-f]{6}$/i.test(stijl[sleutel] ?? '')) meld('RANDKLEUR RAAR', `${id}.${sleutel}`);
  }
  if (stijl.textuur && !['nerf', 'korrel', 'weefsel', 'strijk', 'vezel'].includes(stijl.textuur)) {
    meld('RANDTEXTUUR BESTAAT NIET', `${id}: ${stijl.textuur}`);
  }
  if (typeof stijl.motief !== 'function') meld('RAND ZONDER MOTIEF', id);
  if (!(stijl.stap > 12)) meld('RANDSTAP TE KLEIN', `${id}: ${stijl.stap}`);
  // Een lijst hoort donkerder te zijn dan het speelveld: hij vat het bord in.
  // De eerste poging was een fel groene band die harder riep dan de kamers.
  const helder = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return (((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255;
  };
  // 0.40: de steenband van de grafkelder stond op 0.415 en viel samen met
  // de vloeren erbinnen. De lichtste die wel werkt is het staal van het
  // ruimtestation, op 0.355.
  if (helder(stijl.kern) > 0.4) meld('RAND TE LICHT', `${id}: ${stijl.kern}`);
  keurOrnament(`rand/${id}`, stijl.hoek ?? []);

  // Wat er op de lijst hangt en staat. Een wereld zonder ornamenten heeft
  // weer een kale rand, en dat was precies de klacht.
  const dingen = ORNAMENTEN[id] ?? [];
  if (dingen.length < 4) meld('TE WEINIG OP DE RAND', `${id}: ${dingen.length}`);
  // Alles aan één kant is geen rand die leeft maar een rij.
  const kanten = new Set(dingen.map((d) => d.kant));
  if (dingen.length && kanten.size < 3) {
    meld('RAND EENZIJDIG', `${id}: alleen ${[...kanten].join(', ')}`);
  }
  dingen.forEach((d, i) => {
    const label = `rand/${id}#${i}`;
    if (!['boven', 'onder', 'links', 'rechts'].includes(d.kant)) meld('RANDKANT RAAR', `${label}: ${d.kant}`);
    if (!(d.t > 0.02 && d.t < 0.98)) meld('RANDPLEK RAAR', `${label}: t=${d.t}`);
    if (!(d.maat >= 30 && d.maat <= 130)) meld('RANDMAAT RAAR', `${label}: ${d.maat}`);
    // Steekt het verder naar binnen dan een halve cel, dan staat het niet op
    // de rand maar op het speelveld.
    const naarBinnen = d.maat - 24 - (d.uit ?? Math.round(d.maat * 0.3));
    if (naarBinnen > 56) meld('RAND HANGT TE VER OVER', `${label}: ${Math.round(naarBinnen)}`);
    if (naarBinnen < 0) meld('RAND HANGT ER NAAST', `${label}: ${Math.round(naarBinnen)}`);
    keurOrnament(label, d.delen ?? []);
  });
}

// Een hoekornament volgt dezelfde regels als een meubelstuk, op één na: het
// staat niet op een vloer, dus de eis "onderkant onderin het vierkant" geldt
// er niet voor.
function keurOrnament(label, delen) {
  if (delen.length < 3) meld('HOEK TE KAAL', `${label}: ${delen.length} onderdelen`);
  let staan = 0;
  for (const { d, lijn, stof, grond } of delen) {
    if (grond) staan++;
    if (!lijn && !/[Zz]\s*$/.test(d)) meld('HOEK ZONDER VLAK', `${label}: ${d}`);
    if (stof != null && !STOFFEN[stof]) meld('HOEK MATERIAAL BESTAAT NIET', `${label}: ${stof}`);
    const b = omhulsel(d);
    if (b.minX < -1 || b.minY < -1 || b.maxX > 49 || b.maxY > 49) {
      meld('HOEK BUITEN HET VAKJE', `${label}: ${d}`);
    }
  }
  // Een hoekstuk staat ergens op; een hangplant hangt. Nul mag dus, twee niet.
  if (staan > 1) meld('HOEK CONTACT', `${label}: ${staan} onderdelen op de grond`);
}

console.log('');
console.log(`plekken            ${plekken.size}, allemaal met een soort`);
console.log(`soorten ruimte     ${soorten.size}, elk met vloer en meubilair`);
console.log(`meubelstukken      ${paren.length} namen, ${Object.keys(MEUBELKUNST).length} eigen tekeningen`);
const opDeRand = Object.values(ORNAMENTEN).reduce((a, l) => a + l.length, 0);
console.log(`bordranden         ${Object.keys(RANDSTIJLEN).length}, één per wereld, met ${opDeRand} dingen erop`);

if (fouten.length) {
  console.log('');
  for (const f of fouten) console.log(f);
  console.log(`\n${fouten.length} FOUTEN`);
  process.exit(1);
}
console.log('\nelke ruimte weet wat hij is, elk meubelstuk heeft zijn eigen tekening,\nen elke wereld zijn eigen lijst om het bord');
