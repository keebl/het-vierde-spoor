// Niveau 1 t/m 5 omgezet naar concrete generatieparameters.
//
// Moeilijkheid komt hier uit drie knoppen, niet uit een willekeurig getal:
//   1. omvang      - hoeveel slots en hoeveel categorieen
//   2. soort hints - directe bevestigingen zijn makkelijk, uitsluitingen en
//                    "of-of" dwingen tot doorredeneren
//   3. redeneerstijl - 'shallow': op te lossen door stap voor stap door te
//                    strepen, met minRounds als maat voor hoeveel stappen.
//                    'deep': doorstrepen alleen brengt je er niet, je moet
//                    ergens aannemen en die aanname weerleggen.
//   4. ruis        - op lage niveaus laten we overbodige aanwijzingen staan,
//                    want die geven houvast. Hoger wordt alles weggesneden.

export const LEVELS = {
  1: {
    label: 'Beginner',
    slots: 3,
    cats: 2,
    ordered: false,
    weights: { same: 6, diff: 4, either: 1, adj: 3, hops: 1, degree: 1 },
    redundancy: 1,
    style: 'shallow',
    minRounds: 2,
    maxClues: 7,
  },
  2: {
    label: 'Makkelijk',
    slots: 4,
    cats: 2,
    ordered: false,
    weights: { same: 4, diff: 5, either: 2, adj: 3, hops: 2, degree: 1 },
    redundancy: 0,
    style: 'shallow',
    minRounds: 3,
    maxClues: 11,
  },
  3: {
    label: 'Gemiddeld',
    slots: 4,
    cats: 3,
    ordered: true,
    weights: { same: 2, diff: 6, either: 3, before: 3, gap: 2, adj: 3, hops: 2, degree: 1 },
    redundancy: 0,
    style: 'shallow',
    minRounds: 3,
    maxClues: 14,
  },
  4: {
    label: 'Lastig',
    slots: 5,
    cats: 3,
    ordered: true,
    weights: { same: 1, diff: 6, either: 4, before: 4, gap: 3, adj: 2, hops: 3, degree: 1 },
    redundancy: 0,
    style: 'deep',
    minRounds: 0,
    maxClues: 15,
  },
  5: {
    label: 'Meesterlijk',
    slots: 6,
    cats: 3,
    ordered: true,
    weights: { same: 0, diff: 6, either: 5, before: 4, gap: 4, adj: 2, hops: 3, degree: 1 },
    redundancy: 0,
    style: 'deep',
    minRounds: 0,
    maxClues: 20,
  },
};

export const LEVEL_IDS = [1, 2, 3, 4, 5];

export function levelParams(level) {
  return LEVELS[Math.min(5, Math.max(1, Number(level) || 1))];
}

// Het kamerraster heeft eigen maten: de omvang zit in het rooster (n bij n)
// en in het aantal kamers, niet in het aantal categorieen.
export const KAMER_LEVELS = {
  1: { n: 5, kamers: 4, meubelDeel: 0.18, style: 'shallow', maxClues: 7,
       gewichten: { kamer: 6, naast: 4, zelfdeKamer: 3, aantalKamer: 3, buren: 2, noord: 1, west: 1, opRij: 2, opKolom: 2, rand: 2, hoek: 2, aantalNaast: 2 } },
  2: { n: 6, kamers: 5, meubelDeel: 0.20, style: 'shallow', maxClues: 9,
       gewichten: { kamer: 5, naast: 4, zelfdeKamer: 3, aantalKamer: 3, buren: 3, noord: 2, west: 2, opRij: 3, opKolom: 3, rand: 3, hoek: 3, aantalNaast: 3 } },
  3: { n: 7, kamers: 6, meubelDeel: 0.22, style: 'shallow', maxClues: 12,
       gewichten: { kamer: 4, naast: 4, zelfdeKamer: 4, aantalKamer: 3, buren: 3, noord: 2, west: 2, opRij: 3, opKolom: 3, rand: 3, hoek: 3, aantalNaast: 3 } },
  4: { n: 9, kamers: 7, meubelDeel: 0.24, style: 'deep', maxClues: 16,
       gewichten: { kamer: 3, naast: 4, zelfdeKamer: 4, aantalKamer: 3, buren: 4, noord: 2, west: 2, opRij: 3, opKolom: 3, rand: 3, hoek: 3, aantalNaast: 4 } },
  // Twaalf bij twaalf, zoals in de dikke puzzelboeken. Dat kan sinds de
  // solver eerst doorstreept en daarna de meest beperkte figuur kiest, en een
  // werkbudget heeft zodat een pechgeval wordt weggegooid in plaats van
  // minuten door te rekenen. Gemeten: ongeveer 0,6 seconde.
  5: { n: 12, kamers: 8, meubelDeel: 0.24, style: 'deep', maxClues: 22,
       gewichten: { kamer: 2, naast: 4, zelfdeKamer: 5, aantalKamer: 3, buren: 4, noord: 2, west: 2, opRij: 4, opKolom: 4, rand: 3, hoek: 3, aantalNaast: 4 } },
};

export function kamerParams(level) {
  return KAMER_LEVELS[Math.min(5, Math.max(1, Number(level) || 1))];
}
