# Tracker adapter: none

Used when `tracker.type` is `none`. There is no external tracker. The ticket is a Markdown file or pasted text.

## Operations

Every operation returns `skipped` and makes no change.

| Operation | Result |
|---|---|
| `getTicket` | Read the ticket file at the path given, or use the pasted text. Return its id, title, user story, blockers, and every line matching `criteriaPattern`. This is the only operation that does work. |
| `setStatus` | `skipped` |
| `linkPR` | `skipped`. The PR body still carries the ticket reference. |
| `comment` | `skipped` |

## Ticket id

- The id is the file's leading number. `12-workflow-plugin-test.md` gives id `12`. This is the id that `branchTemplate` and the `## Log` use.
- If the file name has no leading number, the id is the file name without `.md`.
- Pasted text has no file, so the user gives the id with it.

## Notes

- `tracker.statuses` must be absent in this mode. The schema rejects it.
- `tracker.doneBy` has no effect.
- The land step still runs the post-merge cleanup, but skips any tracker update.
