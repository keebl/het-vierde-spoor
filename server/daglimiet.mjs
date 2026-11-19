// Een daglimiet voor betaalde AI-aanroepen buiten de worker: de lokale
// server (npm start, met VIERDESPOOR_AI_LAN=1 ook bereikbaar vanaf andere
// apparaten in huis) en tools/ai-vooraf.mjs. De worker heeft zijn eigen
// teller in KV (worker/index.js, remmen).
//
// Waarom: een API-key zonder plafond is een open rekening. Een lus in een
// script of een apparaat in huis dat blijft vragen, en de kosten lopen door
// tot iemand het ziet (workbench cost-guard, Guus 2026-11-19: "Ja,
// daglimiet").
//
// AI_DAILY_CALL_LIMIT in .env zet het plafond, standaard 200 per dag. Een
// waarde die geen geheel getal van nul of meer is, sluit alles af: liever
// geen AI-teksten dan een tikfout die het plafond weghaalt. De teller staat
// in .ai-dagteller.json (niet in git), zodat een herstart van de server of
// een tweede run van het script hem niet op nul zet.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const STANDAARD = 200;
const BESTAND = fileURLToPath(new URL('../.ai-dagteller.json', import.meta.url));

export function daglimiet(env = process.env) {
  const ruw = env.AI_DAILY_CALL_LIMIT;
  if (ruw === undefined || ruw === '') return STANDAARD;
  return /^\d+$/.test(ruw.trim()) ? Number(ruw.trim()) : 0;
}

// Telt één aanroep mee als dat nog mag. Geeft false als het plafond van
// vandaag (UTC) bereikt is; dan doe je de aanroep niet.
export function magNogEen({ env = process.env, nu = new Date(), bestand = BESTAND } = {}) {
  const dag = nu.toISOString().slice(0, 10);
  let teller = {};
  try { teller = JSON.parse(readFileSync(bestand, 'utf8')); } catch { teller = {}; }
  const vandaag = Number(teller[dag] ?? 0);
  if (vandaag >= daglimiet(env)) return false;
  writeFileSync(bestand, `${JSON.stringify({ [dag]: vandaag + 1 })}\n`);
  return true;
}
