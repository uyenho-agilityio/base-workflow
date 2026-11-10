# Step: design

Goal: reach a shared understanding of the ticket before any plan is written.

## How

1. Run the `mattpocock-skills:grilling` skill on the ticket: its user story, acceptance checklist, and "Blocked by" notes. Its questions go to the user, in rounds.
2. Every round, after the user answers, append the round to `design.md` in the specs directory: the questions, the answers, and which branches are now settled. Write it before the next round, so a stopped run can resume here.
3. Facts come from the repository, not from the user. When a question needs one (a library API, an existing file, a config value), find it first, using `node_modules/` docs or the code. Ask the user only for decisions.
4. The step is done when the frontier is empty and the user confirms the shared understanding. Write that confirmation into `design.md`, then log `design`.

## Rules

- Do not write code or plan files in this step.
- Do not invent a rule that the ticket, the spec, or the user did not give. Ask.
- Design confirmation is not a separate gate. It is shown together with the plan at Gate 1.
