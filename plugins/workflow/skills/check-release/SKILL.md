---
name: check-release
description: Check that a ticket branch is ready to merge into the base branch and report it. Reports only. Never merges, pushes, or changes the PR.
disable-model-invocation: true
---

# check-release

Usage: `/check-release [branch]`. Default: the current branch. Run by the land step before Gate 3, or on its own.

This skill reports. It never merges, pushes, edits the PR, or changes the tracker.

Read the project settings from `.claude/workflow.config.json`. If the file is missing, stop and ask the user to create it.

## Checks

1. **Branch state.** The branch contains `<remote>/<baseBranch>` (`git merge-base --is-ancestor`). Say how many commits the base has that the branch does not.
2. **Protected branch.** The branch is not in `protectedBranches`.
3. **PR.** An open PR targets `baseBranch`. Read its review comments through the git host, and mark each one resolved or open. If there is no PR, report NOT CHECKED with the reason.
4. **Tracker link.** The PR body names the ticket and, for GitHub Issues, contains `Closes #<issue>`.
5. **Verify.** Run each command in `verify` from the config, in order: `lint`, `typecheck`, `test`, `build`, and `e2e` if listed. Report each result. On failure, include the failing output.
6. **Acceptance.** Every acceptance line in the ticket (matching `criteriaPattern`) has a test that the `spec-checker` agent marked met. Report any that are not met or not provable.
7. **Leftovers in the diff.** Scan only lines added in the branch's diff against `<remote>/<baseBranch>` for:
   - `console.log`, `debugger`
   - `TODO`, `FIXME`
   - `.only`, `.skip`, `--no-verify`, `eslint-disable`
   - strings that look like secrets (keys, tokens, passwords)
   - any staged or committed file named `.env*` (except `.env.example`) or under `playwright/.auth/`
8. **Sensitive paths.** List the changed files that match `sensitivePaths`. Say whether the security review ran on them.
9. **Manual checks.** List what a person must still check: the ticket's demo line, and any UI check the ticket asks for.

## Report

One block per check, in this order: the check name, then PASS, FAIL (with the reason), or NOT CHECKED (with the reason).

End with one line: `Ready to merge` or `Not ready to merge`, followed by the reason in a few words. Do not say "ready" if any check is FAIL or NOT CHECKED, except a NOT CHECKED that the user has already accepted.
