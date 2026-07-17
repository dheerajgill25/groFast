---
schema_version: "0.4"
---

# 08 — Release

> **Phase 8.** Ship to production. AI runs the pipeline; DevOps owns the call.
>
> **Project:** GroFast
> **Reads:** approved code, `07_code_review.md`, KB
> **Writes:** this file

---

## 1. Release identity

| | |
|---|---|
| **Version** | v0.1.0 |
| **Commit / tag** | [OPEN] |
| **Release date** | 2026-07-10 |
| **Release engineer** | [OPEN] |
| **Strategy** | direct / canary / blue-green / feature-flagged |

## 2. Pre-deploy checklist

- [ ] All tests green (`06_testing.md` frozen)
- [ ] Code review approved (`07_code_review.md` frozen)
- [ ] Migrations reviewed and rehearsed in staging
- [ ] Rollback plan documented (§5)
- [ ] Feature flags configured (if applicable)
- [ ] Monitoring & alerting verified
- [ ] Stakeholders notified

## 3. Deploy log

| Timestamp | Step | Outcome | By |
|-----------|------|---------|-----|
| | build | | |
| | migrate | | |
| | deploy canary 5% | | |
| | promote 100% | | |

## 4. Post-deploy monitoring (first 24h)

| Metric | Baseline | Post-deploy | Status |
|--------|----------|--------------|--------|
| Error rate | | | ok / warn / fail |
| p95 latency | | | ok / warn / fail |
| Throughput | | | ok / warn / fail |
| Custom metric: [OPEN] | | | |

## 5. Rollback plan

- **Trigger:** [OPEN — what would force a rollback]
- **Procedure:** [OPEN — exact commands or runbook link]
- **Time-to-rollback:** [OPEN — target SLO]
- **Owner during release window:** [OPEN]

## 6. Incidents during rollout

| Time | Incident | Impact | Resolution | Owner |
|------|----------|--------|-------------|-------|
| | | | | |

## 7. Communications

- **Pre-deploy notice sent:** [link / channel]
- **Post-deploy summary:** [link / channel]
- **Status page updated:** yes / no / n/a

## 8. Open items / follow-ups

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
- **Role:** DevOps engineer
- **Timestamp:** _<ISO 8601>_
- **Status:** ⚪️ Not frozen
- **Released:** yes / no / rolled back

> _The `/release-freeze` skill seals this file. The project is then complete._
