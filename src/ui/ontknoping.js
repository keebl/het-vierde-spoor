// De ontknoping: het blad dat over het bord schuift als je de puzzel hebt
// opgelost.
//
// Tot hier stond er na de laatste figuur alleen een groene regel onder het
// bord: "Opgelost. Het antwoord: Clara." Dat leest als een melding, niet
// als een zaak die je hebt gesloten - en voor de speler voor wie dit spel
// bestaat was dat het grootste gat. Nu komt wie het was groot in beeld,
// met één slotzin die bij de zaak past en een knop naar de volgende.
//
// Een echte <dialog> met showModal: Escape, de focus die in het blad blijft
// en de rest van de pagina die even niet meedoet krijg je dan van de
// browser, en die doet het beter dan wij het zelf zouden schrijven.
//
// Er staat er altijd hooguit één open. De AI-laag tekent een puzzel na het
// aankleden een tweede keer (dressUp in main.js), en een naïeve tweede
// showModal zette dan twee bladen op elkaar, met twee keer confetti.

import { el } from './boards.js';
import { portretElement, tekenMerk } from './personenkunst-geschilderd.js';
import { geslachtVan } from '../content/namen.js';
import { blad, bol, kussen } from './vormen.js';
import { makeRng } from '../engine/rng.js';
import { ZICHTBARE_LEVEL_IDS, LEVELS, KAMER_LEVELS } from '../engine/difficulty.js';
import { nieuwePuzzel } from './volgende.js';

const SVG = 'http://www.w3.org/2000/svg';
const svgEl = (naam, attrs = {}) => {
  const node = document.createElementNS(SVG, naam);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
};

let huidige = null;
// Wie het blad dichtdeed, wil het niet terug zodra de AI-laag dezelfde
// puzzel opnieuw tekent. Wel als je later terugkomt: een andere hash zet
// dit weer op nul.
let geslotenVoor = null;

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    geslotenVoor = null;
    sluitOntknoping();
  });
}

export function sluitOntknoping() {
  if (huidige?.open) huidige.close();
  else huidige?.remove();
  huidige = null;
}

// `opnieuw`: dit is het openen bij het tekenen van een al opgeloste
// puzzel, niet bij het oplossen zelf. Dan geen confetti, en niet terug als
// de speler hem net voor deze puzzel heeft dichtgedaan.
export function openOntknoping(puzzle, { onthuld = false, feest = false, opnieuw = false, volgende, terug } = {}) {
  if (opnieuw && geslotenVoor === puzzle.id) return;
  const vorige = huidige;
  if (vorige) {
    // Stil weghalen: dit is geen sluiten door de speler.
    vorige.dataset.vervangen = '1';
    if (vorige.open) vorige.close();
    vorige.remove();
  }

  const opener = document.activeElement;
  const naam = puzzle.question.answer;
  const index = puzzle.dader;
  const zaak = puzzle.zaak ?? {};
  const kopId = `ontknoping-${Math.random().toString(36).slice(2, 8)}`;

  const dialoog = el('dialog', {
    class: `ontknoping${onthuld ? ' ontknoping-stil' : ''}${feest && !onthuld ? ' ontknoping-feest' : ''}`,
    'aria-labelledby': kopId,
  });

  const portret = portretElement(index, naam.charAt(0).toUpperCase(), 160, geslachtVan(naam));
  portret.setAttribute('class', 'ontknoping-portret');

  // Het merk van de zaak, klein naast het rolwoord: zo zien een moord, een
  // verdwijning en een diefstal er ook in één oogopslag anders uit.
  const merk = svgEl('svg', { viewBox: '0 0 48 48', width: 22, height: 22, 'aria-hidden': 'true', class: 'ontknoping-merk' });
  tekenMerk(merk, { teken: zaak.merk, grootte: 48 });

  const sluit = el('button', { class: 'ontknoping-sluit', type: 'button', 'aria-label': 'Sluiten en het bord bekijken', text: '×' });
  sluit.addEventListener('click', () => dialoog.close());

  const verder = el('a', {
    class: 'btn btn-primary btn-groot ontknoping-verder',
    href: `#/puzzel/${volgende ?? ''}`,
    autofocus: '',
    text: 'Volgende zaak',
  });
  const bekijk = el('button', { class: 'btn ontknoping-bekijk', type: 'button', text: 'Bekijk het bord' });
  bekijk.addEventListener('click', () => dialoog.close());

  const zwaarder = onthuld ? null : zwaarderVoorstel(puzzle);

  const tekst = onthuld
    ? zaak.stil ?? `Dit was ${zaak.antwoordwoord ?? 'het antwoord'}.`
    : zaak.slot ?? '';

  dialoog.append(el('div', { class: 'ontknoping-blad' }, [
    feest && !onthuld ? confetti(puzzle.seed) : null,
    sluit,
    el('p', { class: 'eyebrow ontknoping-kop', text: onthuld ? 'Oplossing bekeken' : 'Zaak gesloten' }),
    el('div', { class: 'ontknoping-schijf' }, [portret]),
    el('h2', { id: kopId, class: 'ontknoping-naam', text: naam }),
    el('p', { class: 'ontknoping-rol' }, [merk, el('span', { text: zaak.antwoordwoord ?? '' })]),
    el('p', { class: 'ontknoping-slot', text: tekst }),
    zwaarder,
    el('div', { class: 'ontknoping-knoppen' }, [verder, bekijk]),
  ]));

  // Een klik naast het blad (op de achtergrond) sluit het ook.
  dialoog.addEventListener('click', (e) => {
    if (e.target === dialoog) dialoog.close();
  });

  dialoog.addEventListener('close', () => {
    const vervangen = dialoog.dataset.vervangen === '1';
    dialoog.remove();
    if (huidige === dialoog) huidige = null;
    if (vervangen) return;
    geslotenVoor = puzzle.id;
    // Terug naar waar je was. Die knop is vaak al vervangen, want het bord
    // tekent zichzelf na elke klik opnieuw; dan naar de knop Ontknoping.
    const doel = opener?.isConnected && opener !== document.body ? opener : terug?.();
    doel?.focus?.();
  });

  document.body.append(dialoog);
  huidige = dialoog;
  dialoog.showModal();
  verder.focus();
  return dialoog;
}

// Een handvol snippers in de felle kleuren, met de hand getekend zoals de
// vlekken op de achtergrond: blaadjes, bolletjes en kussentjes, nooit een
// strak vierkant. Waar ze heen vliegen volgt uit de seed, zodat dezelfde
// puzzel er elke keer hetzelfde uitziet. Een eigen trekking, dus geen
// enkele puzzeltekst verschuift erdoor.
function confetti(seed) {
  const rng = makeRng(`${seed}:confetti`);
  const svg = svgEl('svg', { class: 'ontknoping-confetti', viewBox: '-100 -100 200 200', 'aria-hidden': 'true' });
  const aantal = 16;
  for (let i = 0; i < aantal; i++) {
    const hoek = (i / aantal) * Math.PI * 2 + (rng() - 0.5) * 0.5;
    const ver = 55 + rng() * 40;
    const soort = i % 3;
    const d = soort === 0
      ? blad(0, 0, 9 + rng() * 4, 3.5, rng() * 360)
      : soort === 1
        ? bol(0, 0, 3 + rng() * 2)
        : kussen(-5, -3.5, 10, 7);
    const pad = svgEl('path', { d, class: `snipper pop-${(i % 6) + 1}` });
    pad.style.setProperty('--dx', `${(Math.cos(hoek) * ver).toFixed(1)}px`);
    pad.style.setProperty('--dy', `${(Math.sin(hoek) * ver - 10).toFixed(1)}px`);
    pad.style.setProperty('--draai', `${Math.round((rng() - 0.5) * 540)}deg`);
    pad.style.setProperty('--wacht', `${Math.round(rng() * 160)}ms`);
    svg.append(pad);
  }
  return svg;
}

// Zelf opgelost? Dan een voorstel om een niveau zwaarder te proberen
// (Guus, 2026-11-18). Niet na Oplossing: wie de oplossing liet invullen,
// is niet klaar voor zwaarder. En niet op het zwaarste niveau. "Volgende
// zaak" blijft de grote knop; dit is een uitnodiging, geen duw.
function zwaarderVoorstel(puzzle) {
  const niveau = Number(puzzle.niveau ?? puzzle.settings?.niveau);
  const hoger = ZICHTBARE_LEVEL_IDS.find((l) => l > niveau);
  if (!niveau || hoger == null) return null;
  const k = KAMER_LEVELS[hoger];
  return el('p', { class: 'ontknoping-zwaarder' }, [
    el('span', { text: 'Ging dat goed? ' }),
    el('a', {
      href: `#/puzzel/${nieuwePuzzel(hoger)}`,
      text: `Probeer niveau ${hoger} · ${LEVELS[hoger].label} (${k.n} bij ${k.n})`,
    }),
  ]);
}
