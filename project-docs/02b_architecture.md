---
schema_version: "0.4"
---

# 02b — System Architecture (Build Thread)

> **Phase 2b.** Define the system design that delivers the BRS. After this is frozen, `03b_test_cases.md` can start.
>
> **Project:** GroFast · **Reads:** `01_brs.md`, `00_kb.md` · **Writes:** this file
>
> **Hard rule:** No requirements here (BRS territory). No code-level micro-decisions (manual territory). This file describes _what the system is_ and _how its parts fit_ — not _how each function is written_.

---

## 1. Overview & objectives
_One paragraph. What this architecture optimizes for, what it deliberately does not._

This architecture optimizes for **launch velocity with clean seams**: one modular monolith (`grofast-core`) plus two thin satellite deployables (realtime gateway, async workers) serving all four V1 clients, on one Postgres+PostGIS system of record, with an event backbone (transactional outbox → Redpanda) that makes every order/stock/money mutation observable, auditable, and replayable. It is sized for 1 city / 60 stores / 10k orders/day and scales 10× by scale-out plus a pre-declared service-extraction order (§4) — **it deliberately does not** ship 20 microservices, multi-region DR, a heavyweight service mesh, or ML-driven ETA/dispatch on day 1. Deliberate trade-offs: single region (India) with multi-AZ instead of multi-region; Meilisearch instead of OpenSearch until catalog/scale demands it; Kafka-API-compatible Redpanda instead of full Kafka to keep ops burden near zero while preserving the migration path.

## 1.5. Architecture story
_(Added in v0.4 — Mod #5.)_ A narrative paragraph that ties the BRS objectives to the technical choices made below. **This is what a new engineer reads first to understand why this system looks the way it does.** Optimize for clarity, not completeness — completeness lives in sections 2–11.

GroFast's business lives or dies on three promises: the **ETA is honest** (Objective 1), **stock is honest** (Objective 5), and **money is never lost** (Objective 4). Everything below follows from those. The ETA promise needs fast geo answers (which zone, which store, which rider is nearest) — hence PostGIS for zone polygons and Redis GEO for live rider positions, with a dedicated WebSocket gateway so 10k concurrent tracking sessions never touch the order path. Honest stock needs one system of record and atomic reservation — hence a single Postgres where checkout reserves inventory rows in the same transaction that creates the order, with a transactional outbox so downstream systems (notifications, analytics, picker queues) learn about it without two-phase commit. Money safety needs idempotency everywhere the payment gateway touches us — hence a gateway-agnostic payments adapter keyed on our own idempotency keys, with webhook-first truth and a reconciliation sweep that auto-refunds anything stuck (BR-4). We chose a **modular monolith** rather than microservices because a 4-client V1 built largely by AI coding tools benefits enormously from one repo, one deploy, one transaction boundary — but every module speaks to its siblings through explicit interfaces and events, so the seams we'll split at 10× (search reads, dispatch, tracking, partner ingestion, payments) already exist as compile-time boundaries today. TypeScript end-to-end (NestJS server, React/Next web, React Native apps) keeps the four clients and the platform in one language, one hiring pool, one set of shared types.

## 2. Tech stack
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

## 3. System architecture (logical topology)

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

## 4. Service boundaries
_What is a separate service? What is a module inside another service? Why?_

| Service | Owns these capabilities | Why this is a separate service (not a module) |
|---|---|---|
| `grofast-core` (deployable 1) | Modules: **auth** (OTP, JWT, refresh, RBAC), **serviceability** (zones, store selection, ETA params), **catalog** (SKU/category CRUD, per-store price), **cart**, **pricing** (fees, coupons, bill, GST invoice), **orders** (state machine, reservation, outbox), **payments-adapter** (gateway-agnostic port), **inventory** (dark-store stock, GRN, adjustments), **partner-feeds** (mapping, freshness), **dispatch** (assignment logic), **notifications** (template registry, dispatch API), **audit** (append API), **admin** | It isn't — it's the monolith. Modules communicate via in-process interfaces + domain events only; direct cross-module table access is lint-forbidden. This keeps FR-12's transaction atomic and V1 ops trivial |
| Realtime gateway (deployable 2) | WebSocket sessions, GPS ingest, tracking/status/job-offer push | Different scaling axis (concurrent sockets), different availability posture; must survive core deploys without dropping tracking sessions |
| Worker pool (deployable 3) | All Redpanda consumers (dispatch offers, notifications delivery, feed ingestion, reconciliation, indexing, analytics, audit projection) | Same codebase as core, separate entrypoint/scaling; consumer lag must never affect API p95 |
| Clients (4 deployables) | Per §3a C-1..C-4 | Platform-mandated separation |

**Pre-declared extraction order at 10× (NFR-4)** — each seam is already a NestJS module with an event-driven contract, so extraction = new deployable + network call, no redesign:
1. **Catalog+search read path** → dedicated read service (own replica + Meili→OpenSearch) — first to feel browse traffic.
2. **Dispatch + tracking** → geo service (owns Redis GEO + realtime gateway) — first to feel rider-count growth and algorithmic iteration.
3. **Payments** → isolated service (PCI blast-radius reduction, independent audit).
4. **Partner-feed ingestion** → per-partner connector service as POS integrations deepen (FU-scope).
5. **Notifications** → standalone as channels grow (WhatsApp, email).
Orders + inventory + pricing stay fused the longest: they share the reservation transaction.

## 5. Data flows (with example flows)
_For each major BRS feature, walk the request through the system._

### 5a. Flow: Checkout → payment → atomic stock reservation (FR-8/9/10/12, BR-2/3, NFR-2)
1. Client `POST /v1/checkout` with cart ID and address ID → gateway (C-6) validates JWT → orders module.
2. Orders orchestrates synchronously: pricing revalidates lines + coupon (failure reason returned per FR-9); serviceability recomputes ETA from store load + rider availability (Redis) and returns the **ETA promise**; inventory soft-checks availability. Response: bill summary + payable amount + checkout-session ID.
3. Client confirms → payments-adapter creates a gateway order/intent at C-16 with **idempotency key = checkout-session ID**; client SDK collects payment (UPI/card/wallet).
4. Payment confirmation is **server-verified**: client callback triggers a verify call to the gateway API; the signed webhook (flow 5e) is the ultimate source of truth — whichever arrives first wins, both are idempotent on `gateway_payment_ref`.
5. On verified capture, orders module opens **one Postgres transaction**: `SELECT … FOR UPDATE` on the `store_inventory` rows for all lines → decrement `available`, increment `reserved` (any shortfall → full rollback); insert `order` (state `PLACED`, ETA promise stored per BR-2) + `order_items` + `payment` row; insert outbox rows `order.placed`, `payment.captured`, `stock.reserved`; commit.
6. **Reservation failure path:** transaction rolls back, no order exists; payments-adapter auto-initiates refund (BR-4); client keeps cart intact with a clean failure (FR-12).
7. Outbox relay publishes to Redpanda; workers fan out: notification (order-confirmed push, SMS fallback), picker-queue projection (dark store) or partner notification, analytics event, audit record.
8. Client sees confirmation — steps 4–7 complete p95 < 3 s (NFR-2); step 7 is off the critical path.
9. **COD variant** (FR-11, pending §13 BRS sign-off): steps 3–4 skipped; reservation at placement; BR-3's 15-min unpaid-hold logic does not apply; BR-5 cap checked in step 2.

### 5b. Flow: Dark-store order lifecycle — picking → packed → dispatch → delivered (FR-17/18/19/13/28)
1. `order.placed` → picker-queue projection; order appears in the store's picker view (C-4) sorted by promised ETA.
2. Picker accepts → state `PICKING` (state machine transition recorded with actor, per FR-26); pick list renders in store-layout order; each item barcode-scanned.
3. OOS at pick → picker flags line → customer gets substitute-or-refund push with 60 s timeout → auto-refund of that line (FR-30); order continues partial.
4. Pack complete → state `PACKED` (timestamps recorded) → outbox `order.packed`.
5. Dispatch worker consumes `order.packed`: Redis `GEOSEARCH` finds nearest **online, unassigned** riders (BR-7: max 1 active order); creates `assignment` (state `OFFERED`, 30 s TTL) and pushes the offer via realtime gateway to the rider app.
6. Decline/timeout → cascade to next-nearest rider; exhaustion → ops exception queue (FR-25) for force-assign.
7. Rider accepts → assignment `ACCEPTED`; rider navigates to store (maps deep-link); pickup verified by OTP/scan → order `DISPATCHED` → customer tracking activates (flow 5d).
8. At the door: delivery proof (OTP or photo → object storage) mandatory (BR-8); COD collection confirmed if applicable → order `DELIVERED`; GST invoice generated (BR-10) to object storage, linked in order history.
9. Every transition emits outbox events → notifications (≤ 10 s, push→SMS fallback per FR-28), analytics, audit; ETA breach detection compares clock vs promised ETA and feeds the exception queue within 30 s.

### 5c. Flow: Partner-store order (FR-23, BR-1/6)
1. Serviceability resolves the customer's location to a zone whose serving store is a **partner store** (BR-1: exactly one store per order).
2. Pre-checkout guard: partner's feed freshness checked; staler than 15 min → store listed as "delivery may take longer", excluded from fast-ETA promises (BR-6), wider ETA shown.
3. Checkout runs flow 5a identically — partner stock rows live in the same `store_inventory` table (source = feed snapshot), so reservation is atomic the same way.
4. `order.placed` → partner-notification worker: push to partner dashboard session + SMS fallback; partner confirms and packs, marks `READY` from their dashboard view.
5. Partner reject / confirmation timeout (ops-configurable) → auto-cancel: reserved stock released, refund auto-initiated (BR-4), customer notified, order lands in exception queue and the partner's fill-rate scorecard (BRS risk #1).
6. From `READY`, dispatch and delivery proceed exactly as flow 5b steps 5–9; commission line recorded on the order for settlement reporting.

### 5d. Flow: Rider live-tracking fan-out (FR-13, NFR-7)
1. Rider app streams GPS every 4 s over its WebSocket to the realtime gateway (batched/offline-buffered per NFR-9).
2. Gateway writes the position to the Redis GEO set (dispatch reads this for nearest-rider) and publishes to Redis pub/sub channel `track:{order_id}`.
3. All realtime-gateway pods subscribe to channels their local sockets care about; the customer's tracking session and any ops-dashboard watcher receive the position push ≤ 5 s from GPS fix (NFR-7) — fan-out never touches Postgres or core.
4. Order-status transitions (from Redpanda `order.*` events) are bridged onto the same channel so the tracking screen gets status + location on one socket.
5. A worker downsamples positions (1/30 s) to the `rider_location` archive (partitioned Postgres table → warehouse) for SLA forensics and zone heatmaps.
6. Degradation: socket loss → client falls back to HTTPS polling `GET /v1/orders/{id}/track` (served from Redis last-known position) — graceful degradation per NFR-3.

### 5e. Flow: Payment webhook reconciliation + auto-refund (FR-10/14, BR-4, BRS risk #3)
1. Gateway (C-16) POSTs signed webhook → API gateway → payments-adapter; HMAC signature verified; raw payload persisted.
2. Event upserted keyed on `gateway_payment_ref` + event type (unique constraint) — duplicates are no-ops; out-of-order events resolved by gateway timestamp precedence.
3. State comparison: **captured + order exists** → confirm/no-op. **Captured + no order** (reservation failed or client died mid-flow 5a) → auto-refund initiated immediately. **Failed/expired + reservation held** → release stock, mark payment failed, notify customer to retry.
4. **Reconciliation sweep** (worker, every 5 min): queries all payments `PENDING` > 15 min against the gateway's status API (webhook-loss cover); resolves per step 3; BR-3's 15-min unpaid hold released.
5. Refunds (from step 3, cancellations per FR-14, and OOS lines per FR-30) create `refund` rows → gateway refund API with idempotency key = refund ID; refund webhooks close the loop; no manual approval below ₹2,000 (BR-4).
6. A BR-4 SLA monitor alerts ops if any refund remains uninitiated ≥ 20 h (buffer before the 24 h promise); every money mutation lands in the audit log (NFR-10).

### 5f. NFR → architectural mechanism map
| NFR | Target | Mechanism |
|---|---|---|
| NFR-1 | Browse p95 < 200 ms; search < 300 ms | Redis catalog cache + CDN images + Next.js ISR; Meilisearch for search; read replica for heavy admin reads |
| NFR-2 | Order confirm p95 < 3 s | Single-transaction reservation (no distributed commit); all fan-out async via outbox; gateway intent pre-created at checkout |
| NFR-3 | 99.9% order path; graceful degradation | Multi-AZ everything; realtime/worker isolation from core; tracking→polling fallback; non-critical modules (ratings, analytics) fail open |
| NFR-4 | 10× via scale-out only | Stateless core/gateway/realtime pods behind HPA; pre-declared extraction seams (§4); partitioned hot tables; Kafka-API backbone swaps to managed Kafka |
| NFR-5 | TLS, JWT+refresh rotation, AES-256 PII, no raw cards, ASVS L2 | §8: edge TLS 1.2+, RS256 15-min JWTs, hashed rotating refresh tokens, encrypted storage + column-level PII crypto, gateway tokenization only, ASVS L2 checklist gate in CI |
| NFR-6 | DPDP, GST, PCI (via gateway) | Consent records + deletion/anonymization workflow (§8); GST invoice generation at delivery (BR-10) with 8-yr retention; PCI SAQ-A posture — card data never touches GroFast |
| NFR-7 | GPS ≤ 5 s; stock ≤ 60 s; feeds ≤ 15 min | WS + Redis pub/sub path (5d); stock events → cache invalidation + Meili update ≤ 60 s; feed-freshness timestamps drive BR-6 degraded listing |
| NFR-8 | Logs, traces, SLO alerts | §9: structured JSON logs, OTel traces end-to-end on checkout/order path, multi-window burn-rate alerts, runbooks per alert |
| NFR-9 | Cold start < 3 s; offline grace | React Native + Hermes, code-split admin; on-device cart/catalog cache with sync-on-reconnect; rider GPS offline buffer |
| NFR-10 | 100% money/stock mutations audited | Audit module consumes `audit.*` outbox events (same transaction as mutation → cannot miss); append-only partitioned table, actor + reason mandatory in the domain-event schema |

## 6. Database design (high-level)
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

## 7. Hosting & infrastructure
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

## 8. Auth & security

- **AuthN:** Customers & riders: phone-OTP (DLT SMS, 6-digit, 3/min + 10/day rate caps, constant-time compare) → access JWT (RS256, 15 min) + refresh token (30 d, rotating, hashed at rest, reuse-detection revokes the family). Riders additionally device-bound (device ID claim). Admin/ops/partner staff: email + password (argon2) + mandatory TOTP; shorter sessions (8 h).
- **AuthZ:** RBAC per FR-29 — roles: `ops`, `catalog`, `finance`, `partner`, `read-only`, `super-admin`; permissions enforced server-side in a gateway/core guard layer (never client-side only); partner users row-scoped to their own store; denied attempts audit-logged (FR-29 AC). Rider/customer tokens carry audience claims so a rider token can never call customer or admin APIs.
- **Secrets management:** Cloud secret manager as source of truth → synced to K8s via external-secrets; per-env gateway keys and webhook HMAC secrets; quarterly rotation; JWT signing keys rotated with `kid` overlap.
- **PII handling:** TLS 1.2+ everywhere (edge→cluster re-encrypted); AES-256 at rest (disk level) + column-level encryption for phone/address; phone lookup via deterministic HMAC index. **DPDP:** explicit consent capture at signup (versioned consent records on `user`), purpose-limited processing, user-initiated data deletion → anonymization workflow (§6c) with statutory carve-outs disclosed; data stays in-region. **PCI:** SAQ-A posture — all card/UPI collection via gateway tokenization (C-16); GroFast never receives raw instrument data; annual gateway attestation filed (NFR-6).
- **Threat model summary:** Top risks and controls — (1) OTP abuse/SMS-pump: edge rate limits, per-number and per-IP caps, silent device checks; (2) webhook forgery/replay: HMAC verification + timestamp window + idempotent upsert; (3) payment/refund tampering: server-side amount verification against gateway, no client-trusted totals, BR-4 monitor; (4) privilege escalation in admin: RBAC guards + audit on every denied attempt; (5) rider GPS spoofing: pickup/drop OTP proofs (BR-8) as ground truth, anomaly flags to exception queue; (6) inventory manipulation: mutations only through inventory module APIs with mandatory reason + audit (FR-22). Whole surface held to **OWASP ASVS L2**: checklist tracked in CI, dependency + container scanning on every build, pre-launch external pen test (gate in Phase 8).

## 9. Observability & ops

- **Logs:** Structured JSON everywhere (request ID, trace ID, actor, module); shipped to Loki/cloud-native store; PII redaction at the logger layer; 30 d hot / 13 mo cold.
- **Metrics:** Prometheus (RED per endpoint + module; business metrics first-class: orders/min, payment success rate, ETA hit rate, OOS-after-order rate, feed freshness, consumer lag, socket count); Grafana dashboards mirroring BRS Objectives table.
- **Traces:** OpenTelemetry SDK across gateway → core modules → workers; **100% sampling on the order path** (checkout, reservation, payment, dispatch), 10% elsewhere; trace ID propagated into outbox events so async legs stitch to the originating checkout.
- **Alerting:** SLO-based multi-window burn-rate alerts on NFR-1/2/3 targets; hard alerts: payment-success < 95% (15 min), reconciliation backlog > 0 aged 30 min, refund SLA monitor (BR-4, ≥ 20 h), consumer lag thresholds, feed staleness fleet-wide, cert/quota expiry.
- **On-call:** Single rotation at launch (eng lead + 2), PagerDuty-class paging; every alert links a runbook (NFR-8); weekly SLO review feeding the ETA recalibration loop (BRS risk #4); Sev-1 = order path or money incident, postmortem mandatory.

## 10. Migrations & versioning

- **DB migration tooling:** SQL-first, forward-only migrations (Flyway/dbmate-class) versioned in-repo, applied as a pre-deploy job with advisory locks; expand-migrate-contract pattern for zero-downtime changes; no destructive migration in the same release as its code change.
- **API versioning strategy:** URI-versioned `/v1/*`; additive (non-breaking) changes within v1; breaking changes require `/v2` + deprecation window. Mobile clients call a `min-supported-version` config endpoint at startup → soft/hard force-update, since app-store rollout lag makes old clients immortal.
- **Backwards compatibility policy:** Server must support the two most recent released mobile client versions; event schemas on Redpanda are versioned (schema field in envelope), consumers tolerate unknown fields; deprecations announced in the decision log with a dated removal.

## 11. Backup, retention, DR

- **Backups:** Postgres continuous WAL archiving + daily snapshots (PITR), 35 d window, weekly restore drill into staging; Redis daily snapshot (acceptable loss — cache/ephemeral, carts durable in PG); Redpanda topics have object-storage tiered retention (7 d hot); object storage versioned + lifecycle rules; Terraform state versioned and locked.
- **RTO / RPO targets:** Order path: **RPO ≤ 5 min** (WAL), **RTO ≤ 1 h** (managed failover is minutes; 1 h covers full-restore worst case). Analytics/warehouse: RPO 24 h, RTO best-effort — explicitly non-critical.
- **DR plan:** V1 = **in-region, multi-AZ** HA (AZ loss is transparent); full region loss = restore-from-backup into an alternate India region via Terraform (documented, drilled once pre-launch, hours-scale) — accepted risk at V1 scale, revisit at multi-city (FU-5). Kill switches: feature flags to shed non-critical load (ratings, analytics ingestion, partner ingestion) protecting the order path (NFR-3); COD-only degraded mode if the payment gateway is down.

## 12. Open items
- [ ] **Cloud vendor** (AWS/GCP-class) — owner: Eng lead (TBD)/Devendra Sharma — carried from BRS §13; blocks region names, warehouse choice, managed-Kafka option. Needed before `/architecture-freeze`.
- [ ] **Payment gateway vendor** (Razorpay-class, PCI-DSS L1) — owner: Lead/Finance — carried from BRS §13; payments-adapter port is written gateway-agnostic so integration work, not architecture, is blocked.
- [ ] **COD in V1 confirm** — owner: Devendra Sharma + Finance — carried from BRS §13; flow 5a step 9, rider COD float + reconciliation report scoped but gated. Due before `/tasks-freeze`.
- [ ] **Maps/geo provider** (Google Maps vs Ola Maps/MapmyIndia-class; pricing at tracking volume) — owner: Eng lead — affects C-19 SDK choice in both apps.
- [ ] **Analytics warehouse engine** (ClickHouse self-hosted vs cloud-native warehouse) — owner: Eng lead — decide with cloud vendor; Redpanda sink keeps this swappable.
- [ ] **SMS/DLT provider + template registration** — owner: Ops/Lead — 2–4 week lead time (BRS §10); template IDs needed for notifications module config, not for design.
- [ ] **Rider app distribution** (Play Store vs private/MDM distribution for faster iteration) — owner: Ops + Eng lead.

## 13. Development tool & role assignment

> Decided **here**, in the architecture phase, so the rest of the lifecycle (task breakdown, briefs, dev) is tool-aware. Every layer of code names which AI tool builds it and where its output lives.
>
> **v0.4 — Mod #16 extends this with Reviewer + Test-writer tool columns.** Empty / `(inherit)` cells fall back to the row's Implementer tool. The brief generator emits a `Review prompt` block when Reviewer differs from Implementer, enabling cross-tool review (e.g., Gemini implements, Claude Code reviews).
>
> **Enum:** `claude-code` · `gemini` · `antigravity` · `cursor` · `human` · `other` · `inherit` · `tbd`

| Layer | Implementer tool | Reviewer tool | Test-writer tool | Output folder | Integration contract |
|---|---|---|---|---|---|
| Backend | `claude-code` | `(inherit)` | `(inherit)` | `code/backend/` | Owns the project structure; integrates frontend output |
| Frontend | `gemini` / `antigravity` / `cursor` / `human` | `claude-code` | `(inherit)` | `code/frontend/<feature>/` | Produces code + `INTEGRATION.md` per feature |
| Mobile (if applicable) | `claude-code` | `human` | `(inherit)` | `code/mobile/` | React Native monorepo (customer + rider apps, shared design-system package); consumes the same per-story briefs + `designs/<SC-XXX>/`; produces `INTEGRATION.md` per feature listing screens, navigation routes, API calls, and push/WS event subscriptions |

### 13a. Integration contract

**Frontend tool consumes:**
- `project-docs/_briefs/<story-id>-frontend.md` — per-story frontend brief (auto-generated at `/dev-start`)
- `designs/<SC-XXX>/` — Figma exports for the screens in that story

**Frontend tool produces:**
- Code in `code/frontend/<feature-slug>/`
- `code/frontend/<feature-slug>/INTEGRATION.md` — describes components, routes, API calls, state shape, open questions

**Backend tool (Claude Code or chosen) consumes:**
- The frontend's `INTEGRATION.md` to wire backend endpoints to frontend expectations
- Per-task briefs at `project-docs/_briefs/<task-id>.md`

### 13b. Default brief mode

- **Strict (default):** `/dev-start` refuses unless every linked screen has designs in `designs/`
- **Rolling (opt-in):** `/dev-start --rolling` generates briefs for stories whose designs ARE present, marks the rest as `[OPEN]`

## 14. Decision log
_(Added in v0.4 — Mod #5.)_ Append-only record of architectural decisions and their justifications. Every change to sections 2–13 SHOULD have a row here. Combined with the `@decision` inline tags (Mod #13), this is the audit trail for "why does the system look this way?"_

| # | Date | Decision | Rationale | Alternatives considered | Decided by |
|---|------|----------|-----------|--------------------------|------------|
| D-1 | 2026-07-10 | Modular monolith (`grofast-core`) + 2 satellites, not microservices | One transaction boundary for FR-12; one deploy for a small team; seams pre-cut for 10× extraction (§4) | Microservices day-1; pure monolith without module boundaries | Architecture draft (pending freeze reviewer) |
| D-2 | 2026-07-10 | TypeScript/NestJS end-to-end with React/React Native clients | One language across 4 clients + platform; NestJS enforces module seams; AI-tooling fluency | Go, Kotlin/Spring, Python backend; Flutter, dual-native mobile | Architecture draft |
| D-3 | 2026-07-10 | Event backbone = transactional outbox → Redpanda (Kafka API) | Exactly-once publish with DB commit; replayable ordered log for audit/analytics; near-zero ops vs Kafka; Kafka-API = managed-Kafka escape hatch at 10× | Full Kafka, RabbitMQ, SQS-class, outbox-polling-only | Architecture draft |
| D-4 | 2026-07-10 | Postgres+PostGIS as single system of record; schema-per-module | Atomic stock reservation; geo natively; extraction-ready ownership | MySQL, Cockroach, Mongo, polyglot persistence | Architecture draft |
| D-5 | 2026-07-10 | Meilisearch for V1 search, OpenSearch named as 10× successor | FR-5 typo tolerance at trivial ops cost for ≤ 50k-SKU catalog | OpenSearch now; Postgres FTS | Architecture draft |
| D-6 | 2026-07-10 | WebSocket (dedicated realtime gateway + Redis pub/sub) over MQTT for tracking | One protocol across web+apps; broker already in stack (Redis); MQTT broker is extra infra without V1 payoff at 1-order-per-rider (BR-7) scale | MQTT (EMQX-class); HTTP long-poll only | Architecture draft |
| D-7 | 2026-07-10 | Payments behind a gateway-agnostic adapter port; vendor stays [OPEN] | Unblocks build while BRS §13 vendor decision lands; webhook-first truth + idempotency keys are vendor-independent | Direct vendor-specific integration | Architecture draft |
| D-8 | 2026-07-10 | Single India region, multi-AZ; restore-based regional DR | 99.9% (NFR-3) achievable multi-AZ; multi-region cost/complexity unjustified pre-multi-city (FU-5) | Active-passive multi-region | Architecture draft |
| D-9 | 2026-07-10 | K8s from day 1 despite monolith | NFR-4 scale-out, cloud-vendor portability while §13 [OPEN], distinct scaling profiles for 3 deployables | VMs, PaaS, serverless | Architecture draft |

---


## Revision history

| # | Date | Triggered by | Scope of change | Re-frozen by |
|---|------|---------------|------------------|---------------|
| v1 | (initial freeze date) | Initial | (initial freeze) | (filled at first /X-freeze) |
| v2 | 2026-07-10 | Direct revision | (initial) | Devendra Sharma |

> Each subsequent /X-freeze appends a row here, tagged with the active CR ID (if any).
> The most-recent freeze is the current canonical state. The history is the audit trail.

## Sign-off

- **Reviewer:** Devendra Sharma
- **Role:** Architect / Tech lead
- **Timestamp:** 2026-07-10T07:46:40Z
- **Status:** ✅ Frozen
- **Notes:** Cloud vendor carried as OPEN by explicit decision; stack kept vendor-portable (K8s, Kafka API, S3-compatible).
