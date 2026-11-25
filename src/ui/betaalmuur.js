// De betaalmuur (docs/UX.md "Paywall"): komt in plaats van de derde nieuwe
// puzzel van een niveau. Nooit een doodlopende weg (UX-principe): de
// gratis puzzels van dit niveau staan eronder, en er is altijd een weg
// terug naar het begin.

import { el } from './boards.js';
import { parsePuzzleId } from '../puzzle.js';
import { WORLD_BY_ID } from '../content/worlds.js';
import { loadProgress } from './state.js';
import { PRIJS, PAD_GRATIS, gratisVan, puzzelVanDeDag } from '../betaalmuur/toegang.js';
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

// `padStap`: de muur staat voor een stap op het pad (na de gratis stappen),
// niet voor een tegoed dat op is; dan een eigen kop en de weg terug naar het pad.
export function renderBetaalmuur(mount, niveau, { padStap = null } = {}) {
  const ingelogd = accountAan() && !!ingelogdAls();
  const melding = el('p', { class: 'note', role: 'status', hidden: '' });
  const koop = el('button', {
    class: 'btn btn-primary btn-groot',
    type: 'button',
    text: ingelogd ? 'Volledige toegang kopen' : 'Log in om te kopen',
  });
  koop.addEventListener('click', async () => {
    // Inloggen kan al; afrekenen pas als Stripe er is (stap 3 van het plan).
    // Afgewacht, zodat een mislukte login niet als losse fout verdwijnt
    // (SonarCloud, PR #46).
    if (!ingelogd && accountAan()) {
      try {
        await inloggen();
      } catch (fout) {
        console.warn('inloggen mislukt:', fout?.name || 'onbekend');
        melding.textContent = 'Inloggen is niet gelukt.';
        melding.hidden = false;
      }
      return;
    }
    melding.textContent = 'Kopen kan nog niet: dit is de testversie.';
    melding.hidden = false;
  });

  // Niveau 1 tot en met 3 hebben een tegoed dat op is; 4 tot en met 6 zijn
  // wat je koopt (D2, herzien 2026-11-20). Dus twee verschillende koppen.
  const zwaar = niveau >= 4;
  const titel = padStap
    ? `Vanaf stap ${PAD_GRATIS + 1} zit het pad in volledige toegang`
    : zwaar ? `Niveau ${niveau} zit in volledige toegang` : `Je gratis puzzels van niveau ${niveau} zijn op`;
  // Anders bleef de naam van de vorige puzzel in het tabblad staan.
  document.title = `${titel} · Reconstructie`;
  const gratis = gratisVan(niveau);
  // De puzzel van de dag: ingelogd een knop ernaartoe, anders de reden om
  // in te loggen. Nooit de hoofdknop: dat blijft kopen.
  const dag = ingelogd
    ? el('p', {}, [el('a', { class: 'btn', href: `#/puzzel/${puzzelVanDeDag()}`, text: 'Speel de puzzel van de dag' })])
    : el('p', { class: 'legend', text: 'Log in en speel elke dag gratis de puzzel van de dag (niveau 1 tot en met 3).' });
  mount.replaceChildren(...[
    el('h1', { text: titel }),
    el('p', { class: 'lede', text: padStap
      ? `De eerste ${PAD_GRATIS} stappen, van 5 bij 5 en 6 bij 6, zijn gratis voor iedereen.`
      : zwaar
        ? 'Niveau 4, 5 en 6 zijn de moeilijkste. Van niveau 4 kun je er één gratis proberen.'
        : 'Van niveau 1, 2 en 3 zijn er twee gratis.' }),
    el('p', { text: 'Met volledige toegang speel je alle puzzels op elk niveau, en je kunt ze printen. Je betaalt één keer, geen abonnement.' }),
    PRIJS ? el('p', { class: 'prijs', text: PRIJS }) : null,
    el('p', { class: 'knoppen' }, [koop]),
    melding,
    // Wie al kocht, zoekt de weg terug direct onder de knop (ui-review).
    ingelogd ? null : el('p', { class: 'legend', text: 'Al gekocht? Log in met hetzelfde Google-account.' }),
    dag,
    el('p', { class: 'legend', text: 'Ben je jonger dan 16? Vraag het aan een ouder.' }),
    gratis.length ? el('p', { class: 'label eigen-kop', text: 'Je gratis puzzels' }) : null,
    gratis.length ? el('div', { class: 'rows' }, gratis.map(gratisRij)) : null,
    // Rustig, zodat hij niet met de koopknop concurreert (ui-review).
    el('p', {}, [padStap
      ? el('a', { class: 'btn btn-quiet', href: '#/pad', text: 'Naar het pad' })
      : el('a', { class: 'btn btn-quiet', href: '#/puzzels', text: 'Naar de puzzels' })]),
  ].filter(Boolean));
}
