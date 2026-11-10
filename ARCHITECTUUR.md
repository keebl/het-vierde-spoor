# Hoe deze code in elkaar zit

Een kaart van het project voor wie er net bij komt — mens of model. De
README vertelt wat het spel is en hoe je het draait; dit bestand vertelt
waar iets staat, welke afspraken er gelden, en waar je moet zijn als je
iets wilt veranderen.

**In één zin:** een browser-app zonder bouwstap die deductiepuzzels
genereert en ter plekke narekent, met alle inhoud in handgeschreven
tabellen en één keuringsscript dat die tabellen bewaakt.

---

## De vorm van het project

Geen bundler, geen framework, geen afhankelijkheden. `index.html` laadt
`src/main.js` als ES-module en de browser doet de rest. Node is er alleen
voor het keuren (`tools/`) en voor een lokale server (`server/serve.mjs`).

Dat is een keuze, geen gemis: er is niets dat kan verouderen, niets dat
opnieuw gebouwd moet worden, en een push is een deploy. De prijs is dat
alles met de hand gaat — geen typecontrole, geen hulp van een linter.
Daarom is de keuring zo zwaar: die is wat een typesysteem hier niet doet.

```
index.html          laadt src/main.js
src/main.js         router: #/ , #/maken , #/puzzels , #/uitleg , #/puzzel/<id>
src/puzzle.js       instellingen -> een speelbare puzzel (de enige plek waar
                    content, motor en taal samenkomen)
src/engine/         de motor: alles wat rekent, weet niets van woorden
src/content/        de inhoud: alles wat woorden is, weet niets van rekenen
src/ui/             het scherm: tekenen en bedienen
tools/              de keuring
server/serve.mjs    lokale server + /api/flavour voor de AI-laag
worker/             een Cloudflare Worker voor diezelfde API, staat uit
```

---

## De drie lagen, en de regel ertussen

De belangrijkste afspraak in dit project:

> **De motor weet niets van taal. De inhoud weet niets van rekenen.**

`src/engine/` kent alleen getallen: vakjes, kamers als nummers, personen
als indexen. Hij weet niet dat kamer 3 "de bibliotheek" heet. `src/content/`
is omgekeerd: woorden, namen, tabellen, en geen enkele berekening.
`src/puzzle.js` is de enige plek waar ze elkaar raken.

Dat is waarom je een wereld kunt toevoegen door alleen woorden op te
schrijven, en waarom je het meubilair kunt omdopen zonder dat een puzzel
verandert. Houd die scheiding in stand; hij is de reden dat dit project
na zeventien werelden nog te overzien is.

### De motor (`src/engine/`)

| bestand | wat het doet |
|---|---|
| `rng.js` | deterministische random. Zelfde seed → zelfde puzzel, altijd. |
| `rooms.js` | het speelbord: kamers verdelen, meubels plaatsen, een plaatsing tekenen, aanwijzingen propageren, oplossingen tellen. |
| `generate-rooms.js` | de generator: kies een oplossing, bouw een vijver aanwijzingen, groei tot het vastligt, snoei weg wat je kunt missen. Plus `extraAanwijzing` voor de hint. |
| `difficulty.js` | wat een niveau belooft: bordmaat, aantal kamers, en of doorstrepen volstaat of er een aanname nodig is. |
| `generate.js`, `assign.js`, `latin.js`, `clues.js`, `graph.js` | de drie andere speltypes. Ze werken, maar staan niet in het zicht (zie `ZICHTBARE_MECHANICS`). |

De generator werkt in vier stappen, en die volgorde is de hele truc:

1. **Kies eerst de oplossing.** Dan is er er altijd minstens één.
2. **Bouw een vijver van aanwijzingen die in die oplossing waar zijn.**
   Alles wat erin zit is per definitie waar.
3. **Voeg toe tot de oplossing vastligt.** Goedkoop doorstrepen eerst, de
   dure teller pas als er nog een paar figuren open staan.
4. **Snoei alles weg wat je kunt missen** — in twee rondes, waarvan de
   tweede pas draait op de poging die het geworden is (anders kost zestien
   bij zestien zevenentwintig seconden in plaats van drie).

### De inhoud (`src/content/`)

| bestand | wat erin staat |
|---|---|
| `worlds.js` | de zeventien decors: namen, plekken, voorwerpen, tijden, en de zinnen waarmee die wereld over een plattegrond praat. |
| `kamersoorten.js` | **het hart van de inhoud.** Welke soort ruimte een plek is, welke vloer daarbij hoort, welk meubilair erin kan staan, en per wereld hoe dat meubilair daar heet. |
| `zaken.js` | wat voor zaak het is: een moord, een verdwijning of een diefstal. Levert woorden, geen logica. |
| `namen.js` | bij welke naam welk portret hoort (404+ namen, met de hand). |
| `iconen.js` | bij welk woord welk pictogram hoort. Met de hand, woord voor woord. |
| `rooms-text.js` | van een ruwe aanwijzing naar een Nederlandse zin. |
| `spelregels.js` | de regels in woorden, per speltype. |
| `catalog.js` | de tweeëntachtig vaste zaken (alleen instellingen, geen puzzels). |
| `assignments.js` | de vier opdrachten en de vier speltypes, plus wat er zichtbaar is. |

### Het scherm (`src/ui/`)

| bestand | wat het doet |
|---|---|
| `player.js` | het speelscherm: markeringen bijhouden, controleren, hinten, de oplossing geven. |
| `board-rooms.js` | het speurbord tekenen: vloeren, muren, meubels, figuren, kruisjes. |
| `bordrand.js` | de lijst om het bord, één per wereld. Het grootste bestand, en bijna helemaal tekening. |
| `meubelkunst-geschilderd.js` | 193 meubelstukken, geschilderd - waarvan een moderne set van ruim zeventig voor de werelden van nu. |
| `meubelkunst.js` | diezelfde stukken als lijnicoon (vergelijkpagina en noodgeval). |
| `personenkunst-geschilderd.js` | de koppen van de figuren. |
| `geschilderd.js` | de schildermotor: hoe een vorm licht en schaduw krijgt. |
| `vormen.js` | de bouwstenen van elke tekening: romp, plaat, poot, bol, ton… |
| `aankleding.js` | wat er los op een vloer ligt per soort ruimte. |
| `scenes.js` | de sfeertekening boven aan een puzzel. |
| `state.js` | voortgang en voorkeuren in `localStorage`. |
| `thema.js` | licht of donker. |
| `home.js`, `library.js`, `generator.js`, `uitleg.js` | de vier andere schermen. |

---

## De tabellen die alles sturen

Bijna alle inhoud zit in handgeschreven tabellen in `kamersoorten.js`. Dit
is de volgorde waarin ze elkaar overrulen — van algemeen naar specifiek:

```
SOORT_VAN[plek]            welke soort ruimte is dit?           (verplicht)
  VLOER_VAN[soort]         welke vloer hoort bij die soort
  WERELDVLOER[wereld]      hoe die wereld die vloer verschuift
  VLOER_VAN_PLEK[plek]     en wat die ene plek ervan afwijkt     (wint altijd)

MEUBELS_VAN[soort]         wat er in zo'n ruimte kan staan
  VERWANTE_SOORTEN[soort]  waar hij naar uitwijkt als dat opraakt
  WERELDVERWANT[wereld]    of die wereld ergens anders heen wijkt
  WERELDMEUBELS[wereld]    hoe dat meubilair in die wereld heet
  WERELDSTOF[wereld]       waar het daar van gemaakt is

OUDERWETS                  tekeningen die alleen in een landhuis, bos of
MODERNE_WERELDEN           grafkelder horen; een wereld van nu mag ze onder
                           geen enkele naam op een bord zetten

VORM_VAN[plek]             strook, vlak of hoekje — bepaalt welke naam
                           op welke kamer belandt
VOORZETSEL_VAN[plek]       "in", "op" of "bij" de plek
```

Een wereld toevoegen is dus: woorden in `worlds.js`, een regel per kamer in
`SOORT_VAN`, een `WERELDMEUBELS`-laag, een bordrand, een sfeertekening en
een palet in de stylesheet. De keuring vertelt je precies wat je vergeet.

---

## De keuring

`npm run check:all` draait `tools/keuring.mjs`, en die draait zeven scripts
achter elkaar - alle zeven, wat de vorige ook deed. Dat duurt vier tot vijf
minuten; dat is met opzet, want hij bouwt werkelijk elke combinatie die
iemand kan instellen.

| script | wat het nareken |
|---|---|
| `check.mjs` | bouwt elke combinatie van opdracht × wereld × speltype × niveau, twee seeds elk. Ruim duizend puzzels. |
| `check-catalog.mjs` | de tweeëntachtig vaste zaken. |
| `check-regels.mjs` | ruim zeventig regels over elke gebouwde puzzel: precies één oplossing, elke aanwijzing waar, geen aanwijzing die het antwoord verklapt, elke zin met een hoofdletter en een punt… |
| `check-ai-guard.mjs` | dat een herschreven tekst namen, ontkenningen en getallen intact laat. |
| `check-weggevers.mjs` | dat de inleiding niets weggeeft wat er niet hoort. |
| `check-iconen.mjs` | dat elk woord in de inhoud een eigen pictogram heeft. |
| `check-kamers.mjs` | de tabellen hierboven: elke plek een soort, elk meubelstuk een eigen tekening, geen twee namen die op elkaar lijken, elke naam een portret, elke kamernaam die klopt met zijn vloer, en geen tekening uit 1930 (`OUDERWETS`) in een wereld van nu (`MODERNE_WERELDEN`). |

`npm run check:snel` draait alleen de drie toetsen die geen puzzels bouwen
(iconen, kamers, AI-vangnet) en is in een seconde klaar. Dat vangt verreweg
de meeste fouten in de inhoud. Voor een oordeel draai je de hele keuring.

Onderaan staat een tabel met per toets goed of FOUT, en daaronder de regel
`volledige keuring exit=`. **Lees het oordeel daaruit, niet uit de exitcode
van je shell** - `npm run` kan groen melden terwijl een toets rood was.

Hier stond eerst een ketting van `&&` in `package.json`. Die stopte bij de
eerste rode toets, en dan draaien de volgende niet meer. Dat heeft een keer
74 woorden zonder pictogram verborgen achter één budgetfout in de veegronde.
Een vangnet dat bij de eerste scheur ophoudt met vangen is geen vangnet.

### Waarom de keuring zo zwaar is

Elke regel in `check-regels.mjs` en `check-kamers.mjs` staat er omdat er
een keer iets mis was dat niemand zag. Een paar voorbeelden, omdat ze
laten zien wat voor soort fouten dit project maakt:

- *een vleugel in een grafgewelf* — het meubilair van een soort ruimte
  raakte op en de code pakte het eerste het beste.
- *een slijpsteen die eruitzag als een touwhaspel* — twee namen deelden
  één tekening.
- *"drie markeringen kloppen niet"* terwijl er niets omlijnd stond — de
  speler schreef `wrong`, het bord las `fout`.
- *"Marieke is vermoord. De buurman van nummer zes werd gevonden"* — de rol
  werd los van de naam getrokken.
- *een besneeuwde tuin met groen gras* — één `soort` moest bos, steeg,
  sneeuw en serre tegelijk zijn.

Als je iets verandert en de keuring valt erover: de regel heeft bijna
altijd gelijk. Verander de regel alleen als je kunt opschrijven waarom
hij niet meer klopt — zoals bij "de band is nacht", die werd uitgebreid
toen er werelden bij daglicht kwamen.

---

## Afspraken die je moet kennen

**Alles volgt uit de seed.** Dezelfde seed geeft dezelfde puzzel, op elk
apparaat, voor altijd. Een nieuwe trekking toevoegen midden in een bestaande
reeks verschuift alles erna. Wil je iets nieuws kiezen, geef het dan een
eigen rng (`makeRng(\`${seed}:zaak\`)`), zoals de zaaksoort doet.

**Namen zijn versiering, logica niet.** Het meubilair krijgt zijn naam
nadat de puzzel al gegenereerd is. Omdopen kan een puzzel dus nooit
kapotmaken — en dat is precies waarom de wereldlagen veilig zijn.

**Een tekening sluit, een lijn niet.** Een gevuld pad eindigt op `Z`, een
lijn niet. Een meubelstuk staat op de vloer (onderkant ≥ 36 van de 48) en
heeft precies één onderdeel met `grond: true`. De keuring faalt anders.

**Geen sleutel in de repo.** `.env` staat in `.gitignore`, `.env.example`
bevat alleen een plaatshouder, en online draait geen API. De AI-teksten
van de bibliotheek zijn vooraf geschreven en staan als JSON in de repo.

**Nederlands, overal.** Variabelen, functienamen, commentaar, tekst op het
scherm. Commentaar legt uit *waarom* iets zo is, niet wat de regel eronder
doet — vaak met de fout erbij die ertoe leidde.

---

## Waar je moet zijn

| wat je wilt | waar |
|---|---|
| een wereld toevoegen | `worlds.js`, `kamersoorten.js` (`SOORT_VAN`, `WERELDMEUBELS`), `bordrand.js`, `scenes.js`, `app.css` |
| een meubelstuk toevoegen | `kamersoorten.js` (`MEUBELS_VAN`), `meubelkunst-geschilderd.js`, `meubelkunst.js` |
| een naam toevoegen | `worlds.js` én `namen.js` (portret) én soms `iconen.js` |
| een soort zaak toevoegen | `zaken.js`, plus een merk in `personenkunst-geschilderd.js` |
| de puzzel moeilijker of makkelijker | `difficulty.js` |
| een nieuwe regel afdwingen | `check-kamers.mjs` (inhoud) of `check-regels.mjs` (puzzels) |
| iets aan het speelscherm | `player.js`, en het bord zelf in `board-rooms.js` |
