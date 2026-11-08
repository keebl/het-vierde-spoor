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
//   antwoordwoord wie je zoekt: de dader, de dief
//   regel         de zin hierover in de spelregels bij de puzzel
//   opdracht      drie toonaarden, want dezelfde zin bij elke zaak leest
//                 als een herhaling
//   vraag         wat er in het vak "De vraag" komt te staan
//
// `ding` is wat er gestolen is; dat staat per wereld in `gestolen`.

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export const ZAKEN = [
  {
    id: 'moord',
    merk: 'kruis',
    rolwoord: 'het slachtoffer',
    antwoordwoord: 'de dader',
    regel: 'Het slachtoffer staat zelf ook ergens op het bord. Wie als enige bij hem in dezelfde kamer blijkt te staan, is de dader.',
    vraag: (naam, zelfde) => `Wie stond er als enige bij ${naam} ${zelfde}?`,
    opdracht: [
      (naam, rol, zelfde) => `${naam}, ${rol}, is dood aangetroffen. Niemand weet meer wie waar stond, en zelfs waar ${naam} lag is onduidelijk. Zet iedereen op zijn plek: wie dan als enige bij ${naam} ${zelfde} blijkt te staan, is de dader.`,
      (naam, rol, zelfde) => `Er is die avond iemand omgebracht: ${naam}, ${rol}. Van wat er gebeurde is geen plattegrond gemaakt. Zet iedereen terug op de plek waar hij stond, ${naam} incluis - want wie als enige bij ${naam} ${zelfde} eindigt, heeft het gedaan.`,
      (naam, rol, zelfde) => `Dit is een moordzaak. ${naam}, ${rol}, heeft het niet gehaald. Reconstrueer wie waar stond, ${naam} zelf incluis, want zelfs dat is niet meer bekend. Wie dan als enige bij ${naam} ${zelfde} staat, is de dader.`,
    ],
  },
  {
    id: 'verdwijning',
    merk: 'vraag',
    rolwoord: 'de vermiste',
    antwoordwoord: 'wie hem het laatst zag',
    regel: 'De vermiste staat zelf ook ergens op het bord. Wie als enige bij hem in dezelfde kamer blijkt te staan, heeft hem het laatst gezien.',
    vraag: (naam, zelfde) => `Wie stond er als enige bij ${naam} ${zelfde}?`,
    opdracht: [
      (naam, rol, zelfde) => `${naam}, ${rol}, is sindsdien niet meer gezien. Niemand weet meer wie waar stond, en waar ${naam} het laatst was weet ook niemand. Zet iedereen op zijn plek: wie dan als enige bij ${naam} ${zelfde} blijkt te staan, heeft hem als laatste gesproken.`,
      (naam, rol, zelfde) => `Er is iemand spoorloos: ${naam}, ${rol}. Van dat uur is geen plattegrond gemaakt. Zet iedereen terug op de plek waar hij stond, ${naam} incluis - want wie als enige bij ${naam} ${zelfde} eindigt, weet waar hij gebleven is.`,
      (naam, rol, zelfde) => `${naam} is verdwenen. ${cap(rol)} liep weg en kwam niet terug, en niemand weet meer waar iemand stond. Zet ze allemaal neer; de enige die daarna bij ${naam} ${zelfde} staat, heeft hem het laatst gezien.`,
    ],
  },
  {
    id: 'diefstal',
    merk: 'slot',
    rolwoord: 'de bestolene',
    antwoordwoord: 'de dief',
    regel: 'De bestolene staat zelf ook ergens op het bord. Wie als enige bij hem in dezelfde kamer blijkt te staan, heeft het weggenomen.',
    vraag: (naam, zelfde) => `Wie stond er als enige bij ${naam} ${zelfde}?`,
    opdracht: [
      (naam, rol, zelfde, ding) => `${naam}, ${rol}, had ${ding} bij zich - en het is weg. Niemand weet meer wie waar stond. Zet iedereen op zijn plek: wie dan als enige bij ${naam} ${zelfde} blijkt te staan, heeft het weggenomen.`,
      (naam, rol, zelfde, ding) => `${cap(ding)} is uit de handen van ${naam}, ${rol}, verdwenen. Van dat moment is geen plattegrond gemaakt. Zet iedereen terug, ${naam} incluis - want wie als enige bij ${naam} ${zelfde} eindigt, is de dief.`,
      (naam, rol, zelfde, ding) => `Er is gestolen: ${ding}. ${naam}, ${rol}, droeg het bij zich en merkte pas later dat het weg was. Zet iedereen neer; de enige die daarna bij ${naam} ${zelfde} staat, heeft het.`,
    ],
  },
];

export const ZAAK_BY_ID = new Map(ZAKEN.map((z) => [z.id, z]));
