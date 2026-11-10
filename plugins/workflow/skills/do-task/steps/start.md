# Step: start

No gate. Goal: the ticket is read, marked in progress, and a branch exists to build on.

## How

1. **Read the ticket** with the tracker adapter (`tracker.type`): title, user story, acceptance checklist, "Blocked by", and the demo line if the ticket has one.
2. **Check blockers.** If "Blocked by" names a ticket that is not merged, stop and say so.
3. **Find the ticket id.** If the adapter reports no id (for example, a GitHub issue number), stop and ask the user to publish the tickets first.
4. **Set status in progress** with the adapter's `setStatus`, using `tracker.statuses.in_progress` (or the label for GitHub Issues).
5. **Create the branch.**
   - Name it from `branchTemplate` in the config, using the ticket id and a short slug.
   - Run `git fetch <remote>`, then branch from `<remote>/<baseBranch>`.
   - If a branch with that name already exists, stop and ask. Do not reuse it.
6. **Choose the working copy.**
   - Default: build in the main checkout on the new branch.
   - Use a worktree only when `worktree.whenParallel` applies (another session is running on files this ticket may touch) or the user asks for one.
7. **Log `start`** with the branch name and either `no worktree` or the worktree path.

## Stop and ask when

- the ticket is blocked,
- the ticket id is missing,
- the status cannot be set,
- the branch already exists,
- the base branch is missing on the remote.
