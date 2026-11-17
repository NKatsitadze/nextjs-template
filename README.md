# Next.js Starter

Production-ready Next.js 16 template for new projects, aligned with the conventions of `identomat-manage-next`: feature-based architecture, thin API routes over services and repositories, Zustand stores, strict lint and typing, Sentry, and a full unit + e2e test setup.

## Stack

Next.js 16 (App Router, React Compiler, typed routes) · React 19 · TypeScript 6 (strict) · Tailwind CSS 4 · shadcn/ui · Zod 4 · react-hook-form · Zustand 5 · MongoDB (native driver) · Redis (ioredis) · jose + bcryptjs · Sentry · Vitest · Playwright

## Quick start

Requires Node 22.12+ (24 LTS recommended, see `.nvmrc`) and Docker.

```bash
npm install
cp .env.example .env                      # then set JWT_SECRET: openssl rand -hex 32
docker compose up -d mongo redis          # local MongoDB + Redis
npm run dev                               # http://localhost:3000
```

Create an account at `/sign-up`; you land on `/dashboard`, and `/notes` is the reference CRUD feature.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run validate` | Route typegen + typecheck + ESLint (run before every PR) |
| `npm run test:run` / `npm test` | Unit tests once / in watch mode |
| `npm run test:cov` | Unit tests with coverage (`coverage/`, `junit.xml`) |
| `npm run build` / `npm start` | Standalone production build / run it |
| `npm run e2e` / `npm run e2e:ui` | Playwright against `BASE_URL` (`PW_WEB_SERVER=1` starts the built app for you) |

Husky runs typecheck + lint on staged files before each commit.

## Project structure

```
src/
  app/                 routes only: (public) marketing, (auth) sign-in/up, (protected) app, api/
  features/<feature>/  repository · service · store · hooks · components · validations · types · utils · constants
  shared/              cross-feature: components (ui = shadcn), lib (env, http, mongo, redis, jose, sentry),
                       middleware (catchAsync, validate, withAuth), service, utils, validations, …
  proxy.ts             CSRF guard for API writes + fast auth pre-check for protected pages
  instrumentation*.ts  Sentry init, Mongo index bootstrap
e2e/                   Playwright specs
```

Conventions — architecture, naming, testing, Sentry usage and the per-project design gate — are in **[AGENTS.md](AGENTS.md)**. `CLAUDE.md` imports it and lists the Claude Code commands in `.claude/`.

## Built in

- **Auth**: bcrypt passwords, JWT in an httpOnly cookie backed by a Redis session (7-day idle / 30-day absolute timeout), per-IP+email rate limiting, constant-time unknown-user handling, safe post-login redirects.
- **Security**: CSRF origin check on API writes, security headers (HSTS in production, `X-Frame-Options`, `nosniff`, referrer and permissions policies), `server-only` boundaries, validated env.
- **Ops**: `/api/health` (liveness) and `/api/ready` (Mongo + Redis readiness), structured access log per API request, Sentry errors/tracing/profiling (off until a DSN is set), standalone non-root Docker image with healthcheck.
- **Quality gates**: strict type-aware ESLint (180/200-line limits, import order, no `any`), co-located specs for every route/service/util/lib, Playwright e2e, GitHub Actions CI, Dependabot.

## Starting a new project from this template

Run `/init-project` in Claude Code, or by hand:

1. Rename: `package.json` `name`, `APP_NAME` / `APP_DESCRIPTION` in `src/shared/constants/app.ts`, this README.
2. `cp .env.example .env` and generate a `JWT_SECRET`.
3. In `AGENTS.md` → Design Direction, set `STATUS: unset` so the first UI task defines a new visual identity.
4. Optionally delete the `notes` example once you have a real feature (see `.claude/commands/init-project.md` for the full list of places).
5. On GitLab: replace `.github/` with an equivalent `.gitlab-ci.yml`.

## Deployment

```bash
docker build -t my-app .
docker run -p 3000:8080 --env-file .env my-app
```

The image reads all configuration at runtime. Pass `NEXT_PUBLIC_*`, `SENTRY_PROJECT` and `SENTRY_AUTH_TOKEN` as build args to bake public values and upload source maps.
