# ADR-0001: Record architecture decisions

Date: 2026-11-08
Status: accepted

## Context
Decisions about structure, dependencies, data and distribution are made continuously and
were previously only visible in commit history or conversation. Each new session (human or
Claude) had to rediscover them. This project has an unusually long memory of *why* rules
exist — the code comments name the bug that caused each rule — but that memory lives next
to the code it constrains, not where a structural decision can be found.

## Decision
We record each significant decision as a short ADR in `docs/decisions/`, numbered,
immutable once accepted, superseded by a new ADR when it changes. Format: context,
decision, consequences, alternatives.

## Consequences
- Positive: the *why* survives; Claude reads it instead of guessing; reviews can check
  against stated intent.
- Negative: a few minutes per decision. Acceptable.

## Alternatives considered
- Comments in code — fragmented, no context. (This project uses them heavily and will keep
  doing so; they explain a rule, not a structure.)
- A single growing `ARCHITECTURE.md` — becomes a history instead of a description.
