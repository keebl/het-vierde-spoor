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
  'de wintertuin': 'buiten',
  'de biljartkamer': 'zaal',
  'de dienstgang': 'gang',
  'de wijnkelder': 'kelder',
  'het rookkabinet': 'zaal',
  'de muziekzaal': 'zaal',
  'de koetshuiszolder': 'werkplaats',
  'de keuken': 'keuken',
  'de jachtkamer': 'zaal',
  'de orangerie': 'buiten',
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
  'de serre': 'buiten',
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
};

// De vloer per soort. dessin verwijst naar een patroon in board-rooms.js.
//
// Deze kleuren zijn met opzet verzadigd en warm. De eerste versie was een
// rij pastels, en dan ziet een plattegrond eruit als een bouwtekening: kaal
// en kil. Een keuken hoort warm te zijn, een grafkelder koud, een bos groen.
// Dat verschil tussen de kamers is wat een bord sfeer geeft.
export const VLOER_VAN = {
  keuken:       { vul: '#d9c091', lijn: '#b39a6a', dessin: 'tegels' },
  zaal:         { vul: '#cb9f62', lijn: '#a67c41', dessin: 'planken' },
  bibliotheek:  { vul: '#b5884f', lijn: '#8f6835', dessin: 'planken-dwars' },
  kelder:       { vul: '#a89878', lijn: '#86795c', dessin: 'steen' },
  slaapkamer:   { vul: '#c99183', lijn: '#a26f62', dessin: 'tapijt' },
  gang:         { vul: '#c6b291', lijn: '#9c8a70', dessin: 'ruiten' },
  werkplaats:   { vul: '#a2abb4', lijn: '#808a94', dessin: 'beton' },
  buiten:       { vul: '#9bc174', lijn: '#79a052', dessin: 'gras' },
  grafkelder:   { vul: '#95978b', lijn: '#74766a', dessin: 'steen' },
  laboratorium: { vul: '#9cc4b8', lijn: '#77a295', dessin: 'tegels' },
  sterrenwacht: { vul: '#a8865c', lijn: '#836742', dessin: 'planken' },
};

// Wat staat er in zo'n ruimte? Naam plus de tekening die erbij hoort.
//
// Elke naam heeft zijn eigen tekening. Een aanrecht is geen tafel en een
// slijpsteen is geen touwhaspel, dus ze mogen ook niet hetzelfde plaatje
// delen: tools/check-kamers.mjs faalt zodra dat gebeurt.
export const MEUBELS_VAN = {
  keuken: [
    ['het fornuis', 'fornuis'], ['de gootsteen', 'gootsteen'], ['de koelkast', 'koelkast'],
    ['het aanrecht', 'aanrecht'], ['de provisiekast', 'provisiekast'], ['de vaatkast', 'vaatkast'],
  ],
  zaal: [
    ['de haard', 'haard'], ['de leren fauteuil', 'fauteuil'], ['de staande klok', 'staandeklok'],
    ['de vleugel', 'vleugel'], ['de wandspiegel', 'wandspiegel'], ['het borstbeeld', 'buste'],
  ],
  bibliotheek: [
    ['de boekenkast', 'boekenkast'], ['de lessenaar', 'lessenaar'], ['de globe', 'globe'],
    ['de ladekast', 'ladekast'], ['de leesstoel', 'stoel'], ['de kaartentafel', 'kaartentafel'],
  ],
  kelder: [
    ['het wijnrek', 'wijnrek'], ['het eikenhouten vat', 'vat'], ['de kolenkist', 'kolenkist'],
    ['de werkbank', 'werkbank'], ['de touwhaspel', 'touwhaspel'], ['de stapel kratten', 'krat'],
  ],
  slaapkamer: [
    ['het bed', 'bed'], ['de kleerkast', 'kleerkast'], ['het nachtkastje', 'nachtkastje'],
    ['de wastafel', 'wastafel'], ['de hutkoffer', 'hutkoffer'], ['de voetenbank', 'voetenbank'],
  ],
  gang: [
    ['de kapstok', 'kapstok'], ['de paraplubak', 'paraplubak'], ['de wandtafel', 'wandtafel'],
    ['de staande spiegel', 'staandespiegel'], ['de gangklok', 'gangklok'], ['het harnas', 'harnas'],
  ],
  werkplaats: [
    ['de gereedschapskist', 'gereedschapskist'], ['de ketel', 'ketel'],
    ['de schakelkast', 'schakelkast'], ['het laadrek', 'laadrek'],
    ['de slijpsteen', 'slijpsteen'], ['de draaibank', 'draaibank'],
  ],
  buiten: [
    ['de houtstapel', 'houtstapel'], ['de drinkbak', 'drinkbak'], ['de vuurplaats', 'vuur'],
    ['de omgevallen stam', 'stam'], ['de waterput', 'put'], ['de mosbank', 'mosbank'],
    ['de regenton', 'regenton'], ['de kruiwagen', 'kruiwagen'],
    ['de boomstronk', 'boomstronk'], ['de vogelverschrikker', 'vogelverschrikker'],
  ],
  grafkelder: [
    ['de stenen sarcofaag', 'sarcofaag'], ['de knekelnis', 'knekelnis'], ['de zuil', 'zuil'],
    ['het bidbankje', 'bidbank'], ['de kaarsentafel', 'kaarsentafel'], ['de grafzerk', 'grafzerk'],
  ],
  laboratorium: [
    ['de kweekbak', 'kweekbak'], ['de kruidenkast', 'kruidenkast'],
    ['de distilleerketel', 'distilleerketel'], ['de weegschaal', 'weegschaal'],
    ['de proeventafel', 'proeventafel'], ['de plantenbak', 'plantenbak'],
  ],
  sterrenwacht: [
    ['de telescoop', 'telescoop'], ['de hemelbol', 'hemelbol'], ['de sterrenkaart', 'sterrenkaart'],
    ['de kaartenkast', 'kaartenkast'], ['de schrijflessenaar', 'schrijflessenaar'],
    ['de chronometer', 'chronometer'],
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
  grafkelder: ['kelder', 'buiten'],
  laboratorium: ['werkplaats', 'bibliotheek'],
  sterrenwacht: ['bibliotheek', 'zaal'],
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
      'de gereedschapskist', 'de schakelkast', 'het laadrek', 'de draaibank',
      'de kweekbak', 'de telescoop', 'de sterrenkaart', 'de chronometer',
    ],
    anders: {
      // de kombuis
      'het fornuis': ['de warmteplaat'],
      'de gootsteen': ['de watertap'],
      'de koelkast': ['de koelcel'],
      'het aanrecht': ['het werkblad'],
      'de provisiekast': ['de rantsoenkast'],
      'de vaatkast': ['de sterilisator'],
      // het vrachtruim
      'het wijnrek': ['het cilinderrek', 'cilinderrek'],
      'het eikenhouten vat': ['de druktank'],
      'de kolenkist': ['de afvalbunker'],
      'de werkbank': ['de montagebank'],
      'de touwhaspel': ['de kabelhaspel'],
      'de stapel kratten': ['de stapel vrachtkisten'],
      // de slaapcabines
      'het bed': ['de slaapcapsule', 'slaapcapsule'],
      'de kleerkast': ['de uitrustingskast'],
      'het nachtkastje': ['het wandkastje'],
      'de wastafel': ['de waterrecycler'],
      'de hutkoffer': ['de persoonlijke locker'],
      'de voetenbank': ['het opstapje'],
      // de communicatiekoker
      'de kapstok': ['het pakkenrek', 'pakkenrek'],
      'de paraplubak': ['de gereedschapsbus'],
      'de wandtafel': ['de klaptafel'],
      'de staande spiegel': ['het staande scherm'],
      'de gangklok': ['de wachtklok'],
      'het harnas': ['het ruimtepak'],
      // de machinekamer
      'de ketel': ['de reactorketel'],
      'de slijpsteen': ['de slijptol'],
      // de hydrocultuur en de medische post
      'de kruidenkast': ['de stalenkast'],
      'de distilleerketel': ['de destillatiezuil'],
      'de weegschaal': ['de massameter', 'massameter'],
      'de proeventafel': ['de analysetafel'],
      'de plantenbak': ['de hydrobak'],
      // de observatiekoepel
      'de hemelbol': ['de holobol'],
      'de kaartenkast': ['de datakast'],
      'de schrijflessenaar': ['de navigatieconsole', 'navigatieconsole'],
      // uitwijk: de grote ruimten
      'de haard': ['de warmtecel'],
      'de leren fauteuil': ['de rustbank'],
      'de staande klok': ['de tijdzuil'],
      'de vleugel': ['de luchtmenger', 'luchtmenger'],
      'de wandspiegel': ['het wandscherm'],
      'het borstbeeld': ['het gedenkbeeld'],
      // uitwijk: waar papier lag staat nu data
      'de boekenkast': ['het serverrek', 'serverrek'],
      'de lessenaar': ['de terminalstandaard'],
      'de globe': ['de projectiebol'],
      'de ladekast': ['de dossierkast'],
      'de leesstoel': ['de verankerde stoel'],
      'de kaartentafel': ['de plantafel'],
      // uitwijk: de buitenkant van het station is nog steeds binnen
      'de houtstapel': ['de buizenstapel'],
      'de drinkbak': ['de waterbak'],
      'de vuurplaats': ['de brander'],
      'de omgevallen stam': ['de losgeraakte buis'],
      'de waterput': ['de peilput'],
      'de mosbank': ['de zitbank'],
      'de regenton': ['de condensor'],
      'de kruiwagen': ['de transportkar'],
      'de boomstronk': ['het ankerblok'],
      'de vogelverschrikker': ['de antennemast'],
    },
  },

  catacomben: {
    volledig: true,
    zelfde: [
      'de stenen sarcofaag', 'de zuil', 'het bidbankje', 'de kaarsentafel',
      'de grafzerk', 'de touwhaspel', 'de gereedschapskist', 'de slijpsteen',
    ],
    anders: {
      // "de knekelnis" is op het bord van zestien bij zestien ook een kamer.
      // Dan noemt een aanwijzing twee verschillende dingen bij dezelfde naam.
      'de knekelnis': ['de botnis'],
      // de verzakte trap, de droge put, de kaarsenkamer
      'het wijnrek': ['het kruikenrek'],
      'het eikenhouten vat': ['de waterton'],
      'de kolenkist': ['de puinkist'],
      'de werkbank': ['de steenbank'],
      'de stapel kratten': ['de stapel kisten'],
      // de smalle schacht
      'de kapstok': ['de lampenstaander', 'lampenstaander'],
      'de paraplubak': ['de stokkenbus'],
      'de wandtafel': ['de muurplank'],
      'de staande spiegel': ['de opgerichte grafplaat'],
      'de gangklok': ['de zandloper', 'zandloper'],
      'het harnas': ['het grafharnas'],
      // uitwijk: wat er aan gereedschap beneden staat
      'de ketel': ['de pekketel'],
      'de schakelkast': ['de reliekkast', 'reliekkast'],
      'het laadrek': ['het stellingrek'],
      'de draaibank': ['de steenzaag'],
    },
  },

  woud: {
    volledig: true,
    zelfde: [
      'de houtstapel', 'de drinkbak', 'de vuurplaats', 'de omgevallen stam',
      'de waterput', 'de mosbank', 'de regenton', 'de kruiwagen',
      'de boomstronk', 'de vogelverschrikker',
      'de touwhaspel', 'de stapel kratten',
      'de stenen sarcofaag', 'de knekelnis', 'de zuil', 'het bidbankje',
      'de kaarsentafel', 'de grafzerk',
    ],
    anders: {
      // de omgevallen toren en de vossenburcht: een kelder zonder huis erboven
      'het wijnrek': ['het droogrek'],
      'het eikenhouten vat': ['de verweerde ton'],
      'de kolenkist': ['de voederkist'],
      'de werkbank': ['de houtbank'],
    },
  },

  noir: {
    anders: {
      // de regenachtige binnenplaats is een binnenplaats, geen boerenerf
      'de houtstapel': ['de stapel pallets'],
      'de drinkbak': ['de stenen goot'],
      'de vuurplaats': ['het vuurvat'],
      'de omgevallen stam': ['de omgevallen paal'],
      'de mosbank': ['de bank onder het afdak'],
      'de kruiwagen': ['de steekwagen'],
      'de vogelverschrikker': ['de etalagepop'],
    },
  },

  academie: {
    anders: {
      // het ketelhok is een stookhok met buizen, geen meterkast
      'de koelkast': ['de ijskast'],
      'de schakelkast': ['de buizenkast'],
      'de ketel': ['de stookketel'],
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
};

// De naam en de tekening die in deze wereld bij een meubelstuk horen.
const omdopen = ([naam, icoon], laag) => {
  const nieuw = laag?.anders?.[naam];
  return nieuw ? [nieuw[0], nieuw[1] ?? icoon] : [naam, icoon];
};
