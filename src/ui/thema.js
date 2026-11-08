// Licht of donker, en wie dat bepaalt.
//
// De site kleurde zich altijd naar de wereld van de zaak die openstond, en
// die werelden zijn allemaal nacht. Mooi, maar niet iedereen leest graag
// lichte letters op zwart - en wie dat niet fijn vindt had geen uitweg.
//
// Daarom staat de keuze nu bovenaan. Drie standen:
//
//   vanzelf  volg wat het apparaat zelf zegt (prefers-color-scheme)
//   licht    altijd licht, ook in een zaak
//   donker   altijd donker, ook op de voorpagina
//
// De keuze blijft in deze browser bewaard. Hij staat als data-thema op de
// body; de opmaak doet de rest. De wereldkleur gaat als --wkleur mee, zodat
// het lichte palet er een vleugje van kan nemen zonder dat er voor elke
// wereld een tweede palet geschreven hoeft te worden.

const SLEUTEL = 'vierdespoor.thema';
const STANDEN = ['vanzelf', 'licht', 'donker'];

const lees = () => {
  try {
    const s = localStorage.getItem(SLEUTEL);
    return STANDEN.includes(s) ? s : 'vanzelf';
  } catch {
    return 'vanzelf';
  }
};

const schrijf = (stand) => {
  try {
    localStorage.setItem(SLEUTEL, stand);
  } catch {
    /* privémodus: dan geldt de keuze alleen deze sessie */
  }
};

let stand = lees();
const luisteraars = new Set();

// Wat het apparaat zelf wil. Staat matchMedia er niet (oude browser, of een
// test zonder venster), dan gaan we uit van licht: dat is de stand van het
// papier waar deze site op begon.
function voorkeurVanApparaat() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'donker' : 'licht';
  } catch {
    return 'licht';
  }
}

export const themaStand = () => stand;
export const themaNu = () => (stand === 'vanzelf' ? voorkeurVanApparaat() : stand);

export function zetThema(nieuw) {
  stand = STANDEN.includes(nieuw) ? nieuw : 'vanzelf';
  schrijf(stand);
  pasToe();
  for (const fn of luisteraars) fn();
}

export function volgThema(fn) {
  luisteraars.add(fn);
  return () => luisteraars.delete(fn);
}

export function pasToe() {
  document.body.dataset.thema = themaNu();
}

// Staat de keuze op 'vanzelf', dan schuift de site mee als het apparaat
// halverwege de avond omslaat.
try {
  const vraag = window.matchMedia('(prefers-color-scheme: dark)');
  const reageer = () => {
    if (stand !== 'vanzelf') return;
    pasToe();
    for (const fn of luisteraars) fn();
  };
  if (vraag.addEventListener) vraag.addEventListener('change', reageer);
  else if (vraag.addListener) vraag.addListener(reageer);
} catch {
  /* geen matchMedia: dan blijft de stand staan zoals hij staat */
}

// ------------------------------------------------------------------ de knop
//
// Eén knop die door de drie standen loopt, met het teken van de stand die nu
// geldt en de tekst van wat er gebeurt als je klikt. Een rijtje van drie
// knoppen zou duidelijker zijn, maar die past niet naast de titel op een
// telefoon - en daar is juist de kans het grootst dat iemand hem nodig heeft.
const TEKEN = { licht: '☀', donker: '☾' };
const VOLGENDE = { vanzelf: 'licht', licht: 'donker', donker: 'vanzelf' };
const UITLEG = {
  vanzelf: 'Volgt je apparaat',
  licht: 'Altijd licht',
  donker: 'Altijd donker',
};

export function hangThemaknopOp(knop) {
  if (!knop) return;
  const teken = () => {
    const nu = themaNu();
    knop.textContent = stand === 'vanzelf' ? `${TEKEN[nu]} A` : TEKEN[nu];
    knop.title = `${UITLEG[stand]} — klik voor "${UITLEG[VOLGENDE[stand]].toLowerCase()}"`;
    knop.setAttribute('aria-label', knop.title);
    knop.dataset.stand = stand;
  };
  knop.addEventListener('click', () => zetThema(VOLGENDE[stand]));
  volgThema(teken);
  teken();
}
