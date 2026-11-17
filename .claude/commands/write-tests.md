Write unit tests for the file(s) in `$ARGUMENTS`, following this project's exact testing conventions (AGENTS.md → "Test conventions").

If no argument is given, use the files changed on this branch (`git status --short` + `git diff --name-only origin/main...HEAD`) that require a spec but have none.

The reference specs to copy from are in `src/features/notes/` and `src/app/api/notes/`.

---

## Which files need a spec

Required: `app/api/**/route.ts`, `features/*/service/*.ts`, `features/*/utils/*.ts`, `shared/utils/*.ts`, `shared/lib/*.ts`, `shared/middleware/*.ts`, `shared/service/*.ts`, `src/proxy.ts`, and `validations/*.ts` that use `refine` / `superRefine` / `transform` / `catch` / `pipe`.

Only when non-trivial: `store/`, `hooks/`, `repository/`. Never: components, types, static constants.

---

## Route spec (`route.spec.ts`)

The route runs for real (including `catchAsync`); its boundaries are mocked.

```ts
import { NextResponse } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const session = vi.hoisted(() => ({
  sessionId: 'sid',
  user: { id: 'u1', name: 'Ana', email: 'ana@example.com', role: 'user' as const },
  createdAt: 1,
}));

vi.mock('@/shared/middleware/with-auth', () => ({
  withAuth: vi.fn((handler: (...args: unknown[]) => unknown) => (request: Request, context: unknown) =>
    handler(request, { session }, context)),
}));
vi.mock('@/shared/middleware/validate', () => ({
  validateBody: vi.fn(async (request: Request) => ({ data: (await request.json()) as unknown })),
}));
vi.mock('@/features/<feature>/service/<name>.service', () => ({ <serviceFn>: vi.fn() }));

import { <serviceFn> } from '@/features/<feature>/service/<name>.service';
import { validateBody } from '@/shared/middleware/validate';

import { POST } from './route';
```

Cover, per handler:
- success: the service gets the right arguments (incl. `session.user.id`) and its `{ data, status }` is returned
- service error passthrough (e.g. 404/409 returned as-is)
- validation failure: `vi.mocked(validateBody).mockResolvedValueOnce({ error: NextResponse.json({}, { status: 400 }) })` → 400 and the service is **not** called
- the 500 path: the service rejects → 500 (this exercises `catchAsync`)

Silence `catchAsync`'s access log in `beforeEach`: `vi.spyOn(console, 'log').mockImplementation(() => undefined)` (same for `console.error`). Dynamic routes receive `{ params: Promise.resolve({ id: '...' }) }` as the second argument.

---

## Service spec (`*.service.spec.ts`)

Mock the **repository** (never `mongo`/`redis` directly) with a factory, so the real module is never loaded:

```ts
vi.mock('@/features/notes/repository/note', () => ({ noteRepository: { updateForUser: vi.fn() } }));
```

Cover:
- the happy path and the exact `{ data, status }` returned
- every early return (`404`, `409`, `429`, …)
- the arguments sent to the repository — assert once, in the happy-path test
- side effects (session writes, cookies, counters) **not** happening when the main operation fails
- a repository rejection propagating (`rejects.toThrow`) — services never catch

Use real `ObjectId`s from `mongodb` for ids; use `expect.any(Date)` for timestamps.

---

## Util / shared lib / middleware spec

- happy path, empty/missing input, boundary values, invalid input
- collapse input→output variations into `it.each` tables
- `shared/lib` singletons: test the exported class with a fresh instance per test (`new MongoClientManager()`), mocking the driver module (`vi.mock('mongodb', …)`, `vi.mock('ioredis', …)`) and `@/shared/lib/env`
- environment: `vi.stubEnv` / `vi.unstubAllEnvs`; time: `vi.useFakeTimers` / `vi.setSystemTime`

`@sentry/nextjs` is already mocked globally in `vitest.setup.ts` — assert on it with `vi.mocked(Sentry.captureException)`; don't re-mock it.

---

## Rules

- `.spec.ts` co-located with the source; `vi.mock('@/…')` paths always use the `@/` alias
- max 180 lines per spec — first remove duplication (setup helpers, `it.each`), then split by behaviour into `<source>-<aspect>.spec.ts`
- no tests for types, constants, or library behaviour; no `expect(true).toBe(true)`
- `vi.clearAllMocks()` in `beforeEach`; reset any `mockResolvedValue` defaults there too

---

## Steps

1. Read the target file fully and identify its kind (route / service / util / lib / middleware).
2. Write the complete spec — no placeholders or TODOs.
3. Run `npx vitest run <spec path>` and fix failures.
4. Run `npx tsc --noEmit -p tsconfig.json` — ESLint skips specs, but `next build` type-checks them.
