#!/usr/bin/env bash
# One-time setup on a NEW VPS (run as SSH_USER, same user GitHub Actions uses).
set -eo pipefail

DEPLOY_PATH="${1:-/websites/brain-wave/brainwave-academy}"

echo "==> Deploy path: $DEPLOY_PATH"
mkdir -p "$DEPLOY_PATH/releases"
touch "$DEPLOY_PATH/.deploy-ready"

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "==> Node: $(node -v)"

if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> Installing PM2 globally..."
  npm install -g pm2
  pm2 startup || true
fi

echo "==> PM2: $(command -v pm2)"

if [[ ! -f "$DEPLOY_PATH/.env" ]]; then
  echo "==> Create $DEPLOY_PATH/.env from .env.example before the first deploy."
fi

echo "==> Server ready for GitHub Actions deploy."
echo "    Set secret DEPLOY_PATH=$DEPLOY_PATH"
echo "    Nginx should proxy to 127.0.0.1:3004 after first successful deploy."
