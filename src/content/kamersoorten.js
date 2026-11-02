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
  // Het Verstilde Woud
  'de doornenkom': 'buiten',
  'het wilgenhoofd': 'buiten',
  'de omgevallen toren': 'kelder',
  'de dampende poel': 'buiten',
  'het hertenpad': 'buiten',
  'de steenkring': 'grafkelder',
  'het verzonken bruggetje': 'buiten',
  'de holle eik': 'buiten',
  // De Catacomben van Sint-Oda
  'het beenderengewelf': 'grafkelder',
  'de verzakte trap': 'kelder',
  'de droge put': 'kelder',
  'de bidkapel': 'grafkelder',
  'het waterpeilgat': 'kelder',
  'de ingestorte nis': 'grafkelder',
  'de smalle schacht': 'gang',
  'het grafvertrek': 'grafkelder',
  // Academie Morgenstond
  'de spiegelzaal': 'zaal',
  'het ketelhok': 'werkplaats',
  'de verboden trappenhal': 'gang',
  'het herbarium': 'laboratorium',
  'de studiecel': 'bibliotheek',
  'de sterrenkoepel': 'sterrenwacht',
  'de eetzaal': 'keuken',
  'het archief': 'bibliotheek',
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
  'de donkere veranda': 'buiten',
  'de pompoenkamer': 'zaal',
  'de spinnenwebzolder': 'kelder',
  'de kaarsengang': 'gang',
  'de kelder met het luik': 'kelder',
  'de achtertuin bij het hek': 'buiten',
  'de garage': 'werkplaats',
  'de slaapkamer boven': 'slaapkamer',
  'de griezelkeuken': 'keuken',
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

// De namen die in deze soort ruimte mogen staan, in volgorde van voorkeur.
export function meubelsVoor(soort) {
  const eigen = MEUBELS_VAN[soort] ?? MEUBELS_VAN.zaal;
  const verwant = (VERWANTE_SOORTEN[soort] ?? []).flatMap((s) => MEUBELS_VAN[s] ?? []);
  return [eigen, verwant];
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
