#!/usr/bin/env bash
# Builds the app in several variants and runs Lighthouse (mobile, 3 runs) on each,
# against the real basemap. Used on GitHub runners, which can reach the tile host.
# Each variant gets its own port and server process, and the page is checked to
# come from that build before measuring.
set -uo pipefail
export CHROME_PATH=${CHROME_PATH:-$(which google-chrome)}
port=3300
run() {
  local label=$1 env=$2 path=$3
  port=$((port + 1))
  echo "===== $label (env: ${env:-none}, path: $path, port: $port)"
  rm -rf .next
  env $env npm run build > /tmp/build.log 2>&1 || { echo "build failed"; tail -20 /tmp/build.log; return; }
  local build_id
  build_id=$(cat .next/BUILD_ID)
  node node_modules/next/dist/bin/next start -p "$port" > "/tmp/next-$port.log" 2>&1 &
  local pid=$!
  for _ in $(seq 1 30); do curl -sf "http://localhost:$port/" > /dev/null && break; sleep 1; done
  if ! curl -s "http://localhost:$port/" | grep -q "$build_id"; then
    echo "server is not serving build $build_id"; kill "$pid"; return
  fi
  node scripts/lighthouse.mjs "http://localhost:$port$path" 3 || true
  kill "$pid"; wait "$pid" 2>/dev/null
}
run "current"            ""                                "/"
run "no-thai-font-faces" "NEXT_PUBLIC_THAI_FONT_FACES=off" "/"
run "no-overlays"        ""                                "/?l="
run "no-font-no-overlay" "NEXT_PUBLIC_THAI_FONT_FACES=off" "/?l="
