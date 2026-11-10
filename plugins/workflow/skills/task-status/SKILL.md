---
name: task-status
description: Report where a ticket stands in the do-task workflow: last logged step, next step, and any problems. Read only. Never edits, commits, pushes, labels, or merges.
disable-model-invocation: true
---

# task-status

Usage: `/task-status <ticket file, or ticket id>`

This skill only reads. It never edits files, commits, pushes, changes tracker status, or merges.

Read the project settings from `.claude/workflow.config.json`. If the file is missing, stop and ask the user to create it.

## Steps

1. **Find the ticket.** A path is used as given. An id is matched against `tracker.ticketGlob`. If the tracker is `none`, the path is required.
2. **Read the status.** Read the ticket's `## Log` section. If there is none, say the ticket has not started under `do-task` and stop.
3. **Take the last log line.** Its `<step>` is where `do-task` stopped.
4. **Find the next step.** The order is:
   - `start` → `design`
   - `design` → `gate1`
   - `gate1` → `slice 1`
   - `slice <n>` → `slice <n+1>` while the plan has more seams, otherwise `review`. Count the seams in `plan.md`.
   - `review` → `checks`
   - `checks` → `gate2`
   - `gate2` → `pr`
   - `pr` → `gate3`
   - `gate3` → `merged`
   - `merged` → nothing left
5. **Check the branch.** Look for a local branch matching the `branchTemplate` for this ticket. Say whether it exists. If a worktree is listed for it, say whether that worktree has uncommitted changes.
6. **Check the PR.** Only if the last step is `pr` or later: read the PR state through the git host (open, merged, or closed) and its checks. Do not check it for earlier steps.

## Report

A short block, in this order:

- **Ticket:** file name, and the tracker status if the tracker is set
- **Last logged step:** the log line, word for word
- **Next step:** what `do-task` would do next, and whether it needs a gate
- **Branch and worktree:** present or missing, and uncommitted changes yes or no
- **PR:** state and checks, only if step 6 ran
- **Problems:** a missing or out-of-order log line, a missing branch, or a PR that does not match the log

If the log and git disagree, report both and ask the user to decide. Do not guess which one is right.
