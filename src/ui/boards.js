// De speelborden. Drie varianten, een gedeelde afspraak: een bord krijgt de
// puzzel plus de markeringen van de speler, en meldt elke wijziging terug.

const el = (tag, attrs = {}, kids = []) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (v !== null && v !== undefined) node.setAttribute(k, v);
  }
  for (const kid of [].concat(kids)) if (kid) node.append(kid);
  return node;
};

export const cellKey = (slot, item) => `${slot},${item}`;

// ------------------------------------------------------- kruisjesraster

// Een matrix per categorie: rijen zijn de ankeritems, kolommen de items van
// die categorie. Klikken loopt door leeg -> kruis -> vink. Een vink zet de
// rest van zijn rij en kolom automatisch op kruis, want dat volgt altijd.
export function renderMatrix(puzzle, cat, marks, onChange, wrong) {
  const n = puzzle.anchor.items.length;
  const table = el('table', { class: 'grid' });
  const head = el('tr', {}, [el('th', { class: 'corner' })]);
  for (const item of cat.items) head.append(el('th', { class: 'col-head', text: item }));
  table.append(el('thead', {}, head));

  const body = el('tbody');
  for (let slot = 0; slot < n; slot++) {
    const row = el('tr', {}, [el('th', { scope: 'row', text: puzzle.anchor.items[slot] })]);
    for (let item = 0; item < n; item++) {
      const key = cellKey(slot, item);
      const state = marks[key] ?? '';
      const btn = el('button', {
        class: 'mark',
        type: 'button',
        'data-state': state,
        'data-wrong': wrong?.has(`${cat.id}:${key}`) ? '1' : null,
        'aria-label': `${puzzle.anchor.items[slot]} / ${cat.items[item]}`,
        text: state === 'yes' ? '✔' : state === 'no' ? '✕' : '',
      });
      btn.addEventListener('click', () => onChange(cat.id, slot, item));
      row.append(el('td', { class: 'cell' }, btn));
    }
    body.append(row);
  }
  table.append(body);

  return el('div', {}, [
    el('p', { class: 'label', text: cat.name }),
    el('div', { class: 'board-wrap' }, table),
  ]);
}

// -------------------------------------------------------- plattegrond

// De kaart is om te lezen, niet om in te vullen: de ruimtes staan op hun
// rasterplek, de doorgangen ertussen. Invullen gebeurt in de matrixen.
export function renderMap(puzzle) {
  const g = puzzle.graph;
  const W = 150;
  const H = 86;
  const GAP = 34;
  const width = g.cols * W + (g.cols - 1) * GAP + 20;
  const height = g.rows * H + (g.rows - 1) * GAP + 20;
  const x = (c) => 10 + c * (W + GAP);
  const y = (r) => 10 + r * (H + GAP);
  const cx = (i) => x(g.layout[i].col) + W / 2;
  const cy = (i) => y(g.layout[i].row) + H / 2;

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Plattegrond met de ruimtes en hun doorgangen');

  for (const [a, b] of g.edges) {
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', cx(a));
    line.setAttribute('y1', cy(a));
    line.setAttribute('x2', cx(b));
    line.setAttribute('y2', cy(b));
    line.setAttribute('class', 'door');
    svg.append(line);
  }

  g.layout.forEach((pos, i) => {
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', x(pos.col));
    rect.setAttribute('y', y(pos.row));
    rect.setAttribute('width', W);
    rect.setAttribute('height', H);
    rect.setAttribute('rx', 9);
    rect.setAttribute('class', 'room-box');
    svg.append(rect);

    const num = document.createElementNS(ns, 'text');
    num.setAttribute('x', x(pos.col) + 11);
    num.setAttribute('y', y(pos.row) + 21);
    num.setAttribute('class', 'room-index');
    num.textContent = i + 1;
    svg.append(num);

    // Lange namen over twee regels.
    const words = puzzle.anchor.items[i].split(' ');
    const lines = [];
    let cur = '';
    for (const w of words) {
      if ((cur + ' ' + w).trim().length > 17) { lines.push(cur.trim()); cur = w; }
      else cur += ' ' + w;
    }
    if (cur.trim()) lines.push(cur.trim());
    lines.slice(0, 3).forEach((text, k) => {
      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', x(pos.col) + 11);
      label.setAttribute('y', y(pos.row) + 42 + k * 15);
      label.setAttribute('class', 'room-label');
      label.textContent = text;
      svg.append(label);
    });
  });

  return el('figure', { class: 'map-figure' }, svg);
}

// ------------------------------------------------------ getallenraster

export function renderLatin(puzzle, marks, onChange, wrong) {
  const n = puzzle.rows.length;
  const table = el('table', { class: 'latin' });
  const head = el('tr', {}, [el('th', { text: '' })]);
  for (const c of puzzle.cols) head.append(el('th', { text: c }));
  table.append(el('thead', {}, head));

  const body = el('tbody');
  const [tr, tc] = puzzle.question.cell;
  for (let r = 0; r < n; r++) {
    const row = el('tr', {}, [el('th', { scope: 'row', text: puzzle.rows[r] })]);
    for (let c = 0; c < n; c++) {
      const given = puzzle.givens[r][c];
      const key = `${r},${c}`;
      const val = given != null ? given : marks[key];
      const btn = el('button', {
        class: 'latin-cell',
        type: 'button',
        'data-locked': given != null ? '1' : null,
        'data-target': r === tr && c === tc ? '1' : null,
        'data-wrong': wrong?.has(key) ? '1' : null,
        'aria-label': `${puzzle.rows[r]}, ${puzzle.cols[c]}`,
        text: val != null ? puzzle.symbols[val] : '·',
      });
      if (given == null) btn.addEventListener('click', () => onChange(r, c));
      row.append(el('td', { class: 'cell' }, btn));
    }
    body.append(row);
  }
  table.append(body);
  return el('div', { class: 'board-wrap' }, table);
}

export { el };
