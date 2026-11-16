// De aanwijzingen van een Reconstructie per verdachte, zonder DOM.
//
// Dit zat eerst in perNaam in ui/player.js, en daar kon het alleen een lijst
// bouwen. Sinds de aanwijzingen op een telefoon ook in een kastje onder de
// namen staan (specs/clues-on-phone.md), lezen twee plekken dezelfde
// indeling. Staat die op één plek, dan kunnen lijst en kastje het nooit
// oneens zijn over wat er over iemand gezegd is - en kan de keuring het
// nakijken (tools/check-aanwijzingen.mjs).
//
// Een aanwijzing staat onder iedere naam die erin voorkomt, als eerste én als
// tweede naam. "Ada stond ten noorden van Bram" staat dus bij Ada en bij Bram,
// als dezelfde zin. Eerder stond hij alleen bij Ada, en kreeg Bram een
// verwijzing "staat ook in aanwijzing 5" - maar nummers zeggen de speler
// niets, en wie bij Bram kijkt wil de zin lezen, niet gaan zoeken.
//
// Tellingen ("in de keuken stonden precies twee mensen") gaan over niemand in
// het bijzonder: die staan apart, net als de vaste feiten uit de inleiding.

import { zinVoor } from './content/rooms-text.js';

// Alle aanwijzingen van de puzzel plus de opgevraagde hints, elk met zijn
// ruwe vorm. `n` is de interne sleutel waarmee een weggestreepte aanwijzing
// bewaard wordt (state.struck); de speler ziet hem nergens meer. Hints
// nummeren door na de vaste aanwijzingen, zodat een sleutel nooit dubbel is.
export function alleAanwijzingen(puzzle, extra = []) {
  const ruw = puzzle._ruwe ?? [];
  return [
    ...puzzle.clues.map((c, i) => ({ n: c.n, text: c.text, ruw: ruw[i] ?? null })),
    ...extra.map((r, i) => ({
      n: puzzle.clues.length + i + 1,
      text: zinVoor(r, puzzle.woorden),
      ruw: r,
    })),
  ];
}

// { perPersoon: [[aanwijzing]] per index in puzzle.personen,
//   algemeen: [aanwijzing], feiten: [zin] }
export function aanwijzingenPerPersoon(puzzle, extra = []) {
  const perPersoon = puzzle.personen.map(() => []);
  const algemeen = [];
  for (const clue of alleAanwijzingen(puzzle, extra)) {
    const r = clue.ruw;
    if (!r || r.p == null) {
      algemeen.push(clue);
      continue;
    }
    perPersoon[r.p]?.push(clue);
    if (r.q != null && r.q !== r.p) perPersoon[r.q]?.push(clue);
  }
  return { perPersoon, algemeen, feiten: puzzle.feiten ?? [] };
}
