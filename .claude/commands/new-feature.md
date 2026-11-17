Scaffold a new feature named `$ARGUMENTS` end to end, mirroring the reference feature in `src/features/notes/` exactly. If no name was given, ask for one (kebab-case, plural for collections — e.g. `projects`, `api-keys`).

---

## Step 1 — Understand the feature

Ask (one AskUserQuestion call) only for what you cannot infer:
- the entity's fields and which are required / editable
- who owns a record (per-user like notes, or shared) and who may change it
- which operations are needed (list / create / update / delete / detail page)

If the feature has UI, also check the **Design Direction** block in AGENTS.md first (design gate).

---

## Step 2 — Create the files (copy the notes pattern, rename consistently)

| Layer | Path (`<f>` = feature, `<e>` = entity) | Notes reference |
|---|---|---|
| Types | `features/<f>/types/<e>.ts` — `<E>Document`, `Stored<E>`, client `<E>`, `<E>Input`, `<Action><E>ServiceParams`, store state/actions | `types/note.ts` |
| Validation | `features/<f>/validations/<e>.ts` | `validations/note.ts` |
| Constants | `features/<f>/constants/<f>.ts` (limits only — single-use values stay inline) | `constants/notes.ts` |
| Repository | `features/<f>/repository/<e>.ts` — `'server-only'`, owner-scoped queries, `ensureIndexes()` | `repository/note.ts` |
| Mapper | `features/<f>/utils/to-<e>.ts` (+ spec) | `utils/to-note.ts` |
| Services | `features/<f>/service/<action>-<e>.service.ts` (+ spec each) | `service/*.service.ts` |
| Routes | `app/api/<f>/route.ts`, `app/api/<f>/[id]/route.ts` (+ spec each) — `catchAsync(withAuth(...))` | `app/api/notes/**` |
| Store | `features/<f>/store/<f>-store.ts` (UI state only) + `hooks/use<F>Store.ts` | `store/notes-store.ts` |
| Action hooks | `features/<f>/hooks/use-<action>-<e>.ts` (http → toast → `router.refresh()`) | `hooks/use-save-note.ts` |
| Components | one per file in `features/<f>/components/` | `components/*` |
| Page | `app/(protected)/<f>/page.tsx` (+ `loading.tsx`) — calls the list service directly | `app/(protected)/notes/page.tsx` |

Then wire it up:
- register the store in `src/shared/providers/store-provider.tsx`
- add `ensureIndexes()` to `src/shared/service/database-indexes.service.ts` (+ its spec)
- add the page prefix to `PROTECTED_ROUTES` in `src/shared/constants/routes.ts`
- add a sidebar entry in `src/shared/constants/navigation.ts` (+ icon in `sidebar.tsx`)
- optional: an e2e spec in `e2e/<f>/` mirroring `e2e/notes/notes-crud.spec.ts`

---

## Step 3 — Verify

```bash
npm run validate && npm run test:run
```

Then run the `code-standards` skill on the new files. Do not stage or commit.
