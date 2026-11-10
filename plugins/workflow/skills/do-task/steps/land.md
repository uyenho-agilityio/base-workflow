# Step: land (Gate 3, merge)

Goal: the user merges with a clear report in front of them, then the ticket is closed and the workspace is cleaned up.

## Gate 3: before merge

1. Run the `check-release` skill on the branch and show its report.
2. Ask the user to confirm the merge. The approval hook asks again before the merge call. Both must pass.
3. Merge through the git host. Log `gate3` after the user confirms.

## After merge

- Confirm the tracker item is done. With `tracker.doneBy: "merge"` the merge closes it. With `doneBy: "status"` set `done` with `setStatus`.
- Delete the branch, both on the remote and locally.
- Remove the worktree only if this run created one.
- Sync `baseBranch` in the main checkout.
- Log `merged`. If the log line cannot be committed in the same change, say so in the report.
- Report: PR link, merge commit, and what was not tested.

## Rules

- Never merge without the confirmation in step 2.
- If the merge fails, stop and report. Do not force it.
- If the tracker item is not closed after the merge, report it. Do not close it by hand without asking.
