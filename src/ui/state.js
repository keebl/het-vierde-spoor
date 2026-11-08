// Voortgang per puzzel in de browser. Bewust klein: alleen wat de speler
// heeft aangekruist en welke aanwijzingen hij heeft weggestreept.
// Dit mag stilletjes mislukken (privemodus, geblokkeerde opslag).

const KEY = 'vierdespoor.v1';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function writeAll(all) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* opslag niet beschikbaar: dan speelt het gewoon zonder onthouden */
  }
}

export function loadProgress(id) {
  return readAll()[id] ?? null;
}

export function saveProgress(id, data) {
  const all = readAll();
  all[id] = data;
  // Niet onbeperkt laten groeien.
  const ids = Object.keys(all);
  if (ids.length > 120) delete all[ids[0]];
  writeAll(all);
}

export function clearProgress(id) {
  const all = readAll();
  delete all[id];
  writeAll(all);
}

export function solvedIds() {
  const all = readAll();
  return new Set(Object.keys(all).filter((k) => all[k]?.solved && !all[k]?.onthuld));
}

// Puzzels waarvan je de oplossing hebt opgevraagd. Die tellen niet als
// opgelost, maar je wilt wel zien dat je er geweest bent.
export function onthuldIds() {
  const all = readAll();
  return new Set(Object.keys(all).filter((k) => all[k]?.onthuld));
}

// ----------------------------------------------------------- voorkeuren
// Kleine keuzes die over alle puzzels heen gelden, niet per puzzel. Nu
// alleen de sierlijst om het bord; hij staat apart van de voortgang omdat
// hij niet mag verdwijnen als de voortgangslijst wordt opgeschoond.
const VOORKEUR = 'vierdespoor.voorkeuren';

function leesVoorkeuren() {
  try {
    return JSON.parse(localStorage.getItem(VOORKEUR) || '{}');
  } catch {
    return {};
  }
}

// De lijst om het bord staat standaard aan op een breed scherm en uit op een
// smal. Bij vijf bij vijf is de lijst ruim een derde van de breedte, en op
// een telefoon gaat dat ten koste van de vakjes waar je in moet klikken.
// Wie hem toch wil, zet hem aan; die keuze blijft dan staan.
function randStandaard() {
  try {
    return !window.matchMedia('(max-width: 760px)').matches;
  } catch {
    return true;
  }
}

export function randAan() {
  const v = leesVoorkeuren().rand;
  return typeof v === 'boolean' ? v : randStandaard();
}

export function zetRand(aan) {
  const v = leesVoorkeuren();
  v.rand = !!aan;
  try {
    localStorage.setItem(VOORKEUR, JSON.stringify(v));
  } catch {
    /* geen opslag: dan geldt de keuze alleen deze sessie */
  }
}

// Het laatst gekozen niveau. Je kiest op de voorpagina niet meer wát voor
// decor je krijgt, alleen hoe zwaar - en dan hoort de site te onthouden
// waar je gebleven was.
export function laatsteNiveau(standaard = 3) {
  const v = leesVoorkeuren().niveau;
  return Number.isInteger(v) ? v : standaard;
}

export function zetNiveau(n) {
  const v = leesVoorkeuren();
  v.niveau = Number(n);
  try {
    localStorage.setItem(VOORKEUR, JSON.stringify(v));
  } catch {
    /* geen opslag: dan geldt de keuze alleen deze sessie */
  }
}

// Welke panelen open staan. De legenda en de aanwijzingen zitten achter een
// klepje; wat iemand opengeklapt laat, hoort open te blijven als hij de
// volgende puzzel opent.
export function paneelOpen(naam, standaard) {
  const v = leesVoorkeuren().panelen?.[naam];
  return typeof v === 'boolean' ? v : standaard;
}

export function zetPaneel(naam, open) {
  const v = leesVoorkeuren();
  v.panelen = { ...(v.panelen ?? {}), [naam]: !!open };
  try {
    localStorage.setItem(VOORKEUR, JSON.stringify(v));
  } catch {
    /* geen opslag: dan geldt de keuze alleen deze sessie */
  }
}

// Zet het bord de kruisjes zelf? Zodra iemand neergezet is, kan er in die
// rij en kolom niemand meer bij, en dat kruiste het bord vanzelf af. Dat is
// handig als je snel wilt, en hinderlijk als je het zelf wilt doorzien.
export function kruisjesVanzelf() {
  const v = leesVoorkeuren().kruisjes;
  return typeof v === 'boolean' ? v : true;
}

export function zetKruisjesVanzelf(aan) {
  const v = leesVoorkeuren();
  v.kruisjes = !!aan;
  try {
    localStorage.setItem(VOORKEUR, JSON.stringify(v));
  } catch {
    /* geen opslag: dan geldt de keuze alleen deze sessie */
  }
}

// Alle puzzels waar in deze browser iets van bewaard is: aangeraakt,
// opgelost, of de oplossing van opgevraagd. De bibliotheek gebruikt dit om
// naast de vaste zaken ook te laten zien wat iemand zelf is begonnen -
// anders is een zelfgemaakte puzzel na één keer sluiten onvindbaar, en dat
// was hij.
export function bewaardePuzzels() {
  const all = readAll();
  return Object.entries(all).map(([id, d]) => ({
    id,
    titel: d?.titel ?? '',
    solved: !!d?.solved && !d?.onthuld,
    onthuld: !!d?.onthuld,
    // Of er al iets op het bord staat. Puzzels die je alleen hebt geopend
    // en meteen weer weggeklikt, zijn geen zaak om naar terug te keren.
    bezig: Object.keys(d?.plaats ?? {}).length > 0
      || Object.keys(d?.marks ?? {}).length > 0
      || (d?.struck ?? []).length > 0,
  }));
}
