// Wat we bewaren, in woorden die een kind snapt (specs/accounts-and-sync.md,
// "Data and privacy"; docs/UX.md, scherm "Privacy"). Dezelfde tekst staat
// in privacy.html, dat zonder script moet werken omdat Google's
// toestemmingsscherm ernaar linkt. Verander je hier iets, verander het daar
// ook.

// Waar je met vragen terechtkunt (Guus, 2026-11-18). Het adres stuurt via
// Cloudflare Email Routing door; dat moet ingesteld zijn voordat inloggen
// aangaat (docs/accounts-go-live.md). Leeg = alleen "vraag het de maker".
export const CONTACT = 'privacy@reconstructie.app';

export const PRIVACY = [
  ['Zonder account:', 'niets. Je voortgang staat alleen in deze browser.'],
  ['Met een account:', 'je e-mailadres van Google en welke puzzels je hebt opgelost of bekeken, je sterren, je niveau en twee instellingen. Alleen om dat op al je apparaten te laten zien. Een half bord (je kruisjes, figuren en schetsletters) blijft op het apparaat waar je speelt.'],
  ['Niet:', 'geen reclame, geen mails, geen bijhouden wat je doet, en we delen niets met anderen.'],
  ['Waar:', 'bij Supabase, in Parijs. Google regelt het inloggen.'],
  ['Hoe lang:', 'tot je je account verwijdert. Dat kan zelf, op de accountpagina. Dan wordt alles gewist; wat er op je eigen apparaat staat, blijft daar.'],
  ['Kinderen met Family Link:', 'een ouder geeft de eerste keer toestemming, en kan die later weer intrekken in de Family Link-app.'],
  ['Wie:', 'Guus, de maker van Reconstructie, ingeschreven bij de KvK. Hij is verantwoordelijk voor wat hier bewaard wordt.'],
];

export const VRAGEN = CONTACT
  ? `Vragen? Mail ${CONTACT}.`
  : 'Vragen? Vraag het de maker van Reconstructie.';
