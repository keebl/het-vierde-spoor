// De genummerde oplossing van een kamerbord, in het Nederlands
// (specs/engine-extension.md, fase A stap 3).
//
// src/engine/redeneer.js levert een spoor: per stap een techniek, de
// aanwijzingen die hij gebruikte en de vakjes die afvielen. Dat is voor een
// mens te fijn: op niveau zes zijn het er honderd. Hier worden ze gebundeld
// tot stappen zoals in een puzzelboek: alles wat nodig is om de volgende
// persoon neer te zetten, en dan die persoon. "Bezet" (wie staat, houdt zijn
// rij en kolom) is spelregel, geen redenering, en krijgt geen eigen zin.
//
// Een zin noemt alleen wat op dit bord staat: de namen, de kamers, de
// meubels en de vakjes zoals ze langs de rand staan (rij A, kolom 3, vakje
// B3). Het slachtoffer heet hier wat de zaak het noemt ("het slachtoffer",
// "de vermiste"), nooit bij naam: dat het slachtoffer ergens staat, volgt
// uit de rest, en zo leest het ook (criterium 4).
//
// Een nieuwe soort aanwijzing (fase B) heeft hier niets nodig: een stap
// citeert de aanwijzing met zinVoor uit rooms-text.js. Een nieuwe techniek
// krijgt een eigen geval in zinnenVoorStap.

import { zinVoor } from './rooms-text.js';
import { telwoord, hoofdletter } from './woorden.js';
import { voorzetselVan } from './kamersoorten.js';

export const vakNaam = (n, cel) => `${String.fromCharCode(65 + Math.floor(cel / n))}${(cel % n) + 1}`;
const rijNaam = (l) => `rij ${String.fromCharCode(65 + l)}`;
const kolomNaam = (l) => `kolom ${l + 1}`;
const lijnNaam = (as, l) => (as === 'rij' ? rijNaam(l) : kolomNaam(l));

// "A2, B4 of C1"
function opsomming(woorden, voegwoord = 'of') {
  if (woorden.length <= 1) return woorden.join('');
  return `${woorden.slice(0, -1).join(', ')} ${voegwoord} ${woorden[woorden.length - 1]}`;
}

const zonderPunt = (zin) => zin.replace(/[.!?]$/, '');

function maakTaal(puzzle) {
  const { n, kamerVan, kamerNamen, personen, slachtofferIdx } = puzzle;
  const rol = puzzle.zaak?.rolwoord ?? 'het slachtoffer';
  const naam = (p) => (p === slachtofferIdx ? rol : personen[p]);
  const Naam = (p) => hoofdletter(naam(p));
  // Het slachtoffer ligt; de vermiste en de bestolene staan gewoon.
  const stond = (p) => (p === slachtofferIdx && rol === 'het slachtoffer' ? 'lag' : 'stond');
  const inKamer = (k) => `${voorzetselVan(kamerNamen[k])} ${kamerNamen[k]}`;
  const namen = (lijst) => opsomming(lijst.map(naam), 'en');
  const vak = (cel) => vakNaam(n, cel);
  const zin = (i) => zinVoor(puzzle._ruwe[i], puzzle.woorden);
  return { n, kamerVan, naam, Naam, stond, inKamer, namen, vak, zin, gezegd: new Set() };
}

// Wat er na een stap voor één persoon over is, in de woorden van het bord.
// kracht zegt hoeveel het de lezer vertelt: 2 = nog maar een paar vakjes, of
// één kamer, rij of kolom; 1 = een hele kamer of rij valt af; 0 = alleen een
// aantal vakjes. Een stap die alleen kracht 0 oplevert, slaat de tekst over:
// "voor Bram vallen negen vakjes af" helpt niemand verder, en op niveau zes
// zou de oplossing er honderd zinnen van krijgen.
function gevolg(t, p, over, weg) {
  const { n, kamerVan } = t;
  const zo = (kracht, tekst, vakjes = false) => ({ kracht, tekst, vakjes });
  if (over.length === 0) return zo(0, '');
  if (over.length === 1) return zo(2, `Voor ${t.naam(p)} blijft alleen ${t.vak(over[0])} over.`, true);
  if (over.length <= 4) return zo(2, `${t.Naam(p)} kan nog op ${opsomming(over.map(t.vak))} staan.`, true);
  const kamers = new Set(over.map((c) => kamerVan[c]));
  if (kamers.size === 1) return zo(2, `${t.Naam(p)} ${t.stond(p)} dus ergens ${t.inKamer([...kamers][0])}.`);
  const rijen = new Set(over.map((c) => Math.floor(c / n)));
  if (rijen.size === 1) return zo(2, `${t.Naam(p)} ${t.stond(p)} dus in ${rijNaam([...rijen][0])}.`);
  const kolommen = new Set(over.map((c) => c % n));
  if (kolommen.size === 1) return zo(2, `${t.Naam(p)} ${t.stond(p)} dus in ${kolomNaam([...kolommen][0])}.`);
  // Wat viel er af? Een hele kamer, rij of kolom zegt meer dan een getal.
  const wegKamers = new Set(weg.map((c) => kamerVan[c]));
  if (wegKamers.size === 1) {
    const k = [...wegKamers][0];
    if (!over.some((c) => kamerVan[c] === k)) return zo(1, `${t.Naam(p)} ${t.stond(p)} dus niet ${t.inKamer(k)}.`);
  }
  const wegRijen = new Set(weg.map((c) => Math.floor(c / n)));
  if (wegRijen.size === 1) {
    const r = [...wegRijen][0];
    if (!over.some((c) => Math.floor(c / n) === r)) return zo(1, `${t.Naam(p)} ${t.stond(p)} dus niet in ${rijNaam(r)}.`);
  }
  return zo(0, '');
}

function reden(t, r) {
  switch (r.soort) {
    case 'leeg': return `bleef er voor ${t.naam(r.p)} geen vakje over`;
    case 'lijn': return `kon niemand meer in ${lijnNaam(r.as, r.l)} staan`;
    case 'botsing': return `moesten ${t.namen(r.personen)} allebei in ${lijnNaam(r.as, r.l)} staan`;
    case 'aanwijzing': return `klopte ‘${zonderPunt(t.zin(r.i))}’ niet meer`;
    default: return 'liep het vast';
  }
}

// De zinnen van één spoorstap. dom is de stand ná de stap.
function zinnenVoorStap(t, s, dom) {
  // Wat al gezegd is, hoeft niet nog een keer: "Ischa stond dus ergens in
  // de kelderkast" na een tweede aanwijzing die daar niets aan verandert.
  const gevolgen = (vanaf, alleenVakjes = false) => s.geschrapt
    .map((g) => gevolg(t, g.p, dom[g.p], g.cellen))
    .filter((g) => g.kracht >= vanaf && (!alleenVakjes || g.vakjes) && !t.gezegd.has(g.tekst))
    .map((g) => { t.gezegd.add(g.tekst); return g.tekst; });
  switch (s.techniek) {
    case 'direct': {
      // Een aanwijzing letterlijk lezen staat al in de lijst; die komt hier
      // alleen terug als er daarna nog maar een paar vakjes over zijn
      // ("Bram stond naast het harnas. Bram kan nog op D2, E1 of F2
      // staan."). Anders werd de eerste stap een kopie van de lijst.
      const g = gevolgen(2, true);
      return g.length ? [t.zin(s.aanwijzingen[0]), ...g] : [];
    }
    case 'combineer':
    case 'relatie': {
      const g = gevolgen(1);
      if (!g.length) return [];
      return s.techniek === 'relatie'
        ? [t.zin(s.aanwijzingen[0]), 'Twee mensen staan nooit in dezelfde rij of kolom.', ...g]
        : [t.zin(s.aanwijzingen[0]), ...g];
    }
    case 'laatsteInLijn': {
      const { as, l, p } = s.lijn;
      return [`In ${lijnNaam(as, l)} kan alleen ${t.naam(p)} nog staan, dus ${t.naam(p)} ${t.stond(p)} daar.`, ...gevolgen(2)];
    }
    case 'kruispunt': {
      const { as, l, p } = s.lijn;
      return [hoofdletter(`${t.naam(p)} kan alleen nog in ${lijnNaam(as, l)} staan, dus daar stond niemand anders.`), ...gevolgen(2)];
    }
    case 'paar': {
      const { as, personen, lijnen, soort } = s.groep;
      const welke = opsomming(lijnen.map((l) => lijnNaam(as, l)), 'en');
      return soort === 'personen'
        ? [hoofdletter(`${t.namen(personen)} kunnen samen alleen in ${welke} staan, dus daar stond verder niemand.`)]
        : [`In ${welke} kunnen alleen ${t.namen(personen)} nog staan, dus die ${telwoord(personen.length)} stonden daar.`];
    }
    case 'telling': {
      const c = t.zin(s.aanwijzingen[0]);
      const { zeker, mogelijk, vol } = s.telling;
      if (vol) {
        return [c, zeker.length
          ? `Daar ${zeker.length === 1 ? 'stond' : 'stonden'} al ${t.namen(zeker)}, dus de anderen niet.`
          : 'Daar kan dus niemand meer bij.'];
      }
      return [c, mogelijk.length === 1
        ? `Alleen ${t.naam(mogelijk[0])} kan daar staan, dus ${t.naam(mogelijk[0])} ${t.stond(mogelijk[0])} daar.`
        : `Alleen ${t.namen(mogelijk)} kunnen daar staan, dus ze stonden er ${mogelijk.length === 2 ? 'allebei' : 'allemaal'}.`];
    }
    case 'aanname': {
      // Geen zin maar een proef: opeenvolgende proeven met dezelfde persoon
      // en dezelfde reden worden één zin (zie proefZin).
      const { p, cel, reden: r } = s.proef;
      return [{ proef: true, p, cellen: [cel], reden: reden(t, r) }];
    }
    default:
      return [];
  }
}

// De genummerde oplossing.
//
// uit is wat redeneer() teruggaf. Geeft { stappen, aanname } terug: elke
// stap { nr, zinnen, geplaatst: { p, cel } | null }. Loopt de solver vast
// (fase A staat dat toe), dan volgt een laatste stap met "Vanaf hier is een
// aanname nodig." en waar de rest stond; aanname is dan true.
export function oplossingInStappen(uit, puzzle) {
  const t = maakTaal(puzzle);
  const { n } = puzzle;
  const dom = [];
  for (let p = 0; p < puzzle.personen.length; p++) {
    const d = [];
    for (let cel = 0; cel < n * n; cel++) if (puzzle.vrij[cel]) d.push(cel);
    dom.push(d);
  }
  const stappen = [];
  let zinnen = [];
  // "Stel dat Puck op A3 stond ... Stel dat Puck op B2 stond ..." met
  // dezelfde reden is één gedachte: Puck kan op geen van die vakjes staan.
  const plakt = (stuk) => {
    const vorige = zinnen[zinnen.length - 1];
    return stuk.proef && vorige?.proef && vorige.p === stuk.p && vorige.reden === stuk.reden;
  };
  const voegToe = (stuk) => {
    if (plakt(stuk)) zinnen[zinnen.length - 1].cellen.push(...stuk.cellen);
    else zinnen.push(stuk);
  };
  // Elke gedachte (een aanwijzing en wat eruit volgt) begint een eigen regel
  // binnen de stap. Een eerste stap kon zes aanwijzingen nodig hebben voor
  // iemand vaststond, en dat werd één alinea die Guus (2026-11-18) niet
  // meer kon volgen. De stap blijft één nummer met de plaatsing vet aan het
  // eind; alleen de regels staan los. BLOK markeert waar een regel begint.
  const BLOK = { blok: true };
  const nieuweRegel = () => { if (zinnen.length && zinnen[zinnen.length - 1] !== BLOK) zinnen.push(BLOK); };
  const proefZin = (z) => {
    const waar = opsomming(z.cellen.map(t.vak));
    return hoofdletter(`stel dat ${t.naam(z.p)} op ${waar} ${t.stond(z.p)}. Dan ${z.reden}. ${t.Naam(z.p)} ${t.stond(z.p)} dus niet op ${waar}.`);
  };
  const sluit = (geplaatst, laatste = []) => {
    const regels = [[]];
    for (const z of zinnen) {
      if (z === BLOK) regels.push([]);
      else regels[regels.length - 1].push(z.proef ? proefZin(z) : z);
    }
    regels[regels.length - 1].push(...laatste);
    const schoon = regels.filter((r) => r.length);
    stappen.push({ nr: stappen.length + 1, zinnen: schoon.flat(), regels: schoon, geplaatst });
    zinnen = [];
  };
  for (const s of uit.stappen) {
    for (const g of s.geschrapt ?? []) {
      const weg = new Set(g.cellen);
      dom[g.p] = dom[g.p].filter((c) => !weg.has(c));
    }
    if (s.techniek === 'enigeVakje') {
      const { p, cel } = s.geplaatst;
      // "Voor Bram blijft alleen B3 over." en dan "Bram stond op B3" zegt
      // twee keer hetzelfde; de laatste zin wint.
      const dubbel = `Voor ${t.naam(p)} blijft alleen ${t.vak(cel)} over.`;
      zinnen = zinnen.filter((z) => z !== dubbel);
      // Zonder zinnen ervoor volgt de plek uit wie er al staat: rij en
      // kolom van de vorige zijn bezet. Zeg dat dan ook.
      const kamer = t.inKamer(t.kamerVan[cel]);
      sluit({ p, cel }, [zinnen.some((z) => z !== BLOK)
        ? `${t.Naam(p)} ${t.stond(p)} dus op ${t.vak(cel)}, ${kamer}.`
        : `Daarmee kan ${t.naam(p)} alleen nog op ${t.vak(cel)} staan, ${kamer}.`]);
      continue;
    }
    const stukken = zinnenVoorStap(t, s, dom);
    if (stukken.length && !plakt(stukken[0])) nieuweRegel();
    for (const stuk of stukken) voegToe(stuk);
  }
  let aanname = false;
  if (!uit.opgelost) {
    aanname = true;
    const rest = puzzle.oplossing
      .map((cel, p) => [p, cel])
      .filter(([p]) => uit.plaats[p] == null)
      .map(([p, cel]) => `${t.Naam(p)} ${t.stond(p)} op ${t.vak(cel)}, ${t.inKamer(t.kamerVan[cel])}.`);
    sluit(null, ['Vanaf hier is een aanname nodig.', ...rest]);
  } else if (zinnen.length) {
    sluit(null);
  }
  return { stappen, aanname };
}
