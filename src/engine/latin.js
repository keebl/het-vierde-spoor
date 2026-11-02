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

// Aanwijzingen over het rooster. Rijen zijn plekken, kolommen zijn momenten.
//   voor   - in deze plek was X eerder dan Y
//   naast  - in deze plek kwamen X en Y direct na elkaar
//   niet   - X was op dat moment niet op die plek
export function evalLatin(c, grid, n) {
  if (c.soort === 'niet') {
    const v = grid[c.r][c.c];
    return v == null ? null : v !== c.s;
  }
  let ca = null;
  let cb = null;
  for (let k = 0; k < n; k++) {
    if (grid[c.r][k] === c.a) ca = k;
    if (grid[c.r][k] === c.b) cb = k;
  }
  if (ca == null || cb == null) return null;
  return c.soort === 'voor' ? ca < cb : Math.abs(ca - cb) === 1;
}

export function countLatinSolutions(grid, n, cap = 2, aanwijzingen = []) {
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
      for (const cl of aanwijzingen) if (evalLatin(cl, g, n) !== true) return;
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
      // Alleen de aanwijzingen over deze rij kunnen nu iets zeggen.
      const botst = aanwijzingen.some((cl) => cl.r === r && evalLatin(cl, g, n) === false);
      if (!botst) rec(k + 1);
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

// Bouwt een vijver van aanwijzingen die waar zijn in dit rooster.
function latinVijver(full, n, rng) {
  const vijver = [];
  for (let r = 0; r < n; r++) {
    const kolomVan = new Array(n);
    for (let k = 0; k < n; k++) kolomVan[full[r][k]] = k;
    for (let a = 0; a < n; a++) {
      for (let b = 0; b < n; b++) {
        if (a === b) continue;
        if (kolomVan[a] < kolomVan[b]) vijver.push({ soort: 'voor', a, b, r });
        if (Math.abs(kolomVan[a] - kolomVan[b]) === 1 && a < b) vijver.push({ soort: 'naast', a, b, r });
      }
    }
    for (let k = 0; k < n; k++) {
      for (let s = 0; s < n; s++) if (full[r][k] !== s) vijver.push({ soort: 'niet', s, r, c: k });
    }
  }
  return rng.shuffle(vijver);
}

export function generateLatin(n, rng, params) {
  const full = makeLatinSquare(n, rng);
  const grid = full.map((row) => row.slice());
  // Eerst zoveel mogelijk weghalen op het rooster alleen...
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

  // ...en daarna nog verder, met aanwijzingen erbij. Zo wordt het een
  // deductiepuzzel in plaats van een kaal latijns vierkant: je hebt de
  // zinnen nodig om de rest van het rooster rond te krijgen.
  const aanwijzingen = [];
  const vijver = latinVijver(full, n, rng);
  const nogOver = rng.shuffle(cells.filter(([r, c]) => grid[r][c] != null));
  let bron = 0;
  for (const [r, c] of nogOver) {
    const bewaar = grid[r][c];
    grid[r][c] = null;
    // Voeg aanwijzingen toe tot het weer vastligt, of zet de cel terug.
    let rond = countLatinSolutions(grid, n, 2, aanwijzingen).count === 1;
    while (!rond && bron < vijver.length && aanwijzingen.length < n * 2) {
      aanwijzingen.push(vijver[bron++]);
      rond = countLatinSolutions(grid, n, 2, aanwijzingen).count === 1;
    }
    // Lukt het niet met deze cel, dan zetten we hem terug en gaan verder.
    if (!rond) { grid[r][c] = bewaar; continue; }
    removed.push([r, c]);
  }

  // Aanwijzingen die je kunt missen gaan eruit.
  const gesnoeid = [];
  for (let i = 0; i < aanwijzingen.length; i++) {
    const proef = [...gesnoeid, ...aanwijzingen.slice(i + 1)];
    if (countLatinSolutions(grid, n, 2, proef).count !== 1) gesnoeid.push(aanwijzingen[i]);
  }

  // Een dienstrooster zonder een enkele aanwijzing is geen deductiepuzzel maar
  // een kaal latijns vierkant - precies waar dit speltype eerder op uitkwam.
  // Dus: haal nog een vakje weg en zet er aanwijzingen voor terug, tot er
  // zinnen bij de puzzel staan.
  if (!gesnoeid.length) {
    for (const [r, c] of rng.shuffle(cells.filter(([a, b]) => grid[a][b] != null))) {
      const bewaar = grid[r][c];
      grid[r][c] = null;
      const extra = [];
      let bron2 = 0;
      while (countLatinSolutions(grid, n, 2, extra).count !== 1 && bron2 < vijver.length) {
        extra.push(vijver[bron2++]);
      }
      if (countLatinSolutions(grid, n, 2, extra).count === 1 && extra.length) {
        // Ook hier alleen houden wat nodig is.
        for (let i = 0; i < extra.length; i++) {
          const proef = [...gesnoeid, ...extra.slice(i + 1)];
          if (countLatinSolutions(grid, n, 2, proef).count !== 1) gesnoeid.push(extra[i]);
        }
        removed.push([r, c]);
        break;
      }
      grid[r][c] = bewaar;
    }
  }
  // Lage niveaus: een paar cellen weer prijsgeven als extra houvast.
  if (params.redundancy > 0 && removed.length) {
    const back = rng.sample(removed, Math.round(removed.length * params.redundancy * 0.5));
    for (const [r, c] of back) grid[r][c] = full[r][c];
  }
  return { full, givens: grid, aanwijzingen: gesnoeid, depth: latinDepth(grid, n) };
}
