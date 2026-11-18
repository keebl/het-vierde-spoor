# Status — Reconstructie

Last updated: 2026-11-18
Live: yes (since 2026-11-13)
UX approved: 2026-11-18

Translated and restructured from `HANDOFF.md`, which lived at the repository root until the
project standard was adopted; the original is in git history. The parts of it that are
standing guidance rather than state moved to `CLAUDE.md`.

## Now
- 2026-11-18: engine-extension **phase A built** on branch `claude/awesome-lovelace-8e3f0b`
  (pull request open, not merged, not live): human solver `src/engine/redeneer.js`, Dutch
  steps `src/content/redeneer-text.js`, the numbered solution under the board and on its
  own printed page, baseline in the spec. No board changed (91 fingerprints in
  `tools/vingerafdruk-kamers.txt`). Full keuring green, 10/10. Still open: a print PDF
  with `tools/printproef.mjs` (owner's terminal); remote branch
  `pr-assets/solution-steps` (PR screenshots) may be deleted after merge. Next: phase B.
- 2026-11-17, evening: #18 merged (`688399b`), docs only — `specs/props-and-either-clues.md`
  approved (props to sit, lie, stand or ride on; "of" clues), built inside engine-extension
  phase B. Next session: start engine-extension phase A, step 1.
- Open sessions (2026-11-17, later): none; no open pull requests. Merged and live today:
  #15 harder clues (`c313d07`; no row/column clues, room clues, caps per name 3/3/3/4/5,
  none on level 6; checked live on `dader.landhuis.kamer.2.demo-7`; every board shifted)
  and #16 the engine-extension ADR and spec (`fd99908`, not built). CI now runs the full
  keuring as six parallel jobs; the verdict job keeps the name "keuring (all 8 checks)"
  because a ruleset requires it. Both side sessions archived. Then #17 (`32ada0d`): phone
  layout on one grid and self-hosted Baloo 2 + Nunito (no Google Fonts request any more),
  checked live at 375 px; its session archived. Leftover: remote branch
  `pr-assets/phone-layout` (PR screenshots) may be deleted. Ask the daughter to replay a
  fresh case.
  Merged and live 2026-11-16/17: #13 steady desktop layout (`935246e`), #14 undo button
  and sketch letters that hide (`584ad4f`), #12 the harder-clues spec (`a1f26c1`).
  Project folder renamed to `~/Claude/Projects/reconstructie`.
- Earlier (2026-11-16, later): "Build specs/clues-on-phone.md" (`local_0ebd3844…`),
  branch `claude/clues-on-phone-b8abcd`, PR #10 open, CI pending — merge when green
  (reviewer findings handled). "Fix: victim gets no linked clue" (`local_9c52134a…`), branch
  `claude/victim-no-clue-010ea9`, no PR yet — Guus chose option A (no clue names the
  victim at all; every room puzzle link shifts); waits on its keuring, then push and PR.
  Rule from mission control: one full keuring at a time across sessions.
  `.claude/settings.json` env deny rules narrowed (`7f84e7d`); `.env.example` readable.
- Earlier the same day: none working. All three sessions finished and their pull
  requests are merged (squash, CI green on all four checks): #9 the ending sheet, the
  next-case order across levels and a permanent "Volgende puzzel" button (`9c2ed7f`,
  tested in CI on top of #7); #7 the suspect palette with a "Neerzetten" mode and every
  suspect in view on a phone (`b3930d7`); #8 the approved spec `specs/clues-on-phone.md`
  (`0ef6da1`, not built). Print of the ending sheet checked 2026-11-16 with
  `tools/printweergave.js` in the browser pane: the sheet and the Ontknoping button stay off
  paper, story, question and board stay on. No PDF yet (pagination unchecked): Brave cannot
  start in the session sandbox.
  Earlier, 2026-11-14: The five finished sessions were archived with Guus's
  approval and their worktrees removed. Leftovers (the three `rng.js` Sonar findings
  were already marked false positive on 2026-11-12): check the hidden game types and the furniture per world. `.env.example`
  committed on 2026-11-15 after Guus confirmed it holds only placeholders. Dependabot pull requests
  #3, #4 and #5 (`actions/checkout` 7, `actions/setup-node` 7, `@anthropic-ai/sdk` 1.8.0)
  merged on Guus's request with CI green; `specs/paid-printing.md` committed as a draft.
- The site moved to its own domain on 2026-11-13: https://reconstructie.app/ (registered
  at Cloudflare Registrar, DNS at Cloudflare via `tools/cloudflare-dns.mjs`, still served
  by GitHub Pages). The old github.io address redirects there. The site is now called
  **Reconstructie**, like the game type: title, header, footer, share texts and favicon
  label. Internal names stay (`vierdespoor.*` storage keys, so nobody loses progress;
  `VIERDESPOOR_*` env vars; the repository and package name).
- Earlier: working tree clean on `main` at `c7136a5`.
- The project standard was merged on 2026-11-11 (pull request #1, merge commit `e58ee1d`):
  documentation only, no application code, dependencies or CI. `HANDOFF.md` and
  `ARCHITECTUUR.md` are gone from the root; this file and `docs/ARCHITECTURE.md` replace
  them, and standing guidance lives in `CLAUDE.md`.
- The keuring ran in full on `c7136a5` (2026-11-11) and is green on all seven checks,
  `volledige keuring exit=0`. That covers the four engine and server commits after
  `dc6ab54` — the step-bounded `naSnoei`, a `.env` parser without a backtracking regex, a
  logged dress-up failure. Twelve minutes on an idle laptop: engine 249s, sweep 370s,
  giveaways 71s, library 33s, the other three a tenth of a second each.

## Next
- **Props and "either" clues, approved 2026-11-17** (`specs/props-and-either-clues.md`): people sit on chairs, lie in beds, stand on rugs (several cells)
  and ride horses or bumper cars, drawn under their token; new clue kinds `op`, `enigeOp`,
  `kamerOf` ("in de keuken of in de serre"), `typeOf`, `en`, `ofwelPersoon`, `wieOp`.
  Built from the book photos of 2026-11-17 (mechanics only; table in the spec). Guus
  chose the same evening to build it inside engine-extension phase B, so boards shift
  once. Clue shapes per level as in the spec's table; rideable animals only in stable,
  courtyard, meadow and fairground. Not started; builds with engine-extension phase B.
- **Engine extension, approved 2026-11-17** (`specs/engine-extension.md`, ADR 0005,
  merged as #16): book-style puzzles from mechanics only (the source book is copyrighted).
  Build order: (A) human-style solver with named techniques and numbered Dutch solution
  steps, no boards change; (B) object clues, Web Worker with estimate and progress bar,
  puzzle store (100 per level per browser, 300 per level in the repo, levels 5-7);
  (C) roles, attributes, special cells; then level 6 = 12x14, level 7 = 16x16. Every board
  shifts once; the victim keeps no clue. Not started.
- **Tester feedback, 2026-11-16** (an adult tester, phone, easy puzzles; positive about the
  look of the board and the puzzles). (1) On a phone you scroll back and forth between
  the clues, the board and the special items, and forget a clue's name on the way.
  (2) The suspects in one horizontal scrolling row were hard to find; two rows suggested.
  (3) There is "Uitsluiten" and "Schetsen" but no visible "place" mode; add a third button
  and always show the active mode in bold. (4) No "next puzzle" button next to Controleer
  and Print; wants a logical order: puzzle 1, then the next, then the next level.
  **Daughter, 2026-11-16:** the victim should not get a linked clue of its own. Fixed the
  same day (Guus chose option A): no clue or hint names the victim, its place follows from
  the rest, and the keuring fails otherwise. Every room board shifted; half-played boards
  restart. Pending her verdict.
  Point 4 is built with `specs/solved-ending.md` (amended 2026-11-16): "Volgende zaak"
  moves up a level when a level is done, and a permanent "Volgende puzzel" button sits
  next to Controleer and Printen.
  Point 1 is built with `specs/clues-on-phone.md` (2026-11-16, merged and live the same day):
  on a phone the names and a box with the chosen name's clues stick over the board, and
  clue numbers are gone. Not yet checked: a print PDF (page count; the list is longer now
  that a clue stands under both its names) and a real phone with Safari's bars.
- **Daughter, second round, 2026-11-16.** (a) Clues are too easy, too alike and repeat
  a lot. "Same row as X" plus "same column as Y" already says where someone stands;
  say which room someone is in instead. At most one clue per person, none too easy.
  (b) A sketch letter should disappear from a cell once a placed figure makes it
  impossible there. (c) An undo button (arrow back). (d) The victim should get no clue:
  fixed and live the same day in pull request #11 (`37c8fca`), so she probably played
  before that; ask her to check again on a fresh case.
  (a) is built on branch `claude/priceless-lalande-85fd62` (`specs/harder-clues.md`,
  amended twice by Guus on 2026-11-16/17; pull request open, not merged, not live); the
  daughter should play a fresh case once it is live. (b) and (c)
  were built per `specs/undo-and-sketch.md`,
  merged as #14 and live (checked on the site 2026-11-17); pending her verdict. Also
  pending: Guus's phone remark (nicer font, unequal field sizes and alignment of the name
  pills and clue box) — a card is proposed.
1. **Show her the cheerful restyle and write down what she says.** The daughter's verdict
   was: dull colours, dull drawings, no artistic life. The owner answered the opening
   question of `specs/visual-liveliness.md` with "both", and directions 1 and 5 of that
   brief were built on 2026-11-10: the single gold accent gave way to a bright set
   (`--pop-1` … `--pop-6`, pink as the click colour), colour blobs in the background, a
   rainbow stripe under the header, a colour per difficulty level, a purple dark mode, and
   brighter floors and tokens on the board. A second round the same day took on the board
   itself: lighter layers (it was sepia under four brown overlays), a colour per room
   (`KAMERTINT` in `board-rooms.js`), walls in the world's colour, brighter materials in
   `STOFFEN` — and the name bar no longer sticks, because it lay over the board while you
   scrolled. Furniture, portraits and board frames were not touched — **directions 2, 3
   and 4 of the brief are still open**. Nothing is proven until she has seen it; that is
   the next step, and it is a measurement, not a formality. The same goes for the four
   present-day worlds of 2026-11-10: write down which one she likes best, and why.
2. **An ending when you solve it.** Built 2026-11-16 (`specs/solved-ending.md`): a sheet
   with the answer's portrait, a closing line per case and "Volgende zaak". Pending her
   verdict; the closing lines are a draft and can be tuned after she has seen them.
4. **Keyboard and screen reader.** Board cells are `rect` elements without focus, so the
   game cannot be played without a mouse.
5. **Modernise the base furniture set.** Done for the present-day worlds (see Recent
   decisions, 2026-11-10). The base set itself is still a 1930s manor (hearth, grand piano,
   steamer trunk, coal bunker), which is right for the manor, Christmas, Halloween, the
   academy and Regenstad. Redrawing it is direction 2 of `specs/visual-liveliness.md` and a
   decision of its own, because it touches every world. The lesson stands either way: if a
   drawing lies, draw it. A world layer can rename things, not redraw them.
6. **Error monitoring with Sentry** (owner's choice, 2026-11-14). Owner, in the Sentry
   console: create a project on the free Developer plan, platform "Browser JavaScript",
   name `reconstructie`, and set Settings → Security & Privacy → "Data Scrubber" and
   "Prevent Storing of IP Addresses" on. Then a session adds the SDK: no build step, so
   the loader script and its DSN sit in `index.html` (a browser DSN is public by design,
   not a secret), with `sendDefaultPii: false` and a `beforeSend` that drops URLs' hash
   (puzzle ids are not personal, but keep the payload minimal). In the same change: the
   "no tracking" non-goal in `docs/PRODUCT.md`, the privacy statement in
   `store/privacy-policy.md` and `docs/RELEASE.md` Operations must say what Sentry
   receives — and the site must still work when the Sentry script is blocked or offline.
7. **Uptime monitor** (owner's choice, 2026-11-14). Owner: create a free UptimeRobot
   account, add an HTTP(s) monitor for `https://reconstructie.app/` at a 5-minute
   interval, alert contact = the UptimeRobot phone app. Then record "UptimeRobot, free,
   5 min, alerts to phone" under Uptime monitoring in `docs/RELEASE.md` Operations.

## Ideas
- (none open; the puzzle-book idea became `specs/engine-extension.md`)

## Risks
- **Technical — a direct push to `main` is a deploy with no gate.** Since 2026-11-14 CI
  runs the keuring on every pull request, but commits pushed straight to `main` (most
  work so far) skip it, so a red engine can still go live. (assumption: until engine
  changes always go through a pull request)
- **Product — the one player loses interest.** Her verdict on the look was "dull", and a
  solved puzzle still ends on a bare "Opgelost". If she stops asking for puzzles, the
  project has no user. (assumption)
- **Legal — the format is borrowed.** `LICENSE` says "all rights reserved" (2026-11-14);
  the README names *Murdoku* as the
  inspiration. Puzzle rules are not protected, but the book's name, art or puzzles must
  never be copied in. (assumption: no legal advice taken)

## Blocked / open questions
- **Cloudflare Worker deferred.** `worker/` is written but not deployed: the free plan
  gives 10 ms CPU per request and verifying a puzzle costs up to three seconds. Works on
  the paid plan (~$5/month) or a host with a higher limit. Deliberately postponed.

## Recent decisions
- 2026-11-18 — Numbered solution view (engine-extension phase A, step 4) approved by Guus,
  forwarded verbatim by the main session: "Goedgekeurd" — steps shown only after Oplossing
  (open) or after a solve (closed), the whole list at once, on paper on a new page headed
  "Oplossing", one paragraph per step with the placement in bold.
- 2026-11-17 — Room-board clues (`specs/harder-clues.md`): no row/column clues, a room
  clue instead; at most 3 clues per name on levels 1–3, 4 on level 4, 5 on level 5, none
  yet on level 6 (one per name stays the aim). The spec's 2/3 caps proved out of reach;
  Guus chose "haalbaar". Level 6 waits for building in a Web Worker with a progress bar.
- 2026-11-16 — The project folder is now `~/Claude/Projects/reconstructie` (was
  `Puzzels`); the one-off rename script is gone again. The GitHub repo is still
  `het-vierde-spoor`; renaming it is optional (GitHub redirects the old name).
- 2026-11-14 — Workbench repair round: the site counts as live since 2026-11-13, the name
  Reconstructie is final, and `LICENSE` now says "all rights reserved" (the standard's
  default; MIT would need an ADR) — which answers the licence question below.
- 2026-11-11 — A 16×16 board now follows entirely from its seed (`edcbd24`). `naSnoei`
  stopped after 900 ms of wall-clock time, so a busy machine or a slow phone gave the same
  link different clues; it now stops after a fixed budget of 480,000 solver steps. The
  fixed cases are unchanged; of 31 measured level-6 boards, 2 got different clues (a
  one-off, agreed with the owner).
- 2026-11-10 — A drawing may never contradict its own name. The station, the school, the
  hospital, the office and the pool borrowed half their furniture from the manor and only
  renamed it ("het ruimtepak" was the knight's armour, "de tijdzuil" the longcase clock).
  All 71 such slots were swapped one-for-one for an honest modern drawing — never removed:
  `maxMeubels` was measured before and after for all thirteen existing worlds and is
  unchanged, and a fingerprint of 18 boards per world is identical to `f74d2b8`. Enforced
  by `OUDERWETS` / `MODERNE_WERELDEN` in `kamersoorten.js`, which `check-kamers.mjs` fails
  on as `OUDERWETSE TEKENING IN MODERNE WERELD`. See `specs/modern-worlds.md`.
- 2026-11-10 — Four present-day worlds, each as complete as the pool: Sterrenschip Zwaluw
  (`ruimteschip`), Hoogstad (`stad`, evening), Escaperoom Klokslag (`escaperoom`, a set,
  not a new game) and Pretpark Zonnestraal (`pretpark`, daylight). Thirteen worlds became
  seventeen, so **`wereldVoorSeed` now takes modulo seventeen: a new random puzzle lands in
  a different world than it used to.** Existing links are unaffected, because the world is
  in the URL. Accepted in the spec.
- 2026-11-10 — The restrained palette was reopened on purpose: one gold accent on cream
  became a bright set with pink as the click colour, because the player it is built for
  found it dull. The decoration sits in one block at the bottom of `styles/app.css`, and
  still uses no image files. See `specs/visual-liveliness.md` → Decision.
- 2026-11-10 — Exactly one clue per name is impossible, so every name is shown instead.
  Measured over twelve puzzles per level: five names need 6.6 clues on average to pin the
  solution, sixteen names 41.3. Forcing a balanced spread in `groeiTotVast` barely moved it
  (seven to six names without a clue, the outlier stayed at four) because `snoei` restores
  minimality afterwards; that experiment was reverted. What did work: show the name anyway,
  with the note that its spot follows from the rest.
- 2026-11-10 — The two switches left the sticky bar for the space below the board: on a
  phone their labels wrapped over three lines and bar plus header covered a quarter of the
  screen, permanently, over the puzzle.
- 2026-11-08 — Adopted the project standard — see `docs/decisions/0001-record-architecture-decisions.md`
- 2026-11-08 — Dutch stays the language of the code; docs are English — see `docs/decisions/0004-dutch-is-the-language-of-the-code.md`
- 2026-11-08 — A pool is not a lawn: `bad` became a room kind of its own with ten pieces of
  its own and no fallback route, after a planter turned up in the shallow end.
- 2026-11-08 — The keuring runs all seven checks always (`tools/keuring.mjs`); the `&&`
  chain in `package.json` hid 74 missing icons behind one budget bug.
- 2026-11-08 — Not every case is a murder: disappearances and thefts too (`zaken.js`).

## Known gaps not yet scheduled
- Level 6 of the room board has no cap per name: 3.96 clues per name against 3.57 before,
  busiest name up to 10, and building takes 7 s on average, up to 18 s, on the main
  thread. Fix: build in a Web Worker with a progress bar, then cap level 6 at 5. Levels 3–5
  also exceed the spec's build-time budget (0.8 s, 1.0 s, 5.4 s at worst). A smarter
  builder that picks one strong clue per name (the way a hand-made puzzle does) would help
  all levels.
- The keuring never draws the board frames, so a fault in `bordrand.js` that only breaks at
  draw time is not caught.
- The solution sits in the page; anyone who opens the console can read it.
- 16×16 stays cramped on a phone, even with the frame switched off.

## Deferred
- `tests` — the keuring (`tools/check-*.mjs`, `npm run check:all`) is the test suite by
  decision (ADR-0003), and `project-check` does not count it; no separate unit tests
  (until the monthly review)
- `design-refs` — candidates are listed in `docs/DESIGN.md` References; the owner picks
  three to six in a separate round (until 2026-11-28)
- `error-monitoring` — chosen, but needs a Sentry project in the owner's console first;
  steps in Next, item 6 (until 2026-11-28)

## Workbench feedback
- 2026-11-16 — Print proofs need a headless Chromium, and Chromium cannot start inside the
  Bash sandbox (Mach bootstrap and ProcessSingleton socket denied, also with
  `--no-sandbox`). Allow Brave in the sandbox, or give sessions a way to print to PDF from
  the built-in browser; until then the screen emulation `tools/printweergave.js` stands in.
- 2026-11-16 — `/main-session` says "merge"; this repository now allows squash merges only,
  so `gh pr merge --merge` fails. Detect the allowed method before merging.
- 2026-11-16 — Two PRs touching the same file were each green against the old `main`;
  the main session had to update the second branch and wait a full CI run again. The
  skill could say: after merging one, update the next before merging.
- 2026-11-14 — A hook blocks reading `.env.example` (even `git diff`), so a session cannot
  check that the placeholder file holds no secret before committing it; allow `.env.example`.
- 2026-11-14 — `/main-session` merges only PRs that are green *and* reviewed; Dependabot
  PRs get no review, so they pile up. Decide whether green Dependabot PRs may be merged.
- 2026-11-14 — The session-start report ran on a stale local `main` (PR #2 was merged on
  GitHub but not pulled), so it listed gaps that were already fixed. Fetch before checking.
- 2026-11-14 — `/main-session` Intake has no step for uncommitted work in the main checkout
  that a finished session left behind (`.env.example`, an untracked spec).
- 2026-11-14 — `project-check` reports `stack: typescript` for any `package.json`; this is
  plain JavaScript with no TypeScript, so the CI template `ci-typescript.yml` (`tsc`) did
  not fit and was rewritten by hand.
- 2026-11-14 — `tests` counts only `*.test.*` files or `tests/` folders; a project whose
  test suite is `tools/check-*.mjs` (ADR-0003) can only defer the item. A `tests` path
  setting, or reading the test command from `CLAUDE.md`, would fix it.
- 2026-11-14 — `commands` wants a backticked command on a typecheck/lint line; "Typecheck:
  none" is a valid answer that the check rejects, so a stand-in line had to be added.
- 2026-11-14 — Answering the live question moved the stage from building to production in
  one step, which doubled the round (12 new items) after the confirmation round was spent;
  the session-start report could warn that the live answer pulls in the production items.
- 2026-11-14 — `tools`: the Cloudflare plugin waits for a sign-in, `wrangler` is not on the
  PATH and the project's own `tools/cloudflare-dns.mjs` needs `.env`, which a worktree
  does not have; only the deprecated Cloudflare connector answered (0 workers).
- 2026-11-14 — The CI template runs `npm ci` without `--ignore-scripts`; SonarCloud flags
  that as a security issue and fails the quality gate on the first pull request that adds
  it. Fix the template in `_workbench/templates/github/workflows/`.
- 2026-11-14 — The pre-commit hook goes into the shared `.git/hooks`, so installing it from
  a worktree also changes the main checkout and every other worktree.

## Health
Version: 0.1.0 (private, unreleased) · Build: no build step — a push to `main` is a deploy ·
Tests: `npm run check:all` green, 7/7 checks, 2026-11-11 (`c7136a5`) · Store: n/a (web) ·
Dependencies: 1 (`@anthropic-ai/sdk`, tooling only), 0 vulnerabilities (2026-11-09)
