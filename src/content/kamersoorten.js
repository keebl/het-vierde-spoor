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
};

// De vloer per soort. dessin verwijst naar een patroon in board-rooms.js.
export const VLOER_VAN = {
  keuken:       { vul: '#cfd8d6', lijn: '#b0bdba', dessin: 'tegels' },
  zaal:         { vul: '#d8c29b', lijn: '#bfa478', dessin: 'planken' },
  bibliotheek:  { vul: '#c9ab7b', lijn: '#ad8e5c', dessin: 'planken-dwars' },
  kelder:       { vul: '#c0b7a6', lijn: '#a69b88', dessin: 'ruiten' },
  slaapkamer:   { vul: '#ddc9a6', lijn: '#c4ae86', dessin: 'planken' },
  gang:         { vul: '#d2a894', lijn: '#b98a74', dessin: 'planken-dwars' },
  werkplaats:   { vul: '#c3c7cc', lijn: '#a7acb3', dessin: 'tegels' },
  buiten:       { vul: '#bed0a8', lijn: '#a1b88a', dessin: 'ruiten' },
  grafkelder:   { vul: '#b9b3a8', lijn: '#9d968a', dessin: 'tegels' },
  laboratorium: { vul: '#c3d6c0', lijn: '#a5bfa2', dessin: 'tegels' },
  sterrenwacht: { vul: '#c9b48f', lijn: '#ad9870', dessin: 'ruiten' },
};

// Wat staat er in zo'n ruimte? Naam plus het icoon dat erbij hoort.
export const MEUBELS_VAN = {
  keuken: [
    ['het fornuis', 'fornuis'], ['de gootsteen', 'gootsteen'], ['de koelkast', 'koelkast'],
    ['het aanrecht', 'tafel'], ['de provisiekast', 'kast'], ['de vaatkast', 'rek'],
  ],
  zaal: [
    ['de haard', 'haard'], ['de leren fauteuil', 'fauteuil'], ['de staande klok', 'staandeklok'],
    ['de vleugel', 'vleugel'], ['de wandspiegel', 'spiegelstandaard'], ['het borstbeeld', 'buste'],
  ],
  bibliotheek: [
    ['de boekenkast', 'boekenkast'], ['de lessenaar', 'lessenaar'], ['de globe', 'globe'],
    ['de ladekast', 'kast'], ['de leesstoel', 'stoel'], ['de kaartentafel', 'kaartentafel'],
  ],
  kelder: [
    ['het wijnrek', 'rek'], ['het eikenhouten vat', 'vat'], ['de kolenkist', 'kist'],
    ['de werkbank', 'tafel'], ['de touwhaspel', 'haspel'], ['de stapel kratten', 'krat'],
  ],
  slaapkamer: [
    ['het bed', 'bed'], ['de kleerkast', 'kast'], ['het nachtkastje', 'tafel'],
    ['de wastafel', 'gootsteen'], ['de hutkoffer', 'kist'], ['de voetenbank', 'mosbank'],
  ],
  gang: [
    ['de kapstok', 'kapstok'], ['de paraplubak', 'mand'], ['de wandtafel', 'tafel'],
    ['de staande spiegel', 'spiegelstandaard'], ['de gangklok', 'staandeklok'], ['het harnas', 'harnas'],
  ],
  werkplaats: [
    ['de gereedschapskist', 'kist'], ['de ketel', 'ketel'], ['de schakelkast', 'noodkast'],
    ['het laadrek', 'rek'], ['de slijpsteen', 'haspel'], ['de werktafel', 'tafel'],
  ],
  buiten: [
    ['de houtstapel', 'houtstapel'], ['de drinkbak', 'drinkbak'], ['de vuurplaats', 'vuur'],
    ['de omgevallen stam', 'stam'], ['de waterput', 'put'], ['de mosbank', 'mosbank'],
  ],
  grafkelder: [
    ['de stenen sarcofaag', 'sarcofaag'], ['de knekelnis', 'knekelnis'], ['de zuil', 'zuil'],
    ['het bidbankje', 'bidbank'], ['de kaarsentafel', 'kaarsentafel'], ['de grafzerk', 'sarcofaag'],
  ],
  laboratorium: [
    ['de kweekbak', 'kweekbak'], ['de kruidenkast', 'kruidenkast'], ['de distilleerketel', 'ketel'],
    ['de weegschaal', 'weegschaal'], ['de werktafel met flessen', 'tafel'], ['de plantenbak', 'kweekbak'],
  ],
  sterrenwacht: [
    ['de telescoop', 'telescoop'], ['de hemelbol', 'hemelbol'], ['de sterrenkaart', 'kaarthoek'],
    ['de kaartenkast', 'kast'], ['de schrijflessenaar', 'lessenaar'], ['de wandklok', 'staandeklok'],
  ],
};

export const soortVan = (plek) => SOORT_VAN[plek] ?? 'zaal';
