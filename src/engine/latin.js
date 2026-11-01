// Het getallenraster: rijen zijn plekken, kolommen zijn tijdstippen, en in
// elke cel staat precies een persoon. Iedereen komt een keer per plek en een
// keer per tijdstip voor - een latijns vierkant dus, geen sudoku: er zijn
// geen blokken van 3x3, en de "cijfers" zijn mensen.

export function makeLatinSquare(n, rng) {
  const base = Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => (r + c) % n)
  );
  const rowOrder = rng.shuffle([...Array(n).keys()]);
  const colOrder = rng.shuffle([...Array(n).keys()]);
  const symOrder = rng.shuffle([...Array(n).keys()]);
  return rowOrder.map((r) => colOrder.map((c) => symOrder[base[r][c]]));
}

export function countLatinSolutions(grid, n, cap = 2) {
  const g = grid.map((row) => row.slice());
  const rowUsed = Array.from({ length: n }, () => new Set());
  const colUsed = Array.from({ length: n }, () => new Set());
  const blanks = [];
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (g[r][c] == null) blanks.push([r, c]);
      else { rowUsed[r].add(g[r][c]); colUsed[c].add(g[r][c]); }
    }
  }
  let found = 0;
  let first = null;
  const rec = (k) => {
    if (k === blanks.length) {
      found++;
      if (!first) first = g.map((row) => row.slice());
      return;
    }
    // Pak steeds de cel met de minste mogelijkheden: dat kapt de boom snel af.
    let bi = k, bCount = Infinity, bCands = null;
    for (let i = k; i < blanks.length; i++) {
      const [r, c] = blanks[i];
      const cands = [];
      for (let v = 0; v < n; v++) if (!rowUsed[r].has(v) && !colUsed[c].has(v)) cands.push(v);
      if (cands.length < bCount) { bCount = cands.length; bi = i; bCands = cands; }
      if (bCount === 0) break;
    }
    if (bCount === 0) return;
    [blanks[k], blanks[bi]] = [blanks[bi], blanks[k]];
    const [r, c] = blanks[k];
    for (const v of bCands) {
      g[r][c] = v; rowUsed[r].add(v); colUsed[c].add(v);
      rec(k + 1);
      g[r][c] = null; rowUsed[r].delete(v); colUsed[c].delete(v);
      if (found >= cap) break;
    }
    [blanks[k], blanks[bi]] = [blanks[bi], blanks[k]];
  };
  rec(0);
  return { count: found, solution: first };
}

// Mens-achtig oplossen: alleen "deze cel kan maar een ding zijn" en
// "dit symbool kan in deze rij/kolom maar op een plek". Lukt dat volledig,
// dan is de puzzel recht-toe-recht-aan (diepte 1).
export function latinDepth(grid, n) {
  const cand = Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => {
      if (grid[r][c] != null) return new Set([grid[r][c]]);
      return new Set([...Array(n).keys()]);
    })
  );
  const prune = () => {
    let changed = true;
    while (changed) {
      changed = false;
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (cand[r][c].size !== 1) continue;
          const [v] = cand[r][c];
          for (let k = 0; k < n; k++) {
            if (k !== c && cand[r][k].delete(v)) changed = true;
            if (k !== r && cand[k][c].delete(v)) changed = true;
          }
        }
      }
      for (let r = 0; r < n; r++) {
        for (let v = 0; v < n; v++) {
          const spots = [];
          for (let c = 0; c < n; c++) if (cand[r][c].has(v)) spots.push(c);
          if (spots.length === 1 && cand[r][spots[0]].size > 1) {
            cand[r][spots[0]] = new Set([v]); changed = true;
          }
        }
      }
      for (let c = 0; c < n; c++) {
        for (let v = 0; v < n; v++) {
          const spots = [];
          for (let r = 0; r < n; r++) if (cand[r][c].has(v)) spots.push(r);
          if (spots.length === 1 && cand[spots[0]][c].size > 1) {
            cand[spots[0]][c] = new Set([v]); changed = true;
          }
        }
      }
    }
  };
  prune();
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (cand[r][c].size !== 1) return 2;
  return 1;
}

export function generateLatin(n, rng, params) {
  const full = makeLatinSquare(n, rng);
  const grid = full.map((row) => row.slice());
  const cells = rng.shuffle(
    Array.from({ length: n * n }, (_, i) => [Math.floor(i / n), i % n])
  );
  const removed = [];
  for (const [r, c] of cells) {
    const keep = grid[r][c];
    grid[r][c] = null;
    if (countLatinSolutions(grid, n).count === 1) {
      removed.push([r, c]);
    } else {
      grid[r][c] = keep;
    }
  }
  // Lage niveaus: een paar cellen weer prijsgeven als extra houvast.
  if (params.redundancy > 0 && removed.length) {
    const back = rng.sample(removed, Math.round(removed.length * params.redundancy * 0.5));
    for (const [r, c] of back) grid[r][c] = full[r][c];
  }
  return { full, givens: grid, depth: latinDepth(grid, n) };
}
