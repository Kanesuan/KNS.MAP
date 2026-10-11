#!/usr/bin/env bash
# Builds the app in several variants and runs Lighthouse (mobile, 3 runs) on each,
# against the real basemap. Used on GitHub runners, which can reach the tile host.
set -uo pipefail
export CHROME_PATH=${CHROME_PATH:-$(which google-chrome)}
run() {
  local label=$1 env=$2 path=$3
  echo "===== $label (env: ${env:-none}, path: $path)"
  rm -rf .next
  env $env npm run build > /dev/null 2>&1 || { echo "build failed"; return; }
  npx next start -p 3300 > /tmp/next.log 2>&1 &
  local pid=$!
  sleep 5
  node scripts/lighthouse.mjs "http://localhost:3300$path" 3 || true
  kill $pid; wait $pid 2>/dev/null
}
run "current"            ""                                "/"
run "no-thai-font-faces" "NEXT_PUBLIC_THAI_FONT_FACES=off" "/"
run "no-overlays"        ""                                "/?l="
run "no-font-no-overlay" "NEXT_PUBLIC_THAI_FONT_FACES=off" "/?l="
