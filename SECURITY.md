# Security — Het Vierde Spoor

## Data this project handles
- **No personal data at all.** No accounts, no analytics, no server-side storage, no
  cookies. The game runs entirely in the visitor's browser.
- `localStorage`, keys under `vierdespoor.*` — purpose: progress, chosen difficulty,
  light/dark preference — stored: on the visitor's own device — retention: until they
  clear it. Never read by anything but the page itself.
- The repository is **public** by the owner's explicit choice. Everything in it is served
  by GitHub Pages, including `tools/`, `worker/` and `docs/`. Nothing may be committed that
  is not meant to be public.

## Secrets
- Configuration comes from environment variables; `.env.example` documents them with
  placeholders only. `.env` is git-ignored and denied to Claude Code
  (`.claude/settings.json`). Verified: no key has ever appeared in a commit, and `.env`
  has never been committed.
- `ANTHROPIC_API_KEY` is the only secret. It is used by `tools/ai-vooraf.mjs` and
  `tools/ai-online.mjs` locally, and by the Cloudflare Worker in production. **The owner
  types it himself** (`wrangler secret put`); it is never read, echoed or pasted into a
  conversation.
- Deploy secrets: none for the site — GitHub Pages deploys from `main` with no credentials.
  The Worker's secret lives in Cloudflare's own secret store. (The Worker is written but
  not deployed; see `STATUS.md`.)

## The AI endpoint
The Worker (`worker/index.js`) exists so that story text can be rewritten without an API
key living in the browser. It is deliberately narrow:
- It accepts **a puzzle id and nothing else** (`^[a-z]+\.[a-z]+\.[a-z]+\.[1-5]\.[A-Za-z0-9_-]{1,40}$`,
  body at most 300 bytes). The prompt is built inside the Worker from a puzzle it computes
  itself with the same engine as the site. There is no path by which a caller's text
  reaches the model.
- Every rewritten clue must keep its proper names, negation, numbers and either/or, or the
  original sentence is used. `npm run check:ai` proves the guard; `tools/check-ai-guard.mjs`
  also states the guard's limit (a reversed time order would still get through, which is
  why the generator stays the source of the logic).
- Origin check, a per-IP hourly cap and a daily site total; above them it answers politely
  and the site falls back to its own text. Each id is computed once and cached.

## Dependencies
- One: `@anthropic-ai/sdk`, used only by `tools/` and `worker/` — never by code the browser
  loads. The browser runs zero dependencies (see `docs/decisions/0002-no-build-step.md`).
- Lockfile committed. `npm audit`: 0 vulnerabilities (2026-11-09).
- A new dependency is justified in the PR (why, maintenance, size).

## Known limits, accepted
- **The solution is in the page.** The Check button needs it, so it is in memory in the
  browser; anyone who opens the console can read it. Acceptable for a puzzle site played
  for fun, not acceptable if there is ever a contest.
- No Content-Security-Policy header: GitHub Pages does not let us set one.

## Reporting a problem
Open an issue labelled `security` on https://github.com/keebl/het-vierde-spoor, or e-mail
the owner. Don't post exploit details publicly before a fix is released.
