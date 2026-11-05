// Bouwstenen voor silhouetten, zodat er nergens een haakse rechthoek staat.
//
// Zeventig meubelstukken met de hand uittypen in bezierkrommen levert zeventig
// keer een andere handschrift op: de ene kast loopt taps toe, de andere niet,
// de ene plank buigt door, de andere ligt kaarsrecht. Op één bord naast elkaar
// valt dat meteen uit elkaar.
//
// Daarom staat de kromming hier, één keer. Een romp loopt altijd naar boven
// iets taps toe en bolt altijd een haar aan de zijkanten; een plank zakt altijd
// een beetje door; een poot wordt altijd naar onder dunner. Welk meubelstuk je
// dan ook samenstelt, het hoort bij de rest.
//
// Alles wat hier uitkomt is een GESLOTEN pad - het eindigt op Z. Een open pad
// met een vulling tekent niets, en dat is op het bord te zien en in de code
// niet. tools/check-kamers.mjs faalt erop.
//
// Eén regel die je in de getallen terugziet: nooit een hele cirkel in één
// boog. Een boog die op zijn eigen beginpunt eindigt vertelt niet naar welke
// kant hij valt, dus staat er nergens een `a r r 0 1 0 0 0`. Twee halve bogen
// wel.

const n = (v) => Math.round(v * 10) / 10;

// --------------------------------------------------------------- de romp
//
// De kern van elk kastje, fornuis, kist en koffer. `taps` is hoeveel smaller
// de bovenkant is dan de onderkant, `bol` hoeveel de zijkanten naar buiten
// staan, `kroon` hoeveel de bovenrand opbolt en `voet` hoeveel de onderrand
// doorzakt. De standaardwaarden zijn met opzet klein: je moet het niet zien,
// je moet merken dat het er niet haaks uitziet.
export function romp(x, y, b, h, o = {}) {
  const { taps = 0.045, bol = 0.7, kroon = 0.6, voet = 0.5 } = o;
  const t = b * taps;
  const lb = x + t;
  const rb = x + b - t;
  const yo = y + h;
  return [
    `M${n(lb)} ${n(y)}`,
    `Q${n((lb + rb) / 2)} ${n(y - kroon)} ${n(rb)} ${n(y)}`,
    `Q${n(x + b + bol)} ${n(y + h * 0.5)} ${n(x + b)} ${n(yo)}`,
    `Q${n(x + b * 0.5)} ${n(yo + voet)} ${n(x)} ${n(yo)}`,
    `Q${n(x - bol)} ${n(y + h * 0.5)} ${n(lb)} ${n(y)}`,
    'Z',
  ].join(' ');
}

// Dezelfde romp maar omgekeerd taps: boven breder dan onder. Een stoelzitting,
// een kelk, een bak.
export const kelk = (x, y, b, h, o = {}) =>
  romp(x, y, b, h, { taps: -(o.taps ?? 0.12), bol: -(o.bol ?? 0.6), kroon: o.kroon ?? 0.5, voet: o.voet ?? 0.8 });

// --------------------------------------------------------------- de plaat
//
// Een plank, een schap, een tafelblad, een deksel. Hij zakt in het midden
// door en de onderkant zakt harder door dan de bovenkant, want dat is wat
// doorbuigen is.
export function plaat(x, y, b, h, o = {}) {
  const { zak = 0.7, punt = 0 } = o;
  const yo = y + h;
  return [
    `M${n(x)} ${n(y + punt)}`,
    `Q${n(x + b * 0.5)} ${n(y + zak * 0.55)} ${n(x + b)} ${n(y + punt)}`,
    `L${n(x + b)} ${n(yo)}`,
    `Q${n(x + b * 0.5)} ${n(yo + zak)} ${n(x)} ${n(yo)}`,
    'Z',
  ].join(' ');
}

// --------------------------------------------------------------- de poot
//
// Naar onder dunner, en met `schuin` een slag naar buiten of naar binnen. Een
// poot die kaarsrecht en overal even dik is, is een staafje.
export function poot(x, y, b, h, o = {}) {
  const { krimp = 0.3, schuin = 0, buik = 0.35 } = o;
  const bo = b * (1 - krimp);
  const xo = x + schuin + (b - bo) / 2;
  const yo = y + h;
  return [
    `M${n(x)} ${n(y)}`,
    `L${n(x + b)} ${n(y)}`,
    `Q${n(xo + bo + buik)} ${n(y + h * 0.55)} ${n(xo + bo)} ${n(yo)}`,
    `Q${n(xo + bo * 0.5)} ${n(yo + 0.4)} ${n(xo)} ${n(yo)}`,
    `Q${n(x - buik)} ${n(y + h * 0.55)} ${n(x)} ${n(y)}`,
    'Z',
  ].join(' ');
}

// --------------------------------------------------------------- rond werk

// Een cirkel uit twee halve bogen.
export const bol = (cx, cy, r) =>
  `M${n(cx - r)} ${n(cy)} a${n(r)} ${n(r)} 0 0 1 ${n(r * 2)} 0 a${n(r)} ${n(r)} 0 0 1 ${n(-r * 2)} 0 Z`;

export const ovaal = (cx, cy, rx, ry) =>
  `M${n(cx - rx)} ${n(cy)} a${n(rx)} ${n(ry)} 0 0 1 ${n(rx * 2)} 0 a${n(rx)} ${n(ry)} 0 0 1 ${n(-rx * 2)} 0 Z`;

// Een schijf met een gat erin: een ring, een beslagband, een wiel. Het gat
// loopt de andere kant rond, zodat `fill-rule: evenodd` hem eruit haalt.
// Gebruik hem met `gat: true`.
export const ring = (cx, cy, r, dik) => [
  bol(cx, cy, r),
  `M${n(cx - r + dik)} ${n(cy)} a${n(r - dik)} ${n(r - dik)} 0 0 0 ${n((r - dik) * 2)} 0`,
  `a${n(r - dik)} ${n(r - dik)} 0 0 0 ${n(-(r - dik) * 2)} 0 Z`,
].join(' ');

// --------------------------------------------------------------- vaatwerk
//
// Een bak, emmer, trog of pot: boven wijder dan onder, met een ronde bodem.
export function bak(cx, y, bBoven, bOnder, h, o = {}) {
  const { rand = 0.8 } = o;
  const yo = y + h;
  return [
    `M${n(cx - bBoven / 2)} ${n(y)}`,
    `Q${n(cx)} ${n(y + rand)} ${n(cx + bBoven / 2)} ${n(y)}`,
    `Q${n(cx + bOnder / 2 + 0.6)} ${n(y + h * 0.6)} ${n(cx + bOnder / 2)} ${n(yo)}`,
    `Q${n(cx)} ${n(yo + h * 0.14)} ${n(cx - bOnder / 2)} ${n(yo)}`,
    `Q${n(cx - bOnder / 2 - 0.6)} ${n(y + h * 0.6)} ${n(cx - bBoven / 2)} ${n(y)}`,
    'Z',
  ].join(' ');
}

// Een ton of vat: bol in het midden, smaller aan de uiteinden.
export function ton(cx, y, bMidden, bEind, h) {
  const yo = y + h;
  const ym = y + h * 0.5;
  return [
    `M${n(cx - bEind / 2)} ${n(y)}`,
    `Q${n(cx)} ${n(y + 1.4)} ${n(cx + bEind / 2)} ${n(y)}`,
    `Q${n(cx + bMidden / 2)} ${n(ym)} ${n(cx + bEind / 2)} ${n(yo)}`,
    `Q${n(cx)} ${n(yo + 1.6)} ${n(cx - bEind / 2)} ${n(yo)}`,
    `Q${n(cx - bMidden / 2)} ${n(ym)} ${n(cx - bEind / 2)} ${n(y)}`,
    'Z',
  ].join(' ');
}

// Een fles, kruik of kolf: een buik met een hals erop.
export function kruik(cx, yHals, hHals, bHals, yBuik, bBuik, hBuik) {
  const yo = yBuik + hBuik;
  return [
    `M${n(cx - bHals / 2)} ${n(yHals)}`,
    `Q${n(cx)} ${n(yHals + 0.6)} ${n(cx + bHals / 2)} ${n(yHals)}`,
    `L${n(cx + bHals / 2)} ${n(yHals + hHals)}`,
    `Q${n(cx + bBuik / 2)} ${n(yBuik + hBuik * 0.25)} ${n(cx + bBuik / 2)} ${n(yBuik + hBuik * 0.62)}`,
    `Q${n(cx + bBuik / 2)} ${n(yo)} ${n(cx)} ${n(yo)}`,
    `Q${n(cx - bBuik / 2)} ${n(yo)} ${n(cx - bBuik / 2)} ${n(yBuik + hBuik * 0.62)}`,
    `Q${n(cx - bBuik / 2)} ${n(yBuik + hBuik * 0.25)} ${n(cx - bHals / 2)} ${n(yHals + hHals)}`,
    'Z',
  ].join(' ');
}

// --------------------------------------------------------------- vlees erop

// Een kussen: bol aan alle vier de kanten, hoeken naar binnen.
export function kussen(x, y, b, h, o = {}) {
  const { bol: bl = 1.6 } = o;
  const yo = y + h;
  return [
    `M${n(x + 1.5)} ${n(y + 1.2)}`,
    `Q${n(x + b * 0.5)} ${n(y - bl)} ${n(x + b - 1.5)} ${n(y + 1.2)}`,
    `Q${n(x + b + bl)} ${n(y + h * 0.5)} ${n(x + b - 1.5)} ${n(yo - 1.2)}`,
    `Q${n(x + b * 0.5)} ${n(yo + bl)} ${n(x + 1.5)} ${n(yo - 1.2)}`,
    `Q${n(x - bl)} ${n(y + h * 0.5)} ${n(x + 1.5)} ${n(y + 1.2)}`,
    'Z',
  ].join(' ');
}

// Een staaf tussen twee punten, dunner aan het eind. Een spijl, een stok, een
// tak, een poot die scheef staat.
export function staaf(x1, y1, x2, y2, dik, o = {}) {
  const { krimp = 0.4 } = o;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = (-dy / len) * (dik / 2);
  const py = (dx / len) * (dik / 2);
  const q = 1 - krimp;
  const mx = (x1 + x2) / 2 + px * 1.3;
  const my = (y1 + y2) / 2 + py * 1.3;
  return [
    `M${n(x1 + px)} ${n(y1 + py)}`,
    `Q${n(mx)} ${n(my)} ${n(x2 + px * q)} ${n(y2 + py * q)}`,
    `L${n(x2 - px * q)} ${n(y2 - py * q)}`,
    `Q${n((x1 + x2) / 2 - px * 1.3)} ${n((y1 + y2) / 2 - py * 1.3)} ${n(x1 - px)} ${n(y1 - py)}`,
    'Z',
  ].join(' ');
}

// Een vlam. Smal onder, uitlopend, met een punt die een kant op valt.
export function vlam(cx, yOnder, b, h, o = {}) {
  const { wind = 1.2 } = o;
  const top = yOnder - h;
  return [
    `M${n(cx)} ${n(yOnder)}`,
    `Q${n(cx - b * 0.62)} ${n(yOnder - h * 0.22)} ${n(cx - b * 0.42)} ${n(yOnder - h * 0.52)}`,
    `Q${n(cx - b * 0.3)} ${n(yOnder - h * 0.72)} ${n(cx - b * 0.1)} ${n(yOnder - h * 0.6)}`,
    `Q${n(cx - b * 0.18)} ${n(yOnder - h * 0.84)} ${n(cx + wind)} ${n(top)}`,
    `Q${n(cx + b * 0.34)} ${n(yOnder - h * 0.6)} ${n(cx + b * 0.46)} ${n(yOnder - h * 0.42)}`,
    `Q${n(cx + b * 0.58)} ${n(yOnder - h * 0.16)} ${n(cx)} ${n(yOnder)}`,
    'Z',
  ].join(' ');
}

// Een blad, aan een steel die een kant op wijst.
export function blad(cx, cy, lang, breed, hoek) {
  const r = (hoek * Math.PI) / 180;
  const tx = cx + Math.cos(r) * lang;
  const ty = cy + Math.sin(r) * lang;
  const nx = -Math.sin(r) * breed;
  const ny = Math.cos(r) * breed;
  return [
    `M${n(cx)} ${n(cy)}`,
    `Q${n(cx + (tx - cx) * 0.45 + nx)} ${n(cy + (ty - cy) * 0.45 + ny)} ${n(tx)} ${n(ty)}`,
    `Q${n(cx + (tx - cx) * 0.45 - nx)} ${n(cy + (ty - cy) * 0.45 - ny)} ${n(cx)} ${n(cy)}`,
    'Z',
  ].join(' ');
}

// Een lap stof, een gordijn, een laken: recht bovenaan, golvend onderaan.
export function doek(x, y, b, h, o = {}) {
  const { golf = 2 } = o;
  const yo = y + h;
  return [
    `M${n(x)} ${n(y)}`,
    `Q${n(x + b * 0.5)} ${n(y - 0.5)} ${n(x + b)} ${n(y)}`,
    `L${n(x + b)} ${n(yo - golf)}`,
    `Q${n(x + b * 0.74)} ${n(yo + golf)} ${n(x + b * 0.5)} ${n(yo - golf * 0.4)}`,
    `Q${n(x + b * 0.26)} ${n(yo + golf)} ${n(x)} ${n(yo - golf)}`,
    'Z',
  ].join(' ');
}

// Een liggende rol: een opgerolde kaart, een bundel, een pijp. `rond` is hoe
// bol de kopse kant eruit komt.
export function rol(x, y, b, h, o = {}) {
  const { rond = 1.6 } = o;
  const cy = y + h / 2;
  return [
    `M${n(x)} ${n(y)}`,
    `L${n(x + b)} ${n(y)}`,
    `Q${n(x + b + rond)} ${n(cy)} ${n(x + b)} ${n(y + h)}`,
    `L${n(x)} ${n(y + h)}`,
    `Q${n(x - rond)} ${n(cy)} ${n(x)} ${n(y)}`,
    'Z',
  ].join(' ');
}

// Een staande rol: een zuil, een kaars, een buis, een boomstam.
export function zuilvorm(cx, y, bBoven, bOnder, h, o = {}) {
  const { bol: bl = 0.5 } = o;
  const yo = y + h;
  return [
    `M${n(cx - bBoven / 2)} ${n(y)}`,
    `Q${n(cx)} ${n(y + 0.9)} ${n(cx + bBoven / 2)} ${n(y)}`,
    `Q${n(cx + Math.max(bBoven, bOnder) / 2 + bl)} ${n(y + h * 0.5)} ${n(cx + bOnder / 2)} ${n(yo)}`,
    `Q${n(cx)} ${n(yo + 1)} ${n(cx - bOnder / 2)} ${n(yo)}`,
    `Q${n(cx - Math.max(bBoven, bOnder) / 2 - bl)} ${n(y + h * 0.5)} ${n(cx - bBoven / 2)} ${n(y)}`,
    'Z',
  ].join(' ');
}

// Een driehoekig dak, kap of punt, met gebogen schuine kanten.
export function kap(cx, yTop, b, h, o = {}) {
  const { buik = 1.2 } = o;
  const yo = yTop + h;
  return [
    `M${n(cx)} ${n(yTop)}`,
    `Q${n(cx + b * 0.3 + buik)} ${n(yTop + h * 0.5)} ${n(cx + b / 2)} ${n(yo)}`,
    `Q${n(cx)} ${n(yo + 0.9)} ${n(cx - b / 2)} ${n(yo)}`,
    `Q${n(cx - b * 0.3 - buik)} ${n(yTop + h * 0.5)} ${n(cx)} ${n(yTop)}`,
    'Z',
  ].join(' ');
}

// Een hoop: aarde, kolen, mos, sneeuw. Breed en laag, met een ongelijke bult.
export function hoop(cx, yo, b, h, o = {}) {
  const { top = 0 } = o;
  return [
    `M${n(cx - b / 2)} ${n(yo)}`,
    `Q${n(cx - b * 0.34)} ${n(yo - h * 0.95)} ${n(cx - b * 0.1 + top)} ${n(yo - h)}`,
    `Q${n(cx + b * 0.2 + top)} ${n(yo - h * 1.05)} ${n(cx + b * 0.3)} ${n(yo - h * 0.6)}`,
    `Q${n(cx + b * 0.42)} ${n(yo - h * 0.3)} ${n(cx + b / 2)} ${n(yo)}`,
    `Q${n(cx)} ${n(yo + 1.1)} ${n(cx - b / 2)} ${n(yo)}`,
    'Z',
  ].join(' ');
}

export { n as rond1 };
