# AGENTS.md — Project Conventions

Single source of truth for anyone (human or AI agent) writing code in this repo. `CLAUDE.md` imports this file.
These conventions mirror `identomat-manage-next`; differences are deliberate improvements and are called out.

## 0. CRITICAL — read before every change

**IT IS CRITICAL TO USE THE EXACT SAME CODEBASE PATTERNS. NEVER CREATE A FILE OR FOLDER THAT IS OUT OF CONTEXT. EVERY FILE HAS ITS OWN DESIGNATED FOLDER — USE IT, NO EXCEPTIONS.**

- **Feature-based architecture.** Domain code lives in `src/features/<feature>/<subfolder>/`; cross-feature code in `src/shared/<subfolder>/` (§4). Before creating a file, find the folder it belongs to.
- **The reference implementation is `src/features/notes/`** (+ `src/app/api/notes/`, `src/app/(protected)/notes/`). New features copy its shape — see `/new-feature`.
- Never create `_data/`, `_components/` or any underscore-prefixed folder, and never create one-off helper files or random folders.
- **DESIGN GATE — before any user-facing UI work** read the **Design Direction** block (§22). `STATUS: unset` → ask the design questions first. `STATUS: locked` → follow it exactly, never ask again.
- **No inline styles** (`style={{ }}`), ever. Tailwind classes only.
- **No arbitrary Tailwind values** (`text-[10px]`, `min-h-[400px]`, …). Use the standard scale. (Generated `components/ui/**` is exempt.)
- **No raw structural HTML in `page.tsx`.** Pages compose components; headers, cards, footers etc. are components. The footer lives only in `src/shared/components/layout/footer.tsx`.

## 1. Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 App Router, React 19, **React Compiler on**, **typed routes on**, `output: 'standalone'` |
| Language | TypeScript (strict + `noUncheckedIndexedAccess`) |
| UI | Tailwind CSS 4, shadcn/ui (radix-ui), lucide-react, sonner, next-themes |
| Forms / validation | react-hook-form + Zod 4 + shadcn `Field` |
| State | Zustand 5 — vanilla store + context |
| Data | MongoDB (native `mongodb` driver), Redis (`ioredis`) |
| Auth | bcryptjs passwords, JWT (`jose`) in an httpOnly cookie, sessions in Redis |
| Errors / tracing | Sentry (`@sentry/nextjs`) — disabled when `NEXT_PUBLIC_SENTRY_DSN` is empty |
| Tests | Vitest (unit, node env) + Playwright (e2e) |

## 2. Commands

```bash
npm run dev            # dev server (needs: docker compose up -d mongo redis, and .env)
npm run validate       # typecheck (incl. route typegen) + lint — run before finishing any task
npm run test:run       # all unit tests once        npm test → watch mode
npm run test:cov       # with coverage (cobertura + html in coverage/)
npm run build          # production build (standalone); npm start runs it
npm run e2e            # Playwright against BASE_URL (PW_WEB_SERVER=1 to auto-start the built app)
npx vitest run src/features/notes/service/update-note.service.spec.ts   # one spec
```

Pre-commit (Husky): `npm run typecheck` + `lint-staged` (ESLint on staged files). CI (`.github/workflows/ci.yml`) runs typecheck, lint, unit tests, build, then Playwright against real Mongo + Redis.

## 3. Environment

- Server env is **validated once, lazily** by `src/shared/lib/env.ts` (schema: `src/shared/validations/env.ts`). Read server config via `env.get().X`, never `process.env.X` in feature code. Add new variables to the schema **and** `.env.example`.
- `NEXT_PUBLIC_*` values are inlined at build time; read them via `process.env` (client-safe).
- The build needs no secrets; runtime does (`JWT_SECRET` ≥ 32 chars, `MONGO_URL`, `MONGO_DB_NAME`, `NEXT_PUBLIC_APP_URL`, Redis).

## 4. Folder conventions

Feature folders (`src/features/<feature>/`), each optional:

| Folder | Holds |
|---|---|
| `repository/` | data access (Mongo/Redis). Only services call it. `import 'server-only'`. |
| `service/` | business logic, returns `ServiceResult<T>`. Files end in `.service.ts`. `import 'server-only'`. |
| `store/` | Zustand vanilla store factory |
| `hooks/` | `use<Feature>Store.ts` (store hook) + `use-<action>.ts` (action hooks) |
| `components/` | feature React components, one per file |
| `validations/` | Zod schemas + inferred types |
| `types/` | TypeScript types |
| `utils/` | pure helpers (mappers, parsers) |
| `constants/` | feature constants (always `constants/`, never `const/`) |

Shared (`src/shared/`): `components/` (`ui/` = generated shadcn, `layout/`, `form/`), `hooks/`, `lib/` (infrastructure singletons: env, http, jose, mongo, redis, sentry), `middleware/` (catchAsync, validate, withAuth), `providers/`, `service/` (cross-feature services: readiness, DB indexes), `types/`, `utils/`, `validations/`, `constants/`.

**Never repeat the folder name as a file suffix**: `types/note.ts`, `constants/notes.ts`, `validations/note.ts`, `repository/note.ts` — not `note.types.ts`. Only services keep `.service.ts`.

## 5. Request flow, rendering and auth

**Reads — server first.** Pages are Server Components that call services directly (`listNotesService(...)` in `notes/page.tsx`). No client fetch, no loading flash. `getSession()` is wrapped in React `cache`, so layout + page share one lookup.

**Mutations — through API routes.** Client hook → `http.post('/notes', body)` → `app/api/notes/route.ts` → service → repository. On success the hook calls `router.refresh()` so the server components re-render with fresh data. No Server Actions (consistent with manage-next).

**Stores hold UI state** (dialog open, item being edited, pending flags) — not server data. The auth store is seeded on the server: the root layout passes `initialUser` to `StoreProvider`.

**Auth & sessions**
- Passwords: bcrypt (cost 12) via `shared/utils/password.ts`. Unknown emails still run a bcrypt compare (`DUMMY_PASSWORD_HASH`) so timing doesn't reveal which accounts exist.
- Sign-in: Redis rate limit per IP+email (5 / 15 min → 429) → verify → random `sessionId` stored in Redis (`session:<id>`) → JWT `{ sessionId }` in the httpOnly, `sameSite=lax` `accessToken` cookie.
- Timeouts: **idle** 7 days (Redis TTL, refreshed by every `getSession()`), **absolute** 30 days (JWT + cookie expiry). Logout deletes the Redis session — the JWT alone is never enough.
- `src/proxy.ts` (Node runtime): rejects cross-origin API writes (CSRF → 403) and does a cheap JWT pre-check on `PROTECTED_ROUTES`. The **authoritative** check is `getSession()` in `(protected)/layout.tsx`, the `(auth)` layout (redirects signed-in users away), and `withAuth` for API routes.
- Route groups: `(public)` marketing, `(auth)` sign-in/up, `(protected)` app. Add new protected prefixes to `PROTECTED_ROUTES`.
- Post-login redirects go through `getSafeRedirect()` (relative paths only — no open redirects).

## 6. Type rule

Never use `interface` — always `type`. Never use `any`. Never use `!` non-null assertions.
Mongo documents are typed without `_id` (`NoteDocument`); reads return `WithId<NoteDocument>` (`StoredNote`); the client gets a mapped type with string ids and ISO dates (`Note`) via a `utils/to-<entity>.ts` mapper.

## 7. Repository rules

- `import 'server-only'` first; get collections via `mongo.getCollection<T>('name')`; Redis via `redis` from `shared/lib/redis`.
- Repositories only run queries — no business decisions. Return raw results (`deletedCount`, `null`); the service decides what they mean.
- **Scope by owner in the query** (`{ _id, userId }`), so another user's record is indistinguishable from a missing one (404, never 403).
- Each repository with indexes exposes `ensureIndexes()`; register it in `shared/service/database-indexes.service.ts` (runs on boot from `instrumentation.ts`).

## 8. Service rules

- Always return `{ data, status }` — `ServiceResult<T>` from `@/shared/types/common`.
- Handled cases return an error object (`{ data: { error: 'NOT_FOUND' }, status: 404 }`); never throw for them.
- Never catch dependency errors — let them reach `catchAsync`.
- One exported service function per file.

```ts
export async function deleteNoteService({ userId, noteId }: DeleteNoteServiceParams): Promise<ServiceResult<{ success: true }>> {
  const deletedCount = await noteRepository.deleteForUser(new ObjectId(noteId), new ObjectId(userId));
  if (deletedCount === 0) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: { success: true }, status: 200 };
}
```

## 9. API route rules

Routes are thin controllers:
- Always wrap with `catchAsync` (access log + Sentry + 500 fallback); authenticated routes also with `withAuth` inside it: `catchAsync(withAuth(...))`.
- Validate with `validateBody` / `validateSearchParams` / `validateFormData` / `validateRouteParams` from `@/shared/middleware/validate`; return `validation.error` when `'error' in validation`; destructure `validation.data` only after the guard.
- Dynamic routes type their context with Next's global `RouteContext<'/api/notes/[id]'>`; `params` is a Promise.
- No try/catch in handlers.

```ts
export const PATCH = catchAsync(withAuth<RouteContext<'/api/notes/[id]'>>(async (request, { session }, { params }) => {
  const paramsValidation = await validateRouteParams(params, IdParamsSchema);
  if ('error' in paramsValidation) return paramsValidation.error;
  const bodyValidation = await validateBody(request, NoteInputSchema);
  if ('error' in bodyValidation) return bodyValidation.error;

  const { data, status } = await updateNoteService({ userId: session.user.id, noteId: paramsValidation.data.id, input: bodyValidation.data });
  return NextResponse.json(data, { status });
}));
```

## 10. Service call rule

- **Never use raw `fetch` in feature code.** Client code uses `http` from `@/shared/lib/http` (base `/api`; handles JSON/FormData/blob, 401 → sign-in redirect, Sentry spans and error reporting). Raw `fetch` is allowed only inside `src/shared/lib/`.
- **Never extract endpoint paths into constants.** Write the path inline at the call site: `http.patch(\`/notes/${id}\`, input)`.
- **Never wrap calls in `try/catch` unnecessarily.** Server: let errors reach `catchAsync`. Client action hooks catch only to show UI feedback (toast / store error) — `http` already reported the failure to Sentry.

## 11. Validation rules (Zod 4)

- Schemas live in `features/<feature>/validations/<entity>.ts`; export the schema and its inferred type (`export type NoteInputType = z.infer<typeof NoteInputSchema>`).
- Use Zod 4 APIs: `z.email()`, `z.url()`, `.pipe()`, `.catch()` — not the deprecated `z.string().email()`.
- Reuse shared schemas: `EmailSchema` (trims + lower-cases), `ObjectIdSchema` / `IdParamsSchema`, `PageParamsSchema`.
- The same schema validates the form (client) and the request (server).

## 12. Zustand pattern

Three pieces per store: `store/<feature>-store.ts` (vanilla `createStore` factory, no context), `hooks/use<Feature>Store.ts` (context + hook), registration in `shared/providers/store-provider.tsx`.

```ts
'use client';

import { createContext, useContext } from 'react';
import { useStore, type StoreApi } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

import { type NotesStore } from '@/features/notes/types/note';

export const NotesStoreContext = createContext<StoreApi<NotesStore> | null>(null);

export const useNotesStore = () => {
  const store = useContext(NotesStoreContext);
  if (!store) throw new Error('useNotesStore must be used within StoreProvider');

  return useStore(store, useShallow((state: NotesStore) => ({
    formOpen: state.formOpen,
    openCreate: state.openCreate,
  })));
};
```

Never use a generic selector `(s) => s`; always list fields in `useShallow`; the hook takes no arguments.

## 13. Hook rules

- Store hooks (`use<Feature>Store.ts`) and action hooks (`use-<action>.ts`) are separate files; async logic only in action hooks.
- **Never use `useRouter` in `.tsx` components.** Navigation is an action — wrap it in an action hook. Plain navigation uses `<Link>`.
- React Compiler is on: don't add `useMemo` / `useCallback` / `React.memo` for performance; write plain code.

## 14. Props, state and clean code

- **No props drilling.** Props go at most one level down; deeper data lives in the store and leaf components read it. Callback props (`onConfirm`, `onCancel`) only parent → direct child.
- `useState` only for state private to one component.
- Single responsibility; components over ~100 lines get split; named functions for non-trivial handlers; one abstraction level per JSX return.
- No magic numbers/strings for reused values — put them in `constants/`. Single-use labels and messages stay inline.
- No dead code: no commented-out code, unused exports, unreachable branches.

## 15. Forms

`react-hook-form` + `zodResolver` + shadcn `Field`. Use the shared building blocks — never hand-roll label/input/error markup:

```tsx
const form = useForm<NoteInputType>({ resolver: zodResolver(NoteInputSchema), defaultValues: { title: '', content: '' } });

<form onSubmit={form.handleSubmit(saveNote)} noValidate>
  <FieldGroup>
    <FormTextField control={form.control} name="title" label="Title" />
    <SubmitButton pending={pending} pendingLabel="Saving…">Save</SubmitButton>
  </FieldGroup>
</form>
```

Remount a form with `key` when its defaults change (see `note-form-dialog.tsx`).

## 16. Naming

- Files kebab-case (`use-save-note.ts`); store hook files `use<Feature>Store.ts`.
- Components PascalCase; functions camelCase; constants UPPER_SNAKE_CASE.
- Types PascalCase and **explanatory** — never `Params`, `Data`, `Response`, `Props`. Use `<FunctionName>Params` (`UpdateNoteServiceParams`), `<Feature><Thing>Response` (`NotesListResponse`), `<Component>Props`. Response/DTO types live in `types/`, never inline in a service.

## 17. Imports

Always `@/` for cross-directory imports; only `./` for the same directory; never `../` (exception: root files like `instrumentation-client.ts` importing `../sentry.config`). Import order is enforced by ESLint (`npm run lint:fix`).

## 18. Test conventions

Unit tests: Vitest in node env. The file under test runs for real; its boundaries (repositories, `mongo`, `redis`, `http`, `next/headers`, other services) are mocked with `vi.mock` **factories**. Specs are `.spec.ts`, co-located, and use the `@/` alias in `vi.mock`. Use `/write-tests`.

| Required — never ship without a spec | Not required |
|---|---|
| `app/api/**/route.ts`, `src/proxy.ts` | `components/` |
| `features/*/service/*.ts`, `shared/service/*.ts` | `types/`, static `constants/` |
| `features/*/utils/*.ts`, `shared/utils/*.ts` | `hooks/`, `store/` — unless non-trivial logic |
| `shared/lib/*.ts`, `shared/middleware/*.ts` | `repository/` — unless it does more than forward a query |
| `validations/*.ts` with `refine` / `transform` / `catch` / `pipe` | plain `z.object` schemas |

What to cover — **route**: success, service error passthrough, validation failure, 500. **Service**: happy path + exact `{ data, status }`, every early return, repository arguments (once), side effects *not* happening on failure, dependency errors propagating. **Util/lib**: happy path, empty/missing, boundaries, invalid input.

- Max **180 lines per spec**: dedupe with setup helpers and `it.each` first, then split by behaviour (`<source>-<aspect>.spec.ts`).
- No tests for types, constants or library behaviour. No `expect(true).toBe(true)`.
- `@sentry/nextjs` is mocked globally in `vitest.setup.ts`; `server-only` is aliased to a no-op in `vitest.config.ts`.
- Specs aren't linted, but **are type-checked by `next build`** — keep them type-correct.
- E2E (Playwright, `e2e/`): every spec creates its own user via `makeTestUser()` + the API; signed-in specs reuse `AUTH_STATE_PATH` from `auth.setup.ts`.

## 19. Infrastructure rules

- **`shared/lib` singletons** use class syntax and export one instance (`export const mongo = globalSingleton('mongo', () => new MongoClientManager())`) plus the class (for tests). `globalSingleton` keeps one connection across dev hot reloads. Every `shared/lib` file has a spec.
- Server-only modules (`lib/env|jose|mongo|redis`, repositories, services) start with `import 'server-only'`.
- Health: `/api/health` = liveness (no dependencies); `/api/ready` = readiness (Mongo + Redis, 2 s timeout each, 503 when down).
- Docker: standalone image, non-root user, `HEALTHCHECK` on `/api/health`, port 8080.

### Sentry

| Path | Captured by |
|---|---|
| Unhandled server/render errors | `onRequestError = Sentry.captureRequestError` in `src/instrumentation.ts` |
| API route 500s | `catchAsync` |
| Client render errors | `src/app/error.tsx`, `src/app/global-error.tsx` (`reportBoundaryError`) |
| `http` failures (non-401) | `http.ts` via `sendHttpErrorToSentry` — never report them again at the call site |
| Handled client errors (caught `try/catch` that shows friendly UI, not `http`) | `sendClientErrorToSentry(error, { source, reason?, details? })` |
| Handled server errors (best-effort side effects) | `sendServerErrorToSentry(error, { source })` |

`source` must be a stable, low-cardinality tag (`'video-call'`, not a message). Reporters are fire-and-forget: never `await` or wrap them. Sentry v11 note: `withSentryConfig` is imported from `@sentry/nextjs/config`.

## 20. Code size & single responsibility (HARD RULES)

- **Max 180 lines per file**, specs included (ESLint hard-stops at 200). Generated `components/ui/**` is exempt.
- **One file = one exported function/component/hook/class/service.** Exception: `utils/`, `constants/` and `shared/lib` may group one theme per file (e.g. `shared/utils/date.ts`), with one spec covering it.
- **No duplicated code.** Search for an existing helper first; extract repeats to `shared/` or the feature's `utils/`.
- **No dead code.**
- Run the `code-standards` skill on changed files before finishing.

## 21. User-facing text

When implementing a ticket/story, use its user-facing text **exactly** — never rewrite, paraphrase, translate or "improve" it. Only invent text when none is given; keep it simple and consistent, and say in your summary that it was inferred.

## 22. Design Direction (per-project brand)

This repo is a **template**: every project built from it must look different. This is the mechanism.

**Flow (ask once, save, never ask again):**
1. Before any UI work, read the block below.
2. `STATUS: unset` → ask the four design questions in one AskUserQuestion call. Write no UI code first.
3. Fill every field, set `STATUS: locked`. Also update `APP_NAME` / `APP_DESCRIPTION` in `src/shared/constants/app.ts`.
4. `STATUS: locked` → follow it exactly for all UI.

**New project from the template:** set `STATUS: unset` (done by `/init-project`).

**Design questions:**
1. **Product** — dev/technical tool · SaaS dashboard / B2B · consumer app · creative/editorial
2. **Palette** — monochrome + one electric accent · deep & moody + neon accent · warm & earthy · clean & trustworthy blue (capture hex values)
3. **Type** — geometric sans · editorial serif display + sans body · mono/technical · humanist & friendly (name display + body faces)
4. **Feel** — minimal & calm · balanced · maximal & animated

**Where answers go (do not improvise locations):**
- Palette → CSS custom properties in `src/app/globals.css` (`:root` + `.dark`), hex converted to `oklch(...)`. `--primary`/`--ring`/`--chart-*` = accent; neutrals for surfaces. Accent only for actions, focus and positive signal.
- Type → `next/font/google` in `src/app/layout.tsx`, mapped to `--font-heading` / `--font-sans` / `--font-mono` in `@theme inline` in `globals.css`; `h1,h2,h3` use `font-heading`.
- Motion → keyframe utilities in `@layer utilities` in `globals.css` (e.g. `.animate-rise` + stagger), always guarded by `prefers-reduced-motion`.

### Active Design Direction

```
STATUS: locked
Product:    SaaS dashboard / B2B
Palette:    Monochrome + electric indigo accent
            base #FAFAFA (light) / #0A0A0A (dark); accent #5B5BFF
            tokens: --primary oklch(0.555 0.243 271) light / oklch(0.62 0.21 271) dark
Type:       Geometric sans — Space Grotesk (display, 500/600/700) + Inter (body) + Geist Mono (data)
Feel:       Balanced — CSS load-rise stagger + hover micro-interactions; reduced-motion respected
Signature:  Left-aligned typographic hero with one accent word + honest stat strip;
            dashboard app-shell with mobile drawer sidebar and segmented indigo channel meters
```
