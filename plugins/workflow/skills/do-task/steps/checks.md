# Step: checks

No gate. Goal: the project's own verify commands pass on the change.

## How

1. Run the commands from `verify` in the config, in this order: `lint`, `typecheck`, `test`, `build`. Add `e2e` when the config lists it and the diff touches UI.
2. Use the commands exactly as the config gives them. Do not invent a command, and do not skip one.
3. If a command fails, fix the cause and run the failing command again. Repeat the loop at most 3 times.
4. When all commands pass, log `checks` with the command list and the pass counts.

## Stop and report when

- a command still fails after 3 fix rounds: show the failing output and stop,
- a command is missing from the config: ask the user to add it,
- the fix would need a change outside the ticket: ask first.

## Rules

- Never disable a check to get it to pass: no `.skip`, `.only`, `--no-verify`, or `eslint-disable`.
- Never change a verify command to make it pass.
