# Deploy (GitHub Actions → VPS)

Build runs on GitHub (fast). The VPS only extracts the standalone bundle and reloads PM2 — no `yarn build` on the server.

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [ci.yml](.github/workflows/ci.yml) | PR + push to `development` | lint, typecheck, build |
| [deploy.yml](.github/workflows/deploy.yml) | push to `master` / `main`, or manual | build artifact + SSH deploy |

## New VPS (one-time)

On the **new server**, as the same Linux user you will put in `SSH_USER`:

```bash
# Copy scripts/bootstrap-server.sh to the server, or paste its contents, then:
export DEPLOY_PATH=/websites/brain-wave/brainwave-academy   # must match GitHub secret
bash bootstrap-server.sh "$DEPLOY_PATH"

cd "$DEPLOY_PATH"
nano .env   # copy from .env.example — runtime secrets only
```

Add the deploy public key to `~/.ssh/authorized_keys` (see SSH key section below).

Get the host fingerprint for GitHub (optional but recommended on a new IP):

```bash
ssh-keyscan -p 22 -t ed25519 YOUR_SERVER_IP
# Add the sha256 line as secret SSH_FINGERPRINT (or leave unset to skip pinning)
```

## One-time server setup (manual)

```bash
# Must match GitHub secret DEPLOY_PATH
export DEPLOY_PATH=/websites/brain-wave/brainwave-academy

sudo mkdir -p "$DEPLOY_PATH/releases"
sudo chown -R "$USER:$USER" "$DEPLOY_PATH"

cd "$DEPLOY_PATH"
nano .env   # copy from .env.example — runtime secrets only
```

Install Node 20 + PM2 (required — GitHub SSH has no login shell, so `pm2` must exist globally):

```bash
# as the same user as SSH_USER
command -v node || curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs
npm install -g pm2
pm2 startup   # follow printed instructions
source ~/.bashrc
command -v pm2   # must print a path
```

CI uses `scripts/server-deploy.sh`, which loads `nvm` / `npm prefix -g` if `pm2` is not in the default PATH.

### `.env` on the server (not in Git)

Keep this file in `/websites/brain-wave/brainwave-academy/.env`. CI copies it into each release; it is never overwritten by the tarball.

Required at runtime (see [.env.example](.env.example)):

- `JWT_SECRET`
- `STRAPI_API_URL` / `STRAPI_API_TOKEN`
- `STRIPE_*`, `BRAINWAVE_CHECKOUT_WEBHOOK_SECRET`
- `HCAPTCHA_SECRET_KEY` (if used)

`NEXT_PUBLIC_*` values are baked in at **build time** in GitHub Actions (repository variables below).

## GitHub repository secrets

Settings → Secrets and variables → Actions → **Secrets**:

| Secret | Example |
|--------|---------|
| `SSH_HOST` | VPS IP or hostname |
| `SSH_USER` | `deploy` or `root` |
| `SSH_PRIVATE_KEY` | Private key (full PEM, including `BEGIN`/`END`) |
| `SSH_PORT` | `22` (optional; omit to use 22) |
| `DEPLOY_PATH` | `/websites/brain-wave/brainwave-academy` (or `/root/websites/brain-wave/brainwave-academy`) |
| `SSH_FINGERPRINT` | Optional — output of `ssh-keyscan` (host key pinning on new server) |

Workflow **Deploy** fails fast with a clear error if any required secret is missing.

### SSH deploy key (for `SSH_PRIVATE_KEY`)

On your laptop:

```bash
ssh-keygen -t ed25519 -C "github-actions-bwe-academy" -f ~/.ssh/bwe_academy_deploy -N ""
```

- Private key file → GitHub secret `SSH_PRIVATE_KEY` (entire PEM, newlines included)
- `ssh-copy-id -i ~/.ssh/bwe_academy_deploy.pub SSH_USER@SSH_HOST`

## GitHub repository variables (optional)

Settings → Secrets and variables → Actions → **Variables** — override defaults from [deploy.yml](.github/workflows/deploy.yml):

| Variable | Default |
|----------|---------|
| `API_BASE_URL` | `https://api.bwaveedu.com/api` |
| `NEXT_PUBLIC_SITE_URL` | `https://bwaveedu.com` |
| `NEXT_PUBLIC_BASE_API_URL_CLIENT` | `https://api.bwaveedu.com/api` |
| `NEXT_PUBLIC_BASE_API_URL_SERVER` | `https://api.bwaveedu.com` |
| `NEXT_PUBLIC_BASE_IMAGE_URL` | `https://api.bwaveedu.com` |
| `NEXT_PUBLIC_BASE_URL` | `https://bwaveedu.com` |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | empty |

## Manual deploy

Actions → **Deploy** → **Run workflow**.

## Local production test (optional)

```bash
npm ci
npm run build
./scripts/prepare-standalone.sh
cd .next/standalone
cp ../../.env .env   # if you have one
node server.js
```

## Nginx / port

PM2 listens on **port 3004** (`PORT` in [ecosystem.config.cjs](ecosystem.config.cjs)). Point Nginx/reverse proxy to `127.0.0.1:3004`.

## Troubleshooting: `production-start-no-build-id`

This means PM2 is **not** running the CI standalone bundle. It is still using the old git tree (`node_modules/next` + `next start`) instead of `current/server.js`.

On the server, fix once:

```bash
cd /websites/brain-wave/brainwave-academy   # or /root/websites/brain-wave/brainwave-academy

pm2 delete bwe-acad bwe-academy 2>/dev/null || true
pm2 list

# After a successful GitHub Deploy workflow:
ls -la current/server.js current/.next/BUILD_ID

cd current
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 logs bwe-academy --lines 30
```

Do **not** run `yarn build` / `next start` in the repo root for production — only GitHub Actions builds; the server runs `current/` (standalone).
