# ============================================================
# Dockerfile — ngodingpakeprd
# Multi-stage build: Builder + Runner (minimal image)
# Optimized for Coolify / self-hosted Docker deploy
# ============================================================

# Stage 1: Dependencies
FROM node:22-slim AS deps
WORKDIR /app

# Install ca-certificates to ensure secure and reliable TLS connections
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./

# Prevent ECONNRESET & network timeouts on VPS/Coolify:
# - Limit concurrent sockets to 2 (avoids connection drops from npm registry)
# - Set generous fetch retry and network timeouts
# - Fallback to npm install with npmmirror if registry.npmjs.org drops connection
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000 && \
    npm config set maxsockets 2 && \
    (npm ci --legacy-peer-deps --no-audit --no-fund || \
     npm install --legacy-peer-deps --no-audit --no-fund || \
     npm install --legacy-peer-deps --no-audit --no-fund --registry=https://registry.npmmirror.com)

# ============================================================
# Stage 2: Builder
FROM node:22-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args untuk Next.js client-side public environment
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ============================================================
# Stage 3: Runner (image production ringan berbasis Debian slim)
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Buat user non-root untuk keamanan
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 -g nodejs nextjs

# Copy file hasil build standalone Next.js
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Jalankan Next.js standalone server
CMD ["node", "server.js"]
