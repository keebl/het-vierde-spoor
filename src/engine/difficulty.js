// Niveau 1 t/m 5 omgezet naar concrete generatieparameters.
//
// Moeilijkheid komt hier uit drie knoppen, niet uit een willekeurig getal:
//   1. omvang      - hoeveel slots en hoeveel categorieen
//   2. soort hints - directe bevestigingen zijn makkelijk, uitsluitingen en
//                    "of-of" dwingen tot doorredeneren
//   3. redeneerstijl - 'shallow': op te lossen door stap voor stap door te
//                    strepen, met minRounds als maat voor hoeveel stappen.
//                    'deep': doorstrepen alleen brengt je er niet, je moet
//                    ergens aannemen en die aanname weerleggen.
//   4. ruis        - op lage niveaus laten we overbodige aanwijzingen staan,
//                    want die geven houvast. Hoger wordt alles weggesneden.

export const LEVELS = {
  1: {
    label: 'Beginner',
    slots: 3,
    cats: 2,
    ordered: false,
    weights: { same: 6, diff: 4, either: 1, adj: 3, hops: 1, degree: 1 },
    redundancy: 1,
    style: 'shallow',
    minRounds: 2,
    maxClues: 7,
  },
  2: {
    label: 'Makkelijk',
    slots: 4,
    cats: 2,
    ordered: false,
    weights: { same: 4, diff: 5, either: 2, adj: 3, hops: 2, degree: 1 },
    redundancy: 0,
    style: 'shallow',
    minRounds: 3,
    maxClues: 11,
  },
  3: {
    label: 'Gemiddeld',
    slots: 4,
    cats: 3,
    ordered: true,
    weights: { same: 2, diff: 6, either: 3, before: 3, gap: 2, adj: 3, hops: 2, degree: 1 },
    redundancy: 0,
    style: 'shallow',
    minRounds: 3,
    maxClues: 14,
  },
  4: {
    label: 'Lastig',
    slots: 5,
    cats: 3,
    ordered: true,
    weights: { same: 1, diff: 6, either: 4, before: 4, gap: 3, adj: 2, hops: 3, degree: 1 },
    redundancy: 0,
    style: 'deep',
    minRounds: 0,
    maxClues: 15,
  },
  5: {
    label: 'Meesterlijk',
    slots: 6,
    cats: 3,
    ordered: true,
    weights: { same: 0, diff: 6, either: 5, before: 4, gap: 4, adj: 2, hops: 3, degree: 1 },
    redundancy: 0,
    style: 'deep',
    minRounds: 0,
    maxClues: 20,
  },
  // Niveau zes is er op verzoek gekomen: "te makkelijk, en graag zestien bij
  // zestien". Bij de Reconstructie is dat letterlijk zo - zie KAMER_LEVELS. Bij
  // de andere mechanieken kan het rooster niet groter: er zijn maar zes
  // tijdstippen in een wereld, dus een zevende slot bestaat niet. Daar wordt
  // niveau zes moeilijker op de tweede knop in plaats van op de eerste:
  // geen enkele directe bevestiging meer, en zo veel mogelijk of-of.
  6: {
    label: 'Monsterlijk',
    slots: 6,
    cats: 3,
    ordered: true,
    weights: { same: 0, diff: 5, either: 7, before: 4, gap: 5, adj: 1, hops: 4, degree: 1 },
    redundancy: 0,
    style: 'deep',
    minRounds: 0,
    maxClues: 18,
  },
};

export const LEVEL_IDS = [1, 2, 3, 4, 5, 6];

// Welke niveaus je aangeboden krijgt. Dat hoeft niet hetzelfde te zijn als
// welke er bestaan: een niveau kan klaar zijn en toch nog niet in de etalage
// horen.
//
// Niveau 6 heeft hier even buiten gestaan, en dat ging over bouwtijd.
// Zestien bij zestien is tweehonderdzesenvijftig vakjes en zestien figuren,
// en het zoeken naar een aanwijzingenreeks met precies één oplossing duurde
// daar twintig tot honderdvijf seconden - op de hoofddraad, dus dat is een
// stilstaand scherm. Na het opschonen van het doorstrepen (zie rooms.js: de
// burentabel, de meubelassen, en geen kopie meer van elke verzameling) is
// het twee tot drie seconden, met exact dezelfde puzzels als uitkomst.
export const ZICHTBARE_LEVEL_IDS = [1, 2, 3, 4, 5, 6];

export function levelParams(level) {
  return LEVELS[Math.min(6, Math.max(1, Number(level) || 1))];
}

// Het kamerraster heeft eigen maten: de omvang zit in het rooster (n bij n)
// en in het aantal kamers, niet in het aantal categorieen.
// Op zestien bij zestien zijn "ten noorden van" en "ten westen van" vrijwel
// altijd wat het snoeien overlaat; met een kwart als grens ging de ene
// poging na de andere eraf en liep het bouwen op tot zesendertig seconden.
// Een derde is gemeten net zo snel als geen grens (drie tot elf seconden).
const SOORTDEEL6 = 1 / 3;
// De nieuwe soorten van fase B in de vijver van de oude bouwer (niveau 5 en
// 6, zie SJABLOON_NIVEAUS): stukken, ramen en "of"-zinnen.
const NIEUW = { op: 3, enigeOp: 2, kamerOf: 3, typeOf: 2, nietNiet: 1, naastType: 3, voorRaam: 2, en: 4, ofwelPersoon: 2, wieOp: 1, aantalOp: 2 };
export const KAMER_LEVELS = {
  // `kamer` is de directe aanwijzing ("Bram stond in de keuken") en
  // `kamerNiet` de uitsluiting ("Bram stond niet in de keuken"). Dat was een
  // knop, en dat was precies het probleem: een puzzel die te makkelijk
  // aanvoelt zit meestal vol directe aanwijzingen. Vanaf niveau drie zakt
  // die naar bijna nul en gaat het gewicht naar wat je moet combineren:
  // uitsluiten, iemand naast iemand anders, tellingen per kamer.
  //
  // Niveau een en twee blijven zoals ze waren. Dat is met opzet: daar leert
  // iemand het spel, en een beginner heeft juist een paar aanwijzingen nodig
  // die zonder omweg iets vastzetten.
  //
  // Sinds 2026-11-16 (specs/harder-clues.md) is het weer anders, en om een
  // andere reden. Rij en kolom (`opRij`, `opKolom`) staan overal op nul: een
  // rij- en een kolomaanwijzing samen wezen iemand precies één vakje aan, in
  // 29 van de 29 gemeten gevallen, en de dochter zag dat meteen. De kamer
  // neemt hun plaats in, op elk niveau met gewicht vier. Wat die kamer te
  // makkelijk zou maken, houdt minVrij tegen: vanaf niveau drie komt geen
  // aanwijzing in de vijver die iemand in zijn eentje op twee vakjes zet.
  //
  // maxPerNaam is het plafond aan aanwijzingen per naam, geteld zoals de
  // speler ze ziet (een paar telt bij allebei). Het doel is één; drie, vier
  // en vijf zijn wat haalbaar bleek. Op niveau vijf lukte vier pas na tien
  // seconden; niveau zes heeft er (nog) geen, want daar duurde zelfs vijf
  // een halve minuut met een stilstaand scherm. Guus koos haalbaar
  // (2026-11-17): eerst moet het bouwen naar de achtergrond, met een
  // voortgangsbalk. Tot dan spreidt de bouwer daar wel, maar zonder grens.
  // soortDeel is het deel dat één soort aanwijzing mag innemen.
  1: { n: 5, kamers: 4, rekwisieten: [1, 3], meubelDeel: 0.18, style: 'shallow', maxClues: 7, maxPerNaam: 3,
       gewichten: { kamer: 6, kamerNiet: 6, naast: 4, zelfdeKamer: 3, aantalKamer: 3, buren: 2, noord: 1, west: 1, opRij: 0, opKolom: 0, rand: 2, hoek: 2, aantalNaast: 2 } },
  2: { n: 6, kamers: 5, rekwisieten: [1, 3], meubelDeel: 0.20, style: 'shallow', maxClues: 9, maxPerNaam: 3,
       gewichten: { kamer: 5, kamerNiet: 5, naast: 4, zelfdeKamer: 3, aantalKamer: 3, buren: 3, noord: 2, west: 2, opRij: 0, opKolom: 0, rand: 3, hoek: 3, aantalNaast: 3 } },
  3: { n: 7, kamers: 6, rekwisieten: [1, 3], meubelDeel: 0.22, style: 'shallow', maxClues: 15, maxPerNaam: 3, minVrij: 3,
       gewichten: { kamer: 4, kamerNiet: 6, naast: 4, zelfdeKamer: 5, aantalKamer: 5, buren: 4, noord: 3, west: 3, opRij: 0, opKolom: 0, rand: 2, hoek: 2, aantalNaast: 4 } },
  4: { n: 9, kamers: 7, rekwisieten: [2, 5], meubelDeel: 0.24, style: 'deep', maxClues: 26, maxPerNaam: 4, minVrij: 3,
       gewichten: { kamer: 4, kamerNiet: 6, naast: 4, zelfdeKamer: 6, aantalKamer: 5, buren: 5, noord: 3, west: 3, opRij: 0, opKolom: 0, rand: 2, hoek: 2, aantalNaast: 5 } },
  // Twaalf bij twaalf, zoals in de dikke puzzelboeken. Dat kan sinds de
  // solver eerst doorstreept en daarna de meest beperkte figuur kiest, en een
  // werkbudget heeft zodat een pechgeval wordt weggegooid in plaats van
  // minuten door te rekenen.
  5: { n: 12, kamers: 8, rekwisieten: [2, 5], meubelDeel: 0.24, style: 'deep', maxClues: 34, maxPerNaam: 5, minVrij: 3,
       gewichten: { ...NIEUW, kamer: 4, kamerNiet: 6, naast: 4, zelfdeKamer: 6, aantalKamer: 5, buren: 5, noord: 3, west: 3, opRij: 0, opKolom: 0, rand: 2, hoek: 2, aantalNaast: 5 } },
  // Zestien bij zestien: tweehonderdzesenvijftig vakjes, zestien figuren,
  // elf kamers. Hier was nieuwe inhoud voor nodig - een wereld had twaalf
  // namen en acht of negen plekken, en voor zestien rijen heb je zestien
  // figuren met elk een eigen beginletter nodig. Die extra namen en plekken
  // staan apart in de wereld, zodat de bestaande puzzels niet verschuiven.
  //
  // Dit kost tijd: gemeten drie tot acht seconden per puzzel, tegen een halve
  // tot anderhalve voor twaalf bij twaalf. Dat is niet te versnellen zonder
  // de garantie op te geven dat er precies een oplossing is, en die garantie
  // is het hele punt. Sinds de spreiding (2026-11-17) is het zeven seconden
  // gemiddeld en tot achttien: zonder rij en kolom zijn er meer aanwijzingen
  // nodig. Dat is waarom het bouwen naar de achtergrond moet.
  //
  // Directe aanwijzingen op vier, zoals overal (zie boven); rij en kolom zijn
  // weg. Hier moet alles uit combineren komen.
  6: { n: 16, kamers: 11, rekwisieten: [2, 5], meubelDeel: 0.22, style: 'deep', maxClues: 56, minVrij: 3, soortDeel: SOORTDEEL6,
       gewichten: { ...NIEUW, kamer: 4, kamerNiet: 7, naast: 4, zelfdeKamer: 7, aantalKamer: 6, buren: 6, noord: 4, west: 4, opRij: 0, opKolom: 0, rand: 1, hoek: 1, aantalNaast: 6 } },
};

// ------------------------------------------------- het sjabloon per niveau
//
// specs/engine-extension.md stap 8 en specs/props-and-either-clues.md B2.
// `eigen` zijn de gewichten van de soorten die als eigen aanwijzing van één
// persoon mogen (één per persoon), `samen` die van de relationele en
// algemene, waarvan er hooguit ceil(personen / 3) bij komen. De vormen per
// niveau volgen de tabel in de props-spec: kamerOf vanaf 1, typeOf en
// nietNiet vanaf 2, en vanaf 3, ofwelPersoon vanaf 4, wieOp vanaf 5.
// `band` is wat de menselijke solver nodig mag hebben (criterium 7): tot en
// met niveau drie alleen doorstrepen (tier 2), daarboven mag het zwaarder.
const SAMEN = { zelfdeKamer: 3, buren: 2, noord: 2, west: 2, aantalKamer: 3, aantalNaast: 2, aantalOp: 2 };
export const BOUW = {
  1: { eigen: { kamer: 3, kamerOf: 4, op: 5, enigeOp: 2, naast: 3, naastType: 2, voorRaam: 2, kamerNiet: 1, rand: 1 },
       samen: SAMEN, band: { maxTier: 2, min: 0 } },
  2: { eigen: { kamer: 2, kamerOf: 4, op: 4, enigeOp: 3, typeOf: 3, nietNiet: 2, nietOp: 1, naast: 3, naastType: 3, voorRaam: 2, hoekKamer: 1, kamerNiet: 1, rand: 1 },
       samen: SAMEN, band: { maxTier: 2, min: 1 } },
  3: { rondes: 3, greep: 40, greepRonde: 40, eigen: { kamer: 1, kamerOf: 4, op: 3, enigeOp: 3, typeOf: 3, nietNiet: 2, nietOp: 1, naast: 3, naastType: 3, voorRaam: 2, hoekKamer: 1, en: 5, kamerNiet: 1 },
       samen: SAMEN, eisOf: true, eisOp: true, band: { maxTier: 2, min: 2 } },
  4: { rondes: 3, minVrij: 2, pogingen: 150, greep: 40, greepRonde: 40, eigen: { kamerOf: 4, op: 2, enigeOp: 3, typeOf: 3, nietNiet: 3, nietOp: 2, naast: 3, naastType: 3, voorRaam: 2, hoekKamer: 1, en: 6, rijEnKamerAls: 1, kamerNiet: 2 },
       samen: { ...SAMEN, ofwelPersoon: 3 }, eisOf: true, eisOp: true, band: { maxTier: 4, min: 3 } },
  5: { rondes: 3, eigen: { kamerOf: 4, op: 2, enigeOp: 3, typeOf: 3, nietNiet: 3, nietOp: 2, naast: 3, naastType: 3, voorRaam: 2, hoekKamer: 1, en: 6, rijEnKamerAls: 1, kamerNiet: 2 },
       samen: { ...SAMEN, ofwelPersoon: 3, wieOp: 2 }, eisOf: true, eisOp: true, band: { maxTier: 4, min: 6 } },
  6: { rondes: 3, eigen: { kamerOf: 4, op: 2, enigeOp: 3, typeOf: 3, nietNiet: 3, nietOp: 2, naast: 3, naastType: 3, voorRaam: 2, hoekKamer: 1, en: 6, rijEnKamerAls: 1, kamerNiet: 2 },
       samen: { ...SAMEN, ofwelPersoon: 3, wieOp: 2 }, eisOf: true, eisOp: true, band: { maxTier: 4, min: 8 } },
};

// Niveau 5 en 6 halen het sjabloon niet: elf mensen hebben drie tot zeven
// aanwijzingen erbij nodig waar er vier mogen, en een bord kost tien
// seconden (gemeten op meet-0..5, 2026-11-18). De stopregel van de spec:
// daar bouwt voorlopig de oude bouwer, met de nieuwe soorten in zijn vijver
// (zie KAMER_LEVELS), tot fase C niveau zes opnieuw indeelt. Voorstel A aan
// Guus; de sjablonen hierboven blijven staan.
export const SJABLOON_NIVEAUS = [1, 2, 3, 4];

export function kamerParams(level) {
  const l = Math.min(6, Math.max(1, Number(level) || 1));
  return { ...KAMER_LEVELS[l], bouw: SJABLOON_NIVEAUS.includes(l) ? BOUW[l] : undefined };
}
