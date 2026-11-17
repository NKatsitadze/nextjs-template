Turn this template into a new project. Run once, right after cloning. Work through every step; ask only where marked.

---

## Step 1 — Ask (one AskUserQuestion call)

- Project name (human) and package name (kebab-case)
- One-line description
- Keep the `notes` reference feature? (default: remove it once the first real feature exists — keeping it for now is fine)
- Git hosting: GitLab (identomat default) or GitHub — decides whether `.github/` stays

## Step 2 — Rename

- `package.json` → `name`, reset `version` to `0.1.0`
- `src/shared/constants/app.ts` → `APP_NAME`, `APP_DESCRIPTION`
- `docker-compose.yml` → default `MONGO_DB_NAME`
- `README.md` → title and intro

## Step 3 — Environment

- `cp .env.example .env`
- Generate `JWT_SECRET` with `openssl rand -hex 32` and write it into `.env` (never into `.env.example`)
- Set `SENTRY_PROJECT` in `.env` if the user has one; otherwise leave Sentry disabled (empty DSN)

## Step 4 — Design reset

In AGENTS.md → "Design Direction", set `STATUS: unset`. The next UI task will run the design questions and lock a fresh identity — do not restyle anything now.

## Step 5 — Optional removals

- Removing `notes`: delete `src/features/notes/`, `src/app/api/notes/`, `src/app/(protected)/notes/`, `e2e/notes/`; remove it from `store-provider.tsx`, `database-indexes.service.ts` (+ spec), `PROTECTED_ROUTES`, `navigation.ts` and the sidebar icon map.
- GitLab project: delete `.github/` and tell the user a `.gitlab-ci.yml` should mirror `.github/workflows/ci.yml` (validate job + e2e job with mongo/redis services).

## Step 6 — Verify

```bash
npm install && npm run validate && npm run test:run && npm run build
```

Report what changed. Do not commit — the user makes the first commit.
