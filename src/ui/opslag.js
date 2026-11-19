// De voorraad gebouwde puzzels in deze browser (specs/engine-extension.md
// stap 11, optie A).
//
// Een puzzel volgt helemaal uit zijn id, dus een bewaard bord is precies
// wat iedereen anders ook zou bouwen; bewaren spaart alleen rekenwerk. Wat
// gebouwd is en niet gespeeld (de volgende puzzel die alvast klaarstond),
// blijft hier liggen. Hooguit MAX per niveau: komt er een bij, dan gaat de
// oudste eruit. Weigert de browser opslag (privévenster, vol, Safari na
// zeven dagen), dan bouwt de site gewoon opnieuw: alles hier faalt stil.

const DB = 'reconstructie-voorraad';
const STORE = 'borden';
export const MAX_PER_NIVEAU = 100;
// Vanaf welk niveau bewaren loont: daaronder is bouwen sneller dan lezen.
export const BEWAAR_VANAF = 4;

let open = null;
function db() {
  if (open) return open;
  open = new Promise((ok, mis) => {
    try {
      const r = indexedDB.open(DB, 1);
      // Een ander tabblad houdt een oude versie open: dan niet wachten.
      r.onblocked = () => mis(new Error('geblokkeerd'));
      r.onupgradeneeded = () => {
        const s = r.result.createObjectStore(STORE, { keyPath: 'id' });
        s.createIndex('niveau', 'niveau');
      };
      r.onsuccess = () => ok(r.result);
      r.onerror = () => mis(r.error);
    } catch (e) { mis(e); }
  }).catch(() => null);
  return open;
}

const verzoek = (r) => new Promise((ok, mis) => { r.onsuccess = () => ok(r.result); r.onerror = () => mis(r.error); });

// Een halve seconde, dan bouwen we liever zelf: indexedDB.open kan in
// sommige browsers blijven hangen zonder ja of nee te zeggen.
const binnen = (belofte, ms) => Promise.race([belofte, new Promise((ok) => setTimeout(() => ok(null), ms))]);

export async function haal(id, versie) {
  try {
    const d = await binnen(db(), 500);
    if (!d) return null;
    const rij = await binnen(verzoek(d.transaction(STORE).objectStore(STORE).get(id)), 500);
    // Van een andere versie van de motor: niet gebruiken.
    return rij?.data?.versie === versie ? rij.data : null;
  } catch { return null; }
}

// Bewaar een gebouwd bord; houd het niveau onder MAX_PER_NIVEAU.
export async function bewaar(id, niveau, data) {
  try {
    const d = await binnen(db(), 500);
    if (!d) return;
    const s = d.transaction(STORE, 'readwrite').objectStore(STORE);
    await verzoek(s.put({ id, niveau, data, gemaakt: Date.now() }));
    const alle = await verzoek(d.transaction(STORE).objectStore(STORE).index('niveau').getAll(niveau));
    if (alle.length > MAX_PER_NIVEAU) {
      alle.sort((a, b) => a.gemaakt - b.gemaakt);
      const weg = d.transaction(STORE, 'readwrite').objectStore(STORE);
      for (const r of alle.slice(0, alle.length - MAX_PER_NIVEAU)) weg.delete(r.id);
    }
  } catch { /* geen opslag: dan niet */ }
}

// Wie een bewaard bord gaat spelen, haalt het uit de voorraad.
export async function gespeeld(id) {
  try {
    const d = await binnen(db(), 500);
    if (!d) return;
    await verzoek(d.transaction(STORE, 'readwrite').objectStore(STORE).delete(id));
  } catch { /* niets */ }
}
