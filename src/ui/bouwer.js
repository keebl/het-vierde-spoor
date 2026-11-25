// Een puzzel bouwen zonder dat de pagina bevriest (specs/engine-extension.md
// stap 10, criteria 19, 22 en 24).
//
// Volgorde: wat al klaarligt (in het geheugen, de voorraad van deze
// browser of de voorraad in de repo), anders de Web Worker, en zonder
// worker (een heel oude browser) de hoofddraad met "even geduld".

import { bouwKamerGen, genNaarData, puzzleId, BORDVERSIE } from '../puzzle.js';
import { haal, bewaar, gespeeld, BEWAAR_VANAF } from './opslag.js';
import { maatVanSeed } from '../engine/difficulty.js';
import { PAD_BEWAAR_VANAF } from '../content/pad.js';

// Hoe lang het op een gemiddelde telefoon hooguit duurt, in seconden: de
// prestatiebegroting van de spec (vier keer de laptop tot het gemeten is).
// Niveau vijf bouwt sinds het sjabloon tot bijna twee minuten op een laptop
// (keuring fase B: 67 s en 106 s gemeten; begroting 120 s, Guus: "de
// doorlooptijd boeit me dan niet zo"); meestal komt hij uit de voorraad in
// de repo. De keuring eist dat dit nooit onder de laptopbegroting zakt
// (tools/check-voorraad.mjs), anders belooft het scherm te weinig.
export const SCHATTING = { 1: 1, 2: 1, 3: 1, 4: 8, 5: 240, 6: 30 };

// "ongeveer 8 seconden", "ongeveer 4 minuten".
export function duurTekst(seconden) {
  return seconden >= 120 ? `${Math.round(seconden / 60)} minuten` : `${seconden} seconden`;
}

const klaar = new Map();

function maakWorker() {
  try {
    if (typeof Worker === 'undefined') return null;
    return new Worker(new URL('../engine/worker.js', import.meta.url), { type: 'module' });
  } catch { return null; }
}

// Uit de repo: een vaste voorraad per niveau (tools/pool.mjs), alleen
// geladen als dat niveau gevraagd wordt.
// De stappen van het pad van tien bij tien en groter liggen in
// pool/pad.json (tools/pad.mjs); hun niveau zegt niets over welk bestand.
const pools = new Map();
async function uitPool(settings) {
  const maat = maatVanSeed(settings.seed);
  const n = maat ? (maat >= PAD_BEWAAR_VANAF ? 'pad' : null) : settings.niveau;
  if (n == null || (typeof n === 'number' && n < 5)) return null;
  if (!pools.has(n)) {
    pools.set(n, fetch(new URL(`../../pool/${n === 'pad' ? 'pad' : `niveau-${n}`}.json`, import.meta.url))
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({})));
  }
  const pool = await pools.get(n);
  if (pool?.versie !== BORDVERSIE) return null;
  return pool.borden?.[puzzleId(settings)] ?? null;
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
    // Mislukte het op de achtergrond, dan nog een keer, nu op de voorgrond.
    const data = lopend.taak.data.catch(() => bouw(settings, { opVoortgang }).data);
    data.then(() => gespeeld(id)).catch(() => {});
    return { data, afbreken: lopend.taak.afbreken };
  }
  let worker = null;
  let gestopt = false;
  let weiger = null;
  const afgebroken = new Promise((_, mis) => { weiger = mis; });
  afgebroken.catch(() => {});
  const werk = (async () => {
    if (klaar.has(id)) return klaar.get(id);
    const bewaard = (await haal(id, BORDVERSIE)) ?? (await uitPool(settings));
    // gespeeld en bewaar vangen hun eigen fouten: bewust niet op wachten.
    if (bewaard) { if (!achtergrond) void gespeeld(id); return bewaard; }
    if (gestopt) throw new Error('afgebroken');
    worker = maakWorker();
    // Vooruitbouwen zonder worker zou de pagina bevriezen terwijl iemand
    // speelt: dan niet.
    if (!worker && achtergrond) throw new Error('geen worker');
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
        if (achtergrond) { mis(new Error('geen worker')); return; }
        try { ok(genNaarData(bouwKamerGen(settings))); } catch (err) { mis(err); }
      };
      worker.postMessage({ id, settings });
    });
  })();
  // Afbreken laat de belofte meteen falen, zodat wie erop wacht (de klok
  // van de balk) ophoudt; anders bleef hij voor altijd hangen.
  const data = Promise.race([werk, afgebroken]);
  data.then((d) => {
    if (achtergrond) {
      klaar.set(id, d);
      if (settings.niveau >= BEWAAR_VANAF) void bewaar(id, settings.niveau, d);
    }
  }).catch(() => {});
  return {
    data,
    afbreken: () => { gestopt = true; worker?.terminate(); weiger(new Error('afgebroken')); },
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
