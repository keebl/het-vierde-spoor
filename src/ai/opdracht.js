// Wat we de AI precies vragen, en wat we van het antwoord accepteren.
//
// Dit staat apart van de server en van de browser, omdat beide kanten er
// hetzelfde mee moeten doen: de lokale server en de Worker die de live site
// bedient, bouwen de vraag hier, en keuren het antwoord hier.
//
// De kern van de beveiliging zit in bouwVraag: de vraag aan het model wordt
// volledig opgebouwd uit een puzzel die de server ZELF heeft uitgerekend. Van
// buiten komt alleen een puzzel-id binnen - een reeks als
// "dader.noir.grid.3.kade-1". Er is dus geen enkele weg waarlangs iemand
// eigen tekst het model in praat: wie dit eindpunt aanroept kan hooguit een
// puzzeltekst laten herschrijven die wij toch al hadden kunnen maken.

export const SYSTEEM = `Je herschrijft de stijl van Nederlandse deductiepuzzels. Je verandert NOOIT de logica.

Harde regels:
1. Elke eigennaam uit het origineel komt woordelijk terug in je herschrijving. Niet verbuigen, niet afkorten, niet vervangen door een voornaamwoord.
2. Je verandert geen enkele logische relatie: wat samengaat blijft samengaan, een ontkenning blijft een ontkenning, een tijdsorde blijft dezelfde kant op, een aantal blijft hetzelfde getal.
3. Je voegt geen feiten toe en laat geen feiten weg. Geen enkele hint erbij.
4. Je levert exact evenveel aanwijzingen als je krijgt, in dezelfde volgorde, met hetzelfde nummer.
5. Je houdt het kort: een aanwijzing is een zin, maximaal twee.
5a. Aanwijzingen die in het origineel dezelfde zinsbouw hebben, houden die ook
   na jouw herschrijving hetzelfde. Dus niet de ene keer "stond in", de
   andere keer "zat in" en de derde keer "bevond zich in": in een
   logicapuzzel gaat een puzzelaar dan zoeken naar een verschil dat er niet
   is. Kies per soort aanwijzing één formulering en houd die vol.
6. De inleiding eindigt NIET met de vraag aan de speler. Die vraag staat
   elders op de pagina; herhaal hem niet.

Antwoord uitsluitend met JSON, zonder uitleg eromheen:
{"intro": "...", "aanwijzingen": [{"n": 1, "tekst": "..."}]}`;

// De vraag aan het model, volledig opgebouwd uit de puzzel zelf.
export function bouwVraag(puzzle) {
  return [
    `Wereld: ${puzzle.world.name}`,
    `Opdracht: ${puzzle.opdracht.name}`,
    `Vraag aan de speler: ${puzzle.question.text}`,
    '',
    `Inleiding:\n${puzzle.intro}`,
    '',
    'Aanwijzingen (de namen tussen rechte haken moeten woordelijk terugkomen):',
    ...puzzle.clues.map((c) => `${c.n}. ${c.text}   [${(c.names ?? []).join(' | ')}]`),
  ].join('\n');
}

// ------------------------------------------------------------ het vangnet

// De dragende delen van een aanwijzing, los van de stijl:
//   - de eigennamen            (wie en wat er genoemd wordt)
//   - de ontkenning            ("niet"/"geen" omdraaien keert de betekenis om)
//   - de getallen              ("precies 3 uur" mag geen 2 worden)
//   - het of-of                (een keuze mag geen bewering worden)
// Blijft een van die vier niet staan, dan is het geen herschrijving meer
// maar een andere aanwijzing, en gebruiken we het origineel.
const heeftOntkenning = (t) => /\b(niet|geen|nooit)\b/i.test(t);
const getallen = (t) => (t.match(/\d+/g) ?? []).sort().join(',');
const heeftKeuze = (t) => /\bof\b/i.test(t);

export function keepsNames(original, rewritten, names) {
  if (typeof rewritten !== 'string' || rewritten.length < 4) return false;
  // Woordelijk, maar niet letterlijk op de hoofdletter: een naam die vooraan
  // in de zin komt te staan krijgt er een. Daar struikelde dit vangnet eerst
  // over, en keurde het goede herschrijvingen af - acht procent van alles.
  const klein = rewritten.toLowerCase();
  if (!names.every((name) => klein.includes(name.toLowerCase()))) return false;
  if (heeftOntkenning(original) !== heeftOntkenning(rewritten)) return false;
  if (getallen(original) !== getallen(rewritten)) return false;
  if (heeftKeuze(original) !== heeftKeuze(rewritten)) return false;
  return true;
}

// Het antwoord van het model terugbrengen tot wat we durven serveren: een
// inleiding en per aanwijzing of de herschrijving mag of niet. Wat niet door
// het vangnet komt, krijgt de oorspronkelijke zin terug.
export function leesAntwoord(puzzle, tekst) {
  let data;
  try {
    const json = tekst.slice(tekst.indexOf('{'), tekst.lastIndexOf('}') + 1);
    data = JSON.parse(json);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;

  const uit = { intro: puzzle.intro, aanwijzingen: [], gehouden: 0, afgekeurd: 0 };
  if (typeof data.intro === 'string' && data.intro.length > 20) uit.intro = data.intro.trim();

  const perNummer = new Map(
    (Array.isArray(data.aanwijzingen) ? data.aanwijzingen : [])
      .filter((a) => a && typeof a.tekst === 'string')
      .map((a) => [Number(a.n), a.tekst.trim()])
  );

  for (const c of puzzle.clues) {
    const voorstel = perNummer.get(c.n);
    if (voorstel && keepsNames(c.text, voorstel, c.names ?? [])) {
      uit.aanwijzingen.push({ n: c.n, tekst: voorstel });
      uit.gehouden++;
    } else {
      uit.aanwijzingen.push({ n: c.n, tekst: c.text });
      if (voorstel) uit.afgekeurd++;
    }
  }
  return uit;
}
