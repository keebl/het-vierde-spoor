# ADR-0002: No build step, no runtime dependencies

Date: 2026-11-08
Status: accepted (reconstructed — written during `/adopt` from the code and README; the
decision itself predates this file)

## Context
The site is a browser game that generates and verifies puzzles on the visitor's device.
It is hosted on GitHub Pages from `main`. A bundler would add a build, a lockfile for the
browser, a source-map story and a class of "works locally, breaks deployed" failures, in
exchange for conveniences this project does not need: there is no framework, no JSX, no
TypeScript, and the whole app is a few dozen ES modules.

## Decision
The browser gets plain ES modules, served as they are in the repository. `index.html`
loads `src/main.js`; everything else is `import`. There is no bundler, no transpiler and
no runtime dependency. The single `package.json` dependency (`@anthropic-ai/sdk`) is used
only by `tools/` and `worker/`, never by code the browser loads.

## Consequences
- Positive: a push to `main` is a deploy, and what is deployed is what is in the repository
  — no build output to reason about.
- Positive: no dependency surface in the thing visitors run.
- Negative: no tree shaking, no minification, more requests. At this size it does not
  matter; the heaviest files are drawing tables that compress well.
- Negative: **pushing is deploying.** There is no staging step between a commit and the
  public site. `CLAUDE.md` records this as a gotcha.

## Alternatives considered
- Vite — the obvious default. Rejected: it would exist only to hide an `import` map.
- A `gh-pages` build branch — adds a step that can be out of date with `main`.
