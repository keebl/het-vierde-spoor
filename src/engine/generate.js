// Puzzelgeneratie voor toewijzingspuzzels (raster en plattegrond).
//
// Werkwijze:
//   1. kies een willekeurige oplossing
//   2. bouw een vijver van aanwijzingen die in die oplossing WAAR zijn
//   3. voeg er een voor een toe tot de oplossing uniek is
//   4. snoei: elke aanwijzing die je kunt missen gaat eruit
//   5. keur: past de redeneerdiepte bij het gevraagde niveau?
// Stap 5 faalt soms, dus we proberen meerdere keren met afgeleide seeds.
// Alles blijft deterministisch: zelfde seed, zelfde puzzel.

import { countSolutions, grade } from './assign.js';
import { makeRng } from './rng.js';

function randomSolution(spec, rng) {
  const n = spec.anchor.items.length;
  const cols = {};
  for (const c of spec.cats) {
    const perm = rng.shuffle([...Array(n).keys()]);
    cols[c.id] = perm;
  }
  return cols;
}

const slotOfItem = (spec, sol, cid, item) =>
  cid === spec.anchor.id ? item : sol[cid].indexOf(item);

const itemAtSlot = (spec, sol, cid, slot) =>
  cid === spec.anchor.id ? slot : sol[cid][slot];

function allCats(spec) {
  return [spec.anchor, ...spec.cats];
}

// Alle aanwijzingen die waar zijn in deze oplossing, per type.
function buildPool(spec, sol, rng, weights) {
  const n = spec.anchor.items.length;
  const cats = allCats(spec);
  const ordered = cats.filter((c) => c.ordered);
  const pool = [];
  const push = (kind, clue) => {
    if (!weights[kind]) return;
    pool.push({ ...clue, kind, weight: weights[kind] });
  };

  const ref = (cid, slot) => ({ c: cid, i: itemAtSlot(spec, sol, cid, slot) });

  for (let x = 0; x < cats.length; x++) {
    for (let y = x + 1; y < cats.length; y++) {
      const A = cats[x].id, B = cats[y].id;
      for (let s = 0; s < n; s++) {
        push('same', { a: ref(A, s), b: ref(B, s) });
        for (let t = 0; t < n; t++) {
          if (s === t) continue;
          push('diff', { a: ref(A, s), b: ref(B, t) });
        }
      }
      // of-of: een waar paar plus een misleider uit dezelfde categorie.
      // Het onderwerp moet uit de categorie met de laagste objectRank komen,
      // anders kun je er geen nette zin van maken.
      const rA = cats[x].objectRank ?? 5;
      const rB = cats[y].objectRank ?? 5;
      const [lo, hi] = rA <= rB ? [A, B] : [B, A];
      for (let s = 0; s < n; s++) {
        for (let t = 0; t < n; t++) {
          if (s === t) continue;
          push('either', { a: ref(lo, s), b: ref(hi, s), c2: ref(hi, t) });
        }
      }
    }
  }

  for (const o of ordered) {
    const others = cats.filter((c) => c.id !== o.id);
    for (const ca of others) {
      for (const cb of others) {
        for (let s = 0; s < n; s++) {
          for (let t = 0; t < n; t++) {
            if (s === t) continue;
            const ra = itemAtSlot(spec, sol, o.id, s);
            const rb = itemAtSlot(spec, sol, o.id, t);
            if (ca.id === cb.id && s >= t) continue;
            if (ra < rb) push('before', { a: ref(ca.id, s), b: ref(cb.id, t), o: o.id });
            const d = Math.abs(ra - rb);
            if (d >= 1 && ca.id !== cb.id) push('gap', { a: ref(ca.id, s), b: ref(cb.id, t), o: o.id, d });
          }
        }
      }
    }
  }

  if (spec.graph) {
    for (const ca of cats) {
      for (const cb of cats) {
        if (ca.id === cb.id) continue;
        for (let s = 0; s < n; s++) {
          for (let t = 0; t < n; t++) {
            if (s === t) continue;
            const isAdj = spec.graph.isEdge(s, t);
            push('adj', { a: ref(ca.id, s), b: ref(cb.id, t), positive: isAdj });
            const d = spec.graph.dist(s, t);
            if (d >= 2) push('hops', { a: ref(ca.id, s), b: ref(cb.id, t), d });
          }
        }
      }
      // Over de ruimte zelf hoeven we niets te zeggen: hoeveel uitgangen een
      // ruimte heeft, ziet de speler op de kaart.
      if (ca.id !== spec.anchor.id) {
        for (let s = 0; s < n; s++) {
          push('degree', { a: ref(ca.id, s), d: spec.graph.degree(s), cmp: 'eq' });
        }
      }
    }
  }

  // Wegen zonder de vijver op te blazen: elke aanwijzing krijgt een
  // sorteersleutel die met zijn gewicht naar voren schuift.
  return pool
    .map((cl) => ({ cl, k: rng() / cl.weight }))
    .sort((a, b) => a.k - b.k)
    .map((e) => e.cl);
}

const clueKey = (cl) => JSON.stringify([cl.kind, cl.a, cl.b, cl.c2, cl.o, cl.d, cl.positive, cl.cmp]);

// Hoe ver kom je met puur doorstrepen? Minder open cellen is beter.
const openAfter = (spec, clues) => grade(spec, clues).openCells;

// Aanwijzingen toevoegen tot de propagator het alleen afkan. We kiezen niet
// blind: per stap bekijken we een handvol kandidaten en nemen die het meeste
// uitsluit. Zo heb je er veel minder nodig dan bij willekeurig toevoegen.
function nextCandidates(pool, seen, lookahead) {
  const out = [];
  const local = new Set();
  for (const cl of pool) {
    if (out.length >= lookahead) break;
    const key = clueKey(cl);
    if (seen.has(key) || local.has(key)) continue;
    local.add(key);
    out.push({ cl, key });
  }
  return out;
}

function growSolvable(spec, pool, fixed, lookahead = 14) {
  const clues = [...fixed];
  const seen = new Set(clues.map(clueKey));
  let g = grade(spec, clues);

  while (!g.solved) {
    // Altijd vanaf het begin van de (al gewogen gehusselde) vijver kijken:
    // kandidaten die we deze ronde niet kozen blijven beschikbaar.
    const candidates = nextCandidates(pool, seen, lookahead);
    if (!candidates.length) return null;

    let bestOpen = Infinity;
    let best = null;
    for (const c of candidates) {
      const open = openAfter(spec, [...clues, c.cl]);
      if (open < bestOpen) { bestOpen = open; best = c; }
      if (open === 0) break;
    }
    if (bestOpen >= g.openCells && bestOpen > 0) {
      // Geen van deze kandidaten helpt: markeer ze als gezien en ga door.
      for (const c of candidates) seen.add(c.key);
      continue;
    }
    clues.push(best.cl);
    seen.add(best.key);
    g = grade(spec, clues);
  }
  return clues;
}

// Aanwijzingen toevoegen tot de oplossing uniek is, zonder te eisen dat
// doorstrepen genoeg is. Levert krappere sets op waar je wel een aanname
// voor nodig hebt - dat is precies de bedoeling op de hoogste niveaus.
function growUnique(spec, pool, fixed) {
  const clues = [...fixed];
  const seen = new Set(clues.map(clueKey));
  if (countSolutions(spec, clues).count === 1) return clues;
  for (const cl of pool) {
    const key = clueKey(cl);
    if (seen.has(key)) continue;
    seen.add(key);
    clues.push(cl);
    if (countSolutions(spec, clues).count === 1) return clues;
  }
  return null;
}

// Snoeien: elke aanwijzing die je kunt missen gaat eruit. Bij 'shallow' moet
// na het weghalen het doorstrepen nog werken, bij 'deep' alleen de uniciteit.
function pruneClues(spec, clues, keepFirst, style, rng) {
  const keep = clues.slice();
  const order = rng.shuffle(keep.map((_, i) => i)).filter((i) => i >= keepFirst);
  const dropped = [];
  for (const idx of order) {
    if (!keep[idx]) continue;
    const trial = keep.filter((c, i) => c && i !== idx);
    const ok = style === 'shallow'
      ? grade(spec, trial).solved
      : countSolutions(spec, trial).count === 1;
    if (ok) { dropped.push(keep[idx]); keep[idx] = null; }
  }
  return { clues: keep.filter(Boolean), dropped };
}

function attempt(spec, rng, params, forced) {
  const sol = randomSolution(spec, rng);
  // Verplichte feiten (bv. wat op de plaats van het misdrijf lag) gelden
  // als aanwijzing: ze beperken net zo goed, ze staan alleen in de inleiding.
  const fixedClues = forced ? forced(spec, sol, rng) : [];
  const pool = buildPool(spec, sol, rng, params.weights);

  const grown = params.style === 'shallow'
    ? growSolvable(spec, pool, fixedClues)
    : growUnique(spec, pool, fixedClues);
  if (!grown) return null;
  if (countSolutions(spec, grown).count !== 1) return null;

  let { clues, dropped } = pruneClues(spec, grown, fixedClues.length, params.style, rng);

  // Op het laagste niveau mag er een beetje houvast bij, maar alleen als het
  // de puzzel niet in een opsomming verandert.
  if (params.redundancy > 0 && dropped.length) {
    const extra = Math.min(2, Math.round(dropped.length * params.redundancy));
    clues = clues.concat(rng.sample(dropped, extra));
  }

  const g = grade(spec, clues);
  return { solution: sol, clues, grade: g, depth: g.solved ? 1 : 2, clueCount: clues.length };
}

// Hoe goed past deze kandidaat bij het niveau? Lager is beter, 0 is goed.
function mismatch(cand, params) {
  if (params.style === 'deep') return cand.grade.solved ? 10 : 0;
  if (!cand.grade.solved) return 10;
  return Math.max(0, cand.clueCount - (params.maxClues ?? 99));
}

export function generateAssignment(spec, seed, params, forced = null, tries = 6) {
  let best = null;
  for (let t = 0; t < tries; t++) {
    const rng = makeRng(`${seed}#${t}`);
    const cand = attempt(spec, rng, params, forced);
    if (!cand) continue;
    const miss = mismatch(cand, params);
    if (miss === 0) return { ...cand, attempt: t, miss };
    if (!best || miss < best.miss) best = { ...cand, miss, attempt: t };
  }
  if (!best) throw new Error('kon geen geldige puzzel bouwen voor deze instellingen');
  return best;
}
