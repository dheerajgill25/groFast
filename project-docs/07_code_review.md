---
schema_version: "0.4"
---

# 07 — Code Review

> **Phase 7.** Final quality gate before release. AI scans the merged code; a senior engineer makes the call.
>
> **Project:** GroFast
> **Reads:** the merged code, `06_testing.md`, KB
> **Writes:** this file

---

## 1. Scope of review

- **Branch / commit reviewed:** [OPEN]
- **PRs in scope:** [OPEN]
- **Date:** 2026-07-10

## 2. Automated scan summary

| Category | Findings | Severity breakdown |
|----------|----------|---------------------|
| Style / lint | 0 | — |
| Type checks | 0 | — |
| Security patterns | 0 | high: 0 / med: 0 / low: 0 |
| Performance regressions | 0 | — |
| Architecture-spec adherence | 0 deviations | — |

## 3. Findings

| ID | Severity | Category | File / location | Description | Suggested fix | Status |
|----|----------|----------|------------------|-------------|----------------|--------|
| F-1 | | | | | | open |

## 4. Architecture conformance check

| Architecture rule | Conforming? | Evidence |
|--------------------|--------------|----------|
| Service boundaries respected (per `02b_architecture.md` §4) | yes / no | [OPEN] |
| Auth flow as specified (§8) | yes / no | [OPEN] |
| Logging / observability hooks present (§9) | yes / no | [OPEN] |

## 5. Security review

- **Secrets in code?** none / found (list)
- **Input validation gaps?** [OPEN]
- **AuthN / AuthZ checks at every endpoint?** [OPEN]
- **Dependency CVE scan?** clean / issues (list)

## 6. Performance review

- **N+1 queries spotted?** [OPEN]
- **Hot loops without bounded work?** [OPEN]
- **Cache invalidation correct?** [OPEN]

## 7. Waivers

| Finding | Waiver reason | Approved by | Tracked in |
|---------|---------------|-------------|-------------|
| F-N | | | (issue link) |

## 8. Open items

- [ ] [OPEN]

---


## Revision history

| # | Date | Triggered by | Scope of change | Re-frozen by |
|---|------|---------------|------------------|---------------|
| v1 | (initial freeze date) | Initial | (initial freeze) | (filled at first /X-freeze) |

> Each subsequent /X-freeze appends a row here, tagged with the active CR ID (if any).
> The most-recent freeze is the current canonical state. The history is the audit trail.

## Sign-off

- **Reviewer:** _<full name — required>_
- **Role:** Senior engineer
- **Timestamp:** _<ISO 8601>_
- **Status:** ⚪️ Not frozen
- **Recommendation:** approve / request changes / reject

> _The `/code-review-freeze` skill seals this file and unlocks `/release-freeze`._
