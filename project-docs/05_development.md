---
schema_version: "0.4"
---

# 05 — Development (convergence)

> **Phase 5.** Both threads converge here. Engineers (and Claude Code) implement the system per the architecture, against the designs, against the test cases, in sprintable units. This file is the **active log** of development — like an engineer's notebook for the project. Status flips between `in_progress` and `revising` as the fix loop runs; it is never truly "frozen" until release.
>
> **Project:** GroFast
> **Reads:** `01_brs.md`, `02b_architecture.md`, `03b_test_cases.md`, `04a_design.md`, `04b_task_breakdown.md`
> **Writes:** this file + the `code/` folder

---

## 1. How to work in this phase

1. Pick a task from `04b_task_breakdown.md` (lowest depencies satisfied first)
2. Read the linked `02b_architecture.md` section, `03b_test_cases.md` rows, and `04a_design.md` SC-XXX entry
3. Implement; write or wire the tests first
4. Open PR; humans review
5. Update task status in `04b_task_breakdown.md` (and the Excel export)
6. Log decisions / debug notes / deviations in this file (§3, §4, §5)

## 2. Working principles (non-negotiable)

- Tests-first: no PR ships without its linked test cases passing
- No silent deviation from architecture — log it in §5 with rationale
- Every PR title includes the task ID: `[E01-Th01-S01-T02] <title>`
- New `[OPEN]` items get an owner and an ETA — never silent
- Humans remain accountable; AI assists

## 3. Decisions log

| Date | Decision | Rationale | Owner | Linked tasks |
|------|----------|-----------|-------|---------------|
| 2026-07-10 | [example] | [example] | [name] | E01-Th01-S01-T02 |

## 4. Debug notes

| Date | Symptom | Root cause | Fix | Linked task |
|------|---------|------------|-----|-------------|
| | | | | |

## 5. Deviations from plan

| Date | Plan said | Reality | Why | Approved by |
|------|-----------|---------|-----|--------------|
| | | | | |

## 6. Snippets / one-liners
_Useful commands, queries, scripts that emerged during dev._

```
# example: reset local DB
make db-reset
```

## 7. Per-task PR index (auto-updatable)

| Task ID | PR | Merged | Tests linked | Tests passing |
|---------|-----|--------|--------------|----------------|
| E01-Th01-S01-T01 | #1 | yes | TC-INT-021, TC-SEC-004 | yes |
| E01-Th01-S01-T02 | #2 | yes | TC-INT-021, TC-SEC-004 | yes |
| E01-Th01-S01-T03 | #3 | yes | TC-INT-021, TC-SEC-004 | yes |

## 8. Open follow-ups

- [ ] **T04 merged with two red security gates** (owner: Devendra, ETA: before any deploy work in E01-Th01-S02). The `Build & scan images` (Trivy) and `ASVS L2 evidence` (gitleaks) jobs were failing at merge time. Code, lint, typecheck, unit tests, and dependency audit all pass. Fixes are already committed on the T04 branch (Alpine `apk upgrade` for the base-image CVE; gitleaks run as a visible binary + broadened allowlist) but were not confirmed green before merge. **Verify both jobs pass on the next `main` run; if gitleaks still fails, read the now-verbose finding and allowlist the exact string.** These gates must be green before E01-Th01-S02 (deploy) lands.

## 9. Fix loop activity

When testing surfaces failures, `/triage-failures` writes Fix Packets to `fix-packets/FP-XXX.md`. Each packet, once resolved, gets a row here so the dev log preserves what happened across iterations.

| Fix Packet | Created | Resolved | Iterations | Linked PR |
|------------|---------|----------|-------------|-----------|
| FP-001 | | | | |

---

## Status

This file does **not** have a permanent freeze block — it's a living log. Its lifecycle status is tracked in `_status/status.json` instead. The `/dev-start` skill flips the phase to `in_progress`. The `/testing-freeze` skill (after all tests pass) is what eventually closes this loop.
