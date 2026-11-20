# ADR-0007: Paid access after a free allowance

Date: 2026-11-20
Status: proposed (Guus, 2026-11-20: a paywall after two puzzles per level, and an Android
app; "spec vandaag", build from 2026-11-25). Accepted when `specs/paywall-and-android.md`
is approved.

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
5. **Money moves the site off the free stack.** Static hosting moves from GitHub Pages
   (whose terms exclude sites aimed mainly at selling) to Cloudflare Pages. Accounts and
   the entitlement move from the shared free project `claudeDB` to Reconstructie's own
   Supabase project on a paid plan with backups. This supersedes ADR-0006's "shared
   project" choice for Reconstructie, but not its other decisions.

## Consequences

- "No ads, no tracking" stays. The money buys access, never data.
- Reconstructie becomes a trader under the DSA, with its name and address on the Play
  listing.
- Running costs: about $25 per month for Supabase plus store fees per sale.
- A clever player can get around the lock. That is accepted.
- ADR-0002 still holds for the game itself. The only server code is a webhook endpoint
  for payments.
