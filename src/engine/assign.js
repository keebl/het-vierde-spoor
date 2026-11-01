// Toewijzingspuzzels: de motor achter zowel het deductieraster als de
// plattegrond. Model: een ankercategorie levert N slots (verdachten, zalen),
// en elke andere categorie verdeelt haar N items precies een-op-een over
// die slots. Aanwijzingen zijn beperkingen op die verdeling.
//
// Drie lagen, met opzet gescheiden:
//   countSolutions  - waarheid. Backtracking, bewijst uniciteit.
//   propagate       - redeneren zoals een mens. Bepaalt moeilijkheid + hints.
//   generate        - bouwt een puzzel en laat de andere twee hem keuren.

import { evalClue, catsTouched } from './clues.js';

export function makeCtx(spec, cols) {
  const byId = new Map([[spec.anchor.id, spec.anchor]]);
  for (const c of spec.cats) byId.set(c.id, c);
  return {
    n: spec.anchor.items.length,
    anchorId: spec.anchor.id,
    cat: (id) => byId.get(id),
    col: (id) => cols[id],
    graph: spec.graph,
    spec,
  };
}

export function emptyCols(spec) {
  const n = spec.anchor.items.length;
  const cols = {};
  for (const c of spec.cats) cols[c.id] = new Array(n).fill(null);
  return cols;
}

// ------------------------------------------------------------- uniciteit

// Telt oplossingen tot aan `cap`. cap=2 is genoeg om "precies een" te bewijzen
// en blijft goedkoop: bij te weinig aanwijzingen vindt hij de tweede oplossing
// vrijwel direct en stopt.
export function countSolutions(spec, clues, cap = 2) {
  const n = spec.anchor.items.length;
  const cols = emptyCols(spec);
  const ctx = makeCtx(spec, cols);

  const byCat = new Map();
  for (const cl of clues) {
    for (const cid of catsTouched(cl)) {
      if (!byCat.has(cid)) byCat.set(cid, []);
      byCat.get(cid).push(cl);
    }
  }

  // Slot-eerst: zo bijten aanwijzingen tussen twee niet-ankercategorieen
  // meteen, in plaats van pas na een hele kolom.
  //
  // Vooraf propageren om de zoekruimte te beperken is twee keer geprobeerd
  // (altijd, en alleen bij volle aanwijzingensets) en was beide keren
  // duurder: 30s -> 51s over de hele keuring, en de zwaarste puzzel ging van
  // 2,4s naar 6,2s. De propagator werkt met Sets en is per aanroep duurder
  // dan het rauwe terugzoeken dat hij moet besparen. Niet nog eens proberen
  // zonder de propagator eerst op bitmaskers te zetten.
  const vars = [];
  for (let a = 0; a < n; a++) for (const c of spec.cats) vars.push([c.id, a]);

  const used = {};
  for (const c of spec.cats) used[c.id] = new Array(n).fill(false);

  let found = 0;
  let first = null;

  const consistent = (cid) => {
    const list = byCat.get(cid);
    if (!list) return true;
    for (const cl of list) if (evalClue(cl, ctx) === false) return false;
    return true;
  };

  const rec = (vi) => {
    if (vi === vars.length) {
      for (const cl of clues) if (evalClue(cl, ctx) !== true) return;
      found++;
      if (!first) first = JSON.parse(JSON.stringify(cols));
      return;
    }
    const [cid, slot] = vars[vi];
    const col = cols[cid];
    const usedC = used[cid];
    for (let i = 0; i < n; i++) {
      if (usedC[i]) continue;
      col[slot] = i;
      usedC[i] = true;
      if (consistent(cid)) rec(vi + 1);
      col[slot] = null;
      usedC[i] = false;
      if (found >= cap) return;
    }
  };

  rec(0);
  return { count: found, solution: first };
}

// --------------------------------------------------- menselijk redeneren

// Mogelijkhedenraster: poss[catId][item] = Set van slots waar dat item nog kan.
function initPoss(spec, fixed) {
  const n = spec.anchor.items.length;
  const poss = {};
  for (const c of spec.cats) {
    poss[c.id] = [];
    for (let i = 0; i < n; i++) {
      poss[c.id].push(new Set([...Array(n).keys()]));
    }
  }
  if (fixed) {
    for (const cid of Object.keys(fixed)) {
      fixed[cid].forEach((item, slot) => {
        if (item != null) assign(spec, poss, cid, item, slot);
      });
    }
  }
  return poss;
}

function assign(spec, poss, cid, item, slot) {
  const n = spec.anchor.items.length;
  poss[cid][item] = new Set([slot]);
  for (let j = 0; j < n; j++) if (j !== item) poss[cid][j].delete(slot);
}

const slotsOf = (spec, poss, ref) =>
  ref.c === spec.anchor.id ? new Set([ref.i]) : poss[ref.c][ref.i];

const restrict = (set, allowed) => {
  let changed = false;
  for (const s of [...set]) if (!allowed(s)) { set.delete(s); changed = true; }
  return changed;
};

function rankBounds(spec, poss, orderedId, slot) {
  const n = spec.anchor.items.length;
  if (orderedId === spec.anchor.id) return [slot, slot];
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < n; i++) {
    if (poss[orderedId][i].has(slot)) { lo = Math.min(lo, i); hi = Math.max(hi, i); }
  }
  return [lo, hi];
}

// Een ronde propagatie per aanwijzing. Elimineert alleen wat echt onmogelijk
// is (sound), maar vindt niet altijd alles (incompleet) - precies zoals een
// mens die stap voor stap doorredeneert.
function propagateClue(spec, poss, cl) {
  const A = () => slotsOf(spec, poss, cl.a);
  const B = () => slotsOf(spec, poss, cl.b);
  let changed = false;

  switch (cl.kind) {
    case 'same': {
      const sa = A(), sb = B();
      changed = restrict(sa, (s) => sb.has(s)) || changed;
      changed = restrict(sb, (s) => sa.has(s)) || changed;
      break;
    }
    case 'diff': {
      const sa = A(), sb = B();
      if (sb.size === 1) changed = restrict(sa, (s) => !sb.has(s)) || changed;
      if (sa.size === 1) changed = restrict(sb, (s) => !sa.has(s)) || changed;
      break;
    }
    case 'either': {
      const sa = A(), s1 = B(), s2 = slotsOf(spec, poss, cl.c2);
      changed = restrict(sa, (s) => s1.has(s) || s2.has(s)) || changed;
      const hit1 = [...sa].some((s) => s1.has(s));
      const hit2 = [...sa].some((s) => s2.has(s));
      if (hit1 && !hit2) changed = restrict(s1, (s) => sa.has(s)) || changed;
      if (hit2 && !hit1) changed = restrict(s2, (s) => sa.has(s)) || changed;
      break;
    }
    case 'before': {
      const sa = A(), sb = B();
      changed = restrict(sa, (s) =>
        [...sb].some((t) => t !== s && rankBounds(spec, poss, cl.o, t)[1] > rankBounds(spec, poss, cl.o, s)[0])) || changed;
      changed = restrict(sb, (s) =>
        [...sa].some((t) => t !== s && rankBounds(spec, poss, cl.o, t)[0] < rankBounds(spec, poss, cl.o, s)[1])) || changed;
      break;
    }
    case 'gap': {
      const fits = (s, t) => {
        if (s === t) return false;
        const [lo1, hi1] = rankBounds(spec, poss, cl.o, s);
        const [lo2, hi2] = rankBounds(spec, poss, cl.o, t);
        for (let r1 = lo1; r1 <= hi1; r1++) for (let r2 = lo2; r2 <= hi2; r2++) {
          if (Math.abs(r1 - r2) === cl.d) return true;
        }
        return false;
      };
      const sa = A(), sb = B();
      changed = restrict(sa, (s) => [...sb].some((t) => fits(s, t))) || changed;
      changed = restrict(sb, (s) => [...sa].some((t) => fits(s, t))) || changed;
      break;
    }
    case 'adj': {
      const sa = A(), sb = B();
      const rel = (s, t) => s !== t && spec.graph.isEdge(s, t) === cl.positive;
      changed = restrict(sa, (s) => [...sb].some((t) => rel(s, t))) || changed;
      changed = restrict(sb, (s) => [...sa].some((t) => rel(t, s))) || changed;
      break;
    }
    case 'hops': {
      const sa = A(), sb = B();
      const rel = (s, t) => spec.graph.dist(s, t) === cl.d;
      changed = restrict(sa, (s) => [...sb].some((t) => rel(s, t))) || changed;
      changed = restrict(sb, (s) => [...sa].some((t) => rel(t, s))) || changed;
      break;
    }
    case 'degree': {
      const sa = A();
      changed = restrict(sa, (s) => {
        const d = spec.graph.degree(s);
        return cl.cmp === 'eq' ? d === cl.d : d >= cl.d;
      }) || changed;
      break;
    }
  }
  return changed;
}

// Houdt de een-op-een-regel in stand: een item zit in precies een slot,
// en in elk slot zit precies een item per categorie.
function propagateBijection(spec, poss) {
  const n = spec.anchor.items.length;
  let changed = false;
  for (const c of spec.cats) {
    const p = poss[c.id];
    for (let i = 0; i < n; i++) {
      if (p[i].size === 1) {
        const [s] = p[i];
        for (let j = 0; j < n; j++) if (j !== i && p[j].delete(s)) changed = true;
      }
    }
    for (let s = 0; s < n; s++) {
      const cands = [];
      for (let i = 0; i < n; i++) if (p[i].has(s)) cands.push(i);
      if (cands.length === 1 && p[cands[0]].size > 1) {
        p[cands[0]] = new Set([s]);
        changed = true;
      }
    }
  }
  return changed;
}

function isBroken(spec, poss) {
  const n = spec.anchor.items.length;
  for (const c of spec.cats) for (let i = 0; i < n; i++) if (poss[c.id][i].size === 0) return true;
  return false;
}

function isSolved(spec, poss) {
  const n = spec.anchor.items.length;
  for (const c of spec.cats) for (let i = 0; i < n; i++) if (poss[c.id][i].size !== 1) return false;
  return true;
}

export function propagate(spec, clues, fixed = null) {
  const poss = initPoss(spec, fixed);
  let changed = true;
  while (changed && !isBroken(spec, poss)) {
    changed = false;
    for (const cl of clues) changed = propagateClue(spec, poss, cl) || changed;
    changed = propagateBijection(spec, poss) || changed;
  }
  return { poss, solved: isSolved(spec, poss), broken: isBroken(spec, poss) };
}

// Goedkope graadmeter: lost puur doorstrepen de puzzel op, en in hoeveel
// rondes? Dit kost een enkele propagatie en is genoeg om "doorstrepen" van
// "je moet een aanname doen" te scheiden - precies het verschil dat een
// speler voelt.
export function grade(spec, clues) {
  const poss = initPoss(spec, null);
  let rounds = 0;
  let changed = true;
  while (changed && !isBroken(spec, poss)) {
    changed = false;
    for (const cl of clues) changed = propagateClue(spec, poss, cl) || changed;
    changed = propagateBijection(spec, poss) || changed;
    if (changed) rounds++;
    if (isSolved(spec, poss)) break;
  }
  const solved = isSolved(spec, poss);
  let openCells = 0;
  const n = spec.anchor.items.length;
  for (const c of spec.cats) for (let i = 0; i < n; i++) if (poss[c.id][i].size > 1) openCells++;
  return { solved, rounds, openCells };
}

function clonePoss(spec, poss) {
  const out = {};
  for (const c of spec.cats) out[c.id] = poss[c.id].map((s) => new Set(s));
  return out;
}

// Hoeveel redeneerdiepte heeft deze puzzel nodig?
//  1 = puur doorstrepen, geen aannames
//  2 = een keer "stel dat..." en dan de tegenspraak vinden
//  3 = meer dan dat
export function logicalDepth(spec, clues, maxDepth = 3) {
  const base = propagate(spec, clues);
  if (base.solved) return 1;

  const n = spec.anchor.items.length;
  const step = (poss, depth) => {
    if (depth > maxDepth) return false;
    let progress = true;
    let cur = poss;
    while (progress) {
      progress = false;
      for (const c of spec.cats) {
        for (let i = 0; i < n; i++) {
          if (cur[c.id][i].size === 1) continue;
          for (const s of [...cur[c.id][i]]) {
            const trial = clonePoss(spec, cur);
            assign(spec, trial, c.id, i, s);
            let ch = true;
            while (ch && !isBroken(spec, trial)) {
              ch = false;
              for (const cl of clues) ch = propagateClue(spec, trial, cl) || ch;
              ch = propagateBijection(spec, trial) || ch;
            }
            if (isBroken(spec, trial)) {
              cur[c.id][i].delete(s);
              let ch2 = true;
              while (ch2 && !isBroken(spec, cur)) {
                ch2 = false;
                for (const cl of clues) ch2 = propagateClue(spec, cur, cl) || ch2;
                ch2 = propagateBijection(spec, cur) || ch2;
              }
              progress = true;
            }
          }
        }
      }
      if (isSolved(spec, cur)) return true;
    }
    return false;
  };

  return step(clonePoss(spec, base.poss), 2) ? 2 : maxDepth + 1;
}
