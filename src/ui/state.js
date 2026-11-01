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
  return new Set(Object.keys(all).filter((k) => all[k]?.solved));
}
