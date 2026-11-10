// De tekenset. Elk icoon is een paar lijnen in een vierkant van 24 bij 24,
// bedoeld om met een lijn getekend te worden (geen vulling), zodat ze op elke
// achtergrond werken.
//
// Welk icoon bij welk woord hoort staat NIET hier maar in
// src/content/iconen.js, en die koppeling is met de hand gemaakt. Er wordt
// niets geraden: tools/check-iconen.mjs faalt zodra er een woord in de
// content zit dat geen eigen icoon heeft.

export const ICONS = {
  // ---------------------------------------------------------- personen
  pHoed: ['M12 8.5a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M6 6h12', 'M8.5 6V4.5h7V6', 'M5 21v-1a7 7 0 0 1 14 0v1'],
  pDame: ['M12 8a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M8 9c0-4 8-4 8 0', 'M5 21v-1a7 7 0 0 1 14 0v1', 'M8 13c-1 2-1 4-1 6'],
  pKind: ['M12 10a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5Z', 'M7 21v-1a5 5 0 0 1 10 0v1', 'M12 7.5V5'],
  pArts: ['M12 4a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M5 21v-1a7 7 0 0 1 14 0v1', 'M12 14v5', 'M9.5 16.5h5'],
  pPet: ['M12 8.5a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M7 6.5h10l3 2H4Z', 'M5 21v-1a7 7 0 0 1 14 0v1'],
  pHelm: ['M12 8.5a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M6 7a6 6 0 0 1 12 0Z', 'M5 21v-1a7 7 0 0 1 14 0v1'],
  pKap: ['M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M7 10c0-5 10-5 10 0', 'M5 21v-1a7 7 0 0 1 14 0v1'],
  pKok: ['M12 9.5a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M8 7a2.5 2.5 0 1 1 2-4a2.5 2.5 0 0 1 4 0a2.5 2.5 0 1 1 2 4Z', 'M5 21v-1a7 7 0 0 1 14 0v1'],
  pStrik: ['M12 4a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M5 21v-1a7 7 0 0 1 14 0v1', 'M10 13l2 1.5l2-1.5', 'M10.5 13.5l-1 2h5l-1-2'],
  pGeleerde: ['M12 8.5a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M4 5.5l8-2.5l8 2.5l-8 2.5Z', 'M5 21v-1a7 7 0 0 1 14 0v1'],
  pJager: ['M12 8.5a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M5 21v-1a7 7 0 0 1 14 0v1', 'M17 3a7 7 0 0 1 0 8', 'M17 3v8'],
  pMagier: ['M12 10a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M7 8L12 2l5 6Z', 'M5 21v-1a7 7 0 0 1 14 0v1'],

  // -------------------------------------------------------- voorwerpen
  aansteker: ['M7 10h7a1 1 0 0 1 1 1v9H7Z', 'M11 10V7c0-2 3-2 3-4', 'M15 13h2a1 1 0 0 1 1 1v2'],
  jas: ['M8 4l4 3l4-3l3 3v13H5V7Z', 'M12 7v13'],
  revolver: ['M3 9h11l3 3h4v3h-5l-2-2H9v3H6v-3H3Z', 'M7 15l-2 5'],
  geweer: ['M3 13h14l4-4', 'M3 13v3h5l3-3', 'M13 13l2 4'],
  kaartje: ['M3 8h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4Z', 'M9 8v12', 'M14 11h4', 'M14 15h4'],
  geld: ['M3 7h18v10H3Z', 'M12 10a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5Z', 'M6 10h.01', 'M18 14h.01'],
  horloge: ['M12 6a6 6 0 1 0 0 12a6 6 0 0 0 0-12Z', 'M12 9v3.5l2.5 1.5', 'M9 6V3h6v3', 'M9 18v3h6v-3'],
  flesje: ['M9.5 3h5v3l1.5 3v12H8V9l1.5-3Z', 'M8 13h8', 'M10 3h4'],
  brief: ['M3 6h18v12H3Z', 'M3 6l9 7l9-7'],
  envelop: ['M3 6h18v12H3Z', 'M3 6l9 7l9-7', 'M12 13l3 5h-6Z'],
  cheque: ['M3 7h18v10H3Z', 'M6 11h7', 'M6 14h4', 'M15 14c2-2 3 0 4-1'],
  rapport: ['M6 3h9l4 4v14H6Z', 'M15 3v4h4', 'M9 12h7', 'M9 16h5'],
  kandelaar: ['M11 9h2v9h-2Z', 'M8 21h8', 'M12 18v3', 'M12 9c0-2-2-2-2-4s2-3 2-3s2 1.5 2 3-2 2-2 4Z'],
  karaf: ['M10 3h4v2l3 4v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9l3-4Z', 'M7 13h10'],
  handschoen: ['M8 21V9a2 2 0 0 1 4 0v3', 'M12 12V7a2 2 0 0 1 4 0v5', 'M16 12v6a3 3 0 0 1-3 3H8', 'M8 12H6a2 2 0 0 0 0 4h2'],
  poeder: ['M7 8h10l-1 12H8Z', 'M9 8V5h6v3', 'M10 13h4'],
  briefopener: ['M4 20l9-9', 'M13 11l6-6l1 1l-6 6Z', 'M11 9l4 4'],
  cel: ['M6 7h12v13H6Z', 'M9 4h6v3H9Z', 'M10 11v6', 'M14 11v6'],
  sleutel: ['M15 6a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z', 'M12 11L3 20', 'M6 17l2 2', 'M9 14l2 2'],
  spuit: ['M4 20l5-5', 'M8 14l6-6l4 4l-6 6Z', 'M14 6l4 4', 'M16 4l4 4'],
  schijf: ['M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z', 'M12 10a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z', 'M12 4v4'],
  brander: ['M5 11h8l3-3v8l-3-3H5Z', 'M16 10h4', 'M16 14h4', 'M5 11v6'],
  zekering: ['M9 4h6v16H9Z', 'M12 8v8', 'M7 4h10', 'M7 20h10'],
  logboek: ['M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2Z', 'M7 4v14', 'M10 9h5', 'M10 13h5'],
  zender: ['M12 13a2 2 0 1 0 0-4a2 2 0 0 0 0 4Z', 'M12 13v8', 'M8 6a6 6 0 0 0 0 10', 'M16 6a6 6 0 0 1 0 10'],
  wichelroede: ['M12 21V11', 'M12 11L6 4', 'M12 11l6-7', 'M9 7.5h6'],
  bloem: ['M12 11a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z', 'M12 11V8a2.5 2.5 0 1 1 2.5 2.5', 'M12 15v6', 'M10 13H7a2.5 2.5 0 1 1 2.5-2.5', 'M14 13h3a2.5 2.5 0 1 1-2.5 2.5'],
  bel: ['M12 4a6 6 0 0 1 6 6v6H6v-6a6 6 0 0 1 6-6Z', 'M4 16h16', 'M12 16v3a1.5 1.5 0 0 0 0 0Z', 'M10.5 19h3'],
  hoorn: ['M4 17c6 2 13-2 16-11', 'M4 17a4 4 0 0 0 5 3', 'M16 7l4-1'],
  veldfles: ['M8 7h8v11a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3Z', 'M10 4h4v3h-4Z', 'M8 12h8'],
  veer: ['M5 20C7 11 12 5 19 4c1 8-4 14-11 15Z', 'M5 20l7-7'],
  scherf: ['M7 3l10 4l-3 14l-6-5Z', 'M7 3l5 9l-4 7'],
  zout: ['M8 9h8l-1 11H9Z', 'M9 9V6h6v3', 'M11 12h.01', 'M13 15h.01'],
  carbidlamp: ['M8 9h8l1 11H7Z', 'M10 9V6h4v3', 'M12 2v3', 'M11 13h2'],
  touw: ['M6 4c4 2 4 6 0 8s-4 6 0 8', 'M14 4c4 2 4 6 0 8s-4 6 0 8'],
  relikwie: ['M9 7h6v13H9Z', 'M12 2v5', 'M9.5 4.5h5', 'M11 11h2'],
  krijt: ['M8 20l-2-3L15 4l3 2L9 19Z', 'M6 17l3 2'],
  kompas: ['M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18Z', 'M15 9l-2 4l-4 2l2-4Z'],
  kaarthoek: ['M4 6l6-2l6 2l4-2v14l-4 2l-6-2l-6 2Z', 'M10 4v14', 'M16 6v14'],
  bot: ['M6 18a2 2 0 1 1 2-3l6-6a2 2 0 1 1 3-2a2 2 0 1 1-2 3l-6 6a2 2 0 1 1-3 2Z'],
  toverstaf: ['M4 20L15 9', 'M15 9l5-5', 'M18 3l1 2l2 1l-2 1l-1 2l-1-2l-2-1l2-1Z', 'M6 6l.5 1.5L8 8l-1.5.5L6 10l-.5-1.5L4 8l1.5-.5Z'],
  inktvlek: ['M12 4c3 4 6 6 6 10a6 6 0 0 1-12 0c0-4 3-6 6-10Z', 'M8 19c-2 1-3 2-3 2', 'M17 19c1 .5 2 1.5 2 1.5'],
  grimoire: ['M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2Z', 'M7 4v14', 'M12 9l.7 1.7l1.8.2l-1.3 1.3l.3 1.8l-1.5-.9l-1.5.9l.3-1.8L9.5 11l1.8-.2Z'],
  vijlsel: ['M7 10h10l-1 10H8Z', 'M9 10V7h6v3', 'M10 13h.01', 'M13 15h.01', 'M11 17h.01'],
  steenhuid: ['M5 8l5-4l9 3l-2 10l-8 2Z', 'M10 4l2 9l-3 6', 'M12 13l7-6'],
  talisman: ['M12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10Z', 'M12 3v4', 'M9 3h6', 'M12 12h.01'],
  vogel: ['M6 14a5 5 0 0 1 9-3l4-1l-2 3l1 4a6 6 0 0 1-12-3Z', 'M9 11h.01', 'M8 19l2-3', 'M14 19l1-3'],

  // ------------------------------------------------------------ plekken
  trapAf: ['M3 20h5v-4h5v-4h5V8h3'],
  winkel: ['M4 9h16v11H4Z', 'M4 9l2-4h12l2 4', 'M9 20v-6h6v6'],
  kamer: ['M4 20V9l8-5l8 5v11Z', 'M10 20v-6h4v6'],
  steeg: ['M7 20V7l5-3v16', 'M12 20V8l5 3v9', 'M3 20h18'],
  apotheek: ['M5 7h14v13H5Z', 'M12 10v7', 'M8.5 13.5h7', 'M8 4h8v3H8Z'],
  hut: ['M4 20v-8l8-6l8 6v8Z', 'M10 20v-5h4v5', 'M12 3v3'],
  hotel: ['M4 20V5h16v15Z', 'M7 9h3', 'M14 9h3', 'M7 13h3', 'M14 13h3', 'M10 20v-4h4v4'],
  loods: ['M3 20V11l9-5l9 5v9Z', 'M3 11h18', 'M8 20v-6h8v6'],
  boeken: ['M5 4h4v16H5Z', 'M9 4h4v16H9Z', 'M13 5l4 1l-3 14l-4-1Z'],
  serre: ['M4 20V10l8-6l8 6v10Z', 'M12 4v16', 'M4 12h16', 'M8 7v13', 'M16 7v13'],
  biljart: ['M3 7h18v10H3Z', 'M12 10a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z', 'M6 9h.01', 'M18 15h.01'],
  gang: ['M4 4v16', 'M20 4v16', 'M8 9v6', 'M16 9v6', 'M4 12h4', 'M16 12h4'],
  wijn: ['M8 4h8l-1 5a3 3 0 0 1-6 0Z', 'M12 12v6', 'M9 21h6', 'M5 4v17', 'M19 4v17'],
  rook: ['M7 20c0-3 4-3 4-6s-3-3-3-6s2-4 2-4', 'M14 20c0-2.5 3-2.5 3-5s-2-2.5-2-5'],
  muziek: ['M10 18V6l8-2v10', 'M7 20a3 2 0 1 0 6 0a3 2 0 1 0-6 0', 'M15 16a3 2 0 1 0 6 0a3 2 0 1 0-6 0'],
  zolder: ['M3 12l9-8l9 8', 'M6 12v8h12v-8', 'M10 20v-5h4v5', 'M11 8h2'],
  centrifuge: ['M12 5a7 7 0 1 0 0 14a7 7 0 0 0 0-14Z', 'M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z', 'M12 2v3', 'M12 19v3'],
  plant: ['M12 21v-8', 'M12 13c-4 0-6-3-6-6c4 0 6 2 6 6Z', 'M12 13c4 0 6-3 6-6c-4 0-6 2-6 6Z', 'M8 21h8'],
  machine: ['M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z', 'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3', 'M5 5l2 2', 'M17 17l2 2', 'M19 5l-2 2', 'M7 17l-2 2'],
  koepel: ['M4 20h16', 'M5 20v-5a7 7 0 0 1 14 0v5', 'M12 8V4', 'M9 20v-4h6v4'],
  medisch: ['M5 7h14v13H5Z', 'M12 10v7', 'M8.5 13.5h7'],
  vracht: ['M4 7h16v13H4Z', 'M4 11h16', 'M9 7v13', 'M15 7v13'],
  slaapzaal: ['M3 18v-6h18v6', 'M3 12V8', 'M7 12V9h6v3', 'M3 20h18'],
  koker: ['M4 8h16v8H4Z', 'M8 8v8', 'M16 8v8', 'M2 10v4', 'M22 10v4'],
  doornen: ['M4 20c6-2 10-7 12-14', 'M8 15l-2-3', 'M12 11l-1-4', 'M16 7l1-4', 'M10 18l3 1'],
  wilg: ['M12 21v-7', 'M6 9a6 5 0 0 1 12 0Z', 'M8 10c-1 3-1 5-1 6', 'M12 10v7', 'M16 10c1 3 1 5 1 6'],
  toren: ['M7 21V8l5-4l5 4v13', 'M10 21v-6h4v6', 'M10 11h.01', 'M14 11h.01', 'M17 10l3 2v9'],
  poel: ['M4 15c3-3 6 1 8-1s5-2 8 1', 'M4 19c3-3 6 1 8-1s5-2 8 1', 'M8 9c1-2 3-2 4 0', 'M14 6c1-2 2-2 3 0'],
  pad: ['M9 21c0-5 6-5 6-10S9 7 9 3', 'M6 21h7', 'M12 12h6'],
  steenkring: ['M12 14a7 4 0 1 0 0-8a7 4 0 0 0 0 8Z', 'M6 8v4', 'M18 8v4', 'M12 5v3', 'M9 15h6'],
  brug: ['M3 16h18', 'M5 16a7 7 0 0 1 14 0', 'M9 16v4', 'M15 16v4'],
  eik: ['M12 21v-6', 'M12 15c-5 0-7-3-7-6s3-5 5-4c1-3 7-3 7 1c3 0 4 3 2 5s-4 4-7 4Z'],
  gewelf: ['M4 21V13a8 8 0 0 1 16 0v8', 'M9 21v-8a3 3 0 0 1 6 0v8', 'M4 13h16'],
  put: ['M5 10h14l-1.5 11h-11Z', 'M4 10l8-6l8 6', 'M12 10v11'],
  kapel: ['M5 21V10l7-6l7 6v11Z', 'M12 9v6', 'M9.5 11.5h5', 'M10 21v-4h4v4'],
  water: ['M12 3c4 4.5 6 7.3 6 10a6 6 0 0 1-12 0c0-2.7 2-5.5 6-10Z'],
  nis: ['M7 21V12a5 5 0 0 1 10 0v9Z', 'M4 21h16', 'M10 16h4'],
  schacht: ['M8 3v18', 'M16 3v18', 'M8 8h8', 'M8 14h8', 'M11 18h2'],
  graf: ['M7 21V9a5 5 0 0 1 10 0v12Z', 'M12 11v6', 'M9.5 13.5h5', 'M4 21h16'],
  spiegel: ['M12 3a5 7 0 0 1 0 14a5 7 0 0 1 0-14Z', 'M12 17v4', 'M9 21h6'],
  ketel: ['M6 8h12v9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3Z', 'M4 11h2', 'M18 11h2', 'M9 8V5h6v3'],
  herbarium: ['M5 20C5 11 11 5 20 5c0 9-6 15-15 15Z', 'M5 20c3-5 7-8 11-9.5'],
  studiecel: ['M5 4h14v16H5Z', 'M8 9h8', 'M8 13h8', 'M8 17h4', 'M5 4v16'],
  sterren: ['M12 3l2 5l5 .7l-3.6 3.5l.9 5l-4.3-2.4L7.7 17l.9-5L5 8.7L10 8Z'],
  eetzaal: ['M7 3v8a2 2 0 0 0 4 0V3', 'M9 11v10', 'M17 3c-1.5 2-2 4-2 6h4c0-2-.5-4-2-6Z', 'M17 9v12'],
  archief: ['M4 4h16v16H4Z', 'M4 9h16', 'M4 14h16', 'M10 6.5h4', 'M10 11.5h4', 'M10 16.5h4'],

  // ------------------------------------------------------------ meubels
  jukebox: ['M6 20V8a6 6 0 0 1 12 0v12Z', 'M6 14h12', 'M9 17h6', 'M12 7a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z'],
  fauteuil: ['M5 20v-6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6', 'M5 14H4a2 2 0 0 0 0 4h1', 'M19 14h1a2 2 0 0 1 0 4h-1', 'M8 11V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4'],
  kapstok: ['M12 21V6', 'M12 6a2 2 0 1 1 2-2', 'M12 9l-5 3', 'M12 9l5 3', 'M8 21h8'],
  biljarttafel: ['M3 8h18v9H3Z', 'M5 17v3', 'M19 17v3', 'M12 11a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z', 'M6 10h.01'],
  bar: ['M3 11h18', 'M5 11v9', 'M19 11v9', 'M8 11V6h8v5', 'M10 8h4'],
  kachel: ['M6 6h12v12H6Z', 'M6 18v3', 'M18 18v3', 'M9 10h6v5H9Z', 'M12 3v3'],
  telefooncel: ['M6 3h12v18H6Z', 'M9 7h6', 'M12 11h.01', 'M12 14v3'],
  kaartentafel: ['M3 10h18', 'M5 10v10', 'M19 10v10', 'M9 6l3-2l3 2l-3 2Z', 'M14 7h3'],
  vleugel: ['M4 16c0-6 7-9 15-9v6c-5 0-8 1-8 3Z', 'M4 16h7', 'M6 16v4', 'M9 16v4', 'M19 7v6'],
  kast: ['M5 3h14v18H5Z', 'M12 3v18', 'M9 11h.01', 'M15 11h.01', 'M5 8h14'],
  staandeklok: ['M7 3h10v18H7Z', 'M12 6a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z', 'M12 8v2l1.5 1', 'M12 15v4'],
  haard: ['M4 20V8h16v12Z', 'M4 8V5h16v3', 'M12 20a4 4 0 0 1-4-4c0-2.5 3-3.5 3-6c2 1.5 3 3 3 4.5c.7-.6.7-1.4.7-2c1.3 1.3 1.3 2.5 1.3 3.5a4 4 0 0 1-4 4Z'],
  buste: ['M12 4a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M7 17v-1a5 5 0 0 1 10 0v1', 'M5 17h14v4H5Z'],
  chaise: ['M3 19v-4a3 3 0 0 1 3-3h12v7', 'M3 15H2', 'M6 12V9a3 3 0 0 1 3-3', 'M5 19v2', 'M18 19v2'],
  globe: ['M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18Z', 'M3 12h18', 'M12 3c3 3.5 3 14.5 0 18c-3-3.5-3-14.5 0-18Z'],
  bestek: ['M7 3v8a2 2 0 0 0 4 0V3', 'M9 11v10', 'M17 3c-1.5 2-2 4-2 6h4c0-2-.5-4-2-6Z', 'M17 9v12'],
  console: ['M3 7h18v10H3Z', 'M6 11h4', 'M6 14h7', 'M15 11a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z', 'M8 20h8'],
  capsule: ['M4 9a8 3 0 0 1 16 0v6a8 3 0 0 1-16 0Z', 'M4 12a8 3 0 0 0 16 0', 'M9 7h6'],
  kweekbak: ['M4 13h16l-1 7H5Z', 'M9 13c0-4 2-6 3-7c1 1 3 3 3 7', 'M12 6V4'],
  kist: ['M4 9h16v11H4Z', 'M4 13h16', 'M10 9V6h4v3', 'M11 15h2'],
  automaat: ['M6 3h12v18H6Z', 'M9 7h6v4H9Z', 'M9 14h6', 'M11 17h2'],
  rek: ['M4 4h16v16H4Z', 'M4 9h16', 'M4 14h16', 'M8 4v16', 'M16 4v16'],
  noodkast: ['M6 3h12v18H6Z', 'M12 8v7', 'M9 11.5h6', 'M15 20h.01'],
  stam: ['M3 15c4-3 10-3 18 0', 'M3 15c4 3 10 3 18 0', 'M8 13v4', 'M14 12.5v5'],
  mosbank: ['M4 16h16v4H4Z', 'M6 16v-2a6 6 0 0 1 12 0v2', 'M8 11c1-1 2-1 3 0', 'M14 11c1-1 2-1 2.5 0'],
  vuur: ['M12 21a6 6 0 0 1-6-6c0-4 4-5 4-9c3 2 4 4 4 6c1-1 1-2 1-3c2 2 3 4 3 6a6 6 0 0 1-6 6Z'],
  mand: ['M4 10h16l-2 10H6Z', 'M7 10a5 5 0 0 1 10 0', 'M4 13h16'],
  drinkbak: ['M4 10h16v3a7 7 0 0 1-14 0Z', 'M6 20h12', 'M12 16v4'],
  schaal: ['M3 11h18a9 9 0 0 1-18 0Z', 'M12 20v-4', 'M8 21h8', 'M10 8c1-2 3-2 4 0'],
  nest: ['M4 14c0-3 4-5 8-5s8 2 8 5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z', 'M9 12a1 1 0 1 0 0 .01', 'M13 12a1 1 0 1 0 0 .01', 'M11 14a1 1 0 1 0 0 .01'],
  houtstapel: ['M4 9h16v5H4Z', 'M4 15h16v5H4Z', 'M9 9v5', 'M15 9v5', 'M12 15v5'],
  sarcofaag: ['M7 3h10l2 6v12H5V9Z', 'M12 8v8', 'M9.5 11h5'],
  knekelnis: ['M6 21V12a6 6 0 0 1 12 0v9Z', 'M10 14a4 4 0 1 1 4 0v2h-4Z', 'M11 13h.01', 'M13 13h.01'],
  bidbank: ['M4 20h16', 'M6 20v-5h12v5', 'M8 15V9h8', 'M12 5v4', 'M10 6.5h4'],
  waterbak: ['M4 9h16v4a8 8 0 0 1-16 0Z', 'M8 6c1-2 3-2 4 0', 'M6 20h12'],
  poort: ['M5 21V10a7 7 0 0 1 14 0v11Z', 'M12 10v11', 'M9 14h.01', 'M15 14h.01', 'M5 15h14'],
  zuil: ['M9 6v12', 'M15 6v12', 'M6 3h12v3H6Z', 'M6 18h12v3H6Z'],
  kaarsentafel: ['M3 13h18', 'M5 13v7', 'M19 13v7', 'M9 13V7', 'M15 13V8', 'M9 7c0-1.5-1.5-1.5-1.5-3S9 2 9 2s1.5 1 1.5 2S9 5.5 9 7Z'],
  haspel: ['M12 5a7 7 0 1 0 0 14a7 7 0 0 0 0-14Z', 'M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M19 12h3', 'M2 12h3'],
  stoel: ['M7 21v-5h10v5', 'M7 16V8a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8', 'M5 16h14', 'M9 21v1', 'M15 21v1'],
  krat: ['M4 7h16v13H4Z', 'M4 11h16', 'M9 7v13', 'M15 7v13'],
  bed: ['M3 19v-7h18v7', 'M3 12V7', 'M7 12V9h6v3', 'M3 19v2', 'M21 19v2'],
  fornuis: ['M4 8h16v12H4Z', 'M4 12h16', 'M7 10h.01', 'M11 10h.01', 'M15 10h.01', 'M8 15a2 2 0 1 0 4 0a2 2 0 0 0-4 0Z', 'M6 20v2', 'M18 20v2'],
  gootsteen: ['M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5Z', 'M12 12V8a3 3 0 0 1 3-3h2', 'M17 3v4', 'M8 16h.01'],
  koelkast: ['M6 3h12v18H6Z', 'M6 10h12', 'M9 6v2', 'M9 13v2'],
  vat: ['M7 4h10c1 3 1 13 0 16H7c-1-3-1-13 0-16Z', 'M5 9h14', 'M5 15h14', 'M12 4v16'],
  weegschaal: ['M12 4v14', 'M8 20h8', 'M5 9h14', 'M5 9l-2 5a3 3 0 0 0 4 0Z', 'M19 9l2 5a3 3 0 0 1-4 0Z'],
  telescoop: ['M3 15l12-6', 'M4 13l3 6', 'M13 7l5 2l2-4l-5-2Z', 'M15 15l4 5', 'M12 21h8'],
  tafel: ['M3 10h18', 'M5 10v10', 'M19 10v10', 'M7 10V7h10v3'],
  lessenaar: ['M4 18l5-12h6l5 12Z', 'M7 13h10', 'M4 21h16'],
  hemelbol: ['M12 5a7 7 0 1 0 0 14a7 7 0 0 0 0-14Z', 'M5 12h14', 'M12 5c3 3 3 11 0 14', 'M12 19v2', 'M9 21h6'],
  boekenkast: ['M4 3h16v18H4Z', 'M4 9h16', 'M4 15h16', 'M7 4v5', 'M10 4v5', 'M14 10v5', 'M17 16v5'],
  harnas: ['M12 3l6 3v6c0 5-3 8-6 9c-3-1-6-4-6-9V6Z', 'M9 10h6', 'M12 10v7'],
  kruidenkast: ['M5 3h14v18H5Z', 'M5 9h14', 'M5 15h14', 'M9 5.5c1-1 2-1 3 0', 'M13 11.5c1-1 2-1 3 0'],
  spiegelstandaard: ['M12 3a5 6 0 0 1 0 12a5 6 0 0 1 0-12Z', 'M12 15v4', 'M8 21h8', 'M10 19h4'],
  strafbank: ['M4 20h16', 'M6 20v-6h12v6', 'M6 14V9', 'M18 14V9', 'M4 9h16'],

  // -------------------------------------------------------- het verborgene
  bewijs: ['M11 4a6 6 0 1 0 0 12a6 6 0 0 0 0-12Z', 'M15.5 15.5L21 21', 'M9 10h4', 'M11 8v4'],
  valseBodem: ['M4 5h16v14H4Z', 'M4 14h16', 'M10 17l2-2l2 2', 'M8 9h8'],
  brievenbus: ['M5 9h14v11H5Z', 'M5 9a7 4 0 0 1 14 0', 'M9 13h6', 'M12 20v2'],
  draad: ['M3 17c3 0 3-6 6-6s3 6 6 6s3-6 6-6', 'M3 17v3', 'M21 11V8'],
  kluis: ['M4 4h16v16H4Z', 'M13 12a3 3 0 1 0-6 0a3 3 0 0 0 6 0Z', 'M10 9V7', 'M16 9v6'],
  oor: ['M8 21c0-4-3-4-3-10a7 7 0 0 1 14 0c0 3-2 4-4 4s-2-2-2-3', 'M10 7c1-1 3-1 3 1'],
  koffer: ['M3 8h18v12H3Z', 'M9 8V5h6v3', 'M3 13h18'],
  bloedspoor: ['M12 3c3 5 5 7 5 10a5 5 0 0 1-10 0c0-3 2-5 5-10Z', 'M6 19a1.5 1.5 0 1 0 0 .01', 'M18 20a1 1 0 1 0 0 .01'],
  testament: ['M6 3h9l4 4v14H6Z', 'M15 3v4h4', 'M9 12h6', 'M9 16h6', 'M12 19l1.5 1.5'],
  geheimeDeur: ['M4 3h16v18H4Z', 'M13 3v18', 'M11 12h.01', 'M16 12h.01', 'M13 3l-4 2v14l4 2'],
  kluisje: ['M6 4h12v16H6Z', 'M6 12h12', 'M15 8h.01', 'M15 16h.01'],
  schuilplaats: ['M4 20V11l8-6l8 6v9Z', 'M9 20v-6h6v6', 'M12 5V2'],
  schilderij: ['M4 4h16v14H4Z', 'M4 14l5-5l4 4l3-3l4 4', 'M9 8a1.5 1.5 0 1 0 0 .01', 'M10 18v3', 'M14 18v3'],
  vloerplank: ['M3 7h18v10H3Z', 'M3 11h18', 'M3 15h18', 'M10 7v4', 'M16 11v4', 'M10 13l2-2l2 2'],
  dienstbodentrap: ['M3 20h4v-4h4v-4h4V8h5', 'M3 20v-3', 'M20 8V5'],
  baken: ['M12 10a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5Z', 'M12 15v6', 'M8 6a7 7 0 0 0 0 11', 'M16 6a7 7 0 0 1 0 11', 'M9 21h6'],
  lek: ['M4 7h16v8H4Z', 'M13 15c0 3 2 3 2 5', 'M15 20a1.5 1.5 0 1 0 0 .01', 'M11 11h.01'],
  voorraad: ['M4 10h16v10H4Z', 'M4 14h16', 'M9 10V6h6v4', 'M12 14v6'],
  kabel: ['M4 6c6 0 4 12 10 12s6-8 6-8', 'M4 6V3', 'M20 10V7'],
  sensor: ['M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M7 7a7 7 0 0 0 0 10', 'M17 7a7 7 0 0 1 0 10', 'M12 3v2'],
  camera: ['M4 8h5l2-2h4l2 2h3v11H4Z', 'M12 11a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M6 4l2 2'],
  paneel: ['M4 5h16v14H4Z', 'M8 5v14', 'M16 5v14', 'M12 11v2'],
  bron: ['M12 21c-4 0-7-3-7-7c0-4 7-11 7-11s7 7 7 11c0 4-3 7-7 7Z', 'M9 15c1 2 2 3 3 3'],
  val: ['M4 12h16', 'M6 12l3 6', 'M18 12l-3 6', 'M8 12V8', 'M16 12V8', 'M8 8h8'],
  offersteen: ['M4 16l4-8h8l4 8Z', 'M8 12h8', 'M12 8V5', 'M4 19h16'],
  wezen: ['M6 17a6 6 0 0 1 12 0Z', 'M8 11a2 2 0 1 0 0 .01', 'M16 11a2 2 0 1 0 0 .01', 'M5 7l3 3', 'M19 7l-3 3'],
  omgekeerdPad: ['M15 3c0 5-6 5-6 10s6 5 6 8', 'M12 21h6', 'M9 8H4'],
  wagen: ['M4 13h14l2 4H4Z', 'M7 17a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z', 'M17 17a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z', 'M6 13V8h8v5'],
  kraai: ['M5 13a6 6 0 0 1 11-3l4-2l-2 4l1 4a7 7 0 0 1-14-3Z', 'M10 10h.01', 'M7 19l3-3', 'M15 19l1-3'],
  uitgang: ['M5 3h9v18H5Z', 'M11 12h.01', 'M14 12h7', 'M18 9l3 3l-3 3'],
  gat: ['M12 10a8 5 0 1 0 0 10a8 5 0 0 0 0-10Z', 'M12 13a5 3 0 1 0 0 4a5 3 0 0 0 0-4Z', 'M12 4v4'],
  luchtschacht: ['M7 4h10v16H7Z', 'M7 8h10', 'M7 12h10', 'M7 16h10', 'M12 2v2'],
  ingestort: ['M4 20l5-9l4 3l3-6l4 12Z', 'M9 11l1-4', 'M16 8l1-3'],
  waterput: ['M5 10h14l-1.5 11h-11Z', 'M4 10l8-6l8 6', 'M12 14v4', 'M9.5 16h5'],
  dichtgemetseld: ['M4 21V11a8 8 0 0 1 16 0v10Z', 'M4 14h16', 'M4 17.5h16', 'M9 11v3', 'M15 14v3.5', 'M12 17.5V21'],
  vleermuis: ['M12 8a3 3 0 0 0-3 3c-3-3-6-3-7-1c2 0 3 2 3 4c3 0 5 1 7 3c2-2 4-3 7-3c0-2 1-4 3-4c-1-2-4-2-7 1a3 3 0 0 0-3-3Z', 'M10 4l2 3l2-3'],
  graftombe: ['M6 21V9a6 6 0 0 1 12 0v12Z', 'M12 11v6', 'M9.5 13.5h5', 'M6 15h12', 'M3 21h18'],
  leerstoel: ['M6 20v-7a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v7', 'M9 10V5a3 3 0 0 1 6 0v5', 'M6 20v2', 'M18 20v2', 'M12 2v2'],
  illusiewand: ['M4 4h16v16H4Z', 'M12 4v16', 'M7 9c2 2 2 4 0 6', 'M17 9c-2 2-2 4 0 6'],
  versteend: ['M12 5a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M7 21v-2a5 5 0 0 1 10 0v2', 'M4 21h16', 'M9 14l6 3'],
  portaal: ['M5 21V11a7 7 0 0 1 14 0v10Z', 'M9 21v-6a3 3 0 0 1 6 0v6', 'M12 8v3', 'M10.5 9.5h3'],
  verbodenKast: ['M5 3h14v18H5Z', 'M12 3v18', 'M9 11h.01', 'M15 11h.01', 'M7 7l10 10'],
  banspreuk: ['M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z', 'M8 8l8 8', 'M12 7v3', 'M15 12h2'],
  strafhok: ['M5 5h14v16H5Z', 'M9 5v16', 'M13 5v16', 'M17 5v16', 'M5 13h14'],

  // -------------------------------------------- feestdagen en halloween
  // Deze woorden leenden eerder een icoon van iets anders: een kerstbal was
  // een talisman, een masker een spiegel, een lichtslinger een zender. Nu
  // tekent elk woord wat het is.
  masker: ['M4 8c0-2 3-3 8-3s8 1 8 3c0 6-4 11-8 11S4 14 4 8Z', 'M7 10c1-1 3-1 4 0c-1 1-3 1-4 0Z', 'M13 10c1-1 3-1 4 0c-1 1-3 1-4 0Z', 'M10 15h4'],
  gebarstenMasker: ['M4 8c0-2 3-3 8-3s8 1 8 3c0 6-4 11-8 11S4 14 4 8Z', 'M7 10c1-1 3-1 4 0c-1 1-3 1-4 0Z', 'M13 10c1-1 3-1 4 0c-1 1-3 1-4 0Z', 'M13 5l-2 6l3 3l-1 5'],
  zaklamp: ['M9 4h6v5H9Z', 'M10 9h4v11h-4Z', 'M11 13h2', 'M16 5l3-2', 'M16 7h4', 'M16 9l3 2'],
  lampion: ['M12 5c5 0 7 3 7 7s-2 7-7 7s-7-3-7-7s2-7 7-7Z', 'M12 5v14', 'M9 6c-1 4-1 9 0 12', 'M15 6c1 4 1 8 0 12', 'M10 3h4'],
  inpakpapier: ['M4 6h16v12H4Z', 'M4 12l2 1l2-1l2 1l2-1l2 1l2-1l2 1', 'M12 6v12'],
  kerstbal: ['M12 7a7 7 0 1 0 0 14a7 7 0 0 0 0-14Z', 'M10 5h4v2h-4Z', 'M12 5V3', 'M9 11c0-1 1-2 2-2'],
  lichtslinger: ['M2 5c3 6 7 6 10 0', 'M12 5c3 6 7 6 10 0', 'M5 9v2', 'M5 11a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3Z', 'M12 9v2', 'M12 11a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3Z', 'M19 9v2', 'M19 11a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3Z'],
  cadeau: ['M4 10h16v10H4Z', 'M4 7h16v3H4Z', 'M12 7v13', 'M12 7C9 3 6 5 8 7', 'M12 7c3-4 6-2 4 0'],
  snoepblik: ['M5 8h14v12H5Z', 'M4 5h16v3H4Z', 'M8 12h8', 'M8 15h5'],
  slinger: ['M2 5c5 4 15 4 20 0', 'M5 7l2 4l2-4Z', 'M11 8l2 4l2-4Z', 'M16 7l2 4l2-4Z'],
  pakje: ['M6 8h12v11H6Z', 'M12 8v11', 'M6 13h12', 'M6 8l3-3h6l3 3'],
  hoektand: ['M9 4h6l-1 9c0 3-4 3-4 0Z', 'M11 7v3'],
  pompoenpitten: ['M6 13c0-2 1-3 2-3s2 1 2 3s-1 3-2 3s-2-1-2-3Z', 'M11 11c0-2 1-3 2-3s2 1 2 3s-1 3-2 3s-2-1-2-3Z', 'M15 14c0-2 1-3 2-3s2 1 2 3s-1 3-2 3s-2-1-2-3Z', 'M4 19h16'],
  kerststol: ['M4 13c0-3 4-5 8-5s8 2 8 5s-4 5-8 5s-8-2-8-5Z', 'M15 9l1 8', 'M9 11h.01', 'M12 13h.01'],
  snoepzak: ['M6 9h12l-1 11H7Z', 'M6 9l2-3h8l2 3', 'M10 14h.01', 'M13 16h.01'],
  spin: ['M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M12 6a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3Z', 'M9 10L5 7', 'M9 12H4', 'M9 14l-4 3', 'M15 10l4-3', 'M15 12h5', 'M15 14l4 3'],
  pompoen: ['M12 7c5 0 8 3 8 7s-3 6-8 6s-8-2-8-6s3-7 8-7Z', 'M9 8c-1 4-1 8 0 11', 'M15 8c1 4 1 8 0 11', 'M12 7V4', 'M12 4h2'],
  toffee: ['M8 9h8v6H8Z', 'M8 10L5 8v8l3-2', 'M16 10l3-2v8l-3-2'],
  marsepein: ['M5 8h14v11H5Z', 'M5 11h14', 'M8 14h3v3H8Z', 'M13 14h3v3h-3Z'],
  kaars: ['M10 8h4v12h-4Z', 'M12 8c0-2-2-2-2-4s2-3 2-3s2 1 2 3s-2 2-2 4Z', 'M8 20h8'],
  laken: ['M5 6h14v9c0 3-3 2-4 4c-1-2-2-2-3 0c-1-2-2-2-3 0c-1-2-4-1-4-4Z', 'M12 6v7'],
  deken: ['M4 9h16v10H4Z', 'M4 12h16', 'M4 15.5h16', 'M16 9l4-3v3'],

  // -------------------------------------------------------------- tijd
  klok: ['M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z', 'M12 8v4.5l3 2'],

  // ------------------------------------------------- bij daglicht: zwembad
  // Het openluchtbad en het dierenpark zijn er later bij gekomen, en geen
  // van de bestaande iconen paste erop. Hergebruikt is alleen wat echt
  // hetzelfde ding is (een winkel is een winkel), de rest is getekend.
  handdoek: ['M4 5h16', 'M7 5v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V5', 'M7 9h10'],
  duikbril: ['M7 10a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M17 10a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M10 13h4', 'M4 13H2', 'M20 13h2'],
  waterijsje: ['M8 3h8v12a4 4 0 0 1-8 0Z', 'M11 19h2v3h-2Z', 'M8 9h8'],
  zwemband: ['M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z', 'M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M17.5 7.5h.01'],
  munt: ['M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z', 'M12 8v8', 'M9.5 10h5', 'M9.5 14h5'],
  zonnebril: ['M3 10h8v3a4 4 0 0 1-8 0Z', 'M13 10h8v3a4 4 0 0 1-8 0Z', 'M11 11h2', 'M3 10l2-3', 'M21 10l-2-3'],
  chipszak: ['M7 8h10v12H7Z', 'M7 8l2-4h6l2 4', 'M9 4l1.5 1.5L12 4l1.5 1.5L15 4', 'M10 12h4'],
  slipper: ['M12 3c3.5 0 5 4 5 9s-1.5 9-5 9s-5-4-5-9s1.5-9 5-9Z', 'M12 7v2', 'M12 9l-3 3', 'M12 9l3 3'],
  ondiepbad: ['M2 11h20v5a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4Z', 'M2 14c3.5 1.5 7-1.5 10 0s6.5 1.5 10 0', 'M5 20v-3h4v-3h4'],
  diepbad: ['M4 10h16v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z', 'M4 13c3 1.5 5-1.5 8 0s5 1.5 8 0', 'M14 3h6', 'M17 3v7'],
  ligstoel: ['M2 15h12a1 1 0 0 1 0 2H2Z', 'M14 16l5-5l1.5 1.5l-5 5Z', 'M4 17v4', 'M12 17v4'],
  kleedhokje: ['M5 4h14v16H5Z', 'M5 8c2 1.5 4-1.5 7 0s5 1.5 7 0', 'M12 8v12'],
  douchekop: ['M12 3v4', 'M6 9a6 6 0 0 1 12 0Z', 'M9 13v2', 'M12 13v3', 'M15 13v2'],
  glijbaan: ['M16 4v16', 'M20 4v16', 'M16 8h4', 'M16 12h4', 'M16 16h4', 'M16 5C10 6 6 11 5 20'],
  zon: ['M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8Z', 'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3', 'M5 5l2 2', 'M17 17l2 2', 'M19 5l-2 2', 'M7 17l-2 2'],
  fiets: ['M6 14a4 4 0 1 0 0 8a4 4 0 0 0 0-8Z', 'M18 14a4 4 0 1 0 0 8a4 4 0 0 0 0-8Z', 'M6 18l5-7h5l2 7', 'M11 11h5', 'M9 8h3l-1 3'],
  tribune: ['M3 20h18', 'M4 20v-3h4v-4h4v-4h4V5h3', 'M8 17h4', 'M12 13h4', 'M16 9h3'],
  hek: ['M3 9h18', 'M3 15h18', 'M6 5v15', 'M12 5v15', 'M18 5v15'],
  tas: ['M5 10h14v10H5Z', 'M8 10V8a4 4 0 0 1 8 0v2', 'M5 14h14'],
  tegel: ['M3 7h8v8H3Z', 'M13 7h8v8h-8Z', 'M3 17h8v4H3Z', 'M13 17l7-1l1 5h-8Z'],
  rugzak: ['M7 10h10v10H7Z', 'M9 10a3 3 0 0 1 6 0', 'M9 15h6v5H9Z', 'M10 7v3', 'M14 7v3'],

  // --------------------------------------------- bij daglicht: dierentuin
  ijsje: ['M12 3a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4Z', 'M7 8h10l-5 13Z', 'M9 12h6'],
  voerzak: ['M7 8h10l1 12H6Z', 'M7 8c0-2 10-2 10 0', 'M9 5l1 3', 'M15 5l-1 3', 'M9 14h6'],
  verrekijker: ['M5 9h5v8a2.5 2.5 0 0 1-5 0Z', 'M14 9h5v8a2.5 2.5 0 0 1-5 0Z', 'M10 12h4', 'M6 9V6h3v3', 'M15 9V6h3v3'],
  knuffel: ['M12 10a5.5 5.5 0 1 0 0 11a5.5 5.5 0 0 0 0-11Z', 'M8 8a2.2 2.2 0 1 0 0 4.4a2.2 2.2 0 0 0 0-4.4Z', 'M16 8a2.2 2.2 0 1 0 0 4.4a2.2 2.2 0 0 0 0-4.4Z', 'M12 15a2.5 2 0 1 0 0 4a2.5 2 0 0 0 0-4Z', 'M10 14h.01', 'M14 14h.01'],
  beker: ['M6 8h12l-1 12H7Z', 'M6 11h12', 'M13 3l-2 5'],
  aap: ['M12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10Z', 'M12 11a3 3 0 1 0 0 6a3 3 0 0 0 0-6Z', 'M6 9a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z', 'M18 9a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z', 'M10.5 10h.01', 'M13.5 10h.01'],
  giraf: ['M3 13a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z', 'M5 18v4', 'M11 18v4', 'M10.5 11.5l3.5-5.5l2 1l-3.5 5.5Z', 'M14 3h4a1.5 1.5 0 0 1 0 3h-4Z', 'M15 3V1.5', 'M17.2 3V1.5', 'M6 14h.01', 'M9 15.5h.01'],
  vlinder: ['M12 6v12', 'M12 9c-1-4-7-5-8-1s3 7 8 3Z', 'M12 9c1-4 7-5 8-1s-3 7-8 3Z', 'M12 13c-1 3-5 5-7 3s0-4 7-3Z', 'M12 13c1 3 5 5 7 3s0-4-7-3Z', 'M11 5L9 3', 'M13 5l2-2'],
  boerderij: ['M3 20V11l9-6l9 6v9Z', 'M9 20v-7h6v7', 'M9 13l6 7', 'M15 13l-6 7'],
  pinguin: ['M12 3c3 0 4.5 3 4.5 7v4a4.5 4.5 0 0 1-9 0v-4c0-4 1.5-7 4.5-7Z', 'M12 9c1.6 0 2.5 2 2.5 4s-.9 4-2.5 4s-2.5-2-2.5-4s.9-4 2.5-4Z', 'M10.5 6h.01', 'M13.5 6h.01', 'M11 7.5l1 1.5l1-1.5Z', 'M9 19l-2 3', 'M15 19l2 3'],
  speeltuin: ['M3 21L7 4h10l4 17', 'M7 4h10', 'M9 5v9', 'M15 5v9', 'M8.5 14h7'],
  pootkruis: ['M10 13a3.5 3 0 1 0 0 6a3.5 3 0 0 0 0-6Z', 'M6 10h.01', 'M9 8.5h.01', 'M12.5 9h.01', 'M18 4v7', 'M14.5 7.5h7'],
  uil: ['M12 6a6 6 0 0 1 6 6v3a6 6 0 0 1-12 0v-3a6 6 0 0 1 6-6Z', 'M9 12h.01', 'M15 12h.01', 'M12 14l-1.5 2h3Z', 'M7 7L6 4', 'M17 7l1-3'],
  picknicktafel: ['M3 9h18', 'M7 9L4 20', 'M17 9l3 11', 'M5 15h14'],
  emmer: ['M5 9h14l-2 11H7Z', 'M5 9h14', 'M7 9a5 5 0 0 1 10 0'],
  bordje: ['M5 6l14-2v7L5 13Z', 'M12 11v9', 'M9 20h6'],
  voerspoor: ['M3 17c5-1 7-6 12-7', 'M5 16h.01', 'M8 14.5h.01', 'M11 12.5h.01', 'M14 11h.01', 'M17 10h.01', 'M20 9.5h.01'],
  kinderwagen: ['M4 13h14a7 7 0 0 0-7-7H4Z', 'M4 13h14', 'M7 17a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z', 'M16 17a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z', 'M18 13l3-6'],

  // --------------------------------------------- Sterrenschip Zwaluw
  tube: ['M7 4h10l-1.5 12h-7Z', 'M10 16h4v4h-4Z', 'M9 8h6', 'M9.5 11h5'],
  robotje: ['M7 9h10v9H7Z', 'M10 6h4v3h-4Z', 'M12 3v3', 'M10 12h.01', 'M14 12h.01', 'M10 15h4', 'M7 12H5', 'M17 12h2', 'M9 18v3', 'M15 18v3'],
  stuur: ['M12 5a7 7 0 1 0 0 14a7 7 0 0 0 0-14Z', 'M12 10a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z', 'M5 12h5', 'M14 12h5', 'M12 14v5'],
  kern: ['M8 3h8v3H8Z', 'M8 18h8v3H8Z', 'M9 6h6v12H9Z', 'M12.5 8l-2 4h3l-2 4'],
  holo: ['M6 20h12', 'M8 20l2-4h4l2 4', 'M12 4a4 4 0 1 0 0 8a4 4 0 0 0 0-8Z', 'M5 9c3 2.5 11 2.5 14 0'],
  raket: ['M12 3c3 2 4 6 4 10l-2 3h-4l-2-3c0-4 1-8 4-10Z', 'M12 8a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3Z', 'M8 13l-3 3v2l4-2', 'M16 13l3 3v2l-4-2', 'M11 19l1 3l1-3'],
  sprong: ['M3 12h5', 'M4 8h6', 'M4 16h6', 'M12 10a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z', 'M15 12h6', 'M15 9l5-3', 'M15 15l5 3'],

  // ------------------------------------------------------------ Hoogstad
  skateboard: ['M3 13h18', 'M4 13c0 1.5 1 2 2 2h12c1 0 2-.5 2-2', 'M7 17a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3Z', 'M17 17a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3Z'],
  telefoon: ['M7 3h10v18H7Z', 'M10 18h4', 'M10 5h4', 'M9 9l3 3l-2 3'],
  oortje: ['M10 5a4 4 0 0 1 4 4v1a3 3 0 0 1-3 3v5a2 2 0 0 1-4 0v-9a4 4 0 0 1 3-4Z', 'M15 6a5 5 0 0 1 2 5'],
  friet: ['M6 11h12l-2 10H8Z', 'M8 11V4', 'M11 11V3', 'M14 11V4', 'M17 11V6', 'M7 15h10'],
  pet: ['M4 15a8 8 0 0 1 16 0Z', 'M4 15h17l-2 2H4Z', 'M12 7v2'],
  koptelefoon: ['M4 15v-3a8 8 0 0 1 16 0v3', 'M4 14h3v6H4Z', 'M17 14h3v6h-3Z'],
  lift: ['M5 3h14v18H5Z', 'M12 3v18', 'M8 8l1.5-2l1.5 2', 'M13 16l1.5 2l1.5-2'],
  gamepad: ['M7 8h10a4 4 0 0 1 4 4v3a3 3 0 0 1-5 2l-1-1H9l-1 1a3 3 0 0 1-5-2v-3a4 4 0 0 1 4-4Z', 'M8 11v4', 'M6 13h4', 'M16 12h.01', 'M18 14h.01'],
  metro: ['M6 4h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z', 'M4 11h16', 'M8 14h.01', 'M16 14h.01', 'M7 18l-2 3', 'M17 18l2 3'],
  film: ['M4 6h16v12H4Z', 'M8 6v12', 'M16 6v12', 'M4 10h4', 'M4 14h4', 'M16 10h4', 'M16 14h4'],
  wasmachine: ['M5 3h14v18H5Z', 'M5 7h14', 'M12 10a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9Z', 'M8 5h.01', 'M11 5h.01'],
  halter: ['M3 10v4', 'M6 7v10', 'M18 7v10', 'M21 10v4', 'M6 12h12'],
};

import { icoonVan } from '../content/iconen.js';

const NS = 'http://www.w3.org/2000/svg';

// Bouwt de paden van een icoon in een bestaande <svg> of <g>.
export function tekenIcoon(ouder, naam, { x = 0, y = 0, grootte = 24, klasse = 'icoon' } = {}) {
  const paden = ICONS[naam];
  if (!paden) return null;
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('transform', `translate(${x} ${y}) scale(${grootte / 24})`);
  g.setAttribute('class', klasse);
  for (const d of paden) {
    const pad = document.createElementNS(NS, 'path');
    pad.setAttribute('d', d);
    g.append(pad);
  }
  ouder.append(g);
  return g;
}

// Een los <svg> met het icoon van dit woord, voor naast een tekstregel.
// Staat het woord niet in de koppeling, dan tekenen we niets - liever leeg
// dan het verkeerde plaatje. De keuring zorgt dat dat niet voorkomt.
export function icoonElement(woord, grootte = 18) {
  const naam = icoonVan(woord);
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', grootte);
  svg.setAttribute('height', grootte);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'glyph');
  if (naam) tekenIcoon(svg, naam, { grootte: 24, klasse: '' });
  return svg;
}
