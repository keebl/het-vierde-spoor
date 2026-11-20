// Meet het ritme van een pagina zoals je hem ziet: blokken die er hetzelfde
// uitzien en direct onder of naast elkaar staan, moeten even ver uit elkaar
// staan, en die afstand moet op de schaal liggen (4, 8, 12, 16, 24, 32, 48,
// 72; specs/spacing-rhythm.md).
//
// Waarom gemeten en niet gelezen: Guus zag op 2026-11-19 twee keer met het
// blote oog wat geen toets zag. Het klepje Aanwijzingen stond 64 px onder
// de klepjes die onderling 24 uit elkaar stonden: 48 sectie-afstand plus
// een vergeten marge van 16 op een ander blok. check-afstanden leest alleen
// getypte waarden in de css; zo'n optelsom ziet alleen de browser.
//
// "Ziet er hetzelfde uit" is letterlijk bedoeld: zelfde rand, hoeken,
// achtergrond en schaduw, en zelfde breedte (onder elkaar) of hoogte (naast
// elkaar). Zo telt het klepje met de regels mee met de klepjes eromheen,
// ook al is het een ander element in een ander blok. "Direct" betekent: er
// staat niets zichtbaars tussen; een kop tussen twee rijen kaarten maakt er
// twee groepen van.
//
// Plain script zonder import, zodat hetzelfde bestand in de browser draait
// (plak het in de console of het browserpaneel, dan `meetRitme()`) en via
// tools/check-ritme.mjs in een headless browser.

function meetRitme() {
  const SCHAAL = [4, 8, 12, 16, 24, 32, 48, 72];
  const MARGE = 1.5; // afronding van subpixels
  const doorzichtig = (k) => !k || k === 'transparent' || /rgba\(.*,\s*0\)$/.test(k);

  const alles = [...document.body.querySelectorAll('*')].filter((el) => {
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') return false;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) return false;
    // Wat over de pagina zweeft (de kop, de zwevende knop, een plakkende
    // balk) staat niet in het ritme van de pagina eronder.
    for (let p = el; p && p !== document.body; p = p.parentElement) {
      const pos = getComputedStyle(p).position;
      if (pos === 'fixed' || pos === 'sticky') return false;
    }
    // De inhoud van een dichtgeklapt klepje geeft Chrome nog een vak, al
    // zie je hem niet; anders stond die tussen elk paar klepjes in de weg.
    for (let kind = el, p = el.parentElement; p; kind = p, p = p.parentElement) {
      if (p.tagName === 'DETAILS' && !p.open && kind.tagName !== 'SUMMARY') return false;
    }
    return true;
  });

  const vak = new Map(alles.map((el) => {
    const r = el.getBoundingClientRect();
    return [el, { top: r.top + scrollY, bottom: r.bottom + scrollY, left: r.left + scrollX, right: r.right + scrollX, width: r.width, height: r.height }];
  }));

  const uiterlijk = (el) => {
    if (!(el instanceof HTMLElement)) return null;
    const cs = getComputedStyle(el);
    const rand = parseFloat(cs.borderTopWidth) > 0 && !doorzichtig(cs.borderTopColor);
    const vlak = !doorzichtig(cs.backgroundColor) || cs.backgroundImage !== 'none';
    const schaduw = cs.boxShadow !== 'none';
    if (!rand && !vlak && !schaduw) return null;
    return [cs.borderTopWidth, cs.borderTopColor, cs.borderRadius, cs.backgroundColor,
      cs.backgroundImage.slice(0, 80), cs.boxShadow].join('|');
  };

  const naam = (el) => {
    const tekst = (el.innerText ?? '').trim().split('\n')[0].slice(0, 32);
    return tekst ? `"${tekst}"` : `<${el.tagName.toLowerCase()} class="${el.className}">`;
  };

  // Staat er iets zichtbaars in de strook tussen a en b? Wat a of b bevat
  // (hun blokken) of erin zit, telt niet.
  const ertussen = (a, b, onder) => {
    const A = vak.get(a), B = vak.get(b);
    const strook = onder
      ? { top: A.bottom, bottom: B.top, left: Math.max(A.left, B.left), right: Math.min(A.right, B.right) }
      : { left: A.right, right: B.left, top: Math.max(A.top, B.top), bottom: Math.min(A.bottom, B.bottom) };
    return alles.some((e) => {
      if (e === a || e === b || e.contains(a) || e.contains(b) || a.contains(e) || b.contains(e)) return false;
      const E = vak.get(e);
      return E.top < strook.bottom - MARGE && E.bottom > strook.top + MARGE
        && E.left < strook.right - MARGE && E.right > strook.left + MARGE;
    });
  };

  const groepen = new Map();
  for (const el of alles) {
    const u = uiterlijk(el);
    if (!u) continue;
    if (!groepen.has(u)) groepen.set(u, []);
    groepen.get(u).push(el);
  }

  const paren = [];
  for (const leden of groepen.values()) {
    if (leden.length < 2) continue;
    for (const onder of [true, false]) {
      for (const a of leden) {
        const A = vak.get(a);
        let beste = null;
        for (const b of leden) {
          if (b === a) continue;
          const B = vak.get(b);
          if (onder) {
            if (Math.abs(A.width - B.width) > MARGE) continue;
            const overlap = Math.min(A.right, B.right) - Math.max(A.left, B.left);
            if (overlap < A.width / 2 || B.top < A.bottom - MARGE) continue;
            if (!beste || B.top < vak.get(beste).top) beste = b;
          } else {
            if (Math.abs(A.height - B.height) > MARGE) continue;
            const overlap = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
            if (overlap < A.height / 2 || B.left < A.right - MARGE) continue;
            if (!beste || B.left < vak.get(beste).left) beste = b;
          }
        }
        if (!beste || ertussen(a, beste, onder)) continue;
        const B = vak.get(beste);
        const afstand = Math.round((onder ? B.top - A.bottom : B.left - A.right) * 10) / 10;
        paren.push({ a, b: beste, onder, afstand, groep: leden });
      }
    }
  }

  const fouten = [];
  for (const p of paren) {
    if (!SCHAAL.some((s) => Math.abs(p.afstand - s) <= MARGE)) {
      fouten.push(`NIET OP DE SCHAAL  ${p.afstand} px ${p.onder ? 'onder' : 'naast'} elkaar: ${naam(p.a)} en ${naam(p.b)}`);
    }
  }
  // Gelijk per groep en richting: wie er hetzelfde uitzien, staan even ver
  // uit elkaar. De meest voorkomende afstand is de norm; wat ervan afwijkt
  // wordt gemeld.
  const perGroep = new Map();
  for (const p of paren) {
    const k = `${[...groepen.values()].indexOf(p.groep)}:${p.onder}`;
    if (!perGroep.has(k)) perGroep.set(k, []);
    perGroep.get(k).push(p);
  }
  for (const lijst of perGroep.values()) {
    if (lijst.length < 2) continue;
    const telling = new Map();
    for (const p of lijst) telling.set(Math.round(p.afstand), (telling.get(Math.round(p.afstand)) ?? 0) + 1);
    const norm = [...telling.entries()].sort((x, y) => y[1] - x[1] || x[0] - y[0])[0][0];
    for (const p of lijst) {
      if (Math.abs(p.afstand - norm) > MARGE) {
        fouten.push(`ONGELIJK  ${p.afstand} px ${p.onder ? 'onder' : 'naast'} elkaar waar de rest ${norm} heeft: ${naam(p.a)} en ${naam(p.b)}`);
      }
    }
  }
  return { paren: paren.length, fouten: [...new Set(fouten)] };
}
