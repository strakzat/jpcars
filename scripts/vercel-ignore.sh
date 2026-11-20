#!/bin/sh
# Vercel's Ignored Build Step (`ignoreCommand` in vercel.json): exit 0 skips
# the build, exit 1 builds it. Production is the `production` branch, moved by
# .github/workflows/deploy.yml, and a build per push to anything else costs
# build minutes for a deploy nobody asked for. So Vercel builds only:
#
# - `production`, which is the site;
# - a push whose last commit has `[preview]` in its subject (its first line),
#   for a preview link; a body that only mentions the rule builds nothing;
# - a deploy with no git ref (the CLI, a hook), which someone asked for.
#
# Reads Vercel's system variables, so "Automatically expose System Environment
# Variables" stays on in the project's settings.

case "$VERCEL_GIT_COMMIT_REF" in
  production | "") exit 1 ;;
esac

subject=$(printf '%s\n' "$VERCEL_GIT_COMMIT_MESSAGE" | head -n 1)

case "$subject" in
  *"[preview]"*) exit 1 ;;
esac

echo "Skipped: '$VERCEL_GIT_COMMIT_REF' is not production and its commit's subject asks for no [preview]."
exit 0
