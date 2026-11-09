# ADR-0004: Dutch is the language of the code

Date: 2026-11-08
Status: accepted (reconstructed — written during `/adopt`; the decision itself predates
this file and is visible throughout the source)

## Context
The global convention for this portfolio is that everything inside a repository is English:
identifiers, comments, commit messages, docs. This repository is the exception. The product
is Dutch — every noun the engine moves around is a Dutch noun that a player reads on screen
("de kelderkast", "het ondiepe bad", "naast", "tegen de buitenmuur"). Translating those in
the code means two names for one thing and a lookup between them, and the content tables
*are* the product.

## Decision
Identifiers, comments, commit messages and UI text are **Dutch**. Documentation that is
about the project rather than in it — `CLAUDE.md`, `STATUS.md`, `docs/`, ADRs — is
**English**, per the global rule. `README.md` stays Dutch: it is the long-form tour of the
game for a human reader, and it is public.

## Consequences
- Positive: one name per thing. A clue sentence, a content table key and a check's error
  message all say "de serre".
- Positive: the comments, which carry most of this project's memory, read in the same
  language as the code they explain.
- Negative: deviates from the portfolio convention, so it needs this ADR to stop every new
  session from "fixing" it.
- Negative: a contributor who reads no Dutch cannot work on the content layer. There are no
  other contributors.

## Alternatives considered
- English identifiers with Dutch content strings — the split lands exactly in the middle of
  `kamersoorten.js`, where keys *are* content.
- Dutch docs as well — the portfolio's other projects and tooling are English; the docs are
  where Claude and the owner meet across projects.
