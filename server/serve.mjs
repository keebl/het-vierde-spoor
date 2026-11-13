// Lokale server. Twee taken:
//   1. de site uitleveren (statisch, geen build)
//   2. optioneel /api/flavour: laat Claude de verhaalteksten herschrijven
//
// Zonder API-key werkt alles gewoon; /api/flavour geeft dan 503 en de
// browser houdt de eigen templateteksten. De key blijft hier, server-side -
// nooit in de frontend.

import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPuzzle, parsePuzzleId } from '../src/puzzle.js';
import { SYSTEEM, bouwVraag, leesAntwoord } from '../src/ai/opdracht.js';

const here = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(here, '..');
const PORT = Number(process.env.PORT ?? 4173);
const MODEL = process.env.VIERDESPOOR_MODEL ?? 'claude-opus-5-5';

await loadDotEnv();

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/flavour') return await flavour(req, res);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Methode niet toegestaan');
    await serveStatic(req, res);
  } catch (err) {
    console.error(err);
    send(res, 500, 'Interne fout');
  }
});

server.listen(PORT, () => {
  console.log(`Reconstructie staat op http://localhost:${PORT}`);
  console.log(hasKey() ? `AI-teksten beschikbaar via ${MODEL}` : 'AI-teksten uit (geen ANTHROPIC_API_KEY gevonden)');
  if (hasKey()) {
    console.log(LAN_AI
      ? 'AI-teksten ook vanaf andere apparaten in je netwerk (VIERDESPOOR_AI_LAN=1)'
      : 'AI-teksten alleen vanaf deze computer; zet VIERDESPOOR_AI_LAN=1 om dat open te zetten');
  }
  for (const adres of lanAdressen()) console.log(`In je netwerk bereikbaar op http://${adres}:${PORT}`);
});

// Welke adressen heeft deze computer in het huisnetwerk? Puur om ze te
// kunnen tonen; de server luistert sowieso op alle netwerkkaarten.
function lanAdressen() {
  const uit = [];
  for (const kaarten of Object.values(networkInterfaces())) {
    for (const k of kaarten ?? []) {
      if (k.family === 'IPv4' && !k.internal) uit.push(k.address);
    }
  }
  return uit;
}

// ------------------------------------------------------------- statisch

// Wat de buitenwereld mag zien. Een witte lijst, geen zwarte: de projectmap
// bevat ook .env, .git en de serverbron, en die horen nooit over de lijn te
// gaan. Zeker niet als je de site op het huisnetwerk openzet.
const PUBLIEK = new Set(['index.html', 'iconen.html', 'vergelijk.html', 'favicon.svg', 'styles', 'src']);

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let path = decodeURIComponent(url.pathname);
  if (path === '/' || path === '') path = '/index.html';

  const delen = normalize(path).split('/').filter(Boolean);
  // Geen verborgen bestanden of mappen (.env, .git, ...), geen uitstapjes
  // naar boven, en alleen vanuit de vrijgegeven ingangen.
  if (!delen.length || delen.some((d) => d.startsWith('.'))) return send(res, 404, 'Niet gevonden');
  if (!PUBLIEK.has(delen[0])) return send(res, 404, 'Niet gevonden');
  if (!TYPES[extname(delen[delen.length - 1])]) return send(res, 404, 'Niet gevonden');

  const target = join(ROOT, ...delen);
  if (!target.startsWith(ROOT + '/')) return send(res, 403, 'Niet toegestaan');

  try {
    const info = await stat(target);
    if (info.isDirectory()) return send(res, 404, 'Niet gevonden');
    const body = await readFile(target);
    res.writeHead(200, {
      'content-type': TYPES[extname(target)] ?? 'application/octet-stream',
      'cache-control': 'no-cache',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    send(res, 404, 'Niet gevonden');
  }
}

function send(res, code, text) {
  res.writeHead(code, { 'content-type': 'text/plain; charset=utf-8' });
  res.end(text);
}

// ------------------------------------------------------------ AI-laag

const hasKey = () => Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);

const LAN_AI = process.env.VIERDESPOOR_AI_LAN === '1';

// Een puzzel-id en niets anders: opdracht.wereld.speltype.niveau.seed
const ID_PATROON = /^[a-z]+\.[a-z]+\.[a-z]+\.[1-5]\.[A-Za-z0-9_-]{1,40}$/;

// Is dit verzoek van deze computer zelf?
const isLokaal = (req) => {
  const adres = req.socket.remoteAddress ?? '';
  return adres === '127.0.0.1' || adres === '::1' || adres === '::ffff:127.0.0.1';
};

async function flavour(req, res) {
  // Achter deze route hangt je API-key. Vanaf een ander apparaat in huis is
  // hij daarom dicht, tenzij je dat uitdrukkelijk aanzet met
  // VIERDESPOOR_AI_LAN=1. De site blijft het gewoon doen: de browser valt
  // dan terug op de eigen teksten.
  if (!isLokaal(req) && !LAN_AI) {
    res.writeHead(403, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ error: 'AI-teksten alleen vanaf deze computer' }));
  }
  if (!hasKey()) {
    res.writeHead(503, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ error: 'geen API-key ingesteld' }));
  }

  // Van buiten komt alleen een puzzel-id binnen. De puzzel rekenen we hier
  // zelf uit en de vraag aan het model bouwen we daaruit op - zie de uitleg
  // boven src/ai/opdracht.js. Zo is er geen weg waarlangs iemand eigen tekst
  // het model in praat, ook niet vanaf een ander apparaat in huis.
  const payload = await readJson(req);
  const id = typeof payload?.id === 'string' ? payload.id : '';
  if (!ID_PATROON.test(id)) return send(res, 400, 'Geen geldig puzzel-id');

  let puzzle;
  try {
    puzzle = buildPuzzle(parsePuzzleId(id));
  } catch {
    return send(res, 400, 'Deze puzzel bestaat niet');
  }
  if (puzzle.kind === 'latin' || !puzzle.clues.length) {
    return send(res, 400, 'Niets te herschrijven');
  }

  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      output_config: { effort: 'low' },
      system: SYSTEEM,
      messages: [{ role: 'user', content: bouwVraag(puzzle) }],
    });

    if (response.stop_reason === 'refusal') {
      res.writeHead(502, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: 'verzoek geweigerd' }));
    }

    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    const uit = leesAntwoord(puzzle, text);
    if (!uit) {
      res.writeHead(502, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: 'onleesbaar antwoord' }));
    }
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ intro: uit.intro, aanwijzingen: uit.aanwijzingen }));
  } catch (err) {
    const Anthropic2 = (await import('@anthropic-ai/sdk')).default;
    let code = 502;
    if (err instanceof Anthropic2.AuthenticationError) code = 401;
    else if (err instanceof Anthropic2.RateLimitError) code = 429;
    else if (err instanceof Anthropic2.BadRequestError) code = 400;
    console.error('flavour:', err?.message ?? err);
    res.writeHead(code, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: err?.message ?? 'onbekende fout' }));
  }
}

function readJson(req) {
  return new Promise((ok, fail) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > 256 * 1024) { req.destroy(); fail(new Error('te groot')); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try { ok(JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
      catch { ok(null); }
    });
    req.on('error', fail);
  });
}

// Minimale .env-lezer: geen dependency nodig voor vijf regels werk.
async function loadDotEnv() {
  try {
    const raw = await readFile(join(ROOT, '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=(.*)$/);
      if (!m) continue;
      const value = m[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[m[1]]) process.env[m[1]] = value;
    }
  } catch {
    /* geen .env: prima */
  }
}
