---
schema_version: "0.4"
---

# 01 — Business Requirements Specification (BRS)

> **Phase 1.** Translate the business need into a structured, unambiguous requirements document. After this is frozen, the work **forks** into Design Thread (`02a`) and Build Thread (`02b`) — both run in parallel.
>
> **Project:** GroFast · **ID:** `grofast` · **Lead:** Devendra Sharma

---

## 1. Executive summary

GroFast is a hyperlocal quick-commerce grocery delivery platform for the Indian market, modeled on Zepto's operating playbook with a hybrid fulfillment twist: company-run dark stores deliver in 10–20 minutes inside dense urban zones, while partnered local stores extend coverage where dark stores don't yet exist. V1 ships four clients — a customer mobile app, a customer web storefront, a rider app, and an admin + ops dashboard — backed by a single scalable platform covering catalog, ordering, secure payments, real-time order tracking, inventory management, and operational analytics. The goal of V1 is to prove the unit economics and delivery promise in one launch city before multi-city expansion.

## 2. Business objectives

| # | Objective | Success metric | Priority |
|---|---|---|---|
| 1 | Deliver on the speed promise in dark-store zones | ≥ 85% of dark-store orders delivered within the ETA promised at checkout; median delivery ≤ 20 min | P0 |
| 2 | Establish reliable order fulfillment end-to-end | Order fulfillment rate ≥ 95% (placed → delivered, excl. customer cancellations); item fill rate ≥ 97% | P0 |
| 3 | Convert browsers to buyers with a frictionless ordering flow | Checkout conversion ≥ 60% from cart; order placement flow ≤ 90 seconds for a returning customer | P0 |
| 4 | Achieve payment reliability and trust | Payment success rate ≥ 97% on UPI; refunds auto-initiated within 24 h of a failed/cancelled order | P0 |
| 5 | Keep stock data honest across the hybrid network | OOS-after-order rate ≤ 2% of line items; partner-store stock feed freshness ≤ 15 min | P1 |
| 6 | Give ops real-time visibility to run the network | Admin dashboard reflects order/inventory state within 30 s; daily automated KPI report | P1 |
| 7 | Build repeat-purchase behavior | ≥ 40% of month-1 customers place a second order within 30 days | P1 |

## 3. Stakeholders & user personas

### 3a. Stakeholders
| Name / role | Org function | Interest in this project |
|---|---|---|
| Devendra Sharma — Pod Owner / Lead | Product & delivery | Accountable for V1 shipping and lifecycle gates |
| Ops head (TBD) | Dark-store & fleet operations | Picker/rider tooling, SLA dashboards, zone management |
| Partner success (TBD) | Marketplace | Partner-store onboarding, stock feed quality, commission settlement |
| Finance (TBD) | Payments & reconciliation | Payment success, refunds, COD reconciliation, GST invoicing |
| Engineering lead (TBD) | Build | Architecture, scalability, on-call |

### 3b. User personas
| Persona | Who they are | What they need from this product | Frequency of use |
|---|---|---|---|
| Urban convenience shopper ("Priya") | 22–40, metro resident, time-poor, UPI-native | Find items fast, order in under 2 minutes, trust the ETA, track the rider live | 2–5×/week |
| Household planner ("Sunita") | Weekly big-basket buyer, price-sensitive | Larger carts, offers/coupons, scheduled-ish reliability via partner stores | 1–2×/week |
| Rider ("Ravi") | Gig delivery partner on a two-wheeler | Clear job offers, optimal pickup/drop navigation, earnings visibility, minimal app friction | Daily, all shift |
| Dark-store picker ("Amit") | Store staff assembling orders | Fast pick lists sorted by store layout, barcode verification, OOS substitution flow | Daily, all shift |
| Ops manager ("Neha") | City ops team | Live order/rider/store dashboards, exception queues, inventory controls, zone/ETA config | Daily |
| Partner-store owner ("Manoj") | Local kirana/supermarket partner | Order notifications, stock/price management, settlement reports | Daily |

## 4. Scope

### 4a. In scope (V1)
- [x] Customer mobile app (Android + iOS) and responsive customer web storefront
- [x] Rider app (Android) for job assignment, navigation handoff, and delivery completion
- [x] Admin + ops dashboard (web) incl. picker workflow, inventory, catalog, zone, and analytics modules
- [x] Phone-OTP customer auth; address book with geolocation
- [x] Catalog with categories, search, item detail; per-store availability and pricing
- [x] Cart, checkout, ETA promise, delivery fees, coupons (flat/percent)
- [x] Payments: UPI, cards, wallets via PCI-compliant gateway; COD (pending sign-off — see §13); refunds
- [x] Order lifecycle: placed → packed → dispatched → delivered / cancelled, with real-time customer tracking
- [x] Rider dispatch: auto-assignment to nearest available rider, manual override by ops
- [x] Inventory management: dark-store stock CRUD + adjustments + low-stock alerts; partner-store stock ingestion via API/CSV
- [x] Serviceability zones (geofenced polygons) with store-to-zone mapping and dynamic ETA computation
- [x] Notifications: push + SMS for order events; OTP delivery
- [x] Analytics: ops KPIs (orders, SLA, fill rate, rider utilization), sales reports, daily digest
- [x] Single launch city — **Delhi NCR** (decided 2026-07-10) — single currency (INR), English UI

### 4b. Out of scope (V1)
- [ ] Ads & sponsored listings (→ FU-1)
- [ ] Subscriptions / memberships (e.g., daily milk, free-delivery pass) (→ FU-2)
- [ ] Loyalty points & referral program (→ FU-3)
- [ ] Scheduled/slot delivery (→ FU-4)
- [ ] Multi-city, multi-language, multi-currency (→ FU-5)
- [ ] In-house rider payroll/incentive engine (basic earnings display only) (→ FU-6)
- [ ] Warehouse-to-dark-store supply chain / procurement (inventory arrives via manual GRN in V1) (→ FU-7)
- [ ] Customer support chat/CRM integration (phone + email only in V1) (→ FU-8)

### 4c. Assumptions
- [x] Launch city: Delhi NCR (initial zone polygons to be drawn in ops config before launch)
- [ ] Payment gateway will be a PCI-DSS Level 1 Indian provider (Razorpay-class); GroFast never stores raw card data
- [ ] Riders are onboarded/KYC'd through an ops-managed back-office process (not self-serve in V1)
- [ ] Partner stores can provide stock via a simple API or scheduled CSV; deep POS integrations are per-partner projects post-V1
- [ ] Cloud: managed Kubernetes-capable public cloud (AWS-class); final vendor pending (§13)

## 5. Functional requirements

> Stable IDs. **Never renumber** — strike through with `~~FR-x~~` if removed.

| ID    | Title | User story | Acceptance criteria | Priority |
|-------|-------|------------|---------------------|----------|
| FR-1  | Phone-OTP signup/login | As a customer, I want to log in with my phone number and OTP, so that I don't manage passwords | Given a valid Indian mobile number, when I request an OTP, then I receive it within 30 s and can log in with ≤ 2 attempts; sessions persist via refresh tokens | P0 |
| FR-2  | Address book & location detection | As a customer, I want to save addresses and auto-detect my location, so that serviceability and ETA are accurate | Given GPS permission, when I open the app, then my deliverable address is resolved and the serving store is selected; addresses support label, floor/landmark | P0 |
| FR-3  | Serviceability check | As a customer, I want to know immediately if my location is serviceable, so that I don't build a dead cart | Given a location outside all zones, when I browse, then a "not serviceable yet" state with notify-me capture is shown | P0 |
| FR-4  | Browse catalog by category | As a customer, I want to browse categorized products, so that I can shop without searching | Given the serving store, when I open a category, then only in-stock-priced items for that store render, p95 < 200 ms server time | P0 |
| FR-5  | Product search with typo tolerance | As a customer, I want fast, forgiving search, so that I find items even with misspellings | Given "atta", "aata", or "attaa", when I search, then relevant flours rank in top results; results return < 300 ms p95; empty results suggest alternates | P0 |
| FR-6  | Product detail page | As a customer, I want item details (images, weight, MRP vs price, expiry-sensitive info), so that I can decide | Given any SKU, when I open detail, then price, discount, pack size, and availability at my serving store are correct | P1 |
| FR-7  | Cart management | As a customer, I want to add/remove/step quantities with a running total, so that I control my order | Given stock limits, when I exceed available qty or per-order caps, then the cart blocks the increment with a reason; cart persists across sessions and devices | P0 |
| FR-8  | ETA promise at checkout | As a customer, I want a committed delivery estimate before paying, so that I can trust the promise | Given store load and rider availability, when I reach checkout, then a dynamic ETA (e.g., "12 min") displays and is stored on the order for SLA measurement | P0 |
| FR-9  | Fees, coupons & bill summary | As a customer, I want an itemized bill with delivery/small-cart fees and coupon application, so that pricing is transparent | Given an eligible coupon, when applied, then the discount reflects instantly and invalid coupons show the failure reason; GST-compliant invoice generated on delivery | P0 |
| FR-10 | Online payment | As a customer, I want to pay via UPI/cards/wallets, so that checkout is instant | Given gateway success, when payment completes, then order confirms in < 3 s; given failure/timeout, then retry or switch method without losing the cart; webhook reconciliation handles droppped callbacks | P0 |
| FR-11 | Cash on delivery | As a customer, I want COD as a fallback, so that I can order without digital payment | Given COD enabled for my order value, when I place the order, then the rider app shows amount to collect and marks collection at delivery (pending §13 sign-off) | P1 |
| FR-12 | Order placement & stock reservation | As a customer, I want my order accepted only if items are really available, so that I'm not disappointed later | Given checkout, when I pay, then stock is atomically reserved for all line items or the order fails cleanly with refund auto-initiated | P0 |
| FR-13 | Real-time order tracking | As a customer, I want live status and rider location on a map, so that I know when to be at the door | Given a dispatched order, when I open tracking, then rider position updates ≤ every 5 s and status transitions push instantly | P0 |
| FR-14 | Order cancellation & refunds | As a customer, I want to cancel before dispatch and get automatic refunds, so that mistakes aren't costly | Given an order not yet dispatched, when I cancel, then reserved stock releases and prepaid amounts auto-refund within 24 h | P0 |
| FR-15 | Order history & reorder | As a customer, I want past orders and one-tap reorder, so that repeat shopping is instant | Given a past order, when I tap reorder, then available items land in cart and unavailable ones are flagged | P1 |
| FR-16 | Ratings & delivery feedback | As a customer, I want to rate the order and delivery, so that quality issues surface | Given a delivered order, when I rate ≤ 3 stars, then a reason picker appears and the record lands in the ops exception queue | P2 |
| FR-17 | Picker pick-list workflow | As a picker, I want an optimized pick list per order, so that I can pack fast | Given a new dark-store order, when I accept it, then items list in store-layout order with barcode-scan verification and OOS substitution/refund flow; pack completion timestamps recorded | P0 |
| FR-18 | Rider job offer & assignment | As a rider, I want nearby delivery jobs offered automatically, so that I earn without hunting | Given an order packed (or partner order ready), when dispatch runs, then the nearest eligible online rider gets a 30 s accept/decline offer; declines cascade to next rider; ops can force-assign | P0 |
| FR-19 | Rider pickup & delivery flow | As a rider, I want clear pickup/drop steps with navigation handoff, so that deliveries are error-free | Given an accepted job, when I proceed, then OTP/scan verification at pickup and delivery-proof (OTP or photo) at drop are enforced; COD amount shown when applicable | P0 |
| FR-20 | Rider availability & earnings view | As a rider, I want to toggle online/offline and see my day's deliveries and earnings, so that I control my shift | Given completed deliveries, when I open earnings, then per-order payout and daily totals are accurate | P1 |
| FR-21 | Catalog & SKU management (admin) | As an ops/catalog manager, I want to CRUD products, categories, images, and per-store price/availability, so that the storefront stays correct | Given a catalog change, when saved, then storefronts reflect it within 60 s; bulk CSV upload supported | P0 |
| FR-22 | Dark-store inventory management | As an ops manager, I want stock receiving (GRN), adjustments, and cycle counts with audit trail, so that system stock matches shelf stock | Given any stock mutation, when committed, then an immutable audit record (who/when/why) exists; low-stock alerts fire at configurable thresholds | P0 |
| FR-23 | Partner-store onboarding & stock sync | As a partner manager, I want to onboard partner stores and ingest their stock/prices via API or CSV, so that marketplace coverage grows | Given a partner feed, when ingested, then SKUs map/merge to the master catalog with a rejection report; feeds older than 15 min flag the store as stale (degraded listing) | P0 |
| FR-24 | Zone & ETA configuration | As an ops manager, I want to draw serviceability polygons, map stores to zones, and tune ETA parameters, so that promises match capacity | Given a zone edit, when published, then serviceability and store selection update for new sessions within 60 s | P0 |
| FR-25 | Live ops dashboard & exception queue | As an ops manager, I want live order/rider/store views and an exception queue (delayed, stuck, failed-payment, low-rated), so that I intervene fast | Given an order breaching its promised ETA, when the breach occurs, then it appears in the exception queue within 30 s with one-click actions (reassign rider, call customer, cancel-refund) | P0 |
| FR-26 | Order management (admin) | As an ops agent, I want to search any order and act on it (modify status, refund, cancel), so that support issues resolve | Given an order ID or phone number, when searched, then full order timeline with every state transition and actor renders | P0 |
| FR-27 | Analytics & reports | As a stakeholder, I want KPI dashboards (GMV, orders, AOV, SLA hit rate, fill rate, rider utilization, zone heatmaps) and CSV export, so that decisions are data-driven | Given a date range, when I load a report, then numbers reconcile with the order ledger; daily digest email/Slack at 8 am | P1 |
| FR-28 | Notifications engine | As the platform, I want templated push/SMS events on order milestones, so that customers and riders stay informed | Given each lifecycle transition, when it commits, then the mapped notification dispatches within 10 s with delivery-failure fallback (push → SMS) | P0 |
| FR-29 | RBAC for admin | As an admin owner, I want role-based access (ops, catalog, finance, partner, read-only), so that staff see only their tools | Given a finance-role user, when they open catalog editing, then access is denied and the attempt is audit-logged | P0 |
| FR-30 | Substitution & partial fulfillment | As a customer, I want sensible handling when an item is OOS after ordering, so that the rest of my order still arrives | Given an OOS at pick time, when the picker flags it, then the customer gets an instant substitute-or-refund prompt (60 s timeout → auto-refund of that line) | P1 |

## 6. Non-functional requirements

| ID    | Category | Requirement | Target | Priority |
|-------|----------|-------------|--------|----------|
| NFR-1 | Performance | Catalog/search/browse server latency | p95 < 200 ms (browse), < 300 ms (search) | P0 |
| NFR-2 | Performance | Order placement end-to-end (pay-confirm → order confirmed) | p95 < 3 s | P0 |
| NFR-3 | Availability | Order path (browse → checkout → track) uptime | 99.9% monthly; graceful degradation of non-critical modules | P0 |
| NFR-4 | Scalability | Horizontal scale without redesign | 1 city / 60 stores / 10k orders/day at launch → 10× via scale-out only | P0 |
| NFR-5 | Security | Auth, transport, and data at rest | TLS everywhere; JWT short-lived + refresh rotation; AES-256 at rest for PII; no raw card storage (gateway tokenization); OWASP ASVS L2 | P0 |
| NFR-6 | Compliance | India DPDP Act, GST, PCI (via gateway) | DPDP consent + data-deletion flow; GST-compliant invoices; annual gateway compliance attestation | P0 |
| NFR-7 | Freshness | Real-time tracking + inventory propagation | Rider GPS ≤ 5 s; stock changes visible ≤ 60 s; partner feeds ≤ 15 min | P0 |
| NFR-8 | Observability | Logging, metrics, tracing, alerting | Structured logs, distributed traces on order path, SLO burn alerts; on-call runbooks | P1 |
| NFR-9 | Mobile quality | App size, cold start, offline grace | Cold start < 3 s on mid-range Android; cart/catalog cache survives brief offline | P1 |
| NFR-10 | Auditability | Money- and stock-touching mutations | 100% covered by immutable audit log with actor + reason | P0 |

## 7. Business rules

| ID   | Rule | Source |
|------|------|--------|
| BR-1 | An order is served by exactly one store (dark or partner); no cross-store carts in V1 | Ops model |
| BR-2 | ETA promise shown at checkout is stored on the order and is the SLA baseline for objective #1 | Objective 1 |
| BR-3 | Stock is reserved at payment-confirmation, released on cancellation/expiry (15 min unpaid hold max) | FR-12 |
| BR-4 | Refunds for prepaid orders auto-initiate within 24 h; no manual approval below ₹2,000 | Objective 4 |
| BR-5 | COD is capped per order (default ₹1,500, ops-configurable) and disabled for first-time users flagged risky | Finance |
| BR-6 | Partner stores with stock feeds staler than 15 min are listed as "delivery may take longer" and excluded from fast-ETA promises | Objective 5 |
| BR-7 | Riders may carry max 1 active order in V1 (no batching) | Ops simplicity |
| BR-8 | Delivery-proof (OTP or photo) is mandatory to complete an order; COD additionally requires collection confirmation | Fraud control |
| BR-9 | Age-restricted or regulated items (if listed) require category-level flags and are excluded from V1 catalog | Compliance |
| BR-10 | All prices include GST; invoice issued in the operating entity's GSTIN at delivery | Finance |

## 8. Data flow (high-level)

Customer clients talk to the platform API. A serviceability service resolves location → zone → serving store. Catalog/search reads come from a read-optimized store (cache + search index) fed by the catalog/inventory system of record. Checkout orchestrates: price/coupon validation → ETA computation → payment (gateway redirect/intent + webhook reconciliation) → atomic stock reservation → order creation. The order then flows through an event-driven lifecycle: dark-store orders enter the picker queue; partner orders notify the partner store. On "packed/ready", the dispatch service offers the job to riders; rider GPS streams through a location channel to both ops dashboards and the customer's tracking view. Every lifecycle event fans out to the notifications engine, the analytics pipeline (event log → warehouse → dashboards), and the audit log. Admin dashboard performs privileged reads/writes against the same services under RBAC.

Detailed component architecture, data stores, and protocols land in `02b_architecture.md`.

## 9. UI requirements overview

- [x] Speed-first: skeleton loads, optimistic UI on cart ops, sub-100 ms perceived interactions
- [x] Mobile-first design system shared across customer app and web; rider app optimized for one-handed, sunlight-readable use
- [x] Live tracking map as the emotional centerpiece of the post-order experience
- [x] Transparent billing (no hidden fees) and honest stock states (no ghost inventory)
- [x] Admin dashboard: dense, keyboard-friendly, exception-queue-driven (manage by exception, not by watching)
- [x] Accessibility: WCAG 2.1 AA for web surfaces; dynamic type support in apps

## 10. Dependencies

- [ ] Payment gateway vendor selection & merchant onboarding (blocker for FR-10; owner: Finance/Lead)
- [ ] Maps/geo provider selection incl. pricing at tracking volumes (FR-2/13/24)
- [ ] SMS/WhatsApp DLT registration for OTP + transactional templates (India requirement; 2–4 week lead time)
- [ ] Cloud account, org, and Kubernetes/managed-services baseline
- [ ] Partner-store pilot cohort (≥ 10 stores) committed for launch city
- [ ] Rider supply plan for launch zones (hiring/onboarding owned by Ops)
- [ ] FSSAI registration & GST setup for operating entity

## 11. Success criteria

- [ ] All P0 FRs shipped and passing their acceptance criteria in production
- [ ] 30-day post-launch: ETA hit rate ≥ 85%, payment success ≥ 97%, fulfillment ≥ 95%, OOS-after-order ≤ 2%
- [ ] Order path availability ≥ 99.9% over first 30 days; zero Sev-1 payment/ledger incidents
- [ ] ≥ 40% month-1 repeat-order rate
- [ ] Ops runs a full day purely from the dashboard + exception queue (no DB/engineering intervention)

## 12. Risks & mitigations

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| 1 | Partner-store stock feeds are stale/wrong → OOS-after-order spikes | H | H | BR-6 degraded listing, 15-min freshness SLA, fill-rate scorecards, delist repeat offenders | Partner success |
| 2 | Rider supply shortfall at peak → ETA promise broken | M | H | Dynamic ETA widening with load, zone-level order throttling, ops force-assign, surge planning | Ops |
| 3 | Payment webhook loss/duplication → stuck or double-charged orders | M | H | Idempotent order/payment ledger, reconciliation job, auto-refund SLA (BR-4) | Eng |
| 4 | ETA model too optimistic at launch (no historical data) | H | M | Conservative launch ETAs, weekly recalibration, promise-vs-actual dashboard | Eng + Ops |
| 5 | DPDP/DLT/GST compliance gaps delay launch | M | H | §10 dependencies started in parallel with build; compliance checklist gate in Phase 8 | Lead |
| 6 | Scope creep on 4 clients strains V1 timeline | H | M | Hard gates of this lifecycle; §14 backlog discipline; rider app kept minimal (FR-18/19/20 only) | Lead |
| 7 | COD fraud/leakage | M | M | BR-5 caps, delivery-proof + collection confirmation (BR-8), COD reconciliation report | Finance |

## 13. Open items

- [x] ~~Launch city~~ — **resolved 2026-07-10: Delhi NCR**; initial zone polygons remain an ops-config task pre-launch
- [x] ~~COD in V1~~ — **resolved 2026-07-10: YES, with BR-5 caps** (amend logged in `_status/decisions.jsonl`); FR-11/19 and rider COD screens/tests are now unconditional
- [ ] **Payment gateway vendor** — owner: Lead/Finance; needed before `02b_architecture` freeze
- [ ] **Cloud vendor** — owner: Eng lead; needed before `02b_architecture` freeze
- [ ] **Pod composition / named owners for Ops, Finance, Partner success, Eng lead** — owner: Devendra Sharma

## 14. Future updates backlog

> **Status values:** `deferred` (default) · `promoted` (became an FR/NFR in vN+1) · `dropped` (explicitly killed) · `evergreen` (recurring nice-to-have)
>
> **Type values:** `FR` (functional) · `NFR` (non-functional) · `BR` (business rule)

| ID | Title | Type | Rationale (why not now) | Origin | Priority hint | Status | Promoted to |
|----|-------|------|--------------------------|--------|---------------|--------|-------------|
| FU-1 | Ads & sponsored listings | FR | Needs traffic scale first; monetization phase 2 | §4b | P2 | deferred | — |
| FU-2 | Subscriptions / free-delivery membership | FR | Retention lever after PMF signal | §4b | P2 | deferred | — |
| FU-3 | Loyalty points & referrals | FR | Growth lever post-launch | §4b | P2 | deferred | — |
| FU-4 | Scheduled / slot delivery | FR | Different ops flow; conflicts with speed focus in V1 | §4b | P2 | deferred | — |
| FU-5 | Multi-city, multi-language | FR | V1 proves one city; NFR-4 keeps the door open | §4b | P1 | deferred | — |
| FU-6 | Rider incentive & payout engine | FR | Manual payouts acceptable at launch volume | §4b | P2 | deferred | — |
| FU-7 | Procurement & supply-chain (PO → GRN automation) | FR | Manual GRN sufficient for ≤ 10 dark stores | §4b | P1 | deferred | — |
| FU-8 | Support chat & CRM integration | FR | Phone/email support adequate at launch volume | §4b | P2 | deferred | — |
| FU-9 | Order batching for riders (2+ orders/trip) | FR | Efficiency lever once density exists; BR-7 relaxation | BR-7 | P1 | deferred | — |
| FU-10 | ML-based demand forecasting & auto-replenishment | FR | Needs sales history to train on | §8 | P2 | deferred | — |

> _Use `/backlog-promote --id FU-X` for ad-hoc promotion. Otherwise `/project-version-bump` walks the list interactively at next-version planning time._

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
- **Role:** Business owner + Product Manager
- **Timestamp:** 2026-07-10T07:34:46Z
- **Status:** ✅ Frozen
- **Notes:** Launch city fixed: Delhi NCR. COD decision carried open (default yes with BR-5 caps), due before /tasks-freeze.
