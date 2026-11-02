// Welke blokken hoort een kruisverhoor te hebben?
//
// Een deductieraster is pas compleet als elk paar categorieën zijn eigen blok
// heeft. Met een anker (de verdachten) en drie categorieën zijn dat er zes:
// drie tegen het anker, en drie tussen de categorieën onderling. Zonder die
// laatste drie kun je een aanwijzing als "degene met de bankbiljetten was in
// het hotel" nergens noteren - je weet dan wel iets, maar je kunt het niet
// opschrijven, en dat is precies waar een papieren raster wel voor deugt.
//
// Deze lijst staat apart van het tekenen, zodat de keuring kan narekenen dat
// elke aanwijzing ook echt ergens te noteren valt.

export const paarId = (a, b) => `${a}×${b}`;

export function blokkenVan(puzzle) {
  const uit = [];
  for (const cat of puzzle.cats) {
    uit.push({ id: cat.id, soort: 'anker', rij: puzzle.anchor, kolom: cat });
  }
  for (let i = 0; i < puzzle.cats.length; i++) {
    for (let j = i + 1; j < puzzle.cats.length; j++) {
      const a = puzzle.cats[i];
      const b = puzzle.cats[j];
      uit.push({ id: paarId(a.id, b.id), soort: 'paar', rij: a, kolom: b });
    }
  }
  return uit;
}

// In welk blok kun je een uitspraak over deze twee categorieën noteren?
export function blokVoor(puzzle, catA, catB) {
  return blokkenVan(puzzle).find((b) =>
    (b.rij.id === catA && b.kolom.id === catB) || (b.rij.id === catB && b.kolom.id === catA));
}
