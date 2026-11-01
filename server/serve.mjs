// Lokale server. Twee taken:
//   1. de site uitleveren (statisch, geen build)
//   2. optioneel /api/flavour: laat Claude de verhaalteksten herschrijven
//
// Zonder API-key werkt alles gewoon; /api/flavour geeft dan 503 en de
// browser houdt de eigen templateteksten. De key blijft hier, server-side -
// nooit in de frontend.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  console.log(`Het Vierde Spoor staat op http://localhost:${PORT}`);
  console.log(hasKey() ? `AI-teksten beschikbaar via ${MODEL}` : 'AI-teksten uit (geen ANTHROPIC_API_KEY gevonden)');
});

// ------------------------------------------------------------- statisch

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let path = decodeURIComponent(url.pathname);
  if (path === '/' || path === '') path = '/index.html';

  // Nooit buiten de projectmap kijken.
  const target = join(ROOT, normalize(path).replace(/^(\.\.[/\\])+/, ''));
  if (!target.startsWith(ROOT)) return send(res, 403, 'Niet toegestaan');

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

const SYSTEEM = `Je herschrijft de stijl van Nederlandse deductiepuzzels. Je verandert NOOIT de logica.

Harde regels:
1. Elke eigennaam uit het origineel komt woordelijk terug in je herschrijving. Niet verbuigen, niet afkorten, niet vervangen door een voornaamwoord.
2. Je verandert geen enkele logische relatie: wat samengaat blijft samengaan, een ontkenning blijft een ontkenning, een tijdsorde blijft dezelfde kant op, een aantal blijft hetzelfde getal.
3. Je voegt geen feiten toe en laat geen feiten weg. Geen enkele hint erbij.
4. Je levert exact evenveel aanwijzingen als je krijgt, in dezelfde volgorde, met hetzelfde nummer.
5. Je houdt het kort: een aanwijzing is een zin, maximaal twee.

Antwoord uitsluitend met JSON, zonder uitleg eromheen:
{"intro": "...", "aanwijzingen": [{"n": 1, "tekst": "..."}]}`;

async function flavour(req, res) {
  if (!hasKey()) {
    res.writeHead(503, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ error: 'geen API-key ingesteld' }));
  }

  const payload = await readJson(req);
  if (!payload?.aanwijzingen?.length) return send(res, 400, 'Niets te herschrijven');

  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();

  const vraag = [
    `Wereld: ${payload.wereld}`,
    `Opdracht: ${payload.opdracht}`,
    `Vraag aan de speler: ${payload.vraag}`,
    '',
    `Inleiding:\n${payload.intro}`,
    '',
    'Aanwijzingen (de namen tussen rechte haken moeten woordelijk terugkomen):',
    ...payload.aanwijzingen.map(
      (c) => `${c.n}. ${c.tekst}   [${(c.namen ?? []).join(' | ')}]`
    ),
  ].join('\n');

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      output_config: { effort: 'low' },
      system: SYSTEEM,
      messages: [{ role: 'user', content: vraag }],
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

    const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    res.end(json);
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
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const value = m[2].replace(/^["']|["']$/g, '');
      if (!process.env[m[1]]) process.env[m[1]] = value;
    }
  } catch {
    /* geen .env: prima */
  }
}
