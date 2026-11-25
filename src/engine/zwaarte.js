// Hoe zwaar een kamerpuzzel voelt, als één getal (specs/level-path.md,
// plan stap 1). Het pad zet zijn stappen op volgorde van dit getal.
//
// Gemeten op 2026-11-25 over de keuringsset per niveau (tools/meet-zwaarte.mjs):
// de ketenlengte van de menselijke solver alleen ordent de niveaus niet. Op
// vijf bij vijf en zes bij zes zijn de sporen even kort (mediaan twee), en
// een bord van negen bij negen dat met doorstrepen valt, heeft soms een
// korter spoor dan een lastig zeven bij zeven. Wat een groter bord zwaar
// maakt, is ook dat er meer mensen zijn om bij te houden. Dus telt het
// aantal mensen mee, en wegen de stappen boven het doorstrepen zwaarder:
// een tier-3-stap (kruispunt, paar, relatie, telling) twee extra, een
// aanname nog drie daarbovenop.
//
//   zwaarte = mensen + lengte + 2 · zwaar + 3 · aannames
//
// lengte en zwaar komen uit graadVan (redeneer.js): lengte telt alles wat
// geen boekhouding is, zwaar de stappen van tier 3 en hoger.
export function zwaarte(n, graad) {
  const aannames = graad.perTechniek?.aanname ?? 0;
  return n + graad.lengte + 2 * graad.zwaar + 3 * aannames;
}

// Hoeveel een stap op het pad lichter mag zijn dan de vorige. Binnen een
// maat staan de stappen gesorteerd, dus dit gaat alleen over de overgang
// naar een nieuwe maat: een kwart, en minstens drie.
export const PAD_MARGE = (vorige) => Math.max(3, Math.round(vorige * 0.25));
