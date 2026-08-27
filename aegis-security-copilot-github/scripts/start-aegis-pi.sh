#!/bin/sh
set -eu

DATA_DIR="${AEGIS_DATA_DIR:-/data/wrangler}"
WRANGLER="/app/node_modules/wrangler/bin/wrangler.js"

mkdir -p "$DATA_DIR" /data/registry /tmp/wrangler-logs

node "$WRANGLER" d1 migrations apply DB \
  --local \
  --config /app/wrangler.pi.jsonc \
  --persist-to "$DATA_DIR"

exec node "$WRANGLER" dev \
  --local \
  --config /app/wrangler.pi.jsonc \
  --persist-to "$DATA_DIR" \
  --ip 0.0.0.0 \
  --port 3000 \
  --log-level warn \
  --show-interactive-dev-session=false
