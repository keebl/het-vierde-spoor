// De menselijke solver van het kamerraster (specs/engine-extension.md, fase A).
//
// telPlaatsingen in rooms.js bewijst dat een puzzel precies één oplossing
// heeft, maar doet dat door te zoeken: hij probeert, loopt vast en gaat
// terug. Zo lost een mens het niet op, en daarom kon het spel tot nu toe
// niet laten zien hóé je op het antwoord komt, en ook niet zeggen of een
// puzzel moeilijk is of alleen lang.
//
// Deze solver werkt zoals een puzzelaar met een potlood: per persoon een
// lijstje vakjes waar die nog kan staan (hetzelfde mogelijkhedenraster als
// domeinenVan), en steeds één benoemde redenering die iets wegstreept of
// iemand neerzet. Elke redenering heeft een naam en een niveau (tier):
//
//   tier 1  direct        een aanwijzing over één persoon, letterlijk gelezen
//           enigeVakje    nog maar één vakje over: daar stond die persoon
//           bezet         wie staat, houdt zijn rij en kolom voor zich
//   tier 2  laatsteInLijn in deze rij (kolom) kan nog maar één persoon staan
//           combineer     een aanwijzing over twee mensen, naast wat er voor
//                         de ander nog over is
//   tier 3  kruispunt     iemand kan alleen nog in één rij (kolom): voor de
//                         anderen valt die rij af
//           paar          twee of drie mensen delen samen evenveel rijen
//                         (kolommen), of andersom
//           relatie       als combineer, maar ook: twee mensen staan nooit
//                         op dezelfde rij of kolom
//           telling       een telling ("in de keuken stonden twee mensen")
//                         naast wie er zeker of mogelijk staat
//   tier 4  aanname       stel dat iemand hier stond: loopt dat vast met
//                         tier 1-3, dan stond die er niet (diepte één)
//
// Wat er gebeurt, staat in een spoor: per stap de techniek, de aanwijzingen
// die hij gebruikte (hun plek in de lijst) en de vakjes die afvielen of de
// persoon die werd neergezet. Daar maakt src/content/redeneer-text.js de
// genummerde oplossing van, en uit het spoor volgt de moeilijkheidsgraad.
//
// Deze solver verandert niets aan een bord: hij leest alleen. Hij is ook
// niet het bewijs van uniciteit - dat blijft telPlaatsingen, en de keuring
// legt de twee naast elkaar (tools/check-redeneer.mjs). Een techniek die
// iets wegstreept wat in de oplossing staat, is een fout in deze file; de
// keuring valt daar op om met het puzzel-id en de techniek.
//
// Nieuwe soorten aanwijzingen (fase B, specs/props-and-either-clues.md)
// werken hier zonder aanpassing zolang ze een eval in SOORTEN hebben en
// personenIn ze kent: direct, combineer en relatie rekenen met eval, niet
// met een lijstje bekende soorten. Een telling over een gebied hoort in
// TELGEBIEDEN. Alleen een soort over drie of meer mensen ("Bram, Lies of
// Kees") valt buiten direct en combineer; die doet mee in de aanname, tot
// hij een eigen techniek krijgt.

import { evalAanwijzing, rijVan, kolVan, naastMeubel, beginDomeinen, personenIn } from './rooms.js';

export const TECHNIEKEN = {
  direct: { tier: 1 },
  enigeVakje: { tier: 1 },
  bezet: { tier: 1 },
  laatsteInLijn: { tier: 2 },
  combineer: { tier: 2 },
  kruispunt: { tier: 3 },
  paar: { tier: 3 },
  relatie: { tier: 3 },
  telling: { tier: 3 },
  aanname: { tier: 4 },
};

export const tierVan = (techniek) => TECHNIEKEN[techniek].tier;

// Tellingen over iedereen: welk gebied telt de aanwijzing? Een nieuwe
// telsoort hoeft alleen hier zijn gebied op te geven.
export const TELGEBIEDEN = {
  aantalKamer: (c, rooster) => {
    const uit = new Set();
    for (let i = 0; i < rooster.kamerVan.length; i++) if (rooster.kamerVan[i] === c.kamerIdx) uit.add(i);
    return uit;
  },
  aantalNaast: (c, rooster) => {
    const uit = new Set();
    for (let i = 0; i < rooster.kamerVan.length; i++) if (naastMeubel(rooster, i, c.m)) uit.add(i);
    return uit;
  },
};

// Een redenering die vaker niets oplevert dan wel, kost toch werk. Het
// budget telt toepassingen en evaluaties, geen milliseconden: dezelfde
// puzzel geeft op elke machine hetzelfde spoor (criterium 20). Gemeten op
// de keuringsset: de zwaarste (ruimteschip, niveau 4) had 4,9 miljoen nodig.
const STANDAARD_BUDGET = 20_000_000;

class OpBudget extends Error {}

// ------------------------------------------------------------------ stand

function maakStand(rooster, aanwijzingen, budget) {
  const n = rooster.n;
  const gebieden = aanwijzingen.map((c) => (TELGEBIEDEN[c.soort] ? TELGEBIEDEN[c.soort](c, rooster) : null));
  return {
    rooster,
    n,
    aanwijzingen,
    gebieden,
    personen: aanwijzingen.map(personenIn),
    dom: beginDomeinen(rooster),
    geplaatst: new Array(n).fill(null),
    // Rij en kolom van wie er staat, al weggestreept bij de anderen?
    bezetGedaan: new Array(n).fill(false),
    directGedaan: new Array(aanwijzingen.length).fill(false),
    // Per persoon een teller die ophoogt bij elke wijziging. Een aanwijzing
    // over twee mensen hoeft pas opnieuw bekeken als een van beiden is
    // veranderd sinds de vorige keer (zie combineer).
    versie: new Array(n).fill(0),
    gezien: { combineer: new Map(), relatie: new Map() },
    ctx: { rooster, plaats: new Array(n).fill(null) },
    werk: { gedaan: 0, budget },
  };
}

function kloon(st) {
  return {
    ...st,
    dom: st.dom.map((d) => new Set(d)),
    geplaatst: st.geplaatst.slice(),
    bezetGedaan: st.bezetGedaan.slice(),
    directGedaan: st.directGedaan.slice(),
    versie: st.versie.slice(),
    gezien: { combineer: new Map(st.gezien.combineer), relatie: new Map(st.gezien.relatie) },
    ctx: { rooster: st.rooster, plaats: new Array(st.n).fill(null) },
  };
}

function werk(st, hoeveel = 1) {
  st.werk.gedaan += hoeveel;
  if (st.werk.gedaan > st.werk.budget) throw new OpBudget();
}

// Streep vakjes weg en geef terug wat er echt afviel, per persoon.
function streep(st, wat) {
  const uit = [];
  for (const [p, cellen] of wat) {
    const weg = [];
    for (const cel of cellen) if (st.dom[p].delete(cel)) weg.push(cel);
    if (weg.length) {
      st.versie[p]++;
      uit.push({ p, cellen: weg.sort((a, b) => a - b) });
    }
  }
  return uit;
}

const evalMet = (st, c, toewijzing) => {
  const plaats = st.ctx.plaats;
  for (const [p, cel] of toewijzing) plaats[p] = cel;
  const uit = evalAanwijzing(c, st.ctx);
  for (const [p] of toewijzing) plaats[p] = null;
  return uit;
};

// ------------------------------------------------------------- technieken
//
// Elke techniek zoekt één toepassing die iets oplevert, voert hem uit en
// geeft de stap terug; levert hij nergens iets op, dan null. De solver
// begint na elke stap weer bij de goedkoopste, zoals een mens ook eerst
// weer naar het makkelijke kijkt als er iets is veranderd.

// Een aanwijzing over één persoon: welke vakjes laat hij over? En een
// telling van nul: daar stond niemand. Elke aanwijzing één keer.
function direct(st) {
  for (let i = 0; i < st.aanwijzingen.length; i++) {
    if (st.directGedaan[i]) continue;
    const c = st.aanwijzingen[i];
    const pers = st.personen[i];
    if (pers.length === 1) {
      st.directGedaan[i] = true;
      const [p] = pers;
      const weg = [];
      for (const cel of st.dom[p]) {
        werk(st);
        if (evalMet(st, c, [[p, cel]]) !== true) weg.push(cel);
      }
      const geschrapt = streep(st, [[p, weg]]);
      if (geschrapt.length) return { techniek: 'direct', aanwijzingen: [i], geschrapt };
    } else if (pers.length === 0 && st.gebieden[i] && c.aantal === 0) {
      st.directGedaan[i] = true;
      const gebied = st.gebieden[i];
      const geschrapt = streep(st, st.dom.map((d, p) => [p, [...d].filter((cel) => gebied.has(cel))]));
      if (geschrapt.length) return { techniek: 'direct', aanwijzingen: [i], geschrapt };
    }
  }
  return null;
}

function enigeVakje(st) {
  for (let p = 0; p < st.n; p++) {
    if (st.geplaatst[p] != null || st.dom[p].size !== 1) continue;
    const [cel] = st.dom[p];
    st.geplaatst[p] = cel;
    return { techniek: 'enigeVakje', aanwijzingen: [], geschrapt: [], geplaatst: { p, cel } };
  }
  return null;
}

function bezet(st) {
  const { n } = st;
  for (let p = 0; p < n; p++) {
    if (st.geplaatst[p] == null || st.bezetGedaan[p]) continue;
    st.bezetGedaan[p] = true;
    const cel = st.geplaatst[p];
    const r = rijVan(n, cel);
    const k = kolVan(n, cel);
    const wat = [];
    for (let q = 0; q < n; q++) {
      if (q === p) continue;
      wat.push([q, [...st.dom[q]].filter((x) => rijVan(n, x) === r || kolVan(n, x) === k)]);
    }
    const geschrapt = streep(st, wat);
    if (geschrapt.length) return { techniek: 'bezet', aanwijzingen: [], geschrapt, door: { p, cel } };
  }
  return null;
}

const lijnVan = (n, as, cel) => (as === 'rij' ? rijVan(n, cel) : kolVan(n, cel));

// Kan in deze rij nog maar één persoon staan, dan staat die daar: de rest
// van zijn vakjes valt af. Elke rij heeft precies één persoon.
function laatsteInLijn(st) {
  const { n } = st;
  for (const as of ['rij', 'kolom']) {
    for (let l = 0; l < n; l++) {
      let enige = -1;
      let aantal = 0;
      for (let p = 0; p < n; p++) {
        werk(st);
        let heeft = false;
        for (const cel of st.dom[p]) if (lijnVan(n, as, cel) === l) { heeft = true; break; }
        if (!heeft) continue;
        aantal++;
        enige = p;
        if (aantal > 1) break;
      }
      if (aantal !== 1) continue;
      const weg = [...st.dom[enige]].filter((cel) => lijnVan(n, as, cel) !== l);
      const geschrapt = streep(st, [[enige, weg]]);
      if (geschrapt.length) return { techniek: 'laatsteInLijn', aanwijzingen: [], geschrapt, lijn: { as, l, p: enige } };
    }
  }
  return null;
}

// Een aanwijzing over twee mensen: houd voor de een alleen de vakjes waar
// bij de ander nog een vakje past dat de aanwijzing waar maakt. Met
// metLijn telt ook dat ze niet op dezelfde rij of kolom kunnen staan
// (relatie); zonder alleen dat ze niet op hetzelfde vakje staan.
function paarAanwijzing(st, metLijn) {
  const { n } = st;
  const techniek = metLijn ? 'relatie' : 'combineer';
  const gezien = st.gezien[techniek];
  for (let i = 0; i < st.aanwijzingen.length; i++) {
    const pers = st.personen[i];
    if (pers.length !== 2) continue;
    const [p, q] = pers;
    const stempel = `${st.versie[p]},${st.versie[q]}`;
    if (gezien.get(i) === stempel) continue;
    const c = st.aanwijzingen[i];
    const past = (a, x, b, y) => {
      if (x === y) return false;
      if (metLijn && (rijVan(n, x) === rijVan(n, y) || kolVan(n, x) === kolVan(n, y))) return false;
      werk(st);
      return evalMet(st, c, [[a, x], [b, y]]) === true;
    };
    const steun = (a, b) => [...st.dom[a]].filter((x) => ![...st.dom[b]].some((y) => past(a, x, b, y)));
    const wegP = steun(p, q);
    const geschraptP = streep(st, [[p, wegP]]);
    const wegQ = steun(q, p);
    const geschrapt = [...geschraptP, ...streep(st, [[q, wegQ]])];
    gezien.set(i, `${st.versie[p]},${st.versie[q]}`);
    if (geschrapt.length) return { techniek, aanwijzingen: [i], geschrapt };
  }
  return null;
}

const combineer = (st) => paarAanwijzing(st, false);
const relatie = (st) => paarAanwijzing(st, true);

// Iemand kan alleen nog in één rij (kolom) staan: dan staat niemand anders
// daar. (De rij is van hem, ook al weet je nog niet op welk vakje.)
function kruispunt(st) {
  const { n } = st;
  for (let p = 0; p < n; p++) {
    if (st.geplaatst[p] != null || st.dom[p].size < 2) continue;
    for (const as of ['rij', 'kolom']) {
      werk(st);
      const lijnen = new Set([...st.dom[p]].map((cel) => lijnVan(n, as, cel)));
      if (lijnen.size !== 1) continue;
      const [l] = lijnen;
      const wat = [];
      for (let q = 0; q < n; q++) if (q !== p) wat.push([q, [...st.dom[q]].filter((x) => lijnVan(n, as, x) === l)]);
      const geschrapt = streep(st, wat);
      if (geschrapt.length) return { techniek: 'kruispunt', aanwijzingen: [], geschrapt, lijn: { as, l, p } };
    }
  }
  return null;
}

function* deelverzamelingen(lijst, k, begin = 0, voor = []) {
  if (voor.length === k) { yield voor; return; }
  for (let i = begin; i < lijst.length; i++) yield* deelverzamelingen(lijst, k, i + 1, [...voor, lijst[i]]);
}

// Twee (of drie) mensen die samen maar twee (drie) rijen hebben: die rijen
// zijn van hen, de rest valt daar af. En andersom: twee rijen waar maar
// twee mensen in passen - dan staan die twee daar, en nergens anders.
function paar(st) {
  const { n } = st;
  const open = [];
  for (let p = 0; p < n; p++) if (st.geplaatst[p] == null) open.push(p);
  for (const k of [2, 3]) {
    if (open.length <= k) continue;
    for (const as of ['rij', 'kolom']) {
      const lijnenVan = new Map(open.map((p) => [p, new Set([...st.dom[p]].map((cel) => lijnVan(n, as, cel)))]));
      for (const groep of deelverzamelingen(open, k)) {
        werk(st);
        const samen = new Set();
        for (const p of groep) for (const l of lijnenVan.get(p)) samen.add(l);
        if (samen.size !== k) continue;
        const wat = [];
        for (const q of open) if (!groep.includes(q)) wat.push([q, [...st.dom[q]].filter((x) => samen.has(lijnVan(n, as, x)))]);
        const geschrapt = streep(st, wat);
        if (geschrapt.length) return { techniek: 'paar', aanwijzingen: [], geschrapt, groep: { as, personen: groep, lijnen: [...samen].sort((a, b) => a - b), soort: 'personen' } };
      }
      // De verborgen kant: k open lijnen waar samen maar k mensen in passen.
      const openLijnen = [];
      for (let l = 0; l < n; l++) if (open.some((p) => lijnenVan.get(p).has(l)) && !st.geplaatst.some((cel) => cel != null && lijnVan(n, as, cel) === l)) openLijnen.push(l);
      for (const lijnen of deelverzamelingen(openLijnen, k)) {
        werk(st);
        const wie = open.filter((p) => lijnen.some((l) => lijnenVan.get(p).has(l)));
        if (wie.length !== k) continue;
        const set = new Set(lijnen);
        const geschrapt = streep(st, wie.map((p) => [p, [...st.dom[p]].filter((x) => !set.has(lijnVan(n, as, x)))]));
        if (geschrapt.length) return { techniek: 'paar', aanwijzingen: [], geschrapt, groep: { as, personen: wie, lijnen, soort: 'lijnen' } };
      }
    }
  }
  return null;
}

// Een telling naast het bord: staan er al zoveel zeker in het gebied, dan
// kan de rest er niet meer bij; kunnen er maar zoveel in, dan staan ze er
// allemaal.
function telling(st) {
  const { n } = st;
  for (let i = 0; i < st.aanwijzingen.length; i++) {
    const gebied = st.gebieden[i];
    if (!gebied) continue;
    const c = st.aanwijzingen[i];
    werk(st, n);
    const zeker = [];
    const mogelijk = [];
    for (let p = 0; p < n; p++) {
      let erin = false;
      let alles = true;
      for (const cel of st.dom[p]) { if (gebied.has(cel)) erin = true; else alles = false; }
      if (erin) mogelijk.push(p);
      if (erin && alles) zeker.push(p);
    }
    if (zeker.length === c.aantal) {
      const wat = mogelijk.filter((p) => !zeker.includes(p)).map((p) => [p, [...st.dom[p]].filter((x) => gebied.has(x))]);
      const geschrapt = streep(st, wat);
      if (geschrapt.length) return { techniek: 'telling', aanwijzingen: [i], geschrapt, telling: { zeker, mogelijk, vol: true } };
    }
    if (mogelijk.length === c.aantal) {
      const wat = mogelijk.map((p) => [p, [...st.dom[p]].filter((x) => !gebied.has(x))]);
      const geschrapt = streep(st, wat);
      if (geschrapt.length) return { techniek: 'telling', aanwijzingen: [i], geschrapt, telling: { zeker, mogelijk, vol: false } };
    }
  }
  return null;
}

// Is deze stand onmogelijk? Iemand zonder vakje, een rij of kolom waar
// niemand meer kan staan, twee mensen op één rij, een aanwijzing die niet
// meer klopt voor wie er al vaststaat, of een telling die niet meer kan.
// Geeft de reden terug, of null.
export function tegenspraak(st) {
  const { n } = st;
  for (let p = 0; p < n; p++) if (st.dom[p].size === 0) return { soort: 'leeg', p };
  for (const as of ['rij', 'kolom']) {
    const gedekt = new Array(n).fill(false);
    for (let p = 0; p < n; p++) for (const cel of st.dom[p]) gedekt[lijnVan(n, as, cel)] = true;
    const l = gedekt.indexOf(false);
    if (l >= 0) return { soort: 'lijn', as, l };
    const vast = new Map();
    for (let p = 0; p < n; p++) {
      if (st.dom[p].size !== 1) continue;
      const [cel] = st.dom[p];
      const lijn = lijnVan(n, as, cel);
      if (vast.has(lijn)) return { soort: 'botsing', as, l: lijn, personen: [vast.get(lijn), p] };
      vast.set(lijn, p);
    }
  }
  const plaats = st.ctx.plaats;
  for (let p = 0; p < n; p++) plaats[p] = st.dom[p].size === 1 ? [...st.dom[p]][0] : null;
  let uit = null;
  for (let i = 0; i < st.aanwijzingen.length && !uit; i++) {
    const c = st.aanwijzingen[i];
    const gebied = st.gebieden[i];
    if (gebied) {
      let zeker = 0;
      let mogelijk = 0;
      for (let p = 0; p < n; p++) {
        let erin = false;
        let alles = true;
        for (const cel of st.dom[p]) { if (gebied.has(cel)) erin = true; else alles = false; }
        if (erin) mogelijk++;
        if (erin && alles) zeker++;
      }
      if (zeker > c.aantal || mogelijk < c.aantal) uit = { soort: 'aanwijzing', i };
    } else if (evalAanwijzing(c, st.ctx) === false) {
      uit = { soort: 'aanwijzing', i };
    }
  }
  plaats.fill(null);
  return uit;
}

// Doorredeneren met tier 1 tot en met maxTier, zonder aanname, tot er niets
// meer verandert. Voor de aanname: daar telt alleen of het vastloopt.
const VOLGORDE = [
  ['direct', direct], ['enigeVakje', enigeVakje], ['bezet', bezet],
  ['laatsteInLijn', laatsteInLijn], ['combineer', combineer],
  ['kruispunt', kruispunt], ['telling', telling], ['relatie', relatie], ['paar', paar],
];

function volgendeStap(st, maxTier) {
  for (const [naam, techniek] of VOLGORDE) {
    if (tierVan(naam) > maxTier) continue;
    const stap = techniek(st);
    if (stap) return stap;
  }
  return null;
}

// Stel dat p op cel stond: loopt dat met tier 1-3 vast? Geeft de reden van
// vastlopen en de aanwijzingen die daarbij gebruikt werden, of null.
function probeer(st, p, cel) {
  const proef = kloon(st);
  proef.dom[p] = new Set([cel]);
  proef.versie[p]++;
  const gebruikt = new Set();
  for (;;) {
    const reden = tegenspraak(proef);
    if (reden) {
      if (reden.soort === 'aanwijzing') gebruikt.add(reden.i);
      return { reden, aanwijzingen: [...gebruikt].sort((a, b) => a - b) };
    }
    const stap = volgendeStap(proef, 3);
    if (!stap) return null;
    for (const i of stap.aanwijzingen) gebruikt.add(i);
  }
}

// Diepte één: zet iemand op proef op een vakje en redeneer door. Eerst de
// mensen met de minste vakjes (die proef is het kortst), dan op volgorde.
function aanname(st) {
  const { n } = st;
  const volgorde = [];
  for (let p = 0; p < n; p++) if (st.geplaatst[p] == null && st.dom[p].size > 1) volgorde.push(p);
  volgorde.sort((a, b) => st.dom[a].size - st.dom[b].size || a - b);
  for (const p of volgorde) {
    for (const cel of [...st.dom[p]].sort((a, b) => a - b)) {
      const uit = probeer(st, p, cel);
      if (!uit) continue;
      const geschrapt = streep(st, [[p, [cel]]]);
      return { techniek: 'aanname', aanwijzingen: uit.aanwijzingen, geschrapt, proef: { p, cel, reden: uit.reden } };
    }
  }
  return null;
}

const ALLE = [...VOLGORDE, ['aanname', aanname]];

// ------------------------------------------------------------------- solver

// Redeneer de puzzel op, als een mens. maxTier begrenst welke technieken
// mogen; budget telt werk (zie STANDAARD_BUDGET).
//
// Geeft terug:
//   opgelost   iedereen staat
//   stappen    het spoor: { nr, techniek, tier, aanwijzingen, geschrapt,
//              geplaatst?, ... } per stap
//   plaats     per persoon het vakje, of null wie nog niet staat
//   vast       null, of { tier } als er een techniek boven die tier nodig
//              is, of { budget: true } als het werk op was
//   graad      zie graadVan
export function redeneer(rooster, aanwijzingen, { maxTier = 4, budget = STANDAARD_BUDGET } = {}) {
  const st = maakStand(rooster, aanwijzingen, budget);
  const stappen = [];
  let vast = null;
  try {
    for (;;) {
      if (st.geplaatst.every((cel) => cel != null)) break;
      let stap = null;
      for (const [naam, techniek] of ALLE) {
        if (tierVan(naam) > maxTier) continue;
        stap = techniek(st);
        if (stap) break;
      }
      if (!stap) { vast = { tier: maxTier }; break; }
      stappen.push({ nr: stappen.length + 1, ...stap, tier: tierVan(stap.techniek) });
      if (st.dom.some((d) => d.size === 0)) { vast = { tegenspraak: true }; break; }
    }
  } catch (e) {
    if (!(e instanceof OpBudget)) throw e;
    vast = { budget: true };
  }
  const plaats = st.geplaatst.slice();
  return {
    opgelost: !vast && plaats.every((cel) => cel != null),
    stappen,
    plaats,
    dom: st.dom.map((d) => [...d].sort((a, b) => a - b)),
    vast,
    werk: st.werk.gedaan,
    graad: graadVan(stappen),
  };
}

// De moeilijkheid van een spoor.
//   lengte    het aantal redeneerstappen: alles behalve het letterlijk
//             lezen van een aanwijzing (direct), het neerzetten zelf
//             (enigeVakje) en het wegstrepen van een volle rij (bezet) -
//             dat is boekhouding, geen denkwerk
//   topTier   de zwaarste techniek die nodig was
//   zwaar     hoeveel stappen tier 3 of hoger waren
//   perTechniek  hoe vaak elke techniek voorkwam
const BOEKHOUDING = new Set(['direct', 'enigeVakje', 'bezet']);

export function graadVan(stappen) {
  const perTechniek = {};
  let topTier = 0;
  let zwaar = 0;
  let lengte = 0;
  for (const s of stappen) {
    perTechniek[s.techniek] = (perTechniek[s.techniek] ?? 0) + 1;
    const t = tierVan(s.techniek);
    if (t > topTier) topTier = t;
    if (t >= 3) zwaar++;
    if (!BOEKHOUDING.has(s.techniek)) lengte++;
  }
  return { lengte, topTier, zwaar, perTechniek };
}

// Losse technieken, voor de keuring: één toepassing op een gegeven stand.
// dom is een lijst van verzamelingen per persoon; geplaatst optioneel.
export function pasToe(techniek, rooster, aanwijzingen, dom, geplaatst = null) {
  const st = maakStand(rooster, aanwijzingen, STANDAARD_BUDGET);
  st.dom = dom.map((d) => new Set(d));
  if (geplaatst) st.geplaatst = geplaatst.slice();
  const f = Object.fromEntries(ALLE)[techniek];
  const stap = f(st);
  return { stap, dom: st.dom.map((d) => [...d].sort((a, b) => a - b)) };
}
