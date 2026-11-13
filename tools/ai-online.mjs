// Zet de AI-laag van de live site aan.
//
// Op GitHub Pages staan alleen bestanden; er is geen server die een API-key
// kan bewaren. Dit script rolt daarom de Worker uit die dat wel doet, en
// vertelt de site waar die Worker staat.
//
// Wat het doet, in deze volgorde:
//   1. kijken of je bij Cloudflare bent ingelogd
//   2. een opslagruimte (KV) maken voor de bewaarde teksten en de tellers
//   3. de Worker uitrollen en zijn adres in src/ai/endpoint.js zetten
//
// Je API-key zet je er zelf bij, met één commando dat dit script je geeft.
// Dat gaat met opzet niet automatisch: zo gaat je sleutel alleen door jouw
// handen en die van Cloudflare, en komt hij nergens anders langs.
//
// Gebruik: node tools/ai-online.mjs

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TOML = resolve(ROOT, 'worker/wrangler.toml');
const ENDPOINT = resolve(ROOT, 'src/ai/endpoint.js');

const wrangler = (args) =>
  execFileSync('npx', ['wrangler', ...args], {
    cwd: resolve(ROOT, 'worker'),
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'inherit'],
  });

const stap = (tekst) => console.log(`\n→ ${tekst}`);

console.log(`
Let op, lees dit eerst.

Een puzzel narekenen kost rekentijd: bij twaalf bij twaalf tot drie seconden.
Het GRATIS plan van Cloudflare geeft een Worker 10 milliseconden per verzoek,
en daar past dat niet in. Zonder het betaalde plan (vijf dollar per maand)
krijgt elke aanvraag een foutmelding, en valt de site terug op de eigen
teksten - dus kapot gaat er niets, maar werken doet het ook niet.

Het betaalde plan zet je aan in het Cloudflare-dashboard onder Workers &
Pages. Je kunt dit script ook gewoon nu draaien en het plan daarna omzetten.
`);

// ---------------------------------------------------------------- 1. login

stap('Ben je ingelogd bij Cloudflare?');
let ingelogd = false;
try {
  ingelogd = !/not authenticated/i.test(wrangler(['whoami']));
} catch {
  ingelogd = false;
}
if (!ingelogd) {
  console.log(`
  Nog niet. Log eerst in - dat opent je browser:

      npx wrangler login

  Heb je nog geen Cloudflare-account, dan maak je er in dat scherm gratis een
  aan. Daarna dit script opnieuw starten.`);
  process.exit(1);
}
console.log('  ja.');

// ------------------------------------------------------------------ 2. kv

let toml = readFileSync(TOML, 'utf8');
if (toml.includes('ZET_HIER_HET_ID')) {
  stap('Opslagruimte maken voor de bewaarde teksten en de tellers');
  const uit = wrangler(['kv', 'namespace', 'create', 'CACHE']);
  const m = uit.match(/id\s*=\s*"([0-9a-f]{32})"/i) ?? uit.match(/"id":\s*"([0-9a-f]{32})"/i);
  if (!m) {
    console.log(uit);
    console.log('\n  Kon het id niet vinden. Zet het met de hand in worker/wrangler.toml.');
    process.exit(1);
  }
  writeFileSync(TOML, toml.replace('ZET_HIER_HET_ID_VAN_JE_KV_NAMESPACE', m[1]));
  console.log(`  klaar (${m[1]}).`);
} else {
  console.log('\n→ Opslagruimte stond er al.');
}

// -------------------------------------------------------------- 3. uitrol

stap('De Worker uitrollen');
const uitrol = wrangler(['deploy']);
console.log(uitrol);
const adres = uitrol.match(/https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev/i)?.[0];
if (!adres) {
  console.log('  Kon het adres van de Worker niet uit de uitvoer halen.');
  console.log('  Zet het met de hand in src/ai/endpoint.js.');
  process.exit(1);
}

const huidig = readFileSync(ENDPOINT, 'utf8');
writeFileSync(
  ENDPOINT,
  huidig.replace(/export const WORKER_URL = '[^']*';/, `export const WORKER_URL = '${adres}/';`)
);

console.log(`
De Worker staat op ${adres}
en src/ai/endpoint.js wijst er nu naar.

Nog drie dingen, en dan werkt het:

  1. Je API-key erbij zetten. Dit vraagt erom en je plakt hem in; hij komt
     niet in de repo en niet in beeld:

       cd worker && npx wrangler secret put ANTHROPIC_API_KEY

  2. Kijken of hij antwoordt. Dit hoort een herschreven tekst terug te geven;
     krijg je een foutmelding over rekentijd, dan staat het betaalde plan nog
     niet aan:

       curl -s -X POST ${adres}/ \\
         -H 'origin: https://reconstructie.app' \\
         -H 'content-type: application/json' \\
         -d '{"id":"dader.noir.grid.2.kade-1"}'

  3. De site bijwerken:

       git add -A && git commit -m "AI-teksten op de live site" && git push

Daarna staat het binnen een minuut op
https://reconstructie.app/

Weer uitzetten: maak WORKER_URL in src/ai/endpoint.js weer leeg, of haal de
Worker weg met "npx wrangler delete" in de map worker/.`);
