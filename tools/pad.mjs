// Het pad bouwen (specs/level-path.md, plan stap 3).
//
// Twee fasen, zodat de maten naast elkaar kunnen bouwen:
//
//   node tools/pad.mjs bouw 12 [aantal]   bouwt kandidaten pad12-0, pad12-1, …
//                                         tot er `aantal` (standaard 20) goed
//                                         zijn, en schrijft ze naar
//                                         .pad-kandidaten/12.json
//   node tools/pad.mjs kies               kiest per maat de stappen en schrijft
//                                         src/content/pad.js en pool/pad.json
//
// Een kandidaat is goed als hij zijn sjabloon haalt (mis 0), precies één
// oplossing heeft (telPlaatsingen), de menselijke solver hem helemaal oplost,
// en tot en met acht bij acht zonder iets zwaarders dan doorstrepen (tier 2).
//
// Kiezen: per maat de kandidaten op zwaarte (src/engine/zwaarte.js), de
// uitschieters eraf (meer dan anderhalf keer de mediaan: een bord van 168
// tussen borden van 27 is geen stap, dat is een muur), en niets lichter dan
// de laatste stap van de maat ervoor min de marge (PAD_MARGE). Dan negen
// stappen gelijk verdeeld over het onderste driekwart, zodat de laatste stap
// van een maat niet zwaarder is dan de eerste van de volgende kan opvangen.
//
// De kamerborden van tien bij tien en groter gaan als data naar pool/pad.json,
// zoals de voorraad van niveau vijf en zes: een bord volgt uit zijn seed, dit
// bespaart alleen rekenwerk (check-pad.mjs bouwt een steekproef opnieuw).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { bouwKamerGen, genNaarData, puzzleId, padInstellingen, BORDVERSIE } from '../src/puzzle.js';
import { redeneer } from '../src/engine/redeneer.js';
import { telPlaatsingen } from '../src/engine/rooms.js';
import { PAD_MATEN } from '../src/engine/difficulty.js';
import { zwaarte, PAD_MARGE } from '../src/engine/zwaarte.js';

export const STAPPEN_PER_MAAT = 9;
// Vanaf deze maat bewaart pool/pad.json het bord (en laadt de app het daar).
export const PAD_BEWAAR_VANAF = 10;
const MAP = new URL('../.pad-kandidaten/', import.meta.url);

// Keurt één gebouwd bord; geeft de zwaarte, of een reden waarom niet.
export function keurKandidaat(maat, gen) {
  if (gen.mis) return { reden: `mis ${gen.mis}` };
  const telling = telPlaatsingen(gen.rooster, gen.aanwijzingen, 2);
  if (telling.count !== 1 || telling.opgegeven) return { reden: `oplossingen ${telling.count}${telling.opgegeven ? ' (opgegeven)' : ''}` };
  const spoor = redeneer(gen.rooster, gen.aanwijzingen);
  if (!spoor.opgelost) return { reden: 'de solver komt er niet uit' };
  if (spoor.plaats.some((cel, p) => cel !== gen.plaats[p])) return { reden: 'de solver zet iemand verkeerd' };
  if (spoor.dom.some((d, p) => !d.includes(gen.plaats[p]))) return { reden: 'de solver streept het goede vakje weg' };
  if (maat <= 8 && spoor.graad.topTier > 2) return { reden: `tier ${spoor.graad.topTier} op ${maat} bij ${maat}` };
  return { zwaarte: zwaarte(gen.rooster.n, spoor.graad), graad: spoor.graad };
}

function bouwMaat(maat, aantal) {
  const goed = [];
  const t0 = Date.now();
  for (let i = 0; goed.length < aantal && i < aantal * 4; i++) {
    const seed = `pad${maat}-${i}`;
    const s = padInstellingen(seed);
    const t = Date.now();
    let gen;
    try { gen = bouwKamerGen(s); } catch (e) { console.log(`${seed}: ${e.message}`); continue; }
    const k = keurKandidaat(maat, gen);
    const duur = ((Date.now() - t) / 1000).toFixed(1);
    if (k.reden) { console.log(`${seed}: weg (${k.reden}), ${duur} s`); continue; }
    console.log(`${seed}: zwaarte ${k.zwaarte}, ${duur} s`);
    goed.push({ seed, maat, wereld: s.wereld, zwaarte: k.zwaarte, data: maat >= PAD_BEWAAR_VANAF ? genNaarData(gen) : null });
  }
  mkdirSync(MAP, { recursive: true });
  writeFileSync(new URL(`${maat}.json`, MAP), JSON.stringify({ versie: BORDVERSIE, goed }));
  console.log(`maat ${maat}: ${goed.length} kandidaten in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}

const mediaan = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };

// Kiest de stappen van één maat uit de kandidaten (zie boven). Puur, zodat
// check-pad.mjs dezelfde regel kan toetsen.
export function kiesStappen(kandidaten, vorige, aantal = STAPPEN_PER_MAAT) {
  const m = mediaan(kandidaten.map((k) => k.zwaarte));
  const ondergrens = vorige == null ? -Infinity : vorige - PAD_MARGE(vorige);
  const bruikbaar = kandidaten
    .filter((k) => k.zwaarte <= 1.5 * m && k.zwaarte >= ondergrens)
    .sort((a, b) => a.zwaarte - b.zwaarte || a.seed.localeCompare(b.seed, 'en', { numeric: true }));
  if (bruikbaar.length < aantal) return null;
  const tot = Math.max(aantal - 1, Math.floor(0.75 * (bruikbaar.length - 1)));
  const gekozen = [];
  for (let j = 0; j < aantal; j++) gekozen.push(bruikbaar[Math.round((j * tot) / (aantal - 1))]);
  return gekozen;
}

function kies() {
  const stappen = [];
  const borden = {};
  let vorige = null;
  for (const maat of PAD_MATEN) {
    const bestand = new URL(`${maat}.json`, MAP);
    if (!existsSync(bestand)) throw new Error(`geen kandidaten voor ${maat}: node tools/pad.mjs bouw ${maat}`);
    const { versie, goed } = JSON.parse(readFileSync(bestand, 'utf8'));
    if (versie !== BORDVERSIE) throw new Error(`kandidaten voor ${maat} zijn van bordversie ${versie}, niet ${BORDVERSIE}`);
    // Elf maten van negen is 99; de laatste maat krijgt er een bij, zodat het
    // pad de honderd haalt die de teksten beloven (docs/UX.md).
    const gekozen = kiesStappen(goed, vorige, maat === PAD_MATEN.at(-1) ? STAPPEN_PER_MAAT + 1 : STAPPEN_PER_MAAT);
    if (!gekozen) throw new Error(`te weinig kandidaten voor ${maat} boven ${vorige}: bouw er meer`);
    for (const k of gekozen) {
      stappen.push({ seed: k.seed, maat, wereld: k.wereld, zwaarte: k.zwaarte });
      if (k.data) borden[puzzleId(padInstellingen(k.seed))] = k.data;
    }
    vorige = gekozen.at(-1).zwaarte;
    console.log(`maat ${maat}: ${gekozen.map((k) => k.zwaarte).join(' ')}`);
  }
  writeFileSync(new URL('../pool/pad.json', import.meta.url), `${JSON.stringify({ versie: BORDVERSIE, borden })}\n`);
  writeFileSync(new URL('../src/content/pad.js', import.meta.url), `// Geschreven door tools/pad.mjs (specs/level-path.md): de stappen van het pad,
// in volgorde. Stap k is PAD[k - 1]. De maat staat ook in de seed (pad8-3);
// de zwaarte is gemeten met src/engine/zwaarte.js. De borden van ${PAD_BEWAAR_VANAF} bij
// ${PAD_BEWAAR_VANAF} en groter liggen klaar in pool/pad.json.

export const PAD_BEWAAR_VANAF = ${PAD_BEWAAR_VANAF};
export const PAD = [
${stappen.map((s) => `  ${JSON.stringify(s)},`).join('\n')}
];
`);
  console.log(`${stappen.length} stappen, ${Object.keys(borden).length} borden in pool/pad.json`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [wat, maat, aantal] = process.argv.slice(2);
  if (wat === 'bouw') bouwMaat(Number(maat), Number(aantal ?? 20));
  else if (wat === 'kies') kies();
  else { console.log('gebruik: node tools/pad.mjs bouw <maat> [aantal] | kies'); process.exit(1); }
}
