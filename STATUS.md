# Status — Reconstructie

Last updated: 2026-11-25
Live: yes (since 2026-11-13)
UX approved: 2026-11-18

Translated and restructured from `HANDOFF.md`, which lived at the repository root until the
project standard was adopted; the original is in git history. The parts of it that are
standing guidance rather than state moved to `CLAUDE.md`.

## Now
- 2026-11-25: **paywall step 2 built**: entitlement table `reconstructie.toegang`
  (`supabase/migrations/20261125120000_reconstructie_toegang.sql`), read own rows only, no
  client writes; account deletion removes it. RLS test 36/36 in PGlite. **Not applied to
  `claudeDB`** — waits on Guus's yes (ask via mission control).
- 2026-11-25: **hand-off (context limit).** Level path merged and live as PR #50. Free
  boundary (steps 1–18 free, sign at 18/19, path paywall copy) open as PR #51, branch
  `claude/pad-gratis-grens`, head 0036616, CI running, Auto-fix on. Next: merge #51 when green.
- 2026-11-25: **level path built** (`specs/level-path.md`), merged as PR #50 (309f8bc). Difficulty measure
  `src/engine/zwaarte.js` (calibrated with `tools/meet-zwaarte.mjs`: level medians 6, 9,
  12, 15, 27, 84); in-between sizes 8, 10, 11, 13, 14 in `padParams`; `tools/pad.mjs` builds
  and picks 100 stops into `src/content/pad.js` and `pool/pad.json` (boards ≥ 10×10);
  `check:pad` in the keuring. Page `#/pad`, stop route `#/pad/<k>`, stars on the closing
  sheet, front-page button. Path stops pass the paywall like any puzzle of their level; how
  the path explains the level-4 wall is still open (ask Guus).
- 2026-11-20: **tester link** `/tester` (Guus): in that browser everything is free, as before
  the paywall; `/tester?uit` turns it off. Same PR #47.
- 2026-11-20: **paywall model revised** (Guus "Ja, met de drie", ask-7c3e91b2; D2 and ADR-0007):
  signed out, 2 free puzzles each of levels 1–3 and 1 taste puzzle of level 4; signed in, also
  the puzzle of the day (levels 1–3, same for everyone); levels 5–6 and more only with full
  access. Built behind the same `'test'` switch; the level path must still explain the level-4
  wall when it is built.
- 2026-11-20: **web paywall step 1 built** (`specs/paywall-and-android.md` Plan): two free
  puzzles per level counted in the browser (`src/betaalmuur/toegang.js`), the paywall screen
  (`src/ui/betaalmuur.js`, copy in `docs/UX.md`), keuring `check:betaalmuur`. Switch
  `BETAALMUUR = 'test'`: players see nothing; add `?betaaltest` before the `#` to try it.
  Buying is not possible yet (step 3 needs Stripe Managed Payments approval).
- 2026-11-20: **paywall and Android app specced** (`specs/paywall-and-android.md`, draft): two free puzzles per level, one purchase across web and Play, TWA for Android, and a production setup off the hobby stack (Cloudflare Pages, own Supabase Pro project, webhook endpoint). Approved the same day: one-time unlock, Lemon Squeezy, Cloudflare Pages, app includes children (Families policy), database stays in free `claudeDB` with ping, encrypted backup and a purchase rebuild (D4 = A). Reconstructie ships under the photo-cleaner Play organisation account. Build starts 2026-11-25; Guus opens a Stripe account with Managed Payments (D3 changed the same day: Lemon Squeezy closed to new stores) and support@ forwarding before then; the Play app is created together on 2026-11-25.
- 2026-11-19: **rug variety built** (`specs/rug-variety.md`, revised: pattern from size,
  Guus "Ja, omzetten"): `src/puzzle.js` names and draws each rug after its size
  (`KLEED_VAN_MAAT`: 2×3 Persian, 2×2 checked, 1×3 runner, 1×2 new rag rug). No engine
  change, no board shift, `pool/` untouched. Round rug (3×3) and sheepskin (1×1) wait for
  phase C; one design can still lie up to four times on a manor board.
- 2026-11-19: **phase B is live.** het-vierde-spoor#28 merged (`2ebccdd`, Guus: "Ja, beide"),
  Pages built it; a level-6 board on reconstructie.app shows an either-clue, no console
  errors, live `pool/` is `b2` with 306 boards. het-vierde-spoor#29 merged (`e1c1821`): PR CI
  judges the level 5–6 room boards from `pool/` (`--voorraad`), a concurrency group cancels
  superseded PR runs, docs-only PRs skip the heavy matrix, and "de voorraad" runs only when
  `pool/`, the workflows or a file it imports changes (`tools/afhankelijk.mjs`). PR CI went
  from ~1h09m to ~17m wall clock. The full motor and sweep run nightly
  (`.github/workflows/nachtrun.yml`, 02:17 UTC); first nightly run not yet seen.
  Remote branch `claude/engine-phase-b-2` (merged) and the stale `claude/engine-phase-b`
  are still on the remote.
- 2026-11-18, late: phase B rebased on main and finished in the main session; the phase-B
  session (`local_e3f35404`) went idle before its PR (its 300-seed pool run finished later). Pushed as branch
  `claude/engine-phase-b-2` (the remote `claude/engine-phase-b` holds an older WIP commit
  and is not force-pushed). Repo store `pool/` built on the current engine: 300 seeds per
  level 5–6 plus the library cases (`check:voorraad` green). Level 5
  on the new builder with a 120 s budget (follows Guus's "doorlooptijd boeit me niet"), level 6
  on the old builder until phase C ("A: later, via fase C"), victim never named in a clue.
  "reconstructie · build · accounts-and-sync" (`local_8735ef78`, PR #26 merged) is finished.
  het-vierde-spoor#26 (accounts steps 1–6) merged `fc53949`; #27 (sign-in on) merged and live.
- Waiting on Guus: the live smoke test (he signs in on https://reconstructie.app/#/account
  and says "live ingelogd"; then check return to the site and a sync round in
  `reconstructie.puzzels`), and Family Link with his daughter (`docs/accounts-go-live.md` §4).
  Card "reconstructie · chore · rename repo and worker" (task_feb425f2) still unstarted.
- 2026-11-18, evening: **Google sign-in is live** (#27, `AAN = true`). Go-live checklist done:
  clearhead members gate live, Google client and Supabase checked, `privacy@` forwards via
  Cloudflare Email Routing, local trial with Guus's account passed (sign-in, sync both ways,
  account deletion keeps the shared login and clearhead data). Next: smoke test on the live
  site; Family Link approval with his daughter (`docs/accounts-go-live.md` §4).
- 2026-11-18, evening: **engine-extension phase B built** with the props and either-clues
  spec, on branch `claude/engine-phase-b-2` (pull request open, not merged, not live). Every
  board shifts once (fingerprints rewritten). Levels 1–5: one own clue per suspect from the
  new template builder (level 5 with denser boards, 12 rooms and clue choice by remaining
  solutions — Guus's "a+b+c"); level 6 (16×16) works too but takes ~7.5 min per board,
  so it keeps the old builder with the new clue kinds until phase C makes it 12×14
  (option A, card with Guus). No clue names the victim; the clue list leaves them out.
  Props (chairs, beds, rugs, horses …), windows, 14 new clue kinds, Web Worker with
  progress bar and prefetch, IndexedDB store, repo store `pool/` (300 seeds per level
  5–6). Also Guus's same-day UI asks: whole intro, rules under the board, legend once per
  name, blue "Volgende puzzel" last. Open: rectangular boards deferred to step 16, print
  PDF of props in the owner's terminal, the daughter's verdict on a fresh level-3 and
  level-5 board.
- 2026-11-18, evening: `specs/accounts-and-sync.md` steps 1–6 built on branch
  `claude/frosty-raman-a0da51` (PR open, not merged, not live; sign-in switched off with
  `AAN = false` in `src/sync/config.js`). Schema `reconstructie` applied to `claudeDB`
  (Guus: "Ja, toepassen"), RLS tests 30/30, advisors clean. Found: a clearhead trigger seeds
  `public.areas` for every new login, so account deletion keeps the login; recorded as a
  go-live blocker in `docs/accounts-go-live.md`. The level path must call
  `meldWijziging('pad', k)` when it saves a stop (not built yet). Privacy contact
  `privacy@reconstructie.app` (Cloudflare Email Routing still to set up).
- 2026-11-18: personal-assistant session "clearhead-members" started (prerequisite for
  sign-in: clearhead tables behind a members list).
- 2026-11-18, late: `specs/accounts-and-sync.md` approved with its UX sections and sketch
  (`design/prototype/accounts-and-sync/`), PR #25, docs only, not built. Optional Google
  sign-in via Supabase in the shared project `claudeDB` (schema `reconstructie`); syncs
  solved/revealed puzzles, path stars and three preferences, not half-finished boards.
  Blocking for go-live: clearhead (personal-assistant) closes its `public` tables to
  strangers with a members table — its own task in that project.
- 2026-11-18, later: #22 merged (`b46a683`) — "op het schoolplein" for eight open places
  (keuring rule `VOORZETSEL` in `check-kamers.mjs`) and one line per thought in the numbered
  solution; eight fingerprints changed for clue text only, boards identical.
- 2026-11-18, later: merged and live — #23 (squash of `20b94c7`): second click on a level
  starts a puzzle (the two buttons under the picker are gone), the closing sheet suggests one
  level harder after a self-solve, "Hoe je dit bord bedient" has a heading per mode.
  In progress in session "engine-extension-phase-b" (branch `claude/engine-phase-b`, not
  pushed as PR yet): phase B with props and either-clues; new builder on levels 1–4 (build
  time no criterion, Worker with progress; level-4 budget 4 s); victim/missing person never
  named in a clue; levels 5–6 get denser boards, clue choice by remaining solution count and
  an offline pool of 300 boards per level (Guus: "a+b+c"). Not started: the level path
  ("Candy Crush"-style route with very gradual difficulty) needs a spec first.
- 2026-11-18: merged and live — #20 (`af2131b`) clue list: a two-person clue once, under
  the first name, a name without a line points to where it is mentioned, the victim shows
  only its header (Guus's Rietveld report; his "two solutions" was one, checked by hand);
  #21 (`f1625ad`) engine-extension phase A: human solver with trace, cross-check over the
  keuring sample, Dutch numbered solution after "Oplossing" or a self-solve, on its own
  page in print, baseline in the spec; no board changed. Still open: a print PDF with
  `tools/printproef.mjs` in the owner's terminal. Proposed, not started: renaming the repo
  to `reconstructie` and the worker to `reconstructie-ai` (card in the main session).
  Next: engine-extension phase B with `specs/props-and-either-clues.md`.
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
- Merge PR #51 (free path steps) once CI is green; then nothing open from the level path.
- **Go-live blocker for the paywall:** remove the tester link (`tester.html`,
  `src/betaalmuur/tester.js`, `/tester` in `server/serve.mjs`) before `BETAALMUUR` goes to
  `'live'` (Guus, 2026-11-20, "uit vóór live"). `check:betaalmuur` refuses `'live'` while
  `tester.html` exists.
- Merge the phase B PR when it is green (main session), then propose the level-path build
  card (`specs/level-path.md`, approved; Draw Things images need a card first because
  PRODUCT.md says "no image files"). The level path calls `meldWijziging('pad', k)`.
- Delete the remote branch `pr-assets/accounts` (the auto-mode classifier blocked it).
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
- **Stripe Managed Payments: waiting on Guus.** On 2026-11-25 he answered "Later" to the
  eligibility check (ask-7bf35043). Buying and paywall step 3 stay closed until he opens
  the Stripe side; the paywall stays in test mode with the tester link.
- **Cloudflare Worker deferred.** `worker/` is written but not deployed: the free plan
  gives 10 ms CPU per request and verifying a puzzle costs up to three seconds. Works on
  the paid plan (~$5/month) or a host with a higher limit. Deliberately postponed.

## Recent decisions
- 2026-11-25 — Level path and the paywall: "A: 18 stappen gratis" (ask-8d1f2961, via mission
  control). Steps 1–18 (5×5, 6×6) are free for everyone and do not use a level's free puzzles;
  from step 19 the path needs full access, marked by a sign on the path (`PAD_GRATIS`).
- 2026-11-18 — Accounts and sync approved: "Goedgekeurd, zo bouwen" (forwarded verbatim by
  the main session; `specs/accounts-and-sync.md`). Product change: accounts optional, one
  database for progress only. Choices: claudeDB not a new project ("ik mag maar 1 project"),
  sign-in open to "Iedereen", "Alleen afgerond mee" (no half boards), level, auto-crosses
  and panels sync, "Rondje met letter", "Uitleg + privacy.html", Family Link for her account.
- 2026-11-18 — Level path spec and sketch approved: "Goedgekeurd" (`specs/level-path.md`);
  build after engine-extension phase B; Google sign-in split off to `specs/accounts-and-sync.md`.
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
- `naming` — renaming the GitHub repository (`het-vierde-spoor`), `docs/decisions/` →
  `docs/adr/` and the worker `vierdespoor-ai`: Guus, 2026-11-19, "Nu niet, uitstellen"
  (until the monthly review)

## Cost guard
- Anthropic: app-side daily limit `AI_DAILY_CALL_LIMIT` (default 200, UTC day) checked
  before every paid call in `server/serve.mjs`, `tools/ai-vooraf.mjs` and the undeployed
  worker; Guus, 2026-11-19, "Ja, daglimiet". A spend cap or budget alert in the Anthropic
  Console is his own decision (`docs/RELEASE.md`, Spend caps) (2026-11-19)

## Workbench feedback
- 2026-11-20 — Guus found the rules panel twice on the puzzle page; a rendered UI check could refuse two visible panels or headings with the same text on one screen.
- 2026-11-19 — Guus had to point out a 64 px gap between two panels that sit 24 apart elsewhere
  in the same stack (puzzle page, one column). Proposed ui-check rule: siblings of one kind in
  one stack must sit equally apart at every width; a static CSS lint cannot see summed margins.
- 2026-11-19 — `ui-check` cannot measure this site: its `page.addStyleTag` is blocked by the
  site's CSP `style-src 'self'`. Use CDP `Page.setBypassCSP` in ui-check rather than
  weakening the CSP; the spacing PR was checked by hand in the browser pane instead.
- 2026-11-18 — A card answer or button on a turn started by another session does not count
  as Guus's words for `start_session` (cwd) or a merge; the main session had to ask him to
  type the same answer as a chat message. Cards should carry that authority.
- 2026-11-18 — Relayed side-session questions reached Guus as "type 'goedgekeurd' or a letter
  per question"; he wants a card with buttons for every fixed-option ask. Sent to the
  workbench main session (workbench #79 covers single choices; multi-question relay pending).
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
