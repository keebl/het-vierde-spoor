// De regels voor het samenvoegen van voortgang tussen apparaten, zonder
// netwerk (specs/accounts-and-sync.md, ADR-0006). Alles hier is puur: het
// krijgt wat er in localStorage staat en wat de database terugstuurde, en
// geeft nieuwe waarden terug. Daardoor kan tools/check-sync.mjs het in Node
// controleren, en staat de logica niet verstopt tussen de netwerkcode.
//
// Dezelfde regels staan nog een keer in de database (bewaar_puzzels,
// bewaar_pad, bewaar_voorkeuren in supabase/migrations/). Dat is bewust:
// twee apparaten die tegelijk versturen mogen elkaar niet terugzetten, en
// dat kan alleen de database beloven. Deze kant zorgt dat wat terugkomt het
// lokale spel nooit kleiner maakt.
//
// De drie regels:
// - opgelost en onthuld: waar aan één kant, dan waar aan beide kanten;
// - het pad: per stap de meeste sterren, opgelost als het ergens opgelost is;
// - voorkeuren: per voorkeur wint de nieuwste.
// Een half bord (kruisjes, figuren, schetsletters, weggestreepte
// aanwijzingen, Terug) gaat nooit mee - Guus: "Alleen afgerond mee".

// Wat de database bewaart en dus ook wat we accepteren. Een puzzel-id is
// voor de sync een ondoorzichtige tekst; alleen de lengte telt.
export const MAX_ID = 200;
export const MAX_PUZZELS = 2000;
export const MAX_STAP = 1000;
export const NIVEAUS = [1, 2, 3, 4, 5, 6];
// De klepjes in player.js (klepje('legenda', …) en zo). Een onbekende naam
// uit de database laten we liggen in plaats van hem in de voorkeuren te
// schrijven: dan kan een nieuwere versie van de site hier niets breken.
export const PANELEN = ['aanwijzingen', 'legenda', 'uitleg'];
export const VOORKEUREN = ['niveau', 'kruisjes', 'panelen'];
// De vorm van wat er over de lijn gaat. Komt er een rij met een hogere
// versie terug, dan is die van een nieuwere site en slaan we hem over.
export const VERSIE = 1;

const isObject = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
const isId = (x) => typeof x === 'string' && x.length > 0 && x.length <= MAX_ID;
const isTijd = (x) => typeof x === 'string' && !Number.isNaN(Date.parse(x));

// ------------------------------------------------------------- puzzels

// Lokaal betekent `solved` ook "oplossing opgevraagd" (reveal() zet beide
// aan), en `onthuld` zegt dat het niet zelf was. Over de lijn houden we de
// twee uit elkaar: opgelost = zelf opgelost. Anders zou een puzzel die op
// de laptop is opgevraagd, op de telefoon een zelf opgeloste overschrijven.
export function puzzelRij(id, d) {
  if (!isId(id) || !isObject(d)) return null;
  const onthuld = d.onthuld === true;
  const opgelost = d.solved === true && !onthuld;
  if (!opgelost && !onthuld) return null;
  return { puzzel_id: id, opgelost, onthuld };
}

// Alle afgeronde puzzels uit vierdespoor.v1, of alleen de genoemde ids.
// Wat niet af is gaat niet mee: dat is geen voortgang die iets toevoegt.
export function puzzelRijen(v1, ids = null) {
  if (!isObject(v1)) return [];
  const welke = ids ? [...ids] : Object.keys(v1);
  const rijen = [];
  for (const id of welke) {
    const rij = puzzelRij(id, v1[id]);
    if (rij) rijen.push(rij);
  }
  return rijen.slice(0, MAX_PUZZELS);
}

// Een rij uit de database nakijken. Alles wat we niet kennen of niet
// vertrouwen valt eruit (criterium 17): dan blijft het lokale spel staan.
export function leesPuzzelRij(r) {
  if (!isObject(r)) return null;
  if (r.versie !== undefined && r.versie !== VERSIE) return null;
  if (!isId(r.puzzel_id)) return null;
  if (typeof r.opgelost !== 'boolean' || typeof r.onthuld !== 'boolean') return null;
  return { puzzel_id: r.puzzel_id, opgelost: r.opgelost, onthuld: r.onthuld };
}

// Rijen uit de database in vierdespoor.v1 verwerken. Geeft een nieuw
// object terug, het oude blijft ongemoeid.
//
// Een puzzel die hier nog niet bestaat, komt erbij als klein item zonder
// bord, en vóór de bestaande: saveProgress gooit bij meer dan 120 puzzels
// de eerste weg, en dan moeten dat deze kale items zijn en niet een bord
// waar iemand mee bezig is. De volgende sync brengt ze toch weer terug.
export function voegPuzzelsSamen(v1, rijen) {
  const oud = isObject(v1) ? v1 : {};
  const nieuw = {};
  const bijgewerkt = {};
  for (const ruw of Array.isArray(rijen) ? rijen : []) {
    const r = leesPuzzelRij(ruw);
    if (!r) continue;
    const d = oud[r.puzzel_id];
    const lokaal = puzzelRij(r.puzzel_id, d) ?? { opgelost: false, onthuld: false };
    const opgelost = lokaal.opgelost || r.opgelost;
    const onthuld = lokaal.onthuld || r.onthuld;
    if (!opgelost && !onthuld) continue;
    // Zelf opgelost wint van bekeken (criterium 6): dan telt hij als
    // opgelost, ook al is de oplossing ergens anders opgevraagd.
    const weergave = { solved: true, onthuld: !opgelost };
    if (isObject(d)) bijgewerkt[r.puzzel_id] = { ...d, ...weergave };
    else nieuw[r.puzzel_id] = { ...weergave, titel: '' };
  }
  const uit = { ...nieuw };
  for (const [id, d] of Object.entries(oud)) uit[id] = bijgewerkt[id] ?? d;
  return uit;
}

// ------------------------------------------------------------------ pad
// vierdespoor.pad uit specs/level-path.md:
// { versie: 1, stappen: { "<k>": { sterren: 0-3, opgelost: bool } } }

const isStap = (k) => Number.isInteger(k) && k >= 1 && k <= MAX_STAP;
const isSterren = (s) => Number.isInteger(s) && s >= 0 && s <= 3;

export function padRijen(pad, stappen = null) {
  if (!isObject(pad) || pad.versie !== VERSIE || !isObject(pad.stappen)) return [];
  const welke = stappen ? [...stappen].map(String) : Object.keys(pad.stappen);
  const rijen = [];
  for (const sleutel of welke) {
    const stap = Number(sleutel);
    const s = pad.stappen[sleutel];
    if (!isStap(stap) || !isObject(s)) continue;
    const sterren = isSterren(s.sterren) ? s.sterren : 0;
    const opgelost = s.opgelost === true;
    if (!sterren && !opgelost) continue;
    rijen.push({ stap, sterren, opgelost });
  }
  return rijen;
}

export function leesPadRij(r) {
  if (!isObject(r)) return null;
  if (r.versie !== undefined && r.versie !== VERSIE) return null;
  if (!isStap(r.stap) || !isSterren(r.sterren) || typeof r.opgelost !== 'boolean') return null;
  return { stap: r.stap, sterren: r.sterren, opgelost: r.opgelost };
}

// Sterren gaan alleen omhoog (docs/UX.md: "Progress is shown, never taken
// away"). Een pad van een nieuwere versie raken we niet aan: dat kennen we
// niet, en dan is niets doen het enige veilige.
export function voegPadSamen(pad, rijen) {
  if (isObject(pad) && pad.versie !== undefined && pad.versie !== VERSIE) return pad;
  const stappen = isObject(pad) && isObject(pad.stappen) ? { ...pad.stappen } : {};
  let veranderd = false;
  for (const ruw of Array.isArray(rijen) ? rijen : []) {
    const r = leesPadRij(ruw);
    if (!r) continue;
    const k = String(r.stap);
    const oud = isObject(stappen[k]) ? stappen[k] : {};
    const sterren = Math.max(isSterren(oud.sterren) ? oud.sterren : 0, r.sterren);
    const opgelost = oud.opgelost === true || r.opgelost;
    if (sterren === oud.sterren && opgelost === oud.opgelost) continue;
    stappen[k] = { ...oud, sterren, opgelost };
    veranderd = true;
  }
  if (!veranderd) return pad ?? null;
  return { ...(isObject(pad) ? pad : {}), versie: VERSIE, stappen };
}

// ----------------------------------------------------------- voorkeuren
// Alleen niveau, kruisjes en de open panelen reizen mee. De sierlijst om
// het bord en licht/donker horen bij het scherm, niet bij de speler.

export function geldigeVoorkeur(naam, waarde) {
  if (naam === 'niveau') return NIVEAUS.includes(waarde);
  if (naam === 'kruisjes') return typeof waarde === 'boolean';
  if (naam === 'panelen') {
    return isObject(waarde) && Object.entries(waarde).every(([k, v]) => PANELEN.includes(k) && typeof v === 'boolean');
  }
  return false;
}

// Wat er verstuurd wordt: per voorkeur de waarde en wanneer hij gezet is.
// Een voorkeur zonder tijd is nooit door de speler gekozen (het is de
// standaard) en gaat niet mee, anders zou een nieuw apparaat met zijn
// standaardwaarden de keuzes van het oude overschrijven.
export function voorkeurWaarden(voorkeuren, tijden, welke = VOORKEUREN) {
  const v = isObject(voorkeuren) ? voorkeuren : {};
  const t = isObject(tijden) ? tijden : {};
  const uit = {};
  for (const naam of welke) {
    if (!VOORKEUREN.includes(naam) || !isTijd(t[naam])) continue;
    let waarde = v[naam];
    if (naam === 'panelen' && isObject(waarde)) {
      waarde = Object.fromEntries(Object.entries(waarde).filter(([k, b]) => PANELEN.includes(k) && typeof b === 'boolean'));
    }
    if (!geldigeVoorkeur(naam, waarde)) continue;
    uit[naam] = { waarde, tijd: t[naam] };
  }
  return uit;
}

// De rij uit de database heeft per voorkeur een kolom en een tijd
// (niveau, niveau_tijd, …). Nieuwer wint, per voorkeur; gelijk of ouder
// laat het lokale staan.
export function voegVoorkeurenSamen(voorkeuren, tijden, rij) {
  const v = isObject(voorkeuren) ? { ...voorkeuren } : {};
  const t = isObject(tijden) ? { ...tijden } : {};
  if (!isObject(rij) || (rij.versie !== undefined && rij.versie !== VERSIE)) return { voorkeuren: v, tijden: t };
  for (const naam of VOORKEUREN) {
    const waarde = rij[naam];
    const tijd = rij[`${naam}_tijd`];
    if (!isTijd(tijd)) continue;
    let schoon = waarde;
    // Een onbekend paneel uit een nieuwere site: laat dat ene weg, de rest
    // telt nog.
    if (naam === 'panelen' && isObject(waarde)) {
      schoon = Object.fromEntries(Object.entries(waarde).filter(([k, b]) => PANELEN.includes(k) && typeof b === 'boolean'));
    }
    if (!geldigeVoorkeur(naam, schoon)) continue;
    if (isTijd(t[naam]) && Date.parse(t[naam]) >= Date.parse(tijd)) continue;
    v[naam] = naam === 'panelen' ? { ...(isObject(v.panelen) ? v.panelen : {}), ...schoon } : schoon;
    t[naam] = tijd;
  }
  return { voorkeuren: v, tijden: t };
}
