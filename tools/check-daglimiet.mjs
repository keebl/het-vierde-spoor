// Toetst de daglimiet voor betaalde AI-aanroepen (server/daglimiet.mjs):
// het plafond houdt, een nieuwe dag begint op nul, en een onleesbare
// AI_DAILY_CALL_LIMIT sluit alles af in plaats van het plafond weg te halen.

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { daglimiet, magNogEen } from '../server/daglimiet.mjs';

let fouten = 0;
const zeg = (goed, wat) => { if (!goed) fouten++; console.log(`${goed ? 'ok  ' : 'FOUT'}  ${wat}`); };

const bestand = join(mkdtempSync(join(tmpdir(), 'daglimiet-')), 'teller.json');
const dag1 = new Date('2026-11-19T10:00:00Z');
const dag2 = new Date('2026-11-20T00:00:01Z');
const env = { AI_DAILY_CALL_LIMIT: '3' };

const uitkomsten = Array.from({ length: 4 }, () => magNogEen({ env, nu: dag1, bestand }));
zeg(uitkomsten.join() === 'true,true,true,false', 'drie aanroepen mogen, de vierde niet');
zeg(magNogEen({ env, nu: dag2, bestand }), 'een nieuwe dag begint op nul');

zeg(daglimiet({}) === 200, 'zonder waarde: 200');
zeg(daglimiet({ AI_DAILY_CALL_LIMIT: ' 50 ' }) === 50, 'spaties eromheen tellen niet');
for (const fout of ['abc', '-1', '1e9', '10.5']) {
  zeg(daglimiet({ AI_DAILY_CALL_LIMIT: fout }) === 0, `"${fout}" sluit af`);
}
zeg(!magNogEen({ env: { AI_DAILY_CALL_LIMIT: '0' }, nu: dag2, bestand }), 'limiet 0: geen enkele aanroep');

console.log(`\n${fouten} fouten`);
process.exit(fouten ? 1 : 0);
