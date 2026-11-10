---
name: publish-tickets
description: Create one tracker issue per ticket file that has none yet, and write the issue number back into each ticket. Only for the github-issues tracker. Run once at setup, and again when a ticket is added.
disable-model-invocation: true
---

# publish-tickets

Usage: `/publish-tickets`

## Before anything else

1. Read `tracker.type` from `.claude/workflow.config.json`.
2. If it is `github-issues`, continue. If it is `trello` or `none`, stop and say this skill applies only to GitHub Issues. Do nothing else.
3. The GitHub MCP server must be connected. If it is not, stop and report it.

## Steps

1. **List the tickets.** Files matching `tracker.ticketGlob`. Keep only the files with no `**Issue:** #n` line.
2. **Prepare each one:**
   - title: `<ticket id>: <name>`, taken from the ticket's heading,
   - body: the ticket file's content,
   - labels: `tracker.statuses.todo`.
3. **Show the full list** to the user: ticket file, title, and labels. Ask once: create these issues? Do nothing until the user says yes.
4. **Create each issue** with the GitHub MCP. Check each result.
5. **Write the number back.** Put `**Issue:** #n` on its own line under the ticket's title.
6. **Report** each ticket with its issue number and URL.

## Write-back and commit

The write-back changes the ticket files, so it must reach the repo through a branch and a PR. Create a `docs/` branch from `<remote>/<baseBranch>`, commit the write-back as one line (`docs: link tickets to issues`), and open a PR into `baseBranch`. Do not push to a protected branch. Commit and push only after the user approves the list in step 3 and says so for the write-back.

## Rules

- Never create an issue for a ticket that already has `**Issue:**`.
- If an issue cannot be created, stop. Report which issues were created before the failure.
- Do not edit the ticket body beyond the `**Issue:**` line.
