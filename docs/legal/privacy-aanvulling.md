# Privacy statement: what the purchase adds — draft

> Draft 2026-11-25, not approved. Once approved, these lines go into
> `src/content/privacy-tekst.js` **and** `privacy.html` (the same text twice; Google's
> consent screen links to the HTML page, which must work without script). Keep the voice:
> words a child understands (`docs/VOICE.md`).

## Changed lines

`Met een account:` — add at the end:
> Heb je volledige toegang gekocht, dan bewaren we ook dát je hem kocht, wanneer, en het
> nummer van de bestelling bij de winkel. Zo werkt hij op al je apparaten.

`Waar:` — replace with:
> Bij Supabase, in Parijs. Google regelt het inloggen. Betalen gaat via Stripe (op de
> website) of Google Play (in de app); zij zien je betaalgegevens, wij nooit. Elke nacht
> maken we een versleutelde reservekopie, die 30 dagen bewaard blijft.

`Hoe lang:` — replace with:
> Tot je je account verwijdert. Dat kan zelf, op de accountpagina. Dan wordt alles gewist,
> ook je toegang; wat er op je eigen apparaat staat, blijft daar. De reservekopieën zijn na
> 30 dagen ook weg. Stripe en Google Play bewaren de betaling zelf zo lang als de wet vraagt.

## New line
`Betalen:`
> Je kaart- of bankgegevens komen nooit bij ons. Stripe en Google Play zijn daar zelf
> verantwoordelijk voor, met hun eigen privacyverklaring.

## Processors to name in the long version (`store/privacy-policy.md`)
Supabase (accounts, data; EU, Paris), Google (sign-in; Play Billing), Stripe (web payments,
merchant of record), GitHub (hosting today, encrypted backups as workflow artifacts),
Cloudflare (DNS, later hosting).
