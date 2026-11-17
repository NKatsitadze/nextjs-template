---
name: code-standards
description: Audit changed files against the project's hard code-standards — max 180 lines per file, one function/component per file, no duplicated code, no unused/dead code, every required spec present. Use before finishing any change, or when asked to check code size, duplication, dead code or missing tests.
---

# Code Standards Audit

Enforce the hard rules in `AGENTS.md` ("Code size & single responsibility" and "Test conventions").

## What to check

1. **Max 180 lines per file** (specs included). Flag any changed file over 180 lines; propose how to split.
   `src/shared/components/ui/**` is generated shadcn code and is exempt.
2. **One file = one function/component.** Each file exports exactly one primary
   function/component/hook/class/service. Multiple exported functions → split into
   separate files in the correct feature subfolder. (Co-located `type`/`const` are fine;
   `utils/`, `constants/` and `shared/lib` may group one theme per file.)
3. **No duplicated/reused code.** Find logic that already exists elsewhere or is repeated;
   extract to one place (`shared/lib`, `shared/utils`, or the feature's `utils/`) and import.
4. **No unused/dead code.** Commented-out code, unused imports/vars/exports, unreachable
   branches — delete them.
5. **Specs exist** for every changed route, service, util, middleware, `shared/lib` and
   `shared/service` file (see the table in AGENTS.md).

## How to run

```bash
# changed source files vs the base branch (plus uncommitted work)
FILES=$( { git diff --name-only --diff-filter=ACMR origin/main...HEAD; git diff --name-only --diff-filter=ACMR; git ls-files --others --exclude-standard; } \
  | sort -u | grep -E '^src/.*\.(ts|tsx)$' | grep -v '^src/shared/components/ui/')

# 1) line-count offenders (>180), specs included
for f in $FILES; do n=$(wc -l < "$f"); [ "$n" -gt 180 ] && echo "OVER 180 ($n): $f"; done

# 5) required specs that are missing
for f in $(echo "$FILES" | grep -v '\.spec\.ts$' | grep -E '(app/api/.*/route|/service/|/utils/|shared/lib/|shared/middleware/|shared/service/|src/proxy)\.?[^/]*\.ts$'); do
  [ -f "${f%.ts}.spec.ts" ] || echo "MISSING SPEC: $f"
done

# 2–4) lint + types (unused code, import order, any, …)
npm run validate
```

For "one function per file" and "no duplication", read each changed file and reason about
it — these are not fully lint-checkable. Report concrete violations with `file:line` and a
proposed fix; then apply the splits/extractions (use `/write-tests` for missing specs).

## Output

A short list of violations grouped by rule, each with `file:line` and the fix. If clean,
say so explicitly. Apply fixes when asked.
