// Router en opstart. Alles draait in de browser: geen server nodig om te
// spelen, geen puzzeldata over de lijn.

import { renderHome } from './ui/home.js';
import { renderLibrary } from './ui/library.js';
import { renderGenerator } from './ui/generator.js';
import { renderUitleg } from './ui/uitleg.js';
import { renderPlayer } from './ui/player.js';
import { buildPuzzle, parsePuzzleId } from './puzzle.js';
import { el } from './ui/boards.js';
import { dressUp } from './ai/flavour.js';
import { pasToe as pasThemaToe, hangThemaknopOp } from './ui/thema.js';
import { WORLD_BY_ID } from './content/worlds.js';

const app = document.getElementById('app');

function markNav(route) {
  for (const a of document.querySelectorAll('.nav a')) {
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

function route() {
  const hash = location.hash || '#/';
  const path = hash.slice(2);
  window.scrollTo(0, 0);
  zetWereldThema(null);

  if (path.startsWith('puzzel/')) {
    markNav(null);
    const id = decodeURIComponent(path.slice('puzzel/'.length));
    // Even laten tekenen voordat we gaan rekenen: bouwen kan een seconde duren.
    app.replaceChildren(el('p', { class: 'spinner', text: 'De puzzel wordt gebouwd en nagerekend...' }));
    setTimeout(() => {
      try {
        const puzzle = buildPuzzle(parsePuzzleId(id));
        zetWereldThema(puzzle.world?.id);
        renderPlayer(puzzle, app);
        // De puzzel staat er al en is speelbaar. Daarna kijken we nog of er
        // een mooiere tekst voor is: voor de bibliotheek ligt die klaar in
        // de repo, en staat de AI-laag aan, dan kan hij er een maken. De
        // logica verandert er nooit door - het vangnet laat niets door dat
        // een naam, een ontkenning, een getal of een keuze aantast.
        dressUp(puzzle).then((dressed) => {
          if (dressed.aiUsed && location.hash.includes(id)) {
            zetWereldThema(dressed.world?.id);
            renderPlayer(dressed, app);
          }
        });
      } catch (err) {
        // De technische oorzaak hoort in de console, niet op het scherm.
        console.error(err);
        showError('Deze link hoort niet bij een bestaande puzzel. Hij is misschien verouderd of verkeerd overgenomen.', true);
      }
    }, 30);
    return;
  }

  if (path === 'maken') { markNav('maken'); renderGenerator(app); return; }
  if (path === 'uitleg') { markNav('uitleg'); renderUitleg(app); return; }
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

addEventListener('hashchange', route);
route();
