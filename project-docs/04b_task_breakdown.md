---
schema_version: "0.4"
---

# 04b — Task Breakdown (Build Thread)

> **Phase 4b.** Convert the architecture and test cases into sprintable units. Hierarchy is **Epic → Theme → Story → Task**. Every task carries the linked test-case IDs that must pass for it to be considered done. This is the file Claude Code will primarily consume during development.
>
> **Project:** GroFast · **Reads:** `02b_architecture.md`, `03b_test_cases.md` · **Writes:** this file
>
> Excel export: `_readable/04b_task_breakdown.xlsx` — sprint board view.

---

## 1. ID convention

```
E##-Th##-S##-T##
└─ Epic    (module)
    └─ Theme   (slice within the module)
        └─ Story   (user-visible capability)
            └─ Task    (Claude-Code-or-human-actionable unit)
```

All numbers are **zero-padded two digits**. Stable IDs — never renumber.

## 2. Owner enum

| Owner | Meaning |
|---|---|
| `claude-code` | Claude Code generates the initial PR; humans review |
| `human` | Genuinely needs a human (config, vendor decision, design judgment) |
| `either` | Either path works; pick whatever is faster on the day |

> **Default owner for this project:** `claude-code` — reads as **"Claude Code (AI dev), reviewed by Devendra"**. Every task below is `claude-code` unless the row says otherwise; `human` rows are the ones needing a vendor account, a device, a physical drill, or a compliance signature.

## 3. Status enum

`not_started` · `in_progress` · `in_review` · `blocked` · `done`

## 4. Epic list

| ID | Epic | Description | Size (S/M/L/XL) | Sprint hint |
|----|------|-------------|------------------|-------------|
| E01 | Platform foundation | Monorepo, CI/CD, Terraform IaC, K8s + 3 envs, observability baseline, auth (phone-OTP + admin), RBAC, audit, event backbone (outbox → Redpanda), API gateway | L | Sprint 1–2 |
| E02 | Catalog & discovery | Serviceability zones (PostGIS), catalog + per-store price/availability, Meilisearch indexer + search API, cart, pricing/fees/coupons/GST invoice | L | Sprint 2–3 |
| E03 | Ordering & payments | Orders state machine + outbox events, atomic stock reservation, payments adapter + intents + webhooks + reconciliation + refunds, COD (confirmed for v1, BR-5 caps) | XL | Sprint 3–5 |
| E04 | Fulfillment & logistics | Picker workflow, dispatch/rider assignment, rider pickup–drop flow, realtime gateway + live tracking, notifications engine | L | Sprint 4–6 |
| E05 | Inventory & partners | Dark-store inventory (GRN, adjustments, cycle counts, low-stock alerts), partner onboarding + feed ingestion + staleness/BR-6 | M | Sprint 4–5 |
| E06 | Client apps | Customer React Native app, customer Next.js web storefront, rider React Native app | L | Sprint 5–7 |
| E07 | Admin dashboard | Ops live dashboard + exception queue, order management, catalog/inventory/partner/zone/coupon/user consoles, analytics + warehouse + daily digest | L | Sprint 5–7 |
| E08 | Hardening & launch | Perf/load, security + DPDP, chaos/resilience, seed data, launch runbooks | M | Sprint 7–8 |

## 5. Theme / Story / Task breakdown

> One section per Epic. The Excel export flattens this into rows.

> **Reading the task tables.** Columns are `Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status`.
> `Dev tool` column maps to `02b_architecture.md` §13. Allowed values: `claude-code`, `gemini`, `antigravity`, `cursor`, `human`, `either`, `tbd`, `inherit`. **Project default is `inherit`** (Mod #7 cascade) — the layer's Implementer tool from §13 applies: Backend → `claude-code`, Frontend → `gemini`/`antigravity`/`cursor`/`human` (reviewed by `claude-code`), Mobile → `claude-code` (reviewed by `human`).
> `Estimate` uses S (≤ 1 d) / M (2–3 d) / L (4–5 d). `Priority` uses P0/P1/P2.
> **COD is CONFIRMED for v1** (BRS §13, resolved 2026-07-10, BR-5 caps). All COD tasks below are unconditional — no `[COND-COD]` markers remain in this file.

---

### E01 — Platform foundation

#### Th01 — Repository, CI/CD & infrastructure-as-code

##### S01 — As an engineer, I want a monorepo with enforced module seams and a green pipeline, so that every later task lands on a working, checked baseline

**Acceptance criteria:**
- [ ] `pnpm install && pnpm build && pnpm test` green from a clean clone
- [ ] Cross-module table/import access fails lint (the monolith's seams are compile-time real, per Arch §4)
- [ ] Every PR runs lint + typecheck + unit + container build + dependency/container scan
- [ ] Staging deploys automatically on merge to `main`; prod deploy requires a manual gate

**Linked FRs:** — (enabling)
**Linked test cases:** TC-INT-021, TC-SEC-004
**Linked screens:** —
**Architecture refs:** `02b_architecture.md` §2 (CI/CD), §4, §10

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E01-Th01-S01-T01 | Monorepo scaffold | pnpm workspace with `code/backend` (NestJS `grofast-core`), `code/mobile`, `code/frontend`, shared design-system + types packages, TS strict config. | claude-code | inherit | — | TC-INT-021 | M | P0 | not_started |
| E01-Th01-S01-T02 | Module boundary lint + shared contracts | ESLint import-boundary rules per NestJS module, schema-per-module DB conventions, shared zod/DTO contract package consumed by all clients. | claude-code | inherit | E01-Th01-S01-T01 | TC-INT-021 | S | P0 | not_started |
| E01-Th01-S01-T03 | CI pipeline for PRs | GitHub Actions: lint, typecheck, unit + integration tests against ephemeral Postgres/Redis, coverage gate, ASVS L2 checklist evidence job. | claude-code | inherit | E01-Th01-S01-T02 | TC-SEC-004 | M | P0 | not_started |
| E01-Th01-S01-T04 | Container build, registry & supply-chain scan | Multi-stage images for core/realtime/worker/web, SBOM, dependency + container vulnerability scanning on every build. | claude-code | inherit | E01-Th01-S01-T03 | TC-SEC-004 | S | P0 | not_started |
| E01-Th01-S01-T05 | Deploy pipeline + migration pre-deploy job | Staging auto-deploy, prod deploy behind manual gate, forward-only SQL migrations with advisory locks as a pre-deploy job (Arch §10). | claude-code | inherit | E01-Th01-S01-T04 | TC-INT-021, TC-PERF-004 | M | P0 | not_started |

##### S02 — As an eng lead, I want all three environments defined in Terraform on a vendor-portable K8s baseline, so that we can pick the cloud vendor late without redesign

**Acceptance criteria:**
- [ ] dev / staging / prod stand up from `terraform apply` per workspace, no console clicks
- [ ] No data store publicly reachable; all secrets from the cloud secret manager, none in git
- [ ] Postgres multi-AZ + PITR + 1 read replica; Redis HA; Redpanda 3-node across 3 AZs
- [ ] **[OPEN — cloud vendor]** every task in this story is written against a vendor-portable interface; vendor-specific module wiring is the only thing gated

**Linked FRs:** — (enabling NFR-3, NFR-4)
**Linked test cases:** TC-PERF-004, TC-PERF-007
**Linked screens:** —
**Architecture refs:** `02b_architecture.md` §7, §11, §12

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E01-Th01-S02-T01 | Terraform skeleton, workspaces & remote state | **[OPEN: cloud vendor]** Root modules, per-env workspaces, locked remote state, provider abstraction so the vendor choice is one module swap. | claude-code | inherit | E01-Th01-S01-T01 | TC-PERF-004 | M | P0 | not_started |
| E01-Th01-S02-T02 | Network + managed Kubernetes cluster | **[OPEN: cloud vendor]** VPC (public LB / private cluster / isolated data subnets, NAT egress), managed K8s, `general` + `realtime` node pools, HPA baseline. | claude-code | inherit | E01-Th01-S02-T01 | TC-PERF-004, TC-PERF-007 | L | P0 | not_started |
| E01-Th01-S02-T03 | Managed Postgres + PostGIS, replica, PITR | **[OPEN: cloud vendor]** Multi-AZ primary + 1 read replica, PostGIS extension, WAL archiving/daily snapshots (35 d PITR), restore-drill script. | claude-code | inherit | E01-Th01-S02-T01 | TC-PERF-007 | M | P0 | not_started |
| E01-Th01-S02-T04 | Managed Redis (HA pair) | **[OPEN: cloud vendor]** HA Redis for cache, cart hot copy, OTP/rate-limit counters, rider GEO set, pub/sub channels; snapshot policy. | claude-code | inherit | E01-Th01-S02-T01 | TC-PERF-001, TC-PERF-008 | S | P0 | not_started |
| E01-Th01-S02-T05 | Redpanda + Meilisearch StatefulSets | 3-node Redpanda on SSD PVs across 3 AZs with tiered retention; Meilisearch primary + read replica StatefulSet. | claude-code | inherit | E01-Th01-S02-T02 | TC-PERF-002, TC-PERF-008 | M | P0 | not_started |
| E01-Th01-S02-T06 | Object storage, CDN + WAF edge | **[OPEN: cloud vendor]** S3-compatible buckets (images, invoices, proofs, feeds) with lifecycle/versioning; CDN + WAF + edge rate limits (OTP endpoints) + TLS 1.2+ termination. | claude-code | inherit | E01-Th01-S02-T01 | TC-SEC-001, TC-PERF-001 | M | P0 | not_started |
| E01-Th01-S02-T07 | Secret management & rotation | **[OPEN: cloud vendor]** Cloud secret manager as source of truth → external-secrets into K8s; gateway keys, webhook HMAC secrets, JWT signing keys with `kid` overlap rotation. | claude-code | inherit | E01-Th01-S02-T02 | TC-SEC-006, TC-SEC-002 | M | P0 | not_started |

#### Th02 — Observability baseline

##### S01 — As an on-call engineer, I want traces, metrics, logs and SLO alerts from day one, so that the order path is debuggable before it carries money

**Acceptance criteria:**
- [ ] One stitched trace spans gateway → core → outbox → worker for a placed order
- [ ] Business metrics (orders/min, payment success, ETA hit rate, consumer lag, socket count) are first-class
- [ ] Zero PII in logs or traces
- [ ] Every alert links a runbook

**Linked FRs:** — (NFR-8)
**Linked test cases:** TC-INT-021, TC-SEC-011
**Linked screens:** —
**Architecture refs:** `02b_architecture.md` §9

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E01-Th02-S01-T01 | OpenTelemetry tracing across all deployables | OTel SDK in core/realtime/workers; 100% sampling on the order path, 10% elsewhere; trace ID carried into the outbox envelope so async legs stitch. | claude-code | inherit | E01-Th01-S01-T02 | TC-INT-021 | M | P1 | not_started |
| E01-Th02-S01-T02 | Prometheus + Grafana: RED + business metrics | Per-endpoint/module RED metrics plus orders/min, payment success rate, ETA hit rate, OOS-after-order rate, feed freshness, consumer lag, socket count; dashboards mirroring BRS objectives. | claude-code | inherit | E01-Th01-S02-T02 | TC-INT-021 | M | P1 | not_started |
| E01-Th02-S01-T03 | Structured logging with PII redaction | JSON logs (request/trace ID, actor, module) shipped to Loki; logger-layer redaction of phone/address/instrument patterns; 30 d hot / 13 mo cold. | claude-code | inherit | E01-Th02-S01-T01 | TC-SEC-011 | S | P1 | not_started |
| E01-Th02-S01-T04 | SLO burn-rate alerts + runbooks | Multi-window burn-rate alerts on NFR-1/2/3; hard alerts for payment success < 95%, reconciliation backlog, refund SLA, consumer lag, feed staleness; runbook per alert. | claude-code | inherit | E01-Th02-S01-T02 | TC-INT-021, TC-INT-009 | M | P1 | not_started |

#### Th03 — Identity, RBAC & audit

##### S01 — As a customer/rider, I want to log in with my phone and an OTP, so that I never manage a password

**Acceptance criteria:**
- [ ] OTP delivered ≤ 30 s; login within ≤ 2 attempts; wrong/expired OTP always rejected
- [ ] Access JWT RS256 15 min + rotating hashed refresh (30 d) with reuse detection revoking the family
- [ ] Rate caps 3/min, 10/day per number plus per-IP caps, constant-time compare
- [ ] A rider token can never call customer or admin APIs

**Linked FRs:** FR-1
**Linked test cases:** TC-FUNC-001, TC-FUNC-002, TC-NEG-001, TC-SEC-001, TC-SEC-002, TC-SEC-003
**Linked screens:** SC-001, SC-002 (customer auth / OTP), SC-021 (rider login — same OTP pattern)
**Architecture refs:** `02b_architecture.md` §2 (Auth), §8

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E01-Th03-S01-T01 | User entity + OTP issue/verify | `user` table (encrypted phone, HMAC lookup index, consent flags), OTP generation/expiry, constant-time compare, DLT SMS send port with sandbox impl. | claude-code | inherit | E01-Th01-S01-T02, E01-Th01-S02-T03 | TC-FUNC-001, TC-NEG-001 | M | P0 | not_started |
| E01-Th03-S01-T02 | OTP abuse protection | Per-number (3/min, 10/day) and per-IP Redis counters, backoff/lockout, SMS-pump pattern alerting, edge WAF rules wired to app caps. | claude-code | inherit | E01-Th03-S01-T01, E01-Th01-S02-T06 | TC-SEC-001, TC-NEG-001 | M | P0 | not_started |
| E01-Th03-S01-T03 | JWT issue + refresh rotation with reuse detection | RS256 15-min access tokens with `kid` rotation, 30-day rotating refresh tokens hashed at rest, reuse detection revoking the token family. | claude-code | inherit | E01-Th03-S01-T01, E01-Th01-S02-T07 | TC-FUNC-002, TC-SEC-002 | M | P0 | not_started |
| E01-Th03-S01-T04 | Audience claims + gateway auth guard | Customer/rider/admin audience claims, device-binding claim for riders, server-side verification at the gateway guard; cross-audience calls 401/403 and logged. | claude-code | inherit | E01-Th03-S01-T03 | TC-SEC-003 | S | P0 | not_started |

##### S02 — As an admin owner, I want role-based access with TOTP, so that staff only see their tools and every denial is on the record

**Acceptance criteria:**
- [ ] Roles `ops`, `catalog`, `finance`, `partner`, `read-only`, `super-admin` enforced server-side, never client-only
- [ ] Partner users row-scoped to their own store; ID enumeration returns 403/404
- [ ] Every denied attempt produces an audit row with actor + denied action

**Linked FRs:** FR-29
**Linked test cases:** TC-FUNC-033, TC-NEG-033, TC-SEC-003, TC-SEC-012
**Linked screens:** SC-028 (admin login / RBAC), SC-043 (user & role management)
**Architecture refs:** `02b_architecture.md` §8

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E01-Th03-S02-T01 | Admin/staff auth: email + argon2 + mandatory TOTP | Staff user model, argon2 password hashing, TOTP enrolment/verify, 8-hour sessions. | claude-code | inherit | E01-Th03-S01-T03 | TC-FUNC-033 | M | P0 | not_started |
| E01-Th03-S02-T02 | RBAC role/permission model + guards | Role→permission matrix, NestJS guard layer enforcing per-module permissions server-side, JWT role claims, read-only role mutation block. | claude-code | inherit | E01-Th03-S02-T01 | TC-FUNC-033, TC-NEG-033 | M | P0 | not_started |
| E01-Th03-S02-T03 | Partner user row-scoping | Partner-role tokens scoped to `store_id`; list/detail endpoints filtered at the query layer; enumeration attempts rejected. | claude-code | inherit | E01-Th03-S02-T02 | TC-SEC-012 | S | P0 | not_started |
| E01-Th03-S02-T04 | Denied-attempt audit logging | Every 403 from the RBAC guard emits an audit event with actor, actor_role, attempted action and entity. | claude-code | inherit | E01-Th03-S02-T02, E01-Th03-S03-T01 | TC-NEG-033, TC-SEC-012 | S | P0 | not_started |

##### S03 — As a compliance owner, I want an immutable audit log covering every money/stock mutation, so that NFR-10 holds by construction

**Acceptance criteria:**
- [ ] `audit_event` append-only — UPDATE/DELETE blocked at the DB level
- [ ] Audit rows are written from outbox events committed in the same transaction as the mutation
- [ ] Actor, actor_role, before/after and reason are mandatory in the event schema

**Linked FRs:** FR-22, FR-26, FR-29
**Linked test cases:** TC-SEC-009, TC-INT-001, TC-INT-003
**Linked screens:** —
**Architecture refs:** `02b_architecture.md` §6a (audit_event), §5f (NFR-10)

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E01-Th03-S03-T01 | Append-only audit schema + append API | `audit_event` monthly-partitioned table, DB-level UPDATE/DELETE revoke, append API with mandatory actor/reason, 7-year retention + yearly archive to object storage. | claude-code | inherit | E01-Th01-S02-T03 | TC-SEC-009 | M | P0 | not_started |
| E01-Th03-S03-T02 | Audit consumer from `audit.*` topic | Idempotent worker projecting `audit.*` outbox events into `audit_event`; duplicate delivery yields exactly one row. | claude-code | inherit | E01-Th03-S03-T01, E01-Th04-S01-T03 | TC-INT-003, TC-INT-001 | S | P0 | not_started |

#### Th04 — Event backbone, gateway & runtime

##### S01 — As the platform, I want a transactional outbox relayed to Redpanda plus a worker/realtime runtime, so that domain events are never lost and never double-applied

**Acceptance criteria:**
- [ ] An event can never exist without its state change, and a committed state change always publishes (at-least-once across crashes)
- [ ] Consumers are idempotent under duplicate delivery and safe under full topic replay
- [ ] Money-path writes without an `Idempotency-Key` header are rejected 400
- [ ] Signed payment webhooks ingress through the gateway only

**Linked FRs:** FR-10, FR-12, FR-28
**Linked test cases:** TC-INT-001, TC-INT-002, TC-INT-003, TC-INT-004, TC-INT-020
**Linked screens:** —
**Architecture refs:** `02b_architecture.md` §2a, §3a (C-6, C-8, C-9), §5a

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E01-Th04-S01-T01 | Outbox table + in-transaction write helper | Month-partitioned `outbox` table, partial index `WHERE published_at IS NULL`, transactional helper every module uses to emit events inside its own commit. | claude-code | inherit | E01-Th01-S02-T03 | TC-INT-001 | M | P0 | not_started |
| E01-Th04-S01-T02 | Outbox relay worker (at-least-once) | Poller/relay publishing unpublished rows to Redpanda, crash-safe with `published_at` marking; survives kill between commit and publish. | claude-code | inherit | E01-Th04-S01-T01, E01-Th01-S02-T05 | TC-INT-002, TC-INT-001 | M | P0 | not_started |
| E01-Th04-S01-T03 | Topics, versioned envelope & consumer framework | Topic provisioning (`order.*`, `payment.*`, `stock.*`, `rider.*`, `feed.*`, `audit.*`), versioned envelope with trace ID, worker-pool entrypoint, processed-event key store for idempotency, replay-safety flag for side-effecting consumers. | claude-code | inherit | E01-Th04-S01-T02 | TC-INT-003, TC-INT-004 | L | P0 | not_started |
| E01-Th04-S01-T04 | API gateway / BFF ingress | Single ingress: TLS, JWT validation, routing to core vs realtime, per-client request shaping, `Idempotency-Key` enforcement on money-path writes, signed payment-webhook ingress route. | claude-code | inherit | E01-Th03-S01-T04 | TC-INT-020 | M | P0 | not_started |
| E01-Th04-S01-T05 | Realtime gateway skeleton | Stateless WebSocket deployable: auth handshake against JWT audience, connection registry, Redis pub/sub wiring, health/socket-count metrics for HPA. | claude-code | inherit | E01-Th04-S01-T04, E01-Th01-S02-T04 | TC-INT-011, TC-PERF-005 | M | P0 | not_started |

---

### E02 — Catalog & discovery

#### Th01 — Serviceability & ETA (PostGIS)

##### S01 — As a customer, I want to know instantly whether my location is serviceable and which store serves me, so that I never build a dead cart

**Acceptance criteria:**
- [ ] Point-in-polygon store resolution via `ST_Contains` on a GIST-indexed geometry, sub-ms
- [ ] Zone edits publish to new sessions within 60 s; invalid polygons rejected at save
- [ ] Outside all zones → "not serviceable yet" with notify-me capture and no cart possible
- [ ] Checkout ETA is dynamic on store load + rider availability, widens when riders are scarce, never leaks a cached fast ETA

**Linked FRs:** FR-2, FR-3, FR-8, FR-24
**Linked test cases:** TC-FUNC-003, TC-FUNC-004, TC-FUNC-005, TC-FUNC-010, TC-FUNC-028, TC-NEG-002, TC-NEG-003, TC-NEG-008, TC-NEG-028, TC-INT-013, TC-INT-014
**Linked screens:** SC-003 (location & serviceability gate), SC-004 (not serviceable + notify-me), SC-020 (address book)
**Architecture refs:** `02b_architecture.md` §6a (zone, store, address), §6b

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E02-Th01-S01-T01 | Zone & store schema with GIST + polygon validation | `zone` (PostGIS polygon, eta_params, active), `store` (dark/partner, geo point), `store_zone` mapping; GIST index; self-intersecting/unclosed-ring rejection at save. | claude-code | inherit | E01-Th01-S02-T03 | TC-NEG-028, TC-FUNC-028 | M | P0 | not_started |
| E02-Th01-S01-T02 | Serviceability resolver (`ST_Contains`) with pinned boundary semantics | Location → zone → serving store resolution; documented boundary/vertex and overlapping-zone tiebreak semantics; Redis-cached per session. | claude-code | inherit | E02-Th01-S01-T01, E01-Th01-S02-T04 | TC-FUNC-005, TC-INT-013 | M | P0 | not_started |
| E02-Th01-S01-T03 | Address book + geocode + zone resolution | `address` CRUD with label/floor/landmark, geocoding port (maps provider [OPEN]), zone_id resolution on save, manual-entry fallback when GPS is denied. | claude-code | inherit | E02-Th01-S01-T02, E01-Th03-S01-T01 | TC-FUNC-003, TC-FUNC-004, TC-NEG-002 | M | P0 | not_started |
| E02-Th01-S01-T04 | Not-serviceable state + notify-me capture | API returning the not-serviceable state for points outside all zones, notify-me capture (phone + location), cart creation blocked for unserviceable sessions. | claude-code | inherit | E02-Th01-S01-T02 | TC-NEG-003 | S | P0 | not_started |
| E02-Th01-S01-T05 | Dynamic ETA computation + zone publish invalidation | ETA from store load + rider availability (Redis), widening/throttle rules when riders are scarce, promise returned at checkout for storage on the order; zone publish invalidates caches ≤ 60 s. | claude-code | inherit | E02-Th01-S01-T02 | TC-FUNC-010, TC-NEG-008, TC-FUNC-028, TC-INT-014 | M | P0 | not_started |

#### Th02 — Catalog

##### S01 — As a catalog manager, I want SKU/category CRUD with bulk upload, and as a customer I want honest per-store browse and detail, so that the storefront is never wrong

**Acceptance criteria:**
- [ ] Only in-stock, priced items for the serving store render in browse
- [ ] Catalog change is live on the storefront within 60 s; bulk CSV applies valid rows and itemizes rejects
- [ ] Age-restricted/regulated categories cannot publish (BR-9) via UI or CSV
- [ ] PDP shows price/discount/pack/availability matching the DB of record

**Linked FRs:** FR-4, FR-6, FR-21
**Linked test cases:** TC-FUNC-006, TC-FUNC-008, TC-FUNC-025, TC-NEG-004, TC-NEG-006, TC-NEG-025, TC-NEG-038, TC-PERF-001
**Linked screens:** SC-005 (home / storefront), SC-006 (category listing / PLP), SC-008 (product detail / PDP)
**Architecture refs:** `02b_architecture.md` §6a (sku, store_inventory), §5f (NFR-1)

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E02-Th02-S01-T01 | SKU & category schema | `sku` (brand, category, pack_size, mrp, images, attributes JSONB + GIN, barcode) and category tree; restricted-category flag field (BR-9). | claude-code | inherit | E01-Th01-S02-T03 | TC-FUNC-008, TC-NEG-038 | M | P0 | not_started |
| E02-Th02-S01-T02 | Catalog CRUD API + bulk CSV + BR-9 guard | SKU/category/image CRUD emitting `stock.*`/catalog change events; row-wise bulk CSV with success/reject report; restricted-category publish block on both paths. | claude-code | inherit | E02-Th02-S01-T01, E01-Th04-S01-T01 | TC-FUNC-025, TC-NEG-025, TC-NEG-038 | L | P0 | not_started |
| E02-Th02-S01-T03 | Per-store browse API + Redis catalog cache | Category listing filtered to in-stock priced items of the serving store, Redis cache with event-driven invalidation, p95-instrumented; no ghost inventory. | claude-code | inherit | E02-Th02-S01-T01, E02-Th01-S01-T02 | TC-FUNC-006, TC-NEG-004, TC-PERF-001 | M | P0 | not_started |
| E02-Th02-S01-T04 | Product detail API | PDP payload: price/MRP/discount, pack size, images, per-store availability; unavailable-at-your-store state for deep links into a non-serving store's SKU. | claude-code | inherit | E02-Th02-S01-T03 | TC-FUNC-008, TC-NEG-006 | S | P1 | not_started |

#### Th03 — Search (Meilisearch)

##### S01 — As a customer, I want forgiving sub-300 ms search, so that misspellings still find my item

**Acceptance criteria:**
- [ ] "atta" / "aata" / "attaa" all return relevant flours in the top 5, per-store availability respected
- [ ] Nonsense queries return an empty state with alternates in < 300 ms — never an error
- [ ] Stock/catalog changes reach the index within 60 s

**Linked FRs:** FR-5, FR-21
**Linked test cases:** TC-FUNC-007, TC-NEG-005, TC-PERF-002, TC-INT-015, TC-FUNC-025
**Linked screens:** SC-007 (search)
**Architecture refs:** `02b_architecture.md` §2 (Search), §3a (C-12)

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E02-Th03-S01-T01 | Meilisearch index schema & ranking rules | Index of catalog × per-store availability, synonyms, typo tolerance settings, ranking rules tuned for grocery brand/pack queries. | claude-code | inherit | E01-Th01-S02-T05, E02-Th02-S01-T01 | TC-FUNC-007, TC-PERF-002 | M | P0 | not_started |
| E02-Th03-S01-T02 | Search indexer worker | Redpanda consumer applying catalog and stock events to Meili ≤ 60 s; idempotent; full-reindex command for replay/rebuild. | claude-code | inherit | E02-Th03-S01-T01, E01-Th04-S01-T03 | TC-INT-015, TC-INT-004, TC-FUNC-025 | M | P0 | not_started |
| E02-Th03-S01-T03 | Search API with empty-state alternates | Store-scoped query API, typo-tolerant, < 300 ms budget, alternate suggestions on zero results, graceful degradation if Meili is down (browse unaffected). | claude-code | inherit | E02-Th03-S01-T01 | TC-FUNC-007, TC-NEG-005, TC-PERF-002 | M | P0 | not_started |

#### Th04 — Cart

##### S01 — As a customer, I want a persistent single-store cart that refuses impossible quantities, so that my cart is always orderable

**Acceptance criteria:**
- [ ] Cart is identical across app and web and survives session restart (Redis hot + PG durable)
- [ ] Quantity above stock or `max_per_order` blocks the increment with an explicit reason
- [ ] Mixed-store cart writes are rejected by the API, not just the UI (BR-1)

**Linked FRs:** FR-7
**Linked test cases:** TC-FUNC-009, TC-NEG-007, TC-NEG-035, TC-E2E-002
**Linked screens:** SC-009 (cart)
**Architecture refs:** `02b_architecture.md` §6a (cart)

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E02-Th04-S01-T01 | Cart API with Redis hot copy + PG durability | `cart` entity with line snapshots, add/step/remove endpoints, running total, cross-device read-through, restart survival. | claude-code | inherit | E02-Th02-S01-T03, E01-Th01-S02-T04 | TC-FUNC-009 | M | P0 | not_started |
| E02-Th04-S01-T02 | Single-store rule enforcement (BR-1) | Server-side rejection of mixed-store cart writes; clear/switch prompt contract when the serving store changes. | claude-code | inherit | E02-Th04-S01-T01, E02-Th01-S01-T02 | TC-NEG-035, TC-E2E-002 | S | P0 | not_started |
| E02-Th04-S01-T03 | Quantity caps: stock + per-order | Increment guard against `available_qty` and `max_per_order` with per-reason error codes; cart can never exceed either limit. | claude-code | inherit | E02-Th04-S01-T01 | TC-NEG-007 | S | P0 | not_started |

#### Th05 — Pricing, coupons & invoicing

##### S01 — As a customer, I want an itemized, tamper-proof bill with working coupons and a GST invoice, so that pricing is transparent and legal

**Acceptance criteria:**
- [ ] Bill = items + delivery fee + small-cart fee − discount, always recomputed server-side from SKU prices and coupon rules
- [ ] Flat and percent coupons apply instantly; percent capped at `max_discount`; every rejection states its specific reason
- [ ] Client-tampered totals are ignored; the gateway amount is always server-derived
- [ ] GST-compliant invoice PDF generated on delivery with operating GSTIN and per-line breakup

**Linked FRs:** FR-9
**Linked test cases:** TC-FUNC-011, TC-FUNC-012, TC-NEG-009, TC-NEG-010, TC-SEC-010, TC-E2E-001
**Linked screens:** SC-010 (checkout bill), SC-011 (coupon selection), SC-017 (order detail — GST invoice download)
**Architecture refs:** `02b_architecture.md` §6a (coupon), §5a step 2

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E02-Th05-S01-T01 | Fee & bill computation engine (server-authoritative) | Delivery + small-cart fee rules, GST-inclusive line math, itemized bill DTO; server recomputes on every checkout call; tampered client values rejected and logged. | claude-code | inherit | E02-Th04-S01-T01 | TC-FUNC-011, TC-SEC-010 | M | P0 | not_started |
| E02-Th05-S01-T02 | Coupon engine (flat/percent, limits, reasons) | `coupon` entity, eligibility (min_cart, store, validity), per-user usage limits + redemption counter, max_discount cap, typed failure reasons. | claude-code | inherit | E02-Th05-S01-T01 | TC-FUNC-011, TC-NEG-009, TC-NEG-010 | M | P0 | not_started |
| E02-Th05-S01-T03 | GST invoice generation at delivery | Invoice PDF (GSTIN, per-line GST breakup, GST-inclusive prices) rendered on DELIVERED, stored in object storage, linked on the order, 8-year retention. | claude-code | inherit | E02-Th05-S01-T01, E01-Th01-S02-T06 | TC-FUNC-012, TC-E2E-001 | M | P0 | not_started |

---

### E03 — Ordering & payments

#### Th01 — Orders: state machine, checkout & reservation

##### S01 — As a customer, I want my order accepted only if the stock is really there and the charge is really made, so that I'm never disappointed or double-charged

**Acceptance criteria:**
- [ ] Reservation and order creation are one Postgres transaction; any line shortfall rolls the whole thing back
- [ ] Under 50 concurrent runs on a single last unit, exactly one order wins and the loser gets a clean failure + auto-refund
- [ ] `eta_promised_at` is stored at placement and never mutates
- [ ] Checkout confirm is idempotent on the checkout-session ID; unpaid holds expire at 15 min

**Linked FRs:** FR-8, FR-12
**Linked test cases:** TC-FUNC-010, TC-FUNC-016, TC-NEG-015, TC-NEG-016, TC-NEG-036, TC-INT-001, TC-INT-014, TC-INT-017, TC-PERF-003
**Linked screens:** SC-010 (checkout — ETA promise), SC-012 (payment), SC-013 (order confirmation)
**Architecture refs:** `02b_architecture.md` §5a, §6a (order, order_item)

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E03-Th01-S01-T01 | Order schema + state machine + transition ledger | `order`/`order_item` tables, states PLACED→PICKING→PACKED→DISPATCHED→DELIVERED/CANCELLED, every transition recorded with actor + timestamp; per-state partial indexes. | claude-code | inherit | E01-Th01-S02-T03, E01-Th04-S01-T01 | TC-FUNC-030, TC-INT-014 | L | P0 | not_started |
| E03-Th01-S01-T02 | Checkout session API (revalidate + ETA promise) | `POST /v1/checkout`: pricing revalidation, coupon check, ETA computation, inventory soft-check; returns bill + payable + checkout-session ID; stores the promise for placement. | claude-code | inherit | E03-Th01-S01-T01, E02-Th05-S01-T01, E02-Th01-S01-T05 | TC-FUNC-010, TC-INT-014, TC-NEG-008 | M | P0 | not_started |
| E03-Th01-S01-T03 | Atomic stock reservation transaction | `SELECT … FOR UPDATE` on all `store_inventory` lines → available−/reserved+, insert order + items + payment + outbox rows, single commit; shortfall → full rollback with typed reason. | claude-code | inherit | E03-Th01-S01-T02, E05-Th01-S01-T01 | TC-FUNC-016, TC-NEG-015, TC-NEG-016, TC-INT-001, TC-PERF-003 | L | P0 | not_started |
| E03-Th01-S01-T04 | Checkout-confirm idempotency | Idempotency on checkout-session ID at API + gateway layer: concurrent and repeat confirms return the same order ID; one order, one reservation, one charge. | claude-code | inherit | E03-Th01-S01-T03, E01-Th04-S01-T04 | TC-INT-017, TC-INT-020 | M | P0 | not_started |
| E03-Th01-S01-T05 | 15-minute unpaid-hold expiry (BR-3) | Hold timer + sweep releasing reservations for payments still PENDING at 15 min, marking payment expired per gateway truth and notifying the customer to retry. | claude-code | inherit | E03-Th01-S01-T03, E03-Th03-S01-T06 | TC-NEG-036, TC-NEG-012, TC-INT-007 | M | P0 | not_started |

##### S02 — As a customer, I want to cancel, reorder and rate, so that mistakes are cheap and repeat shopping is instant

**Acceptance criteria:**
- [ ] Cancel before dispatch releases stock and auto-initiates the refund; cancel after dispatch is refused via app **and** raw API
- [ ] Reorder adds available items at current price and flags unavailable ones — never silently
- [ ] Ratings ≤ 3 stars open a reason picker and land in the ops exception queue; non-delivered orders cannot be rated

**Linked FRs:** FR-14, FR-15, FR-16
**Linked test cases:** TC-FUNC-018, TC-FUNC-019, TC-FUNC-020, TC-NEG-018, TC-NEG-019, TC-NEG-020, TC-E2E-004
**Linked screens:** SC-016 (order history), SC-017 (order detail — reorder / cancel), SC-014 (live tracking — pre-dispatch cancel), SC-018 (rate order & delivery)
**Architecture refs:** `02b_architecture.md` §5e step 5, §6a

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E03-Th01-S02-T01 | Cancellation + stock release + refund trigger | Pre-dispatch cancel endpoint releasing `reserved_qty` and creating the refund row; post-dispatch cancel refused with reason on both app and API paths. | claude-code | inherit | E03-Th01-S01-T03, E03-Th03-S01-T07 | TC-FUNC-018, TC-NEG-018, TC-E2E-004 | M | P0 | not_started |
| E03-Th01-S02-T02 | Order history + one-tap reorder | Paginated history with invoice links; reorder resolves each SKU against current store availability/price, flags unavailable lines, blocks empty-cart checkout. | claude-code | inherit | E03-Th01-S01-T01, E02-Th04-S01-T01 | TC-FUNC-019, TC-NEG-019 | M | P1 | not_started |
| E03-Th01-S02-T03 | Ratings + low-rating exception routing | Rating API restricted to DELIVERED orders, reason picker payload at ≤ 3 stars, record routed to the ops exception queue; feature-flagged as non-critical (fails open). | claude-code | inherit | E03-Th01-S01-T01 | TC-FUNC-020, TC-NEG-020, TC-PERF-008 | S | P2 | not_started |

#### Th02 — Order events (outbox emission & consumers)

##### S01 — As a downstream system, I want every order/stock/payment state change as a durable event, so that notifications, picking, analytics and audit are decoupled from checkout

**Acceptance criteria:**
- [ ] `order.placed` / `order.packed` / `payment.captured` / `stock.reserved` etc. are written in the mutation's own transaction
- [ ] Redelivering an event 3× yields exactly one notification, one audit row, one picker-queue entry
- [ ] A full topic replay rebuilds projections without re-sending SMS/push/refunds

**Linked FRs:** FR-12, FR-28
**Linked test cases:** TC-INT-001, TC-INT-003, TC-INT-004
**Linked screens:** —
**Architecture refs:** `02b_architecture.md` §2a, §5a step 7

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E03-Th02-S01-T01 | Domain event emission for order/stock/payment | Event schemas + in-transaction emission on every order state change, reservation, capture and refund, with actor/reason mandatory for audit. | claude-code | inherit | E03-Th01-S01-T03, E01-Th04-S01-T01 | TC-INT-001, TC-SEC-009 | M | P0 | not_started |
| E03-Th02-S01-T02 | Consumer idempotency + replay safety verification | Processed-event keys on all consumers, replay mode suppressing side-effecting consumers, projection-rebuild command validated against Postgres truth. | claude-code | inherit | E03-Th02-S01-T01, E01-Th04-S01-T03 | TC-INT-003, TC-INT-004 | M | P0 | not_started |

#### Th03 — Payments adapter, webhooks, reconciliation & refunds

##### S01 — As finance, I want money to be impossible to lose or duplicate, so that BR-4 and objective #4 hold even when the gateway misbehaves

**Acceptance criteria:**
- [ ] Payment gateway vendor stays **[OPEN]** — everything runs against a port-conformant fake gateway until the vendor sandbox lands
- [ ] Verify-call and webhook are both idempotent on `gateway_payment_ref`; whichever arrives first wins
- [ ] Duplicate webhooks are no-ops; out-of-order webhooks resolve by gateway timestamp; forged/replayed webhooks are rejected
- [ ] Captured-but-no-order auto-refunds immediately; a lost webhook is caught by the 5-min sweep
- [ ] Refunds ≤ ₹2,000 auto-initiate with no approval; > ₹2,000 queue for finance; the 20 h SLA monitor alerts before the 24 h promise

**Linked FRs:** FR-10, FR-14
**Linked test cases:** TC-FUNC-013, TC-FUNC-014, TC-NEG-011, TC-NEG-012, TC-NEG-030, TC-INT-005, TC-INT-006, TC-INT-007, TC-INT-008, TC-INT-009, TC-INT-018, TC-SEC-005, TC-SEC-006, TC-E2E-004
**Linked screens:** SC-012 (payment method / status), SC-013 (order confirmation)
**Architecture refs:** `02b_architecture.md` §5a, §5e, §6a (payment, refund)

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E03-Th03-S01-T01 | Gateway-agnostic payments port + fake gateway | Adapter port (create intent, verify, capture, refund, status), `payment`/`refund` schema with unique `gateway_payment_ref`, in-repo fake gateway implementing the port so all tests run while the vendor is [OPEN]. | claude-code | inherit | E01-Th01-S01-T02, E01-Th01-S02-T03 | TC-FUNC-014, TC-INT-005 | L | P0 | not_started |
| E03-Th03-S01-T02 | Intent creation with idempotency key | Create gateway order/intent keyed on checkout-session ID; UPI/card/wallet method selection; no raw instrument data ever received (SAQ-A, gateway-hosted fields/SDK). | claude-code | inherit | E03-Th03-S01-T01, E03-Th01-S01-T02 | TC-FUNC-013, TC-SEC-005 | M | P0 | not_started |
| E03-Th03-S01-T03 | Server-side capture verification | Client callback triggers a server verify call against the gateway; amount verified server-side; capture confirmed only from gateway truth; result idempotent with the webhook path. | claude-code | inherit | E03-Th03-S01-T02 | TC-FUNC-013, TC-FUNC-014, TC-SEC-010 | M | P0 | not_started |
| E03-Th03-S01-T04 | Signed webhook ingress (HMAC + replay window) | Webhook endpoint behind the gateway: HMAC verification, timestamp window, raw payload persistence, unsigned/wrong-signature/out-of-window rejected with forgery alerting. | claude-code | inherit | E03-Th03-S01-T01, E01-Th04-S01-T04, E01-Th01-S02-T07 | TC-SEC-006, TC-INT-005 | M | P0 | not_started |
| E03-Th03-S01-T05 | Idempotent webhook upsert + state comparison | Upsert keyed `gateway_payment_ref`+type, timestamp precedence for out-of-order events, three-way state comparison (captured+order / captured+no-order → auto-refund / failed+reservation → release). | claude-code | inherit | E03-Th03-S01-T04, E03-Th01-S01-T03 | TC-INT-005, TC-INT-006, TC-INT-008, TC-NEG-011 | L | P0 | not_started |
| E03-Th03-S01-T06 | Reconciliation sweep worker (5 min) | Worker querying the gateway status API for payments PENDING > 15 min, resolving per state comparison, covering webhook loss; no phantom orders. | claude-code | inherit | E03-Th03-S01-T05, E01-Th04-S01-T03 | TC-INT-007, TC-NEG-012 | M | P0 | not_started |
| E03-Th03-S01-T07 | Refunds + BR-4 SLA monitor + approval threshold | Refund creation with `sla_deadline` +24 h, gateway call idempotent on refund ID, auto-initiate ≤ ₹2,000 / finance approval > ₹2,000, monitor alerting at ≥ 20 h uninitiated, refund webhooks closing the loop. | claude-code | inherit | E03-Th03-S01-T05 | TC-FUNC-018, TC-NEG-030, TC-INT-009, TC-INT-018, TC-E2E-004 | L | P0 | not_started |

#### Th04 — Cash on delivery (confirmed for v1, BR-5)

##### S01 — As a customer, I want COD as a fallback, so that I can order without digital payment — within the caps finance set

**Acceptance criteria:**
- [ ] COD cap is ops-configurable (default ₹1,500); above the cap COD is hidden/disabled **and** the API rejects it
- [ ] Risky first-time users are never offered COD, enforced server-side
- [ ] COD orders reserve stock at placement (no 15-min unpaid hold) and show the rider the exact collect amount
- [ ] Completion requires delivery proof **and** collection confirmation; collection lands in the reconciliation report and the rider's float

**Linked FRs:** FR-11, FR-19
**Linked test cases:** TC-FUNC-015, TC-NEG-013, TC-NEG-014, TC-E2E-003, TC-SEC-009
**Linked screens:** SC-012 (payment method — COD option), SC-026 (rider COD collection), SC-027 (rider earnings — COD-collected total)
**Architecture refs:** `02b_architecture.md` §5a step 9, §6a (rider.cod_float, assignment.cod_collected)

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E03-Th04-S01-T01 | COD eligibility: BR-5 cap config + risk flag | Ops-configurable per-order cap (default ₹1,500), risky-first-time-user flag, eligibility evaluated at checkout and re-enforced at placement; API rejects ineligible COD regardless of client. | claude-code | inherit | E03-Th01-S01-T02 | TC-NEG-013, TC-NEG-014 | M | P1 | not_started |
| E03-Th04-S01-T02 | COD order placement path | Placement skipping intent/capture, reserving stock at placement, payment row `method=cod` in COD-pending state, BR-3 unpaid-hold logic bypassed; COD-only degraded mode flag for gateway outages. | claude-code | inherit | E03-Th04-S01-T01, E03-Th01-S01-T03 | TC-FUNC-015, TC-PERF-008 | M | P1 | not_started |
| E03-Th04-S01-T03 | COD collection, rider float & reconciliation report | Collect-amount exposure to the rider assignment, collection confirmation gate on completion, `cod_float` accounting, daily COD reconciliation report with audit rows per collection. | claude-code | inherit | E03-Th04-S01-T02, E04-Th03-S01-T02 | TC-E2E-003, TC-SEC-009, TC-FUNC-015 | M | P1 | not_started |

---

### E04 — Fulfillment & logistics

#### Th01 — Picker workflow

##### S01 — As a picker, I want a layout-ordered, barcode-verified pick list with an OOS escape hatch, so that I pack fast and honestly

**Acceptance criteria:**
- [ ] `order.placed` puts the order in the store's picker queue sorted by promised ETA
- [ ] Pick list renders in store-layout order; scanning the wrong barcode can never confirm a line
- [ ] Pack complete is blocked until every line is picked / substituted / refunded; pack timestamps recorded
- [ ] OOS at pick sends a substitute-or-refund prompt with a 60 s timeout → auto-refund of that line

**Linked FRs:** FR-17, FR-30
**Linked test cases:** TC-FUNC-021, TC-FUNC-034, TC-NEG-021, TC-NEG-034, TC-E2E-005, TC-INT-003
**Linked screens:** SC-044 (picker: pick-list queue), SC-045 (picker: pick & pack flow), SC-015 (customer substitution prompt fired from SC-045)
**Architecture refs:** `02b_architecture.md` §5b steps 1–4

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E04-Th01-S01-T01 | Picker-queue projection from `order.placed` | Idempotent consumer building the per-store picker queue sorted by `eta_promised_at`; exactly one entry under duplicate delivery. | claude-code | inherit | E03-Th02-S01-T01, E01-Th04-S01-T03 | TC-INT-003, TC-FUNC-021 | M | P0 | not_started |
| E04-Th01-S01-T02 | Pick list in store-layout order + accept transition | Store layout positions on `store_inventory`, accept → PICKING transition with actor, list sorted by aisle/bin. | claude-code | inherit | E04-Th01-S01-T01, E03-Th01-S01-T01 | TC-FUNC-021 | M | P0 | not_started |
| E04-Th01-S01-T03 | Barcode verification + pack completion | Per-line scan confirmation matched against SKU barcode, mismatch feedback, pack-complete gate on all lines resolved, PACKED transition with timestamps → `order.packed`. | claude-code | inherit | E04-Th01-S01-T02 | TC-FUNC-021, TC-NEG-021 | M | P0 | not_started |
| E04-Th01-S01-T04 | OOS flag → substitute-or-refund (60 s) | Picker OOS flag, substitute offer to the customer with 60 s timer, accept → line swap + bill delta, reject/timeout → line refund (BR-4 path); order continues partial. | claude-code | inherit | E04-Th01-S01-T03, E03-Th03-S01-T07, E04-Th05-S01-T02 | TC-FUNC-034, TC-NEG-034, TC-E2E-005 | L | P1 | not_started |

#### Th02 — Dispatch & rider assignment

##### S01 — As a rider, I want nearby jobs offered to me automatically, so that I earn without hunting

**Acceptance criteria:**
- [ ] Nearest eligible online rider is offered first via Redis `GEOSEARCH`, 30 s TTL on the offer
- [ ] Declines/timeouts cascade to next-nearest; exhaustion lands in the ops exception queue for force-assign
- [ ] A rider with an active order (BR-7) or offline is never offered
- [ ] Exactly one expiry handling even if the dispatch worker restarts mid-offer

**Linked FRs:** FR-18
**Linked test cases:** TC-FUNC-022, TC-NEG-022, TC-NEG-024, TC-NEG-037, TC-INT-016
**Linked screens:** SC-023 (job offer), SC-022 (rider home — online/offline eligibility)
**Architecture refs:** `02b_architecture.md` §5b steps 5–6, §6a (rider, assignment)

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E04-Th02-S01-T01 | Rider & assignment schema + Redis GEO membership | `rider` (kyc, vehicle, online_status, active_assignment, cod_float) and `assignment` tables; GEO set membership driven by online/offline and active-order state. | claude-code | inherit | E01-Th01-S02-T03, E01-Th01-S02-T04 | TC-FUNC-022, TC-NEG-024 | M | P0 | not_started |
| E04-Th02-S01-T02 | Offer engine: GEOSEARCH + 30 s TTL | Dispatch worker on `order.packed`: nearest-eligible search, `assignment` OFFERED with TTL, offer pushed via the realtime gateway; accept → ACCEPTED, others never offered. | claude-code | inherit | E04-Th02-S01-T01, E04-Th04-S01-T01, E01-Th04-S01-T03 | TC-FUNC-022, TC-INT-016 | L | P0 | not_started |
| E04-Th02-S01-T03 | Decline/timeout cascade + exhaustion → exception queue | Idempotent TTL expiry (survives worker restart, never two concurrent active offers), cascade to next-nearest, exhaustion routes the order to the ops exception queue. | claude-code | inherit | E04-Th02-S01-T02 | TC-NEG-022, TC-INT-016, TC-NEG-024 | M | P0 | not_started |
| E04-Th02-S01-T04 | BR-7 single-active guard + ops force-assign | Riders with an ACCEPTED assignment excluded from candidates; ops force-assign endpoint overriding the cascade with audit. | claude-code | inherit | E04-Th02-S01-T03 | TC-NEG-037, TC-NEG-022 | M | P0 | not_started |

#### Th03 — Rider pickup, delivery & earnings

##### S01 — As a rider, I want clear verified pickup/drop steps and honest earnings, so that deliveries are error-free and my shift is mine

**Acceptance criteria:**
- [ ] Order becomes DISPATCHED only after pickup OTP/scan verification
- [ ] DELIVERED only after proof (OTP or photo) is stored — blocked via UI **and** raw API (BR-8)
- [ ] Online/offline toggle reflects in dispatch eligibility ≤ 5 s
- [ ] Per-order payout and daily totals match assignment records exactly

**Linked FRs:** FR-19, FR-20
**Linked test cases:** TC-FUNC-023, TC-FUNC-024, TC-NEG-023, TC-NEG-024, TC-E2E-001, TC-E2E-003
**Linked screens:** SC-024 (pickup flow), SC-025 (delivery flow + proof), SC-022 (rider home — shift toggle), SC-027 (earnings & delivery history)
**Architecture refs:** `02b_architecture.md` §5b steps 7–8

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E04-Th03-S01-T01 | Pickup verification (OTP / scan) | Store-side pickup verification endpoint, `pickup_verified_at` on assignment, DISPATCHED transition gated on it, tracking activation trigger. | claude-code | inherit | E04-Th02-S01-T02, E03-Th01-S01-T01 | TC-FUNC-023, TC-E2E-001 | M | P0 | not_started |
| E04-Th03-S01-T02 | Delivery proof (OTP or photo) → object storage | Proof capture and upload, `proof_ref` on assignment, DELIVERED gated on proof at the service layer (raw API attempts blocked), invoice generation trigger. | claude-code | inherit | E04-Th03-S01-T01, E01-Th01-S02-T06, E02-Th05-S01-T03 | TC-FUNC-023, TC-NEG-023, TC-E2E-001 | M | P0 | not_started |
| E04-Th03-S01-T03 | Online/offline toggle + earnings ledger | Toggle endpoint propagating to GEO eligibility ≤ 5 s; earnings read model computing per-order payout and daily totals from assignment records. | claude-code | inherit | E04-Th02-S01-T01, E04-Th03-S01-T02 | TC-FUNC-024, TC-NEG-024 | M | P1 | not_started |

#### Th04 — Realtime gateway & live tracking

##### S01 — As a customer, I want the rider on a live map, so that I know when to be at the door

**Acceptance criteria:**
- [ ] GPS fix → client render ≤ 5 s at 10k concurrent sockets; fan-out never touches Postgres or core
- [ ] Status transitions arrive on the same socket as position
- [ ] Reconnect delivers current status + last position; socket loss degrades to HTTPS polling from Redis last-known
- [ ] Positions downsampled to the partitioned archive for SLA forensics and heatmaps

**Linked FRs:** FR-13
**Linked test cases:** TC-FUNC-017, TC-NEG-017, TC-INT-010, TC-INT-011, TC-PERF-005
**Linked screens:** SC-014 (live order tracking)
**Architecture refs:** `02b_architecture.md` §5d

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E04-Th04-S01-T01 | GPS ingest → Redis GEO + pub/sub publish | Rider GPS frames over WS (4 s cadence, batched), GEO set write for dispatch, publish to `track:{order_id}`; back-pressure and bad-frame handling. | claude-code | inherit | E01-Th04-S01-T05, E04-Th02-S01-T01 | TC-FUNC-017, TC-PERF-005 | M | P0 | not_started |
| E04-Th04-S01-T02 | Tracking fan-out + order-status bridge | Customer/ops subscriptions per order, `order.*` events bridged onto the same channel so status + position share one socket; per-pod channel subscription management. | claude-code | inherit | E04-Th04-S01-T01, E03-Th02-S01-T01 | TC-FUNC-017, TC-PERF-005, TC-INT-011 | M | P0 | not_started |
| E04-Th04-S01-T03 | Reconnect resume + state fetch on subscribe | Resubscribe delivers current status and last-known position so a gap never leaves a stale screen; pod-kill reconnect ≤ 10 s. | claude-code | inherit | E04-Th04-S01-T02 | TC-INT-010, TC-INT-011 | M | P0 | not_started |
| E04-Th04-S01-T04 | Polling fallback + rider_location archive | `GET /v1/orders/{id}/track` served from Redis last-known for WS loss; downsampler (1/30 s) writing the day-partitioned `rider_location` archive → warehouse. | claude-code | inherit | E04-Th04-S01-T01 | TC-NEG-017, TC-PERF-008 | M | P0 | not_started |

#### Th05 — Notifications engine

##### S01 — As the platform, I want a templated push/SMS notification on every lifecycle event, so that customers and riders are never in the dark

**Acceptance criteria:**
- [ ] Every mapped transition dispatches within 10 s of commit, with a notification row per event
- [ ] Push failure creates an SMS fallback row (`fallback_of`) within 10 s; double failure retries with backoff and alerts ops
- [ ] DLT-registered templates only; duplicate events send exactly one notification

**Linked FRs:** FR-28
**Linked test cases:** TC-FUNC-032, TC-NEG-032, TC-INT-003, TC-E2E-001
**Linked screens:** —
**Architecture refs:** `02b_architecture.md` §6a (notification), §3b

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E04-Th05-S01-T01 | Template registry + event→template mapping | `notification` schema, DLT template registry (IDs configurable — SMS/DLT provider [OPEN]), lifecycle-event → template mapping table, variable rendering with boundary-length validation. | claude-code | inherit | E01-Th04-S01-T03 | TC-FUNC-032 | M | P0 | not_started |
| E04-Th05-S01-T02 | Push sender (FCM/APNs) ≤ 10 s | Notification consumer dispatching push within 10 s of commit, idempotent per event key, device-token management for customer + rider apps. | claude-code | inherit | E04-Th05-S01-T01 | TC-FUNC-032, TC-INT-003 | M | P0 | not_started |
| E04-Th05-S01-T03 | SMS fallback + retry/backoff + ops alert | Push-failure → SMS fallback row within 10 s; double failure retries with backoff and raises an ops alert; no silent loss. | claude-code | inherit | E04-Th05-S01-T02 | TC-NEG-032 | M | P0 | not_started |

---

### E05 — Inventory & partners

#### Th01 — Dark-store inventory

##### S01 — As an ops manager, I want GRN, adjustments and cycle counts with a full audit trail and alerts, so that system stock matches shelf stock

**Acceptance criteria:**
- [ ] Every stock mutation produces exactly one immutable audit row (who/when/why); reason is mandatory
- [ ] Negative stock is impossible; adjustments without reason/actor are rejected 4xx with no stock change
- [ ] Low-stock alerts fire at the configurable threshold
- [ ] Stock changes reach the storefront cache and search index within 60 s

**Linked FRs:** FR-22, FR-21
**Linked test cases:** TC-FUNC-026, TC-NEG-026, TC-SEC-009, TC-INT-015, TC-NEG-004
**Linked screens:** SC-035 (inventory: stock & adjustments), SC-036 (inventory: GRN)
**Architecture refs:** `02b_architecture.md` §6a (store_inventory), §6b

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E05-Th01-S01-T01 | `store_inventory` schema + indexes | PK (store_id, sku_id), price, available/reserved qty, max_per_order, low_stock_threshold, source (grn/feed), layout position; partial low-stock index. | claude-code | inherit | E02-Th02-S01-T01, E02-Th01-S01-T01 | TC-FUNC-026, TC-FUNC-006 | M | P0 | not_started |
| E05-Th01-S01-T02 | GRN (goods receipt) | Manual GRN receiving increasing `available_qty`, with actor + reference, emitting `stock.*` + `audit.*` events in-transaction. | claude-code | inherit | E05-Th01-S01-T01, E01-Th04-S01-T01 | TC-FUNC-026, TC-SEC-009 | M | P0 | not_started |
| E05-Th01-S01-T03 | Adjustments & cycle counts with mandatory reason | Adjustment/cycle-count APIs requiring reason + actor, negative-stock guard, all mutations routed exclusively through the inventory module. | claude-code | inherit | E05-Th01-S01-T02 | TC-FUNC-026, TC-NEG-026, TC-SEC-009 | M | P0 | not_started |
| E05-Th01-S01-T04 | Low-stock alerting | Threshold-driven alert on crossing `low_stock_threshold`, per-store digest to ops, configurable per SKU/store. | claude-code | inherit | E05-Th01-S01-T03 | TC-FUNC-026 | S | P0 | not_started |
| E05-Th01-S01-T05 | Stock event propagation ≤ 60 s | `stock.*` consumers invalidating the Redis catalog cache and updating Meili so a zeroed SKU disappears from browse and search within 60 s. | claude-code | inherit | E05-Th01-S01-T03, E02-Th03-S01-T02 | TC-INT-015, TC-NEG-004 | M | P0 | not_started |

#### Th02 — Partner onboarding & feed ingestion

##### S01 — As a partner manager, I want to onboard stores and ingest their stock via API or CSV, so that coverage grows without lying about stock

**Acceptance criteria:**
- [ ] Valid feed SKUs map/merge to the master catalog; rejects are itemized with row + reason
- [ ] `last_ingested_at` drives freshness; ≥ 15:00 old = stale → "delivery may take longer", excluded from fast-ETA promises (BR-6), recovers on fresh feed
- [ ] Partner confirmation timeout auto-cancels: stock released, refund auto-initiated, customer notified, exception-queue entry, fill-rate decremented
- [ ] Commission line recorded on partner orders

**Linked FRs:** FR-23
**Linked test cases:** TC-FUNC-027, TC-NEG-027, TC-INT-012, TC-INT-019, TC-E2E-002
**Linked screens:** SC-037 (partner stores: list & feed status), SC-038 (partner store: detail & onboarding)
**Architecture refs:** `02b_architecture.md` §5c, §6a (partner_feed)

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E05-Th02-S01-T01 | Partner store onboarding + partner users | Partner store creation (type=partner, commission_pct), partner-role user provisioning row-scoped to the store, zone mapping. | claude-code | inherit | E02-Th01-S01-T01, E01-Th03-S02-T03 | TC-FUNC-027, TC-SEC-012 | M | P0 | not_started |
| E05-Th02-S01-T02 | API feed ingestion + SKU mapping/merge | `partner_feed` entity, authenticated push API, mapping/merge of partner SKUs to master catalog, `last_ingested_at` + row counts. | claude-code | inherit | E05-Th02-S01-T01, E05-Th01-S01-T01 | TC-FUNC-027 | L | P0 | not_started |
| E05-Th02-S01-T03 | CSV feed ingestion + rejection report | Scheduled/uploaded CSV to object storage, worker ingestion, row-wise validation, rejection report artifact with reasons, no partial-row corruption. | claude-code | inherit | E05-Th02-S01-T02, E01-Th01-S02-T06 | TC-FUNC-027, TC-NEG-025 | M | P0 | not_started |
| E05-Th02-S01-T04 | Freshness evaluation + BR-6 degraded listing | `freshness_status` computed on a pinned ≥ 15:00 = stale boundary, degraded listing copy, exclusion from fast-ETA promises, fleet-wide staleness metric + alert. | claude-code | inherit | E05-Th02-S01-T02, E02-Th01-S01-T05 | TC-NEG-027, TC-INT-012, TC-E2E-002 | M | P0 | not_started |
| E05-Th02-S01-T05 | Partner order notify, READY & timeout auto-cancel | Partner notification on `order.placed` (dashboard push + SMS fallback), partner READY transition feeding dispatch, confirmation-timeout auto-cancel (release + refund + notify + exception + fill-rate), commission line on order. | claude-code | inherit | E05-Th02-S01-T01, E03-Th03-S01-T07, E04-Th05-S01-T02 | TC-INT-019, TC-E2E-002 | L | P0 | not_started |

---

### E06 — Client apps

#### Th01 — Customer mobile app (React Native)

##### S01 — As Priya, I want to order in under two minutes on my phone, so that quick commerce actually feels quick

**Acceptance criteria:**
- [ ] Cold start < 3 s on mid-range Android; cart + last catalog render offline and sync on reconnect
- [ ] Order placement flow ≤ 90 s for a returning customer; optimistic cart UI
- [ ] Tracking screen shows position ≤ 5 s and status pushes on the same socket
- [ ] Every screen matches its `designs/<SC-XXX>/` frames

**Linked FRs:** FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, FR-9, FR-10, FR-11, FR-13, FR-14, FR-15, FR-16, FR-30
**Linked test cases:** TC-E2E-001, TC-E2E-003, TC-E2E-005, TC-FUNC-009, TC-FUNC-017, TC-PERF-006
**Linked screens:** SC-001, SC-002 (auth) · SC-003, SC-004, SC-020 (location / address) · SC-005, SC-006, SC-007, SC-008 (browse / search / PDP) · SC-009, SC-010, SC-011, SC-012, SC-013 (cart / checkout / payment) · SC-014, SC-015 (tracking / substitution) · SC-016, SC-017, SC-018, SC-019 (history / rating / account) — full customer app set SC-001..SC-020
**Architecture refs:** `02b_architecture.md` §2 (Mobile), §13 (Mobile row)

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E06-Th01-S01-T01 | App shell, navigation & shared design system | RN + Hermes app skeleton, navigation graph, shared design-system package with web, theming/dynamic type, cold-start budget instrumentation, OTA update channel. | claude-code | inherit | E01-Th01-S01-T01 | TC-PERF-006 | L | P0 | not_started |
| E06-Th01-S01-T02 | Screen batch — auth & address (SC-001, SC-002, SC-003, SC-004, SC-020) | OTP request/verify screens, session/refresh handling, GPS permission + auto-detect, manual-entry fallback, address book CRUD, not-serviceable + notify-me state. | claude-code | inherit | E06-Th01-S01-T01, E01-Th03-S01-T03, E02-Th01-S01-T04 | TC-FUNC-001, TC-FUNC-003, TC-FUNC-004, TC-NEG-002, TC-NEG-003 | L | P0 | not_started |
| E06-Th01-S01-T03 | Screen batch — browse, search & PDP (SC-005, SC-006, SC-007, SC-008) | Home/category browse with skeleton loads, search with typo-tolerant results + empty-state alternates, product detail, unavailable-at-store state. | claude-code | inherit | E06-Th01-S01-T02, E02-Th02-S01-T04, E02-Th03-S01-T03 | TC-FUNC-006, TC-FUNC-007, TC-FUNC-008, TC-NEG-005, TC-NEG-006 | L | P0 | not_started |
| E06-Th01-S01-T04 | Screen batch — cart, checkout & payment incl. COD (SC-009, SC-010, SC-011, SC-012, SC-013) | Optimistic cart with cap reasons, single-store switch prompt, bill summary + coupon apply/failure reasons, ETA promise display, gateway SDK payment sheet, COD option honouring BR-5 eligibility, failure retry/switch with cart intact. | claude-code | inherit | E06-Th01-S01-T03, E02-Th04-S01-T03, E02-Th05-S01-T02, E03-Th03-S01-T02, E03-Th04-S01-T01 | TC-FUNC-009, TC-FUNC-010, TC-FUNC-013, TC-FUNC-015, TC-NEG-007, TC-NEG-011, TC-NEG-013, TC-NEG-035, TC-E2E-001, TC-E2E-003 | L | P0 | not_started |
| E06-Th01-S01-T05 | Screen batch — tracking, history, rating & offline cache (SC-014, SC-015, SC-016, SC-017, SC-018, SC-019) | Live map tracking over WS with polling fallback, substitution prompt (60 s), cancel flow, order history + reorder, rating + reason picker, on-device cart/catalog cache with sync-on-reconnect. | claude-code | inherit | E06-Th01-S01-T04, E04-Th04-S01-T04, E03-Th01-S02-T03, E04-Th01-S01-T04 | TC-FUNC-017, TC-FUNC-019, TC-FUNC-020, TC-NEG-017, TC-NEG-019, TC-PERF-006, TC-E2E-005 | L | P0 | not_started |

#### Th02 — Customer web storefront (Next.js)

##### S01 — As Sunita, I want the same journey on the web, so that a big basket is comfortable on a bigger screen

**Acceptance criteria:**
- [ ] Catalog pages served via ISR/CDN; browse p95 < 200 ms server time
- [ ] Full parity for auth, serviceability, cart, checkout, payment, tracking, substitution, history, rating
- [ ] WCAG 2.1 AA on all web surfaces

**Linked FRs:** FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-9, FR-10, FR-11, FR-13, FR-15, FR-16, FR-30
**Linked test cases:** TC-FUNC-009, TC-PERF-001, TC-SEC-004, TC-E2E-001
**Linked screens:** Web variants of SC-001, SC-002, SC-003, SC-004, SC-005, SC-006, SC-007, SC-008, SC-009, SC-010, SC-011, SC-012, SC-013, SC-014, SC-015, SC-016, SC-017, SC-018, SC-019, SC-020 — full customer web set at parity with the app (BRS §4a)
**Architecture refs:** `02b_architecture.md` §2 (Frontend), §13 (Frontend row)

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E06-Th02-S01-T01 | Next.js shell + ISR catalog pages | App router skeleton on the shared design system, SSR/ISR category + PDP pages served from CDN, image optimization, Core-Web-Vitals budget. | claude-code | inherit | E06-Th01-S01-T01, E02-Th02-S01-T03 | TC-PERF-001, TC-FUNC-006 | L | P0 | not_started |
| E06-Th02-S01-T02 | Web auth, location & serviceability | OTP login, session/refresh in httpOnly cookies, location detection + manual address, not-serviceable + notify-me, address book. | claude-code | inherit | E06-Th02-S01-T01, E01-Th03-S01-T03, E02-Th01-S01-T04 | TC-FUNC-001, TC-FUNC-003, TC-NEG-003 | M | P0 | not_started |
| E06-Th02-S01-T03 | Web cart, checkout, payment & COD | Cart parity with the app (same server cart), bill/coupon UI, ETA promise, gateway checkout, COD selection per eligibility, XSS-safe rendering of user-supplied fields. | claude-code | inherit | E06-Th02-S01-T02, E02-Th04-S01-T01, E03-Th03-S01-T02, E03-Th04-S01-T01 | TC-FUNC-009, TC-FUNC-013, TC-NEG-013, TC-SEC-004, TC-E2E-001 | L | P0 | not_started |
| E06-Th02-S01-T04 | Web tracking, history & accessibility pass | Tracking map with WS + polling fallback, order history/reorder/invoice download, WCAG 2.1 AA audit + fixes across all web surfaces. | claude-code | inherit | E06-Th02-S01-T03, E04-Th04-S01-T04, E03-Th01-S02-T02 | TC-FUNC-017, TC-FUNC-019, TC-NEG-017 | M | P1 | not_started |
| E06-Th02-S01-T05 | Web substitution prompt & order rating (SC-015, SC-018) | Web parity for the two remaining customer surfaces: blocking substitution modal with the 60 s countdown (accept → line swap + bill delta, reject/timeout → line refund) launched over the open web screen, and the post-delivery rating screen with the ≤ 3-star reason picker; DELIVERED-only rating enforced server-side. | claude-code | inherit | E06-Th02-S01-T04, E06-Th01-S01-T05, E04-Th01-S01-T04, E03-Th01-S02-T03 | TC-FUNC-034, TC-NEG-034, TC-FUNC-020, TC-NEG-020, TC-E2E-005 | M | P1 | not_started |

#### Th03 — Rider app (React Native, Android)

##### S01 — As Ravi, I want a minimal app that offers me jobs and gets me paid, so that my shift has no friction

**Acceptance criteria:**
- [ ] Job offer screen shows the 30 s countdown and accept/decline; declines cascade server-side
- [ ] Pickup and drop cannot be completed without verification/proof; COD collect amount shown when applicable
- [ ] GPS beacon streams every 4 s, buffers offline and drains on reconnect
- [ ] Sunlight-readable, one-handed layouts per the rider screens SC-021..SC-027

**Linked FRs:** FR-18, FR-19, FR-20, FR-11
**Linked test cases:** TC-FUNC-022, TC-FUNC-023, TC-FUNC-024, TC-FUNC-015, TC-NEG-023, TC-E2E-001, TC-E2E-003
**Linked screens:** SC-021 (rider login), SC-022 (rider home / shift toggle), SC-023 (job offer), SC-024 (pickup), SC-025 (delivery + proof), SC-026 (COD collection), SC-027 (earnings) — full rider app set SC-021..SC-027
**Architecture refs:** `02b_architecture.md` §3a (C-3), §5b

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E06-Th03-S01-T01 | Rider app shell, auth, shift toggle & earnings | RN shell in the mobile monorepo, phone-OTP login with device binding, online/offline toggle, day's deliveries + earnings screens. | claude-code | inherit | E06-Th01-S01-T01, E04-Th03-S01-T03 | TC-FUNC-024, TC-NEG-024 | L | P0 | not_started |
| E06-Th03-S01-T02 | Job offer screen with 30 s countdown | WS-delivered offer with distance/payout/countdown, accept/decline actions, race-safe UI when the offer expires or is taken. | claude-code | inherit | E06-Th03-S01-T01, E04-Th02-S01-T02 | TC-FUNC-022, TC-NEG-022 | M | P0 | not_started |
| E06-Th03-S01-T03 | Pickup/drop flow with proof + COD collect | Navigation deep-link handoff (maps provider [OPEN]), pickup OTP/scan, drop OTP/photo capture + upload, COD collect amount + collection confirmation step. | claude-code | inherit | E06-Th03-S01-T02, E04-Th03-S01-T02, E03-Th04-S01-T03 | TC-FUNC-023, TC-NEG-023, TC-E2E-003, TC-E2E-001 | L | P0 | not_started |
| E06-Th03-S01-T04 | GPS beacon with offline buffering | 4 s cadence GPS streaming over WS, batching, offline buffer with drain-on-reconnect, battery/foreground-service handling. | claude-code | inherit | E06-Th03-S01-T01, E04-Th04-S01-T01 | TC-FUNC-017, TC-PERF-005, TC-PERF-006 | M | P0 | not_started |

---

### E07 — Admin dashboard

#### Th01 — Admin shell & RBAC surfaces

##### S01 — As an admin owner, I want a fast, keyboard-friendly console that only shows each role its tools

**Acceptance criteria:**
- [ ] Login with email + password + TOTP; 8-hour sessions
- [ ] Each role's visible modules and permitted writes match the RBAC matrix exactly; read-only cannot mutate anything
- [ ] Code-split SPA; dense, keyboard-navigable layouts

**Linked FRs:** FR-29
**Linked test cases:** TC-FUNC-033, TC-NEG-033, TC-SEC-012
**Linked screens:** SC-028 (admin login / RBAC shell), SC-043 (user & role management)
**Architecture refs:** `02b_architecture.md` §3a (C-4), §8

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E07-Th01-S01-T01 | Admin SPA shell + login/TOTP + role-based nav | React + Vite SPA, code-split routes, email/password/TOTP login, session handling, nav rendered from the role's permission set. | claude-code | inherit | E01-Th03-S02-T01, E06-Th01-S01-T01 | TC-FUNC-033 | L | P0 | not_started |
| E07-Th01-S01-T02 | RBAC-driven UI surfaces + user/role management | Permission-aware component gating (never the only enforcement), user/role admin screens, partner-scoped views, read-only mode. | claude-code | inherit | E07-Th01-S01-T01, E01-Th03-S02-T02 | TC-FUNC-033, TC-NEG-033, TC-SEC-012 | M | P0 | not_started |

#### Th02 — Live ops dashboard & exception queue

##### S01 — As Neha, I want to run the day by exception, so that I intervene fast without watching everything

**Acceptance criteria:**
- [ ] Live order/rider/store state reflected within 30 s
- [ ] ETA breach appears in the queue ≤ 30 s with working reassign-rider / call-customer / cancel-refund actions
- [ ] Exception actions on terminal-state orders are refused with a state reason and the row refreshes

**Linked FRs:** FR-25
**Linked test cases:** TC-FUNC-029, TC-NEG-029, TC-FUNC-020, TC-NEG-022
**Linked screens:** SC-029 (live ops dashboard), SC-030 (exception queue)
**Architecture refs:** `02b_architecture.md` §5b step 9, §5d step 3

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E07-Th02-S01-T01 | Live ops board (orders, riders, stores) | WS-subscribed board of active orders, rider positions and store load, ≤ 30 s freshness, filters by zone/store/state. | claude-code | inherit | E07-Th01-S01-T01, E04-Th04-S01-T02 | TC-FUNC-029, TC-PERF-005 | L | P0 | not_started |
| E07-Th02-S01-T02 | Exception queue + one-click actions | ETA-breach detector feeding the queue ≤ 30 s alongside stuck/failed-payment/low-rated/no-rider/partner-timeout sources; reassign-rider, call-customer, cancel-refund actions with terminal-state guards. | claude-code | inherit | E07-Th02-S01-T01, E04-Th02-S01-T04, E03-Th03-S01-T07 | TC-FUNC-029, TC-NEG-029, TC-FUNC-020, TC-NEG-022 | L | P0 | not_started |

#### Th03 — Order management

##### S01 — As an ops agent, I want to find any order and act on it, so that support issues resolve

**Acceptance criteria:**
- [ ] Search by order ID or phone returns the full timeline: every transition with timestamp and actor
- [ ] Status modify / refund / cancel actions are audited; refunds > ₹2,000 route to finance approval

**Linked FRs:** FR-26
**Linked test cases:** TC-FUNC-030, TC-NEG-030, TC-NEG-018
**Linked screens:** SC-031 (order search & list), SC-032 (order detail — admin)
**Architecture refs:** `02b_architecture.md` §6a (order), §5e step 5

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E07-Th03-S01-T01 | Order search + full actor timeline | Search by order ID or customer phone (HMAC index), order detail with every state transition, actor and payload diff. | claude-code | inherit | E07-Th01-S01-T01, E03-Th01-S01-T01 | TC-FUNC-030 | M | P0 | not_started |
| E07-Th03-S01-T02 | Order actions + finance refund approval queue | Modify status / cancel / refund with mandatory reason and audit; finance approval queue for refunds > ₹2,000; state-invalid actions refused. | claude-code | inherit | E07-Th03-S01-T01, E03-Th03-S01-T07, E03-Th01-S02-T01 | TC-NEG-030, TC-NEG-018 | M | P0 | not_started |

#### Th04 — Catalog, inventory, partner, zone & coupon consoles

##### S01 — As ops/catalog/partner staff, I want consoles for every configurable surface, so that a full day runs without engineering

**Acceptance criteria:**
- [ ] Catalog edits and bulk CSV land on the storefront within 60 s with a success/reject report
- [ ] GRN/adjustment/cycle-count screens force a reason and surface low-stock alerts
- [ ] Zone editor rejects invalid polygons and publishes to new sessions within 60 s
- [ ] Partner console shows feed health/staleness, rejection reports and settlement/commission

**Linked FRs:** FR-21, FR-22, FR-23, FR-24, FR-9
**Linked test cases:** TC-FUNC-025, TC-NEG-025, TC-FUNC-026, TC-NEG-026, TC-FUNC-027, TC-NEG-027, TC-FUNC-028, TC-NEG-028, TC-FUNC-011, TC-NEG-038, TC-SEC-012
**Linked screens:** SC-033, SC-034 (catalog console) · SC-035, SC-036 (inventory console) · SC-037, SC-038 (partner console) · SC-039, SC-040 (zone editor + ETA config) · SC-041 (coupon console)
**Architecture refs:** `02b_architecture.md` §3a (C-4), §6a

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E07-Th04-S01-T01 | Catalog & SKU console + bulk CSV UI | Category/SKU/image CRUD, per-store price/availability grid, bulk CSV upload with row-level reject report, restricted-category block surfaced with a compliance reason. | claude-code | inherit | E07-Th01-S01-T01, E02-Th02-S01-T02 | TC-FUNC-025, TC-NEG-025, TC-NEG-038 | L | P0 | not_started |
| E07-Th04-S01-T02 | Inventory console (GRN, adjust, cycle count, alerts) | GRN entry, adjustments/cycle counts with mandatory reason, audit trail viewer, low-stock alert list with threshold configuration. | claude-code | inherit | E07-Th01-S01-T01, E05-Th01-S01-T04 | TC-FUNC-026, TC-NEG-026 | M | P0 | not_started |
| E07-Th04-S01-T03 | Partner console: onboarding, feed health & settlement | Partner store onboarding, feed mode/credentials, freshness + staleness indicators, rejection-report viewer, fill-rate scorecard and commission/settlement report; partner-role users see only their own store. | claude-code | inherit | E07-Th01-S01-T02, E05-Th02-S01-T04 | TC-FUNC-027, TC-NEG-027, TC-SEC-012 | L | P0 | not_started |
| E07-Th04-S01-T04 | Zone editor, ETA params & coupon console | Polygon draw/edit with validation errors, store-to-zone mapping, ETA parameter tuning, publish action; coupon CRUD (flat/percent, min cart, max discount, validity, usage limits). | claude-code | inherit | E07-Th01-S01-T01, E02-Th01-S01-T05, E02-Th05-S01-T02 | TC-FUNC-028, TC-NEG-028, TC-FUNC-011 | L | P0 | not_started |

#### Th05 — Analytics, warehouse & digest

##### S01 — As a stakeholder, I want KPI dashboards that reconcile with the ledger and a daily digest, so that decisions are data-driven

**Acceptance criteria:**
- [ ] Every reported number reconciles with the Postgres order ledger to the rupee; CSV export matches
- [ ] Empty ranges render zeros, never a 5xx
- [ ] Daily digest delivered at 8 am

**Linked FRs:** FR-27
**Linked test cases:** TC-FUNC-031, TC-NEG-031
**Linked screens:** SC-042 (analytics & reports)
**Architecture refs:** `02b_architecture.md` §3a (C-15), §6

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E07-Th05-S01-T01 | Warehouse sink + KPI dashboards + CSV export | **[OPEN: warehouse engine, decided with cloud vendor]** Redpanda → warehouse forwarder, GMV/orders/AOV/SLA hit/fill-rate/rider-utilization/zone-heatmap dashboards, date-range CSV export, ledger reconciliation checks, empty-range zeroing. | claude-code | inherit | E07-Th01-S01-T01, E01-Th04-S01-T03, E04-Th04-S01-T04 | TC-FUNC-031, TC-NEG-031 | L | P1 | not_started |
| E07-Th05-S01-T02 | Daily digest at 8 am | Scheduled job composing the KPI digest and delivering via email/Slack, with failure alerting and a re-send command. | claude-code | inherit | E07-Th05-S01-T01, E04-Th05-S01-T01 | TC-FUNC-031 | S | P1 | not_started |

---

### E08 — Hardening & launch

#### Th01 — Performance & load

##### S01 — As the eng lead, I want proof the SLOs hold at launch peak and at 10×, so that NFR-1/2/4/7/9 are facts, not hopes

**Acceptance criteria:**
- [ ] Browse p95 < 200 ms @ 500 RPS; search p95 < 300 ms @ 100 RPS; order confirm p95 < 3 s at 5× surge; tracking p99 ≤ 5 s @ 10k sockets
- [ ] 10× re-run passes with replica/partition changes only — no code or schema change
- [ ] Median cold start < 3 s on a mid-range Android device with offline grace proven

**Linked FRs:** FR-4, FR-5, FR-12, FR-13
**Linked test cases:** TC-PERF-001, TC-PERF-002, TC-PERF-003, TC-PERF-004, TC-PERF-005, TC-PERF-006
**Linked screens:** —
**Architecture refs:** `02b_architecture.md` §5f, §7a

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E08-Th01-S01-T01 | Load harness + browse/search/checkout/tracking runs | **[OPEN: k6 vs Gatling vs artillery]** Load scripts and prod-sized staging profile; execute browse, search, checkout-surge and 10k-socket tracking runs; publish p95/p99 + error-rate report. | claude-code | inherit | E06-Th02-S01-T01, E03-Th01-S01-T03, E04-Th04-S01-T02 | TC-PERF-001, TC-PERF-002, TC-PERF-003, TC-PERF-005 | L | P0 | not_started |
| E08-Th01-S01-T02 | 10× scale-out drill + mobile cold-start/offline validation | Scale replicas/partitions per runbook and re-run TC-PERF-001..003 at 10× volumes; measure RN cold start ×10 and offline grace on the physical device matrix. | human | inherit | E08-Th01-S01-T01, E06-Th01-S01-T05 | TC-PERF-004, TC-PERF-006 | M | P1 | not_started |

#### Th02 — Security, privacy & compliance

##### S01 — As the compliance owner, I want ASVS L2, PCI SAQ-A and DPDP proven before launch, so that NFR-5/6/10 gate the release honestly

**Acceptance criteria:**
- [ ] No injection, no IDOR, no stored XSS across all surfaces; PAN/instrument regex sweep of DB, logs, traces, Redis and object storage is clean
- [ ] PII ciphertext at rest with HMAC lookup; zero PII in logs/traces
- [ ] Consent versioned and enforced; deletion anonymizes PII while retaining statutory records, and is itself audit-logged
- [ ] Audit completeness matrix passes for every money/stock mutation, COD collection included

**Linked FRs:** FR-1, FR-9, FR-22, FR-29
**Linked test cases:** TC-SEC-004, TC-SEC-005, TC-SEC-007, TC-SEC-008, TC-SEC-009, TC-SEC-010, TC-SEC-011, TC-SEC-001, TC-SEC-002, TC-SEC-003, TC-SEC-006, TC-SEC-012
**Linked screens:** SC-019 (profile & account — DPDP consent, data-deletion request), SC-001 (T&C / consent capture at login)
**Architecture refs:** `02b_architecture.md` §8, §6c

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E08-Th02-S01-T01 | ASVS L2 spot checks, PAN sweep & PII crypto verification | Injection/IDOR/XSS payload runs across app, web, admin and CSV imports; PAN/instrument regex sweep across DB dumps, logs, traces, Redis, object storage; column-crypto + HMAC-index + log-redaction verification. | claude-code | inherit | E06-Th02-S01-T03, E07-Th01-S01-T02, E03-Th03-S01-T03 | TC-SEC-004, TC-SEC-005, TC-SEC-010, TC-SEC-011, TC-SEC-001, TC-SEC-002, TC-SEC-003, TC-SEC-006 | L | P0 | not_started |
| E08-Th02-S01-T02 | DPDP consent + deletion workflow, audit matrix & pen-test prep | Versioned consent capture + re-consent on version bump + processing gates; deletion request → in-place anonymization with statutory carve-outs, audit-logged and confirmed to the user; audit completeness matrix executed across every mutation incl. COD collection; scope pack + evidence for the external pen test. | claude-code | inherit | E08-Th02-S01-T01, E01-Th03-S03-T02, E03-Th04-S01-T03 | TC-SEC-007, TC-SEC-008, TC-SEC-009, TC-SEC-012 | L | P0 | not_started |

#### Th03 — Chaos, resilience & data safety

##### S01 — As the on-call engineer, I want the failure modes rehearsed, so that NFR-3's 99.9% survives contact with reality

**Acceptance criteria:**
- [ ] Core pod kill and full-AZ loss produce zero failed orders; realtime pod kill leaves checkout p95 unaffected and sockets recover ≤ 10 s
- [ ] Every kill switch sheds its load with the order path fully functional; consumers resume from offset with zero event loss
- [ ] PITR restore drill meets RTO ≤ 1 h / RPO ≤ 5 min; 24 h soak at 1.5× shows no SLO drift or backlog creep

**Linked FRs:** FR-13
**Linked test cases:** TC-PERF-007, TC-PERF-008, TC-INT-011, TC-INT-002, TC-INT-004, TC-NEG-017
**Linked screens:** —
**Architecture refs:** `02b_architecture.md` §11, §5f (NFR-3)

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E08-Th03-S01-T01 | Kill switches + chaos game day (pod, AZ, broker, gateway) | Feature flags to shed ratings/analytics/partner ingestion and force COD-only mode; scripted game day: core pod kill, AZ drain, realtime pod kill, Redpanda broker loss, Meili outage, Redis failover, gateway + SMS outage — each with a pre-written blast-radius statement and runbook. | claude-code | inherit | E08-Th01-S01-T01, E03-Th04-S01-T02, E04-Th04-S01-T03 | TC-PERF-007, TC-PERF-008, TC-INT-011, TC-NEG-017 | L | P0 | not_started |
| E08-Th03-S01-T02 | Backup/restore drill + 24 h soak | Weekly staging PITR restore automation, pre-launch region-loss restore via Terraform measured against RTO/RPO; 24 h soak at 1.5× launch load watching memory, consumer lag, outbox bloat, Redis eviction, socket fd exhaustion. | human | inherit | E08-Th03-S01-T01, E01-Th01-S02-T03 | TC-INT-002, TC-INT-004, TC-PERF-003 | M | P1 | not_started |

#### Th04 — Seed data & launch readiness

##### S01 — As the pod owner, I want the launch city seeded and every runbook written, so that go-live is a checklist, not an adventure

**Acceptance criteria:**
- [ ] Staging carries synthetic Delhi-NCR data: 60 stores, 50k SKUs, 2k riders, realistic zone polygons, deterministic seeds
- [ ] Production zone polygons, store-zone mapping, ETA params, coupons, COD cap and RBAC users configured before go-live
- [ ] Go-live checklist covers DLT templates, gateway merchant onboarding, FSSAI/GST, pen-test clearance, on-call rotation and rollback

**Linked FRs:** FR-24, FR-21, FR-11
**Linked test cases:** TC-FUNC-028, TC-FUNC-025, TC-INT-021, TC-NEG-013
**Linked screens:** —
**Architecture refs:** `02b_architecture.md` §7, §9

**Tasks:**

| Task ID | Title | Description | Owner | Dev tool | Depends on | Linked TCs | Estimate | Priority | Status |
|---------|-------|-------------|-------|----------|------------|------------|----------|----------|--------|
| E08-Th04-S01-T01 | Seed data & fixtures (Delhi NCR shaped) | Deterministic seed + faker factories for 60 stores / 50k SKUs / 2k riders / zone polygons / coupons / RBAC roles; fixture set under `code/tests/fixtures/` shared by CI, staging and load runs. | claude-code | inherit | E02-Th01-S01-T01, E05-Th01-S01-T01, E02-Th05-S01-T02 | TC-FUNC-028, TC-FUNC-025 | M | P0 | not_started |
| E08-Th04-S01-T02 | Launch config, runbooks & go-live checklist | Production ops config (zone polygons, store-zone map, ETA params, BR-5 COD cap, low-stock thresholds, partner cohort), on-call rotation + per-alert runbooks, deploy/rollback runbook, compliance checklist (DLT, gateway onboarding, FSSAI/GST, pen-test sign-off). | human | inherit | E08-Th04-S01-T01, E08-Th03-S01-T01, E08-Th02-S01-T02, E01-Th02-S01-T04 | TC-INT-021, TC-NEG-013 | M | P0 | not_started |

---

#### FR → task coverage map

_Every FR-1..FR-30 is delivered by at least one task; every task above links at least one real TC-xxx._

| FR | Delivered by (representative tasks) |
|----|--------------------------------------|
| FR-1 | E01-Th03-S01-T01..T04, E06-Th01-S01-T02, E06-Th02-S01-T02, E06-Th03-S01-T01 |
| FR-2 | E02-Th01-S01-T03, E06-Th01-S01-T02, E06-Th02-S01-T02 |
| FR-3 | E02-Th01-S01-T02, E02-Th01-S01-T04, E06-Th01-S01-T02 |
| FR-4 | E02-Th02-S01-T03, E06-Th01-S01-T03, E06-Th02-S01-T01 |
| FR-5 | E02-Th03-S01-T01..T03, E06-Th01-S01-T03 |
| FR-6 | E02-Th02-S01-T04, E06-Th01-S01-T03 |
| FR-7 | E02-Th04-S01-T01..T03, E06-Th01-S01-T04 |
| FR-8 | E02-Th01-S01-T05, E03-Th01-S01-T02, E06-Th01-S01-T04 |
| FR-9 | E02-Th05-S01-T01..T03, E07-Th04-S01-T04, E06-Th01-S01-T04 |
| FR-10 | E03-Th03-S01-T01..T07, E06-Th01-S01-T04, E06-Th02-S01-T03 |
| FR-11 | E03-Th04-S01-T01..T03, E06-Th01-S01-T04, E06-Th03-S01-T03 |
| FR-12 | E03-Th01-S01-T03..T05, E03-Th02-S01-T01 |
| FR-13 | E04-Th04-S01-T01..T04, E06-Th01-S01-T05, E06-Th03-S01-T04 |
| FR-14 | E03-Th01-S02-T01, E03-Th03-S01-T07, E06-Th01-S01-T05 |
| FR-15 | E03-Th01-S02-T02, E06-Th01-S01-T05, E06-Th02-S01-T04 |
| FR-16 | E03-Th01-S02-T03, E06-Th01-S01-T05, E06-Th02-S01-T05 |
| FR-17 | E04-Th01-S01-T01..T03 |
| FR-18 | E04-Th02-S01-T01..T04, E06-Th03-S01-T02 |
| FR-19 | E04-Th03-S01-T01..T02, E06-Th03-S01-T03, E03-Th04-S01-T03 |
| FR-20 | E04-Th03-S01-T03, E06-Th03-S01-T01 |
| FR-21 | E02-Th02-S01-T02, E07-Th04-S01-T01, E02-Th03-S01-T02 |
| FR-22 | E05-Th01-S01-T01..T05, E07-Th04-S01-T02 |
| FR-23 | E05-Th02-S01-T01..T05, E07-Th04-S01-T03 |
| FR-24 | E02-Th01-S01-T01, E02-Th01-S01-T05, E07-Th04-S01-T04 |
| FR-25 | E07-Th02-S01-T01..T02 |
| FR-26 | E07-Th03-S01-T01..T02, E03-Th01-S01-T01 |
| FR-27 | E07-Th05-S01-T01..T02 |
| FR-28 | E04-Th05-S01-T01..T03 |
| FR-29 | E01-Th03-S02-T01..T04, E07-Th01-S01-T01..T02 |
| FR-30 | E04-Th01-S01-T04, E06-Th01-S01-T05, E06-Th02-S01-T05 |

## 6. Dependency graph

> Cross-epic / cross-theme dependencies that the table above can't capture cleanly. Helps decide what can run in parallel.

```
                                   ┌────────────────────────────┐
   E01 Platform foundation ───────▶│  E02 Catalog & discovery   │──┐
   (repo, IaC, auth/RBAC/audit,    └────────────────────────────┘  │
    outbox→Redpanda, gateway,                    │                 │
    realtime skeleton)                           ▼                 ▼
        │      │                     ┌────────────────────┐  ┌──────────────┐
        │      └────────────────────▶│ E05 Inventory &    │─▶│ E03 Ordering │
        │                            │     partners       │  │  & payments  │
        │                            └────────────────────┘  └──────┬───────┘
        │                                       │                   │
        │                                       ▼                   ▼
        │                            ┌──────────────────────────────────────┐
        └───────────────────────────▶│  E04 Fulfillment & logistics         │
                                     └──────────────────┬───────────────────┘
                                                        │
                          ┌─────────────────────────────┴────────────┐
                          ▼                                          ▼
                 ┌──────────────────┐                     ┌────────────────────┐
                 │  E06 Client apps │                     │ E07 Admin dashboard│
                 └────────┬─────────┘                     └──────────┬─────────┘
                          └──────────────────┬───────────────────────┘
                                             ▼
                                 ┌────────────────────────┐
                                 │ E08 Hardening & launch │
                                 └────────────────────────┘
```

Notable non-obvious edges:
- **E03-Th01-S01-T03** (atomic reservation) needs **E05-Th01-S01-T01** (`store_inventory` schema) — ordering cannot start before inventory's table exists, even though E05 is a "later" epic.
- **E02-Th03-S01-T02** (search indexer) and **E05-Th01-S01-T05** (stock propagation) both need **E01-Th04-S01-T03** (consumer framework).
- **E04-Th02-S01-T02** (offer engine) needs **E01-Th04-S01-T05** (realtime gateway skeleton) to push offers.
- **E03-Th01-S01-T05** (15-min hold) needs **E03-Th03-S01-T06** (reconciliation sweep) — the hold releases on gateway truth.
- **E03-Th04-S01-T03** (COD collection) needs **E04-Th03-S01-T02** (delivery proof) — BR-8 requires both proof and collection.
- **E07-Th02-S01-T02** (exception queue) is the sink for **E04-Th02-S01-T03** (rider exhaustion), **E05-Th02-S01-T05** (partner timeout) and **E03-Th01-S02-T03** (low ratings).
- All of **E08** needs the client + admin surfaces built (E06, E07) because ASVS/XSS, cold-start and E2E cases run through them.

## 7. Sprint plan (proposed)

Dependency-ordered waves: **foundation → domain modules → clients → hardening.**

| Sprint | Epics in flight | Goal |
|--------|------------------|------|
| 1 | E01 (Th01, Th02) | **Wave 1 — foundation.** Monorepo + CI/CD green, Terraform envs up on the vendor-portable baseline (cloud vendor still [OPEN]), observability instrumented. Exit: a hello-world order-path trace stitches end-to-end. |
| 2 | E01 (Th03, Th04), E02 (Th01, Th02) | **Wave 1 cont.** Auth/RBAC/audit, outbox→Redpanda + gateway + realtime skeleton; serviceability (PostGIS) and catalog schema/CRUD land on top. Exit: login works, a zone resolves a store, an event survives a relay crash. |
| 3 | E02 (Th03–Th05), E05 (Th01) | **Wave 2 — domain modules.** Search indexer + search API, cart, pricing/coupons/invoice, dark-store inventory with audit. Exit: a priced, capped, single-store cart exists for a real serving store. |
| 4 | E03 (Th01, Th02, Th03), E05 (Th02) | **Wave 2 cont.** Orders state machine + atomic reservation + order events; payments adapter, webhooks, reconciliation, refunds; partner onboarding + feeds + BR-6. Exit: TC-NEG-015 (last-unit race ×50) and TC-INT-005..008 green against the fake gateway. |
| 5 | E03 (Th04), E04 (Th01, Th02, Th04, Th05) | **Wave 2 cont.** COD (BR-5 caps), picker workflow, dispatch offers, realtime tracking, notifications. Exit: a seeded order goes PLACED→PACKED→offered→tracked with notifications ≤ 10 s. |
| 6 | E04 (Th03), E06 (Th01, Th03), E07 (Th01–Th03) | **Wave 3 — clients.** Rider pickup/proof/earnings; customer RN app and rider app screen batches; admin shell, ops dashboard + exception queue, order management. Exit: TC-E2E-001 golden path green on staging. |
| 7 | E06 (Th02), E07 (Th04, Th05) | **Wave 3 cont.** Next.js storefront + a11y; catalog/inventory/partner/zone/coupon consoles; analytics warehouse + dashboards + daily digest. Exit: ops runs a full seeded day from the dashboard alone; TC-E2E-002/003/005 green. |
| 8 | E08 (Th01–Th04) | **Wave 4 — hardening & launch.** Load + 10× drill, ASVS L2/PCI sweep, DPDP consent+deletion, audit matrix, chaos game day, backup/restore + soak, seed data, launch runbooks + external pen test. Exit: `/testing-freeze` candidate. |

## 8. Definition of Done (universal)

A task is done iff:
- [ ] All linked test cases pass
- [ ] PR reviewed by at least one human (per Code Review phase)
- [ ] Acceptance criteria from the parent Story checked off
- [ ] No new `[OPEN]` items introduced without owner + ETA
- [ ] Documentation updated (inline comments + relevant `.md`)
- [ ] No new lint / type-check warnings

## 9. Parallelism guidance for Claude Code

> Tell Claude Code which Epics / Themes can run in parallel agent sessions vs which are strictly sequential.

| Can run in parallel | Must be sequential |
|---|---|
| E01-Th01 ‖ E01-Th02 (pipeline vs telemetry, no shared code) | E01-Th01-S01 → E01-Th01-S02 (IaC needs the repo + image build) |
| E02-Th01 ‖ E02-Th02 (serviceability vs catalog — different schemas) | E02-Th02 → E02-Th03 (index schema follows SKU schema) |
| E02-Th03 ‖ E02-Th04 ‖ E02-Th05 (search vs cart vs pricing) | E01-Th04-S01-T01 → T02 → T03 (outbox → relay → consumer framework) |
| E03-Th03 ‖ E03-Th01 up to the reservation task (payments port vs order schema) | E03-Th01-S01-T02 → T03 → T04 (session → reservation → idempotency) |
| E04-Th01 ‖ E04-Th02 ‖ E04-Th05 (picker vs dispatch vs notifications) | E04-Th02-S01-T02 → T03 → T04 (offer → cascade → BR-7/force-assign) |
| E05-Th01 ‖ E05-Th02 after `store_inventory` lands | E05-Th01-S01-T01 → E03-Th01-S01-T03 (reservation needs the inventory table) |
| E06-Th01 ‖ E06-Th02 ‖ E06-Th03 (three clients, one design system) | E06-Th01-S01-T01 → all other E06 tasks (shared shell + design system) |
| E07-Th04 ‖ E07-Th05 (consoles vs analytics) | E07-Th01-S01-T01 → all other E07 tasks (admin shell + auth) |
| E08-Th01 ‖ E08-Th02 (load vs security) once E06/E07 are feature-complete | E08-Th03-S01-T01 → E08-Th03-S01-T02 → E08-Th04-S01-T02 (chaos → soak → go-live checklist) |

## 10. Open items
- [ ] **Cloud vendor** — owner: Eng lead (TBD) / Devendra Sharma. Carried from BRS §13 and Arch §12. **Tagged E01 IaC tasks:** E01-Th01-S02-T01, T02, T03, T04, T06, T07 (vendor-specific module wiring only — K8s/Postgres/Redis/Kafka-API/S3-compatible interfaces keep the tasks buildable now). Also gates E07-Th05-S01-T01 (warehouse engine). Needed before the E01 Th01-S02 tasks can leave `in_review`.
- [ ] **Payment gateway vendor** — owner: Lead/Finance. E03-Th03 tasks build and test against the in-repo port-conformant fake gateway (E03-Th03-S01-T01); re-run TC-FUNC-013/014, TC-NEG-011/012, TC-INT-005..008/017/018, TC-E2E-004 against the real sandbox before `/testing-freeze`.
- [ ] **Maps/geo provider** — owner: Eng lead. Affects E02-Th01-S01-T03 (geocoding port) and E06-Th03-S01-T03 (navigation deep-link) SDK choice only.
- [ ] **SMS/DLT provider + template registration** — owner: Ops/Lead, 2–4 week lead time. Template IDs are config for E04-Th05-S01-T01, not a build blocker.
- [ ] **Load-test tooling** (k6 vs Gatling vs artillery) — owner: Eng lead. Affects E08-Th01-S01-T01 fixture format only.
- [ ] **Rider app distribution** (Play Store vs private/MDM) — owner: Ops + Eng lead. Affects E06-Th03 release mechanics, not build.
- [ ] **`TC-VIS-*` links** — absent by design; `/tc-augment` after `/design-freeze` generates them and QA re-freezes `03b`. E06/E07 screen-batch tasks pick up their TC-VIS links on that pass.

---


## Revision history

| # | Date | Triggered by | Scope of change | Re-frozen by |
|---|------|---------------|------------------|---------------|
| v1 | (initial freeze date) | Initial | (initial freeze) | (filled at first /X-freeze) |
| v2 | 2026-07-17 | Direct revision | (initial) | Devendra Sharma |

> Each subsequent /X-freeze appends a row here, tagged with the active CR ID (if any).
> The most-recent freeze is the current canonical state. The history is the audit trail.

## Sign-off

- **Reviewer:** Devendra Sharma
- **Role:** Engineering Manager
- **Timestamp:** 2026-07-17T09:36:25Z
- **Status:** ✅ Frozen
- **Notes:** 130 tasks, all TC-linked; owner Claude Code reviewed by Devendra. Cloud vendor open — tagged on 6 E01 IaC tasks.
