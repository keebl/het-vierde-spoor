// Meubels als tekeningen, niet als pictogrammen.
//
// Een dun lijntje in een bruin blokje ziet er niet uit als een koelkast. Deze
// set is gevuld en in kleur, in een vierkant van 48 bij 48, en wordt
// rechtstreeks op de vloer gezet - zoals een meubelstuk op een speelbord
// gewoon op de vloer staat.
//
// Elk onderdeel is een pad met een eigen kleur. De kleuren komen uit een
// kleine palet: hout, wit porselein, metaal, groen, steen, stof, spiegelglas
// en goud voor vlammen en koper. Daardoor hangen de meubels visueel samen,
// ook al staan ze in verschillende kamers.
//
// Elk meubelstuk heeft zijn EIGEN tekening. Eerder leenden meerdere namen
// hetzelfde plaatje - een aanrecht zag uit als een tafel, een slijpsteen als
// een touwhaspel, een wandklok als een staande klok. Dat is precies de fout
// die een puzzelaar meteen ziet, dus tools/check-kamers.mjs faalt nu zodra
// twee meubelnamen dezelfde tekening gebruiken of een naam geen tekening
// heeft.
//
// Twee regels voor de paden zelf, ook afgedwongen door die toets:
//   - een pad met een vulling moet een vlak omsluiten (dus eindigen op Z).
//     Een open pad met een vulling tekent niets, en dat zie je niet in de
//     code maar wel op het bord: een waterput zonder dak.
//   - een meubelstuk staat op de vloer: de onderkant hoort onderin het
//     vierkant te liggen, anders zweeft het. Zo is het zwevende bed gevonden.

export const MEUBELKUNST = {
  fornuis: [
    ['M9 15h30v25H9Z', '#9aa3ac'],
    ['M9 15h30v6H9Z', '#3b4650'],
    ['M13 24h22v13H13Z', '#ece7dd'],
    ['M15 17.5a2 2 0 1 0 0 4a2 2 0 1 0 0 -4Z', '#737c86'],
    ['M22 17.5a2 2 0 1 0 0 4a2 2 0 1 0 0 -4Z', '#737c86'],
    ['M29 17.5a2 2 0 1 0 0 4a2 2 0 1 0 0 -4Z', '#737c86'],
    ['M17 29h14v2H17Z', '#737c86'],
  ],
  gootsteen: [
    ['M30 7h3v13h-3Z', '#9aa3ac'],
    ['M21 7h12v3H21Z', '#9aa3ac'],
    ['M21 10h3v5h-3Z', '#737c86'],
    ['M6 18h36v5H6Z', '#ece7dd'],
    ['M6 18h36v2H6Z', '#fffdf7'],
    ['M11 20h26v14H11Z', '#737c86'],
    ['M13 22h22v10H13Z', '#8b9399'],
    ['M24 26a2 2 0 1 0 0 4a2 2 0 1 0 0 -4Z', '#737c86'],
    ['M9 23h3v19H9Z', '#9aa3ac'],
    ['M36 23h3v19h-3Z', '#9aa3ac'],
  ],
  koelkast: [
    ['M14 7h20v34H14Z', '#ece7dd'],
    ['M14 19h20v1.5H14Z', '#737c86'],
    ['M30 11h2v6h-2Z', '#9aa3ac'],
    ['M30 23h2v6h-2Z', '#9aa3ac'],
  ],
  haard: [
    ['M7 12h34v29H7Z', '#ada69a'],
    ['M14 22h20v19H14Z', '#3b4650'],
    ['M24 38c-4 0-6-3-6-6c0-3 3-4 3-7c3 2 4 4 4 6c1-1 1-2 1-3c2 2 3 3 3 5c0 3-2 5-5 5Z', '#d9a235'],
  ],
  fauteuil: [
    ['M11 23h26v13H11Z', '#a8543c'],
    ['M13 13h22v11H13Z', '#a8543c'],
    ['M7 22h6v14H7Z', '#a8543c'],
    ['M35 22h6v14h-6Z', '#a8543c'],
    ['M13 36h3v5h-3Z', '#8a6134'],
    ['M32 36h3v5h-3Z', '#8a6134'],
  ],
  staandeklok: [
    ['M16 5h16v36H16Z', '#8a6134'],
    ['M16 5h16v4H16Z', '#a87c4a'],
    ['M24 11a7 7 0 1 0 0 14a7 7 0 1 0 0 -14Z', '#ece7dd'],
    ['M24 14v4.5l3 2', '#3b4650', 'lijn'],
    ['M22 27h4v11h-4Z', '#d9a235'],
  ],
  vleugel: [
    ['M6 8h20c10 0 16 6 16 13c0 6-5 9-12 9H6Z', '#3b4650'],
    ['M6 8h20c10 0 16 6 16 13h-3c0-6-5-10-13-10H6Z', '#737c86'],
    ['M6 30h22v8H6Z', '#fffdf7'],
    ['M9 30h2v5H9Z', '#3b4650'],
    ['M13 30h2v5h-2Z', '#3b4650'],
    ['M18 30h2v5h-2Z', '#3b4650'],
    ['M22 30h2v5h-2Z', '#3b4650'],
    ['M6 38h22v2H6Z', '#6b4824'],
    ['M32 30h3v10h-3Z', '#3b4650'],
  ],
  buste: [
    ['M14 36h20v6H14Z', '#ada69a'],
    ['M16 32h16v4H16Z', '#9d968a'],
    ['M17 32c0-7 3-10 7-10s7 3 7 10Z', '#ece7dd'],
    ['M24 10a6 6 0 1 0 0 12a6 6 0 1 0 0 -12Z', '#ece7dd'],
    ['M18 14c0-5 3-8 6-8s6 3 6 8c-2-3-4-4-6-4s-4 1-6 4Z', '#ada69a'],
    ['M22 15.1a0.9 0.9 0 1 0 0 1.8a0.9 0.9 0 1 0 0 -1.8Z', '#9d968a'],
    ['M26 15.1a0.9 0.9 0 1 0 0 1.8a0.9 0.9 0 1 0 0 -1.8Z', '#9d968a'],
  ],
  boekenkast: [
    ['M10 6h28v35H10Z', '#8a6134'],
    ['M10 17h28v2H10Z', '#6b4824'],
    ['M10 29h28v2H10Z', '#6b4824'],
    ['M13 8h3v9h-3Z', '#a8543c'],
    ['M17 8h3v9h-3Z', '#6f9a5a'],
    ['M21 9h3v8h-3Z', '#3b4650'],
    ['M13 20h3v9h-3Z', '#d9a235'],
    ['M17 21h4v8h-4Z', '#a8543c'],
    ['M26 32h4v9h-4Z', '#6f9a5a'],
  ],
  lessenaar: [
    ['M10 20h28l-4-10H14Z', '#a87c4a'],
    ['M16 12h16l2 6H14Z', '#fffdf7'],
    ['M24 12v6', '#b9b0a0', 'lijn'],
    ['M10 20h28v3H10Z', '#8a6134'],
    ['M22 23h4v14h-4Z', '#8a6134'],
    ['M16 37h16v5H16Z', '#8a6134'],
  ],
  globe: [
    ['M24 10a13 13 0 1 0 0 26a13 13 0 1 0 0 -26Z', '#6f9a5a'],
    ['M11 23h26', '#3b4650', 'lijn'],
    ['M24 10c5 6 5 20 0 26c-5-6-5-20 0-26Z', '#3b4650'],
    ['M22 36h4v4h-4Z', '#8a6134'],
    ['M16 40h16v2H16Z', '#8a6134'],
  ],
  stoel: [
    ['M14 24h20v4H14Z', '#a87c4a'],
    ['M15 10h18v14H15Z', '#8a6134'],
    ['M15 28h3v13h-3Z', '#8a6134'],
    ['M30 28h3v13h-3Z', '#8a6134'],
  ],
  kaartentafel: [
    ['M7 20h34v4H7Z', '#a87c4a'],
    ['M11 24h3v17h-3Z', '#8a6134'],
    ['M34 24h3v17h-3Z', '#8a6134'],
    ['M14 12h20v8H14Z', '#ece7dd'],
    ['M17 15h14', '#737c86', 'lijn'],
    ['M17 18h9', '#737c86', 'lijn'],
  ],
  vat: [
    ['M13 8h22c2 7 2 25 0 32H13c-2-7-2-25 0-32Z', '#8a6134'],
    ['M10 15h28v3H10Z', '#9aa3ac'],
    ['M10 29h28v3H10Z', '#9aa3ac'],
  ],
  krat: [
    ['M9 14h30v26H9Z', '#a87c4a'],
    ['M9 22h30v2H9Z', '#6b4824'],
    ['M9 31h30v2H9Z', '#6b4824'],
    ['M22 14h3v26h-3Z', '#6b4824'],
  ],
  bed: [
    ['M6 11h6v27H6Z', '#8a6134'],
    ['M36 19h6v19h-6Z', '#8a6134'],
    ['M9 24h30v11H9Z', '#ece7dd'],
    ['M9 29h30v6H9Z', '#a8543c'],
    ['M12 25h9v4h-9Z', '#fffdf7'],
    ['M7 35h4v7H7Z', '#6b4824'],
    ['M37 35h4v7h-4Z', '#6b4824'],
  ],
  mosbank: [
    ['M9 26h30v6H9Z', '#ada69a'],
    ['M12 32h4v9h-4Z', '#ada69a'],
    ['M32 32h4v9h-4Z', '#ada69a'],
    ['M9 23c4-3 8-3 11 0c4-3 8-3 11 0c3-2 6-2 8 0v3H9Z', '#6f9a5a'],
  ],
  kapstok: [
    ['M21 3h6v4h-6Z', '#3b4650'],
    ['M19 7h10v3H19Z', '#3b4650'],
    ['M22 10h4v28h-4Z', '#8a6134'],
    ['M16 14h16v3H16Z', '#8a6134'],
    ['M15 13.5a2 2 0 1 0 0 4a2 2 0 1 0 0 -4Z', '#6b4824'],
    ['M33 13.5a2 2 0 1 0 0 4a2 2 0 1 0 0 -4Z', '#6b4824'],
    ['M28 17c5 1 6 7 5 13h-9c-1-7 0-12 4-13Z', '#a8543c'],
    ['M14 38h20v4H14Z', '#8a6134'],
  ],
  harnas: [
    ['M22 3h4v3h-4Z', '#737c86'],
    ['M18 6h12v9H18Z', '#9aa3ac'],
    ['M19 10h10v2H19Z', '#3b4650'],
    ['M21 15h6v2h-6Z', '#737c86'],
    ['M11 17h6v6h-6Z', '#737c86'],
    ['M31 17h6v6h-6Z', '#737c86'],
    ['M16 17h16v14c0 4-4 6-8 7c-4-1-8-3-8-7Z', '#9aa3ac'],
    ['M12 23h4v10h-4Z', '#9aa3ac'],
    ['M32 23h4v10h-4Z', '#9aa3ac'],
    ['M16 28h16v2H16Z', '#d9a235'],
    ['M19 38h4v4h-4Z', '#737c86'],
    ['M25 38h4v4h-4Z', '#737c86'],
  ],
  ketel: [
    ['M11 16h26v15a7 7 0 0 1-7 7H18a7 7 0 0 1-7-7Z', '#9aa3ac'],
    ['M8 20h3v4H8Z', '#737c86'],
    ['M37 20h3v4h-3Z', '#737c86'],
    ['M18 11h12v5H18Z', '#737c86'],
    ['M15 40h18v2H15Z', '#3b4650'],
  ],
  houtstapel: [
    ['M8 20h32v10H8Z', '#8a6134'],
    ['M8 30h32v10H8Z', '#a87c4a'],
    ['M14 22a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#6b4824'],
    ['M27 22a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#6b4824'],
    ['M20 32a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#6b4824'],
    ['M33 32a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#6b4824'],
  ],
  drinkbak: [
    ['M8 22h32v10a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6Z', '#8a6134'],
    ['M11 24h26v5H11Z', '#3b4650'],
    ['M14 38h4v4h-4Z', '#8a6134'],
    ['M30 38h4v4h-4Z', '#8a6134'],
  ],
  vuur: [
    ['M24 38c-6 0-10-4-10-9c0-5 5-7 5-12c5 3 6 6 6 9c2-2 2-3 2-5c3 3 5 6 5 9c0 5-3 8-8 8Z', '#d9a235'],
    ['M9 38h30v4H9Z', '#ada69a'],
    ['M12 36a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#ada69a'],
    ['M34 36a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#ada69a'],
  ],
  stam: [
    ['M6 20h32v12H6Z', '#8a6134'],
    ['M38 20a5 6 0 1 0 0 12a5 6 0 1 0 0 -12Z', '#a87c4a'],
    ['M38 24a2 2.5 0 1 0 0 5a2 2.5 0 1 0 0 -5Z', '#6b4824'],
    ['M12 32l-3 8', '#8a6134', 'lijn'],
  ],
  put: [
    ['M10 12l14-8l14 8Z', '#a8543c'],
    ['M14 12h3v16h-3Z', '#8a6134'],
    ['M31 12h3v16h-3Z', '#8a6134'],
    ['M24 14v6', '#6b4824', 'lijn'],
    ['M12 26h24v4H12Z', '#ada69a'],
    ['M13 30h22l-1 11H14Z', '#ada69a'],
    ['M16 30h16v3H16Z', '#9d968a'],
    ['M21 20h6v5h-6Z', '#8a6134'],
  ],
  sarcofaag: [
    ['M12 14h24l3 8v19H9V22Z', '#ada69a'],
    ['M9 22h30v3H9Z', '#737c86'],
    ['M20 28h8v10h-8Z', '#737c86'],
    ['M24 29v8', '#ada69a', 'lijn'],
  ],
  knekelnis: [
    ['M10 41V20a14 14 0 0 1 28 0v21Z', '#ada69a'],
    ['M16 41V23a8 8 0 0 1 16 0v18Z', '#3b4650'],
    ['M24 22a7 7 0 0 1 7 7v4l-2 1v4H19v-4l-2-1v-4a7 7 0 0 1 7-7Z', '#ece7dd'],
    ['M21 29a1.6 1.6 0 1 0 0 3.2a1.6 1.6 0 1 0 0 -3.2Z', '#3b4650'],
    ['M27 29a1.6 1.6 0 1 0 0 3.2a1.6 1.6 0 1 0 0 -3.2Z', '#3b4650'],
  ],
  zuil: [
    ['M19 11h10v26H19Z', '#ada69a'],
    ['M14 6h20v5H14Z', '#ece7dd'],
    ['M14 37h20v5H14Z', '#ece7dd'],
    ['M22 11v26', '#737c86', 'lijn'],
    ['M26 11v26', '#737c86', 'lijn'],
  ],
  bidbank: [
    ['M16 10h16v20H16Z', '#a87c4a'],
    ['M16 10h16v3H16Z', '#8a6134'],
    ['M22.5 16h3v9h-3Z', '#d9a235'],
    ['M19 19h10v3H19Z', '#d9a235'],
    ['M12 30h24v4H12Z', '#a87c4a'],
    ['M14 34h3v8h-3Z', '#8a6134'],
    ['M31 34h3v8h-3Z', '#8a6134'],
    ['M16 38h16v2H16Z', '#8a6134'],
  ],
  kaarsentafel: [
    ['M8 26h32v4H8Z', '#a87c4a'],
    ['M12 30h3v11h-3Z', '#8a6134'],
    ['M33 30h3v11h-3Z', '#8a6134'],
    ['M16 14h4v12h-4Z', '#ece7dd'],
    ['M22 10h4v16h-4Z', '#ece7dd'],
    ['M28 16h4v10h-4Z', '#ece7dd'],
    ['M18 14c0-2-2-2-2-4s2-3 2-3s2 1 2 3-2 2-2 4Z', '#d9a235'],
    ['M24 10c0-2-2-2-2-4s2-3 2-3s2 1 2 3-2 2-2 4Z', '#d9a235'],
  ],
  kweekbak: [
    ['M9 26h30l-3 15H12Z', '#8a6134'],
    ['M24 26c0-8-4-12-7-14c0 6 2 10 7 14Z', '#6f9a5a'],
    ['M24 26c0-8 4-12 7-14c0 6-2 10-7 14Z', '#6f9a5a'],
    ['M24 26V14', '#6f9a5a', 'lijn'],
  ],
  kruidenkast: [
    ['M10 7h28v35H10Z', '#8a6134'],
    ['M13 10h22v29H13Z', '#6b4824'],
    ['M13 20h22v2H13Z', '#a87c4a'],
    ['M13 30h22v2H13Z', '#a87c4a'],
    ['M17 12h2v2h-2Z', '#6f9a5a'],
    ['M16 14h4v6h-4Z', '#6f9a5a'],
    ['M23 11h2v2h-2Z', '#d9a235'],
    ['M22 13h4v7h-4Z', '#d9a235'],
    ['M29 13h2v2h-2Z', '#cdd9e0'],
    ['M28 15h4v5h-4Z', '#cdd9e0'],
    ['M17 23h2v2h-2Z', '#d9a235'],
    ['M16 25h4v5h-4Z', '#d9a235'],
    ['M23 22h2v2h-2Z', '#cdd9e0'],
    ['M22 24h4v6h-4Z', '#cdd9e0'],
    ['M29 23h2v2h-2Z', '#6f9a5a'],
    ['M28 25h4v5h-4Z', '#6f9a5a'],
    ['M17 33h10v6H17Z', '#ada69a'],
    ['M28 32h2v7h-2Z', '#a87c4a'],
  ],
  weegschaal: [
    ['M23 9h2v28h-2Z', '#9aa3ac'],
    ['M16 40h16v3H16Z', '#9aa3ac'],
    ['M9 15h30v2H9Z', '#9aa3ac'],
    ['M4 17h12l-6 7Z', '#737c86'],
    ['M32 17h12l-6 7Z', '#737c86'],
    ['M24 6a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#d9a235'],
  ],
  telescoop: [
    ['M8 32l22-13', '#737c86', 'lijn'],
    ['M26 13l10 5l-4 9l-10-5Z', '#3b4650'],
    ['M33 15l5 2l-2 5l-5-2Z', '#9aa3ac'],
    ['M24 24l-6 17', '#9aa3ac', 'lijn'],
    ['M30 27l4 14', '#9aa3ac', 'lijn'],
    ['M14 41h20v2H14Z', '#737c86'],
  ],
  hemelbol: [
    ['M24 7a13 13 0 1 0 0 26a13 13 0 1 0 0 -26Z', '#3b4650'],
    ['M18 13l2 2l-2 2l-2 -2Z', '#d9a235'],
    ['M28 11l2 2l-2 2l-2 -2Z', '#d9a235'],
    ['M30 21l2 2l-2 2l-2 -2Z', '#d9a235'],
    ['M19 24.5l1.5 1.5l-1.5 1.5l-1.5 -1.5Z', '#fffdf7'],
    ['M25 18.5l1.5 1.5l-1.5 1.5l-1.5 -1.5Z', '#fffdf7'],
    ['M11 20h26', '#d9a235', 'lijn'],
    ['M11 20a13 13 0 0 1 26 0', '#d9a235', 'lijn'],
    ['M24 33v5', '#8a6134', 'lijn'],
    ['M18 37h12v2h-12Z', '#8a6134'],
    ['M15 39h18v3H15Z', '#8a6134'],
  ],
  aanrecht: [
    ['M18 11h12l-2 7h-8Z', '#fffdf7'],
    ['M17 10h14v2H17Z', '#d8d2c6'],
    ['M4 18h40v4H4Z', '#737c86'],
    ['M7 22h34v18H7Z', '#ece7dd'],
    ['M10 25h13v13H10Z', '#d8d2c6'],
    ['M25 25h13v13H25Z', '#d8d2c6'],
    ['M20 30h2v4h-2Z', '#737c86'],
    ['M26 30h2v4h-2Z', '#737c86'],
    ['M7 40h34v2H7Z', '#9aa3ac'],
  ],
  provisiekast: [
    ['M9 6h30v36H9Z', '#8a6134'],
    ['M12 9h24v30H12Z', '#6b4824'],
    ['M12 19h24v2H12Z', '#a87c4a'],
    ['M12 29h24v2H12Z', '#a87c4a'],
    ['M15 12h5v7h-5Z', '#ece7dd'],
    ['M15 11h5v1.5h-5Z', '#d9a235'],
    ['M22 13h5v6h-5Z', '#ece7dd'],
    ['M22 12h5v1.5h-5Z', '#d9a235'],
    ['M29 14h5v5h-5Z', '#ece7dd'],
    ['M29 13h5v1.5h-5Z', '#d9a235'],
    ['M15 24h7v5h-7Z', '#c89a5e'],
    ['M26 22h8l1 7h-10Z', '#e5ded0'],
    ['M15 34h5v5h-5Z', '#ece7dd'],
    ['M22 33h5v6h-5Z', '#ece7dd'],
    ['M29 35h5v4h-5Z', '#d9a235'],
  ],
  vaatkast: [
    ['M8 8h32v31H8Z', '#a87c4a'],
    ['M11 11h26v24H11Z', '#8a6134'],
    ['M17 11a5 5 0 1 0 0 10a5 5 0 1 0 0 -10Z', '#ece7dd'],
    ['M24 11a5 5 0 1 0 0 10a5 5 0 1 0 0 -10Z', '#fffdf7'],
    ['M31 11a5 5 0 1 0 0 10a5 5 0 1 0 0 -10Z', '#ece7dd'],
    ['M17 13.4a2.6 2.6 0 1 0 0 5.2a2.6 2.6 0 1 0 0 -5.2Z', '#d8d2c6'],
    ['M31 13.4a2.6 2.6 0 1 0 0 5.2a2.6 2.6 0 1 0 0 -5.2Z', '#d8d2c6'],
    ['M11 20h26v2H11Z', '#6b4824'],
    ['M11 22h26v2H11Z', '#a87c4a'],
    ['M14 27h6v6h-6Z', '#fffdf7'],
    ['M20 28h2v3h-2Z', '#fffdf7'],
    ['M23 27h6v6h-6Z', '#fffdf7'],
    ['M29 28h2v3h-2Z', '#fffdf7'],
    ['M32 28h4v5h-4Z', '#ece7dd'],
    ['M9 39h5v3H9Z', '#6b4824'],
    ['M34 39h5v3h-5Z', '#6b4824'],
  ],
  wandspiegel: [
    ['M24 2l3.5 6h-7Z', '#d9a235'],
    ['M11 8h26v30H11Z', '#d9a235'],
    ['M14 11h20v24H14Z', '#cdd9e0'],
    ['M16 33l11-22h4.5L20.5 33Z', '#eef4f7'],
    ['M14 11h20v2H14Z', '#b8862b'],
  ],
  ladekast: [
    ['M7 11h34v3H7Z', '#a87c4a'],
    ['M9 14h30v24H9Z', '#8a6134'],
    ['M12 16h24v6H12Z', '#a87c4a'],
    ['M12 24h24v6H12Z', '#a87c4a'],
    ['M12 32h24v5H12Z', '#a87c4a'],
    ['M20 17.7a1.3 1.3 0 1 0 0 2.6a1.3 1.3 0 1 0 0 -2.6Z', '#d9a235'],
    ['M28 17.7a1.3 1.3 0 1 0 0 2.6a1.3 1.3 0 1 0 0 -2.6Z', '#d9a235'],
    ['M20 25.7a1.3 1.3 0 1 0 0 2.6a1.3 1.3 0 1 0 0 -2.6Z', '#d9a235'],
    ['M28 25.7a1.3 1.3 0 1 0 0 2.6a1.3 1.3 0 1 0 0 -2.6Z', '#d9a235'],
    ['M20 33.2a1.3 1.3 0 1 0 0 2.6a1.3 1.3 0 1 0 0 -2.6Z', '#d9a235'],
    ['M28 33.2a1.3 1.3 0 1 0 0 2.6a1.3 1.3 0 1 0 0 -2.6Z', '#d9a235'],
    ['M10 38h4v4h-4Z', '#6b4824'],
    ['M34 38h4v4h-4Z', '#6b4824'],
  ],
  wijnrek: [
    ['M8 10h32v30H8Z', '#8a6134'],
    ['M11 13h8v8h-8Z', '#3b4650'],
    ['M21 13h8v8h-8Z', '#3b4650'],
    ['M31 13h8v8h-8Z', '#3b4650'],
    ['M11 24h8v8h-8Z', '#3b4650'],
    ['M21 24h8v8h-8Z', '#3b4650'],
    ['M31 24h8v8h-8Z', '#3b4650'],
    ['M15 14a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#3f5c3a'],
    ['M25 14a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#3f5c3a'],
    ['M35 14a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#3f5c3a'],
    ['M15 25a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#3f5c3a'],
    ['M25 25a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#3f5c3a'],
    ['M35 25a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#3f5c3a'],
    ['M15 16a1 1 0 1 0 0 2a1 1 0 1 0 0 -2Z', '#6f9a5a'],
    ['M25 27a1 1 0 1 0 0 2a1 1 0 1 0 0 -2Z', '#6f9a5a'],
    ['M11 35h28v3H11Z', '#a87c4a'],
  ],
  kolenkist: [
    ['M38 6L33 20', '#8a6134', 'lijn'],
    ['M30 19h7v6h-7Z', '#9aa3ac'],
    ['M11 22h26l-2 18H13Z', '#737c86'],
    ['M9 19h30v3H9Z', '#9aa3ac'],
    ['M14 19c1-4 5-6 10-6s9 2 10 6Z', '#2a2f36'],
    ['M18 14a2 2 0 1 0 0 4a2 2 0 1 0 0 -4Z', '#3b4650'],
    ['M24 11.6a2.4 2.4 0 1 0 0 4.8a2.4 2.4 0 1 0 0 -4.8Z', '#3b4650'],
    ['M29 14a2 2 0 1 0 0 4a2 2 0 1 0 0 -4Z', '#3b4650'],
    ['M15 30h18v2H15Z', '#9aa3ac'],
  ],
  werkbank: [
    ['M20 17h9v2h-9Z', '#8a6134'],
    ['M29 14h4v6h-4Z', '#737c86'],
    ['M4 20h40v5H4Z', '#a87c4a'],
    ['M3 14h7v6H3Z', '#737c86'],
    ['M5 20h3v6H5Z', '#737c86'],
    ['M8 25h4v17H8Z', '#8a6134'],
    ['M36 25h4v17h-4Z', '#8a6134'],
    ['M10 33h28v3H10Z', '#8a6134'],
    ['M14 36h9v5h-9Z', '#c89a5e'],
  ],
  touwhaspel: [
    ['M9 12h4v28H9Z', '#8a6134'],
    ['M35 12h4v28h-4Z', '#8a6134'],
    ['M24 11a13 13 0 1 0 0 26a13 13 0 1 0 0 -26Z', '#a87c4a'],
    ['M24 15a9 9 0 1 0 0 18a9 9 0 1 0 0 -18Z', '#c89a5e'],
    ['M24 17a7 7 0 0 1 0 14', '#6b4824', 'lijn'],
    ['M24 19a5 5 0 0 0 0 10', '#6b4824', 'lijn'],
    ['M24 21a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#8a6134'],
    ['M31 30l6 8', '#c89a5e', 'lijn'],
    ['M39 22h5v3h-5Z', '#737c86'],
    ['M42 25h2v6h-2Z', '#737c86'],
    ['M14 40h20v2H14Z', '#8a6134'],
  ],
  kleerkast: [
    ['M7 6h34v4H7Z', '#a87c4a'],
    ['M9 10h30v30H9Z', '#8a6134'],
    ['M11 13h13v24H11Z', '#a87c4a'],
    ['M25 13h13v24H25Z', '#a87c4a'],
    ['M22 23h1.5v5H22Z', '#d9a235'],
    ['M24.5 23h1.5v5h-1.5Z', '#d9a235'],
    ['M21 24a1 1 0 1 0 0 2a1 1 0 1 0 0 -2Z', '#6b4824'],
    ['M10 40h5v2h-5Z', '#6b4824'],
    ['M33 40h5v2h-5Z', '#6b4824'],
  ],
  nachtkastje: [
    ['M22 11h4v9h-4Z', '#ece7dd'],
    ['M24 11c0-2-2-2-2-4s2-3 2-3s2 1 2 3-2 2-2 4Z', '#d9a235'],
    ['M11 20h26v4H11Z', '#a87c4a'],
    ['M13 24h22v13H13Z', '#8a6134'],
    ['M16 26h16v5H16Z', '#a87c4a'],
    ['M24 27.3a1.2 1.2 0 1 0 0 2.4a1.2 1.2 0 1 0 0 -2.4Z', '#d9a235'],
    ['M14 37h3v5h-3Z', '#6b4824'],
    ['M31 37h3v5h-3Z', '#6b4824'],
  ],
  wastafel: [
    ['M31.5 13h4v3h-4Z', '#fffdf7'],
    ['M30 16h7v10h-7Z', '#fffdf7'],
    ['M37 18c3 1 3 5 0 6', '#cdd9e0', 'lijn'],
    ['M13 17h16v2H13Z', '#d8d2c6'],
    ['M15 19h12v1a6 6 0 0 1-12 0Z', '#fffdf7'],
    ['M10 26h28v4H10Z', '#8a6134'],
    ['M12 30h3.5v12h-3.5Z', '#8a6134'],
    ['M32.5 30h3.5v12h-3.5Z', '#8a6134'],
    ['M14 36h20v3H14Z', '#ece7dd'],
  ],
  hutkoffer: [
    ['M8 22h32v17H8Z', '#8a6134'],
    ['M8 22c0-8 7-11 16-11s16 3 16 11Z', '#a87c4a'],
    ['M14 12h3.5v27H14Z', '#6b4824'],
    ['M30.5 12h3.5v27h-3.5Z', '#6b4824'],
    ['M8 26h32v2H8Z', '#d9a235'],
    ['M21 24h6v6h-6Z', '#d9a235'],
    ['M8 36h4v3H8Z', '#9aa3ac'],
    ['M36 36h4v3h-4Z', '#9aa3ac'],
  ],
  voetenbank: [
    ['M9 22c0-4 5-6 15-6s15 2 15 6v5H9Z', '#a8543c'],
    ['M9 27h30v3H9Z', '#8a4a34'],
    ['M17 19.8a1.2 1.2 0 1 0 0 2.4a1.2 1.2 0 1 0 0 -2.4Z', '#8a4a34'],
    ['M24 19.8a1.2 1.2 0 1 0 0 2.4a1.2 1.2 0 1 0 0 -2.4Z', '#8a4a34'],
    ['M31 19.8a1.2 1.2 0 1 0 0 2.4a1.2 1.2 0 1 0 0 -2.4Z', '#8a4a34'],
    ['M12 30h4v10h-4Z', '#8a6134'],
    ['M32 30h4v10h-4Z', '#8a6134'],
    ['M11 40h6v2h-6Z', '#6b4824'],
    ['M31 40h6v2h-6Z', '#6b4824'],
  ],
  paraplubak: [
    ['M20 6h2v3h-2Z', '#3b4650'],
    ['M19 9l3 13h-6Z', '#3b4650'],
    ['M20 22h2v7h-2Z', '#8a6134'],
    ['M30 4h2v3h-2Z', '#a8543c'],
    ['M29 7l3 15h-6Z', '#a8543c'],
    ['M30 22h2v7h-2Z', '#8a6134'],
    ['M25 12v10', '#6f9a5a', 'lijn'],
    ['M25 12c0-3 4-3 4 0', '#6f9a5a', 'lijn'],
    ['M14 20h20l-2 20H16Z', '#9aa3ac'],
    ['M12 17h24v3H12Z', '#737c86'],
    ['M15 30h18v2H15Z', '#737c86'],
  ],
  wandtafel: [
    ['M19 12h10v4a5 5 0 0 1-10 0Z', '#d9a235'],
    ['M6 21h36v4H6Z', '#a87c4a'],
    ['M9 25h30v3H9Z', '#8a6134'],
    ['M11 28h3.5v14h-3.5Z', '#8a6134'],
    ['M33.5 28h3.5v14h-3.5Z', '#8a6134'],
    ['M14 36h20v2H14Z', '#8a6134'],
  ],
  gangklok: [
    ['M24 6a11 11 0 1 0 0 22a11 11 0 1 0 0 -22Z', '#8a6134'],
    ['M24 9a8 8 0 1 0 0 16a8 8 0 1 0 0 -16Z', '#ece7dd'],
    ['M24 17V11', '#3b4650', 'lijn'],
    ['M24 17l4 3', '#3b4650', 'lijn'],
    ['M19 28h10v10h-10Z', '#8a6134'],
    ['M21 30h6v8h-6Z', '#3b4650'],
    ['M24 30v3', '#d9a235', 'lijn'],
    ['M24 32.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0 -5Z', '#d9a235'],
    ['M17 38h14v3H17Z', '#a87c4a'],
  ],
  gereedschapskist: [
    ['M18 11h12v3H18Z', '#737c86'],
    ['M18 14h2.5v5H18Z', '#737c86'],
    ['M27.5 14h2.5v5h-2.5Z', '#737c86'],
    ['M8 19h32v5H8Z', '#8a4a34'],
    ['M8 24h32v15H8Z', '#a8543c'],
    ['M14 22h4v4h-4Z', '#d9a235'],
    ['M30 22h4v4h-4Z', '#d9a235'],
    ['M9 39h30v2H9Z', '#3b4650'],
  ],
  schakelkast: [
    ['M9 8h30v32H9Z', '#737c86'],
    ['M12 11h24v26H12Z', '#9aa3ac'],
    ['M12 11h24v2H12Z', '#d9a235'],
    ['M19 15a4 4 0 1 0 0 8a4 4 0 1 0 0 -8Z', '#ece7dd'],
    ['M29 15a4 4 0 1 0 0 8a4 4 0 1 0 0 -8Z', '#ece7dd'],
    ['M19 19l2-3', '#3b4650', 'lijn'],
    ['M29 19l-2 3', '#3b4650', 'lijn'],
    ['M15 26h7v3h-7Z', '#3b4650'],
    ['M15 31h7v3h-7Z', '#3b4650'],
    ['M31 26.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0 -5Z', '#a8543c'],
    ['M35 15h2v18h-2Z', '#3b4650'],
  ],
  laadrek: [
    ['M8 7h4v35H8Z', '#a8543c'],
    ['M36 7h4v35h-4Z', '#a8543c'],
    ['M8 19h32v3H8Z', '#a8543c'],
    ['M8 31h32v3H8Z', '#a8543c'],
    ['M14 10h11v9H14Z', '#a87c4a'],
    ['M27 12h8v7h-8Z', '#a87c4a'],
    ['M13 23h13v8H13Z', '#c89a5e'],
    ['M28 25h7v6h-7Z', '#a87c4a'],
    ['M14 15h11', '#6b4824', 'lijn'],
    ['M13 27h13', '#6b4824', 'lijn'],
  ],
  slijpsteen: [
    ['M9 24h4v18H9Z', '#8a6134'],
    ['M29 24h4v18h-4Z', '#8a6134'],
    ['M21 14a10 10 0 1 0 0 20a10 10 0 1 0 0 -20Z', '#ada69a'],
    ['M21 18a6 6 0 1 0 0 12a6 6 0 1 0 0 -12Z', '#9d968a'],
    ['M21 21.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0 -5Z', '#737c86'],
    ['M33 22h6v3h-6Z', '#737c86'],
    ['M37 25h3v6h-3Z', '#737c86'],
    ['M38.5 30a2 2 0 1 0 0 4a2 2 0 1 0 0 -4Z', '#8a6134'],
    ['M11 36h22v5H11Z', '#8a6134'],
  ],
  draaibank: [
    ['M5 13h11v10H5Z', '#9aa3ac'],
    ['M10.5 14a4 4 0 1 0 0 8a4 4 0 1 0 0 -8Z', '#3b4650'],
    ['M10.5 16.6a1.4 1.4 0 1 0 0 2.8a1.4 1.4 0 1 0 0 -2.8Z', '#9aa3ac'],
    ['M16 17h17v4H16Z', '#ece7dd'],
    ['M33 15h8v8h-8Z', '#9aa3ac'],
    ['M5 23h38v5H5Z', '#737c86'],
    ['M22 20h5v3h-5Z', '#3b4650'],
    ['M9 28h5v14H9Z', '#3b4650'],
    ['M34 28h5v14h-5Z', '#3b4650'],
  ],
  grafzerk: [
    ['M11 17h26l5 21H6Z', '#ada69a'],
    ['M14 20h20l3.5 15H10.5Z', '#9d968a'],
    ['M22.5 22h3.5v11h-3.5Z', '#ada69a'],
    ['M18.5 25h11v3h-11Z', '#ada69a'],
    ['M16 35l3-6', '#8d867a', 'lijn'],
  ],
  distilleerketel: [
    ['M11 20h10l-1.5-6h-7Z', '#737c86'],
    ['M21 15c9 1 10 9 6 13', '#737c86', 'lijn'],
    ['M16 19a9 9 0 1 0 0 18a9 9 0 1 0 0 -18Z', '#9aa3ac'],
    ['M29 30h8v5a4 4 0 0 1-8 0Z', '#ece7dd'],
    ['M30 34h6v2h-6Z', '#6f9a5a'],
    ['M16 42c-2 0-4-1-4-3c0-2 2-2 2-4c1 1 2 2 2 3c1-1 1-1 1-2c1 1 2 2 2 3c0 2-1 3-3 3Z', '#d9a235'],
  ],
  proeventafel: [
    ['M22 10h4v5l5 9H17l5-9Z', '#cdd9e0'],
    ['M19 20h10l2 4H17Z', '#6f9a5a'],
    ['M13.5 11h2v3h-2Z', '#cdd9e0'],
    ['M12 14h5v10h-5Z', '#6f9a5a'],
    ['M5 24h38v4H5Z', '#ece7dd'],
    ['M9 28h3.5v14H9Z', '#9aa3ac'],
    ['M35.5 28h3.5v14h-3.5Z', '#9aa3ac'],
    ['M12 36h24v2H12Z', '#9aa3ac'],
  ],
  plantenbak: [
    ['M16 14v12', '#6f9a5a', 'lijn'],
    ['M24 11v15', '#6f9a5a', 'lijn'],
    ['M32 15v11', '#6f9a5a', 'lijn'],
    ['M16 11a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#d9a235'],
    ['M24 8a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#a8543c'],
    ['M32 12a3 3 0 1 0 0 6a3 3 0 1 0 0 -6Z', '#fffdf7'],
    ['M18 20c3 0 4 2 4 4c-3 0-4-2-4-4Z', '#6f9a5a'],
    ['M30 22c-3 0-4 2-4 4c3 0 4-2 4-4Z', '#6f9a5a'],
    ['M11 25h26v3H11Z', '#6b4824'],
    ['M8 24h32v4H8Z', '#8a4a34'],
    ['M10 28h28v12H10Z', '#a8543c'],
  ],
  sterrenkaart: [
    ['M7 8h34v24H7Z', '#8a6134'],
    ['M10 11h28v18H10Z', '#3b4650'],
    ['M15 16L22 14L28 19', '#9aa3ac', 'lijn'],
    ['M28 19L33 15', '#9aa3ac', 'lijn'],
    ['M15 14l2 2l-2 2l-2 -2Z', '#d9a235'],
    ['M22 12l2 2l-2 2l-2 -2Z', '#d9a235'],
    ['M28 17l2 2l-2 2l-2 -2Z', '#d9a235'],
    ['M33 13l2 2l-2 2l-2 -2Z', '#d9a235'],
    ['M20 23.5l1.5 1.5l-1.5 1.5l-1.5 -1.5Z', '#fffdf7'],
    ['M31 23.5l1.5 1.5l-1.5 1.5l-1.5 -1.5Z', '#fffdf7'],
    ['M22 32h4v8h-4Z', '#8a6134'],
    ['M15 40h18v3H15Z', '#8a6134'],
  ],
  kaartenkast: [
    ['M13 8h18v4H13Z', '#fffdf7'],
    ['M12 8h2v4h-2Z', '#6b4824'],
    ['M30 8h2v4h-2Z', '#6b4824'],
    ['M4 12h40v3H4Z', '#a87c4a'],
    ['M6 15h36v23H6Z', '#8a6134'],
    ['M9 17h30v4H9Z', '#a87c4a'],
    ['M9 22h30v4H9Z', '#a87c4a'],
    ['M9 27h30v4H9Z', '#a87c4a'],
    ['M9 32h30v4H9Z', '#a87c4a'],
    ['M22 18.5h4v1.5h-4Z', '#d9a235'],
    ['M22 23.5h4v1.5h-4Z', '#d9a235'],
    ['M22 28.5h4v1.5h-4Z', '#d9a235'],
    ['M22 33.5h4v1.5h-4Z', '#d9a235'],
    ['M8 38h5v3H8Z', '#6b4824'],
    ['M35 38h5v3h-5Z', '#6b4824'],
  ],
  schrijflessenaar: [
    ['M30 9h5v4h-5Z', '#3b4650'],
    ['M31 7h3v2h-3Z', '#3b4650'],
    ['M26 12l5-6', '#ece7dd', 'lijn'],
    ['M31 6c2 0 3 1 3 3c-2 0-3-1-3-3Z', '#fffdf7'],
    ['M9 21h30l-5-9H14Z', '#a87c4a'],
    ['M18 15h11v4h-11Z', '#fffdf7'],
    ['M8 21h32v3H8Z', '#8a6134'],
    ['M11 24h4v18h-4Z', '#8a6134'],
    ['M33 24h4v18h-4Z', '#8a6134'],
    ['M15 36h18v2H15Z', '#8a6134'],
  ],
  chronometer: [
    ['M24 8a11 11 0 1 0 0 22a11 11 0 1 0 0 -22Z', '#d9a235'],
    ['M24 10a9 9 0 1 0 0 18a9 9 0 1 0 0 -18Z', '#8a6134'],
    ['M24 11a8 8 0 1 0 0 16a8 8 0 1 0 0 -16Z', '#fffdf7'],
    ['M24 19V13', '#3b4650', 'lijn'],
    ['M24 19l4 2', '#3b4650', 'lijn'],
    ['M24 18a1 1 0 1 0 0 2a1 1 0 1 0 0 -2Z', '#3b4650'],
    ['M15 30h18v4H15Z', '#8a6134'],
    ['M12 34h24v4H12Z', '#8a6134'],
    ['M14 38h4v3h-4Z', '#6b4824'],
    ['M30 38h4v3h-4Z', '#6b4824'],
  ],
  staandespiegel: [
    ['M8 9h4v29H8Z', '#8a6134'],
    ['M36 9h4v29h-4Z', '#8a6134'],
    ['M5 38h10v4H5Z', '#8a6134'],
    ['M33 38h10v4H33Z', '#8a6134'],
    ['M11 7h26v29H11Z', '#a87c4a'],
    ['M14 10h20v23H14Z', '#cdd9e0'],
    ['M16 31l12-19h4.5L20.5 31Z', '#eef4f7'],
    ['M10 19.2a1.8 1.8 0 1 0 0 3.6a1.8 1.8 0 1 0 0 -3.6Z', '#d9a235'],
    ['M38 19.2a1.8 1.8 0 1 0 0 3.6a1.8 1.8 0 1 0 0 -3.6Z', '#d9a235'],
  ],
  regenton: [
    ['M12 14h24c2 7 2 19 0 26H12c-2-7-2-19 0-26Z', '#8a6134'],
    ['M10 20h28v3H10Z', '#9aa3ac'],
    ['M10 31h28v3H10Z', '#9aa3ac'],
    ['M13 14h22v3H13Z', '#6b4824'],
    ['M15 17h18v4H15Z', '#cdd9e0'],
  ],
  kruiwagen: [
    ['M12 16h22l-3 12H15Z', '#9aa3ac'],
    ['M11 14h24v3H11Z', '#737c86'],
    ['M34 20l8 12', '#8a6134', 'lijn'],
    ['M15 28l-4 8', '#8a6134', 'lijn'],
    ['M16 31a5 5 0 1 0 0 10a5 5 0 1 0 0 -10Z', '#3b4650'],
    ['M16 34a2 2 0 1 0 0 4a2 2 0 1 0 0 -4Z', '#9aa3ac'],
    ['M30 28h4v10h-4Z', '#8a6134'],
  ],
  boomstronk: [
    ['M14 18h20v20H14Z', '#8a6134'],
    ['M14 18h20v4H14Z', '#a87c4a'],
    ['M24 13a7 7 0 1 0 0 14a7 7 0 1 0 0 -14Z', '#a87c4a'],
    ['M24 16a4 4 0 1 0 0 8a4 4 0 1 0 0 -8Z', '#8a6134'],
    ['M24 18.5a1.5 1.5 0 1 0 0 3.0a1.5 1.5 0 1 0 0 -3.0Z', '#6b4824'],
    ['M12 38h24v4H12Z', '#6b4824'],
    ['M10 30h4v8h-4Z', '#8a6134'],
  ],
  vogelverschrikker: [
    ['M22 20h4v22h-4Z', '#8a6134'],
    ['M10 22h28v3H10Z', '#8a6134'],
    ['M16 18h16v14H16Z', '#a8543c'],
    ['M24 6a6 6 0 1 0 0 12a6 6 0 1 0 0 -12Z', '#a87c4a'],
    ['M18 8h12v3H18Z', '#6b4824'],
    ['M20 4h8v4h-8Z', '#6b4824'],
    ['M22 11a1 1 0 1 0 0 2a1 1 0 1 0 0 -2Z', '#3b4650'],
    ['M26 11a1 1 0 1 0 0 2a1 1 0 1 0 0 -2Z', '#3b4650'],
    ['M16 30h16v4H16Z', '#d9a235'],
  ],
};

const NS = 'http://www.w3.org/2000/svg';

// De omlijning. Dit is wat een tekening een tekening maakt in plaats van een
// pictogram: elk vlak krijgt dezelfde donkere contour, zoals in een
// stripverhaal. Zonder die lijn vallen vlakken van dezelfde kleurfamilie in
// elkaar en ziet een kamer er vlak en koud uit.
const CONTOUR = '#3f3228';

// --------------------------------------------------------------- materiaal
//
// Zeventig tekeningen met de hand bijwerken is geen doen, en het zou ook
// niet consequent worden. In plaats daarvan krijgt elk vlak zijn detail uit
// zijn eigen kleur:
//
//   - een verloop van licht naar donker, zodat een kast bol staat in plaats
//     van plat te liggen;
//   - een nerf over alles wat hout is, en een glans over alles wat metaal is.
//
// Welke kleur welk materiaal is, staat hieronder. Dat is één lijst voor alle
// tekeningen tegelijk, dus het blijft vanzelf consequent.

const HOUTKLEUREN = new Set(['#a87c4a', '#8a6134', '#6b4824', '#c89a5e']);
const METAALKLEUREN = new Set(['#9aa3ac', '#737c86', '#3b4650', '#b9c0c4', '#8b9399']);
const STEENKLEUREN = new Set(['#ada69a', '#9d968a', '#8d867a']);
const STOFKLEUREN = new Set(['#a8543c', '#8a4a34', '#6f5a8e', '#b8795e', '#5f7f6a']);

const klem = (v) => Math.max(0, Math.min(255, Math.round(v)));

function schuif(hex, factor) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = klem(((n >> 16) & 255) * factor);
  const g = klem(((n >> 8) & 255) * factor);
  const b = klem((n & 255) * factor);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const sleutelVan = (hex) => `mk${hex.replace('#', '')}`;

// Het verloop en de materiaalpatronen staan één keer per svg. Welke svg dat
// is weten we pas als er getekend wordt, dus we zetten ze er dan bij.
function zorgVoorDefs(ouder, kleuren) {
  const svg = ouder.ownerSVGElement ?? (ouder.tagName === 'svg' ? ouder : null);
  if (!svg) return false;
  let defs = svg.querySelector('defs.meubeldefs');
  if (!defs) {
    defs = document.createElementNS(NS, 'defs');
    defs.setAttribute('class', 'meubeldefs');

    // De nerf van hout: fijne lijntjes, net niet evenwijdig.
    const nerf = document.createElementNS(NS, 'pattern');
    nerf.setAttribute('id', 'mk-nerf');
    nerf.setAttribute('width', '6');
    nerf.setAttribute('height', '5');
    nerf.setAttribute('patternUnits', 'userSpaceOnUse');
    for (const [d, o] of [['M0 1.2 q3 -0.8 6 0', '0.26'], ['M0 3.4 q3 0.9 6 0', '0.18']]) {
      const pad = document.createElementNS(NS, 'path');
      pad.setAttribute('d', d);
      pad.setAttribute('fill', 'none');
      pad.setAttribute('stroke', '#2e2114');
      pad.setAttribute('stroke-width', '0.5');
      pad.setAttribute('opacity', o);
      nerf.append(pad);
    }
    defs.append(nerf);

    // De glans van metaal: een schuine lichtband.
    const glans = document.createElementNS(NS, 'linearGradient');
    glans.setAttribute('id', 'mk-glans');
    glans.setAttribute('x1', '0');
    glans.setAttribute('y1', '0');
    glans.setAttribute('x2', '1');
    glans.setAttribute('y2', '1');
    for (const [o, kl, op] of [['0%', '#ffffff', '0.32'], ['38%', '#ffffff', '0.06'],
      ['55%', '#ffffff', '0.22'], ['100%', '#000000', '0.12']]) {
      const stop = document.createElementNS(NS, 'stop');
      stop.setAttribute('offset', o);
      stop.setAttribute('stop-color', kl);
      stop.setAttribute('stop-opacity', op);
      glans.append(stop);
    }
    defs.append(glans);

    // De korrel van steen.
    const korrel = document.createElementNS(NS, 'pattern');
    korrel.setAttribute('id', 'mk-korrel');
    korrel.setAttribute('width', '7');
    korrel.setAttribute('height', '7');
    korrel.setAttribute('patternUnits', 'userSpaceOnUse');
    for (const [cx, cy, r] of [[1.5, 2, 0.6], [4.5, 1, 0.4], [3, 5, 0.7], [6, 4.5, 0.5]]) {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', cx);
      c.setAttribute('cy', cy);
      c.setAttribute('r', r);
      c.setAttribute('fill', '#2e2a24');
      c.setAttribute('opacity', '0.22');
      korrel.append(c);
    }
    defs.append(korrel);

    // Het weefsel van stof: een fijne kruising van draden.
    const weefsel = document.createElementNS(NS, 'pattern');
    weefsel.setAttribute('id', 'mk-weefsel');
    weefsel.setAttribute('width', '4');
    weefsel.setAttribute('height', '4');
    weefsel.setAttribute('patternUnits', 'userSpaceOnUse');
    for (const [d, kl, op] of [['M0 2 h4', '#ffffff', '0.14'], ['M2 0 v4', '#2a1a12', '0.16']]) {
      const pad = document.createElementNS(NS, 'path');
      pad.setAttribute('d', d);
      pad.setAttribute('stroke', kl);
      pad.setAttribute('stroke-width', '0.7');
      pad.setAttribute('opacity', op);
      pad.setAttribute('fill', 'none');
      weefsel.append(pad);
    }
    defs.append(weefsel);

    svg.insertBefore(defs, svg.firstChild);
  }

  // Per kleur een verloop, en alleen als het er nog niet is.
  for (const kleur of kleuren) {
    const id = sleutelVan(kleur);
    if (defs.querySelector(`#${id}`)) continue;
    const grad = document.createElementNS(NS, 'linearGradient');
    grad.setAttribute('id', id);
    grad.setAttribute('x1', '0');
    grad.setAttribute('y1', '0');
    grad.setAttribute('x2', '0.25');
    grad.setAttribute('y2', '1');
    for (const [o, f] of [['0%', 1.16], ['45%', 1.0], ['100%', 0.82]]) {
      const stop = document.createElementNS(NS, 'stop');
      stop.setAttribute('offset', o);
      stop.setAttribute('stop-color', schuif(kleur, f));
      grad.append(stop);
    }
    defs.append(grad);
  }
  return true;
}

// Zet een meubelstuk neer, passend in een vierkant van `grootte` bij `grootte`.
export function tekenMeubel(ouder, naam, { x = 0, y = 0, grootte = 48, contour = true } = {}) {
  const delen = MEUBELKUNST[naam];
  if (!delen) return null;
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('transform', `translate(${x} ${y}) scale(${grootte / 48})`);
  g.setAttribute('class', 'meubelkunst');

  const kleuren = delen.filter(([, , soort]) => soort !== 'lijn').map(([, kl]) => kl);
  const metVerloop = zorgVoorDefs(ouder, new Set(kleuren));

  for (const [d, kleur, soort] of delen) {
    const pad = document.createElementNS(NS, 'path');
    pad.setAttribute('d', d);
    if (soort === 'lijn') {
      // Een open pad omsluit geen vlak: met een vulling zie je er niets van.
      pad.setAttribute('fill', 'none');
      pad.setAttribute('stroke', kleur);
      pad.setAttribute('stroke-width', '2.4');
      pad.setAttribute('stroke-linecap', 'round');
      pad.setAttribute('class', 'meubellijn');
      g.append(pad);
      continue;
    }

    pad.setAttribute('fill', metVerloop ? `url(#${sleutelVan(kleur)})` : kleur);
    if (contour) {
      pad.setAttribute('stroke', CONTOUR);
      pad.setAttribute('stroke-width', '1.4');
      pad.setAttribute('stroke-linejoin', 'round');
    }
    g.append(pad);

    // En er overheen wat het materiaal eigen is. Hetzelfde pad nog een keer,
    // maar dan gevuld met nerf, glans of korrel.
    if (!metVerloop) continue;
    const laag = HOUTKLEUREN.has(kleur) ? 'mk-nerf'
      : METAALKLEUREN.has(kleur) ? 'mk-glans'
        : STEENKLEUREN.has(kleur) ? 'mk-korrel'
          : STOFKLEUREN.has(kleur) ? 'mk-weefsel' : null;
    if (!laag) continue;
    const over = document.createElementNS(NS, 'path');
    over.setAttribute('d', d);
    over.setAttribute('fill', `url(#${laag})`);
    over.setAttribute('pointer-events', 'none');
    g.append(over);
  }

  ouder.append(g);
  return g;
}
