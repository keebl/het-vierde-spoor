// De betaalmuur (docs/UX.md "Paywall"): komt in plaats van de derde nieuwe
// puzzel van een niveau. Nooit een doodlopende weg (UX-principe): de
// gratis puzzels van dit niveau staan eronder, en er is altijd een weg
// terug naar het begin.

import { el } from './boards.js';
import { parsePuzzleId } from '../puzzle.js';
import { WORLD_BY_ID } from '../content/worlds.js';
import { loadProgress } from './state.js';
import { PRIJS, gratisVan } from '../betaalmuur/toegang.js';
import { accountAan } from '../sync/config.js';
import { ingelogdAls, inloggen } from '../sync/sessie.js';

// Net als een zelf begonnen puzzel in de bibliotheek: decor, titel en hoe
// ver je bent. Zonder tweede regel stond de naam bovenaan een lege rij.
function gratisRij(id) {
  const p = loadProgress(id);
  const wereld = WORLD_BY_ID.get(parsePuzzleId(id).wereld);
  const merk = p?.solved ? '✓ opgelost' : p?.onthuld ? 'oplossing bekeken' : p ? 'mee bezig' : 'nog niet begonnen';
  return el('a', { class: 'row-item plain', href: `#/puzzel/${id}` }, [
    el('span', { class: 'row-body' }, [
      el('span', { class: 'row-title', text: `${wereld?.icon ?? ''} ${wereld?.name ?? 'Onbekend decor'}`.trim() }),
      el('span', { class: 'row-sub', text: p?.titel || 'Gratis puzzel' }),
    ]),
    el('span', { class: 'row-meta' }, [el('span', { class: p?.solved ? 'done-mark' : 'bekeken-mark', text: merk })]),
  ]);
}

export function renderBetaalmuur(mount, niveau) {
  const ingelogd = accountAan() && !!ingelogdAls();
  const melding = el('p', { class: 'note', role: 'status', hidden: '' });
  const koop = el('button', {
    class: 'btn btn-primary btn-groot',
    type: 'button',
    text: ingelogd ? 'Volledige toegang kopen' : 'Log in om te kopen',
  });
  koop.addEventListener('click', () => {
    // Inloggen kan al; afrekenen pas als Stripe er is (stap 3 van het plan).
    if (!ingelogd && accountAan()) {
      inloggen();
      return;
    }
    melding.textContent = 'Kopen kan nog niet: dit is de testversie.';
    melding.hidden = false;
  });

  // Anders bleef de naam van de vorige puzzel in het tabblad staan.
  document.title = `Meer puzzels op niveau ${niveau} · Reconstructie`;
  const gratis = gratisVan(niveau);
  mount.replaceChildren(...[
    el('h1', { text: `Meer puzzels op niveau ${niveau}` }),
    el('p', { class: 'lede', text: `Van elk niveau zijn twee puzzels gratis. Die van niveau ${niveau} heb je gespeeld.` }),
    el('p', { text: 'Met volledige toegang speel je alle puzzels op elk niveau, en je kunt ze printen. Je betaalt één keer, geen abonnement.' }),
    PRIJS ? el('p', { class: 'prijs', text: `${PRIJS}, eenmalig` }) : null,
    el('p', { class: 'knoppen' }, [koop]),
    melding,
    el('p', { class: 'legend', text: 'Ben je jonger dan 16? Vraag het een ouder.' }),
    ingelogd ? null : el('p', { class: 'legend', text: 'Al gekocht? Log in met hetzelfde Google-account.' }),
    gratis.length ? el('p', { class: 'label eigen-kop', text: `Je gratis puzzels van niveau ${niveau}` }) : null,
    gratis.length ? el('div', { class: 'rows' }, gratis.map(gratisRij)) : null,
    el('p', {}, [el('a', { class: 'btn', href: '#/', text: 'Naar het begin' })]),
  ].filter(Boolean));
}
