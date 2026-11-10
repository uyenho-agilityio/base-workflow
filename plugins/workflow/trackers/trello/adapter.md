# Tracker adapter: trello

Used when `tracker.type` is `trello`. The card holds the ticket text and its checklists. Its list shows the status.

## Connection

- Use the project's Trello connector. The config's `board` is the board URL, and every operation works on that board only.
- The lists are named by `tracker.statuses`. A list name in the config must match a list on the board exactly.
- If the connector is not connected, every operation fails. Stop and report it.
- Credentials stay in the connector. Never write a key or token into the repo.
- Before the first real use, confirm the connector's tool names and record them in this file. This adapter is not yet checked against a live board.

## Operations

### getTicket

1. Find the card from the input: a card URL, or a card id.
2. Return the card name, description, checklists (each item with its checked state), and the list it is in.
3. Map each checklist item that matches `criteriaPattern` to an acceptance line.

### setStatus

1. Read the list names on the board.
2. Find the list whose name equals `tracker.statuses.<state>`. If there is none, stop and report the missing list name. Do not create a list.
3. Move the card to that list.

### linkPR

Add a comment to the card with the PR URL. Trello has no native PR link, so the comment is the link.

### comment

Add the text as a card comment. Return the comment id or URL.

## Done on merge

`tracker.doneBy` should be `status` for Trello. The land step then moves the card to the `done` list after the merge succeeds. Trello does not close on merge by itself.

If the team wants the card moved by automation instead, a GitHub workflow can do it. That is outside this adapter and must be set up in the repo. The adapter does not check for it.

## Rules

- Move only the card the ticket names.
- Do not reorder other cards or change their lists.
