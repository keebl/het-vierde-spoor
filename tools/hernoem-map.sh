#!/bin/bash
# Eenmalig: hernoemt de projectmap ~/Claude/Projects/Puzzels naar
# ~/Claude/Projects/Reconstructie, de naam van het spel.
#
# Draai dit in je eigen Terminal, niet in een Claude-sessie: de sandbox mag
# .git/worktrees en ~/.claude/projects niet aanpassen, en een sessie die in
# deze map draait verliest haar werkmap zodra die verhuist.
#
#   bash ~/Claude/Projects/Puzzels/tools/hernoem-map.sh          # proefdraai
#   bash ~/Claude/Projects/Puzzels/tools/hernoem-map.sh --echt   # uitvoeren
#
# Na het hernoemen staat dit script op ~/Claude/Projects/Reconstructie/tools/
# en heeft het geen werk meer; het mag dan weg.
set -euo pipefail

OUD="$HOME/Claude/Projects/Puzzels"
NIEUW="$HOME/Claude/Projects/Reconstructie"
# Claude Code bewaart geheugen en sessies per map, onder het pad met / als -.
CLAUDE_OUD="$HOME/.claude/projects/$(printf '%s' "$OUD" | tr '/' '-')"
CLAUDE_NIEUW="$HOME/.claude/projects/$(printf '%s' "$NIEUW" | tr '/' '-')"

ECHT=0
[ "${1:-}" = "--echt" ] && ECHT=1

fout() { echo "STOP: $*" >&2; exit 1; }
doe() {
  if [ "$ECHT" = 1 ]; then echo "+ $*"; "$@"; else echo "(proef) $*"; fi
}

# --- Voorwaarden: liever weigeren dan half verhuizen -----------------------
[ -d "$OUD/.git" ] || fout "$OUD bestaat niet of is geen git-repo."
[ -e "$NIEUW" ] && fout "$NIEUW bestaat al."
[ -z "$(git -C "$OUD" status --porcelain)" ] || fout "er staan niet-gecommitte wijzigingen in $OUD."
TAK="$(git -C "$OUD" branch --show-current)"
[ "$TAK" = "main" ] || fout "$OUD staat op tak '$TAK', niet op main."

# Worktrees liggen ín de map (.claude/worktrees) en hun sessies werken daar
# nog in. Eerst de PR's mergen en de worktrees opruimen.
EXTRA="$(git -C "$OUD" worktree list --porcelain | grep -c '^worktree ' || true)"
if [ "$EXTRA" -gt 1 ]; then
  git -C "$OUD" worktree list
  fout "er zijn nog $((EXTRA - 1)) worktrees. Merge de open PR's, ruim ze op (in de app, of 'git worktree remove <pad>') en probeer opnieuw."
fi

echo "Van:  $OUD"
echo "Naar: $NIEUW"
echo "Geheugen: $CLAUDE_OUD/memory -> $CLAUDE_NIEUW/memory"
echo

# --- Verhuizen ---------------------------------------------------------------
doe mv "$OUD" "$NIEUW"
doe git -C "$NIEUW" worktree prune

# Alleen het geheugen gaat mee. De oude sessiegeschiedenis blijft onder de
# oude naam staan: die sessies verwijzen naar het oude pad en zijn niet meer
# te hervatten, maar wel na te lezen.
if [ -d "$CLAUDE_OUD/memory" ]; then
  doe mkdir -p "$CLAUDE_NIEUW"
  if [ -e "$CLAUDE_NIEUW/memory" ]; then
    echo "LET OP: $CLAUDE_NIEUW/memory bestaat al; niet overschreven."
  else
    doe cp -R "$CLAUDE_OUD/memory" "$CLAUDE_NIEUW/memory"
  fi
else
  echo "Geen geheugenmap gevonden in $CLAUDE_OUD; niets te kopiëren."
fi

echo
if [ "$ECHT" = 1 ]; then
  echo "Klaar. Nog te doen in de Claude-app:"
else
  echo "Proefdraai: er is niets veranderd. Draai met --echt om het te doen. Daarna in de Claude-app:"
fi
echo "  1. Start een nieuwe sessie in $NIEUW en maak die main session (/main-session)."
echo "  2. Archiveer de oude sessies van Puzzels in de zijbalk."
