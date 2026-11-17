// Laat een puzzel zien zoals de speler hem leest. Voor het controleren van
// de Nederlandse formulering.
import { buildPuzzle } from '../src/puzzle.js';
import { aanwijzingenPerPersoon } from '../src/aanwijzingen.js';

const [opdracht = 'dader', mechaniek = 'grid', wereld = 'noir', niveau = '3', seed = 'demo-1'] = process.argv.slice(2);
const p = buildPuzzle({ opdracht, wereld, mechaniek, niveau: Number(niveau), seed });

console.log(`\n${'='.repeat(70)}`);
console.log(`${p.world.icon}  ${p.title}   [${p.niveauLabel}, ${p.depth === 1 ? 'doorstrepen' : 'aanname nodig'}]`);
console.log('='.repeat(70));
console.log(`\n${p.intro}\n`);
if (p.kind === 'kamer') {
  // Het kamerbord, en daaronder de aanwijzingen per naam zoals de speler ze
  // ziet: een aanwijzing over twee mensen staat bij allebei.
  const r = p._rooster;
  for (let rij = 0; rij < r.n; rij++) {
    let regel = '  ';
    for (let k = 0; k < r.n; k++) {
      const cel = rij * r.n + k;
      const wie = p.oplossing.indexOf(cel);
      regel += wie >= 0 ? p.personen[wie].charAt(0) : r.meubelOp[cel] != null ? '#' : '.';
      regel += String.fromCharCode(97 + r.kamerVan[cel]) + ' ';
    }
    console.log(regel);
  }
  console.log(`\nKamers: ${p.kamerNamen.map((n, i) => `${String.fromCharCode(97 + i)}=${n}`).join(', ')}`);
  console.log('\nAanwijzingen:');
  for (const c of p.clues) console.log(`  ${String(c.n).padStart(2)}. [${c.kind}] ${c.text}`);
  const { perPersoon, algemeen } = aanwijzingenPerPersoon(p);
  console.log('\nPer naam:');
  perPersoon.forEach((lijst, i) => {
    const wie = i === p.slachtofferIdx ? `${p.personen[i]} (slachtoffer)` : p.personen[i];
    console.log(`  ${wie.padEnd(26)} ${lijst.length}`);
  });
  console.log(`  ${'Iedereen'.padEnd(26)} ${algemeen.length}`);
} else if (p.kind === 'latin') {
  console.log(`Plekken:  ${p.rows.join(' | ')}`);
  console.log(`Momenten: ${p.cols.join(' | ')}`);
  console.log(`Namen:    ${p.symbols.join(' | ')}\n`);
  for (let r = 0; r < p.rows.length; r++) {
    console.log(
      p.rows[r].padEnd(26) +
        p.givens[r].map((v) => (v == null ? '  ·  ' : ` ${v + 1}   `)).join('')
    );
  }
  if (p.clues.length) {
    console.log('\nAanwijzingen:');
    for (const c of p.clues) console.log(`  ${String(c.n).padStart(2)}. ${c.text}`);
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
