// De speler. Houdt de markeringen van de speler bij, tekent het bord dat bij
// de mechaniek hoort, en kan controleren, hinten en de oplossing geven.

import { el, renderMatrix, renderMap, renderLatin, cellKey } from './boards.js';
import { loadProgress, saveProgress, clearProgress } from './state.js';
import { MECHANIC_BY_ID } from '../content/assignments.js';

export function renderPlayer(puzzle, mount) {
  const saved = loadProgress(puzzle.id) ?? {};
  const state = {
    marks: saved.marks ?? (puzzle.kind === 'latin' ? {} : emptyMarks(puzzle)),
    struck: new Set(saved.struck ?? []),
    note: null,
    wrong: new Set(),
    solved: !!saved.solved,
  };

  const persist = () => {
    saveProgress(puzzle.id, {
      marks: state.marks,
      struck: [...state.struck],
      solved: state.solved,
      titel: puzzle.title,
    });
  };

  mount.replaceChildren();
  mount.append(head(puzzle));

  const boards = el('div', { class: 'boards' });
  const notes = el('div');
  const clueCol = el('div');

  const play = el('div', { class: 'play' }, [clueCol, el('div', {}, [boards, notes])]);
  mount.append(play);

  const draw = () => {
    clueCol.replaceChildren(cluePanel(puzzle, state, draw, persist));
    boards.replaceChildren(...boardNodes(puzzle, state, onCell));
    notes.replaceChildren(toolbar(puzzle, state, actions), noteNode(state));
  };

  function onCell(...args) {
    if (puzzle.kind === 'latin') cycleLatin(puzzle, state, ...args);
    else cycleMark(puzzle, state, ...args);
    state.wrong = new Set();
    state.note = null;
    if (isSolved(puzzle, state)) {
      state.solved = true;
      state.note = { kind: 'good', text: `Opgelost. Het antwoord: ${puzzle.question.answer}.` };
    }
    persist();
    draw();
  }

  const actions = {
    check() {
      const { wrong, filled, total } = inspect(puzzle, state);
      state.wrong = wrong;
      if (wrong.size) {
        state.note = { kind: 'bad', text: wrong.size === 1 ? 'Een markering klopt niet. Die staat omlijnd.' : `${wrong.size} markeringen kloppen niet. Ze staan omlijnd.` };
      } else if (filled < total) {
        state.note = { kind: 'ok', text: `Tot hier klopt alles. Nog ${total - filled} van ${total} in te vullen.` };
      } else {
        state.solved = true;
        state.note = { kind: 'good', text: `Helemaal goed. Het antwoord: ${puzzle.question.answer}.` };
      }
      persist();
      draw();
    },
    hint() {
      const hint = nextHint(puzzle, state);
      state.wrong = new Set();
      state.note = hint
        ? { kind: 'ok', text: hint.text }
        : { kind: 'ok', text: 'Er is niets meer te hinten: het bord is vol.' };
      if (isSolved(puzzle, state)) state.solved = true;
      persist();
      draw();
    },
    reveal() {
      fillSolution(puzzle, state);
      state.wrong = new Set();
      state.solved = true;
      state.note = { kind: 'ok', text: `De oplossing staat op het bord. Het antwoord: ${puzzle.question.answer}.` };
      persist();
      draw();
    },
    reset() {
      state.marks = puzzle.kind === 'latin' ? {} : emptyMarks(puzzle);
      state.struck = new Set();
      state.wrong = new Set();
      state.solved = false;
      state.note = null;
      clearProgress(puzzle.id);
      draw();
    },
    async share() {
      const url = location.href;
      try {
        await navigator.clipboard.writeText(url);
        state.note = { kind: 'ok', text: 'Link gekopieerd. Dezelfde link geeft altijd exact deze puzzel.' };
      } catch {
        state.note = { kind: 'ok', text: url };
      }
      draw();
    },
  };

  draw();
}

// ----------------------------------------------------------------- kop

function head(puzzle) {
  const mech = MECHANIC_BY_ID.get(puzzle.mechaniek);
  const deel = (tekst) => el('span', { text: tekst });
  const sep = () => el('span', { class: 'sep', text: '·' });

  const crumbs = el('div', { class: 'crumbs' }, [
    el('a', { href: `#/puzzels?wereld=${puzzle.world.id}`, text: `${puzzle.world.icon} ${puzzle.world.name}` }),
    sep(),
    deel(mech?.name ?? puzzle.mechaniek),
    sep(),
    deel(`${puzzle.niveauLabel} (${puzzle.niveau}/5)`),
    sep(),
    deel(puzzle.depth === 1 ? 'doorstrepen volstaat' : 'aanname nodig'),
  ]);

  return el('div', { class: 'puzzle-head' }, [
    crumbs,
    el('h1', { text: puzzle.title }),
    el('p', { class: 'intro', text: puzzle.intro }),
    el('div', { class: 'question' }, [
      el('span', { class: 'label', text: 'De vraag' }),
      el('b', { text: puzzle.question.text }),
    ]),
  ]);
}

function cluePanel(puzzle, state, draw, persist) {
  if (puzzle.kind === 'latin') {
    return el('div', {}, [
      el('p', { class: 'label', text: 'Hoe dit werkt' }),
      el('p', {
        class: 'row-sub',
        text: 'Elke naam komt in elke rij precies een keer voor, en in elke kolom precies een keer. De grijze vakjes staan vast. Klik een leeg vakje om er namen door te lopen.',
      }),
      el('p', { class: 'legend', text: 'Het omlijnde vakje is waar de vraag over gaat.' }),
      swatches(puzzle),
    ]);
  }

  const list = el('div', { class: 'clues' });
  for (const clue of puzzle.clues) {
    const done = state.struck.has(clue.n);
    const btn = el('button', {
      class: 'clue',
      type: 'button',
      'aria-pressed': String(done),
    }, [
      el('span', { class: 'clue-n', text: `${clue.n}.` }),
      el('span', { class: 'clue-text', text: clue.text }),
    ]);
    btn.addEventListener('click', () => {
      if (done) state.struck.delete(clue.n);
      else state.struck.add(clue.n);
      persist();
      draw();
    });
    list.append(btn);
  }

  return el('div', {}, [
    el('p', { class: 'label', text: `Aanwijzingen (${puzzle.clues.length})` }),
    list,
    el('p', { class: 'legend', text: 'Klik een aanwijzing weg als je hem hebt gebruikt.' }),
  ]);
}

function swatches(puzzle) {
  const box = el('div', { class: 'swatches' });
  puzzle.symbols.forEach((s) => box.append(el('span', { class: 'swatch', text: s })));
  return box;
}

function boardNodes(puzzle, state, onCell) {
  if (puzzle.kind === 'latin') {
    return [renderLatin(puzzle, state.marks, onCell, state.wrong)];
  }
  const nodes = [];
  if (puzzle.graph) nodes.push(renderMap(puzzle));
  for (const cat of puzzle.cats) {
    nodes.push(renderMatrix(puzzle, cat, state.marks[cat.id] ?? {}, onCell, state.wrong));
  }
  nodes.push(el('p', {
    class: 'legend',
    text: 'Klik een vakje om te wisselen tussen leeg, kruis en vink. Een vink streept de rest van zijn rij en kolom automatisch door.',
  }));
  return nodes;
}

function toolbar(puzzle, state, actions) {
  const bar = el('div', { class: 'toolbar' });
  const add = (label, fn, primary) => {
    const b = el('button', { class: primary ? 'btn btn-primary' : 'btn', type: 'button', text: label });
    b.addEventListener('click', fn);
    bar.append(b);
  };
  add('Controleer', actions.check, true);
  add('Hint', actions.hint);
  add('Oplossing', actions.reveal);
  add('Opnieuw', actions.reset);
  add('Link kopieren', actions.share);
  return bar;
}

function noteNode(state) {
  if (!state.note) return el('div');
  const cls = state.note.kind === 'good' ? 'note note-good' : state.note.kind === 'bad' ? 'note note-bad' : 'note';
  return el('div', { class: cls, text: state.note.text });
}

// -------------------------------------------------------- markeringen

function emptyMarks(puzzle) {
  const marks = {};
  for (const cat of puzzle.cats) marks[cat.id] = {};
  return marks;
}

function cycleMark(puzzle, state, catId, slot, item) {
  const n = puzzle.anchor.items.length;
  const cat = (state.marks[catId] ??= {});
  const key = cellKey(slot, item);
  const next = { '': 'no', no: 'yes', yes: '' }[cat[key] ?? ''];
  cat[key] = next;
  if (next === '') delete cat[key];
  if (next === 'yes') {
    for (let i = 0; i < n; i++) if (i !== item) cat[cellKey(slot, i)] = 'no';
    for (let s = 0; s < n; s++) if (s !== slot) cat[cellKey(s, item)] = 'no';
  }
}

function cycleLatin(puzzle, state, r, c) {
  const n = puzzle.rows.length;
  const key = `${r},${c}`;
  const cur = state.marks[key];
  const next = cur == null ? 0 : cur + 1 >= n ? null : cur + 1;
  if (next == null) delete state.marks[key];
  else state.marks[key] = next;
}

function fillSolution(puzzle, state) {
  if (puzzle.kind === 'latin') {
    for (let r = 0; r < puzzle.rows.length; r++) {
      for (let c = 0; c < puzzle.rows.length; c++) {
        if (puzzle.givens[r][c] == null) state.marks[`${r},${c}`] = puzzle.full[r][c];
      }
    }
    return;
  }
  state.marks = emptyMarks(puzzle);
  const n = puzzle.anchor.items.length;
  for (const cat of puzzle.cats) {
    for (let slot = 0; slot < n; slot++) {
      const item = puzzle.solution[cat.id][slot];
      for (let i = 0; i < n; i++) state.marks[cat.id][cellKey(slot, i)] = i === item ? 'yes' : 'no';
    }
  }
}

// Wat staat er fout, en hoe vol is het bord?
function inspect(puzzle, state) {
  const wrong = new Set();
  let filled = 0;
  let total = 0;
  if (puzzle.kind === 'latin') {
    const n = puzzle.rows.length;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (puzzle.givens[r][c] != null) continue;
        total++;
        const v = state.marks[`${r},${c}`];
        if (v == null) continue;
        filled++;
        if (v !== puzzle.full[r][c]) wrong.add(`${r},${c}`);
      }
    }
    return { wrong, filled, total };
  }
  const n = puzzle.anchor.items.length;
  for (const cat of puzzle.cats) {
    const marks = state.marks[cat.id] ?? {};
    for (let slot = 0; slot < n; slot++) {
      total++;
      const correct = puzzle.solution[cat.id][slot];
      let picked = null;
      for (let i = 0; i < n; i++) if (marks[cellKey(slot, i)] === 'yes') picked = i;
      if (picked == null) {
        // een kruis op het juiste vakje is ook fout
        if (marks[cellKey(slot, correct)] === 'no') wrong.add(`${cat.id}:${cellKey(slot, correct)}`);
        continue;
      }
      filled++;
      if (picked !== correct) wrong.add(`${cat.id}:${cellKey(slot, picked)}`);
    }
  }
  return { wrong, filled, total };
}

function isSolved(puzzle, state) {
  const { wrong, filled, total } = inspect(puzzle, state);
  return wrong.size === 0 && filled === total;
}

// De eerstvolgende stap verklappen, met de aanwijzing die erover gaat.
function nextHint(puzzle, state) {
  if (puzzle.kind === 'latin') {
    const n = puzzle.rows.length;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (puzzle.givens[r][c] != null) continue;
        if (state.marks[`${r},${c}`] === puzzle.full[r][c]) continue;
        state.marks[`${r},${c}`] = puzzle.full[r][c];
        return { text: `In ${puzzle.rows[r]} tijdens ${puzzle.cols[c]}: ${puzzle.symbols[puzzle.full[r][c]]}.` };
      }
    }
    return null;
  }

  const n = puzzle.anchor.items.length;
  const shown = (puzzle._rawClues ?? []).filter((c) => !c.intro);
  for (const cat of puzzle.cats) {
    const marks = (state.marks[cat.id] ??= {});
    for (let slot = 0; slot < n; slot++) {
      const correct = puzzle.solution[cat.id][slot];
      if (marks[cellKey(slot, correct)] === 'yes') continue;
      for (let i = 0; i < n; i++) marks[cellKey(slot, i)] = i === correct ? 'yes' : 'no';
      for (let s = 0; s < n; s++) if (s !== slot) marks[cellKey(s, correct)] = 'no';

      const idx = shown.findIndex((c) =>
        ['a', 'b', 'c2'].some((k) => c[k] && c[k].c === cat.id && c[k].i === correct)
      );
      const waar = `${puzzle.anchor.items[slot]}: ${cat.items[correct]}.`;
      return {
        text: idx >= 0 ? `${waar} Dat volgt uit aanwijzing ${idx + 1}.` : waar,
      };
    }
  }
  return null;
}
