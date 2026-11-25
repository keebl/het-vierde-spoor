// Router en opstart. Alles draait in de browser: geen server nodig om te
// spelen, geen puzzeldata over de lijn.

import { renderHome } from './ui/home.js';
import { renderLibrary } from './ui/library.js';
import { renderGenerator } from './ui/generator.js';
import { renderUitleg } from './ui/uitleg.js';
import { renderPlayer } from './ui/player.js';
import { buildPuzzle, parsePuzzleId, puzzleId, padInstellingen } from './puzzle.js';
import { renderPad, stapVan, AANTAL_STAPPEN } from './ui/pad.js';
import { padStand, isOpen } from './ui/pad-voortgang.js';
import { bouw, bouwVooruit, SCHATTING, duurTekst } from './ui/bouwer.js';
import { el } from './ui/boards.js';
import { dressUp } from './ai/flavour.js';
import { pasToe as pasThemaToe, hangThemaknopOp } from './ui/thema.js';
import { WORLD_BY_ID } from './content/worlds.js';
// Optionele accounts (specs/accounts-and-sync.md). Zonder schakelaar doet
// dit niets; supabase-js zelf wordt pas geladen als er een sessie is.
import { accountAan } from './sync/config.js';
import { start as startAccount, komtVanInloggen, ingelogdAls, GEBEURTENIS } from './sync/sessie.js';
import { renderAccount, hangAccountknopOp } from './ui/account.js';
// De betaalmuur (specs/paywall-and-android.md). Staat de schakelaar op
// 'uit', dan laat magOpenen alles door en verandert er niets.
import { magOpenen, magPadStap } from './betaalmuur/toegang.js';
import { renderBetaalmuur } from './ui/betaalmuur.js';
import { loadProgress } from './ui/state.js';

const app = document.getElementById('app');

function markNav(route) {
  for (const a of document.querySelectorAll('.nav a, .kop-extra a')) {
    if (a.dataset.route === route) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
}

function showError(message, hint) {
  app.replaceChildren(
    el('h1', { text: 'Dat lukt niet' }),
    el('p', { class: 'lede', text: message }),
    hint ? el('p', {}, [el('a', { class: 'btn', href: '#/', text: 'Terug naar de bibliotheek' })]) : null
  );
}

// Filters staan in de hash (#/puzzels?wereld=noir) zodat een gefilterde
// lijst deelbaar en terug-knop-vriendelijk is.
function leesQuery(path) {
  const vraag = path.indexOf('?');
  if (vraag < 0) return {};
  return Object.fromEntries(new URLSearchParams(path.slice(vraag + 1)));
}

// Welke wereld kleurt de pagina? Dat staat op de body, zodat de hele site
// meeschuift zodra er een zaak openstaat: in het woud is het een nachtbos,
// in Regenstad een natte straat. Buiten een zaak gaat het eraf, want op de
// lijst staan alle werelden naast elkaar en zou een kleur partij kiezen.
export function zetWereldThema(wereldId) {
  if (wereldId) document.body.dataset.wereld = wereldId;
  else delete document.body.dataset.wereld;
  // De kleur van de wereld als los getal, zodat het lichte palet er een
  // vleugje van kan nemen. Zonder dit zou elke wereld een tweede, met de
  // hand geschreven lichtpalet nodig hebben.
  const kleur = wereldId ? WORLD_BY_ID.get(wereldId)?.accent : null;
  if (kleur) document.body.style.setProperty('--wkleur', kleur);
  else document.body.style.removeProperty('--wkleur');
}

// Elke route krijgt een volgnummer. Een bouw die klaar is terwijl je al
// ergens anders bent, ziet dat aan dit nummer (niet aan de hash: een
// substring en een niet-gedecodeerde hash gaven de verkeerde puzzel of
// geen, review fase B).
let routeNr = 0;
let lopendeBouw = null;

// Een puzzel bouwen en spelen: uit de bibliotheek, een gedeelde link of een
// stap op het pad (`pad`, zie renderPlayer).
function openPuzzel(id, settings, nr, pad = null) {
  // Vóór het bouwen: een derde nieuwe puzzel van een niveau bouwt niet
  // eens, de muur staat er meteen.
  const voortgang = (i) => !!loadProgress(i);
  const mag = pad
    ? magPadStap(pad.k, id, { voortgang })
    : magOpenen(id, settings.niveau, { voortgang, ingelogd: accountAan() && !!ingelogdAls() });
  if (!mag) {
    renderBetaalmuur(app, settings.niveau, { padStap: pad?.k ?? null });
    return;
  }
  // Een Reconstructie bouwt in een Web Worker, met een schatting vooraf en
  // een balk die na elke poging oploopt (specs/engine-extension.md stap
  // 10). Tot en met niveau drie is dat zo snel dat er niets te zien is.
  if (settings.mechaniek === 'kamer') {
    const traag = settings.niveau >= 4;
    const balk = el('span', { class: 'bouwbalk-vulling' });
    const stop = el('button', { class: 'btn', type: 'button', text: 'Annuleer' });
    app.replaceChildren(traag
      ? el('div', { class: 'bouwen', 'data-niveau': String(settings.niveau) }, [
        el('p', { class: 'bouwen-kop', text: 'De puzzel wordt gebouwd en nagerekend.' }),
        el('p', { class: 'bouwen-schatting', text: `Op een telefoon duurt dat hooguit ongeveer ${duurTekst(SCHATTING[settings.niveau])}, op een computer meestal korter.` }),
        el('span', { class: 'bouwbalk', role: 'progressbar', 'aria-label': 'Voortgang van het bouwen' }, balk),
        stop,
      ])
      : el('p', { class: 'spinner', text: 'De puzzel wordt gebouwd en nagerekend...' }));
    // De balk volgt de pogingen, maar één poging op zestien bij zestien
    // duurt seconden, en de eerste lukt meestal: dan stond hij stil tot
    // het klaar was. Daarom loopt hij tussendoor mee op de schatting, tot
    // hooguit negentig procent (criterium 22: hij beweegt elke seconde).
    let gemeld = 0;
    const begin = Date.now();
    const teken = () => {
      const geschat = Math.min(0.9, (Date.now() - begin) / 1000 / (SCHATTING[settings.niveau] ?? 10));
      balk.style.width = `${Math.round(Math.max(0.04, gemeld, geschat) * 100)}%`;
    };
    const klok = traag ? setInterval(teken, 500) : null;
    const taak = bouw(settings, {
      opVoortgang: (deel) => { gemeld = Math.min(1, deel); teken(); },
    });
    const stopBouw = () => { clearInterval(klok); taak.afbreken(); };
    taak.data.finally(() => clearInterval(klok)).catch(() => {});
    stop.addEventListener('click', () => { stopBouw(); location.hash = '#/'; });
    // Wie wegnavigeert terwijl er gebouwd wordt: de worker stopt (route()
    // roept lopendeBouw aan bij elke volgende route).
    lopendeBouw = stopBouw;
    taak.data.then((gen) => {
      if (nr !== routeNr) return;
      lopendeBouw = null;
      let puzzle;
      try {
        puzzle = buildPuzzle(settings, { gen });
      } catch (err) {
        // Een bewaard bord dat niet meer past: dan toch zelf bouwen.
        console.warn('bewaard bord paste niet, opnieuw gebouwd', err);
        puzzle = buildPuzzle(settings);
      }
      if (puzzle._mis) console.warn(`bord buiten zijn sjabloon (mis ${puzzle._mis})`, id);
      zetWereldThema(puzzle.world?.id);
      renderPlayer(puzzle, app, { pad });
      // De volgende alvast, op de achtergrond (criterium 24).
      const volgende = app.dataset.volgende;
      if (volgende) bouwVooruit(parsePuzzleId(volgende));
      dressUp(puzzle).then((dressed) => {
        if (dressed.aiUsed && nr === routeNr) {
          zetWereldThema(dressed.world?.id);
          renderPlayer(dressed, app, { pad });
        }
      }).catch((err) => console.error(err));
    }).catch((err) => {
      if (err?.message === 'afgebroken' || nr !== routeNr) return;
      console.error(err);
      // Een bekende wereld en opdracht die niet te bouwen was, is geen
      // verkeerde link; zeg dat dan ook.
      showError(/onbekende/.test(err?.message ?? '')
        ? 'Deze link hoort niet bij een bestaande puzzel. Hij is misschien verouderd of verkeerd overgenomen.'
        : 'Deze puzzel lukte niet om te bouwen. Probeer een andere.', true);
    });
    return;
  }
  // Even laten tekenen voordat we gaan rekenen: bouwen kan een seconde duren.
  app.replaceChildren(el('p', { class: 'spinner', text: 'De puzzel wordt gebouwd en nagerekend...' }));
  setTimeout(() => {
    try {
      const puzzle = buildPuzzle(settings);
      zetWereldThema(puzzle.world?.id);
      renderPlayer(puzzle, app, { pad });
      // De puzzel staat er al en is speelbaar. Daarna kijken we nog of er
      // een mooiere tekst voor is: voor de bibliotheek ligt die klaar in
      // de repo, en staat de AI-laag aan, dan kan hij er een maken. De
      // logica verandert er nooit door - het vangnet laat niets door dat
      // een naam, een ontkenning, een getal of een keuze aantast.
      dressUp(puzzle).then((dressed) => {
        if (dressed.aiUsed && location.hash.includes(id)) {
          zetWereldThema(dressed.world?.id);
          renderPlayer(dressed, app, { pad });
        }
      }).catch((err) => {
        // Mislukt het aankleden, dan blijft de gewone puzzel gewoon staan.
        console.error(err);
      });
    } catch (err) {
      // De technische oorzaak hoort in de console, niet op het scherm.
      console.error(err);
      showError('Deze link hoort niet bij een bestaande puzzel. Hij is misschien verouderd of verkeerd overgenomen.', true);
    }
  }, 30);
}

function route() {
  const nr = ++routeNr;
  lopendeBouw?.();
  lopendeBouw = null;
  const hash = location.hash || '#/';
  const path = hash.slice(2);
  window.scrollTo(0, 0);
  zetWereldThema(null);

  if (path === 'pad' || path.startsWith('pad/')) {
    markNav('pad');
    const k = path === 'pad' ? null : Number(path.slice('pad/'.length));
    const stap = k == null ? null : stapVan(k);
    // Geen of een onbekend nummer: het pad zelf.
    if (!stap) { renderPad(app); return; }
    // Een stap op slot: het pad, met wat er aan de hand is (criterium 4).
    if (!isOpen(padStand(), k)) { renderPad(app, { opSlot: k }); return; }
    const settings = padInstellingen(stap.seed);
    const volgende = stapVan(k + 1);
    openPuzzel(puzzleId(settings), settings, nr, {
      k, aantal: AANTAL_STAPPEN, maat: stap.maat,
      volgendeId: volgende ? puzzleId(padInstellingen(volgende.seed)) : null,
    });
    return;
  }

  if (path.startsWith('puzzel/')) {
    markNav(null);
    const id = decodeURIComponent(path.slice('puzzel/'.length));
    openPuzzel(id, parsePuzzleId(id), nr);
    return;
  }
  if (path === 'maken') { markNav('maken'); renderGenerator(app); return; }
  if (path === 'uitleg') { markNav('uitleg'); renderUitleg(app); return; }
  if (path === 'account' && accountAan()) { markNav('account'); renderAccount(app); return; }
  // De bibliotheek: de vierenzeventig vaste zaken per moeilijkheidsgraad,
  // met onder elk niveau de puzzels die deze browser zelf begonnen is.
  if (path.startsWith('puzzels')) {
    markNav('puzzels');
    renderLibrary(app, leesQuery(path));
    return;
  }
  markNav(null);
  renderHome(app);
}

pasThemaToe();
hangThemaknopOp(document.getElementById('themaknop'));

// Hoe hoog de kop werkelijk is. De namenbalk plakt daaronder vast (zie
// .palet in de opmaak), en een vast getal klopt niet: de kop groeit mee
// met de lettergrootte van het systeem en met de knop erin.
function meetKop() {
  const kop = document.querySelector('header.top');
  if (!kop) return;
  document.documentElement.style.setProperty('--kop-hoogte', `${Math.round(kop.getBoundingClientRect().height)}px`);
}
meetKop();
addEventListener('resize', meetKop);
try {
  new ResizeObserver(meetKop).observe(document.querySelector('header.top'));
} catch {
  /* geen ResizeObserver: dan blijft de gemeten hoogte van het begin staan */
}

if (accountAan()) {
  hangAccountknopOp(document.querySelector('.nav'), document.getElementById('themaknop'));
  // Kwam je net terug van Google, dan eerst het antwoord verwerken: dat
  // staat als ?code= in de adresbalk en moet weg voordat de router kijkt.
  // In elk ander geval wacht de pagina nergens op.
  if (komtVanInloggen()) await startAccount();
  else startAccount().catch((fout) => console.warn('account start mislukt:', fout?.name || 'onbekend'));
  // Bracht een sync nieuws (een puzzel elders opgelost, een ander niveau),
  // dan de lijst of voorpagina opnieuw tekenen. Een open puzzel niet: daar
  // speelt iemand, en een bord dat onder je handen verspringt is erger dan
  // een vinkje dat pas bij de volgende keer verschijnt.
  addEventListener(GEBEURTENIS, (e) => {
    if (e.detail?.veranderd && !location.hash.startsWith('#/puzzel/') && !location.hash.startsWith('#/pad/') && location.hash !== '#/account') route();
  });
}

addEventListener('hashchange', route);
route();
