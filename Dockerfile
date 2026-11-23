# Production image for the CUA Engineering, Physics, and Computing site.
#
# The Next.js app lives in web/, so every path here is relative to the repository
# root. Build from the repository root:
#
#   docker build -t cua-coe-web .
#   docker run -p 3000:3000 --rm cua-coe-web
#
# Production, with indexing deliberately enabled:
#
#   docker build --build-arg NOINDEX=false -t cua-coe-web .
#
# Optional build args:
#   NEXT_PUBLIC_SITE_URL  canonical origin for metadata, OG cards and the sitemap.
#                         Defaults in code to https://engineering.catholic.edu,
#                         which is correct for production. Set it to the staging
#                         host only for a staging image.
#   NOINDEX               Whether crawlers may index this build. The default is
#                         "true": an image built without arguments is treated as
#                         a mirror, which is the safe mistake. A production
#                         deploy must pass --build-arg NOINDEX=false on purpose.
#
# The platform's own .dockerignore applies during published builds and excludes
# node_modules, .git and .env files, so dependencies are installed inside the
# image and nothing local leaks in.

# --- deps + build ------------------------------------------------------------
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Copy the lockfile first so a source-only change reuses the installed layer.
COPY web/package.json web/package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY web/ ./

ARG NEXT_PUBLIC_SITE_URL=https://engineering.catholic.edu
ARG NOINDEX=true
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NOINDEX=$NOINDEX \
    NEXT_TELEMETRY_DISABLED=1

# `output: "standalone"` in next.config.ts emits .next/standalone with a traced
# server.js containing only the modules the app imports.
RUN npm run build

# --- runtime -----------------------------------------------------------------
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# next/nodejs group ids are the conventional ones for Next.js images.
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

# Standalone output omits these two directories; the app needs both at runtime.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# The publish pipeline checks deploy.healthPath (GET /api/health) for readiness.
# No HEALTHCHECK is declared here on purpose: the platform owns readiness, and a
# second definition can disagree with it during rollout.
CMD ["node", "server.js"]
