# Withdrawal waiver for digital content — draft

> Draft 2026-11-25, not approved. Basis: Dutch Civil Code art. 6:230p(g) (consumer rights
> directive art. 16(m)): for digital content not on a physical medium, the 14-day right of
> withdrawal ends when delivery starts, **if** the consumer gave prior express consent,
> acknowledged losing the right, and the trader confirmed this on a durable medium.
> If Stripe Managed Payments asks for this itself in its checkout (see `README.md`,
> question 1), only the confirmation below is ours.

## Before payment (checkout, step 3)
One checkbox, not ticked by default; "Betalen" stays disabled until it is ticked:

> ☐ Ik wil volledige toegang meteen gebruiken. Ik weet dat ik daardoor mijn
> herroepingsrecht van 14 dagen verlies.

Under it, small: "Lees de [algemene voorwaarden](/voorwaarden)."

## Confirmation (durable medium: the receipt mail and the page after payment)
> Je hebt volledige toegang tot Reconstructie gekocht voor {prijs}, op {datum}, met het
> Google-account {e-mailadres}. Je koos ervoor de toegang meteen te gebruiken en gaf aan
> te weten dat je daarmee je herroepingsrecht van 14 dagen verliest. Spijt? Lees in de
> voorwaarden wanneer je toch je geld terugkrijgt: reconstructie.app/voorwaarden.

## Android
Google Play handles withdrawal and refunds for in-app purchases under its own policy; the
app shows no checkbox of its own.

## What the build needs
- The checkbox state is sent with the Checkout session request and stored as Stripe
  metadata (`afstand_herroeping: "ja"`, with the time), so the consent can be shown later.
- The text above goes into `docs/UX.md` (paywall / checkout) before it is used.
