// Welke bestanden een script raakt: de relatieve imports, recursief.
//
// Gebruik: node tools/afhankelijk.mjs tools/check-voorraad.mjs [meer scripts]
// Drukt elk bestand af, een per regel, relatief aan de repo.
//
// CI gebruikt dit om "de voorraad" over te slaan als een pull request niets
// raakt waar de voorraad van afhangt (PR #29). Een vaste lijst paden zou
// stilletjes verouderen zodra de motor een nieuw bestand importeert; de
// imports zelf lezen kan dat niet.

import { readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';

const wortel = resolve(dirname(new URL(import.meta.url).pathname), '..');
const gezien = new Set();
function loop(bestand) {
  if (gezien.has(bestand)) return;
  gezien.add(bestand);
  const tekst = readFileSync(bestand, 'utf8');
  for (const m of tekst.matchAll(/(?:from|import)\s*\(?\s*['"](\.[^'"]+)['"]/g)) {
    loop(resolve(dirname(bestand), m[1]));
  }
}
for (const s of process.argv.slice(2)) loop(resolve(wortel, s));
for (const f of [...gezien].sort()) console.log(relative(wortel, f));
