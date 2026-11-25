# Legal texts for the paywall — drafts

Plan step 6 of `specs/paywall-and-android.md`. Claude drafted these on 2026-11-25; **none is
approved and none is on the site.** Guus approves them, ideally after a lawyer or a template
from the KvK or ondernemersplein.nl has looked at them (spec, Prerequisites 5). The texts
are Dutch because players read them; the notes around them are English.

| File | What | Goes where once approved |
|---|---|---|
| `algemene-voorwaarden.md` | General terms: the licence to play, what full access is, refunds, accounts, children | a page `voorwaarden.html`, linked from the paywall and the footer |
| `herroeping.md` | The withdrawal waiver for digital content: checkbox text, confirmation text | the checkout (step 3) and the confirmation mail or page |
| `privacy-aanvulling.md` | What the purchase adds to the privacy statement | `src/content/privacy-tekst.js` and `privacy.html` (the same text twice) |

## Open questions for Guus (and a lawyer)
1. **Who sells?** Under Stripe Managed Payments, Stripe is the merchant of record: it sells
   to the player, invoices, and handles VAT and refunds. Then Stripe's own customer terms
   govern the sale and the right of withdrawal, and our terms only govern the use of the
   game. Check in the Stripe dashboard which terms Stripe shows the buyer, and whether it
   already asks for the waiver itself; if so, `herroeping.md` shrinks to the confirmation.
2. **Details to fill in**: trading name, KvK number, a postal or visiting address (a
   consumer must be able to reach the trader; the DSA trader details are already on the
   photo-cleaner Play listing), and the price (D1).
3. **Refund policy**: the draft offers a refund on request within 14 days when fewer than
   five paid puzzles were opened, as a goodwill rule on top of the law. Keep, change or drop.
4. `store/privacy-policy.md` (2026-11-14) still says there are no accounts; it is out of date
   since sign-in went live on 2026-11-18 and must be rewritten before the Play listing.
