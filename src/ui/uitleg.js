import { el } from './boards.js';
import { WORLDS } from '../content/worlds.js';
import { ASSIGNMENTS, MECHANICS } from '../content/assignments.js';
import { LEVELS, LEVEL_IDS } from '../engine/difficulty.js';

export function renderUitleg(mount) {
  const p = (text) => el('p', { text });
  mount.replaceChildren();
  mount.append(
    el('h1', { text: 'Uitleg' }),
    el('div', { class: 'prose' }, [
      p('Elke puzzel hier heeft precies een oplossing, en die is altijd met logica te vinden. Nooit met gokken: dat is machinaal gecontroleerd voordat de puzzel bij jou komt.'),
      el('h2', { text: 'Vier assen' }),
      p('Een puzzel is een combinatie van vier keuzes. De opdracht bepaalt wat je uitzoekt, de wereld bepaalt het decor, de mechaniek bepaalt hoe je oplost, en het niveau bepaalt hoe zwaar het is.'),
      el('h2', { text: 'Opdrachten' }),
      ...ASSIGNMENTS.map((a) => p(`${a.name} - ${a.blurb}`)),
      el('h2', { text: 'Mechanieken' }),
      ...MECHANICS.map((m) => p(`${m.name} - ${m.blurb}`)),
      el('h2', { text: 'Niveaus' }),
      ...LEVEL_IDS.map((l) => {
        const lv = LEVELS[l];
        return p(`${l}. ${lv.label} - ${lv.slots} rijen, ${lv.cats} categorieen. ${
          lv.style === 'shallow'
            ? 'Op te lossen door stap voor stap door te strepen.'
            : 'Hier kom je met doorstrepen niet klaar: je moet ergens iets aannemen en die aanname weerleggen.'
        }`);
      }),
      el('h2', { text: 'Werelden' }),
      ...WORLDS.map((w) => p(`${w.icon} ${w.name} - ${w.blurb}`)),
      el('h2', { text: 'Seeds' }),
      p('Onder elke puzzel zit een seed. Dezelfde seed met dezelfde instellingen geeft altijd exact dezelfde puzzel, dus je kunt een link delen zonder dat er puzzeldata heen en weer gaat.'),
      el('h2', { text: 'Waarom dit geen kopie is' }),
      p('Logische deductiepuzzels op een raster bestaan sinds de jaren zestig en zijn vrij van rechten; de techniek erachter is wiskunde. Beschermd zijn merknamen, personages, illustraties en teksten. Alles wat je hier ziet - naam, werelden, personages, formuleringen, code - is eigen werk. Je vindt hier geen bestaande puzzel terug.'),
    ])
  );
}
