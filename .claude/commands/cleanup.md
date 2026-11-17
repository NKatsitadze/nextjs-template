Perform a full cleanup pass on the files changed in the current feature branch. Work independently — identify issues, make the changes, move on. Do not ask for confirmation on individual steps.

> **Base branch:** `main`. If this project integrates into a different branch (e.g. `test`, `develop`), change it here and in `/rebase-latest`.

---

## Step 1 — Identify changed files

Run `git diff --name-only $(git merge-base HEAD origin/main) HEAD` (plus `git status --short` for uncommitted work) to get all files modified on this branch. Focus on `.tsx` and `.ts` source files under `src/`. Ignore spec files, config files, and generated files.

Read each changed file fully before deciding what needs fixing.

---

## Step 2 — Dead code

Remove anything that is declared but never used:
- Unused imports (variables, types, components)
- Unused props in a component's props type **and** its destructuring
- Unused local variables or functions
- Props that are threaded through a component chain but never actually consumed at the bottom — remove from the entire chain

When removing a prop from a component, also remove it from every parent that passes it down.

---

## Step 3 — Type organisation

Rules from AGENTS.md and this project's conventions:

- **Shared types** (used across more than one file) → `src/features/<feature>/types/` in the most relevant file (e.g. `note.ts` for note domain types). Never leave a shared type defined locally in a component.
- **Local types** (used only within one file) → keep them in that file, directly above the component that uses them.
- **Props types** → always named `ComponentNameProps`, never just `Props`. Keep them local to their component file.
- **Duplicated inline types** (e.g. the same object shape defined in two files) → extract to a single named export in the types folder and update all consumers.
- Never create `.types.ts` colocated files or repeat the folder name as a suffix — this project uses a central `types/` folder per feature (`types/note.ts`).
- Import order rule: `import type` statements must appear **after** regular imports from the same path group.

---

## Step 4 — Constants and utilities

- **Constants** (static data, lookup tables, option lists) → `src/features/<feature>/constants/<concern>.ts`. Never define constants inside components, hooks, or service files.
- **Pure utility functions** (no React, no side effects) → `src/features/<feature>/utils/<concern>.ts`. If a similar utility already exists in that file, add alongside it.
- When extracting, update all consumers to import from the new location.

---

## Step 5 — Duplication scan

After reading all changed files, actively look for code that exists more than once — do not wait for it to be obvious.

**Constants and option lists**: if the same static array or record is defined in two or more files (even with slightly different names), consolidate into one export in the relevant `constants/` file and update all consumers.

**Types**: if two files define the same shape independently (e.g. `type Option = { key: string; title: ... }` in two components), extract to a named type in the `types/` folder and replace both definitions.

**Utility functions**: if two files implement the same pure transformation (same input shape, same output), merge into one function in `utils/` and update imports.

**JSX blocks**: if a markup block of 10+ lines appears in two or more components with only trivial differences (different string literals, different id prefixes), extract a shared component and make the differences props.

**How to check**: use `grep` to search for distinctive tokens from a block you suspect is duplicated — e.g. a constant name, a class combination, a function signature. If the same pattern appears in multiple files outside of the one that defines it, it needs consolidation.

---

## Step 6 — Logic extraction into hooks

Extract a custom hook when a component contains **all three** of:
1. Multiple `useState` / `useRef` declarations that belong to the same concern
2. Handler functions that operate on that state
3. Derived values computed from that state

Hook naming: `use<Concern>` (e.g. `useQuestionValidation`, `useChoiceFields`, `useQuestionEditing`).

Hooks always live in `src/features/<feature>/hooks/` (or `src/shared/hooks/` when used by several features) — never next to a component. Store hooks are `use<Feature>Store.ts`, action hooks are `use-<action>.ts`.

The hook returns a flat object of state values, derived values, and handlers. The component destructures it and uses only JSX.

Do **not** extract a hook just to move a couple of one-liner handlers — the component must have genuine state management weight to warrant it.

---

## Step 7 — Component extraction

Extract a sub-component when a JSX block is:
- **Self-contained**: has a clear boundary (its own label, its own error state, its own interaction)
- **Large enough to matter**: roughly 25+ lines of JSX
- **Reused across files**: identical or near-identical markup in multiple components → single shared component

Naming: `ComponentNameProps` for the props type, file in the same folder as the parent unless it is shared across distant folders.

Do **not** extract components that are just a few lines of markup with no clear identity — that creates indirection without clarity.

When a block is duplicated across files, extract it once and update all consumers. Check for subtle differences (e.g. different `id` prefixes) and make those differences into props.

---

## Step 8 — File size check

After all extractions, re-read each modified file. A file that is still over ~150 lines after cleanup likely has a second extractable concern — look harder before declaring it done.

Files under ~100 lines after cleanup are fine. Do not extract further just to hit a line count target.

---

## Step 9 — Verify

Run:
```bash
npm run validate && npm run test:run
```

Fix all errors and warnings introduced by the cleanup. Do not suppress errors with `// eslint-disable` or type assertions — fix the root cause.