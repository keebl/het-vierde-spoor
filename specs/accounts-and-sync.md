# Spec: Accounts and sync

Status: approved (Guus, 2026-11-18: "Goedgekeurd, zo bouwen")
Date: 2026-11-18

## Goal
A player who signs in with Google sees the same game on every device: the puzzles she
solved or revealed, her stars on the level path and her main preferences follow her from phone to laptop and back. Playing without signing in stays
exactly as it is today.

## Users and context
The owner's daughter (primary) plays on a phone and on a laptop (`docs/PRODUCT.md`), signed
in with her own Google account, which is supervised with Google Family Link. Today each
browser keeps its own progress in `localStorage`, so a case solved on the phone is still open
on the laptop, and once the level path (`specs/level-path.md`) ships her stars and her place
on the path would differ per device. Guus answered the level-path interview on 2026-11-18
with "ik denk dat we naar een authenticatie moeten met google". Sign-in is open to anyone who
finds the site (Guus, round 2: "Iedereen"), but no one ever has to sign in.

## Decisions from the interview (2026-11-18, relayed by the main session)
| Question | Guus's answer | What it means here |
|---|---|---|
| Backend | "Supabase, nieuw EU-project", then on costs: "hij zal bij de andere in de zelfde database moetne want ik mag maar 1 project" | Supabase, inside the existing free project `claudeDB` (Paris, eu-west-3), in its own schema `reconstructie`. No new project, no paid plan. |
| What syncs | "Plus voorkeuren", narrowed in the walkthrough to "Alleen afgerond mee" | Solved and revealed puzzles, path stars, and preferences. Half-finished boards stay on the device. |
| First sign-in | "Samenvoegen" | Local and account progress are merged; nothing is lost. |
| Who may sign in | "Iedereen" | Open Google sign-in. Prerequisite: the other app in `claudeDB` must first close its tables to strangers (see Prerequisites). |
| Half-finished board on two devices | Round 2 "Nieuwste wint"; walkthrough: "ik weet niet of we hier wat mee moeten, als mensen op twee aparateren tegelijk werken wordt alleen een afgeronde puzzel opgeslagen of kijk jij daar anders naar?", then "Alleen afgerond mee" | Half-finished boards (crosses, figures, sketch letters, struck clues, undo history) are not synced. No "newer board" bar, no "newest board wins". |
| Preferences | "Niveau, kruisjes, panelen" | Level, auto-crosses and open panels sync; the board frame and light/dark stay per device. |
| Her account | "Eigen account, Family Link" | A parent approves the sign-in once (steps under Family Link). |
| Menu when signed in (walkthrough) | "Rondje met letter" | A round badge with the first letter of the e-mail address. |
| Privacy text (walkthrough) | "Uitleg + privacy.html" | A section on Uitleg and a standalone `privacy.html`. |
| Where the data lives (mission control card, 2026-11-18) | "Schema in claudeDB" | Accounts and game state in the existing project `claudeDB` (ref `kteiwsvhynuktjarhksm`, eu-west-3), own schema `reconstructie` with RLS on every table, as `crossroads`. No Turso, no second project. |
| Approval (walkthrough) | "Goedgekeurd, zo bouwen" | Spec, product change and the clearhead prerequisite approved, with the half-board simplification. |
| Deletion and free plan (assumptions, no objection) | — | "Account verwijderen" wipes all Reconstructie data and deletes the login only if it has no data in another app; the free plan's seven-day pause is accepted. |

## Product change (needs Guus's approval with this spec)
This feature reverses two non-goals in `docs/PRODUCT.md` and changes its data section:

- "No accounts and no cross-device progress" becomes **optional accounts**: signing in with
  Google is offered, never required; without an account the site works as before.
- "No server for gameplay" stays true in substance and is reworded: puzzles are still
  generated, verified and played entirely in the browser. The only server is a database that
  stores a signed-in player's progress. If it is down, paused or unreachable, playing does not
  change; only syncing waits.
- "Personal data: none" becomes: none without an account; with an account, the Google
  e-mail address and an internal id (Supabase Auth) and the player's progress, to show it
  on all her devices.

Proposed new text for `docs/PRODUCT.md`, applied in the build's first step:

> **Non-goals**
> - **No mandatory accounts.** Signing in with Google is optional and only carries your game
>   to your other devices. Without an account, progress lives in `localStorage`, per browser.
> - **No server for gameplay.** Everything is computed in the visitor's browser; that is why
>   no API key needs to exist online. The one server is a small database (Supabase, EU) that
>   keeps a signed-in player's progress; when it is unreachable, playing is unaffected.
>
> **Data, privacy and money**
> - Personal data: none without an account. With an account: the Google e-mail address and
>   an internal id (Supabase Auth), and the player's progress (solved and revealed
>   puzzles, path stars, three preferences), to show it on all her devices. Deleted with "Account verwijderen". No analytics, no tracking.
> - Accounts: optional, Google sign-in only.

## Prerequisites (blocking)
1. **clearhead closes its tables to strangers.** `claudeDB` also serves clearhead
   (`~/Claude/Projects/personal-assistant`, tables `public.areas`, `brain_dumps`, `tasks`,
   `notes`, `actions`, `ai_usage`, Edge Function `brain-dump`) and crossroads (schema
   `crossroads`, already guarded by `crossroads.members`). Auth users are per project, so a
   stranger who signs in to Reconstructie holds a login that clearhead's policies accept:
   today they check only `user_id = auth.uid()`, so a stranger could create their own rows
   there and call its functions (for example `ai_usage`, `brain-dump`). Sign-ups are already
   on for clearhead's e-mail sign-up, so this gap exists today; Google sign-in widens it.
   The fix belongs in the **personal-assistant** project, as its own task and pull request:
   a members table (as `crossroads.members`, rows added by the owner in SQL, never by the
   app) required by every clearhead policy and checked in `brain-dump`. Reconstructie's
   Google sign-in is not switched on in production until that has merged and been verified
   with a stranger's login. This repo does not change clearhead's tables.
2. **Google OAuth client** (Guus, free): a Google Cloud project with an OAuth consent screen
   (app name Reconstructie, home page `https://reconstructie.app/`, privacy policy
   `https://reconstructie.app/privacy.html`, scopes `openid email` only) and a web client
   whose redirect URI is the Supabase callback of `claudeDB`. The client id and secret are
   entered by Guus in the Supabase dashboard (Authentication → Providers → Google); they are
   never pasted in chat or stored in this repo.
3. **Supabase settings on the shared project** (additive only, Guus or Claude via the
   dashboard): add `reconstructie` to the Data API's exposed schemas; add
   `https://reconstructie.app/` and `http://localhost:4173/` to the Redirect URLs, exactly,
   without wildcards. The Site URL stays clearhead's.

**Shared with crossroads and personal-assistant (clearhead).** In `claudeDB`, Auth is per
project, so these are one set for all three apps: the Auth users, the e-mail templates, the
Redirect URLs (Reconstructie only adds its own) and the auth mail rate limit. Reconstructie
sends no auth mail (Google sign-in only), so it does not use up that limit, but a change to
any of these settings for one app changes it for all three.

## Scope (in)
- **Sign in with Google** through Supabase Auth, OAuth with PKCE, so the result comes back as
  a `?code=` query parameter and never collides with the hash routes (`#/puzzel/…`). The
  sign-in uses the redirect flow, not Google's FedCM button, because Family Link's parent
  approval does not work with FedCM.
- **One entry in the menu:** "Inloggen" when signed out; when signed in, a round badge with
  the first letter of the e-mail address. Both open a new page `#/account`.
- **The account page `#/account`:** signed out, two lines on what an account does (your game
  on all your devices) and does not do (no ads, no mail, nothing shared), and
  "Inloggen met Google". Signed in: the e-mail address, "Bijgewerkt om 14:32" (the last
  successful sync), "Uitloggen" and "Account verwijderen".
- **What syncs**
  - per puzzle: solved and revealed (not the board itself);
  - the level path (`vierdespoor.pad`): stars and solved per stop;
  - preferences: level, auto-crosses, open panels. The board frame and light/dark stay per
    device.
- **Local first.** `localStorage` stays the store the game reads and writes, exactly as now.
  A separate sync module, when signed in, pushes what changed and pulls what is newer. It
  runs after sign-in, on page load, after a solve or reveal, after a path stop, and when the tab becomes visible again.
- **Merge rules** (the database applies them, so two devices pushing at once cannot undo
  each other):
  - solved and revealed: a puzzle is solved if solved on either side; revealed likewise;
  - path: highest stars per stop; solved if solved on either side;
  - preferences: the newest value wins, per preference.
  The first sign-in on a device that already has progress uses the same rules: nothing is
  lost.
- **A half-finished board stays on its device.** Crosses, placed figures, sketch letters,
  struck clues and the undo history are never sent. A puzzle half-played on the phone opens
  on the laptop with the laptop's own board (or empty); once it is solved anywhere, it shows
  as solved everywhere.
- **Account deletion in the app.** "Account verwijderen" asks once: "Je account en alles wat
  erbij bewaard is, worden gewist. De voortgang op dit apparaat blijft." On confirm, one
  database call deletes every Reconstructie row of the caller and, when that login has no
  data in another app of the project, the login itself. Afterwards: "Je account is
  verwijderd." and the player is signed out.
- **Sign out** is local (this device only, so it never ends a session elsewhere), stops
  syncing and keeps local progress.
- **Privacy:** a section on the Uitleg page and a standalone `privacy.html` (Google's
  consent screen needs a real page): who is responsible (Guus, KvK-registered), what is
  stored, why, where (Supabase, Paris), how long (until you delete the account), how to
  delete it, and that a child's account needs a parent's approval.
- **Backend, in schema `reconstructie`** (migrations under `supabase/migrations/` in this
  repo): tables `puzzels`, `pad`, `voorkeuren`, each keyed by `user_id` and with Row Level
  Security on and one policy per operation limited to `auth.uid() = user_id`; writes go
  through `security invoker` functions that apply the merge rules; `security definer`
  function `verwijder_mijn_account()` that acts only on `auth.uid()`. The `anon` role gets
  no rights on the schema.
- **Client library:** `@supabase/supabase-js` as a vendored ES-module file under
  `src/vendor/` (no build step, no CDN at runtime, for the same reason the fonts are
  self-hosted), with its version and licence beside it. It is loaded only when a session
  exists or the account page opens.
- **Configuration:** the project URL and publishable (anon) key of `claudeDB` in a committed
  file `src/sync/config.js`. They are public by design (RLS is the protection; the security
  baseline assumes the anon key is public). The `service_role` key is used nowhere. With an
  empty `config.js` the menu entry and account page are hidden and the site is today's.
- **Switch:** a single flag in `config.js` keeps sign-in hidden in production until
  Prerequisite 1 is verified; on localhost it can be on.

## Non-goals (out)
- Sign-in methods other than Google.
- Syncing a half-finished board (crosses, figures, sketch letters, struck clues), the undo
  history, the board frame or light/dark (Guus, walkthrough: "Alleen afgerond mee").
- Live sync while two devices are open at the same time (a change shows on the other device
  when it syncs: on load, on becoming visible, or after its own change).
- Leaderboards, sharing, profiles, avatars, anything social.
- Server-side puzzle logic. The database never generates or checks a puzzle.
- Analytics, e-mail to players.
- Changing clearhead or crossroads from this repo (Prerequisite 1 is their own task).
- Moving Reconstructie to its own Supabase project (a later decision, if the free-plan limit
  or the shared auth settings get in the way).

## Acceptance criteria
1. Given the site is opened without signing in, when a puzzle is played and solved, then no
   request goes to Supabase and progress is saved locally as today.
2. Given `src/sync/config.js` is empty or sign-in is switched off, when any page is shown,
   then the menu has no "Inloggen" and `#/account` behaves like an unknown route.
3. Given the player is signed out, when she presses "Inloggen met Google" and completes
   Google's sign-in, then she lands back on `#/account`, signed in, with her e-mail shown.
4. Given she is signed in on device A and solves puzzle P, when she opens the site on device
   B signed in to the same account, then P shows as solved on B.
5. Given device B had local progress before its first sign-in, when she signs in, then every
   puzzle solved on B or in the account is solved on B and in the account afterwards.
6. Given a puzzle is solved on one side and only revealed on the other, when they sync, then
   both show it as solved.
7. Given path stop k has 2 stars on one side and 3 on the other, when they sync, then both
   show 3 stars.
8. Given she left puzzle Q half-finished on device A, when she opens Q on device B, then B
   shows B's own board for Q (or an empty one), and nothing of A's board was sent.
9. Given she changes the level, auto-crosses or a panel on device A, when B syncs, then B
    has the same value; given she turns the board frame or the theme on A, then B is
    unchanged.
10. Given she is signed in and Supabase is unreachable (offline, paused project, error), then
    playing is unchanged, progress is saved locally, the account page says "Nog niet
    bijgewerkt — we proberen het later opnieuw.", and the next successful sync pushes it.
11. Given she confirms "Account verwijderen", then every row of hers in schema `reconstructie`
    is gone, she is signed out, and local progress on this device is unchanged.
12. Given that login has no rows in any other schema or table of the project, when she
    confirms deletion, then the auth user is deleted too; given it has, then the auth user
    stays and only the Reconstructie rows are gone.
13. Given she presses "Account verwijderen" and cancels, then nothing is deleted.
14. Given user A is signed in, when a request with A's token reads, inserts, updates or
    deletes a row of user B in schema `reconstructie`, then it is refused or affects no rows.
15. Given a request with only the anon key, when it touches any table or function in schema
    `reconstructie`, then it is refused.
16. Given a pushed value of the wrong shape or over the size limit (more than 2,000 puzzles
    per user, a preference outside its allowed values), then the database rejects it and local progress is
    unchanged.
17. Given a pulled value with unknown keys, wrong types or a newer format version, then the
    client ignores what it does not recognise and keeps local progress intact.
18. Given she presses "Uitloggen", then the session is removed from this device only, syncing
    stops, and local progress stays.
19. Given `privacy.html` or the privacy section on Uitleg is opened, then it states what is
    stored, why, where, how long, how to delete it, and that a child's account needs a
    parent's approval.

## Edge cases and error states
- **Private mode / storage blocked:** the session cannot be kept; the account page says
  "In deze browser kan inloggen niet bewaard worden." and the game plays as today.
- **Google sign-in cancelled, refused, or the parent did not approve:** back on `#/account`,
  signed out, with "Inloggen is niet gelukt." and the button again. No half state.
- **Family Link:** the first sign-in on a supervised account asks for a parent's approval
  (see below). A parent can later remove the site's access in Family Link; the next sync then
  fails as a signed-out session.
- **Free project paused after a week without any request:** sync fails like offline
  (criterion 10) until it is resumed. Unlikely, because clearhead and crossroads use the
  same project.
- **Clock skew between devices:** "newest wins" for preferences uses the device's clock. A
  device whose clock runs far ahead could win wrongly; the server refuses times more than
  one day in the future and uses its own time then. Solved, revealed and stars never depend
  on time.
- **Local list trimmed:** `vierdespoor.v1` keeps at most 120 puzzles. The account keeps more
  (up to 2,000); a pull adds solved/revealed flags for puzzles not in the local list as
  minimal entries. The local trim stays as it is.
- **Puzzle ids from older engine versions:** opaque strings to sync.
- **Session expired or refresh token revoked:** treated as signed out on that device, with
  "Log opnieuw in om bij te werken." on the account page.
- **Account deleted on A while B is still signed in:** B's next sync fails with an auth error
  and B signs out, local progress kept.
- **A stranger signs in:** gets their own empty Reconstructie rows and nothing else, provided
  Prerequisite 1 has landed.

## Family Link (steps for Guus, in the spec so the build can copy them to Uitleg)
1. On the daughter's device, she opens `#/account` and presses "Inloggen met Google", then
   chooses her own account.
2. Google shows that a parent's approval is needed; Guus (or another parent in the family
   group) picks his account and enters his own Google password on that screen.
3. Google lists what the site gets (her name, e-mail address); Guus presses "Doorgaan"
   (Continue). She is signed in; this is needed once per account, not per device.
4. Later, access can be reviewed or removed in the Family Link app: Controls → Account
   settings → Controls for third-party apps → Manage third-party app access (path per
   Google's help page, 2026-11-18; the build checks it again).

## Data and privacy
- **Kept by Supabase Auth** (shared project): the Google e-mail address, Google's subject id,
  the internal user id, sign-in times. Only the `openid email` scopes are requested; name and
  photo are not used or shown.
- **Kept by us, schema `reconstructie`:**
  - `puzzels`: `user_id`, `puzzel_id` (text, ≤ 200 characters), `opgelost`, `onthuld`
    (bool), `bijgewerkt` (server time); at most 2,000 rows per user;
  - `pad`: `user_id`, `stap` (int), `sterren` (0–3), `opgelost`, `bijgewerkt`;
  - `voorkeuren`: `user_id`, `niveau`, `kruisjes`, `panelen` (jsonb, known keys only), with a
    time per value, `bijgewerkt`.
  Every table references `auth.users` with `on delete cascade`.
- **Not stored:** boards (crosses, figures, sketch letters, struck clues), undo history,
  timings, device information; we keep no IP addresses
  (Supabase keeps standard API logs for a limited time on its side).
- **Purpose:** showing the player's game on all her devices. Nothing else.
- **Where:** Supabase, eu-west-3 (Paris), processor under its DPA. Google handles the
  sign-in.
- **Retention:** until the player deletes the account; no automatic deletion of unused
  accounts (assumption, no objection in round 2).
- **Children:** the primary player is a child with a Family Link account; Google's parental
  approval is the parent's consent to the sign-in. The privacy text is written so a child
  understands it (short sentences, no legal terms without an explanation).
- **Separation from the other apps:** Reconstructie's tables live only in schema
  `reconstructie`; its policies use `auth.uid()` only. RLS separates users, not apps: the
  same person's login could technically read their own Reconstructie rows from another app of
  the project (accepted, as crossroads did; it is that person's own game state).
- **Tokens:** a browser has no keychain. supabase-js keeps the session (a one-hour access
  token and a rotating refresh token) in `localStorage`. That is the standard for a static
  site and is accepted, with these mitigations: no third-party script at runtime, a
  Content-Security-Policy `<meta>` that limits scripts to the site and connections to the
  site and `claudeDB`, refresh-token rotation with reuse detection, and the token gives access
  only to the player's own rows. The baseline's secure-storage rule is written for mobile;
  this web equivalent gets an ADR in the build.
- **Logs:** the client logs no tokens, e-mail addresses or boards; sync errors log only the
  kind of error.
- **Pull request text** names the data and purpose above (security baseline).

## Costs and load
- CI minutes: Linux, a few seconds for the new fast check (`check:sync`: merge rules and
  shapes, no network). macOS: none.
- API calls and paid services: Supabase, existing free project `claudeDB` (shared with
  clearhead and crossroads: shared limits of 500 MB database and 50,000 monthly active
  users; Reconstructie adds at most a few MB). Google OAuth client: free. No usage-billed
  service. Moving to Supabase Pro (about $25 a month) or to an own project would be an ask
  for Guus.
- Hosting plan: unchanged (GitHub Pages).
- Mac load: none beyond the fast check.

## Design direction (UI features)
`docs/DESIGN.md` applies: the existing cheerful, drawn look. The account page is a plain
content page like Uitleg, with the existing buttons. The Google button follows Google's
branding rules (their "G" mark, "Inloggen met Google"), the one outside mark on the site.

## Flow and sketch (UI features)
- Flows and screens: `docs/UX.md`, sections marked "(accounts and sync)": sign in (with
  Family Link approval), go on on another device, delete the account, offline; screens
  menu, account signed out / signed in, confirm delete, account deleted, privacy.
- Sketch: `design/prototype/accounts-and-sync/index.html`.
- Walkthrough: 2026-11-18, by Guus in the browser pane (relayed verbatim by the main
  session): "Rondje met letter", "Uitleg + privacy.html", half boards "Alleen afgerond mee"
  (the "newer board" bar removed), verdict "Goedgekeurd, zo bouwen".

## Performance budget (when it matters)
- Signed out: no extra network request and no measurable change in first render;
  supabase-js (about 50 kB gzipped) loads only with a session or on `#/account`.
- A sync round under 1 s on a normal connection, never blocking input.

## Test plan
- Unit, valid input: merge rules (union of solved/revealed, max stars, newest preference,
  no board ever in what is pushed), conversion between the local keys and the sync rows,
  in `tools/check-sync.mjs` (`npm run check:sync`, part of `check:snel`).
- Refusal or failure: malformed or oversized pulled values (criterion 17); push rejected
  (criterion 16); network error and paused project (criterion 10); cancelled or unapproved
  sign-in; delete cancelled (criterion 13); session expired.
- Integration and contract: migrations in `supabase/migrations/` applied to `claudeDB`;
  Supabase's security advisors show no new warning; a script signs in as two test users
  and checks merge functions and shape checks end to end.
- Security: RLS negative tests (criteria 14, 15) as SQL under two users' JWT claims and the
  anon role, in `supabase/tests/`; `verwijder_mijn_account()` touches only the caller and
  keeps a login that has data elsewhere (criterion 12, with a test user that has a row in a
  scratch table); the keuring greps that `service_role` appears nowhere in the repo; CSP
  blocks a script from another origin; no token or e-mail in console output.
- Regression: n/a — new feature; the full keuring stays green and signed-out play makes no
  Supabase request (criterion 1), checked in the browser pane's network list.
- Sanity and smoke: after deploy, with sign-in switched on: sign in with a test Google
  account, solve a library puzzle, open a second browser profile, see it solved;
  delete the account; confirm in the dashboard that the rows are gone.
- Component / E2E and manual check: the account page in all states, light and dark, phone and
  desktop, screenshots in the PR; the real Google and Family Link sign-in by Guus once
  (Claude does not enter Google credentials).

## Open questions
- None blocking the spec. Prerequisite 1 is its own task in personal-assistant.

## Plan (added before building)
Order matters: steps 1–6 can be built and merged with sign-in switched off (criterion 2), so
nothing reaches players before Prerequisite 1. Each step is one pull request or one commit
in the build branch; all code identifiers and UI text in Dutch, as the rest of `src/`.

1. **Product docs and ADR** — `docs/PRODUCT.md` (the approved text above),
   `docs/decisions/0006-optional-accounts-with-supabase.md` (shared project `claudeDB`,
   schema `reconstructie`, PKCE redirect flow, session in `localStorage` with CSP and
   self-hosted library as the web stand-in for secure storage, no `service_role`; follow
   the shape of `0005-…`), `docs/ARCHITECTURE.md` (the sync module and the one server).
   Tests first: none (docs). ~1 h.
2. **Merge rules and conversion, no network** — `src/sync/samenvoegen.js`: pure functions
   that turn `vierdespoor.v1` + `vierdespoor.pad` + `vierdespoor.voorkeuren` into rows
   (solved/revealed per puzzle, stars per stop, three preferences with a time each) and
   merge pulled rows back in (union, max, newest preference), refusing unknown keys and
   wrong types. Tests first: `tools/check-sync.mjs` with criteria 5–9 and 17 as cases,
   wired into `tools/keuring.mjs` as a fast check (pattern: the `check-ai-guard.mjs`
   entry) and `npm run check:sync`; it also greps the repo for `service_role`. ~2 h.
3. **Database** — `supabase/migrations/<ts>_reconstructie.sql`: schema, the three tables
   with check constraints (id length, 0–3 stars, known preference keys, 2,000-row cap via
   trigger), `on delete cascade` to `auth.users`, RLS with one policy per operation, grants
   to `authenticated` only, merge functions `bewaar_puzzels(jsonb)`, `bewaar_pad(jsonb)`,
   `bewaar_voorkeuren(jsonb)` (`security invoker`, refuse times more than a day ahead), and
   `verwijder_mijn_account()` (`security definer`, `set search_path = ''`, deletes the
   caller's rows, then the auth user only when no row references it in any other table:
   it checks every foreign key to `auth.users` through `pg_constraint`, so a new table in
   clearhead or crossroads is covered without editing this function). Pattern:
   `~/Claude/Projects/crossroads` migrations and its `supabase/README.md` (shared-project
   notes). Tests first: `supabase/tests/reconstructie_rls.sql` for criteria 11, 12, 14, 15,
   16 under two users' JWT claims and the anon role. Applying to `claudeDB` (via the
   Supabase connector, `apply_migration`) and exposing the schema are additive changes to
   a shared project: the build asks Guus once before applying, then runs the tests and the
   security advisors. ~2 h.
4. **Client and session** — vendor `@supabase/supabase-js` (exact version, ESM build,
   licence file) in `src/vendor/`; `src/sync/config.js` (URL, publishable key, `aan` flag:
   false in production); `src/sync/sessie.js` (lazy import, PKCE, sign in with redirect to
   the current origin, exchange `?code=` then strip it from the URL with
   `history.replaceState` before the hash router runs, local sign-out); CSP `<meta>` in
   `index.html` (`script-src 'self'`, `connect-src 'self'` plus the project URL and what
   the AI layer already needs; check the AI flag still works). Tests first: criterion 1
   and 2 in the browser pane's network list with the flag off and on. ~2 h.
5. **Sync runs** — `src/sync/sync.js`: pull, merge, push at the moments in Scope; hooks in
   `src/ui/state.js` (`saveProgress` on solve/reveal, `zetNiveau`, `zetKruisjesVanzelf`,
   `zetPaneel`) and the level path's save, through one `meldWijziging()` call so the game
   code does not know about Supabase; never blocks; errors set a status, never throw into
   the game. Tests first: extend `check-sync.mjs` with a fake backend for criteria 4–10 and
   17. ~2 h.
6. **Account page and menu** — `src/ui/account.js` (route `#/account`, screens from
   `docs/UX.md`), menu entry and badge in `index.html` / `src/main.js`, confirm dialog as
   the existing Oplossing confirm, privacy section in `src/ui/uitleg.js`, `privacy.html`
   (same text, standalone, no script). Screenshots light and dark, 375 px and desktop,
   compared with the sketch. Tests first: criteria 13, 18, 19 by hand in the browser pane.
   ~2 h.
7. **Go live (after Prerequisite 1)** — Guus creates the Google OAuth client and enters it
   in Supabase (steps in a short `docs/` how-to written in step 6), adds the redirect URLs;
   the build flips `aan` to true, deploys, and runs the smoke test from the Test plan with a
   test account; Guus does the Family Link sign-in once with his daughter. STATUS.md and
   CHANGELOG.md updated. ~1 h plus Guus's time.

Risks:
- **Shared project.** A migration or setting for Reconstructie can affect clearhead and
  crossroads; mitigated by its own schema, additive settings only, and the ask before
  applying. A later move to its own project stays possible (rows keyed by user id).
- **Deleting the auth user** cascades into clearhead's tables if the same person uses both;
  the foreign-key check in `verwijder_mijn_account()` is the guard, and its test is
  mandatory before go-live.
- **Prerequisite 1 slips:** sign-in stays off in production; nothing else is blocked.
- **CSP breaks something** (the AI layer, the Web Worker, self-hosted fonts): checked in
  step 4 with the full site walked once; the CSP can start in report-only mode if needed.
- **Family Link flow differs from Google's documentation:** found at go-live; the privacy
  and Uitleg text get corrected then.
- **Free-plan pause:** unlikely with three apps on the project; sync degrades to offline.
