// Keurt de indeling van de aanwijzingen per verdachte (src/aanwijzingen.js)
// over de hele bibliotheek. Die indeling vult zowel de lijst als het kastje
// onder de namen op een telefoon; zit hier een gat in, dan staat een zin bij
// de verkeerde naam of nergens, en leest de puzzel als onoplosbaar.
//
// Per Reconstructie, met en zonder een opgevraagde hint:
// - elke aanwijzing staat onder iedere naam die erin voorkomt (eerste en
//   tweede), en onder geen andere naam;
// - elke aanwijzing staat ergens: onder een naam of bij Iedereen;
// - geen zin verwijst naar een aanwijzing met een nummer, want de speler
//   ziet geen nummers meer (specs/clues-on-phone.md, criterium 13).

import { CATALOG, catalogSettings } from '../src/content/catalog.js';
import { buildPuzzle } from '../src/puzzle.js';
import { aanwijzingenPerPersoon } from '../src/aanwijzingen.js';
import { extraAanwijzing } from '../src/engine/generate-rooms.js';
import { makeRng } from '../src/engine/rng.js';

const NUMMER = /\baanwijzing(en)?\s+\d|\bV\d+\.|\bstaat ook in\b/i;

let fouten = 0;
let puzzels = 0;
let zinnen = 0;
let hints = 0;
const fout = (titel, wat) => {
  fouten++;
  if (fouten <= 40) console.log(`FOUT  ${titel}: ${wat}`);
};

for (const entry of CATALOG) {
  if (entry.mechaniek !== 'kamer') continue;
  const p = buildPuzzle(catalogSettings(entry));
  puzzels++;

  // Eén hint erbij, zoals de knop Hint hem maakt op een leeg bord, zodat ook
  // de hints door dezelfde indeling gaan.
  const hint = extraAanwijzing(
    p._rooster, p.oplossing, p.slachtofferIdx, p._ruwe ?? [], [],
    makeRng(`${p.id}:hint0`),
  );
  const extra = hint ? [hint] : [];
  if (hint) hints++;

  const { perPersoon, algemeen, feiten } = aanwijzingenPerPersoon(p, extra);
  if (perPersoon.length !== p.personen.length) fout(entry.titel, 'niet elke naam heeft een groep');

  const telling = p.clues.length + extra.length;
  const gezien = new Set();
  for (const c of algemeen) gezien.add(c.n);
  perPersoon.forEach((lijst, i) => {
    for (const c of lijst) {
      gezien.add(c.n);
      if (c.ruw?.p !== i && c.ruw?.q !== i) fout(entry.titel, `"${c.text}" staat bij ${p.personen[i]}, die er niet in voorkomt`);
    }
  });
  for (const lijst of [...perPersoon, algemeen]) {
    for (const c of lijst) {
      zinnen++;
      if (NUMMER.test(c.text)) fout(entry.titel, `nummer in de zin: "${c.text}"`);
      if (c.ruw?.p != null) {
        if (!perPersoon[c.ruw.p].includes(c)) fout(entry.titel, `"${c.text}" mist bij ${p.personen[c.ruw.p]}`);
        if (c.ruw.q != null && !perPersoon[c.ruw.q].includes(c)) fout(entry.titel, `"${c.text}" mist bij ${p.personen[c.ruw.q]}`);
        if (algemeen.includes(c)) fout(entry.titel, `"${c.text}" staat bij een naam én bij Iedereen`);
      }
    }
  }
  if (gezien.size !== telling) fout(entry.titel, `${telling - gezien.size} van de ${telling} aanwijzingen staan nergens`);
  for (const f of feiten) if (NUMMER.test(f)) fout(entry.titel, `nummer in een vast feit: "${f}"`);
}

console.log(`\n${puzzels} Reconstructies, ${zinnen} geplaatste zinnen, ${hints} met een hint erbij, ${fouten} fouten`);
process.exit(fouten ? 1 : 0);
