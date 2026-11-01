// Plattegronden. We bouwen ze als een doolhof op een klein raster: eerst een
// spanning tree via randomized DFS (dat geeft gangen en doodlopende einden),
// daarna een paar extra deuren erbij zodat er ook rondjes te lopen zijn.
// Gevolg: "doodlopend", "grenst aan" en "twee deuren verderop" zijn
// aanwijzingen met echte betekenis, en de kaart ziet uit als een gebouw.

export function buildGraph(n, rng) {
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const cells = [];
  for (let r = 0; r < rows && cells.length < n; r++) {
    for (let c = 0; c < cols && cells.length < n; c++) cells.push({ row: r, col: c });
  }
  const at = new Map(cells.map((p, i) => [`${p.row},${p.col}`, i]));
  const neighbours = (i) => {
    const { row, col } = cells[i];
    return [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]
      .map(([r, c]) => at.get(`${r},${c}`))
      .filter((v) => v !== undefined);
  };

  const edges = new Set();
  const key = (a, b) => (a < b ? `${a},${b}` : `${b},${a}`);
  const seen = new Set([0]);
  const stack = [0];
  while (stack.length) {
    const cur = stack[stack.length - 1];
    const open = rng.shuffle(neighbours(cur)).filter((v) => !seen.has(v));
    if (!open.length) { stack.pop(); continue; }
    const next = open[0];
    edges.add(key(cur, next));
    seen.add(next);
    stack.push(next);
  }
  // Niet-aangesloten cellen kunnen niet voorkomen op een vol raster, maar
  // bij een gedeeltelijke laatste rij wel: hang die er alsnog aan.
  for (let i = 0; i < n; i++) {
    if (seen.has(i)) continue;
    const nb = neighbours(i).find((v) => seen.has(v));
    if (nb !== undefined) { edges.add(key(i, nb)); seen.add(i); }
  }
  const extra = Math.max(1, Math.floor(n / 4));
  const candidates = rng.shuffle(
    cells.flatMap((_, i) => neighbours(i).map((j) => key(i, j)))
  );
  let added = 0;
  for (const k of candidates) {
    if (added >= extra) break;
    if (!edges.has(k)) { edges.add(k); added++; }
  }

  const adjList = Array.from({ length: n }, () => []);
  for (const k of edges) {
    const [a, b] = k.split(',').map(Number);
    adjList[a].push(b);
    adjList[b].push(a);
  }

  // Afstandsmatrix: klein genoeg om gewoon n keer BFS te doen.
  const distM = Array.from({ length: n }, () => new Array(n).fill(Infinity));
  for (let s = 0; s < n; s++) {
    distM[s][s] = 0;
    const q = [s];
    while (q.length) {
      const cur = q.shift();
      for (const nb of adjList[cur]) {
        if (distM[s][nb] === Infinity) { distM[s][nb] = distM[s][cur] + 1; q.push(nb); }
      }
    }
  }

  return {
    n,
    rows,
    cols,
    layout: cells,
    edgeList: [...edges].map((k) => k.split(',').map(Number)),
    isEdge: (a, b) => edges.has(key(a, b)),
    dist: (a, b) => distM[a][b],
    degree: (a) => adjList[a].length,
    diameter: Math.max(...distM.flat().filter((v) => v !== Infinity)),
  };
}
