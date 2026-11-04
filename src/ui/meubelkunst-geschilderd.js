// Zes meubelstukken, opnieuw getekend voor de geschilderde motor.
//
// Dit is geen vertaling van de oude tekeningen. De oude zijn gebouwd uit
// rechthoeken: `M17 6h14v2H17Z`, kaarsrecht, haaks, met één kleur. Die vorm
// is de helft van waarom het stram oogt - de andere helft was het licht, en
// dat zit in geschilderd.js.
//
// Hier staat geen enkele haakse rechthoek in. Een kast staat een slag
// scheef, een plank buigt door, een schouw loopt naar boven iets taps toe.
// Dat is wat je tekent als je het natekent in plaats van uitrekent.
//
// Elk onderdeel noemt zijn materiaal, en de motor doet het licht. `grond`
// betekent: dit stuk raakt de vloer, zet er een contactschaduw onder.

export const GESCHILDERD = {
  // ------------------------------------------------------------------ haard
  haard: [
    { stof: 'steen', grond: true, d: 'M7 14.5 q17 -2.6 34.4 0 l1.2 28.6 q-18.4 2.1 -36.8 0 Z' },
    { stof: 'steen', d: 'M3.4 9.6 q20.6 -3.2 41.2 0 q0.4 2.6 0 5.2 q-20.6 -2.8 -41.2 0 q-0.5 -2.6 0 -5.2 Z' },
    { stof: 'steenkoel', d: 'M7.6 16.4 q6 -1 11.6 -0.6 l-0.4 26.6 q-5.6 0.3 -11.4 0 Z' },
    { stof: 'steenkoel', d: 'M29.4 15.8 q5.8 -0.4 11.6 0.6 l0.6 26 q-5.8 0.3 -11.6 0 Z' },
    { stof: 'donker', d: 'M14.6 25.4 q9.4 -9.6 19.2 0 l0.7 17.8 q-10.2 1 -20.6 0 Z' },
    { stof: 'donker', glans: 0.3, d: 'M16.8 26.6 q7.2 -7 14.8 0 l0.3 5 q-7.6 -5.4 -15.4 0 Z' },
    { stof: 'houtdonker', d: 'M16.4 37.4 q7.6 -2.8 15.4 0 q0.4 2.4 0 4.6 q-7.8 2 -15.4 0 q-0.5 -2.3 0 -4.6 Z' },
    { stof: 'hout', d: 'M18.6 34.2 q5.6 -2.4 11.2 0 q0.3 1.7 0 3.2 q-5.6 1.6 -11.2 0 q-0.4 -1.6 0 -3.2 Z' },
    { stof: 'vuur', d: 'M24 39.4 q-4.6 -0.6 -5.4 -5 q-0.7 -4.2 2.8 -7.4 q0.2 2.6 1.6 3.4 q0.4 -3.6 3.2 -6.2 q-0.3 3.4 1.2 5 q2.6 2.6 2.2 6 q-0.5 3.8 -5.6 4.2 Z' },
    { stof: 'goud', glans: 1, d: 'M24 37.6 q-2.8 -0.4 -3 -3 q-0.2 -2.4 1.8 -4.6 q0.4 1.8 1.4 2.2 q0.5 -2 2 -3.4 q0 2.4 1 3.6 q1 1.3 0.8 2.6 q-0.3 2.2 -4 2.6 Z' },
    { stof: 'steen', d: 'M3.8 42.4 q20.2 -2 40.4 0 q0.4 1.6 0 3.2 q-20.2 1.8 -40.4 0 q-0.4 -1.6 0 -3.2 Z' },
  ],

  // --------------------------------------------------------------- fauteuil
  fauteuil: [
    { stof: 'stof', grond: true, d: 'M12.4 11.4 q11.8 -4.2 23.6 0 q2.2 0.8 1.8 6.6 l-0.8 10.6 q-12.4 2.6 -25.6 0 l-0.8 -10.6 q-0.4 -5.8 1.8 -6.6 Z' },
    { stof: 'stof', glans: 1, d: 'M15.6 14.2 q8.6 -2.6 17 0 q0.6 0.5 0.4 3.6 l-0.4 4.6 q-8.6 1.6 -17 0 l-0.4 -4.6 q-0.2 -3.1 0.4 -3.6 Z' },
    { stof: 'houtrood', d: 'M4.4 21.6 q3.4 -2.8 7.4 -1.2 l0.6 13.4 q-4.4 1.6 -8.6 0 Z' },
    { stof: 'houtrood', d: 'M43.6 21.6 q-3.4 -2.8 -7.4 -1.2 l-0.6 13.4 q4.4 1.6 8.6 0 Z' },
    { stof: 'stof', d: 'M10 26.8 q14 -3.2 28 0 q1.6 3.8 0.4 8.4 q-14.4 2.8 -28.8 0 q-1.2 -4.6 0.4 -8.4 Z' },
    { stof: 'stof', glans: 1, d: 'M13 28.6 q11 -2 22 0 q0.6 1.4 0.2 3 q-11.2 1.6 -22.4 0 q-0.4 -1.6 0.2 -3 Z' },
    { stof: 'houtdonker', d: 'M12.6 34.8 q2.4 -0.6 4.6 0 l-0.8 8.6 q-1.6 0.5 -3.2 0 Z' },
    { stof: 'houtdonker', d: 'M35.4 34.8 q-2.4 -0.6 -4.6 0 l0.8 8.6 q1.6 0.5 3.2 0 Z' },
    { lijn: true, stof: 'houtrood', dik: 1, d: 'M18.4 15 q0.6 5 0.2 9.4 M29.6 15 q-0.6 5 -0.2 9.4' },
  ],

  // ------------------------------------------------------------- boekenkast
  boekenkast: [
    { stof: 'houtdonker', grond: true, d: 'M8.4 6.6 q15.8 -2.2 31.6 0 l1.2 36.6 q-17 2 -34 0 Z' },
    { stof: 'donker', d: 'M11.6 9.4 q12.4 -1.6 24.8 0 l0.8 31 q-13.2 1.6 -26.4 0 Z' },
    { stof: 'hout', d: 'M5.6 3 q18.4 -2.6 36.8 0 q0.5 2 0 4 q-18.4 -2.2 -36.8 0 q-0.5 -2 0 -4 Z' },
    { stof: 'houtrood', d: 'M13 11.4 q1.8 -0.5 3.4 0 l0 8 q-1.7 0.4 -3.4 0 Z' },
    { stof: 'papier', d: 'M16.6 11.2 q1.6 -0.4 3 0 l0.2 8.2 q-1.5 0.4 -3 0 Z' },
    { stof: 'stofblauw', d: 'M20 11.6 q2 -0.5 3.8 0 l0.2 7.8 q-1.9 0.4 -3.8 0 Z' },
    { stof: 'stofgroen', d: 'M24.2 11.3 q1.7 -0.4 3.2 0 l0.2 8.1 q-1.6 0.4 -3.2 0 Z' },
    { stof: 'goud', d: 'M28 12 q1.5 -0.4 2.8 0 l0.2 7.4 q-1.4 0.4 -2.8 0 Z' },
    { stof: 'hout', d: 'M11 19.2 q13 -1.4 26 0 q0.3 1.2 0 2.4 q-13 1.3 -26 0 q-0.3 -1.2 0 -2.4 Z' },
    { stof: 'stofgroen', d: 'M13.4 23.2 q1.9 -0.5 3.6 0 l0.2 7.6 q-1.8 0.4 -3.6 0 Z' },
    { stof: 'houtrood', d: 'M17.4 23.6 q1.6 -0.4 3 0 l0.2 7.2 q-1.5 0.4 -3 0 Z' },
    { stof: 'papier', d: 'M21 23.2 q2 -0.5 3.8 0 l0.2 7.6 q-1.9 0.4 -3.8 0 Z' },
    { stof: 'stofblauw', d: 'M25.4 23.8 q1.7 -0.4 3.2 0 l0.2 7 q-1.6 0.4 -3.2 0 Z' },
    { stof: 'stof', d: 'M29.2 29.6 q3.4 -1.4 6.4 0 q0.2 0.6 0 1.4 q-3.2 1 -6.4 0 Z' },
    { stof: 'hout', d: 'M11.2 30.6 q12.8 -1.4 25.6 0 q0.3 1.2 0 2.4 q-12.8 1.3 -25.6 0 q-0.3 -1.2 0 -2.4 Z' },
    { stof: 'papier', d: 'M14 34.4 q2 -0.5 3.8 0 l0.2 5.6 q-1.9 0.4 -3.8 0 Z' },
    { stof: 'goud', d: 'M18.2 34.8 q1.6 -0.4 3 0 l0.2 5.2 q-1.5 0.4 -3 0 Z' },
    { stof: 'stofblauw', d: 'M22 34.2 q2.1 -0.5 4 0 l0.2 5.8 q-2 0.4 -4 0 Z' },
    { stof: 'houtrood', d: 'M26.6 35 q1.7 -0.4 3.2 0 l0.2 5 q-1.6 0.4 -3.2 0 Z' },
    { stof: 'hout', d: 'M8.8 42 q16.4 -1.8 32.8 0 q0.4 1.8 0 3.6 q-16.4 1.6 -32.8 0 q-0.4 -1.8 0 -3.6 Z' },
  ],

  // --------------------------------------------------------- staande spiegel
  //
  // Hier ging het eerder mis: een rechthoek met een streep erin is geen
  // spiegel. Een spiegel herken je aan drie dingen - hij staat op poten, hij
  // heeft een lijst die dikker is dan je denkt, en er valt een schuine veeg
  // licht overheen. Dat laatste doet het werk.
  staandespiegel: [
    { stof: 'houtdonker', grond: true, d: 'M24 2.6 q11.6 0 11.6 13.2 l0 14.4 q0 12.4 -11.6 12.4 q-11.6 0 -11.6 -12.4 l0 -14.4 q0 -13.2 11.6 -13.2 Z' },
    { stof: 'hout', d: 'M24 4.6 q9.6 0 9.6 11.4 l0 14.2 q0 10.6 -9.6 10.6 q-9.6 0 -9.6 -10.6 l0 -14.2 q0 -11.4 9.6 -11.4 Z' },
    { stof: 'spiegel', d: 'M24 6.6 q7.8 0 7.8 9.6 l0 14 q0 8.8 -7.8 8.8 q-7.8 0 -7.8 -8.8 l0 -14 q0 -9.6 7.8 -9.6 Z' },
    { stof: 'spiegel', glans: 1, d: 'M18.4 29.6 q-2 -1.6 -2 -5.6 l0 -8.4 q0 -7 4.6 -8.6 l5.2 0 q-6.6 2.6 -6.6 10 Z' },
    { stof: 'glas', glans: 1, d: 'M28.6 10.6 q2.8 2.6 2.8 8 l0 6.4 l-7.6 11 l-3.4 0 Z' },
    { stof: 'koper', d: 'M21.2 13.4 q2.8 -1.4 5.6 0 q-2.8 0.8 -5.6 0 Z' },
    { stof: 'houtdonker', d: 'M11 39.8 q13 -2 26 0 q0.4 1.5 0 3 q-13 1.8 -26 0 q-0.4 -1.5 0 -3 Z' },
    { stof: 'houtdonker', d: 'M8.4 42.2 q4 -1.2 7.6 0 l0.6 3.4 q-4.4 0.8 -8.8 0 Z' },
    { stof: 'houtdonker', d: 'M39.6 42.2 q-4 -1.2 -7.6 0 l-0.6 3.4 q4.4 0.8 8.8 0 Z' },
    { lijn: true, stof: 'hout', dik: 1.2, d: 'M20.4 39.6 q3.6 -1 7.2 0' },
  ],

  // -------------------------------------------------------------- waterput
  put: [
    { stof: 'houtdonker', d: 'M11.6 15.4 q1.6 -0.6 3.2 0 l0.8 23 q-2 0.6 -4 0 Z' },
    { stof: 'houtdonker', d: 'M36.4 15.4 q-1.6 -0.6 -3.2 0 l-0.8 23 q2 0.6 4 0 Z' },
    { stof: 'hout', d: 'M24 3.4 q1.4 0 2.6 0.8 l15.4 9.4 q-1.4 1.8 -3.4 2.4 l-14.6 -8.4 l-14.6 8.4 q-2 -0.6 -3.4 -2.4 l15.4 -9.4 q1.2 -0.8 2.6 -0.8 Z' },
    { stof: 'houtdonker', d: 'M8.2 13.6 q15.8 -9.2 31.6 0 q0.3 1.2 -0.4 2 q-15.4 -8.4 -30.8 0 q-0.7 -0.8 -0.4 -2 Z' },
    { lijn: true, stof: 'touw', dik: 1.3, d: 'M24 14.6 l0 9.6' },
    { stof: 'steen', grond: true, d: 'M9.4 26.8 q14.6 -5 29.2 0 l-1.4 12.8 q-13.2 3.6 -26.4 0 Z' },
    { stof: 'steenkoel', d: 'M9.4 26.8 q14.6 -5 29.2 0 q-14.6 4.2 -29.2 0 Z' },
    { stof: 'donker', d: 'M12.8 27 q11.2 -3 22.4 0 q-11.2 2.8 -22.4 0 Z' },
    { lijn: true, stof: 'steen', dik: 0.9, d: 'M16.4 30.6 l-0.6 8 M24.2 31.4 l0 8.4 M31.8 30.4 l0.6 8' },
    { stof: 'houtdonker', d: 'M20.8 20.4 q3.2 -1 6.4 0 l-0.8 5.2 q-2.4 0.8 -4.8 0 Z' },
    { stof: 'metaal', d: 'M20.6 20.2 q3.4 -1 6.8 0 q0 0.8 0 1.2 q-3.4 0.8 -6.8 0 Z' },
  ],

  // ----------------------------------------------------------------- globe
  globe: [
    { stof: 'hout', grond: true, d: 'M18.6 40.4 q5.4 -1.6 10.8 0 q1.4 2.4 1 4.8 q-6.4 1.4 -12.8 0 q-0.4 -2.4 1 -4.8 Z' },
    { stof: 'houtdonker', d: 'M22.4 29.4 q1.8 -0.6 3.6 0 l0.8 11.8 q-2.6 0.8 -5.2 0 Z' },
    { stof: 'water', d: 'M24 5.4 a 13.4 13.4 0 1 0 0.1 0 Z' },
    { stof: 'blad', d: 'M15 13.4 q4.4 -3.4 8.4 -1.2 q2.6 1.4 1 3.6 q-1.8 2.4 -5.4 2.2 q-3.6 -0.2 -4 -4.6 Z' },
    { stof: 'blad', d: 'M27 19.4 q4.6 -1.4 6.6 1.6 q1.6 2.4 -0.6 4.6 q-2.6 2.6 -5.2 1 q-2.8 -1.8 -0.8 -7.2 Z' },
    { stof: 'blad', d: 'M17.4 24.6 q3 -0.8 4.2 1.6 q1.2 2.4 -1 3.6 q-2.6 1.4 -4 -0.8 q-1.2 -2 0.8 -4.4 Z' },
    { lijn: true, stof: 'water', dik: 0.8, d: 'M11 18.6 q13 3.4 26 0 M11.6 24.4 q12.4 3.2 24.8 0' },
    { stof: 'koper', gat: true, d: 'M24 3.6 q14 0 14 15.4 q0 15.4 -14 15.4 q-14 0 -14 -15.4 q0 -15.4 14 -15.4 Z M24 6 q11.6 0 11.6 13 q0 13 -11.6 13 q-11.6 0 -11.6 -13 q0 -13 11.6 -13 Z' },
    { stof: 'koper', d: 'M20.4 32.4 q3.6 -1 7.2 0 q0.3 1.4 0 2.8 q-3.6 1 -7.2 0 Z' },
  ],
};
