// De keuring in één keer: alle toetsen achter elkaar, en altijd allemaal.
//
// Hier stond eerst een ketting van `&&` in package.json. Dat leek netjes,
// maar het verbergt werk: valt toets drie om, dan draaien vier tot en met
// zeven niet meer, en je denkt dat je één fout hebt terwijl er tachtig
// liggen. Dat is precies één keer gebeurd - een budgetfout in check-regels
// hield de icoontoets tegen, en die had 74 woorden zonder plaatje te
// melden. Een vangnet dat bij de eerste scheur stopt met vangen is geen
// vangnet.
//
// Dus: elke toets draait, wat de vorige ook deed, en onderaan staat in één
// tabel wie er omviel. De exitcode van dit script is het oordeel.

import { spawnSync } from 'node:child_process';

const TOETSEN = [
  ['de motor', 'check.mjs', ['2']],
  ['de bibliotheek', 'check-catalog.mjs', []],
  ['de veegronde', 'check-regels.mjs', ['2']],
  ['het AI-vangnet', 'check-ai-guard.mjs', []],
  ['de weggevers', 'check-weggevers.mjs', []],
  ['de iconen', 'check-iconen.mjs', []],
  ['de kamers', 'check-kamers.mjs', []],
];

// `--snel` slaat de vier toetsen over die puzzels bouwen; die kosten samen
// minuten. Wat overblijft draait in een seconde en vangt verreweg de meeste
// fouten in de inhoud - een vergeten icoon, een kamernaam die niet bij zijn
// vloer past, een tekening die niet bestaat, een dubbele sleutel in een
// tabel. Bedoeld om tussendoor te draaien; voor een oordeel draai je de hele
// keuring.
const SNEL = process.argv.includes('--snel');
const ZWAAR = new Set(['de motor', 'de bibliotheek', 'de veegronde', 'de weggevers']);

const uitslag = [];

for (const [naam, script, args] of TOETSEN) {
  if (SNEL && ZWAAR.has(naam)) continue;
  console.log(`\n${'='.repeat(64)}\n== ${naam}\n${'='.repeat(64)}`);
  const begin = Date.now();
  const r = spawnSync(process.execPath, [new URL(script, import.meta.url).pathname, ...args], {
    stdio: 'inherit',
  });
  const code = r.status ?? 1;
  uitslag.push([naam, code, Date.now() - begin]);
}

console.log(`\n${'='.repeat(64)}\n== oordeel\n${'='.repeat(64)}`);
for (const [naam, code, ms] of uitslag) {
  console.log(`${code === 0 ? 'goed  ' : 'FOUT  '} ${naam.padEnd(20)} ${(ms / 1000).toFixed(1)}s`);
}

const omgevallen = uitslag.filter(([, code]) => code !== 0);
console.log(
  omgevallen.length
    ? `\n${omgevallen.length} van de ${uitslag.length} toetsen viel om: ${omgevallen.map(([n]) => n).join(', ')}`
    : `\nalle ${uitslag.length} toetsen staan`
);
console.log(`volledige keuring exit=${omgevallen.length ? 1 : 0}`);
process.exit(omgevallen.length ? 1 : 0);
