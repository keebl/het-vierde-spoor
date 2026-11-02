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
