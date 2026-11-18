// Toetst de sync van de optionele accounts (specs/accounts-and-sync.md)
// zonder netwerk: de samenvoegregels, wat er wel en niet verstuurd wordt, en
// een hele ronde tussen twee "apparaten" en een nep-database die dezelfde
// regels toepast als de echte (supabase/migrations/). Daarnaast: dat de
// service_role-sleutel nergens in de code van de site staat.
//
// De criteria uit de spec staan bij elk geval, zodat een rode regel meteen
// zegt welke belofte stuk is.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  puzzelRijen, voegPuzzelsSamen, padRijen, voegPadSamen,
  voorkeurWaarden, voegVoorkeurenSamen, MAX_PUZZELS,
} from '../src/sync/samenvoegen.js';
import { synchroniseer, isSessieFout } from '../src/sync/sync.js';
import { meldWijziging, leesMeta, SESSIE } from '../src/sync/melding.js';

let fouten = 0;
let totaal = 0;
function toets(naam, goed) {
  totaal++;
  if (!goed) fouten++;
  console.log(`${goed ? 'ok  ' : 'FOUT'}  ${naam}`);
}
const gelijk = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------------------------------------------------------------- opslag
// Een localStorage in het klein, per apparaat.
function nieuweOpslag(begin = {}) {
  const m = new Map(Object.entries(begin).map(([k, v]) => [k, JSON.stringify(v)]));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    lees: (k) => JSON.parse(m.get(k) ?? 'null'),
  };
}

// --------------------------------------------------------- nep-database
// Dezelfde regels als bewaar_puzzels, bewaar_pad en bewaar_voorkeuren:
// of, of; de meeste sterren; per voorkeur de nieuwste, en een tijd meer dan
// een dag vooruit wordt de tijd van de server. Te veel of verkeerd gevormd:
// weigeren, zoals de check constraints en de trigger doen.
function nieuweDatabase() {
  const puzzels = new Map();
  const pad = new Map();
  let voorkeuren = null;
  let klok = Date.parse('2026-11-18T10:00:00Z');
  const nu = () => new Date((klok += 1000)).toISOString();
  const db = {
    verzoeken: [],
    stuk: false,
    weiger(reden) { const e = new Error(reden); e.code = '23514'; throw e; },
    async bewaarPuzzels(rijen) {
      db.verzoeken.push(['puzzels', rijen]);
      if (db.stuk) throw Object.assign(new Error('offline'), { name: 'TypeError' });
      for (const r of rijen) {
        if (Object.keys(r).some((k) => !['puzzel_id', 'opgelost', 'onthuld'].includes(k))) db.weiger('onbekende kolom');
        if (typeof r.puzzel_id !== 'string' || r.puzzel_id.length > 200) db.weiger('id');
      }
      const nieuw = rijen.filter((r) => !puzzels.has(r.puzzel_id)).length;
      if (puzzels.size + nieuw > MAX_PUZZELS) db.weiger('te veel puzzels');
      for (const r of rijen) {
        const oud = puzzels.get(r.puzzel_id) ?? { opgelost: false, onthuld: false };
        puzzels.set(r.puzzel_id, { puzzel_id: r.puzzel_id, opgelost: oud.opgelost || r.opgelost, onthuld: oud.onthuld || r.onthuld, bijgewerkt: nu() });
      }
    },
    async bewaarPad(rijen) {
      db.verzoeken.push(['pad', rijen]);
      if (db.stuk) throw new Error('offline');
      for (const r of rijen) {
        if (!(r.sterren >= 0 && r.sterren <= 3)) db.weiger('sterren');
        const oud = pad.get(r.stap) ?? { sterren: 0, opgelost: false };
        pad.set(r.stap, { stap: r.stap, sterren: Math.max(oud.sterren, r.sterren), opgelost: oud.opgelost || r.opgelost, bijgewerkt: nu() });
      }
    },
    async bewaarVoorkeuren(waarden) {
      db.verzoeken.push(['voorkeuren', waarden]);
      if (db.stuk) throw new Error('offline');
      if (waarden.niveau && ![1, 2, 3, 4, 5, 6].includes(waarden.niveau.waarde)) db.weiger('niveau');
      const v = voorkeuren ?? {};
      const grens = klok + 86_400_000;
      for (const [naam, { waarde, tijd }] of Object.entries(waarden)) {
        const t = Date.parse(tijd) > grens ? new Date(klok).toISOString() : tijd;
        if (!v[`${naam}_tijd`] || Date.parse(t) > Date.parse(v[`${naam}_tijd`])) {
          v[naam] = waarde;
          v[`${naam}_tijd`] = t;
        }
      }
      v.bijgewerkt = nu();
      voorkeuren = v;
    },
    async haalPuzzels(sinds) {
      if (db.stuk) throw new Error('offline');
      return [...puzzels.values()].filter((r) => !sinds || r.bijgewerkt > sinds);
    },
    async haalPad(sinds) {
      if (db.stuk) throw new Error('offline');
      return [...pad.values()].filter((r) => !sinds || r.bijgewerkt > sinds);
    },
    async haalVoorkeuren() {
      if (db.stuk) throw new Error('offline');
      return voorkeuren;
    },
    puzzels, pad,
    get voorkeuren() { return voorkeuren; },
  };
  return db;
}

// Een apparaat dat net ingelogd is: sessie aanwezig, alles versturen.
function inloggen(opslag) {
  opslag.setItem(SESSIE, '{"nep":true}');
  const m = leesMeta(opslag);
  opslag.setItem('vierdespoor.sync', JSON.stringify({ ...m, alles: true, cursor: {}, open: {} }));
}

const bord = (extra = {}) => ({
  marks: {}, plaats: { 0: 3 }, kruis: ['1,2'], schets: { 4: 'AB' }, struck: [2],
  extra: [], solved: false, onthuld: false, geschiedenis: [{ plaats: {} }], titel: 'Zaak', ...extra,
});

// ================================================================ regels
console.log('-- samenvoegregels');

// Criterium 8: een half bord gaat nooit mee, ook de stukken van een opgelost bord niet.
{
  const v1 = { half: bord(), af: bord({ solved: true }) };
  const rijen = puzzelRijen(v1);
  toets('criterium 8: een half bord levert geen rij op', !rijen.some((r) => r.puzzel_id === 'half'));
  toets('criterium 8: een rij bevat alleen id, opgelost en onthuld',
    rijen.every((r) => gelijk(Object.keys(r).sort(), ['onthuld', 'opgelost', 'puzzel_id'])));
}

// Criterium 6: zelf opgelost aan de ene kant, bekeken aan de andere: opgelost.
{
  const lokaal = { p: bord({ solved: true, onthuld: true }) };
  const uit = voegPuzzelsSamen(lokaal, [{ puzzel_id: 'p', opgelost: true, onthuld: false }]);
  toets('criterium 6: bekeken hier + opgelost daar = opgelost', uit.p.solved === true && uit.p.onthuld === false);
  const uit2 = voegPuzzelsSamen({ p: bord({ solved: true }) }, [{ puzzel_id: 'p', opgelost: false, onthuld: true }]);
  toets('criterium 6: opgelost hier + bekeken daar = opgelost', uit2.p.solved === true && uit2.p.onthuld === false);
  toets('criterium 6: het bord zelf blijft staan', gelijk(uit.p.plaats, lokaal.p.plaats));
}

// Een puzzel die hier niet bestond, komt erbij als kaal item, vóór de rest.
{
  const uit = voegPuzzelsSamen({ eigen: bord() }, [{ puzzel_id: 'elders', opgelost: true, onthuld: false }]);
  toets('nieuwe puzzel uit het account komt erbij zonder bord', uit.elders?.solved === true && !('plaats' in uit.elders));
  toets('nieuwe puzzel staat vóór de eigen borden (de inkorting raakt hem eerst)', Object.keys(uit)[0] === 'elders');
}

// Criterium 7: per stap de meeste sterren.
{
  const pad = { versie: 1, stappen: { 4: { sterren: 2, opgelost: true } } };
  const uit = voegPadSamen(pad, [{ stap: 4, sterren: 3, opgelost: true }, { stap: 5, sterren: 1, opgelost: true }]);
  toets('criterium 7: 2 hier, 3 daar = 3', uit.stappen['4'].sterren === 3);
  const terug = voegPadSamen(uit, [{ stap: 4, sterren: 1, opgelost: false }]);
  toets('criterium 7: sterren gaan nooit omlaag', terug.stappen['4'].sterren === 3 && terug.stappen['4'].opgelost === true);
  toets('pad: alleen stappen met iets erin gaan mee', gelijk(padRijen({ versie: 1, stappen: { 1: { sterren: 0, opgelost: false }, 2: { sterren: 2, opgelost: true } } }), [{ stap: 2, sterren: 2, opgelost: true }]));
}

// Criterium 9: per voorkeur wint de nieuwste; de lijst om het bord reist niet mee.
{
  const v = { niveau: 2, kruisjes: true, rand: false, panelen: { legenda: true } };
  const t = { niveau: '2026-11-18T10:00:00Z', kruisjes: '2026-11-18T12:00:00Z' };
  const waarden = voorkeurWaarden(v, t);
  toets('criterium 9: de lijst om het bord gaat niet mee', !('rand' in waarden));
  toets('criterium 9: een voorkeur zonder keuzetijd gaat niet mee', !('panelen' in waarden));
  const rij = { niveau: 5, niveau_tijd: '2026-11-18T11:00:00Z', kruisjes: false, kruisjes_tijd: '2026-11-18T11:00:00Z' };
  const uit = voegVoorkeurenSamen(v, t, rij);
  toets('criterium 9: nieuwer niveau van elders wint', uit.voorkeuren.niveau === 5);
  toets('criterium 9: ouder kruisjes van elders verliest', uit.voorkeuren.kruisjes === true);
  toets('criterium 9: de lijst om het bord blijft van dit apparaat', uit.voorkeuren.rand === false);
}

// Criterium 17: onbekende sleutels, verkeerde types, een nieuwere versie.
{
  const lokaal = { p: bord({ solved: true }) };
  const rommel = [
    null, 'x', { puzzel_id: 7, opgelost: true, onthuld: false },
    { puzzel_id: 'q', opgelost: 'ja', onthuld: false },
    { puzzel_id: 'r', opgelost: true, onthuld: false, versie: 2 },
    { puzzel_id: 'x'.repeat(201), opgelost: true, onthuld: false },
    { puzzel_id: 'p', opgelost: false, onthuld: false, wat: 'onbekend' },
  ];
  const uit = voegPuzzelsSamen(lokaal, rommel);
  toets('criterium 17: rommel uit de database verandert niets', gelijk(uit, lokaal));
  toets('criterium 17: geen lijst is ook goed', gelijk(voegPuzzelsSamen(lokaal, null), lokaal));
  const pad = { versie: 1, stappen: { 1: { sterren: 1, opgelost: true } } };
  toets('criterium 17: verkeerde sterren worden genegeerd', voegPadSamen(pad, [{ stap: 1, sterren: 9, opgelost: true }, { stap: -1, sterren: 3, opgelost: true }]) === pad);
  const padNieuwer = { versie: 2, stappen: {} };
  toets('criterium 17: een pad van een nieuwere versie blijft onaangeroerd', voegPadSamen(padNieuwer, [{ stap: 1, sterren: 3, opgelost: true }]) === padNieuwer);
  const v = { niveau: 3, panelen: { legenda: true } };
  const t = { niveau: '2026-11-18T10:00:00Z' };
  const rij = { niveau: 99, niveau_tijd: '2026-11-19T10:00:00Z', panelen: { legenda: false, geheim: true }, panelen_tijd: '2026-11-19T10:00:00Z', kruisjes: 'aan', kruisjes_tijd: 'gisteren' };
  const uit2 = voegVoorkeurenSamen(v, t, rij);
  toets('criterium 17: een niveau buiten 1-6 wordt genegeerd', uit2.voorkeuren.niveau === 3);
  toets('criterium 17: een onbekend paneel valt weg, de rest telt', gelijk(uit2.voorkeuren.panelen, { legenda: false }));
  toets('criterium 17: kruisjes met een verkeerd type blijft onaangeroerd', !('kruisjes' in uit2.voorkeuren));
}

// ============================================================== een ronde
console.log('\n-- rondes met een nep-database');

// Criterium 5 en 4: B had al voortgang, logt in; A en B delen daarna alles.
{
  const db = nieuweDatabase();
  const a = nieuweOpslag({ 'vierdespoor.v1': { pA: bord({ solved: true }) } });
  const b = nieuweOpslag({ 'vierdespoor.v1': { pB: bord({ solved: true, onthuld: true }), half: bord() } });
  inloggen(a);
  await synchroniseer(db, a);
  inloggen(b);
  await synchroniseer(db, b);
  const vb = b.lees('vierdespoor.v1');
  toets('criterium 5: wat B al had staat in het account', db.puzzels.get('pB')?.onthuld === true);
  toets('criterium 5: wat het account had staat op B', vb.pA?.solved === true && vb.pA?.onthuld === false);
  toets('criterium 8: het halve bord van B is niet verstuurd', !db.puzzels.has('half'));
  toets('criterium 8: het halve bord van B is onaangeroerd', gelijk(vb.half, bord()));

  // A lost P op, meldt het, synchroniseert; B synchroniseert.
  const v1a = a.lees('vierdespoor.v1');
  v1a.P = bord({ solved: true });
  a.setItem('vierdespoor.v1', JSON.stringify(v1a));
  meldWijziging('puzzel', 'P', a);
  db.verzoeken.length = 0;
  await synchroniseer(db, a);
  toets('alleen wat veranderde wordt verstuurd', gelijk(db.verzoeken.filter(([s]) => s === 'puzzels').flatMap(([, r]) => r.map((x) => x.puzzel_id)), ['P']));
  await synchroniseer(db, b);
  toets('criterium 4: P opgelost op A staat opgelost op B', b.lees('vierdespoor.v1').P?.solved === true);
  toets('na een ronde staat er niets meer open', gelijk(leesMeta(a).open, {}));
}

// Criterium 9 over twee apparaten.
{
  const db = nieuweDatabase();
  const a = nieuweOpslag({ 'vierdespoor.voorkeuren': { niveau: 3, rand: true } });
  const b = nieuweOpslag({ 'vierdespoor.voorkeuren': { niveau: 1, rand: false } });
  inloggen(a); inloggen(b);
  await synchroniseer(db, a);
  await synchroniseer(db, b);
  a.setItem('vierdespoor.voorkeuren', JSON.stringify({ niveau: 6, rand: false }));
  meldWijziging('voorkeur', 'niveau', a);
  await synchroniseer(db, a);
  await synchroniseer(db, b);
  const vb = b.lees('vierdespoor.voorkeuren');
  toets('criterium 9: niveau van A staat op B', vb.niveau === 6);
  toets('criterium 9: de lijst om het bord op B is onveranderd', vb.rand === false);
}

// Criterium 7 over twee apparaten.
{
  const db = nieuweDatabase();
  const a = nieuweOpslag({ 'vierdespoor.pad': { versie: 1, stappen: { 3: { sterren: 2, opgelost: true } } } });
  const b = nieuweOpslag({ 'vierdespoor.pad': { versie: 1, stappen: { 3: { sterren: 3, opgelost: true } } } });
  inloggen(a); inloggen(b);
  await synchroniseer(db, a);
  await synchroniseer(db, b);
  await synchroniseer(db, a);
  toets('criterium 7: beide apparaten 3 sterren', a.lees('vierdespoor.pad').stappen['3'].sterren === 3 && b.lees('vierdespoor.pad').stappen['3'].sterren === 3);
}

// Criterium 10: offline. Spelen gaat door, er gaat niets verloren, en de
// volgende ronde verstuurt het alsnog.
{
  const db = nieuweDatabase();
  const a = nieuweOpslag({ 'vierdespoor.v1': {} });
  inloggen(a);
  await synchroniseer(db, a);
  const v1 = { X: bord({ solved: true }) };
  a.setItem('vierdespoor.v1', JSON.stringify(v1));
  meldWijziging('puzzel', 'X', a);
  db.stuk = true;
  let gegooid = false;
  try { await synchroniseer(db, a); } catch { gegooid = true; }
  toets('criterium 10: een mislukte ronde meldt zich bij de aanroeper', gegooid);
  toets('criterium 10: de lokale voortgang is onveranderd', gelijk(a.lees('vierdespoor.v1'), v1));
  toets('criterium 10: X staat nog open', 'X' in (leesMeta(a).open?.puzzels ?? {}));
  db.stuk = false;
  await synchroniseer(db, a);
  toets('criterium 10: de volgende ronde verstuurt X', db.puzzels.get('X')?.opgelost === true);
}

// Criterium 16: de database weigert; lokaal blijft alles staan.
{
  const db = nieuweDatabase();
  for (let i = 0; i < MAX_PUZZELS; i++) db.puzzels.set(`vol${i}`, { puzzel_id: `vol${i}`, opgelost: true, onthuld: false, bijgewerkt: '2026-11-01T00:00:00Z' });
  const v1 = { extra: bord({ solved: true }) };
  const a = nieuweOpslag({ 'vierdespoor.v1': v1 });
  inloggen(a);
  let gegooid = false;
  try { await synchroniseer(db, a); } catch { gegooid = true; }
  toets('criterium 16: meer dan 2.000 puzzels wordt geweigerd', !db.puzzels.has('extra'));
  toets('criterium 16: de lokale voortgang blijft staan', a.lees('vierdespoor.v1').extra?.solved === true && gelijk(a.lees('vierdespoor.v1').extra.plaats, v1.extra.plaats));
  toets('een vol account blokkeert het ophalen niet', !gegooid && a.lees('vierdespoor.v1').vol0?.solved === true);
}

// Verandert iets opnieuw terwijl een ronde onderweg is, dan blijft het open.
{
  const db = nieuweDatabase();
  const a = nieuweOpslag({ 'vierdespoor.v1': {} });
  inloggen(a);
  await synchroniseer(db, a);
  a.setItem('vierdespoor.v1', JSON.stringify({ P: bord({ solved: true, onthuld: true }) }));
  meldWijziging('puzzel', 'P', a);
  const tussendoor = {
    ...db,
    async bewaarPuzzels(rijen) {
      await db.bewaarPuzzels(rijen);
      // Tijdens het wachten: nu zelf opgelost.
      meldWijziging('puzzel', 'P', a);
    },
  };
  await synchroniseer(tussendoor, a);
  toets('een wijziging tijdens een ronde blijft open voor de volgende', 'P' in (leesMeta(a).open?.puzzels ?? {}));
  await synchroniseer(db, a);
  toets('de ronde daarna sluit hem', !('P' in (leesMeta(a).open?.puzzels ?? {})));
}

// Zonder sessie onthoudt een melding alleen de tijd van een voorkeur.
{
  const a = nieuweOpslag();
  meldWijziging('puzzel', 'P', a);
  meldWijziging('voorkeur', 'niveau', a);
  const m = leesMeta(a);
  toets('zonder account wordt er niets klaargezet om te versturen', !m.open);
  toets('zonder account wordt de tijd van een voorkeur wel onthouden', typeof m.tijden?.niveau === 'string');
}

toets('een 401 is een verlopen sessie', isSessieFout({ status: 401 }));
toets('een verwijzing naar een verwijderde gebruiker is een verlopen sessie', isSessieFout({ code: '23503' }));
toets('offline is geen verlopen sessie', !isSessieFout(new TypeError('Failed to fetch')));

// ======================================================== service_role
// De service_role-sleutel omzeilt Row Level Security. Hij hoort nergens in
// wat de browser laadt of in de server - alleen in het dashboard van
// Supabase. De docs, de spec en de migraties mogen het woord noemen (de
// migraties trekken er juist rechten mee in).
console.log('\n-- service_role');
{
  const wortel = fileURLToPath(new URL('..', import.meta.url));
  const plekken = ['src', 'server', 'worker', 'index.html', 'privacy.html'];
  const gevonden = [];
  const loop = (pad) => {
    let st;
    try { st = statSync(pad); } catch { return; }
    if (st.isDirectory()) { for (const n of readdirSync(pad)) loop(join(pad, n)); return; }
    if (!/\.(m?js|html|json|toml)$/.test(pad)) return;
    if (/service_role/.test(readFileSync(pad, 'utf8'))) gevonden.push(relative(wortel, pad));
  };
  for (const p of plekken) loop(join(wortel, p));
  toets(`service_role komt niet voor in ${plekken.join(', ')}${gevonden.length ? ` (wel in: ${gevonden.join(', ')})` : ''}`, gevonden.length === 0);
}

console.log(`\n${totaal - fouten}/${totaal} goed`);
process.exit(fouten ? 1 : 0);
