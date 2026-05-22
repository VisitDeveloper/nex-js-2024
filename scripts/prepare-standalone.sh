#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .next/standalone/server.js ]]; then
  echo "Missing .next/standalone/server.js — run 'npm run build' first." >&2
  exit 1
fi

cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

echo "Standalone bundle ready: $ROOT/.next/standalone"
