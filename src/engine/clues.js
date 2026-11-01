// Aanwijzingstypen. Elk type kan twee dingen:
//  - eval(clue, ctx): true | false | null  (null = nog niet te zeggen)
//    De solver gebruikt dit om partiele toestanden af te kappen.
//  - phrase(clue, ctx): Nederlandse zin, opgebouwd uit de templates
//    die de categorieen uit de content meebrengen.
//
// Een verwijzing (ref) naar iets in de puzzel is {c: categorieId, i: itemIndex}.
// Alles draait om "slots": de ankercategorie bepaalt de rijen, en elk item
// van elke andere categorie zit in precies een slot.

export const UNKNOWN = null;

// ---------------------------------------------------------------- hulpstukken

// In welk slot zit dit item? null = nog onbekend.
function slotOf(ctx, ref) {
  if (ref.c === ctx.anchorId) return ref.i;
  const col = ctx.col(ref.c);
  let open = false;
  for (let a = 0; a < ctx.n; a++) {
    if (col[a] === ref.i) return a;
    if (col[a] == null) open = true;
  }
  return open ? null : -1; // -1 kan in een volledige toewijzing niet voorkomen
}

// Zit dit item zeker niet in dit slot?
function excludedAt(ctx, ref, slot) {
  if (ref.c === ctx.anchorId) return ref.i !== slot;
  const v = ctx.col(ref.c)[slot];
  return v != null && v !== ref.i;
}

function itemName(ctx, ref) {
  return ctx.cat(ref.c).items[ref.i].name;
}

function subjectOf(ctx, ref) {
  const cat = ctx.cat(ref.c);
  return cat.subj(itemName(ctx, ref));
}

// Op een plattegrond gaat het om de ruimte waar iets zich bevindt, niet om
// het ding zelf. De ankercategorie IS de ruimte; de rest krijgt een
// omschrijving als "waar het krijtje ligt".
function placeOf(ctx, ref) {
  const cat = ctx.cat(ref.c);
  const name = itemName(ctx, ref);
  return cat.where ? cat.where(name) : name;
}

// Zet een echte ruimtenaam vooraan: dat leest veel natuurlijker.
function anchorFirst(ctx, a, b) {
  if (a.c === ctx.anchorId) return [a, b];
  if (b.c === ctx.anchorId) return [b, a];
  return [a, b];
}

// Wie wordt onderwerp en wie lijdend voorwerp? De categorie met de hoogste
// objectRank wordt het voorwerp; de ander beschrijft zichzelf via subj().
function orient(ctx, a, b) {
  const ra = ctx.cat(a.c).objectRank ?? 5;
  const rb = ctx.cat(b.c).objectRank ?? 5;
  return ra > rb ? [b, a] : [a, b];
}

function rankIn(ctx, orderedCatId, slot) {
  if (orderedCatId === ctx.anchorId) return slot;
  const v = ctx.col(orderedCatId)[slot];
  return v == null ? null : v;
}

// ------------------------------------------------------------------- typen

export const KINDS = {
  // "A hoort bij B" - zelfde slot.
  same: {
    eval(c, ctx) {
      const sa = slotOf(ctx, c.a);
      const sb = slotOf(ctx, c.b);
      if (sa != null && sa >= 0 && sb != null && sb >= 0) return sa === sb;
      if (sa != null && sa >= 0 && excludedAt(ctx, c.b, sa)) return false;
      if (sb != null && sb >= 0 && excludedAt(ctx, c.a, sb)) return false;
      return UNKNOWN;
    },
    phrase(c, ctx) {
      const [s, o] = orient(ctx, c.a, c.b);
      return ctx.cat(o.c).pos(subjectOf(ctx, s), itemName(ctx, o));
    },
  },

  // "A hoort niet bij B".
  diff: {
    eval(c, ctx) {
      const sa = slotOf(ctx, c.a);
      const sb = slotOf(ctx, c.b);
      if (sa != null && sa >= 0 && sb != null && sb >= 0) return sa !== sb;
      if (sa != null && sa >= 0 && excludedAt(ctx, c.b, sa)) return true;
      if (sb != null && sb >= 0 && excludedAt(ctx, c.a, sb)) return true;
      return UNKNOWN;
    },
    phrase(c, ctx) {
      const [s, o] = orient(ctx, c.a, c.b);
      return ctx.cat(o.c).neg(subjectOf(ctx, s), itemName(ctx, o));
    },
  },

  // "A hoort bij B of bij C" (B en C uit dezelfde categorie).
  either: {
    eval(c, ctx) {
      const r1 = KINDS.same.eval({ a: c.a, b: c.b }, ctx);
      const r2 = KINDS.same.eval({ a: c.a, b: c.c2 }, ctx);
      if (r1 === true || r2 === true) return true;
      if (r1 === false && r2 === false) return false;
      return UNKNOWN;
    },
    phrase(c, ctx) {
      const [s, o] = orient(ctx, c.a, c.b);
      const other = s === c.a ? c.c2 : c.a;
      const objs = `${itemName(ctx, o)} of ${itemName(ctx, other)}`;
      return ctx.cat(o.c).pos(subjectOf(ctx, s), objs);
    },
  },

  // "A komt eerder/lager dan B" op een geordende categorie.
  before: {
    eval(c, ctx) {
      const sa = slotOf(ctx, c.a);
      const sb = slotOf(ctx, c.b);
      if (sa == null || sb == null || sa < 0 || sb < 0) return UNKNOWN;
      if (sa === sb) return false;
      const ra = rankIn(ctx, c.o, sa);
      const rb = rankIn(ctx, c.o, sb);
      if (ra == null || rb == null) return UNKNOWN;
      return ra < rb;
    },
    phrase(c, ctx) {
      return ctx.cat(c.o).cmp(subjectOf(ctx, c.a), subjectOf(ctx, c.b));
    },
  },

  // "Tussen A en B zit precies d" op een geordende categorie.
  gap: {
    eval(c, ctx) {
      const sa = slotOf(ctx, c.a);
      const sb = slotOf(ctx, c.b);
      if (sa == null || sb == null || sa < 0 || sb < 0) return UNKNOWN;
      if (sa === sb) return false;
      const ra = rankIn(ctx, c.o, sa);
      const rb = rankIn(ctx, c.o, sb);
      if (ra == null || rb == null) return UNKNOWN;
      return Math.abs(ra - rb) === c.d;
    },
    phrase(c, ctx) {
      return ctx.cat(c.o).gap(subjectOf(ctx, c.a), subjectOf(ctx, c.b), c.d);
    },
  },

  // Plattegrond: de plekken van A en B grenzen aan elkaar (of juist niet).
  adj: {
    eval(c, ctx) {
      const sa = slotOf(ctx, c.a);
      const sb = slotOf(ctx, c.b);
      if (sa == null || sb == null || sa < 0 || sb < 0) return UNKNOWN;
      if (sa === sb) return false;
      return ctx.graph.isEdge(sa, sb) === c.positive;
    },
    phrase(c, ctx) {
      const f = c.positive ? ctx.graph.phrAdj : ctx.graph.phrNotAdj;
      const [x, y] = anchorFirst(ctx, c.a, c.b);
      return f(placeOf(ctx, x), placeOf(ctx, y));
    },
  },

  // Plattegrond: precies d deuren van elkaar.
  hops: {
    eval(c, ctx) {
      const sa = slotOf(ctx, c.a);
      const sb = slotOf(ctx, c.b);
      if (sa == null || sb == null || sa < 0 || sb < 0) return UNKNOWN;
      return ctx.graph.dist(sa, sb) === c.d;
    },
    phrase(c, ctx) {
      const [x, y] = anchorFirst(ctx, c.a, c.b);
      return ctx.graph.phrHops(placeOf(ctx, x), placeOf(ctx, y), c.d);
    },
  },

  // Plattegrond: A ligt in een plek met n buren (doodlopend, kruispunt...).
  degree: {
    eval(c, ctx) {
      const sa = slotOf(ctx, c.a);
      if (sa == null || sa < 0) return UNKNOWN;
      const d = ctx.graph.degree(sa);
      return c.cmp === 'eq' ? d === c.d : d >= c.d;
    },
    phrase(c, ctx) {
      return ctx.graph.phrDegree(subjectOf(ctx, c.a), c.d, c.cmp);
    },
  },
};

export function evalClue(clue, ctx) {
  return KINDS[clue.kind].eval(clue, ctx);
}

export function phraseClue(clue, ctx) {
  return KINDS[clue.kind].phrase(clue, ctx);
}

// Welke categorieen raakt deze aanwijzing? De solver hertest een aanwijzing
// alleen als er iets veranderde in een categorie die hij gebruikt.
export function catsTouched(clue) {
  const out = new Set();
  for (const key of ['a', 'b', 'c2']) if (clue[key]) out.add(clue[key].c);
  if (clue.o) out.add(clue.o);
  return out;
}
