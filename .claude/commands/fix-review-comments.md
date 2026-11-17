Pull the unresolved review notes (CodeRabbit and human reviewers) off the merge request for the current branch, verify each one against the current code, fix the ones that are still valid, and finish with a clear list of what was fixed, what was skipped, and why. Never resolves threads, comments, commits, or pushes — all of that stays with the user.

> **Requires GitLab + an authenticated `glab` CLI** (identomat projects live on GitLab). If a project built from this template is hosted on GitHub, swap the `glab mr view` / `glab api …discussions` calls for `gh pr view` / `gh api repos/{owner}/{repo}/pulls/<N>/comments` — the triage logic below stays the same.

---

## Step 0 — Guardrails

Before touching anything:

- Confirm `glab` is installed and authenticated: `glab auth status`. If it's missing or not logged in, stop and tell the user this command needs an authenticated `glab` (GitLab CLI) to read the merge request.
- Get the current branch: `git branch --show-current`. If it's the base branch (`main` by default), `test`, or `master`, stop and tell the user this command is meant to run from a feature branch that has an open merge request, not from the base branch.

---

## Step 1 — Find the merge request for this branch

```bash
glab mr view
```

If this errors or reports no merge request for the current branch, stop and tell the user there's nothing to pull comments from yet. Otherwise extract the MR IID — the trailing number in the `url:` line's `/-/merge_requests/<N>` (the `number:` field, if present, is the same value). Save it as `MR_IID`; every later step means this value wherever `<MR_IID>` appears below.

Don't manually derive the project's API path from the git remote — `glab api` resolves the current repo automatically via the `:id` placeholder, which is both simpler and more robust than parsing `git remote get-url origin` by hand.

---

## Step 2 — Pull every discussion, paginated

```bash
glab api "projects/:id/merge_requests/<MR_IID>/discussions?per_page=100" --paginate > <scratchpad>/mr-<MR_IID>-discussions.json
```

(`<scratchpad>` means your actual scratchpad directory for this session, not literal text.) Always pass `--paginate` — without it, results silently truncate to the first page and later comments (e.g. a second review round after a new push) get missed entirely, which is exactly the failure mode this command exists to avoid.

---

## Step 3 — Sort every note into one of three buckets

Parse the JSON (a Python one-liner via Bash is the fastest way). Every note has `system` (bool), `resolvable` (bool), `resolved` (bool or null), `author.username`, `body`, and — if it's attached to a specific diff line — a `position` object (`new_path`, `new_line`). Sort each note:

1. **Skip outright — `system: true`.** These are GitLab's own activity-log entries ("requested review from...", "changed the description", "added N commits", "resolved all threads", "assigned to..."). Never findings, never worth surfacing.
2. **Skip outright — no `position` and the body is CodeRabbit/bot meta-commentary.** The per-review summary ("Actionable comments posted: N", the walkthrough, "changed the description" from a bot) describes the review as a whole, not an individual issue. Recognize it by: author is a known bot (e.g. CodeRabbit) and there's no `position`.
3. **Everything else needs a decision** — this is every note with `resolvable: true` (a diff-line discussion, from CodeRabbit or a human) *and* every remaining note that isn't caught by buckets 1–2 (a human's general MR-level comment is `resolvable: false` in GitLab's model even when it's substantive feedback — don't let the same flag that marks system noise also swallow real commentary). Split bucket 3 into:
   - **Already resolved** (`resolved: true`): skip — a prior pass already dealt with it, don't re-litigate.
   - **Needs evaluation** (`resolved: false` or no `resolved` field at all, e.g. a general comment): this is the actual worklist. Record `note_id`, `author`, file/line if present, and the full `body`.

If the worklist is empty, tell the user there are no new unresolved review comments and stop here — don't invent work.

Use TodoWrite to track each worklist item individually through the rest of this command.

---

## Step 4 — Verify each finding against the *current* code, then fix or skip it

CodeRabbit's comment body is noisy — severity tags, a collapsible "Prompt for AI Agents" block, sometimes a suggested diff. Extract the actual claim, then treat everything else (including any suggested diff) as a reference starting point, never a blind copy-paste. Human reviewer comments may be short, informal, or in another language — read them for what they're actually asking, and translate if needed; don't skip a finding just because it's terse. A general (no file/line) human comment won't map to one exact location — read the surrounding context (the diff, the discussion thread) to figure out what it's actually about before deciding it's out of scope.

For every finding, in order:

1. **Read the current file in full at the referenced location.** The code may have moved since the comment was posted (earlier fixes shift line numbers, other refactors change the surrounding logic) — never trust the comment's line number or quoted snippet without confirming it against what's actually there now.
2. **Decide whether the finding still applies.** It's invalid if: the described problem doesn't exist in the current code, a prior fix already addressed it, the suggested change would contradict a deliberate design decision already made and documented (check recent conversation context / commit messages for a rationale before assuming this), or the finding is simply wrong about how the code behaves — verify claims like "X can throw" or "Y is unreachable" by actually reasoning through the code paths, not by assuming the reviewer is right.
3. **If valid, fix it** — minimally, matching the file's existing conventions and this project's AGENTS.md rules. If CodeRabbit's suggested diff is correct, adapt it to fit; if it's subtly wrong (wrong variable name, breaks an adjacent case), fix it properly rather than applying it as-is.
4. **If invalid, don't touch the code** — just record why, concretely (e.g. "already fixed by the `?? '—'` fallback added in the previous pass", not "seems fine").
5. **If it's a general comment that isn't really a code-fix request** (a question, a "let's discuss" — not a "this line is wrong"), don't force a fix; record it as a flag for the user's attention instead.

Do not ask the user for permission per finding — evaluate and act on all of them, then report at the end.

---

## Step 5 — Verify

```bash
npm run typecheck
npx eslint <every file touched in Step 4>
npx vitest run
```

Fix anything the fixes from Step 4 broke before moving on. Don't skip straight to the report with a red suite.

---

## Step 6 — Report

Give the user a list, one entry per worklist item from Step 3, in the form:

```
<file>:<line> — <one-line description of the finding>
  → Fixed: <what changed, in one sentence>
```
or
```
<file>:<line> — <one-line description of the finding>
  → Skipped: <concrete reason it no longer applies or was already correct>
```
or, for a general comment that isn't a mechanical fix:
```
<author> (general comment) — <one-line summary>
  → Flagged for you: <why it needs a human call, not a code change>
```

Close with a one-line summary (typecheck/lint/test status) and an explicit reminder: nothing was resolved on the merge request, committed, or pushed — reviewing the fixes, resolving the threads, and pushing are the user's to do.
