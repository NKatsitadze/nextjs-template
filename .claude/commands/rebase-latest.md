Sync the current feature branch on top of the latest `main` branch. Safely shelves any in-progress work (staged, unstaged, or untracked), refreshes `main` from `origin`, restores the work, then rebases the feature branch onto `origin/main` — resolving any conflicts along the way, carefully and without breaking anything. Never force-pushes; that stays with the user.

> **Base branch:** `main`. If this project integrates into a different branch (e.g. `test`, `develop`), replace `main` throughout this file and in `/cleanup`.

---

## Step 0 — Guardrails

Before touching anything:

- Get the current branch: `git branch --show-current`. Save this as `FEATURE_BRANCH` — every later step returns here, and every `<FEATURE_BRANCH>` placeholder below means this saved value, not literal angle brackets.
- If the command prints nothing, HEAD is detached — stop and tell the user this command needs to run from a named feature branch.
- If `FEATURE_BRANCH` is the base branch, `main`, or `master`, stop and tell the user this command is meant to be run from a feature branch, not from the base branch itself.
- Check for an already-in-progress rebase/merge/cherry-pick (`git status` will report it, or check for `.git/rebase-merge`, `.git/rebase-apply`, `MERGE_HEAD`). If one exists, stop and surface it to the user instead of stacking another operation on top — that in-progress state is theirs to resolve first.

---

## Step 1 — Snapshot the working tree

Run `git status --porcelain`.

- If it prints anything (staged, unstaged, or untracked changes exist), the tree is **dirty** — proceed to Step 2 to stash.
- If it prints nothing, the tree is **clean** — every change on `FEATURE_BRANCH` is already committed. Skip Step 2 entirely and go straight to Step 3.

---

## Step 2 — Stash (only if dirty)

```bash
git stash push -u -m "sync-base-backup-<FEATURE_BRANCH>"
```

Use `-u` so untracked files are captured too — nothing should be left behind or at risk of being clobbered by the branch switch in Step 3. Remember that a stash was created; Step 5 depends on this.

---

## Step 3 — Refresh `main` from origin

```bash
git fetch origin main
git checkout main 2>/dev/null || git checkout -b main origin/main
git pull --ff-only
git fetch origin main
```

- The leading `git fetch origin main` guarantees `origin/main` exists locally so the fallback branch-creation always has something to point at (e.g. on a fresh clone that's never checked out `main` before).
- Use `--ff-only` on the pull, not a plain `git pull` — `main` is a shared branch. A fast-forward is always safe; if it *fails* (local `main` has diverged from `origin/main`, e.g. someone committed to it directly), stop the whole command and tell the user instead of guessing how to reconcile shared history.
- The trailing `git fetch origin main` mirrors the explicit fetch the user asked for and guarantees the `origin/main` ref used by the Step 6 rebase is maximally fresh.

---

## Step 4 — Return to the feature branch

```bash
git checkout <FEATURE_BRANCH>
```

---

## Step 5 — Restore the stashed work (only if Step 2 ran)

- If Step 2 was skipped (tree was clean / already committed), skip this step and go straight to Step 6.
- Otherwise:

```bash
git stash apply
```

Use `apply`, never `pop`, here. `pop` deletes the stash entry the moment it applies — before Step 6's rebase has even run, let alone succeeded. `apply` leaves the stash entry sitting in `git stash list` untouched, so the original work stays fully recoverable as a safety net through the entire rebase, including if something goes wrong and needs to be aborted. Do not drop or clear this stash at any point in this command — that only happens later, deliberately, per Step 7.

If `apply` produces conflicts, resolve each conflicted file carefully:
- Read the full file, not just the conflict hunks, to understand the surrounding code.
- Understand both sides — the working-tree change being restored and whatever is currently on `FEATURE_BRANCH` — before deciding how to merge them. Never blindly take "ours" or "theirs" wholesale unless one side is a strict, verified superset of the other.
- Remove all conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) and make sure the resulting code is coherent, not just syntactically merged.
- `git add` the resolved files once you're confident the merge preserves both sides' intent. The stash entry itself is untouched by this — it still holds the original, pre-conflict snapshot in reserve.

---

## Step 6 — Rebase onto `origin/main`

```bash
git rebase --autostash origin/main
```

Use `--autostash`, never a plain `git rebase`. If Step 5 applied a stash, the working tree is dirty again at this point (staged/unstaged changes on top of `FEATURE_BRANCH`'s commits) — and `git rebase` refuses to even start with a dirty tree, failing immediately with "cannot rebase: you have unstaged changes." `--autostash` avoids that entirely: it shelves the dirty tree itself into its own internal, temporary stash, runs the rebase, then re-applies those changes on top once it's done. When Step 5 didn't run (tree was already clean), `--autostash` is a no-op and behaves exactly like a plain rebase.

This internal autostash is separate from the Step 2/5 backup stash — the backup entry from Step 2 stays in `git stash list` throughout, regardless of what `--autostash` does here.

This means there are two distinct points where conflicts can appear — handle each appropriately:

**A. Mid-rebase conflicts** (replaying one of the feature branch's own commits onto `origin/main`):
- For every conflicted file, read it in full and understand what `origin/main` changed vs. what that commit changed.
- Resolve preserving the intent of both sides. If a conflict looks like a genuine, ambiguous logic clash (not just overlapping edits) where the correct resolution isn't obvious, stop and ask the user rather than guessing.
- Remove conflict markers, then sanity-check the resolved file(s) — run `npm run typecheck` and/or `npm run lint` on the affected files before continuing if the conflict touched non-trivial logic.
- `git add <resolved files>`, then `git rebase --continue`.
- Repeat until the rebase itself finishes. If it becomes unclear how to proceed safely, `git rebase --abort` to restore the pre-rebase state cleanly, then surface it to the user instead of forcing it through.

**B. Final autostash re-apply conflict** (after all commits have replayed cleanly, when the previously-stashed changes are re-applied on top): git will report `Applying autostash resulted in conflicts. Your changes are safe in the stash.` and leave the stash entry in place. Resolve it the same careful way — read full files, merge intent, remove markers — then `git add` the resolved files and run `git stash drop` (not `pop`; the content is already applied to the tree, this just discards the now-redundant stash entry) once you've verified the result is correct.

---

## Step 7 — Verify and report

Once the rebase completes cleanly:

```bash
npm run typecheck
npm run lint
```

Fix anything the conflict resolution broke. Then report to the user: which branch was synced, whether a stash was involved, how many commits were rebased, and which files (if any) had conflicts resolved.

If Step 5 ran, the backup stash from Step 2 (`sync-base-backup-<FEATURE_BRANCH>`) is still sitting in `git stash list` — it was applied, never popped, specifically so it would survive as a fallback through the whole rebase. Do not drop it yourself as part of this command. Point it out in the report and let the user drop it (`git stash drop`) once they've reviewed the result and are confident it's no longer needed.

Do not push, force-push, or force-push-with-lease anything — leave `FEATURE_BRANCH` as the rebased local result for the user to review and push themselves.
