# Overdracht

Voor de volgende sessie — mens of model. Lees eerst `ARCHITECTUUR.md` voor
de kaart van de code, en `README.md` voor wat het spel is.

**Laatst bijgewerkt:** 9 november 2026.

---

## Wie dit voor is

Dit is geen oefenproject. Guus bouwt het voor zijn dochter, die fan is van
het puzzelboek *Murdoku* van Manuel Garand en meer van zulke puzzels wilde
dan het boek er heeft. Dat is de maatstaf: **zou zij hier een uur zoet mee
zijn?** Niet of de code elegant is.

Twee dingen volgen daaruit, en ze zijn allebei al eens misgegaan:

1. **Hij beoordeelt op het zichtbare eindbeeld**, niet op werkende
   onderdelen. "De keuring is groen" is geen bewijs; een schermafdruk van
   het bord wel. Kijk er altijd zelf naar voordat je zegt dat iets af is.
2. **Pushen is live.** `main` → GitHub Pages, geen bouwstap. Zeg erbij
   wanneer iets nog *niet* live staat; dat is een keer fout gegaan en hij
   moest ernaar vragen.

---

## Stand van zaken

Laatste commit: `c292e4b`. **Alles daarna staat nog niet live.**

### In de werkmap, nog niet gecommit

Twee afgeronde brokken die alleen nog op een groene keuring wachten:

**Soorten zaak** (`src/content/zaken.js`, nieuw). Niet elke puzzel is meer
een moord: er zijn ook verdwijningen en diefstallen. Elke zaak levert eigen
zinnen, een eigen merk op de figuur waar het om draait (kruis, vraagteken,
opengebroken slot — zie `MERKEN` in `personenkunst-geschilderd.js`), een
eigen regel in de spelregels en een eigen woord voor het antwoord. De
zaaksoort wordt getrokken met een eigen rng (`${seed}:zaak`) zodat bestaande
borden niet verschuiven. Elk decor heeft een `gestolen`-veld gekregen.

**Twee werelden bij daglicht** — Het Openluchtbad (`zwembad`) en Dierenpark
De Wildhoek (`dierentuin`). Dit was de feedback van de dochter: alle elf
bestaande werelden spelen 's nachts en dat is somber. Compleet met eigen
meubilair, bordrand, sfeertekening, muurkleuren en palet. Vier nieuwe
tekeningen (parasol, ligbed, badmeesterstoel, douchepaal) en drie nieuwe
vloerdessins (`water`, `bestrating`, `sneeuw`).

**Minder meubels, beter verdeeld.** Ze werden over het hele bord
uitgestrooid zonder naar kamers te kijken, en dan krijgt een kamer van drie
vakjes er vier. Nu hoogstens één per vier vakjes en nooit meer dan drie per
kamer (`bouwRooster` in `rooms.js`). Guus' argument: een aanwijzing als
"Bram stond naast de weegschaal" helpt alleen als dat ding een
herkenningspunt is en geen stapel.

Daarbij vier dingen die moesten meeveranderen:

- **"De band is nacht"** gold voor elke bordrand. Een zwembad in juli is
  geen nacht, dus een rand mag nu `dag: true` zijn: dan is de eis níét
  donker-met-gloed maar licht-met-schaduw. Zie `check-kamers.mjs`.
- **Nooit meer meubels vragen dan er namen zijn.** `maxMeubels` stond op
  een vaste 20 terwijl de krapste soort in een wereld er 18 kon leveren.
  Een bord dat toevallig veel meubels in ruimtes van één soort legde, viel
  om met "geen meubilair meer voor zaal". Nu rekent `buildKamerPuzzle` uit
  wat de krapste soort aankan, en `check-kamers.mjs` bewaakt de ondergrens.
- **De keuring verwarde "opgegeven" met "nul".** `telPlaatsingen` geeft bij
  een uitgeput budget `{count: 0, opgegeven: true}` terug, en zowel
  `check.mjs` als `check-regels.mjs` lazen dat als "geen oplossing". Tien
  werelden werden zo vals afgekeurd. Beide gebruiken nu hetzelfde budget
  als de generator (`30000 * n`) en melden "niet uit te rekenen" apart.
- **De `findLead` van het zwembad noemde een kamer.** Bij de opdracht
  "vinden" is dat het antwoord weggeven; de keuring viel er terecht over.
- **De pagina's waren plat, niet leeg.** Guus noemde de bibliotheek en de
  voordeur "saai, statisch, minimalistisch". De verleiding is dan om er
  dingen bij te zetten; dat was het niet. De sfeertekeningen op de kaartjes
  waren dertien tekeningen van effen vlakken - één kleur per dieptelaag, en
  alle dertien hetzelfde grijsblauw. Wat er nu overheen ligt (scenes.js):
  een verloop per laag, de wereldkleur over de hele tekening in plaats van
  alleen in de lucht, een echte gloed rond elk lichtje, nevel, een vignet
  en een korrel. Daarnaast zijn vier silhouetten opnieuw getekend omdat ze
  mechanisch lazen: het bos (gelijke driehoeken op gelijke afstand), de
  skyline (kale rechthoeken), het hek (identieke latjes) en het landhuis
  (een vijfhoek). De gewelven hebben vijf bogen naar een punt in plaats van
  drie op elkaar.
- **Laten zien in plaats van opschrijven.** Op de voordeur stonden zes lege
  vakjes met "16 bij 16, aanname nodig". Daar staat nu een plattegrondje in
  van dat niveau, gebouwd met dezelfde motor als het bord
  (`bordminiatuur.js`), dus het kan niet iets anders tonen dan wat je krijgt.
  Onder "Zo werkt het" staat bij elke stap het plaatje van die stap. En de
  voorbeeldplattegrond stond op een smal scherm ónder de knoppen, dus buiten
  beeld; die staat nu meteen onder de inleiding.
- **Een bad is geen gazon.** De twee baden en het pinguïnbad hadden de
  soort `buiten`, net als de ligweide: hun vloer was apart geregeld, hun
  meubilair niet, en dus stond er een plantenbak midden in het water. Nu is
  `bad` een soort op zichzelf, met tien eigen meubelstukken (startblok,
  zwemtrapje, duikplank, reddingsboei, reddingshaak, peilpaal,
  badmeesterstoel, lijnenhaspel, kickplankbak, wedstrijdklok), eigen
  aankleding (rimpels, schuim, een baanlijn) en géén uitwijkroute - want
  elke andere soort levert iets dat niet in het water hoort. De dierentuin
  doopt diezelfde tien om voor het pinguïnbad. `check-kamers.mjs` faalt nu
  zodra een kamer die op "bad" eindigt een andere soort krijgt.
- **Een nieuwe wereld is 37 nieuwe woorden, en elk woord wil een icoon.**
  Namen, voorwerpen, plekken, tijden, sporen: `check-iconen.mjs` telde er
  74 zonder plaatje. Hergebruikt is alleen wat echt hetzelfde ding is (een
  kiosk is een winkel); de overige 40 zijn getekend, van de duikbril tot
  de giraf. Reken daar bij een volgende wereld meteen op.

Ook klaar en niet gecommit: `ARCHITECTUUR.md` en dit bestand.

### Wat er moet gebeuren

1. `npm run check:all` draaien. Het oordeel staat in de regel
   `volledige keuring exit=` in het uitvoerbestand — **niet** de exitcode
   van je shell.
2. Bij groen: committen, pushen, en op de live site zelf nakijken. Houd er
   rekening mee dat een tabblad dat al openstond de oude modules vasthoudt;
   `location.reload()` vóór je conclusies trekt.
3. Guus de link sturen. Dat heeft hij expliciet gevraagd: na elke push en
   aan het eind van elke opdracht, als aanklikbare link.

---

## Wat er open staat

**Van hem gevraagd, nog niet gedaan**

- *De naam van de site.* "Het Vierde Spoor" gaat veranderen; hij heeft nog
  niet gezegd waarin. Het speltype heet sinds vandaag **Reconstructie**
  (was "Speurdoku", dat te dicht bij Murdoku lag).
- *Modernere voorwerpen.* Zijn dochter vindt de spullen te jaren-vijftig.
  We hebben gekozen voor nieuwe lichte werelden in plaats van de basisset
  hertekenen — maar de basisset blijft een landhuis uit 1930 (een haard,
  een vleugel, een hutkoffer, een kolenbunker). Als de klacht terugkomt,
  is de volgende stap die set moderniseren, en dat raakt elke wereld.
- *Namen die om een tekening heen gebogen zijn.* In het zwembad staan "de
  slippersmand" en "de handdoekplank": namen die gekozen zijn omdat er
  toevallig een paraplubak en een wandtafel te hergebruiken waren. Guus
  heeft dat opgemerkt. De eerlijke oplossing is die stukken echt tekenen,
  niet de naam verder verbuigen. **Les voor de volgende keer: als een
  tekening liegt, teken hem. Een wereldlaag kan namen omdopen, geen beeld.**

**Eerder opgemerkt, nog niet opgelost**

- Een afsluiting als je het goed hebt. Nu staat er alleen "Opgelost".
  Daar hoort de dader in beeld te komen, met een slotzin en een knop naar
  de volgende zaak.
- Toetsenbord en schermlezer: de vakjes zijn `rect`-elementen zonder
  focus, dus het bord is niet te bedienen zonder muis.
- Zestien bij zestien op een telefoon blijft krap, ook met de lijst eraf.
- De oplossing zit in de pagina; wie de console opent kan hem lezen.
- De keuring tekent de bordranden nooit. Een fout in `bordrand.js` die pas
  bij het tekenen stukloopt, vangt hij dus niet.
- De Cloudflare Worker in `worker/` staat klaar maar draait niet (10 ms
  rekentijd op het gratis plan is te weinig). Guus heeft dat uitgesteld.

---

## Hoe hij werkt

Dit staat hier omdat het de samenwerking sneller maakt, niet als etiquette.

- **Antwoord in het Nederlands.** Ook commentaar in de code en
  commit-berichten.
- **Hij geeft feedback in brokken van vijf tot tien punten tegelijk**,
  vaak midden in een lopende opdracht. Maak eerst af waar je in zit —
  halve code is erger dan wachten — en pak dan de rest.
- **Hij noemt wat hij ziet, niet wat kapot is.** "De serre ziet eruit als
  een tuin met een kampvuur" is een melding over één kamer; de oorzaak
  bleek een soort die vier dingen tegelijk moest zijn. Zoek de oorzaak,
  repareer de klasse, en leg de regel vast in de keuring. Dan hoeft hij
  hetzelfde soort fout nooit twee keer te melden.
- **Hij hoeft niet per puzzel te rapporteren.** Puzzels zijn gegenereerd;
  de eenheid die telt is de kamernaam, het meubelstuk, de wereld.
- **Verbergen, niet weggooien.** Toen de bibliotheek van de voorpagina af
  moest, bedoelde hij uit het zicht en niet uit de code — "anders is het
  zonde van al het werk". Bied dat als optie aan.
- **De API-sleutel raak je niet aan.** Hij typt hem zelf in; hij mag niet
  gelezen, geëchood of gecommit worden.

---

## Valkuilen die tijd gekost hebben

- **De keuring duurt vier tot vijf minuten.** Start hem in de achtergrond
  en werk door; kijk niet elke dertig seconden.
- **Verander je de generator terwijl de keuring loopt, dan is het oordeel
  waardeloos.** Afbreken en opnieuw starten is sneller dan hem uitlopen.
- **`navigate` naar een adres waar het tabblad al op staat, herlaadt niet.**
  Dan zie je minutenlang de oude code en denk je dat de push mislukt is.
  Gebruik `location.reload()`.
- **GitHub Pages stuurt `cache-control: max-age=600` mee.** Dat is echt,
  maar meestal niet de oorzaak — zie het punt hierboven.
- **Een dubbele sleutel in een object-literal slikt javascript zwijgend.**
  Daar staat nu een keuringsregel op, maar alleen voor de tabellen in
  `kamersoorten.js`.
- **`npm run` meldt groen terwijl een script in de keten rood was.** Lees
  de `volledige keuring exit=`-regel, en de tabel met goed/FOUT erboven.
- **Eén rode toets verborg zes andere.** De keuring was een ketting van
  `&&`; die stopt bij de eerste fout. Nu draait `tools/keuring.mjs` ze
  allemaal, altijd, en telt onderaan op wie er omviel.
