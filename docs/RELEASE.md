# Release — Reconstructie

Generic preconditions and the version/changelog/tag steps are handled by `/release`
(workbench skill). This file holds what is specific to this project and stack.

Drafted 2026-11-14 during the workbench repair round from `CLAUDE.md`, `STATUS.md`,
`docs/PRODUCT.md` and `worker/wrangler.toml`. Lines marked `(assumption)` are inferred and
not yet confirmed by the owner.

## Where the version lives
- `package.json` → `version` (0.1.0). The site shows no version; tags are the record.

## Channels
| Channel | Command / action | Who sees it |
|---|---|---|
| preview | `npm start` → http://localhost:4173 (no hosted preview) | the owner, on his own machine |
| production | merge to `main` → GitHub Pages publishes as-is, no build step | everyone at https://reconstructie.app/ |

## Steps after the tag
1. No build: `main` is the release.
2. Before the merge: `npm run check:all` green — read the `volledige keuring exit=0` line —
   and the CI workflow green on the pull request. CI on a pull request runs the spread, the
   reasoning and the store check on a smaller level 5-6 sample (`--kort`); `check:all` and the
   nightly run (`.github/workflows/nachtrun.yml`) run them in full.
3. Merge the pull request; GitHub Pages publishes within a few minutes
   (`cache-control: max-age=600`, so allow ten minutes before judging).
4. Verify: open https://reconstructie.app/, `location.reload()`, play one puzzle from
   `#/puzzels` and one new random puzzle; update `STATUS.md` Health.

## Testers and feedback
- Testers: the owner's daughter, the primary user (`docs/PRODUCT.md`). (assumption: no
  other testers)
- Feedback channel: in person; the owner writes her verdict into `STATUS.md`. (assumption)

## Store listing
- n/a — web only, no store.

## Rollback / hotfix
- `git revert <commit>` on a branch, pull request, merge: Pages republishes the previous
  state within minutes. There is no build artefact to roll back to and no data migration.
- A broken puzzle link cannot be "rolled back" for someone who already opened it, but
  everything follows from the seed, so reverting the engine restores the same puzzle.

## Operations
Required before the first production release (`/release` checks it; handbook 55). One line
per item: which service, which plan, where the dashboard is. No keys or account e-mails.
"n/a — <reason>" is an answer.

- Backups: n/a — no server-side data; the code lives on GitHub and in the local clone, and
  player progress is in each visitor's own `localStorage`.
- Restore test: n/a — nothing to restore beyond `git clone`.
- Hosting (no pausing): GitHub Pages, free plan, repository `keebl/het-vierde-spoor`
  (Settings → Pages); static hosting does not pause.
- E-mail (SMTP with SPF/DKIM/DMARC): n/a — the site sends no e-mail.
- Domain (auto-renew, expiry in the maintenance calendar): Cloudflare Registrar,
  `reconstructie.app`, registered 2026-11-13; auto-renew on (assumption: Cloudflare's
  default); expiry date not yet in the maintenance calendar.
- Error monitoring: none — `docs/PRODUCT.md` rules out tracking; see `## Deferred` in
  `STATUS.md`.
- Uptime monitoring: none yet — see `## Deferred` in `STATUS.md`.
- Analytics: none, on purpose — "no monetisation, no ads, no tracking" (`docs/PRODUCT.md`);
  the success criterion is the daughter asking for more, not a number.
- Support: GitHub Issues on `keebl/het-vierde-spoor` (assumption: the site links to no
  support address yet).
- Legal pages: privacy statement drafted in `store/privacy-policy.md` (NL and EN), not yet
  on the site; no terms needed (nothing is sold).
- Spend caps: GitHub Pages and the Cloudflare free plan cost nothing; the Anthropic API key
  is used only by the owner's tools (`npm run ai:vooraf`, `npm start` with the key) and by
  the undeployed worker. All of them stop at `AI_DAILY_CALL_LIMIT` paid calls a day (`.env`
  for the tools, `worker/wrangler.toml` for the worker, next to its hourly `UURLIMIET`). (assumption: no
  spend limit set in the Anthropic console)
- Dependency alerts: Dependabot alerts on since 2026-11-14; `.github/dependabot.yml`
  weekly for npm and github-actions.
- CI: `.github/workflows/ci.yml` — fast keuring on every pull request and push, the heavy
  checks (three of them on a smaller sample, `--kort`) and gitleaks on pull requests;
  `.github/workflows/nachtrun.yml` builds everything in full once a night.

## Launch
- First ten users: the owner's daughter first; anyone after her finds the public link
  (`docs/PRODUCT.md` Users). (assumption: no wider launch planned yet)
- Listing / announcement: none yet.
- Feedback loop for the first month: write down her verdict after each new round of
  changes (`STATUS.md` Next, item 1).

## Accounts and credentials
- GitHub account `keebl` owns the repository and Pages; Cloudflare owns the domain and DNS
  (API token in `.env`, never committed). No signing, no store entries.
