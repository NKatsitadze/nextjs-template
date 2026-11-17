# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
RUN apk upgrade --no-cache libcrypto3 libssl3

FROM base AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Git hooks are irrelevant inside the image
ENV HUSKY=0

COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --no-fund

ARG NEXT_PUBLIC_GIT_HASH
ARG NEXT_PUBLIC_APP_VERSION
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_SENTRY_ENVIRONMENT
ARG NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE
ARG NEXT_PUBLIC_SENTRY_PROFILES_SAMPLE_RATE
ARG SENTRY_PROJECT
ARG SENTRY_AUTH_TOKEN
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/api/health || exit 1

CMD ["node", "server.js"]
