// Elke plek moet weten wat voor soort ruimte het is, en elk meubelstuk moet
// een eigen tekening hebben die ook echt iets tekent.
//
// Zonder deze toets krijgt een nieuwe plek stilzwijgend een standaardvloer en
// willekeurig meubilair, en - erger - kan een meubelstuk het plaatje van een
// ander lenen. Dan ziet een aanrecht uit als een tafel en een slijpsteen als
// een touwhaspel. Dat is precies het soort fout dat een puzzelaar meteen ziet
// en wij niet, dus hij staat hier zwart op wit.

import { WORLDS } from '../src/content/worlds.js';
import {
  SOORT_VAN, VLOER_VAN, VLOER_VAN_PLEK, MEUBELS_VAN, VERWANTE_SOORTEN,
  WERELDMEUBELS, WERELDVERWANT, WERELDVLOER, meubelsVoor, soortVan,
} from '../src/content/kamersoorten.js';
import { GESLACHT_VAN } from '../src/content/namen.js';
import { readFileSync } from 'node:fs';
import { MEUBELKUNST } from '../src/ui/meubelkunst.js';
import { GESCHILDERD } from '../src/ui/meubelkunst-geschilderd.js';
import { STOFFEN } from '../src/ui/geschilderd.js';
import { RANDSTIJLEN } from '../src/ui/bordrand.js';
import { DESSINS } from '../src/ui/board-rooms.js';
import { motievenVoor } from '../src/ui/aankleding.js';

const fouten = [];
const meld = (soort, wat) => fouten.push(`${soort.padEnd(20)}${wat}`);

// ------------------------------------------------------------ de ruimten

// plekkenXL zijn de kamers die pas meedoen op het bord van zestien bij
// zestien. Ze staan apart in de wereld omdat ze de bestaande puzzels niet
// mogen verschuiven, maar een soort ruimte hebben ze net zo hard nodig.
const plekken = new Set(WORLDS.flatMap((w) => [...w.places, ...(w.plekkenXL ?? [])]));
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

// ---------------------------------------- en wat deze wereld het noemt
//
// Een wereld mag het meubilair omdopen en hertekenen (WERELDMEUBELS). Daar
// gaat precies hetzelfde in mis als in de basislijst, maar een laag diep:
// twee namen die dezelfde tekening lenen, een tekening die niet bestaat, een
// naam die ook een kamer is. En het geniepigste: een naam die blijft staan
// omdat niemand aan de uitwijkroute dacht - zo stond er een eikenhouten vat
// op het ruimtestation. Daarom rekent deze toets per wereld na welke namen
// er kunnen opduiken, en eist hij van een wereld met `volledig: true` dat hij
// er allemaal een antwoord op heeft.
const gebruikteSleutels = new Set(sleutels.keys());
let wereldenMetLaag = 0;

for (const w of WORLDS) {
  const laag = WERELDMEUBELS[w.id];
  const kamers = new Set([...w.places, ...(w.plekkenXL ?? [])]);
  // De soorten ruimte die in deze wereld echt op het bord komen, plus de
  // soorten waar hun meubilair naar uitwijkt als het opraakt.
  const eigen = new Set([...kamers].map(soortVan));
  const bereik = new Set(eigen);
  for (const s of eigen) {
    for (const v of (WERELDVERWANT[w.id]?.[s] ?? VERWANTE_SOORTEN[s] ?? [])) bereik.add(v);
  }
  const basisnamen = new Set([...bereik].flatMap((s) => (MEUBELS_VAN[s] ?? []).map(([naam]) => naam)));

  const perNaam = new Map();
  const perSleutel = new Map();
  for (const s of bereik) {
    for (const [naam, sleutel] of meubelsVoor(s, w.id).flat()) {
      gebruikteSleutels.add(sleutel);
      if (!GESCHILDERD[sleutel]) meld('GEEN TEKENING IN WERELD', `${w.id}/${naam} -> ${sleutel}`);
      if (kamers.has(naam)) meld('MEUBEL HEET ALS EEN KAMER', `${w.id}: ${naam}`);
      if (perNaam.has(naam) && perNaam.get(naam) !== sleutel) {
        meld('NAAM TWEE KEER', `${w.id}: ${naam}`);
      }
      perNaam.set(naam, sleutel);
      if (perSleutel.has(sleutel) && perSleutel.get(sleutel) !== naam) {
        meld('TEKENING GELEEND', `${w.id}/${sleutel}: ${perSleutel.get(sleutel)} en ${naam}`);
      }
      perSleutel.set(sleutel, naam);
    }
  }

  if (!laag) continue;
  wereldenMetLaag++;
  const gedekt = new Set([...(laag.zelfde ?? []), ...Object.keys(laag.anders ?? {})]);
  for (const naam of gedekt) {
    if (!basisnamen.has(naam)) meld('OMDOPEN OVERBODIG', `${w.id}: ${naam} komt hier niet voor`);
  }
  // Een naam kan niet twee keer in de laag staan: dan is niet te zien welke
  // van de twee regels wint.
  for (const naam of (laag.zelfde ?? [])) {
    if (laag.anders?.[naam]) meld('TWEE KEER IN DE LAAG', `${w.id}: ${naam}`);
  }
  if (laag.volledig) {
    for (const naam of basisnamen) {
      if (!gedekt.has(naam)) meld('NIET OMGEDOOPT', `${w.id}: ${naam} kan hier opduiken`);
    }
  }
}

for (const sleutel of Object.keys(GESCHILDERD)) {
  if (!gebruikteSleutels.has(sleutel)) meld('GESCHILDERDE TEKENING ONGEBRUIKT', sleutel);
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
  if (typeof stijl.verf !== 'function') meld('RAND ZONDER SCHILDERING', id);
  if (!/^#[0-9a-f]{6}$/i.test(stijl.gloed ?? '')) meld('RAND ZONDER LICHT', id);
  if (!(stijl.stap > 12)) meld('RANDSTAP TE KLEIN', `${id}: ${stijl.stap}`);
  const helder = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return (((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) / 255;
  };
  // Een band is nacht óf dag, en allebei hebben hun eigen eis.
  //
  // NACHT. De band is donker en het licht erop is het onderwerp: elke
  // lantaarn is een warme kern met een halo. Dat werkt alleen tegen
  // donker, want een gloed is licht dat erbij opgeteld wordt en op een
  // lichte ondergrond telt er niets bij op - een lantaarn op beige is een
  // gele vlek. De grens lag eerst op 0.40 en toen zag elke rand eruit als
  // een plank met een lampje. De lichtste die nog werkt is de lambrisering
  // van het landhuis, op 0.084.
  //
  // DAG. Een zwembad in juli is geen nacht, en die werelden kwamen er
  // onder de oude regel niet in. Bij daglicht komt de diepte niet uit
  // gloed maar uit schaduw: een lichte band moet dus licht genoeg zijn om
  // als daglicht te lezen, én een schaduwkleur hebben die donker genoeg is
  // om vorm te geven. Zonder dat tweede is het een vlak pastelvlak.
  if (stijl.dag) {
    if (helder(stijl.kern) < 0.5) meld('DAGRAND TE DONKER', `${id}: ${stijl.kern}`);
    if (helder(stijl.koel ?? '#ffffff') > 0.3) {
      meld('DAGRAND ZONDER SCHADUW', `${id}: ${stijl.koel}`);
    }
  } else {
    if (helder(stijl.kern) > 0.14) meld('RAND TE LICHT', `${id}: ${stijl.kern}`);
    // En het licht dat erop valt moet wel warm of fel zijn, anders is er
    // niets om naar te kijken.
    if (helder(stijl.gloed ?? '#000000') < 0.3) meld('RANDLICHT TE FLAUW', `${id}: ${stijl.gloed}`);
  }
}

// ------------------------------------------- namen die op elkaar lijken
//
// "Ada stond naast de provisiekast" en "Bram stond niet naast de vaatkast"
// staan in dezelfde puzzel, en dan lees je de tweede als de eerste. Er
// stonden in één keuken drie kasten; in een laboratorium twee bakken.
//
// De regel: van twee meubelstukken die in dezelfde puzzel naast elkaar
// kunnen staan, mag er maar één op hetzelfde woord eindigen. Alleen namen
// uit één woord tellen mee - "de stapel kratten" en "de omgevallen stam"
// verwar je niet met iets anders, hoe ze ook eindigen.
//
// "In dezelfde puzzel" is eng bedoeld: de meubels van één soort ruimte plus
// de soorten waar die naar uitwijkt, in die ene wereld. Verder reikt het
// niet, en een regel die verder reikt dan de fout zou alleen maar namen
// kosten.
const ACHTERVOEGSELS = [
  'bankje', 'kastje', 'kast', 'kist', 'bak', 'rek', 'tafel', 'ton', 'stoel',
  'bank', 'steen', 'plaat', 'zuil', 'spiegel', 'lessenaar', 'kabinet', 'klok',
  'kaart', 'console', 'meter', 'bol', 'standaard', 'paneel', 'stelling',
  'haspel', 'ketel', 'schaal', 'pot', 'nis', 'vat',
].sort((a, b) => b.length - a.length);

const achtervoegselVan = (naam) => {
  const kern = naam.replace(/^(de|het) /, '');
  if (kern.includes(' ')) return null;
  return ACHTERVOEGSELS.find((suf) => kern.endsWith(suf)) ?? null;
};

for (const w of WORLDS) {
  const eigenSoorten = new Set([...w.places, ...(w.plekkenXL ?? [])].map(soortVan));
  for (const soort of eigenSoorten) {
    const perSuffix = new Map();
    for (const [naam] of meubelsVoor(soort, w.id).flat()) {
      const suf = achtervoegselVan(naam);
      if (!suf) continue;
      if (!perSuffix.has(suf)) perSuffix.set(suf, new Set());
      perSuffix.get(suf).add(naam);
    }
    for (const [suf, namen] of perSuffix) {
      if (namen.size < 2) continue;
      meld('NAMEN LIJKEN OP ELKAAR', `${w.id}/${soort} -${suf}: ${[...namen].sort().join(' + ')}`);
    }
  }
}

// ------------------------------------- genoeg namen voor een vol bord
//
// De namen worden per soort ruimte uitgedeeld en elke naam wordt maar één
// keer gebruikt. Legt een bord toevallig veel meubels in ruimtes van één
// soort, dan raakt die soort door zijn namen heen en valt de puzzel om.
// buildKamerPuzzle vraagt daarom nooit meer meubels dan de krapste soort
// in die wereld kan leveren - maar daar moet wel iets zinnigs uitkomen.
// Onder de tien wordt een bord kaal.
for (const w of WORLDS) {
  const soortenHier = new Set([...w.places, ...(w.plekkenXL ?? [])].map(soortVan));
  for (const s of soortenHier) {
    const hoeveel = meubelsVoor(s, w.id).flat().length;
    if (hoeveel < 10) meld('TE WEINIG MEUBELNAMEN', `${w.id}/${s}: ${hoeveel}`);
  }
}

// ---------------------------------------- bij elke naam hoort een portret
//
// De koppen op het bord werden getekend uit het volgnummer van een figuur,
// en dat weet niets van de naam die eroverheen komt: Anouk kreeg een volle
// baard. Sinds GESLACHT_VAN bepaalt de naam welk kapsel en welk
// gezichtshaar passen - maar alleen voor namen die daar in staan. Een naam
// die er niet in staat valt stilzwijgend terug op 'm', en dan is de fout
// terug zonder dat iemand het merkt.
const alleNamen = new Set();
for (const w of WORLDS) {
  for (const veld of ['persons', 'personenXL', 'personenExtra', 'slachtoffers']) {
    for (const naam of (w[veld] ?? [])) alleNamen.add(naam);
  }
}
for (const naam of alleNamen) {
  if (!GESLACHT_VAN[naam]) meld('NAAM ZONDER PORTRET', naam);
}
// Elke wereld moet een rol hebben voor allebei, anders valt het
// slachtoffer terug op de oude lijst en staat er weer een buurman die
// Marieke heet.
for (const w of WORLDS) {
  for (const soort of ['m', 'v']) {
    if (!(w.rollen?.[soort] ?? []).length) meld('GEEN ROL', `${w.id}: niets voor '${soort}'`);
  }
}

for (const naam of Object.keys(GESLACHT_VAN)) {
  if (!alleNamen.has(naam)) meld('PORTRET ZONDER NAAM', `${naam} staat in geen enkele wereld`);
  if (!['m', 'v'].includes(GESLACHT_VAN[naam])) meld('RAAR PORTRET', `${naam}: ${GESLACHT_VAN[naam]}`);
}

// ------------------------------------------ de naam is een belofte
//
// Een besneeuwde tuin met groen gras erin. Een serre met een kampvuur, een
// omgevallen stam en een vogelverschrikker. Een schoolplein van gras. Dat
// kwam allemaal uit dezelfde bron: de soort van een kamer bepaalt de vloer
// én het meubilair, en er waren elf soorten voor 129 kamers. `buiten`
// moest een open plek in een bos, een nat steegje, een besneeuwde tuin en
// een glazen serre tegelijk zijn.
//
// Deze regel zegt: wat in de naam van een kamer staat, moet kloppen met
// wat je eronder ziet liggen en met wat erin kan staan. Hij kent maar een
// handvol woorden, en dat is genoeg - het zijn precies de woorden waarmee
// een kamernaam iets belooft over de grond. Zet iemand er een kamer bij
// die "besneeuwd" heet, dan valt deze toets erover voordat er iemand naar
// kijkt.
const BELOFTEN = [
  {
    woorden: ['besneeuw', 'sneeuw'],
    dessin: ['sneeuw'],
    nooit: [],
    uitleg: 'sneeuw, geen gras',
  },
  {
    woorden: ['serre', 'orangerie', 'wintertuin'],
    dessin: ['tegels', 'planken'],
    // Een serre is binnen. Alles uit MEUBELS_VAN.buiten hoort er dus niet.
    nooit: MEUBELS_VAN.buiten.map(([n]) => n),
    uitleg: 'binnen, dus tegels of planken en niets van buiten',
  },
  {
    woorden: ['plein', 'terras', 'binnenplaats', 'steeg'],
    dessin: ['bestrating', 'sneeuw', 'steen', 'tegels'],
    nooit: [],
    uitleg: 'bestrating, geen gras',
  },
  {
    woorden: ['zolder'],
    dessin: ['planken', 'planken-dwars', 'tapijt'],
    nooit: [],
    uitleg: 'planken: een zolder is geen kelder',
  },
  {
    woorden: ['veranda'],
    dessin: ['planken', 'bestrating'],
    nooit: [],
    uitleg: 'een vlonder of tegels, geen gazon',
  },
  {
    woorden: ['gymzaal'],
    dessin: ['planken'],
    nooit: [],
    uitleg: 'een gymvloer is van hout',
  },
];

const wereldVanPlek = new Map();
for (const w of WORLDS) {
  for (const plek of [...w.places, ...(w.plekkenXL ?? [])]) wereldVanPlek.set(plek, w.id);
}

for (const [plek, wereldId] of wereldVanPlek) {
  const soort = soortVan(plek);
  const basis = VLOER_VAN[soort] ?? VLOER_VAN.zaal;
  const wv = WERELDVLOER[wereldId];
  // Dezelfde volgorde als op het bord: eerst de plek zelf, dan de wereld,
  // dan de soort. Zie vloerVan in board-rooms.js.
  const dessin = VLOER_VAN_PLEK[plek]?.dessin ?? wv?.dessin?.[basis.dessin] ?? basis.dessin;
  const kan = meubelsVoor(soort, wereldId).flat().map(([n]) => n);

  for (const b of BELOFTEN) {
    if (!b.woorden.some((woord) => plek.toLowerCase().includes(woord))) continue;
    if (!b.dessin.includes(dessin)) {
      meld('NAAM BELOOFT ANDERS', `${wereldId}/${plek}: vloer is "${dessin}", ${b.uitleg}`);
    }
    const mis = b.nooit.filter((m) => kan.includes(m));
    if (mis.length) {
      meld('STAAT ER NIET THUIS', `${wereldId}/${plek}: ${mis.slice(0, 4).join(', ')}${mis.length > 4 ? ` (+${mis.length - 4})` : ''}`);
    }
  }
}

// ------------------------------------------------- een bad is geen gazon
//
// De drie baden stonden te boek als `buiten`, net als de ligweide. Hun vloer
// was wel apart geregeld, maar hun meubilair kwam van het gazon: er stond een
// plantenbak midden in het ondiepe bad, en een barbecue kon er net zo goed
// staan. Soort `bad` lost dat op - en deze regel zorgt dat een volgend bad
// hem ook krijgt, in plaats van opnieuw bij `buiten` te belanden.
for (const [plek, wereldId] of wereldVanPlek) {
  if (!/bad$/.test(plek.toLowerCase())) continue;
  const s = soortVan(plek);
  if (s !== 'bad') meld('BAD IS GEEN GAZON', `${wereldId}/${plek}: soort is "${s}"`);
}

// Een plek die een eigen vloer heeft, moet ook echt bestaan - anders staat
// er een uitzondering voor een kamer die er niet meer is.
for (const plek of Object.keys(VLOER_VAN_PLEK)) {
  if (!wereldVanPlek.has(plek)) meld('EIGEN VLOER VOOR NIETS', plek);
  const d = VLOER_VAN_PLEK[plek].dessin;
  if (!DESSINS.includes(d)) meld('DESSIN BESTAAT NIET', `${plek} -> ${d}`);
}

// ------------------------------------------------- dezelfde sleutel twee keer
// Een object-literal met twee keer dezelfde sleutel slikt javascript zonder
// klagen: de laatste wint en de eerste verdwijnt geruisloos. Dat gebeurde
// met 'de kelderkast' in VORM_VAN, en je ziet het nergens aan.
const bron = readFileSync(new URL('../src/content/kamersoorten.js', import.meta.url), 'utf8');
for (const tabel of ['SOORT_VAN', 'VORM_VAN', 'VLOER_VAN_PLEK', 'VOORZETSEL_VAN']) {
  const start = bron.indexOf(`export const ${tabel} = {`);
  if (start < 0) continue;
  const blok = bron.slice(start, bron.indexOf('\n};', start));
  const sleutels = [...blok.matchAll(/^\s*'([^']+)':/gm)].map((m) => m[1]);
  const dubbel = [...new Set(sleutels.filter((x, i) => sleutels.indexOf(x) !== i))];
  for (const d of dubbel) meld('TWEE KEER DEZELFDE SLEUTEL', `${tabel}: ${d}`);
}

console.log('');
console.log(`plekken            ${plekken.size}, allemaal met een soort`);
console.log(`soorten ruimte     ${soorten.size}, elk met vloer en meubilair`);
console.log(`meubelstukken      ${paren.length} namen, ${Object.keys(GESCHILDERD).length} eigen tekeningen`);
console.log(`eigen meubelnamen  ${wereldenMetLaag} werelden dopen het meubilair om`);
console.log(`bordranden         ${Object.keys(RANDSTIJLEN).length}, één per wereld, elk een eigen nacht`);
console.log('gelijkende namen   geen twee die in dezelfde puzzel op hetzelfde woord eindigen');
console.log(`eigen vloeren      ${Object.keys(VLOER_VAN_PLEK).length} plekken waar de soort de grond niet goed raadt`);
console.log('namen als belofte  wat een kamer heet klopt met de vloer en met wat erin kan staan');
console.log(`portretten         ${alleNamen.size} namen, elk met een kop die bij de naam past`);

if (fouten.length) {
  console.log('');
  for (const f of fouten) console.log(f);
  console.log(`\n${fouten.length} FOUTEN`);
  process.exit(1);
}
console.log('\nelke ruimte weet wat hij is, elk meubelstuk heeft zijn eigen tekening,\nen elke wereld zijn eigen lijst om het bord');
