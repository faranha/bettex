#!/usr/bin/env bash
# Vercel build entry point. Produces .vercel/output (Build Output API v3).
# Runs the site build gates that do not need a browser (the three Chromium
# steps run in GitHub Actions) and packages the production server + API.
set -euo pipefail
cd "$(dirname "$0")/../.."

# The site build scripts need Python >= 3.12 (stdlib only). The build image's
# default python3 can be older, so prefer a newer interpreter when available.
shim="$(mktemp -d)"
pick=""
for candidate in python3.14 python3.13 python3.12 python3; do
  if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 12) else 1)'; then
    pick="$(command -v "$candidate")"; break
  fi
done
if [ -z "$pick" ]; then
  if ! command -v uv >/dev/null 2>&1; then
    curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="$shim/uv" sh >/dev/null
    export PATH="$shim/uv:$PATH"
  fi
  uv python install 3.13 >/dev/null
  pick="$(uv python find 3.13)"
fi
ln -sf "$pick" "$shim/python3"
ln -sf "$pick" "$shim/python"
export PATH="$shim:$PATH"
echo "Using $(python3 --version) at $pick"

export NODE_ENV=production
export BASE_PATH="${BASE_PATH:-/}"

pnpm --filter @workspace/bettex-site run build:vercel
node scripts/vercel/build-output.mjs
