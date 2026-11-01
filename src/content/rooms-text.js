// De Nederlandse zinnen van het kamerraster. Apart gehouden, zodat de motor
// niets van taal hoeft te weten.

const hoofdletter = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function zinVoor(c, w) {
  const P = w.personen[c.p];
  const Q = c.q != null ? w.personen[c.q] : null;
  const K = c.kamerIdx != null ? w.kamerNamen[c.kamerIdx] : null;
  const M = c.m != null ? w.meubelNamen[c.m] : null;

  switch (c.soort) {
    case 'kamer':
      return hoofdletter(c.ja ? `${P} stond in ${K}.` : `${P} stond niet in ${K}.`);
    case 'zelfdeKamer':
      return hoofdletter(c.ja
        ? `${P} en ${Q} stonden in dezelfde kamer.`
        : `${P} en ${Q} stonden niet in dezelfde kamer.`);
    case 'leegKamer':
      return hoofdletter(`in ${K} stond niemand.`);
    case 'naast':
      return hoofdletter(c.ja ? `${P} stond naast ${M}.` : `${P} stond niet naast ${M}.`);
    case 'opRij':
      return hoofdletter(`${P} stond op dezelfde rij als ${M}.`);
    case 'noord':
      return hoofdletter(`${P} stond ten noorden van ${Q}.`);
    case 'west':
      return hoofdletter(`${P} stond ten westen van ${Q}.`);
    case 'buren':
      return hoofdletter(c.ja
        ? `${P} en ${Q} stonden pal naast elkaar.`
        : `${P} en ${Q} stonden niet pal naast elkaar.`);
    default:
      return '';
  }
}

// De namen waar een aanwijzing naar verwijst. Nodig om een herschreven
// versie van de AI-laag te kunnen keuren.
export function namenIn(c, w) {
  const uit = [];
  if (c.p != null) uit.push(w.personen[c.p]);
  if (c.q != null) uit.push(w.personen[c.q]);
  if (c.kamerIdx != null) uit.push(w.kamerNamen[c.kamerIdx]);
  if (c.m != null) uit.push(w.meubelNamen[c.m]);
  return uit;
}
