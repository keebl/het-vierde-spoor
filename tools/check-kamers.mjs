// Elke plek moet weten wat voor soort ruimte het is, en elk meubelstuk dat
// bij zo'n soort hoort moet een icoon hebben dat bestaat. Zonder deze toets
// krijgt een nieuwe plek stilzwijgend een standaardvloer en willekeurig
// meubilair - precies het soort fout dat je pas in een puzzel ziet.

import { WORLDS } from '../src/content/worlds.js';
import { SOORT_VAN, VLOER_VAN, MEUBELS_VAN } from '../src/content/kamersoorten.js';
import { ICONS } from '../src/ui/icons.js';

const plekken = new Set(WORLDS.flatMap((w) => w.places));
const zonderSoort = [...plekken].filter((p) => !SOORT_VAN[p]);
const overbodig = Object.keys(SOORT_VAN).filter((p) => !plekken.has(p));
const soorten = new Set(Object.values(SOORT_VAN));
const zonderVloer = [...soorten].filter((s) => !VLOER_VAN[s]);
const zonderMeubels = [...soorten].filter((s) => !MEUBELS_VAN[s]?.length);
const kapotteIconen = Object.entries(MEUBELS_VAN).flatMap(([soort, lijst]) =>
  lijst.filter(([, icoon]) => !ICONS[icoon]).map(([naam, icoon]) => `${soort}/${naam} -> ${icoon}`)
);

for (const p of zonderSoort) console.log(`GEEN SOORT        ${p}`);
for (const p of overbodig) console.log(`OVERBODIG         ${p}`);
for (const s of zonderVloer) console.log(`GEEN VLOER        ${s}`);
for (const s of zonderMeubels) console.log(`GEEN MEUBELS      ${s}`);
for (const k of kapotteIconen) console.log(`ICOON BESTAAT NIET  ${k}`);

console.log('');
console.log(`plekken            ${plekken.size}, allemaal met een soort: ${zonderSoort.length === 0}`);
console.log(`soorten ruimte     ${soorten.size}, elk met vloer en meubilair`);
console.log(`meubelstukken      ${Object.values(MEUBELS_VAN).flat().length}`);

const fouten = zonderSoort.length + overbodig.length + zonderVloer.length + zonderMeubels.length + kapotteIconen.length;
console.log(fouten ? `\n${fouten} FOUTEN` : '\nelke ruimte weet wat hij is');
process.exit(fouten ? 1 : 0);
