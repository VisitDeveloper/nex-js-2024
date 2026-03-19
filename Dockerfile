###
# Build stage
###
FROM node:20-alpine AS builder

WORKDIR /app

# Make npm installs more resilient in CI/build agents.
ENV npm_config_fetch_retries=5
ENV npm_config_fetch_retry_mintimeout=20000
ENV npm_config_fetch_retry_maxtimeout=120000
ENV npm_config_fetch_timeout=600000
ENV npm_config_progress=false

# Install dependencies first for layer caching.
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# Copy source and build.
COPY . .

# Rewrites are resolved from env in next.config.mjs.
ARG API_BASE_URL
ENV API_BASE_URL=${API_BASE_URL}

RUN npm run build

###
# Runtime stage
###
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run as non-root.
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Next standalone output.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# API target for rewrites inside container (override in compose/env as needed).
ENV API_BASE_URL=http://host.docker.internal:1337/api

EXPOSE 3000

USER nextjs

CMD ["node", "server.js"]

