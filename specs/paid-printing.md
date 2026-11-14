# Spec: Paid printing (website)

Status: draft
Date: 2026-11-11

## Goal
Playing stays free for everyone; printing a puzzle becomes a one-time purchase of €4.99.
A buyer pays once, receives a code, and from then on can print every puzzle in up to three
browsers.

## Users and context
- **Buyers:** parents, teachers and puzzle fans who want a case on paper (train, classroom,
  kitchen table). Mostly desktop or laptop, where a printer is.
- **Everyone else:** keeps playing exactly as today; the only change they see is that the
  print button asks for a purchase.
- **Platform:** the website. The site at `keebl.github.io/het-vierde-spoor` is still a test
  site; the owner will arrange an own domain. Until then the lock is off for normal
  visitors (see scope).

This is one of two features. The native app (Capacitor wrapper with an in-app purchase for
the same unlock) gets its own spec once the app exists; this spec only prepares a seam for
it (criterion 12).

## Scope (in)
- A print entitlement ("printen ontgrendeld") stored in `localStorage` under a
  `vierdespoor.*` key.
- Purchase through **Lemon Squeezy** (merchant of record: it charges, issues the invoice,
  handles EU VAT and issues a licence key). One product, €4.99, licence keys with an
  activation limit of **3**.
- An unlock dialog: buy link (opens Lemon Squeezy checkout), a field to paste the code, and
  feedback on success or failure.
- Activating a code through the Lemon Squeezy licence API from the browser, and
  deactivating it again ("gebruik deze code op een ander apparaat").
- Without the entitlement, the print stylesheet hides the puzzle and prints a short page
  with what printing costs and where to buy it — so Cmd+P does not bypass the button.
- **A switch, off by default:** the whole lock is behind one setting (`BETAALD_PRINTEN`:
  `uit` / `test` / `live`). `uit` = today's behaviour, printing free. `test` = lock on with
  the Lemon Squeezy test-mode product; reachable on the test site with `?betaaltest`.
  `live` = lock on for everyone with the live product. Store URL and product id are
  settings next to it, not hard-coded, because the domain is not settled.
- `docs/PRODUCT.md` and an ADR updated: the non-goal "No monetisation" becomes "one paid
  feature: printing; no ads, no tracking, no accounts".

## Non-goals (out)
- **Paying per puzzle or per bundle.** One-time buyout only.
- **Paying for anything else.** Playing, hints, solutions, the library, all worlds and
  levels stay free.
- **Accounts, e-mail login, server-side storage.** The code is the proof of purchase.
- **Making the lock unbreakable.** It is a fair lock, not DRM: a screenshot or editing
  `localStorage` gets past it, and that is accepted.
- **The native app and its in-app purchase** — separate spec. A web code is not valid in
  the app (Apple and Google require their own purchase for digital unlocks).
- **A printable bundle or booklet (PDF with many cases).** Discussed, not chosen; may come
  back as its own spec.
- **Going live.** Switching `BETAALD_PRINTEN` to `live` waits for the own domain and is a
  one-line change plus a Lemon Squeezy setting, done by the owner.

## Acceptance criteria
1. Given `BETAALD_PRINTEN` is `uit` and no `?betaaltest`, when a visitor clicks "Printen",
   then the print dialog opens exactly as today.
2. Given the lock is on (`test` via `?betaaltest`, or `live`) and no entitlement is stored,
   when the visitor clicks "Printen", then the unlock dialog opens and the print dialog does
   not.
3. Given the lock is on and no entitlement, when the visitor prints with the browser's own
   command (Cmd+P / Ctrl+P), then the printed page shows the price and the buy address
   instead of the puzzle.
4. Given the unlock dialog is open, when the visitor clicks the buy button, then Lemon
   Squeezy checkout for the configured product opens in a new tab.
5. Given a valid code with a free activation, when the visitor pastes it and confirms, then
   the code is activated with Lemon Squeezy, the entitlement is stored, the dialog says
   printing is unlocked, and the next click on "Printen" opens the print dialog.
6. Given an entitlement is stored, when the page is reloaded or the visitor opens another
   puzzle, then printing works without asking again and without a network request.
7. Given a code that Lemon Squeezy reports as invalid, refunded or disabled, when the
   visitor confirms it, then the dialog shows a Dutch message saying the code is not valid
   and nothing is stored.
8. Given a code that already has 3 activations, when the visitor confirms it, then the
   dialog says the code is in use on three devices and explains how to release one.
9. Given an entitlement is stored, when the visitor chooses "gebruik deze code op een ander
   apparaat", then the activation is released at Lemon Squeezy and the entitlement is
   removed from this browser.
10. Given there is no network, when the visitor confirms a code, then the dialog says to try
    again when online, and nothing is stored.
11. Given `?betaaltest` is used, then the dialog visibly says it is in test mode, and only
    the test-mode product is used.
12. The question "may this browser print?" is answered by one function in one module, so
    the app can later answer it from its in-app purchase without touching `player.js`.
13. The licence code and the activation id are the only purchase data stored; no name,
    e-mail address or order data is stored or logged by the site.

## Edge cases and error states
- Offline during activation → criterion 10. Offline after activation → criterion 6.
- `localStorage` blocked or cleared (private window, cleared site data) → entitlement gone;
  the buyer pastes the code again (uses an activation; releasing is possible from the
  Lemon Squeezy order e-mail / customer portal).
- Lemon Squeezy API slow or down → timeout after a fixed number of seconds with the same
  message as offline.
- Malformed input (spaces, line breaks around the code) → trimmed before sending.
- Code refunded after activation → still prints in that browser (no periodic re-check);
  accepted, see non-goals.
- Half-finished puzzle printed → unchanged from today: own crosses stay, automatic crosses
  go (`styles/app.css`, print section).
- Visitor bought on the test site before the domain move → `localStorage` is per origin,
  so on the new domain they paste the code again; Lemon Squeezy keys are not
  domain-bound. Mention this on the unlock dialog once live.

## Data and privacy
- Stored in the browser: the licence key and the Lemon Squeezy activation (instance) id,
  under a `vierdespoor.*` key. That is all.
- Sent to Lemon Squeezy (`api.lemonsqueezy.com`): the licence key and an instance name
  (a fixed label such as "browser", not a device fingerprint).
- Personal data (name, e-mail, payment) is collected by Lemon Squeezy as merchant of
  record during checkout, under their privacy policy; the site never sees it. The site's
  privacy text names Lemon Squeezy and what it is used for (AVG).
- No analytics, no tracking pixels, no Lemon Squeezy script on every page — the checkout
  is a plain link that opens in a new tab.

## Design direction (UI features)
There is no `docs/DESIGN.md` or `design/refs/` in this repo yet (flagged). Follow the
existing style: the unlock dialog matches the existing notes and dialogs in `styles/app.css`
(the `--pop-*` colours, the handwritten `--schrift` for the heading), Dutch copy in the
project's tone — short, friendly, honest about the price. The printed "ontgrendel" page is
black on white, one heading, two sentences, the address, no images.

## Test plan
- **Unit (node, in the keuring style under `tools/`):** the entitlement module — states
  `uit`/`test`/`live`, stored/not stored, `?betaaltest` handling, response parsing for
  valid / invalid / limit reached / network error, with the Lemon Squeezy calls injected
  as a stub. Run with `npm run check:snel` (fits there: builds no puzzles).
- **Manual, in the browser pane on the test site with `?betaaltest`:** buy with a Lemon
  Squeezy test card, activate, reload, print, release, activate on a fourth "device" (a
  private window) to hit the limit, airplane mode for the offline message. Screenshot of
  the dialog in light and dark mode, and a print preview with and without entitlement.
- **Regression:** without `?betaaltest`, criterion 1 checked by hand; full keuring
  (`npm run check:all`) before merging.

## Open questions
- **CORS on the Lemon Squeezy licence API.** Activation must work from the browser with no
  server of our own. To be proven in step 1 before anything else is built; if it fails, the
  fallback is a tiny proxy (the existing `worker/` Cloudflare setup), which changes "no
  server" and needs a decision.
- **Lemon Squeezy account and products** (live and test mode) are created by the owner;
  store URL and product ids go into the settings. No secret is needed in the browser — the
  licence API does not take the store's API key.
- **Privacy text:** the site has no privacy page today; one short paragraph is needed
  before going live.
- **Licence of the repository** (`STATUS.md`, TODO(guus)) — with a paid feature, "all
  rights reserved" is the safe default; the code being public stays acceptable because the
  lock is fair-use, not DRM.

## Plan (added before building)
_Added after approval._
