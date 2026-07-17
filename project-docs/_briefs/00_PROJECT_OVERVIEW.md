# Project overview — GroFast

> **Read this once at the start of your dev session.** Then `INDEX.md` to find the next task, then `<task-id>.md` for the task itself.

| | |
|---|---|
| **Project** | GroFast |
| **ID** | `grofast` |
| **Lead** | Devendra Sharma |
| **Type** | greenfield |
| **Generated** | 2026-07-17T09:37:41Z |

---

## What we're building

GroFast is a hyperlocal quick-commerce grocery delivery platform for the Indian market, modeled on Zepto's operating playbook with a hybrid fulfillment twist: company-run dark stores deliver in 10–20 minutes inside dense urban zones, while partnered local stores extend coverage where dark stores don't yet exist. V1 ships four clients — a customer mobile app, a customer web storefront, a rider app, and an admin + ops dashboard — backed by a single scalable platform covering catalog, ordering, secure payments, real-time order tracking, inventory management, and operational analytics. The goal of V1 is to prove the unit economics and delivery promise in one launch city before multi-city expansion.

## Top business objectives

| # | Objective | Success metric | Priority |
|---|---|---|---|
| 1 | Deliver on the speed promise in dark-store zones | ≥ 85% of dark-store orders delivered within the ETA promised at checkout; median delivery ≤ 20 min | P0 |
| 2 | Establish reliable order fulfillment end-to-end | Order fulfillment rate ≥ 95% (placed → delivered, excl. customer cancellations); item fill rate ≥ 97% | P0 |
| 3 | Convert browsers to buyers with a frictionless ordering flow | Checkout conversion ≥ 60% from cart; order placement flow ≤ 90 seconds for a returning customer | P0 |
| 4 | Achieve payment reliability and trust | Payment success rate ≥ 97% on UPI; refunds auto-initiated within 24 h of a failed/cancelled order | P0 |
| 5 | Keep stock data honest across the hybrid network | OOS-after-order rate ≤ 2% of line items; partner-store stock feed freshness ≤ 15 min | P1 |
| 6 | Give ops real-time visibility to run the network | Admin dashboard reflects order/inventory state within 30 s; daily automated KPI report | P1 |
| 7 | Build repeat-purchase behavior | ≥ 40% of month-1 customers place a second order within 30 days | P1 |

## Tech stack

_Per choice: **what**, **why**, **alternatives considered**, **rejection reason**._

| Layer | Choice | Why | Alternatives considered | Why rejected |
|---|---|---|---|---|
| Frontend (customer web + admin) | React 18 + Next.js (customer storefront, SSR/ISR for SEO + speed); React + Vite SPA (admin dashboard) | One React skill set across all web surfaces; Next.js ISR gives cached catalog pages (NFR-1); admin needs no SSR | Vue/Nuxt; SvelteKit; server-rendered templates | Smaller ecosystem overlap with React Native; team/AI-tool fluency highest in React |
| Mobile (customer Android+iOS, rider Android) | React Native (TypeScript), shared design-system package with web | Two apps from one codebase + shared types with backend; OTA updates (CodePush-class) for fast iteration; meets NFR-9 with Hermes | Flutter; native Kotlin/Swift | Flutter forks the language (Dart) away from the TS stack; dual-native doubles effort for a 4-client V1 |
| Backend | Node.js 20 + TypeScript + NestJS **modular monolith** (`grofast-core`), module-per-domain with enforced import boundaries | NestJS modules give real compile-time seams (DI, per-module providers) — the monolith-with-seams strategy depends on this; one language with all clients; async-I/O model fits an I/O-bound order platform; p95 targets (NFR-1/2) comfortably met with Redis/Meili in front | Go (chi/echo); Kotlin + Spring Boot; Python + Django | Go: better raw perf but slower CRUD/admin velocity and splits the language stack; Spring: heavier operationally, JVM warmup vs container autoscaling; Django: weakest typing story for a money-handling system |
| Database | PostgreSQL 16 + **PostGIS** (managed, multi-AZ, 1 read replica) | Single system of record: relational integrity for orders/payments/stock, `SELECT … FOR UPDATE` for atomic reservation (FR-12), PostGIS `ST_Contains` for zone serviceability (FR-3/24), JSONB for flexible SKU attributes | MySQL; CockroachDB; MongoDB | MySQL: no PostGIS-class geo; Cockroach: multi-region features we don't need at 10× cost/complexity; Mongo: no serializable multi-row transactions culture for the reservation path |
| Search | **Meilisearch** (typo-tolerant, sub-50 ms) fed by catalog change events | FR-5 typo tolerance ("atta"/"aata") is native; trivially operated (single binary); index of ≤ ~50k SKUs × 60 stores is tiny | OpenSearch/Elasticsearch; Postgres FTS + pg_trgm | OpenSearch: cluster ops overhead unjustified at V1 scale — becomes the 10× replacement if facet/analytics search grows; PG FTS: weak typo tolerance, couples search load to system of record |
| Cache | Redis 7 (managed, HA pair) — catalog/serviceability cache, cart hot copy, sessions, rate limits, **GEO set for live rider positions**, pub/sub for tracking fan-out | One tool covers cache + geo + ephemeral fan-out; `GEOSEARCH` answers "nearest online rider" for dispatch (FR-18) | Memcached; DynamoDB/DAX-class KV | Memcached: no GEO/pub-sub/persistence; cloud KV: vendor lock before cloud vendor is even chosen |
| Queue / pub-sub (event backbone) | **Transactional outbox in Postgres → Redpanda** (Kafka-API-compatible, 3-node) | Outbox guarantees exactly-once-published domain events with the DB commit (no dual-write); Redpanda gives Kafka semantics (ordered, replayable log — needed for audit, analytics replay, NFR-10) at a fraction of Kafka's ops cost (no ZooKeeper/JVM); Kafka API = drop-in migration to managed Kafka at 10× | Apache Kafka (managed); RabbitMQ; SQS/SNS-class; Postgres LISTEN/NOTIFY only | Managed Kafka: blocked on cloud vendor [OPEN] and overkill at 10k orders/day; RabbitMQ: no replayable log for analytics/audit backfill; SQS-class: cloud lock-in + no ordered replay; LISTEN/NOTIFY: no durability/replay, fine only as a latency optimization |
| Auth | Phone-OTP (SMS via DLT provider) → short-lived JWT (15 min, RS256) + rotating refresh tokens (revocable, stored hashed); admin: email+password+TOTP; RBAC claims in JWT, permission checks server-side | FR-1/FR-29, NFR-5; self-hosted keeps per-OTP cost = SMS cost only | Auth0/Cognito-class IDaaS; session cookies | IDaaS: per-MAU pricing hostile to high-volume consumer apps in India, phone-OTP flows still need custom SMS/DLT work anyway; pure sessions: poor fit for 3 mobile/native clients |
| Hosting | Managed Kubernetes on **[OPEN] cloud vendor** (AWS/GCP-class, BRS §13, owner: Eng lead), India region (Mumbai/Delhi), multi-AZ; managed Postgres + Redis; object storage for images/invoices; CDN + WAF at edge | K8s keeps the platform cloud-portable while the vendor decision is open; managed data services cut on-call load | Bare VMs + docker-compose; serverless (Lambda-class); PaaS (Render/Railway-class) | VMs: manual scaling violates NFR-4; serverless: WebSocket + long-lived consumers awkward, cold starts vs NFR-2; PaaS: India-region availability + PostGIS/Redpanda support inconsistent |
| Observability | OpenTelemetry SDK (traces + metrics) → Prometheus + Grafana + Loki (or cloud-managed equivalents once vendor lands); Sentry for client crashes; SLO burn-rate alerts | NFR-8: vendor-neutral instrumentation now, backend swappable later; trace the whole order path | Datadog-class SaaS | Cost at tracking-event volumes; revisit post-launch with real data |
| CI/CD | GitHub Actions → container build → staging auto-deploy → prod deploy with manual gate; Terraform for all infra (IaC); SQL-first migrations (Flyway/dbmate-class) run as pre-deploy job | Boring, universal, AI-tool-friendly; IaC required to keep 3 envs honest | GitLab CI; Jenkins; ArgoCD (GitOps) | GitLab/Jenkins: no advantage for this team; ArgoCD deferred — worthwhile at more services, noise at 3 deployables |

### 2a. Event backbone decision (summary)
**Outbox → Redpanda.** The outbox pattern (events written in the same Postgres transaction as the state change, relayed by a poller) is non-negotiable for correctness on the order/stock/money path. Redpanda is chosen over "no broker at all" because five consumers (notifications, dispatch, analytics, audit, search-indexer) polling the outbox table directly would turn Postgres into a message bus; and over full Kafka because a 3-node single-binary Redpanda is operable by a small team. The Kafka API compatibility is the 10× escape hatch (D-3).

## System topology

> Describe in prose, then drop a textual description that the HTML renderer turns into a box-and-arrow diagram. **No Mermaid** — the HTML view uses real positioned boxes.

**Diagram type:** `layered`

**Prose.** Four layers. **Client layer:** customer mobile app, customer web, rider app, admin dashboard. **Edge layer:** CDN (static assets, catalog images) and WAF/rate-limiter in front of a single API gateway that terminates TLS, validates JWTs, and routes to `grofast-core` (REST/JSON) or the realtime gateway (WebSocket). **Application layer:** `grofast-core` — the modular monolith (modules: auth, serviceability, catalog, search-indexer, cart, pricing, orders, payments-adapter, inventory, partner-feeds, dispatch, notifications, audit, admin/RBAC) — plus two satellites: the **realtime gateway** (stateless WebSocket fan-out for rider GPS and order-status pushes, backed by Redis pub/sub) and the **worker pool** (same codebase, different entrypoint: Redpanda consumers for dispatch offers, notification delivery, partner-feed ingestion, payment reconciliation, search indexing, analytics forwarding). **Data layer:** Postgres+PostGIS (system of record), Redis (cache/geo/pub-sub), Meilisearch (search reads), Redpanda (event log), object storage (images, invoices, delivery-proof photos, CSV feeds), and the analytics warehouse (ClickHouse-class, [OPEN] with cloud vendor). **Externals:** payment gateway ([OPEN], Razorpay-class) reached outbound and via inbound webhooks; SMS/DLT provider; FCM/APNs; maps provider ([OPEN]).

Box-and-arrow layout for the renderer: clients (4 boxes, top row) → edge (CDN | WAF+API gateway, second row) → application (grofast-core center, realtime gateway right, worker pool left, third row) → data (Postgres, Redis, Meilisearch, Redpanda, object storage, warehouse, bottom row); externals (payment gateway, SMS/DLT, FCM/APNs, maps) as a right-hand column connected to payments-adapter, notifications workers, and clients respectively; webhook arrow from payment gateway back into the API gateway.

### 3a. Components
| ID | Component | Type | Responsibilities |
|----|-----------|------|------------------|
| C-1 | Customer mobile app (Android+iOS, React Native) | client | Browse, cart, checkout, pay, live tracking, ratings (FR-1..16, FR-30) |
| C-2 | Customer web (Next.js) | client | Same customer journey on responsive web |
| C-3 | Rider app (Android, React Native) | client | Online/offline toggle, job offers, pickup/drop flow, GPS beacon, earnings (FR-18..20) |
| C-4 | Admin + ops dashboard (React SPA) | client | Picker workflow, catalog/inventory/zone/partner/order management, exception queue, analytics, RBAC (FR-17, FR-21..27, FR-29) |
| C-5 | CDN + WAF edge | external/managed | Static assets + image delivery; L7 protection, rate limiting, TLS |
| C-6 | API gateway / BFF | service | Single ingress: JWT validation, routing, request shaping per client, idempotency-key enforcement on writes, payment-webhook ingress |
| C-7 | `grofast-core` (modular monolith) | service | All domain logic in bounded modules: auth, serviceability, catalog, cart, pricing/coupons, orders (state machine + outbox), payments-adapter, inventory, partner-feeds, dispatch, notifications API, audit, admin/RBAC |
| C-8 | Realtime gateway | service | WebSocket termination for rider GPS ingest + tracking/status fan-out to customers & ops; stateless, Redis pub/sub backed |
| C-9 | Worker pool | service | Async Redpanda consumers: dispatch offer engine, notification sender, partner-feed ingestion, payment reconciliation, search indexer, analytics forwarder, audit writer |
| C-10 | PostgreSQL 16 + PostGIS | store | System of record: all entities in §6; zone geometry; transactional outbox table |
| C-11 | Redis 7 | store | Catalog/serviceability cache, cart hot copy, OTP/rate-limit counters, rider GEO set, pub/sub channels for tracking |
| C-12 | Meilisearch | store | Typo-tolerant product search index per store availability (FR-5) |
| C-13 | Redpanda | store | Durable ordered event log: `order.*`, `payment.*`, `stock.*`, `rider.*`, `feed.*`, `audit.*` topics |
| C-14 | Object storage | store | Product images, GST invoices (PDF), delivery-proof photos, partner CSV feeds |
| C-15 | Analytics warehouse (ClickHouse-class) | store | Event sink → KPI dashboards, daily digest, CSV export (FR-27); engine choice [OPEN] with cloud vendor |
| C-16 | Payment gateway ([OPEN] — Razorpay-class) | external | UPI/cards/wallets intents, captures, refunds, tokenization (PCI), webhooks |
| C-17 | SMS / DLT provider | external | OTP + transactional SMS with registered DLT templates |
| C-18 | FCM / APNs | external | Push notifications to customer + rider apps |
| C-19 | Maps provider ([OPEN]) | external | Geocoding, map tiles, navigation handoff for riders |

### 3b. Connections
| From | To | Protocol | Direction | Purpose |
|------|----|----|---------|---------|
| C-1/C-2/C-3/C-4 | C-6 | HTTPS (REST/JSON) | sync | All API calls (via C-5 edge) |
| C-1/C-2/C-3/C-4 | C-8 | WSS (WebSocket) | async | Live tracking, job offers, order-status push |
| C-6 | C-7 | HTTP (in-cluster) | sync | Routed API traffic |
| C-7 | C-10 | Postgres wire (TLS) | sync | All reads/writes of record; outbox insert in-transaction |
| C-7 | C-11 | Redis protocol | sync | Cache read/write, cart, rate limits, GEO queries |
| C-7 | C-12 | HTTPS | sync | Search queries (catalog module) |
| C-7 | C-13 | Kafka protocol | async | Outbox relay publishes domain events |
| C-9 | C-13 | Kafka protocol | async | Consumer groups per worker type |
| C-9 | C-10 / C-11 / C-12 / C-14 / C-15 | native | sync | Workers write projections, indexes, warehouse rows |
| C-8 | C-11 | Redis pub/sub + GEO | async | GPS ingest → GEO set write + channel publish; fan-out subscribe |
| C-7 (payments-adapter) | C-16 | HTTPS | sync | Create intent, verify, capture, refund |
| C-16 | C-6 → C-7 | HTTPS webhook (signed) | async | Payment/refund status truth |
| C-9 (notification sender) | C-17 / C-18 | HTTPS | async | SMS (DLT) and push delivery |
| C-7 (partner-feeds) | partner systems | HTTPS API / CSV upload (to C-14) | both | Stock/price ingestion (FR-23) |
| C-1/C-3 | C-19 | HTTPS/SDK | sync | Geocoding, map tiles, navigation deep-link |

### 3.5. Per-component rationale
_(Added in v0.4 — Mod #5.)_ Why each component exists as a separate component (not folded into another). Reviewer rejects components without rationale at `/architecture-freeze`._

| Component ID | Why this is a distinct component | Failure mode if it didn't exist |
|--------------|----------------------------------|----------------------------------|
| C-5 | Edge concerns (DDoS, bot OTP abuse, image bandwidth) must die before app compute | OTP-spam and scraper load lands on core; image traffic swamps API nodes |
| C-6 | One choke point for authN, rate limits, idempotency keys, webhook ingress; lets core stay ignorant of client differences | Cross-cutting policy re-implemented per module, drift → security holes |
| C-7 | The deliberate monolith: one transaction boundary for order+stock+payment; one deploy | (Its absence = microservices) distributed transactions for FR-12, 10× ops burden at V1 |
| C-8 | Connection fan-out scales by socket count, not request rate; a tracking spike must not evict order-path capacity (NFR-3) | 10k idle sockets pinned to core pods; a viral tracking hour degrades checkout |
| C-9 | Async work (retries, batch feeds, offer timers) has a different failure/scaling profile; isolates consumer lag from API latency | Slow SMS provider back-pressures API threads; feed ingestion spikes p95 (NFR-1) |
| C-10 | Single system of record makes atomic stock reservation and audit truth possible | Split-brain stock counts → OOS-after-order breaches Objective 5 |
| C-11 | Sub-ms reads for hot catalog/serviceability + GEO + pub/sub in one operable tool | Every browse hits Postgres; NFR-1 p95 blown at peak |
| C-12 | Typo-tolerant ranked search is a specialized engine's job | FR-5 acceptance ("atta"/"aata") fails on SQL LIKE/FTS |
| C-13 | Durable replayable fan-out decouples order commit from its 5+ downstream effects | Notifications/analytics coupled into checkout transaction → NFR-2 blown, lost events on crash |
| C-14 | Blobs don't belong in Postgres; invoices/proofs need cheap long retention | DB bloat; delivery-proof photos (BR-8) unmanageable |
| C-15 | Analytical scans (zone heatmaps, GMV rollups) must not run on the OLTP store | FR-27 dashboards lock order tables; ops reports throttle checkout |

## Auth & security (one-paragraph summary)

- **AuthN:** Customers & riders: phone-OTP (DLT SMS, 6-digit, 3/min + 10/day rate caps, constant-time compare) → access JWT (RS256, 15 min) + refresh token (30 d, rotating, hashed at rest, reuse-detection revokes the family). Riders additionally device-bound (device ID claim). Admin/ops/partner staff: email + password (argon2) + mandatory TOTP; shorter sessions (8 h).
- **AuthZ:** RBAC per FR-29 — roles: `ops`, `catalog`, `finance`, `partner`, `read-only`, `super-admin`; permissions enforced server-side in a gateway/core guard layer (never client-side only); partner users row-scoped to their own store; denied attempts audit-logged (FR-29 AC). Rider/customer tokens carry audience claims so a rider token can never call customer or admin APIs.
- **Secrets management:** Cloud secret manager as source of truth → synced to K8s via external-secrets; per-env gateway keys and webhook HMAC secrets; quarterly rotation; JWT signing keys rotated with `kid` overlap.
- **PII handling:** TLS 1.2+ everywhere (edge→cluster re-encrypted); AES-256 at rest (disk level) + column-level encryption for phone/address; phone lookup via deterministic HMAC index. **DPDP:** explicit consent capture at signup (versioned consent records on `user`), purpose-limited processing, user-initiated data deletion → anonymization workflow (§6c) with statutory carve-outs disclosed; data stays in-region. **PCI:** SAQ-A posture — all card/UPI collection via gateway tokenization (C-16); GroFast never receives raw instrument data; annual gateway attestation filed (NFR-6).
- **Threat model summary:** Top risks and controls — (1) OTP abuse/SMS-pump: edge rate limits, per-number and per-IP caps, silent device checks; (2) webhook forgery/replay: HMAC verification + timestamp window + idempotent upsert; (3) payment/refund tampering: server-side amount verification against gateway, no client-trusted totals, BR-4 monitor; (4) privilege escalation in admin: RBAC guards + audit on every denied attempt; (5) rider GPS spoofing: pickup/drop OTP proofs (BR-8) as ground truth, anomaly flags to exception queue; (6) inventory manipulation: mutations only through inventory module APIs with mandatory reason + audit (FR-22). Whole surface held to **OWASP ASVS L2**: checklist tracked in CI, dependency + container scanning on every build, pre-launch external pen test (gate in Phase 8).

## Data model overview

_Detailed ER + tables go below. Keep this section to "what data lives where."_

- **Primary store:** PostgreSQL 16 + PostGIS — all entities below, plus the transactional `outbox` table. One logical DB, schema-per-module (`auth.*`, `orders.*`, …) to make module ownership physical and future extraction cheap.
- **Secondary stores / caches:** Redis (cart hot copy, catalog/serviceability cache, OTP + rate-limit counters, rider GEO set, pub/sub); Meilisearch (search projection of catalog × store availability); object storage (images, invoices, proofs, feed files).
- **Read replicas / analytics:** 1 Postgres read replica (admin/report reads); Redpanda → warehouse (ClickHouse-class, [OPEN] with cloud) for FR-27 dashboards, daily digest, CSV export.

### 6a. Entities & relationships
| Entity | Owner service | Key fields | Relationships |
|---|---|---|---|
| user | core/auth | id, phone (unique, encrypted), name, status, consent_flags, created_at | 1—N address, cart, order; role links for staff/partner users |
| address | core/auth | id, user_id, label, line1, landmark, geo point, zone_id (resolved) | N—1 user; N—1 zone |
| zone | core/serviceability | id, name, polygon (PostGIS geometry), eta_params, active | N—M store via store_zone; contains addresses by `ST_Contains` |
| store | core/serviceability | id, type (dark/partner), name, geo point, address, status, partner_id?, commission_pct? | N—M zone; 1—N store_inventory, order; partner stores 1—1 partner_feed |
| sku | core/catalog | id, name, brand, category_id, pack_size, mrp, images[], attributes JSONB, barcode | 1—N store_inventory, order_item; N—1 category |
| store_inventory | core/inventory | (store_id, sku_id) unique, price, available_qty, reserved_qty, max_per_order, low_stock_threshold, source (grn/feed), updated_at | N—1 store, sku; mutated only via inventory module (GRN/adjust/reserve/release) |
| cart | core/cart | id, user_id, store_id, lines JSONB (sku, qty, price_snapshot), coupon_code?, updated_at | N—1 user, store (BR-1: single store); hot copy in Redis, PG durable |
| order | core/orders | id, user_id, store_id, address snapshot, state, eta_promised_at (BR-2), eta_actual_at, bill JSONB, payment_method, invoice_ref, cancelled_reason? | 1—N order_item; 1—N payment, refund; 1—1 active assignment; N—1 user, store |
| order_item | core/orders | id, order_id, sku_id, qty, unit_price, gst_breakup, fulfillment_status (picked/substituted/refunded) | N—1 order, sku |
| payment | core/payments | id, order_id?, checkout_session_id, gateway, gateway_payment_ref (unique), method, amount, status, raw_webhook_refs | N—1 order (nullable until order created); 1—N refund |
| refund | core/payments | id, payment_id, order_id, amount, reason, status, initiated_at, sla_deadline (BR-4), gateway_refund_ref | N—1 payment |
| rider | core/dispatch | id, phone (unique), name, kyc_status, vehicle, online_status, active_assignment_id?, cod_float | 1—N assignment; live position in Redis GEO |
| rider_location | core/dispatch (archive) | rider_id, order_id?, geo point, recorded_at — day-partitioned, downsampled | N—1 rider; source of SLA forensics |
| assignment | core/dispatch | id, order_id, rider_id, state (offered/accepted/declined/expired/completed), offered_at, ttl, pickup_verified_at, proof_ref (photo/OTP), cod_collected? | N—1 order, rider; proof blob in object storage (BR-8) |
| partner_feed | core/partner-feeds | id, store_id, mode (api/csv), last_ingested_at, freshness_status (BR-6), row_counts, rejection_report_ref | 1—1 partner store; drives degraded-listing flag |
| coupon | core/pricing | id, code (unique), type (flat/percent), value, min_cart, max_discount, validity, usage_limits, active | Referenced by cart/order bill; redemption counter per user |
| notification | core/notifications | id, user_id/rider_id, order_id?, channel (push/sms), template_id (DLT-registered), status, sent_at, fallback_of? | N—1 order; delivery-failure → fallback row (FR-28) |
| audit_event | core/audit | id, actor (user/staff/system), actor_role, action, entity_type+id, before/after JSONB, reason, at — **append-only** | Written via outbox consumer; covers 100% money/stock mutations (NFR-10) |
| outbox | core/orders (shared infra) | id, aggregate, event_type, payload JSONB, created_at, published_at? | Written in-transaction with every state change; relayed to Redpanda |

### 6b. Indexes / partitioning
- `store_inventory`: PK (store_id, sku_id); partial index `WHERE available_qty <= low_stock_threshold` for alerting.
- `order`: (user_id, created_at DESC); partial indexes per active state for picker/dispatch/exception queues; (store_id, state).
- `payment`: unique (gateway_payment_ref); (status, created_at) for the reconciliation sweep.
- `zone.polygon`: GIST index — serviceability point-in-polygon (FR-3) sub-ms.
- `rider_location`: native range partitioning by day; `audit_event` and `outbox` partitioned by month; `outbox` partial index `WHERE published_at IS NULL`.
- `sku`: GIN on attributes JSONB; trigram index on name only as Meili fallback.

### 6c. Retention / archival
- Orders, order_items, payments, refunds, invoices: **8 years** (GST record-keeping), cold-archived to object storage after 18 months.
- `audit_event`: 7 years, append-only, partitions archived to object storage yearly.
- `rider_location` raw: 30 days in PG; downsampled aggregates permanent in warehouse.
- OTP and notification delivery logs: 90 days. Partner feed files: 90 days.
- DPDP deletion (NFR-6): user PII anonymized in place (phone/name/address → tombstone hashes); financial and audit records retained per statutory basis, documented in the consent notice.

## Hosting / infrastructure

_Concrete: which provider, which services, what the deployment topology looks like._

- **Cloud provider:** **[OPEN]** — AWS-class assumed (BRS §13, owner: Eng lead, due before this doc freezes). All choices below are vendor-portable (K8s, Postgres, Redis, Kafka API, S3-compatible storage).
- **Region(s):** Single India region (Mumbai or Delhi/Hyderabad equivalent), **3 AZs**. Multi-region deferred (see §11).
- **Compute:** Managed Kubernetes; node pools: `general` (core, gateway, workers), `realtime` (WS pods, network-optimized). HPA on CPU + custom metrics (socket count, consumer lag).
- **Storage:** Managed Postgres (multi-AZ, PITR) + 1 read replica; managed Redis (HA pair); Redpanda 3-node StatefulSet (SSD PVs) — revisit managed Kafka once vendor lands; S3-compatible object storage; warehouse [OPEN].
- **Edge / CDN:** CDN for static/web/images; WAF + global rate limits (OTP endpoints especially) at edge; TLS 1.2+ terminated at edge, re-encrypted to cluster.
- **Networking:** VPC with public subnets (LB only), private subnets (cluster + data), isolated data subnets; NAT for egress (gateway/SMS/FCM calls); no data store publicly reachable.
- **Environments:** dev, staging, prod
- **Per-env config strategy:** Terraform workspaces per env; K8s config via sealed/external secrets from cloud secret manager; 12-factor env injection; no secrets in git; staging runs gateway sandbox + test DLT templates.

### 7a. Hosting topology
| Component | Where it runs | Scaling strategy |
|---|---|---|
| `grofast-core` | K8s Deployment, `general` pool, ≥ 3 replicas across AZs | HPA on CPU + p95 latency; stateless |
| Realtime gateway | K8s Deployment, `realtime` pool, ≥ 2 replicas | HPA on concurrent-socket count; sticky-less (Redis pub/sub) |
| Worker pool | K8s Deployment per consumer group | KEDA-style scale on Redpanda consumer lag |
| API gateway / ingress | Cloud LB + ingress controller | Managed / horizontal |
| Postgres + PostGIS | Managed service, multi-AZ primary + replica | Vertical first; replica for reads; partitioning already in place |
| Redis | Managed HA pair | Vertical + cluster mode at 10× |
| Meilisearch | K8s StatefulSet (1 primary + replica) | Replica reads; swap to OpenSearch at 10× |
| Redpanda | K8s StatefulSet, 3 nodes, 3 AZs | Add brokers/partitions; or migrate to managed Kafka |
| Customer web (Next.js) | K8s or edge/CDN-adjacent nodes | HPA; ISR pages served from CDN |
| Admin SPA, static assets | Object storage + CDN | n/a |
| Warehouse | [OPEN] with cloud vendor | n/a at V1 volume |

## Folder map

```
code/
├── backend/      ← claude-code territory
├── frontend/     ← claude-code territory
└── runbooks/     ← ops + admin

project-docs/
├── _briefs/      ← what you're reading
├── _readable/    ← human PDFs / HTML / Excel
├── _status/      ← machine-readable status (don't edit by hand)
├── 00_kb.md … 08_release.md
└── fix-packets/  ← grouped failures during testing
```

## Conventions you must follow

- **PR title:** `[E##-Th##-S##-T##] <verb> <object>` (e.g., `[E01-Th01-S01-T02] Wire signup form to API`)
- **Branch name:** `task/E##-Th##-S##-T##-<slug>`
- **Test marker:** `@pytest.mark.tc("TC-XXX")` (pytest) or `test('TC-XXX <title>', …)` (jest)
- **After merge:** run `/task-complete <id> --pr "#NN"` (or `python3 ${CLAUDE_PLUGIN_ROOT}/scripts/task_complete.py …`)

## Definition of Done (universal)

A task is done iff:
- All linked test cases pass
- PR reviewed by at least one human
- Acceptance criteria from the parent Story checked off
- No new `[OPEN]` items introduced without owner + ETA
- Documentation updated (inline comments + relevant `.md`)
- No new lint / type-check warnings

## Workflow

1. Read this file once.
2. Read `INDEX.md` to find the next eligible task (lowest unmet-deps).
3. Read `_briefs/<task-id>.md` for that task's full self-contained brief.
4. Implement → write tests → open PR with the conventions above.
5. After merge: run `/task-complete <id> --pr "#NN"`.
6. Loop.
