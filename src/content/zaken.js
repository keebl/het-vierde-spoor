// Wat voor zaak is dit?
//
// De vorm van de puzzel staat vast: iedereen terug op de plattegrond, en
// wie als enige bij één bepaalde figuur blijkt te staan, is het antwoord.
// Maar waaróm die figuur het middelpunt is, hoeft niet altijd hetzelfde te
// zijn. Er lag hier altijd een lijk, en bij honderd puzzels achter elkaar
// wordt dat eentonig - en voor een kind ook niet altijd het leukste.
//
// Een zaak levert de woorden, niet de logica. De motor merkt er niets van:
// hij rekent nog steeds uit wie er met z'n tweeën in één kamer staat.
//
//   merk          wat er op het bord door die figuur heen staat
//   rolwoord      hoe je hem noemt: het slachtoffer, de vermiste
//   antwoordwoord wie je zoekt: de dader, de dief, de laatste getuige
//   regel         de zin hierover in de spelregels bij de puzzel
//   opdracht      drie toonaarden, want dezelfde zin bij elke zaak leest
//                 als een herhaling
//   vraag         wat er in het vak "De vraag" komt te staan
//
// `ding` is wat er gestolen is; dat staat per wereld in `gestolen`.

export const ZAKEN = [
  // Geen "hij" of "hem" in deze zinnen: het slachtoffer is net zo vaak een
  // vrouw, en dan stond er "Mathilde ... heeft hem als laatste gesproken".
  // De naam herhalen leest prima en kan niet mis.
  //
  // En kort: de vraag staat al in het vak eronder en de regel in de
  // spelregels. Hier hoort alleen wat er gebeurd is en wat je moet doen.
  {
    id: 'moord',
    merk: 'kruis',
    rolwoord: 'het slachtoffer',
    antwoordwoord: 'de dader',
    regel: 'Het slachtoffer staat zelf ook ergens op het bord. Wie als enige bij het slachtoffer in dezelfde kamer blijkt te staan, is de dader.',
    vraag: (naam, zelfde) => `Wie stond er als enige bij ${naam} ${zelfde}?`,
    opdracht: [
      (naam, rol, zelfde) => `${naam}, ${rol}, is dood gevonden. Niemand weet nog wie waar stond, en ook niet waar ${naam} lag. Zet iedereen terug op het bord. Wie dan als enige bij ${naam} ${zelfde} staat, is de dader.`,
      (naam, rol, zelfde) => `${naam}, ${rol}, is vermoord. Zet alle figuren terug op het bord, ${naam} ook. Wie als enige bij ${naam} ${zelfde} uitkomt, heeft het gedaan.`,
      (naam, rol, zelfde) => `${naam}, ${rol}, leeft niet meer. Waar iedereen stond, ${naam} zelf ook, moet je uitzoeken. De enige die bij ${naam} ${zelfde} staat, is de dader.`,
    ],
  },
  {
    id: 'verdwijning',
    merk: 'vraag',
    rolwoord: 'de vermiste',
    antwoordwoord: 'de laatste getuige',
    regel: 'De vermiste staat zelf ook ergens op het bord. Wie als enige bij de vermiste in dezelfde kamer blijkt te staan, heeft de vermiste het laatst gezien.',
    vraag: (naam, zelfde) => `Wie stond er als enige bij ${naam} ${zelfde}?`,
    opdracht: [
      (naam, rol, zelfde) => `${naam}, ${rol}, is sindsdien zoek. Niemand weet nog wie waar stond, en ook niet waar ${naam} was. Zet iedereen terug op het bord. Wie dan als enige bij ${naam} ${zelfde} staat, heeft ${naam} het laatst gezien.`,
      (naam, rol, zelfde) => `Niemand heeft ${naam}, ${rol}, daarna nog gezien. Zet alle figuren terug op het bord, ${naam} ook. Wie als enige bij ${naam} ${zelfde} uitkomt, was de laatste die ${naam} sprak.`,
      (naam, rol, zelfde) => `${naam}, ${rol}, liep even weg en kwam niet meer terug. Zoek uit waar iedereen stond. De enige die bij ${naam} ${zelfde} staat, heeft ${naam} het laatst gezien.`,
    ],
  },
  {
    id: 'diefstal',
    merk: 'slot',
    rolwoord: 'de bestolene',
    antwoordwoord: 'de dief',
    regel: 'De bestolene staat zelf ook ergens op het bord. Wie als enige bij de bestolene in dezelfde kamer blijkt te staan, heeft het weggenomen.',
    vraag: (naam, zelfde) => `Wie stond er als enige bij ${naam} ${zelfde}?`,
    opdracht: [
      (naam, rol, zelfde, ding) => `${naam}, ${rol}, had ${ding} bij zich, en nu is het weg. Niemand weet nog wie waar stond. Zet iedereen terug op het bord. Wie dan als enige bij ${naam} ${zelfde} staat, heeft het gepakt.`,
      // Niet "${ding} van ${naam}": veel dingen hebben al een eigenaar in de
      // naam, en dan stond er "de startkaart van de kapitein van Nuru".
      (naam, rol, zelfde, ding) => `${naam}, ${rol}, is bestolen: ${ding} is weg. Zet alle figuren terug op het bord, ${naam} ook. Wie als enige bij ${naam} ${zelfde} uitkomt, is de dief.`,
      (naam, rol, zelfde, ding) => `${naam}, ${rol}, merkte pas later dat ${ding} weg was. Zoek uit waar iedereen stond. De enige die bij ${naam} ${zelfde} staat, heeft het.`,
    ],
  },
];

export const ZAAK_BY_ID = new Map(ZAKEN.map((z) => [z.id, z]));
