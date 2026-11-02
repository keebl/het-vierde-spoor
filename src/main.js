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

function route() {
  const hash = location.hash || '#/';
  const path = hash.slice(2);
  window.scrollTo(0, 0);

  if (path.startsWith('puzzel/')) {
    markNav(null);
    const id = decodeURIComponent(path.slice('puzzel/'.length));
    // Even laten tekenen voordat we gaan rekenen: bouwen kan een seconde duren.
    app.replaceChildren(el('p', { class: 'spinner', text: 'De puzzel wordt gebouwd en nagerekend...' }));
    setTimeout(() => {
      try {
        const puzzle = buildPuzzle(parsePuzzleId(id));
        renderPlayer(puzzle, app);
        // De puzzel staat er al en is speelbaar. Daarna kijken we nog of er
        // een mooiere tekst voor is: voor de bibliotheek ligt die klaar in
        // de repo, en staat de AI-laag aan, dan kan hij er een maken. De
        // logica verandert er nooit door - het vangnet laat niets door dat
        // een naam, een ontkenning, een getal of een keuze aantast.
        dressUp(puzzle).then((dressed) => {
          if (dressed.aiUsed && location.hash.includes(id)) renderPlayer(dressed, app);
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
  if (path.startsWith('puzzels')) {
    markNav('puzzels');
    renderLibrary(app, leesQuery(path));
    return;
  }
  markNav(null);
  renderHome(app);
}

addEventListener('hashchange', route);
route();
