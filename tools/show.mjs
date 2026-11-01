// Laat een puzzel zien zoals de speler hem leest. Voor het controleren van
// de Nederlandse formulering.
import { buildPuzzle } from '../src/puzzle.js';

const [opdracht = 'dader', mechaniek = 'grid', wereld = 'noir', niveau = '3', seed = 'demo-1'] = process.argv.slice(2);
const p = buildPuzzle({ opdracht, wereld, mechaniek, niveau: Number(niveau), seed });

console.log(`\n${'='.repeat(70)}`);
console.log(`${p.world.icon}  ${p.title}   [${p.niveauLabel}, ${p.depth === 1 ? 'doorstrepen' : 'aanname nodig'}]`);
console.log('='.repeat(70));
console.log(`\n${p.intro}\n`);
if (p.kind === 'latin') {
  console.log(`Plekken:  ${p.rows.join(' | ')}`);
  console.log(`Momenten: ${p.cols.join(' | ')}`);
  console.log(`Namen:    ${p.symbols.join(' | ')}\n`);
  for (let r = 0; r < p.rows.length; r++) {
    console.log(
      p.rows[r].padEnd(26) +
        p.givens[r].map((v) => (v == null ? '  ·  ' : ` ${v + 1}   `)).join('')
    );
  }
} else {
  console.log(`${p.anchor.name}: ${p.anchor.items.join(' | ')}`);
  for (const c of p.cats) console.log(`${c.name}: ${c.items.join(' | ')}`);
  if (p.graph) {
    console.log(`\nPlattegrond (${p.graph.n} ruimtes, ${p.graph.edges.length} doorgangen):`);
    for (const [a, b] of p.graph.edges) console.log(`   ${p.anchor.items[a]} <-> ${p.anchor.items[b]}`);
  }
  console.log('\nAanwijzingen:');
  for (const c of p.clues) console.log(`  ${String(c.n).padStart(2)}. ${c.text}`);
}
console.log(`\nVRAAG: ${p.question.text}`);
console.log(`ANTWOORD: ${p.question.answer}\n`);
