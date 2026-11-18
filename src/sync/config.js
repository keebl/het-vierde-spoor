// Waar de accounts wonen (ADR-0006). Deze twee waarden zijn openbaar met
// opzet: de publishable key mag iedereen zien, de bescherming zit in Row
// Level Security in de database. De geheime sleutel van het project (de "service role") hoort hier nooit;
// de keuring (check:sync) kijkt daarop.
//
// Leeg laten = geen accounts: geen menuknop, geen #/account, de site zoals
// hij altijd was (criterium 2).
export const SUPABASE_URL = 'https://kteiwsvhynuktjarhksm.supabase.co';
// gitleaks herkent elke lange sleutel als geheim; deze is het met opzet
// niet (een publishable key, ADR-0006), vandaar de markering op de regel.
export const SUPABASE_KEY = 'sb_publishable_SkYp3H3UQBklDWafdvYjrg_lsaoDjUX'; // gitleaks:allow

// De schakelaar. Uit tot clearhead, dat dezelfde database gebruikt, zijn
// tabellen voor vreemden heeft dichtgezet (spec, Prerequisite 1): tot die
// tijd zou een login hier ook daar binnenkomen.
export const AAN = true;

// Om het lokaal te proberen zonder de schakelaar om te zetten: op
// localhost, met in de console
//   localStorage.setItem('vierdespoor.account-proef', '1')
// Op reconstructie.app doet dat niets.
function lokaleProef() {
  try {
    const host = globalThis.location?.hostname;
    return (host === 'localhost' || host === '127.0.0.1')
      && globalThis.localStorage?.getItem('vierdespoor.account-proef') === '1';
  } catch {
    return false;
  }
}

export function accountAan() {
  return !!(SUPABASE_URL && SUPABASE_KEY) && (AAN || lokaleProef());
}
