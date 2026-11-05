// Wat er op de lijst van het speurdokubord hangt, staat en kruipt.
//
// De lijst zelf was al per wereld anders, maar hij was keurig: een band met
// om de zoveel eenheden hetzelfde motiefje en drie dezelfde hoeken. Keurig is
// precies het probleem. Een rand gaat pas leven als er dingen op staan die
// er niet horen - een hangplant die over de rand het bord in valt, een
// grafzerk die scheef staat, een tovenaarshoed boven op de puzzel.
//
// Daarom zijn dit geen patronen maar losse dingen, met de hand neergezet:
//
//   kant   boven, onder, links of rechts
//   t      waar langs die kant, 0 is het begin en 1 het eind
//   maat   hoe groot, in bordeenheden (een vakje is er 76)
//   inzet  hoe ver het over de binnenrand heen hangt. Boven en links zit
//          daar nog de strook met de letters en cijfers, dus daar kan het
//          verder; onder en rechts begint het speelveld meteen.
//   draai  scheef, want niets wat ergens al jaren staat, staat recht
//
// Niets staat op een rooster en niets staat symmetrisch. Twee dezelfde
// dingen tegenover elkaar is weer een lijst.

import { bol, ovaal, plaat, romp, staaf, blad, kap, hoop, bak, zuilvorm, kruik, ring } from './vormen.js';

const v = (stof, d, extra) => (extra ? { stof, d, ...extra } : { stof, d });
const vloer = (stof, d) => ({ stof, d, grond: true });
const streep = (stof, dik, d) => ({ lijn: true, stof, dik, d });

// ----------------------------------------------------------------- bouwsels
//
// Een paar dingen komen in meer dan één wereld voor. Een kaars is een kaars.

const kaars = (kleur = 'papier') => [
  vloer('papier', hoop(24, 47, 20, 5)),
  v(kleur, zuilvorm(24, 18, 9, 11, 29)),
  v('papier', 'M20 24 Q18.6 32 20.4 40 Q22 34 21.4 26 Z', { glans: 0.7 }),
  v('vuur', 'M24 18.4 q-5 -0.6 -5.6 -5.4 q-0.6 -4.6 3.6 -8.2 q0.2 2.8 1.8 3.6 q0.4 -3.8 3.4 -6.4 q-0.4 3.6 1.4 5.4 q2.8 2.8 2.2 6.2 q-0.6 4.2 -6.8 4.8 Z'),
  v('goud', 'M24 16.4 q-3 -0.4 -3.2 -3.2 q-0.2 -2.6 2 -5 q0.4 2 1.6 2.4 q0.4 -2.2 2 -3.6 q0 2.6 1 3.8 q1.2 1.4 1 3 q-0.4 2.4 -4.4 2.6 Z', { glans: 1 }),
];

const spinrag = () => [
  vloer('papier', 'M1 1 Q24 2 46 1 Q46 3 46 5 Q24 7 2 5 Q1 3 1 1 Z', { glans: 0.2 }),
  streep('papier', 0.9, 'M2 2 Q14 16 24 30 Q34 16 46 2'),
  streep('papier', 0.8, 'M2 2 Q18 8 24 30 M46 2 Q30 8 24 30'),
  streep('papier', 0.7, 'M8 7 Q24 13 40 7 M12 13 Q24 19 36 13 M16 20 Q24 25 32 20'),
  v('donker', ovaal(24, 32, 4.4, 3.6)),
  v('donker', ovaal(24, 28.6, 2.6, 2.2)),
  streep('donker', 0.9, 'M20 30 L15 26 M20 32 L15 33 M20 34 L16 38 M28 30 L33 26 M28 32 L33 33 M28 34 L32 38'),
];

// ------------------------------------------------------------------ werelden

export const ORNAMENTEN = {
  // --------------------------------------------------------------- het woud
  //
  // Hangplanten die over de rand vallen, varens op de onderrand, een uil die
  // meekijkt. Dit is de wereld waar het meest overheen groeit.
  woud: [
    { kant: 'boven', t: 0.2, maat: 94, uit: 14, delen: [
      v('houtdonker', staaf(20, 0, 25, 44, 1.8)),
      v('houtdonker', staaf(29, 0, 34, 30, 1.5)),
      v('blad', blad(20.4, 5, 15, 5.4, 158)),
      v('blad', blad(21, 10, 13, 4.6, 26)),
      v('blad', blad(21.6, 15, 16, 5.6, 166)),
      v('blad', blad(22.4, 20, 13, 4.6, 18)),
      v('blad', blad(23, 25, 14, 5, 158)),
      v('blad', blad(23.8, 30, 12, 4.2, 28)),
      v('blad', blad(24.4, 35, 12, 4.2, 162)),
      v('blad', blad(25, 41, 10, 3.6, 36)),
      v('blad', blad(29.4, 6, 12, 4.2, 24)),
      v('blad', blad(30.6, 13, 13, 4.6, 152)),
      v('blad', blad(31.8, 20, 11, 4, 34)),
      v('blad', blad(33, 28, 10, 3.6, 150)),
      v('houtrood', bol(25.4, 44.6, 2.4)),
    ] },
    { kant: 'boven', t: 0.63, maat: 76, uit: 10, draai: 4, delen: [
      v('houtdonker', staaf(27, 0, 21, 36, 1.7)),
      v('blad', blad(26.4, 5, 13, 4.6, 28)),
      v('blad', blad(25.4, 11, 15, 5.2, 154)),
      v('blad', blad(24.4, 17, 12, 4.2, 32)),
      v('blad', blad(23.4, 23, 13, 4.6, 150)),
      v('blad', blad(22.4, 29, 11, 4, 36)),
      v('blad', blad(21.6, 35, 10, 3.6, 146)),
      v('houtrood', bol(21, 37.4, 2.6)),
    ] },
    { kant: 'onder', t: 0.22, maat: 64, uit: 15, delen: [
      vloer('blad', blad(24, 46, 19, 5.4, -90)),
      v('blad', blad(24, 46, 17, 4.6, -60)),
      v('blad', blad(24, 46, 17, 4.6, -120)),
      v('blad', blad(24, 46, 14, 4, -38)),
      v('blad', blad(24, 46, 14, 4, -142)),
      v('houtdonker', hoop(24, 47.4, 13, 3.4)),
    ] },
    { kant: 'onder', t: 0.74, maat: 54, uit: 13, draai: -5, delen: [
      vloer('papier', zuilvorm(18, 28, 5, 7, 18)),
      v('houtrood', 'M7 29 Q9.4 15.6 18 15 Q26.6 15.6 29 29 Q18 32 7 29 Z'),
      v('papier', bol(12.6, 23.4, 1.8)),
      v('papier', bol(21.6, 21.6, 2.2)),
      v('papier', zuilvorm(34, 34, 4, 5.4, 13)),
      v('houtrood', 'M25.6 35 Q27.4 25.6 34 25.2 Q40.6 25.6 42.4 35 Q34 37.4 25.6 35 Z'),
      v('blad', hoop(24, 47.6, 24, 4)),
    ] },
    { kant: 'rechts', t: 0.32, maat: 62, uit: 17, delen: [
      vloer('houtdonker', staaf(2, 45, 46, 40, 4.4)),
      v('haar', ovaal(26, 29, 10, 11.6)),
      v('haar', 'M18 14.6 L21.4 8.6 L24.4 14.4 Z'),
      v('haar', 'M34 14.6 L30.6 8.6 L27.6 14.4 Z'),
      v('haar', ovaal(26, 19.6, 9, 8)),
      v('papier', ovaal(22.2, 18.6, 3.4, 3.8)),
      v('papier', ovaal(29.8, 18.6, 3.4, 3.8)),
      v('donker', bol(22.6, 18.8, 1.6)),
      v('donker', bol(29.4, 18.8, 1.6)),
      v('goud', 'M26 21 L28.6 23.6 L26 26 L23.4 23.6 Z'),
      v('houtdonker', staaf(22.4, 38, 22.4, 42.6, 2.2)),
      v('houtdonker', staaf(29.6, 38, 29.6, 42.6, 2.2)),
    ] },
    { kant: 'links', t: 0.72, maat: 44, uit: 11, draai: -12, delen: [
      v('houtdonker', staaf(24, 18, 24, 30, 1.8)),
      v('stofblauw', 'M23 20 Q13 10 8 17 Q4 23 14 25 Q20 26 23 24 Z'),
      v('stofblauw', 'M25 20 Q35 10 40 17 Q44 23 34 25 Q28 26 25 24 Z'),
      v('stofblauw', 'M23 25 Q16 30 15 36 Q20 38 23 30 Z'),
      v('stofblauw', 'M25 25 Q32 30 33 36 Q28 38 25 30 Z'),
      v('goud', bol(24, 19, 1.8)),
    ] },
  ],

  // ---------------------------------------------------------- de catacomben
  //
  // Grafstenen die scheef zijn gezakt, een hand die over de rand grijpt,
  // botten op een stapel. Niets staat hier recht.
  catacomben: [
    { kant: 'onder', t: 0.17, maat: 82, uit: 16, draai: -9, delen: [
      vloer('steen', 'M13 46 Q12.4 26 15 15.6 Q18 5 25 5.6 Q33 6.4 34.4 17 Q36 27 35.6 46 Q24 48 13 46 Z'),
      v('steenkoel', 'M17 42.6 Q16.6 26 18.6 17.6 Q20.6 10 25 10.4 Q30 11 31.4 18 Q33 27 32.6 42.8 Q24 44.4 17 42.6 Z'),
      v('steenkoel', staaf(24.6, 14, 24.6, 22, 2.4)),
      v('steenkoel', staaf(20.6, 17, 28.6, 17, 2.2)),
      streep('steen', 1.2, 'M19.6 27 Q24.6 26 29.6 25.4 M20 32 Q24.6 31 29.6 30.4 M21 37 Q24.6 36.4 28.6 36'),
      v('blad', hoop(24, 47.6, 26, 4.4)),
    ] },
    { kant: 'onder', t: 0.45, maat: 68, uit: 15, draai: 7, delen: [
      vloer('steenkoel', 'M14 46 Q13.4 30 16 22 Q19 14.6 24 15 Q30 15.6 32 23 Q34.6 31 34 46 Q24 48 14 46 Z'),
      v('steen', 'M18 43 Q17.6 31 19.6 24.6 Q21.6 19 24 19.4 Q27.4 20 29 25 Q31 31 30.6 43 Q24 44.4 18 43 Z'),
      streep('steenkoel', 1.2, 'M20.6 29 Q24.4 28.2 28.2 27.8 M21 34 Q24.4 33.4 28 33'),
      v('blad', hoop(22, 47.6, 22, 3.6)),
    ] },
    { kant: 'links', t: 0.56, maat: 58, uit: 14, delen: [
      v('papier', 'M4 20.6 Q14 17.6 24 19.6 Q27.4 20.4 27 24 Q26.6 27.6 23 27.4 Q13.4 26.4 4 28.4 Z'),
      v('papier', staaf(24, 21, 38, 14.6, 3.4)),
      v('papier', staaf(25, 23.4, 41, 21.6, 3.4)),
      v('papier', staaf(25, 26, 39.4, 29, 3.2)),
      v('papier', staaf(23.4, 27.4, 34, 36, 3)),
      v('papier', bol(38.6, 13.6, 2)),
      v('papier', bol(41.6, 21.2, 2)),
      v('papier', bol(40, 29.6, 1.9)),
      v('papier', bol(34.6, 36.8, 1.8)),
    ] },
    { kant: 'boven', t: 0.34, maat: 54, uit: 12, draai: -6, delen: [
      vloer('papier', ovaal(24, 24, 14, 13.4)),
      v('papier', 'M14.6 31.6 Q24 28.6 33.4 31.6 Q34 39 30 41.6 Q24 43.4 18 41.6 Q14 39 14.6 31.6 Z'),
      v('donker', ovaal(18.6, 23, 4.4, 5)),
      v('donker', ovaal(29.4, 23, 4.4, 5)),
      v('donker', 'M24 27.6 Q26.4 31 24 33 Q21.6 31 24 27.6 Z'),
      v('donker', 'M18 36.4 Q24 34.8 30 36.4 Q24 38.2 18 36.4 Z'),
    ] },
    { kant: 'rechts', t: 0.72, maat: 54, uit: 14, delen: [
      vloer('papier', 'M6 40 Q24 36.6 42 40 Q42 43 42 45.4 Q24 48.4 6 45.4 Q6 43 6 40 Z'),
      v('papier', bol(7.4, 42.6, 3.4)),
      v('papier', bol(40.6, 42.6, 3.4)),
      v('papier', 'M9 31 Q24 27.6 39 31 Q39 34 39 36.4 Q24 39.4 9 36.4 Q9 34 9 31 Z'),
      v('papier', bol(10.4, 33.6, 3)),
      v('papier', bol(37.6, 33.6, 3)),
      v('papier', ovaal(24, 20, 11, 10.4)),
      v('donker', ovaal(20.4, 19.4, 3.4, 3.8)),
      v('donker', ovaal(27.6, 19.4, 3.4, 3.8)),
    ] },
    { kant: 'boven', t: 0.78, maat: 56, uit: 16, delen: kaars('papier') },
    { kant: 'onder', t: 0.84, maat: 44, uit: 12, delen: [
      vloer('haargrijs', ovaal(22, 36, 13, 7.4)),
      v('haargrijs', ovaal(33, 31.6, 6.4, 5.4)),
      v('haargrijs', 'M36 28 L38.6 23.4 L40 28.6 Z'),
      v('haargrijs', 'M29.4 28 L27.4 23.4 L32.4 26.4 Z'),
      v('donker', bol(36, 30.6, 1.5)),
      v('touw', staaf(10, 38, 2, 26, 2)),
    ] },
  ],

  // ------------------------------------------------------ academie: fantasy
  //
  // Een school waar iedereen kan liegen met een spreuk. Boven op de puzzel
  // staat dus een tovenaarshoed.
  academie: [
    { kant: 'boven', t: 0.5, maat: 122, uit: 56, draai: -7, delen: [
      vloer('stofblauw', 'M8 44 Q24 39 40 44 Q41 47 40 48 Q24 47 8 48 Q7 47 8 44 Z'),
      v('stofblauw', 'M13 45 Q15 28 20 16 Q24 6 27 2 Q31 9 30 18 Q29 30 32 44 Q24 47 13 45 Z'),
      v('stofblauw', 'M16 44 Q18 29 22 18 Q25 9 27 4 Q27 14 24.4 24 Q21.6 34 21 44 Z', { glans: 0.7 }),
      v('goud', 'M11.6 42 Q24 37.6 36.4 42 Q36.8 44 36.4 45.6 Q24 41.6 11.6 45.6 Q11.2 44 11.6 42 Z'),
      v('goud', 'M27 6 L29.4 10.4 L34 11.4 L30.6 14.6 L31.4 19.4 L27 17 L22.6 19.4 L23.4 14.6 L20 11.4 L24.6 10.4 Z'),
    ] },
    { kant: 'links', t: 0.26, maat: 58, uit: 14, draai: 5, delen: [
      vloer('houtrood', romp(6, 34, 36, 10, { taps: 0.02 })),
      v('stofblauw', romp(8, 25, 33, 9, { taps: 0.02 })),
      v('stofgroen', romp(10, 17, 30, 8, { taps: 0.02 })),
      v('papier', romp(12, 10, 27, 7, { taps: 0.02 })),
      streep('goud', 0.9, 'M8 38.6 Q24 37.4 40 38.6 M10 29.4 Q24 28.4 39 29.4 M12 21 Q24 20.2 38 21'),
      v('goud', plaat(16, 6.6, 8, 3.4)),
    ] },
    { kant: 'rechts', t: 0.42, maat: 56, uit: 15, delen: [
      vloer('donker', kruik(16, 22, 4, 6, 26, 19, 18)),
      v('donker', plaat(8, 21, 16, 3, { zak: 0.4 })),
      v('papier', staaf(18, 23, 36, 9, 4, { krimp: 0.55 })),
      v('papier', blad(36, 9, 9, 3, -48)),
      v('goud', bol(17.4, 21.6, 1.8)),
      v('stofblauw', plaat(26, 38, 18, 4, { zak: 0.5 })),
    ] },
    { kant: 'onder', t: 0.3, maat: 54, uit: 13, delen: [
      vloer('koper', bak(24, 36, 22, 14, 10)),
      v('koper', plaat(12, 35, 24, 2.6, { zak: 0.5 })),
      v('glas', bol(24, 22, 13), { glans: 1 }),
      v('stofblauw', bol(24, 22, 10)),
      v('goud', bol(20, 18, 1.6), { glans: 1 }),
      v('goud', bol(27.4, 24.6, 1.4), { glans: 1 }),
      v('papier', bol(22.4, 26, 1.2), { glans: 1 }),
      v('glas', 'M16 18 Q17 12.6 22.4 10.6 L26 10.4 Q19.4 13 18.4 19.4 Z', { glans: 1 }),
    ] },
    { kant: 'onder', t: 0.74, maat: 48, uit: 12, draai: 8, delen: [
      vloer('papier', 'M6 30 Q24 24.6 42 30 Q42.6 38 42 44.6 Q24 49 6 44.6 Q5.4 38 6 30 Z'),
      v('papier', 'M6 30 Q15 27.4 23.4 28.6 Q24 36 23.4 44.6 Q15 46.6 6 44.6 Z'),
      streep('donker', 0.8, 'M10 34.6 Q16 33.6 21 34 M10 38 Q16 37 21 37.4 M27 34 Q33 33.4 39 34 M27 37.4 Q33 36.8 39 37.4 M27 40.8 Q33 40.2 39 40.8'),
      v('goud', plaat(21, 28.6, 6, 2)),
    ] },
    { kant: 'boven', t: 0.14, maat: 54, uit: 18, delen: [
      v('koper', staaf(24, 0, 24, 14, 2)),
      v('koper', 'M14 14 Q24 11.6 34 14 Q34.6 18 34 20.6 Q24 23.4 14 20.6 Q13.4 18 14 14 Z'),
      v('glas', bol(24, 29, 9), { glans: 1 }),
      v('vuur', bol(24, 29, 5.4), { glans: 1 }),
      v('goud', bol(24, 29, 2.6), { glans: 1 }),
      v('koper', plaat(18, 20, 12, 3)),
    ] },
  ],

  // ------------------------------------------------------------- halloween
  halloween: [
    { kant: 'boven', t: 0.26, maat: 74, uit: 38, delen: [
      v('donker', 'M24 18 Q27.4 18 28 23 Q28.4 28 24 29 Q19.6 28 20 23 Q20.6 18 24 18 Z'),
      v('donker', 'M24 17 Q25.4 11.6 29.4 12 Q31.4 12.4 31 15 Q30.6 17.4 28 17.6 Q26 17.8 24 17 Z'),
      v('donker', 'M20 21 Q12 12 4 14 Q10 17.6 10.4 22 Q6 21.4 3 23.6 Q10 25.4 12 29 Q15.6 25 20 25.6 Z'),
      v('donker', 'M28 21 Q36 12 44 14 Q38 17.6 37.6 22 Q42 21.4 45 23.6 Q38 25.4 36 29 Q32.4 25 28 25.6 Z'),
      v('vuur', bol(22, 21.6, 1.2), { glans: 1 }),
      v('vuur', bol(26, 21.6, 1.2), { glans: 1 }),
    ] },
    { kant: 'onder', t: 0.2, maat: 74, uit: 16, draai: -6, delen: [
      vloer('vuur', 'M24 14.6 Q38 14.6 40 27.4 Q41 40.4 24 41.4 Q7 40.4 8 27.4 Q10 14.6 24 14.6 Z'),
      v('vuur', 'M24 15 Q29.4 16.4 30.4 27.6 Q31 38 24 40.6 Q27 32.4 27 27.6 Q27 20.4 24 15 Z', { glans: 0.8 }),
      v('blad', staaf(24, 15.4, 28, 5.4, 3.6)),
      v('donker', 'M15.6 25.6 L20.4 22.4 L21.4 27.2 Z'),
      v('donker', 'M32.4 25.6 L27.6 22.4 L26.6 27.2 Z'),
      v('donker', 'M15 31 Q19 36 24 31 Q29 36 33 31 Q29 38 24 36.6 Q19 38 15 31 Z'),
      v('vuur', 'M17 30 Q24 34 31 30 Q24 35.6 17 30 Z', { glans: 1 }),
    ] },
    { kant: 'rechts', t: 0.3, maat: 56, uit: 8, delen: spinrag() },
    { kant: 'links', t: 0.66, maat: 56, uit: 15, delen: [
      vloer('houtdonker', staaf(0, 42, 48, 38, 4)),
      v('donker', 'M26 36 Q32 34 33 26 Q34 17 27 15 Q20 14 18 21 Q16 29 20 34 Q23 37 26 36 Z'),
      v('donker', 'M27 15.6 Q31 10 36 11 Q33 14 32.6 17.6 Z'),
      v('donker', 'M21 16.6 Q18 11.6 13 12.6 Q16 15 17 18.6 Z'),
      v('goud', bol(23.4, 20, 1.6), { glans: 1 }),
      v('goud', 'M18.4 22 L13 23.4 L18.6 24.6 Z'),
      v('houtdonker', staaf(24, 35, 24, 40, 2)),
      v('houtdonker', staaf(29, 34.4, 30, 39.4, 2)),
    ] },
    { kant: 'boven', t: 0.74, maat: 56, uit: 16, delen: kaars('houtrood') },
    { kant: 'onder', t: 0.78, maat: 50, uit: 13, draai: 6, delen: [
      vloer('houtdonker', staaf(4, 44, 44, 40, 5)),
      v('houtdonker', staaf(14, 42, 20, 24, 3.4)),
      v('houtdonker', staaf(20, 28, 11, 18, 2.4)),
      v('houtdonker', staaf(20, 26, 30, 14, 2.4)),
      v('houtdonker', staaf(30, 14, 36, 8, 1.8)),
      v('houtrood', bol(11, 17.4, 2.2)),
      v('houtrood', bol(36.4, 7.4, 2)),
    ] },
  ],

  // ------------------------------------------------------------------ kerst
  kerst: [
    { kant: 'boven', t: 0.24, maat: 66, uit: 6, delen: [
      v('goud', staaf(24, 0, 24, 14, 1.2)),
      v('houtrood', bol(24, 25, 10.4)),
      v('houtrood', 'M17.6 18.6 Q21 15.6 25 16.4 Q22.4 20 18.6 21.6 Z', { glans: 1 }),
      v('goud', romp(21.4, 12.6, 5.2, 3.4, { taps: 0.1 })),
      v('goud', 'M19.4 29 Q24 26.6 28.6 29 Q24 31 19.4 29 Z'),
    ] },
    { kant: 'boven', t: 0.38, maat: 82, uit: 6, delen: [
      v('goud', staaf(24, 0, 24, 18, 1.1)),
      v('stofblauw', bol(24, 28, 9)),
      v('stofblauw', 'M18.6 22.6 Q21.6 20 25 20.6 Q22.6 23.6 19.4 25 Z', { glans: 1 }),
      v('goud', romp(21.6, 16.6, 4.8, 3, { taps: 0.1 })),
    ] },
    { kant: 'boven', t: 0.56, maat: 58, uit: 6, delen: [
      v('goud', staaf(24, 0, 24, 12, 1.1)),
      v('stofgroen', bol(24, 22, 9.4)),
      v('papier', 'M18.6 16.6 Q21.6 14 25 14.6 Q22.6 17.6 19.4 19 Z', { glans: 1 }),
      v('goud', romp(21.6, 10.6, 4.8, 3, { taps: 0.1 })),
      v('goud', 'M24 31.6 Q27 29.6 30 31.6 Q27 33 24 31.6 Z'),
    ] },
    { kant: 'links', t: 0.3, maat: 58, uit: 14, draai: -8, delen: [
      vloer('houtrood', 'M24 26 Q14 14 7 18 Q2 22 9 27 Q16 31 24 30 Z'),
      v('houtrood', 'M24 26 Q34 14 41 18 Q46 22 39 27 Q32 31 24 30 Z'),
      v('houtrood', 'M22 30 Q16 36 14 46 Q20 46 23 34 Z'),
      v('houtrood', 'M26 30 Q32 36 34 46 Q28 46 25 34 Z'),
      v('goud', bol(24, 27.6, 4.4)),
      v('goud', bol(24, 27.6, 1.8), { glans: 1 }),
    ] },
    { kant: 'onder', t: 0.28, maat: 54, uit: 13, draai: 9, delen: [
      vloer('papier', 'M20 46 Q18 30 20 20 Q22 9 30 9.6 Q38 10.4 38.6 20 Q39 26 34 26.6 Q29.4 26.4 29.4 21 Q29.4 17.6 31.6 17.4 Q33.4 17.6 33.4 20 L29 20 Q29 14.6 30 14.4 Q25.4 15 24.6 21 Q23.4 31 25.6 46 Z'),
      streep('houtrood', 2.6, 'M21 44 Q19.4 32 21 22 M23.6 16 Q26 11.6 30.4 12 M34.6 14.6 Q37 17.4 36.4 21'),
      v('stofgroen', 'M17.6 44 Q22.6 42.6 27.6 44 Q27.6 46 27.6 47.6 Q22.6 49 17.6 47.6 Q17.6 46 17.6 44 Z'),
      v('papier', 'M22 20 Q20.6 30 21.6 42 Q23 32 23 21 Z', { glans: 0.8 }),
    ] },
    { kant: 'rechts', t: 0.64, maat: 54, uit: 14, delen: [
      vloer('blad', 'M24 44 Q10 38 8 24 Q7 12 18 9 Q24 14 24 22 Q24 14 30 9 Q41 12 40 24 Q38 38 24 44 Z'),
      v('houtrood', bol(16, 24, 3.4)),
      v('houtrood', bol(22, 30, 3)),
      v('houtrood', bol(30, 25, 3.2)),
      v('goud', bol(15.2, 23.2, 1.1), { glans: 1 }),
      v('goud', bol(29.2, 24.2, 1), { glans: 1 }),
    ] },
  ],

  // ------------------------------------------------------------------- noir
  noir: [
    { kant: 'boven', t: 0.28, maat: 104, uit: 46, delen: [
      v('metaal', staaf(26, 0, 26, 44, 3.4)),
      v('metaal', staaf(26, 10, 15, 10, 2.6)),
      v('donker', romp(8, 8, 15, 7, { taps: 0.06 })),
      v('vuur', plaat(9.4, 9.6, 12.2, 4, { zak: 0.3 }), { glans: 1 }),
      v('vuur', 'M9 15 L22 15 L30 44 L1 44 Z', { glans: 0.3 }),
      v('metaal', bol(26, 46, 2.4)),
    ] },
    { kant: 'links', t: 0.34, maat: 54, uit: 13, draai: -6, delen: [
      vloer('donker', ovaal(24, 30, 19, 7.4)),
      v('donker', 'M12 29 Q14 14 24 13 Q34 14 36 29 Q24 33 12 29 Z'),
      v('donker', 'M15 26 Q17 17 23 15.6 Q20 21 19.4 28 Z', { glans: 0.7 }),
      v('stof', plaat(13, 25.6, 22, 3, { zak: 0.5 })),
      v('metaal', staaf(6, 36, 6, 12, 2.2)),
    ] },
    { kant: 'onder', t: 0.26, maat: 60, uit: 14, delen: [
      vloer('water', ovaal(24, 36, 22, 9)),
      v('water', ovaal(22, 34, 15, 5.4), { glans: 1 }),
      v('vuur', 'M14 33 Q24 30.6 34 33 Q24 35.4 14 33 Z', { glans: 1 }),
      v('water', 'M10 40 Q24 42.6 38 40 Q24 43.4 10 40 Z', { glans: 0.8 }),
      v('papier', plaat(28, 25, 14, 3, { zak: 0.5 })),
    ] },
    { kant: 'rechts', t: 0.6, maat: 56, uit: 14, draai: 4, delen: [
      vloer('papier', 'M6 42 Q18 30 30 26 Q42 22 44 28 Q40 38 28 43 Q16 47 6 42 Z'),
      v('papier', 'M8 40 Q19 30 30 27 Q27 34 18 40 Z', { glans: 0.8 }),
      streep('donker', 0.8, 'M13 38 Q22 32 31 29 M16 41 Q25 35 34 32 M11 34 Q18 29 25 27'),
    ] },
    { kant: 'onder', t: 0.72, maat: 52, uit: 13, delen: [
      vloer('donker', ovaal(26, 38, 15, 7)),
      v('donker', ovaal(14, 31, 7, 6.4)),
      v('donker', 'M9 26 L11.6 20.6 L14.6 26 Z'),
      v('donker', 'M17 26 L19.6 20.6 L21.6 26.4 Z'),
      v('vuur', bol(11.6, 30, 1.5), { glans: 1 }),
      v('vuur', bol(17, 30, 1.5), { glans: 1 }),
      v('donker', staaf(39, 36, 46, 20, 3.4)),
    ] },
  ],

  // -------------------------------------------------------------- landhuis
  landhuis: [
    { kant: 'boven', t: 0.3, maat: 90, uit: 42, delen: [
      vloer('koper', bak(24, 38, 24, 14, 9)),
      v('koper', zuilvorm(24, 22, 5, 7, 17)),
      v('koper', plaat(9, 20, 30, 3, { zak: 0.8 })),
      v('koper', staaf(13, 21, 13, 19, 2.4)),
      v('koper', staaf(35, 21, 35, 19, 2.4)),
      v('papier', zuilvorm(24, 12, 4.4, 5.4, 11)),
      v('papier', zuilvorm(13, 10, 4, 5, 9)),
      v('papier', zuilvorm(35, 10, 4, 5, 9)),
      v('vuur', 'M24 12.4 q-3.4 -0.4 -3.8 -3.8 q-0.4 -3 2.4 -5.4 q0.2 1.8 1.2 2.4 q0.3 -2.6 2.2 -4.2 q-0.2 2.4 1 3.6 q1.8 1.8 1.4 4 q-0.4 2.8 -4.4 3.4 Z'),
      v('vuur', 'M13 10.4 q-2.6 -0.3 -2.8 -2.8 q-0.3 -2.2 1.8 -4 q0.2 1.4 0.9 1.8 q0.2 -1.9 1.6 -3.1 q-0.1 1.8 0.7 2.7 q1.3 1.3 1 2.9 q-0.3 2.1 -3.2 2.5 Z'),
      v('vuur', 'M35 10.4 q-2.6 -0.3 -2.8 -2.8 q-0.3 -2.2 1.8 -4 q0.2 1.4 0.9 1.8 q0.2 -1.9 1.6 -3.1 q-0.1 1.8 0.7 2.7 q1.3 1.3 1 2.9 q-0.3 2.1 -3.2 2.5 Z'),
    ] },
    { kant: 'links', t: 0.4, maat: 56, uit: 14, draai: 4, delen: [
      vloer('goud', romp(5, 6, 38, 36, { taps: 0.01, bol: 0.4 })),
      v('donker', romp(9.4, 10.4, 29.2, 27.2, { taps: 0.01 })),
      v('huid', ovaal(24, 20, 7, 8)),
      v('haar', 'M17.6 18 Q18.6 10.6 24 10.4 Q29.4 10.6 30.4 18 Q27 14.6 24 14.8 Q21 14.6 17.6 18 Z'),
      v('stofblauw', 'M14.6 37.6 Q17 29 24 28 Q31 29 33.4 37.6 Q24 39.4 14.6 37.6 Z'),
      v('donker', ovaal(21.6, 19.6, 1.1, 0.9)),
      v('donker', ovaal(26.4, 19.6, 1.1, 0.9)),
    ] },
    { kant: 'rechts', t: 0.34, maat: 52, uit: 10, delen: [
      v('koper', staaf(24, 0, 24, 13, 1.4)),
      v('koper', ring(24, 18, 5.4, 1.4), { gat: true }),
      v('goud', staaf(22, 22, 22, 38, 2.6)),
      v('goud', 'M19.4 34 L19.4 38 L25 38 L25 34 Z'),
      v('koper', staaf(29, 22, 29, 34, 2.2)),
      v('koper', 'M26.6 31 L26.6 34 L31.4 34 L31.4 31 Z'),
    ] },
    { kant: 'onder', t: 0.24, maat: 56, uit: 14, draai: -5, delen: [
      vloer('glas', kruik(24, 16, 7, 8, 26, 20, 18)),
      v('water', plaat(15, 32, 18, 5, { zak: 0.6 }), { glans: 1 }),
      v('blad', staaf(24, 26, 20, 8, 2.2)),
      v('blad', staaf(24, 26, 30, 10, 2)),
      v('houtrood', bol(19.4, 6.6, 4.4)),
      v('houtrood', bol(30.4, 8.6, 3.6)),
      v('blad', blad(24, 20, 9, 3, -160)),
      v('blad', blad(24, 22, 8, 2.8, -20)),
    ] },
    { kant: 'onder', t: 0.72, maat: 50, uit: 13, delen: [
      vloer('houtrood', 'M8 40 Q24 34.6 40 40 Q40.6 44 40 46.6 Q24 49 8 46.6 Q7.4 44 8 40 Z'),
      v('papier', 'M10 34 Q24 29.6 38 34 Q38 38 38 40.6 Q24 44 10 40.6 Q10 38 10 34 Z'),
      streep('donker', 0.8, 'M14 37 Q20 36 26 36.6 M14 39.6 Q22 38.6 30 39.2'),
      v('goud', bol(33, 36.6, 2.4)),
    ] },
  ],

  // --------------------------------------------------------------- station
  station: [
    { kant: 'boven', t: 0.32, maat: 80, uit: 34, delen: [
      v('metaal', ring(24, 24, 18, 4), { gat: true }),
      v('metaal', ring(24, 24, 7, 3), { gat: true }),
      v('metaal', staaf(24, 9, 24, 39, 3.4)),
      v('metaal', staaf(9, 24, 39, 24, 3.4)),
      v('metaal', staaf(13.4, 13.4, 34.6, 34.6, 3)),
      v('metaal', staaf(34.6, 13.4, 13.4, 34.6, 3)),
      v('goud', bol(24, 24, 3.4)),
    ] },
    { kant: 'rechts', t: 0.28, maat: 58, uit: 8, delen: [
      v('donker', 'M24 0 Q38 6 40 20 Q42 34 34 46 Q30 36 32 24 Q34 10 24 0 Z'),
      v('donker', 'M14 0 Q6 10 8 24 Q10 38 18 48 Q14 34 16 20 Q18 8 14 0 Z'),
      v('houtrood', 'M20 0 Q24 12 22 26 Q20 38 24 48 Q28 36 28 24 Q28 10 24 0 Z'),
      v('metaal', plaat(6, 22, 36, 4, { zak: 0.4 })),
    ] },
    { kant: 'links', t: 0.6, maat: 54, uit: 13, draai: 24, delen: [
      v('metaal', 'M10 24 Q10 16 17 15 Q23 14.6 24 20 L36 28 Q40 30.6 38 34 Q35.6 37 32 34.6 L20 27 Q13 29 11 26 Q10 25 10 24 Z'),
      v('metaal', 'M11 22.6 Q12 17.6 17.4 17 Q21.4 16.8 21.6 20.4 Q18 20 15 21 Q12.6 21.6 11 22.6 Z', { glans: 1 }),
      v('metaal', bol(35.4, 31.6, 2.4)),
    ] },
    { kant: 'onder', t: 0.3, maat: 56, uit: 14, delen: [
      vloer('metaal', bol(24, 24, 20)),
      v('metaal', ring(24, 24, 20, 4.4), { gat: true }),
      v('donker', bol(24, 24, 15)),
      v('goud', bol(17, 18, 1.6), { glans: 1 }),
      v('papier', bol(28, 15.4, 1.3), { glans: 1 }),
      v('goud', bol(30, 27, 1.5), { glans: 1 }),
      v('papier', bol(19.4, 29, 1.2), { glans: 1 }),
      v('metaal', bol(10.4, 10.4, 2)),
      v('metaal', bol(37.6, 37.6, 2)),
    ] },
    { kant: 'onder', t: 0.74, maat: 52, uit: 13, draai: -7, delen: [
      vloer('goud', 'M24 8 L44 42 Q44.6 45 42 45.4 L6 45.4 Q3.4 45 4 42 Z'),
      v('donker', 'M24 14 L38.6 40 Q39 41.6 37.4 41.8 L10.6 41.8 Q9 41.6 9.4 40 Z'),
      v('goud', 'M22 22 L26 22 L25.4 32 L22.6 32 Z'),
      v('goud', bol(24, 36, 2.2)),
    ] },
  ],
};

export const ORNAMENTWERELDEN = Object.keys(ORNAMENTEN);
