Implement a new task described in `task-description.md` at the repo root — read it thoroughly, follow any linked Figma design, then produce a lettered implementation plan (asking questions on anything unclear or missing) before touching code. Once the plan is accepted, implement it end-to-end with no further permission checks, then clean up. Nothing gets staged, committed, or pushed — that stays with me.

---

## Step 1 — Read everything first

Read `task-description.md` at the repo root in full, carefully and thoroughly. Note every requirement, acceptance criterion, and any user-facing text given verbatim — per the user-facing text rule in AGENTS.md, that exact text must never be paraphrased, rewritten, or "improved" later.

If the description references example data files at the repo root (e.g. `example.json`, `example2.json`, or similarly named), read those in full too, to understand the real data shape before planning against it.

---

## Step 2 — Follow the design

If `task-description.md` contains a Figma URL, fetch it via the Figma MCP tools (load the `figma:figma-design-to-code` skill first, then `get_design_context` + `get_screenshot`) before drafting the plan. Never guess at spacing, copy, or component structure when a design link is given — pull the real values.

---

## Step 3 — Build the plan

Enter plan mode and draft a thorough, detailed implementation plan.

- If the task is large or touches multiple concerns, break the plan into lettered sections — A, B, C, D, E, and so on — each a self-contained chunk of work (e.g. A — types, B — service layer, C — UI, D — wiring, E — tests), so implementation can proceed section by section without missing a step or conflating unrelated changes.
- Each section should name the exact files to create or modify, following AGENTS.md's feature-based architecture — right folder, right pattern (service/repository/store/hooks/components/validations/types/utils/constants). Use `src/features/notes/` as the reference implementation; for a brand-new feature, follow `/new-feature`.
- **While drafting the plan**, if any requirement is ambiguous, or something the plan needs is missing from the description, the design, or the example data (a field, a state, an edge case, exact wording for new user-facing text) — stop and ask directly. Don't guess or assume.

Present the finished plan via `ExitPlanMode` and wait for explicit approval before writing any code.

---

## Step 4 — Implement without stopping

Once the plan is accepted, implement it section by section with full autonomy — do not pause to ask for permission on individual actions already implied by the accepted plan (creating a file, fetching a design via the Figma MCP, running a read-only command, etc.). The plan approval covers all of it; work through to completion.

Follow all standing AGENTS.md rules (type over interface, `@/` imports only, no raw fetch in feature code, no unnecessary try/catch, no props drilling, etc.) and match each touched file's existing style before editing.

---

## Step 5 — Clean up

Once implementation is complete, check whether this repo has a `/cleanup` command (`.claude/commands/cleanup.md`).

- If it exists, run it against the files this task just changed.
- If it doesn't exist, perform an equivalent cleanup pass yourself, carefully and without breaking anything: remove dead code and unused imports, move any shared types/constants/utils into their designated folders per AGENTS.md, and extract sub-components or hooks only where the codebase's existing conventions call for it.

---

## Step 6 — Verify

Run `npm run validate` and `npm run test:run`. Every new route, service, util, middleware and `shared/lib` file needs a co-located spec (see the test table in AGENTS.md); run `/write-tests` for any that are missing. Fix anything the implementation or cleanup broke.

---

## Step 7 — Stop before git

Do not stage, commit, or push anything when done. Leave the working tree as-is — staging, committing, and pushing is handled separately.
