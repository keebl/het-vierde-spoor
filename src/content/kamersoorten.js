// Wat voor ruimte is dit?
//
// Zonder dit weet het bord alleen dat een vakje bij kamer 3 hoort, en dan
// krijgt een keuken net zo goed een jukebox als een jazzkelder. Met een soort
// erbij kan de vloer kloppen (tegels in de keuken, parket in de bibliotheek,
// gras buiten) en kan het meubilair kloppen (een koelkast in de keuken, een
// sarcofaag in het grafvertrek).
//
// Net als bij de iconen is dit met de hand gekoppeld en wordt het afgedwongen
// door een toets: tools/check-kamers.mjs faalt zodra er een plek bijkomt
// zonder soort, of een meubelstuk zonder icoon.

export const SOORT_VAN = {
  // Regenstad
  'de jazzkelder': 'zaal',
  'het pandjeshuis': 'zaal',
  'de bovenkamer': 'slaapkamer',
  'het natte steegje': 'buiten',
  'de nachtapotheek': 'laboratorium',
  'de brugwachtershut': 'werkplaats',
  'het hotel aan de kade': 'gang',
  'de verlaten loods': 'werkplaats',
  'de bedrijfskeuken': 'keuken',
  'de biljartzaal boven': 'zaal',
  'het kantoor van de rechercheur': 'bibliotheek',
  'de regenachtige binnenplaats': 'buiten',
  // Huize Valkenhorst
  'de bibliotheek': 'bibliotheek',
  'de wintertuin': 'serre',
  'de biljartkamer': 'zaal',
  'de dienstgang': 'gang',
  'de wijnkelder': 'kelder',
  'het rookkabinet': 'zaal',
  'de muziekzaal': 'zaal',
  'de koetshuiszolder': 'werkplaats',
  'de keuken': 'keuken',
  'de jachtkamer': 'zaal',
  'de orangerie': 'serre',
  'de dienstbodentrap': 'gang',
  // Ruimtestation Meridiaan
  'de centrifuge': 'werkplaats',
  'de hydrocultuur': 'laboratorium',
  'de machinekamer': 'werkplaats',
  'de observatiekoepel': 'sterrenwacht',
  'de medische post': 'laboratorium',
  'het vrachtruim': 'kelder',
  'de slaapcabines': 'slaapkamer',
  'de communicatiekoker': 'gang',
  'de kombuis': 'keuken',
  'het laadruim': 'kelder',
  'de reactorgang': 'werkplaats',
  'de kweekcel': 'laboratorium',
  // Het Verstilde Woud
  'de doornenkom': 'buiten',
  'het wilgenhoofd': 'buiten',
  'de omgevallen toren': 'kelder',
  'de dampende poel': 'buiten',
  'het hertenpad': 'buiten',
  'de steenkring': 'grafkelder',
  'het verzonken bruggetje': 'buiten',
  'de holle eik': 'buiten',
  'het mosdal': 'buiten',
  'de vossenburcht': 'kelder',
  'de beek met de keien': 'buiten',
  // De Catacomben van Sint-Oda
  'het beenderengewelf': 'grafkelder',
  'de verzakte trap': 'kelder',
  'de droge put': 'kelder',
  'de bidkapel': 'grafkelder',
  'het waterpeilgat': 'kelder',
  'de ingestorte nis': 'grafkelder',
  'de smalle schacht': 'gang',
  'het grafvertrek': 'grafkelder',
  'de knekelnis': 'grafkelder',
  'de verzonken crypte': 'grafkelder',
  'de kaarsenkamer': 'kelder',
  // Academie Morgenstond
  'de spiegelzaal': 'zaal',
  'het ketelhok': 'werkplaats',
  'de verboden trappenhal': 'gang',
  'het herbarium': 'laboratorium',
  'de studiecel': 'bibliotheek',
  'de sterrenkoepel': 'sterrenwacht',
  'de eetzaal': 'keuken',
  'het archief': 'bibliotheek',
  'de alchemiekamer': 'laboratorium',
  'de klokkentoren': 'sterrenwacht',
  'de leeszaal': 'bibliotheek',
  // Kerstavond en Halloweennacht
  'de eetkamer': 'zaal',
  'de serre': 'serre',
  'de bijkeuken': 'keuken',
  'de logeerkamer': 'slaapkamer',
  'de hal met de boom': 'gang',
  'de kelderkast': 'kelder',
  'de besneeuwde tuin': 'buiten',
  'de zolderkamer': 'slaapkamer',
  'de kerstkeuken': 'keuken',
  'de koetshuisstal': 'werkplaats',
  'de naaikamer': 'slaapkamer',
  'het besneeuwde terras': 'buiten',
  'de donkere veranda': 'buiten',
  'de pompoenkamer': 'zaal',
  'de spinnenwebzolder': 'kelder',
  'de kaarsengang': 'gang',
  'de kelder met het luik': 'kelder',
  'de achtertuin bij het hek': 'buiten',
  'de garage': 'werkplaats',
  'de slaapkamer boven': 'slaapkamer',
  'de griezelkeuken': 'keuken',
  'de heksenkeuken': 'laboratorium',
  'het vleermuizenhok': 'kelder',
  'de verwaarloosde eetkamer': 'zaal',
  // Het Rietveld College
  'de aula': 'zaal',
  'het scheikundepracticum': 'laboratorium',
  'de kleedkamer': 'slaapkamer',
  'de mediatheek': 'bibliotheek',
  'de fietsenkelder': 'kelder',
  'de kantine': 'keuken',
  'de hoofdgang': 'gang',
  'het schoolplein': 'buiten',
  'de gymzaal': 'zaal',
  'het repetitiehok': 'zaal',
  'de conciërgewerkplaats': 'werkplaats',
  'de doka': 'laboratorium',
  // Sint-Joris, nachtdienst
  'de spoedpost': 'laboratorium',
  'de operatiekamer': 'laboratorium',
  'de patiëntenkamer': 'slaapkamer',
  'het laboratorium': 'laboratorium',
  'de linnenkamer': 'kelder',
  'de personeelskantine': 'keuken',
  'de wachthal': 'zaal',
  'de verbindingsgang': 'gang',
  'de binnentuin': 'buiten',
  'de röntgenkamer': 'werkplaats',
  'de apotheek': 'bibliotheek',
  'de kelderberging': 'kelder',
  // De Spiegeltoren
  'de open werkvloer': 'zaal',
  'de directiekamer': 'bibliotheek',
  'de serverhal': 'werkplaats',
  'het bedrijfsrestaurant': 'keuken',
  'de vergaderzaal': 'zaal',
  'de parkeerkelder': 'kelder',
  'de liftlobby': 'gang',
  'het dakterras': 'buiten',
  'de postkamer': 'werkplaats',
  'de stiltecabine': 'slaapkamer',
  'de receptie': 'gang',
  'het archiefdepot': 'bibliotheek',
  // Het Openluchtbad
  'het ondiepe bad': 'bad',
  'de ligweide': 'buiten',
  'de kiosk': 'keuken',
  'de kleedhokjes': 'slaapkamer',
  'de doucheruimte': 'gang',
  'de glijbaan': 'buiten',
  'het zonneterras': 'zaal',
  'de materiaalberging': 'kelder',
  'de EHBO-post': 'laboratorium',
  'het diepe bad': 'bad',
  'de fietsenstalling': 'werkplaats',
  'de tribune': 'zaal',
  // Dierenpark De Wildhoek
  'het apenverblijf': 'buiten',
  'de giraffenstal': 'kelder',
  'het vlindertuintje': 'serre',
  'de kinderboerderij': 'buiten',
  'het pinguïnbad': 'bad',
  'de speeltuin': 'buiten',
  'het parkrestaurant': 'keuken',
  'de dierenkliniek': 'laboratorium',
  'het voerhok': 'kelder',
  'de uilenvolière': 'buiten',
  'de picknickweide': 'buiten',
  'de souvenirwinkel': 'bibliotheek',
};

// De vloer per soort. dessin verwijst naar een patroon in board-rooms.js.
//
// Deze kleuren zijn met opzet verzadigd en warm, en sinds 2026-11-10 nog
// een slag feller: zonnig geel in de keuken, roze vloerbedekking in de
// slaapkamer, mintgroen in het lab (specs/visual-liveliness.md). De eerste versie was een
// rij pastels, en dan ziet een plattegrond eruit als een bouwtekening: kaal
// en kil. Een keuken hoort warm te zijn, een grafkelder koud, een bos groen.
// Dat verschil tussen de kamers is wat een bord sfeer geeft.
export const VLOER_VAN = {
  keuken:       { vul: '#f4d47f', lijn: '#d1ad55', dessin: 'tegels' },
  zaal:         { vul: '#e6a95c', lijn: '#c4873a', dessin: 'planken' },
  bibliotheek:  { vul: '#c98a4a', lijn: '#a46a2e', dessin: 'planken-dwars' },
  kelder:       { vul: '#b9a27a', lijn: '#977f58', dessin: 'steen' },
  slaapkamer:   { vul: '#f0a0b4', lijn: '#cf7d93', dessin: 'tapijt' },
  gang:         { vul: '#e8c48a', lijn: '#c4a066', dessin: 'ruiten' },
  werkplaats:   { vul: '#9fb7d4', lijn: '#7b95b4', dessin: 'beton' },
  buiten:       { vul: '#8fd16a', lijn: '#6cae49', dessin: 'gras' },
  grafkelder:   { vul: '#a3a6b8', lijn: '#808396', dessin: 'steen' },
  laboratorium: { vul: '#8ee0cf', lijn: '#64bcaa', dessin: 'tegels' },
  sterrenwacht: { vul: '#c48f55', lijn: '#a06e36', dessin: 'planken' },
  // Een serre is binnen. Terracotta tegels, geen gras - en al helemaal
  // geen kampvuur, zie MEUBELS_VAN.serre.
  serre:        { vul: '#f0a679', lijn: '#cc8457', dessin: 'tegels' },
  // Een bad is water. De drie baden hadden hiervoor de soort `buiten`, en
  // kregen hun water alleen via VLOER_VAN_PLEK - terwijl hun meubilair van
  // het gazon bleef komen. Nu is het een soort op zichzelf.
  bad:          { vul: '#3fc6ee', lijn: '#1fa3cc', dessin: 'water' },
};

// Wat staat er in zo'n ruimte? Naam plus de tekening die erbij hoort.
//
// Elke naam heeft zijn eigen tekening. Een aanrecht is geen tafel en een
// slijpsteen is geen touwhaspel, dus ze mogen ook niet hetzelfde plaatje
// delen: tools/check-kamers.mjs faalt zodra dat gebeurt.
export const MEUBELS_VAN = {
  keuken: [
    ['het fornuis', 'fornuis'], ['de gootsteen', 'gootsteen'], ['de koelkast', 'koelkast'],
    ['het aanrecht', 'aanrecht'], ['de spinde', 'provisiekast'], ['het serviesbuffet', 'vaatkast'],
  ],
  zaal: [
    ['de haard', 'haard'], ['de leren fauteuil', 'fauteuil'], ['de staande klok', 'staandeklok'],
    ['de vleugel', 'vleugel'], ['de wandspiegel', 'wandspiegel'], ['het borstbeeld', 'buste'],
  ],
  bibliotheek: [
    ['de boekenkast', 'boekenkast'], ['de katheder', 'lessenaar'], ['de globe', 'globe'],
    ['de commode', 'ladekast'], ['de leesstoel', 'stoel'], ['de kaartentafel', 'kaartentafel'],
  ],
  kelder: [
    ['het wijnrek', 'wijnrek'], ['het eikenhouten vat', 'vat'], ['de kolenbunker', 'kolenkist'],
    ['de werktafel', 'werkbank'], ['de touwhaspel', 'touwhaspel'], ['de stapel kratten', 'krat'],
  ],
  slaapkamer: [
    ['het bed', 'bed'], ['de kleerkast', 'kleerkast'], ['het nachtkastje', 'nachtkastje'],
    ['het wasstel', 'wastafel'], ['de hutkoffer', 'hutkoffer'], ['de voetenbank', 'voetenbank'],
  ],
  gang: [
    ['de kapstok', 'kapstok'], ['de paraplubak', 'paraplubak'], ['de console', 'wandtafel'],
    ['de spiegelstandaard', 'staandespiegel'], ['het uurwerk', 'gangklok'], ['het harnas', 'harnas'],
  ],
  werkplaats: [
    ['de gereedschapskist', 'gereedschapskist'], ['de stookpot', 'ketel'],
    ['het schakelpaneel', 'schakelkast'], ['de magazijnstelling', 'laadrek'],
    ['het slijpwiel', 'slijpsteen'], ['de draaibank', 'draaibank'],
  ],
  buiten: [
    ['de houtstapel', 'houtstapel'], ['de drinkbak', 'drinkbak'], ['de vuurplaats', 'vuur'],
    ['de omgevallen stam', 'stam'], ['de waterput', 'put'], ['de mosrichel', 'mosbank'],
    ['de regenton', 'regenton'], ['de kruiwagen', 'kruiwagen'],
    ['de boomstronk', 'boomstronk'], ['de vogelverschrikker', 'vogelverschrikker'],
  ],
  grafkelder: [
    ['de stenen sarcofaag', 'sarcofaag'], ['de knekelnis', 'knekelnis'], ['de zuil', 'zuil'],
    ['het bidbankje', 'bidbank'], ['de kaarsenstandaard', 'kaarsentafel'], ['de grafzerk', 'grafzerk'],
  ],
  laboratorium: [
    ['de kweekbak', 'kweekbak'], ['het kruidenkabinet', 'kruidenkast'],
    ['de distilleerketel', 'distilleerketel'], ['de weegschaal', 'weegschaal'],
    ['de kolvenrij', 'proeventafel'], ['de kuipplant', 'plantenbak'],
  ],
  sterrenwacht: [
    ['de telescoop', 'telescoop'], ['de hemelbol', 'hemelbol'], ['de sterrenkaart', 'sterrenkaart'],
    ['het kaartenkabinet', 'kaartenkast'], ['de schrijflessenaar', 'schrijflessenaar'],
    ['de chronometer', 'chronometer'],
  ],
  // Een serre, een orangerie, een wintertuin: binnen, onder glas, vol
  // planten. Deze stonden als `buiten` te boek en kregen daardoor gras
  // onder zich en een kampvuur, een omgevallen stam en een
  // vogelverschrikker erin.
  serre: [
    ['de palmkuip', 'palmkuip'], ['de rieten stoel', 'rietenstoel'],
    ['de oppotbak', 'oppotbak'], ['de gieterplank', 'gieterplank'],
    ['de marmeren bank', 'marmerbank'], ['de citrusboom', 'citrusboom'],
  ],
  // Tien, en geen uitwijkroute (zie VERWANTE_SOORTEN). Een soort moet er
  // tien kunnen leveren, anders raakt een vol bord door zijn namen heen -
  // en alles wat van een andere soort leent, staat hier in het water.
  bad: [
    ['het startblok', 'startblok'], ['het zwemtrapje', 'zwemtrapje'],
    ['de duikplank', 'duikplank'], ['de reddingsboei', 'reddingsboei'],
    ['de reddingshaak', 'reddingshaak'], ['de peilpaal', 'peilpaal'],
    ['de badmeesterstoel', 'badmeesterstoel'], ['de lijnenhaspel', 'lijnenhaspel'],
    ['de kickplankbak', 'kickplankbak'], ['de wedstrijdklok', 'wedstrijdklok'],
  ],
};

export const soortVan = (plek) => SOORT_VAN[plek] ?? 'zaal';

// Raakt het meubilair van een soort ruimte op, dan wijken we uit naar een
// soort die ernaast ligt - niet naar het eerste het beste. Anders staat er
// een koelkast in het bos, en dat is precies wat er gebeurde.
export const VERWANTE_SOORTEN = {
  keuken: ['kelder', 'zaal'],
  zaal: ['bibliotheek', 'gang'],
  bibliotheek: ['zaal', 'sterrenwacht'],
  kelder: ['werkplaats', 'keuken'],
  slaapkamer: ['zaal', 'gang'],
  gang: ['zaal', 'slaapkamer'],
  werkplaats: ['kelder', 'buiten'],
  buiten: ['werkplaats', 'kelder'],
  // Een bad wijkt naar niets uit. Elke andere soort zou iets opleveren
  // dat niet in het water hoort te staan, en daar begon dit mee.
  bad: [],
  grafkelder: ['kelder', 'buiten'],
  laboratorium: ['werkplaats', 'bibliotheek'],
  sterrenwacht: ['bibliotheek', 'zaal'],
  // Naar binnen, nooit naar buiten: anders staat het kampvuur er alsnog.
  serre: ['zaal', 'bibliotheek'],
};

// De namen die in deze soort ruimte mogen staan, in volgorde van voorkeur, en
// zoals deze wereld ze noemt. Zonder wereld krijg je de namen zoals ze in de
// lijsten hierboven staan - dat is de legenda en de vergelijkpagina, waar geen
// wereld bij hoort.
export function meubelsVoor(soort, wereld) {
  const eigen = MEUBELS_VAN[soort] ?? MEUBELS_VAN.zaal;
  const verwant = (WERELDVERWANT[wereld]?.[soort] ?? VERWANTE_SOORTEN[soort] ?? [])
    .flatMap((s) => MEUBELS_VAN[s] ?? []);
  const laag = WERELDMEUBELS[wereld];
  if (!laag) return [eigen, verwant];
  return [eigen.map((p) => omdopen(p, laag)), verwant.map((p) => omdopen(p, laag))];
}

// Je staat niet IN een bruggetje en niet IN een zolder. De meeste plekken
// krijgen "in"; hier staan de uitzonderingen. Zonder dit leest een aanwijzing
// als "Joris stond niet in het verzonken bruggetje", en dan gelooft een
// puzzelaar de rest van de zinnen ook niet meer.
export const VOORZETSEL_VAN = {
  'het hertenpad': 'op',
  'het verzonken bruggetje': 'op',
  'het wilgenhoofd': 'bij',
  'de dampende poel': 'bij',
  'de droge put': 'bij',
  'het waterpeilgat': 'bij',
  'de verzakte trap': 'op',
  'de koetshuiszolder': 'op',
  'de spinnenwebzolder': 'op',
  'de donkere veranda': 'op',
  'de achtertuin bij het hek': 'in',
  'de steenkring': 'in',
};

// Een "of-aanwijzing" noemt twee plekken in één adem: "het hertenpad of de
// steenkring". Dan geldt het voorzetsel van de eerste.
export function voorzetselVan(plek) {
  if (VOORZETSEL_VAN[plek]) return VOORZETSEL_VAN[plek];
  for (const [naam, voor] of Object.entries(VOORZETSEL_VAN)) {
    if (plek.startsWith(`${naam} `)) return voor;
  }
  return 'in';
}


// Welke vórm hoort bij die naam?
//
// De generator tekent eerst een plattegrond en plakt er daarna namen op. Zet
// je die willekeurig neer, dan heet een vierkante klodder van tien vakjes
// "het verzonken bruggetje" en een lange strook "de droge put". Dat is
// precies het soort scheefheid waar je overheen leest tot iemand het
// aanwijst - en daarna zie je niets anders meer.
//
// Daarom heeft elke plek een vorm, en kiest de generator per kamer de naam
// die bij de vorm past: de langste strook wordt het bruggetje, het grootste
// vlak de zaal, het kleinste hoekje de put. Wat hier niet in staat is
// 'vrij': die naam past overal. Afgedwongen door tools/check-regels.mjs.
//
//   smal   een strook: gang, trap, pad, brug, beek, koker, schacht
//   groot  een vlak waar je in kunt lopen: zaal, keuken, tuin, ruim
//   klein  een hoek of een gat: put, nis, cel, hok, kast
export const VORM_VAN = {
  // Het Rietveld College, Sint-Joris en De Spiegeltoren
  'de hoofdgang': 'smal',
  'de verbindingsgang': 'smal',
  'de liftlobby': 'smal',
  'de receptie': 'smal',
  'de aula': 'groot',
  'de gymzaal': 'groot',
  'de kantine': 'groot',
  'het schoolplein': 'groot',
  'de wachthal': 'groot',
  'de binnentuin': 'groot',
  'de open werkvloer': 'groot',
  'het bedrijfsrestaurant': 'groot',
  'het dakterras': 'groot',
  'de doka': 'klein',
  'de stiltecabine': 'klein',
  'de kelderberging': 'klein',
  'de linnenkamer': 'klein',
  'de postkamer': 'klein',
  // Het Openluchtbad en Dierenpark De Wildhoek
  'de glijbaan': 'smal',
  'de doucheruimte': 'smal',
  'de tribune': 'smal',
  'de ligweide': 'groot',
  'het ondiepe bad': 'groot',
  'het diepe bad': 'groot',
  'de picknickweide': 'groot',
  'de speeltuin': 'groot',
  'het apenverblijf': 'groot',
  'de kinderboerderij': 'groot',
  'de kleedhokjes': 'klein',
  'de EHBO-post': 'klein',
  'de materiaalberging': 'klein',
  'het voerhok': 'klein',
  'het vlindertuintje': 'klein',
  'het natte steegje': 'smal',
  'de dienstgang': 'smal',
  'de dienstbodentrap': 'smal',
  'de slaapcabines': 'smal',
  'de communicatiekoker': 'smal',
  'de reactorgang': 'smal',
  'de omgevallen toren': 'smal',
  'het hertenpad': 'smal',
  'het verzonken bruggetje': 'smal',
  'de beek met de keien': 'smal',
  'de verzakte trap': 'smal',
  'de smalle schacht': 'smal',
  'de verboden trappenhal': 'smal',
  'de klokkentoren': 'smal',
  'het besneeuwde terras': 'smal',
  'de donkere veranda': 'smal',
  'de kaarsengang': 'smal',
  'het hotel aan de kade': 'groot',
  'de verlaten loods': 'groot',
  'de bedrijfskeuken': 'groot',
  'de biljartzaal boven': 'groot',
  'de jazzkelder': 'groot',
  'de bibliotheek': 'groot',
  'de wintertuin': 'groot',
  'de muziekzaal': 'groot',
  'de koetshuiszolder': 'groot',
  'de keuken': 'groot',
  'de orangerie': 'groot',
  'de hydrocultuur': 'groot',
  'het vrachtruim': 'groot',
  'het laadruim': 'groot',
  'het mosdal': 'groot',
  'het beenderengewelf': 'groot',
  'de verzonken crypte': 'groot',
  'de spiegelzaal': 'groot',
  'de eetzaal': 'groot',
  'het archief': 'groot',
  'de leeszaal': 'groot',
  'de serre': 'groot',
  'de hal met de boom': 'groot',
  'de besneeuwde tuin': 'groot',
  'de kerstkeuken': 'groot',
  'de koetshuisstal': 'groot',
  'de spinnenwebzolder': 'groot',
  'de achtertuin bij het hek': 'groot',
  'de griezelkeuken': 'groot',
  'de nachtapotheek': 'klein',
  'de brugwachtershut': 'klein',
  'het kantoor van de rechercheur': 'klein',
  'het rookkabinet': 'klein',
  'de observatiekoepel': 'klein',
  'de medische post': 'klein',
  'de kweekcel': 'klein',
  'de dampende poel': 'klein',
  'de holle eik': 'klein',
  'de vossenburcht': 'klein',
  'de droge put': 'klein',
  'het waterpeilgat': 'klein',
  'de ingestorte nis': 'klein',
  'de knekelnis': 'klein',
  'het ketelhok': 'klein',
  'de studiecel': 'klein',
  'de sterrenkoepel': 'klein',
  'de bijkeuken': 'klein',
  'de kelderkast': 'klein',
  'de naaikamer': 'klein',
  'het vleermuizenhok': 'klein',
};

export const vormVan = (plek) => VORM_VAN[plek] ?? 'vrij';

// ------------------------------------------------- dezelfde ruimte, andere wereld
//
// Een soort ruimte zegt wat er gebeurt, niet waar het van gemaakt is. Een
// werkplaats in een landhuis is hout, steen en roest; dezelfde werkplaats op
// een ruimtestation is geperforeerd staal. Zolang alleen de soort de vloer
// bepaalde, stapte je in een scifi-puzzel een willekeurige huiskamer binnen:
// parket in de machinekamer, een tapijt in de slaapcabines.
//
// `tint` is de kleur waar de hele wereld naartoe schuift, `kracht` hoe ver.
// `dessin` vervangt per wereld een patroon door een ander - staal in plaats
// van planken, steen in plaats van tegels. Wat er niet in staat blijft wat de
// soort zegt, want de soort moet herkenbaar blijven: een keuken hoort ook op
// een ruimtestation lichter te zijn dan het vrachtruim.
export const WERELDVLOER = {
  noir: { tint: '#6d7a88', kracht: 0.3 },
  landhuis: { tint: '#9a7244', kracht: 0.16 },
  station: {
    tint: '#7d8da0',
    kracht: 0.66,
    dessin: { planken: 'plaat', 'planken-dwars': 'plaat', steen: 'plaat', tapijt: 'beton', ruiten: 'tegels' },
  },
  woud: {
    tint: '#6f9456',
    kracht: 0.36,
    dessin: { tegels: 'steen', beton: 'steen', ruiten: 'steen' },
  },
  catacomben: {
    tint: '#8b8a84',
    kracht: 0.46,
    dessin: { planken: 'steen', 'planken-dwars': 'steen', tapijt: 'steen', ruiten: 'steen', beton: 'steen', tegels: 'steen' },
  },
  academie: { tint: '#a98a5e', kracht: 0.26 },
  kerst: { tint: '#b9cbd6', kracht: 0.28 },
  halloween: { tint: '#8a6a62', kracht: 0.32 },
  // Een school is linoleum en gietvloer, geen parket en geen gras - behalve
  // op het plein, en daar mag het gras blijven.
  school: {
    tint: '#8f9aa6',
    kracht: 0.42,
    dessin: { planken: 'tegels', 'planken-dwars': 'tegels', steen: 'beton', tapijt: 'tegels' },
  },
  // Vinyl, overal, in hetzelfde flauwe groen. Dat is precies wat een
  // ziekenhuis is en waarom niemand er graag is.
  ziekenhuis: {
    tint: '#9fc6bd',
    kracht: 0.52,
    dessin: { planken: 'tegels', 'planken-dwars': 'tegels', steen: 'tegels', tapijt: 'tegels', gras: 'gras', ruiten: 'tegels' },
  },
  // Tapijttegels op de werkvloer, beton in de kelder. Grijs met een koele
  // zweem, want alles hier wordt van bovenaf verlicht.
  // Zomer: alles een slag lichter en warmer, zonder de kleuren plat te
  // slaan. Dit is het enige waar "lichter" letterlijk licht betekent.
  zwembad: { tint: '#cfe7ef', kracht: 0.3 },
  dierentuin: { tint: '#cfe0b4', kracht: 0.24 },
  kantoor: {
    tint: '#8d8fa0',
    kracht: 0.44,
    dessin: { planken: 'tapijt', 'planken-dwars': 'tapijt', steen: 'beton', ruiten: 'tapijt' },
  },
};

// De vloer van één bepaalde plek, als de soort hem niet goed raadt.
//
// De soort bepaalt drie dingen tegelijk: de vloer, het meubilair, en wat de
// wereld daarin nog mag omruilen. Dat gaat goed zolang een soort één ding
// is, en mis zodra hij er meerdere tegelijk moet zijn. `buiten` moest een
// open plek in een bos, een nat steegje, een besneeuwde tuin, een
// schoolplein en een dakterras bedienen - en die kregen dus allemaal gras.
//
// Voor de meeste van die kamers klopt het meubilair wel degelijk: op een
// schoolplein staat een vlaggenmast en een fietsenrek, op een dakterras een
// terrasbank. Alleen de grond eronder klopte niet. Daar is een hele nieuwe
// soort te zwaar voor; dit is het lichte gereedschap. Staat een plek hier,
// dan wint deze vloer van zijn soort én van de wereldlaag - specifieker
// dan dit wordt het niet.
//
// Waar het méubilair ook niet klopt, hoort wel een eigen soort. Zie `serre`
// hieronder: in een orangerie stond een kampvuur.
export const VLOER_VAN_PLEK = {
  // Bestrating in plaats van gras.
  'het natte steegje': { vul: '#7f858c', lijn: '#616770', dessin: 'bestrating' },
  'de regenachtige binnenplaats': { vul: '#868d95', lijn: '#686f78', dessin: 'bestrating' },
  'het schoolplein': { vul: '#9a9a93', lijn: '#7a7a73', dessin: 'bestrating' },
  'het dakterras': { vul: '#9ba0a8', lijn: '#7b8089', dessin: 'bestrating' },
  // Sneeuw in plaats van gras. Een besneeuwde tuin met groen gras erin was
  // het eerste wat opviel.
  'de besneeuwde tuin': { vul: '#e8eef4', lijn: '#bfcbd8', dessin: 'sneeuw' },
  'het besneeuwde terras': { vul: '#e3eaf1', lijn: '#b8c5d3', dessin: 'sneeuw' },
  // Een kast onder de trap is geen gewelf. Hij hoort bij de kelder qua
  // spullen - potten, kratten, een wijnrek - maar je staat er op een
  // houten vloer, niet op natuursteen.
  'de kelderkast': { vul: '#ab9068', lijn: '#88714c', dessin: 'planken' },
  // Een zolder is geen kelder en een veranda geen grasveld: planken.
  'de spinnenwebzolder': { vul: '#9c8763', lijn: '#7b684a', dessin: 'planken' },
  'de koetshuiszolder': { vul: '#a68e66', lijn: '#836e4c', dessin: 'planken' },
  'het vleermuizenhok': { vul: '#8f7c5c', lijn: '#6f5f44', dessin: 'planken' },
  'de donkere veranda': { vul: '#7e6b52', lijn: '#5f503c', dessin: 'planken' },
  // Stro over de staldeel. Hetzelfde patroon als gras, maar dan geel: dat
  // is precies wat stro is.
  'de koetshuisstal': { vul: '#c8a860', lijn: '#a08440', dessin: 'gras' },
  // Een gymzaal heeft een houten vloer. De school ruilt planken normaal om
  // voor tegels, en dat klopt overal behalve hier.
  'de gymzaal': { vul: '#c9a469', lijn: '#a38248', dessin: 'planken' },
  // Water waar water hoort. Zonder dit is een zwembad een grasveld.
  'het ondiepe bad': { vul: '#5ec4e0', lijn: '#3ea2bf', dessin: 'water' },
  'het diepe bad': { vul: '#2f9fc4', lijn: '#1f7e9e', dessin: 'water' },
  'het pinguïnbad': { vul: '#6ec8dd', lijn: '#4aa6bd', dessin: 'water' },
  // Natte tegels bij het bad, en bestrating waar je op je slippers loopt.
  'de doucheruimte': { vul: '#bcd3d6', lijn: '#93aeb3', dessin: 'tegels' },
  'de kleedhokjes': { vul: '#cfd8d2', lijn: '#a6b1ac', dessin: 'tegels' },
  'de glijbaan': { vul: '#b7bcbd', lijn: '#93989a', dessin: 'bestrating' },
  'het zonneterras': { vul: '#c9bea8', lijn: '#a4997f', dessin: 'bestrating' },
  'de fietsenstalling': { vul: '#aab0b2', lijn: '#878d90', dessin: 'bestrating' },
  'de tribune': { vul: '#bdb6a6', lijn: '#98917f', dessin: 'bestrating' },
  'de materiaalberging': { vul: '#b1b5b7', lijn: '#8d9194', dessin: 'beton' },
  // Stro op de staldeel, net als bij de koetshuisstal.
  'de giraffenstal': { vul: '#cfae63', lijn: '#a78a44', dessin: 'gras' },
  'het voerhok': { vul: '#c0a673', lijn: '#9a8454', dessin: 'planken' },
  'de speeltuin': { vul: '#d8c48e', lijn: '#b09d6b', dessin: 'gras' },
};

// Waar het meubilair van gemaakt is, per wereld. De namen zijn de materialen
// uit STOFFEN in src/ui/geschilderd.js; wat er niet in staat blijft zoals het
// is. Een wereld die hier niet in staat krijgt gewoon het materiaal dat bij
// de tekening hoort - dat klopt voor een landhuis, een detectiveverhaal en
// een kerstavond, want die spelen zich alle drie in een huis af.
export const WERELDSTOF = {
  station: {
    hout: 'metaal', houtdonker: 'donker', houtrood: 'koper',
    steen: 'metaal', steenkoel: 'donker', touw: 'metaal',
    stof: 'stofblauw', goud: 'metaal',
  },
  woud: {
    metaal: 'steenkoel', donker: 'houtdonker', steen: 'steenkoel',
    stof: 'stofgroen', goud: 'koper', glas: 'water',
  },
  catacomben: {
    hout: 'houtdonker', houtrood: 'steen', papier: 'steen',
    stof: 'steenkoel', glas: 'steenkoel',
  },
  halloween: {
    hout: 'houtdonker', stof: 'stofgroen', goud: 'koper',
  },
  academie: {
    houtrood: 'houtdonker', stof: 'stofblauw', metaal: 'koper',
  },
  // In een ziekenhuis is niets van hout. Alles is staal, kunststof of wit
  // gelakt, want alles moet schoon te maken zijn - en dat zie je meteen
  // als er een houten bak in de operatiekamer staat.
  ziekenhuis: {
    hout: 'metaal', houtdonker: 'donker', houtrood: 'metaal',
    steen: 'papier', goud: 'metaal', touw: 'metaal',
  },
  // Een school heeft wel hout, maar geen mahonie en geen verguldsel.
  school: { houtrood: 'hout', goud: 'metaal', steen: 'steenkoel' },
  // Kantoor: donker fineer, staal, en nergens iets dat glimt.
  kantoor: { houtrood: 'houtdonker', goud: 'metaal', steen: 'steenkoel' },
  // Een zwembad is kunststof en roestvrij staal. Hout rot er weg, en dat
  // zie je: een eikenhouten vat naast een glijbaan klopt niet.
  zwembad: { hout: 'metaal', houtdonker: 'donker', houtrood: 'stofblauw', goud: 'metaal' },
  // Een dierentuin mag juist wél hout hebben - hekken, stallen, bakken -
  // dus die staat hier met opzet niet in.
};

// ------------------------------------------------ hetzelfde meubel, andere wereld
//
// Een soort ruimte zegt wat er staat, niet hoe het heet. Een voorraadkast is
// een voorraadkast, maar in een landhuis is het de provisiekast en op een
// ruimtestation de rantsoenkast. Zolang alleen de soort de naam bepaalde,
// stond er op Meridiaan een eikenhouten vat, een harnas en een
// schrijflessenaar - van staal gemaakt door WERELDSTOF, maar met de naam van
// een landhuis erop. Dat is dezelfde fout als een parketvloer in de
// machinekamer, één laag verder naar binnen.
//
// `zelfde` zijn de namen die in deze wereld al kloppen; ze staan er met opzet
// bij, want een naam die blijft is een keuze en geen vergeten regel. `anders`
// geeft de nieuwe naam, en waar het silhouet zelf liegt ook een andere
// tekening: een bed is geen slaapcapsule, hoe staal je het ook maakt.
//
// Een wereld met `volledig: true` dekt élke naam die er kan opduiken - ook de
// namen die uit een verwante soort komen vallen. tools/check-kamers.mjs
// rekent dat na, zodat er nooit een houten ton op het station staat omdat we
// aan de uitwijkroute niet gedacht hadden.

export const WERELDMEUBELS = {
  station: {
    volledig: true,
    zelfde: [
      'de gereedschapskist', 'het schakelpaneel', 'de magazijnstelling', 'de draaibank',
      'de kweekbak', 'de telescoop', 'de sterrenkaart', 'de chronometer',
    ],
    anders: {
      // de kombuis
      'het fornuis': ['de warmteplaat'],
      'de gootsteen': ['de watertap'],
      'de koelkast': ['de koelcel'],
      'het aanrecht': ['het werkblad'],
      'de spinde': ['de rantsoenkast'],
      'het serviesbuffet': ['de sterilisator'],
      // het vrachtruim
      'het wijnrek': ['het cilinderrek', 'cilinderrek'],
      'het eikenhouten vat': ['de druktank'],
      'de kolenbunker': ['de afvalbunker', 'afvalcontainer'],
      'de werktafel': ['de montagetafel'],
      'de touwhaspel': ['de kabelhaspel'],
      'de stapel kratten': ['de stapel vrachtkisten'],
      // de slaapcabines
      'het bed': ['de slaapcapsule', 'slaapcapsule'],
      'de kleerkast': ['de uitrustingskast'],
      'het nachtkastje': ['het wandkastje'],
      'het wasstel': ['de waterrecycler'],
      'de hutkoffer': ['de persoonlijke locker', 'lockerkast'],
      'de voetenbank': ['het opstapje'],
      // de communicatiekoker
      'de kapstok': ['de pakkenstandaard', 'pakkenrek'],
      'de paraplubak': ['de gereedschapsbus'],
      'de console': ['de klaptafel'],
      'de spiegelstandaard': ['het staande scherm', 'beeldscherm'],
      'het uurwerk': ['de wachtklok'],
      'het harnas': ['het ruimtepak'],
      // de machinekamer
      'de stookpot': ['de reactorketel'],
      'het slijpwiel': ['de slijptol'],
      // de hydrocultuur en de medische post
      'het kruidenkabinet': ['de monsterkoffer'],
      'de distilleerketel': ['de destillatiezuil'],
      'de weegschaal': ['de massameter', 'massameter'],
      'de kolvenrij': ['het analysestation'],
      'de kuipplant': ['de voedingsgoot'],
      // de observatiekoepel
      'de hemelbol': ['de holobol'],
      'het kaartenkabinet': ['het data-archief'],
      'de schrijflessenaar': ['de navigatieconsole', 'navigatieconsole'],
      // uitwijk: de grote ruimten
      'de haard': ['de warmtewand', 'radiator'],
      'de leren fauteuil': ['de rustbank'],
      'de staande klok': ['de tijdzuil', 'klokzuil'],
      'de vleugel': ['de luchtmenger', 'luchtmenger'],
      'de wandspiegel': ['het wandscherm'],
      'het borstbeeld': ['het gedenkbeeld'],
      // uitwijk: waar papier lag staat nu data
      'de boekenkast': ['het serverrek', 'serverrek'],
      'de katheder': ['de terminalstandaard'],
      'de globe': ['de projectiesfeer'],
      'de commode': ['de dossierkast'],
      'de leesstoel': ['de verankerde stoel'],
      'de kaartentafel': ['de plantafel'],
      // uitwijk: de buitenkant van het station is nog steeds binnen
      'de houtstapel': ['de buizenstapel'],
      'de drinkbak': ['de waterbak'],
      'de vuurplaats': ['de brander'],
      'de omgevallen stam': ['de losgeraakte buis'],
      'de waterput': ['de afvalemmer', 'prullenbak'],
      'de mosrichel': ['de zithoek', 'wachtbank'],
      'de regenton': ['de condensor'],
      'de kruiwagen': ['de transportkar'],
      'de boomstronk': ['het ankerblok', 'zitblok'],
      'de vogelverschrikker': ['de antennemast'],
    },
  },

  catacomben: {
    volledig: true,
    zelfde: [
      'de stenen sarcofaag', 'de zuil', 'het bidbankje', 'de kaarsenstandaard',
      'de grafzerk', 'de touwhaspel', 'de gereedschapskist', 'het slijpwiel',
    ],
    anders: {
      // "de knekelnis" is op het bord van zestien bij zestien ook een kamer.
      // Dan noemt een aanwijzing twee verschillende dingen bij dezelfde naam.
      'de knekelnis': ['de botnis'],
      // de verzakte trap, de droge put, de kaarsenkamer
      'het wijnrek': ['het kruikenrek'],
      'het eikenhouten vat': ['het regenvat'],
      'de kolenbunker': ['de puinbak'],
      'de werktafel': ['de steentafel'],
      'de stapel kratten': ['de stapel kisten'],
      // de smalle schacht
      'de kapstok': ['de lampenstaander', 'lampenstaander'],
      'de paraplubak': ['de stokkenbus'],
      'de console': ['de muurplank'],
      'de spiegelstandaard': ['de opgerichte grafplaat'],
      'het uurwerk': ['de zandloper', 'zandloper'],
      'het harnas': ['het grafharnas'],
      // uitwijk: wat er aan gereedschap beneden staat
      'de stookpot': ['de pekketel'],
      'het schakelpaneel': ['de reliekkast', 'reliekkast'],
      'de magazijnstelling': ['de stenen schappen'],
      'de draaibank': ['de steenzaag'],
    },
  },

  woud: {
    volledig: true,
    zelfde: [
      'de houtstapel', 'de drinkbak', 'de vuurplaats', 'de omgevallen stam',
      'de waterput', 'de mosrichel', 'de regenton', 'de kruiwagen',
      'de boomstronk', 'de vogelverschrikker',
      'de touwhaspel', 'de stapel kratten',
      'de stenen sarcofaag', 'de knekelnis', 'de zuil', 'het bidbankje',
      'de kaarsenstandaard', 'de grafzerk',
    ],
    anders: {
      // de omgevallen toren en de vossenburcht: een kelder zonder huis erboven
      'het wijnrek': ['het droogrek'],
      'het eikenhouten vat': ['de verweerde ton'],
      'de kolenbunker': ['de voedertrog'],
      'de werktafel': ['de zaagtafel'],
    },
  },

  noir: {
    anders: {
      // de regenachtige binnenplaats is een binnenplaats, geen boerenerf
      'de houtstapel': ['de stapel pallets'],
      'de drinkbak': ['de stenen goot'],
      'de vuurplaats': ['het vuurvat'],
      'de omgevallen stam': ['de omgevallen paal'],
      'de mosrichel': ['de bank onder het afdak'],
      'de kruiwagen': ['de steekwagen'],
      'de vogelverschrikker': ['de etalagepop'],
    },
  },

  academie: {
    anders: {
      // het ketelhok is een stookhok met buizen, geen meterkast
      'de koelkast': ['de ijskast'],
      'het schakelpaneel': ['de buizenwand'],
      'de stookpot': ['de smeltkroes'],
    },
  },
  // --------------------------------------------------- Het Rietveld College
  // Een gewone middelbare school op een avond. Alles wat hier van hout en
  // kaarslicht was, is nu staal, linoleum en tl.
  school: {
    volledig: true,
    zelfde: [
      'de koelkast', 'de vleugel', 'het borstbeeld', 'de boekenkast',
      'de katheder', 'de globe', 'de werktafel',
      'de stapel kratten', 'de kapstok', 'de gereedschapskist',
      'het schakelpaneel', 'de magazijnstelling', 'het slijpwiel',
      'de draaibank', 'de kruiwagen', 'de kweekbak',
      'de distilleerketel', 'de weegschaal', 'de kolvenrij', 'de kuipplant',
    ],
    anders: {
      'het fornuis': ['de grootkeukenoven'],
      'de gootsteen': ['de spoelbak'],
      'het aanrecht': ['de uitgiftebalie', 'balie'],
      'de spinde': ['de snoepautomaat', 'automaat'],
      'het serviesbuffet': ['de vaatwasser'],
      'de haard': ['de radiator', 'radiator'],
      'de leren fauteuil': ['de bureaustoel', 'bureaustoel'],
      'de staande klok': ['de klokzuil', 'klokzuil'],
      'de wandspiegel': ['het whiteboard', 'whiteboard'],
      'de commode': ['het ladenblok', 'archiefkast'],
      'de kaartentafel': ['de studietafel'],
      'de leesstoel': ['de leeszitzak'],
      'het wijnrek': ['het fietsenrek', 'fietsenrek'],
      'het eikenhouten vat': ['de zoutton'],
      'de kolenbunker': ['de afvalcontainer', 'afvalcontainer'],
      'de touwhaspel': ['de kabelhaspel'],
      'het bed': ['de behandelbank', 'ziekenhuisbed'],
      'de kleerkast': ['de lockerkast', 'lockerkast'],
      'het nachtkastje': ['het schoenenkastje'],
      'het wasstel': ['de wasbak'],
      'de hutkoffer': ['de kledingkist'],
      'de voetenbank': ['het opstapbankje'],
      'de paraplubak': ['de parapluhouder'],
      'de console': ['de balie bij de ingang'],
      'de spiegelstandaard': ['het mededelingenscherm', 'beeldscherm'],
      'het uurwerk': ['de schoolklok'],
      'het harnas': ['de brandblusser', 'brandblusser'],
      'de stookpot': ['de verfpot'],
      'de houtstapel': ['de stapel stoeptegels'],
      'de drinkbak': ['de drinkfontein'],
      'de vuurplaats': ['de lantaarnpaal', 'lantaarnpaal'],
      'de omgevallen stam': ['de omgevallen boom'],
      'de waterput': ['de prullenbak', 'prullenbak'],
      'de mosrichel': ['de bank bij de ingang', 'marmerbank'],
      'de regenton': ['het regenvat'],
      'de vogelverschrikker': ['de vlaggenmast', 'vlaggenmast'],
      'de boomstronk': ['het zitblok', 'zitblok'],
      'het kruidenkabinet': ['het stoffenkabinet'],
    },
  },

  // ------------------------------------------------ Sint-Joris, nachtdienst
  // Vinyl, roestvrij staal en apparaten op wielen. Niets staat hier voor de
  // sier; alles kan verplaatst worden en alles is af te nemen.
  ziekenhuis: {
    volledig: true,
    zelfde: [
      'de koelkast', 'de kapstok', 'de stapel kratten', 'de kruiwagen',
      'de kweekbak', 'de weegschaal', 'de kolvenrij',
      'de kuipplant',
    ],
    anders: {
      'het fornuis': ['de kookplaat'],
      'de gootsteen': ['de spoelbak'],
      'het aanrecht': ['het werkblad'],
      'de spinde': ['de snackautomaat', 'automaat'],
      'het serviesbuffet': ['de vaatwasser'],
      'de haard': ['de radiator', 'radiator'],
      'de leren fauteuil': ['de bureaustoel', 'bureaustoel'],
      'de staande klok': ['de klokzuil', 'klokzuil'],
      'de vleugel': ['het informatiescherm', 'beeldscherm'],
      'de wandspiegel': ['het prikbord', 'whiteboard'],
      'het borstbeeld': ['het bronzen beeld'],
      'de boekenkast': ['de medicijnkast'],
      'de katheder': ['de uitgiftelessenaar'],
      'de globe': ['de anatomiebol'],
      'de commode': ['het ladenblok', 'archiefkast'],
      'de leesstoel': ['de bezoekersfauteuil'],
      'de kaartentafel': ['de uitgiftetafel'],
      'het wijnrek': ['het linnenrek'],
      'het eikenhouten vat': ['de wascontainer', 'afvalcontainer'],
      'de kolenbunker': ['de afvalemmer', 'prullenbak'],
      'de werktafel': ['de inpaktafel'],
      'de touwhaspel': ['de slangenhaspel'],
      'het bed': ['het ziekenhuisbed', 'ziekenhuisbed'],
      'de kleerkast': ['de patiëntenkast', 'lockerkast'],
      'het nachtkastje': ['het nachtkastje'],
      'het wasstel': ['de wasbak'],
      'de hutkoffer': ['de infuusstandaard', 'infuusstandaard'],
      'de voetenbank': ['het opstapbankje'],
      'de paraplubak': ['de parapluhouder'],
      'de console': ['de overdrachtskar'],
      'de spiegelstandaard': ['de spiegel bij de lift'],
      'het uurwerk': ['de gangklok'],
      'het harnas': ['de brandblusser', 'brandblusser'],
      'de gereedschapskist': ['de instrumentenkist'],
      'de stookpot': ['de sterilisator'],
      'het schakelpaneel': ['het bedieningspaneel'],
      'de magazijnstelling': ['de voorraadstelling'],
      'het slijpwiel': ['het statief'],
      'de draaibank': ['de scanner'],
      'de houtstapel': ['de stapel tegels'],
      'de drinkbak': ['de drinkfontein'],
      'de vuurplaats': ['de lantaarnpaal', 'lantaarnpaal'],
      'de omgevallen stam': ['de parasol', 'parasol'],
      'de boomstronk': ['het zitblok', 'zitblok'],
      'de waterput': ['de ronde plantenbak', 'plantenbakrond'],
      'de mosrichel': ['de tuinbank', 'wachtbank'],
      'de regenton': ['het regenvat'],
      'de vogelverschrikker': ['de vlaggenmast', 'vlaggenmast'],
      'het kruidenkabinet': ['het verbandkabinet'],
      'de distilleerketel': ['de autoclaaf'],
    },
  },

  // ------------------------------------------------------ De Spiegeltoren
  // Kantoor na sluitingstijd: tapijttegels, systeemplafond, en alles in
  // hetzelfde grijs dat niemand ooit gekozen heeft.
  kantoor: {
    volledig: true,
    zelfde: [
      'de koelkast', 'de katheder', 'de globe', 'de kapstok',
    ],
    anders: {
      'het fornuis': ['de kookplaat'],
      'de gootsteen': ['de spoelbak'],
      'het aanrecht': ['de uitgiftebalie', 'balie'],
      'de spinde': ['de snackautomaat', 'automaat'],
      'het serviesbuffet': ['de koffieautomaat', 'koffieautomaat'],
      'de haard': ['de radiator', 'radiator'],
      'de leren fauteuil': ['de bureaustoel', 'bureaustoel'],
      'de staande klok': ['de klokzuil', 'klokzuil'],
      'de vleugel': ['het presentatiescherm', 'beeldscherm'],
      'de wandspiegel': ['het whiteboard', 'whiteboard'],
      'het borstbeeld': ['het kunstwerk op sokkel'],
      'de boekenkast': ['de dossierkast'],
      'de commode': ['het ladenblok', 'archiefkast'],
      'de leesstoel': ['de directiefauteuil'],
      'de kaartentafel': ['de overlegtafel'],
      'het wijnrek': ['de fietsenstalling', 'fietsenrek'],
      'het eikenhouten vat': ['het olievat'],
      'de kolenbunker': ['de afvalcontainer', 'afvalcontainer'],
      'de werktafel': ['de montagetafel'],
      'de touwhaspel': ['de kabelhaspel'],
      'de stapel kratten': ['de stapel verhuisdozen'],
      'het bed': ['het rustbed'],
      'de kleerkast': ['de lockerkast', 'lockerkast'],
      'het nachtkastje': ['het bijzettafeltje'],
      'het wasstel': ['de wasbak'],
      'de hutkoffer': ['de archiefdoos'],
      'de voetenbank': ['het voetenbankje'],
      'de paraplubak': ['de parapluhouder'],
      'de console': ['de wandconsole'],
      'de spiegelstandaard': ['de liftspiegel'],
      'het uurwerk': ['de wandklok'],
      'het harnas': ['de brandblusser', 'brandblusser'],
      'de gereedschapskist': ['de gereedschapskoffer'],
      'de stookpot': ['het noodaggregaat'],
      'het schakelpaneel': ['het patchpaneel'],
      'de magazijnstelling': ['de pakketstelling'],
      'het slijpwiel': ['het dossierrek', 'dossierrek'],
      'de draaibank': ['de frankeermachine'],
      'de houtstapel': ['de stapel tegels'],
      'de drinkbak': ['de drinkfontein'],
      'de vuurplaats': ['de terrasbrander'],
      'de omgevallen stam': ['de terrasparasol', 'parasol'],
      'de waterput': ['de ronde plantenbak', 'plantenbakrond'],
      'de mosrichel': ['de terrasbank', 'wachtbank'],
      'de regenton': ['de regenbak'],
      'de kruiwagen': ['de bagagekar', 'rolkar'],
      'de boomstronk': ['de houten kubus', 'zitblok'],
      'de vogelverschrikker': ['de vlaggenmast', 'vlaggenmast'],
    },
  },
  // ------------------------------------------------------ Het Openluchtbad
  // Zomer, chloor en plastic. Niets van hout, niets van vroeger.
  zwembad: {
    volledig: true,
    zelfde: [
      'de kapstok', 'de stapel kratten', 'de gereedschapskist',
      'het schakelpaneel', 'de kuipplant',
      // De soort `bad` is al in zwembadtaal geschreven; hier valt niets
      // om te dopen.
      'het startblok', 'het zwemtrapje', 'de duikplank', 'de reddingsboei',
      'de reddingshaak', 'de peilpaal', 'de badmeesterstoel',
      'de lijnenhaspel', 'de kickplankbak', 'de wedstrijdklok',
    ],
    anders: {
      'het fornuis': ['de frituur'],
      'de gootsteen': ['de spoelbak'],
      'de koelkast': ['de ijskast'],
      'het aanrecht': ['de uitgiftebalie', 'balie'],
      'de spinde': ['de snoepautomaat', 'automaat'],
      'het serviesbuffet': ['de koffiemachine', 'koffieautomaat'],
      'de haard': ['de parasol', 'parasol'],
      'de leren fauteuil': ['het ligbed', 'ligbed'],
      'de staande klok': ['de klokzuil', 'klokzuil'],
      'de vleugel': ['het scorebord', 'beeldscherm'],
      'de wandspiegel': ['het mededelingenbord', 'whiteboard'],
      'het borstbeeld': ['de zwembandenmand', 'zwembandenmand'],
      'het wijnrek': ['de voorraadstelling', 'dossierrek'],
      'het eikenhouten vat': ['de chloorton'],
      'de kolenbunker': ['de afvalcontainer', 'afvalcontainer'],
      'de werktafel': ['de montagetafel'],
      'de touwhaspel': ['de slanghaspel'],
      'het bed': ['de kleedbank', 'wachtbank'],
      'de kleerkast': ['de lockerkast', 'lockerkast'],
      'het nachtkastje': ['het muntkluisje'],
      'het wasstel': ['de wasbak'],
      'de hutkoffer': ['de zwemtas'],
      'de voetenbank': ['het opstapbankje'],
      'de paraplubak': ['de parapluhouder'],
      'de console': ['de handdoekplank'],
      'de spiegelstandaard': ['de douchepaal', 'douchepaal'],
      'het uurwerk': ['de radiator', 'radiator'],
      'het harnas': ['de brandblusser', 'brandblusser'],
      'de stookpot': ['de boiler'],
      'de magazijnstelling': ['het fietsenrek', 'fietsenrek'],
      'het slijpwiel': ['de fietspomp'],
      'de draaibank': ['de reparatiebank'],
      'de houtstapel': ['de stapel ligbedden'],
      'de drinkbak': ['de drinkfontein'],
      'de vuurplaats': ['de barbecue'],
      'de omgevallen stam': ['de omgevallen bank', 'mosbank'],
      'de waterput': ['de ronde plantenbak', 'plantenbakrond'],
      'de mosrichel': ['de bank bij de ingang', 'marmerbank'],
      'de regenton': ['de prullenbak', 'prullenbak'],
      'de kruiwagen': ['de schoonmaakkar', 'rolkar'],
      'de boomstronk': ['het zitblok bij de ingang', 'zitblok'],
      'de vogelverschrikker': ['de vlaggenmast', 'vlaggenmast'],
      'de kweekbak': ['de brancard', 'ziekenhuisbed'],
      'het kruidenkabinet': ['het verbandkabinet'],
      'de distilleerketel': ['de infuusstandaard', 'infuusstandaard'],
      'de weegschaal': ['de weegschaal', 'massameter'],
      'de kolvenrij': ['de medicijntafel'],
    },
  },

  // --------------------------------------------- Dierenpark De Wildhoek
  // Hout en gaas en emmers, maar van nu: een dierentuin is geen landhuis.
  dierentuin: {
    volledig: true,
    zelfde: [
      'de drinkbak', 'de omgevallen stam', 'de regenton', 'de kruiwagen',
      'de boomstronk', 'de stapel kratten', 'de globe', 'de kuipplant',
      'de gootsteen',
      'de palmkuip', 'de rieten stoel', 'de gieterplank', 'de marmeren bank',
      'de citrusboom',
      'de reddingsboei', 'de peilpaal',
    ],
    anders: {
      'het fornuis': ['de grill'],
      'de koelkast': ['de ijsvitrine'],
      'het aanrecht': ['de uitgiftebalie', 'balie'],
      'de spinde': ['de drankautomaat', 'automaat'],
      'het serviesbuffet': ['de dienbladenkar', 'rolkar'],
      'de houtstapel': ['de stapel balen stro'],
      'de vuurplaats': ['de lantaarnpaal', 'lantaarnpaal'],
      'de waterput': ['de waterpomp'],
      'de mosrichel': ['de picknickbank', 'wachtbank'],
      'de vogelverschrikker': ['de vlaggenmast', 'vlaggenmast'],
      'het wijnrek': ['het hooirek', 'hooirek'],
      'het eikenhouten vat': ['het watervat'],
      'de kolenbunker': ['de voederkist'],
      'de werktafel': ['de verzorgingstafel'],
      'de touwhaspel': ['de slanghaspel'],
      'de boekenkast': ['het souvenirrek'],
      // Het pinguinbad deelt de soort `bad` met het zwembad, maar niet zijn
      // taal: een wedstrijdklok hangt niet bij de pinguins. Zelfde tekening,
      // andere naam - en elke naam moet nog steeds kloppen met wat je ziet.
      'het startblok': ['het opstapblok', 'startblok'],
      'het zwemtrapje': ['de klimtrap', 'zwemtrapje'],
      'de duikplank': ['de voerplank', 'duikplank'],
      'de reddingshaak': ['de vangstok', 'reddingshaak'],
      'de badmeesterstoel': ['de uitkijkstoel', 'badmeesterstoel'],
      'de lijnenhaspel': ['de netrol', 'lijnenhaspel'],
      'de kickplankbak': ['de speelgoedbak', 'kickplankbak'],
      'de wedstrijdklok': ['de voerklok', 'wedstrijdklok'],
      'de katheder': ['de kassazuil'],
      'de commode': ['de ladenkast', 'archiefkast'],
      'de leesstoel': ['de winkelkruk'],
      'de kaartentafel': ['de uitstaltafel'],
      'de kweekbak': ['de behandelbank', 'ziekenhuisbed'],
      'het kruidenkabinet': ['het medicijnkabinet'],
      'de distilleerketel': ['de sterilisator'],
      'de weegschaal': ['de dierenweegschaal'],
      'de kolvenrij': ['de monsterplank'],
      'de oppotbak': ['de potgrondzak'],
    },
  },
};



// Welke soorten een wereld aanspreekt als zijn eigen meubilair opraakt.
//
// Boven staat VERWANTE_SOORTEN: wat er in het algemeen naast elkaar hoort in
// een huis. Onder de grond en in het bos staat geen huis. Een gang in de
// catacomben die uitwijkt naar een slaapkamer levert een nachtkastje op, en
// een kelder in het woud een wijnrek: dat is precies hoe een vleugel in een
// grafgewelf terechtkomt. Hier blijft de uitwijk in de wereld zelf.
export const WERELDVERWANT = {
  // Vier soorten die naar elkaar uitwijken. Drie was te krap: een gewelf met
  // dertien meubelstukken op het bord van zestien bij zestien kwam zonder
  // namen te zitten, en dan valt de hele puzzel om.
  catacomben: {
    grafkelder: ['kelder', 'gang', 'werkplaats'],
    kelder: ['grafkelder', 'gang', 'werkplaats'],
    gang: ['grafkelder', 'kelder', 'werkplaats'],
  },
  woud: {
    buiten: ['kelder', 'grafkelder'],
    kelder: ['grafkelder', 'buiten'],
    grafkelder: ['buiten', 'kelder'],
  },
  // In een school, een ziekenhuis en een kantoortoren staat geen
  // sterrenwacht. Dat die hier van oudsher de uitwijk van de bibliotheek
  // is, zou betekenen dat er een telescoop in de mediatheek kan opduiken.
  school: { bibliotheek: ['zaal', 'gang'] },
  ziekenhuis: { bibliotheek: ['zaal', 'gang'] },
  kantoor: { bibliotheek: ['zaal', 'gang'] },
  // Bij deze twee snoeien we het bereik stevig terug. Een zwembad heeft
  // geen bibliotheek en een dierentuin geen werkplaats; laat je de
  // standaarduitwijk staan, dan komt er via een omweg alsnog een
  // boekenkast of een draaibank op het terrein.
  zwembad: {
    zaal: ['gang', 'slaapkamer'],
    laboratorium: ['werkplaats', 'keuken'],
  },
  dierentuin: {
    bibliotheek: ['serre', 'keuken'],
    kelder: ['buiten', 'keuken'],
    keuken: ['kelder', 'buiten'],
    buiten: ['kelder', 'serre'],
    laboratorium: ['keuken', 'bibliotheek'],
    serre: ['keuken', 'bibliotheek'],
  },
};

// ------------------------------------------------- tekeningen van vroeger
//
// Een wereldlaag kan namen omdopen, geen beeld. Op het ruimtestation heette
// het harnas "het ruimtepak", de staande klok "de tijdzuil" en de
// vogelverschrikker "de antennemast" - en op het bord stond gewoon een
// ridder, een staande klok en een vogelverschrikker. Guus: "een ridder in
// een ruimteschip, dat kan niet".
//
// Dit zijn de tekeningen die bij een landhuis van 1930 horen, een bos of een
// grafkelder, en in een wereld van nu niets anders kunnen zijn dan wat ze
// zijn. tools/check-kamers.mjs faalt zodra een wereld uit MODERNE_WERELDEN
// er eentje op een bord kan zetten, onder welke naam ook.
export const OUDERWETS = [
  // het landhuis
  'harnas', 'staandespiegel', 'wandspiegel', 'haard', 'staandeklok', 'gangklok',
  'hutkoffer', 'vat', 'kolenkist', 'wastafel', 'voetenbank', 'wijnrek',
  'kruidenkast', 'distilleerketel', 'slijpsteen', 'chronometer',
  // het erf en het bos
  'vogelverschrikker', 'put', 'houtstapel', 'vuur', 'stam', 'boomstronk',
  'regenton', 'mosbank', 'drinkbak',
  // de grafkelder
  'zandloper', 'sarcofaag', 'knekelnis', 'grafzerk', 'bidbank', 'kaarsentafel',
  'lampenstaander', 'reliekkast',
];

// De werelden die nu spelen. Hier mag niets uit OUDERWETS op een bord komen.
export const MODERNE_WERELDEN = ['station', 'school', 'ziekenhuis', 'kantoor', 'zwembad'];

// De naam en de tekening die in deze wereld bij een meubelstuk horen.
const omdopen = ([naam, icoon], laag) => {
  const nieuw = laag?.anders?.[naam];
  return nieuw ? [nieuw[0], nieuw[1] ?? icoon] : [naam, icoon];
};
