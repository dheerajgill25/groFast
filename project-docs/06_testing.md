---
schema_version: "0.4"
---

# 06 — Testing

> **Phase 6.** Run the test suite from `03b_test_cases.md` against what `05_development.md` built. Failures feed the **fix loop** via Fix Packets. This phase iterates with Phase 5 until all tests are green and QA signs off.
>
> **Project:** GroFast
> **Reads:** `03b_test_cases.md`, `_readable/03b_test_cases.xlsx`, the actual built system
> **Writes:** this file + updates to the Excel + `fix-packets/FP-XXX.md`

---

## 1. Run record

> One row per test run. Reverse chronological — newest at top.

| Run # | Date | Triggered by | Env | Total | Passed | Failed | Flaky | Skipped | Notes |
|-------|------|---------------|-----|-------|--------|--------|--------|---------|-------|
| 1 | 2026-07-10 | [name] | local / ci / staging | 0 | 0 | 0 | 0 | 0 | initial run |

## 2. Failure detail (rich context for fix loop)

> When a test fails, capture the full context so `/triage-failures` can group intelligently and `/back-to-dev` can hand a useful packet to Claude Code. Reset this section between runs (move resolved entries to §3 archive).

### TC-FUNC-001 — [test title] — ❌ FAIL (run #__)

- **Linked requirement:** FR-1
- **Linked task:** E01-Th01-S01-T02
- **File / module under test:** `code/apps/api/src/handlers/signup.ts`
- **Test file:** `code/apps/api/tests/signup.spec.ts`
- **Input data:**
  ```json
  {"email": "test@example.com", "password": "Pass123!"}
  ```
- **Expected:** 200 + body `{token: <jwt>}`
- **Actual:** 401 + body `{"error": "invalid signature"}`
- **Stack trace:**
  ```
  …
  ```
- **Last passed:** never (new test) | run #__ | n/a
- **Hypothesis:** [OPEN]
- **Related tests in same module:** TC-FUNC-002 (passed), TC-NEG-005 (failed)

_(repeat per failed test)_

## 3. Resolved failures (this release)
_Move entries from §2 here once their Fix Packet is closed._

| Test ID | Failure summary | Fix Packet | PR | Closed on |
|---------|-----------------|-------------|-----|-----------|
| | | | | |

## 4. Visual diff results (for `TC-VIS-` tests)

| Test ID | Screen | Diff | Threshold | Status |
|---------|--------|------|-----------|--------|
| TC-VIS-001 | SC-001 | 0.4% | 1% | pass |

## 5. Performance test results (for `TC-PERF-` tests)

| Test ID | Metric | Target | Actual | Status |
|---------|--------|--------|--------|--------|
| TC-PERF-001 | p95 signup latency | < 500ms | __ ms | pass / fail |

## 6. Privacy / authorization tests (for `TC-SEC-`)

| Test ID | Check | Status |
|---------|-------|--------|
| TC-SEC-001 | Unauthorized request returns 401 | pass / fail |

## 7. Defects log
_Bugs that aren't a single failed test — broader regressions, env issues, etc._

| ID | Title | Severity | Linked tests / tasks | Status |
|----|-------|----------|----------------------|--------|
| D-1 | | | | open |

## 8. Open items
- [ ] [OPEN]

---


## Revision history

| # | Date | Triggered by | Scope of change | Re-frozen by |
|---|------|---------------|------------------|---------------|
| v1 | (initial freeze date) | Initial | (initial freeze) | (filled at first /X-freeze) |

> Each subsequent /X-freeze appends a row here, tagged with the active CR ID (if any).
> The most-recent freeze is the current canonical state. The history is the audit trail.

## Sign-off (only when all tests are green)

- **Reviewer:** _<full name — required>_
- **Role:** QA lead
- **Timestamp:** _<ISO 8601>_
- **Status:** ⚪️ Not frozen
- **Final test counts:** total __ · passed __ · failed __ · flaky __ · skipped __

> _The `/testing-freeze` skill refuses to seal this file unless **all required-priority tests pass**. Pass-by-fail-not-blocking is recorded in §7 with explicit waivers. Sealing unlocks `/code-review-freeze`._
