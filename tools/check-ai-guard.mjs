// Toetst het vangnet van de AI-laag: een herschrijving die een eigennaam laat
// vallen of verandert, moet worden afgekeurd. Dit is de enige bescherming
// tegen een AI die de logica stilletjes sloopt, dus hij moet kloppen.

import { keepsNames } from '../src/ai/flavour.js';

const origineel = 'Mevrouw Dufour had een verzilverde aansteker bij zich.';
const namen = ['Mevrouw Dufour', 'een verzilverde aansteker'];

const gevallen = [
  ['stijl herschreven, namen intact', 'Mevrouw Dufour droeg een verzilverde aansteker op zak.', true],
  ['naam vervangen door voornaamwoord', 'Zij droeg een verzilverde aansteker op zak.', false],
  ['voorwerp weggelaten', 'Mevrouw Dufour had iets glimmends bij zich.', false],
  ['naam verbogen', 'Dufour droeg een verzilverde aansteker.', false],
  ['voorwerp ingekort', 'Mevrouw Dufour had de aansteker bij zich.', false],
  ['leeg antwoord', '', false],
  ['geen string', null, false],
  ['ontkenning toegevoegd', 'Mevrouw Dufour had een verzilverde aansteker niet bij zich.', false],
];

// Ontkenningen, getallen en keuzes zijn dragend: die moeten ook overeind blijven.
const extra = [
  ['ontkenning weggehaald', 'De weduwe Stam bevond zich niet in het natte steegje.',
   'De weduwe Stam bevond zich in het natte steegje.', ['De weduwe Stam', 'het natte steegje'], false],
  ['ontkenning behouden', 'De weduwe Stam bevond zich niet in het natte steegje.',
   'De weduwe Stam kwam niet in het natte steegje.', ['De weduwe Stam', 'het natte steegje'], true],
  ['getal veranderd', 'Tussen Vera Kranz en de pianist zit precies 3 uur.',
   'Tussen Vera Kranz en de pianist zit precies 2 uur.', ['Vera Kranz', 'de pianist'], false],
  ['getal behouden', 'Tussen Vera Kranz en de pianist zit precies 3 uur.',
   'Er liggen precies 3 uur tussen Vera Kranz en de pianist.', ['Vera Kranz', 'de pianist'], true],
  ['keuze weggehaald', 'De pianist was er om 22:00 of 23:00.',
   'De pianist was er om 22:00 en 23:00.', ['De pianist', '22:00', '23:00'], false],
];

let fails = 0;
for (const [naam, tekst, verwacht] of gevallen) {
  const uitkomst = keepsNames(origineel, tekst, namen);
  const goed = uitkomst === verwacht;
  if (!goed) fails++;
  console.log(`${goed ? 'ok  ' : 'FOUT'}  ${naam}: ${uitkomst ? 'geaccepteerd' : 'afgekeurd'}`);
}

for (const [naam, orig, tekst, namen, verwacht] of extra) {
  const uitkomst = keepsNames(orig, tekst, namen);
  const goed = uitkomst === verwacht;
  if (!goed) fails++;
  console.log(`${goed ? 'ok  ' : 'FOUT'}  ${naam}: ${uitkomst ? 'geaccepteerd' : 'afgekeurd'}`);
}

const totaal = gevallen.length + extra.length;
console.log(`\n${totaal - fails}/${totaal} goed`);
console.log(
  'Grens van dit vangnet: het bewaakt namen, ontkenning, getallen en of-of.\n' +
  'Een omgedraaide tijdsvolgorde ("eerder dan" -> "later dan") met dezelfde\n' +
  'namen zou er nog doorheen komen. De instructie verbiedt het; bewezen is het\n' +
  'niet. Daarom blijft de generator de bron van de logica, niet de AI.'
);
process.exit(fails ? 1 : 0);
