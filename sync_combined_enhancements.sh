#!/usr/bin/env bash
# Rebuilds `deploy/combined-enhancements` from upstream/master plus every one of
# this fork's own open PRs against thoughtworks/build-your-own-radar, so the
# combined branch always reflects the latest state of all independent PRs.
#
# Requires: gh CLI authenticated with access to thoughtworks/build-your-own-radar.
#
# Usage:
#   ./sync_combined_enhancements.sh              # merge locally, leave it for you to review
#   ./sync_combined_enhancements.sh --push       # also push the result to origin
#   ./sync_combined_enhancements.sh --force      # merge conflicting PR branches anyway

set -euo pipefail

UPSTREAM_REPO="thoughtworks/build-your-own-radar"
UPSTREAM_REMOTE="upstream"
BASE_BRANCH="master"
ORIGIN_REMOTE="origin"
COMBINED_BRANCH="deploy/combined-enhancements"
PUSH=false
FORCE=false

for arg in "$@"; do
  case "$arg" in
    --push) PUSH=true ;;
    --force) FORCE=true ;;
  esac
done

gh_user="$(gh api user --jq .login)"
echo "Discovering open PRs authored by $gh_user against $UPSTREAM_REPO..."

PR_BRANCHES=()
CONFLICTING_PRS=()
while IFS=$'\t' read -r number headRefName mergeable; do
  [[ -z "$number" ]] && continue
  [[ "$headRefName" == "$COMBINED_BRANCH" ]] && continue
  PR_BRANCHES+=("$headRefName")
  if [[ "$mergeable" == "CONFLICTING" ]]; then
    CONFLICTING_PRS+=("#$number ($headRefName)")
  fi
done < <(
  gh pr list --repo "$UPSTREAM_REPO" --author "$gh_user" --state open \
    --json number,headRefName,mergeable \
    --jq '.[] | [(.number|tostring), .headRefName, .mergeable] | @tsv'
)

if [[ ${#PR_BRANCHES[@]} -eq 0 ]]; then
  echo "No open PRs found for $gh_user - nothing to combine."
  exit 0
fi

echo "Found ${#PR_BRANCHES[@]} open PR branch(es):"
printf '  - %s\n' "${PR_BRANCHES[@]}"

if [[ ${#CONFLICTING_PRS[@]} -gt 0 && "$FORCE" == false ]]; then
  echo
  echo "The following PR(s) already have merge conflicts against $BASE_BRANCH on GitHub"
  echo "(their branch is stale relative to $BASE_BRANCH). Merging them here as-is risks"
  echo "silently reverting unrelated features that $BASE_BRANCH gained since they branched."
  printf '  - %s\n' "${CONFLICTING_PRS[@]}"
  echo
  echo "Fix each one first: checkout the branch, merge/rebase $UPSTREAM_REMOTE/$BASE_BRANCH,"
  echo "resolve conflicts, push, then re-run this script. Or pass --force to proceed anyway."
  exit 1
fi

echo "Fetching $UPSTREAM_REMOTE/$BASE_BRANCH and $ORIGIN_REMOTE branches..."
git fetch "$UPSTREAM_REMOTE" "$BASE_BRANCH"
git fetch "$ORIGIN_REMOTE" "$COMBINED_BRANCH" "${PR_BRANCHES[@]}"

git checkout -B "$COMBINED_BRANCH" "$ORIGIN_REMOTE/$COMBINED_BRANCH"

echo "Merging $UPSTREAM_REMOTE/$BASE_BRANCH..."
git merge --no-edit "$UPSTREAM_REMOTE/$BASE_BRANCH"

for branch in "${PR_BRANCHES[@]}"; do
  echo "Merging $ORIGIN_REMOTE/$branch..."
  if ! git merge --no-edit "$ORIGIN_REMOTE/$branch"; then
    echo
    echo "Conflict merging '$branch'. Resolve it, then run:"
    echo "  git add <resolved files> && git merge --continue"
    echo "...and re-run this script to continue with the remaining branches."
    exit 1
  fi
done

echo
echo "All branches merged cleanly into $COMBINED_BRANCH."

if [[ "$PUSH" == true ]]; then
  echo "Pushing to $ORIGIN_REMOTE/$COMBINED_BRANCH..."
  git push "$ORIGIN_REMOTE" "$COMBINED_BRANCH"
else
  echo "Review the result, then push with:"
  echo "  git push $ORIGIN_REMOTE $COMBINED_BRANCH"
fi
