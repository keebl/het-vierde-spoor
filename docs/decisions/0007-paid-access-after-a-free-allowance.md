# ADR-0007: Paid access after a free allowance

Date: 2026-11-20
Status: accepted (Guus, 2026-11-20: a paywall after two puzzles per level, and an Android
app; decisions D1–D9 of `specs/paywall-and-android.md` on mission-control cards, the
database staying in `claudeDB` as D4 = A)

## Context

On 2026-11-11 Guus decided that playing stays free and only printing is paid
(`specs/paid-printing.md`, draft, never built). `docs/PRODUCT.md` listed "No monetisation"
as a non-goal. On 2026-11-20 he asked for a paywall after two puzzles per level and for
Android and iPhone apps.

Puzzles are generated in the browser from a seed (ADR-0002, ADR-0005). There is no server
that hands out puzzles, so no server can withhold one.

## Decision

1. **Two puzzles per level are free; more needs a single purchase.** That purchase also
   unlocks printing, so the printing-only product is dropped.
2. **The purchase belongs to the Google account** (ADR-0006). The server holds the
   entitlement, which only payment webhooks write; the client reads it and caches it.
3. **One entitlement across stores**: a web merchant of record and Google Play Billing (and
   App Store later) all write to the same record.
4. **The lock is honest, not bypass-proof.** It runs in the client. Making it bypass-proof
   would mean generating puzzles on a server, which would undo ADR-0002's "a push is a
   deploy" and is not worth it for a household puzzle game.
5. **Money moves static hosting off GitHub Pages** (whose terms exclude sites aimed mainly
   at selling) to Cloudflare Pages. Where accounts and the entitlement live is decision D4
   in the spec. The stores (Lemon Squeezy, Google Play) keep every order, so the
   entitlement can always be rebuilt from them, and our own database is never the only
   record of a purchase.
6. **The app includes children** (Google Play Families policy). Playing never needs an
   account, and a child never pays without a parent's approval.

## Consequences

- "No ads, no tracking" stays. The money buys access, never data.
- Reconstructie becomes a trader under the DSA, with its name and address on the Play
  listing.
- Running costs: store fees per sale, and €0 for the database until sales pay for a paid plan (D4 = A).
- A clever player can get around the lock. That is accepted.
- ADR-0002 still holds for the game itself. The only server code is a webhook endpoint
  for payments.
