// De kleur van een wereld, klaar om als css-variabele neer te zetten.
//
// Elke wereld heeft een accentkleur in de content staan. Die was alleen op
// het bord te zien; nu kleurt hij ook de kaart in de bibliotheek en de lijst
// om het speelbord. Zo ziet een zaak in Regenstad er anders uit dan een
// kerstavond, ook voordat je hem opent.

// Dezelfde kleur, maar donker genoeg om een lijst van te maken waar een
// lichte tekening goed op uitkomt.
export function verdiep(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex ?? '');
  if (!m) return 'rgb(58 46 34)';
  const n = Number.parseInt(m[1], 16);
  const r = Math.round(((n >> 16) & 255) * 0.3 + 18);
  const g = Math.round(((n >> 8) & 255) * 0.3 + 14);
  const b = Math.round((n & 255) * 0.3 + 12);
  return `rgb(${r} ${g} ${b})`;
}

export function genreStijl(wereld) {
  const accent = wereld?.accent ?? '#a3551f';
  return `--genre: ${accent}; --genre-diep: ${verdiep(accent)};`;
}
