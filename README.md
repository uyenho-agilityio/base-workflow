# base-workflow

A Claude Code plugin that takes one ticket from the tracker to a merged PR, with the same steps and the same approval points in every project.

Plugin name: `workflow`. Marketplace name: `base-workflow`.

## Purpose

Each project used to have its own ticket routine. This plugin keeps the routine in one place:

- **Same flow everywhere.** Start, design, plan, build, review, checks, PR, merge.
- **Human decisions at three points only.** Design and plan (Gate 1), before push (Gate 2), before merge (Gate 3). Everything between runs without questions unless something falls outside the ticket.
- **Project values in config, not in the plugin.** Branch names, tracker, verify commands, and sensitive paths live in `.claude/workflow.config.json`.
- **A record of every step.** Each finished step writes one line to the ticket's `## Log`, so a stopped run resumes where it stopped.

It is meant for projects that use Claude Code and track tickets in GitHub Issues or Trello.

## How it is organized

| Layer | What it holds | Where |
|---|---|---|
| Invariant | The gates, the `## Log` format, the TDD loop, the review and check steps | `plugins/workflow/skills/` |
| Adapter | How tickets are read, status is set, PRs are linked, comments are added | `plugins/workflow/trackers/<type>/adapter.md` |
| Variant | Remote, base branch, protected branches, verify commands, sensitive paths | `.claude/workflow.config.json` in each project |

To support a new tracker, add `trackers/<name>/adapter.md` with the four operations (`getTicket`, `setStatus`, `linkPR`, `comment`), and add the name to `tracker.type` in the schema.

## Requirements

- Claude Code, with plugins enabled
- Git, with the project's remote configured
- The git host's MCP server connected (GitHub MCP for GitHub Issues and PRs)
- The Trello connector, only if the tracker is Trello
- The project's own verify commands (`lint`, `typecheck`, `test`, `build`) working from the command line

## Install

Run these inside an interactive `claude` session, in any project. They are slash commands, not shell commands.

From GitHub:

```
/plugin marketplace add uyenho-agilityio/base-workflow
/plugin install workflow@base-workflow
```

From a local clone:

```
/plugin marketplace add /path/to/base-workflow
/plugin install workflow@base-workflow
```

Installing `workflow` also installs its dependency, `mattpocock-skills` from the `claude-plugins-official` marketplace. It is installed at its latest version. Check the install with `/plugin`. After it is installed, `/workflow:do-task` appears in the command list.

## Set up a project

1. Create `.claude/workflow.config.json` in the project root. Start from `plugins/workflow/examples/nutrition-coach.workflow.config.json`. The schema is `plugins/workflow/schema/workflow.config.schema.json`.
2. Set `remote`, `baseBranch`, and `protectedBranches`. Include the base branch in `protectedBranches`.
3. Set `branchTemplate`, for example `feat/nc-{ticket}-{slug}`.
4. Set `tracker.type`:
   - `github-issues`: set `tracker.statuses` to label names, and `tracker.ticketGlob` to the ticket files.
   - `trello`: set `tracker.board` and `tracker.statuses` to list names. Set `doneBy` to `status`.
   - `none`: no `statuses`.
5. Set `verify` to the exact commands the project runs for `lint`, `typecheck`, `test`, and `build`. Add `e2e` if the project has one.
6. Set `sensitivePaths` to the paths that need a security review when changed.
7. Set `review.extraAgents` to any project-level reviewers, for example a database policy auditor.

Keep the config file in the repo. Do not put secrets in it.

## Using it

### Run one ticket

```
/workflow:do-task 11
```

The run goes like this:

1. **Start.** Reads the ticket, checks blockers, sets the tracker status to in progress, creates the branch from `remote/baseBranch`.
2. **Design.** Asks you questions in rounds until the design is settled. Each round is saved to `design.md`.
3. **Gate 1.** Shows the design, the plan, and the test seams. Wait for approval, then build.
4. **Build.** One failing test, then the code to pass it, then one commit per seam.
5. **Review.** Code review, security review if sensitive paths changed, the acceptance check, and any project reviewers. Real findings inside the ticket are fixed. Others become follow-ups.
6. **Checks.** Runs the `verify` commands. Up to three fix rounds.
7. **Gate 2.** Shows the diff summary, commit message, and PR body. After approval: commit, push, open the PR, set the tracker to review.
8. **Gate 3.** Runs `check-release`, shows the report, and merges after you confirm.

You can stop at any gate. Run `/workflow:do-task` again on the same ticket to resume.

### Check where a ticket stands

```
/workflow:task-status 11
```

Reads the `## Log`, reports the last step and the next one. Changes nothing.

### Check a branch before merge

```
/workflow:check-release
```

Reports PASS, FAIL, or NOT CHECKED for each check: branch state, PR, verify commands, acceptance, leftovers in the diff, sensitive paths, and manual checks. Never merges.

### Create issues from tickets (GitHub Issues only)

```
/workflow:publish-tickets
```

Lists ticket files that have no issue yet, shows the list, and creates the issues after you approve. Writes the issue number back into each ticket, through a `docs/` branch and PR.

## Ticket format

- The ticket file has a title, a user story, and acceptance criteria. Each criterion is a line that matches `criteriaPattern` in the config. The default pattern is a Markdown checkbox: `- [ ] ...`.
- After the first `/workflow:do-task` run, the ticket has a `## Log` section. Each line looks like `- 2026-11-10 gate1: plan approved, 4 seams`. Do not edit or delete these lines.
- For GitHub Issues, the ticket has a `**Issue:** #n` line.

## Skills and agents

| Name | Kind | Purpose |
|---|---|---|
| `do-task` | Skill | The full flow for one ticket |
| `mattpocock-skills:grilling` | Skill, from a dependency | Design interview, one round at a time. Installed with this plugin |
| `do-tdd` | Skill | Build one approved seam test-first |
| `check-release` | Skill | Pre-merge report, reports only |
| `task-status` | Skill | Read-only progress report |
| `publish-tickets` | Skill | Create issues from ticket files (GitHub Issues) |
| `plan-reviewer` | Agent | Checks the plan before Gate 1 |
| `spec-checker` | Agent | Checks each acceptance criterion against tests |
| `pr-writer` | Agent | Drafts the PR body from facts |
| `tracker-manager` | Agent | The only agent that writes to the tracker |

## Status

Version `0.1.0`, **in progress**. The flow has run end to end once on nutrition-coach, on a throwaway ticket, up to Gate 2 (PR opened). Gate 3 (merge) and the items below are not tested yet.

**Written**

- Skills: `do-task` with its eight step files, `do-tdd`, `check-release`, `task-status`, `publish-tickets`
- Agents: `plan-reviewer`, `spec-checker`, `pr-writer`, `tracker-manager`
- Tracker adapters: `github-issues`, `trello`, `none`
- Guard hook: `scripts/guard.mjs`, wired in `hooks/hooks.json`. Its 13 unit tests pass when run directly
- Config schema and an example config for nutrition-coach

**Tested**

- Install from a local path in Claude Code, with `mattpocock-skills` installed as the dependency
- `/workflow:task-status 11` reads the ticket log and the PR state
- `/workflow:do-task 12` on a tracker of type `none`: start, design (grilling), plan with the requirements table, Gate 1, build, checks, and Gate 2 (commit, push, PR)
- `/workflow:check-release` on the open PR, reported without merging
- The nutrition-coach verify commands (`lint`, `typecheck`, `test`, `build`) pass with the example config

**Not tested yet**

- Gate 3: a real merge through the plugin
- The guard hook blocking a real push inside a session. Only direct script runs have passed
- The TDD build path (`do-tdd`) with a real test seam
- The review step: code review, security review, and `spec-checker`
- The `trello` adapter against a real board

**Known issues**

- The example config sets `tracker.doneBy` to `"status"`. Projects that close issues by merging the PR need `"merge"`.
- A ticket log line with a non-integer step (for example `slice 5b`) makes `task-status` unclear about the next step.

**Missing before a real run**

- `config.mjs`: `do-task` says to read the config through scripts. Until this exists, Claude reads the JSON directly.
- The golden checks script (`check-run.mjs`)

**Next test round:** merge one throwaway PR through Gate 3, run the guard hook on a blocked push, run `do-tdd` on a real seam, and run the review step.
