# Accounts: going live

How to switch on Google sign-in (`specs/accounts-and-sync.md`, plan step 7). Until every box
below is ticked, `AAN` in `src/sync/config.js` stays `false` and the site shows no sign-in.

## 0. Before anything (blocking)
- [ ] **clearhead requires membership** (spec, Prerequisite 1): a task and pull request in
  `~/Claude/Projects/personal-assistant` adds a members table, required by every clearhead
  policy and checked in its `brain-dump` function. Merged, and checked with a stranger's
  login: that login reads and writes nothing in `public`.
- [ ] **A stranger's login gets no clearhead rows.** Today a clearhead trigger fills
  `public.areas` for every new login (found 2026-11-18, see `supabase/README.md`). Then
  "Account verwijderen" keeps the login and its e-mail address, and the privacy text ("dan
  wordt alles gewist") would not be true. Prerequisite 1 must also stop that seeding for
  non-members; check it by signing in with a test account, deleting it, and confirming in
  Authentication → Users that the login is gone.
- [ ] **The migration is applied** to `claudeDB` and `supabase/tests/reconstructie_rls.sql`
  reports `N/N goed` (see `supabase/README.md`).

- [ ] **privacy@reconstructie.app receives mail.** The privacy text names it. Cloudflare →
  `reconstructie.app` → Email → Email Routing: enable, add a custom address `privacy` that
  forwards to Guus's own mailbox (Guus enters the destination; it never goes in this repo).
  Then send a test mail.

## 1. Google OAuth client (Guus, free, about 15 minutes)
1. Open https://console.cloud.google.com/ and create a project named `Reconstructie`.
2. APIs & Services → OAuth consent screen (Google Auth Platform → Branding):
   - App name `Reconstructie`, user support e-mail `privacy@reconstructie.app` (or your own
     address), developer contact your own address.
   - App home page `https://reconstructie.app/`.
   - Privacy policy `https://reconstructie.app/privacy.html`.
   - Authorized domain `reconstructie.app`. Add `supabase.co` too if Google asks for the
     domain of the redirect URI.
   - Audience: External. Data access (scopes): only `openid` and `.../auth/userinfo.email`.
   - Publish the app (from "Testing" to "In production"); with only these scopes Google does
     not require a review.
3. Clients → Create client → type **Web application**, name `Reconstructie (Supabase)`.
   - Authorized JavaScript origins: `https://reconstructie.app` and `http://localhost:4173`.
   - Authorized redirect URI: `https://kteiwsvhynuktjarhksm.supabase.co/auth/v1/callback`.
4. Keep the client id and secret on screen for step 2. Do not paste them anywhere else.

## 2. Supabase dashboard (Guus, about 5 minutes)
Project `claudeDB` at https://supabase.com/dashboard/project/kteiwsvhynuktjarhksm
1. Authentication → Sign In / Providers → **Google**: enable, paste the client id and secret
   from step 1, save. Leave "Skip nonce check" off.
2. Authentication → URL Configuration → **Redirect URLs**: add exactly
   `https://reconstructie.app/` and `http://localhost:4173/`. Change nothing else on that page
   (the Site URL belongs to clearhead).
3. Integrations → Data API → **Exposed schemas**: add `reconstructie` (keep the others).

## 3. Switch on and smoke test (Claude)
1. Locally first: `npm start`, then in the browser console
   `localStorage.setItem('vierdespoor.account-proef', '1')`, reload, open `#/account`, sign in
   with a test Google account (Guus types the credentials; Claude never does).
2. Set `AAN = true` in `src/sync/config.js`, pull request, merge (pushing is deploying).
3. On https://reconstructie.app/: sign in with the test account, solve a library puzzle, open
   a second browser profile, sign in, see it solved. Delete the account; check in the
   dashboard (Table editor → schema `reconstructie`) that its rows are gone.
4. Security advisors show nothing new for `reconstructie`.

## 4. Family Link (Guus with his daughter, once)
1. On her device she opens https://reconstructie.app/#/account, presses
   "Inloggen met Google" and chooses her own account.
2. Google says a parent's approval is needed. Guus (or another parent in the family group)
   picks his own account and types his own password on that screen.
3. Google lists what the site gets (her e-mail address); press "Doorgaan". Needed once per
   account, not per device.
4. Later, access can be reviewed or removed in the Family Link app: Controls → Account
   settings → Controls for third-party apps → Manage third-party app access (path per
   Google's help page on 2026-11-18; check it again at go-live and correct the privacy text
   if it differs).

## Rolling back
Set `AAN = false` and push: the menu entry and `#/account` disappear, local play is untouched,
and the stored rows stay until deleted. Removing the schema altogether is
`drop schema reconstructie cascade;` — ask first, it deletes every player's synced progress.
