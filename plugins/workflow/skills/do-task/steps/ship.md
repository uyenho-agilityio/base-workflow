# Step: ship (Gate 2, then push and PR)

Goal: the user sees exactly what will be pushed, then the branch goes up and a PR opens into the base branch.

## Gate 2: before push

Show the user:

- the diff summary: files changed and lines added and removed,
- the commit message, one line, `<type>: <summary>`, checked against `commit.types` and `commit.maxSummary`,
- the PR body, written by the `pr-writer` agent from facts only, with these sections: **Ticket**, **Problem**, **Changes**, **Testing**, **Review findings acted on**, **Not tested**, **Follow-up**.

Wait for approval or edits. Do not commit or push before approval.

## After approval

0. Log `gate2`.
1. Commit the change with the approved message.
2. Push to `remote`. Never push to a branch listed in `protectedBranches`. The guard hook blocks it anyway.
3. Open the PR into `baseBranch` with the approved body. Link the ticket with the adapter's `linkPR`. For GitHub Issues, the body includes `Closes #<issue>`.
4. Set the tracker status to `review` with `setStatus`, using `tracker.statuses.review` or the label for GitHub Issues.
5. Log `pr` with the PR number.

## Rules

- If the push fails, stop and report the error. Do not retry with force.
- If the PR cannot be opened, stop, keep the branch, and report.
- Changes that come up after Gate 2 and fall outside the ticket go to Follow-up in the PR, and the user is asked before any code changes.
