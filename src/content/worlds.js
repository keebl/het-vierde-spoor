import { telwoord } from './woorden.js';

// Werelden leveren uitsluitend woorden en sfeer. De logica weet hier niets
// van: voeg een wereld toe en je krijgt gratis alle opdrachten, alle
// mechanieken en alle niveaus erbij.

// De zinnen over een plattegrond. "Tussen A en B" in plaats van "A ligt van
// B", want de ene kant kan al op een werkwoord eindigen: "waar de envelop
// ligt ligt precies twee deuren van..." las niet.
const deuren = {
  adj: (a, b) => `${a} grenst aan ${b}.`,
  notAdj: (a, b) => `${a} grenst niet aan ${b}.`,
  hops: (a, b, d) => (d === 1
    ? `Tussen ${a} en ${b} zit precies één deur.`
    : `Tussen ${a} en ${b} zitten precies ${telwoord(d)} deuren.`),
  degree: (a, d) =>
    d === 1
      ? `${a} bevindt zich in een doodlopende ruimte.`
      : `${a} bevindt zich in een ruimte met ${telwoord(d)} uitgangen.`,
};

const paden = {
  adj: (a, b) => `${a} ligt aan hetzelfde pad als ${b}.`,
  notAdj: (a, b) => `${a} ligt niet aan hetzelfde pad als ${b}.`,
  hops: (a, b, d) => (d === 1
    ? `Tussen ${a} en ${b} ligt precies één pad.`
    : `Tussen ${a} en ${b} liggen precies ${telwoord(d)} paden.`),
  degree: (a, d) =>
    d === 1
      ? `${a} ligt aan een pad dat doodloopt.`
      : `${a} ligt op een kruising van ${telwoord(d)} paden.`,
};

// victims    - de rol van het slachtoffer, voor de inleiding van het
//               kruisverhoor en de rondgang: "de havenmeester werd gevonden".
// sameRoom - hoe je zegt dat twee dingen bij elkaar zijn, mét voorzetsel:
//               "in dezelfde kamer als", maar "op dezelfde plek als" in het
//               woud. Zonder dat werd het "in dezelfde plek".
// randZin / hoekZin - de buitenrand van het speurdokubord in woorden. Een
//               bos heeft geen buitenmuur, een grafkelder geen gevel.
// tijdVoorzetsel - hoe een tijdstip in een zin staat: "om 22:00", maar
//               "tijdens de tweede wacht" en "in het derde kwartier".
// plekWoord - hoe je in een zin naar een ruimte verwijst: "de kamer van
//               Hendrik", "de module van Dmitri". Zonder zo'n woord werd het
//               "waar Hendrik is", en dan botst dat met het werkwoord dat er
//               achteraan komt.
// rollen    - wat het slachtoffer wás, in twee smaken. De inleiding van een
//               speurdoku zegt nu wie er dood is én wat hij deed, en dan
//               moet dat wel bij elkaar passen: "Marieke is vermoord. De
//               buurman van nummer zes werd gevonden" stond er anders. De
//               oude `victims` blijft voor de andere speltypes; die noemen
//               geen naam, dus daar botst niets.
// slachtoffers - het slachtoffer als figuur op het speurdoku-bord. Daar staat
//               hij tussen de verdachten op het bord, met zijn beginletter op
//               een penning, dus hij heeft een eigen naam nodig met een
//               beginletter die geen van de verdachten al heeft. Vandaar M, N
//               en O: de verdachten gaan van A tot L.

export const WORLDS = [
  {
    id: 'noir',
    name: 'Regenstad',
    icon: '🌧',
    accent: '#7fb2e5',
    blurb: 'Natte straten, te veel neon, en niemand die de waarheid in één keer vertelt.',
    timeUnit: { one: 'uur', many: 'uur' },
    tijdVoorzetsel: 'om',
    sameRoom: 'in dezelfde ruimte als',
    randZin: 'tegen de buitenmuur',
    hoekZin: 'in een hoek van het gebouw',
    roomWord: 'gelegenheid',
    plekWoord: 'plek',
    map: deuren,
    victims: ['de havenmeester', 'de nachtportier', 'de kroegbaas'],
    slachtoffers: ['Max', 'Nora', 'Otto', 'Mees', 'Marius', 'Nelly', 'Netty', 'Olga', 'Oscar'],
    rollen: { m: ['de havenmeester', 'de nachtportier', 'de kroegbaas'], v: ['de waardin', 'de nachtzuster', 'de brugwachtster'] },
    lead: 'De regen kwam die nacht met bakken naar beneden, en niemand hoorde iets boven het water uit.',
    reconLead: 'Van die nacht is alleen het halve logboek van de brugwachter over.',
    findLead: 'Ergens in dit blok ligt het bewijs dat de hele zaak omgooit. Je hebt een nacht.',
    assignLead: 'Getuigen, verhalen, en een bureau vol spullen waarvan niemand meer weet van wie ze zijn.',
    persons: ['Albert', 'Bep', 'Cor', 'Dora', 'Evert', 'Fien', 'Gerard', 'Hilde', 'Ida', 'Joop', 'Koos', 'Leni'],
    personenXL: ['Pim', 'Quirine', 'Rie', 'Sjaak'],
    personenExtra: ['Arend', 'Bertha', 'Chris', 'Dirkje', 'Eduard', 'Femke', 'Gijsbert', 'Henny', 'Irma', 'Jacob', 'Klaas', 'Lijsje', 'Piet', 'Quirina', 'Roosje', 'Siem'],
    objects: ['een verzilverde aansteker', 'een natte regenjas', 'een geladen revolver', 'een treinkaartje enkele reis', 'een pakje bankbiljetten', 'een gebroken horloge', 'een flesje chloraal', 'een verfrommelde brief'],
    places: ['de jazzkelder', 'het pandjeshuis', 'de bovenkamer', 'het natte steegje', 'de nachtapotheek', 'de brugwachtershut', 'het hotel aan de kade', 'de verlaten loods', 'de bedrijfskeuken'],
    plekkenXL: ['de biljartzaal boven', 'het kantoor van de rechercheur', 'de regenachtige binnenplaats'],
    times: ['22:00', '23:00', '00:00', '01:00', '02:00', '03:00'],
    hidden: ['het bewijsstuk', 'een valse bodem', 'een dode brievenbus', 'een alarmdraad', 'een lege kluis', 'een afluisterpost', 'een vergeten koffer', 'een bloedspoor'],
  },
  {
    id: 'landhuis',
    name: 'Huize Valkenhorst',
    icon: '🕯',
    accent: '#d8a657',
    blurb: 'Een erfenis, een huis vol kamers en een gezelschap dat elkaar al dertig jaar niet uitstaat.',
    timeUnit: { one: 'uur', many: 'uur' },
    tijdVoorzetsel: 'om',
    sameRoom: 'in hetzelfde vertrek als',
    randZin: 'tegen de buitenmuur',
    hoekZin: 'in een hoek van het huis',
    roomWord: 'kamer',
    plekWoord: 'kamer',
    map: deuren,
    victims: ['oom Aldert', 'grootvader Valkenhorst', 'de rentmeester'],
    slachtoffers: ['Mathilde', 'Norbert', 'Oswald', 'Margaretha', 'Marcellus', 'Nicolaas', 'Nathalia', 'Odilia', 'Octaaf'],
    rollen: { m: ['de oudoom van het huis', 'de rentmeester', 'de butler'], v: ['de oudtante van het huis', 'de huishoudster', 'de gezelschapsdame'] },
    lead: 'Na het dessert viel de stroom uit, en toen het licht terugkwam was het al te laat.',
    reconLead: 'Van die avond is alleen het dienstrooster van de butler over.',
    findLead: 'Het testament lag gisteren nog in de kluis. Nu niet meer, en het huis is groot.',
    assignLead: 'Iedereen bracht iets mee voor de gastheer. Niemand geeft toe wat.',
    persons: ['Agnes', 'Bertram', 'Clara', 'Diederik', 'Eleonora', 'Ferdinand', 'Godelieve', 'Hendrik', 'Isabel', 'Joachim', 'Katrien', 'Lodewijk'],
    personenXL: ['Petronella', 'Quirijn', 'Reinoud', 'Sibylle'],
    personenExtra: ['Adelheid', 'Boudewijn', 'Cornelia', 'Dorothea', 'Everhard', 'Francisca', 'Gustaaf', 'Henriëtte', 'Ignatius', 'Josephina', 'Konstantijn', 'Leopold', 'Philippine', 'Quintijn', 'Rudolphine', 'Sebastiaan'],
    objects: ['een zilveren kandelaar', 'een kristallen karaf', 'een paar leren handschoenen', 'een jachtgeweer', 'een doosje slaappoeder', 'een verzegelde envelop', 'een antieke briefopener', 'een vervalste cheque'],
    places: ['de bibliotheek', 'de wintertuin', 'de biljartkamer', 'de dienstgang', 'de wijnkelder', 'het rookkabinet', 'de muziekzaal', 'de koetshuiszolder', 'de keuken'],
    plekkenXL: ['de jachtkamer', 'de orangerie', 'de dienstbodentrap'],
    times: ['19:00', '20:00', '21:00', '22:00', '23:00', '00:00'],
    hidden: ['het testament', 'een geheime deur', 'een leeg kluisje', 'een schuilplaats', 'een vals schilderij', 'een opgebroken vloerplank', 'een vergeten sleutel', 'een dienstbodentrap'],
  },
  {
    id: 'station',
    name: 'Ruimtestation Meridiaan',
    icon: '🛰',
    accent: '#8ad6c4',
    blurb: 'Een krappe bemanning, een kapotte koeling en geen schip dat binnen een week langskomt.',
    timeUnit: { one: 'wacht', many: 'wachten' },
    tijdVoorzetsel: 'tijdens',
    sameRoom: 'in dezelfde module als',
    randZin: 'tegen de buitenwand',
    hoekZin: 'in een hoek van het station',
    roomWord: 'module',
    plekWoord: 'module',
    map: {
      adj: (a, b) => `${a} heeft een luchtsluis naar ${b}.`,
      notAdj: (a, b) => `${a} heeft geen luchtsluis naar ${b}.`,
      hops: (a, b, d) => (d === 1
        ? `Tussen ${a} en ${b} zit precies één sluis.`
        : `Tussen ${a} en ${b} zitten precies ${telwoord(d)} sluizen.`),
      degree: (a, d) =>
        d === 1
          ? `${a} bevindt zich in een module met maar één sluis.`
          : `${a} bevindt zich in een module met ${telwoord(d)} sluizen.`,
    },
    victims: ['commandant Ngoie', 'de vluchtleider', 'de ladingmeester'],
    slachtoffers: ['Mira', 'Nuru', 'Osvald', 'Malia', 'Marek', 'Nadir', 'Noor', 'Odile', 'Omar'],
    rollen: { m: ['de vluchtleider', 'de ladingmeester', 'de boordarts'], v: ['de commandant', 'de navigator', 'de boordarts'] },
    lead: 'De koeling viel uit en het alarm werd pas veel later gehoord.',
    reconLead: 'Het wachtrooster is half gewist; dit is wat ervan over is.',
    findLead: 'Iemand heeft het noodbaken uitgezet. Het hangt nog ergens aan boord.',
    assignLead: 'Bij de laatste bevoorrading nam iedereen een persoonlijk pakket aan. De manifesten zijn gewist.',
    persons: ['Ada', 'Boris', 'Carmen', 'Dmitri', 'Elif', 'Finn', 'Gaia', 'Hiro', 'Ines', 'Jonas', 'Kaya', 'Luuk'],
    personenXL: ['Priya', 'Qiang', 'Rashid', 'Sanne'],
    personenExtra: ['Ayla', 'Bashir', 'Chiara', 'Dilan', 'Ewa', 'Farid', 'Göran', 'Hana', 'Idris', 'Juno', 'Kenji', 'Linnea', 'Petra', 'Qadir', 'Rafael', 'Suvi'],
    objects: ['een losgekoppelde zuurstofcel', 'een hoofdsleutel', 'een geleegde spuit', 'een gewiste datadrager', 'een snijbrander', 'een gesmolten zekering', 'een privaat logboek', 'een illegale zender'],
    places: ['de centrifuge', 'de hydrocultuur', 'de machinekamer', 'de observatiekoepel', 'de medische post', 'het vrachtruim', 'de slaapcabines', 'de communicatiekoker', 'de kombuis'],
    plekkenXL: ['het laadruim', 'de reactorgang', 'de kweekcel'],
    times: ['de eerste wacht', 'de tweede wacht', 'de derde wacht', 'de vierde wacht', 'de vijfde wacht', 'de zesde wacht'],
    hidden: ['het noodbaken', 'een lek in de romp', 'een verborgen voorraad', 'een omgeleide kabel', 'een dode sensor', 'een geblindeerde camera', 'een tweede logboek', 'een los paneel'],
  },
  {
    id: 'woud',
    name: 'Het Verstilde Woud',
    icon: '🌿',
    accent: '#9ccf7a',
    blurb: 'Het bos verplaatst zijn paden als niemand kijkt. De bron ook, zeggen ze.',
    timeUnit: { one: 'klokslag', many: 'klokslagen' },
    tijdVoorzetsel: 'bij',
    sameRoom: 'in hetzelfde stuk bos als',
    randZin: 'aan de rand van het woud',
    hoekZin: 'in een uiterste hoek van het terrein',
    roomWord: 'open plek',
    plekWoord: 'plek',
    map: paden,
    victims: ['de oude boswachter', 'de veerman', 'de grensopzichter'],
    slachtoffers: ['Maarten', 'Nienke', 'Olle', 'Mette', 'Menno', 'Neeltje', 'Noach', 'Obbe', 'Onne'],
    rollen: { m: ['de oude boswachter', 'de veerman', 'de grensopzichter'], v: ['de oude boswachtster', 'de veervrouw', 'de kruidenvrouw'] },
    lead: 'Er werd iemand gevonden met zijn hand om iets wat er niet meer is.',
    reconLead: 'Het woud houdt geen tijd bij. De klokslagen van de kapel wel.',
    findLead: 'De bron verlegt zich elke eeuw. Deze keer is hij hier, ergens tussen de bomen.',
    assignLead: 'Reizigers kwamen het woud in met elk een gave. Het woud heeft ze door elkaar gehusseld.',
    persons: ['Astrid', 'Bram', 'Cato', 'Dries', 'Eline', 'Fedde', 'Gwen', 'Hidde', 'Imke', 'Joris', 'Kyra', 'Laurens'],
    personenXL: ['Pepijn', 'Quinten', 'Roosmarijn', 'Senna'],
    personenExtra: ['Aafke', 'Berend', 'Coen', 'Doutzen', 'Elger', 'Froukje', 'Geert', 'Hille', 'Ide', 'Jelle', 'Karst', 'Lieuwe', 'Pelle', 'Quintijn', 'Rozemarijn', 'Sieger'],
    objects: ['een kromme wichelroede', 'een zakje gedroogde maanbloem', 'een ijzeren belletje', 'een afgebroken hoorn', 'een leren veldfles', 'een bundel vogelveren', 'een gebarsten spiegelscherf', 'een handvol zoutkorrels'],
    places: ['de doornenkom', 'het wilgenhoofd', 'de omgevallen toren', 'de dampende poel', 'het hertenpad', 'de steenkring', 'het verzonken bruggetje', 'de holle eik'],
    plekkenXL: ['het mosdal', 'de vossenburcht', 'de beek met de keien'],
    times: ['de eerste klokslag', 'de tweede klokslag', 'de derde klokslag', 'de vierde klokslag', 'de vijfde klokslag', 'de zesde klokslag'],
    hidden: ['de magische bron', 'een valse bron', 'een hertenval', 'een offersteen', 'een slapend wezen', 'een omgekeerd pad', 'een verdronken wagen', 'een nest spiegelkraaien'],
  },
  {
    id: 'catacomben',
    name: 'De Catacomben van Sint-Oda',
    icon: '🪨',
    accent: '#c0a0d8',
    blurb: 'Je lamp houdt het nog twee uur. De uitgang zit niet waar hij op de kaart staat.',
    timeUnit: { one: 'kwartier', many: 'kwartier' },
    tijdVoorzetsel: 'in',
    sameRoom: 'in dezelfde ruimte als',
    randZin: 'tegen de rotswand',
    hoekZin: 'in een uiterste hoek van de kelders',
    roomWord: 'gewelf',
    plekWoord: 'ruimte',
    map: {
      adj: (a, b) => `${a} heeft een gang naar ${b}.`,
      notAdj: (a, b) => `${a} heeft geen gang naar ${b}.`,
      hops: (a, b, d) => (d === 1
        ? `Tussen ${a} en ${b} ligt precies één gang.`
        : `Tussen ${a} en ${b} liggen precies ${telwoord(d)} gangen.`),
      degree: (a, d) =>
        d === 1
          ? `${a} bevindt zich in een gewelf waar maar één gang op uitkomt.`
          : `${a} bevindt zich in een gewelf met ${telwoord(d)} gangen.`,
    },
    victims: ['de voorste gids', 'de lampendrager', 'de opzichter'],
    slachtoffers: ['Mies', 'Nina', 'Olaf', 'Machteld', 'Mauritz', 'Nelis', 'Noortje', 'Odulf', 'Onno'],
    rollen: { m: ['de voorste gids', 'de lampendrager', 'de opzichter'], v: ['de voorste gids', 'de lampendraagster', 'de opzichtster'] },
    lead: 'Iemand liep vooruit met de enige kaart. De kaart kwam terug.',
    reconLead: 'De afdaling werd bijgehouden per kwartier, maar het schrift is vochtig geworden.',
    findLead: 'Er is een uitgang. De kaart liegt erover, de luchtstroom niet.',
    assignLead: 'Afdalers, rugzakken, en in het donker raakt alles verwisseld.',
    persons: ['Anton', 'Bart', 'Cecile', 'Daan', 'Emma', 'Floris', 'Gijs', 'Hanna', 'Ivo', 'Jet', 'Karel', 'Lotte'],
    personenXL: ['Pieter', 'Quirina', 'Rutger', 'Saar'],
    personenExtra: ['Alwin', 'Bente', 'Casper', 'Dieuwertje', 'Elias', 'Fleur', 'Geertje', 'Hadewych', 'Ingmar', 'Judith', 'Koenraad', 'Lucia', 'Pauwel', 'Quirinus', 'Reinier', 'Sofie'],
    objects: ['een bijna lege carbidlamp', 'een opgerold touw', 'een gestolen relikwie', 'een krijtje', 'een gebroken kompas', 'een veldflesje jenever', 'een losse kaarthoek', 'een zakje botstukken'],
    places: ['het beenderengewelf', 'de verzakte trap', 'de droge put', 'de bidkapel', 'het waterpeilgat', 'de ingestorte nis', 'de smalle schacht', 'het grafvertrek'],
    plekkenXL: ['de knekelnis', 'de verzonken crypte', 'de kaarsenkamer'],
    times: ['het eerste kwartier', 'het tweede kwartier', 'het derde kwartier', 'het vierde kwartier', 'het vijfde kwartier', 'het zesde kwartier'],
    hidden: ['de uitgang', 'een vals gat', 'een luchtschacht', 'een ingestorte gang', 'een waterput', 'een dichtgemetselde deur', 'een nest vleermuizen', 'een verzegelde graftombe'],
  },
  {
    id: 'academie',
    name: 'Academie Morgenstond',
    icon: '🜚',
    accent: '#e39aa8',
    blurb: 'Op een school waar iedereen kan liegen met een spreuk, is logica het enige bewijs.',
    timeUnit: { one: 'lesuur', many: 'lesuren' },
    tijdVoorzetsel: 'in',
    sameRoom: 'in hetzelfde vertrek als',
    randZin: 'tegen de buitenmuur',
    hoekZin: 'in een hoek van de school',
    roomWord: 'zaal',
    plekWoord: 'zaal',
    map: deuren,
    victims: ['de rector', 'de conrector', 'de huisbewaarder'],
    slachtoffers: ['Melchior', 'Nadia', 'Orso', 'Morgana', 'Magnus', 'Nicodemus', 'Nerissa', 'Ottilie', 'Orlando'],
    rollen: { m: ['de rector', 'de conrector', 'de huisbewaarder'], v: ['de rector', 'de conrector', 'de huisbewaarster'] },
    lead: 'Tijdens het avondgebed is er iemand in steen veranderd. Niemand van de aanwezigen geeft iets toe.',
    reconLead: 'Het lesrooster van die dag is bewaard gebleven, maar half uitgewist.',
    findLead: 'Een van de zalen houdt de verdwenen leerstoel verborgen. De school zelf werkt tegen.',
    assignLead: 'Leerlingen leverden een meesterproef in. De naamkaartjes zijn weggebrand.',
    persons: ['Amira', 'Bruno', 'Cleo', 'Douwe', 'Esra', 'Felix', 'Gideon', 'Hugo', 'Iris', 'Jasper', 'Kiki', 'Loek'],
    personenXL: ['Pallas', 'Quintus', 'Rosalind', 'Severin'],
    personenExtra: ['Alida', 'Bodil', 'Cosima', 'Dagmar', 'Ezra', 'Fabian', 'Gwendolyn', 'Hamza', 'Ilja', 'Jolanda', 'Kasper', 'Lova', 'Perpetua', 'Quirin', 'Rodrigo', 'Siebrand'],
    objects: ['een gebarsten toverstaf', 'een inktvlek die niet weggaat', 'een geleend grimoire', 'een zakje ijzervijlsel', 'een vervalst rapport', 'een stuk steenhuid', 'een stilzwijgtalisman', 'een dode kanarie'],
    places: ['de spiegelzaal', 'het ketelhok', 'de verboden trappenhal', 'het herbarium', 'de studiecel', 'de sterrenkoepel', 'de eetzaal', 'het archief'],
    plekkenXL: ['de alchemiekamer', 'de klokkentoren', 'de leeszaal'],
    times: ['het eerste lesuur', 'het tweede lesuur', 'het derde lesuur', 'het vierde lesuur', 'het vijfde lesuur', 'het zesde lesuur'],
    hidden: ['de verdwenen leerstoel', 'een illusiewand', 'een versteende leerling', 'een gesloten portaal', 'een verboden kast', 'een lekkende banspreuk', 'een tweede spiegel', 'een vergeten strafhok'],
  },
  {
    id: 'kerst',
    name: 'Kerstavond',
    icon: '🎄',
    accent: '#2f7d4f',
    blurb: 'Kaarslicht, te veel familie in één huis, en iemand die het dessert niet haalde.',
    timeUnit: { one: 'uur', many: 'uur' },
    tijdVoorzetsel: 'om',
    sameRoom: 'in hetzelfde vertrek als',
    randZin: 'tegen de buitenmuur',
    hoekZin: 'in een hoek van het huis',
    roomWord: 'kamer',
    plekWoord: 'kamer',
    map: deuren,
    victims: ['oom Nicolaas', 'de kerstgast', 'de buurman van nummer zes'],
    slachtoffers: ['Marieke', 'Nicolaas', 'Olivier', 'Marjan', 'Mart', 'Nelleke', 'Niek', 'Odette', 'Otger'],
    rollen: { m: ['de oom uit Groningen', 'de kerstgast', 'de buurman van nummer zes'], v: ['de tante uit Groningen', 'de kerstgast', 'de buurvrouw van nummer zes'] },
    lead: 'Halverwege het kerstdiner viel de stroom uit, en toen de kaarsen weer brandden klopte er iets niet.',
    reconLead: 'Van die avond is alleen het tijdschema van de gastvrouw over.',
    findLead: 'Er is een cadeau verdwenen voordat het onder de boom lag.',
    assignLead: 'Iedereen bracht iets mee. De naamkaartjes zijn van de pakjes gevallen.',
    persons: ['Anna', 'Bram', 'Chris', 'Daan', 'Elsa', 'Floris', 'Gerrit', 'Hanna', 'Ivo', 'Jolien', 'Koen', 'Lieve'],
    personenXL: ['Pien', 'Quinty', 'Roel', 'Stijn'],
    personenExtra: ['Aukje', 'Bertus', 'Caro', 'Dieuwke', 'Eefje', 'Ferry', 'Gonnie', 'Hielke', 'Ischa', 'Jorrit', 'Kees', 'Lynn', 'Puck', 'Quinta', 'Rinske', 'Sem'],
    objects: ['een half opgegeten kerststol', 'een rode kaars', 'een gescheurd inpakpapier', 'een zilveren kerstbal', 'een flesje gluhwein', 'een kaartje zonder naam', 'een kapotte lichtslinger', 'een doosje marsepein'],
    places: ['de eetkamer', 'de serre', 'de bijkeuken', 'de logeerkamer', 'de hal met de boom', 'de kelderkast', 'de besneeuwde tuin', 'de zolderkamer', 'de kerstkeuken'],
    plekkenXL: ['de koetshuisstal', 'de naaikamer', 'het besneeuwde terras'],
    times: ['17:00', '18:00', '19:00', '20:00', '21:00', '22:00'],
    hidden: ['het verdwenen cadeau', 'een lege doos', 'een tweede sleutel', 'een doorgeknipte slinger', 'een verstopte brief', 'een smeltend spoor', 'een omgevallen kaars', 'een opengemaakt pakje'],
  },
  {
    id: 'halloween',
    name: 'Halloweennacht',
    icon: '🎃',
    accent: '#b4621f',
    blurb: 'Een huis vol maskers, en iemand die zijn kostuum nooit meer uitdoet.',
    timeUnit: { one: 'uur', many: 'uur' },
    tijdVoorzetsel: 'om',
    sameRoom: 'in hetzelfde vertrek als',
    randZin: 'tegen de buitenmuur',
    hoekZin: 'in een hoek van het huis',
    roomWord: 'kamer',
    plekWoord: 'kamer',
    map: deuren,
    victims: ['de gastheer in het skeletpak', 'de huisbaas', 'de buurvrouw met de lantaarn'],
    slachtoffers: ['Mila', 'Nestor', 'Oskar', 'Morris', 'Mink', 'Nanne', 'Nova', 'Odilon', 'Olger'],
    rollen: { m: ['de gastheer in het skeletpak', 'de huisbaas', 'de buurman met de lantaarn'], v: ['de gastvrouw in het skeletpak', 'de huisbazin', 'de buurvrouw met de lantaarn'] },
    lead: 'Om middernacht ging het licht uit, en toen de lampionnen weer brandden lag er iemand stil.',
    reconLead: 'Van die nacht is alleen een half ingevuld rondje langs de deuren over.',
    findLead: 'Achter een van de deuren hangt het echte masker, en dat is geen kostuum.',
    assignLead: 'Iedereen kwam verkleed, en niemand weet meer wie welk masker ophad.',
    persons: ['Ada', 'Boris', 'Cleo', 'Dries', 'Esther', 'Finn', 'Gijs', 'Hugo', 'Iris', 'Jet', 'Kiki', 'Lotte'],
    personenXL: ['Pascal', 'Quinten', 'Ravi', 'Sybren'],
    personenExtra: ['Amber', 'Bo', 'Chiel', 'Dex', 'Elvira', 'Fenna', 'Gunnar', 'Hedda', 'Ivar', 'Juul', 'Kars', 'Luna', 'Pablo', 'Quint', 'Rosalie', 'Silke'],
    objects: ['een gescheurd laken', 'een plastic hoektand', 'een halfgegeten toffee', 'een gebarsten masker', 'een zaklamp zonder batterij', 'een handvol pompoenpitten', 'een verfrommelde snoepzak', 'een rubberen spin'],
    places: ['de donkere veranda', 'de pompoenkamer', 'de spinnenwebzolder', 'de kaarsengang', 'de kelder met het luik', 'de achtertuin bij het hek', 'de garage', 'de slaapkamer boven', 'de griezelkeuken'],
    plekkenXL: ['de heksenkeuken', 'het vleermuizenhok', 'de verwaarloosde eetkamer'],
    times: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
    hidden: ['het echte masker', 'een valse muur', 'een dichtgeplakt luik', 'een blusdeken', 'een verstopt snoepblik', 'een uitgedoofde lampion', 'een tweede trap', 'een spoor van pompoen'],
  },
  // ---------------------------------------------------------------------
  // Drie werelden van nu. De zes hierboven spelen in een landhuis, een
  // crypte, een bos of een toverschool - mooi, maar allemaal lang geleden.
  // Een school waar je zelf op hebt gezeten, een ziekenhuis bij nacht en
  // een kantoortoren na sluitingstijd zijn net zo goed gesloten werelden
  // met te veel deuren en te weinig getuigen.
  {
    id: 'school',
    name: 'Het Rietveld College',
    icon: '🎒',
    accent: '#6fb3d9',
    blurb: 'Driehonderd leerlingen naar buiten, en toen iedereen weer binnen was klopte de telling niet.',
    timeUnit: { one: 'blokuur', many: 'blokuren' },
    tijdVoorzetsel: 'in',
    sameRoom: 'in hetzelfde lokaal als',
    randZin: 'tegen de buitenmuur',
    hoekZin: 'in een hoek van het gebouw',
    roomWord: 'lokaal',
    plekWoord: 'lokaal',
    map: deuren,
    victims: ['de conciërge', 'de teamleider', 'de stagiair'],
    slachtoffers: ['Mo', 'Noor', 'Oumar', 'Mees', 'Milan', 'Nienke', 'Nordin', 'Olivier', 'Ouassima'],
    rollen: { m: ['de conciërge', 'de teamleider', 'de stagiair'], v: ['de conciërge', 'de teamleider', 'de stagiaire'] },
    lead: 'Het brandalarm ging af in het laatste blokuur en iedereen moest het plein op.',
    reconLead: 'Van die middag is alleen het presentieoverzicht over, en dat is half ingevuld.',
    findLead: 'Ergens in het gebouw ligt het proefwerk dat nooit is afgenomen.',
    assignLead: 'Alles uit de gevonden voorwerpen lag op één tafel. Niemand weet meer van wie wat is.',
    persons: ['Anouk', 'Bilal', 'Caro', 'Daan', 'Emre', 'Fenna', 'Gijs', 'Hind', 'Isa', 'Joep', 'Kiki', 'Lars'],
    personenXL: ['Pien', 'Quinten', 'Rachid', 'Sofie'],
    personenExtra: ['Aya', 'Bas', 'Chayenne', 'Dex', 'Eva', 'Floris', 'Giel', 'Hamza', 'Imke', 'Jade', 'Koen', 'Luuk', 'Puck', 'Quincy', 'Romy', 'Sem', 'Fenne', 'Kick'],
    objects: ['een gebarsten telefoonscherm', 'een geleende rekenmachine', 'een volgeschreven schrift', 'een blikje energiedrank', 'een sleutelbos van de conciërge', 'een usb-stick zonder naam', 'een verfrommeld proefwerk', 'een gymtas die niemand ophaalt'],
    places: ['de aula', 'het scheikundepracticum', 'de kleedkamer', 'de mediatheek', 'de fietsenkelder', 'de kantine', 'de hoofdgang', 'het schoolplein', 'de gymzaal'],
    plekkenXL: ['het repetitiehok', 'de conciërgewerkplaats', 'de doka'],
    times: ['het eerste blokuur', 'het tweede blokuur', 'het derde blokuur', 'het vierde blokuur', 'het vijfde blokuur', 'het zesde blokuur'],
    hidden: ['het gestolen proefwerk', 'een openstaand raam', 'een camera die niets opnam', 'een tweede sleutel', 'een opengebroken kluisje', 'een dichtgeplakt slot', 'een spoor van verf', 'een tas die er niet hoort'],
  },
  {
    id: 'ziekenhuis',
    name: 'Sint-Joris, nachtdienst',
    icon: '🏥',
    accent: '#79d2c0',
    blurb: 'Eén vleugel, twaalf mensen op de ronde, en een monitor die om tien over twee stilviel.',
    timeUnit: { one: 'ronde', many: 'rondes' },
    tijdVoorzetsel: 'tijdens',
    sameRoom: 'in dezelfde ruimte als',
    randZin: 'tegen de buitenmuur',
    hoekZin: 'in een hoek van de vleugel',
    roomWord: 'afdeling',
    plekWoord: 'ruimte',
    map: deuren,
    victims: ['de nachtzuster', 'de dienstdoend arts', 'de beveiliger'],
    slachtoffers: ['Maud', 'Nabil', 'Olivia', 'Mathis', 'Marit', 'Naomi', 'Nout', 'Otis', 'Oona'],
    rollen: { m: ['de nachtverpleger', 'de dienstdoend arts', 'de beveiliger'], v: ['de nachtzuster', 'de dienstdoend arts', 'de beveiligster'] },
    lead: 'Om tien over twee viel een monitor stil, en het duurde elf minuten voordat iemand keek.',
    reconLead: 'Het rondelogboek is bijgehouden, maar halverwege de nacht houdt het op.',
    findLead: 'Er is iets uit de medicijnkast verdwenen. Het is het gebouw niet uit.',
    assignLead: 'Twaalf dienstkluisjes, twaalf spullen, en de naamstickers zijn eraf geweekt.',
    persons: ['Adil', 'Bianca', 'Coen', 'Dounia', 'Erik', 'Farah', 'Gwen', 'Hakim', 'Inge', 'Jelle', 'Karin', 'Lennart'],
    personenXL: ['Pleun', 'Quinty', 'Rik', 'Saskia'],
    personenExtra: ['Annelies', 'Bob', 'Chantal', 'Dirk', 'Elke', 'Fatima', 'Gert', 'Hester', 'Ilse', 'Jamal', 'Kris', 'Leon', 'Paul', 'Quirijn', 'Renate', 'Sander'],
    objects: ['een geleende toegangsbadge', 'een lege ampul', 'een natte dweil', 'een kapotte pieper', 'een aangebroken doos handschoenen', 'een formulier zonder handtekening', 'een trouwring in een bakje', 'een halflege koffiebeker'],
    places: ['de spoedpost', 'de operatiekamer', 'de patiëntenkamer', 'het laboratorium', 'de linnenkamer', 'de personeelskantine', 'de wachthal', 'de verbindingsgang', 'de binnentuin'],
    plekkenXL: ['de röntgenkamer', 'de apotheek', 'de kelderberging'],
    times: ['de eerste ronde', 'de tweede ronde', 'de derde ronde', 'de vierde ronde', 'de vijfde ronde', 'de zesde ronde'],
    hidden: ['de verdwenen ampul', 'een geblokkeerde deur', 'een tweede badge', 'een losgetrokken stekker', 'een leeg bed', 'een camera uit beeld', 'een natte voetafdruk', 'een vergeten dossier'],
  },
  {
    id: 'kantoor',
    name: 'De Spiegeltoren',
    icon: '🏢',
    accent: '#b9a6e8',
    blurb: 'Elf hoog, na sluitingstijd, en de badgelezer zegt dat er niemand is weggegaan.',
    timeUnit: { one: 'uur', many: 'uur' },
    tijdVoorzetsel: 'om',
    sameRoom: 'in dezelfde ruimte als',
    randZin: 'tegen de glazen gevel',
    hoekZin: 'in een hoek van de verdieping',
    roomWord: 'afdeling',
    plekWoord: 'plek',
    map: deuren,
    victims: ['de financieel directeur', 'de systeembeheerder', 'de bewaker van de nachtdienst'],
    slachtoffers: ['Martijn', 'Nour', 'Oleg', 'Maya', 'Mohammed', 'Nadine', 'Niels', 'Orhan', 'Oksana'],
    rollen: { m: ['de financieel directeur', 'de systeembeheerder', 'de bewaker van de nachtdienst'], v: ['de financieel directeur', 'de systeembeheerder', 'de bewaakster van de nachtdienst'] },
    lead: 'De lampen gingen om elf uur vanzelf uit, en daarna heeft niemand meer uitgebadged.',
    reconLead: 'Van die avond is alleen het badgelogboek over, en dat mist een halfuur.',
    findLead: 'Het contract is nooit de deur uit gegaan. Het ligt nog op deze verdieping.',
    assignLead: 'Bij de verhuizing stonden alle dozen door elkaar. De etiketten zijn eraf gevallen.',
    persons: ['Arnaud', 'Brigitte', 'Chloé', 'Davy', 'Edwin', 'Freek', 'Grace', 'Hassan', 'Ivan', 'Jurgen', 'Khalid', 'Linde'],
    personenXL: ['Patricia', 'Quinten', 'Robin', 'Stef'],
    personenExtra: ['Ayse', 'Bart', 'Carlo', 'Daphne', 'Eline', 'Fabienne', 'Gerda', 'Hanneke', 'Irene', 'Jens', 'Kirsten', 'Lex', 'Pepijn', 'Quirijn', 'Ronald', 'Sylvia', 'Guus', 'Kim'],
    objects: ['een geprinte mailwisseling', 'een vergeten toegangspas', 'een usb-stick met een rode sticker', 'een halfvolle thermoskan', 'een opgerolde plattegrond', 'een telefoon op stil', 'een doos met bureauspullen', 'een getekend contract zonder datum'],
    places: ['de open werkvloer', 'de directiekamer', 'de serverhal', 'het bedrijfsrestaurant', 'de vergaderzaal', 'de parkeerkelder', 'de liftlobby', 'het dakterras', 'de postkamer'],
    plekkenXL: ['de stiltecabine', 'de receptie', 'het archiefdepot'],
    times: ['19:00', '20:00', '21:00', '22:00', '23:00', '00:00'],
    hidden: ['het getekende contract', 'een tweede trappenhuis', 'een lege kluis', 'een deur zonder badgelezer', 'een gewiste harde schijf', 'een camera in onderhoud', 'een verzet plafondpaneel', 'een doos die niemand mist'],
  },
];

export const WORLD_BY_ID = new Map(WORLDS.map((w) => [w.id, w]));