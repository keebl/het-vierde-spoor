// Waar gaat "Volgende zaak" heen?
//
// Een tester op een telefoon vroeg om een logische volgorde: puzzel één,
// dan de volgende, dan het volgende niveau. Dus: kwam je uit de
// bibliotheek, dan krijg je de eerstvolgende vaste zaak van hetzelfde
// niveau die je nog niet hebt opgelost, in de volgorde waarin de
// bibliotheek ze laat zien. Heb je dat niveau helemaal af, dan schuif je
// een niveau op. Pas als er nergens hoger nog iets open staat, of als je
// een zelfgemaakte puzzel speelde, krijg je een nieuwe willekeurige puzzel
// van hetzelfde niveau - net als de grote knop op de voorpagina.
//
// Hier wordt niets gebouwd: alleen een id uitgerekend. De puzzel zelf
// wordt pas gemaakt als je op de knop drukt.

import { CATALOG, catalogSettings } from '../content/catalog.js';
import { mechaniekZichtbaar } from '../content/assignments.js';
import { ZICHTBARE_LEVEL_IDS } from '../engine/difficulty.js';
import { puzzleId, wereldVoorSeed } from '../puzzle.js';
import { randomSeed } from '../engine/rng.js';
import { solvedIds } from './state.js';

// Alleen de Reconstructies. Zie ZICHTBARE_MECHANICS in assignments.js.
export const TEZIEN = CATALOG.filter((p) => mechaniekZichtbaar(p.mechaniek) && ZICHTBARE_LEVEL_IDS.includes(p.niveau));

// De volgorde van de bibliotheek: oplopend in moeilijkheid, binnen een
// niveau op titel. "De volgende" moet de volgende zijn die je daar ziet.
const VOLGORDE = [...TEZIEN].sort((a, b) => a.niveau - b.niveau || a.titel.localeCompare(b.titel));

// Elke druk op de knop een ander decor. Welke dat wordt volgt uit de seed
// en niet uit een tweede loting - zo geeft dezelfde link altijd dezelfde
// puzzel terug. Zie wereldVoorSeed in puzzle.js.
export function nieuwePuzzel(niveau) {
  const seed = randomSeed();
  return puzzleId({
    opdracht: 'dader',
    wereld: wereldVoorSeed(seed),
    mechaniek: 'kamer',
    niveau,
    seed,
  });
}

// Het id van de zaak na deze. `opgelost` is er voor de keuring; in de
// browser komt het uit localStorage.
export function volgendeZaak(puzzle, opgelost = solvedIds()) {
  const niveau = Number(puzzle.niveau ?? puzzle.settings?.niveau) || ZICHTBARE_LEVEL_IDS[0];
  const ids = VOLGORDE.map((e) => puzzleId(catalogSettings(e)));
  const hier = ids.indexOf(puzzle.id);
  if (hier < 0) return nieuwePuzzel(niveau);

  const open = (i) => i !== hier && !opgelost.has(ids[i]);
  // Eerst wat na deze komt binnen hetzelfde niveau, dan wat ervoor lag:
  // wie halverwege begon, heeft de eerste zaken van dit niveau nog liggen.
  const zelfde = VOLGORDE.map((e, i) => i).filter((i) => VOLGORDE[i].niveau === niveau);
  const na = zelfde.filter((i) => i > hier);
  const voor = zelfde.filter((i) => i < hier);
  const binnen = [...na, ...voor].find(open);
  if (binnen != null) return ids[binnen];

  // Dit niveau is af: de eerste open zaak van het eerstvolgende niveau dat
  // er nog een heeft.
  const hoger = VOLGORDE.findIndex((e, i) => e.niveau > niveau && open(i));
  if (hoger >= 0) return ids[hoger];

  return nieuwePuzzel(niveau);
}
