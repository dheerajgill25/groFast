# Multi-stage image for grofast-core and its two sibling processes.
#
# Per 02b §3, the API (core), the realtime gateway, and the worker pool are the
# SAME codebase run with different entrypoints. So this builds ONE image; the
# three roles are selected at runtime via GROFAST_PROCESS (see docker-entrypoint.sh).
# Three byte-identical images would triple registry storage and scan time for
# zero benefit — k8s just sets the env per Deployment.
#
# (The customer web image is a separate Dockerfile added when the Next.js app
# lands in E06-Th02; there is no web app to containerise yet.)

# ---- deps: resolve the workspace with a frozen lockfile --------------------
FROM node:22-alpine AS deps
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /repo

# Only the manifests first, so the dependency layer caches across source edits.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/types/package.json          packages/types/
COPY packages/contracts/package.json      packages/contracts/
COPY packages/design-system/package.json  packages/design-system/
COPY code/backend/package.json            code/backend/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ---- build: compile the workspace, then produce a pruned prod bundle -------
FROM deps AS build
WORKDIR /repo
COPY . .
RUN pnpm --filter @grofast/core... build
# `pnpm deploy` writes a self-contained dir with only @grofast/core's prod deps.
RUN pnpm --filter @grofast/core --prod deploy /prod/backend

# ---- runtime: minimal, non-root ------------------------------------------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production
# Run as the built-in unprivileged `node` user, never root (ASVS L2 / NFR-5).
WORKDIR /app
COPY --from=build --chown=node:node /prod/backend ./
COPY --chown=node:node code/backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER node
EXPOSE 3000 3100
# Liveness: the health controller is dependency-free by design (see T01), so a
# failing probe means the process is actually dead, not that a downstream blipped.
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-3000}/healthz" || exit 1

ENTRYPOINT ["docker-entrypoint.sh"]
