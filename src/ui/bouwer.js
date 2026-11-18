// Een puzzel bouwen zonder dat de pagina bevriest (specs/engine-extension.md
// stap 10, criteria 19, 22 en 24).
//
// Volgorde: wat al klaarligt (in het geheugen, de voorraad van deze
// browser of de voorraad in de repo), anders de Web Worker, en zonder
// worker (een heel oude browser) de hoofddraad met "even geduld".

import { bouwKamerGen, genNaarData, puzzleId } from '../puzzle.js';
import { haal, bewaar, gespeeld, BEWAAR_VANAF } from './opslag.js';

// Hoe lang het op een gemiddelde telefoon hooguit duurt, in seconden: de
// prestatiebegroting van de spec (vier keer de laptop tot het gemeten is).
export const SCHATTING = { 1: 1, 2: 1, 3: 1, 4: 3, 5: 15, 6: 30 };

const klaar = new Map();

function maakWorker() {
  try {
    if (typeof Worker === 'undefined') return null;
    return new Worker(new URL('../engine/worker.js', import.meta.url), { type: 'module' });
  } catch { return null; }
}

// Uit de repo: een vaste voorraad per niveau (tools/pool.mjs), alleen
// geladen als dat niveau gevraagd wordt.
const pools = new Map();
async function uitPool(settings) {
  const n = settings.niveau;
  if (n < 5) return null;
  if (!pools.has(n)) {
    pools.set(n, fetch(new URL(`../../pool/niveau-${n}.json`, import.meta.url))
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({})));
  }
  const pool = await pools.get(n);
  return pool?.[puzzleId(settings)] ?? null;
}

// Bouw (of vind) het bord voor deze instellingen. opVoortgang(deel) krijgt
// een getal van 0 tot 1. Geeft { data, afbreken }; data is een Promise.
export function bouw(settings, { opVoortgang = null, achtergrond = false } = {}) {
  const id = puzzleId(settings);
  // Bouwt de achtergrond hem al, dan wachten we daarop in plaats van twee
  // keer te bouwen.
  if (!achtergrond && vooruit?.id === id) {
    const lopend = vooruit;
    vooruit = null;
    return lopend.taak;
  }
  let worker = null;
  let gestopt = false;
  const data = (async () => {
    if (klaar.has(id)) return klaar.get(id);
    const bewaard = (await haal(id)) ?? (await uitPool(settings));
    if (bewaard) { if (!achtergrond) gespeeld(id); return bewaard; }
    if (gestopt) throw new Error('afgebroken');
    worker = maakWorker();
    if (!worker) {
      // Geen worker: op de hoofddraad, zoals vroeger.
      return genNaarData(bouwKamerGen(settings));
    }
    return new Promise((ok, mis) => {
      worker.onmessage = (e) => {
        const m = e.data;
        if (m.id !== id) return;
        if (m.klaar) { worker.terminate(); ok(m.klaar); }
        else if (m.fout) { worker.terminate(); mis(new Error(m.fout)); }
        else opVoortgang?.((m.t + 1) / m.totaal);
      };
      worker.onerror = (e) => {
        // Kan de module niet laden (oude browser): toch op de hoofddraad.
        e.preventDefault?.();
        worker.terminate();
        try { ok(genNaarData(bouwKamerGen(settings))); } catch (err) { mis(err); }
      };
      worker.postMessage({ id, settings });
    });
  })();
  data.then((d) => {
    if (achtergrond) {
      klaar.set(id, d);
      if (settings.niveau >= BEWAAR_VANAF) bewaar(id, settings.niveau, d);
    }
  }).catch(() => {});
  return {
    data,
    afbreken: () => { gestopt = true; worker?.terminate(); },
  };
}

// De volgende puzzel alvast bouwen terwijl de huidige gespeeld wordt
// (criterium 24). Eén tegelijk; een nieuwe vervangt de vorige.
let vooruit = null;
export function bouwVooruit(settings) {
  if (settings.mechaniek !== 'kamer' || settings.niveau < BEWAAR_VANAF) return;
  const id = puzzleId(settings);
  if (klaar.has(id) || vooruit?.id === id) return;
  vooruit?.taak.afbreken();
  vooruit = { id, taak: bouw(settings, { achtergrond: true }) };
}
