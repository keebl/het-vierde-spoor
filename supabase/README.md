# Supabase — Reconstructie (ADR-0006, `specs/accounts-and-sync.md`)

Reconstructie shares the Supabase project **`claudeDB`** (ref `kteiwsvhynuktjarhksm`, region
`eu-west-3` Paris, Free plan) with clearhead (`personal-assistant`, schema `public`) and
crossroads (schema `crossroads`). All Reconstructie tables and functions live in the schema
**`reconstructie`**. Auth (users, sign-up switch, providers, e-mail templates, Site URL,
Redirect URLs, rate limits) is per project and therefore shared: Reconstructie only ever
*adds* to those settings.

Migrations live in `migrations/` (file names contain `reconstructie_` so the shared migration
history stays readable) and are applied in file order with the Supabase connector
(`apply_migration`), after an explicit yes from Guus. Never touch `public` or `crossroads`
from this repo.

## What the schema holds
- `puzzels` — per user and puzzle id: `opgelost`, `onthuld` (at most 2,000 per user).
- `pad` — per user and level-path stop: `sterren` (0–3), `opgelost`.
- `voorkeuren` — per user: `niveau`, `kruisjes`, `panelen`, each with the time it was chosen.
- Functions: `bewaar_puzzels`, `bewaar_pad`, `bewaar_voorkeuren` (security invoker, apply
  the merge rules), `verwijder_mijn_account()` (security definer, acts only on `auth.uid()`;
  deletes the login only when no table outside `auth` and `reconstructie` references it).

## Dashboard settings (the connector cannot set these)
- Integrations → Data API → **Exposed schemas**: add `reconstructie` (keep `public` and
  `crossroads`).
- Authentication → URL Configuration → **Redirect URLs**: add exactly
  `https://reconstructie.app/` and `http://localhost:4173/`. No wildcards. The site always
  asks to come back to `location.origin + '/'`; a URL missing from this list makes Supabase
  fall back to the Site URL, which is clearhead's (`personalassistant://`).
- Authentication → Sign In / Providers → **Google**: enabled with the client id and secret
  of Guus's Google OAuth client (spec, Prerequisite 2). Entered by Guus in the dashboard;
  never in this repo or in chat.
- Leave alone (the other apps need them): **Allow new users to sign up** stays on;
  **Site URL**; e-mail templates and OTP settings.

## Before sign-in goes live (`aan` in `src/sync/config.js`)
clearhead's policies accept any login today (`user_id = auth.uid()` only). A stranger who
signs in through Reconstructie would hold such a login. Sign-in stays off in production until
clearhead requires a members row (spec, Prerequisite 1, a task in `personal-assistant`) and
that has been checked with a stranger's login.

## Checks after a migration
- `tests/reconstructie_rls.sql` through `execute_sql`. It always ends with an exception that
  carries the verdict and rolls back everything it made; green is
  `reconstructie_rls: N/N goed` with no `FOUT` line.
- Security advisors (`get_advisors`, type security) report nothing new for `reconstructie`.
  Expected and accepted: `verwijder_mijn_account` is a security definer function callable by
  `authenticated` (it is the in-app account deletion).
