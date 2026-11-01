// Deterministische random. Zelfde seed => zelfde puzzel, altijd en overal.
// mulberry32: klein, snel, goed genoeg voor puzzelgeneratie.

export function makeRng(seed) {
  let a = typeof seed === 'string' ? hashString(seed) : (seed | 0) || 1;
  const rng = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  rng.int = (max) => Math.floor(rng() * max);
  rng.pick = (arr) => arr[Math.floor(rng() * arr.length)];
  rng.shuffle = (arr) => {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  rng.sample = (arr, k) => rng.shuffle(arr).slice(0, k);
  return rng;
}

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Leesbare seeds: "noir-4821" is makkelijker te delen dan een hash.
export function randomSeed(prefix = 'spoor') {
  return `${prefix}-${Math.floor(Math.random() * 9000 + 1000)}`;
}
