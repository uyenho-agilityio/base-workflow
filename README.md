# base-workflow

A Claude Code plugin that takes one ticket from the tracker to a merged PR. It runs in three approval gates: design and plan, before push, and before merge. Everything else runs without questions.

Plugin name: `workflow`. Marketplace name: `base-workflow`.

## What it does

`/workflow:do-task <ticket>` runs these stages:

1. Start: read the ticket, set in progress, create the branch.
2. Design: grill the user with the `grilling` skill, one round at a time, recorded in `design.md`.
3. Gate 1: plan, test seams, and design approved together.
4. Build: `do-tdd` for each seam, one commit per seam.
5. Review: code review, security review when `sensitivePaths` match, `spec-checker`, and project reviewers.
6. Checks: the `verify` commands from the config.
7. Gate 2: diff, commit message, and PR body approved. Then push and open the PR.
8. Gate 3: `check-release` report, then merge.

Other skills: `/workflow:task-status`, `/workflow:check-release`, `/workflow:publish-tickets`.

## Install

From a local clone:

```bash
claude plugin marketplace add /path/to/base-workflow
claude plugin install workflow@base-workflow
```

From GitHub, once the repo is pushed:

```bash
claude plugin marketplace add <owner>/base-workflow
claude plugin install workflow@base-workflow
```

## Set up a project

Create `.claude/workflow.config.json` in the project root. The schema is `plugins/workflow/schema/workflow.config.schema.json`. A working example is `plugins/workflow/examples/nutrition-coach.workflow.config.json`.

The config holds every project value: remote, base branch, protected branches, branch name pattern, tracker, verify commands, commit types, and sensitive paths. The plugin does not hardcode any of them.

Pick a tracker in `tracker.type`:

- `github-issues`: needs the GitHub MCP server connected. Labels hold the states.
- `trello`: needs the Trello connector and a `board` URL.
- `none`: tickets are Markdown files or pasted text.

## Status

Version `0.1.0`. Not yet run end-to-end on a real ticket. The Trello adapter is not checked against a live board.
