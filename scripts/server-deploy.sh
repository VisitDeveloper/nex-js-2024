#!/usr/bin/env bash
# Run on the VPS (non-interactive SSH). Requires: tar extract done, cwd = $DEPLOY_PATH/current
set -euo pipefail

load_node_path() {
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  if [[ -s "$NVM_DIR/nvm.sh" ]]; then
    # shellcheck source=/dev/null
    . "$NVM_DIR/nvm.sh"
  fi
  for f in "$HOME/.profile" "$HOME/.bashrc" "$HOME/.bash_profile"; do
    if [[ -s "$f" ]]; then
      # shellcheck source=/dev/null
      . "$f"
    fi
  done
  if [[ -d "$HOME/.nvm/versions/node" ]]; then
    local node_ver
    node_ver="$(ls -1 "$HOME/.nvm/versions/node" 2>/dev/null | sort -V | tail -1)"
    export PATH="$HOME/.nvm/versions/node/${node_ver}/bin:$PATH"
  fi
  export PATH="$HOME/.local/bin:$HOME/.npm-global/bin:/usr/local/bin:$PATH"
}

resolve_pm2() {
  if command -v pm2 >/dev/null 2>&1; then
    command -v pm2
    return 0
  fi
  if command -v npm >/dev/null 2>&1; then
    local gbin
    gbin="$(npm prefix -g 2>/dev/null)/bin/pm2"
    if [[ -x "$gbin" ]]; then
      echo "$gbin"
      return 0
    fi
  fi
  return 1
}

load_node_path
PM2_BIN="$(resolve_pm2)" || {
  echo "pm2 not found. On the server run once (as SSH_USER):" >&2
  echo "  npm install -g pm2 && pm2 startup" >&2
  exit 127
}

exec "$PM2_BIN" "$@"
