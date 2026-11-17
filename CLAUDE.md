# CLAUDE.md

@AGENTS.md

## Claude Code specifics

The project conventions above (AGENTS.md) are the source of truth — edit them there, not here, so other agents (Codex, etc.) stay in sync.

**Slash commands** (`.claude/commands/`):

| Command | Use it to |
|---|---|
| `/init-project` | turn a fresh clone of this template into a new project (rename, `.env`, design reset, optional removals) |
| `/new-feature <name>` | scaffold a full feature by mirroring `src/features/notes/` |
| `/start-task` | implement `task-description.md` (ticket + optional Figma) via a lettered plan |
| `/write-tests <path>` | add specs that follow the test conventions |
| `/cleanup` | dead code, misplaced types/constants, duplication, extraction pass on the branch |
| `/rebase-latest` | safely rebase the branch onto the latest base branch (`main` by default) |
| `/fix-review-comments` | triage and fix open MR review notes (needs `glab`) |

**Skill:** `code-standards` — run on changed files before finishing (180-line limit, one export per file, duplication, dead code, missing specs).

**Before you say a task is done:** `npm run validate` and `npm run test:run` pass, and the `code-standards` skill reports clean. Never stage, commit or push unless asked.
