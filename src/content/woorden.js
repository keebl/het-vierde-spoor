// Kleine taalhulpjes die zowel de werelden als de zinnen van het kamerraster
// gebruiken. Getallen in een zin schrijf je uit: "precies twee deuren", niet
// "precies 2 deuren".

const TELWOORD = [
  'nul', 'één', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht',
  'negen', 'tien', 'elf', 'twaalf',
];

export const telwoord = (n) => TELWOORD[n] ?? String(n);

export const hoofdletter = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
