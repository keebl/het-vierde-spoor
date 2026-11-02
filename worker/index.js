// De AI-laag voor de live site.
//
// Op GitHub Pages staat alleen statische inhoud; een API-key hoort daar niet
// te staan en kan daar ook niet staan. Deze Worker is het enige stukje server
// dat er is, en hij heeft precies één taak: de verhaalteksten van één puzzel
// laten herschrijven.
//
// Waarom dit niet te kapen is als gratis AI-dienst:
//
//   1. Je kunt hem maar één ding vragen: een puzzel-id, zoals
//      "dader.noir.grid.3.kade-1". Geen tekst, geen prompt, geen berichten.
//      De vraag aan het model wordt hier opgebouwd uit een puzzel die deze
//      Worker ZELF uitrekent met dezelfde motor als de site. Er is dus geen
//      weg waarlangs iemand eigen tekst het model in krijgt.
//   2. Het antwoord gaat door hetzelfde vangnet als lokaal: elke herschreven
//      aanwijzing moet alle eigennamen, de ontkenning, de getallen en het
//      of-of behouden. Wat dat niet haalt, wordt de oorspronkelijke zin.
//   3. Elk id wordt één keer uitgerekend en daarna bewaard. Dezelfde puzzel
//      kost dus nooit twee keer iets.
//   4. Er staat een teller op: per IP-adres per uur, en een dagtotaal voor de
//      hele site. Daarboven antwoordt hij netjes "even niet" en valt de site
//      terug op de eigen teksten.
//   5. Alleen verzoeken van de site zelf komen erdoor (Origin-controle), en
//      het verzoek mag niet groter zijn dan een paar honderd tekens.
//
// Instellen staat in README.md onder "De AI-laag live".

import { buildPuzzle, parsePuzzleId } from '../src/puzzle.js';
import { SYSTEEM, bouwVraag, leesAntwoord } from '../src/ai/opdracht.js';

// Een puzzel-id en niets anders: opdracht.wereld.speltype.niveau.seed
const ID_PATROON = /^[a-z]+\.[a-z]+\.[a-z]+\.[1-5]\.[A-Za-z0-9_-]{1,40}$/;
const MAX_BODY = 300;

export default {
  async fetch(request, env) {
    const herkomst = request.headers.get('origin') ?? '';
    const toegestaan = (env.TOEGESTANE_HERKOMST ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const mag = toegestaan.includes(herkomst);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: mag ? 204 : 403, headers: cors(herkomst, mag) });
    }
    if (request.method !== 'POST') return antwoord({ error: 'alleen POST' }, 405, herkomst, mag);
    if (!mag) return antwoord({ error: 'niet van deze site' }, 403, herkomst, false);

    const lengte = Number(request.headers.get('content-length') ?? 0);
    if (lengte > MAX_BODY) return antwoord({ error: 'verzoek te groot' }, 413, herkomst, mag);

    let body;
    try {
      body = await request.json();
    } catch {
      return antwoord({ error: 'geen geldige json' }, 400, herkomst, mag);
    }
    const id = typeof body?.id === 'string' ? body.id : '';
    if (!ID_PATROON.test(id)) return antwoord({ error: 'geen geldig puzzel-id' }, 400, herkomst, mag);

    // Al eens uitgerekend? Dan kost deze puzzel niets meer.
    const bewaard = await env.CACHE.get(`tekst:${id}`);
    if (bewaard) {
      return new Response(bewaard, {
        status: 200,
        headers: { ...cors(herkomst, mag), 'content-type': 'application/json; charset=utf-8', 'x-bron': 'bewaard' },
      });
    }

    const rem = await remmen(env, request);
    if (rem) return antwoord({ error: rem }, 429, herkomst, mag);

    // De puzzel hier uitrekenen. Lukt dat niet, dan bestaat het id niet en
    // gaan we zeker niet naar het model.
    let puzzle;
    try {
      puzzle = buildPuzzle(parsePuzzleId(id));
    } catch {
      return antwoord({ error: 'deze puzzel bestaat niet' }, 400, herkomst, mag);
    }
    if (puzzle.kind === 'latin' || !puzzle.clues.length) {
      return antwoord({ error: 'niets te herschrijven' }, 400, herkomst, mag);
    }

    let tekst;
    try {
      tekst = await vraagHetModel(env, puzzle);
    } catch (err) {
      return antwoord({ error: String(err?.message ?? err) }, 502, herkomst, mag);
    }

    const uit = leesAntwoord(puzzle, tekst);
    if (!uit) return antwoord({ error: 'onleesbaar antwoord' }, 502, herkomst, mag);

    const json = JSON.stringify({ intro: uit.intro, aanwijzingen: uit.aanwijzingen });
    await env.CACHE.put(`tekst:${id}`, json);
    return new Response(json, {
      status: 200,
      headers: { ...cors(herkomst, mag), 'content-type': 'application/json; charset=utf-8', 'x-bron': 'nieuw' },
    });
  },
};

// ------------------------------------------------------------- de tellers

async function remmen(env, request) {
  const uurLimiet = Number(env.UURLIMIET ?? 20);
  const dagLimiet = Number(env.DAGLIMIET ?? 200);
  const ip = request.headers.get('cf-connecting-ip') ?? 'onbekend';
  const nu = new Date();
  const uurSleutel = `uur:${ip}:${nu.toISOString().slice(0, 13)}`;
  const dagSleutel = `dag:${nu.toISOString().slice(0, 10)}`;

  const [uur, dag] = await Promise.all([env.CACHE.get(uurSleutel), env.CACHE.get(dagSleutel)]);
  if (Number(uur ?? 0) >= uurLimiet) return 'even rustig aan: te veel verzoeken dit uur';
  if (Number(dag ?? 0) >= dagLimiet) return 'de dagelijkse limiet is bereikt';

  // Tellen met een houdbaarheidsdatum, zodat de tellers zichzelf opruimen.
  await Promise.all([
    env.CACHE.put(uurSleutel, String(Number(uur ?? 0) + 1), { expirationTtl: 3600 }),
    env.CACHE.put(dagSleutel, String(Number(dag ?? 0) + 1), { expirationTtl: 86400 * 2 }),
  ]);
  return null;
}

// ---------------------------------------------------------------- het model

async function vraagHetModel(env, puzzle) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2026-10-21',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: env.MODEL ?? 'claude-sonnet-5-5',
      max_tokens: 4000,
      output_config: { effort: 'low' },
      system: SYSTEEM,
      messages: [{ role: 'user', content: bouwVraag(puzzle) }],
    }),
  });

  if (!res.ok) throw new Error(`model gaf ${res.status}`);
  const data = await res.json();
  if (data.stop_reason === 'refusal') throw new Error('verzoek geweigerd');
  return (data.content ?? [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
}

// ------------------------------------------------------------------ cors

function cors(herkomst, mag) {
  if (!mag) return { vary: 'origin' };
  return {
    'access-control-allow-origin': herkomst,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'origin',
  };
}

function antwoord(data, status, herkomst, mag) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(herkomst, mag), 'content-type': 'application/json; charset=utf-8' },
  });
}
