# Spec: Paywall and Android app (with the production setup they need)

Status: draft
Date: 2026-11-20

## Goal
Every player keeps two free puzzles per level. After that, playing more needs a purchase.
The same game ships as an Android app in Google Play, and an iPhone app comes later. One
purchase opens the game wherever the buyer signs in: on the web, on Android and later on
iPhone.

Because money now runs through it, the site moves off the hobby setup onto services that
are solid enough to sell on (see "Production setup").

## What this changes
- It reverses the 2026-11-11 decision that only printing is paid, and the non-goal "No
  monetisation, no ads, no tracking" in `docs/PRODUCT.md`. "No ads, no tracking" stays.
  `docs/PRODUCT.md` gets an update when this spec is approved.
- Reconstructie becomes a trader under the DSA. The KvK registration is in place.
- `specs/paid-printing.md` (draft, not built) is folded in. Printing becomes one of the
  things the purchase unlocks, so it is no longer a separate €4.99 product. Decision D6.

## Users and context
- **Players on the web** (reconstructie.app), signed in or not.
- **Players on Android** who install the app from Google Play.
- **Players on iPhone**, later, under their own spec.
- **Children.** Guus's daughter plays, so children are among the players and Family Link
  already applies to sign-in (`docs/accounts-go-live.md` §4). A child cannot buy. A parent
  buys, and the purchase must reach the child's account. Google Play's Families policy
  applies once the app's target audience includes children. Decision D5.

## Scope (in)
1. **The free allowance.** Two puzzles per level are free (levels 1–6, so 12 in all). A
   puzzle counts once it is opened. A puzzle that was already opened stays playable.
   Decision D2 says what "opened" and "level" cover.
2. **The paywall screen.** It appears when the third puzzle of a level is opened, and says
   what the buyer gets and what it costs. It has one primary action, "Ontgrendelen", and a
   way back to puzzles the player can still play. Its copy goes into `docs/UX.md` first
   (`/functional-design --feature paywall`).
3. **Account required to buy.** A purchase is tied to the Google account the player is
   already signed in with (ADR-0006). That is how one purchase works on the web and in the
   app. Signed-out play keeps the free allowance, counted in `localStorage`.
4. **Entitlement on the server.** One table records whether an account owns the game, and
   the payment webhooks write to it. The client only reads it and caches it for offline
   play. No client can write it (RLS).
5. **Purchase on the web** through a merchant of record. The provider charges, invoices,
   handles EU VAT and processes refunds. Decision D3.
6. **Purchase in the Android app** through Google Play Billing. Google requires this for
   digital content bought inside a Play app. A web purchase made earlier is honoured in the
   app. Under Play policy the app may not link out to the web checkout.
7. **The Android app** is a Trusted Web Activity (TWA): the live site in a full-screen
   Chrome view, packaged with Bubblewrap and signed by Play App Signing. To support this,
   the site gets a web app manifest and a service worker, which also makes it installable
   and playable offline. `/.well-known/assetlinks.json` proves the site and the app belong
   together.
8. **The store listing**: name, short and full description, icon, feature graphic,
   screenshots, privacy policy URL, the data-safety form, the content rating questionnaire,
   and an account-deletion web URL (Play requires one even though the app deletes in-app).
9. **Restore purchase.** Signing in on a new device restores the purchase; there is also a
   visible "Aankoop herstellen" link.
10. **A switch, off by default.** The paywall sits behind `BETAALMUUR` (`uit` / `test` /
    `live`), like `AAN` for sign-in. `test` turns the lock on only with `?betaaltest`, using
    the provider's test mode and a Play internal-testing track.

## Scope (out)
- The iPhone app. It gets its own spec once Android is live. That spec covers Capacitor
  with StoreKit, the App Store Server Notifications on the same entitlement table, Apple's
  4.2 "minimum functionality" review risk for web wrappers, and an Apple Developer account
  as an organisation.
- Subscriptions, unless D1 picks them.
- Ads, tracking and analytics beyond what the payment providers need.
- Making the lock impossible to bypass. See Risks.

## Production setup ("not on a hobby environment")
What runs where today, what is good enough to sell on, and what Guus arranges. Each item
under "What changes" is a decision in the table below.

| Part | Today | Solid enough to sell on? | What changes |
|---|---|---|---|
| Static site | GitHub Pages from `main` | **No.** GitHub's terms do not allow Pages to be used mainly for commercial transactions. It also has no deploy previews and no instant rollback. | Move to **Cloudflare Pages** from the same repository. The DNS is already at Cloudflare and the free plan allows commercial use. Deploys stay "push `main`", and every PR gets a preview URL. D7. |
| Accounts and data | Supabase, free project `claudeDB`, shared with clearhead and crossroads | **No, for money.** A free project pauses after 7 days without traffic, has no backups, and shares Auth and limits with two other apps. | Give Reconstructie its **own Supabase project on the Pro plan** (about $25 per month, EU region, daily backups, no pause). Move the `reconstructie` schema and its users there. D4. |
| Server logic (webhooks, entitlement) | None. `worker/` is not deployed. | n/a | **One small server endpoint** receives the provider's webhook and Google Play's Real-Time Developer Notifications, checks their signatures, and writes the entitlement. It is either a Supabase Edge Function (same project as the data) or a Cloudflare Worker. Recommendation: Edge Function, so there is one place fewer to run. |
| Payments, web | None (Lemon Squeezy in an unbuilt draft) | Yes, if the provider is a merchant of record | Guus opens a store account. D3. |
| Payments, Android | None | Yes. Play Billing is required anyway. | Google Play Console account and payments profile. |
| One view of "who owns the game" across web, Play and later Apple | n/a | n/a | Either our own entitlement table fed by every store, or **RevenueCat** (free up to $2.5k monthly revenue) on top of the stores. RevenueCat adds a dependency but saves most of the Apple work later. D8. |
| Secrets | Bitwarden Secrets Manager via `secrets-run` | Yes | New keys (webhook secrets, Play service account) go into Bitwarden and the server's own secret store. They never go into the repo or the chat. |
| Monitoring | None for the site | Not enough once people pay | Turn on Sentry (already a connector for this project) for the client and the webhook endpoint. Supabase's own log covers the database. |
| Domain and email | reconstructie.app at Cloudflare; `privacy@` forwards | Yes | Add `support@` (Play and the payment provider ask for a support address). |

### What Guus arranges (accounts and money: only he can)
1. **Google Play Console as an organisation**, $25 once. It needs a **D-U-N-S number**
   for the KvK company, which is free from Dun & Bradstreet and can take one to several
   weeks. Start it first. An organisation account skips the rule that a new personal
   account must run a closed test with 12 testers for 14 days before it can publish.
   Then set up the Play payments profile with the business bank account.
2. **The payment provider store** for the web (D3), with the KvK details and the business
   bank account.
3. **Supabase Pro**: a new project for Reconstructie in the EU, about $25 per month (D4).
4. **Cloudflare Pages**: nothing to buy. Claude does the move with the existing Cloudflare
   token once D7 is approved.
5. **Terms and privacy**: general terms of sale (algemene voorwaarden), the right of
   withdrawal for digital content (the buyer waives it on purchase, which needs a checkbox),
   and an updated `privacy.html` naming the payment data and its processors. Claude
   drafts all three; Guus approves them, ideally with a lawyer or a template from the KvK
   or ondernemersplein.
6. **Later, for iPhone**: an Apple Developer Program account as an organisation (same
   D-U-N-S), $99 per year.

## Decisions to make
| # | Question | Options | Recommendation |
|---|---|---|---|
| D1 | What does a buyer pay for? | a) one-time unlock of everything; b) subscription (per month or year) | a) one-time, around €4.99–€7.99. It suits a puzzle game for a household, needs no cancellation flow, and keeps support small. |
| D2 | What counts toward the 2 free per level? | a) generated puzzles and the 82 library cases together, per level; b) generated only, with the library free; c) the library is the free part and generating needs a purchase | a), the simplest to explain. |
| D3 | Web payment provider | a) Lemon Squeezy (merchant of record, owned by Stripe); b) Paddle (merchant of record); c) Stripe with our own VAT handling | a), already worked out in `specs/paid-printing.md`. If D8 picks RevenueCat, check its web billing first, because it may replace D3. |
| D4 | Where accounts and the entitlement live | a) own Supabase project, Pro; b) stay in `claudeDB` (free) | a). Money must not depend on a project that pauses and has no backups. |
| D5 | Is the Android app aimed at children? | a) "everyone, not aimed at children" (rated by questionnaire); b) includes children (Families policy, stricter rules for ads, data and sign-in) | Discuss. Choosing a) while children clearly play is a policy risk. b) is more work but honest. |
| D6 | Does the purchase also unlock printing? | a) yes, one purchase for everything; b) printing stays a separate product | a). One product, one paywall. |
| D7 | Static hosting | a) Cloudflare Pages; b) stay on GitHub Pages | a). |
| D8 | Entitlement layer | a) own table plus own webhook code per store; b) RevenueCat | a) for Android plus web. Reconsider b) when iPhone starts. |
| D9 | Signed-out players | a) free allowance in `localStorage`, sign-in needed to buy; b) sign-in needed after the free puzzles even to look at the paywall | a). |

## Acceptance criteria
1. Given a signed-out player on the web, when they open the third puzzle of a level, then
   the paywall shows and the puzzle does not.
2. Given a player who opened two puzzles of level 3, when they reopen one of those two,
   then it plays as before.
3. Given a signed-in player without a purchase, when they buy on the web and return, then
   within 30 seconds every puzzle opens and printing works, without a reload.
4. Given a player who bought on the web, when they sign in with the same Google account in
   the Android app, then the app is unlocked without a second purchase.
5. Given a player in the Android app, when they buy through Google Play Billing, then the
   same account is unlocked on the web.
6. Given a refund or a chargeback at either store, when the store reports it, then the
   entitlement is withdrawn within an hour, and puzzles already solved stay in the history.
7. Given the webhook endpoint receives a request with a wrong or missing signature, then it
   writes nothing and answers 401.
8. Given a player is offline after buying, when they open a puzzle, then the cached
   entitlement opens it, for up to 30 days without contact.
9. Given `BETAALMUUR = uit`, then the site behaves exactly as today.
10. Given the Android app, then it opens full screen with no browser bar (asset links
    verified), works offline for puzzles already loaded, and passes Play's pre-launch
    report.
11. Given the site on Cloudflare Pages, then reconstructie.app serves the same files as
    `main`, HTTPS is enforced, and a PR gets a preview URL.

## Edge cases
- A player clears `localStorage` to reset the free count. This is accepted (see Risks).
- A child's account, where the parent buys on their own account. Recommendation: the
  purchase is tied to the account that bought it, and Play Family Library sharing is
  checked during the build. Open: Family Link may block a child's in-app purchase anyway.
- The provider's webhook arrives before the player returns to the site. The client polls
  the entitlement briefly after checkout.
- A Play purchase is "pending" (cash payment methods). Nothing unlocks until it is
  "purchased".
- The Supabase migration from `claudeDB` to a new project happens while players are signed
  in. Sessions in the old project end, and the site asks them to sign in once more.
- Supabase is unreachable. The cached entitlement decides; without a cache, the free
  allowance applies.

## Risks
- **The lock can be bypassed.** Puzzles are generated in the browser from a seed, so a
  determined player can get around a client-side lock (devtools, clearing storage). A
  bypass-proof lock would mean generating on a server, which is a rewrite and is out of
  scope. The lock is meant to keep honest players honest.
- **Store policy.** Play rejects an app that links to an outside checkout, and later Apple
  may reject a thin web wrapper. Mitigation: Play Billing in the app; for iPhone, native
  extras in its own spec.
- **D-U-N-S lead time** can delay the Play launch by weeks. Start it first.
- **Moving accounts to a new Supabase project** is the riskiest technical step: users,
  tokens and the Google OAuth redirect all change. It needs a plan step of its own with a
  rehearsal.

## Costs
| Item | Cost |
|---|---|
| Google Play Console | $25 once |
| Google Play fee | 15% of the first $1M per year |
| Web merchant of record | about 5% + €0.50 per sale |
| Supabase Pro | about $25 per month |
| Cloudflare Pages | free |
| Apple Developer (later) | $99 per year |

The AI texts keep their daily cap (`AI_DAILY_CALL_LIMIT`). There is no other usage-billed
service.

## Test plan
- Unit tests: the free-allowance counter and the entitlement cache. They join the
  keuring as `check:betaalmuur`, with no network.
- The webhook: signature check and idempotency (the same event twice changes nothing),
  with recorded test payloads.
- RLS: no client can write the entitlement. This is added to the `supabase/tests` RLS
  suite.
- End to end in test mode: buy on the web, then check on Android (internal testing track),
  and the other way round; then refund.
- The UI rules in `~/.claude/rules/ui.md` for the paywall screen, plus `/ux-walk` for the
  purchase flow.

## Plan (added after approval)
To be written once D1–D9 are decided. Rough order:
1. D-U-N-S, Play Console and store accounts. These are Guus's steps and start first.
2. Move to Cloudflare Pages.
3. Create the new Supabase project and move accounts there.
4. Entitlement table and webhook.
5. Paywall on the web, behind the switch.
6. Manifest, service worker and TWA.
7. Play Billing.
8. Store listing.
9. Internal test, then production.
