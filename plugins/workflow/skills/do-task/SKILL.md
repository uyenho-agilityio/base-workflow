---
name: do-task
description: Take one ticket from start to merged PR. Stops only at three gates: design and plan, before push, before merge.
disable-model-invocation: true
---

# do-task

Usage: `/do-task [--auto] <ticket file or issue link>`

Run from the project root. Project values come from `.claude/workflow.config.json` (read it through the workflow scripts, never parse it by hand). If the file is missing, stop and ask the user to create it.

Read the steps as they come up. Each step file under `steps/` covers one stage.

## Log (every step)

Each step writes one line at the end of the ticket file, under a `## Log` heading (create the heading the first time). Format: `- <YYYY-MM-DD> <step>: <what finished>`.

- Steps: `start`, `design`, `gate1`, `slice <n>`, `review`, `checks`, `gate2`, `pr`, `gate3`, `merged`.
- The line is written when the step finishes, not when it starts.
- Lines are never edited or removed.
- The `start` line names the branch and says `no worktree`, or gives the worktree path.
- If the plan has no test seams, write no `slice` line. Stop and ask the user whether to close the ticket or add seams.

## Gates

| Gate | When | What the user approves |
|---|---|---|
| Gate 1 | After design and plan | The confirmed design, the plan, and the test seams. Only then write code |
| Gate 2 | Before push | Diff summary, commit message, PR body |
| Gate 3 | Before merge | Check report from `check-release`, then the merge |

`--auto` skips Gate 1 only, and only when the config marks the ticket as setup. Gates 2 and 3 always stop.

## Resume

Read the last `## Log` line and continue from the step after it. Stop and ask the user when:
- the last line is missing or unclear, or
- the branch named in the `start` line no longer exists.

A missing worktree is not a reason to stop. Do not guess.

## Stages

1. **Start** (`steps/start.md`): read the ticket, check "Blocked by", find the issue, set the tracker status to in progress, create the branch from `remote/baseBranch`, log `start`.
2. **Design** (`steps/design.md`): grill the user with the `grilling` skill. Write each round to `design.md` in the specs directory. Log `design` when the user confirms the shared understanding.
3. **Gate 1** (`steps/plan.md`): write the plan and test seams, show design and plan together, wait for approval, log `gate1`.
4. **Build** (`steps/build.md`): run `do-tdd` for each seam, log `slice <n>` after each seam passes.
5. **Review** (`steps/review.md`): code review, security review, and the `spec-checker` agent. Fix real findings inside the ticket, list the rest as follow-ups. Log `review`.
6. **Checks** (`steps/checks.md`): run the verify commands from the config. Fix loop at most 3 rounds, then stop and report. Log `checks`.
7. **Gate 2, push, PR** (`steps/ship.md`): show the Gate 2 summary, then after approval commit, push to `remote` (never to a protected branch), open the PR into `baseBranch`, set the tracker status to review, log `pr`.
8. **Gate 3, merge** (`steps/land.md`): run `check-release`, show its report, wait for approval, merge, log `merged`.

## Guardrails

- Never push to a branch listed in `protectedBranches`.
- Never use `--no-verify`, `.skip`, `.only`, or `eslint-disable` to get past a check.
- Commit messages are one line, `<type>: <summary>`, with types and length from the config.
- Tracker writes go through the adapter named by `tracker.type`. Do not call the tracker API directly.
