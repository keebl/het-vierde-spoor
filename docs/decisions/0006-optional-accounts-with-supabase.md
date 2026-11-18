# ADR-0006: Optional accounts with Supabase in the shared project

Date: 2026-11-18
Status: accepted (Guus, 2026-11-18, together with `specs/accounts-and-sync.md`: "Goedgekeurd,
zo bouwen"; where the data lives: "Schema in claudeDB")

## Context

Progress lives in `localStorage`, per browser. The primary player switches between a phone
and a laptop, and with the level path (`specs/level-path.md`) her stars and her place on the
path would differ per device. Guus asked for sign-in with Google (2026-11-18: "ik denk dat
we naar een authenticatie moeten met google").

Constraints that shape the answer:

- **No build step and no runtime dependencies** (ADR-0002). A push to `main` is a deploy to
  GitHub Pages; there is no server of our own.
- **One free Supabase project.** Guus's free plan allows one more active project, which is
  already `claudeDB` (ref `kteiwsvhynuktjarhksm`, eu-west-3, Paris). It also serves
  clearhead (`personal-assistant`, schema `public`) and crossroads (schema `crossroads`).
  Auth is per project, so users, redirect URLs and the sign-up switch are shared.
- **The security baseline** wants tokens in secure storage. That rule is written for mobile
  (Keychain, `expo-secure-store`); a static website has no keychain.
- **Playing must never wait for the account** (`docs/UX.md`, principles).

## Decision

### 1. Accounts are optional; local storage stays the source the game reads
The game keeps reading and writing `localStorage` exactly as before. A separate module,
`src/sync/`, pushes what changed and pulls what is newer when a session exists. If the
database is unreachable, paused or the session is gone, nothing in the game changes; only
syncing waits. Only finished facts sync (solved, revealed, path stars, three preferences);
half-finished boards stay on their device.

### 2. Supabase, inside `claudeDB`, in its own schema `reconstructie`
All tables, functions and grants live in schema `reconstructie`, as crossroads did. Every
table has `user_id` referencing `auth.users` with `on delete cascade`, Row Level Security
on, and one policy per operation limited to `auth.uid() = user_id`. The `anon` role gets
nothing. Writes go through `security invoker` functions that apply the merge rules in the
database, so two devices pushing at once cannot undo each other. Account deletion is one
`security definer` function that acts only on `auth.uid()` and deletes the auth user only
when no other table in the project references it (found through `pg_constraint`, so a new
table in clearhead or crossroads is covered without editing the function).

Migrations live in `supabase/migrations/`, file names start with `reconstructie_`, and are
applied with the Supabase connector after an explicit yes from Guus (the project is shared).

### 3. Google sign-in with the PKCE redirect flow
Supabase Auth with Google as the only provider, scopes `openid email`. PKCE brings the
result back as `?code=`, which never collides with the hash routes (`#/puzzel/…`); the code
is exchanged and stripped with `history.replaceState` before the router runs. The redirect
flow, not Google's FedCM button, because Family Link's parental approval does not work with
FedCM. Sign-out is local (this device only).

### 4. The client library is vendored, loaded only when needed
`@supabase/supabase-js` is copied as one ES-module file into `src/vendor/` with its exact
version and licence beside it. No CDN at runtime (the same reason the fonts are
self-hosted), no bundler. It is imported dynamically only when a session marker exists or
the account page opens, so a signed-out visitor downloads nothing extra and sends no request
to Supabase. This is the one runtime dependency; it is an amendment to ADR-0002, not a
reversal: there is still no build step, and what is deployed is what is in the repository.

### 5. The web stand-in for secure storage
supabase-js keeps its session (a one-hour access token and a rotating refresh token) in
`localStorage`. That is the standard for a static site and is accepted, with these
mitigations:
- no third-party script at runtime (the library is self-hosted);
- a Content-Security-Policy `<meta>` in `index.html` that limits scripts to the site and
  connections to the site and the `claudeDB` URL;
- refresh-token rotation with reuse detection (Supabase default);
- the token reaches only the player's own rows in schema `reconstructie` (RLS).

### 6. Configuration in a committed file, and one switch
`src/sync/config.js` holds the project URL and the publishable (anon) key, which are public
by design (RLS is the protection), and a flag `aan`. The `service_role` key is used nowhere
and the keuring greps for it. With the flag off, or an empty URL, the menu entry and
`#/account` do not exist and the site is exactly what it was. The flag stays off in
production until clearhead closes its tables to strangers (the spec's Prerequisite 1); on
`localhost` it can be switched on for development.

## Consequences

- Positive: the daughter's progress follows her across devices; no new paid service; the
  database is EU-hosted; signed-out play is unchanged byte for byte in what it requests.
- Positive: the merge rules (union, maximum, newest-per-value) are in the database and in a
  pure module checked by `check:sync`; neither side can lose progress.
- Negative: **a shared project.** A migration or Auth setting for Reconstructie can affect
  clearhead and crossroads. Mitigated by the own schema, additive settings only, and the ask
  before applying. Rows are keyed by user id, so moving to an own project later is a dump
  and restore.
- Negative: **a login from Reconstructie is also a login for the other apps' policies.**
  Sign-in stays off in production until clearhead requires membership (Prerequisite 1).
- Negative: a first runtime dependency in the browser (about 50 kB gzipped), loaded only
  with a session. Updating it is a manual copy with a version bump.
- Negative: tokens in `localStorage` can be read by any script running on the origin. The
  CSP and the absence of third-party scripts are what keep that set empty.

## Alternatives considered

- **A new Supabase project of its own** — cleanest separation, but the free plan allows no
  more projects (Guus: "ik mag maar 1 project"). Stays possible later.
- **Turso, Firebase or a Cloudflare D1 worker** — would need our own auth or a deployed
  worker; more moving parts than a schema in a project that already exists.
- **Loading supabase-js from a CDN** — a third-party script with the session in reach;
  rejected for the same reason as Google Fonts.
- **Syncing half-finished boards with "newest board wins"** — considered in the
  walkthrough and dropped ("Alleen afgerond mee"): it can overwrite a board someone is
  still playing and adds a conflict screen for little gain.
