// Inloggen, uitloggen, verwijderen en wanneer er gesynchroniseerd wordt
// (specs/accounts-and-sync.md, ADR-0006). Dit bestand is klein en laadt
// supabase-js pas als er een sessie is of als iemand wil inloggen: wie
// zonder account speelt, stuurt geen enkel verzoek naar Supabase
// (criterium 1).

import { SUPABASE_URL, SUPABASE_KEY, accountAan } from './config.js';
import { META, SESSIE, leesMeta, schrijfMeta, heeftSessie, bijWijziging } from './melding.js';
import { synchroniseer, isSessieFout } from './sync.js';

// 'uit' | 'bezig' | 'bijgewerkt' | 'mislukt' | 'verlopen' | 'opslag' | 'inlogfout'
let status = 'uit';
let clientBelofte = null;

export const GEBEURTENIS = 'vierdespoor:account';

function meld(extra = {}) {
  try {
    globalThis.dispatchEvent(new CustomEvent(GEBEURTENIS, { detail: { status, ...extra } }));
  } catch {
    /* geen window (Node): niemand om het te vertellen */
  }
}

function zetStatus(s, extra) {
  status = s;
  meld(extra);
}

export function huidigeStatus() {
  return status;
}

export function laatstBijgewerkt() {
  return leesMeta().laatst ?? null;
}

// Het e-mailadres uit de bewaarde sessie, zonder de bibliotheek te laden:
// de menuknop moet er meteen staan, niet pas na 60 kB.
export function ingelogdAls() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSIE) || 'null');
    return typeof s?.user?.email === 'string' ? s.user.email : null;
  } catch {
    return null;
  }
}

export function opslagWerkt() {
  try {
    const k = 'vierdespoor.proef';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

function client() {
  clientBelofte ??= import('../vendor/supabase.js').then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      flowType: 'pkce',
      storageKey: SESSIE,
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
      // Het antwoord van Google halen we zelf uit de adresbalk (start()),
      // vóór de router de hash leest.
      detectSessionInUrl: false,
    },
    db: { schema: 'reconstructie' },
  }));
  return clientBelofte;
}

// Wat sync.js als backend gebruikt. Elke fout wordt doorgegooid; sync.js
// en synchroniseerNu() beslissen wat ermee gebeurt.
function backendVan(sb) {
  const rpc = async (naam, args) => {
    const { error } = await sb.rpc(naam, args);
    if (error) throw error;
  };
  // PostgREST geeft hooguit 1.000 rijen per verzoek; een account heeft er
  // tot 2.000.
  const alles = async (tabel, sleutel, kolommen, sinds) => {
    const rijen = [];
    for (let van = 0; ; van += 1000) {
      // Een hele partij krijgt dezelfde bijgewerkt (now() is de tijd van de
      // transactie); zonder tweede sorteersleutel kan een pagina dan rijen
      // overslaan of dubbel geven.
      let q = sb.from(tabel).select(kolommen).order('bijgewerkt').order(sleutel).range(van, van + 999);
      if (sinds) q = q.gt('bijgewerkt', sinds);
      const { data, error } = await q;
      if (error) throw error;
      rijen.push(...(data ?? []));
      if (!data || data.length < 1000) return rijen;
    }
  };
  return {
    bewaarPuzzels: (rijen) => rpc('bewaar_puzzels', { rijen }),
    bewaarPad: (rijen) => rpc('bewaar_pad', { rijen }),
    bewaarVoorkeuren: (waarden) => rpc('bewaar_voorkeuren', { waarden }),
    haalPuzzels: (sinds) => alles('puzzels', 'puzzel_id', 'puzzel_id,opgelost,onthuld,versie,bijgewerkt', sinds),
    haalPad: (sinds) => alles('pad', 'stap', 'stap,sterren,opgelost,versie,bijgewerkt', sinds),
    async haalVoorkeuren() {
      const { data, error } = await sb.from('voorkeuren')
        .select('niveau,niveau_tijd,kruisjes,kruisjes_tijd,panelen,panelen_tijd,versie').maybeSingle();
      if (error) throw error;
      return data;
    },
  };
}

// Na uitloggen of verwijderen: niets meer klaarzetten, en een volgende
// login (misschien een ander account) begint met alles versturen. De
// keuzetijden van de voorkeuren blijven, die horen bij dit apparaat.
function vergeetSync() {
  const m = leesMeta();
  schrijfMeta({ tijden: m.tijden ?? {} });
}

// -------------------------------------------------------------- een ronde
let bezig = null;
let nogEens = false;

export async function synchroniseerNu() {
  if (!accountAan() || !heeftSessie()) return;
  if (bezig) { nogEens = true; return bezig; }
  bezig = (async () => {
    zetStatus('bezig');
    try {
      const sb = await client();
      const { data, error } = await sb.auth.getSession();
      if (!data?.session) {
        // Offline met een verlopen toegangsbewijs geeft ook geen sessie,
        // maar dan bestaat hij nog: wachten, en niets vergeten van wat er
        // nog verstuurd moet worden.
        if (error && !isSessieFout(error)) { zetStatus('mislukt'); return; }
        // Verversen werd echt geweigerd (ingetrokken in Family Link, op een
        // ander apparaat verwijderd): uitgelogd.
        try { localStorage.removeItem(SESSIE); } catch { /* geen opslag */ }
        vergeetSync();
        zetStatus('verlopen');
        return;
      }
      const { veranderd } = await synchroniseer(backendVan(sb));
      zetStatus('bijgewerkt', { veranderd });
    } catch (fout) {
      // Alleen de soort fout, nooit een token, e-mailadres of bord.
      console.warn('sync mislukt:', fout?.code || fout?.name || 'onbekend');
      if (isSessieFout(fout)) {
        try { await (await client()).auth.signOut({ scope: 'local' }); } catch { /* al weg */ }
        try { localStorage.removeItem(SESSIE); } catch { /* idem */ }
        vergeetSync();
        zetStatus('verlopen');
      } else {
        zetStatus('mislukt');
      }
    }
  })();
  try {
    await bezig;
  } finally {
    bezig = null;
    if (nogEens) { nogEens = false; planSync(0); }
  }
}

let wachter = null;
export function planSync(ms = 1500) {
  if (!accountAan() || !heeftSessie()) return;
  clearTimeout(wachter);
  wachter = setTimeout(() => { void synchroniseerNu(); }, ms);
}

// -------------------------------------------------------------- acties

export async function inloggen() {
  if (!opslagWerkt()) { zetStatus('opslag'); return; }
  const sb = await client();
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Altijd terug naar de voordeur, precies zoals die in de Redirect URLs
      // van Supabase staat; start() brengt je daarna naar #/account. Een
      // hash in dit adres zou de vergelijking met die lijst laten mislukken.
      redirectTo: `${location.origin}/`,
      // Zodat ze haar eigen account kiest en niet stilletjes dat van wie
      // er toevallig in de browser zit.
      queryParams: { prompt: 'select_account' },
    },
  });
  if (error) {
    console.warn('inloggen mislukt:', error.code || error.name);
    zetStatus('inlogfout');
  }
}

// Uitloggen geldt alleen voor dit apparaat (scope 'local'): het mag nooit
// een sessie op de telefoon beëindigen omdat je op de laptop uitlogt.
export async function uitloggen() {
  try {
    const sb = await client();
    await sb.auth.signOut({ scope: 'local' });
  } catch {
    /* geen verbinding: de sessie hieronder gaat toch weg */
  }
  try { localStorage.removeItem(SESSIE); } catch { /* geen opslag */ }
  vergeetSync();
  zetStatus('uit');
}

// Gooit bij een fout, zodat de accountpagina "Verwijderen is niet gelukt"
// kan zeggen; dan is er ook niets verwijderd (één databasefunctie, één
// transactie).
export async function verwijderAccount() {
  const sb = await client();
  const { error } = await sb.rpc('verwijder_mijn_account');
  if (error) throw error;
  try { await sb.auth.signOut({ scope: 'local' }); } catch { /* de login kan al weg zijn */ }
  try { localStorage.removeItem(SESSIE); } catch { /* geen opslag */ }
  vergeetSync();
  zetStatus('uit');
}

// ---------------------------------------------------------------- opstart

// Komt deze pagina terug van Google? PKCE zet het antwoord in de query
// (?code=… of ?error=…), nooit in de hash, dus het botst niet met de
// routes. Alleen dan moet main.js wachten voordat het de router start.
export function komtVanInloggen() {
  if (!accountAan()) return false;
  const q = new URLSearchParams(location.search);
  if (!q.has('code') && !q.has('error')) return false;
  // Alleen als dit apparaat zelf een inlog begon (supabase-js bewaart dan
  // een PKCE-verifier). Een gedeelde link met ?code= erin laadt zo niets.
  try {
    return !!localStorage.getItem(`${SESSIE}-code-verifier`);
  } catch {
    return false;
  }
}

function schoonAdres() {
  history.replaceState(null, '', `${location.pathname}#/account`);
}

export async function start() {
  if (!accountAan()) return;
  if (komtVanInloggen()) {
    const q = new URLSearchParams(location.search);
    const code = q.get('code');
    schoonAdres();
    if (!code) {
      zetStatus('inlogfout');
    } else {
      try {
        // De pagina wacht hierop; hangt het netwerk, dan na acht seconden
        // toch verder, met "Inloggen is niet gelukt".
        const { error } = await Promise.race([
          client().then((sb) => sb.auth.exchangeCodeForSession(code)),
          new Promise((_, nee) => setTimeout(() => nee(Object.assign(new Error('time-out'), { name: 'TimeoutError' })), 8000)),
        ]);
        if (error) throw error;
        // Eerste ronde op dit apparaat: alles versturen en alles ophalen,
        // zodat wat hier al stond en wat in het account stond samengaan
        // (criterium 5).
        const m = leesMeta();
        schrijfMeta({ ...m, alles: true, cursor: {}, open: {}, laatst: null });
      } catch (fout) {
        console.warn('inloggen mislukt:', fout?.code || fout?.name || 'onbekend');
        zetStatus('inlogfout');
      }
    }
  } else if (!opslagWerkt()) {
    status = 'opslag';
  }

  if (heeftSessie()) {
    status = 'bezig';
    planSync(0);
  }
  bijWijziging(() => planSync());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') planSync(0);
  });
  // Een ander tabblad logde in of uit: de menuknop moet meegaan.
  addEventListener('storage', (e) => {
    if (e.key === SESSIE || e.key === META) meld();
  });
}
