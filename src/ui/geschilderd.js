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
  hout: { kern: '#9d6a38', koel: '#2b182a', warm: '#ffdca8', rand: 0.5 },
  houtdonker: { kern: '#6f4524', koel: '#1f1222', warm: '#eeb679', rand: 0.5 },
  houtrood: { kern: '#8d4a2c', koel: '#2a101f', warm: '#ffb37e', rand: 0.5 },
  steen: { kern: '#a39784', koel: '#33283a', warm: '#e8dcc0', rand: 0.3 },
  steenkoel: { kern: '#8c8678', koel: '#281f2e', warm: '#ddd2bc', rand: 0.28 },
  metaal: { kern: '#8e98a0', koel: '#1c2432', warm: '#f8fdff', rand: 1 },
  koper: { kern: '#b07440', koel: '#331a1c', warm: '#ffd9a0', rand: 0.9 },
  stof: { kern: '#a8543c', koel: '#2c1230', warm: '#ffb08c', rand: 0.3 },
  stofblauw: { kern: '#42618c', koel: '#141a34', warm: '#abd4ff', rand: 0.3 },
  stofgroen: { kern: '#4d7a5c', koel: '#13241f', warm: '#b2e8bd', rand: 0.3 },
  glas: { kern: '#b2cdc8', koel: '#1f3744', warm: '#ffffff', rand: 1 },
  spiegel: { kern: '#c3d6dd', koel: '#2a3f52', warm: '#ffffff', rand: 1 },
  vuur: { kern: '#e8912a', koel: '#7b1e0f', warm: '#fff6bb', rand: 0.9 },
  goud: { kern: '#c8992f', koel: '#3a2208', warm: '#fff2ac', rand: 0.95 },
  donker: { kern: '#3b4650', koel: '#0e111a', warm: '#92a3b8', rand: 0.45 },
  papier: { kern: '#e7dbbd', koel: '#463733', warm: '#fffdf2', rand: 0.4 },
  blad: { kern: '#4e7f3c', koel: '#11231c', warm: '#caf28c', rand: 0.5 },
  water: { kern: '#5e94a8', koel: '#13293c', warm: '#d6f6ff', rand: 0.8 },
  huid: { kern: '#e3b78b', koel: '#59313e', warm: '#fff1da', rand: 0.5 },
  huiddonker: { kern: '#a9703f', koel: '#3c1d26', warm: '#ebc193', rand: 0.5 },
  haar: { kern: '#5c3b22', koel: '#180e1e', warm: '#dcab6c', rand: 0.55 },
  haargrijs: { kern: '#9ea3a8', koel: '#262c3a', warm: '#ffffff' },
  touw: { kern: '#c0a068', koel: '#33261f', warm: '#ffe9bb', rand: 0.45 },
};

// ------------------------------------------------------------------ de defs
//
// Per materiaal één verloop voor het vlak, en twee maskers die voor alles
// gelden: eentje dat alleen de verlichte rand doorlaat en eentje dat alleen
// de schaduwrand doorlaat. De maskers rekenen per vorm, niet per tekening -
// zo krijgt elk onderdeel zijn eigen lichtkant, net als in een prent.

function zorgVoorDefs(svgWortel) {
  let defs = svgWortel.querySelector('defs.gs-defs');
  if (defs) return;
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

  svgWortel.insertBefore(defs, svgWortel.firstChild);
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
function zorgVoorKleur(svgWortel, hex) {
  const naam = `los-${hex.slice(1)}`;
  const defs = svgWortel.querySelector('defs.gs-defs');
  if (!defs || defs.querySelector(`#gs-${naam}`)) return naam;
  const { kern, koel, warm } = stofVanKleur(hex);
  const g = el('linearGradient', { id: `gs-${naam}`, x1: '0', y1: '0', x2: '0.72', y2: '1' });
  g.append(el('stop', { offset: '0%', 'stop-color': meng(kern, warm, 0.62) }));
  g.append(el('stop', { offset: '26%', 'stop-color': meng(kern, warm, 0.22) }));
  g.append(el('stop', { offset: '58%', 'stop-color': meng(kern, koel, 0.22) }));
  g.append(el('stop', { offset: '100%', 'stop-color': meng(kern, koel, 0.68) }));
  defs.append(g);
  return naam;
}

// Waar hangt de defs aan? Altijd aan de buitenste svg, anders staat hij in een
// groep die later weggegooid wordt.
function wortelVan(node) {
  let n = node;
  while (n && n.tagName !== 'svg') n = n.parentNode;
  return n ?? node;
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
      transform: 'translate(1.1 1.8)',
    }));
  }

  // 2. Het vlak, met het volle bereik van licht naar schaduw.
  g.append(el('path', { d, fill: `url(#gs-${verloop})`, 'fill-rule': vorm.gat ? 'evenodd' : null }));

  if (fijn) {
    // 3. De schaduwrand aan de donkere kant: waar een vorm wegdraait van het
    //    licht wordt hij donkerder, en het meest vlak langs de rand.
    g.append(el('path', {
      d, fill: 'none', stroke: koel, 'stroke-width': 3.4, opacity: 0.55,
      mask: 'url(#gs-diep)', 'clip-path': vorm.knip,
    }));

    // 4. Het randlicht. Een smalle heldere rand langs de lichtkant, binnen de
    //    vorm getekend zodat hij het silhouet niet verbreedt.
    g.append(el('path', {
      d, fill: 'none', stroke: meng(warm, '#ffffff', 0.35), 'stroke-width': 1.7,
      opacity: vorm.glans ?? stof.rand ?? 0.6, mask: 'url(#gs-rand)', 'clip-path': vorm.knip,
    }));
  }

  // 5. De omlijning. Niet zwart maar de schaduwkleur van het materiaal zelf
  //    nog een slag dieper - een zwarte lijn om alles heen maakt er weer een
  //    pictogram van.
  g.append(el('path', {
    d, fill: 'none', stroke: meng(koel, '#000000', 0.45),
    'stroke-width': eerste ? 1.5 : 0.85, 'stroke-linejoin': 'round', 'stroke-linecap': 'round',
    'fill-rule': vorm.gat ? 'evenodd' : null, opacity: 0.9,
  }));
}

// Een los lijntje: een touw, een snaar, een barst.
function zetLijn(g, vorm, stof) {
  g.append(el('path', {
    d: vorm.d, fill: 'none', stroke: meng(stof.kern, stof.koel, 0.35),
    'stroke-width': vorm.dik ?? 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
  }));
  g.append(el('path', {
    d: vorm.d, fill: 'none', stroke: meng(stof.warm, '#ffffff', 0.2),
    'stroke-width': (vorm.dik ?? 1.6) * 0.42, 'stroke-linecap': 'round',
    opacity: 0.75, transform: 'translate(-0.35 -0.45)',
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
  zorgVoorDefs(wortelVan(ouder));

  const g = el('g', {
    class: 'geschilderd',
    transform: `translate(${x} ${y}) scale(${grootte / 48})`,
  });

  const fijn = grootte >= 34;
  const wortel = wortelVan(ouder);
  let eerste = true;
  for (const vorm of delen) {
    const stof = vorm.kleur ? stofVanKleur(vorm.kleur) : (STOFFEN[vorm.stof] ?? STOFFEN.hout);
    if (vorm.lijn) {
      zetLijn(g, vorm, stof);
      continue;
    }
    const verloop = vorm.kleur ? zorgVoorKleur(wortel, vorm.kleur) : (STOFFEN[vorm.stof] ? vorm.stof : 'hout');
    zetVorm(g, vorm, stof, { fijn, eerste, verloop });
    eerste = false;
  }

  ouder.append(g);
  return g;
}
