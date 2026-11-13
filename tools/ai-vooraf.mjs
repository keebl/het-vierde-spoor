// De teksten van de bibliotheek vooraf laten herschrijven.
//
// Waarom vooraf en niet live: een puzzel uitrekenen kost tot drie seconden
// rekentijd, en die rekentijd moet ergens gebeuren. Live zou dat op een
// server moeten, met je API-key erop, bereikbaar voor iedereen. Dat is de
// enige plek waar iemand misbruik van zou kunnen maken.
//
// Vooraf is dat probleem er niet. De catalogus ligt vast: dezelfde
// instellingen geven altijd dezelfde puzzel, dus de herschreven teksten
// kunnen gewoon in de repo. Ze gaan door hetzelfde vangnet als altijd, ze
// staan in git (dus je kunt ze nalezen voordat ze online komen), en op de
// live site is er geen API, geen sleutel en dus niets te kapen.
//
// Gebruik:
//   node tools/ai-vooraf.mjs            alles wat er nog niet in staat
//   node tools/ai-vooraf.mjs --opnieuw  alles opnieuw
//   node tools/ai-vooraf.mjs --max 5    hooguit vijf puzzels (om te proeven)

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATALOG, catalogSettings } from '../src/content/catalog.js';
import { buildPuzzle, puzzleId } from '../src/puzzle.js';
import { SYSTEEM, bouwVraag, leesAntwoord } from '../src/ai/opdracht.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOEL = join(ROOT, 'src/content/ai-teksten.json');
const MODEL = process.env.VIERDESPOOR_MODEL ?? 'claude-sonnet-5-5';

const opnieuw = process.argv.includes('--opnieuw');
const maxIndex = process.argv.indexOf('--max');
const max = maxIndex > 0 ? Number(process.argv[maxIndex + 1]) : Infinity;

await laadEnv();
if (!process.env.ANTHROPIC_API_KEY) {
  console.log('Geen ANTHROPIC_API_KEY gevonden (zet hem in .env).');
  process.exit(1);
}

const { default: Anthropic } = await import('@anthropic-ai/sdk');
const client = new Anthropic();

let bestaand = {};
try {
  bestaand = JSON.parse(await readFile(DOEL, 'utf8'));
} catch {
  bestaand = {};
}

let gedaan = 0;
let overgeslagen = 0;
let gehouden = 0;
let afgekeurd = 0;
let invoer = 0;
let uitvoer = 0;

for (const entry of CATALOG) {
  if (gedaan >= max) break;
  const instellingen = catalogSettings(entry);
  const id = puzzleId(instellingen);
  if (!opnieuw && bestaand[id]) { overgeslagen++; continue; }

  const puzzle = buildPuzzle(instellingen);
  // Het dienstrooster heeft geen verhaalzinnen om te herschrijven.
  if (puzzle.kind === 'latin' || !puzzle.clues.length) { overgeslagen++; continue; }

  process.stdout.write(`${entry.titel.padEnd(36)} `);
  const antwoord = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    output_config: { effort: 'low' },
    system: SYSTEEM,
    messages: [{ role: 'user', content: bouwVraag(puzzle) }],
  });
  invoer += antwoord.usage?.input_tokens ?? 0;
  uitvoer += antwoord.usage?.output_tokens ?? 0;

  if (antwoord.stop_reason === 'refusal') {
    console.log('geweigerd, overgeslagen');
    continue;
  }
  const tekst = antwoord.content.filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  const uit = leesAntwoord(puzzle, tekst);
  if (!uit) {
    console.log('onleesbaar antwoord, overgeslagen');
    continue;
  }

  // Alleen de aanwijzingen. De herschreven inleidingen klonken als een
  // taalmodel ("Welke dat is, volgt uit de aanwijzingen", "De kaart liegt
  // erover, de luchtstroom niet"); de eigen zinnen uit worlds.js en
  // zaken.js zijn beter, dus die blijven staan.
  bestaand[id] = { aanwijzingen: uit.aanwijzingen };
  gedaan++;
  gehouden += uit.gehouden;
  afgekeurd += uit.afgekeurd;
  console.log(`${uit.gehouden} van de ${puzzle.clues.length} herschreven${uit.afgekeurd ? `, ${uit.afgekeurd} afgekeurd` : ''}`);

  await writeFile(DOEL, `${JSON.stringify(bestaand, null, 1)}\n`);
}

// Teksten van puzzels die niet meer in de catalogus staan, kunnen weg.
const levend = new Set(CATALOG.map((e) => puzzleId(catalogSettings(e))));
let verwijderd = 0;
for (const id of Object.keys(bestaand)) {
  if (!levend.has(id)) { delete bestaand[id]; verwijderd++; }
}
if (verwijderd) await writeFile(DOEL, `${JSON.stringify(bestaand, null, 1)}\n`);

console.log('');
console.log(`herschreven       ${gedaan} puzzels (${overgeslagen} overgeslagen, ${verwijderd} verouderde eruit)`);
console.log(`aanwijzingen      ${gehouden} gehouden, ${afgekeurd} afgekeurd door het vangnet`);
console.log(`tokens            ${invoer} in, ${uitvoer} uit (model ${MODEL})`);
console.log(`bestand           ${DOEL}`);

// Minimale .env-lezer, net als in de server.
async function laadEnv() {
  try {
    const raw = await readFile(join(ROOT, '.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      if (!process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    /* geen .env, geen probleem */
  }
}
