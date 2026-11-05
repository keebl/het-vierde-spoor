// Een tweede tekenmotor, vanaf nul: geschilderd in plaats van ingekleurd.
//
// De motor in meubelkunst.js tekent per onderdeel één vlak met één kleur, een
// donker lijntje eromheen en een flauw verloop erover. Dat levert een
// pictogram op, hoe veel onderdelen je er ook in stopt. Meer onderdelen
// toevoegen hielp niet, en daar is drie keer om gevraagd.
//
// Wat een getekende prent onderscheidt van een pictogram zijn vier dingen, en
// geen daarvan is "meer lijntjes":
//
//   1. BEREIK. In een prent loopt één vlak van bijna zwart naar bijna wit.
//      De oude motor ging van 1.16 naar 0.82 keer de kleur - een verschil dat
//      je nauwelijks ziet. Hier loopt elk vlak over zijn eigen breedte van de
//      lichtkleur naar de schaduwkleur van zijn materiaal.
//
//   2. KLEUR IN DE SCHADUW. Schaduw is niet dezelfde kleur maar donkerder.
//      Schaduw trekt naar violet en blauw, licht trekt naar warm geel. Elk
//      materiaal heeft daarom drie kleuren: kern, koel en warm.
//
//   3. RANDLICHT. Langs de verlichte kant van een vorm ligt een smalle
//      heldere rand. Dat is wat een vorm van de achtergrond lostrekt, en het
//      ontbrak volledig.
//
//   4. CONTACT. Waar een ding de grond raakt is het donker. Zonder dat
//      zweeft alles, ook als het keurig op de goede hoogte staat.
//
// Het licht komt uit linksboven, overal, altijd. Dat is geen stijlkeuze maar
// de voorwaarde: zodra twee dingen op hetzelfde bord een ander licht hebben,
// valt het uit elkaar.

const NS = 'http://www.w3.org/2000/svg';

const el = (naam, attrs = {}) => {
  const n = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  return n;
};

// ------------------------------------------------------------- kleurrekenen

const lees = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const schrijf = ([r, g, b]) =>
  `#${((Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).padStart(6, '0')}`;

// Twee kleuren mengen. deel 0 is helemaal a, deel 1 helemaal b.
export function meng(a, b, deel) {
  const [ar, ag, ab] = lees(a);
  const [br, bg, bb] = lees(b);
  return schrijf([ar + (br - ar) * deel, ag + (bg - ag) * deel, ab + (bb - ab) * deel]);
}

// ----------------------------------------------------------------- materiaal
//
// kern is de kleur die het ding heeft, koel is waar het licht niet komt, warm
// is waar het vol op staat. koel en warm zijn met opzet niet dezelfde kleur
// donkerder en lichter: steen in de schaduw trekt blauw, hout trekt violet,
// metaal trekt staalblauw. Dat is het verschil tussen geschilderd en
// ingekleurd.
export const STOFFEN = {
  hout: { kern: '#9d6a38', koel: '#2b182a', warm: '#ffdca8', rand: 0.5, textuur: 'nerf' },
  houtdonker: { kern: '#6f4524', koel: '#1f1222', warm: '#eeb679', rand: 0.5, textuur: 'nerf' },
  houtrood: { kern: '#8d4a2c', koel: '#2a101f', warm: '#ffb37e', rand: 0.5, textuur: 'nerf' },
  steen: { kern: '#a39784', koel: '#33283a', warm: '#e8dcc0', rand: 0.3, textuur: 'korrel' },
  steenkoel: { kern: '#8c8678', koel: '#281f2e', warm: '#ddd2bc', rand: 0.28, textuur: 'korrel' },
  metaal: { kern: '#8e98a0', koel: '#1c2432', warm: '#f8fdff', rand: 1, textuur: 'strijk' },
  koper: { kern: '#b07440', koel: '#331a1c', warm: '#ffd9a0', rand: 0.9, textuur: 'strijk' },
  stof: { kern: '#a8543c', koel: '#2c1230', warm: '#ffb08c', rand: 0.3, textuur: 'weefsel' },
  stofblauw: { kern: '#42618c', koel: '#141a34', warm: '#abd4ff', rand: 0.3, textuur: 'weefsel' },
  stofgroen: { kern: '#4d7a5c', koel: '#13241f', warm: '#b2e8bd', rand: 0.3, textuur: 'weefsel' },
  glas: { kern: '#b2cdc8', koel: '#1f3744', warm: '#ffffff', rand: 1 },
  spiegel: { kern: '#c3d6dd', koel: '#2a3f52', warm: '#ffffff', rand: 1 },
  vuur: { kern: '#e8912a', koel: '#7b1e0f', warm: '#fff6bb', rand: 0.9 },
  goud: { kern: '#c8992f', koel: '#3a2208', warm: '#fff2ac', rand: 0.95 },
  donker: { kern: '#3b4650', koel: '#0e111a', warm: '#92a3b8', rand: 0.45, textuur: 'strijk' },
  papier: { kern: '#e7dbbd', koel: '#463733', warm: '#fffdf2', rand: 0.4, textuur: 'korrel' },
  blad: { kern: '#4e7f3c', koel: '#11231c', warm: '#caf28c', rand: 0.5, textuur: 'vezel' },
  water: { kern: '#5e94a8', koel: '#13293c', warm: '#d6f6ff', rand: 0.8 },
  huid: { kern: '#e3b78b', koel: '#59313e', warm: '#fff1da', rand: 0.5 },
  huiddonker: { kern: '#a9703f', koel: '#3c1d26', warm: '#ebc193', rand: 0.5 },
  haar: { kern: '#5c3b22', koel: '#180e1e', warm: '#dcab6c', rand: 0.55 },
  haargrijs: { kern: '#9ea3a8', koel: '#262c3a', warm: '#ffffff' },
  touw: { kern: '#c0a068', koel: '#33261f', warm: '#ffe9bb', rand: 0.45, textuur: 'weefsel' },
};

// ------------------------------------------------------------------ de defs
//
// Per materiaal één verloop voor het vlak, en twee maskers die voor alles
// gelden: eentje dat alleen de verlichte rand doorlaat en eentje dat alleen
// de schaduwrand doorlaat. De maskers rekenen per vorm, niet per tekening -
// zo krijgt elk onderdeel zijn eigen lichtkant, net als in een prent.

// Eén palet voor de hele pagina, niet een palet per tekening.
//
// Een bord van twaalf bij twaalf heeft zo'n negentig tekeningen plus de
// legenda, en elke tekening in zijn eigen svg zetten betekende zestig keer
// dezelfde drieentwintig verlopen, vijf patronen en twee maskers: duizenden
// knooppunten die geen pixel opleveren. In een HTML-pagina zoekt url(#...)
// door het hele document, dus één verzameling in een verborgen svg is genoeg.
function paletDefs() {
  let defs = document.querySelector('defs.gs-defs');
  if (defs) return defs;
  const houder = el('svg', { class: 'gs-palet', 'aria-hidden': 'true', focusable: 'false' });
  houder.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  defs = el('defs', { class: 'gs-defs' });

  const randOp = el('linearGradient', { id: 'gs-randverloop', x1: '0', y1: '0', x2: '0.75', y2: '1' });
  randOp.append(el('stop', { offset: '0%', 'stop-color': '#ffffff' }));
  randOp.append(el('stop', { offset: '34%', 'stop-color': '#8a8a8a' }));
  randOp.append(el('stop', { offset: '62%', 'stop-color': '#000000' }));
  defs.append(randOp);

  const randMasker = el('mask', { id: 'gs-rand', maskContentUnits: 'objectBoundingBox' });
  randMasker.append(el('rect', { x: '-0.2', y: '-0.2', width: '1.4', height: '1.4', fill: 'url(#gs-randverloop)' }));
  defs.append(randMasker);

  const diepOp = el('linearGradient', { id: 'gs-diepverloop', x1: '0', y1: '0', x2: '0.75', y2: '1' });
  diepOp.append(el('stop', { offset: '0%', 'stop-color': '#000000' }));
  diepOp.append(el('stop', { offset: '48%', 'stop-color': '#5a5a5a' }));
  diepOp.append(el('stop', { offset: '100%', 'stop-color': '#ffffff' }));
  defs.append(diepOp);

  const diepMasker = el('mask', { id: 'gs-diep', maskContentUnits: 'objectBoundingBox' });
  diepMasker.append(el('rect', { x: '-0.2', y: '-0.2', width: '1.4', height: '1.4', fill: 'url(#gs-diepverloop)' }));
  defs.append(diepMasker);

  // De contactschaduw moet vaag zijn, anders is het een tweede silhouet.
  const vaag = el('filter', { id: 'gs-vaag', x: '-50%', y: '-50%', width: '200%', height: '200%' });
  vaag.append(el('feGaussianBlur', { stdDeviation: '1.4' }));
  defs.append(vaag);

  // ------------------------------------------------------------ textuur
  //
  // Licht alleen maakt een vorm rond; textuur maakt hem van iets. Hout heeft
  // nerf, steen heeft korrel, stof is geweven en metaal heeft strepen van de
  // polijstschijf. Het is bijna niet te zien, en juist daarom werkt het: zet
  // je het uit, dan oogt alles ineens van plastic.
  const patroon = (id, breed, hoog, kinderen) => {
    const pat = el('pattern', { id, width: breed, height: hoog, patternUnits: 'userSpaceOnUse' });
    for (const k of kinderen) pat.append(k);
    defs.append(pat);
  };
  patroon('gs-nerf', 9, 5, [
    el('path', { d: 'M0 1.6 q2.2 -1.1 4.4 0 q2.2 1.1 4.6 0', stroke: '#2a1708', 'stroke-width': 0.55, fill: 'none', opacity: 0.3 }),
    el('path', { d: 'M0 3.8 q2.6 1 5 0 q2 -0.8 4 0', stroke: '#2a1708', 'stroke-width': 0.4, fill: 'none', opacity: 0.2 }),
    el('path', { d: 'M0 2.7 q2.4 -0.8 4.8 0 q2 0.7 4.2 0', stroke: '#ffe6bc', 'stroke-width': 0.4, fill: 'none', opacity: 0.22 }),
  ]);
  patroon('gs-korrel', 6, 6, [
    el('circle', { cx: 1.3, cy: 1.8, r: 0.52, fill: '#241a26', opacity: 0.3 }),
    el('circle', { cx: 4.2, cy: 0.9, r: 0.36, fill: '#241a26', opacity: 0.22 }),
    el('circle', { cx: 2.7, cy: 4.4, r: 0.62, fill: '#241a26', opacity: 0.26 }),
    el('circle', { cx: 5.2, cy: 3.9, r: 0.42, fill: '#fff4de', opacity: 0.26 }),
    el('circle', { cx: 0.7, cy: 5.1, r: 0.34, fill: '#fff4de', opacity: 0.2 }),
  ]);
  patroon('gs-weefsel', 3, 3, [
    el('path', { d: 'M0 1.5 h3', stroke: '#ffffff', 'stroke-width': 0.5, opacity: 0.12 }),
    el('path', { d: 'M1.5 0 v3', stroke: '#1a0e18', 'stroke-width': 0.5, opacity: 0.16 }),
  ]);
  patroon('gs-strijk', 11, 11, [
    el('path', { d: 'M-2 11 L11 -2', stroke: '#ffffff', 'stroke-width': 0.8, opacity: 0.14 }),
    el('path', { d: 'M3 11 L14 0', stroke: '#101822', 'stroke-width': 0.6, opacity: 0.13 }),
  ]);
  patroon('gs-vezel', 5, 5, [
    el('path', { d: 'M0.8 5 q1 -2.6 0.4 -5', stroke: '#1d3416', 'stroke-width': 0.45, fill: 'none', opacity: 0.3 }),
    el('path', { d: 'M3.4 5 q-0.8 -2.4 0.2 -5', stroke: '#d8f0a0', 'stroke-width': 0.4, fill: 'none', opacity: 0.22 }),
  ]);

  for (const [naam, { kern, koel, warm }] of Object.entries(STOFFEN)) {
    // Het vlak zelf: van bijna de lichtkleur linksboven naar diep in de
    // schaduwkleur rechtsonder. Dit is het bereik dat ontbrak.
    const g = el('linearGradient', { id: `gs-${naam}`, x1: '0', y1: '0', x2: '0.72', y2: '1' });
    g.append(el('stop', { offset: '0%', 'stop-color': meng(kern, warm, 0.62) }));
    g.append(el('stop', { offset: '26%', 'stop-color': meng(kern, warm, 0.22) }));
    g.append(el('stop', { offset: '58%', 'stop-color': meng(kern, koel, 0.22) }));
    g.append(el('stop', { offset: '100%', 'stop-color': meng(kern, koel, 0.68) }));
    defs.append(g);
  }

  houder.append(defs);
  document.body.append(houder);
  return defs;
}

// Een materiaal uit een losse kleur.
//
// Kleding, haar en huid verschillen per figuur, dus die passen niet in de
// vaste tabel. De schaduw trekt naar violet en de lichtkant naar warm geel -
// dezelfde regel als bij de materialen hierboven, alleen uitgerekend.
export function stofVanKleur(hex) {
  return {
    kern: hex,
    koel: meng(hex, '#1a1030', 0.74),
    warm: meng(hex, '#fff0c8', 0.6),
    rand: 0.45,
  };
}

// Zorg dat er een verloop bestaat voor een losse kleur, en geef zijn naam.
function zorgVoorKleur(hex) {
  const naam = `los-${hex.slice(1)}`;
  const defs = paletDefs();
  if (defs.querySelector(`#gs-${naam}`)) return naam;
  const { kern, koel, warm } = stofVanKleur(hex);
  const g = el('linearGradient', { id: `gs-${naam}`, x1: '0', y1: '0', x2: '0.72', y2: '1' });
  g.append(el('stop', { offset: '0%', 'stop-color': meng(kern, warm, 0.62) }));
  g.append(el('stop', { offset: '26%', 'stop-color': meng(kern, warm, 0.22) }));
  g.append(el('stop', { offset: '58%', 'stop-color': meng(kern, koel, 0.22) }));
  g.append(el('stop', { offset: '100%', 'stop-color': meng(kern, koel, 0.68) }));
  defs.append(g);
  return naam;
}

// ------------------------------------------------------------- een vorm zetten
//
// Vijf lagen, en elke laag doet precies één ding. Dat is de hele motor.

function zetVorm(g, vorm, stof, { fijn, eerste, verloop }) {
  const { koel, warm } = stof;
  // Randlicht hoort bij het materiaal: staal glimt, steen en stof niet.
  const d = vorm.d;

  // 1. Contact. Alleen voor het lijf van het ding, en alleen als het de
  //    grond raakt: tien schaduwen onder elkaar is modder.
  if (vorm.grond) {
    g.append(el('path', {
      d, fill: koel, opacity: 0.5, filter: 'url(#gs-vaag)',
      transform: 'translate(1.1 1.8)', class: 'gs-contact',
    }));
  }

  // 2. Het vlak, met het volle bereik van licht naar schaduw.
  g.append(el('path', { d, fill: `url(#gs-${verloop})`, 'fill-rule': vorm.gat ? 'evenodd' : null, class: 'gs-vlak' }));

  if (fijn) {
    // 3. De schaduwrand aan de donkere kant: waar een vorm wegdraait van het
    //    licht wordt hij donkerder, en het meest vlak langs de rand.
    g.append(el('path', {
      d, fill: 'none', stroke: koel, 'stroke-width': 3.4, opacity: 0.55,
      mask: 'url(#gs-diep)', 'clip-path': vorm.knip, class: 'gs-diepte',
    }));

    // 4. Het randlicht. Een smalle heldere rand langs de lichtkant, binnen de
    //    vorm getekend zodat hij het silhouet niet verbreedt.
    g.append(el('path', {
      d, fill: 'none', stroke: meng(warm, '#ffffff', 0.35), 'stroke-width': 1.7,
      opacity: vorm.glans ?? stof.rand ?? 0.6, mask: 'url(#gs-rand)', 'clip-path': vorm.knip,
      class: 'gs-glans',
    }));
  }

  // 4b. Wat het materiaal eigen is: nerf, korrel, weefsel. Hetzelfde pad nog
  //     een keer, gevuld met het patroon.
  if (fijn && stof.textuur) {
    g.append(el('path', {
      d, fill: `url(#gs-${stof.textuur})`, 'fill-rule': vorm.gat ? 'evenodd' : null,
      'pointer-events': 'none', class: 'gs-textuur',
    }));
  }

  // 5. De omlijning. Niet zwart maar de schaduwkleur van het materiaal zelf
  //    nog een slag dieper - een zwarte lijn om alles heen maakt er weer een
  //    pictogram van.
  g.append(el('path', {
    d, fill: 'none', stroke: meng(koel, '#000000', 0.45),
    'stroke-width': eerste ? 1.5 : 0.85, 'stroke-linejoin': 'round', 'stroke-linecap': 'round',
    'fill-rule': vorm.gat ? 'evenodd' : null, opacity: 0.9, class: 'gs-omtrek',
  }));
}

// Een los lijntje: een touw, een snaar, een barst.
function zetLijn(g, vorm, stof) {
  g.append(el('path', {
    d: vorm.d, fill: 'none', stroke: meng(stof.kern, stof.koel, 0.35),
    'stroke-width': vorm.dik ?? 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    class: 'gs-draad',
  }));
  g.append(el('path', {
    d: vorm.d, fill: 'none', stroke: meng(stof.warm, '#ffffff', 0.2),
    'stroke-width': (vorm.dik ?? 1.6) * 0.42, 'stroke-linecap': 'round',
    opacity: 0.75, transform: 'translate(-0.35 -0.45)', class: 'gs-draadglans',
  }));
}

// ------------------------------------------------------------------- tekenen

// Zet een tekening neer in een vierkant van `grootte` bij `grootte`.
//
// `fijn` zet het randlicht en de schaduwrand aan. Op een bord van twaalf bij
// twaalf is een vakje nog geen veertig pixels breed; daar is een rand van
// anderhalve eenheid een halve pixel en kost hij alleen maar rekentijd. Dan
// blijft het bereik van het verloop over, en dat is het meeste.
export function tekenGeschilderd(ouder, delen, { x = 0, y = 0, grootte = 48 } = {}) {
  if (!delen || !delen.length) return null;
  paletDefs();

  const g = el('g', {
    class: 'geschilderd',
    transform: `translate(${x} ${y}) scale(${grootte / 48})`,
  });

  const fijn = grootte >= 34;
  let eerste = true;
  for (const vorm of delen) {
    const stof = vorm.kleur ? stofVanKleur(vorm.kleur) : (STOFFEN[vorm.stof] ?? STOFFEN.hout);
    if (vorm.lijn) {
      zetLijn(g, vorm, stof);
      continue;
    }
    const verloop = vorm.kleur ? zorgVoorKleur(vorm.kleur) : (STOFFEN[vorm.stof] ? vorm.stof : 'hout');
    zetVorm(g, vorm, stof, { fijn, eerste, verloop });
    eerste = false;
  }

  ouder.append(g);
  return g;
}
