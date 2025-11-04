# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20.18.0

FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /app

ENV PNPM_HOME="/pnpm" \
    PATH="${PNPM_HOME}:$PATH"

RUN corepack enable pnpm


# -----------------------------------------
# Install dependencies (shared by all stages)
# -----------------------------------------
FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile


# -----------------------------------------
# Development image (hot reload)
# -----------------------------------------
FROM deps AS development

COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host", "0.0.0.0", "--port", "5173"]


# -----------------------------------------
# Build application
# -----------------------------------------
FROM deps AS builder

COPY . .

RUN pnpm build


# -----------------------------------------
# Optional test stage (enable via `--target test`)
# -----------------------------------------
FROM builder AS test

ENV NODE_ENV=test

RUN pnpm lint && pnpm test


# -----------------------------------------
# Production runtime
# -----------------------------------------
FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /app

ENV NODE_ENV=production \
    PNPM_HOME="/pnpm" \
    PATH="${PNPM_HOME}:$PATH"

RUN apk add --no-cache dumb-init && corepack enable pnpm

COPY --from=deps /pnpm /pnpm
COPY --from=builder /app/dist ./dist
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --frozen-lockfile

EXPOSE 4173

CMD ["dumb-init", "pnpm", "preview", "--host", "0.0.0.0", "--port", "4173"]

