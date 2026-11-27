#!/usr/bin/env bash
# Folds one-line fragments into CHANGELOG.md and docs/progress-done.md, then deletes them.
#
# A PR never appends to CHANGELOG.md or the Done history (docs/progress-done.md): two PRs that both
# append a line there conflict, and every merge of main costs a re-review. Instead a PR adds a
# new file, named after its branch with "/" as "-" (claude/foo -> claude-foo.md):
#   changelog.d/<name>.md       one line "- <entry>", for "## Unreleased" in CHANGELOG.md
#   docs/progress.d/<name>.md   one line "- <date> · <task> · <what> · <PR>", for "## Done" in docs/progress-done.md
#                               (agents never read that file; it is created with a header when missing)
# Fold on main before a release (a docs PR that runs this script), so the release PR then
# moves the entries from "## Unreleased" under the new version.
#
# Rules, all checked before anything is written (it writes both files or neither):
# - a fragment is a regular file directly in its directory, named [A-Za-z0-9._-]+.md, exactly
#   one line "- <text>" (LF only, a final newline is optional); README.md is not a fragment and
#   must start with a "# " heading; any other entry in the directory (a subdirectory, a .txt
#   file, a link, a name with a space, tab or newline) is an error, never skipped;
# - the target file exists (docs/progress-done.md is created when missing) and has its heading
#   exactly once;
# - no target, fragment directory or fragment is a symlink, or lies under one.
# Deterministic: fragments fold in byte order of their file names (LC_ALL=C), at the end of
# their section, with one blank line before the next heading. Without fragments it changes
# nothing.
#
# Usage: bash fold-fragments.sh [repo root; default: the git top level, else .]
# Always through bash: splice ships files without their mode (template format 9.13), so the
# copy in a repo is not executable.
set -euo pipefail
export LC_ALL=C
root="${1:-$(git rev-parse --show-toplevel 2>/dev/null || echo .)}"
cd "$root"

die() {
  echo "fold-fragments: $*" >&2
  exit 1
}

# real <path>: the path has no symlink in it below the repo root, so a write stays in the repo.
here="$(pwd -P)"
real() { [ ! -L "$1" ] && [ "$(realpath -- "$1")" = "$here/$1" ]; }

# The plan, filled by plan(): per target, its folded temp file and its fragments, which are
# frags_all[first[i]] .. frags_all[first[i] + count[i] - 1]; tmps lists every temp file.
targets=()
outs=()
frags_all=()
first=()
count=()
tmps=()
cleanup() { if [ "${#tmps[@]}" -gt 0 ]; then rm -f "${tmps[@]}"; fi; }
trap cleanup EXIT

# plan <target> <heading> <dir> [header]: with a header text, a missing target starts from it. Checks everything and writes the folded text to a temp file
# next to the target. It runs in this shell (never in $(...)), so `die` stops the script.
plan() {
  local target="$1" heading="$2" dir="$3" header="${4:-}" src legacy
  if [ ! -e "$dir" ] && [ ! -L "$dir" ]; then return 0; fi
  real "$dir" && [ -d "$dir" ] || die "$dir must be a directory in the repo, not a symlink"
  local frags=() e base
  while IFS= read -r -d '' e; do
    base="${e##*/}"
    if [ "$base" = README.md ]; then
      # The directory's README, never a fragment; one that reads like a fragment is an error.
      [ -f "$e" ] && [ ! -L "$e" ] && [ "$(head -c 2 "$e")" = "# " ] ||
        die "$e is reserved for the directory's README (a '# ' heading); name the fragment after its branch"
      continue
    fi
    # Only plain names: no space, tab or newline, nothing a later step could split.
    if [ ! -f "$e" ] || [ -L "$e" ] || [[ ! "$base" =~ ^[A-Za-z0-9._-]+\.md$ ]]; then
      die "$(printf '%q' "$e") is not a fragment: use a file <branch with / as ->.md ([A-Za-z0-9._-]) directly in $dir/"
    fi
    frags+=("$e")
  done < <(find "$dir" -mindepth 1 -maxdepth 1 -print0 | sort -z)
  [ "${#frags[@]}" -gt 0 ] || return 0
  src="$target"
  if [ -z "$header" ] || [ -e "$target" ] || [ -L "$target" ]; then
    [ -f "$target" ] || die "$target is missing, but $dir/ has fragments"
    real "$target" || die "$target must be a file in the repo, not a symlink"
  else
    real "$(dirname "$target")" || die "$(dirname "$target") must be a directory in the repo, not a symlink"
    legacy="$(dirname "$target")/PROGRESS.md"
    if [ -f "$legacy" ] && grep -qxF -- "$heading" "$legacy"; then
      die "$legacy still has '$heading': do the one-time move first (move that section to $target)"
    fi
    src="$(mktemp "$target.seed.XXXXXX")"
    tmps+=("$src")
    printf '%s\n' "$header" > "$src"
  fi
  [ "$(grep -cxF -- "$heading" "$src" || true)" = 1 ] ||
    die "$target must have the line '$heading' exactly once"
  local lines="" f n line
  for f in "${frags[@]}"; do
    n="$(awk 'END { print NR }' "$f")"
    line="$(head -n 1 "$f")"
    # No pipe here: a long line must not trip pipefail.
    case "$line" in
      *$'\r'*) die "$f must be exactly one line '- <text>' (LF line ending)" ;;
      "- "[![:space:]]*) ;;
      *) die "$f must be exactly one line '- <text>' (LF line ending)" ;;
    esac
    [ "$n" = 1 ] || die "$f must be exactly one line '- <text>' (LF line ending)"
    lines+="$line"$'\n'
  done
  local tmp add
  tmp="$(mktemp "$target.fold.XXXXXX")"
  add="$(mktemp "$target.lines.XXXXXX")"
  tmps+=("$tmp" "$add")
  # The new lines go to awk in a file: an environment variable has a size limit.
  printf '%s' "$lines" > "$add"
  ADD="$add" HEADING="$heading" awk '
    function flush() {
      if (insec && !done) {
        if (!content) print ""
        while ((getline l < ENVIRON["ADD"]) > 0) print l
        done = 1
      }
    }
    insec && /^## / {
      flush(); if (blank == 0) blank = 1
      for (i = 0; i < blank; i++) print ""
      blank = 0; insec = 0; print; next
    }
    $0 == ENVIRON["HEADING"] { print; insec = 1; next }
    insec && $0 == "" { blank++; next }
    insec { for (i = 0; i < blank; i++) print ""; blank = 0; content = 1; print; next }
    { print }
    END { flush(); for (i = 0; i < blank; i++) print "" }
  ' "$src" > "$tmp"
  targets+=("$target")
  outs+=("$tmp")
  first+=("${#frags_all[@]}")
  count+=("${#frags[@]}")
  frags_all+=("${frags[@]}")
}

# Phase 1: plan both folds; any error stops here, with nothing written.
plan CHANGELOG.md "## Unreleased" changelog.d
plan docs/progress-done.md "## Done" docs/progress.d "$(printf '# Progress: Done\n\nOne line per landed task, oldest first. Agents never read this file.\n\n## Done\n')"

# Phase 2: write. `cat >` keeps the target's mode and inode.
for i in "${!targets[@]}"; do
  cat "${outs[$i]}" > "${targets[$i]}"
  rm -f -- "${frags_all[@]:${first[$i]}:${count[$i]}}"
  echo "fold-fragments: ${count[$i]} into ${targets[$i]}"
done
