// De keuring van het pad (specs/level-path.md, plan stap 4).
//
// Elke stap van src/content/pad.js:
//   - heeft een padseed, en de maat in de seed is de maat in de data;
//   - heeft precies één oplossing, en de menselijke solver lost hem op
//     zonder iemand verkeerd te zetten of het goede vakje weg te strepen
//     (criterium 8), tot en met acht bij acht met alleen doorstrepen
//     (criterium 9) - dezelfde keuring als tools/pad.mjs bij het kiezen;
//   - weegt wat er staat (src/engine/zwaarte.js), en wordt nooit meer dan
//     PAD_MARGE lichter dan de stap ervoor (criterium 8);
//   - staat in maatvolgorde: de maten gaan nooit omlaag (criterium 13);
//   - heeft dezelfde vingerafdruk als in tools/vingerafdruk-pad.txt, zodat
//     een wijziging in de bouwer die een stap verschuift opvalt (criterium 7).
// De borden van tien bij tien en groter komen uit pool/pad.json; een
// steekproef ervan wordt opnieuw gebouwd en moet gelijk zijn (met --alles:
// allemaal, dat duurt een half uur).
//
// Daarna de voortgang (src/ui/pad-voortgang.js) met een nep-opslag: de
// sterrenregel, het slot, Oplossing telt niet, sterren gaan alleen omhoog,
// een kapotte sleutel en een geblokkeerde opslag (criteria 1, 2, 3, 5, 6).
//
// node tools/check-pad.mjs [--alles] [--schrijf]

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { PAD, PAD_BEWAAR_VANAF } from '../src/content/pad.js';
import { bouwKamerGen, genUitData, genNaarData, buildPuzzle, puzzleId, padInstellingen, BORDVERSIE } from '../src/puzzle.js';
import { maatVanSeed, PAD_MATEN } from '../src/engine/difficulty.js';
import { PAD_MARGE } from '../src/engine/zwaarte.js';
import { keurKandidaat } from './pad.mjs';
import {
  sterrenVoor, leesPad, losStapOp, huidigeStap, isOpen, totaalSterren, padStand,
  PAD_SLEUTEL, PAD_RESERVE,
} from '../src/ui/pad-voortgang.js';

const ALLES = process.argv.includes('--alles');
const SCHRIJF = process.argv.includes('--schrijf');

const fouten = [];
const fout = (waar, wat) => { fouten.push(`${waar}: ${wat}`); console.log(`FOUT  ${waar}: ${wat}`); };

// ------------------------------------------------------------------ stappen

const pool = JSON.parse(readFileSync(new URL('../pool/pad.json', import.meta.url), 'utf8'));
if (pool.versie !== BORDVERSIE) fout('pool/pad.json', `bordversie ${pool.versie}, niet ${BORDVERSIE}`);

if (PAD.length !== 100) fout('pad', `${PAD.length} stappen; de teksten beloven er honderd (docs/UX.md)`);
for (const m of PAD_MATEN) if (!PAD.some((s) => s.maat === m)) fout('pad', `geen stap van ${m} bij ${m}`);

const vingerafdruk = (p) => createHash('sha256')
  .update(JSON.stringify([p.id, p.oplossing, p._ruwe, p.slachtofferIdx, p.kamerVan, p.meubelOp, p.clues.map((c) => c.text)]))
  .digest('hex').slice(0, 16);

// Welke opgeslagen borden opnieuw gebouwd worden: de eerste van elke maat
// die in een paar seconden bouwt. Twaalf (het sjabloon van niveau vijf) en
// zestien kosten minuten per bord; die alleen met --alles.
const SNEL_HERBOUWD = new Set([10, 11, 13, 14]);
const herbouw = new Set();
for (const m of PAD_MATEN) {
  if (m < PAD_BEWAAR_VANAF) continue;
  const eerste = PAD.findIndex((s) => s.maat === m);
  if (eerste >= 0 && (ALLES || SNEL_HERBOUWD.has(m))) herbouw.add(eerste);
}
if (ALLES) PAD.forEach((s, i) => { if (s.maat >= PAD_BEWAAR_VANAF) herbouw.add(i); });

const afdrukken = [];
let vorige = null;
const begin = Date.now();
PAD.forEach((stap, i) => {
  const k = i + 1;
  const waar = `stap ${k} (${stap.seed})`;
  if (maatVanSeed(stap.seed) !== stap.maat) { fout(waar, `de seed zegt maat ${maatVanSeed(stap.seed)}, de data ${stap.maat}`); return; }
  const settings = padInstellingen(stap.seed);
  if (settings.wereld !== stap.wereld) fout(waar, `wereld ${settings.wereld}, de data zegt ${stap.wereld}`);
  const id = puzzleId(settings);
  let gen;
  if (stap.maat >= PAD_BEWAAR_VANAF) {
    const data = pool.borden?.[id];
    if (!data) { fout(waar, 'staat niet in pool/pad.json'); return; }
    gen = genUitData(data);
    if (herbouw.has(i)) {
      const t = Date.now();
      const opnieuw = genNaarData(bouwKamerGen(settings));
      if (JSON.stringify(opnieuw) !== JSON.stringify(data)) fout(waar, 'opnieuw gebouwd geeft een ander bord dan pool/pad.json');
      else console.log(`${waar}: opnieuw gebouwd, gelijk (${((Date.now() - t) / 1000).toFixed(1)} s)`);
    }
  } else {
    gen = bouwKamerGen(settings);
  }
  const keur = keurKandidaat(stap.maat, gen);
  if (keur.reden) { fout(waar, keur.reden); return; }
  if (keur.zwaarte !== stap.zwaarte) fout(waar, `zwaarte ${keur.zwaarte}, de data zegt ${stap.zwaarte}`);
  if (i > 0 && stap.maat < PAD[i - 1].maat) fout(waar, `maat ${stap.maat} na maat ${PAD[i - 1].maat}`);
  if (vorige != null && keur.zwaarte < vorige - PAD_MARGE(vorige)) {
    fout(waar, `zwaarte ${keur.zwaarte} na ${vorige}: meer dan ${PAD_MARGE(vorige)} lichter`);
  }
  vorige = keur.zwaarte;
  afdrukken.push(`${k} ${id} ${vingerafdruk(buildPuzzle(settings, { gen }))}`);
});
console.log(`${PAD.length} stappen gekeurd in ${((Date.now() - begin) / 1000).toFixed(1)} s`);

const AFDRUKKEN = new URL('vingerafdruk-pad.txt', import.meta.url);
if (SCHRIJF) {
  writeFileSync(AFDRUKKEN, `${afdrukken.join('\n')}\n`);
  console.log(`${afdrukken.length} vingerafdrukken geschreven naar tools/vingerafdruk-pad.txt`);
} else if (!existsSync(AFDRUKKEN)) {
  fout('vingerafdrukken', 'tools/vingerafdruk-pad.txt ontbreekt (node tools/check-pad.mjs --schrijf)');
} else {
  const vast = readFileSync(AFDRUKKEN, 'utf8').trim().split('\n');
  if (vast.length !== afdrukken.length) fout('vingerafdrukken', `${vast.length} vastgelegd, ${afdrukken.length} gebouwd`);
  afdrukken.forEach((r, i) => { if (vast[i] !== r) fout(`stap ${i + 1}`, 'het bord is verschoven (andere vingerafdruk)'); });
}

// ---------------------------------------------------------------- voortgang

class NepOpslag {
  constructor(begin = {}) { this.m = new Map(Object.entries(begin)); }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
}
class DichteOpslag {
  getItem() { throw new Error('geblokkeerd'); }
  setItem() { throw new Error('geblokkeerd'); }
  removeItem() { throw new Error('geblokkeerd'); }
}
const eis = (waar, ok) => { if (!ok) fout('voortgang', waar); };

eis('0 keer hulp geeft 3 sterren', sterrenVoor(0) === 3);
eis('1 keer hulp geeft 2 sterren', sterrenVoor(1) === 2);
eis('2 keer hulp geeft 1 ster', sterrenVoor(2) === 1 && sterrenVoor(7) === 1);

{
  // Criterium 1: zonder voortgang is alleen stap 1 open.
  const o = new NepOpslag();
  const pad = leesPad(o);
  eis('zonder voortgang is stap 1 open', isOpen(pad, 1));
  eis('zonder voortgang is stap 2 dicht', !isOpen(pad, 2) && !isOpen(pad, 50));
  eis('zonder voortgang ben je bij stap 1', huidigeStap(pad, 100) === 1);

  // Criterium 2 en 5: opgelost zonder hulp, drie sterren, de volgende open.
  const u = losStapOp(1, 0, o);
  eis('zelf opgelost zonder hulp geeft 3 sterren', u.sterren === 3 && u.eerder === 0);
  const na = leesPad(o);
  eis('na stap 1 is stap 2 open', isOpen(na, 2) && !isOpen(na, 3));
  eis('na stap 1 ben je bij stap 2', huidigeStap(na, 100) === 2);

  // Criterium 6: opnieuw met hulp, de sterren blijven drie.
  const v = losStapOp(1, 4, o);
  eis('opnieuw met hulp meldt 1 ster en eerder 3', v.sterren === 1 && v.eerder === 3);
  eis('opnieuw met hulp houdt 3 sterren', leesPad(o).stappen['1'].sterren === 3);

  // Criterium 3: Oplossing roept losStapOp niet aan (player.js); de stap
  // blijft dan zonder sterren en de volgende dicht.
  eis('een stap zonder losStapOp opent niets', !isOpen(leesPad(o), 3) && totaalSterren(leesPad(o), 100) === 3);

  // Het eind.
  for (let k = 2; k <= 100; k++) losStapOp(k, 1, o);
  eis('alles opgelost geeft het eind', huidigeStap(leesPad(o), 100) === 101);
  eis('de sterren tellen op', totaalSterren(leesPad(o), 100) === 3 + 99 * 2);
}

{
  // Een kapotte of onbekende sleutel: geen voortgang, de oude waarde bewaard.
  const kapot = new NepOpslag({ [PAD_SLEUTEL]: '{niet json' });
  eis('een kapotte sleutel geeft geen voortgang', Object.keys(leesPad(kapot).stappen).length === 0);
  eis('een kapotte sleutel gaat naar de reserve', kapot.getItem(PAD_RESERVE) === '{niet json');
  const oud = new NepOpslag({ [PAD_SLEUTEL]: JSON.stringify({ versie: 9, stappen: { 1: { sterren: 3, opgelost: true } } }) });
  eis('een onbekende versie geeft geen voortgang', huidigeStap(leesPad(oud), 100) === 1);
  const raar = new NepOpslag({ [PAD_SLEUTEL]: JSON.stringify({ versie: 1, stappen: { 1: { sterren: 99, opgelost: true }, x: {}, '-2': { opgelost: true } } }) });
  const r = leesPad(raar);
  eis('rare waarden worden genegeerd', r.stappen['1'].sterren === 0 && !r.stappen.x && !r.stappen['-2']);
}

{
  // Geblokkeerde opslag (privémodus): het pad werkt voor de sessie.
  const dicht = new DichteOpslag();
  eis('geblokkeerde opslag gooit niet bij lezen', huidigeStap(padStand(dicht), 100) === 1);
  losStapOp(1, 0, dicht);
  eis('geblokkeerde opslag onthoudt het in het geheugen', isOpen(padStand(dicht), 2));
}

console.log(fouten.length ? `${fouten.length} fouten` : 'het pad klopt');
process.exit(fouten.length ? 1 : 0);
