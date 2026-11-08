// De spelregels in woorden, per speltype.
//
// Ze staan hier zodat ze op één plek staan en bij de puzzel te lezen zijn.
// Een puzzelaar die niet weet wat "naast" betekent, kan de aanwijzingen niet
// vertrouwen - en dan is het onze fout, niet de zijne.
//
// Wat hier staat moet kloppen met de motor: de regels van het kamerraster
// staan boven in src/engine/rooms.js, die van het raster in assign.js.
// tools/check-regels.mjs rekent ze na over elke puzzel.

export const SPELREGELS = {
  kamer: {
    kop: 'De regels van de Reconstructie',
    regels: [
      'Er staat precies één figuur per rij en precies één per kolom.',
      'Op een vakje met een meubelstuk staat niemand.',
      '"Naast" betekent pal erboven, eronder, links of rechts én in dezelfde kamer. Door een muur heen sta je niet naast iets, en schuin telt nooit.',
      '"Op dezelfde rij" en "in dezelfde kolom" gaan over het hele raster en lopen dus wél door muren heen.',
      'Het noorden ligt boven, zoals het kompas naast het bord aangeeft.',
      'Alle aanwijzingen zijn waar, en er is precies één plaatsing die ze allemaal waarmaakt.',
    ],
  },
  grid: {
    kop: 'De regels van het Kruisverhoor',
    regels: [
      'Elke verdachte hoort bij precies één voorwerp, één plek en - als die er zijn - één tijdstip.',
      'Andersom net zo: elk voorwerp, elke plek en elk tijdstip hoort bij precies één verdachte.',
      'Een vink streept de rest van zijn rij en zijn kolom door; dat doet het bord zelf.',
      'Onder de blokken met de verdachten staan de blokken tussen de categorieën onderling. Daar noteer je wat je weet zonder dat er een verdachte bij genoemd wordt, zoals "degene met de bankbiljetten was in het hotel". Je hebt ze niet nodig om de vraag te beantwoorden.',
      'Alle aanwijzingen zijn waar, en er is precies één verdeling die ze allemaal waarmaakt.',
    ],
  },
  map: {
    kop: 'De regels van de Rondgang',
    regels: [
      'Elke ruimte hoort bij precies één van elk ander soort ding, en andersom net zo.',
      'Naast de blokken met de ruimtes staan de blokken tussen de categorieën onderling, voor wat je weet zonder dat er een ruimte bij genoemd wordt.',
      '"Grenst aan" betekent: er zit een deur tussen. Twee ruimtes die elkaar op de kaart raken zonder deur, grenzen dus niet aan elkaar.',
      '"Twee deuren verderop" telt de kortste route over de deuren die er zijn.',
      'De kaart is volledig: wat er niet op staat, bestaat niet.',
      'Staat er "Wat vaststaat" boven de aanwijzingen, dan telt dat feit net zo hard mee als een aanwijzing.',
      'Alle aanwijzingen zijn waar, en er is precies één verdeling die ze allemaal waarmaakt.',
    ],
  },
  latin: {
    kop: 'De regels van het Dienstrooster',
    regels: [
      'Iedereen komt op elke plek precies één keer voor: in elke rij staat elke naam één keer.',
      'Op elk moment is iedereen op precies één plek: in elke kolom staat elke naam één keer.',
      '"Volgden elkaar direct op" betekent: op die plek stonden ze in twee opeenvolgende momenten.',
      '"Eerder dan" gaat altijd over dezelfde plek.',
      'De grijze vakjes staan vast. Alle aanwijzingen zijn waar, en er is precies één invulling.',
    ],
  },
};

export const spelregelsVan = (mechaniek) => SPELREGELS[mechaniek] ?? null;
