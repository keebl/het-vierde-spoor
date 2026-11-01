// Meubels als tekeningen, niet als pictogrammen.
//
// Een dun lijntje in een bruin blokje ziet er niet uit als een koelkast. Deze
// set is gevuld en in kleur, in een vierkant van 48 bij 48, en wordt
// rechtstreeks op de vloer gezet - zoals een meubelstuk op een speelbord
// gewoon op de vloer staat.
//
// Elk onderdeel is een pad met een eigen kleur. De kleuren komen uit een
// kleine palet: hout, wit porselein, metaal, groen, steen, stof, donker glas
// en goud voor vlammen en koper. Daardoor hangen de meubels visueel samen,
// ook al staan ze in verschillende kamers.

export const MEUBELKUNST = {
  fornuis: [
    ['M9 15h30v25H9Z', '#9aa3ac'],
    ['M9 15h30v6H9Z', '#3b4650'],
    ['M13 24h22v13H13Z', '#ece7dd'],
    ['M15 17.5a2 2 0 1 0 .1 0', '#737c86'],
    ['M22 17.5a2 2 0 1 0 .1 0', '#737c86'],
    ['M29 17.5a2 2 0 1 0 .1 0', '#737c86'],
    ['M17 29h14v2H17Z', '#737c86'],
  ],
  gootsteen: [
    ['M7 22h34v6H7Z', '#ece7dd'],
    ['M11 28h26v10a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3Z', '#ece7dd'],
    ['M15 30h18v8H15Z', '#737c86'],
    ['M30 22v-6a4 4 0 0 0-4-4h-4', '#9aa3ac'],
    ['M20 10h6v4h-6Z', '#9aa3ac'],
  ],
  koelkast: [
    ['M14 7h20v34H14Z', '#ece7dd'],
    ['M14 19h20v1.5H14Z', '#737c86'],
    ['M30 11h2v6h-2Z', '#9aa3ac'],
    ['M30 23h2v6h-2Z', '#9aa3ac'],
  ],
  tafel: [
    ['M7 19h34v5H7Z', '#a87c4a'],
    ['M11 24h3v17h-3Z', '#8a6134'],
    ['M34 24h3v17h-3Z', '#8a6134'],
  ],
  kast: [
    ['M11 7h26v34H11Z', '#8a6134'],
    ['M24 7v34', '#6b4824', 'lijn'],
    ['M11 7h26v3H11Z', '#a87c4a'],
    ['M21 23a1.6 1.6 0 1 0 .1 0', '#d9a235'],
    ['M26 23a1.6 1.6 0 1 0 .1 0', '#d9a235'],
  ],
  rek: [
    ['M9 8h3v33H9Z', '#9aa3ac'],
    ['M36 8h3v33h-3Z', '#9aa3ac'],
    ['M9 17h30v3H9Z', '#9aa3ac'],
    ['M9 27h30v3H9Z', '#9aa3ac'],
    ['M9 37h30v3H9Z', '#9aa3ac'],
    ['M14 10h8v7h-8Z', '#a87c4a'],
    ['M26 20h9v7h-9Z', '#a87c4a'],
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
    ['M24 11a7 7 0 1 0 .1 0', '#ece7dd'],
    ['M24 14v4.5l3 2', '#3b4650', 'lijn'],
    ['M22 27h4v11h-4Z', '#d9a235'],
  ],
  vleugel: [
    ['M9 24c0-8 10-12 24-12c6 0 8 2 8 5c0 6-8 8-14 8Z', '#3b4650'],
    ['M9 24h18v5H9Z', '#ece7dd'],
    ['M12 29v9', '#3b4650', 'lijn'],
    ['M36 17v10', '#3b4650', 'lijn'],
  ],
  spiegelstandaard: [
    ['M24 6a9 13 0 1 1 .1 0', '#8a6134'],
    ['M24 9a7 11 0 1 1 .1 0', '#ece7dd'],
    ['M24 32v6', '#8a6134', 'lijn'],
    ['M17 41h14v2H17Z', '#8a6134'],
  ],
  buste: [
    ['M16 33h16v8H16Z', '#ada69a'],
    ['M24 11a6 6 0 1 0 .1 0', '#ece7dd'],
    ['M16 33c0-7 4-11 8-11s8 4 8 11Z', '#ece7dd'],
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
    ['M11 14h26l-3 10H14Z', '#a87c4a'],
    ['M22 24h4v14h-4Z', '#8a6134'],
    ['M15 38h18v3H15Z', '#8a6134'],
  ],
  globe: [
    ['M24 10a13 13 0 1 0 .1 0', '#6f9a5a'],
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
  kist: [
    ['M9 20h30v20H9Z', '#8a6134'],
    ['M9 20c0-7 5-10 15-10s15 3 15 10Z', '#a87c4a'],
    ['M9 26h30v3H9Z', '#9aa3ac'],
    ['M21 24h6v8h-6Z', '#9aa3ac'],
  ],
  haspel: [
    ['M24 9a16 16 0 1 0 .1 0', '#8a6134'],
    ['M24 17a8 8 0 1 0 .1 0', '#a87c4a'],
    ['M6 23h5v3H6Z', '#9aa3ac'],
    ['M37 23h5v3h-5Z', '#9aa3ac'],
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
    ['M22 8h4v31h-4Z', '#8a6134'],
    ['M14 39h20v3H14Z', '#8a6134'],
    ['M24 12l-9 6', '#8a6134', 'lijn'],
    ['M24 12l9 6', '#8a6134', 'lijn'],
    ['M28 17c5 1 6 6 5 12h-9c-1-6 0-11 4-12Z', '#a8543c'],
  ],
  mand: [
    ['M10 18h28l-3 22H13Z', '#a87c4a'],
    ['M12 25h24', '#6b4824', 'lijn'],
    ['M12 32h23', '#6b4824', 'lijn'],
    ['M13 18a11 11 0 0 1 22 0Z', '#8a6134'],
  ],
  harnas: [
    ['M24 6l12 5v12c0 10-6 16-12 18c-6-2-12-8-12-18V11Z', '#9aa3ac'],
    ['M18 20h12v3H18Z', '#737c86'],
    ['M24 23v14', '#737c86', 'lijn'],
    ['M19 11h10v5H19Z', '#3b4650'],
  ],
  ketel: [
    ['M11 16h26v15a7 7 0 0 1-7 7H18a7 7 0 0 1-7-7Z', '#9aa3ac'],
    ['M8 20h3v4H8Z', '#737c86'],
    ['M37 20h3v4h-3Z', '#737c86'],
    ['M18 11h12v5H18Z', '#737c86'],
    ['M15 40h18v2H15Z', '#3b4650'],
  ],
  noodkast: [
    ['M12 7h24v34H12Z', '#a8543c'],
    ['M22 14h4v16h-4Z', '#ece7dd'],
    ['M16 20h16v4H16Z', '#ece7dd'],
    ['M33 22h2v5h-2Z', '#9aa3ac'],
  ],
  houtstapel: [
    ['M8 20h32v10H8Z', '#8a6134'],
    ['M8 30h32v10H8Z', '#a87c4a'],
    ['M14 22a3 3 0 1 0 .1 0', '#6b4824'],
    ['M27 22a3 3 0 1 0 .1 0', '#6b4824'],
    ['M20 32a3 3 0 1 0 .1 0', '#6b4824'],
    ['M33 32a3 3 0 1 0 .1 0', '#6b4824'],
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
    ['M12 36a3 3 0 1 0 .1 0', '#ada69a'],
    ['M34 36a3 3 0 1 0 .1 0', '#ada69a'],
  ],
  stam: [
    ['M6 20h32v12H6Z', '#8a6134'],
    ['M38 20a5 6 0 1 1 .1 0', '#a87c4a'],
    ['M38 24a2 2.5 0 1 1 .1 0', '#6b4824'],
    ['M12 32l-3 8', '#8a6134', 'lijn'],
  ],
  put: [
    ['M12 20h24l-2 21H14Z', '#ada69a'],
    ['M8 20l16-11l16 11', '#8a6134', 'lijn'],
    ['M22 11h4v9h-4Z', '#8a6134'],
    ['M20 24h8v7h-8Z', '#a87c4a'],
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
    ['M21 29a1.6 1.6 0 1 0 .1 0', '#3b4650'],
    ['M27 29a1.6 1.6 0 1 0 .1 0', '#3b4650'],
  ],
  zuil: [
    ['M19 11h10v26H19Z', '#ada69a'],
    ['M14 6h20v5H14Z', '#ece7dd'],
    ['M14 37h20v5H14Z', '#ece7dd'],
    ['M22 11v26', '#737c86', 'lijn'],
    ['M26 11v26', '#737c86', 'lijn'],
  ],
  bidbank: [
    ['M12 26h24v4H12Z', '#8a6134'],
    ['M14 30h3v11h-3Z', '#8a6134'],
    ['M31 30h3v11h-3Z', '#8a6134'],
    ['M16 12h16v14H16Z', '#a87c4a'],
    ['M22 15h4v8h-4Z', '#d9a235'],
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
    ['M10 7h28v34H10Z', '#8a6134'],
    ['M10 18h28v2H10Z', '#6b4824'],
    ['M10 29h28v2H10Z', '#6b4824'],
    ['M24 7v34', '#6b4824', 'lijn'],
    ['M16 12.5a1.5 1.5 0 1 0 .1 0', '#d9a235'],
    ['M32 12.5a1.5 1.5 0 1 0 .1 0', '#d9a235'],
    ['M16 24a1.5 1.5 0 1 0 .1 0', '#d9a235'],
    ['M32 24a1.5 1.5 0 1 0 .1 0', '#d9a235'],
    ['M16 35a1.5 1.5 0 1 0 .1 0', '#d9a235'],
    ['M32 35a1.5 1.5 0 1 0 .1 0', '#d9a235'],
  ],
  weegschaal: [
    ['M23 9h2v28h-2Z', '#9aa3ac'],
    ['M16 40h16v3H16Z', '#9aa3ac'],
    ['M9 15h30v2H9Z', '#9aa3ac'],
    ['M4 17h12l-6 7Z', '#737c86'],
    ['M32 17h12l-6 7Z', '#737c86'],
    ['M24 6a3 3 0 1 0 .1 0', '#d9a235'],
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
    ['M24 10a15 15 0 1 1-.1 0', '#737c86'],
    ['M24 14a11 15 0 1 1-.1 0', '#9aa3ac'],
    ['M9 24h30', '#737c86', 'lijn'],
    ['M24 20a4 4 0 1 0 .1 0', '#d9a235'],
    ['M22 39h4v4h-4Z', '#8a6134'],
    ['M16 43h16v2H16Z', '#8a6134'],
  ],
  kaarthoek: [
    ['M8 12h32v26H8Z', '#ece7dd'],
    ['M8 12l10 4l12-4l10 4v22l-10-4l-12 4l-10-4Z', '#ece7dd'],
    ['M18 16v22', '#737c86', 'lijn'],
    ['M30 12v22', '#737c86', 'lijn'],
    ['M13 22l6-3l7 6', '#737c86', 'lijn'],
  ],
};

const NS = 'http://www.w3.org/2000/svg';

// Zet een meubelstuk neer, passend in een vierkant van `grootte` bij `grootte`.
export function tekenMeubel(ouder, naam, { x = 0, y = 0, grootte = 48 } = {}) {
  const delen = MEUBELKUNST[naam];
  if (!delen) return null;
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('transform', `translate(${x} ${y}) scale(${grootte / 48})`);
  g.setAttribute('class', 'meubelkunst');
  for (const [d, kleur, soort] of delen) {
    const pad = document.createElementNS(NS, 'path');
    pad.setAttribute('d', d);
    if (soort === 'lijn') {
      // Een open pad omsluit geen vlak: met een vulling zie je er niets van.
      pad.setAttribute('fill', 'none');
      pad.setAttribute('stroke', kleur);
      pad.setAttribute('stroke-width', '2');
      pad.setAttribute('stroke-linecap', 'round');
      pad.setAttribute('class', 'meubellijn');
    } else {
      pad.setAttribute('fill', kleur);
    }
    g.append(pad);
  }
  ouder.append(g);
  return g;
}
