# Het Vierde Spoor

Deductiepuzzels in dertien werelden en zes moeilijkheidsgraden. Je kiest
alleen hoe zwaar je het wilt hebben; het decor krijg je. Elke druk op de knop
levert een nieuwe zaak op, ter plekke gebouwd en ter plekke nagerekend.

**Waarom dit bestaat.** Mijn dochter is fan van het puzzelboek *Murdoku* van
Manuel Garand, en toen ze dat uit had wilde ze meer. Die zijn er niet, dus
staan ze hier: een machine die er net zo veel maakt als ze wil, elk met
precies één oplossing. Dat is de maatstaf waaraan alles hier gemeten wordt -
niet of de code mooi is, maar of zij er een uur zoet mee is.

De bibliotheek met vierenzeventig vaste zaken bestaat nog wel, maar staat
nergens meer in het zicht: `#/puzzels` werkt, het menu wijst er niet heen.

Elke puzzel heeft gegarandeerd **precies een oplossing**, en die is altijd
met logica te vinden — nooit met gokken. Dat is machinaal gecontroleerd
voordat een puzzel bij de speler komt.

## Verder lezen

De documentatie is Engels, de code is Nederlands — zie
[ADR-0004](docs/decisions/0004-dutch-is-the-language-of-the-code.md).

- **[STATUS.md](STATUS.md)** — de stand van zaken, wat er open staat en wat
  er het eerst aan de beurt is. Begin hier als je nieuw aanschuift.
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — de kaart van de code:
  waar wat staat, welke tabellen elkaar overrulen, welke afspraken er gelden.
- **[docs/PRODUCT.md](docs/PRODUCT.md)** — waarvoor dit bestaat, voor wie, en
  wat het met opzet níét doet.
- **[docs/decisions/](docs/decisions/)** — de besluiten die de vorm bepaald
  hebben, met hun waarom.
- **[CLAUDE.md](CLAUDE.md)** — de commando's en de valkuilen, voor Claude.
- **[SECURITY.md](SECURITY.md)** — wat er met gegevens gebeurt (niets) en hoe
  het met de sleutel zit.

## Starten

```bash
npm start
```

Daarna staat de site op http://localhost:4173.

Er is geen build-stap en de site heeft nul dependencies: het zijn gewone
ES-modules die de browser rechtstreeks laadt. De map is daarmee ook direct te
hosten als statische site (GitHub Pages, Netlify, Vercel) — alleen de
optionele AI-laag heeft de meegeleverde Node-server nodig.

## Op je telefoon, binnen hetzelfde netwerk

De server luistert op alle netwerkkaarten en toont bij het opstarten zelf het
adres, bijvoorbeeld:

```
In je netwerk bereikbaar op http://10.0.0.11:4173
```

Typ dat adres in de browser van je telefoon, mits die op dezelfde wifi zit.
Blijft het hangen, dan houdt de macOS-firewall de verbinding tegen: sta
binnenkomende verbindingen voor `node` toe in Systeeminstellingen, of zet de
firewall even uit.

Twee dingen zijn hiervoor bewust dichtgezet:

- **De server geeft alleen `index.html`, `styles/` en `src/` vrij.** Een witte
  lijst, geen zwarte. Daarvoor serveerde hij alles in de projectmap, dus ook
  `.env` met je API-key en de inhoud van `.git`. Op alleen localhost was dat al
  onwenselijk; op het huisnetwerk is het een lek.
- **De AI-teksten werken alleen vanaf deze computer.** Achter die route hangt
  je API-key, en iedereen op je wifi zou er anders op kunnen stoken. Andere
  apparaten krijgen gewoon de eigen templateteksten te zien, zonder foutmelding.
  Wil je het toch openzetten binnen je eigen netwerk:

```bash
VIERDESPOOR_AI_LAN=1 npm start
```

## Keuren

```bash
npm run check:all
```

Dit bouwt honderden puzzels over alle combinaties plus de hele catalogus, en
controleert per puzzel of de oplossing uniek is, of het antwoord op de vraag
klopt, of elke aanwijzing een leesbare Nederlandse zin oplevert en of de
moeilijkheid bij het gevraagde niveau past.

De zwaarste van die keuringen is `tools/check-regels.mjs`: daar staan de
spelregels van alle vier de speltypen als narekenbare eisen, en elke puzzel
moet er zonder uitzondering aan voldoen. Ook de vooraf herschreven teksten
gaan erdoorheen: elke herschreven zin moet zijn namen, ontkenning, getallen
en keuze intact houden, de taalregels halen, en het gratis feit uit de
inleiding laten staan. Verandert de generator, dan kloppen die teksten niet
meer bij hun puzzel - en dan valt de keuring erover. Hij keurt de hele bibliotheek plus
een veegronde over elke combinatie van opdracht, wereld, speltype en niveau -
dus ook de puzzels die nog niet bestaan maar straks gegenereerd worden. Zesenvijftig
regels, van "precies één figuur per rij" tot "wie naast een meubelstuk staat,
staat in dezelfde kamer" en "geen woord dat zichzelf herhaalt".

```bash
node tools/check-regels.mjs 4    # vier seeds per combinatie
```

Een losse puzzel bekijken als tekst:

```bash
node tools/show.mjs dader grid landhuis 3 demo-7
```

## Hoe het in elkaar zit

Een puzzel is een combinatie van vier assen. Alleen de eerste drie bepalen
wat je ziet; de motor eronder is voor alles hetzelfde.

| As | Wat het bepaalt | Waar het staat |
|---|---|---|
| **Opdracht** | wat je uitzoekt (dader, vinden, toewijzing, reconstructie) | `src/content/assignments.js` |
| **Genre** | het decor en alle woorden | `src/content/worlds.js` |
| **Soort spel** | Reconstructie, Kruisverhoor, Rondgang, Dienstrooster | `src/ui/board-rooms.js`, `src/ui/boards.js` |
| **Moeilijkheidsgraad** | omvang, soort aanwijzingen, redeneerdiepte | `src/engine/difficulty.js` |

### De Reconstructie

Het hoofdspel. Je zet figuren op een plattegrond: één per rij, één per kolom,
nooit op een meubelstuk. Het slachtoffer is zelf een van die figuren, dus waar
het lichaam ligt moet je ook uitpuzzelen; wie er als enige bij in de kamer
blijkt te staan is de dader.

**Naast betekent naast.** Pal erboven, eronder, links of rechts, én in
dezelfde kamer: door een muur heen sta je niet naast iets, en schuin telt
nooit. Dat geldt voor iemand naast een meubelstuk, voor twee mensen naast
elkaar en voor het tellen van hoeveel mensen er naast iets stonden. Rij,
kolom, noord, west, buitenmuur en hoek gaan juist over de plattegrond als
geheel en lopen dus wél door muren heen. De regels staan voluit boven in
`src/engine/rooms.js` en staan ook bij elke puzzel op het scherm
(`src/content/spelregels.js`).

De motor staat in `src/engine/rooms.js` (rooster, kamers, meubels, solver,
propagator) en `src/engine/generate-rooms.js` (de puzzel zelf). Twee dingen
maken grote roosters haalbaar:

- de solver streept eerst door wat aantoonbaar onmogelijk is en kiest daarna
  steeds de figuur met de minste mogelijkheden. Blind rij voor rij zoeken liep
  boven 8x8 vast (9x9 kostte dertig seconden).
- de solver heeft een werkbudget. Loopt hij eruit, dan zegt hij "ik weet het
  niet" en gooit de generator die poging weg. Zonder die grens kon een
  ongelukkige combinatie minutenlang doorrekenen.

Samen maakt dat 12x12 mogelijk in ongeveer een halve seconde.

De motor kent geen moorden. Hij lost toewijzingsproblemen op: een
ankercategorie levert N rijen, elke andere categorie verdeelt haar N items
een-op-een over die rijen, en aanwijzingen zijn beperkingen op die verdeling.
"Wie pleegde de moord" en "waar ligt de uitgang" zijn allebei gewoon een
vraag over diezelfde verdeling. Een nieuwe wereld toevoegen is dus alleen
woorden toevoegen: je krijgt er gratis alle opdrachten, mechanieken en
niveaus bij.

### De drie lagen van de motor

- **`countSolutions`** (`src/engine/assign.js`) — de waarheid. Backtracking
  dat tot twee oplossingen telt en daarmee uniciteit bewijst.
- **`grade` / `propagate`** — redeneren zoals een mens: alleen doorstrepen
  wat aantoonbaar onmogelijk is. Bepaalt de moeilijkheid en voedt de hints.
- **`generate`** (`src/engine/generate.js`) — bouwt een puzzel en laat de
  andere twee hem keuren.

De generator kiest eerst een willekeurige oplossing, bouwt een vijver van
aanwijzingen die in die oplossing waar zijn, voegt er net zoveel toe tot het
klaar is, en snoeit daarna alles weg wat je kunt missen.

### Wat de niveaus beloven

Niveau 1 tot en met 3 zijn **gegarandeerd** op te lossen door stap voor stap
door te strepen: de generator zet net zoveel gesnoeide aanwijzingen terug tot
de propagator het alleen afkan. Terugzetten kan nooit extra oplossingen
geven — het zijn ware uitspraken — dus de puzzel blijft uniek.

Niveau 4 en 5 mikken op het omgekeerde: een krappe set waar je ergens een
aanname moet doen en die moet weerleggen. Dat lukt in ongeveer 83% van de
gevallen; haalt een puzzel het niet, dan is hij nog steeds groot (5 of 6
rijen) en dus niet makkelijk. Het kruimelpad boven elke puzzel zegt eerlijk
welke van de twee het geworden is.

Aanwijzingen per niveau, gemiddeld: 2,9 — 4,4 — 6,5 — 9,4 — 12,7.

### Seeds

Een puzzel is niets meer dan zijn instellingen plus een seed. De generator
maakt daar altijd exact dezelfde puzzel van, dus de catalogus bevat geen
puzzeldata en een gedeelde link geeft bij iedereen dezelfde puzzel.

Let op: verandert de generator, dan geven oude seeds andere puzzels. Zolang
de catalogus alleen seeds bewaart, is dat geen probleem voor de
correctheid — `npm run check:catalog` bouwt en keurt ze allemaal opnieuw.

## Online

De site staat op **https://keebl.github.io/het-vierde-spoor/**, via GitHub
Pages vanaf de `main`-branch. Elke push werkt hem binnen een minuut bij; er
is geen bouwstap, want de site is gewone HTML, CSS en ES-modules.

Dat betekent ook: op de live site draait geen server. Alles wat je daar ziet
wordt in de browser van de bezoeker uitgerekend - de puzzel, de plattegrond,
de tekeningen. Dat is precies waarom er geen API-key online hoeft te staan.

## De AI-laag

Claude mag de verhaalteksten herschrijven. De **logica komt nooit van de AI**:
die blijft van de generator. Elke herschreven aanwijzing wordt nagekeken op
het woordelijk behoud van alle eigennamen, de ontkenning, de getallen en het
of-of; faalt een van die vier, dan blijft de originele zin staan. Een slechte
herschrijving kan een puzzel dus niet onoplosbaar of dubbelzinnig maken. Dat
vangnet staat in `src/ai/opdracht.js` en wordt aan beide kanten toegepast.

### De bibliotheek: vooraf herschreven

De catalogus ligt vast - dezelfde instellingen geven altijd dezelfde puzzel -
dus die teksten worden één keer herschreven en in de repo gezet:

```bash
node tools/ai-vooraf.mjs
```

Het resultaat staat in `src/content/ai-teksten.json` en gaat gewoon mee in
git. Voordelen, op volgorde van belang:

1. **Er staat niets online dat te kapen valt.** Geen API, geen sleutel, geen
   eindpunt. Dat is de stevigste vorm van "geen misbruik mogelijk" die er is.
2. Je kunt de teksten nalezen vóór ze online staan: ze staan in een diff.
3. Het kost één keer wat, niet per bezoeker.

### Zelf gemaakte puzzels: alleen lokaal

Voor een puzzel die iemand ter plekke genereert ligt er niets klaar, en dan
is er wél een server nodig. Lokaal is dat `server/serve.mjs`: die houdt je
key bij zich en geeft `/api/flavour`.

```bash
cp .env.example .env    # vul je ANTHROPIC_API_KEY in
npm start
```

Daarna op "Zelf maken" de knop *AI-teksten* omzetten.

Dat eindpunt is met opzet bot: het accepteert **alleen een puzzel-id**, zoals
`dader.noir.grid.3.kade-1`. Geen teksten, geen prompt. De server rekent de
puzzel zelf uit en bouwt de vraag aan het model daaruit op. Er is dus geen
weg waarlangs iemand er zijn eigen tekst doorheen praat - het ergste wat
iemand kan doen is een puzzeltekst laten herschrijven die wij toch al hadden
kunnen maken.

### En live?

In `worker/` staat een Cloudflare Worker die hetzelfde doet voor de live
site: alleen een puzzel-id, zelf narekenen, antwoord door het vangnet, per
puzzel bewaren zodat hij nooit twee keer kost, een Origin-controle en een
teller per IP per uur plus een dagtotaal.

Hij staat er, maar hij draait nog niet, en daar is een harde reden voor: het
gratis plan van Cloudflare geeft een Worker **10 milliseconden rekentijd per
verzoek**, en een puzzel narekenen kost tot drie seconden. Dat past niet.
Het kan wel op het betaalde plan (vijf dollar per maand), of bij een host
waar die grens hoger ligt.

Wil je dat: `node tools/ai-online.mjs` doet de uitrol en vertelt je welke
twee commando's je daarna zelf nog draait (je key erin zetten, en pushen).

## Over de opmaak

`styles/app.css` is een ontwerpsysteem, geen verzameling losse regels. Drie
afspraken houden het rustig:

- **Een accentkleur.** Goud, en alleen voor dingen waar je op klikt. Werelden
  hadden eerst elk hun eigen kleur; zes accenten naast elkaar gaven een
  regenboog waarin niets meer opviel. Ze hebben nu alleen nog hun pictogram.
- **Vaste maten.** Ruimte komt uit `--s1` tot `--s8`, letters uit `--t-xs` tot
  `--t-2xl`. Geen losse pixelwaarden erbij verzinnen.
- **Serif voor lezen, schreefloos voor bedienen.** Koppen en verhaaltekst in
  de serif, knoppen en labels schreefloos. Dat scheidt het verhaal van de
  machinerie.

Puzzels staan in lijstrijen, niet in kaarten: rijen zijn even hoog, je kunt
de titels onder elkaar lezen, en er passen er meer op een scherm.

## Over de tekeningen

Alles wat je ziet is in code getekend: er zit geen enkel plaatjesbestand in
het project. Dat houdt het scherp op elk scherm, laat het meebewegen met het
thema, laadt direct, en er kleeft geen licentie aan.

- `src/ui/icons.js` - ruim tweehonderd lijniconen, met in
  `src/content/iconen.js` een met de hand gemaakte koppeling van elk woord uit
  de content aan precies één icoon. Er wordt niets geraden en niets geleend:
  `tools/check-iconen.mjs` faalt zodra er een woord bijkomt zonder eigen
  icoon.
- `src/ui/geschilderd.js` - de tekenmotor van het speurdokubord. Een vlak
  met één kleur en een lijntje eromheen blijft een pictogram, hoeveel
  onderdelen je er ook in stopt. Wat een prent ervan maakt zijn vier dingen:
  elk vlak loopt van bijna zijn lichtste naar bijna zijn donkerste kleur; de
  schaduw trekt naar violet in plaats van naar dezelfde kleur donkerder;
  langs de verlichte kant ligt een smalle heldere rand; en waar iets de
  vloer raakt is het donker. Daar bovenop krijgt elk materiaal zijn eigen
  textuur - nerf in hout, korrel in steen, weefsel in stof. Het licht komt
  overal uit linksboven; dat is geen stijlkeuze maar de voorwaarde.
- `src/ui/vormen.js` - de bouwstenen van de silhouetten. Een romp loopt naar
  boven iets taps toe, een plank zakt door, een poot wordt naar onder dunner.
  Die kromming staat hier één keer, anders worden zeventig meubelstukken
  zeventig verschillende handschriften.
- `src/ui/meubelkunst-geschilderd.js` - zeventig meubeltekeningen voor dat
  bord, elk meubelstuk met zijn eigen plaatje. Eerder leenden meerdere namen
  hetzelfde plaatje, en dan ziet een aanrecht eruit als een tafel.
  `tools/check-kamers.mjs` faalt op een geleende tekening, op een gevuld pad
  dat geen vlak omsluit (dat tekent niets), op een meubelstuk dat zweeft in
  plaats van op de vloer te staan, op een materiaal dat niet bestaat, en op
  een cirkel waarvan uit de code niet te zien is naar welke kant hij valt.
  `src/ui/meubelkunst.js` is de oude set; die staat alleen nog op
  `vergelijk.html`, naast de nieuwe.
- Op papier gaat het licht eruit. Elk onderdeel heeft al zijn eigen omtrek,
  dus de afdruk haalt de vulling, de schaduw, het randlicht en de textuur weg
  en houdt de lijntekening over - anders is een meubelstuk een grijze klodder
  waar je niet meer in kunt schrijven.
- `src/ui/scenes.js` - een sfeertekening per wereld, opgebouwd uit drie
  dieptelagen die naar voren toe donkerder worden, wat atmosfeer (regen,
  sterren, mist) en precies een goudkleurig lichtpunt. Dat ene lichtje doet
  het meeste werk: het geeft je oog een plek om naartoe te gaan. De
  wereldkleur zit alleen hier, in de lucht van de tekening.
- De plattegrond in `src/ui/boards.js` is een echte bouwtekening: ruimtes
  delen hun muren, buitenmuren zijn dikker, en een doorgang is een gat in de
  muur met een deurblad en een draaicirkel. Daardoor zie je in een oogopslag
  waar je wel en niet langs kunt, en dat is precies waar de aanwijzingen over
  gaan. De muren blijven lijnwerk; wat erbinnen ligt niet meer. Elke ruimte
  krijgt de vloer die bij zijn soort hoort - dezelfde tegels, planken of
  steen als op het speurdokubord - met één geschilderd meubelstuk erin en één
  ding in de hoek. Geen twee ruimtes op dezelfde kaart krijgen hetzelfde
  meubelstuk: twee keer dezelfde kist naast elkaar leest als een fout, ook al
  is het er geen. Op papier wordt het weer wit met lijnen, zodat je erin kunt
  schrijven.
- `src/ui/bordrand.js` - de lijst om het speurdokubord, per wereld een
  andere. Eromheen zat hetzelfde bruine kader voor een kerstavond, een
  ruimtestation en een grafkelder, en dat is de plek waar je het minst naar
  kijkt en waar het juist daarom opvalt als hij nergens over gaat. Een lijst
  bestaat uit een materiaal met hetzelfde licht als de rest (boven en links
  vangen het, onder en rechts liggen in de schaduw), iets wat erlangs loopt -
  klinknagels, dennennaalden, regenstrepen, voegen, spinrag - en drie
  hoekornamenten. Linksboven niet: daar staat het kompas, en de aanwijzingen
  gaan over het noorden. Een lijst hoort donkerder te zijn dan het speelveld,
  want hij is er om het bord in te vatten; `tools/check-kamers.mjs` faalt op
  een wereld zonder lijst, op een lijst die te licht is om er een te zijn, en
  op een hoekornament met een pad dat geen vlak omsluit. Op papier gaat de
  lijst eruit: daar is het een brede donkere balk die alleen inkt kost.
- `src/ui/randornamenten.js` - wat er op die lijst hangt, staat en kruipt.
  De lijst was per wereld al anders, maar hij was keurig: een band met om de
  zoveel eenheden hetzelfde motiefje. Keurig is precies het probleem. Nu
  hangen er hangplanten over de rand het bord in, staan er grafzerken scheef
  tegen de onderrand, zit er een uil op de zijkant en staat er een
  tovenaarshoed boven op de puzzel. Per wereld vijf tot zeven dingen, met de
  hand neergezet, niets op een rooster en niets symmetrisch - twee dezelfde
  dingen tegenover elkaar is weer een lijst. Daarvoor heeft het bord lucht om
  zich heen gekregen: het blad met zijn schaduw wordt nu in de tekening gezet
  in plaats van als achtergrond op de svg, want een achtergrond vult ook die
  lucht en dan kan er niets meer buiten het bord uitsteken.
  `tools/check-kamers.mjs` faalt op een wereld met minder dan vier dingen op
  de rand, op alles aan dezelfde kant, en op iets dat verder dan een halve
  cel het speelveld in hangt.
- Het kruisraster en het dienstrooster zijn tabellen. Daar staat in de rijen
  wie het zijn, en die krijgen hun eigen geschilderde kop - dezelfde als op de
  knoppen en op het speurdokubord, zodat je iemand over de puzzelsoorten heen
  herkent. Vier keer hetzelfde poppetje zei niets. De kolommen zijn
  voorwerpen en plekken, en daar blijven de lijniconen van `icons.js` staan:
  ze zijn vijftien tot twintig pixels groot, en op dat formaat is een
  geschilderd icoontje geen tekening maar een vlek - het randlicht is een
  halve pixel en het verloop is modder. Een lijn op die maat is scherper, en
  dat is de hele reden dat er twee sets zijn.

## Over plagiaat

Logische deductiepuzzels op een raster bestaan sinds de jaren zestig en zijn
vrij van rechten; de techniek erachter is wiskunde. Beschermd zijn merknamen,
personages, illustraties en teksten van bestaande uitgaven. Alles hier — de
naam, de werelden, de personages, de formuleringen, de code — is eigen werk,
en er is geen bestaande puzzel overgenomen.

## Mappen

```
index.html              de pagina
styles/app.css          alle opmaak
src/engine/             solver, propagator, generatoren, moeilijkheid
src/content/            werelden, opdrachten, de catalogus
src/ui/                 landingspagina, bibliotheek, generator, speler, borden
src/ai/                 de optionele AI-laag (met de keuring)
server/serve.mjs        lokale server + AI-proxy
tools/                  keuringsscripts
```

## Wat er nog niet is

- Inloggen en voortgang over apparaten heen. Voortgang staat in
  `localStorage`, dus per browser.
- Bediening met het toetsenbord op het bord zelf: de vakjes zijn nog geen
  knoppen, dus met alleen een toetsenbord of een schermlezer kun je een
  Reconstructie niet spelen.
- Een dagelijkse puzzel.
- Een afsluiting als je het goed hebt: nu staat er alleen "Opgelost". Daar
  hoort de dader in beeld te komen, met een slotzin en een knop naar de
  volgende zaak.
- Twaalf bij twaalf is op een telefoon nog krap. De sierlijst om het bord
  staat op een smal scherm vanzelf uit (knop: "Lijst eromheen"), wat ruim een
  derde aan breedte scheelt, maar zestien bij zestien vraagt nog om zoom.
- De oplossing zit in de pagina: wie de ontwikkelaarsconsole opent kan hem
  lezen. Voor een wedstrijdvorm moet dat naar een server.
- Meer feestdagwerelden dan kerst en halloween.
- Een laadmelding terwijl een twaalf-bij-twaalf wordt gebouwd. Dat duurt
  ongeveer een seconde, en in die seconde staat het scherm stil.
