// Elk woord in de content moet een eigen, met de hand gekozen icoon hebben.
// Deze toets faalt zodra dat niet zo is - dus zodra iemand content toevoegt
// zonder icoon, of naar een icoon wijst dat niet bestaat. Zo hoeft niemand
// puzzel voor puzzel te controleren of de plaatjes kloppen.

import { WORLDS } from '../src/content/worlds.js';
import { ICOON_VAN } from '../src/content/iconen.js';
import { ICONS } from '../src/ui/icons.js';

// personenXL en plekkenXL zijn de namen en kamers die pas meedoen op het
// bord van zestien bij zestien. Ze staan apart omdat ze de trekking van de
// bestaande puzzels niet mogen verschuiven, maar een icoon hebben ze net zo
// hard nodig - en zonder ze hier zou de keuring hun iconen overbodig noemen.
const VELDEN = ['persons', 'personenXL', 'objects', 'places', 'plekkenXL', 'times', 'hidden', 'meubels'];

const woorden = new Set();
for (const w of WORLDS) for (const v of VELDEN) for (const x of (w[v] ?? [])) woorden.add(x);

const zonderIcoon = [...woorden].filter((x) => !ICOON_VAN[x]);
const kapot = Object.entries(ICOON_VAN).filter(([, icoon]) => !ICONS[icoon]);
const ongebruikt = Object.keys(ICOON_VAN).filter((x) => !woorden.has(x));

for (const x of zonderIcoon) console.log(`GEEN ICOON   ${x}`);
for (const [woord, icoon] of kapot) console.log(`ICOON BESTAAT NIET   ${woord} -> ${icoon}`);
for (const x of ongebruikt) console.log(`OVERBODIG    ${x} (staat in de koppeling maar niet in de content)`);

const gebruikt = new Set(Object.values(ICOON_VAN));
console.log('');
console.log(`woorden in de content   ${woorden.size}`);
console.log(`gekoppeld               ${woorden.size - zonderIcoon.length}`);
console.log(`getekende iconen        ${Object.keys(ICONS).length}, waarvan ${gebruikt.size} in gebruik`);

const fouten = zonderIcoon.length + kapot.length + ongebruikt.length;
console.log(fouten ? `\n${fouten} FOUTEN` : '\nelk woord heeft zijn eigen icoon');
process.exit(fouten ? 1 : 0);
