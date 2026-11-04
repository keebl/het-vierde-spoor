// De vaste bibliotheek. Een puzzel is hier niets meer dan zijn instellingen
// plus een seed: de generator maakt er altijd exact dezelfde puzzel van.
// Daarom is deze lijst klein en blijft er geen puzzeldata in de repo staan.

export const CATALOG = [
  // ---- Kerstavond en Halloweennacht --------------------------------------
  { seed: 'kerst-1', titel: 'Wie at de laatste kerststol?', sub: 'Zes familieleden, een donker moment en een cadeau dat niemand gaf.', opdracht: 'dader', wereld: 'kerst', mechaniek: 'kamer', niveau: 2 },
  { seed: 'kerst-2', titel: 'Stroomstoring op kerstavond', sub: 'Negen mensen in een huis vol kaarsen. Eentje stond er alleen.', opdracht: 'dader', wereld: 'kerst', mechaniek: 'kamer', niveau: 4 },
  { seed: 'kerst-3', titel: 'Het verdwenen cadeau', sub: 'Het lag onder de boom. Nu niet meer.', opdracht: 'vinden', wereld: 'kerst', mechaniek: 'map', niveau: 3 },
  { seed: 'kerst-4', titel: 'Wie bracht welk pakje mee', sub: 'De naamkaartjes zijn van de pakjes gevallen.', opdracht: 'toewijzing', wereld: 'kerst', mechaniek: 'grid', niveau: 2 },
  { seed: 'hall-1', titel: 'Het echte masker', sub: 'Iedereen kwam verkleed. Eentje deed zijn kostuum nooit meer uit.', opdracht: 'dader', wereld: 'halloween', mechaniek: 'kamer', niveau: 3 },
  { seed: 'hall-2', titel: 'Middernacht', sub: 'Twaalf bij twaalf, en buiten slaat de klok.', opdracht: 'dader', wereld: 'halloween', mechaniek: 'kamer', niveau: 5 },
  { seed: 'hall-3', titel: 'Achter welke deur', sub: 'Het masker hangt ergens in huis, en het is geen kostuum.', opdracht: 'vinden', wereld: 'halloween', mechaniek: 'map', niveau: 3 },
  { seed: 'hall-4', titel: 'Het rondje langs de deuren', sub: 'Wie stond waar, en wanneer?', opdracht: 'reconstructie', wereld: 'halloween', mechaniek: 'latin', niveau: 3 },

  // ---- Kamerraster: zet de verdachten zelf neer ---------------------------
  { seed: 'kamer-1', titel: 'Wie stond er alleen?', sub: 'Vijf verdachten op een plattegrond die je nog in één blik overziet.', opdracht: 'dader', wereld: 'landhuis', mechaniek: 'kamer', niveau: 1 },
  { seed: 'kamer-2', titel: 'Het natte uur', sub: 'Regenstad bij nacht: zes verdachten en een lichaam.', opdracht: 'dader', wereld: 'noir', mechaniek: 'kamer', niveau: 2 },
  { seed: 'kamer-3', titel: 'Stilstand in de centrifuge', sub: 'Zeven bemanningsleden, en niemand die twee keer op dezelfde rij staat.', opdracht: 'dader', wereld: 'station', mechaniek: 'kamer', niveau: 3 },
  { seed: 'kamer-4', titel: 'Onder de wilgen', sub: 'Het woud als rooster. Let op wie waar naast staat.', opdracht: 'dader', wereld: 'woud', mechaniek: 'kamer', niveau: 3 },
  { seed: 'kamer-5', titel: 'Onder de bidkapel', sub: 'Negen bij negen onder de grond, en geen enkele directe aanwijzing.', opdracht: 'dader', wereld: 'catacomben', mechaniek: 'kamer', niveau: 4 },
  { seed: 'kamer-6', titel: 'Avondgebed', sub: 'Twaalf bij twaalf, in een school die niet meewerkt.', opdracht: 'dader', wereld: 'academie', mechaniek: 'kamer', niveau: 5 },
  { seed: 'kamer-7', titel: 'Het uur van de butler', sub: 'Terug naar Valkenhorst, nu met negen verdachten.', opdracht: 'dader', wereld: 'landhuis', mechaniek: 'kamer', niveau: 4 },
  { seed: 'kamer-8', titel: 'Laatste wacht', sub: 'Twaalf bemanningsleden en een gesloten sluis.', opdracht: 'dader', wereld: 'station', mechaniek: 'kamer', niveau: 5 },

  // ---- Regenstad ---------------------------------------------------------
  { seed: 'kade-1', titel: 'De havenmeester', sub: 'Eén nacht, vier verdachten, en een telefoon die niemand opnam.', opdracht: 'dader', wereld: 'noir', mechaniek: 'grid', niveau: 2 },
  { seed: 'kade-7', titel: 'Natte voeten', sub: 'Iedereen was ergens anders. Eén iemand twee keer.', opdracht: 'dader', wereld: 'noir', mechaniek: 'grid', niveau: 4 },
  { seed: 'neon-3', titel: 'Het pandjeshuis', sub: 'Vier panden aan één steeg, en één deur die niet op de kaart staat.', opdracht: 'dader', wereld: 'noir', mechaniek: 'map', niveau: 3 },
  { seed: 'bewijs-2', titel: 'Wat de regen niet wegspoelde', sub: 'Het bewijsstuk ligt nog in het blok. Zoek de juiste deur.', opdracht: 'vinden', wereld: 'noir', mechaniek: 'map', niveau: 2 },
  { seed: 'bureau-5', titel: 'Vier getuigen, vier jassen', sub: 'Geen misdrijf. Alleen een bureau vol spullen zonder eigenaar.', opdracht: 'toewijzing', wereld: 'noir', mechaniek: 'grid', niveau: 2 },
  { seed: 'nacht-9', titel: 'Nachtdienst', sub: 'Wie stond waar, en wanneer? Het logboek is halfvol.', opdracht: 'reconstructie', wereld: 'noir', mechaniek: 'latin', niveau: 3 },

  // ---- Huize Valkenhorst -------------------------------------------------
  { seed: 'erfenis-1', titel: 'Na het dessert', sub: 'De klassieke zaak: één landhuis, één erfenis, één te veel.', opdracht: 'dader', wereld: 'landhuis', mechaniek: 'grid', niveau: 1 },
  { seed: 'erfenis-4', titel: 'De doorgeknipte lijn', sub: 'Vier gasten, vier kamers, en een alibi dat een uur te vroeg begint.', opdracht: 'dader', wereld: 'landhuis', mechaniek: 'grid', niveau: 3 },
  { seed: 'erfenis-8', titel: 'Testament zonder erfgenaam', sub: 'Voor wie denkt dat landhuizen makkelijk zijn.', opdracht: 'dader', wereld: 'landhuis', mechaniek: 'grid', niveau: 5 },
  { seed: 'dienstgang-2', titel: 'Langs de dienstgang', sub: 'De butler kent een route die niemand anders loopt.', opdracht: 'dader', wereld: 'landhuis', mechaniek: 'map', niveau: 4 },
  { seed: 'kluis-3', titel: 'Waar het testament ligt', sub: 'Veertien kamers, één papier, en een huis dat kraakt.', opdracht: 'vinden', wereld: 'landhuis', mechaniek: 'map', niveau: 3 },
  { seed: 'cadeau-1', titel: 'Wie bracht wat mee', sub: 'Een onschuldige: alleen gasten, cadeaus en kamers.', opdracht: 'toewijzing', wereld: 'landhuis', mechaniek: 'grid', niveau: 1 },
  { seed: 'diner-6', titel: 'De avond gereconstrueerd', sub: 'Van 19:00 tot 22:00, kamer voor kamer.', opdracht: 'reconstructie', wereld: 'landhuis', mechaniek: 'latin', niveau: 2 },

  // ---- Ruimtestation Meridiaan -------------------------------------------
  { seed: 'koeling-2', titel: 'De derde wacht', sub: 'De koeling viel uit. Iemand was wakker die dat niet hoorde te zijn.', opdracht: 'dader', wereld: 'station', mechaniek: 'grid', niveau: 3 },
  { seed: 'sluis-5', titel: 'Vijf modules, één sluis te weinig', sub: 'Je kunt niet door een wand lopen. Dat is de hele aanwijzing.', opdracht: 'dader', wereld: 'station', mechaniek: 'map', niveau: 4 },
  { seed: 'baken-1', titel: 'Het uitgezette baken', sub: 'Geen moord, wel sabotage. Vind het baken voor de volgende omloop.', opdracht: 'vinden', wereld: 'station', mechaniek: 'map', niveau: 2 },
  { seed: 'baken-9', titel: 'Stil alarm', sub: 'Zes modules, zes sporen, en één kaart die tegenspreekt.', opdracht: 'vinden', wereld: 'station', mechaniek: 'map', niveau: 5 },
  { seed: 'manifest-3', titel: 'Gewiste manifesten', sub: 'Vier pakketten, vier bemanningsleden, nul administratie.', opdracht: 'toewijzing', wereld: 'station', mechaniek: 'grid', niveau: 3 },
  { seed: 'wacht-4', titel: 'Het wachtrooster', sub: 'Iedereen één keer per module, één keer per wacht.', opdracht: 'reconstructie', wereld: 'station', mechaniek: 'latin', niveau: 4 },

  // ---- Het Verstilde Woud ------------------------------------------------
  { seed: 'bron-1', titel: 'De bron verlegt zich', sub: 'Vier plekken, één bron, en een woud dat niet meewerkt.', opdracht: 'vinden', wereld: 'woud', mechaniek: 'map', niveau: 1 },
  { seed: 'bron-5', titel: 'Twee bronnen, één echte', sub: 'Het woud liegt met spiegels. De paden niet.', opdracht: 'vinden', wereld: 'woud', mechaniek: 'map', niveau: 4 },
  { seed: 'grenssteen-2', titel: 'Bij de grenssteen', sub: 'De boswachter hield iets vast dat er niet meer is.', opdracht: 'dader', wereld: 'woud', mechaniek: 'grid', niveau: 3 },
  { seed: 'gave-3', titel: 'Vier reizigers, vier gaven', sub: 'Het woud heeft ze door elkaar gehusseld.', opdracht: 'toewijzing', wereld: 'woud', mechaniek: 'grid', niveau: 2 },
  { seed: 'klokslag-7', titel: 'Vier klokslagen', sub: 'Wie stond waar toen de klok sloeg?', opdracht: 'reconstructie', wereld: 'woud', mechaniek: 'latin', niveau: 3 },

  // ---- De Catacomben van Sint-Oda ----------------------------------------
  { seed: 'uitgang-1', titel: 'De kaart liegt', sub: 'Je lamp houdt het twee uur. Zoek de uitgang.', opdracht: 'vinden', wereld: 'catacomben', mechaniek: 'map', niveau: 2 },
  { seed: 'uitgang-6', titel: 'Zes gewelven, geen daglicht', sub: 'De zwaarste doolhof in de bibliotheek.', opdracht: 'vinden', wereld: 'catacomben', mechaniek: 'map', niveau: 5 },
  { seed: 'gids-2', titel: 'De voorste gids', sub: 'We vonden de kaart terug. Hem niet.', opdracht: 'dader', wereld: 'catacomben', mechaniek: 'grid', niveau: 4 },
  { seed: 'rugzak-1', titel: 'Verwisselde rugzakken', sub: 'In het donker raakt alles door elkaar.', opdracht: 'toewijzing', wereld: 'catacomben', mechaniek: 'grid', niveau: 1 },
  { seed: 'afdaling-4', titel: 'De afdaling, kwartier voor kwartier', sub: 'Vijf afdalers, vijf gewelven, vijf kwartier.', opdracht: 'reconstructie', wereld: 'catacomben', mechaniek: 'latin', niveau: 4 },

  // ---- Academie Morgenstond ----------------------------------------------
  { seed: 'rector-1', titel: 'De versteende rector', sub: 'Iedereen kan hier liegen met een spreuk. Logica kan dat niet.', opdracht: 'dader', wereld: 'academie', mechaniek: 'grid', niveau: 2 },
  { seed: 'rector-8', titel: 'Zes aanwezigen, nul bekentenissen', sub: 'Zes verdachten, drie categorieën, geen genade.', opdracht: 'dader', wereld: 'academie', mechaniek: 'grid', niveau: 5 },
  { seed: 'trappen-3', titel: 'De verboden trappenhal', sub: 'De school verlegt zijn deuren. De plattegrond van vandaag geldt.', opdracht: 'dader', wereld: 'academie', mechaniek: 'map', niveau: 3 },
  { seed: 'leerstoel-2', titel: 'De verdwenen leerstoel', sub: 'Eén zaal houdt hem verborgen.', opdracht: 'vinden', wereld: 'academie', mechaniek: 'map', niveau: 3 },
  { seed: 'proef-1', titel: 'Weggebrande naamkaartjes', sub: 'Vier meesterproeven zonder inzender.', opdracht: 'toewijzing', wereld: 'academie', mechaniek: 'grid', niveau: 2 },
  { seed: 'lesuur-5', titel: 'Het lesrooster van die dag', sub: 'Elke leerling één keer per zaal, één keer per lesuur.', opdracht: 'reconstructie', wereld: 'academie', mechaniek: 'latin', niveau: 5 },

  // ---- Instapreeks -------------------------------------------------------
  { seed: 'start-0', titel: 'Eerste zaak', sub: 'Zet vijf verdachten op de plattegrond. Tien minuten werk.', opdracht: 'dader', wereld: 'noir', mechaniek: 'kamer', niveau: 1 },
  { seed: 'start-1', titel: 'Tweede zaak: het raster', sub: 'Nu met kruisjes en vinkjes in plaats van een plattegrond.', opdracht: 'dader', wereld: 'noir', mechaniek: 'grid', niveau: 1 },
  { seed: 'start-2', titel: 'Derde zaak', sub: 'Nu met vier verdachten.', opdracht: 'dader', wereld: 'landhuis', mechaniek: 'grid', niveau: 2 },
  { seed: 'start-3', titel: 'Vierde zaak', sub: 'Er komt een tijdlijn bij.', opdracht: 'dader', wereld: 'station', mechaniek: 'grid', niveau: 3 },
  { seed: 'start-4', titel: 'Vijfde zaak', sub: 'Hier moet je voor het eerst iets aannemen en weerleggen.', opdracht: 'dader', wereld: 'academie', mechaniek: 'grid', niveau: 4 },
  { seed: 'start-5', titel: 'Zesde zaak', sub: 'Zes verdachten. Neem er de tijd voor.', opdracht: 'dader', wereld: 'woud', mechaniek: 'grid', niveau: 5 },
];

export const catalogSettings = (entry) => ({
  opdracht: entry.opdracht,
  wereld: entry.wereld,
  mechaniek: entry.mechaniek,
  niveau: entry.niveau,
  seed: entry.seed,
});
