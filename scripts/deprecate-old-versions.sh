#!/usr/bin/env bash
# Deprecate all old <2.0.0 versions on npm with a "Pivoted to React+TS in v2.2.2" message.
#
# Usage:
#   export NPM_TOKEN="npm_xxx..."   # do NOT commit; rotate after use
#   ./scripts/deprecate-old-versions.sh
#
# Requires: npm CLI, network. Idempotent (npm deprecate is a no-op if already deprecated).

set -euo pipefail

if [[ -z "${NPM_TOKEN:-}" ]]; then
  echo "ERROR: NPM_TOKEN env var not set." >&2
  echo "Run:  export NPM_TOKEN=\"npm_xxx...\"  (then re-run this script)" >&2
  exit 1
fi

# Write a temp .npmrc just for this run, scoped to /tmp.
NPMRC="$(mktemp)"
trap 'rm -f "$NPMRC"' EXIT
cat > "$NPMRC" <<EOF
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
registry=https://registry.npmjs.org/
EOF

# Packages that still exist in 2.2.2 — deprecate everything below 2.0.0.
ALIVE_PKGS=(
  "@neurova/core"
  "@neurova/runtime"
  "@neurova/ai"
  "@neurova/ai-core"
  "@neurova/ai-data"
  "@neurova/ai-ml"
  "@neurova/ai-vision"
  "@neurova/backend"
  "@neurova/cli"
  "@neurova/icons"
  "@neurova/themes"
  "@neurova/ui"
  "@neurova/testing"
  "create-neurova"
  "neurova"
)

# Packages fully removed in v2.2.2 — deprecate every version.
DEAD_PKGS=(
  "@neurova/compiler"
  "@neurova/vite-plugin"
)

ALIVE_MSG="Pivoted to React+TS in v2.2.2. Please upgrade: npm install <pkg>@^2.2.2"
DEAD_MSG="Removed in v2.2.2 React+TS pivot. No replacement — use @neurova/runtime hooks directly."

for pkg in "${ALIVE_PKGS[@]}"; do
  echo ">> deprecating ${pkg}@<2.0.0"
  npm deprecate --userconfig="$NPMRC" "${pkg}@<2.0.0" "$ALIVE_MSG" || echo "   (skipped: ${pkg})"
done

for pkg in "${DEAD_PKGS[@]}"; do
  echo ">> deprecating ${pkg}@*"
  npm deprecate --userconfig="$NPMRC" "${pkg}@*" "$DEAD_MSG" || echo "   (skipped: ${pkg})"
done

echo
echo "Done. Rotate your npm token now: https://www.npmjs.com/settings/analyticswithharry/tokens"
