// Eén ronde synchroniseren: eerst versturen wat hier veranderd is, dan
// ophalen wat er in het account nieuwer is, en dat in localStorage
// samenvoegen. localStorage blijft de plek waar het spel leest en schrijft;
// dit loopt erachter en blokkeert nooit (docs/UX.md: "Playing never waits
// for the account").
//
// De backend wordt meegegeven (sessie.js maakt hem van supabase-js, de
// keuring maakt een nep-versie), zodat alles hier zonder netwerk te
// controleren is: tools/check-sync.mjs.

import {
  puzzelRijen, padRijen, voorkeurWaarden,
  voegPuzzelsSamen, voegPadSamen, voegVoorkeurenSamen, VOORKEUREN,
} from './samenvoegen.js';
import { leesMeta, schrijfMeta } from './melding.js';

export const SLEUTELS = {
  puzzels: 'vierdespoor.v1',
  pad: 'vierdespoor.pad',
  voorkeuren: 'vierdespoor.voorkeuren',
};

// Hoeveel rijen per verzoek. De database neemt er per gebruiker hooguit
// 2.000 aan; in stukken blijft elk verzoek klein.
const STUK = 500;
// De cursor is de servertijd van de nieuwste rij die we zagen. Een
// transactie die net vóór die tijd begon maar later klaar was, zou er
// anders tussendoor glippen; samenvoegen is toch idempotent, dus een
// minuut dubbel ophalen kost niets.
const MARGE_MS = 60_000;

function lees(opslag, sleutel) {
  try {
    const v = JSON.parse(opslag.getItem(sleutel) || 'null');
    return v;
  } catch {
    return null;
  }
}

function schrijf(opslag, sleutel, waarde) {
  opslag.setItem(sleutel, JSON.stringify(waarde));
}

function nieuwste(rijen, oud) {
  let t = oud ? Date.parse(oud) : 0;
  for (const r of rijen) {
    const x = Date.parse(r?.bijgewerkt);
    if (!Number.isNaN(x) && x > t) t = x;
  }
  return t ? new Date(t).toISOString() : null;
}

const sinds = (cursor) => (cursor ? new Date(Date.parse(cursor) - MARGE_MS).toISOString() : null);

// Is dit een fout die zegt dat de sessie niet meer geldt? Dan doet sessie.js
// alsof je uitgelogd bent (spec: "Session expired or refresh token
// revoked"). Een account dat op een ander apparaat verwijderd is, geeft
// hier een schending van de verwijzing naar auth.users (23503): het
// toegangsbewijs geldt nog een uur, de gebruiker bestaat al niet meer.
export function isSessieFout(fout) {
  const status = fout?.status ?? fout?.statusCode;
  const code = fout?.code;
  return status === 401 || code === 'PGRST301' || code === 'PGRST303' || code === '23503'
    || fout?.name === 'AuthSessionMissingError' || fout?.name === 'AuthApiError';
}

// De hele ronde. Geeft { veranderd } terug, of gooit de fout van de backend
// door; de aanroeper zet die om in een status en laat het spel met rust.
export async function synchroniseer(backend, opslag = globalThis.localStorage) {
  const meta = leesMeta(opslag);
  const alles = meta.alles === true;
  const open = meta.open ?? {};
  // Wat we nu versturen, met het volgnummer van dat moment. Wat er tijdens
  // het wachten bij komt of opnieuw verandert, blijft open staan voor de
  // volgende ronde.
  const stand = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? { ...x } : {});
  const verstuurd = {
    puzzels: stand(open.puzzels),
    pad: stand(open.pad),
    voorkeuren: stand(open.voorkeuren),
  };

  // ------------------------------------------------------------ versturen
  const pRijen = puzzelRijen(lees(opslag, SLEUTELS.puzzels), alles ? null : Object.keys(verstuurd.puzzels));
  try {
    for (let i = 0; i < pRijen.length; i += STUK) await backend.bewaarPuzzels(pRijen.slice(i, i + STUK));
  } catch (fout) {
    // Vol (2.000 puzzels, 23514): daar komt niets meer bij, hoe vaak we het
    // ook proberen. Dan niet blijven hangen: wel ophalen, en deze puzzels
    // niet meer als open bewaren. Elke andere fout gaat naar de aanroeper.
    if (fout?.code !== '23514') throw fout;
  }
  const padR = padRijen(lees(opslag, SLEUTELS.pad), alles ? null : Object.keys(verstuurd.pad));
  if (padR.length) await backend.bewaarPad(padR);
  const tijden = leesMeta(opslag).tijden ?? {};
  const vWaarden = voorkeurWaarden(lees(opslag, SLEUTELS.voorkeuren), tijden, alles ? VOORKEUREN : Object.keys(verstuurd.voorkeuren));
  if (Object.keys(vWaarden).length) await backend.bewaarVoorkeuren(vWaarden);

  // -------------------------------------------------------------- ophalen
  const cursor = meta.cursor ?? {};
  const [puzzels, pad, voorkeur] = await Promise.all([
    backend.haalPuzzels(alles ? null : sinds(cursor.puzzels)),
    backend.haalPad(alles ? null : sinds(cursor.pad)),
    backend.haalVoorkeuren(),
  ]);

  // Vanaf hier geen await meer: lezen, samenvoegen en schrijven gebeuren in
  // één ruk, zodat een zet die de speler tijdens het wachten deed niet
  // overschreven wordt door een oudere kopie.
  let veranderd = false;
  const v1Oud = lees(opslag, SLEUTELS.puzzels);
  const v1 = voegPuzzelsSamen(v1Oud, puzzels);
  if (JSON.stringify(v1) !== JSON.stringify(v1Oud ?? {})) { schrijf(opslag, SLEUTELS.puzzels, v1); veranderd = true; }

  const padOud = lees(opslag, SLEUTELS.pad);
  const padNieuw = voegPadSamen(padOud, pad);
  if (padNieuw && padNieuw !== padOud) { schrijf(opslag, SLEUTELS.pad, padNieuw); veranderd = true; }

  const m = leesMeta(opslag);
  const vOud = lees(opslag, SLEUTELS.voorkeuren);
  const samen = voegVoorkeurenSamen(vOud, m.tijden, voorkeur);
  if (JSON.stringify(samen.voorkeuren) !== JSON.stringify(vOud ?? {})) {
    schrijf(opslag, SLEUTELS.voorkeuren, samen.voorkeuren);
    veranderd = true;
  }

  const nogOpen = {};
  for (const [lijst, gedaan] of Object.entries(verstuurd)) {
    const rest = Object.entries(stand(m.open?.[lijst])).filter(([k, n]) => gedaan[k] !== n);
    if (rest.length) nogOpen[lijst] = Object.fromEntries(rest);
  }
  schrijfMeta({
    ...m,
    tijden: samen.tijden,
    open: nogOpen,
    alles: false,
    cursor: {
      puzzels: nieuwste(puzzels ?? [], cursor.puzzels),
      pad: nieuwste(pad ?? [], cursor.pad),
    },
    laatst: new Date().toISOString(),
    fout: null,
  }, opslag);
  return { veranderd };
}
