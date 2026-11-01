# Het Vierde Spoor

Deductiepuzzels in zes werelden, vier soorten opdracht, drie mechanieken en
vijf moeilijkheidsgraden. Veertig kant-en-klare puzzels, plus een generator
waarmee je er zelf een maakt.

Elke puzzel heeft gegarandeerd **precies een oplossing**, en die is altijd
met logica te vinden — nooit met gokken. Dat is machinaal gecontroleerd
voordat een puzzel bij de speler komt.

## Starten

```bash
npm start
```

Daarna staat de site op http://localhost:4173.

Er is geen build-stap en de site heeft nul dependencies: het zijn gewone
ES-modules die de browser rechtstreeks laadt. De map is daarmee ook direct te
hosten als statische site (GitHub Pages, Netlify, Vercel) — alleen de
optionele AI-laag heeft de meegeleverde Node-server nodig.

## Keuren

```bash
npm run check:all
```

Dit bouwt honderden puzzels over alle combinaties plus de hele catalogus, en
controleert per puzzel of de oplossing uniek is, of het antwoord op de vraag
klopt, of elke aanwijzing een leesbare Nederlandse zin oplevert en of de
moeilijkheid bij het gevraagde niveau past.

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
| **Wereld** | het decor en alle woorden | `src/content/worlds.js` |
| **Mechaniek** | hoe je oplost (raster, plattegrond, getallenraster) | `src/ui/boards.js` |
| **Niveau** | omvang, soort aanwijzingen, redeneerdiepte | `src/engine/difficulty.js` |

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

## De AI-laag (optioneel, standaard uit)

Zet je hem aan, dan laat de site de verhaalteksten herschrijven door Claude.
De **logica komt nooit van de AI**: die blijft van de generator. Elke
herschreven aanwijzing wordt nagekeken op het woordelijk behoud van alle
eigennamen; faalt dat, dan blijft de originele zin staan. Een slechte
herschrijving kan een puzzel dus niet onoplosbaar of dubbelzinnig maken.

Aanzetten:

```bash
cp .env.example .env    # vul je ANTHROPIC_API_KEY in
npm start
```

Daarna op "Zelf maken" de knop *AI-teksten* omzetten. Zonder key werkt alles
gewoon door met de eigen templateteksten.

Die knop wordt per browser onthouden (`localStorage`), dus in een andere
browser of op een ander apparaat zet je hem opnieuw om. Staat hij aan, dan
gaat er bij het openen van elke puzzel een verzoek naar de API; de puzzel is
intussen al speelbaar met de eigen teksten en wordt daarna ververst.

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
src/ui/                 bibliotheek, generator, speler, borden
src/ai/                 de optionele AI-laag (met de keuring)
server/serve.mjs        lokale server + AI-proxy
tools/                  keuringsscripts
```

## Wat er nog niet is

- Inloggen en voortgang over apparaten heen. Voortgang staat nu in
  `localStorage`, dus per browser.
- Een dagelijkse puzzel.
- De oplossing zit in de pagina: wie de ontwikkelaarsconsole opent, kan hem
  lezen. Voor een wedstrijdvorm moet dat naar een server.
- Het getallenraster heeft nog geen getuigenverklaringen in tekst; de
  gegeven cellen staan direct in het raster.
