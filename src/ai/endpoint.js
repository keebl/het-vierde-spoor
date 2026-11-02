// Waar de AI-laag zijn teksten haalt.
//
// Lokaal (localhost of een adres in je eigen netwerk) hangt de API naast de
// site: server/serve.mjs serveert /api/flavour en houdt je API-key bij zich.
//
// Op de live site bestaat die server niet - GitHub Pages serveert alleen
// bestanden. Daar praat de site met een Cloudflare Worker, waarin de key als
// geheim staat. Zet hieronder het adres van die Worker zodra je hem hebt
// uitgerold (zie README.md onder "De AI-laag live"). Blijft het leeg, dan
// gebruikt de live site gewoon de eigen teksten.
export const WORKER_URL = '';

const LOKAAL = /^(localhost|127\.0\.0\.1|\[::1\]|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

export const isLokaal = () => LOKAAL.test(location.hostname);

export const aiEndpoint = () => (isLokaal() ? '/api/flavour' : WORKER_URL);
