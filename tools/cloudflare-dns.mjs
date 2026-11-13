// De DNS van het eigen domein bij Cloudflare, via de API.
//
//   node tools/cloudflare-dns.mjs status        wat er nu staat
//   node tools/cloudflare-dns.mjs github-pages  zet de records voor GitHub Pages
//
// Het token komt uit .env (CLOUDFLARE_API_TOKEN) en wordt nergens getoond:
// het script print alleen wat Cloudflare terugzegt over de zone en de
// records. Het token hoeft alleen "Zone - DNS - Edit" en "Zone - Zone - Read"
// te mogen, en alleen voor deze ene zone. Zonder Zone - Read kan het de zone
// niet opzoeken; zet dan CLOUDFLARE_ZONE_ID in .env (staat op de
// overzichtspagina van het domein, rechtsonder, en is niet geheim).
//
// Zetten is herhaalbaar: een record dat er al precies zo staat, blijft staan;
// wat ontbreekt komt erbij. Andere records worden nooit weggehaald.
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOMEIN = process.env.CLOUDFLARE_DOMEIN ?? 'reconstructie.app';

// Dezelfde vijf regels als in server/serve.mjs; geen dependency nodig.
async function laadEnv() {
  try {
    const raw = await readFile(join(ROOT, '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=(.*)$/);
      if (!m) continue;
      const value = m[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[m[1]]) process.env[m[1]] = value;
    }
  } catch {
    /* geen .env */
  }
}

// De adressen van GitHub Pages (docs.github.com, "Managing a custom domain").
const GITHUB_PAGES = [
  ...['108', '109', '110', '111'].map((n) => ({ type: 'A', name: '@', content: `185.199.${n}.153` })),
  ...['8000', '8001', '8002', '8003'].map((n) => ({ type: 'AAAA', name: '@', content: `2606:50c0:${n}::153` })),
  { type: 'CNAME', name: 'www', content: 'keebl.github.io' },
];

async function api(pad, opties = {}) {
  const r = await fetch(`https://api.cloudflare.com/client/v4${pad}`, {
    ...opties,
    headers: {
      authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      'content-type': 'application/json',
      ...opties.headers,
    },
  });
  const body = await r.json().catch(() => ({}));
  if (!body.success) {
    const fouten = (body.errors ?? []).map((e) => `${e.code}: ${e.message}`).join('; ');
    throw new Error(`${opties.method ?? 'GET'} ${pad.split('?')[0]} -> ${r.status} ${fouten}`);
  }
  return body.result;
}

async function zoneId() {
  if (process.env.CLOUDFLARE_ZONE_ID) return process.env.CLOUDFLARE_ZONE_ID;
  const zones = await api(`/zones?name=${encodeURIComponent(DOMEIN)}`);
  if (!zones.length) throw new Error(`zone ${DOMEIN} niet gevonden met dit token`);
  console.log(`zone ${zones[0].name}: ${zones[0].status}`);
  return zones[0].id;
}

const volledig = (naam) => (naam === '@' ? DOMEIN : `${naam}.${DOMEIN}`);
const regel = (r) => `${r.type.padEnd(5)} ${r.name.padEnd(24)} ${r.content}${r.proxied ? '  (proxied)' : ''}`;

async function main() {
  await laadEnv();
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    console.error('CLOUDFLARE_API_TOKEN ontbreekt in .env');
    process.exit(1);
  }
  const opdracht = process.argv[2] ?? 'status';
  const id = await zoneId();
  const bestaand = await api(`/zones/${id}/dns_records?per_page=100`);

  if (opdracht === 'status') {
    console.log(bestaand.length ? bestaand.map(regel).join('\n') : '(geen records)');
    return;
  }
  if (opdracht !== 'github-pages') {
    console.error(`onbekende opdracht: ${opdracht}`);
    process.exit(1);
  }
  for (const want of GITHUB_PAGES) {
    const naam = volledig(want.name);
    const al = bestaand.find((r) => r.type === want.type && r.name === naam && r.content === want.content);
    if (al) {
      console.log(`staat al  ${regel(al)}`);
      continue;
    }
    // Niet via de proxy: dan kan GitHub zelf het HTTPS-certificaat aanvragen.
    const nieuw = await api(`/zones/${id}/dns_records`, {
      method: 'POST',
      body: JSON.stringify({ type: want.type, name: naam, content: want.content, proxied: false, ttl: 1 }),
    });
    console.log(`gezet     ${regel(nieuw)}`);
  }
}

main().catch((e) => {
  console.error(`fout: ${e.message}`);
  process.exit(1);
});
