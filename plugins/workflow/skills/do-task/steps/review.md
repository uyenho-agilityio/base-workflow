# Step: review

No gate. Goal: the built change is reviewed against the plan, the ticket, and the project rules. Real findings are fixed inside the ticket.

## How

Run these in parallel:

1. **Code review** of the diff against `plan.md` and the project's rules (CLAUDE.md and its rules files).
2. **Security review.** Run it when the diff touches any path in `sensitivePaths`. Otherwise skip it and say so in the log.
3. **`spec-checker` agent** on the ticket: each acceptance criterion, met or not, with the test that proves it.
4. **Project reviewers** listed in `review.extraAgents` in the config. The base does not know what they check.

Then:

- Fix every real finding that is inside the ticket.
- List findings outside the ticket as follow-ups. Do not fix them here.
- Re-run the review only for the files you changed.
- Log `review` with the count of findings fixed and listed as follow-ups.

## Round limit

Fix rounds are limited to 3. After the third round still has real findings, stop and report them with the failing output. Do not continue.

## Rules

- Do not refactor code that the ticket did not touch.
- A finding that contradicts an approved decision goes back to the user. Do not decide it here.
