# Deploy (GitHub Actions → VPS)

Build runs on GitHub (fast). The VPS only extracts the standalone bundle and reloads PM2 — no `yarn build` on the server.

## Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| [ci.yml](.github/workflows/ci.yml) | PR + push to `development` | lint, typecheck, build |
| [deploy.yml](.github/workflows/deploy.yml) | push to `master` / `main`, or manual | build artifact + SSH deploy |

## One-time server setup

```bash
# Must match GitHub secret DEPLOY_PATH
export DEPLOY_PATH=/websites/brain-wave/brainwave-academy

sudo mkdir -p "$DEPLOY_PATH/releases"
sudo chown -R "$USER:$USER" "$DEPLOY_PATH"

cd "$DEPLOY_PATH"
nano .env   # copy from .env.example — runtime secrets only
```

Install Node 20 + PM2 if needed:

```bash
npm i -g pm2
pm2 startup   # follow printed instructions
```

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
| `DEPLOY_PATH` | `/websites/brain-wave/brainwave-academy` |

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

PM2 listens on `PORT` (default **3000** in [ecosystem.config.cjs](ecosystem.config.cjs)). Point reverse proxy to that port (docker-compose used **3004:3000** when containerized).
