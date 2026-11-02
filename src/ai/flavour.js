// Optionele AI-laag: laat de verhaalteksten herschrijven, nooit de logica.
//
// Harde grens: een herschreven aanwijzing moet elke eigennaam uit het
// origineel woordelijk bevatten, en het aantal aanwijzingen moet gelijk
// blijven. Haalt een zin dat niet, dan gebruiken we de originele zin. Zo kan
// een slechte herschrijving een puzzel nooit onoplosbaar of dubbelzinnig
// maken - dat is precies de fout waar papieren uitgaven klachten over
// krijgen. Dat vangnet staat in src/ai/opdracht.js, want de server gebruikt
// het ook: wat daar niet doorheen komt, wordt niet eens bewaard.
//
// Wat deze kant verstuurt is één ding: het id van de puzzel. Geen teksten,
// geen prompt. De server rekent de puzzel zelf uit en bouwt de vraag aan het
// model daaruit op, zodat er langs deze weg geen eigen tekst een model in te
// praten valt.
//
// Staat standaard uit.

import { aiEndpoint } from './endpoint.js';

// De teksten van de bibliotheek zijn vooraf herschreven en staan in de repo
// (zie tools/ai-vooraf.mjs). Die hebben geen server nodig, geen sleutel en
// geen toestemming: ze zijn gewoon inhoud, net als de eigen teksten. We
// halen het bestand pas op als er een puzzel wordt geopend.
let voorafBelofte = null;
function voorafTeksten() {
  if (!voorafBelofte) {
    voorafBelofte = fetch(new URL('../content/ai-teksten.json', import.meta.url))
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}));
  }
  return voorafBelofte;
}

import { keepsNames } from './opdracht.js';

export { keepsNames };

const FLAG = 'vierdespoor.ai';

export const aiEnabled = () => {
  try {
    return localStorage.getItem(FLAG) === '1';
  } catch {
    return false;
  }
};

export const setAiEnabled = (on) => {
  try {
    localStorage.setItem(FLAG, on ? '1' : '0');
  } catch {
    /* niets aan te doen */
  }
};

export async function dressUp(puzzle) {
  // Staat deze puzzel in de vooraf herschreven set, dan is er niets te
  // vragen: de tekst ligt er al.
  const vooraf = (await voorafTeksten())[puzzle.id];
  if (vooraf) return pasToe(puzzle, vooraf);

  if (!aiEnabled()) return puzzle;
  const url = aiEndpoint();
  if (!url) return puzzle;

  let data;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      // Het enige dat we versturen: welke puzzel het is.
      body: JSON.stringify({ id: puzzle.id }),
    });
    if (!res.ok) return puzzle;
    data = await res.json();
  } catch {
    return puzzle;
  }

  if (!data || typeof data !== 'object') return puzzle;
  return pasToe(puzzle, data);
}

// Een set herschreven teksten op een puzzel leggen - en wat het vangnet niet
// haalt, blijft staan zoals het was. Dit gebeurt hier nog een keer, ook al
// keurde de server het al: de puzzel in de browser is de echte, en alleen
// hier weten we zeker dat elke zin bij zijn eigen aanwijzing hoort.
function pasToe(puzzle, data) {
  const out = { ...puzzle, aiUsed: true, aiKept: 0, aiRejected: 0 };
  if (typeof data.intro === 'string' && data.intro.length > 20) out.intro = data.intro;

  const perNummer = new Map(
    (Array.isArray(data.aanwijzingen) ? data.aanwijzingen : [])
      .filter((a) => a && typeof a.tekst === 'string')
      .map((a) => [Number(a.n), a.tekst])
  );
  out.clues = puzzle.clues.map((clue) => {
    const kandidaat = perNummer.get(clue.n);
    if (kandidaat && keepsNames(clue.text, kandidaat, clue.names ?? [])) {
      out.aiKept++;
      return { ...clue, text: kandidaat, origineel: clue.text };
    }
    if (kandidaat) out.aiRejected++;
    return clue;
  });
  return out;
}
