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
// tijdVoorzetsel - hoe een tijdstip in een zin staat: "om 22:00", maar
//               "tijdens de tweede wacht" en "in het derde kwartier".
// plekWoord - hoe je in een zin naar een ruimte verwijst: "de kamer van
//               Hendrik", "de module van Dmitri". Zonder zo'n woord werd het
//               "waar Hendrik is", en dan botst dat met het werkwoord dat er
//               achteraan komt.
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
    roomWord: 'gelegenheid',
    plekWoord: 'plek',
    map: deuren,
    victims: ['de havenmeester', 'de nachtportier', 'de kroegbaas'],
    slachtoffers: ['Max', 'Nora', 'Otto'],
    lead: 'De regen kwam die nacht met bakken naar beneden, en niemand hoorde iets boven het water uit.',
    reconLead: 'Van die nacht is alleen het halve logboek van de brugwachter over.',
    findLead: 'Ergens in dit blok ligt het bewijs dat de hele zaak omgooit. Je hebt een nacht.',
    assignLead: 'Getuigen, verhalen, en een bureau vol spullen waarvan niemand meer weet van wie ze zijn.',
    persons: ['Albert', 'Bep', 'Cor', 'Dora', 'Evert', 'Fien', 'Gerard', 'Hilde', 'Ida', 'Joop', 'Koos', 'Leni'],
    objects: ['een verzilverde aansteker', 'een natte regenjas', 'een geladen revolver', 'een treinkaartje enkele reis', 'een pakje bankbiljetten', 'een gebroken horloge', 'een flesje chloraal', 'een verfrommelde brief'],
    places: ['de jazzkelder', 'het pandjeshuis', 'de bovenkamer', 'het natte steegje', 'de nachtapotheek', 'de brugwachtershut', 'het hotel aan de kade', 'de verlaten loods', 'de bedrijfskeuken'],
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
    sameRoom: 'in dezelfde kamer als',
    roomWord: 'kamer',
    plekWoord: 'kamer',
    map: deuren,
    victims: ['oom Aldert', 'grootvader Valkenhorst', 'de rentmeester'],
    slachtoffers: ['Mathilde', 'Norbert', 'Oswald'],
    lead: 'Na het dessert viel de stroom uit, en toen het licht terugkwam was het al te laat.',
    reconLead: 'Van die avond is alleen het dienstrooster van de butler over.',
    findLead: 'Het testament lag gisteren nog in de kluis. Nu niet meer, en het huis is groot.',
    assignLead: 'Iedereen bracht iets mee voor de gastheer. Niemand geeft toe wat.',
    persons: ['Agnes', 'Bertram', 'Clara', 'Diederik', 'Eleonora', 'Ferdinand', 'Godelieve', 'Hendrik', 'Isabel', 'Joachim', 'Katrien', 'Lodewijk'],
    objects: ['een zilveren kandelaar', 'een kristallen karaf', 'een paar leren handschoenen', 'een jachtgeweer', 'een doosje slaappoeder', 'een verzegelde envelop', 'een antieke briefopener', 'een vervalste cheque'],
    places: ['de bibliotheek', 'de wintertuin', 'de biljartkamer', 'de dienstgang', 'de wijnkelder', 'het rookkabinet', 'de muziekzaal', 'de koetshuiszolder', 'de keuken'],
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
    slachtoffers: ['Mira', 'Nuru', 'Osvald'],
    lead: 'De koeling viel uit en het alarm werd pas veel later gehoord.',
    reconLead: 'Het wachtrooster is half gewist; dit is wat ervan over is.',
    findLead: 'Iemand heeft het noodbaken uitgezet. Het hangt nog ergens aan boord.',
    assignLead: 'Bij de laatste bevoorrading nam iedereen een persoonlijk pakket aan. De manifesten zijn gewist.',
    persons: ['Ada', 'Boris', 'Carmen', 'Dmitri', 'Elif', 'Finn', 'Gaia', 'Hiro', 'Ines', 'Jonas', 'Kaya', 'Luuk'],
    objects: ['een losgekoppelde zuurstofcel', 'een hoofdsleutel', 'een geleegde spuit', 'een gewiste datadrager', 'een snijbrander', 'een gesmolten zekering', 'een privaat logboek', 'een illegale zender'],
    places: ['de centrifuge', 'de hydrocultuur', 'de machinekamer', 'de observatiekoepel', 'de medische post', 'het vrachtruim', 'de slaapcabines', 'de communicatiekoker', 'de kombuis'],
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
    sameRoom: 'op dezelfde plek als',
    roomWord: 'open plek',
    plekWoord: 'plek',
    map: paden,
    victims: ['de oude boswachter', 'de veerman', 'de grensopzichter'],
    slachtoffers: ['Maarten', 'Nienke', 'Olle'],
    lead: 'Er werd iemand gevonden met zijn hand om iets wat er niet meer is.',
    reconLead: 'Het woud houdt geen tijd bij. De klokslagen van de kapel wel.',
    findLead: 'De bron verlegt zich elke eeuw. Deze keer is hij hier, ergens tussen de bomen.',
    assignLead: 'Reizigers kwamen het woud in met elk een gave. Het woud heeft ze door elkaar gehusseld.',
    persons: ['Astrid', 'Bram', 'Cato', 'Dries', 'Eline', 'Fedde', 'Gwen', 'Hidde', 'Imke', 'Joris', 'Kyra', 'Laurens'],
    objects: ['een kromme wichelroede', 'een zakje gedroogde maanbloem', 'een ijzeren belletje', 'een afgebroken hoorn', 'een leren veldfles', 'een bundel vogelveren', 'een gebarsten spiegelscherf', 'een handvol zoutkorrels'],
    places: ['de doornenkom', 'het wilgenhoofd', 'de omgevallen toren', 'de dampende poel', 'het hertenpad', 'de steenkring', 'het verzonken bruggetje', 'de holle eik'],
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
    sameRoom: 'in hetzelfde gewelf als',
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
    slachtoffers: ['Mies', 'Nina', 'Olaf'],
    lead: 'Iemand liep vooruit met de enige kaart. De kaart kwam terug.',
    reconLead: 'De afdaling werd bijgehouden per kwartier, maar het schrift is vochtig geworden.',
    findLead: 'Er is een uitgang. De kaart liegt erover, de luchtstroom niet.',
    assignLead: 'Afdalers, rugzakken, en in het donker raakt alles verwisseld.',
    persons: ['Anton', 'Bart', 'Cecile', 'Daan', 'Emma', 'Floris', 'Gijs', 'Hanna', 'Ivo', 'Jet', 'Karel', 'Lotte'],
    objects: ['een bijna lege carbidlamp', 'een opgerold touw', 'een gestolen relikwie', 'een krijtje', 'een gebroken kompas', 'een veldflesje jenever', 'een losse kaarthoek', 'een zakje botstukken'],
    places: ['het beenderengewelf', 'de verzakte trap', 'de droge put', 'de bidkapel', 'het waterpeilgat', 'de ingestorte nis', 'de smalle schacht', 'het grafvertrek'],
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
    sameRoom: 'in dezelfde zaal als',
    roomWord: 'zaal',
    plekWoord: 'zaal',
    map: deuren,
    victims: ['de rector', 'de conrector', 'de huisbewaarder'],
    slachtoffers: ['Melchior', 'Nadia', 'Orso'],
    lead: 'Tijdens het avondgebed is er iemand in steen veranderd. Niemand van de aanwezigen geeft iets toe.',
    reconLead: 'Het lesrooster van die dag is bewaard gebleven, maar half uitgewist.',
    findLead: 'Een van de zalen houdt de verdwenen leerstoel verborgen. De school zelf werkt tegen.',
    assignLead: 'Leerlingen leverden een meesterproef in. De naamkaartjes zijn weggebrand.',
    persons: ['Amira', 'Bruno', 'Cleo', 'Douwe', 'Esra', 'Felix', 'Gideon', 'Hugo', 'Iris', 'Jasper', 'Kiki', 'Loek'],
    objects: ['een gebarsten toverstaf', 'een inktvlek die niet weggaat', 'een geleend grimoire', 'een zakje ijzervijlsel', 'een vervalst rapport', 'een stuk steenhuid', 'een stilzwijgtalisman', 'een dode kanarie'],
    places: ['de spiegelzaal', 'het ketelhok', 'de verboden trappenhal', 'het herbarium', 'de studiecel', 'de sterrenkoepel', 'de eetzaal', 'het archief'],
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
    sameRoom: 'in dezelfde kamer als',
    roomWord: 'kamer',
    plekWoord: 'kamer',
    map: deuren,
    victims: ['oom Nicolaas', 'de kerstgast', 'de buurman van nummer zes'],
    slachtoffers: ['Marieke', 'Nicolaas', 'Olivier'],
    lead: 'Halverwege het kerstdiner viel de stroom uit, en toen de kaarsen weer brandden klopte er iets niet.',
    reconLead: 'Van die avond is alleen het tijdschema van de gastvrouw over.',
    findLead: 'Er is een cadeau verdwenen voordat het onder de boom lag.',
    assignLead: 'Iedereen bracht iets mee. De naamkaartjes zijn van de pakjes gevallen.',
    persons: ['Anna', 'Bram', 'Chris', 'Daan', 'Elsa', 'Floris', 'Gerrit', 'Hanna', 'Ivo', 'Jolien', 'Koen', 'Lieve'],
    objects: ['een half opgegeten kerststol', 'een rode kaars', 'een gescheurd inpakpapier', 'een zilveren kerstbal', 'een flesje gluhwein', 'een kaartje zonder naam', 'een kapotte lichtslinger', 'een doosje marsepein'],
    places: ['de eetkamer', 'de serre', 'de bijkeuken', 'de logeerkamer', 'de hal met de boom', 'de kelderkast', 'de besneeuwde tuin', 'de zolderkamer', 'de kerstkeuken'],
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
    sameRoom: 'in dezelfde kamer als',
    roomWord: 'kamer',
    plekWoord: 'kamer',
    map: deuren,
    victims: ['de gastheer in het skeletpak', 'de huisbaas', 'de buurvrouw met de lantaarn'],
    slachtoffers: ['Mila', 'Nestor', 'Oskar'],
    lead: 'Om middernacht ging het licht uit, en toen de lampionnen weer brandden lag er iemand stil.',
    reconLead: 'Van die nacht is alleen een half ingevuld rondje langs de deuren over.',
    findLead: 'Achter een van de deuren hangt het echte masker, en dat is geen kostuum.',
    assignLead: 'Iedereen kwam verkleed, en niemand weet meer wie welk masker ophad.',
    persons: ['Ada', 'Boris', 'Cleo', 'Dries', 'Esther', 'Finn', 'Gijs', 'Hugo', 'Iris', 'Jet', 'Kiki', 'Lotte'],
    objects: ['een gescheurd laken', 'een plastic hoektand', 'een halfgegeten toffee', 'een gebarsten masker', 'een zaklamp zonder batterij', 'een handvol pompoenpitten', 'een verfrommelde snoepzak', 'een rubberen spin'],
    places: ['de donkere veranda', 'de pompoenkamer', 'de spinnenwebzolder', 'de kaarsengang', 'de kelder met het luik', 'de achtertuin bij het hek', 'de garage', 'de slaapkamer boven', 'de griezelkeuken'],
    times: ['20:00', '21:00', '22:00', '23:00', '00:00', '01:00'],
    hidden: ['het echte masker', 'een valse muur', 'een dichtgeplakt luik', 'een blusdeken', 'een verstopt snoepblik', 'een uitgedoofde lampion', 'een tweede trap', 'een spoor van pompoen'],
  },
];

export const WORLD_BY_ID = new Map(WORLDS.map((w) => [w.id, w]));