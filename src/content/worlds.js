// Werelden leveren uitsluitend woorden en sfeer. De logica weet hier niets
// van: voeg een wereld toe en je krijgt gratis alle opdrachten, alle
// mechanieken en alle niveaus erbij.

const deuren = {
  adj: (a, b) => `${a} grenst aan ${b}.`,
  notAdj: (a, b) => `${a} grenst niet aan ${b}.`,
  hops: (a, b, d) => `${a} ligt precies ${d} deuren van ${b}.`,
  degree: (a, d) =>
    d === 1
      ? `${a} bevindt zich in een doodlopende ruimte.`
      : `${a} bevindt zich in een ruimte met ${d} uitgangen.`,
};

const paden = {
  adj: (a, b) => `${a} ligt aan hetzelfde pad als ${b}.`,
  notAdj: (a, b) => `${a} ligt niet aan hetzelfde pad als ${b}.`,
  hops: (a, b, d) => `${a} ligt ${d} paden van ${b}.`,
  degree: (a, d) =>
    d === 1
      ? `${a} ligt aan een pad dat doodloopt.`
      : `${a} ligt op een kruising van ${d} paden.`,
};

export const WORLDS = [
  {
    id: 'noir',
    name: 'Regenstad',
    icon: '🌧',
    accent: '#7fb2e5',
    blurb: 'Natte straten, te veel neon, en niemand die de waarheid in een keer vertelt.',
    timeUnit: { one: 'uur', many: 'uur' },
    sameRoom: 'dezelfde gelegenheid als',
    roomWord: 'gelegenheid',
    map: deuren,
    victim: 'de havenmeester',
    lead: 'De regen kwam met bakken naar beneden en om tien over elf lag de havenmeester niet meer te ademen.',
    findLead: 'Ergens in dit blok ligt het bewijs dat de hele zaak omgooit. Je hebt een nacht.',
    assignLead: 'Vijf getuigen, vijf verhalen, en een bureau vol spullen waarvan niemand meer weet van wie ze zijn.',
    persons: ['Rechercheur Halverd', 'Mevrouw Dufour', 'de pianist', 'Dokter Mol', 'de havenjongen', 'Vera Kranz', 'de taxichauffeur', 'de weduwe Stam'],
    objects: ['een verzilverde aansteker', 'een natte regenjas', 'een geladen revolver', 'een treinkaartje enkele reis', 'een pakje bankbiljetten', 'een gebroken horloge', 'een flesje chloraal', 'een verfrommelde brief'],
    places: ['de jazzkelder', 'het pandjeshuis', 'de bovenkamer', 'het natte steegje', 'de nachtapotheek', 'de brugwachtershut', 'het hotel aan de kade', 'de verlaten loods'],
    times: ['22:00', '23:00', '00:00', '01:00', '02:00', '03:00'],
    hidden: ['het bewijsstuk', 'een valse bodem', 'een dode brievenbus', 'een alarmdraad', 'een lege kluis', 'een afluisterpost', 'een vergeten koffer', 'een bloedspoor'],
  },
  {
    id: 'landhuis',
    name: 'Huize Valkenhorst',
    icon: '🕯',
    accent: '#d8a657',
    blurb: 'Een erfenis, veertien kamers en een gezelschap dat elkaar al dertig jaar niet uitstaat.',
    timeUnit: { one: 'uur', many: 'uur' },
    sameRoom: 'dezelfde kamer als',
    roomWord: 'kamer',
    map: deuren,
    victim: 'oom Aldert',
    lead: 'Na het dessert werd oom Aldert gevonden, en de huistelefoon bleek doorgeknipt.',
    findLead: 'Het testament is uit de bibliotheek verdwenen en ligt nog ergens in het huis.',
    assignLead: 'Iedereen bracht iets mee voor de gastheer. Niemand geeft toe wat.',
    persons: ['Lady Everdeen', 'de butler Mertens', 'neef Casper', 'notaris Bolk', 'de jonge weduwe', 'kokkin Griet', 'majoor Thijsse', 'tante Wilhelmina'],
    objects: ['een zilveren kandelaar', 'een kristallen karaf', 'een paar leren handschoenen', 'een jachtgeweer', 'een doosje slaappoeder', 'een verzegelde envelop', 'een antieke briefopener', 'een vervalste cheque'],
    places: ['de bibliotheek', 'de wintertuin', 'de biljartkamer', 'de dienstgang', 'de wijnkelder', 'het rookkabinet', 'de muziekzaal', 'de koetshuiszolder'],
    times: ['19:00', '20:00', '21:00', '22:00', '23:00', '00:00'],
    hidden: ['het testament', 'een geheime deur', 'een leeg kluisje', 'een schuilplaats', 'een vals schilderij', 'een opgebroken vloerplank', 'een vergeten sleutel', 'een dienstbodentrap'],
  },
  {
    id: 'station',
    name: 'Ruimtestation Meridiaan',
    icon: '🛰',
    accent: '#8ad6c4',
    blurb: 'Negen bemanningsleden, een kapotte koeling en geen schip dat binnen een week langskomt.',
    timeUnit: { one: 'wacht', many: 'wachten' },
    sameRoom: 'dezelfde module als',
    roomWord: 'module',
    map: {
      adj: (a, b) => `${a} heeft een luchtsluis naar ${b}.`,
      notAdj: (a, b) => `${a} heeft geen luchtsluis naar ${b}.`,
      hops: (a, b, d) => `${a} ligt ${d} sluizen van ${b}.`,
      degree: (a, d) =>
        d === 1
          ? `${a} bevindt zich in een module met maar een sluis.`
          : `${a} bevindt zich in een module met ${d} sluizen.`,
    },
    victim: 'commandant Ngoie',
    lead: 'De koeling viel uit tijdens de derde wacht, en commandant Ngoie haalde de ochtend niet.',
    findLead: 'Iemand heeft de noodbaken uitgezet. Hij hangt nog ergens aan boord.',
    assignLead: 'Bij de laatste bevoorrading nam iedereen een persoonlijk pakket aan. De manifesten zijn gewist.',
    persons: ['boordwerktuigkundige Vos', 'arts Lindqvist', 'navigator Abiodun', 'de stagiair', 'kwartiermeester Reyes', 'botanicus Haru', 'de communicatieofficier', 'piloot Dekena'],
    objects: ['een losgekoppelde zuurstofcel', 'een hoofdsleutel', 'een geleegde spuit', 'een gewiste datadrager', 'een snijbrander', 'een gesmolten zekering', 'een privaat logboek', 'een illegale zender'],
    places: ['de centrifuge', 'de hydrocultuur', 'de machinekamer', 'de observatiekoepel', 'de medische post', 'het vrachtruim', 'de slaapcabines', 'de communicatiekoker'],
    times: ['wacht 1', 'wacht 2', 'wacht 3', 'wacht 4', 'wacht 5', 'wacht 6'],
    hidden: ['het noodbaken', 'een lek in de romp', 'een verborgen voorraad', 'een omgeleide kabel', 'een dode sensor', 'een geblindeerde camera', 'een tweede logboek', 'een los paneel'],
  },
  {
    id: 'woud',
    name: 'Het Verstilde Woud',
    icon: '🌿',
    accent: '#9ccf7a',
    blurb: 'Het bos verplaatst zijn paden als niemand kijkt. De bron ook, zeggen ze.',
    timeUnit: { one: 'klokslag', many: 'klokslagen' },
    sameRoom: 'dezelfde plek als',
    roomWord: 'open plek',
    map: paden,
    victim: 'de oude boswachter',
    lead: 'De oude boswachter lag bij de grenssteen, met zijn hand om iets wat er niet meer is.',
    findLead: 'De bron verlegt zich elke eeuw. Deze keer is hij hier, op een van deze plekken.',
    assignLead: 'Zeven reizigers kwamen het woud in met elk een gave. Het woud heeft ze door elkaar gehusseld.',
    persons: ['de kruidenvrouw', 'Brannoc de jager', 'het verdwaalde kind', 'een zwervende bard', 'de houtvester', 'Zuster Aveline', 'de gemaskerde pelgrim', 'Vilder de stroper'],
    objects: ['een kromme wichelroede', 'een zakje gedroogde maanbloem', 'een ijzeren belletje', 'een afgebroken hoorn', 'een leren veldfles', 'een bundel vogelveren', 'een gebarsten spiegelscherf', 'een handvol zoutkorrels'],
    places: ['de doornenkom', 'het wilgenhoofd', 'de omgevallen toren', 'de dampende poel', 'het hertenpad', 'de steenkring', 'het verzonken bruggetje', 'de holle eik'],
    times: ['eerste klokslag', 'tweede klokslag', 'derde klokslag', 'vierde klokslag', 'vijfde klokslag', 'zesde klokslag'],
    hidden: ['de magische bron', 'een valse bron', 'een hertenval', 'een offersteen', 'een slapend wezen', 'een omgekeerd pad', 'een verdronken wagen', 'een nest spiegelkraaien'],
  },
  {
    id: 'catacomben',
    name: 'De Catacomben van Sint-Oda',
    icon: '🪨',
    accent: '#c0a0d8',
    blurb: 'Je lamp houdt het nog twee uur. De uitgang zit niet waar hij op de kaart staat.',
    timeUnit: { one: 'kwartier', many: 'kwartier' },
    sameRoom: 'hetzelfde gewelf als',
    roomWord: 'gewelf',
    map: {
      adj: (a, b) => `${a} heeft een gang naar ${b}.`,
      notAdj: (a, b) => `${a} heeft geen gang naar ${b}.`,
      hops: (a, b, d) => `${a} ligt ${d} gangen van ${b}.`,
      degree: (a, d) =>
        d === 1
          ? `${a} bevindt zich in een gewelf waar maar een gang op uitkomt.`
          : `${a} bevindt zich in een gewelf met ${d} gangen.`,
    },
    victim: 'de voorste gids',
    lead: 'De voorste gids liep vooruit met de enige kaart. We vonden de kaart terug, hem niet.',
    findLead: 'Er is een uitgang. De kaart liegt erover, de luchtstroom niet.',
    assignLead: 'Zes afdalers, zes rugzakken, en in het donker is alles verwisseld.',
    persons: ['de kartograaf', 'broeder Anselm', 'de touwman', 'een plaatselijke gids', 'de fotograaf', 'doctor Reinink', 'de jongste afdaler', 'de ploegleider'],
    objects: ['een bijna lege carbidlamp', 'een opgerold touw', 'een gestolen relikwie', 'een krijtje', 'een gebroken kompas', 'een veldflesje jenever', 'een losse kaarthoek', 'een zakje botstukken'],
    places: ['het beenderengewelf', 'de verzakte trap', 'de droge put', 'de bidkapel', 'het waterpeilgat', 'de ingestorte nis', 'de smalle schacht', 'het grafvertrek'],
    times: ['eerste kwartier', 'tweede kwartier', 'derde kwartier', 'vierde kwartier', 'vijfde kwartier', 'zesde kwartier'],
    hidden: ['de uitgang', 'een vals gat', 'een luchtschacht', 'een ingestorte gang', 'een waterput', 'een dichtgemetselde deur', 'een nest vleermuizen', 'een verzegelde graftombe'],
  },
  {
    id: 'academie',
    name: 'Academie Morgenstond',
    icon: '🜚',
    accent: '#e39aa8',
    blurb: 'Op een school waar iedereen kan liegen met een spreuk, is logica het enige bewijs.',
    timeUnit: { one: 'lesuur', many: 'lesuren' },
    sameRoom: 'dezelfde zaal als',
    roomWord: 'zaal',
    map: deuren,
    victim: 'de rector',
    lead: 'De rector is tijdens het avondgebed in steen veranderd. Niemand van de zeven aanwezigen geeft iets toe.',
    findLead: 'Een van de zalen houdt de verdwenen leerstoel verborgen. De school zelf werkt tegen.',
    assignLead: 'Zeven leerlingen leverden een meesterproef in. De naamkaartjes zijn weggebrand.',
    persons: ['prefect Oorthuys', 'de nieuwe leerling', 'meester Vanderzee', 'de bibliothecaresse', 'Idris uit het derde jaar', 'de tuinmagier', 'kandidaat Blume', 'de assistent van de rector'],
    objects: ['een gebarsten toverstaf', 'een inktvlek die niet weggaat', 'een geleend grimoire', 'een zakje ijzervijlsel', 'een vervalst rapport', 'een stuk steenhuid', 'een stilzwijgtalisman', 'een dode kanarie'],
    places: ['de spiegelzaal', 'het ketelhok', 'de verboden trappenhal', 'het herbarium', 'de studiecel', 'de sterrenkoepel', 'de eetzaal', 'het archief'],
    times: ['eerste lesuur', 'tweede lesuur', 'derde lesuur', 'vierde lesuur', 'vijfde lesuur', 'zesde lesuur'],
    hidden: ['de verdwenen leerstoel', 'een illusiewand', 'een versteende leerling', 'een gesloten portaal', 'een verboden kast', 'een lekkende banspreuk', 'een tweede spiegel', 'een vergeten strafhok'],
  },
];

export const WORLD_BY_ID = new Map(WORLDS.map((w) => [w.id, w]));
