# Tracker adapter: github-issues

Used when `tracker.type` is `github-issues`. The ticket text lives in a ticket file, and the issue tracks status and PR links.

## Connection

- Use the project's GitHub MCP server. Do not use the `gh` CLI, and do not store a token in any file.
- `remote` in the config names the git remote. The repository is the one that remote points at.
- If the GitHub MCP server is not connected, every operation fails. Stop and report it.

## Operations

### getTicket

1. Find the ticket file. If the input is a path, use it. If the input is an issue number, find the file in `tracker.ticketGlob` whose `**Issue:** #n` line matches.
2. Read the file. Return its title, user story, blockers, and every line matching `criteriaPattern`.
3. Read the issue with GitHub MCP. Return its number, URL, and current labels.
4. If the file has no `**Issue:**` line, return the file content and report that no issue is linked.

### setStatus

`tracker.statuses` maps each state to a label name.

1. Read the issue's current labels.
2. Remove every label that is a value in `statuses`, except the one being set.
3. Add the label for the requested state, creating it if it does not exist.
4. For `done`: if `tracker.doneBy` is `merge`, do not set it here. The merge closes the issue. If the issue is still open after the merge, see "Closing after merge" below.

### linkPR

1. Add a comment to the issue with the PR URL.
2. The PR body must contain `Closes #<issue>` (the ship step writes it). Check that it does. If it does not, report it. Do not edit the PR body yourself.

### comment

Add the text as an issue comment. Return the comment URL.

## Closing after merge

GitHub closes an issue from `Closes #n` only when the PR merges into the repository's default branch. For a project whose base branch is not the default, the issue stays open after the PR merges into the base.

- If the base is the default branch: nothing to do. Check that the issue is closed.
- If the base is not the default branch: the land step closes the issue explicitly with the GitHub MCP, with reason `completed`, after the merge succeeds. Set the `done` label first.

This is why a project whose base is not the default should set `doneBy` to `status`. Then the land step always calls `setStatus done`, and the adapter closes the issue.

## Labels

Labels are created on first use. If the GitHub MCP reports that a label cannot be created, stop and report it. Do not invent a different label.
