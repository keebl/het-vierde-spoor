// De bouwer in een Web Worker (specs/engine-extension.md stap 10).
//
// Een bord van twaalf bij twaalf kost op een laptop een paar seconden en op
// een telefoon misschien vier keer zoveel. Op de hoofddraad is dat een
// bevroren pagina; hier niet. De worker bouwt precies wat buildPuzzle zou
// bouwen (bouwKamerGen, uit dezelfde seed), stuurt na elke poging hoe ver
// hij is, en aan het eind het bord als gewone data. Aankleden (namen,
// zinnen) doet de pagina zelf: dat is goedkoop.

import { bouwKamerGen, genNaarData } from '../puzzle.js';

self.onmessage = (e) => {
  const { id, settings } = e.data;
  try {
    const gen = bouwKamerGen(settings, (t, totaal) => self.postMessage({ id, t, totaal }));
    self.postMessage({ id, klaar: genNaarData(gen) });
  } catch (err) {
    self.postMessage({ id, fout: String(err?.message ?? err) });
  }
};
