# Step: plan (Gate 1)

Goal: the user approves the confirmed design, the plan, and the test seams in one stop. Nothing is built before that.

## How

1. **Read the inputs:** `design.md` from the design step, the ticket, and the spec sections the ticket cites. Confirm each library API in `node_modules/` (or the project's docs) before you use it in the plan. Do not rely on memory.
2. **Write `plan.md`** in the specs directory:
   - the files to create and change, one line each,
   - the test seams: each seam is one unit test file or one e2e step,
   - a requirements table that maps every acceptance criterion to a task and a test. Criteria are the lines matching `criteriaPattern` in the ticket. Number them R1, R2, and so on, in the ticket's order:

     ```markdown
     ## Ticket requirements

     | R | Task | Test (seam) |
     | --- | --- | --- |
     | R1 — <criterion in the ticket's words> | Task 1: <what changes> | <test file or e2e step> |
     ```

     Every `R` needs a task and a test. A criterion that no task covers is a gap: fix the plan, do not drop the row.
3. **Run the `plan-reviewer` agent** on `plan.md`. It checks that every `R` in the table has a task and a test, seams, design match, scope, unverified APIs, and invented rules. Fix what it finds before you show the plan.
4. **Show the user together:** the design summary, `plan.md`, and the seams. Wait.
5. **Revise if asked.** A change to the plan goes back into `plan.md` and is shown again. Log only after the final approval.
6. **Log `gate1`** after approval.

## Rules

- Write only inside the specs directory until approval.
- If a seam is not agreed, stop and ask. Do not invent one.
- If the plan has no seams (nothing to build), write no `slice` line later. Stop, say so, and ask the user whether to close the ticket or add seams.
