# Step: build

No gate. Goal: every approved seam is built test-first, in order, one commit per seam.

## How

For each seam in the approved plan, in order:

1. Run the `do-tdd` skill with that seam. It writes one failing test, checks that it fails for the right reason, writes the least code to pass, and runs the tests in that file green.
2. Commit the test and the code together as one line, `<type>: <summary>`, with the type and length rules from `commit.types` and `commit.maxSummary`.
3. Log `slice <n>` with what finished (for example, `4 tests pass`).
4. Move to the next seam.

## Rules

- No refactor inside this step. Refactors happen in the review step.
- Expected values come from the spec, the data the ticket cites, or a worked example. Never recompute them the way the code does.
- If a seam turns out wrong during the build, stop, go back to the plan step, and get approval again. Do not change the seam silently.
- If a test cannot be written at the agreed seam, stop and ask.
