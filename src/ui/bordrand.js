// De lijst om het speurdokubord: geen plank eromheen, maar een nacht.
//
// Drie keer is hier om "meer leven" gevraagd, en drie keer kwam er iets
// terug dat netjes was en niets deed. De vierde keer werd duidelijk waarom.
// Er zijn twee oorzaken, en geen van beide los te maken met meer ornamenten.
//
//   1. ER WAS GEEN RUIMTE. De band was vierentwintig eenheden breed op een
//      vakje van zesenzeventig. Daar past een streep en een klinknagel in,
//      en verder niets. Een rand die leeft heeft diepte nodig: een verte,
//      een middengrond en iets vlak voor je neus. Dat gaat niet in een
//      derde van een vakje. De band is nu twee tot drie keer zo breed.
//
//   2. HET WAS DAGLICHT. Elke band was een materiaal in zijn eigen kleur,
//      gelijkmatig verlicht. Daarmee kun je een eiken lijst maken, maar
//      geen avond. Wat de voorbeelden die hiervoor langskwamen gemeen
//      hebben - een boomhuis in een nachtbos, een leeshoek met lantaarns,
//      een planeet boven een veld lichtgevende bloemen - is dat ze donker
//      zijn en dat het licht het onderwerp is. Niet de verlichting van het
//      onderwerp: het onderwerp zelf. Elk raampje, elke lantaarn, elke
//      vuurvlieg is een warme kern met een wijde halo eromheen.
//
// Daaruit volgen de zes regels waar elke wereld hieronder zich aan houdt:
//
//   - De band is nacht. Donker aan de buitenkant, iets minder donker naar
//     het bord toe, zodat het speelveld eruit komt in plaats van erin valt.
//   - Licht is een ding, geen eigenschap. Een lamp is een halo, een gloed
//     en een hete kern - drie cirkels, geen gele stip.
//   - Twee temperaturen. Warm goud tegen koel blauwgroen, en verder niets.
//     Alles wat warm is leeft; alles wat koel is is afstand.
//   - Vier lagen diep. Verte, silhouet, middengrond, voorgrond. Elke laag
//     verder weg is blauwer, vager en lager van contrast.
//   - Geen leeg plekje. Waar niets staat groeit iets overheen.
//   - Niets is recht. De binnenrand golft, elke tak kromt, elke rij wijkt.
//
// Technisch: elke band wordt getekend in zijn eigen stelsel, met x langs de
// band en y naar binnen toe. De vier kanten zijn dezelfde tekening, alleen
// anders gedraaid. Dat scheelt niet alleen werk - het is de enige manier om
// te voorkomen dat een hangplant op de rechterrand omhoog groeit.
//
// Alles hier is ruwe svg met eigen kleuren, niet de schildermotor uit
// geschilderd.js. Die zet vijf lagen per vorm, en op duizend blaadjes is dat
// vijfduizend knooppunten voor iets dat vier pixels groot is. De
// hoekornamenten en wat er aan de rand hangt gaan wel door die motor: die
// zijn groot genoeg om het te zien.

import { meng, zorgVoorPalet } from './geschilderd.js';
import { blad } from './vormen.js';

const NS = 'http://www.w3.org/2000/svg';
const el = (naam, attrs = {}) => {
  const n = document.createElementNS(NS, naam);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  return n;
};

// ---------------------------------------------------------------- toeval
//
// Dezelfde wereld moet elke keer dezelfde rand geven. Niet uit netheid: een
// rand die bij elke herteken ergens anders bloeit flikkert bij het oplossen,
// en de keuring kan er niets over zeggen.
function dobbel(zaad) {
  let s = 0;
  for (let i = 0; i < zaad.length; i++) s = (s * 31 + zaad.charCodeAt(i)) >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ----------------------------------------------------------------- gloed
//
// Een lamp is geen gele cirkel. Het is een wijde halo die bijna niets doet,
// een kleinere die wel wat doet, en een kern die bijna wit is. Pas met die
// drie bij elkaar leest het als licht in plaats van als verf.
//
// De halo's zijn verlopen, geen vervaging. Een filter per lampje is op een
// bord met veertig lampjes veertig keer een vervagingspas, en dat merk je.
const gloeiers = new Set();
function zorgVoorGloed(hex) {
  const naam = `gl-${hex.slice(1)}`;
  if (gloeiers.has(naam)) return naam;
  const defs = zorgVoorPalet();
  if (!defs.querySelector(`#${naam}`)) {
    const g = el('radialGradient', { id: naam });
    g.append(el('stop', { offset: '0%', 'stop-color': hex, 'stop-opacity': '0.92' }));
    g.append(el('stop', { offset: '22%', 'stop-color': hex, 'stop-opacity': '0.42' }));
    g.append(el('stop', { offset: '52%', 'stop-color': hex, 'stop-opacity': '0.13' }));
    g.append(el('stop', { offset: '100%', 'stop-color': hex, 'stop-opacity': '0' }));
    defs.append(g);
  }
  gloeiers.add(naam);
  return naam;
}

// ------------------------------------------------------------- de kwast
//
// Wat elke wereld te gebruiken krijgt. Alles rekent in bandstelsel: x loopt
// langs de band van 0 tot L, y van 0 aan de buitenkant tot d bij het bord.
// Boven d ligt het speelveld, dus alles met y groter dan d hangt eroverheen.
function kwast(g, L, d, zaad, kant = 'boven') {
  const rnd = dobbel(zaad);
  // Hoe vol de band mag staan. Een smalle band krijgt minder, want daar is
  // het detail toch niet te zien en het kost wel rekentijd bij elke klik.
  const dicht = Math.max(0.42, Math.min(1, (d / 84) ** 1.6));
  const rek = 1 / dicht;
  const R = (a = 1, b = 0) => b + rnd() * (a - b);
  const K = (lijst) => lijst[Math.floor(rnd() * lijst.length) % lijst.length];

  const bij = (n, attrs) => { g.append(el(n, attrs)); };

  return {
    L, d, R, K, kant, rek,
    g,
    // Hoeveel van iets er langs deze band komen: een per `deler` eenheden,
    // minder naarmate de band smaller is.
    n: (deler) => Math.max(1, Math.round((L / deler) * dicht)),
    // DE ZWAARTEKRACHT. De vier kanten zijn dezelfde tekening, meegedraaid
    // met de band. Voor klimop die naar binnen groeit klopt dat: die moet
    // op elke kant naar het bord toe wijzen. Voor een kaars klopt het niet,
    // en in de eerste versie hingen op drie van de vier kanten de vlammen
    // naar beneden.
    //
    // Alles wat je als ding herkent - een kaars, een pompoen, een uil, een
    // portret, een lantaarn aan een draad - wordt hierbinnen getekend en
    // draait de bandrotatie weer terug. Zo staat het op elke kant rechtop.
    // Teken daarin rond de oorsprong, met min-y naar boven.
    rechtop(x, y) {
      const draai = { boven: 0, rechts: 90, onder: 180, links: 270 }[kant] ?? 0;
      const n = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${-draai})` });
      g.append(n);
      return kwast(n, L, d, `${zaad}/op${Math.round(x)}-${Math.round(y)}`, kant);
    },

    // Een eigen laag, zodat een hele verte in één keer naar achteren kan.
    laag(klasse, o = 1) {
      const n = el('g', { class: klasse, opacity: o === 1 ? null : o });
      g.append(n);
      return kwast(n, L, d, `${zaad}/${klasse}`, kant);
    },
    vlak: (pad, kleur, o = 1) => bij('path', { d: pad, fill: kleur, opacity: o === 1 ? null : o }),
    streek: (pad, kleur, dik = 1, o = 1) => bij('path', {
      d: pad, stroke: kleur, 'stroke-width': dik, 'stroke-linecap': 'round', fill: 'none',
      opacity: o === 1 ? null : o,
    }),
    stip: (x, y, r, kleur, o = 1) => bij('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r, fill: kleur, opacity: o === 1 ? null : o }),
    ovaal: (x, y, rx, ry, kleur, o = 1) => bij('ellipse', { cx: x.toFixed(1), cy: y.toFixed(1), rx, ry, fill: kleur, opacity: o === 1 ? null : o }),

    // Licht. `kracht` schaalt de halo, `kern` de hete binnenkant.
    gloed(x, y, r, kleur, kracht = 1, kern = 1) {
      const id = zorgVoorGloed(kleur);
      bij('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (r * 2.6).toFixed(1), fill: `url(#${id})`, opacity: (0.5 * kracht).toFixed(2) });
      bij('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (r * 1.15).toFixed(1), fill: `url(#${id})`, opacity: (0.85 * kracht).toFixed(2) });
      if (kern > 0) {
        bij('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (r * 0.32 * kern).toFixed(1), fill: meng(kleur, '#ffffff', 0.72) });
      }
    },

    // Een vage wolk: nevel, waas, rook. Geen filter, een verloop.
    waas(x, y, r, kleur, o = 0.3) {
      const id = zorgVoorGloed(kleur);
      bij('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: r.toFixed(1), fill: `url(#${id})`, opacity: o });
    },

    // Een onregelmatige klont: mos, een rots, een boomkruin, een hoop.
    // `knobbels` is hoeveel bulten de bovenrand heeft; hoe meer, hoe meer
    // het op gebladerte lijkt en hoe minder op een steen.
    klont(x, y, b, h, knobbels = 5) {
      const punten = [];
      for (let i = 0; i <= knobbels; i++) {
        const t = i / knobbels;
        const px = x - b / 2 + b * t;
        const py = y - h * (0.45 + 0.55 * Math.sin(Math.PI * t)) * R(1.15, 0.6);
        punten.push([px, py]);
      }
      let pad = `M${(x - b / 2).toFixed(1)} ${y.toFixed(1)}`;
      for (let i = 0; i < punten.length; i++) {
        const [px, py] = punten[i];
        const vorige = i === 0 ? [x - b / 2, y] : punten[i - 1];
        pad += ` Q${((vorige[0] + px) / 2 + R(3, -3)).toFixed(1)} ${(Math.min(vorige[1], py) - R(h * 0.3, 0)).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)}`;
      }
      return `${pad} L${(x + b / 2).toFixed(1)} ${y.toFixed(1)} Z`;
    },

    // Een silhouet dat over de hele band doorloopt: een boomlijn, een
    // daklijn, een bergkam. Dit is wat diepte geeft - zonder een laag die
    // helemaal doorloopt blijft het losse plaatjes naast elkaar.
    kam(basis, amp, periode, scherp = 0) {
      let pad = `M0 0 L0 ${basis.toFixed(1)}`;
      let x = 0;
      while (x < L) {
        const stap = periode * R(1.4, 0.6);
        const nx = Math.min(L, x + stap);
        const ny = basis - amp * R(1, 0.15);
        if (scherp > 0 && R() < scherp) {
          pad += ` L${((x + nx) / 2).toFixed(1)} ${ny.toFixed(1)} L${nx.toFixed(1)} ${(basis - amp * R(0.5, 0)).toFixed(1)}`;
        } else {
          pad += ` Q${((x + nx) / 2).toFixed(1)} ${ny.toFixed(1)} ${nx.toFixed(1)} ${(basis - amp * R(0.6, 0.05)).toFixed(1)}`;
        }
        x = nx;
      }
      return `${pad} L${L.toFixed(1)} 0 Z`;
    },

    // Een blad op zijn plek, met een nerf erin als het groot genoeg is.
    loof(x, y, lang, breed, hoek, kleur, o = 1) {
      bij('path', { d: blad(x, y, lang, breed, hoek), fill: kleur, opacity: o === 1 ? null : o });
      if (lang > 7) {
        const r = (hoek * Math.PI) / 180;
        bij('path', {
          d: `M${x.toFixed(1)} ${y.toFixed(1)} l${(Math.cos(r) * lang).toFixed(1)} ${(Math.sin(r) * lang).toFixed(1)}`,
          stroke: meng(kleur, '#ffffff', 0.35), 'stroke-width': 0.5, opacity: 0.4 * o, fill: 'none',
        });
      }
    },

    // Een rank die vanaf de band naar binnen hangt, met blad eraan. Dit is
    // het ding waar het eerder op stukliep: een steel met wat groen is geen
    // hangplant. Er moeten veel bladeren aan, ze moeten groot genoeg zijn,
    // en de steel moet dun zijn en krommen.
    rank(x, y0, lengte, kleuren, { dik = 1.3, blaadjes = 9, bloem = null } = {}) {
      const zwaai = R(16, -16);
      const pad = `M${x.toFixed(1)} ${y0.toFixed(1)} Q${(x + zwaai).toFixed(1)} ${(y0 + lengte * 0.55).toFixed(1)} ${(x + zwaai * 1.5).toFixed(1)} ${(y0 + lengte).toFixed(1)}`;
      bij('path', { d: pad, stroke: kleuren[0], 'stroke-width': dik, fill: 'none', 'stroke-linecap': 'round' });
      for (let i = 1; i <= blaadjes; i++) {
        const t = i / (blaadjes + 1);
        const bx = x + zwaai * (2 * t * (1 - t) + t * t * 1.5);
        const by = y0 + lengte * t;
        const kant = i % 2 ? 1 : -1;
        const lang = (5.5 + R(4, 0)) * (0.55 + t * 0.75);
        this.loof(bx, by, lang, lang * 0.46, kant > 0 ? R(55, 10) : R(170, 125), K(kleuren.slice(1)), R(1, 0.78));
      }
      if (bloem) {
        const bx = x + zwaai * 1.5;
        const by = y0 + lengte;
        this.gloed(bx, by, bloem.r ?? 3.4, bloem.kleur, 0.9);
      }
    },

    // Vuurvliegen, sneeuw, vonken, stof in een lichtbundel. Honderden
    // kleine dingen die niets voorstellen en alles doen.
    spikkels(aantal, kleuren, { y0 = 0, y1 = d, groot = 1.7, halo = 0.55 } = {}) {
      for (let i = 0; i < aantal; i++) {
        const x = R(L, 0);
        const y = y0 + (y1 - y0) * R();
        const kleur = K(kleuren);
        const r = R(groot, groot * 0.3);
        if (R() < halo) {
          const id = zorgVoorGloed(kleur);
          bij('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: (r * 4).toFixed(1), fill: `url(#${id})`, opacity: R(0.5, 0.18).toFixed(2) });
        }
        bij('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: r.toFixed(1), fill: meng(kleur, '#ffffff', 0.45), opacity: R(1, 0.5).toFixed(2) });
      }
    },
  };
}

// ------------------------------------------------------------ de werelden
//
// `kern`, `koel` en `warm` zijn de drie kleuren van de band zelf: wat hij is,
// waar hij het donkerst is en waar het licht hem raakt. `verf` is de
// schildering erop, van achteren naar voren.
//
// De kern is overal donker. Dat is geen smaak maar rekenwerk: gloed is
// opgeteld licht, en op een lichte ondergrond telt er niets bij op. Een
// lantaarn op beige is een gele vlek; dezelfde lantaarn op nachtblauw is een
// lantaarn.

export const RANDSTIJLEN = {
  // Het Verstilde Woud bij nacht.
  //
  // Dit is geen patroon maar een plaat: vier kanten die samen een scene
  // vormen, met de hand neergezet. De vorige versie strooide om de zoveel
  // eenheden een lantaarn, een varen en een zwam langs de band, en dat
  // levert op alle vier de kanten dezelfde rij op.
  //
  // HOE DE VIER KANTEN IN ELKAAR ZITTEN. Elke band wordt getekend in zijn
  // eigen stelsel - x langs de band, y naar het bord toe - en meegedraaid.
  // Voor een plaat moet je weten waar in dat stelsel "beneden" zit, want
  // de zwaartekracht draait niet mee:
  //
  //   BOVEN   y=0 is de bovenkant van de pagina, y=d het bord. Beneden is
  //           dus +y. Hier hangt alles: de kruin, een tak die helemaal
  //           overloopt met lantaarns eraan, en een uil erop.
  //   ONDER   y=0 is de ónderkant van de pagina, y=d het bord. Beneden is
  //           -y. De grond ligt dus bij y=0: water, oever, keien, riet en
  //           een vos die naar het bord kijkt.
  //   LINKS   x=0 is de onderkant van de pagina, x=L de bovenkant. Beneden
  //           is -x. Een stam loopt hier van onder naar boven door de hele
  //           kant, met een hol erin waar licht uit komt.
  //   RECHTS  x=0 is de bovenkant, x=L de onderkant. Beneden is +x. Een
  //           berk loopt door, met varens en lichtzwammen aan de voet.
  //
  // `rechtop(x, y)` draait de banddraaiing terug: daarbinnen is -y altijd
  // omhoog op de pagina. Alles wat je als ding herkent gaat daardoorheen.
  // Zonder dat stonden de kaarsen op drie van de vier kanten op hun kop.
  //
  // De plekken zijn breuken van de zijde, de maten breuken van de
  // banddikte, dus de compositie blijft staan of het bord nu vier of
  // twaalf vakjes breed is.
  woud: {
    kern: '#16251b', koel: '#060d0a', warm: '#cfe8a0', textuur: 'nerf', ruw: 0.2, stap: 44,
    gloed: '#ffc168',
    verf(b) {
      const { d, L, R, K, n } = b;
      const s = d / 100;
      const ver = b.laag('randver', 0.62);
      const mid = b.laag('randmid');
      const voor = b.laag('randvoor');

      // -------------------------------------------------- losse tekeningen
      // Elk stuk tekent rond zijn eigen nulpunt, met -y naar boven. Ze
      // worden hieronder met de hand neergezet, niet in een lus.
      const lantaarn = (o, m) => {
        o.gloed(0, 0, 11 * m, '#ffc168', 1.35);
        o.vlak(`M${(-6 * m).toFixed(1)} ${(-7 * m).toFixed(1)} L${(6 * m).toFixed(1)} ${(-7 * m).toFixed(1)} L${(4.4 * m).toFixed(1)} ${(7 * m).toFixed(1)} L${(-4.4 * m).toFixed(1)} ${(7 * m).toFixed(1)} Z`, '#ffe6b4', 0.72);
        o.streek(`M${(-6.6 * m).toFixed(1)} ${(-7 * m).toFixed(1)} h${(13.2 * m).toFixed(1)}`, '#4a3a22', 2.4 * m);
        o.streek(`M${(-5 * m).toFixed(1)} ${(7 * m).toFixed(1)} h${(10 * m).toFixed(1)}`, '#4a3a22', 2 * m);
        o.streek(`M0 ${(-7 * m).toFixed(1)} v${(14 * m).toFixed(1)}`, '#4a3a22', 1.1 * m);
        o.streek(`M${(-6.6 * m).toFixed(1)} ${(-7.6 * m).toFixed(1)} h${(13.2 * m).toFixed(1)}`, '#d8b070', 0.9 * m, 0.8);
        o.waas(0, 16 * m, 28 * m, '#ffc168', 0.34);
      };
      const varen = (o, m, kleur) => {
        for (let v = -3; v <= 3; v++) {
          const hk = ((-90 + v * 20) * Math.PI) / 180;
          const lg = (26 - Math.abs(v) * 3) * m;
          o.streek(`M0 0 q${(Math.cos(hk) * lg * 0.6).toFixed(1)} ${(Math.sin(hk) * lg * 0.5).toFixed(1)} ${(Math.cos(hk) * lg).toFixed(1)} ${(Math.sin(hk) * lg).toFixed(1)}`, kleur, 2.4 * m, 0.92);
        }
      };
      const zwam = (o, m, kleur) => {
        o.gloed(0, 0, 6 * m, kleur, 1.1);
        o.vlak(`M${(-7 * m).toFixed(1)} 0 Q0 ${(-11 * m).toFixed(1)} ${(7 * m).toFixed(1)} 0 Z`, meng(kleur, '#ffffff', 0.6), 0.95);
        o.streek(`M0 0 v${(6 * m).toFixed(1)}`, meng(kleur, '#ffffff', 0.25), 2.4 * m, 0.8);
      };
      const kei = (o, m) => {
        o.vlak(`M${(-18 * m).toFixed(1)} 0 q${(-3 * m).toFixed(1)} ${(-12 * m).toFixed(1)} ${(7 * m).toFixed(1)} ${(-15 * m).toFixed(1)} q${(13 * m).toFixed(1)} ${(-4 * m).toFixed(1)} ${(18 * m).toFixed(1)} ${(6 * m).toFixed(1)} q${(5 * m).toFixed(1)} ${(6 * m).toFixed(1)} ${(-2 * m).toFixed(1)} ${(9 * m).toFixed(1)} Z`, '#3c4a42');
        o.streek(`M${(-13 * m).toFixed(1)} ${(-9 * m).toFixed(1)} q${(10 * m).toFixed(1)} ${(-6 * m).toFixed(1)} ${(20 * m).toFixed(1)} ${(-m).toFixed(1)}`, '#8ba393', 2 * m, 0.65);
        o.vlak(`M${(-14 * m).toFixed(1)} ${(-11 * m).toFixed(1)} q${(8 * m).toFixed(1)} ${(-5 * m).toFixed(1)} ${(15 * m).toFixed(1)} ${(-m).toFixed(1)} q${(-7 * m).toFixed(1)} ${(5 * m).toFixed(1)} ${(-15 * m).toFixed(1)} ${m.toFixed(1)} Z`, '#4e8a4a', 0.8);
      };
      // Een stam als lange baan: dit is een bandvorm, geen rechtop-ding. Hij
      // loopt van het ene eind van de kant naar het andere.
      const baan = (laag, yMid, breed, bocht, kleuren) => {
        const [romp, licht, donker] = kleuren;
        const y0 = yMid - breed / 2;
        const y1 = yMid + breed / 2;
        laag.vlak(`M0 ${y0.toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(y0 + bocht).toFixed(1)} ${L.toFixed(1)} ${y0.toFixed(1)} L${L.toFixed(1)} ${y1.toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(y1 + bocht).toFixed(1)} 0 ${y1.toFixed(1)} Z`, romp);
        laag.streek(`M0 ${(y0 + breed * 0.16).toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(y0 + bocht + breed * 0.16).toFixed(1)} ${L.toFixed(1)} ${(y0 + breed * 0.16).toFixed(1)}`, licht, breed * 0.11, 0.55);
        laag.streek(`M0 ${(y1 - breed * 0.1).toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(y1 + bocht - breed * 0.1).toFixed(1)} ${L.toFixed(1)} ${(y1 - breed * 0.1).toFixed(1)}`, donker, breed * 0.16, 0.6);
        for (let k = 1; k < 7; k++) {
          const t = k / 7;
          laag.streek(`M${(L * t).toFixed(1)} ${(y0 + breed * 0.3).toFixed(1)} q${(L * 0.03).toFixed(1)} ${(breed * 0.18).toFixed(1)} 0 ${(breed * 0.4).toFixed(1)}`, donker, breed * 0.05, 0.4);
        }
      };

      // ------------------------------------------------------------- BOVEN
      if (b.kant === 'boven') {
        ver.waas(L * 0.2, d * 0.3, d * 1.3, '#2f7f72', 0.5);
        ver.waas(L * 0.62, d * 0.2, d * 1.1, '#1f5f7a', 0.45);
        ver.vlak(ver.kam(d * 0.26, d * 0.2, 110), '#24605a');
        ver.spikkels(n(26), ['#cfe8ff', '#9ff0b4'], { y1: d * 0.3, groot: 1.3, halo: 0.3 });
        mid.vlak(mid.kam(d * 0.42, d * 0.24, 62), '#1a3f28');
        for (let x = -20; x < L + 20; x += 44) {
          mid.vlak(mid.klont(x, d + 4, 88 * s, R(d * 0.26, d * 0.1), 7), '#17331c');
        }
        // De twee stammen komen hier de plaat in en lopen door in de zijkanten.
        for (const [tx, br] of [[0.1, 30 * s], [0.93, 21 * s]]) {
          const x = L * tx;
          mid.vlak(`M${(x - br / 2).toFixed(1)} ${(-4).toFixed(1)} Q${(x - br * 0.8).toFixed(1)} ${(d * 0.5).toFixed(1)} ${(x - br * 0.62).toFixed(1)} ${(d + 6).toFixed(1)} L${(x + br * 0.68).toFixed(1)} ${(d + 6).toFixed(1)} Q${(x + br * 0.74).toFixed(1)} ${(d * 0.5).toFixed(1)} ${(x + br / 2).toFixed(1)} -4 Z`, '#2e2118');
          mid.streek(`M${(x - br * 0.28).toFixed(1)} -4 Q${(x - br * 0.5).toFixed(1)} ${(d * 0.5).toFixed(1)} ${(x - br * 0.4).toFixed(1)} ${(d + 6).toFixed(1)}`, '#8a6c40', br * 0.12, 0.6);
          mid.streek(`M${(x + br * 0.32).toFixed(1)} -4 Q${(x + br * 0.44).toFixed(1)} ${(d * 0.5).toFixed(1)} ${(x + br * 0.36).toFixed(1)} ${(d + 6).toFixed(1)}`, '#0c0906', br * 0.18, 0.65);
        }

        // De tak: een boog over de hele breedte, laag genoeg dat de uil die
        // erop zit nog binnen de plaat past.
        const takY = (t) => d * 0.76 + (d * 0.52 - d * 0.76) * 2 * t * (1 - t) + (d * 0.7 - d * 0.76) * t * t;
        const tak = `M${(L * 0.1).toFixed(1)} ${(d * 0.76).toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(d * 0.52).toFixed(1)} ${L.toFixed(1)} ${(d * 0.7).toFixed(1)}`;
        voor.streek(tak, '#120d08', 14 * s, 1);
        voor.streek(tak, '#3f3020', 10 * s, 1);
        voor.streek(`M${(L * 0.1).toFixed(1)} ${(d * 0.728).toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(d * 0.488).toFixed(1)} ${L.toFixed(1)} ${(d * 0.668).toFixed(1)}`, '#9a7c4c', 2.6 * s, 0.8);
        for (const t of [0.17, 0.36, 0.58, 0.88]) {
          voor.streek(`M${(L * t).toFixed(1)} ${takY(t).toFixed(1)} q${(8 * s).toFixed(1)} ${(-16 * s).toFixed(1)} ${(24 * s).toFixed(1)} ${(-26 * s).toFixed(1)}`, '#3f3020', 3.6 * s, 0.95);
        }
        // Drie lantaarns aan de tak, elk op een andere hoogte.
        for (const [t, val, m] of [[0.26, 0.13, 2.1], [0.47, 0.19, 1.7], [0.8, 0.09, 1.9]]) {
          const x = L * t;
          const y = takY(t) + d * val;
          voor.streek(`M${x.toFixed(1)} ${takY(t).toFixed(1)} Q${(x + 3).toFixed(1)} ${((takY(t) + y) / 2).toFixed(1)} ${x.toFixed(1)} ${(y - 9 * s * m).toFixed(1)}`, '#3a2d1c', 1.8 * s, 0.95);
          lantaarn(voor.rechtop(x, y), s * m);
        }
        voor.rank(L * 0.64, d * 0.6, d * 0.4, ['#3c5a2c', '#5a9c44', '#79c456', '#46763a', '#66ad4c'], { blaadjes: 13, bloem: { kleur: '#b88cff', r: 3.4 } });
        voor.rank(L * 0.37, d * 0.62, d * 0.32, ['#3c5a2c', '#5a9c44', '#79c456', '#46763a'], { blaadjes: 9 });
        for (let i = 0; i < n(26); i++) {
          const t = R();
          voor.loof(L * t, takY(t) + R(12, -14) * s, R(19, 11) * s, R(8, 4.6) * s, R(220, -40), K(['#3a6b36', '#4c8a40', '#2c5630', '#5da348']), R(1, 0.78));
        }
        // De uil, op de tak, rechts van het midden.
        const uh = 21 * s;
        const u = voor.rechtop(L * 0.7, takY(0.7) + 2 * s);
        u.waas(0, -uh, uh * 2.6, '#ffc168', 0.3);
        u.vlak(`M0 ${(-uh * 2).toFixed(1)} q${(uh * 0.82).toFixed(1)} 0 ${(uh * 0.82).toFixed(1)} ${uh.toFixed(1)} q0 ${uh.toFixed(1)} ${(-uh * 0.82).toFixed(1)} ${uh.toFixed(1)} q${(-uh * 0.82).toFixed(1)} 0 ${(-uh * 0.82).toFixed(1)} ${(-uh).toFixed(1)} q0 ${(-uh).toFixed(1)} ${(uh * 0.82).toFixed(1)} ${(-uh).toFixed(1)} Z`, '#6e6246');
        u.vlak(`M${(-uh * 0.74).toFixed(1)} ${(-uh * 1.62).toFixed(1)} l${(-uh * 0.12).toFixed(1)} ${(-uh * 0.66).toFixed(1)} l${(uh * 0.6).toFixed(1)} ${(uh * 0.26).toFixed(1)} Z`, '#6e6246');
        u.vlak(`M${(uh * 0.74).toFixed(1)} ${(-uh * 1.62).toFixed(1)} l${(uh * 0.12).toFixed(1)} ${(-uh * 0.66).toFixed(1)} l${(-uh * 0.6).toFixed(1)} ${(uh * 0.26).toFixed(1)} Z`, '#6e6246');
        u.streek(`M${(-uh * 0.8).toFixed(1)} ${(-uh * 1.45).toFixed(1)} q${(-uh * 0.12).toFixed(1)} ${uh.toFixed(1)} ${(uh * 0.3).toFixed(1)} ${(uh * 1.32).toFixed(1)}`, '#e8d4a0', 2.6 * s, 0.8);
        u.streek(`M0 ${(-uh * 2).toFixed(1)} q${(uh * 0.82).toFixed(1)} 0 ${(uh * 0.82).toFixed(1)} ${uh.toFixed(1)} q0 ${uh.toFixed(1)} ${(-uh * 0.82).toFixed(1)} ${uh.toFixed(1)} q${(-uh * 0.82).toFixed(1)} 0 ${(-uh * 0.82).toFixed(1)} ${(-uh).toFixed(1)} q0 ${(-uh).toFixed(1)} ${(uh * 0.82).toFixed(1)} ${(-uh).toFixed(1)} Z`, '#15120c', 1.8 * s, 0.9);
        u.vlak(`M${(-uh * 0.52).toFixed(1)} ${(-uh * 0.5).toFixed(1)} q${(uh * 0.52).toFixed(1)} ${(uh * 0.72).toFixed(1)} ${(uh * 1.04).toFixed(1)} 0 q${(-uh * 0.52).toFixed(1)} ${(uh * 0.52).toFixed(1)} ${(-uh * 1.04).toFixed(1)} 0 Z`, '#332c20');
        u.vlak(`M${(-uh * 0.56).toFixed(1)} ${(-uh * 1.3).toFixed(1)} q${(uh * 0.56).toFixed(1)} ${(-uh * 0.3).toFixed(1)} ${(uh * 1.12).toFixed(1)} 0 q${(-uh * 0.56).toFixed(1)} ${(uh * 0.5).toFixed(1)} ${(-uh * 1.12).toFixed(1)} 0 Z`, '#7b6e50');
        u.gloed(-uh * 0.34, -uh * 1.24, uh * 0.2, '#ffd04a', 1.2);
        u.gloed(uh * 0.34, -uh * 1.24, uh * 0.2, '#ffd04a', 1.2);
        u.vlak(`M0 ${(-uh * 1.02).toFixed(1)} l${(-uh * 0.17).toFixed(1)} ${(uh * 0.29).toFixed(1)} h${(uh * 0.34).toFixed(1)} Z`, '#f0bc52');
      }

      // ------------------------------------------------------------- ONDER
      // De grond ligt hier bij y=0, aan de onderkant van de pagina: eerst
      // water, dan de oever, en pas daarna het bord.
      if (b.kant === 'onder') {
        ver.waas(L * 0.4, d * 0.7, d * 1.3, '#1f5f7a', 0.5);
        ver.vlak(ver.kam(d * 0.3, d * 0.18, 120), '#24605a');
        // De verre oever, tegen het bord aan.
        mid.vlak(`M0 ${(d + 4).toFixed(1)} H${L.toFixed(1)} V${(d * 0.34).toFixed(1)} Q${(L * 0.72).toFixed(1)} ${(d * 0.46).toFixed(1)} ${(L * 0.45).toFixed(1)} ${(d * 0.36).toFixed(1)} Q${(L * 0.2).toFixed(1)} ${(d * 0.28).toFixed(1)} 0 ${(d * 0.4).toFixed(1)} Z`, '#1a3f28');
        for (let x = -20; x < L + 20; x += 46) {
          mid.vlak(mid.klont(x, d + 4, 92 * s, R(d * 0.24, d * 0.1), 7), '#17331c');
        }
        // Het water, aan de onderkant van de pagina.
        mid.vlak(`M0 ${(d * 0.34).toFixed(1)} Q${(L * 0.2).toFixed(1)} ${(d * 0.24).toFixed(1)} ${(L * 0.45).toFixed(1)} ${(d * 0.32).toFixed(1)} Q${(L * 0.72).toFixed(1)} ${(d * 0.42).toFixed(1)} ${L.toFixed(1)} ${(d * 0.3).toFixed(1)} V-4 H0 Z`, '#143a4e');
        mid.streek(`M0 ${(d * 0.34).toFixed(1)} Q${(L * 0.2).toFixed(1)} ${(d * 0.24).toFixed(1)} ${(L * 0.45).toFixed(1)} ${(d * 0.32).toFixed(1)} Q${(L * 0.72).toFixed(1)} ${(d * 0.42).toFixed(1)} ${L.toFixed(1)} ${(d * 0.3).toFixed(1)}`, '#8fe4f2', 1.8 * s, 0.5);
        for (let k = 0; k < 12; k++) {
          const t = (k + 0.5) / 12;
          mid.ovaal(L * t, d * (0.22 - (k % 3) * 0.06), L * 0.05, 2.2 * s, '#8fe4f2', 0.24);
        }
        // De lantaarns van de bovenkant weerkaatsen in het water. Ze staan
        // op de spiegelplek van de tak, want daar hangen ze.
        for (const t of [0.2, 0.53, 0.74]) {
          mid.ovaal(L * t, d * 0.18, 9 * s, 20 * s, '#ffc168', 0.22);
          mid.ovaal(L * t, d * 0.18, 4 * s, 11 * s, '#ffe3ac', 0.28);
        }
        // Keien op de oever.
        kei(voor.rechtop(L * 0.14, d * 0.4), s * 2.2);
        kei(voor.rechtop(L * 0.57, d * 0.36), s * 1.6);
        kei(voor.rechtop(L * 0.88, d * 0.42), s * 2.5);
        // Riet, dat vanaf de oever omhoog groeit richting het bord.
        for (const [t, m] of [[0.06, 1.8], [0.29, 2.2], [0.44, 1.5], [0.69, 2], [0.95, 1.7]]) {
          const r = voor.rechtop(L * t, d * 0.4);
          for (let k = -2; k <= 2; k++) {
            r.streek(`M0 0 q${(k * 5 * m * s).toFixed(1)} ${(-18 * m * s).toFixed(1)} ${(k * 9 * m * s).toFixed(1)} ${(-34 * m * s).toFixed(1)}`, k % 2 ? '#6b9450' : '#47663a', 2.2 * m * s, 0.92);
          }
        }
        // De vos zit op de oever, in zijaanzicht, en kijkt naar links. Hij
        // was eerst uit losse krommen opgebouwd en werd daardoor een oranje
        // vlek; nu staat hij uit herkenbare vormen in elkaar - staart,
        // achterhand, borst, kop, snuit, oren - zodat je ziet wat het is.
        const f = 1.5 * s;
        const vos = voor.rechtop(L * 0.66, d * 0.36);
        const V = (x, y) => `${(x * f).toFixed(1)} ${(y * f).toFixed(1)}`;
        vos.waas(0, -20 * f, 40 * f, '#ff9a3c', 0.26);
        // De staart krult achter hem omhoog, met een witte punt.
        vos.streek(`M${V(6, -8)} Q${V(28, -10)} ${V(27, -30)} Q${V(26, -40)} ${V(15, -40)}`, '#c25f16', 11 * f);
        vos.streek(`M${V(8, -10)} Q${V(25, -12)} ${V(24, -29)}`, '#f08a2c', 4 * f, 0.7);
        vos.ovaal(15 * f, -40 * f, 5.5 * f, 5 * f, '#f8f1e4');
        // Achterhand, borst en voorpoten.
        vos.ovaal(5 * f, -11 * f, 13 * f, 11 * f, '#e8801f');
        vos.ovaal(-3 * f, -22 * f, 10 * f, 13 * f, '#e8801f');
        vos.streek(`M${V(-6, -16)} L${V(-8, -1)}`, '#c25f16', 4 * f);
        vos.streek(`M${V(-1, -15)} L${V(-2, -1)}`, '#e8801f', 4 * f);
        vos.vlak(`M${V(-9, -26)} q${V(4, 12)} ${V(1, 24)} q${V(-6, -1)} ${V(-6, -11)} Z`, '#f8f1e4', 0.95);
        // Kop, snuit en oren.
        vos.ovaal(-7 * f, -34 * f, 8.5 * f, 7.5 * f, '#e8801f');
        vos.vlak(`M${V(-13, -35)} L${V(-24, -32)} L${V(-13, -29)} Z`, '#e8801f');
        vos.vlak(`M${V(-19, -33)} L${V(-24, -32)} L${V(-19, -30.5)} Z`, '#f8f1e4', 0.9);
        vos.stip(-23.4 * f, -31.6 * f, 1.5 * f, '#2a1408');
        vos.vlak(`M${V(-13, -39)} L${V(-15, -47)} L${V(-7, -42)} Z`, '#e8801f');
        vos.vlak(`M${V(-12.6, -40)} L${V(-14, -45)} L${V(-9, -42)} Z`, '#8a3c12');
        vos.vlak(`M${V(-2, -40)} L${V(-2, -48)} L${V(4, -42)} Z`, '#e8801f');
        vos.vlak(`M${V(-1.8, -41)} L${V(-2, -46)} L${V(2, -42.5)} Z`, '#8a3c12');
        // Het licht van de lantaarns valt op zijn rug.
        vos.streek(`M${V(-11, -38)} Q${V(-2, -44)} ${V(8, -36)} Q${V(15, -28)} ${V(16, -18)}`, '#ffcf96', 2 * f, 0.8);
        vos.gloed(-10 * f, -35 * f, 2.2 * f, '#ffd04a', 1);
        zwam(voor.rechtop(L * 0.36, d * 0.44), s * 1.8, '#7fffc4');
        zwam(voor.rechtop(L * 0.4, d * 0.4), s * 1.2, '#8fd0ff');
      }

      // ------------------------------------------------------------- LINKS
      // Een stam die van onder naar boven door de hele kant loopt, met een
      // hol erin waar licht uit komt. De grond ligt bij x=0.
      if (b.kant === 'links') {
        ver.waas(L * 0.5, d * 0.35, d * 1.4, '#2f7f72', 0.45);
        ver.vlak(ver.kam(d * 0.26, d * 0.16, 100), '#24605a');
        baan(ver, d * 0.2, d * 0.2, d * 0.06, ['#1d2a20', '#3c5340', '#0a100c']);
        baan(mid, d * 0.5, d * 0.42, -d * 0.08, ['#2e2118', '#8a6c40', '#0c0906']);
        for (let x = -20; x < L + 20; x += 48) {
          mid.vlak(mid.klont(x, d + 4, 86 * s, R(d * 0.24, d * 0.1), 7), '#17331c');
        }
        // Het hol, op twee derde hoogte van de pagina.
        const hs = 1.7 * s;
        const hol = mid.rechtop(L * 0.62, d * 0.5 + 15 * hs);
        hol.vlak(`M${(-17 * hs).toFixed(1)} 0 q${(-3 * hs).toFixed(1)} ${(-26 * hs).toFixed(1)} ${(17 * hs).toFixed(1)} ${(-26 * hs).toFixed(1)} q${(20 * hs).toFixed(1)} 0 ${(17 * hs).toFixed(1)} ${(26 * hs).toFixed(1)} Z`, '#0b1410');
        hol.gloed(0, -12 * hs, 12 * hs, '#ffc168', 1.3);
        hol.vlak(`M${(-24 * hs).toFixed(1)} ${(2 * hs).toFixed(1)} q${(5 * hs).toFixed(1)} ${(-32 * hs).toFixed(1)} ${(24 * hs).toFixed(1)} ${(-33 * hs).toFixed(1)} q${(24 * hs).toFixed(1)} ${hs.toFixed(1)} ${(24 * hs).toFixed(1)} ${(33 * hs).toFixed(1)} l${(-7 * hs).toFixed(1)} 0 q${(-2 * hs).toFixed(1)} ${(-27 * hs).toFixed(1)} ${(-17 * hs).toFixed(1)} ${(-27 * hs).toFixed(1)} q${(-18 * hs).toFixed(1)} ${hs.toFixed(1)} ${(-17 * hs).toFixed(1)} ${(27 * hs).toFixed(1)} Z`, '#53402b');
        hol.streek(`M${(-24 * hs).toFixed(1)} ${(2 * hs).toFixed(1)} q${(5 * hs).toFixed(1)} ${(-32 * hs).toFixed(1)} ${(24 * hs).toFixed(1)} ${(-33 * hs).toFixed(1)}`, '#c49a5c', 2.2 * s, 0.7);
        // Mos op de stam, aan de kant waar het licht vandaan komt.
        for (let k = 0; k < 9; k++) {
          mid.ovaal(L * (0.05 + k * 0.11), d * 0.33, 14 * s, 6 * s, '#3f6b42', 0.5);
        }
        // Klimop hangt naar beneden, dus naar x=0 toe.
        for (const [t, lang] of [[0.86, 0.5], [0.66, 0.34], [0.95, 0.28]]) {
          const o = voor.rechtop(L * t, d * 0.78);
          o.streek(`M0 0 q${(6 * s).toFixed(1)} ${(L * lang * 0.5).toFixed(1)} ${(-4 * s).toFixed(1)} ${(L * lang).toFixed(1)}`, '#3c5a2c', 1.6 * s, 0.95);
          for (let j = 1; j <= 9; j++) {
            const tt = j / 10;
            o.loof(6 * s * 2 * tt * (1 - tt) - 4 * s * tt * tt, L * lang * tt, (7 + tt * 9) * s, (3.4 + tt * 4) * s, j % 2 ? R(60, 10) : R(170, 120), K(['#4f8a3c', '#6fb44e', '#345f33']), 0.9);
          }
        }
        // Varens en zwammen aan de voet, bij x=0.
        varen(voor.rechtop(L * 0.05, d * 0.86), s * 2.4, '#3a7035');
        varen(voor.rechtop(L * 0.13, d * 0.92), s * 1.8, '#4c8a40');
        varen(voor.rechtop(L * 0.22, d * 0.88), s * 2.1, '#3a7035');
        kei(voor.rechtop(L * 0.03, d * 0.74), s * 2);
        zwam(voor.rechtop(L * 0.3, d * 0.9), s * 2.1, '#b88cff');
        zwam(voor.rechtop(L * 0.35, d * 0.84), s * 1.4, '#b88cff');
        zwam(voor.rechtop(L * 0.1, d * 0.72), s * 1.6, '#7fffc4');
      }

      // ------------------------------------------------------------ RECHTS
      // Een berk die doorloopt, met varens en lichtzwammen aan de voet. De
      // grond ligt hier bij x=L.
      if (b.kant === 'rechts') {
        ver.waas(L * 0.5, d * 0.4, d * 1.4, '#1f5f7a', 0.45);
        ver.vlak(ver.kam(d * 0.3, d * 0.18, 92), '#24605a');
        baan(ver, d * 0.22, d * 0.16, -d * 0.05, ['#1d2a20', '#3c5340', '#0a100c']);
        baan(mid, d * 0.52, d * 0.3, d * 0.07, ['#a7af99', '#e4e8d8', '#3e4438']);
        // De zwarte strepen van de berk.
        for (let k = 0; k < 9; k++) {
          mid.streek(`M${(L * (0.04 + k * 0.11)).toFixed(1)} ${(d * 0.4).toFixed(1)} v${((7 + (k % 3) * 7) * s).toFixed(1)}`, '#1c1d16', 3.4 * s, 0.85);
          mid.streek(`M${(L * (0.09 + k * 0.11)).toFixed(1)} ${(d * 0.58).toFixed(1)} v${((5 + (k % 2) * 6) * s).toFixed(1)}`, '#1c1d16', 2.6 * s, 0.7);
        }
        for (let x = -20; x < L + 20; x += 42) {
          mid.vlak(mid.klont(x, d + 4, 84 * s, R(d * 0.26, d * 0.1), 7), '#17331c');
        }
        // Klimop hangt naar beneden: op deze kant is dat naar x=L toe.
        for (const [t, lang] of [[0.12, 0.44], [0.3, 0.3]]) {
          const o = voor.rechtop(L * t, d * 0.8);
          o.streek(`M0 0 q${(-6 * s).toFixed(1)} ${(L * lang * 0.5).toFixed(1)} ${(4 * s).toFixed(1)} ${(L * lang).toFixed(1)}`, '#3c5a2c', 1.6 * s, 0.95);
          for (let j = 1; j <= 8; j++) {
            const tt = j / 9;
            o.loof(-6 * s * 2 * tt * (1 - tt) + 4 * s * tt * tt, L * lang * tt, (7 + tt * 9) * s, (3.4 + tt * 4) * s, j % 2 ? R(60, 10) : R(170, 120), K(['#4f8a3c', '#6fb44e', '#345f33']), 0.9);
          }
        }
        varen(voor.rechtop(L * 0.96, d * 0.88), s * 2.4, '#3a7035');
        varen(voor.rechtop(L * 0.88, d * 0.94), s * 1.8, '#4c8a40');
        varen(voor.rechtop(L * 0.78, d * 0.86), s * 2.2, '#3a7035');
        kei(voor.rechtop(L * 0.98, d * 0.7), s * 2.1);
        // De tros lichtzwammen aan de voet van de berk.
        const z = voor.rechtop(L * 0.68, d * 0.92);
        for (const [px, py, pm, kl] of [[0, 0, 2.4, '#8fd0ff'], [-26, 7, 1.7, '#8fd0ff'], [22, 9, 1.5, '#b88cff'], [-12, -18, 1.1, '#7fffc4'], [34, -6, 1, '#8fd0ff']]) {
          zwam(z.rechtop(px * s, py * s), s * pm, kl);
        }
        zwam(voor.rechtop(L * 0.45, d * 0.9), s * 1.7, '#ff8fd6');
        for (let i = 0; i < n(16); i++) {
          voor.loof(R(L, 0), d - R(d * 0.3, 0), R(18, 10) * s, R(8, 4.4) * s, R(220, -40), K(['#3a6b36', '#4c8a40', '#2c5630', '#5da348']), R(1, 0.75));
        }
      }

      b.spikkels(n(16), ['#ffd98a', '#9ff0b4', '#ffc168', '#b88cff'], { y0: 0, y1: d * 1.04, groot: 2 });
    },
  },

  // Een crypte onder de grond. Elke kant is een andere plek in hetzelfde
  // gewelf; de vorige versie strooide over alle vier de kanten dezelfde rij
  // grafstenen, kaarsen en botten, en dan is het een patroon, geen plek.
  //
  //   BOVEN   het gewelf zelf. Ribben die naar een sluitsteen lopen,
  //           wortels die er dwars door komen, en een vuurkorf aan een
  //           ketting: het enige licht dat hier van boven komt.
  //   ONDER   de vloer die van je voeten af naar achteren loopt: tegels,
  //           een plas waarin een kaars staat, botten, en een rat.
  //   LINKS   een wand vol nissen van onder tot boven, met schedels erin,
  //           een kaarsrichel, en een hand die onder een steen vandaan komt.
  //   RECHTS  een trap die het donker in gaat, met een sarcofaag aan de
  //           voet en een lantaarn aan een haak.
  catacomben: {
    kern: '#1a1620', koel: '#07050b', warm: '#cfc3ad', textuur: 'korrel', ruw: 0.22, stap: 42,
    gloed: '#ffb84d',
    verf(b) {
      const { d, L, R, K, n } = b;
      const s = d / 100;
      const ver = b.laag('randver', 0.56);
      const mid = b.laag('randmid');
      const voor = b.laag('randvoor');

      // -------------------------------------------------- losse tekeningen
      const kaars = (o, m, hoog = 14) => {
        const u = (v) => (v * m).toFixed(1);
        o.vlak(`M${u(-2.6)} 0 L${u(-2.1)} ${u(-hoog)} h${u(4.2)} L${u(2.6)} 0 Z`, '#e8e0cc');
        o.vlak(`M${u(-4.4)} 0 q${u(4.4)} ${u(3)} ${u(8.8)} 0 q${u(-4.4)} ${u(2)} ${u(-8.8)} 0 Z`, '#9a9382');
        o.streek(`M${u(1.8)} ${u(-hoog)} q${u(2.4)} ${u(4)} ${u(0.9)} ${u(6.5)}`, '#d8cfb6', 1.2 * m, 0.55);
        o.gloed(0, -(hoog + 3.4) * m, 6.8 * m, '#ffb84d', 1.25);
        o.vlak(`M0 ${u(-hoog - 9.6)} q${u(3.4)} ${u(4.4)} 0 ${u(7.6)} q${u(-3.4)} ${u(-3.2)} 0 ${u(-7.6)} Z`, '#fff2c2');
      };
      const schedel = (o, m) => {
        const u = (v) => (v * m).toFixed(1);
        o.ovaal(0, -5.4 * m, 6.4 * m, 5.6 * m, '#c9bfa6');
        o.vlak(`M${u(-3.6)} ${u(-1.4)} h${u(7.2)} v${u(3.2)} q${u(-3.6)} ${u(1.6)} ${u(-7.2)} 0 Z`, '#b5ab93');
        o.ovaal(-2.5 * m, -5.8 * m, 2 * m, 2.3 * m, '#120e16');
        o.ovaal(2.5 * m, -5.8 * m, 2 * m, 2.3 * m, '#120e16');
        o.vlak(`M${u(-1.2)} ${u(-2.4)} l${u(1.2)} ${u(2.2)} l${u(1.2)} ${u(-2.2)} Z`, '#120e16');
        o.streek(`M${u(-3.6)} ${u(-9)} q${u(3.6)} ${u(-1.8)} ${u(7.2)} 0`, '#e4dcc4', 1.2 * m, 0.5);
        for (let k = -1; k <= 1; k++) o.streek(`M${u(k * 2.3)} ${u(0.6)} v${u(2.2)}`, '#8f8673', 0.9 * m, 0.7);
      };
      const bot = (o, m) => {
        const u = (v) => (v * m).toFixed(1);
        o.streek(`M${u(-9)} 0 q${u(9)} ${u(-3)} ${u(18)} 0`, '#bdb299', 2.8 * m, 0.92);
        o.stip(-9 * m, 0, 2.3 * m, '#cfc5ae');
        o.stip(-8 * m, -2 * m, 1.8 * m, '#cfc5ae');
        o.stip(9 * m, 0, 2.3 * m, '#cfc5ae');
        o.stip(8 * m, -2 * m, 1.8 * m, '#cfc5ae');
      };
      // Een nis met een schedel erin: het bouwblok van de linkerwand.
      const nis = (laag, x, y, br, h) => {
        laag.vlak(`M${(x - br / 2).toFixed(1)} ${(y + h / 2).toFixed(1)} V${(y - h * 0.1).toFixed(1)} Q${x.toFixed(1)} ${(y - h * 0.62).toFixed(1)} ${(x + br / 2).toFixed(1)} ${(y - h * 0.1).toFixed(1)} V${(y + h / 2).toFixed(1)} Z`, '#0c0910');
        laag.streek(`M${(x - br / 2).toFixed(1)} ${(y - h * 0.1).toFixed(1)} Q${x.toFixed(1)} ${(y - h * 0.62).toFixed(1)} ${(x + br / 2).toFixed(1)} ${(y - h * 0.1).toFixed(1)}`, '#6e665c', 2.4 * s, 0.8);
        laag.streek(`M${(x - br / 2 + 2).toFixed(1)} ${(y - h * 0.16).toFixed(1)} Q${x.toFixed(1)} ${(y - h * 0.6).toFixed(1)} ${(x + br / 2 - 2).toFixed(1)} ${(y - h * 0.16).toFixed(1)}`, '#8d8478', 1 * s, 0.4);
      };
      // Metselwerk: ongelijke stenen, want een net rooster leest als tegels.
      const muur = (laag, y0, y1, kleur) => {
        for (let y = y0; y < y1; y += 13 * s) {
          laag.streek(`M0 ${y.toFixed(1)} H${L.toFixed(1)}`, kleur, 1.3 * s, 0.5);
          for (let x = R(30, 6); x < L; x += R(42, 22)) {
            laag.streek(`M${x.toFixed(1)} ${y.toFixed(1)} v${(13 * s).toFixed(1)}`, kleur, 1.1 * s, 0.4);
          }
        }
      };

      // ------------------------------------------------------------- BOVEN
      if (b.kant === 'boven') {
        for (let i = 0; i < 5; i++) ver.waas(L * (0.1 + i * 0.2), d * 0.3, d * 1.1, '#3b4a78', 0.3);
        // Drie bogen achter elkaar, elk kleiner: dat maakt de diepte.
        for (const [t, br, h, kl] of [[0.5, 1.5, 0.74, '#171c2e'], [0.5, 1.05, 0.58, '#1d2238'], [0.5, 0.7, 0.44, '#242a44']]) {
          const x = L * t;
          const w = d * br;
          ver.vlak(`M${(x - w / 2).toFixed(1)} ${(d * 0.9).toFixed(1)} V${(d * h * 0.5).toFixed(1)} Q${x.toFixed(1)} ${(-d * 0.12).toFixed(1)} ${(x + w / 2).toFixed(1)} ${(d * h * 0.5).toFixed(1)} V${(d * 0.9).toFixed(1)} Z`, kl);
        }
        muur(ver, d * 0.1, d * 0.95, '#3d3550');
        // De ribben van het gewelf, naar een sluitsteen in het midden.
        for (const t of [0.04, 0.2, 0.36, 0.64, 0.8, 0.96]) {
          mid.streek(`M${(L * t).toFixed(1)} ${(d + 6).toFixed(1)} Q${(L * (t * 0.5 + 0.25)).toFixed(1)} ${(d * 0.3).toFixed(1)} ${(L * 0.5).toFixed(1)} ${(-4).toFixed(1)}`, '#120e16', 7 * s, 0.9);
          mid.streek(`M${(L * t).toFixed(1)} ${(d + 6).toFixed(1)} Q${(L * (t * 0.5 + 0.25)).toFixed(1)} ${(d * 0.3).toFixed(1)} ${(L * 0.5).toFixed(1)} ${(-4).toFixed(1)}`, '#3a3240', 4 * s, 0.85);
        }
        mid.stip(L * 0.5, 0, 13 * s, '#2e2836');
        mid.stip(L * 0.5, 0, 7 * s, '#453c48');
        // Wortels komen door het gewelf naar beneden.
        for (const [t, lang, dik] of [[0.12, 0.74, 3.4], [0.27, 0.46, 2.2], [0.72, 0.62, 2.8], [0.9, 0.4, 2]]) {
          const x = L * t;
          mid.streek(`M${x.toFixed(1)} -4 Q${(x + 16 * s).toFixed(1)} ${(d * lang * 0.5).toFixed(1)} ${(x - 10 * s).toFixed(1)} ${(d * lang).toFixed(1)}`, '#2c2318', dik * s, 0.9);
          for (let k = 1; k <= 3; k++) {
            const tt = k / 4;
            mid.streek(`M${(x + 16 * s * 2 * tt * (1 - tt) - 10 * s * tt * tt).toFixed(1)} ${(d * lang * tt).toFixed(1)} l${(R(14, -14) * s).toFixed(1)} ${(R(16, 6) * s).toFixed(1)}`, '#2c2318', 1.2 * s, 0.8);
          }
        }
        // De vuurkorf aan een ketting, net links van het midden.
        const kx = L * 0.42;
        const ky = d * 0.6;
        voor.streek(`M${kx.toFixed(1)} -4 V${(ky - 26 * s).toFixed(1)}`, '#3a3240', 2 * s, 0.9);
        for (let k = 0; k < 7; k++) voor.ovaal(kx, ky - 26 * s - k * 7 * s, 2.4 * s, 3.4 * s, '#574c3a', 0.9);
        const korf = voor.rechtop(kx, ky);
        const ku = (v) => (v * s).toFixed(1);
        korf.waas(0, -14 * s, 58 * s, '#ffb84d', 0.5);
        korf.vlak(`M${ku(-19)} ${ku(-16)} L${ku(-13)} 0 h${ku(26)} L${ku(19)} ${ku(-16)} Z`, '#2a2118');
        for (let k = -3; k <= 3; k++) korf.streek(`M${(k * 5.4 * s).toFixed(1)} ${ku(-16)} L${(k * 3.8 * s).toFixed(1)} 0`, '#6a5a3a', 1.4 * s, 0.7);
        korf.streek(`M${ku(-20)} ${ku(-16)} h${ku(40)}`, '#6a5a3a', 2.6 * s, 0.9);
        for (let k = 0; k < 6; k++) {
          const fx = R(13, -13) * s;
          const fh = R(30, 14) * s;
          korf.vlak(`M${fx.toFixed(1)} ${ku(-14)} q${(fh * 0.4).toFixed(1)} ${(-fh * 0.55).toFixed(1)} 0 ${(-fh).toFixed(1)} q${(-fh * 0.4).toFixed(1)} ${(fh * 0.45).toFixed(1)} 0 ${fh.toFixed(1)} Z`, K(['#ff8a2a', '#ffc94d', '#ff5d1f']), R(1, 0.65));
        }
        korf.gloed(0, -20 * s, 15 * s, '#ffb84d', 1.3);
        // Spinrag in de rechterhoek, waar niets anders staat.
        for (let a = 0; a < 6; a++) {
          const h = (a / 5) * Math.PI * 0.5;
          voor.streek(`M${L.toFixed(1)} 0 l${(-Math.cos(h) * 54 * s).toFixed(1)} ${(Math.sin(h) * 54 * s).toFixed(1)}`, '#d8d2e0', 0.6, 0.3);
        }
        for (let k = 1; k <= 3; k++) {
          const rr = (54 * s * k) / 3.4;
          voor.streek(`M${(L - rr).toFixed(1)} 0 Q${(L - rr * 0.5).toFixed(1)} ${(rr * 0.5).toFixed(1)} ${L.toFixed(1)} ${rr.toFixed(1)}`, '#d8d2e0', 0.5, 0.26);
        }
      }

      // ------------------------------------------------------------- ONDER
      // De grond ligt bij y=0, en de vloer loopt van je af naar het bord.
      if (b.kant === 'onder') {
        ver.waas(L * 0.5, d * 0.7, d * 1.3, '#3b4a78', 0.34);
        // De verre wand met nissen, tegen het bord aan.
        ver.vlak(`M0 ${(d + 4).toFixed(1)} H${L.toFixed(1)} V${(d * 0.62).toFixed(1)} H0 Z`, '#272034');
        muur(ver, d * 0.62, d + 4, '#3d3550');
        for (let k = 0; k < 5; k++) nis(ver, L * (0.1 + k * 0.2), d * 0.84, 34 * s, 40 * s);
        // De vloer: tegels die naar achteren smaller worden.
        mid.vlak(`M0 -4 H${L.toFixed(1)} V${(d * 0.62).toFixed(1)} H0 Z`, '#322b38');
        for (let k = 0; k < 6; k++) {
          const y = d * 0.62 * (1 - (k / 6) ** 1.7);
          mid.streek(`M0 ${y.toFixed(1)} H${L.toFixed(1)}`, '#120e16', 1.6 * s, 0.6);
        }
        for (let x = 0; x < L; x += 52 * s) {
          mid.streek(`M${x.toFixed(1)} -4 L${(L * 0.5 + (x - L * 0.5) * 0.3).toFixed(1)} ${(d * 0.62).toFixed(1)}`, '#120e16', 1.3 * s, 0.5);
        }
        // De plas, met een kaars erin die zich spiegelt.
        mid.vlak(`M${(L * 0.52).toFixed(1)} ${(d * 0.2).toFixed(1)} Q${(L * 0.66).toFixed(1)} ${(d * 0.12).toFixed(1)} ${(L * 0.78).toFixed(1)} ${(d * 0.22).toFixed(1)} Q${(L * 0.8).toFixed(1)} ${(d * 0.36).toFixed(1)} ${(L * 0.64).toFixed(1)} ${(d * 0.38).toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(d * 0.34).toFixed(1)} ${(L * 0.52).toFixed(1)} ${(d * 0.2).toFixed(1)} Z`, '#13161f');
        mid.ovaal(L * 0.66, d * 0.28, 7 * s, 22 * s, '#ffb84d', 0.2);
        mid.ovaal(L * 0.66, d * 0.28, 3 * s, 12 * s, '#ffe0a0', 0.26);
        mid.streek(`M${(L * 0.54).toFixed(1)} ${(d * 0.22).toFixed(1)} Q${(L * 0.66).toFixed(1)} ${(d * 0.15).toFixed(1)} ${(L * 0.77).toFixed(1)} ${(d * 0.24).toFixed(1)}`, '#6a8fb0', 1.2 * s, 0.4);
        // Puin langs het bord.
        for (let x = 0; x < L; x += 58 * s) {
          voor.vlak(voor.klont(x, d + 2, R(54, 32) * s, R(d * 0.2, d * 0.08), 4), '#191520');
        }
        kaars(voor.rechtop(L * 0.66, d * 0.44), s * 1.5);
        kaars(voor.rechtop(L * 0.2, d * 0.5), s * 1.1, 9);
        // Botten en schedels, met de hand neergelegd.
        schedel(voor.rechtop(L * 0.1, d * 0.3), s * 2.4);
        schedel(voor.rechtop(L * 0.38, d * 0.16), s * 1.7);
        schedel(voor.rechtop(L * 0.86, d * 0.52), s * 1.5);
        bot(voor.rechtop(L * 0.26, d * 0.22), s * 1.9);
        bot(voor.rechtop(L * 0.5, d * 0.46), s * 1.3);
        bot(voor.rechtop(L * 0.93, d * 0.26), s * 1.7);
        // De rat, vlak voor de plas, met twee lichtjes als ogen.
        const rf = 1.6 * s;
        const rat = voor.rechtop(L * 0.47, d * 0.26);
        const V = (x, y) => `${(x * rf).toFixed(1)} ${(y * rf).toFixed(1)}`;
        rat.streek(`M${V(9, -3)} Q${V(24, -2)} ${V(30, -9)}`, '#3a3038', 2 * rf);
        rat.ovaal(2 * rf, -6 * rf, 10 * rf, 6 * rf, '#4a3f44');
        rat.ovaal(-8 * rf, -6 * rf, 5.4 * rf, 4.4 * rf, '#4a3f44');
        rat.vlak(`M${V(-11, -7)} L${V(-18, -6)} L${V(-11, -4)} Z`, '#4a3f44');
        rat.stip(-7.6 * rf, -10 * rf, 2.4 * rf, '#3a3038');
        rat.stip(-4.4 * rf, -10.6 * rf, 2.2 * rf, '#3a3038');
        rat.gloed(-13 * rf, -6.6 * rf, 1.5 * rf, '#ffb84d', 0.9);
        rat.streek(`M${V(-14, -5)} l${V(-7, -2)}`, '#8f8673', 0.6, 0.6);
        rat.streek(`M${V(-14, -5.6)} l${V(-7, 1)}`, '#8f8673', 0.6, 0.6);
      }

      // ------------------------------------------------------------- LINKS
      // Een wand vol nissen. De grond ligt bij x=0, dus de hand onderaan.
      if (b.kant === 'links') {
        ver.waas(L * 0.5, d * 0.4, d * 1.4, '#3b4a78', 0.3);
        ver.vlak(`M0 -4 H${L.toFixed(1)} V${(d * 0.74).toFixed(1)} H0 Z`, '#272034');
        muur(ver, 0, d * 0.78, '#3d3550');
        // De nissen. Dit waren twee kaarsrechte rijen van zeven, elk met een
        // schedel erin op precies dezelfde plek: veertien keer hetzelfde, en
        // dan is het geen wand maar behang. Ze staan nu met de hand, in drie
        // maten, op ongelijke hoogte en op ongelijke afstand. Een paar zijn
        // leeg, in een paar liggen alleen botten, en een is dichtgemetseld.
        // Een crypte is in de loop van eeuwen volgeraakt, niet in één dag
        // aangelegd.
        const nissen = [
          [0.05, 0.3, 46, 56, 'schedel', 2.1],
          [0.05, 0.68, 40, 48, 'bot', 1.7],
          [0.17, 0.26, 34, 40, 'schedel', 1.6],
          [0.17, 0.6, 52, 62, 'schedel', 2.4],
          [0.17, 0.88, 30, 34, 'leeg', 0],
          [0.3, 0.34, 48, 58, 'schedel', 2.2],
          [0.3, 0.72, 36, 42, 'dicht', 0],
          [0.41, 0.28, 32, 38, 'bot', 1.4],
          [0.41, 0.62, 44, 54, 'schedel', 2],
          [0.53, 0.32, 50, 60, 'schedel', 2.3],
          [0.53, 0.7, 34, 40, 'leeg', 0],
          [0.64, 0.26, 38, 46, 'bot', 1.6],
          [0.64, 0.64, 46, 56, 'schedel', 2.1],
          [0.76, 0.36, 42, 50, 'schedel', 1.9],
          [0.76, 0.74, 30, 36, 'dicht', 0],
          [0.88, 0.3, 52, 62, 'schedel', 2.4],
          [0.88, 0.7, 36, 44, 'bot', 1.5],
          [0.96, 0.5, 34, 40, 'leeg', 0],
        ];
        for (const [t, v, br, h, wat, m] of nissen) {
          const x = L * t;
          const y = d * v;
          nis(mid, x, y, br * s, h * s);
          if (wat === 'dicht') {
            // Dichtgemetseld: de nis is er nog, wat erin lag niet meer.
            mid.vlak(`M${(x - br * s * 0.42).toFixed(1)} ${(y + h * s * 0.4).toFixed(1)} V${(y - h * s * 0.2).toFixed(1)} h${(br * s * 0.84).toFixed(1)} V${(y + h * s * 0.4).toFixed(1)} Z`, '#3f3942');
            for (let r = 0; r < 3; r++) {
              mid.streek(`M${(x - br * s * 0.42).toFixed(1)} ${(y - h * s * 0.16 + r * h * s * 0.18).toFixed(1)} h${(br * s * 0.84).toFixed(1)}`, '#1a1620', 1.2 * s, 0.7);
            }
            continue;
          }
          if (wat === 'schedel') schedel(mid.rechtop(x, y + h * s * 0.22), s * m);
          else if (wat === 'bot') bot(mid.rechtop(x, y + h * s * 0.3), s * m);
        }
        // De kaarsrichel die over de hele hoogte doorloopt.
        mid.vlak(`M0 ${(d * 0.9).toFixed(1)} H${L.toFixed(1)} V${(d * 0.98).toFixed(1)} H0 Z`, '#3a3240');
        mid.streek(`M0 ${(d * 0.9).toFixed(1)} H${L.toFixed(1)}`, '#8d8478', 1.4 * s, 0.5);
        for (const [t, m, h] of [[0.09, 2.2, 15], [0.24, 1.6, 10], [0.46, 2.4, 17], [0.63, 1.4, 8], [0.84, 2, 13]]) {
          kaars(voor.rechtop(L * t, d * 0.9), s * m, h);
          voor.ovaal(L * t, d * 0.94, 16 * s, 5 * s, '#ffb84d', 0.16);
        }
        // Kaarsvet dat van de richel is gedropen.
        for (const t of [0.1, 0.25, 0.47, 0.85]) {
          voor.vlak(`M${(L * t - 5 * s).toFixed(1)} ${(d * 0.98).toFixed(1)} q${(5 * s).toFixed(1)} ${(R(14, 6) * s).toFixed(1)} ${(10 * s).toFixed(1)} 0 Z`, '#e8e0cc', 0.7);
        }
        // Wortels bij het plafond, dat hier bij x=L zit.
        for (const [t, lang] of [[0.92, 0.5], [0.97, 0.3]]) {
          voor.streek(`M${(L * t).toFixed(1)} 0 Q${(L * t - 14 * s).toFixed(1)} ${(d * lang * 0.6).toFixed(1)} ${(L * t - 6 * s).toFixed(1)} ${(d * lang).toFixed(1)}`, '#2c2318', 2.6 * s, 0.85);
        }
        // De hand die onder een steen vandaan komt. Een keer is enger dan vier keer.
        const o = voor.rechtop(L * 0.33, d - 6 * s);
        const hu = (v) => (v * s * 1.5).toFixed(1);
        o.vlak(`M${hu(-9)} ${hu(10)} q${hu(-2)} ${hu(-14)} ${hu(9)} ${hu(-15)} q${hu(11)} ${hu(1)} ${hu(9)} ${hu(15)} Z`, '#cdc3aa');
        for (let f = 0; f < 4; f++) {
          const fx = -7 + f * 4.6;
          o.streek(`M${hu(fx)} ${hu(-4)} q${hu(f - 1.5)} ${hu(-11)} ${hu(f * 1.2 - 1)} ${hu(-17)}`, '#d6ccb2', 2.6 * s * 1.5, 0.95);
          o.stip((fx + (f * 1.2 - 1)) * s * 1.5, -21 * s * 1.5, 1.7 * s * 1.5, '#e4dbc4');
        }
        o.streek(`M${hu(8)} ${hu(-3)} q${hu(7)} ${hu(-4)} ${hu(9)} ${hu(-11)}`, '#d6ccb2', 2.4 * s * 1.5, 0.95);
        o.vlak(`M${hu(-12)} ${hu(6)} q${hu(12)} ${hu(7)} ${hu(24)} 0 q${hu(-12)} ${hu(12)} ${hu(-24)} 0 Z`, '#1a1518', 0.8);
      }

      // ------------------------------------------------------------ RECHTS
      // Een trap die het donker in gaat. De grond ligt bij x=L.
      if (b.kant === 'rechts') {
        ver.waas(L * 0.3, d * 0.4, d * 1.4, '#3b4a78', 0.3);
        ver.vlak(`M0 -4 H${L.toFixed(1)} V${(d * 0.8).toFixed(1)} H0 Z`, '#241e31');
        muur(ver, 0, d * 0.84, '#3d3550');
        // De bovenkant van de trap verdwijnt in het zwart.
        ver.vlak(`M0 -4 H${(L * 0.3).toFixed(1)} V${(d + 4).toFixed(1)} H0 Z`, '#0a070e', 0.85);
        // De treden: twaalf, naar boven toe korter, dus ze lopen weg.
        for (let k = 0; k < 12; k++) {
          const x = L * (0.94 - (k / 12) ** 0.85 * 0.68);
          const diep = d * (0.9 - k * 0.055);
          mid.vlak(`M${x.toFixed(1)} ${(d + 4).toFixed(1)} V${(d - diep).toFixed(1)} H${(x - 9 * s).toFixed(1)} V${(d + 4).toFixed(1)} Z`, k % 2 ? '#2e2834' : '#3a3240');
          mid.streek(`M${x.toFixed(1)} ${(d - diep).toFixed(1)} H${(x - 9 * s).toFixed(1)}`, '#8d8478', 1.2 * s, 0.4);
          mid.streek(`M${(x - 9 * s).toFixed(1)} ${(d - diep).toFixed(1)} V${(d + 4).toFixed(1)}`, '#120e16', 1.6 * s, 0.6);
        }
        // Een lantaarn aan een haak in de wand, halverwege de trap.
        const lx = L * 0.56;
        const ly = d * 0.26;
        voor.streek(`M${lx.toFixed(1)} ${(ly - 2 * s).toFixed(1)} q${(10 * s).toFixed(1)} ${(-10 * s).toFixed(1)} ${(2 * s).toFixed(1)} ${(-16 * s).toFixed(1)}`, '#574c3a', 2 * s, 0.9);
        const lan = voor.rechtop(lx, ly);
        const lu = (v) => (v * s * 1.8).toFixed(1);
        lan.gloed(0, 0, 11 * s * 1.8, '#ffb84d', 1.35);
        lan.vlak(`M${lu(-6)} ${lu(-7)} L${lu(6)} ${lu(-7)} L${lu(4.4)} ${lu(7)} L${lu(-4.4)} ${lu(7)} Z`, '#ffe6b4', 0.7);
        lan.streek(`M${lu(-6.6)} ${lu(-7)} h${lu(13.2)}`, '#3a3024', 2.4 * s * 1.8);
        lan.streek(`M${lu(-5)} ${lu(7)} h${lu(10)}`, '#3a3024', 2 * s * 1.8);
        lan.streek(`M0 ${lu(-7)} v${lu(14)}`, '#3a3024', 1.1 * s * 1.8);
        lan.waas(0, 16 * s * 1.8, 30 * s * 1.8, '#ffb84d', 0.3);
        // De sarcofaag aan de voet, met een scheef deksel.
        const sar = voor.rechtop(L * 0.9, d - 4);
        const su = (v) => (v * s).toFixed(1);
        sar.vlak(`M${su(-46)} 0 V${su(-26)} h${su(92)} V0 Z`, '#3a3240');
        sar.streek(`M${su(-46)} ${su(-26)} h${su(92)}`, '#8d8478', 1.6 * s, 0.45);
        sar.vlak(`M${su(-50)} ${su(-26)} l${su(8)} ${su(-10)} h${su(88)} l${su(8)} ${su(10)} Z`, '#6e665c');
        sar.vlak(`M${su(-42)} ${su(-36)} h${su(74)} l${su(-6)} ${su(-6)} h${su(-62)} Z`, '#2a242e');
        sar.streek(`M${su(-30)} ${su(-39)} h${su(50)}`, '#8d8478', 1.2 * s, 0.4);
        // Een kruis in de deksel.
        sar.streek(`M${su(-6)} ${su(-16)} v${su(-14)}`, '#8d8478', 2 * s, 0.4);
        sar.streek(`M${su(-14)} ${su(-24)} h${su(16)}`, '#8d8478', 2 * s, 0.4);
        kaars(voor.rechtop(L * 0.78, d - 4), s * 2, 16);
        bot(voor.rechtop(L * 0.72, d - 6), s * 1.6);
        schedel(voor.rechtop(L * 0.68, d * 0.9), s * 1.8);
        for (const [t, lang] of [[0.08, 0.46], [0.18, 0.28]]) {
          voor.streek(`M${(L * t).toFixed(1)} 0 Q${(L * t + 12 * s).toFixed(1)} ${(d * lang * 0.6).toFixed(1)} ${(L * t + 4 * s).toFixed(1)} ${(d * lang).toFixed(1)}`, '#2c2318', 2.4 * s, 0.85);
        }
      }

      // Dwaallichtjes, over alle vier de kanten.
      b.spikkels(n(40), ['#7fffc4', '#ffb84d'], { y0: d * 0.2, y1: d });
    },
  },

  // Een torenkamer van de academie bij nacht. Vier kanten, vier plekken:
  // de hemel erboven, de werktafel vlak voor je, de boekenwand, en het
  // raam waardoor de maan binnenkomt.
  //
  //   BOVEN   sterrenhemel, torenspitsen in de verte, en een boek dat open
  //           in de lucht hangt met letters die eruit opstijgen.
  //   ONDER   de werktafel: boeken, inktpot, een bol op een voet, een
  //           kaars, en de puntige hoed die ernaast ligt.
  //   LINKS   de boekenwand van onder tot boven, met een ladder ertegen en
  //           een astrolabium dat ervoor hangt.
  //   RECHTS  een spitsboograam over de hele hoogte, met de maan erin en
  //           een telescoop ervoor.
  academie: {
    kern: '#141229', koel: '#06040f', warm: '#b9a6ff', textuur: 'weefsel', ruw: 0.18, stap: 40,
    gloed: '#ffd27a',
    verf(b) {
      const { d, L, R, K, n } = b;
      const s = d / 100;
      const ver = b.laag('randver', 0.7);
      const mid = b.laag('randmid');
      const voor = b.laag('randvoor');

      const kandelaar = (o, m) => {
        const u = (v) => (v * m).toFixed(1);
        o.vlak(`M${u(-5)} 0 q${u(5)} ${u(-2)} ${u(10)} 0 l${u(-3.4)} ${u(-3)} v${u(-9)} h${u(-3.2)} v${u(9)} Z`, '#9b7a2e');
        o.vlak(`M${u(-1.8)} ${u(-12)} h${u(3.6)} v${u(-9)} h${u(-3.6)} Z`, '#efe3c6');
        o.gloed(0, -24 * m, 6.8 * m, '#ffd27a', 1.25);
        o.vlak(`M0 ${u(-30)} q${u(3.6)} ${u(4.6)} 0 ${u(8)} q${u(-3.6)} ${u(-3.4)} 0 ${u(-8)} Z`, '#fff6cf');
      };
      // Een boek dat openligt of openhangt, met licht tussen de bladen.
      const boek = (o, m, kleur) => {
        const u = (v) => (v * m).toFixed(1);
        o.waas(0, -4 * m, 34 * m, '#ffd27a', 0.34);
        o.vlak(`M${u(-24)} 0 Q${u(-12)} ${u(-6)} 0 ${u(-3)} Q${u(12)} ${u(-6)} ${u(24)} 0 Q${u(12)} ${u(4)} 0 ${u(2)} Q${u(-12)} ${u(4)} ${u(-24)} 0 Z`, '#f2e8d0');
        o.vlak(`M${u(-26)} ${u(1)} Q${u(-13)} ${u(-5)} 0 ${u(-2)} L0 ${u(3)} Q${u(-13)} ${u(5)} ${u(-26)} ${u(2)} Z`, kleur);
        o.vlak(`M${u(26)} ${u(1)} Q${u(13)} ${u(-5)} 0 ${u(-2)} L0 ${u(3)} Q${u(13)} ${u(5)} ${u(26)} ${u(2)} Z`, kleur);
        o.streek(`M0 ${u(-3)} v${u(5)}`, '#8a6a2c', 1.2 * m, 0.7);
        for (let k = 1; k <= 3; k++) {
          o.streek(`M${u(-20 + k * 2)} ${u(-1.4 - k * 0.6)} q${u(10)} ${u(-3)} ${u(19)} ${u(-0.6)}`, '#cfc0a0', 0.7 * m, 0.5);
        }
        o.gloed(0, -2 * m, 7 * m, '#ffd27a', 1, 0);
      };

      // ------------------------------------------------------------- BOVEN
      if (b.kant === 'boven') {
        for (let i = 0; i < 6; i++) ver.waas(L * (0.08 + i * 0.17), d * 0.22, d * 1.1, i % 2 ? '#4b3a9c' : '#2c6ba8', 0.26);
        ver.spikkels(n(13), ['#ffffff', '#cfd8ff', '#ffe9b0'], { y1: d * 0.52, groot: 1.3, halo: 0.3 });
        // Een sterrenbeeld: zeven sterren met een lijn ertussen.
        const beeld = [[0.12, 0.1], [0.19, 0.19], [0.27, 0.14], [0.34, 0.26], [0.43, 0.2], [0.49, 0.32], [0.57, 0.24]];
        for (let k = 1; k < beeld.length; k++) {
          ver.streek(`M${(L * beeld[k - 1][0]).toFixed(1)} ${(d * beeld[k - 1][1]).toFixed(1)} L${(L * beeld[k][0]).toFixed(1)} ${(d * beeld[k][1]).toFixed(1)}`, '#9fb4ff', 0.8, 0.3);
        }
        for (const [t, v] of beeld) ver.gloed(L * t, d * v, 2.6 * s, '#dce6ff', 0.9);
        // Torenspitsen aan de horizon, met een verlicht raampje erin.
        for (const [t, h, br] of [[0.07, 0.42, 15], [0.23, 0.3, 11], [0.44, 0.5, 18], [0.62, 0.34, 13], [0.78, 0.46, 16], [0.94, 0.28, 10]]) {
          const o = mid.rechtop(L * t, d * 0.72);
          const u = (v) => (v * s).toFixed(1);
          const hh = d * h;
          o.vlak(`M${(-br / 2 * s).toFixed(1)} 0 V${(-hh * 0.6).toFixed(1)} L0 ${(-hh).toFixed(1)} L${(br / 2 * s).toFixed(1)} ${(-hh * 0.6).toFixed(1)} V0 Z`, '#1b1836');
          o.streek(`M0 ${(-hh).toFixed(1)} v${u(-9)}`, '#1b1836', 1.2 * s);
          o.gloed(0, -hh * 0.4, 3 * s, '#ffd27a', 0.95);
          o.gloed(0, -hh - 9 * s, 2 * s, '#b58cff', 0.8, 0);
        }
        mid.vlak(mid.kam(d * 0.78, d * 0.12, 70), '#171331');
        // Het boek dat in de lucht hangt, rechts van het midden, met
        // letters die eruit opstijgen. Eerst hingen hier losse runen over de
        // hele band, en dat las als alfabetsoep. Een boek is een ding.
        boek(voor.rechtop(L * 0.72, d * 0.56), s * 2.4, '#4a2a5c');
        for (let k = 0; k < 9; k++) {
          const t = 0.72 + (k % 3 - 1) * 0.04;
          const y = d * (0.5 - k * 0.045);
          voor.gloed(L * t + R(14, -14) * s, y, R(3.4, 1.8) * s, k % 2 ? '#ffe9a8' : '#b58cff', 0.8, 0);
        }
        // En een paar lichtbollen die er omheen zweven.
        for (const [t, v, r, kl] of [[0.56, 0.68, 5, '#b58cff'], [0.86, 0.42, 3.6, '#7fd7ff'], [0.3, 0.6, 4.4, '#b58cff'], [0.14, 0.44, 3, '#7fd7ff']]) {
          voor.gloed(L * t, d * v, r * s, kl, 1.1);
          voor.g.append(el('circle', {
            cx: (L * t).toFixed(1), cy: (d * v).toFixed(1), r: (r * 2.2 * s).toFixed(1),
            stroke: meng(kl, '#ffffff', 0.4), 'stroke-width': 0.7, fill: 'none', opacity: 0.4,
          }));
        }
      }

      // ------------------------------------------------------------- ONDER
      // De werktafel. Het blad ligt bij y=0, vlak voor je.
      if (b.kant === 'onder') {
        ver.waas(L * 0.5, d * 0.7, d * 1.2, '#4b3a9c', 0.3);
        // De wand achter de tafel, met een lambrisering.
        ver.vlak(`M0 ${(d + 4).toFixed(1)} H${L.toFixed(1)} V${(d * 0.56).toFixed(1)} H0 Z`, '#171331');
        for (let x = 0; x < L; x += 64 * s) ver.streek(`M${x.toFixed(1)} ${(d * 0.56).toFixed(1)} V${(d + 4).toFixed(1)}`, '#0d0a1e', 2 * s, 0.6);
        ver.streek(`M0 ${(d * 0.56).toFixed(1)} H${L.toFixed(1)}`, '#3a2f66', 2.6 * s, 0.7);
        // Het tafelblad: hout met nerf, van je af naar achteren.
        mid.vlak(`M0 -4 H${L.toFixed(1)} V${(d * 0.56).toFixed(1)} H0 Z`, '#3a2817');
        for (let k = 0; k < 7; k++) {
          mid.streek(`M0 ${(d * 0.56 * (k / 7) ** 1.3).toFixed(1)} H${L.toFixed(1)}`, k % 2 ? '#523a20' : '#2a1c10', 1.6 * s, 0.5);
        }
        mid.streek(`M0 ${(d * 0.56).toFixed(1)} H${L.toFixed(1)}`, '#6b4a24', 2.4 * s, 0.6);
        // Een stapel boeken links, plat op elkaar.
        const st = voor.rechtop(L * 0.14, d * 0.34);
        const ruggen = ['#5a2330', '#27405e', '#2f5038', '#5a3d1c', '#3d2a52'];
        for (let k = 0; k < 4; k++) {
          const br = (52 - k * 5) * s;
          const kl = ruggen[k % ruggen.length];
          st.vlak(`M${(-br / 2 + R(4, -4) * s).toFixed(1)} ${(-k * 11 * s).toFixed(1)} h${br.toFixed(1)} v${(-9 * s).toFixed(1)} h${(-br).toFixed(1)} Z`, kl);
          st.streek(`M${(-br / 2 + 2 * s).toFixed(1)} ${(-k * 11 * s - 4.5 * s).toFixed(1)} h${(br - 4 * s).toFixed(1)}`, meng(kl, '#ffffff', 0.4), 1.2 * s, 0.45);
        }
        // Een opengeslagen boek in het midden, waar het licht uit komt.
        boek(voor.rechtop(L * 0.42, d * 0.2), s * 2.2, '#5a2330');
        // De inktpot met pen, en een paar vlekken.
        const ip = voor.rechtop(L * 0.57, d * 0.24);
        const iu = (v) => (v * s * 1.8).toFixed(1);
        ip.vlak(`M${iu(-7)} 0 q${iu(-1)} ${iu(-10)} ${iu(7)} ${iu(-10)} q${iu(8)} 0 ${iu(7)} ${iu(10)} Z`, '#1a1430');
        ip.streek(`M${iu(-5)} ${iu(-9)} q${iu(5)} ${iu(-2.4)} ${iu(10)} 0`, '#6a5aa0', 1.4 * s, 0.6);
        ip.streek(`M${iu(2)} ${iu(-9)} q${iu(8)} ${iu(-16)} ${iu(5)} ${iu(-30)}`, '#e8e0cc', 2.2 * s, 0.95);
        ip.vlak(`M${iu(7)} ${iu(-39)} q${iu(4)} ${iu(5)} ${iu(0)} ${iu(10)} q${iu(-3)} ${iu(-5)} ${iu(0)} ${iu(-10)} Z`, '#cfc0a0', 0.9);
        ip.stip(14 * s, -2 * s, 2.4 * s, '#1a1430', 0.8);
        // De bol op een voet: het sterkste licht op de tafel.
        const bl = voor.rechtop(L * 0.78, d * 0.3);
        const bu = (v) => (v * s * 2).toFixed(1);
        bl.vlak(`M${bu(-9)} 0 q${bu(9)} ${bu(-3)} ${bu(18)} 0 Z`, '#9b7a2e');
        bl.streek(`M0 0 v${bu(-6)}`, '#9b7a2e', 2.4 * s * 2);
        bl.vlak(`M${bu(-7)} ${bu(-6)} q${bu(7)} ${bu(-5)} ${bu(14)} 0 Z`, '#8a6a2c');
        bl.gloed(0, -16 * s * 2, 11 * s * 2, '#b58cff', 1.4);
        bl.stip(0, -16 * s * 2, 8 * s * 2, '#d8c4ff', 0.5);
        bl.stip(-2.6 * s * 2, -18 * s * 2, 2.6 * s * 2, '#ffffff', 0.7);
        kandelaar(voor.rechtop(L * 0.92, d * 0.22), s * 1.8);
        // De puntige hoed, plat op de tafel naast de boeken: hij hing eerst
        // midden boven de puzzel en viel daar half over het speelveld.
        const h = voor.rechtop(L * 0.27, d * 0.12);
        const hu = (v) => (v * s * 2.1).toFixed(1);
        h.waas(0, -10 * s * 2.1, 30 * s * 2.1, '#8f6bff', 0.4);
        h.vlak(`M${hu(-26)} 0 q${hu(26)} ${hu(-8)} ${hu(52)} 0 q${hu(-26)} ${hu(7)} ${hu(-52)} 0 Z`, '#4c3fa4');
        h.streek(`M${hu(-24)} ${hu(-1)} q${hu(24)} ${hu(-7)} ${hu(48)} 0`, '#cdbcff', 1.6 * s, 0.7);
        h.vlak(`M${hu(-11)} ${hu(-3)} Q${hu(-6)} ${hu(-20)} ${hu(4)} ${hu(-27)} Q${hu(16)} ${hu(-33)} ${hu(22)} ${hu(-22)} Q${hu(14)} ${hu(-22)} ${hu(12)} ${hu(-14)} Q${hu(11)} ${hu(-6)} ${hu(11)} ${hu(-2)} Z`, '#6354c8');
        h.streek(`M${hu(-8)} ${hu(-5)} Q${hu(-3)} ${hu(-19)} ${hu(6)} ${hu(-25)}`, '#b9a6ff', 1.6 * s, 0.8);
        h.vlak(`M${hu(-10)} ${hu(-4)} q${hu(10)} ${hu(-5)} ${hu(21)} ${hu(-2)} l0 ${hu(-4)} q${hu(-11)} ${hu(-3)} ${hu(-21)} ${hu(2)} Z`, '#6b5416');
        h.gloed(5 * s * 2.1, -7 * s * 2.1, 4 * s * 2.1, '#ffd27a', 1.1);
        for (let k = 0; k < 5; k++) h.gloed((-4 + k * 5) * s * 2.1, (-12 - k * 2.6) * s * 2.1, (1.6 + (k % 2) * 0.8) * s * 2.1, k % 2 ? '#ffe9a8' : '#b58cff', 0.7, 0);
      }

      // ------------------------------------------------------------- LINKS
      // De boekenwand, van onder tot boven. De grond ligt bij x=0.
      if (b.kant === 'links') {
        ver.vlak(`M0 -4 H${L.toFixed(1)} V${(d * 0.9).toFixed(1)} H0 Z`, '#120f24');
        // Vier planken over de hele hoogte, met de ruggen erop.
        const ruggen = ['#5a2330', '#27405e', '#2f5038', '#5a3d1c', '#3d2a52', '#6b3a1c'];
        for (let p = 0; p < 4; p++) {
          const y = d * (0.3 + p * 0.19);
          mid.vlak(`M0 ${y.toFixed(1)} H${L.toFixed(1)} V${(y + 5 * s).toFixed(1)} H0 Z`, '#3a2817');
          mid.streek(`M0 ${y.toFixed(1)} H${L.toFixed(1)}`, '#6b4a24', 1.4 * s, 0.5);
          let x = R(14, 4);
          while (x < L - 10) {
            if (R() < 0.08) { x += R(30, 12); continue; }
            // Af en toe een stapeltje dat ligt in plaats van staat.
            if (R() < 0.12) {
              const bb = R(30, 20);
              const o = mid.rechtop(x, y);
              for (let k = 0; k < Math.round(R(4, 2)); k++) {
                const kl = K(ruggen);
                o.vlak(`M${R(3, -3).toFixed(1)} ${(-k * 5.4).toFixed(1)} h${bb.toFixed(1)} v-4.6 h${(-bb).toFixed(1)} Z`, kl);
                o.streek(`M0 ${(-2.2 - k * 5.4).toFixed(1)} h${bb.toFixed(1)}`, meng(kl, '#ffffff', 0.35), 0.7, 0.45);
              }
              x += bb + R(10, 3);
              continue;
            }
            const hh = R(d * 0.16, d * 0.08);
            const br = R(12, 6);
            const kl = K(ruggen);
            const o = mid.rechtop(x, y);
            const scheef = R() < 0.14 ? R(13, -13) : 0;
            const rug = el('g', scheef ? { transform: `rotate(${scheef.toFixed(1)})` } : {});
            o.g.append(rug);
            const w = kwast(rug, L, d, `rug${Math.round(x)}${p}`, b.kant);
            w.vlak(`M0 0 v${(-hh).toFixed(1)} h${br.toFixed(1)} v${hh.toFixed(1)} Z`, kl);
            w.streek(`M0.9 ${(-hh + 2).toFixed(1)} v${(hh - 5).toFixed(1)}`, meng(kl, '#ffffff', 0.4), 0.8, 0.4);
            if (R() < 0.34) w.streek(`M1.6 ${(-hh * 0.7).toFixed(1)} h${(br - 3).toFixed(1)}`, '#d8b258', 0.9, 0.7);
            x += br + R(4, 1.5);
          }
        }
        // De ladder die tegen de wand staat: twee bomen en negen sporten,
        // schuin over de hele hoogte.
        const lad = (t0, t1) => {
          const x0 = L * t0;
          const x1 = L * t1;
          voor.streek(`M${x0.toFixed(1)} ${(d * 0.92).toFixed(1)} L${x1.toFixed(1)} ${(d * 0.26).toFixed(1)}`, '#5a3f20', 3.4 * s);
          voor.streek(`M${(x0 + 26 * s).toFixed(1)} ${(d * 0.94).toFixed(1)} L${(x1 + 26 * s).toFixed(1)} ${(d * 0.28).toFixed(1)}`, '#5a3f20', 3.4 * s);
          for (let k = 0; k <= 8; k++) {
            const tt = k / 8;
            const sx = x0 + (x1 - x0) * tt;
            const sy = d * (0.92 - 0.66 * tt);
            voor.streek(`M${sx.toFixed(1)} ${sy.toFixed(1)} l${(26 * s).toFixed(1)} ${(2 * s).toFixed(1)}`, '#6b4a24', 2.6 * s, 0.95);
          }
        };
        lad(0.3, 0.52);
        // Het astrolabium dat voor de wand hangt: drie ringen en een wijzer.
        const ax = L * 0.74;
        const ay = d * 0.56;
        voor.streek(`M${ax.toFixed(1)} 0 V${(ay - 26 * s).toFixed(1)}`, '#5c4f2c', 1.2 * s, 0.8);
        const as = voor.rechtop(ax, ay);
        for (const [rx, ry, o] of [[26, 26, 1], [26, 9, 0.9], [11, 26, 0.85]]) {
          as.g.append(el('ellipse', {
            cx: 0, cy: 0, rx: (rx * s * 1.1).toFixed(1), ry: (ry * s * 1.1).toFixed(1),
            fill: 'none', stroke: '#c9a24c', 'stroke-width': (2 * s).toFixed(1), opacity: o,
          }));
        }
        as.streek(`M${(-22 * s).toFixed(1)} ${(14 * s).toFixed(1)} L${(22 * s).toFixed(1)} ${(-14 * s).toFixed(1)}`, '#e8c879', 1.6 * s, 0.9);
        as.gloed(0, 0, 4.4 * s, '#ffd27a', 1.1);
        kandelaar(voor.rechtop(L * 0.1, d * 0.92), s * 1.9);
        kandelaar(voor.rechtop(L * 0.62, d * 0.92), s * 1.4);
        kandelaar(voor.rechtop(L * 0.9, d * 0.9), s * 1.7);
        for (let k = 0; k < 5; k++) {
          const t = 0.16 + k * 0.18;
          voor.gloed(L * t, d * (0.5 + (k % 3) * 0.14), (3 + (k % 2) * 1.6) * s, k % 2 ? '#b58cff' : '#7fd7ff', 1);
        }
      }

      // ------------------------------------------------------------ RECHTS
      // Een spitsboograam over de hele hoogte. De grond ligt bij x=L.
      if (b.kant === 'rechts') {
        ver.vlak(`M0 -4 H${L.toFixed(1)} V${(d * 0.94).toFixed(1)} H0 Z`, '#120f24');
        // De dagkant van het raam: een lange opening met een spits aan de
        // bovenkant van de pagina, dus bij x klein.
        const y0 = d * 0.12;
        const y1 = d * 0.84;
        const x0 = L * 0.1;
        const x1 = L * 0.88;
        ver.vlak(`M${x1.toFixed(1)} ${y0.toFixed(1)} H${(x0 + L * 0.1).toFixed(1)} Q${x0.toFixed(1)} ${((y0 + y1) / 2).toFixed(1)} ${(x0 + L * 0.1).toFixed(1)} ${y1.toFixed(1)} H${x1.toFixed(1)} Z`, '#0a1024');
        // De nacht achter het glas, met de maan.
        ver.waas(L * 0.45, d * 0.5, d * 0.9, '#2c6ba8', 0.4);
        ver.spikkels(n(26), ['#ffffff', '#cfd8ff'], { y0: y0 + 6, y1: y1 - 6, groot: 1.2, halo: 0.3 });
        ver.gloed(L * 0.3, d * 0.42, 17 * s, '#e8eeff', 1.3);
        ver.stip(L * 0.3, d * 0.42, 14 * s, '#f2f4ff', 0.85);
        ver.stip(L * 0.3 - 4 * s, d * 0.42 - 3 * s, 3.4 * s, '#cdd6f0', 0.5);
        ver.stip(L * 0.3 + 5 * s, d * 0.42 + 4 * s, 2.4 * s, '#cdd6f0', 0.4);
        // Het maaswerk: ongelijke ruitjes met lood ertussen.
        for (let x = L * 0.12; x < x1; x += 30 * s) {
          mid.streek(`M${x.toFixed(1)} ${y0.toFixed(1)} V${y1.toFixed(1)}`, '#1b1836', 2.2 * s, 0.9);
        }
        for (let y = y0 + 24 * s; y < y1; y += 24 * s) {
          mid.streek(`M${(L * 0.11).toFixed(1)} ${y.toFixed(1)} H${x1.toFixed(1)}`, '#1b1836', 1.8 * s, 0.85);
        }
        // Gekleurd glas in een paar ruitjes, dat oplicht.
        for (const [t, v, kl] of [[0.2, 0.3, '#b58cff'], [0.26, 0.62, '#7fd7ff'], [0.46, 0.24, '#ff8fd6'], [0.6, 0.56, '#ffd27a'], [0.74, 0.34, '#7fd7ff']]) {
          mid.vlak(`M${(L * t).toFixed(1)} ${(d * v).toFixed(1)} h${(28 * s).toFixed(1)} v${(22 * s).toFixed(1)} h${(-28 * s).toFixed(1)} Z`, kl, 0.4);
          mid.waas(L * t + 14 * s, d * v + 11 * s, 26 * s, kl, 0.3);
        }
        // De stenen omlijsting, met een spits.
        mid.streek(`M${x1.toFixed(1)} ${y0.toFixed(1)} H${(x0 + L * 0.1).toFixed(1)} Q${x0.toFixed(1)} ${((y0 + y1) / 2).toFixed(1)} ${(x0 + L * 0.1).toFixed(1)} ${y1.toFixed(1)} H${x1.toFixed(1)}`, '#2a2448', 7 * s, 1);
        mid.streek(`M${x1.toFixed(1)} ${(y0 + 4 * s).toFixed(1)} H${(x0 + L * 0.1).toFixed(1)} Q${(x0 + 4 * s).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)} ${(x0 + L * 0.1).toFixed(1)} ${(y1 - 4 * s).toFixed(1)}`, '#4a4270', 1.4 * s, 0.5);
        // De vensterbank onderaan de pagina, dus bij x=L.
        voor.vlak(`M${x1.toFixed(1)} ${(y0 - 6 * s).toFixed(1)} h${(10 * s).toFixed(1)} V${(y1 + 6 * s).toFixed(1)} h${(-10 * s).toFixed(1)} Z`, '#2a2448');
        // De telescoop, schuin voor het raam.
        const tel = voor.rechtop(L * 0.62, d * 0.9);
        const tu = (v) => (v * s * 1.9).toFixed(1);
        tel.streek(`M0 0 l${tu(-9)} ${tu(-20)}`, '#4a4270', 3 * s * 1.9);
        tel.streek(`M0 0 l${tu(9)} ${tu(-20)}`, '#4a4270', 3 * s * 1.9);
        tel.streek(`M0 0 l0 ${tu(-22)}`, '#4a4270', 3 * s * 1.9);
        tel.streek(`M${tu(-16)} ${tu(-16)} L${tu(20)} ${tu(-44)}`, '#1d1a3a', 9 * s * 1.9);
        tel.streek(`M${tu(-16)} ${tu(-16)} L${tu(20)} ${tu(-44)}`, '#5a5290', 5 * s * 1.9);
        tel.streek(`M${tu(-14)} ${tu(-18)} L${tu(16)} ${tu(-41)}`, '#9a92c8', 1.4 * s * 1.9, 0.7);
        tel.vlak(`M${tu(18)} ${tu(-47)} l${tu(7)} ${tu(5)} l${tu(-5)} ${tu(4)} l${tu(-7)} ${tu(-5)} Z`, '#c9a24c');
        tel.gloed(22 * s * 1.9, -44 * s * 1.9, 4 * s * 1.9, '#ffd27a', 1);
        kandelaar(voor.rechtop(L * 0.95, d * 0.94), s * 1.8);
        kandelaar(voor.rechtop(L * 0.2, d * 0.94), s * 1.4);
      }

      b.spikkels(n(30), ['#ffd27a', '#b58cff', '#ffffff'], { y0: d * 0.12, y1: d });
    },
  },

  // Halloween: een erf in de nacht. Vier kanten, vier plekken op datzelfde
  // erf, en op elke kant staat iets dat van binnenuit brandt.
  //
  //   BOVEN   kale takken en een volle maan waar vleermuizen voor langs
  //           gaan, met een spin die aan een draad naar beneden komt.
  //   ONDER   het pad vlak voor je: drie pompoenen met elk een ander
  //           gezicht, bladeren, nevel en een scheve grafsteen.
  //   LINKS   een dode boom over de hele hoogte, met een gezicht in de
  //           stam, spinrag in de hoek en een kraai op een stronk.
  //   RECHTS  een scheve schutting met een heksenhoed op een stok, en een
  //           ketel die groen opgloeit.
  halloween: {
    kern: '#1d1118', koel: '#0a050a', warm: '#ffb877', textuur: 'nerf', ruw: 0.24, stap: 46,
    gloed: '#ff8a1f',
    verf(b) {
      const { d, L, R, K, n } = b;
      const s = d / 100;
      const ver = b.laag('randver', 0.62);
      const mid = b.laag('randmid');
      const voor = b.laag('randvoor');

      const pompoen = (o, m, gezicht = 0) => {
        const u = (v) => (v * m).toFixed(1);
        o.waas(0, -10 * m, 34 * m, '#ff8a1f', 0.44);
        o.vlak(`M0 ${u(-20)} q${u(15)} 0 ${u(15)} ${u(10)} q0 ${u(10)} ${u(-15)} ${u(10)} q${u(-15)} 0 ${u(-15)} ${u(-10)} q0 ${u(-10)} ${u(15)} ${u(-10)} Z`, '#c85f14');
        o.vlak(`M0 ${u(-20)} q${u(8)} 0 ${u(8)} ${u(10)} q0 ${u(10)} ${u(-8)} ${u(10)} q${u(-8)} 0 ${u(-8)} ${u(-10)} q0 ${u(-10)} ${u(8)} ${u(-10)} Z`, '#d86f1c', 0.8);
        o.streek(`M0 ${u(-19)} q${u(5)} ${u(10)} 0 ${u(19)}`, '#8a3c0c', 1.2 * m, 0.6);
        o.streek(`M${u(-7)} ${u(-18)} q${u(-3)} ${u(10)} 0 ${u(17)}`, '#8a3c0c', 1 * m, 0.5);
        o.streek(`M0 ${u(-20)} l${u(2)} ${u(-8)} l${u(-5)} ${u(-2)}`, '#4a6b2a', 2.6 * m);
        // Drie verschillende gezichten, want drie dezelfde is een patroon.
        if (gezicht === 0) {
          o.vlak(`M${u(-6)} ${u(-12)} l${u(5)} ${u(-4)} l0 ${u(5)} Z`, '#ffe08a');
          o.vlak(`M${u(6)} ${u(-12)} l${u(-5)} ${u(-4)} l0 ${u(5)} Z`, '#ffe08a');
          o.vlak(`M${u(-7)} ${u(-5)} q${u(7)} ${u(5)} ${u(14)} 0 q${u(-7)} ${u(3)} ${u(-14)} 0 Z`, '#ffe08a');
        } else if (gezicht === 1) {
          o.vlak(`M${u(-7)} ${u(-13)} l${u(6)} ${u(2)} l${u(-6)} ${u(3)} Z`, '#ffe08a');
          o.vlak(`M${u(7)} ${u(-13)} l${u(-6)} ${u(2)} l${u(6)} ${u(3)} Z`, '#ffe08a');
          o.vlak(`M${u(-8)} ${u(-6)} l${u(4)} ${u(4)} l${u(4)} ${u(-4)} l${u(4)} ${u(4)} l${u(4)} ${u(-4)} l0 ${u(5)} l${u(-16)} 0 Z`, '#ffe08a');
        } else {
          o.ovaal(-5.4 * m, -12 * m, 3 * m, 3.4 * m, '#ffe08a');
          o.ovaal(5.4 * m, -12 * m, 3 * m, 3.4 * m, '#ffe08a');
          o.vlak(`M${u(-5)} ${u(-5)} q${u(5)} ${u(-4)} ${u(10)} 0 q${u(-5)} ${u(7)} ${u(-10)} 0 Z`, '#ffe08a');
        }
        o.gloed(0, -10 * m, 7 * m, '#ff8a1f', 1.15, 0);
      };
      const vleermuis = (o, m) => {
        const u = (v) => (v * m).toFixed(1);
        o.vlak(`M0 0 q${u(-5)} ${u(-5)} ${u(-11)} ${u(-1)} q${u(4)} ${u(1)} ${u(5)} ${u(5)} q${u(3)} ${u(-2)} ${u(6)} ${u(-4)} q${u(3)} ${u(2)} ${u(6)} ${u(4)} q${u(1)} ${u(-4)} ${u(5)} ${u(-5)} q${u(-6)} ${u(-4)} ${u(-11)} ${u(1)} Z`, '#120b11', 0.94);
      };
      const tak = (laag, x, y0, y1, zw, dik) => {
        laag.streek(`M${x.toFixed(1)} ${y0.toFixed(1)} Q${(x + zw).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)} ${(x + zw * 0.4).toFixed(1)} ${y1.toFixed(1)}`, '#3a2519', dik, 0.95);
        for (let j = 0; j < 3; j++) {
          const t = 0.25 + j * 0.25;
          const bx = x + zw * (2 * t * (1 - t) + t * t * 0.4);
          const by = y0 + (y1 - y0) * t;
          laag.streek(`M${bx.toFixed(1)} ${by.toFixed(1)} l${(R(18, -18) * s).toFixed(1)} ${(R(12, -5) * s).toFixed(1)}`, '#3a2519', dik * 0.5, 0.85);
        }
      };
      const rag = (laag, x, y, r, kant) => {
        for (let a = 0; a <= 5; a++) {
          const h = (a / 5) * Math.PI * 0.5;
          laag.streek(`M${x.toFixed(1)} ${y.toFixed(1)} l${(kant * Math.cos(h) * r).toFixed(1)} ${(Math.sin(h) * r).toFixed(1)}`, '#d8d2e0', 0.6, 0.34);
        }
        for (let k = 1; k <= 3; k++) {
          const rr = (r * k) / 3.4;
          laag.streek(`M${(x + kant * rr).toFixed(1)} ${y.toFixed(1)} Q${(x + kant * rr * 0.6).toFixed(1)} ${(y + rr * 0.6).toFixed(1)} ${x.toFixed(1)} ${(y + rr).toFixed(1)}`, '#d8d2e0', 0.5, 0.3);
        }
      };

      // ------------------------------------------------------------- BOVEN
      if (b.kant === 'boven') {
        for (let i = 0; i < 6; i++) ver.waas(L * (0.06 + i * 0.18), d * 0.42, d * 1.2, i % 2 ? '#7a3410' : '#45205a', 0.42);
        // De maan, rechts van het midden, groot en laag.
        const mx = L * 0.68;
        const my = d * 0.34;
        const mr = d * 0.3;
        ver.waas(mx, my, mr * 3, '#ffd9a0', 0.4);
        ver.stip(mx, my, mr, '#ffeccb');
        ver.stip(mx - mr * 0.3, my - mr * 0.2, mr * 0.2, '#e8d2ae', 0.6);
        ver.stip(mx + mr * 0.26, my + mr * 0.3, mr * 0.14, '#e8d2ae', 0.5);
        ver.stip(mx + mr * 0.1, my - mr * 0.42, mr * 0.1, '#e8d2ae', 0.45);
        ver.vlak(ver.kam(d * 0.3, d * 0.2, 84, 0.7), '#22131f');
        // Kale takken die van boven naar beneden kronkelen, hand voor hand.
        for (const [t, zw, dik] of [[0.04, 34, 4], [0.16, -26, 3.2], [0.3, 30, 3.6], [0.48, -34, 4.4], [0.6, 22, 2.8], [0.84, -30, 3.8], [0.96, 26, 3.2]]) {
          tak(mid, L * t, -4, d * R(0.96, 0.6), zw * s, dik * s);
        }
        // Vleermuizen, in een boog voor de maan langs: een rij die ergens
        // naartoe gaat, niet twintig losse stippen.
        for (let k = 0; k < 7; k++) {
          const t = 0.42 + k * 0.08;
          const v = 0.26 + Math.sin(k * 0.9) * 0.14;
          vleermuis(voor.rechtop(L * t, d * v), s * (1.4 + (k % 3) * 0.5));
        }
        vleermuis(voor.rechtop(L * 0.2, d * 0.2), s * 1.1);
        vleermuis(voor.rechtop(L * 0.1, d * 0.4), s * 0.9);
        rag(mid, 0, 0, 60 * s, 1);
        rag(mid, L, 0, 60 * s, -1);
        // De spin aan een draad, links van het midden.
        const sx = L * 0.33;
        const sy = d * 0.7;
        voor.streek(`M${sx.toFixed(1)} -4 V${sy.toFixed(1)}`, '#d8d2e0', 0.7, 0.6);
        const sp = voor.rechtop(sx, sy);
        const pu = (v) => (v * s * 1.7).toFixed(1);
        for (const kant of [-1, 1]) {
          for (let k = 0; k < 4; k++) {
            sp.streek(`M0 0 q${pu(kant * (7 + k * 2))} ${pu(-6 + k * 3)} ${pu(kant * (11 + k * 3))} ${pu(2 + k * 4)}`, '#15101a', 1.4 * s, 0.95);
          }
        }
        sp.ovaal(0, 0, 8 * s * 1.7, 7 * s * 1.7, '#1a1220');
        sp.vlak(`M${pu(-4)} ${pu(-2)} l${pu(4)} ${pu(5)} l${pu(4)} ${pu(-5)} Z`, '#c8402a', 0.9);
        sp.gloed(-2.6 * s * 1.7, -4 * s * 1.7, 1.4 * s * 1.7, '#ff8a1f', 0.9);
        sp.gloed(2.6 * s * 1.7, -4 * s * 1.7, 1.4 * s * 1.7, '#ff8a1f', 0.9);
      }

      // ------------------------------------------------------------- ONDER
      // Het pad. De grond ligt bij y=0, vlak voor je voeten.
      if (b.kant === 'onder') {
        ver.waas(L * 0.5, d * 0.8, d * 1.3, '#45205a', 0.4);
        ver.vlak(ver.kam(d * 0.72, d * 0.16, 90, 0.6), '#22131f');
        for (const [t, zw] of [[0.1, 22], [0.36, -18], [0.76, 20], [0.94, -16]]) {
          tak(ver, L * t, d + 4, d * 0.56, zw * s, 2.6 * s);
        }
        // Nevel over de grond: laag, breed en warm van onderen.
        for (let k = 0; k < 7; k++) ver.waas(L * (0.06 + k * 0.15), d * 0.18, d * 0.6, '#8a6a7a', 0.3);
        // Het pad zelf, met tegels die naar achteren smaller worden.
        mid.vlak(`M0 -4 H${L.toFixed(1)} V${(d * 0.5).toFixed(1)} H0 Z`, '#241820');
        for (let k = 0; k < 5; k++) {
          const y = d * 0.5 * (1 - (k / 5) ** 1.6);
          mid.streek(`M${(L * 0.05 * k).toFixed(1)} ${y.toFixed(1)} H${(L - L * 0.05 * k).toFixed(1)}`, '#15101a', 1.6 * s, 0.6);
        }
        // Gevallen blad, meer naarmate je dichterbij komt.
        for (let i = 0; i < n(13); i++) {
          const t = R();
          mid.loof(L * t, d * 0.5 * R(1, 0) ** 1.6, R(18, 10) * s, R(9, 5) * s, R(220, -40), K(['#8a4a16', '#b86a1c', '#6b3a12', '#c88a2c']), R(1, 0.7));
        }
        // De scheve grafsteen, links, met mos onderaan.
        const gr = voor.rechtop(L * 0.14, d * 0.3);
        const gu = (v) => (v * s * 2.2).toFixed(1);
        const steen = el('g', { transform: 'rotate(-7)' });
        gr.g.append(steen);
        const w = kwast(steen, L, d, 'graf', b.kant);
        w.vlak(`M${gu(-15)} 0 V${gu(-28)} Q0 ${gu(-42)} ${gu(15)} ${gu(-28)} V0 Z`, '#6e665c');
        w.streek(`M${gu(-13)} ${gu(-28)} Q0 ${gu(-40)} ${gu(13)} ${gu(-28)}`, '#8d8478', 1.4 * s, 0.5);
        w.streek(`M${gu(13)} 0 V${gu(-28)}`, '#15110f', 2 * s, 0.6);
        for (let k = 0; k < 3; k++) w.streek(`M${gu(-8)} ${gu(-22 + k * 6)} h${gu(16)}`, '#1a1518', 1.3 * s, 0.6);
        w.vlak(`M${gu(-17)} ${gu(1)} q${gu(17)} ${gu(-9)} ${gu(34)} 0 Z`, '#2a3a28', 0.8);
        // Drie pompoenen, elk een andere maat en een ander gezicht.
        pompoen(voor.rechtop(L * 0.42, d * 0.14), s * 1.9, 0);
        pompoen(voor.rechtop(L * 0.62, d * 0.3), s * 1.3, 1);
        pompoen(voor.rechtop(L * 0.84, d * 0.1), s * 2.3, 2);
        // Een omgevallen pompoen die niet brandt, als tegenwicht.
        const kl = voor.rechtop(L * 0.3, d * 0.42);
        kl.ovaal(0, -7 * s, 13 * s, 9 * s, '#8a4a12');
        kl.streek(`M${(-8 * s).toFixed(1)} ${(-10 * s).toFixed(1)} q${(8 * s).toFixed(1)} ${(-4 * s).toFixed(1)} ${(16 * s).toFixed(1)} 0`, '#6b3a0e', 1.2 * s, 0.6);
        kl.streek(`M${(12 * s).toFixed(1)} ${(-9 * s).toFixed(1)} l${(7 * s).toFixed(1)} ${(-4 * s).toFixed(1)}`, '#4a6b2a', 2.4 * s);
      }

      // ------------------------------------------------------------- LINKS
      // Een dode boom over de hele hoogte. De grond ligt bij x=0.
      if (b.kant === 'links') {
        ver.waas(L * 0.5, d * 0.4, d * 1.4, '#45205a', 0.4);
        ver.vlak(ver.kam(d * 0.26, d * 0.16, 90, 0.6), '#22131f');
        for (const [t, zw] of [[0.2, 20], [0.52, -22], [0.86, 18]]) tak(ver, L * t, 0, d * 0.5, zw * s, 2.4 * s);
        // De stam: een baan over de hele hoogte, met knoesten.
        const y0 = d * 0.3;
        const br = d * 0.34;
        mid.vlak(`M0 ${y0.toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(y0 - d * 0.08).toFixed(1)} ${L.toFixed(1)} ${(y0 + d * 0.02).toFixed(1)} L${L.toFixed(1)} ${(y0 + br).toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(y0 + br - d * 0.06).toFixed(1)} 0 ${(y0 + br).toFixed(1)} Z`, '#2e2118');
        mid.streek(`M0 ${(y0 + br * 0.2).toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(y0 + br * 0.2 - d * 0.07).toFixed(1)} ${L.toFixed(1)} ${(y0 + br * 0.2 + d * 0.02).toFixed(1)}`, '#6b4a2c', br * 0.1, 0.5);
        mid.streek(`M0 ${(y0 + br * 0.86).toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(y0 + br * 0.86 - d * 0.07).toFixed(1)} ${L.toFixed(1)} ${(y0 + br * 0.86 + d * 0.02).toFixed(1)}`, '#0c0906', br * 0.16, 0.6);
        for (let k = 1; k < 8; k++) {
          mid.streek(`M${(L * k / 8).toFixed(1)} ${(y0 + br * 0.3).toFixed(1)} q${(L * 0.02).toFixed(1)} ${(br * 0.16).toFixed(1)} 0 ${(br * 0.4).toFixed(1)}`, '#15100c', br * 0.05, 0.5);
        }
        // Takken die uit de stam het bord in groeien.
        for (const [t, lang] of [[0.24, 0.4], [0.58, 0.52], [0.9, 0.34]]) {
          tak(mid, L * t, y0 + br * 0.6, d * (0.6 + lang * 0.5), R(26, -26) * s, 3.4 * s);
        }
        // Het gezicht in de stam: twee gloeiende ogen en een scheve mond.
        const g = mid.rechtop(L * 0.44, y0 + br * 0.5);
        const fu = (v) => (v * s * 2).toFixed(1);
        g.vlak(`M${fu(-16)} ${fu(-9)} q${fu(16)} ${fu(-7)} ${fu(32)} 0 q${fu(-4)} ${fu(16)} ${fu(-16)} ${fu(17)} q${fu(-12)} ${fu(-1)} ${fu(-16)} ${fu(-17)} Z`, '#1a120c');
        g.ovaal(-7 * s * 2, -2 * s * 2, 5 * s * 2, 4.4 * s * 2, '#0a0705');
        g.ovaal(7 * s * 2, -2 * s * 2, 5 * s * 2, 4.4 * s * 2, '#0a0705');
        g.gloed(-7 * s * 2, -2 * s * 2, 3.4 * s * 2, '#ff8a1f', 1.2);
        g.gloed(7 * s * 2, -2 * s * 2, 3.4 * s * 2, '#ff8a1f', 1.2);
        g.vlak(`M${fu(-9)} ${fu(8)} q${fu(9)} ${fu(6)} ${fu(18)} ${fu(-2)} q${fu(-9)} ${fu(10)} ${fu(-18)} ${fu(2)} Z`, '#0a0705');
        g.streek(`M${fu(-16)} ${fu(-9)} q${fu(16)} ${fu(-7)} ${fu(32)} 0`, '#6b4a2c', 1.6 * s, 0.5);
        rag(voor, 0, 0, 70 * s, 1);
        // De kraai op een stronk, onderaan de pagina.
        voor.vlak(`M${(L * 0.04).toFixed(1)} ${(d * 0.86).toFixed(1)} h${(26 * s).toFixed(1)} v${(14 * s).toFixed(1)} h${(-26 * s).toFixed(1)} Z`, '#2a1d14');
        voor.ovaal(L * 0.04 + 13 * s, d * 0.86, 13 * s, 4.4 * s, '#3e2c1e');
        const kr = voor.rechtop(L * 0.04 + 13 * s, d * 0.86);
        const ku = (v) => (v * s * 1.8).toFixed(1);
        kr.streek(`M${ku(7)} ${ku(-8)} Q${ku(20)} ${ku(-6)} ${ku(24)} ${ku(2)}`, '#0d0a10', 3.4 * s * 1.8);
        kr.ovaal(2 * s * 1.8, -11 * s * 1.8, 10 * s * 1.8, 8 * s * 1.8, '#12101a');
        kr.ovaal(-7 * s * 1.8, -19 * s * 1.8, 5.4 * s * 1.8, 4.6 * s * 1.8, '#12101a');
        kr.vlak(`M${ku(-11)} ${ku(-19)} L${ku(-20)} ${ku(-17)} L${ku(-11)} ${ku(-15)} Z`, '#d8a02c');
        kr.gloed(-8 * s * 1.8, -20 * s * 1.8, 1.5 * s * 1.8, '#ffd27a', 0.9);
        kr.streek(`M${ku(-2)} ${ku(-3)} v${ku(3)}`, '#d8a02c', 1.6 * s * 1.8);
        kr.streek(`M${ku(4)} ${ku(-3)} v${ku(3)}`, '#d8a02c', 1.6 * s * 1.8);
        pompoen(voor.rechtop(L * 0.72, d * 0.94), s * 1.7, 1);
      }

      // ------------------------------------------------------------ RECHTS
      // Een scheve schutting, een heksenhoed op een stok, en een ketel.
      if (b.kant === 'rechts') {
        ver.waas(L * 0.5, d * 0.4, d * 1.4, '#7a3410', 0.38);
        ver.vlak(ver.kam(d * 0.24, d * 0.14, 86, 0.6), '#22131f');
        for (const [t, zw] of [[0.14, -20], [0.46, 22], [0.78, -18]]) tak(ver, L * t, 0, d * 0.44, zw * s, 2.4 * s);
        // De schutting: planken van ongelijke hoogte, elk een andere hoek.
        mid.streek(`M0 ${(d * 0.46).toFixed(1)} H${L.toFixed(1)}`, '#2a1d14', 5 * s, 0.95);
        mid.streek(`M0 ${(d * 0.72).toFixed(1)} H${L.toFixed(1)}`, '#2a1d14', 5 * s, 0.95);
        for (let x = 4 * s; x < L; x += 24 * s) {
          const hoog = d * (0.3 + R(0.1, 0));
          const laag = d * (0.86 + R(0.08, 0));
          const scheef = R(5, -5) * s;
          mid.vlak(`M${x.toFixed(1)} ${hoog.toFixed(1)} L${(x + scheef).toFixed(1)} ${laag.toFixed(1)} h${(17 * s).toFixed(1)} L${(x + 17 * s).toFixed(1)} ${hoog.toFixed(1)} Z`, K(['#3a2a1c', '#2e2116', '#453322']));
          mid.streek(`M${(x + 2 * s).toFixed(1)} ${(hoog + 4 * s).toFixed(1)} V${(laag - 4 * s).toFixed(1)}`, '#5a4228', 1.2 * s, 0.4);
          mid.streek(`M${(x + 16 * s).toFixed(1)} ${(hoog + 2 * s).toFixed(1)} V${(laag - 2 * s).toFixed(1)}`, '#120c08', 1.6 * s, 0.5);
          if (R() < 0.2) mid.vlak(`M${x.toFixed(1)} ${hoog.toFixed(1)} l${(17 * s).toFixed(1)} 0 l${(-8 * s).toFixed(1)} ${(-7 * s).toFixed(1)} Z`, '#1d1118');
        }
        rag(voor, L, 0, 62 * s, -1);
        // De heksenhoed op een stok, boven de schutting uit.
        const hx = L * 0.3;
        voor.streek(`M${hx.toFixed(1)} ${(d * 0.88).toFixed(1)} V${(d * 0.2).toFixed(1)}`, '#2a1d14', 3 * s);
        const h = voor.rechtop(hx, d * 0.2);
        const hu = (v) => (v * s * 2.1).toFixed(1);
        h.waas(0, -10 * s * 2.1, 36 * s * 2.1, '#8a4aff', 0.34);
        h.vlak(`M${hu(-24)} 0 q${hu(24)} ${hu(-9)} ${hu(48)} 0 q${hu(-24)} ${hu(8)} ${hu(-48)} 0 Z`, '#241a38');
        h.streek(`M${hu(-22)} ${hu(-1)} q${hu(22)} ${hu(-8)} ${hu(44)} 0`, '#6a5a9c', 1.6 * s, 0.6);
        h.vlak(`M${hu(-10)} ${hu(-4)} Q${hu(-7)} ${hu(-22)} ${hu(2)} ${hu(-31)} Q${hu(12)} ${hu(-40)} ${hu(18)} ${hu(-28)} Q${hu(10)} ${hu(-26)} ${hu(9)} ${hu(-16)} Q${hu(9)} ${hu(-8)} ${hu(10)} ${hu(-3)} Z`, '#2e2248');
        h.streek(`M${hu(-7)} ${hu(-6)} Q${hu(-4)} ${hu(-21)} ${hu(4)} ${hu(-29)}`, '#7a68b8', 1.4 * s, 0.7);
        h.vlak(`M${hu(-9)} ${hu(-5)} q${hu(9)} ${hu(-5)} ${hu(19)} ${hu(-2)} l0 ${hu(-4)} q${hu(-10)} ${hu(-3)} ${hu(-19)} ${hu(2)} Z`, '#15101f');
        h.gloed(4 * s * 2.1, -8 * s * 2.1, 3.4 * s * 2.1, '#8fff9c', 1);
        // De ketel aan de voet van de pagina, met groen licht erboven.
        const ket = voor.rechtop(L * 0.82, d * 0.9);
        const cu = (v) => (v * s * 2.1).toFixed(1);
        ket.waas(0, -22 * s * 2.1, 40 * s * 2.1, '#8fff9c', 0.42);
        ket.vlak(`M${cu(-17)} ${cu(-14)} q${cu(-3)} ${cu(14)} ${cu(17)} ${cu(14)} q${cu(20)} 0 ${cu(17)} ${cu(-14)} Z`, '#15171d');
        ket.streek(`M${cu(-19)} ${cu(-14)} h${cu(38)}`, '#3a3f48', 2.6 * s * 2.1);
        ket.streek(`M${cu(-15)} ${cu(-13)} q${cu(-9)} ${cu(-8)} ${cu(-2)} ${cu(-14)}`, '#3a3f48', 2 * s * 2.1, 0.9);
        ket.ovaal(0, -14 * s * 2.1, 17 * s * 2.1, 4.4 * s * 2.1, '#2f7a3c');
        ket.gloed(0, -15 * s * 2.1, 12 * s * 2.1, '#8fff9c', 1.3);
        for (let k = 0; k < 5; k++) {
          ket.gloed((k % 2 ? 1 : -1) * (3 + k * 2.4) * s * 2.1, (-22 - k * 7) * s * 2.1, (2.4 + (k % 2) * 1.4) * s * 2.1, '#8fff9c', 0.7, 0);
        }
        for (let k = -1; k <= 1; k++) ket.streek(`M${cu(k * 12 - 6)} ${cu(1)} l${cu(14)} 0`, '#3a2415', 4 * s * 2.1);
        pompoen(voor.rechtop(L * 0.58, d * 0.9), s * 1.5, 2);
        pompoen(voor.rechtop(L * 0.06, d * 0.92), s * 1.9, 0);
      }

      b.spikkels(n(34), ['#8fff9c', '#ff8a1f'], { y0: d * 0.2, y1: d });
    },
  },

  // Kerst: een besneeuwd erf bij avond. Het lichtsnoer loopt over alle vier
  // de kanten door en bindt ze aan elkaar; daarbinnen is elke kant iets
  // anders.
  //
  //   BOVEN   besneeuwde dennentakken die naar beneden hangen, met het
  //           snoer eronder en een ster in het midden.
  //   ONDER   de sneeuw vlak voor je: een lantaarn in de berm, een stapel
  //           pakjes, voetstappen, kegels, en een roodborstje.
  //   LINKS   de zijkant van een kerstboom over de hele hoogte, met ballen
  //           en kaarsjes tussen de takken.
  //   RECHTS  een raam van buiten gezien: warm licht, een krans, ijspegels
  //           en sneeuw op de vensterbank.
  kerst: {
    kern: '#0d2019', koel: '#04100c', warm: '#bfe9c8', textuur: 'vezel', ruw: 0.16, stap: 30,
    gloed: '#ffd98a',
    verf(b) {
      const { d, L, R, K, n } = b;
      const s = d / 100;
      const ver = b.laag('randver', 0.6);
      const mid = b.laag('randmid');
      const voor = b.laag('randvoor');
      const lampkleuren = ['#ff5d5d', '#ffd14d', '#6fe88a', '#6fc3ff', '#ff8ad4'];

      // Een dennentak met naalden en sneeuw erop.
      const dennetak = (laag, x, y, lang, hk, dik = 1.8) => {
        const tip = [x + Math.cos(hk) * lang, y + Math.sin(hk) * lang];
        laag.streek(`M${x.toFixed(1)} ${y.toFixed(1)} L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`, '#4a3620', dik, 0.9);
        for (let j = 1; j <= 8; j++) {
          const t = j / 9;
          const nx = x + (tip[0] - x) * t;
          const ny = y + (tip[1] - y) * t;
          const naald = (8 + (1 - t) * 10) * s * R(1.2, 0.8);
          for (const kant of [-1, 1]) {
            const a = hk + kant * 1.1;
            laag.streek(`M${nx.toFixed(1)} ${ny.toFixed(1)} l${(Math.cos(a) * naald).toFixed(1)} ${(Math.sin(a) * naald).toFixed(1)}`, kant < 0 ? '#2f6b45' : '#1f4d33', 2 * s, 0.92);
            if (R() < 0.42) laag.streek(`M${nx.toFixed(1)} ${ny.toFixed(1)} l${(Math.cos(a) * naald * 0.8).toFixed(1)} ${(Math.sin(a) * naald * 0.8).toFixed(1)}`, '#e8f4ff', 1.1 * s, 0.55);
          }
        }
        return tip;
      };
      const bal = (o, m, kl) => {
        const u = (v) => (v * m).toFixed(1);
        o.streek(`M0 ${u(-10)} v${u(4)}`, '#8d7a4c', 1 * m, 0.8);
        o.vlak(`M${u(-2.4)} ${u(-7)} h${u(4.8)} v${u(2.6)} h${u(-4.8)} Z`, '#c9a24c');
        o.stip(0, 0, 6 * m, kl);
        o.ovaal(-1.8 * m, -2 * m, 2 * m, 1.3 * m, '#ffffff', 0.6);
        o.gloed(0, 0, 3 * m, kl, 0.55, 0);
      };
      const kaarsje = (o, m) => {
        const u = (v) => (v * m).toFixed(1);
        o.vlak(`M${u(-2)} 0 h${u(4)} v${u(-11)} h${u(-4)} Z`, '#f2e8d0');
        o.vlak(`M${u(-3.4)} ${u(1)} q${u(3.4)} ${u(2.4)} ${u(6.8)} 0 q${u(-3.4)} ${u(1.6)} ${u(-6.8)} 0 Z`, '#c9a24c');
        o.gloed(0, -14 * m, 5.6 * m, '#ffd98a', 1.2);
        o.vlak(`M0 ${u(-19)} q${u(3)} ${u(4)} 0 ${u(6.8)} q${u(-3)} ${u(-2.8)} 0 ${u(-6.8)} Z`, '#fff6cf');
      };
      // Het snoer: een doorhangende draad met lampjes, over elke kant.
      const snoer = (y, vak, start) => {
        let draad = `M0 ${y.toFixed(1)}`;
        const boog = d * 0.26;
        for (let x = 0; x < L; x += vak) {
          const nx = Math.min(L, x + vak);
          draad += ` Q${((x + nx) / 2).toFixed(1)} ${(y + boog).toFixed(1)} ${nx.toFixed(1)} ${y.toFixed(1)}`;
        }
        voor.streek(draad, '#1d3326', 1.4 * s, 0.9);
        let k = start;
        for (let x = 7 * s; x < L; x += 30 * s) {
          const t = (x % vak) / vak;
          const ly = y + boog * 4 * t * (1 - t) * 0.75 + 5 * s;
          const kl = lampkleuren[k++ % lampkleuren.length];
          voor.gloed(x, ly, 4.6 * s, kl, 1.05);
          voor.vlak(`M${(x - 2.4 * s).toFixed(1)} ${(ly - 3.2 * s).toFixed(1)} q${(2.4 * s).toFixed(1)} ${(7.4 * s).toFixed(1)} ${(4.8 * s).toFixed(1)} 0 Z`, meng(kl, '#ffffff', 0.5), 0.9);
        }
      };

      // ------------------------------------------------------------- BOVEN
      if (b.kant === 'boven') {
        for (let i = 0; i < 5; i++) ver.waas(L * (0.1 + i * 0.2), d * 0.3, d * 1.1, '#2f5f8a', 0.3);
        ver.vlak(ver.kam(d * 0.3, d * 0.18, 60, 0.9), '#122c2a');
        ver.spikkels(n(26), ['#eaf6ff'], { y1: d * 0.5, groot: 1.3, halo: 0.2 });
        // Takken die van boven naar beneden het bord in hangen.
        for (const [t, lang, hk] of [[0.05, 0.6, 1.3], [0.17, 0.46, 1.8], [0.28, 0.66, 1.4], [0.4, 0.5, 1.9], [0.56, 0.62, 1.3], [0.68, 0.44, 1.85], [0.8, 0.64, 1.45], [0.93, 0.5, 1.75]]) {
          dennetak(mid, L * t, -4, d * lang, hk, 1.8 * s);
        }
        snoer(d * 0.46, 130 * s * 1.6, 0);
        // De ster in het midden, boven het snoer: het enige grote licht.
        const st = voor.rechtop(L * 0.5, d * 0.3);
        const su = (v) => (v * s * 2.4).toFixed(1);
        st.waas(0, 0, 40 * s * 2.4, '#ffd98a', 0.5);
        let ster = '';
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
          const r = (k % 2 ? 7 : 19) * s * 2.4;
          ster += `${k ? 'L' : 'M'}${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}`;
        }
        st.vlak(`${ster} Z`, '#ffe9a8');
        st.vlak(`${ster} Z`, '#fff8dc', 0.55);
        st.gloed(0, 0, 9 * s * 2.4, '#ffd98a', 1.4);
        // Kerstballen aan de takken, met de hand aan verschillende lengtes.
        for (const [t, lang, m, k] of [[0.12, 0.56, 1.5, 0], [0.33, 0.7, 1.9, 2], [0.46, 0.5, 1.2, 3], [0.62, 0.72, 1.7, 1], [0.86, 0.58, 1.4, 4]]) {
          voor.streek(`M${(L * t).toFixed(1)} ${(d * 0.3).toFixed(1)} V${(d * lang).toFixed(1)}`, '#8d7a4c', 0.9 * s, 0.8);
          bal(voor.rechtop(L * t, d * lang + 6 * s * m), s * m, lampkleuren[k]);
        }
        // Sneeuw als richel op de binnenrand.
        for (let x = 0; x < L; x += 48 * s) {
          voor.vlak(voor.klont(x, d + 3, R(60, 36) * s, R(d * 0.16, 7 * s), 5), '#dce9f2', 0.92);
        }
      }

      // ------------------------------------------------------------- ONDER
      // De sneeuw. De grond ligt bij y=0, vlak voor je voeten.
      if (b.kant === 'onder') {
        ver.waas(L * 0.5, d * 0.8, d * 1.2, '#2f5f8a', 0.34);
        // De verre bosrand met besneeuwde dennen, tegen het bord aan.
        ver.vlak(ver.kam(d * 0.74, d * 0.22, 46, 0.95), '#122c2a');
        for (let x = 0; x < L; x += 40 * s) {
          ver.vlak(`M${x.toFixed(1)} ${(d * 0.62).toFixed(1)} l${(14 * s).toFixed(1)} ${(-d * 0.3).toFixed(1)} l${(14 * s).toFixed(1)} ${(d * 0.3).toFixed(1)} Z`, '#14382c', 0.9);
          ver.vlak(`M${(x + 7 * s).toFixed(1)} ${(d * 0.48).toFixed(1)} l${(7 * s).toFixed(1)} ${(-d * 0.16).toFixed(1)} l${(7 * s).toFixed(1)} ${(d * 0.16).toFixed(1)} Z`, '#dce9f2', 0.3);
        }
        // Het sneeuwveld, van je voeten af naar de bosrand.
        mid.vlak(`M0 -4 H${L.toFixed(1)} V${(d * 0.56).toFixed(1)} Q${(L * 0.6).toFixed(1)} ${(d * 0.5).toFixed(1)} 0 ${(d * 0.58).toFixed(1)} Z`, '#c9dbe8');
        mid.vlak(`M0 -4 H${L.toFixed(1)} V${(d * 0.3).toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(d * 0.24).toFixed(1)} 0 ${(d * 0.32).toFixed(1)} Z`, '#e4eff6');
        // Voetstappen die van links naar rechts weglopen en kleiner worden.
        for (let k = 0; k < 9; k++) {
          const t = 0.08 + k * 0.1;
          const y = d * (0.1 + k * 0.045);
          const m = (1 - k * 0.07) * s;
          mid.ovaal(L * t, y, 6 * m, 4 * m, '#9db6c8', 0.75);
          mid.ovaal(L * t + 9 * m, y + 5 * m, 5.4 * m, 3.6 * m, '#9db6c8', 0.7);
        }
        snoer(d * 0.66, 130 * s * 1.6, 2);
        // De lantaarn in de berm: het warme punt van deze kant.
        const lx = L * 0.2;
        voor.streek(`M${lx.toFixed(1)} ${(d * 0.08).toFixed(1)} V${(d * 0.36).toFixed(1)}`, '#2a3a44', 3.4 * s);
        const lan = voor.rechtop(lx, d * 0.36);
        const lu = (v) => (v * s * 2.1).toFixed(1);
        lan.gloed(0, 0, 13 * s * 2.1, '#ffd98a', 1.35);
        lan.vlak(`M${lu(-7)} ${lu(-8)} L${lu(7)} ${lu(-8)} L${lu(5)} ${lu(8)} L${lu(-5)} ${lu(8)} Z`, '#ffe6b4', 0.72);
        lan.streek(`M${lu(-7.6)} ${lu(-8)} h${lu(15.2)}`, '#2a3a44', 2.6 * s * 2.1);
        lan.streek(`M${lu(-5.6)} ${lu(8)} h${lu(11.2)}`, '#2a3a44', 2.2 * s * 2.1);
        lan.vlak(`M${lu(-8)} ${lu(-9)} l${lu(8)} ${lu(-6)} l${lu(8)} ${lu(6)} Z`, '#2a3a44');
        lan.vlak(`M${lu(-7)} ${lu(-11)} q${lu(7)} ${lu(-4)} ${lu(14)} 0 q${lu(-7)} ${lu(3)} ${lu(-14)} 0 Z`, '#e4eff6', 0.9);
        voor.ovaal(lx, d * 0.08, 30 * s, 9 * s, '#ffd98a', 0.18);
        // Een stapel pakjes, rechts van het midden.
        const pak = (x, y, br, h, kl, lint) => {
          const o = voor.rechtop(x, y);
          const u = (v) => (v * s).toFixed(1);
          o.vlak(`M${u(-br / 2)} 0 h${u(br)} v${u(-h)} h${u(-br)} Z`, kl);
          o.vlak(`M${u(-br / 2)} ${u(-h)} l${u(br * 0.18)} ${u(-6)} h${u(br)} l${u(-br * 0.18)} ${u(6)} Z`, meng(kl, '#ffffff', 0.2));
          o.streek(`M0 0 V${u(-h - 6)}`, lint, 3 * s, 0.95);
          o.streek(`M${u(-br / 2)} ${u(-h * 0.5)} h${u(br)}`, lint, 3 * s, 0.95);
          o.streek(`M0 ${u(-h - 6)} q${u(-7)} ${u(-7)} ${u(-2)} ${u(-9)}`, lint, 2.4 * s, 0.95);
          o.streek(`M0 ${u(-h - 6)} q${u(7)} ${u(-7)} ${u(2)} ${u(-9)}`, lint, 2.4 * s, 0.95);
        };
        pak(L * 0.62, d * 0.2, 40, 30, '#8a2334', '#e8c879');
        pak(L * 0.68, d * 0.1, 28, 22, '#1f4d33', '#e4eff6');
        pak(L * 0.56, d * 0.08, 22, 18, '#27405e', '#ff8ad4');
        // Kegels en een takje in de sneeuw.
        for (const [t, v, m] of [[0.38, 0.14, 1.6], [0.44, 0.3, 1.1], [0.86, 0.18, 1.4]]) {
          const o = voor.rechtop(L * t, d * v);
          const u = (x) => (x * s * m).toFixed(1);
          o.vlak(`M0 0 q${u(-5)} ${u(-6)} ${u(-3)} ${u(-15)} q${u(3)} ${u(-4)} ${u(6)} 0 q${u(2)} ${u(9)} ${u(-3)} ${u(15)} Z`, '#6b4a24');
          for (let k = 0; k < 4; k++) o.streek(`M${u(-3.4)} ${u(-3 - k * 3.4)} h${u(6.8)}`, '#4a3418', 1.2 * s * m, 0.8);
        }
        // Het roodborstje op de sneeuw, links van het midden.
        const rb = voor.rechtop(L * 0.42, d * 0.42);
        const ru = (v) => (v * s * 1.7).toFixed(1);
        rb.ovaal(0, -9 * s * 1.7, 9 * s * 1.7, 8 * s * 1.7, '#6b5a3c');
        rb.vlak(`M${ru(7)} ${ru(-11)} L${ru(19)} ${ru(-16)} L${ru(9)} ${ru(-6)} Z`, '#5a4a30');
        rb.ovaal(-6 * s * 1.7, -16 * s * 1.7, 5.4 * s * 1.7, 5 * s * 1.7, '#6b5a3c');
        rb.vlak(`M${ru(-4)} ${ru(-8)} q${ru(5)} ${ru(-6)} ${ru(7)} ${ru(-5)} q${ru(-2)} ${ru(7)} ${ru(-7)} ${ru(7)} Z`, '#d8502a');
        rb.ovaal(-7 * s * 1.7, -14 * s * 1.7, 4.4 * s * 1.7, 4 * s * 1.7, '#d8502a');
        rb.vlak(`M${ru(-11)} ${ru(-16)} L${ru(-17)} ${ru(-15)} L${ru(-11)} ${ru(-13)} Z`, '#1a1510');
        rb.gloed(-8 * s * 1.7, -17 * s * 1.7, 1.4 * s * 1.7, '#ffd98a', 0.85);
        rb.streek(`M${ru(-2)} ${ru(-1)} v${ru(1.6)}`, '#c9a24c', 1.4 * s * 1.7);
        rb.streek(`M${ru(2)} ${ru(-1)} v${ru(1.6)}`, '#c9a24c', 1.4 * s * 1.7);
      }

      // ------------------------------------------------------------- LINKS
      // De zijkant van een kerstboom, over de hele hoogte.
      if (b.kant === 'links') {
        ver.waas(L * 0.5, d * 0.4, d * 1.3, '#2f5f8a', 0.3);
        ver.spikkels(n(30), ['#eaf6ff'], { y1: d * 0.4, groot: 1.3, halo: 0.2 });
        // De stam loopt langs de buitenrand, de takken groeien naar binnen.
        mid.vlak(`M0 ${(d * 0.1).toFixed(1)} H${L.toFixed(1)} V${(d * 0.2).toFixed(1)} H0 Z`, '#3a2817');
        for (let k = 0; k < 11; k++) {
          const x = L * (0.03 + k * 0.095);
          const lang = d * (0.5 + (k % 3) * 0.16);
          dennetak(mid, x, d * 0.18, lang, 0.1 + (k % 2) * 0.12, 2.2 * s);
          dennetak(mid, x + L * 0.04, d * 0.18, lang * 0.7, -0.14, 1.6 * s);
        }
        snoer(d * 0.52, 120 * s * 1.6, 1);
        // Ballen en kaarsjes tussen de takken, met de hand neergezet.
        for (const [t, v, m, k] of [[0.08, 0.72, 1.9, 0], [0.22, 0.56, 1.4, 2], [0.34, 0.78, 1.7, 3], [0.5, 0.6, 1.2, 1], [0.62, 0.8, 2, 4], [0.78, 0.62, 1.5, 0], [0.92, 0.76, 1.8, 2]]) {
          voor.streek(`M${(L * t).toFixed(1)} ${(d * (v - 0.14)).toFixed(1)} V${(d * v - 10 * s * m).toFixed(1)}`, '#8d7a4c', 0.9 * s, 0.8);
          bal(voor.rechtop(L * t, d * v), s * m, lampkleuren[k]);
        }
        for (const [t, v, m] of [[0.15, 0.86, 1.8], [0.44, 0.9, 1.4], [0.7, 0.88, 1.6], [0.86, 0.92, 1.3]]) {
          kaarsje(voor.rechtop(L * t, d * v), s * m);
        }
        // Slingers van popcorn: een kralenlijn die tussen de takken doorzakt.
        for (const [x0, x1, y] of [[0.05, 0.4, 0.68], [0.45, 0.85, 0.72]]) {
          for (let k = 0; k <= 16; k++) {
            const t = k / 16;
            const x = L * (x0 + (x1 - x0) * t);
            const yy = d * y + Math.sin(Math.PI * t) * d * 0.1;
            voor.stip(x, yy, 2.2 * s, '#f2e8d0', 0.9);
          }
        }
      }

      // ------------------------------------------------------------ RECHTS
      // Een raam van buiten gezien. De grond ligt bij x=L.
      if (b.kant === 'rechts') {
        ver.waas(L * 0.5, d * 0.5, d * 1.3, '#2f5f8a', 0.3);
        // De gevel: planken met sneeuw in de naden.
        ver.vlak(`M0 -4 H${L.toFixed(1)} V${(d + 4).toFixed(1)} H0 Z`, '#1a2c28');
        for (let x = 0; x < L; x += 26 * s) {
          ver.streek(`M${x.toFixed(1)} -4 V${(d + 4).toFixed(1)}`, '#0e1c18', 2 * s, 0.7);
          ver.streek(`M${(x + 1.6 * s).toFixed(1)} -4 V${(d + 4).toFixed(1)}`, '#dce9f2', 0.8 * s, 0.14);
        }
        // Het raam. Het besloeg eerst bijna de hele kant en was van binnen
        // één egale crèmekleurige vlakte: een leeg paneel, geen raam. Nu is
        // het kleiner, zit het in een donkere omlijsting, en zie je er zes
        // ruiten in met een boom erachter. Wat eromheen overblijft is gevel,
        // en dat hoort donker te zijn - anders gloeit het raam nergens in.
        const x0 = L * 0.3;
        const x1 = L * 0.74;
        const y0 = d * 0.3;
        const y1 = d * 0.78;
        const mx = (x0 + x1) / 2;
        const my = (y0 + y1) / 2;
        mid.waas(mx, my, (x1 - x0) * 0.9, '#ffd98a', 0.55);
        // De dagkant: een donkere nis waar het raam in ligt.
        mid.vlak(`M${(x0 - 7 * s).toFixed(1)} ${(y0 - 7 * s).toFixed(1)} H${(x1 + 7 * s).toFixed(1)} V${(y1 + 7 * s).toFixed(1)} H${(x0 - 7 * s).toFixed(1)} Z`, '#102420');
        mid.vlak(`M${x0.toFixed(1)} ${y0.toFixed(1)} H${x1.toFixed(1)} V${y1.toFixed(1)} H${x0.toFixed(1)} Z`, '#f0b85e', 0.9);
        mid.vlak(`M${x0.toFixed(1)} ${y0.toFixed(1)} H${x1.toFixed(1)} V${my.toFixed(1)} H${x0.toFixed(1)} Z`, '#ffd98a', 0.45);
        // Een kerstboom binnen, als silhouet tegen het licht, met lampjes.
        const bx = x0 + (x1 - x0) * 0.34;
        const bv = y1 - 3 * s;
        mid.vlak(`M${bx.toFixed(1)} ${bv.toFixed(1)} l${(-d * 0.1).toFixed(1)} 0 L${bx.toFixed(1)} ${(y0 + d * 0.05).toFixed(1)} L${(bx + d * 0.1).toFixed(1)} ${bv.toFixed(1)} Z`, '#1d3326', 0.8);
        for (let k = 0; k < 5; k++) {
          mid.gloed(bx + (k % 2 ? 1 : -1) * d * 0.035, y0 + d * 0.11 + k * d * 0.085, 2.4 * s, lampkleuren[k], 0.95);
        }
        // Iemand binnen, bij het raam: een silhouet dat het raam bewoond maakt.
        const ph = (y1 - y0) * 0.42;
        mid.vlak(`M${(x1 - 13 * s).toFixed(1)} ${y1.toFixed(1)} v${(-ph).toFixed(1)} q${(7 * s).toFixed(1)} ${(-6 * s).toFixed(1)} ${(14 * s).toFixed(1)} 0 V${y1.toFixed(1)} Z`, '#15281f', 0.85);
        mid.ovaal(x1 - 6 * s, y1 - ph - 6 * s, 6.4 * s, 6.8 * s, '#15281f', 0.85);
        // De roeden: twee staanders en een dwarsroede, in geschilderd hout.
        for (const t of [0.34, 0.67]) {
          mid.streek(`M${(x0 + (x1 - x0) * t).toFixed(1)} ${y0.toFixed(1)} V${y1.toFixed(1)}`, '#2a4436', 3.4 * s, 0.95);
        }
        mid.streek(`M${x0.toFixed(1)} ${my.toFixed(1)} H${x1.toFixed(1)}`, '#2a4436', 3.4 * s, 0.95);
        mid.streek(`M${x0.toFixed(1)} ${y0.toFixed(1)} H${x1.toFixed(1)} V${y1.toFixed(1)} H${x0.toFixed(1)} Z`, '#1d3326', 6 * s, 1);
        mid.streek(`M${(x0 + 3 * s).toFixed(1)} ${(y0 + 3 * s).toFixed(1)} H${(x1 - 3 * s).toFixed(1)}`, '#6b8c74', 1.2 * s, 0.5);
        // Sneeuw die in de hoeken van de ruiten blijft liggen.
        for (const [tx, ty] of [[0.34, 0], [0.67, 0], [0.34, 1], [0.67, 1]]) {
          mid.vlak(`M${(x0 + (x1 - x0) * tx - 9 * s).toFixed(1)} ${(ty ? my : y0).toFixed(1)} q${(9 * s).toFixed(1)} ${(7 * s).toFixed(1)} ${(18 * s).toFixed(1)} 0 Z`, '#e4eff6', 0.7);
        }
        // De vensterbank, aan de onderkant van de pagina: dat is x=L.
        mid.vlak(`M${(x1 + 2 * s).toFixed(1)} ${(y0 - 8 * s).toFixed(1)} h${(10 * s).toFixed(1)} V${(y1 + 8 * s).toFixed(1)} h${(-10 * s).toFixed(1)} Z`, '#e4eff6');
        for (let y = y0 - 6 * s; y < y1 + 8 * s; y += 24 * s) {
          voor.vlak(voor.klont(x1 + 13 * s, y, R(d * 0.16, d * 0.08), R(10 * s, 4 * s), 4), '#f2f8fc', 0.9);
        }
        // De krans, op de linkerhelft van het raam.
        const kr = voor.rechtop(L * 0.5, d * 0.46);
        const r = d * 0.2;
        for (let k = 0; k < 22; k++) {
          const a = (k / 22) * Math.PI * 2;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          kr.loof(px, py, R(16, 10) * s, R(7, 4) * s, (a * 180) / Math.PI + R(40, -40), K(['#1f4d33', '#2f6b45', '#174028']), 1);
        }
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2 + 0.4;
          kr.stip(Math.cos(a) * r, Math.sin(a) * r, 3 * s, '#c8302a');
        }
        kr.vlak(`M${(-6 * s).toFixed(1)} ${(r + 2 * s).toFixed(1)} q${(6 * s).toFixed(1)} ${(-9 * s).toFixed(1)} ${(12 * s).toFixed(1)} 0 q${(-6 * s).toFixed(1)} ${(9 * s).toFixed(1)} ${(-12 * s).toFixed(1)} 0 Z`, '#c8302a');
        kr.gloed(0, 0, 4 * s, '#ffd98a', 0.7, 0);
        // IJspegels aan de bovenkant van de pagina: dat is x=0.
        for (let k = 0; k < 9; k++) {
          const y = d * (0.1 + k * 0.1);
          const lang = R(26, 10) * s;
          voor.vlak(`M${(L * 0.02).toFixed(1)} ${(y - 4 * s).toFixed(1)} L${(L * 0.02 + lang).toFixed(1)} ${y.toFixed(1)} L${(L * 0.02).toFixed(1)} ${(y + 4 * s).toFixed(1)} Z`, '#dce9f2', 0.8);
          voor.gloed(L * 0.02 + lang, y, 2 * s, '#eaf6ff', 0.6, 0);
        }
        snoer(d * 0.9, 120 * s * 1.6, 3);
      }

      b.spikkels(n(17), ['#ffffff', '#dceeff'], { y0: 0, y1: d * 1.05, groot: 2.2, halo: 0.34 });
    },
  },

  // Noir: een natte straat na middernacht. Vier kanten, vier plekken in
  // hetzelfde blok. De vorige versie strooide op elke kant dezelfde reeks
  // neonbuizen en lantaarnpalen, en dan is het een patroon.
  //
  //   BOVEN   de gevels aan de overkant, met één groot neonbord dat over
  //           de straat hangt en een brandtrap als silhouet.
  //   ONDER   het natte asfalt vlak voor je: een plas waarin het neon
  //           staat, een put met stoom, een krant, en een kat.
  //   LINKS   een lantaarnpaal over de hele hoogte, met een kegel licht,
  //           een bakstenen muur met een affiche en een vuilnisbak.
  //   RECHTS  een etalage over de hele hoogte, met een jaloezie en iemand
  //           met een hoed die erachter staat.
  noir: {
    kern: '#111722', koel: '#05070c', warm: '#9ec4ea', textuur: 'korrel', ruw: 0.2, stap: 56,
    gloed: '#ff4fa3',
    verf(b) {
      const { d, L, R, K, n } = b;
      const s = d / 100;
      const ver = b.laag('randver', 0.65);
      const mid = b.laag('randmid');
      const voor = b.laag('randvoor');

      // Een gevel met ramen die aan of uit staan.
      const gevel = (laag, x, br, h, grond) => {
        laag.vlak(`M${x.toFixed(1)} ${grond.toFixed(1)} v${(-h).toFixed(1)} h${br.toFixed(1)} v${h.toFixed(1)} Z`, '#1f2c40');
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 3; c++) {
            if (R() < 0.42) continue;
            laag.vlak(`M${(x + br * 0.12 + c * (br * 0.3)).toFixed(1)} ${(grond - h + h * 0.1 + r * (h * 0.22)).toFixed(1)} h${(br * 0.17).toFixed(1)} v${(h * 0.13).toFixed(1)} h${(-br * 0.17).toFixed(1)} Z`, '#ffd98a', R(0.7, 0.22));
          }
        }
      };
      const regen = (laag, hoeveel) => {
        for (let i = 0; i < hoeveel; i++) {
          const x = R(L, 0);
          const y = R(d, 0);
          laag.streek(`M${x.toFixed(1)} ${y.toFixed(1)} l${(R(6, 3) * s).toFixed(1)} ${(R(19, 11) * s).toFixed(1)}`, '#cfe4f8', 0.7, R(0.32, 0.08));
        }
      };
      // Een neonbuis met een halo: de vorm is een pad, geen letter.
      const neon = (laag, pad, kl, dik = 3.4) => {
        const id = zorgVoorGloed(kl);
        laag.g.append(el('path', { d: pad, stroke: `url(#${id})`, 'stroke-width': (dik * 8).toFixed(1), fill: 'none', opacity: 0.3 }));
        laag.streek(pad, kl, dik * s, 0.95);
        laag.streek(pad, meng(kl, '#ffffff', 0.72), dik * 0.4 * s);
      };

      // ------------------------------------------------------------- BOVEN
      if (b.kant === 'boven') {
        for (let i = 0; i < 6; i++) ver.waas(L * (0.08 + i * 0.18), d * 0.5, d * 1.2, i % 2 ? '#2a4a7a' : '#6a2a5a', 0.36);
        // De gevels aan de overkant, op ongelijke afstand.
        let x = -14;
        while (x < L + 14) {
          const br = R(66, 38) * s;
          gevel(ver, x, br, R(d * 0.68, d * 0.34), d * 0.78);
          x += br + R(10, 2) * s;
        }
        ver.vlak(ver.kam(d * 0.8, d * 0.1, 90), '#18212f');
        // De brandtrap: een silhouet van bordessen en een schuine ladder.
        const fx = L * 0.12;
        for (let k = 0; k < 3; k++) {
          const y = d * (0.3 + k * 0.2);
          mid.streek(`M${fx.toFixed(1)} ${y.toFixed(1)} h${(d * 0.42).toFixed(1)}`, '#151d2a', 3.4 * s, 0.95);
          for (let j = 0; j < 7; j++) {
            mid.streek(`M${(fx + j * d * 0.06).toFixed(1)} ${y.toFixed(1)} v${(-d * 0.1).toFixed(1)}`, '#151d2a', 1.2 * s, 0.85);
          }
          mid.streek(`M${(fx + d * 0.36).toFixed(1)} ${y.toFixed(1)} L${(fx + d * 0.1).toFixed(1)} ${(y + d * 0.2).toFixed(1)}`, '#151d2a', 2.4 * s, 0.9);
        }
        // Het neonbord: één groot ding dat over de straat hangt, met een
        // pijl eronder en een hoek die het niet meer doet.
        // Groter en lager dan eerst: op een bord van twaalf bij twaalf is de
        // band smal, en dan was dit bord een postzegel hoog in de hoek.
        const bx = L * 0.58;
        const by = d * 0.58;
        const bw = d * 1.15;
        const bh = d * 0.52;
        mid.streek(`M${(bx - bw * 0.3).toFixed(1)} -4 L${(bx - bw * 0.3).toFixed(1)} ${(by - bh / 2).toFixed(1)}`, '#3a4a60', 2.6 * s);
        mid.streek(`M${(bx + bw * 0.3).toFixed(1)} -4 L${(bx + bw * 0.3).toFixed(1)} ${(by - bh / 2).toFixed(1)}`, '#3a4a60', 2.6 * s);
        voor.vlak(`M${(bx - bw / 2).toFixed(1)} ${(by - bh / 2).toFixed(1)} h${bw.toFixed(1)} v${bh.toFixed(1)} h${(-bw).toFixed(1)} Z`, '#141b26');
        neon(voor, `M${(bx - bw / 2 + 5 * s).toFixed(1)} ${(by - bh / 2 + 5 * s).toFixed(1)} h${(bw - 10 * s).toFixed(1)} v${(bh - 10 * s).toFixed(1)} h${(-bw + 10 * s).toFixed(1)} Z`, '#ff4fa3', 3);
        // Drie strepen binnen het bord, als tekst zonder letters.
        for (let k = 0; k < 3; k++) {
          const w = bw * (0.5 - k * 0.1);
          neon(voor, `M${(bx - w / 2).toFixed(1)} ${(by - bh * 0.18 + k * bh * 0.2).toFixed(1)} h${w.toFixed(1)}`, k === 1 ? '#4fe8ff' : '#ff4fa3', 2.2);
        }
        // De pijl eronder, met één dode punt.
        neon(voor, `M${(bx - bw * 0.2).toFixed(1)} ${(by + bh * 0.62).toFixed(1)} h${(bw * 0.4).toFixed(1)} l${(-bw * 0.1).toFixed(1)} ${(bh * 0.2).toFixed(1)} h${(-bw * 0.2).toFixed(1)} Z`, '#4fe8ff', 2.4);
        voor.streek(`M${(bx + bw * 0.2).toFixed(1)} ${(by + bh * 0.62).toFixed(1)} l${(-bw * 0.1).toFixed(1)} ${(bh * 0.2).toFixed(1)}`, '#1b3a44', 2.4 * s, 0.9);
        voor.gloed(bx + bw * 0.2, by + bh * 0.62, 4.4 * s, '#9ef0ff', 1);
        // Een raam waar iemand achter staat, links onder het bord.
        voor.vlak(`M${(L * 0.33).toFixed(1)} ${(d * 0.56).toFixed(1)} h${(d * 0.26).toFixed(1)} v${(d * 0.34).toFixed(1)} h${(-d * 0.26).toFixed(1)} Z`, '#ffd98a', 0.5);
        voor.waas(L * 0.33 + d * 0.13, d * 0.73, d * 0.4, '#ffd98a', 0.4);
        voor.vlak(`M${(L * 0.33 + d * 0.09).toFixed(1)} ${(d * 0.9).toFixed(1)} v${(-d * 0.16).toFixed(1)} q${(d * 0.04).toFixed(1)} ${(-d * 0.06).toFixed(1)} ${(d * 0.08).toFixed(1)} 0 V${(d * 0.9).toFixed(1)} Z`, '#151d2a', 0.9);
        voor.ovaal(L * 0.33 + d * 0.13, d * 0.73, d * 0.03, d * 0.03, '#151d2a', 0.9);
        voor.streek(`M${(L * 0.33).toFixed(1)} ${(d * 0.56).toFixed(1)} h${(d * 0.26).toFixed(1)} v${(d * 0.34).toFixed(1)} h${(-d * 0.26).toFixed(1)} Z`, '#3a4a60', 2.6 * s, 0.95);
        regen(voor, n(9));
      }

      // ------------------------------------------------------------- ONDER
      // Het natte asfalt. De stoep ligt bij y=0, vlak voor je.
      if (b.kant === 'onder') {
        for (let i = 0; i < 5; i++) ver.waas(L * (0.1 + i * 0.2), d * 0.8, d * 1.1, i % 2 ? '#2a4a7a' : '#6a2a5a', 0.34);
        // De overkant van de straat, tegen het bord aan.
        ver.vlak(`M0 ${(d + 4).toFixed(1)} H${L.toFixed(1)} V${(d * 0.74).toFixed(1)} H0 Z`, '#18212f');
        for (let x = 0; x < L; x += 46 * s) {
          if (R() < 0.4) continue;
          ver.vlak(`M${x.toFixed(1)} ${(d * 0.82).toFixed(1)} h${(14 * s).toFixed(1)} v${(12 * s).toFixed(1)} h${(-14 * s).toFixed(1)} Z`, '#ffd98a', R(0.5, 0.15));
        }
        // Het asfalt, en de stoeprand vlak voor je.
        mid.vlak(`M0 -4 H${L.toFixed(1)} V${(d * 0.74).toFixed(1)} H0 Z`, '#151d2a');
        mid.vlak(`M0 -4 H${L.toFixed(1)} V${(d * 0.12).toFixed(1)} H0 Z`, '#171d28');
        mid.streek(`M0 ${(d * 0.12).toFixed(1)} H${L.toFixed(1)}`, '#2a3340', 3 * s, 0.9);
        mid.streek(`M0 ${(d * 0.14).toFixed(1)} H${L.toFixed(1)}`, '#9ec4ea', 1 * s, 0.22);
        // De middenstreep van de straat, onderbroken.
        for (let x = 10 * s; x < L; x += 60 * s) {
          mid.streek(`M${x.toFixed(1)} ${(d * 0.46).toFixed(1)} h${(30 * s).toFixed(1)}`, '#c9c2a0', 2.6 * s, 0.4);
        }
        // De plas, groot en links van het midden, met het neon erin.
        const pl = `M${(L * 0.3).toFixed(1)} ${(d * 0.22).toFixed(1)} Q${(L * 0.42).toFixed(1)} ${(d * 0.14).toFixed(1)} ${(L * 0.56).toFixed(1)} ${(d * 0.24).toFixed(1)} Q${(L * 0.62).toFixed(1)} ${(d * 0.4).toFixed(1)} ${(L * 0.46).toFixed(1)} ${(d * 0.46).toFixed(1)} Q${(L * 0.3).toFixed(1)} ${(d * 0.44).toFixed(1)} ${(L * 0.3).toFixed(1)} ${(d * 0.22).toFixed(1)} Z`;
        mid.vlak(pl, '#121c28');
        mid.streek(pl, '#6a8fb0', 1.2 * s, 0.35);
        for (const [t, kl, br] of [[0.36, '#ff4fa3', 14], [0.44, '#4fe8ff', 10], [0.52, '#ffd98a', 12]]) {
          mid.ovaal(L * t, d * 0.33, br * s, 30 * s, kl, 0.22);
          mid.ovaal(L * t, d * 0.33, br * 0.4 * s, 16 * s, meng(kl, '#ffffff', 0.4), 0.26);
        }
        // Natte vegen op het asfalt buiten de plas.
        for (let i = 0; i < n(42) + 1; i++) {
          const kl = R() < 0.5 ? '#ff4fa3' : '#4fe8ff';
          mid.ovaal(R(L, 0), R(d * 0.7, d * 0.2), R(20, 8) * s, R(3, 1.2) * s, kl, R(0.28, 0.08));
        }
        // De put met stoom, rechts.
        const px = L * 0.74;
        const py = d * 0.3;
        voor.ovaal(px, py, 20 * s, 8 * s, '#3a4a60');
        voor.ovaal(px, py, 16 * s, 6 * s, '#262f3c');
        for (let k = -2; k <= 2; k++) voor.streek(`M${(px + k * 5 * s).toFixed(1)} ${(py - 4 * s).toFixed(1)} v${(8 * s).toFixed(1)}`, '#131922', 1.4 * s, 0.8);
        for (let k = 0; k < 5; k++) {
          voor.waas(px + R(16, -16) * s, py + 10 * s + k * 16 * s, (18 + k * 8) * s, '#cfe4f8', 0.2);
        }
        // Een krant op de stoep, en een peuk.
        const kr = voor.rechtop(L * 0.58, d * 0.08);
        const ku = (v) => (v * s * 1.8).toFixed(1);
        kr.vlak(`M${ku(-14)} 0 l${ku(2)} ${ku(-9)} h${ku(24)} l${ku(2)} ${ku(9)} Z`, '#c9c2a0', 0.9);
        for (let k = 0; k < 4; k++) kr.streek(`M${ku(-9)} ${ku(-7 + k * 2)} h${ku(18)}`, '#5a5a4a', 0.8 * s * 1.8, 0.7);
        kr.streek(`M${ku(-11)} ${ku(-4)} h${ku(22)}`, '#2a2a22', 1.6 * s * 1.8, 0.8);
        voor.streek(`M${(L * 0.88).toFixed(1)} ${(d * 0.08).toFixed(1)} l${(7 * s).toFixed(1)} ${(2 * s).toFixed(1)}`, '#e8e0cc', 2 * s, 0.9);
        voor.gloed(L * 0.88 + 8 * s, d * 0.08 + 2.4 * s, 2 * s, '#ff6b2a', 1);
        // De kat op de stoeprand, met ogen die het neon terugkaatsen.
        const kat = voor.rechtop(L * 0.2, d * 0.14);
        const cu = (v) => (v * s * 1.8).toFixed(1);
        kat.vlak(`M${cu(-16)} 0 q${cu(1)} ${cu(-15)} ${cu(11)} ${cu(-16)} q${cu(2)} ${cu(-9)} ${cu(5)} ${cu(-2)} q${cu(4)} ${cu(-1)} ${cu(6)} ${cu(2)} q${cu(9)} ${cu(3)} ${cu(8)} ${cu(16)} Z`, '#090d14');
        kat.streek(`M${cu(14)} ${cu(-2)} q${cu(11)} ${cu(2)} ${cu(9)} ${cu(-13)}`, '#090d14', 3.4 * s * 1.8);
        kat.gloed(-3.4 * s * 1.8, -15 * s * 1.8, 2 * s * 1.8, '#9ef0ff', 0.95);
        kat.gloed(2.6 * s * 1.8, -15 * s * 1.8, 2 * s * 1.8, '#9ef0ff', 0.95);
        kat.ovaal(0, 3 * s * 1.8, 17 * s * 1.8, 3 * s * 1.8, '#4fe8ff', 0.16);
        regen(voor, n(11));
      }

      // ------------------------------------------------------------- LINKS
      // Een lantaarnpaal over de hele hoogte. De stoep ligt bij x=0.
      if (b.kant === 'links') {
        for (let i = 0; i < 5; i++) ver.waas(L * (0.1 + i * 0.2), d * 0.5, d * 1.2, i % 2 ? '#2a4a7a' : '#6a2a5a', 0.34);
        // De bakstenen muur, met ongelijke lagen.
        ver.vlak(`M0 -4 H${L.toFixed(1)} V${(d * 0.86).toFixed(1)} H0 Z`, '#242d38');
        for (let y = 0; y < d * 0.86; y += 11 * s) {
          ver.streek(`M0 ${y.toFixed(1)} H${L.toFixed(1)}`, '#161c24', 1.2 * s, 0.6);
          for (let x = R(26, 6); x < L; x += R(38, 20)) {
            ver.streek(`M${x.toFixed(1)} ${y.toFixed(1)} v${(11 * s).toFixed(1)}`, '#161c24', 1 * s, 0.5);
          }
        }
        // Het affiche: een gescheurd papier met een silhouet erop.
        const ax = L * 0.56;
        const ay = d * 0.44;
        const aw = L * 0.2;
        const ah = d * 0.5;
        mid.vlak(`M${(ax - aw / 2).toFixed(1)} ${(ay - ah / 2).toFixed(1)} l${(aw * 0.5).toFixed(1)} ${(-4 * s).toFixed(1)} l${(aw * 0.5).toFixed(1)} ${(3 * s).toFixed(1)} l${(2 * s).toFixed(1)} ${ah.toFixed(1)} l${(-aw * 0.52).toFixed(1)} ${(4 * s).toFixed(1)} l${(-aw * 0.48).toFixed(1)} ${(-3 * s).toFixed(1)} Z`, '#c9c2a0', 0.82);
        mid.ovaal(ax, ay - ah * 0.1, aw * 0.18, ah * 0.14, '#3a3a30', 0.8);
        mid.vlak(`M${(ax - aw * 0.26).toFixed(1)} ${(ay + ah * 0.16).toFixed(1)} q${(aw * 0.26).toFixed(1)} ${(-ah * 0.22).toFixed(1)} ${(aw * 0.52).toFixed(1)} 0 Z`, '#3a3a30', 0.8);
        mid.vlak(`M${(ax - aw * 0.3).toFixed(1)} ${(ay - ah * 0.2).toFixed(1)} q${(aw * 0.3).toFixed(1)} ${(-ah * 0.1).toFixed(1)} ${(aw * 0.6).toFixed(1)} 0 l0 ${(-ah * 0.04).toFixed(1)} q${(-aw * 0.3).toFixed(1)} ${(-ah * 0.08).toFixed(1)} ${(-aw * 0.6).toFixed(1)} 0 Z`, '#2a2a22', 0.8);
        for (let k = 0; k < 3; k++) {
          mid.streek(`M${(ax - aw * 0.3).toFixed(1)} ${(ay + ah * 0.26 + k * ah * 0.08).toFixed(1)} h${(aw * (0.6 - k * 0.12)).toFixed(1)}`, '#3a3a30', 1.8 * s, 0.7);
        }
        // De paal: hij loopt over de hele hoogte, de kop bij x=L (boven).
        const py = d * 0.3;
        mid.streek(`M0 ${py.toFixed(1)} L${(L * 0.9).toFixed(1)} ${py.toFixed(1)}`, '#3a4a60', 5 * s);
        mid.streek(`M0 ${(py - 1.6 * s).toFixed(1)} L${(L * 0.9).toFixed(1)} ${(py - 1.6 * s).toFixed(1)}`, '#3a4858', 1.2 * s, 0.5);
        mid.streek(`M${(L * 0.9).toFixed(1)} ${py.toFixed(1)} q${(L * 0.06).toFixed(1)} 0 ${(L * 0.06).toFixed(1)} ${(14 * s).toFixed(1)}`, '#3a4a60', 4 * s);
        // De lamp, en de kegel licht die naar beneden valt: dus naar x=0.
        const lx = L * 0.96;
        const ly = py + 16 * s;
        voor.vlak(`M${lx.toFixed(1)} ${(ly - 10 * s).toFixed(1)} L${(L * 0.3).toFixed(1)} ${(ly + d * 0.6).toFixed(1)} L${(L * 0.3).toFixed(1)} ${(ly - d * 0.3).toFixed(1)} Z`, '#ffd98a', 0.1);
        voor.vlak(`M${(lx - 9 * s).toFixed(1)} ${ly.toFixed(1)} h${(18 * s).toFixed(1)} l${(-4 * s).toFixed(1)} ${(-11 * s).toFixed(1)} h${(-10 * s).toFixed(1)} Z`, '#3a4a60');
        voor.gloed(lx - 1 * s, ly + 2 * s, 9 * s, '#ffd98a', 1.4);
        // De vuilnisbak aan de voet van de pagina, bij x=0.
        const vb = voor.rechtop(L * 0.1, d * 0.84);
        const vu = (v) => (v * s * 2).toFixed(1);
        vb.vlak(`M${vu(-15)} 0 l${vu(2)} ${vu(-34)} h${vu(26)} l${vu(2)} ${vu(34)} Z`, '#232b36');
        for (let k = 0; k < 4; k++) vb.streek(`M${vu(-14)} ${vu(-6 - k * 8)} h${vu(28)}`, '#131922', 1.6 * s * 2, 0.8);
        vb.ovaal(0, -36 * s * 2, 16 * s * 2, 4 * s * 2, '#3a4552');
        vb.vlak(`M${vu(-6)} ${vu(-38)} q${vu(6)} ${vu(-6)} ${vu(12)} 0 Z`, '#c9c2a0', 0.8);
        vb.streek(`M${vu(4)} ${vu(-40)} l${vu(7)} ${vu(-9)}`, '#8a8470', 2 * s * 2, 0.8);
        // Een paar lege blikjes ernaast.
        for (const [t, v] of [[0.19, 0.9], [0.23, 0.82]]) {
          voor.ovaal(L * t, d * v, 5 * s, 3 * s, '#5a6672');
          voor.gloed(L * t, d * v, 1.6 * s, '#9ef0ff', 0.5, 0);
        }
        regen(voor, n(10));
      }

      // ------------------------------------------------------------ RECHTS
      // Een etalage over de hele hoogte. De stoep ligt bij x=L.
      if (b.kant === 'rechts') {
        for (let i = 0; i < 5; i++) ver.waas(L * (0.1 + i * 0.2), d * 0.5, d * 1.2, i % 2 ? '#6a2a5a' : '#2a4a7a', 0.34);
        ver.vlak(`M0 -4 H${L.toFixed(1)} V${(d + 4).toFixed(1)} H0 Z`, '#1b232e');
        // Het raam van de etalage, met warm licht erachter.
        const x0 = L * 0.12;
        const x1 = L * 0.78;
        const y0 = d * 0.2;
        const y1 = d * 0.78;
        mid.waas((x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) * 0.5, '#ffd98a', 0.4);
        mid.vlak(`M${x0.toFixed(1)} ${y0.toFixed(1)} H${x1.toFixed(1)} V${y1.toFixed(1)} H${x0.toFixed(1)} Z`, '#3a3024');
        mid.vlak(`M${x0.toFixed(1)} ${y0.toFixed(1)} H${x1.toFixed(1)} V${((y0 + y1) / 2).toFixed(1)} H${x0.toFixed(1)} Z`, '#d8a84c', 0.3);
        // De jaloezie: lamellen die halverwege ophouden.
        for (let x = x0; x < x0 + (x1 - x0) * 0.46; x += 7 * s) {
          mid.streek(`M${x.toFixed(1)} ${y0.toFixed(1)} V${y1.toFixed(1)}`, '#15110c', 2.6 * s, 0.85);
          mid.streek(`M${(x + 1.6 * s).toFixed(1)} ${y0.toFixed(1)} V${y1.toFixed(1)}`, '#4a3c24', 1 * s, 0.4);
        }
        mid.streek(`M${(x0 + (x1 - x0) * 0.46).toFixed(1)} ${y0.toFixed(1)} V${y1.toFixed(1)}`, '#0c0a06', 4 * s, 0.9);
        // Iemand met een hoed, achter het glas, als silhouet.
        const hx = x0 + (x1 - x0) * 0.72;
        const hy = (y0 + y1) / 2;
        mid.vlak(`M${hx.toFixed(1)} ${(hy - d * 0.2).toFixed(1)} q${(d * 0.12).toFixed(1)} ${(d * 0.04).toFixed(1)} ${(d * 0.13).toFixed(1)} ${(d * 0.2).toFixed(1)} q${(-d * 0.01).toFixed(1)} ${(d * 0.2).toFixed(1)} ${(-d * 0.13).toFixed(1)} ${(d * 0.2).toFixed(1)} Z`, '#151d2a', 0.92);
        mid.ovaal(hx + d * 0.03, hy, d * 0.055, d * 0.065, '#151d2a', 0.92);
        mid.vlak(`M${(hx - d * 0.02).toFixed(1)} ${(hy - d * 0.06).toFixed(1)} q${(d * 0.06).toFixed(1)} ${(-d * 0.03).toFixed(1)} ${(d * 0.12).toFixed(1)} 0 l${(d * 0.01).toFixed(1)} ${(-d * 0.01).toFixed(1)} q${(-d * 0.02).toFixed(1)} ${(-d * 0.06).toFixed(1)} ${(-d * 0.09).toFixed(1)} ${(-d * 0.02).toFixed(1)} Z`, '#151d2a', 0.95);
        // De sponning van het raam, en de gouden letterband zonder letters.
        mid.streek(`M${x0.toFixed(1)} ${y0.toFixed(1)} H${x1.toFixed(1)} V${y1.toFixed(1)} H${x0.toFixed(1)} Z`, '#3a4a60', 5 * s, 0.95);
        voor.vlak(`M${(x0 - 10 * s).toFixed(1)} ${(y0 + d * 0.06).toFixed(1)} h${(10 * s).toFixed(1)} v${((y1 - y0) * 0.56).toFixed(1)} h${(-10 * s).toFixed(1)} Z`, '#3a3024');
        for (let k = 0; k < 5; k++) {
          voor.gloed(x0 - 5 * s, y0 + d * 0.1 + k * (y1 - y0) * 0.11, 2.6 * s, '#e8c879', 0.8, 0);
        }
        // De deur, onder het raam richting de stoep.
        voor.vlak(`M${(x1 + 4 * s).toFixed(1)} ${(y0 + d * 0.1).toFixed(1)} h${(d * 0.16).toFixed(1)} v${((y1 - y0) * 0.44).toFixed(1)} h${(-d * 0.16).toFixed(1)} Z`, '#2a2118');
        voor.vlak(`M${(x1 + 7 * s).toFixed(1)} ${(y0 + d * 0.14).toFixed(1)} h${(d * 0.1).toFixed(1)} v${((y1 - y0) * 0.18).toFixed(1)} h${(-d * 0.1).toFixed(1)} Z`, '#ffd98a', 0.4);
        voor.gloed(x1 + 7 * s + d * 0.05, y0 + d * 0.14 + (y1 - y0) * 0.09, 6 * s, '#ffd98a', 0.9, 0);
        voor.stip(x1 + 6 * s, y0 + d * 0.1 + (y1 - y0) * 0.3, 2 * s, '#c9a24c');
        // De luifel boven, aan de bovenkant van de pagina: dat is x=0.
        voor.vlak(`M${(L * 0.04).toFixed(1)} ${(y0 - 4 * s).toFixed(1)} L${(L * 0.04).toFixed(1)} ${(y1 + 4 * s).toFixed(1)} L${(-L * 0.03).toFixed(1)} ${(y1 + d * 0.1).toFixed(1)} L${(-L * 0.03).toFixed(1)} ${(y0 - d * 0.1).toFixed(1)} Z`, '#3a1d22');
        for (let k = 0; k < 7; k++) {
          const t = k / 6;
          voor.streek(`M${(L * 0.04).toFixed(1)} ${(y0 - 4 * s + (y1 - y0 + 8 * s) * t).toFixed(1)} L${(-L * 0.03).toFixed(1)} ${(y0 - d * 0.1 + (y1 - y0 + d * 0.2) * t).toFixed(1)}`, k % 2 ? '#c9c2a0' : '#5a2a30', 3 * s, 0.6);
        }
        // Natte reflectie van de etalage op de stoep bij x=L.
        voor.vlak(`M${(L * 0.9).toFixed(1)} ${y0.toFixed(1)} H${L.toFixed(1)} V${y1.toFixed(1)} H${(L * 0.9).toFixed(1)} Z`, '#151d2a');
        for (let k = 0; k < 7; k++) {
          voor.ovaal(L * 0.95, y0 + (y1 - y0) * (k + 0.5) / 7, 7 * s, 18 * s, '#ffd98a', 0.16);
        }
        regen(voor, n(10));
      }

      b.spikkels(n(50), ['#ff4fa3', '#4fe8ff', '#ffd98a'], { y0: d * 0.2, y1: d, groot: 1.4 });
    },
  },

  // Het landhuis bij kaarslicht. Vier kanten, vier wanden van dezelfde
  // kamer: het plafond met de kroonluchter, de haard met het kleed ervoor,
  // de staande klok, en het harnas naast het wandkleed.
  //
  //   BOVEN   het plafond: moulures, twee balken, en een kroonluchter die
  //           in het midden hangt met twaalf vlammen.
  //   ONDER   de vloer en de haard: parket dat van je af loopt, een kleed
  //           vlak voor je, en vuur dat alles hier verlicht.
  //   LINKS   de staande klok over de hele hoogte, met een slinger die
  //           licht geeft, een portret en een wandkandelaar.
  //   RECHTS  het harnas en het wandkleed, met een bijzettafel en een
  //           kandelaber.
  landhuis: {
    kern: '#1d1410', koel: '#080505', warm: '#e5ac72', textuur: 'nerf', ruw: 0.26, stap: 40,
    gloed: '#ffbe63',
    verf(b) {
      const { d, L, R, K, n } = b;
      const s = d / 100;
      const ver = b.laag('randver');
      const mid = b.laag('randmid');
      const voor = b.laag('randvoor');

      // De wand: stijlen op ongelijke afstand, een lambriseringslijst, en
      // damast ertussen dat je nauwelijks ziet. Een net rooster van gelijke
      // bruine blokjes las als een reep chocola.
      const wand = (lijst) => {
        for (let i = 0; i < 5; i++) ver.waas(L * (0.1 + i * 0.2), d * 0.6, d * 1.1, '#7a4418', 0.3);
        for (let x = 0; x < L; x += R(78, 38)) {
          ver.streek(`M${x.toFixed(1)} 0 V${d.toFixed(1)}`, '#0c0706', R(3.4, 1.6), 0.7);
          ver.streek(`M${(x + 1.6).toFixed(1)} 0 V${d.toFixed(1)}`, '#6b4a24', 1, 0.3);
        }
        for (let x = 10; x < L; x += 26) {
          for (let y = 8; y < d; y += 24) {
            ver.vlak(`M${x.toFixed(1)} ${y.toFixed(1)} q5 -5 10 0 q-5 5 -10 0 Z`, '#53301a', 0.28);
            ver.stip(x + 5, y + 11, 1.4, '#53301a', 0.24);
          }
        }
        ver.streek(`M0 ${lijst.toFixed(1)} H${L.toFixed(1)}`, '#0c0706', 4 * s, 0.8);
        ver.streek(`M0 ${(lijst - 2.6 * s).toFixed(1)} H${L.toFixed(1)}`, '#8a6330', 1.4 * s, 0.45);
        ver.streek(`M0 ${(lijst + 3 * s).toFixed(1)} H${L.toFixed(1)}`, '#8a6330', 0.9 * s, 0.22);
      };
      const vlam = (o, x, y, m) => {
        o.gloed(x, y - 15 * m, 6.6 * m, '#ffbe63', 1.25);
        o.vlak(`M${x.toFixed(1)} ${(y - 21 * m).toFixed(1)} q${(3.4 * m).toFixed(1)} ${(4.6 * m).toFixed(1)} 0 ${(7.8 * m).toFixed(1)} q${(-3.4 * m).toFixed(1)} ${(-3.2 * m).toFixed(1)} 0 ${(-7.8 * m).toFixed(1)} Z`, '#fff3cf');
      };
      const kandelaar = (o, m) => {
        const u = (v) => (v * m).toFixed(1);
        o.vlak(`M${u(-26)} ${u(-56)} L${u(-10)} ${u(-16)} L${u(10)} ${u(-16)} L${u(26)} ${u(-56)} Z`, '#ffbe63', 0.07);
        o.waas(0, -16 * m, 46 * m, '#ffbe63', 0.3);
        o.streek(`M${u(-14)} 0 q${u(14)} ${u(-12)} ${u(28)} 0`, '#9b7430', 2.6 * m);
        o.streek(`M0 ${u(-6)} v${u(13)}`, '#9b7430', 2.8 * m);
        o.vlak(`M${u(-5)} ${u(7)} q${u(5)} ${u(4)} ${u(10)} 0 q${u(-5)} ${u(3)} ${u(-10)} 0 Z`, '#9b7430');
        for (const dx of [-14, 0, 14]) {
          const ky = dx === 0 ? -6 : 0;
          o.vlak(`M${u(dx - 2.2)} ${u(ky)} l${u(0.4)} ${u(-12)} h${u(3.6)} l${u(0.4)} ${u(12)} Z`, '#efe3c6');
          vlam(o, dx * m, ky * m, m);
        }
      };
      // Een portret met iemand erop: schouders, hoofd, kraag, licht van links.
      const portret = (o, br, h) => {
        const u = (v) => v.toFixed(1);
        o.vlak(`M${u(-br / 2)} ${u(-h / 2)} h${u(br)} v${u(h)} h${u(-br)} Z`, '#8a6a2c');
        o.vlak(`M${u(-br / 2 + 4 * s)} ${u(-h / 2 + 4 * s)} h${u(br - 8 * s)} v${u(h - 8 * s)} h${u(-br + 8 * s)} Z`, '#2b1d1a');
        o.streek(`M${u(-br / 2 + s)} ${u(-h / 2 + s)} h${u(br - 2 * s)}`, '#f2d08c', 1.2 * s, 0.7);
        o.streek(`M${u(br / 2 - s)} ${u(-h / 2 + s)} v${u(h - 2 * s)}`, '#3a2a0e', 1.4 * s, 0.7);
        o.vlak(`M${u(-br * 0.3)} ${u(h / 2 - 4 * s)} q${u(br * 0.3)} ${u(-h * 0.3)} ${u(br * 0.6)} 0 Z`, '#241820');
        o.ovaal(0, h * 0.02, br * 0.15, h * 0.13, '#6d5244');
        o.ovaal(-br * 0.05, 0, br * 0.1, h * 0.1, '#8a6a58', 0.8);
        o.vlak(`M${u(-br * 0.17)} ${u(h * 0.12)} q${u(br * 0.17)} ${u(h * 0.07)} ${u(br * 0.34)} 0 l0 ${u(h * 0.05)} q${u(-br * 0.17)} ${u(h * 0.06)} ${u(-br * 0.34)} 0 Z`, '#d8cbb2', 0.8);
        o.vlak(`M${u(-br / 2 + 4 * s)} ${u(-h / 2 + 4 * s)} l${u(br * 0.5)} 0 l${u(-br * 0.5)} ${u(h * 0.5)} Z`, '#ffe6b0', 0.07);
      };

      // ------------------------------------------------------------- BOVEN
      if (b.kant === 'boven') {
        // Het plafond: moulures aan de buitenkant, balken naar binnen.
        ver.vlak(`M0 -4 H${L.toFixed(1)} V${(d + 4).toFixed(1)} H0 Z`, '#1a1210');
        for (const [y, dik, kl, o] of [[0.08, 5, '#0c0706', 0.9], [0.1, 1.6, '#8a6330', 0.4], [0.16, 3.4, '#0c0706', 0.8], [0.18, 1, '#8a6330', 0.3]]) {
          ver.streek(`M0 ${(d * y).toFixed(1)} H${L.toFixed(1)}`, kl, dik * s, o);
        }
        for (let x = 0; x < L; x += 52 * s) {
          ver.vlak(`M${x.toFixed(1)} ${(d * 0.03).toFixed(1)} q${(13 * s).toFixed(1)} ${(-7 * s).toFixed(1)} ${(26 * s).toFixed(1)} 0 q${(-13 * s).toFixed(1)} ${(7 * s).toFixed(1)} ${(-26 * s).toFixed(1)} 0 Z`, '#53301a', 0.5);
        }
        for (const t of [0.22, 0.78]) {
          mid.vlak(`M0 ${(d * t).toFixed(1)} H${L.toFixed(1)} V${(d * (t + 0.1)).toFixed(1)} H0 Z`, '#2e2018');
          mid.streek(`M0 ${(d * t).toFixed(1)} H${L.toFixed(1)}`, '#6b4a24', 1.6 * s, 0.45);
          mid.streek(`M0 ${(d * (t + 0.1)).toFixed(1)} H${L.toFixed(1)}`, '#0c0706', 2.6 * s, 0.7);
        }
        // De kroonluchter, in het midden, met twaalf vlammen en kristal.
        const cx = L * 0.5;
        const cy = d * 0.62;
        voor.streek(`M${cx.toFixed(1)} -4 V${(cy - 34 * s).toFixed(1)}`, '#3a2a14', 2.4 * s, 0.9);
        for (let k = 0; k < 5; k++) voor.ovaal(cx, cy - 34 * s + k * 7 * s, 2.6 * s, 3.4 * s, '#6b4a24', 0.9);
        const kl = voor.rechtop(cx, cy);
        const ku = (v) => (v * s).toFixed(1);
        kl.waas(0, -10 * s, 92 * s, '#ffbe63', 0.5);
        // Twee ringen met armen, de onderste breder.
        for (const [ry, rr, arm, m] of [[-14, 30, 6, 1], [4, 46, 6, 1.2]]) {
          kl.g.append(el('ellipse', {
            cx: 0, cy: (ry * s).toFixed(1), rx: (rr * s).toFixed(1), ry: (rr * 0.26 * s).toFixed(1),
            fill: 'none', stroke: '#9b7430', 'stroke-width': (2.6 * s).toFixed(1),
          }));
          for (let k = 0; k < arm; k++) {
            const a = (k / arm) * Math.PI * 2;
            const px = Math.cos(a) * rr * s;
            const py = ry * s + Math.sin(a) * rr * 0.26 * s;
            kl.streek(`M0 ${(ry * s).toFixed(1)} Q${(px * 0.6).toFixed(1)} ${(py - 6 * s).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)}`, '#9b7430', 2 * s, 0.95);
            kl.vlak(`M${(px - 2.2 * m * s).toFixed(1)} ${py.toFixed(1)} l${(0.4 * m * s).toFixed(1)} ${(-11 * m * s).toFixed(1)} h${(3.6 * m * s).toFixed(1)} l${(0.4 * m * s).toFixed(1)} ${(11 * m * s).toFixed(1)} Z`, '#efe3c6');
            vlam(kl, px, py - 11 * m * s, m * s);
          }
        }
        kl.streek(`M0 ${ku(-18)} V${ku(10)}`, '#9b7430', 3.4 * s);
        kl.vlak(`M${ku(-7)} ${ku(10)} q${ku(7)} ${ku(13)} ${ku(14)} 0 Z`, '#9b7430');
        // Kristal: druppels aan de onderste ring.
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          const px = Math.cos(a) * 46 * s;
          const py = 4 * s + Math.sin(a) * 12 * s;
          kl.vlak(`M${px.toFixed(1)} ${py.toFixed(1)} l${(2.6 * s).toFixed(1)} ${(7 * s).toFixed(1)} l${(-2.6 * s).toFixed(1)} ${(6 * s).toFixed(1)} l${(-2.6 * s).toFixed(1)} ${(-6 * s).toFixed(1)} Z`, '#ffeec6', 0.6);
        }
        kl.gloed(0, 0, 26 * s, '#ffbe63', 1.1, 0);
        // Spinrag in de linkerhoek: niemand komt hier met een stoffer.
        for (let a = 0; a <= 5; a++) {
          const h = (a / 5) * Math.PI * 0.5;
          voor.streek(`M0 0 l${(Math.cos(h) * 50 * s).toFixed(1)} ${(Math.sin(h) * 50 * s).toFixed(1)}`, '#c8c0a8', 0.6, 0.22);
        }
        b.spikkels(n(26), ['#ffd9a0', '#ffbe63'], { y0: d * 0.3, y1: d, groot: 1.5, halo: 0.35 });
      }

      // ------------------------------------------------------------- ONDER
      // De vloer en de haard. De vloer ligt bij y=0, vlak voor je.
      if (b.kant === 'onder') {
        wand(d * 0.84);
        // Het parket, van je af naar de wand, met de latten in visgraat.
        mid.vlak(`M0 -4 H${L.toFixed(1)} V${(d * 0.56).toFixed(1)} H0 Z`, '#3a2817');
        for (let x = -20; x < L + 20; x += 26 * s) {
          mid.streek(`M${x.toFixed(1)} ${(d * 0.56).toFixed(1)} l${(14 * s).toFixed(1)} ${(-d * 0.6).toFixed(1)}`, '#2a1c10', 1.4 * s, 0.55);
          mid.streek(`M${(x + 13 * s).toFixed(1)} ${(d * 0.56).toFixed(1)} l${(-14 * s).toFixed(1)} ${(-d * 0.6).toFixed(1)}`, '#4e3620', 1.2 * s, 0.4);
        }
        mid.streek(`M0 ${(d * 0.56).toFixed(1)} H${L.toFixed(1)}`, '#6b4a24', 2.6 * s, 0.6);
        // De haard staat tegen de wand, dus bij y groot, en brandt.
        const hx = L * 0.42;
        const hb = d * 0.9;
        const hh = d * 0.56;
        const o = voor.rechtop(hx, d * 0.56);
        const hu = (v) => (v * 1).toFixed(1);
        o.waas(0, -hh * 0.45, hh * 1.6, '#ff8a2a', 0.5);
        o.vlak(`M${hu(-hb / 2)} 0 v${hu(-hh)} h${hu(hb)} v${hu(hh)} Z`, '#2e2018');
        o.vlak(`M${hu(-hb * 0.34)} 0 v${hu(-hh * 0.66)} q${hu(hb * 0.34)} ${hu(-hh * 0.2)} ${hu(hb * 0.68)} 0 V0 Z`, '#120b09');
        o.streek(`M${hu(-hb / 2)} ${hu(-hh)} h${hu(hb)}`, '#7d5c2c', 3 * s, 0.8);
        o.streek(`M${hu(-hb / 2 + 2 * s)} ${hu(-hh + 2.4 * s)} h${hu(hb - 4 * s)}`, '#d8ad5c', 1.1 * s, 0.5);
        // Een spiegel boven de schoorsteenmantel.
        o.vlak(`M${hu(-hb * 0.26)} ${hu(-hh - 4 * s)} h${hu(hb * 0.52)} v${hu(-hh * 0.5)} h${hu(-hb * 0.52)} Z`, '#8a6a2c');
        o.vlak(`M${hu(-hb * 0.23)} ${hu(-hh - 7 * s)} h${hu(hb * 0.46)} v${hu(-hh * 0.42)} h${hu(-hb * 0.46)} Z`, '#2a2622');
        o.vlak(`M${hu(-hb * 0.23)} ${hu(-hh - 7 * s)} l${hu(hb * 0.3)} 0 l${hu(-hb * 0.3)} ${hu(-hh * 0.3)} Z`, '#c8d0d8', 0.12);
        // Haardijzers, blokken en vuur.
        for (let k = -1; k <= 1; k++) o.streek(`M${hu(k * 9 * s - 9 * s)} ${hu(-5 * s)} l${hu(18 * s)} ${hu(k * 2 * s)}`, '#3a2415', 5 * s);
        for (let k = 0; k < 9; k++) {
          const fx = R(hb * 0.22, -hb * 0.22);
          const fh = R(hh * 0.42, hh * 0.18);
          o.vlak(`M${fx.toFixed(1)} ${hu(-4 * s)} q${(fh * 0.4).toFixed(1)} ${(-fh * 0.55).toFixed(1)} 0 ${(-fh).toFixed(1)} q${(-fh * 0.4).toFixed(1)} ${(fh * 0.45).toFixed(1)} 0 ${fh.toFixed(1)} Z`, K(['#ff8a2a', '#ffc94d', '#ff5d1f']), R(1, 0.6));
        }
        o.gloed(0, -hh * 0.2, hh * 0.3, '#ff9a33', 1.2, 0);
        // Het kleed vlak voor je, met een rand en een medaillon.
        voor.vlak(`M${(-L * 0.04).toFixed(1)} -4 H${(L * 1.04).toFixed(1)} V${(d * 0.3).toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(d * 0.36).toFixed(1)} ${(-L * 0.04).toFixed(1)} ${(d * 0.3).toFixed(1)} Z`, '#5a2733');
        voor.streek(`M${(-L * 0.04).toFixed(1)} ${(d * 0.26).toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(d * 0.32).toFixed(1)} ${(L * 1.04).toFixed(1)} ${(d * 0.26).toFixed(1)}`, '#a8822e', 2.6 * s, 0.75);
        voor.streek(`M${(-L * 0.04).toFixed(1)} ${(d * 0.08).toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(d * 0.14).toFixed(1)} ${(L * 1.04).toFixed(1)} ${(d * 0.08).toFixed(1)}`, '#a8822e', 1.4 * s, 0.4);
        for (let x = L * 0.06; x < L; x += 52 * s) {
          voor.vlak(`M${x.toFixed(1)} ${(d * 0.17).toFixed(1)} q${(7 * s).toFixed(1)} ${(-9 * s).toFixed(1)} ${(14 * s).toFixed(1)} 0 q${(-7 * s).toFixed(1)} ${(9 * s).toFixed(1)} ${(-14 * s).toFixed(1)} 0 Z`, '#a8822e', 0.42);
          voor.stip(x + 7 * s, d * 0.07, 2 * s, '#3f1a24', 0.6);
        }
        // Een omgevallen glas op het kleed, met een plek wijn.
        const gl = voor.rechtop(L * 0.76, d * 0.14);
        const gu = (v) => (v * s * 1.7).toFixed(1);
        gl.ovaal(-6 * s * 1.7, 1 * s * 1.7, 13 * s * 1.7, 4 * s * 1.7, '#3f1016', 0.8);
        gl.vlak(`M0 0 q${gu(-3)} ${gu(-9)} ${gu(-11)} ${gu(-10)} q${gu(-8)} ${gu(1)} ${gu(-11)} ${gu(10)} Z`, '#d8cbb2', 0.5);
        gl.streek(`M0 0 l${gu(13)} ${gu(1)}`, '#d8cbb2', 1.8 * s * 1.7, 0.6);
        gl.ovaal(14 * s * 1.7, 1 * s * 1.7, 4.4 * s * 1.7, 1.6 * s * 1.7, '#d8cbb2', 0.55);
        gl.gloed(-6 * s * 1.7, -5 * s * 1.7, 3 * s * 1.7, '#ff9a33', 0.6, 0);
        kandelaar(voor.rechtop(L * 0.08, d * 0.7), s * 1.4);
        kandelaar(voor.rechtop(L * 0.92, d * 0.7), s * 1.4);
        b.spikkels(n(22), ['#ffd9a0', '#ffbe63'], { y0: d * 0.1, y1: d, groot: 1.5, halo: 0.35 });
      }

      // ------------------------------------------------------------- LINKS
      // De staande klok over de hele hoogte. De vloer ligt bij x=0.
      if (b.kant === 'links') {
        wand(d * 0.3);
        // De plint onderaan de pagina.
        mid.vlak(`M0 0 H${(L * 0.07).toFixed(1)} V${(d + 4).toFixed(1)} H0 Z`, '#2a1c12');
        mid.streek(`M${(L * 0.07).toFixed(1)} 0 V${(d + 4).toFixed(1)}`, '#6b4a24', 1.6 * s, 0.4);
        // De kast: een baan over bijna de hele hoogte, met een kap bovenaan.
        const y0 = d * 0.44;
        const br = d * 0.46;
        mid.vlak(`M${(L * 0.07).toFixed(1)} ${y0.toFixed(1)} H${(L * 0.84).toFixed(1)} V${(y0 + br).toFixed(1)} H${(L * 0.07).toFixed(1)} Z`, '#3a2514');
        mid.streek(`M${(L * 0.07).toFixed(1)} ${(y0 + 4 * s).toFixed(1)} H${(L * 0.84).toFixed(1)}`, '#8a6330', 1.6 * s, 0.5);
        mid.streek(`M${(L * 0.07).toFixed(1)} ${(y0 + br - 4 * s).toFixed(1)} H${(L * 0.84).toFixed(1)}`, '#0c0706', 3 * s, 0.7);
        // De kap, aan de bovenkant van de pagina: dat is x groot.
        mid.vlak(`M${(L * 0.84).toFixed(1)} ${(y0 - 8 * s).toFixed(1)} H${(L * 0.95).toFixed(1)} V${(y0 + br + 8 * s).toFixed(1)} H${(L * 0.84).toFixed(1)} Z`, '#4a3018');
        mid.vlak(`M${(L * 0.95).toFixed(1)} ${(y0 + br * 0.12).toFixed(1)} q${(L * 0.05).toFixed(1)} ${(br * 0.38).toFixed(1)} 0 ${(br * 0.76).toFixed(1)} Z`, '#4a3018');
        mid.streek(`M${(L * 0.95).toFixed(1)} ${(y0 + br * 0.12).toFixed(1)} q${(L * 0.05).toFixed(1)} ${(br * 0.38).toFixed(1)} 0 ${(br * 0.76).toFixed(1)}`, '#a8822e', 1.6 * s, 0.6);
        // De wijzerplaat, net onder de kap.
        const wp = voor.rechtop(L * 0.78, y0 + br / 2);
        const wr = br * 0.36;
        wp.stip(0, 0, wr, '#d8cbb2');
        wp.stip(0, 0, wr * 0.92, '#efe3c6');
        wp.g.append(el('circle', { cx: 0, cy: 0, r: wr.toFixed(1), fill: 'none', stroke: '#8a6a2c', 'stroke-width': (3 * s).toFixed(1) }));
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          wp.streek(`M${(Math.cos(a) * wr * 0.78).toFixed(1)} ${(Math.sin(a) * wr * 0.78).toFixed(1)} L${(Math.cos(a) * wr * 0.88).toFixed(1)} ${(Math.sin(a) * wr * 0.88).toFixed(1)}`, '#2a1c10', k % 3 ? 1.4 * s : 2.6 * s, 0.9);
        }
        wp.streek(`M0 0 L${(Math.cos(-1.2) * wr * 0.6).toFixed(1)} ${(Math.sin(-1.2) * wr * 0.6).toFixed(1)}`, '#2a1c10', 2.6 * s);
        wp.streek(`M0 0 L${(Math.cos(1.9) * wr * 0.82).toFixed(1)} ${(Math.sin(1.9) * wr * 0.82).toFixed(1)}`, '#2a1c10', 1.8 * s);
        wp.stip(0, 0, 2.6 * s, '#8a6a2c');
        wp.gloed(-wr * 0.4, -wr * 0.4, wr * 0.3, '#ffbe63', 0.5, 0);
        // Het venster met de slinger, over de rest van de hoogte.
        voor.vlak(`M${(L * 0.14).toFixed(1)} ${(y0 + br * 0.14).toFixed(1)} H${(L * 0.7).toFixed(1)} V${(y0 + br * 0.86).toFixed(1)} H${(L * 0.14).toFixed(1)} Z`, '#1a1008');
        voor.streek(`M${(L * 0.14).toFixed(1)} ${(y0 + br * 0.14).toFixed(1)} H${(L * 0.7).toFixed(1)} V${(y0 + br * 0.86).toFixed(1)} H${(L * 0.14).toFixed(1)} Z`, '#8a6a2c', 2.4 * s, 0.8);
        voor.streek(`M${(L * 0.68).toFixed(1)} ${(y0 + br / 2).toFixed(1)} L${(L * 0.3).toFixed(1)} ${(y0 + br * 0.62).toFixed(1)}`, '#9b7430', 2 * s, 0.9);
        voor.stip(L * 0.3, y0 + br * 0.62, br * 0.17, '#c9a24c');
        voor.gloed(L * 0.3, y0 + br * 0.62, br * 0.14, '#ffbe63', 1.2);
        // Twee gewichten aan kettingen, achter de slinger.
        for (const [t, lang] of [[0.56, 0.3], [0.48, 0.42]]) {
          voor.streek(`M${(L * 0.68).toFixed(1)} ${(y0 + br * (0.3 + (t - 0.5))).toFixed(1)} L${(L * t).toFixed(1)} ${(y0 + br * 0.3).toFixed(1)}`, '#6b4a24', 1 * s, 0.7);
          voor.vlak(`M${(L * t - 5 * s).toFixed(1)} ${(y0 + br * 0.3).toFixed(1)} h${(10 * s).toFixed(1)} v${(br * lang * 0.3).toFixed(1)} h${(-10 * s).toFixed(1)} Z`, '#8a6a2c', 0.9);
        }
        // Een portret boven de klok, en een kandelaar eronder.
        const pt = mid.rechtop(L * 0.3, d * 0.16);
        portret(pt, 46 * s, 62 * s);
        const pt2 = mid.rechtop(L * 0.62, d * 0.14);
        portret(pt2, 34 * s, 44 * s);
        kandelaar(voor.rechtop(L * 0.46, d * 0.2), s * 1.7);
        kandelaar(voor.rechtop(L * 0.9, d * 0.22), s * 1.3);
        b.spikkels(n(22), ['#ffd9a0', '#ffbe63'], { y0: d * 0.1, y1: d, groot: 1.5, halo: 0.35 });
      }

      // ------------------------------------------------------------ RECHTS
      // Het harnas en het wandkleed. De vloer ligt bij x=L.
      if (b.kant === 'rechts') {
        wand(d * 0.3);
        mid.vlak(`M${(L * 0.93).toFixed(1)} 0 H${L.toFixed(1)} V${(d + 4).toFixed(1)} H${(L * 0.93).toFixed(1)} Z`, '#2a1c12');
        mid.streek(`M${(L * 0.93).toFixed(1)} 0 V${(d + 4).toFixed(1)}`, '#6b4a24', 1.6 * s, 0.4);
        // Het wandkleed over de bovenste helft van de pagina.
        const wk = mid.rechtop(L * 0.3, d * 0.44);
        const wb = d * 0.6;
        const wh = L * 0.44;
        wk.vlak(`M${(-wh / 2).toFixed(1)} ${(-wb / 2).toFixed(1)} h${wh.toFixed(1)} v${wb.toFixed(1)} q${(-wh / 2).toFixed(1)} ${(7 * s).toFixed(1)} ${(-wh).toFixed(1)} 0 Z`, '#5a2733');
        wk.streek(`M${(-wh / 2).toFixed(1)} ${(-wb / 2 + 3 * s).toFixed(1)} h${wh.toFixed(1)}`, '#a8822e', 2.2 * s, 0.7);
        wk.streek(`M${(-wh / 2).toFixed(1)} ${(wb / 2 - 2 * s).toFixed(1)} q${(wh / 2).toFixed(1)} ${(7 * s).toFixed(1)} ${wh.toFixed(1)} 0`, '#a8822e', 1.6 * s, 0.5);
        // Een hert tussen bomen: alleen de vorm, in dezelfde draad.
        wk.vlak(`M${(-wh * 0.1).toFixed(1)} ${(wb * 0.26).toFixed(1)} q${(wb * 0.04).toFixed(1)} ${(-wb * 0.2).toFixed(1)} ${(wb * 0.14).toFixed(1)} ${(-wb * 0.2).toFixed(1)} q${(wb * 0.1).toFixed(1)} 0 ${(wb * 0.12).toFixed(1)} ${(wb * 0.2).toFixed(1)} Z`, '#a8822e', 0.5);
        wk.ovaal(wh * 0.08, -wb * 0.06, wb * 0.06, wb * 0.05, '#a8822e', 0.5);
        wk.streek(`M${(wh * 0.1).toFixed(1)} ${(-wb * 0.1).toFixed(1)} l${(wb * 0.06).toFixed(1)} ${(-wb * 0.12).toFixed(1)}`, '#a8822e', 1.6 * s, 0.5);
        wk.streek(`M${(wh * 0.06).toFixed(1)} ${(-wb * 0.1).toFixed(1)} l${(-wb * 0.04).toFixed(1)} ${(-wb * 0.12).toFixed(1)}`, '#a8822e', 1.6 * s, 0.5);
        for (let k = 0; k < 4; k++) {
          wk.vlak(`M${(-wh * 0.42 + k * wh * 0.26).toFixed(1)} ${(wb * 0.3).toFixed(1)} l${(wb * 0.05).toFixed(1)} ${(-wb * 0.34).toFixed(1)} l${(wb * 0.05).toFixed(1)} ${(wb * 0.34).toFixed(1)} Z`, '#a8822e', 0.34);
        }
        // Het harnas, onderaan de pagina, dus bij x groot. Het staat op een
        // sokkel en het licht van de kandelaars valt op het staal.
        const hn = voor.rechtop(L * 0.78, d - 4 * s);
        const u = (v) => (v * s * 2.1).toFixed(1);
        hn.waas(0, -34 * s * 2.1, 50 * s * 2.1, '#ffbe63', 0.22);
        hn.vlak(`M${u(-20)} 0 h${u(40)} v${u(-6)} h${u(-40)} Z`, '#2a1c12');
        hn.vlak(`M${u(-13)} ${u(-6)} v${u(-16)} q${u(13)} ${u(-8)} ${u(26)} 0 v${u(16)} Z`, '#4a4c56');
        hn.vlak(`M${u(-11)} ${u(-22)} q${u(11)} ${u(-9)} ${u(22)} 0 q${u(-3)} ${u(-17)} ${u(-11)} ${u(-17)} q${u(-8)} 0 ${u(-11)} ${u(17)} Z`, '#5a5d68');
        hn.streek(`M${u(-9)} ${u(-26)} q${u(9)} ${u(-5)} ${u(18)} 0`, '#8a8d99', 1.6 * s * 2.1, 0.6);
        hn.vlak(`M${u(-6)} ${u(-34)} h${u(12)} v${u(4)} h${u(-12)} Z`, '#15171d');
        hn.gloed(-3 * s * 2.1, -32 * s * 2.1, 1.8 * s * 2.1, '#ff6b4a', 0.85);
        hn.gloed(3 * s * 2.1, -32 * s * 2.1, 1.8 * s * 2.1, '#ff6b4a', 0.85);
        hn.vlak(`M0 ${u(-52)} q${u(5)} ${u(7)} 0 ${u(12)} q${u(-5)} ${u(-5)} 0 ${u(-12)} Z`, '#8a8d99');
        // De hellebaard in zijn hand.
        hn.streek(`M${u(-16)} ${u(-8)} l${u(-6)} ${u(-40)}`, '#6a6d78', 3 * s * 2.1);
        hn.vlak(`M${u(-22)} ${u(-48)} l${u(-5)} ${u(-11)} l${u(7)} ${u(3)} l${u(5)} ${u(-1)} Z`, '#c8ccd8');
        hn.streek(`M${u(-12)} ${u(-10)} q${u(-8)} ${u(4)} ${u(-6)} ${u(10)}`, '#4a4c56', 2.4 * s * 2.1, 0.9);
        // Een bijzettafel met een kandelaber, boven het harnas.
        const tf = voor.rechtop(L * 0.5, d - 4 * s);
        const tu = (v) => (v * s * 1.9).toFixed(1);
        tf.vlak(`M${tu(-20)} ${tu(-24)} h${tu(40)} v${tu(4)} h${tu(-40)} Z`, '#3a2514');
        tf.streek(`M${tu(-20)} ${tu(-24)} h${tu(40)}`, '#8a6330', 1.4 * s * 1.9, 0.5);
        for (const dx of [-15, 15]) tf.streek(`M${tu(dx)} ${tu(-20)} l${tu(dx > 0 ? -3 : 3)} ${tu(20)}`, '#2a1c10', 2.6 * s * 1.9);
        tf.streek(`M${tu(-17)} ${tu(-6)} h${tu(34)}`, '#2a1c10', 2 * s * 1.9, 0.9);
        kandelaar(tf, s * 1.9);
        kandelaar(voor.rechtop(L * 0.14, d * 0.2), s * 1.7);
        kandelaar(voor.rechtop(L * 0.62, d * 0.18), s * 1.3);
        b.spikkels(n(22), ['#ffd9a0', '#ffbe63'], { y0: d * 0.1, y1: d, groot: 1.5, halo: 0.35 });
      }
    },
  },

  // Het station buiten het ruim. Vier kanten, vier plekken aan boord. Dit
  // is de felste van de acht, en dat hoort: in het zwart van de ruimte is
  // kleur het enige dat er is.
  //
  //   BOVEN   de planeet, met een ring die erachter langs loopt, een schip
  //           dat wegvaart, en de romp met verlichte ramen eronder.
  //   ONDER   het dek: een lichtbaan over de hele breedte, een landingsring,
  //           kristalbloemen, en een drone met een lichtbundel.
  //   LINKS   een hoog raam over de hele hoogte, met de nevel erachter en
  //           een console met lampjes aan de voet.
  //   RECHTS  een luchtsluis over de hele hoogte, met een zwaailicht, een
  //           kabelbundel en een robotarm.
  station: {
    kern: '#0a0d1a', koel: '#030409', warm: '#8fe8ff', textuur: 'strijk', ruw: 0.14, stap: 38,
    gloed: '#ff2fa8',
    verf(b) {
      const { d, L, R, K, n } = b;
      const s = d / 100;
      const ver = b.laag('randver');
      const mid = b.laag('randmid');
      const voor = b.laag('randvoor');

      // De ruimte zelf: sterren, dan nevel eroverheen.
      ver.spikkels(n(9), ['#ffffff', '#bcd8ff', '#ffe3c0'], { y1: d, groot: 1.2, halo: 0.2 });
      for (let i = 0; i < 7; i++) {
        const kl = ['#ff2fa8', '#ff6a1f', '#9a3fff', '#1fb9ff', '#ff2fa8'][i % 5];
        ver.waas(L * (0.05 + i * 0.15), R(d, 0), d * R(1.5, 0.7), kl, R(0.6, 0.3));
      }
      // Rompplaat met panelen en klinknagels: het harde ding waar het neon
      // op zit. Elke kant heeft hem, op een andere hoogte.
      const romp = (y, dik) => {
        mid.vlak(`M0 ${y.toFixed(1)} H${L.toFixed(1)} V${(d + 4).toFixed(1)} H0 Z`, '#111726');
        mid.streek(`M0 ${y.toFixed(1)} H${L.toFixed(1)}`, '#4a6280', 1.4 * s, 0.4);
        for (let x = 0; x < L; x += 46 * s) {
          mid.streek(`M${x.toFixed(1)} ${y.toFixed(1)} V${(d + 4).toFixed(1)}`, '#05070e', 1.4 * s, 0.8);
          mid.streek(`M${(x + 1.4 * s).toFixed(1)} ${y.toFixed(1)} V${(d + 4).toFixed(1)}`, '#4a6280', 0.7 * s, 0.3);
          for (let k = 0; k < Math.max(1, Math.round((d - y) / (14 * s))); k++) {
            mid.stip(x + 23 * s, y + 7 * s + k * 14 * s, 1.6 * s, '#2a3a52');
          }
        }
        mid.streek(`M0 ${(y + dik).toFixed(1)} H${L.toFixed(1)}`, '#05070e', 2.6 * s, 0.6);
      };
      const kristal = (o, m, kl) => {
        o.gloed(0, 0, 9 * m, kl, 1, 0);
        for (let p = 0; p < 7; p++) {
          const a = (p / 7) * Math.PI * 2 + R(0.3, -0.3);
          o.g.append(el('path', {
            d: blad(0, 0, 13 * m, 4.4 * m, (a * 180) / Math.PI),
            fill: meng(kl, '#ffffff', 0.25), opacity: R(0.95, 0.6).toFixed(2),
          }));
        }
        o.stip(0, 0, 2.8 * m, '#ffffff');
      };
      // Een neonbuis langs de romp die doorhangt en hier en daar stuk is.
      const buis = (yf, kl) => {
        const id = zorgVoorGloed(kl);
        let x = R(30, 0);
        while (x < L) {
          const lang = R(200, 80);
          const nx = Math.min(L, x + lang);
          const y0 = d * yf + R(5, -5) * s;
          const y1 = d * yf + R(5, -5) * s;
          const pad = `M${x.toFixed(1)} ${y0.toFixed(1)} Q${((x + nx) / 2).toFixed(1)} ${((y0 + y1) / 2 + R(9, 2) * s).toFixed(1)} ${nx.toFixed(1)} ${y1.toFixed(1)}`;
          voor.g.append(el('path', { d: pad, stroke: `url(#${id})`, 'stroke-width': (26 * s).toFixed(1), fill: 'none', opacity: 0.34 }));
          voor.streek(pad, kl, 3 * s, 0.92);
          voor.streek(pad, meng(kl, '#ffffff', 0.75), 1.1 * s);
          if (R() < 0.3) voor.gloed(nx, y1, 4.4 * s, meng(kl, '#ffffff', 0.4), 1.1);
          x = nx + R(70, 20);
        }
      };

      // ------------------------------------------------------------- BOVEN
      if (b.kant === 'boven') {
        // De planeet: met zijn bovenkant buiten de band, zodat je alleen de
        // onderste helft ziet. Dat is wat hem groot maakt; met het hele
        // bolletje erin was het een knikker.
        const cx = L * 0.3;
        const r = d * 1.8;
        const cy = -r * 0.62;
        ver.stip(cx, cy, r, '#1b2a52', 1);
        ver.waas(cx, cy + r * 0.6, r * 0.9, '#2f6bd8', 0.5);
        ver.g.append(el('path', {
          d: `M${(cx - r).toFixed(1)} ${cy.toFixed(1)} A${r.toFixed(1)} ${r.toFixed(1)} 0 0 0 ${(cx + r).toFixed(1)} ${cy.toFixed(1)}`,
          stroke: '#6fd8ff', 'stroke-width': (3 * s).toFixed(1), fill: 'none', opacity: 0.75,
        }));
        for (let j = 0; j < 9; j++) {
          const a = Math.PI * (0.12 + (j / 9) * 0.76);
          ver.ovaal(cx + Math.cos(a) * r * R(0.86, 0.15), cy + Math.sin(a) * r * R(0.86, 0.3), R(34, 12) * s, R(7, 2.4) * s, j % 2 ? '#3a63a8' : '#6a3f9c', 0.55);
        }
        // De ring, schuin achter de planeet langs.
        ver.g.append(el('path', {
          d: `M${(cx - r * 1.5).toFixed(1)} ${(cy + r * 0.86).toFixed(1)} Q${cx.toFixed(1)} ${(cy + r * 0.3).toFixed(1)} ${(cx + r * 1.5).toFixed(1)} ${(cy + r * 0.72).toFixed(1)}`,
          stroke: '#9ac4f0', 'stroke-width': (9 * s).toFixed(1), fill: 'none', opacity: 0.35,
        }));
        ver.g.append(el('path', {
          d: `M${(cx - r * 1.5).toFixed(1)} ${(cy + r * 0.9).toFixed(1)} Q${cx.toFixed(1)} ${(cy + r * 0.34).toFixed(1)} ${(cx + r * 1.5).toFixed(1)} ${(cy + r * 0.76).toFixed(1)}`,
          stroke: '#cfe4ff', 'stroke-width': (2.4 * s).toFixed(1), fill: 'none', opacity: 0.5,
        }));
        // Een schip dat wegvaart, rechts, met een hete motorgloed.
        const sx = L * 0.82;
        const sy = d * 0.3;
        const sm = s * 2.2;
        const sh = mid.rechtop(sx, sy);
        const su = (v) => (v * sm).toFixed(1);
        sh.vlak(`M${su(-26)} 0 L${su(14)} ${su(-6)} L${su(26)} 0 L${su(14)} ${su(6)} Z`, '#1a2436');
        sh.vlak(`M${su(-10)} ${su(-5)} L${su(16)} ${su(-5)} L${su(22)} 0 L${su(-10)} 0 Z`, '#2c3c56');
        sh.streek(`M${su(-4)} ${su(-4)} h${su(16)}`, '#8fe8ff', 1.4 * sm, 0.8);
        sh.vlak(`M${su(-24)} ${su(-4)} l${su(-10)} ${su(-9)} l${su(5)} ${su(10)} Z`, '#1a2436');
        sh.vlak(`M${su(-24)} ${su(4)} l${su(-10)} ${su(9)} l${su(5)} ${su(-10)} Z`, '#1a2436');
        sh.gloed(-28 * sm, 0, 8 * sm, '#1fb9ff', 1.4);
        for (let k = 1; k <= 4; k++) sh.waas(-28 * sm - k * 14 * sm, 0, (10 + k * 5) * sm, '#1fb9ff', 0.26 - k * 0.04);
        // De romp onderaan, met verlichte ramen in een rij.
        romp(d * 0.72, 8 * s);
        for (let x = 14 * s; x < L; x += 36 * s) {
          const aan = R() > 0.3;
          voor.vlak(`M${x.toFixed(1)} ${(d * 0.8).toFixed(1)} h${(18 * s).toFixed(1)} v${(11 * s).toFixed(1)} h${(-18 * s).toFixed(1)} Z`, aan ? '#8fe8ff' : '#16203a', aan ? 0.75 : 1);
          if (aan) voor.gloed(x + 9 * s, d * 0.855, 9 * s, '#8fe8ff', 0.9, 0);
        }
        buis(0.96, '#ff2fa8');
      }

      // ------------------------------------------------------------- ONDER
      // Het dek. De vloer ligt bij y=0, vlak voor je.
      if (b.kant === 'onder') {
        // De ruimte achter de reling, tegen het bord aan.
        ver.waas(L * 0.5, d * 0.9, d * 1.2, '#9a3fff', 0.4);
        // Het dek zelf, met platen die naar achteren smaller worden.
        mid.vlak(`M0 -4 H${L.toFixed(1)} V${(d * 0.66).toFixed(1)} H0 Z`, '#111726');
        for (let k = 0; k < 6; k++) {
          const y = d * 0.66 * (1 - (k / 6) ** 1.6);
          mid.streek(`M0 ${y.toFixed(1)} H${L.toFixed(1)}`, '#05070e', 1.6 * s, 0.7);
        }
        for (let x = 0; x < L; x += 52 * s) {
          mid.streek(`M${x.toFixed(1)} -4 L${(L * 0.5 + (x - L * 0.5) * 0.4).toFixed(1)} ${(d * 0.66).toFixed(1)}`, '#05070e', 1.3 * s, 0.6);
        }
        // De lichtbaan in het dek, over de hele breedte.
        mid.vlak(`M0 ${(d * 0.3).toFixed(1)} H${L.toFixed(1)} V${(d * 0.36).toFixed(1)} H0 Z`, '#1fd8ff', 0.5);
        for (let x = 0; x < L; x += 30 * s) mid.gloed(x, d * 0.33, 10 * s, '#1fd8ff', 0.8, 0);
        // De landingsring, links van het midden, half buiten beeld.
        const lx = L * 0.34;
        const ly = d * 0.12;
        for (const [rr, kl, o] of [[d * 0.4, '#ff2fa8', 0.6], [d * 0.32, '#ff2fa8', 0.4]]) {
          mid.g.append(el('ellipse', {
            cx: lx.toFixed(1), cy: ly.toFixed(1), rx: rr.toFixed(1), ry: (rr * 0.34).toFixed(1),
            fill: 'none', stroke: kl, 'stroke-width': (2.6 * s).toFixed(1), opacity: o,
          }));
        }
        for (let k = 0; k < 8; k++) {
          const a = Math.PI * (k / 7);
          mid.gloed(lx + Math.cos(a) * d * 0.4, ly + Math.sin(a) * d * 0.4 * 0.34, 3.4 * s, '#ff2fa8', 1);
        }
        // De reling tegen het bord aan, met de ruimte erachter.
        voor.streek(`M0 ${(d * 0.7).toFixed(1)} H${L.toFixed(1)}`, '#2c3c56', 3.4 * s, 0.95);
        voor.streek(`M0 ${(d * 0.86).toFixed(1)} H${L.toFixed(1)}`, '#2c3c56', 2.6 * s, 0.9);
        for (let x = 10 * s; x < L; x += 40 * s) {
          voor.streek(`M${x.toFixed(1)} ${(d * 0.7).toFixed(1)} V${(d + 4).toFixed(1)}`, '#2c3c56', 2 * s, 0.9);
        }
        // De drone, rechts, met een bundel naar het dek.
        const dx = L * 0.72;
        const dy = d * 0.44;
        const dm = s * 1.9;
        const dr = voor.rechtop(dx, dy);
        const du = (v) => (v * dm).toFixed(1);
        dr.vlak(`M${du(-18)} ${du(-30)} L${du(0)} ${du(-14)} L${du(18)} ${du(-30)} L${du(0)} ${du(-4)} Z`, '#2c3c56');
        dr.vlak(`M${du(-10)} ${du(-24)} L0 ${du(-16)} L${du(10)} ${du(-24)} L0 ${du(-10)} Z`, '#1a2436');
        dr.gloed(0, -17 * dm, 5 * dm, '#1fd8ff', 1.3);
        for (const kant of [-1, 1]) {
          dr.streek(`M${du(kant * 14)} ${du(-27)} l${du(kant * 9)} ${du(-5)}`, '#2c3c56', 2 * dm);
          dr.g.append(el('ellipse', {
            cx: (kant * 23 * dm).toFixed(1), cy: (-32 * dm).toFixed(1), rx: (11 * dm).toFixed(1), ry: (2.6 * dm).toFixed(1),
            fill: 'none', stroke: '#8fe8ff', 'stroke-width': (1.4 * dm).toFixed(1), opacity: 0.7,
          }));
          dr.gloed(kant * 23 * dm, -32 * dm, 2.6 * dm, '#8fe8ff', 0.9);
        }
        // De bundel naar beneden: op deze kant is beneden -y.
        voor.vlak(`M${(dx - 9 * s).toFixed(1)} ${(dy - 4 * s).toFixed(1)} L${(dx - 34 * s).toFixed(1)} ${(-4).toFixed(1)} L${(dx + 34 * s).toFixed(1)} -4 L${(dx + 9 * s).toFixed(1)} ${(dy - 4 * s).toFixed(1)} Z`, '#1fd8ff', 0.12);
        voor.ovaal(dx, 0, 32 * s, 9 * s, '#1fd8ff', 0.22);
        // Kristalbloemen langs de binnenrand, in bosjes en niet in een rij.
        for (const [t, v, m, kl] of [[0.08, 0.92, 1.5, '#2fd9ff'], [0.13, 0.84, 1, '#2fd9ff'], [0.17, 0.95, 0.8, '#ff3fd0'], [0.44, 0.9, 1.3, '#2fd9ff'], [0.49, 0.96, 0.9, '#2fd9ff'], [0.88, 0.88, 1.6, '#ff3fd0'], [0.93, 0.95, 1.1, '#2fd9ff'], [0.62, 0.94, 1, '#2fd9ff']]) {
          kristal(voor.rechtop(L * t, d * v), s * m, kl);
        }
        buis(0.24, '#ff2fa8');
      }

      // ------------------------------------------------------------- LINKS
      // Een hoog raam over de hele hoogte. De vloer ligt bij x=0.
      if (b.kant === 'links') {
        // De wand eromheen, en daarbinnen de ruimte.
        ver.vlak(`M0 -4 H${L.toFixed(1)} V${(d * 0.26).toFixed(1)} H0 Z`, '#0c111c');
        ver.vlak(`M0 ${(d * 0.86).toFixed(1)} H${L.toFixed(1)} V${(d + 4).toFixed(1)} H0 Z`, '#0c111c');
        // Het kozijn: een lange opening met afgeronde einden.
        const y0 = d * 0.26;
        const y1 = d * 0.86;
        const x0 = L * 0.18;
        const x1 = L * 0.94;
        mid.streek(`M${x0.toFixed(1)} ${y0.toFixed(1)} H${x1.toFixed(1)}`, '#2c3c56', 6 * s, 1);
        mid.streek(`M${x0.toFixed(1)} ${y1.toFixed(1)} H${x1.toFixed(1)}`, '#2c3c56', 6 * s, 1);
        mid.streek(`M${x0.toFixed(1)} ${y0.toFixed(1)} Q${(x0 - L * 0.1).toFixed(1)} ${((y0 + y1) / 2).toFixed(1)} ${x0.toFixed(1)} ${y1.toFixed(1)}`, '#2c3c56', 6 * s, 1);
        // De roeden van het raam.
        for (let x = x0 + L * 0.1; x < x1; x += L * 0.13) {
          mid.streek(`M${x.toFixed(1)} ${y0.toFixed(1)} V${y1.toFixed(1)}`, '#2c3c56', 3 * s, 0.9);
          mid.streek(`M${(x + 1.4 * s).toFixed(1)} ${y0.toFixed(1)} V${y1.toFixed(1)}`, '#6a84a8', 1 * s, 0.4);
        }
        mid.streek(`M${x0.toFixed(1)} ${((y0 + y1) / 2).toFixed(1)} H${x1.toFixed(1)}`, '#2c3c56', 2.4 * s, 0.85);
        // Een weerschijn in het glas, van de ene hoek naar de andere.
        mid.vlak(`M${(x0 + L * 0.06).toFixed(1)} ${y1.toFixed(1)} L${(x0 + L * 0.3).toFixed(1)} ${y0.toFixed(1)} L${(x0 + L * 0.42).toFixed(1)} ${y0.toFixed(1)} L${(x0 + L * 0.18).toFixed(1)} ${y1.toFixed(1)} Z`, '#8fe8ff', 0.07);
        // De console aan de voet van de pagina, dus bij x=0.
        const co = voor.rechtop(L * 0.1, d * 0.6);
        const cu = (v) => (v * s * 2.1).toFixed(1);
        co.waas(0, -16 * s * 2.1, 40 * s * 2.1, '#1fd8ff', 0.3);
        co.vlak(`M${cu(-26)} 0 h${cu(52)} v${cu(-10)} l${cu(-6)} ${cu(-9)} h${cu(-40)} Z`, '#1a2436');
        co.vlak(`M${cu(-20)} ${cu(-19)} h${cu(40)} v${cu(-2)} h${cu(-40)} Z`, '#2c3c56');
        for (let k = 0; k < 9; k++) {
          const px = (-21 + k * 5.4) * s * 2.1;
          co.vlak(`M${px.toFixed(1)} ${cu(-6)} h${(3.4 * s * 2.1).toFixed(1)} v${(-5 * s * 2.1).toFixed(1)} h${(-3.4 * s * 2.1).toFixed(1)} Z`, k % 3 ? '#1fd8ff' : '#ff2fa8', 0.8);
          co.gloed(px + 1.7 * s * 2.1, -8.6 * s * 2.1, 2.2 * s * 2.1, k % 3 ? '#1fd8ff' : '#ff2fa8', 0.8, 0);
        }
        co.streek(`M${cu(-18)} ${cu(-13)} h${cu(30)}`, '#8fe8ff', 1.4 * s * 2.1, 0.7);
        co.streek(`M${cu(-18)} ${cu(-16)} h${cu(18)}`, '#8fe8ff', 1.4 * s * 2.1, 0.5);
        // Leidingen langs de wand, over de hele hoogte.
        for (const [y, kl, dik] of [[0.1, '#2c3c56', 7], [0.16, '#1a2436', 5], [0.92, '#2c3c56', 6]]) {
          voor.streek(`M0 ${(d * y).toFixed(1)} H${L.toFixed(1)}`, kl, dik * s, 0.95);
          for (let x = 20 * s; x < L; x += 90 * s) {
            voor.vlak(`M${x.toFixed(1)} ${(d * y - dik * 0.8 * s).toFixed(1)} h${(9 * s).toFixed(1)} v${(dik * 1.6 * s).toFixed(1)} h${(-9 * s).toFixed(1)} Z`, '#3a4c68');
          }
        }
        buis(0.2, '#1fd8ff');
        kristal(voor.rechtop(L * 0.4, d * 0.96), s * 1.4, '#2fd9ff');
        kristal(voor.rechtop(L * 0.72, d * 0.94), s * 1.1, '#ff3fd0');
      }

      // ------------------------------------------------------------ RECHTS
      // Een luchtsluis over de hele hoogte. De vloer ligt bij x=L.
      if (b.kant === 'rechts') {
        romp(d * 0.04, 6 * s);
        // De sluisdeur: een ronde opening met acht klemmen eromheen.
        const cx = L * 0.46;
        const cy = d * 0.52;
        const r = Math.min(L * 0.3, d * 0.42);
        mid.stip(cx, cy, r * 1.22, '#1a2436');
        mid.g.append(el('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r: (r * 1.22).toFixed(1), fill: 'none', stroke: '#2c3c56', 'stroke-width': (5 * s).toFixed(1) }));
        mid.stip(cx, cy, r, '#111726');
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2 + 0.2;
          const px = cx + Math.cos(a) * r * 1.1;
          const py = cy + Math.sin(a) * r * 1.1;
          mid.ovaal(px, py, 7 * s, 4.4 * s, '#3a4c68');
          mid.gloed(px, py, 2 * s, '#ff2fa8', 0.7, 0);
        }
        // Het luik zelf, met een ruitje waar licht door komt.
        mid.g.append(el('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r: (r * 0.86).toFixed(1), fill: 'none', stroke: '#2c3c56', 'stroke-width': (3.4 * s).toFixed(1) }));
        for (let k = 0; k < 4; k++) {
          const a = (k / 4) * Math.PI * 2 + 0.6;
          mid.streek(`M${cx.toFixed(1)} ${cy.toFixed(1)} l${(Math.cos(a) * r * 0.84).toFixed(1)} ${(Math.sin(a) * r * 0.84).toFixed(1)}`, '#2c3c56', 4 * s, 0.9);
        }
        mid.stip(cx, cy, r * 0.3, '#0a1018');
        mid.gloed(cx, cy, r * 0.26, '#8fe8ff', 1.2);
        mid.g.append(el('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r: (r * 0.3).toFixed(1), fill: 'none', stroke: '#3a4c68', 'stroke-width': (3 * s).toFixed(1) }));
        // Het zwaailicht boven de sluis, met een kegel naar beneden.
        const zx = L * 0.14;
        voor.vlak(`M${zx.toFixed(1)} ${(d * 0.3).toFixed(1)} L${(zx + L * 0.06).toFixed(1)} ${(d + 4).toFixed(1)} L${(zx - L * 0.06).toFixed(1)} ${(d + 4).toFixed(1)} Z`, '#ff2fa8', 0.14);
        voor.vlak(`M${(zx - 9 * s).toFixed(1)} ${(d * 0.3).toFixed(1)} h${(18 * s).toFixed(1)} v${(-9 * s).toFixed(1)} h${(-18 * s).toFixed(1)} Z`, '#2c3c56');
        voor.gloed(zx, d * 0.3, 10 * s, '#ff2fa8', 1.5);
        // De kabelbundel over de hele hoogte, met een losse streng.
        for (const [y, kl, dik] of [[0.86, '#1a2436', 8], [0.92, '#2c3c56', 5]]) {
          voor.streek(`M0 ${(d * y).toFixed(1)} Q${(L * 0.5).toFixed(1)} ${(d * (y + 0.04)).toFixed(1)} ${L.toFixed(1)} ${(d * y).toFixed(1)}`, kl, dik * s, 0.95);
        }
        for (let x = 30 * s; x < L; x += 120 * s) {
          voor.streek(`M${x.toFixed(1)} ${(d * 0.88).toFixed(1)} q${(14 * s).toFixed(1)} ${(d * 0.08).toFixed(1)} ${(-6 * s).toFixed(1)} ${(d * 0.14).toFixed(1)}`, '#1a2436', 2.4 * s, 0.9);
        }
        // De robotarm, onderaan de pagina: drie leden en een klem.
        const am = voor.rechtop(L * 0.84, d * 0.9);
        const au = (v) => (v * s * 2).toFixed(1);
        am.vlak(`M${au(-14)} 0 h${au(28)} v${au(-7)} h${au(-28)} Z`, '#1a2436');
        am.streek(`M0 ${au(-6)} L${au(-16)} ${au(-30)}`, '#3a4c68', 7 * s * 2);
        am.streek(`M${au(-16)} ${au(-30)} L${au(10)} ${au(-50)}`, '#3a4c68', 6 * s * 2);
        am.streek(`M${au(10)} ${au(-50)} l${au(12)} ${au(-6)}`, '#2c3c56', 4 * s * 2);
        am.stip(-16 * s * 2, -30 * s * 2, 4.4 * s * 2, '#6a84a8');
        am.stip(10 * s * 2, -50 * s * 2, 3.4 * s * 2, '#6a84a8');
        am.streek(`M${au(22)} ${au(-56)} l${au(7)} ${au(-5)}`, '#8fe8ff', 2.4 * s * 2, 0.9);
        am.streek(`M${au(22)} ${au(-56)} l${au(8)} ${au(2)}`, '#8fe8ff', 2.4 * s * 2, 0.9);
        am.gloed(26 * s * 2, -55 * s * 2, 3.4 * s * 2, '#8fe8ff', 1.1);
        buis(0.98, '#1fd8ff');
        kristal(voor.rechtop(L * 0.3, d * 0.96), s * 1.3, '#ff3fd0');
        kristal(voor.rechtop(L * 0.62, d * 0.94), s * 1, '#2fd9ff');
      }

      b.spikkels(n(17), ['#2fd9ff', '#ff3fd0', '#ffffff'], { y0: 0, y1: d * 1.04, groot: 1.6 });
    },
  },
  // ---------------------------------------------------- Het Rietveld College
  //
  // Een schoolgang nadat iedereen weg is. Dezelfde zes regels als de andere
  // werelden, alleen is het licht hier tl in plaats van kaarsvuur: koud
  // boven, en één armatuur die het net niet meer doet. Wat de gang
  // herkenbaar maakt zijn de lockers die over de hele lengte doorlopen en
  // de haakjes eronder met een jas die niemand is komen halen.
  school: {
    kern: '#121a22', koel: '#070b0f', warm: '#ffe6a8', textuur: 'korrel', ruw: 0.16, stap: 40,
    gloed: '#ffd166',
    verf(b) {
      const { d, L, R, K, n } = b;
      const s = d / 100;
      const ver = b.laag('randver', 0.66);
      const mid = b.laag('randmid');
      const voor = b.laag('randvoor');

      ver.vlak(`M0 0 H${L.toFixed(1)} V${d.toFixed(1)} H0 Z`, '#0c131a');
      ver.vlak(`M0 ${(d * 0.62).toFixed(1)} H${L.toFixed(1)} V${d.toFixed(1)} H0 Z`, '#101a24');
      ver.streek(`M0 ${(d * 0.62).toFixed(1)} H${L.toFixed(1)}`, '#27384a', 1.4 * s, 0.6);

      // De lockerwand. Elke deur iets anders van kleur, want ze zijn in
      // dertig jaar drie keer overgeschilderd.
      const top = d * 0.2;
      const hoog = d * 0.4;
      const breed = 34 * s;
      for (let x = R(8, 0); x < L; x += breed) {
        const w = Math.min(breed - 2 * s, L - x);
        if (w < 6 * s) break;
        mid.vlak(`M${x.toFixed(1)} ${top.toFixed(1)} h${w.toFixed(1)} v${hoog.toFixed(1)} h${(-w).toFixed(1)} Z`, K(['#1d3346', '#1a2e40', '#20394d']));
        mid.streek(`M${x.toFixed(1)} ${top.toFixed(1)} v${hoog.toFixed(1)}`, '#050a0f', 1.2 * s, 0.8);
        for (let k = 0; k < 3; k++) {
          mid.streek(`M${(x + 5 * s).toFixed(1)} ${(top + (4 + k * 3) * s).toFixed(1)} h${(w - 10 * s).toFixed(1)}`, '#09111a', 1 * s, 0.7);
        }
        mid.stip(x + w * 0.74, top + hoog * 0.42, 1.5 * s, '#6d8399');
        if (R() < 0.16) {
          mid.vlak(`M${(x + w * 0.5).toFixed(1)} ${top.toFixed(1)} h${(w * 0.5).toFixed(1)} v${hoog.toFixed(1)} h${(-w * 0.5).toFixed(1)} Z`, '#060b11');
          voor.vlak(mid.klont(x + w * 0.74, top + hoog * 0.94, w * 0.46, hoog * 0.3, 3), '#2f4a3a');
        }
      }

      // Haakjes onder de lockers, met hier en daar een jas eraan.
      for (let i = 0; i < n(58); i++) {
        const x = R(L, 0);
        const y = d * 0.68;
        voor.streek(`M${x.toFixed(1)} ${y.toFixed(1)} v${(4 * s).toFixed(1)}`, '#4a5f72', 1.2 * s);
        if (R() < 0.3) {
          voor.vlak(voor.klont(x, y + 20 * s, 13 * s, 16 * s, 3), K(['#3a2f4a', '#2a3b4f', '#4a3328']));
        }
      }

      // De tl-balk loopt de hele gang door. Eén buis hapert; dat is het
      // enige wat er in zo'n gang nog gebeurt als iedereen weg is.
      const balk = d * 0.1;
      mid.vlak(`M0 ${(balk - 2.6 * s).toFixed(1)} H${L.toFixed(1)} V${(balk + 2.6 * s).toFixed(1)} H0 Z`, '#1e2a35');
      let x = R(30, 4);
      while (x < L) {
        const nx = Math.min(L, x + 150 * s * R(1.25, 0.75));
        const aan = R() > 0.22;
        voor.streek(`M${x.toFixed(1)} ${balk.toFixed(1)} H${nx.toFixed(1)}`, aan ? '#ffe6a8' : '#2b3a48', 2.4 * s, aan ? 0.95 : 0.7);
        if (aan) {
          const id = zorgVoorGloed('#ffd166');
          voor.g.append(el('rect', {
            x: x.toFixed(1), y: (balk - 16 * s).toFixed(1),
            width: (nx - x).toFixed(1), height: (32 * s).toFixed(1),
            fill: `url(#${id})`, opacity: 0.2,
          }));
          voor.gloed((x + nx) / 2, balk, 7 * s, '#ffd166', 0.8, 0.5);
        }
        x = nx + 10 * s;
      }

      voor.spikkels(n(90), ['#ffe6a8', '#cfe0f0'], { y0: balk, y1: d * 0.55, groot: 1.1, halo: 0.3 });
      const bx = L * R(0.78, 0.6);
      voor.ovaal(bx, d - 6 * s, 8 * s, 8 * s, '#c25a2a');
      voor.streek(`M${(bx - 7 * s).toFixed(1)} ${(d - 7 * s).toFixed(1)} q${(7 * s).toFixed(1)} ${(5 * s).toFixed(1)} ${(14 * s).toFixed(1)} 0`, '#f0d8c0', 0.9 * s, 0.7);
      voor.ovaal(bx, d - 0.5 * s, 9 * s, 2.2 * s, '#05080c', 0.5);
    },
  },

  // -------------------------------------------------- Sint-Joris, nachtdienst
  //
  // Een ziekenhuisgang om drie uur 's nachts. Het hele gebouw heeft hier
  // dezelfde kleur: een flauw groen dat uit het plafond komt en waar
  // niemand ooit voor gekozen heeft. De leuning loopt over de volle lengte
  // door - dat is wat een ziekenhuisgang een ziekenhuisgang maakt - en om
  // de zoveel meter staat een deur met een ruitje waar licht achter kan
  // branden.
  ziekenhuis: {
    kern: '#0b1a16', koel: '#030807', warm: '#d6fff0', textuur: 'strijk', ruw: 0.1, stap: 36,
    gloed: '#49e0b4',
    verf(b) {
      const { d, L, R, K, n } = b;
      const s = d / 100;
      const ver = b.laag('randver', 0.7);
      const mid = b.laag('randmid');
      const voor = b.laag('randvoor');

      ver.vlak(`M0 0 H${L.toFixed(1)} V${d.toFixed(1)} H0 Z`, '#081411');
      ver.vlak(`M0 ${(d * 0.56).toFixed(1)} H${L.toFixed(1)} V${d.toFixed(1)} H0 Z`, '#0d2019');
      ver.streek(`M0 ${(d * 0.56).toFixed(1)} H${L.toFixed(1)}`, '#1f4438', 1.2 * s, 0.7);

      const stap = 118 * s;
      for (let x = R(24, 6); x < L; x += stap) {
        const w = 54 * s;
        if (x + w > L) break;
        mid.vlak(`M${x.toFixed(1)} ${(d * 0.14).toFixed(1)} h${w.toFixed(1)} v${(d * 0.44).toFixed(1)} h${(-w).toFixed(1)} Z`, '#102a22');
        mid.streek(`M${x.toFixed(1)} ${(d * 0.14).toFixed(1)} v${(d * 0.44).toFixed(1)}`, '#061310', 1.2 * s, 0.8);
        mid.streek(`M${(x + w).toFixed(1)} ${(d * 0.14).toFixed(1)} v${(d * 0.44).toFixed(1)}`, '#061310', 1.2 * s, 0.8);
        const aan = R() < 0.34;
        mid.vlak(
          `M${(x + 14 * s).toFixed(1)} ${(d * 0.2).toFixed(1)} h${(26 * s).toFixed(1)} v${(d * 0.2).toFixed(1)} h${(-26 * s).toFixed(1)} Z`,
          aan ? '#8ef0cf' : '#0a1b16',
          aan ? 0.9 : 1,
        );
        if (aan) mid.gloed(x + w / 2, d * 0.3, 11 * s, '#49e0b4', 0.7, 0.3);
        mid.stip(x + w - 7 * s, d * 0.38, 1.4 * s, '#79909a');
      }

      const leuning = d * 0.62;
      voor.streek(`M0 ${leuning.toFixed(1)} H${L.toFixed(1)}`, '#5c7a70', 2.6 * s, 0.9);
      voor.streek(`M0 ${(leuning - 1 * s).toFixed(1)} H${L.toFixed(1)}`, '#9fc2b6', 0.9 * s, 0.6);
      for (let x = R(30, 10); x < L; x += 96 * s) {
        voor.streek(`M${x.toFixed(1)} ${leuning.toFixed(1)} v${(7 * s).toFixed(1)}`, '#3c5950', 1.6 * s);
      }

      const id = zorgVoorGloed('#49e0b4');
      voor.g.append(el('rect', {
        x: 0, y: (d * 0.02).toFixed(1), width: L.toFixed(1), height: (18 * s).toFixed(1),
        fill: `url(#${id})`, opacity: 0.16,
      }));
      voor.streek(`M0 ${(d * 0.06).toFixed(1)} H${L.toFixed(1)}`, '#d6fff0', 1.8 * s, 0.8);

      const ex = L * R(0.42, 0.18);
      voor.vlak(`M${(ex - 11 * s).toFixed(1)} ${(d * 0.1).toFixed(1)} h${(22 * s).toFixed(1)} v${(10 * s).toFixed(1)} h${(-22 * s).toFixed(1)} Z`, '#0e3a2c');
      voor.gloed(ex, d * 0.15, 7 * s, '#49e0b4', 1, 0.6);

      // Een brancard tegen de wand. Hij staat er altijd, en er ligt nooit
      // iemand op.
      const kx = L * R(0.86, 0.66);
      voor.vlak(`M${(kx - 26 * s).toFixed(1)} ${(d * 0.68).toFixed(1)} h${(52 * s).toFixed(1)} v${(5 * s).toFixed(1)} h${(-52 * s).toFixed(1)} Z`, '#9fc2b6');
      voor.vlak(`M${(kx - 22 * s).toFixed(1)} ${(d * 0.73).toFixed(1)} h${(8 * s).toFixed(1)} v${(14 * s).toFixed(1)} h${(-8 * s).toFixed(1)} Z`, '#3c5950');
      voor.vlak(`M${(kx + 14 * s).toFixed(1)} ${(d * 0.73).toFixed(1)} h${(8 * s).toFixed(1)} v${(14 * s).toFixed(1)} h${(-8 * s).toFixed(1)} Z`, '#3c5950');
      voor.stip(kx - 18 * s, d * 0.88, 2.4 * s, '#182f28');
      voor.stip(kx + 18 * s, d * 0.88, 2.4 * s, '#182f28');
      voor.spikkels(n(140), ['#d6fff0'], { y0: 0, y1: d * 0.4, groot: 0.9, halo: 0.2 });
    },
  },

  // ------------------------------------------------------- De Spiegeltoren
  //
  // Een glazen gevel van binnenuit, na elven. De stijlen lopen van boven
  // naar beneden door; daarachter de stad als vlekken licht, en op de
  // vensterbank staat wat er 's avonds staat: een bureaulamp die nog aan
  // is, een scherm in slaapstand, en een plant die het volhoudt.
  kantoor: {
    kern: '#0d0d16', koel: '#040409', warm: '#cdd7ff', textuur: 'strijk', ruw: 0.1, stap: 42,
    gloed: '#8ab4ff',
    verf(b) {
      const { d, L, R, K, n } = b;
      const s = d / 100;
      const ver = b.laag('randver', 0.62);
      const mid = b.laag('randmid');
      const voor = b.laag('randvoor');

      ver.vlak(`M0 0 H${L.toFixed(1)} V${d.toFixed(1)} H0 Z`, '#08080f');

      // De stad achter het glas. Eén op de vijf ramen brandt; meer en het
      // wordt een kerstboom, minder en het is een zwart vlak.
      let x = 0;
      while (x < L) {
        const w = R(74, 30) * s;
        const top = d * R(0.42, 0.1);
        ver.vlak(`M${x.toFixed(1)} ${top.toFixed(1)} h${w.toFixed(1)} V${(d * 0.74).toFixed(1)} h${(-w).toFixed(1)} Z`, K(['#101323', '#0d1120', '#141828']));
        for (let ry = top + 6 * s; ry < d * 0.7; ry += 9 * s) {
          for (let rx = x + 5 * s; rx < x + w - 5 * s; rx += 9 * s) {
            if (R() > 0.22) continue;
            ver.vlak(`M${rx.toFixed(1)} ${ry.toFixed(1)} h${(3.4 * s).toFixed(1)} v${(4.4 * s).toFixed(1)} h${(-3.4 * s).toFixed(1)} Z`, K(['#8ab4ff', '#ffd79a', '#cdd7ff']));
          }
        }
        x += w;
      }
      ver.waas(L * 0.3, d * 0.6, d * 0.9, '#8ab4ff', 0.1);
      ver.waas(L * 0.78, d * 0.55, d * 0.8, '#ffd79a', 0.08);

      for (let sx = R(26, 6); sx < L; sx += 104 * s) {
        mid.vlak(`M${sx.toFixed(1)} 0 h${(3.4 * s).toFixed(1)} V${d.toFixed(1)} h${(-3.4 * s).toFixed(1)} Z`, '#1a1d2c');
        mid.streek(`M${(sx + 3.4 * s).toFixed(1)} 0 V${d.toFixed(1)}`, '#343a52', 0.8 * s, 0.5);
      }
      mid.streek(`M0 ${(d * 0.74).toFixed(1)} H${L.toFixed(1)}`, '#2b3148', 1.6 * s, 0.7);
      // Strijklicht op het glas: schuine vegen die je alleen ziet als je
      // ernaar zoekt, en die het vlak glas maken in plaats van lucht.
      for (let i = 0; i < n(130); i++) {
        const gx = R(L, 0);
        mid.streek(`M${gx.toFixed(1)} ${(d * R(0.6, 0.05)).toFixed(1)} l${(14 * s).toFixed(1)} ${(14 * s).toFixed(1)}`, '#cdd7ff', 0.7 * s, 0.07);
      }

      voor.vlak(`M0 ${(d * 0.76).toFixed(1)} H${L.toFixed(1)} V${d.toFixed(1)} H0 Z`, '#14141f');
      voor.streek(`M0 ${(d * 0.76).toFixed(1)} H${L.toFixed(1)}`, '#3a3f58', 1.2 * s, 0.8);

      // De bureaulamp: het enige warme ding op de hele band.
      const lx = L * R(0.34, 0.14);
      const lamp = voor.rechtop(lx, d * 0.78);
      lamp.streek(`M0 0 V${(-16 * s).toFixed(1)} q0 ${(-9 * s).toFixed(1)} ${(9 * s).toFixed(1)} ${(-11 * s).toFixed(1)}`, '#4a4f68', 1.6 * s);
      lamp.vlak(`M${(2 * s).toFixed(1)} ${(-21 * s).toFixed(1)} h${(14 * s).toFixed(1)} l${(-3 * s).toFixed(1)} ${(-9 * s).toFixed(1)} h${(-8 * s).toFixed(1)} Z`, '#2a2f44');
      lamp.gloed(9 * s, -20 * s, 8 * s, '#ffd79a', 1.1, 0.8);
      lamp.ovaal(0, 0, 8 * s, 2.4 * s, '#2a2f44');

      const mx = L * R(0.74, 0.52);
      const scherm = voor.rechtop(mx, d * 0.78);
      scherm.vlak(`M${(-17 * s).toFixed(1)} ${(-24 * s).toFixed(1)} h${(34 * s).toFixed(1)} v${(19 * s).toFixed(1)} h${(-34 * s).toFixed(1)} Z`, '#191d2e');
      scherm.vlak(`M${(-15 * s).toFixed(1)} ${(-22 * s).toFixed(1)} h${(30 * s).toFixed(1)} v${(15 * s).toFixed(1)} h${(-30 * s).toFixed(1)} Z`, '#0d1120');
      scherm.gloed(10 * s, -14 * s, 2.4 * s, '#8ab4ff', 0.9, 0.7);
      scherm.vlak(`M${(-4 * s).toFixed(1)} ${(-5 * s).toFixed(1)} h${(8 * s).toFixed(1)} v${(5 * s).toFixed(1)} h${(-8 * s).toFixed(1)} Z`, '#191d2e');
      scherm.ovaal(0, 0, 11 * s, 2.4 * s, '#232840');

      const px = L * R(0.94, 0.84);
      const plant = voor.rechtop(px, d * 0.78);
      plant.vlak(`M${(-8 * s).toFixed(1)} 0 h${(16 * s).toFixed(1)} l${(-2.4 * s).toFixed(1)} ${(-13 * s).toFixed(1)} h${(-11.2 * s).toFixed(1)} Z`, '#2e3348');
      for (let i = 0; i < 7; i++) {
        plant.loof(R(5 * s, -5 * s), -14 * s - R(5 * s, 0), R(17 * s, 10 * s), 5 * s, R(330, 200), K(['#2f5a46', '#3c7154', '#24463a']), R(1, 0.7));
      }
      voor.spikkels(n(150), ['#cdd7ff'], { y0: 0, y1: d * 0.7, groot: 0.8, halo: 0.18 });
    },
  },
};

// Geen wereld herkend? Dan het landhuis: donker hout doet nergens pijn.
const STANDAARD = RANDSTIJLEN.landhuis;

export const RANDWERELDEN = Object.keys(RANDSTIJLEN);

// Hoe ver iets over het speelveld mag hangen. Verder dan dit wordt het
// afgesneden, zodat een rank niet tot in het midden van het bord groeit.
const OVERHANG = 44;

// --------------------------------------------------------------- tekenen

let tellerVoorIds = 0;

// Zet de lijst neer. `dikte` is de breedte van de band; het speelveld begint
// daarbinnen.
export function tekenBordrand(svg, { wereld, x0 = 0, y0 = 0, breedte, hoogte, dikte }) {
  const s = RANDSTIJLEN[wereld] ?? STANDAARD;
  zorgVoorPalet();
  const merk = `br${tellerVoorIds++}`;

  const defs = el('defs');
  // De band zelf: donker aan de buitenkant, iets opener naar het bord toe.
  // Dat laatste is wat het speelveld eruit laat komen in plaats van erin
  // laat vallen - een band die overal even donker is maakt een gat.
  const bandverloop = el('linearGradient', { id: `${merk}-band`, x1: '0', y1: '0', x2: '0', y2: '1' });
  bandverloop.append(el('stop', { offset: '0%', 'stop-color': meng(s.kern, s.koel, 0.55) }));
  bandverloop.append(el('stop', { offset: '62%', 'stop-color': s.kern }));
  bandverloop.append(el('stop', { offset: '100%', 'stop-color': meng(s.kern, s.warm, 0.14) }));
  defs.append(bandverloop);
  svg.append(defs);

  const g = el('g', { class: 'bordrand', 'pointer-events': 'none' });

  // De drager: een ring met een golvende binnenkant. Recht is hier verkeerd;
  // zodra de opening een nette rechthoek is, leest de hele lijst als een
  // passe-partout.
  const golf = (lang, amp, zaad) => {
    const rnd = dobbel(zaad);
    const punten = [];
    const stap = Math.max(40, lang / Math.round(lang / 64));
    for (let t = 0; t <= lang + 0.1; t += stap) punten.push([Math.min(t, lang), (rnd() - 0.5) * amp * 2]);
    return punten;
  };
  const binnenB = breedte - dikte * 2;
  const binnenH = hoogte - dikte * 2;
  const amp = Math.min(6.5, dikte * 0.11);
  const zijden = [
    golf(binnenB, amp, `${wereld}-n`),
    golf(binnenH, amp, `${wereld}-o`),
    golf(binnenB, amp, `${wereld}-z`),
    golf(binnenH, amp, `${wereld}-w`),
  ];
  const bx = x0 + dikte;
  const by = y0 + dikte;
  let binnen = `M${bx.toFixed(1)} ${by.toFixed(1)}`;
  for (const [t, w] of zijden[0]) binnen += ` L${(bx + t).toFixed(1)} ${(by + w).toFixed(1)}`;
  for (const [t, w] of zijden[1]) binnen += ` L${(bx + binnenB - w).toFixed(1)} ${(by + t).toFixed(1)}`;
  for (const [t, w] of zijden[2]) binnen += ` L${(bx + binnenB - t).toFixed(1)} ${(by + binnenH - w).toFixed(1)}`;
  for (const [t, w] of zijden[3]) binnen += ` L${(bx + w).toFixed(1)} ${(by + binnenH - t).toFixed(1)}`;
  binnen += ' Z';

  const r = Math.min(16, dikte * 0.3);
  const buiten = `M${(x0 + r).toFixed(1)} ${y0} H${(x0 + breedte - r).toFixed(1)} A${r} ${r} 0 0 1 ${(x0 + breedte).toFixed(1)} ${(y0 + r).toFixed(1)}`
    + ` V${(y0 + hoogte - r).toFixed(1)} A${r} ${r} 0 0 1 ${(x0 + breedte - r).toFixed(1)} ${(y0 + hoogte).toFixed(1)}`
    + ` H${(x0 + r).toFixed(1)} A${r} ${r} 0 0 1 ${x0} ${(y0 + hoogte - r).toFixed(1)}`
    + ` V${(y0 + r).toFixed(1)} A${r} ${r} 0 0 1 ${(x0 + r).toFixed(1)} ${y0} Z`;

  g.append(el('path', { d: `${buiten} ${binnen}`, 'fill-rule': 'evenodd', fill: `url(#${merk}-band)` }));

  // Elke kant krijgt dezelfde schildering, alleen anders gedraaid. De knip
  // is de verstekhoek, doorgetrokken tot over het speelveld, zodat wat
  // overhangt wel ruimte heeft maar niet tot in het midden komt.
  const over = Math.min(OVERHANG, dikte);
  const kanten = [
    ['boven', `translate(${x0} ${y0})`, breedte],
    ['rechts', `translate(${(x0 + breedte).toFixed(1)} ${y0}) rotate(90)`, hoogte],
    ['onder', `translate(${(x0 + breedte).toFixed(1)} ${(y0 + hoogte).toFixed(1)}) rotate(180)`, breedte],
    ['links', `translate(${x0} ${(y0 + hoogte).toFixed(1)}) rotate(270)`, hoogte],
  ];
  for (const [naam, trans, L] of kanten) {
    const knipId = `${merk}-${naam}`;
    const knip = el('clipPath', { id: knipId });
    // De hele band plus wat eroverheen hangt, niet de verstekhoek. Met een
    // verstek sneed de knip precies de hoeken weg, en daar stonden in de
    // handgezette plaat net de dikke stam en de varens. De vier kanten
    // overlappen elkaar nu in de hoeken, en dat is in een plaat eerder
    // winst dan verlies: daar wordt het vanzelf het dichtst.
    knip.append(el('path', {
      d: `M0 0 H${L.toFixed(1)} V${(dikte + over).toFixed(1)} H0 Z`,
    }));
    defs.append(knip);
    const laag = el('g', { transform: trans, 'clip-path': `url(#${knipId})`, class: `randkant rand-${naam}` });
    s.verf(kwast(laag, L, dikte, `${wereld}/${naam}`, naam));
    g.append(laag);
  }

  // De sponning: een donkere schaduw net binnen de opening, zodat het bord
  // in de lijst ligt in plaats van ertegenaan.
  g.append(el('path', {
    d: binnen, fill: 'none', stroke: meng(s.koel, '#000000', 0.4), 'stroke-width': 5, opacity: 0.55,
  }));
  g.append(el('path', {
    d: binnen, fill: 'none', stroke: meng(s.warm, '#ffffff', 0.3), 'stroke-width': 1, opacity: 0.22,
  }));
  // En een lichtrand langs de buitenkant, zodat de lijst zelf ook dikte heeft.
  g.append(el('path', {
    d: buiten, fill: 'none', stroke: meng(s.kern, s.warm, 0.3), 'stroke-width': 1.2, opacity: 0.3,
  }));

  svg.append(g);

}

// ----------------------------------------------------- het licht naar binnen
//
// Wat de lijst het speelveld op werpt. Zonder dit is het een donkere lijst
// met een licht gat erin; hiermee schijnt de lijst naar binnen en ligt het
// bord erin.
//
// Hier hingen eerst zesenveertig losse ornamenten aan: een hangplant, een
// tovenaarshoed, een grafsteen. Ze zijn weg, en dat was de bedoeling. Ze
// werden getekend door de schildermotor - harde omtrek, eigen licht - en
// geplakt op een band die intussen een nacht was geworden. Twee stijlen over
// elkaar heen leest als een sticker, en wat er buiten de lijst uitstak kwam
// op de lichte pagina terecht, waar het helemaal een uitknipsel werd. Alles
// wat ze deden doet de band nu zelf, in zijn eigen licht: de uil zit in het
// woud, de hoed staat boven op de academie, de hand komt uit de catacomben.
export function tekenBordhangers(svg, { wereld, x0 = 0, y0 = 0, breedte, hoogte, dikte }) {
  const s = RANDSTIJLEN[wereld] ?? STANDAARD;
  if (!s.gloed) return;

  const schijn = el('g', { class: 'bordschijn', 'pointer-events': 'none' });
  const id = zorgVoorGloed(s.gloed);
  const rnd = dobbel(`${wereld}-schijn`);
  const langs = (lang) => Math.max(2, Math.round(lang / 210));
  const zet = (x, y, r) => schijn.append(el('circle', {
    cx: x.toFixed(1), cy: y.toFixed(1), r: r.toFixed(1), fill: `url(#${id})`, opacity: 0.2,
  }));
  for (let i = 0; i < langs(breedte); i++) {
    const t = (i + 0.5 + (rnd() - 0.5) * 0.6) / langs(breedte);
    zet(x0 + dikte + t * (breedte - dikte * 2), y0 + dikte, dikte * 1.5);
    zet(x0 + dikte + t * (breedte - dikte * 2), y0 + hoogte - dikte, dikte * 1.3);
  }
  for (let i = 0; i < langs(hoogte); i++) {
    const t = (i + 0.5 + (rnd() - 0.5) * 0.6) / langs(hoogte);
    zet(x0 + dikte, y0 + dikte + t * (hoogte - dikte * 2), dikte * 1.3);
    zet(x0 + breedte - dikte, y0 + dikte + t * (hoogte - dikte * 2), dikte * 1.3);
  }
  svg.append(schijn);
}
