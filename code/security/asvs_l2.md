# OWASP ASVS L2 — GroFast security checklist

> Evidence surface for **TC-SEC-004** and **NFR-5**. CI (`.github/workflows/ci.yml`
> → `security` job) checks this file exists on every PR; reviewers tick items as
> the surfaces that need them land. A checked box must link to the code or test
> that satisfies it — an unlinked tick is not evidence.

Status: 🟡 in progress — most items unlock as their module lands. This file is
the standing ledger; it is never "done" until launch hardening (E08-Th02).

## V1 — Architecture, design & threat modelling
- [ ] Trust boundaries documented (02b §3) and reviewed per epic

## V2 — Authentication (auth module, FR-1)
- [ ] Phone-OTP rate limiting + lockout (E01-Th03-S01-T02)
- [ ] JWT short-lived + refresh rotation, revocation on logout
- [ ] No credential or OTP logged (structured-log PII redaction, E01-Th02-S01-T03)

## V3 — Session management
- [ ] Refresh tokens rotated and single-use
- [ ] Server-side session invalidation honoured

## V4 — Access control (RBAC, FR-29)
- [ ] Deny-by-default; every admin route role-checked
- [ ] IDOR: object access scoped to owner/tenant — cross-user fetch returns 403/404
      (TC-SEC-004 step 2)

## V5 — Validation, sanitisation & encoding
- [x] All external input validated at the edge with zod schemas
      (`@grofast/contracts`, E01-Th01-S01-T02)
- [ ] Parameterised queries only; no string-built SQL (TC-SEC-004 step 1)
- [ ] Output encoding on every admin-rendered field — SKU name, address, rating
      (TC-SEC-004 step 3, stored-XSS)
- [ ] CSV import hardened against formula injection (partner feeds, FR-23)

## V6 — Stored cryptography
- [ ] PII encrypted at rest (AES-256); no raw card data stored — gateway
      tokenisation only (NFR-5, NFR-6)

## V7 — Error handling & logging
- [x] Error envelope leaks no internals in prod (`apiErrorSchema.details` dev-only)
- [ ] Money/stock mutations covered by immutable audit log (NFR-10, audit module)

## V8 — Data protection (DPDP)
- [ ] Consent capture + data-deletion/anonymisation flow (E08-Th02, FR for DPDP)

## V9 — Communications
- [ ] TLS everywhere; HSTS at the edge (E01-Th01-S02-T06)

## V12 — Files & resources
- [ ] Delivery-proof photo uploads validated (type/size) and access-scoped

## V13 — API
- [ ] Rate limiting at the gateway
- [ ] Webhooks verified by signature + idempotency key (payments, FR-10)

## V10 — Malicious code / supply chain
- [x] SBOM generated per image build (Syft, SPDX) — E01-Th01-S01-T04
- [x] Container image scanned for HIGH/CRITICAL CVEs, fixable ones block the build
      (Trivy) — E01-Th01-S01-T04
- [x] Images run as non-root (`USER node`) — E01-Th01-S01-T04

## Automated in CI today
- [x] Dependency vulnerability audit — high/critical block the PR
- [x] Secret scanning (gitleaks) on every PR
- [x] Module-boundary lint (limits blast radius of any one module, E01-Th01-S01-T02)
- [x] SBOM + container CVE scan on every image build (E01-Th01-S01-T04)
