# Brief index — GroFast

_Generated 2026-07-22T12:56:16Z._ Mode: **strict**.

Read `00_PROJECT_OVERVIEW.md` once at session start, then this file to find the next eligible item, then the per-task / per-story brief.

## Status legend
✅ done · 🟡 in_dev · ⏳ pending · 🔒 blocked · 🚫 skipped (designs missing)

## E01

### E01-Th01-S01 — As an engineer, I want a monorepo with enforced module seams and a green pipeline, so that every later task lands on a working, checked baseline

- ✅ `E01-Th01-S01-T01` — Monorepo scaffold  [inherit]
- ✅ `E01-Th01-S01-T02` — Module boundary lint + shared contracts  [inherit] deps: E01-Th01-S01-T01
- ✅ `E01-Th01-S01-T03` — CI pipeline for PRs  [inherit] deps: E01-Th01-S01-T02
- ⏳ `E01-Th01-S01-T04` — Container build, registry & supply-chain scan  [inherit] deps: E01-Th01-S01-T03
- ⏳ `E01-Th01-S01-T05` — Deploy pipeline + migration pre-deploy job  [inherit] deps: E01-Th01-S01-T04

### E01-Th01-S02 — As an eng lead, I want all three environments defined in Terraform on a vendor-portable K8s baseline, so that we can pick the cloud vendor late without redesign

- ⏳ `E01-Th01-S02-T01` — Terraform skeleton, workspaces & remote state  [inherit] deps: E01-Th01-S01-T01
- ⏳ `E01-Th01-S02-T02` — Network + managed Kubernetes cluster  [inherit] deps: E01-Th01-S02-T01
- ⏳ `E01-Th01-S02-T03` — Managed Postgres + PostGIS, replica, PITR  [inherit] deps: E01-Th01-S02-T01
- ⏳ `E01-Th01-S02-T04` — Managed Redis (HA pair)  [inherit] deps: E01-Th01-S02-T01
- ⏳ `E01-Th01-S02-T05` — Redpanda + Meilisearch StatefulSets  [inherit] deps: E01-Th01-S02-T02
- ⏳ `E01-Th01-S02-T06` — Object storage, CDN + WAF edge  [inherit] deps: E01-Th01-S02-T01
- ⏳ `E01-Th01-S02-T07` — Secret management & rotation  [inherit] deps: E01-Th01-S02-T02

### E01-Th02-S01 — As an on-call engineer, I want traces, metrics, logs and SLO alerts from day one, so that the order path is debuggable before it carries money

- ⏳ `E01-Th02-S01-T01` — OpenTelemetry tracing across all deployables  [inherit] deps: E01-Th01-S01-T02
- ⏳ `E01-Th02-S01-T02` — Prometheus + Grafana: RED + business metrics  [inherit] deps: E01-Th01-S02-T02
- ⏳ `E01-Th02-S01-T03` — Structured logging with PII redaction  [inherit] deps: E01-Th02-S01-T01
- ⏳ `E01-Th02-S01-T04` — SLO burn-rate alerts + runbooks  [inherit] deps: E01-Th02-S01-T02

### E01-Th03-S01 — As a customer/rider, I want to log in with my phone and an OTP, so that I never manage a password

- ✅ `E01-Th03-S01-T01` — User entity + OTP issue/verify  [inherit] deps: E01-Th01-S01-T02, E01-Th01-S02-T03
- ⏳ `E01-Th03-S01-T02` — OTP abuse protection  [inherit] deps: E01-Th03-S01-T01, E01-Th01-S02-T06
- ⏳ `E01-Th03-S01-T03` — JWT issue + refresh rotation with reuse detection  [inherit] deps: E01-Th03-S01-T01, E01-Th01-S02-T07
- ⏳ `E01-Th03-S01-T04` — Audience claims + gateway auth guard  [inherit] deps: E01-Th03-S01-T03

### E01-Th03-S02 — As an admin owner, I want role-based access with TOTP, so that staff only see their tools and every denial is on the record

- ⏳ `E01-Th03-S02-T01` — Admin/staff auth: email + argon2 + mandatory TOTP  [inherit] deps: E01-Th03-S01-T03
- ⏳ `E01-Th03-S02-T02` — RBAC role/permission model + guards  [inherit] deps: E01-Th03-S02-T01
- ⏳ `E01-Th03-S02-T03` — Partner user row-scoping  [inherit] deps: E01-Th03-S02-T02
- ⏳ `E01-Th03-S02-T04` — Denied-attempt audit logging  [inherit] deps: E01-Th03-S02-T02, E01-Th03-S03-T01

### E01-Th03-S03 — As a compliance owner, I want an immutable audit log covering every money/stock mutation, so that NFR-10 holds by construction

- ⏳ `E01-Th03-S03-T01` — Append-only audit schema + append API  [inherit] deps: E01-Th01-S02-T03
- ⏳ `E01-Th03-S03-T02` — Audit consumer from `audit.*` topic  [inherit] deps: E01-Th03-S03-T01, E01-Th04-S01-T03

### E01-Th04-S01 — As the platform, I want a transactional outbox relayed to Redpanda plus a worker/realtime runtime, so that domain events are never lost and never double-applied

- ⏳ `E01-Th04-S01-T01` — Outbox table + in-transaction write helper  [inherit] deps: E01-Th01-S02-T03
- ⏳ `E01-Th04-S01-T02` — Outbox relay worker (at-least-once)  [inherit] deps: E01-Th04-S01-T01, E01-Th01-S02-T05
- ⏳ `E01-Th04-S01-T03` — Topics, versioned envelope & consumer framework  [inherit] deps: E01-Th04-S01-T02
- ⏳ `E01-Th04-S01-T04` — API gateway / BFF ingress  [inherit] deps: E01-Th03-S01-T04
- ⏳ `E01-Th04-S01-T05` — Realtime gateway skeleton  [inherit] deps: E01-Th04-S01-T04, E01-Th01-S02-T04

## E02

### E02-Th01-S01 — As a customer, I want to know instantly whether my location is serviceable and which store serves me, so that I never build a dead cart

- ⏳ `E02-Th01-S01-T01` — Zone & store schema with GIST + polygon validation  [inherit] deps: E01-Th01-S02-T03
- ⏳ `E02-Th01-S01-T02` — Serviceability resolver (`ST_Contains`) with pinned boundary semantics  [inherit] deps: E02-Th01-S01-T01, E01-Th01-S02-T04
- ⏳ `E02-Th01-S01-T03` — Address book + geocode + zone resolution  [inherit] deps: E02-Th01-S01-T02, E01-Th03-S01-T01
- ⏳ `E02-Th01-S01-T04` — Not-serviceable state + notify-me capture  [inherit] deps: E02-Th01-S01-T02
- ⏳ `E02-Th01-S01-T05` — Dynamic ETA computation + zone publish invalidation  [inherit] deps: E02-Th01-S01-T02

### E02-Th02-S01 — As a catalog manager, I want SKU/category CRUD with bulk upload, and as a customer I want honest per-store browse and detail, so that the storefront is never wrong

- ⏳ `E02-Th02-S01-T01` — SKU & category schema  [inherit] deps: E01-Th01-S02-T03
- ⏳ `E02-Th02-S01-T02` — Catalog CRUD API + bulk CSV + BR-9 guard  [inherit] deps: E02-Th02-S01-T01, E01-Th04-S01-T01
- ⏳ `E02-Th02-S01-T03` — Per-store browse API + Redis catalog cache  [inherit] deps: E02-Th02-S01-T01, E02-Th01-S01-T02
- ⏳ `E02-Th02-S01-T04` — Product detail API  [inherit] deps: E02-Th02-S01-T03

### E02-Th03-S01 — As a customer, I want forgiving sub-300 ms search, so that misspellings still find my item

- ⏳ `E02-Th03-S01-T01` — Meilisearch index schema & ranking rules  [inherit] deps: E01-Th01-S02-T05, E02-Th02-S01-T01
- ⏳ `E02-Th03-S01-T02` — Search indexer worker  [inherit] deps: E02-Th03-S01-T01, E01-Th04-S01-T03
- ⏳ `E02-Th03-S01-T03` — Search API with empty-state alternates  [inherit] deps: E02-Th03-S01-T01

### E02-Th04-S01 — As a customer, I want a persistent single-store cart that refuses impossible quantities, so that my cart is always orderable

- ⏳ `E02-Th04-S01-T01` — Cart API with Redis hot copy + PG durability  [inherit] deps: E02-Th02-S01-T03, E01-Th01-S02-T04
- ⏳ `E02-Th04-S01-T02` — Single-store rule enforcement (BR-1)  [inherit] deps: E02-Th04-S01-T01, E02-Th01-S01-T02
- ⏳ `E02-Th04-S01-T03` — Quantity caps: stock + per-order  [inherit] deps: E02-Th04-S01-T01

### E02-Th05-S01 — As a customer, I want an itemized, tamper-proof bill with working coupons and a GST invoice, so that pricing is transparent and legal

- ⏳ `E02-Th05-S01-T01` — Fee & bill computation engine (server-authoritative)  [inherit] deps: E02-Th04-S01-T01
- ⏳ `E02-Th05-S01-T02` — Coupon engine (flat/percent, limits, reasons)  [inherit] deps: E02-Th05-S01-T01
- ⏳ `E02-Th05-S01-T03` — GST invoice generation at delivery  [inherit] deps: E02-Th05-S01-T01, E01-Th01-S02-T06

## E03

### E03-Th01-S01 — As a customer, I want my order accepted only if the stock is really there and the charge is really made, so that I'm never disappointed or double-charged

- ⏳ `E03-Th01-S01-T01` — Order schema + state machine + transition ledger  [inherit] deps: E01-Th01-S02-T03, E01-Th04-S01-T01
- ⏳ `E03-Th01-S01-T02` — Checkout session API (revalidate + ETA promise)  [inherit] deps: E03-Th01-S01-T01, E02-Th05-S01-T01, E02-Th01-S01-T05
- ⏳ `E03-Th01-S01-T03` — Atomic stock reservation transaction  [inherit] deps: E03-Th01-S01-T02, E05-Th01-S01-T01
- ⏳ `E03-Th01-S01-T04` — Checkout-confirm idempotency  [inherit] deps: E03-Th01-S01-T03, E01-Th04-S01-T04
- ⏳ `E03-Th01-S01-T05` — 15-minute unpaid-hold expiry (BR-3)  [inherit] deps: E03-Th01-S01-T03, E03-Th03-S01-T06

### E03-Th01-S02 — As a customer, I want to cancel, reorder and rate, so that mistakes are cheap and repeat shopping is instant

- ⏳ `E03-Th01-S02-T01` — Cancellation + stock release + refund trigger  [inherit] deps: E03-Th01-S01-T03, E03-Th03-S01-T07
- ⏳ `E03-Th01-S02-T02` — Order history + one-tap reorder  [inherit] deps: E03-Th01-S01-T01, E02-Th04-S01-T01
- ⏳ `E03-Th01-S02-T03` — Ratings + low-rating exception routing  [inherit] deps: E03-Th01-S01-T01

### E03-Th02-S01 — As a downstream system, I want every order/stock/payment state change as a durable event, so that notifications, picking, analytics and audit are decoupled from checkout

- ⏳ `E03-Th02-S01-T01` — Domain event emission for order/stock/payment  [inherit] deps: E03-Th01-S01-T03, E01-Th04-S01-T01
- ⏳ `E03-Th02-S01-T02` — Consumer idempotency + replay safety verification  [inherit] deps: E03-Th02-S01-T01, E01-Th04-S01-T03

### E03-Th03-S01 — As finance, I want money to be impossible to lose or duplicate, so that BR-4 and objective #4 hold even when the gateway misbehaves

- ⏳ `E03-Th03-S01-T01` — Gateway-agnostic payments port + fake gateway  [inherit] deps: E01-Th01-S01-T02, E01-Th01-S02-T03
- ⏳ `E03-Th03-S01-T02` — Intent creation with idempotency key  [inherit] deps: E03-Th03-S01-T01, E03-Th01-S01-T02
- ⏳ `E03-Th03-S01-T03` — Server-side capture verification  [inherit] deps: E03-Th03-S01-T02
- ⏳ `E03-Th03-S01-T04` — Signed webhook ingress (HMAC + replay window)  [inherit] deps: E03-Th03-S01-T01, E01-Th04-S01-T04, E01-Th01-S02-T07
- ⏳ `E03-Th03-S01-T05` — Idempotent webhook upsert + state comparison  [inherit] deps: E03-Th03-S01-T04, E03-Th01-S01-T03
- ⏳ `E03-Th03-S01-T06` — Reconciliation sweep worker (5 min)  [inherit] deps: E03-Th03-S01-T05, E01-Th04-S01-T03
- ⏳ `E03-Th03-S01-T07` — Refunds + BR-4 SLA monitor + approval threshold  [inherit] deps: E03-Th03-S01-T05

### E03-Th04-S01 — As a customer, I want COD as a fallback, so that I can order without digital payment — within the caps finance set

- ⏳ `E03-Th04-S01-T01` — COD eligibility: BR-5 cap config + risk flag  [inherit] deps: E03-Th01-S01-T02
- ⏳ `E03-Th04-S01-T02` — COD order placement path  [inherit] deps: E03-Th04-S01-T01, E03-Th01-S01-T03
- ⏳ `E03-Th04-S01-T03` — COD collection, rider float & reconciliation report  [inherit] deps: E03-Th04-S01-T02, E04-Th03-S01-T02

## E04

### E04-Th01-S01 — As a picker, I want a layout-ordered, barcode-verified pick list with an OOS escape hatch, so that I pack fast and honestly

- ⏳ `E04-Th01-S01-T01` — Picker-queue projection from `order.placed`  [inherit] deps: E03-Th02-S01-T01, E01-Th04-S01-T03
- ⏳ `E04-Th01-S01-T02` — Pick list in store-layout order + accept transition  [inherit] deps: E04-Th01-S01-T01, E03-Th01-S01-T01
- ⏳ `E04-Th01-S01-T03` — Barcode verification + pack completion  [inherit] deps: E04-Th01-S01-T02
- ⏳ `E04-Th01-S01-T04` — OOS flag → substitute-or-refund (60 s)  [inherit] deps: E04-Th01-S01-T03, E03-Th03-S01-T07, E04-Th05-S01-T02

### E04-Th02-S01 — As a rider, I want nearby jobs offered to me automatically, so that I earn without hunting

- ⏳ `E04-Th02-S01-T01` — Rider & assignment schema + Redis GEO membership  [inherit] deps: E01-Th01-S02-T03, E01-Th01-S02-T04
- ⏳ `E04-Th02-S01-T02` — Offer engine: GEOSEARCH + 30 s TTL  [inherit] deps: E04-Th02-S01-T01, E04-Th04-S01-T01, E01-Th04-S01-T03
- ⏳ `E04-Th02-S01-T03` — Decline/timeout cascade + exhaustion → exception queue  [inherit] deps: E04-Th02-S01-T02
- ⏳ `E04-Th02-S01-T04` — BR-7 single-active guard + ops force-assign  [inherit] deps: E04-Th02-S01-T03

### E04-Th03-S01 — As a rider, I want clear verified pickup/drop steps and honest earnings, so that deliveries are error-free and my shift is mine

- ⏳ `E04-Th03-S01-T01` — Pickup verification (OTP / scan)  [inherit] deps: E04-Th02-S01-T02, E03-Th01-S01-T01
- ⏳ `E04-Th03-S01-T02` — Delivery proof (OTP or photo) → object storage  [inherit] deps: E04-Th03-S01-T01, E01-Th01-S02-T06, E02-Th05-S01-T03
- ⏳ `E04-Th03-S01-T03` — Online/offline toggle + earnings ledger  [inherit] deps: E04-Th02-S01-T01, E04-Th03-S01-T02

### E04-Th04-S01 — As a customer, I want the rider on a live map, so that I know when to be at the door

- ⏳ `E04-Th04-S01-T01` — GPS ingest → Redis GEO + pub/sub publish  [inherit] deps: E01-Th04-S01-T05, E04-Th02-S01-T01
- ⏳ `E04-Th04-S01-T02` — Tracking fan-out + order-status bridge  [inherit] deps: E04-Th04-S01-T01, E03-Th02-S01-T01
- ⏳ `E04-Th04-S01-T03` — Reconnect resume + state fetch on subscribe  [inherit] deps: E04-Th04-S01-T02
- ⏳ `E04-Th04-S01-T04` — Polling fallback + rider_location archive  [inherit] deps: E04-Th04-S01-T01

### E04-Th05-S01 — As the platform, I want a templated push/SMS notification on every lifecycle event, so that customers and riders are never in the dark

- ⏳ `E04-Th05-S01-T01` — Template registry + event→template mapping  [inherit] deps: E01-Th04-S01-T03
- ⏳ `E04-Th05-S01-T02` — Push sender (FCM/APNs) ≤ 10 s  [inherit] deps: E04-Th05-S01-T01
- ⏳ `E04-Th05-S01-T03` — SMS fallback + retry/backoff + ops alert  [inherit] deps: E04-Th05-S01-T02

## E05

### E05-Th01-S01 — As an ops manager, I want GRN, adjustments and cycle counts with a full audit trail and alerts, so that system stock matches shelf stock

- ⏳ `E05-Th01-S01-T01` — `store_inventory` schema + indexes  [inherit] deps: E02-Th02-S01-T01, E02-Th01-S01-T01
- ⏳ `E05-Th01-S01-T02` — GRN (goods receipt)  [inherit] deps: E05-Th01-S01-T01, E01-Th04-S01-T01
- ⏳ `E05-Th01-S01-T03` — Adjustments & cycle counts with mandatory reason  [inherit] deps: E05-Th01-S01-T02
- ⏳ `E05-Th01-S01-T04` — Low-stock alerting  [inherit] deps: E05-Th01-S01-T03
- ⏳ `E05-Th01-S01-T05` — Stock event propagation ≤ 60 s  [inherit] deps: E05-Th01-S01-T03, E02-Th03-S01-T02

### E05-Th02-S01 — As a partner manager, I want to onboard stores and ingest their stock via API or CSV, so that coverage grows without lying about stock

- ⏳ `E05-Th02-S01-T01` — Partner store onboarding + partner users  [inherit] deps: E02-Th01-S01-T01, E01-Th03-S02-T03
- ⏳ `E05-Th02-S01-T02` — API feed ingestion + SKU mapping/merge  [inherit] deps: E05-Th02-S01-T01, E05-Th01-S01-T01
- ⏳ `E05-Th02-S01-T03` — CSV feed ingestion + rejection report  [inherit] deps: E05-Th02-S01-T02, E01-Th01-S02-T06
- ⏳ `E05-Th02-S01-T04` — Freshness evaluation + BR-6 degraded listing  [inherit] deps: E05-Th02-S01-T02, E02-Th01-S01-T05
- ⏳ `E05-Th02-S01-T05` — Partner order notify, READY & timeout auto-cancel  [inherit] deps: E05-Th02-S01-T01, E03-Th03-S01-T07, E04-Th05-S01-T02

## E06

### E06-Th01-S01 — As Priya, I want to order in under two minutes on my phone, so that quick commerce actually feels quick

- ⏳ `E06-Th01-S01-T01` — App shell, navigation & shared design system  [inherit] deps: E01-Th01-S01-T01
- ⏳ `E06-Th01-S01-T02` — Screen batch — auth & address (SC-001, SC-002, SC-003, SC-004, SC-020)  [inherit] deps: E06-Th01-S01-T01, E01-Th03-S01-T03, E02-Th01-S01-T04
- ⏳ `E06-Th01-S01-T03` — Screen batch — browse, search & PDP (SC-005, SC-006, SC-007, SC-008)  [inherit] deps: E06-Th01-S01-T02, E02-Th02-S01-T04, E02-Th03-S01-T03
- ⏳ `E06-Th01-S01-T04` — Screen batch — cart, checkout & payment incl. COD (SC-009, SC-010, SC-011, SC-012, SC-013)  [inherit] deps: E06-Th01-S01-T03, E02-Th04-S01-T03, E02-Th05-S01-T02, E03-Th03-S01-T02, E03-Th04-S01-T01
- ⏳ `E06-Th01-S01-T05` — Screen batch — tracking, history, rating & offline cache (SC-014, SC-015, SC-016, SC-017, SC-018, SC-019)  [inherit] deps: E06-Th01-S01-T04, E04-Th04-S01-T04, E03-Th01-S02-T03, E04-Th01-S01-T04

### E06-Th02-S01 — As Sunita, I want the same journey on the web, so that a big basket is comfortable on a bigger screen

- ⏳ `E06-Th02-S01-T01` — Next.js shell + ISR catalog pages  [inherit] deps: E06-Th01-S01-T01, E02-Th02-S01-T03
- ⏳ `E06-Th02-S01-T02` — Web auth, location & serviceability  [inherit] deps: E06-Th02-S01-T01, E01-Th03-S01-T03, E02-Th01-S01-T04
- ⏳ `E06-Th02-S01-T03` — Web cart, checkout, payment & COD  [inherit] deps: E06-Th02-S01-T02, E02-Th04-S01-T01, E03-Th03-S01-T02, E03-Th04-S01-T01
- ⏳ `E06-Th02-S01-T04` — Web tracking, history & accessibility pass  [inherit] deps: E06-Th02-S01-T03, E04-Th04-S01-T04, E03-Th01-S02-T02
- ⏳ `E06-Th02-S01-T05` — Web substitution prompt & order rating (SC-015, SC-018)  [inherit] deps: E06-Th02-S01-T04, E06-Th01-S01-T05, E04-Th01-S01-T04, E03-Th01-S02-T03

### E06-Th03-S01 — As Ravi, I want a minimal app that offers me jobs and gets me paid, so that my shift has no friction

- ⏳ `E06-Th03-S01-T01` — Rider app shell, auth, shift toggle & earnings  [inherit] deps: E06-Th01-S01-T01, E04-Th03-S01-T03
- ⏳ `E06-Th03-S01-T02` — Job offer screen with 30 s countdown  [inherit] deps: E06-Th03-S01-T01, E04-Th02-S01-T02
- ⏳ `E06-Th03-S01-T03` — Pickup/drop flow with proof + COD collect  [inherit] deps: E06-Th03-S01-T02, E04-Th03-S01-T02, E03-Th04-S01-T03
- ⏳ `E06-Th03-S01-T04` — GPS beacon with offline buffering  [inherit] deps: E06-Th03-S01-T01, E04-Th04-S01-T01

## E07

### E07-Th01-S01 — As an admin owner, I want a fast, keyboard-friendly console that only shows each role its tools

- ⏳ `E07-Th01-S01-T01` — Admin SPA shell + login/TOTP + role-based nav  [inherit] deps: E01-Th03-S02-T01, E06-Th01-S01-T01
- ⏳ `E07-Th01-S01-T02` — RBAC-driven UI surfaces + user/role management  [inherit] deps: E07-Th01-S01-T01, E01-Th03-S02-T02

### E07-Th02-S01 — As Neha, I want to run the day by exception, so that I intervene fast without watching everything

- ⏳ `E07-Th02-S01-T01` — Live ops board (orders, riders, stores)  [inherit] deps: E07-Th01-S01-T01, E04-Th04-S01-T02
- ⏳ `E07-Th02-S01-T02` — Exception queue + one-click actions  [inherit] deps: E07-Th02-S01-T01, E04-Th02-S01-T04, E03-Th03-S01-T07

### E07-Th03-S01 — As an ops agent, I want to find any order and act on it, so that support issues resolve

- ⏳ `E07-Th03-S01-T01` — Order search + full actor timeline  [inherit] deps: E07-Th01-S01-T01, E03-Th01-S01-T01
- ⏳ `E07-Th03-S01-T02` — Order actions + finance refund approval queue  [inherit] deps: E07-Th03-S01-T01, E03-Th03-S01-T07, E03-Th01-S02-T01

### E07-Th04-S01 — As ops/catalog/partner staff, I want consoles for every configurable surface, so that a full day runs without engineering

- ⏳ `E07-Th04-S01-T01` — Catalog & SKU console + bulk CSV UI  [inherit] deps: E07-Th01-S01-T01, E02-Th02-S01-T02
- ⏳ `E07-Th04-S01-T02` — Inventory console (GRN, adjust, cycle count, alerts)  [inherit] deps: E07-Th01-S01-T01, E05-Th01-S01-T04
- ⏳ `E07-Th04-S01-T03` — Partner console: onboarding, feed health & settlement  [inherit] deps: E07-Th01-S01-T02, E05-Th02-S01-T04
- ⏳ `E07-Th04-S01-T04` — Zone editor, ETA params & coupon console  [inherit] deps: E07-Th01-S01-T01, E02-Th01-S01-T05, E02-Th05-S01-T02

### E07-Th05-S01 — As a stakeholder, I want KPI dashboards that reconcile with the ledger and a daily digest, so that decisions are data-driven

- ⏳ `E07-Th05-S01-T01` — Warehouse sink + KPI dashboards + CSV export  [inherit] deps: E07-Th01-S01-T01, E01-Th04-S01-T03, E04-Th04-S01-T04
- ⏳ `E07-Th05-S01-T02` — Daily digest at 8 am  [inherit] deps: E07-Th05-S01-T01, E04-Th05-S01-T01

## E08

### E08-Th01-S01 — As the eng lead, I want proof the SLOs hold at launch peak and at 10×, so that NFR-1/2/4/7/9 are facts, not hopes

- ⏳ `E08-Th01-S01-T01` — Load harness + browse/search/checkout/tracking runs  [inherit] deps: E06-Th02-S01-T01, E03-Th01-S01-T03, E04-Th04-S01-T02
- ⏳ `E08-Th01-S01-T02` — 10× scale-out drill + mobile cold-start/offline validation  [inherit] deps: E08-Th01-S01-T01, E06-Th01-S01-T05

### E08-Th02-S01 — As the compliance owner, I want ASVS L2, PCI SAQ-A and DPDP proven before launch, so that NFR-5/6/10 gate the release honestly

- ⏳ `E08-Th02-S01-T01` — ASVS L2 spot checks, PAN sweep & PII crypto verification  [inherit] deps: E06-Th02-S01-T03, E07-Th01-S01-T02, E03-Th03-S01-T03
- ⏳ `E08-Th02-S01-T02` — DPDP consent + deletion workflow, audit matrix & pen-test prep  [inherit] deps: E08-Th02-S01-T01, E01-Th03-S03-T02, E03-Th04-S01-T03

### E08-Th03-S01 — As the on-call engineer, I want the failure modes rehearsed, so that NFR-3's 99.9% survives contact with reality

- ⏳ `E08-Th03-S01-T01` — Kill switches + chaos game day (pod, AZ, broker, gateway)  [inherit] deps: E08-Th01-S01-T01, E03-Th04-S01-T02, E04-Th04-S01-T03
- ⏳ `E08-Th03-S01-T02` — Backup/restore drill + 24 h soak  [inherit] deps: E08-Th03-S01-T01, E01-Th01-S02-T03

### E08-Th04-S01 — As the pod owner, I want the launch city seeded and every runbook written, so that go-live is a checklist, not an adventure

- ⏳ `E08-Th04-S01-T01` — Seed data & fixtures (Delhi NCR shaped)  [inherit] deps: E02-Th01-S01-T01, E05-Th01-S01-T01, E02-Th05-S01-T02
- ⏳ `E08-Th04-S01-T02` — Launch config, runbooks & go-live checklist  [inherit] deps: E08-Th04-S01-T01, E08-Th03-S01-T01, E08-Th02-S01-T02, E01-Th02-S01-T04

---

## How to use

1. Pick the next eligible item (lowest unmet deps).
2. Read its brief file.
3. Implement → tests → PR → `/task-complete <id> --pr "#NN"`.
4. Loop. INDEX.md auto-regenerates on each `/task-complete`.
