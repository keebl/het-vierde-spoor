// Optionele AI-laag: laat de verhaalteksten herschrijven, nooit de logica.
//
// Harde grens: een herschreven aanwijzing moet elke eigennaam uit het
// origineel woordelijk bevatten, en het aantal aanwijzingen moet gelijk
// blijven. Haalt een zin dat niet, dan gebruiken we de originele zin. Zo kan
// een slechte herschrijving een puzzel nooit onoplosbaar of dubbelzinnig
// maken - dat is precies de fout waar papieren uitgaven klachten over
// krijgen.
//
// Staat standaard uit. Aanzetten kan alleen als er een lokale server draait
// met een API-key; zonder dat blijven de eigen templateteksten staan.

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

function keepsNames(original, rewritten, names) {
  if (typeof rewritten !== 'string' || rewritten.length < 4) return false;
  return names.every((name) => rewritten.includes(name));
}

export async function dressUp(puzzle) {
  if (!aiEnabled()) return puzzle;

  const payload = {
    wereld: puzzle.world.name,
    opdracht: puzzle.opdracht.name,
    intro: puzzle.intro,
    vraag: puzzle.question.text,
    aanwijzingen: puzzle.clues.map((c) => ({ n: c.n, tekst: c.text, namen: c.names ?? [] })),
  };

  let data;
  try {
    const res = await fetch('/api/flavour', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return puzzle;
    data = await res.json();
  } catch {
    return puzzle;
  }

  if (!data || typeof data !== 'object') return puzzle;

  const out = { ...puzzle, aiUsed: true, aiKept: 0, aiRejected: 0 };
  if (typeof data.intro === 'string' && data.intro.length > 20) out.intro = data.intro;

  if (Array.isArray(data.aanwijzingen) && data.aanwijzingen.length === puzzle.clues.length) {
    out.clues = puzzle.clues.map((clue, i) => {
      const kandidaat = data.aanwijzingen[i]?.tekst;
      if (keepsNames(clue.text, kandidaat, clue.names ?? [])) {
        out.aiKept++;
        return { ...clue, text: kandidaat, origineel: clue.text };
      }
      out.aiRejected++;
      return clue;
    });
  }
  return out;
}
