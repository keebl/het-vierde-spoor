// Iconen, in code getekend. Geen externe plaatjes: dat houdt het scherp op
// elk scherm, past zich aan het thema aan, laadt direct, en er kleeft geen
// licentie aan.
//
// Alle paden leven in een vierkant van 24 bij 24 en zijn bedoeld om te
// tekenen met een lijn (geen vulling), zodat ze op elke achtergrond werken.

export const ICONS = {
  boek: ['M5 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2Z', 'M7 4v14'],
  fles: ['M10 3h4v3.5l2 4V20a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-9.5l2-4Z', 'M8 14h8'],
  noot: ['M10 18V6l8-2v10', 'M7 20a3 2 0 1 0 6 0a3 2 0 1 0-6 0', 'M15 16a3 2 0 1 0 6 0a3 2 0 1 0-6 0'],
  bed: ['M3 19v-7h18v7', 'M3 12V7', 'M7 12V9h5v3'],
  kruis: ['M12 5v14', 'M5 12h14'],
  tandwiel: ['M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z', 'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3', 'M5 5l2 2', 'M17 17l2 2', 'M19 5l-2 2', 'M7 17l-2 2'],
  ster: ['M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.4l6-.8Z'],
  druppel: ['M12 3c4 4.5 6 7.3 6 10a6 6 0 0 1-12 0c0-2.7 2-5.5 6-10Z'],
  trap: ['M3 21h4v-4h4v-4h4V9h4V5'],
  schedel: ['M6 11a6 6 0 1 1 12 0v3l-1.5 1v3h-9v-3L6 14Z', 'M9.5 10.5h.01', 'M14.5 10.5h.01'],
  boom: ['M12 21v-5', 'M12 16L6.5 9.5h11Z', 'M12 10L8 5h8Z'],
  steen: ['M4 17l3-9 6-3 7 4-2 9Z', 'M7 8l6 1 7-1'],
  brug: ['M3 16h18', 'M5 16a7 7 0 0 1 14 0', 'M9 16v4', 'M15 16v4'],
  krat: ['M4 6h16v13H4Z', 'M4 10h16', 'M9 6v13', 'M15 6v13'],
  spiegel: ['M12 3a5 7 0 0 1 0 14a5 7 0 0 1 0-14Z', 'M12 17v4', 'M9 21h6'],
  blad: ['M5 20C5 11 11 5 20 5c0 9-6 15-15 15Z', 'M5 20c3-5 7-8 11-9.5'],
  bestek: ['M7 3v8a2 2 0 0 0 4 0V3', 'M9 11v10', 'M17 3c-1.5 2-2 4-2 6h4c0-2-.5-4-2-6Z', 'M17 9v12'],
  rook: ['M7 20c0-3 4-3 4-6s-3-3-3-6 2-4 2-4', 'M14 20c0-2.5 3-2.5 3-5s-2-2.5-2-5'],
  bal: ['M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z', 'M12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5Z'],
  bloem: ['M12 10.5a2 2 0 1 0 0 4a2 2 0 0 0 0-4Z', 'M12 10.5V7a2.5 2.5 0 1 1 2.5 2.5', 'M12 14.5V18', 'M10 12.5H7a2.5 2.5 0 1 1 2.5-2.5', 'M14 12.5h3a2.5 2.5 0 1 1-2.5 2.5'],
  boog: ['M5 21V12a7 7 0 0 1 14 0v9', 'M9 21v-9a3 3 0 0 1 6 0v9'],
  kaars: ['M9 9h6v12H9Z', 'M12 9c0-2-2-2-2-4s2-3 2-3s2 1.5 2 3-2 2-2 4Z'],
  sleutel: ['M14 6.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z', 'M11 11.5L3 19.5', 'M6 16.5l2 2', 'M9 13.5l2 2'],
  lantaarn: ['M8 8h8l1 11H7Z', 'M10 8V5h4v3', 'M12 2v3'],
  deur: ['M7 3h10v18H7Z', 'M14 12h.01', 'M4 21h16'],
  persoon: ['M12 4a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7Z', 'M5 21v-1a7 7 0 0 1 14 0v1'],
  wapen: ['M3 9h12l3 3h3v3h-5l-2-2H9v4H6v-4H3Z', 'M7 15l-2 5'],
  brief: ['M3 6h18v12H3Z', 'M3 6l9 7 9-7'],
  klok: ['M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16Z', 'M12 8v4.5l3 2'],
  bliksem: ['M13 2L5 14h6l-1 8 8-12h-6Z'],
  oog: ['M2 12s4-6 10-6s10 6 10 6s-4 6-10 6s-10-6-10-6Z', 'M12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5Z'],
  ketel: ['M6 8h12v9a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3Z', 'M4 11h2', 'M18 11h2', 'M9 8V5h6v3'],
  put: ['M5 10h14l-1.5 11h-11Z', 'M4 10l8-6 8 6', 'M12 10v11'],
  toren: ['M7 21V8l5-4 5 4v13', 'M10 21v-6h4v6', 'M10 11h.01', 'M14 11h.01'],
  koepel: ['M4 20h16', 'M5 20v-5a7 7 0 0 1 14 0v5', 'M12 8V4', 'M9 20v-4h6v4'],
  buis: ['M4 8h16v8H4Z', 'M8 8v8', 'M16 8v8', 'M2 10v4', 'M22 10v4'],
  stoel: ['M7 20v-4h10v4', 'M7 16V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v9', 'M5 16h14', 'M9 20v2', 'M15 20v2'],
  kast: ['M5 3h14v18H5Z', 'M12 3v18', 'M9 11h.01', 'M15 11h.01', 'M5 9h14', 'M5 15h14'],
  tafel: ['M3 9h18', 'M5 9v11', 'M19 9v11', 'M7 9V6h10v3'],
  globe: ['M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18Z', 'M3 12h18', 'M12 3c3 3.5 3 14.5 0 18c-3-3.5-3-14.5 0-18Z'],
  vuur: ['M12 21a6 6 0 0 1-6-6c0-4 4-5 4-9c3 2 4 4 4 6c1-1 1-2 1-3c2 2 3 4 3 6a6 6 0 0 1-6 6Z'],
  telefoon: ['M7 3h10v18H7Z', 'M10 7h4', 'M12 11h.01', 'M12 15v3'],
};

// Welk icoon hoort bij deze naam? We kijken naar woorddelen, zodat
// "de wijnkelder" en "de verzakte trap" allebei iets passends krijgen.
// Volgorde telt: het eerste rake woord wint.
const SLEUTELWOORDEN = [
  // Meubilair eerst: dat is specifieker dan de ruimtewoorden eronder.
  [['haard', 'kachel', 'vuurplaats', 'oven', 'brander'], 'vuur'],
  [['zilver', 'bestek', 'schaal'], 'bestek'],
  [['stoel', 'fauteuil', 'chaise', 'bank', 'zetel'], 'stoel'],
  [['kast', 'rek', 'nis met', 'knekelnis'], 'kast'],
  [['tafel', 'lessenaar', 'bureau', 'toonbank', 'werkblad'], 'tafel'],
  [['globe', 'hemelbol', 'bol'], 'globe'],
  [['telefoon', 'console', 'automaat', 'zendmast'], 'telefoon'],
  [['vleugel', 'piano', 'jukebox'], 'noot'],
  [['sarcofaag', 'tombe', 'knekel'], 'schedel'],
  [['zuil', 'borstbeeld', 'harnas'], 'persoon'],
  [['kist', 'haspel', 'mand', 'stapel', 'laadrek'], 'krat'],
  [['kweekbak', 'kweek', 'stam', 'nest'], 'blad'],
  [['drinkbak', 'waterbak'], 'druppel'],
  [['capsule'], 'bed'],
  [['poort'], 'deur'],
  [['biblio', 'archief', 'grimoire', 'logboek', 'boek', 'studiecel', 'kaart'], 'boek'],
  [['wijn', 'fles', 'karaf', 'veldfles', 'chloraal', 'slaappoeder', 'apothe'], 'fles'],
  [['muziek', 'piano', 'bard'], 'noot'],
  [['slaap', 'cabine', 'hotel', 'bovenkamer'], 'bed'],
  [['medisch', 'arts', 'dokter', 'spuit', 'verband'], 'kruis'],
  [['machine', 'werktuig', 'zekering', 'centrifuge', 'snijbrander'], 'tandwiel'],
  [['ster', 'observa', 'maan'], 'ster'],
  [['water', 'poel', 'peil', 'dampende', 'regen'], 'druppel'],
  [['trap', 'zolder', 'trappenhal'], 'trap'],
  [['been', 'graf', 'schedel', 'bot', 'relikwie', 'tombe'], 'schedel'],
  [['eik', 'wilg', 'boom', 'hout', 'woud', 'bos'], 'boom'],
  [['steen', 'grens', 'rots', 'nis', 'gewelf'], 'steen'],
  [['brug', 'wachters'], 'brug'],
  [['loods', 'vracht', 'krat', 'pandjes', 'koffer', 'rugzak', 'pakket'], 'krat'],
  [['spiegel', 'illusie'], 'spiegel'],
  [['herbarium', 'hydro', 'tuin', 'kruid', 'bloem', 'plant', 'veer'], 'blad'],
  [['eetzaal', 'diner', 'kokkin', 'keuken'], 'bestek'],
  [['rook', 'kabinet', 'aansteker', 'sigaret'], 'rook'],
  [['biljart'], 'bal'],
  [['kapel', 'bid', 'kaars', 'kandelaar', 'carbid', 'lamp'], 'kaars'],
  [['sleutel', 'kluis', 'slot'], 'sleutel'],
  [['lantaarn', 'licht', 'baken'], 'lantaarn'],
  [['revolver', 'geweer', 'wapen', 'mes', 'briefopener'], 'wapen'],
  [['brief', 'envelop', 'cheque', 'testament', 'rapport', 'kaartje', 'manifest'], 'brief'],
  [['horloge', 'klok', 'uur', 'wacht'], 'klok'],
  [['zender', 'communicat', 'alarm', 'draad', 'kabel', 'sensor'], 'bliksem'],
  [['camera', 'afluister', 'oog', 'getuige'], 'oog'],
  [['ketel', 'koeling', 'oven'], 'ketel'],
  [['put', 'bron', 'schacht', 'gat'], 'put'],
  [['toren', 'koetshuis', 'loods'], 'toren'],
  [['koepel', 'zaal', 'serre', 'wintertuin'], 'koepel'],
  [['koker', 'gang', 'buis', 'tunnel', 'steeg'], 'buis'],
  [['uitgang', 'deur', 'portaal', 'poort', 'kamer', 'vertrek', 'post', 'hut', 'cel'], 'deur'],
  [['meester', 'vrouw', 'heer', 'jongen', 'kind', 'weduwe', 'butler', 'gids', 'pilot', 'piloot', 'leerling', 'prefect', 'zuster', 'broeder', 'notaris', 'majoor', 'tante', 'neef', 'lady'], 'persoon'],
];

export function iconNaam(tekst) {
  const t = (tekst ?? '').toLowerCase();
  for (const [woorden, icoon] of SLEUTELWOORDEN) {
    if (woorden.some((w) => t.includes(w))) return icoon;
  }
  return 'deur';
}

const NS = 'http://www.w3.org/2000/svg';

// Bouwt de paden van een icoon in een bestaande <svg> of <g>.
export function tekenIcoon(ouder, naam, { x = 0, y = 0, grootte = 24, klasse = 'icoon' } = {}) {
  const paden = ICONS[naam] ?? ICONS.deur;
  const g = document.createElementNS(NS, 'g');
  const schaal = grootte / 24;
  g.setAttribute('transform', `translate(${x} ${y}) scale(${schaal})`);
  g.setAttribute('class', klasse);
  for (const d of paden) {
    const pad = document.createElementNS(NS, 'path');
    pad.setAttribute('d', d);
    g.append(pad);
  }
  ouder.append(g);
  return g;
}

// Een losse <svg> met een icoon erin, voor naast een tekstregel.
export function icoonElement(tekst, grootte = 18) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', grootte);
  svg.setAttribute('height', grootte);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'glyph');
  tekenIcoon(svg, iconNaam(tekst), { grootte: 24, klasse: '' });
  return svg;
}
