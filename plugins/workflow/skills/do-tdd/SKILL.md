---
name: do-tdd
description: Build one approved test seam test-first (red, green, next). Used by the do-task build step, or run alone with a seam that the plan already approved.
---

# do-tdd

Usage: `/do-tdd <seam>`, or called by `do-task` for each seam in the approved plan.

Refactoring is not part of this loop. It happens in the review step.

## Before the first seam

1. Read the approved seam from `plan.md` in the specs directory. If the seam is not in the approved plan, stop and ask. Do not invent a seam.
2. Read the project's test conventions from its CLAUDE.md and rules files: where test files go, the test runner, and the helpers the project already has.

## For each slice

1. **Red.** Write **one** failing test at the seam. Use the project's test file location and runner.
2. **Check it fails for the right reason.** Run that test alone. A missing export or a wrong value is the right reason. A typo, an import error, or a broken setup is not. Fix the setup and run again until the failure is the right one. Record the failure line.
3. **Green.** Write the least code that makes the test pass. Nothing beyond what this test asks for.
4. **Check green.** Run the test file, then the other tests in that file. All must pass.
5. **Commit.** Stage the test and the code together as one commit. The message is one line, `<type>: <summary>`, using the types and length from `commit.types` and `commit.maxSummary` in the config. No body, no trailers.
6. **Next slice.**

## Rules

- Expected values come from the spec, the data the ticket cites, or a worked example worked out by hand. Never compute an expected value the way the code does.
- Replace only the clock, the random source, and external services (database, auth, network). Do not mock the project's own modules.
- Component tests check what the user sees and does: text, roles, clicks. Do not check internal state.
- No tests of private functions or internals.
- Do not change a test to make it pass. If the test is wrong, stop and report.
- No `.skip`, `.only`, or disabled checks.
- Pages that cannot be unit tested are covered by an e2e seam, not skipped.

## Report

For each slice: the test name, the failure line seen in step 2, the commit hash, and the pass count after step 4.
