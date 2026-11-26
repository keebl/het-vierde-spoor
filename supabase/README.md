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
- `toegang` — the paywall entitlement (`specs/paywall-and-android.md`, plan step 2): one row
  per store purchase (`bron`, `referentie` as key, `toegekend`, `ingetrokken`). A user reads
  their own rows; only the store webhooks write, as `service_role`. Account deletion removes
  the rows; the store keeps the order, so a mistaken deletion is restored by hand
  (`bron = 'handmatig'`).
- Functions: `bewaar_puzzels`, `bewaar_pad`, `bewaar_voorkeuren` (security invoker, apply
  the merge rules), `verwijder_mijn_account()` (security definer, acts only on `auth.uid()`;
  deletes the login only when no table outside `auth` and `reconstructie` references it).

## Applied
- 2026-11-18: `20261118200000_reconstructie_sync.sql` applied to `claudeDB` (Guus: "Ja,
  toepassen"); `tests/reconstructie_rls.sql` 30/30; security advisors: nothing for
  `reconstructie` (one existing Auth warning, leaked-password protection, belongs to the
  shared project).
- Not applied yet: `20261125120000_reconstructie_toegang.sql` (entitlement table, and
  `verwijder_mijn_account()` also deletes `toegang`). Waits on Guus's yes. Checked on
  2026-11-25 in PGlite (Postgres in WASM, `auth` stubbed): `tests/reconstructie_rls.sql`
  36/36, and 35/36 with a deliberate insert policy on `toegang`. Run the test file on
  `claudeDB` after applying it; before that it fails, since it needs the table.

## Found while testing: clearhead seeds every new login
A trigger in clearhead fills `public.areas` for every new row in `auth.users`. So every
login, including one made by signing in to Reconstructie, has rows in clearhead from the
start, and `verwijder_mijn_account()` therefore keeps the login and deletes only the
Reconstructie rows (safe, but the "delete the login too" branch never fires in this
project). The RLS test removes test user A's seeded rows to exercise that branch. It also
means a stranger signing in through Reconstructie gets clearhead rows: one more reason for
Prerequisite 1, which should also stop seeding for non-members.

Resolved 2026-11-18 (keebl/personal-assistant#13): sign-up no longer seeds `areas`. Checked
with a rolled-back test login: no clearhead rows, and account deletion removes the login.

## Backup and ping (`.github/workflows/claudedb.yml`, paywall plan step 5)
A free project pauses after seven days without traffic and keeps no backups (D4 = A). Every
night at 03:41 UTC the workflow connects as `reconstructie_backup`, runs one query (the
ping) and dumps schema `reconstructie`, encrypted with the public age key in
`backup-ontvanger.txt`, kept 30 days as a workflow artifact. The repository and its
artifacts are public, so the dump is never stored unencrypted. Until the secret and the key
exist, the job skips with a warning.

The role (`migrations/20261125130000_reconstructie_backup_rol.sql`) reads every row of the
four tables through a select policy of its own and can write nothing. **A new table needs a
`grant select` and a `_backup` policy for it in its own migration**, or the backup misses it.

Setting it up (Guus, once; the values never go into chat or this repository): follow
`docs/backup-setup.md` step by step. The pooler host is copied from the Connect dialog, not
derived from the region (Supabase: the `aws-<n>` index is a cluster number).

Restoring: download the artifact, `age -d -i <key file> reconstructie.sql.age > reconstructie.sql`,
check it, then load it into a scratch schema or a new project with `psql -f`. Rows reference
`auth.users`, so a new project needs its users first; purchases can also be rebuilt from the
stores (Stripe, later Play), which keep every order.

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
