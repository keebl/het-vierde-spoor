// De accountpagina (#/account) en de knop in het menu
// (specs/accounts-and-sync.md, docs/UX.md: "Account, signed out / signed in",
// "Confirm delete", "Account deleted"). Bestaat alleen als accountAan()
// waar is; anders is er geen knop en is #/account een onbekende route
// (criterium 2).

import { el } from './boards.js';
import { PRIVACY, VRAGEN } from '../content/privacy-tekst.js';
import {
  huidigeStatus, laatstBijgewerkt, ingelogdAls, opslagWerkt,
  inloggen, uitloggen, verwijderAccount, synchroniseerNu, GEBEURTENIS,
} from '../sync/sessie.js';

const tijd = (iso) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// m…@gmail.com: genoeg om je eigen adres te herkennen, niet het hele adres
// in beeld voor wie over je schouder meekijkt. Op de accountpagina zelf
// staat het wel voluit.
export function kortAdres(email) {
  const [naam, domein] = String(email).split('@');
  return domein ? `${naam.slice(0, 1)}…@${domein}` : String(email);
}

// ----------------------------------------------------------------- menu

let knop = null;

function werkKnopBij() {
  if (!knop) return;
  const email = ingelogdAls();
  if (email) {
    knop.className = 'accountknop accountknop-letter';
    knop.textContent = email.slice(0, 1).toUpperCase();
    knop.setAttribute('aria-label', `Account van ${kortAdres(email)}`);
    knop.title = 'Account';
  } else {
    knop.className = 'accountknop';
    knop.textContent = 'Inloggen';
    knop.removeAttribute('aria-label');
    knop.removeAttribute('title');
  }
}

// Vóór de themaknop, achteraan de kop. De twee gaan samen in een eigen
// blokje naast het menu: met "Inloggen" erbij paste het menu op een
// telefoon niet meer op één regel (403 px nodig, 343 beschikbaar), en zo
// kunnen ze daar naar de regel van het merk, waar plek over is.
export function hangAccountknopOp(nav, themaknop) {
  knop = el('a', { href: '#/account', 'data-route': 'account' });
  const extra = el('div', { class: 'kop-extra' }, [knop, themaknop]);
  nav.after(extra);
  werkKnopBij();
  addEventListener(GEBEURTENIS, werkKnopBij);
}

// ----------------------------------------------------------------- pagina

const STATUS_TEKST = {
  bezig: 'Even bijwerken…',
  mislukt: 'Nog niet bijgewerkt — we proberen het later opnieuw.',
};

// Wat een eenmalige gebeurtenis was (verwijderd, inloggen mislukt), blijft
// staan tot je de pagina verlaat; daarna is het weer de gewone stand.
let eenmalig = null;
let actief = null;

export function privacyBlok() {
  return el('div', { class: 'prose privacy' }, [
    ...PRIVACY.map(([kop, tekst]) => el('p', {}, [el('b', { text: `${kop} ` }), el('span', { text: tekst })])),
    el('p', { text: VRAGEN }),
  ]);
}

function googleKnop() {
  // Google's eigen "G" (hun huisstijlregels voor een inlogknop); het enige
  // merkteken van buiten op de site.
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  g.setAttribute('viewBox', '0 0 48 48');
  g.setAttribute('width', '20');
  g.setAttribute('height', '20');
  g.setAttribute('aria-hidden', 'true');
  g.innerHTML = '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>';
  const b = el('button', { class: 'btn googleknop', type: 'button' }, [g, el('span', { text: 'Inloggen met Google' })]);
  b.addEventListener('click', async () => {
    b.disabled = true;
    eenmalig = null;
    await inloggen();
    // Gaat het goed, dan zijn we nu al op weg naar Google. Zo niet, dan
    // staat de reden in de status.
    b.disabled = false;
    if (actief) teken(actief);
  });
  return b;
}

function bevestigVerwijderen() {
  return new Promise((klaar) => {
    const nee = el('button', { class: 'btn btn-primary', type: 'button', text: 'Niet verwijderen', autofocus: '' });
    const ja = el('button', { class: 'btn', type: 'button', text: 'Ja, verwijder alles' });
    const d = el('dialog', { class: 'bevestig', 'aria-labelledby': 'bevestig-titel', 'aria-describedby': 'bevestig-tekst' }, [
      el('div', { class: 'bevestig-blad' }, [
        el('h2', { id: 'bevestig-titel', text: 'Account verwijderen?' }),
        el('p', { id: 'bevestig-tekst', text: 'Je account en alles wat erbij bewaard is, worden gewist. De voortgang op dit apparaat blijft.' }),
        el('div', { class: 'knoppen' }, [nee, ja]),
      ]),
    ]);
    const sluit = (antwoord) => { d.close(); d.remove(); klaar(antwoord); };
    nee.addEventListener('click', () => sluit(false));
    ja.addEventListener('click', () => sluit(true));
    // Escape is "nee", net als de knop die de focus heeft.
    d.addEventListener('cancel', (e) => { e.preventDefault(); sluit(false); });
    document.body.append(d);
    d.showModal();
    nee.focus();
  });
}

function teken(mount) {
  const email = ingelogdAls();
  const status = huidigeStatus();
  const kinderen = [el('p', { class: 'eyebrow', text: 'Account' })];

  if (eenmalig === 'verwijderd') {
    kinderen.push(
      el('h1', { text: 'Je account is verwijderd.' }),
      el('p', { class: 'lede', text: 'Op dit apparaat kun je gewoon verder spelen.' }),
      el('p', {}, [el('a', { class: 'btn btn-primary', href: '#/puzzels', text: 'Naar de puzzels' })]),
    );
    mount.replaceChildren(...kinderen.filter(Boolean));
    return;
  }

  kinderen.push(el('h1', { text: 'Jouw account' }));

  if (!email) {
    const melding = eenmalig === 'inlogfout' || status === 'inlogfout' ? 'Inloggen is niet gelukt.'
      : status === 'opslag' || !opslagWerkt() ? 'In deze browser kan inloggen niet bewaard worden.'
        : status === 'verlopen' ? 'Log opnieuw in om bij te werken.'
          : null;
    kinderen.push(
      el('p', { class: 'lede', text: 'Log in met Google, dan staat je spel op al je apparaten: je opgeloste puzzels en je sterren op het pad.' }),
      el('p', { text: 'Je hoeft niet in te loggen om te spelen. Geen reclame, geen mails, we delen niets.' }),
      melding ? el('p', { class: 'note note-bad', role: 'status', text: melding }) : null,
      el('p', { class: 'knoppen' }, [googleKnop()]),
      el('p', { class: 'legend', text: 'Heb je een account van Family Link? Dan moet een ouder de eerste keer even meekijken.' }),
    );
  } else {
    const laatst = laatstBijgewerkt();
    const regel = STATUS_TEKST[status]
      ?? (laatst ? `Bijgewerkt om ${tijd(laatst)}` : STATUS_TEKST.bezig);
    const fout = el('p', { class: 'note note-bad', role: 'alert', text: 'Verwijderen is niet gelukt. Probeer het zo nog eens.', hidden: '' });
    const uit = el('button', { class: 'btn', type: 'button', text: 'Uitloggen' });
    const weg = el('button', { class: 'btn', type: 'button', text: 'Account verwijderen' });
    uit.addEventListener('click', async () => {
      uit.disabled = true;
      await uitloggen();
      teken(mount);
    });
    weg.addEventListener('click', async () => {
      if (!(await bevestigVerwijderen())) return;
      weg.disabled = true;
      try {
        await verwijderAccount();
        eenmalig = 'verwijderd';
      } catch (e) {
        console.warn('verwijderen mislukt:', e?.code || e?.name || 'onbekend');
        fout.hidden = false;
        weg.disabled = false;
        return;
      }
      teken(mount);
    });
    kinderen.push(
      el('p', { class: 'lede' }, [el('span', { text: 'Ingelogd als ' }), el('b', { text: email })]),
      el('p', { class: `accountstatus${status === 'mislukt' ? ' accountstatus-wacht' : ''}`, role: 'status', text: regel }),
      el('div', { class: 'knoppen' }, [uit, weg]),
      el('p', { class: 'legend', text: 'Je voortgang blijft op dit apparaat staan.' }),
      fout,
    );
  }

  kinderen.push(
    el('section', { class: 'section', id: 'privacy' }, [
      el('div', { class: 'section-head' }, [el('h2', { text: 'Wat we bewaren' })]),
      privacyBlok(),
      el('p', {}, [el('a', { href: 'privacy.html', text: 'Dezelfde tekst als losse pagina' })]),
    ]),
  );
  mount.replaceChildren(...kinderen.filter(Boolean));
}

export function renderAccount(mount) {
  actief = mount;
  eenmalig = huidigeStatus() === 'inlogfout' ? 'inlogfout' : null;
  teken(mount);
  // Elke keer dat je de pagina opent even bijwerken: dan klopt de tijd.
  synchroniseerNu();
}

// De status verandert terwijl de pagina openstaat (bezig → bijgewerkt).
addEventListener(GEBEURTENIS, () => {
  if (actief && location.hash === '#/account' && eenmalig !== 'verwijderd') teken(actief);
});
addEventListener('hashchange', () => {
  if (location.hash !== '#/account') { actief = null; eenmalig = null; }
});
