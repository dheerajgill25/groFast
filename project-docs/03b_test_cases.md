---
schema_version: "0.4"
---

# 03b — Test Cases (Build Thread, written BEFORE task breakdown)

> **Phase 3b.** Translate every requirement and architectural decision into explicit, executable test cases — **before** task breakdown so development is genuinely test-driven. After this is frozen, `04b_task_breakdown.md` can start (and tasks will link back to test IDs).
>
> **Project:** GroFast · **Reads:** `01_brs.md`, `02b_architecture.md` · **Writes:** this file
>
> Excel export: `_readable/03b_test_cases.xlsx` — produced on freeze. Same sheet is updated with pass/fail status during Phase 6 testing.

---

## 1. Test ID convention

| Prefix | Meaning |
|---|---|
| `TC-FUNC-###` | Functional test (covers an `FR-x`) |
| `TC-PERF-###` | Performance test (covers an `NFR-x` performance) |
| `TC-SEC-###`  | Security test (covers an `NFR-x` security or privacy/auth) |
| `TC-INT-###`  | Integration test |
| `TC-E2E-###`  | End-to-end user flow |
| `TC-VIS-###`  | Visual / UX check (Figma diff) |
| `TC-NEG-###`  | Negative path |

**Stable IDs** — never renumber. Strike through with `~~TC-XXX-001~~` if removed.

**Conditional cases:** COD-dependent cases (FR-11, BR-5, COD parts of FR-19/BR-8) are titled `[COND-COD §13]`. If the BRS §13 COD decision lands **no**, strike them through — do not renumber. `TC-VIS-*` rows are deferred to `/tc-augment` after `/design-freeze` (Mod #6); none are pre-authored here.

## 2. Coverage summary
_Auto-derived but checked here. Every `FR-x` must have at least one `TC-FUNC` and one `TC-NEG`._

| Requirement | Test cases | Status |
|---|---|---|
| FR-1 | TC-FUNC-001, TC-FUNC-002, TC-NEG-001, TC-SEC-001 | covered |
| FR-2 | TC-FUNC-003, TC-FUNC-004, TC-NEG-002 | covered |
| FR-3 | TC-FUNC-005, TC-NEG-003, TC-INT-013 | covered |
| FR-4 | TC-FUNC-006, TC-NEG-004, TC-PERF-001 | covered |
| FR-5 | TC-FUNC-007, TC-NEG-005, TC-PERF-002 | covered |
| FR-6 | TC-FUNC-008, TC-NEG-006 | covered |
| FR-7 | TC-FUNC-009, TC-NEG-007 | covered |
| FR-8 | TC-FUNC-010, TC-NEG-008, TC-INT-014 | covered |
| FR-9 | TC-FUNC-011, TC-FUNC-012, TC-NEG-009, TC-NEG-010, TC-SEC-010 | covered |
| FR-10 | TC-FUNC-013, TC-FUNC-014, TC-NEG-011, TC-NEG-012, TC-INT-005..008, TC-INT-017, TC-E2E-001 | covered |
| FR-11 | TC-FUNC-015, TC-NEG-013, TC-NEG-014, TC-E2E-003 _(all COND-COD)_ | covered (conditional) |
| FR-12 | TC-FUNC-016, TC-NEG-015, TC-NEG-016, TC-NEG-036, TC-INT-001, TC-INT-017 | covered |
| FR-13 | TC-FUNC-017, TC-NEG-017, TC-INT-010, TC-PERF-005 | covered |
| FR-14 | TC-FUNC-018, TC-NEG-018, TC-INT-009, TC-INT-018, TC-E2E-004 | covered |
| FR-15 | TC-FUNC-019, TC-NEG-019 | covered |
| FR-16 | TC-FUNC-020, TC-NEG-020 | covered |
| FR-17 | TC-FUNC-021, TC-NEG-021 | covered |
| FR-18 | TC-FUNC-022, TC-NEG-022, TC-INT-016, TC-NEG-037 | covered |
| FR-19 | TC-FUNC-023, TC-NEG-023, TC-E2E-001 | covered |
| FR-20 | TC-FUNC-024, TC-NEG-024 | covered |
| FR-21 | TC-FUNC-025, TC-NEG-025 | covered |
| FR-22 | TC-FUNC-026, TC-NEG-026, TC-SEC-009 | covered |
| FR-23 | TC-FUNC-027, TC-NEG-027, TC-INT-012, TC-INT-019 | covered |
| FR-24 | TC-FUNC-028, TC-NEG-028, TC-INT-013 | covered |
| FR-25 | TC-FUNC-029, TC-NEG-029 | covered |
| FR-26 | TC-FUNC-030, TC-NEG-030 | covered |
| FR-27 | TC-FUNC-031, TC-NEG-031 | covered |
| FR-28 | TC-FUNC-032, TC-NEG-032, TC-INT-003 | covered |
| FR-29 | TC-FUNC-033, TC-NEG-033, TC-SEC-003, TC-SEC-012 | covered |
| FR-30 | TC-FUNC-034, TC-NEG-034, TC-E2E-005 | covered |
| NFR-1 | TC-PERF-001, TC-PERF-002 | covered |
| NFR-2 | TC-PERF-003, TC-FUNC-013 | covered |
| NFR-3 | TC-PERF-007, TC-PERF-008, TC-NEG-017, TC-INT-011 | covered |
| NFR-4 | TC-PERF-004 | covered |
| NFR-5 | TC-SEC-001..006, TC-SEC-010, TC-SEC-011 | covered |
| NFR-6 | TC-SEC-007, TC-SEC-008, TC-FUNC-012 | covered |
| NFR-7 | TC-FUNC-017, TC-PERF-005, TC-INT-015, TC-NEG-027 | covered |
| NFR-8 | TC-INT-021 (+ §4 alert/runbook drills) | covered |
| NFR-9 | TC-PERF-006 | covered |
| NFR-10 | TC-SEC-009, TC-INT-001 | covered |
| BR-1 | TC-NEG-035, TC-E2E-002 | covered |
| BR-2 | TC-FUNC-010, TC-INT-014 | covered |
| BR-3 | TC-FUNC-016, TC-NEG-036, TC-INT-007 | covered |
| BR-4 | TC-FUNC-018, TC-NEG-030, TC-INT-008, TC-INT-009, TC-E2E-004 | covered |
| BR-5 | TC-NEG-013, TC-NEG-014 _(COND-COD)_ | covered (conditional) |
| BR-6 | TC-NEG-027, TC-INT-012, TC-E2E-002 | covered |
| BR-7 | TC-NEG-037 | covered |
| BR-8 | TC-FUNC-023, TC-NEG-023, TC-E2E-003 | covered |
| BR-9 | TC-NEG-038 | covered |
| BR-10 | TC-FUNC-012, TC-E2E-001 | covered |

## 3. Test cases

> Each row in the table below is one test case. Test data is included **inline only when it's a fixed value the AI generator should use**. For data-driven tests, point to a fixture file under `code/tests/fixtures/`.

### 3a. Functional happy paths (`TC-FUNC`)

| ID | Requirement | Type | Title | Preconditions | Steps | Expected | Test data (if relevant) | Priority |
|----|-------------|------|-------|----------------|-------|----------|--------------------------|----------|
| TC-FUNC-001 | FR-1 | integration | Phone-OTP login succeeds | SMS provider sandbox up; unregistered Indian mobile | 1. Request OTP 2. Assert SMS dispatch ≤ 30 s 3. Submit correct OTP | Account created/logged in; access JWT (15 min) + refresh token issued | `+919800000001`, fixture `auth/otp.json` | P0 |
| TC-FUNC-002 | FR-1 | integration | Session persists via refresh rotation | Logged-in user; access token expired | 1. Call API with expired JWT 2. Client refreshes 3. Retry call | New access+refresh pair issued (old refresh invalidated); API call succeeds without re-login | — | P0 |
| TC-FUNC-003 | FR-2 | integration | GPS auto-detect resolves address + serving store | Saved address inside a dark-store zone; GPS permission granted | 1. Open app 2. Observe resolved location | Deliverable address resolved; correct serving store selected via `ST_Contains` zone lookup | Delhi NCR fixture polygons `geo/zones.json` | P0 |
| TC-FUNC-004 | FR-2 | integration | Save address with label/floor/landmark | Logged-in user | 1. Add address with label "Home", floor, landmark 2. Reload | Address persisted with all fields, geocoded point, resolved zone_id | — | P1 |
| TC-FUNC-005 | FR-3 | integration | Serviceable location gets storefront | Point strictly inside active zone | 1. Set location 2. Browse | Storefront renders for the mapped store; no "not serviceable" state | — | P0 |
| TC-FUNC-006 | FR-4 | integration | Category browse shows only in-stock priced items of serving store | Store A: SKU-1 in stock+priced, SKU-2 OOS, SKU-3 unpriced | 1. Open category as store-A customer | Only SKU-1 renders; response from cache path; server time recorded | fixture `catalog/store_a.sql` | P0 |
| TC-FUNC-007 | FR-5 | integration | Typo-tolerant search ranks flours for atta/aata/attaa | Meilisearch index seeded with flour SKUs | 1. Search "atta" 2. "aata" 3. "attaa" | All three return relevant flours in top 5; per-store availability respected | queries: `atta`, `aata`, `attaa` | P0 |
| TC-FUNC-008 | FR-6 | integration | PDP shows correct price/discount/pack/availability | SKU with MRP ≠ selling price at serving store | 1. Open product detail | Price, discount %, pack size, images, availability at serving store all match DB of record | — | P1 |
| TC-FUNC-009 | FR-7 | integration | Cart add/step/remove with cross-device persistence | Same user logged in on app + web | 1. Add 2 SKUs on app 2. Step qty 3. Open web | Running total correct; identical cart on second device; survives session restart (Redis hot + PG durable) | — | P0 |
| TC-FUNC-010 | FR-8, BR-2 | integration | ETA promise displayed at checkout and stored on order | Store load + rider availability seeded in Redis | 1. Reach checkout 2. Note ETA 3. Place order 4. Read order row | Dynamic ETA shown (e.g., "12 min"); `eta_promised_at` on order equals the promise shown | — | P0 |
| TC-FUNC-011 | FR-9 | unit | Flat and percent coupons compute correctly | Active coupons FLAT50, PCT10 (max_discount ₹75) | 1. Apply each to eligible carts 2. Inspect bill | Discount reflects instantly; percent capped at max_discount; itemized bill = items + delivery fee + small-cart fee − discount | fixture `pricing/coupons.json` | P0 |
| TC-FUNC-012 | FR-9, BR-10, NFR-6 | integration | GST-compliant invoice generated on delivery | Order reaches DELIVERED | 1. Complete delivery 2. Fetch invoice from order history | PDF in object storage, linked on order; operating GSTIN, GST breakup per line, prices GST-inclusive | — | P0 |
| TC-FUNC-013 | FR-10, NFR-2 | e2e | UPI payment success confirms order < 3 s | Gateway sandbox; funded test VPA | 1. Checkout 2. Pay via UPI 3. Time capture-verify → confirmation | Order confirmed < 3 s after gateway success; confirmation push received | sandbox VPA `success@upi` | P0 |
| TC-FUNC-014 | FR-10 | integration | Server-verified capture: verify-call and webhook both idempotent | Sandbox payment captured | 1. Deliver client verify callback 2. Deliver signed webhook for same `gateway_payment_ref` (any order) | Whichever arrives first confirms; second is a no-op; exactly one order, one `payment.captured` event | — | P0 |
| TC-FUNC-015 | FR-11, BR-5 | e2e | [COND-COD §13] COD order within cap placed; rider sees collect amount | COD enabled; order value ₹800 < cap ₹1,500 | 1. Choose COD 2. Place order 3. Open rider app on assignment | Order placed, stock reserved at placement (no 15-min hold); rider app shows exact collect amount | — | P1 |
| TC-FUNC-016 | FR-12, BR-3 | integration | Atomic reservation across all lines at payment confirmation | 3-line cart, all in stock | 1. Complete payment 2. Inspect `store_inventory` + order in one read | Single transaction: all lines `available`−/`reserved`+, order PLACED, outbox rows written; no intermediate state visible | — | P0 |
| TC-FUNC-017 | FR-13, NFR-7 | e2e | Live tracking updates ≤ 5 s with instant status pushes | Dispatched order; rider app streaming GPS every 4 s | 1. Open tracking 2. Move rider (mock GPS) 3. Transition status | Map position refreshes ≤ 5 s from GPS fix; PACKED→DISPATCHED→DELIVERED push instantly on the same socket | — | P0 |
| TC-FUNC-018 | FR-14, BR-4 | integration | Cancel before dispatch releases stock and auto-refunds | Prepaid order in PACKED | 1. Customer cancels 2. Inspect inventory, refund row | Reserved qty released; `refund` row created immediately with `sla_deadline` = +24 h; gateway refund API called with idempotency key = refund ID; no manual approval (amount < ₹2,000) | order value ₹499 | P0 |
| TC-FUNC-019 | FR-15 | integration | One-tap reorder with unavailable items flagged | Past order: SKU-1 still stocked, SKU-2 now OOS | 1. Tap reorder | SKU-1 lands in cart at current price; SKU-2 flagged unavailable, not added silently | — | P1 |
| TC-FUNC-020 | FR-16 | integration | Low rating triggers reason picker and ops exception | Delivered order | 1. Rate 2 stars 2. Pick reason 3. Check ops queue | Reason picker appears at ≤ 3 stars; record lands in exception queue with order link | — | P2 |
| TC-FUNC-021 | FR-17 | integration | Picker pick list in store-layout order with barcode verify | New dark-store order, 4 SKUs with layout positions | 1. Accept order 2. Scan each item 3. Complete pack | List sorted by layout; wrong-item scan impossible to confirm; state PICKING→PACKED with pack timestamps recorded | fixture `stores/layout_a.json` | P0 |
| TC-FUNC-022 | FR-18 | integration | Nearest online rider gets 30 s offer; accept assigns | 3 online riders at known distances; order PACKED | 1. Emit `order.packed` 2. Observe offers | Nearest eligible rider offered first (Redis GEOSEARCH); 30 s TTL on offer; accept → assignment ACCEPTED, others never offered | rider GEO fixture `dispatch/riders.json` | P0 |
| TC-FUNC-023 | FR-19, BR-8 | e2e | Pickup verification + delivery proof enforced | Accepted assignment | 1. Rider arrives at store: OTP/scan pickup 2. Navigate 3. At drop capture OTP (or photo) 4. Complete | Order DISPATCHED only after pickup verify; DELIVERED only after proof stored (object storage ref on assignment) | — | P0 |
| TC-FUNC-024 | FR-20 | integration | Online/offline toggle and accurate earnings | Rider with 3 completed deliveries today | 1. Toggle offline→online 2. Open earnings | Toggle reflected in dispatch eligibility ≤ 5 s; per-order payout and daily total match assignment records exactly | — | P1 |
| TC-FUNC-025 | FR-21 | integration | Catalog CRUD live within 60 s; bulk CSV upload | Catalog-role admin | 1. Edit SKU price + image 2. Upload 200-row CSV 3. Poll storefront | Storefront (cache + Meili) reflects changes ≤ 60 s; CSV rows applied with success report | fixture `catalog/bulk_200.csv` | P0 |
| TC-FUNC-026 | FR-22 | integration | GRN, adjustment, cycle count produce audit trail + low-stock alert | Dark store; SKU threshold = 10 | 1. GRN +50 2. Adjust −45 with reason 3. Observe | Each mutation creates immutable audit record (actor/when/why); stock hits 5 → low-stock alert fires at threshold | — | P0 |
| TC-FUNC-027 | FR-23 | integration | Partner feed ingests via API and CSV with rejection report | Onboarded partner store; feed with 90 valid + 10 bad rows | 1. Push API feed 2. Upload CSV feed 3. Read report | Valid SKUs map/merge to master catalog; 10 rejects itemized with reasons; `last_ingested_at` updated, freshness = fresh | fixture `partners/feed_mixed.csv` | P0 |
| TC-FUNC-028 | FR-24 | integration | Zone polygon publish updates serviceability ≤ 60 s | Ops user; point P currently unserviceable | 1. Extend polygon over P 2. Publish 3. New session at P | New sessions at P serviceable and mapped to correct store within 60 s | — | P0 |
| TC-FUNC-029 | FR-25 | integration | ETA breach lands in exception queue ≤ 30 s with one-click actions | Order with `eta_promised_at` in the past, not delivered | 1. Let clock pass promise 2. Watch queue | Breach row appears ≤ 30 s; reassign-rider / call-customer / cancel-refund actions present and functional | — | P0 |
| TC-FUNC-030 | FR-26 | integration | Order search by ID or phone shows full actor timeline | Order with ≥ 5 transitions by ≥ 3 actors | 1. Search by order ID 2. Search by phone | Full timeline renders: every state transition with timestamp and actor (customer/picker/rider/system/ops) | — | P0 |
| TC-FUNC-031 | FR-27 | integration | KPI report reconciles with order ledger; daily digest | Warehouse loaded with 1 day of seeded orders | 1. Load GMV/orders/AOV/SLA/fill-rate report for the day 2. Export CSV 3. Check 8 am digest | Every number reconciles with Postgres order ledger to the rupee; CSV matches; digest delivered on schedule | seeded day fixture `analytics/day1.sql` | P1 |
| TC-FUNC-032 | FR-28 | integration | Lifecycle transition dispatches mapped notification ≤ 10 s | Templates registered (DLT sandbox) | 1. Drive order through PLACED→PACKED→DISPATCHED→DELIVERED | Each transition's mapped push sent ≤ 10 s of commit; notification rows recorded per event | — | P0 |
| TC-FUNC-033 | FR-29 | integration | Each role sees only its modules | Users seeded for ops/catalog/finance/partner/read-only | 1. Log in as each role 2. Enumerate visible modules + attempt one in-scope write each | Visibility and writes match RBAC matrix exactly; read-only cannot mutate anything | fixture `rbac/roles.json` | P0 |
| TC-FUNC-034 | FR-30 | integration | Substitution accepted → line substituted, bill adjusted | Order in PICKING; SKU-2 OOS at shelf; substitute SKU-2b offered | 1. Picker flags OOS 2. Customer accepts substitute within 60 s | Line replaced with SKU-2b; price delta reflected in bill; order continues; customer notified | — | P1 |

### 3b. Negative & edge paths (`TC-NEG`)

| ID | Requirement | Type | Title | Preconditions | Steps | Expected | Test data (if relevant) | Priority |
|----|-------------|------|-------|----------------|-------|----------|--------------------------|----------|
| TC-NEG-001 | FR-1 | integration | Wrong/expired OTP rejected within attempt budget | OTP issued | 1. Submit wrong OTP twice 2. Submit expired OTP | Clear error each time; login still possible with correct OTP within ≤ 2 attempts per AC; expired OTP never accepted | — | P0 |
| TC-NEG-002 | FR-2 | integration | GPS denied falls back to manual address entry | Location permission denied | 1. Open app 2. Follow fallback | Manual pin/search entry offered; serviceability still resolved from typed address; no crash or dead end | — | P1 |
| TC-NEG-003 | FR-3 | integration | Outside all zones → not-serviceable with notify-me | Point outside every polygon | 1. Set location 2. Attempt browse 3. Submit notify-me | "Not serviceable yet" state; notify-me captures phone + location; no cart can be built | point: Gurgaon fringe fixture | P0 |
| TC-NEG-004 | FR-4 | integration | OOS/unpriced SKUs never render in category | SKU flips to OOS mid-session | 1. Browse category 2. Invalidate stock 3. Refresh after propagation | OOS SKU absent (or marked, per design) after ≤ 60 s propagation; no ghost inventory purchasable | — | P0 |
| TC-NEG-005 | FR-5 | integration | Nonsense query returns empty state with alternates | Index seeded | 1. Search "xqzzt" | No results; alternate suggestions rendered; no error; < 300 ms | query: `xqzzt` | P1 |
| TC-NEG-006 | FR-6 | integration | SKU unavailable at serving store blocks add-to-cart | SKU stocked at store B only; customer served by store A | 1. Open PDP via deep link | Shows unavailable-at-your-store state; add-to-cart disabled | — | P1 |
| TC-NEG-007 | FR-7 | unit | Quantity above stock or per-order cap blocked with reason | SKU: available 3, max_per_order 2 | 1. Step qty to 3 2. Then simulate stock 1, step to 2 | Increment blocked at cap with explicit reason ("max 2 per order" / "only 1 left"); cart never exceeds either limit | — | P0 |
| TC-NEG-008 | FR-8 | integration | Low rider availability widens ETA, never stale-promises | Zero eligible riders in zone | 1. Reach checkout | ETA widens (or ordering throttled per ops config); promise shown = promise stored; no default/cached fast ETA leaks | — | P0 |
| TC-NEG-009 | FR-9 | unit | Invalid/expired/min-cart coupons show failure reason | Coupons: expired, wrong-store, min_cart ₹500 vs cart ₹300 | 1. Apply each | Each rejected instantly with its specific reason; bill unchanged | fixture `pricing/coupons_invalid.json` | P0 |
| TC-NEG-010 | FR-9 | unit | Coupon per-user usage limit enforced | Coupon usage_limit 1/user; already redeemed | 1. Re-apply on new cart | Rejected with limit-reached reason; redemption counter unchanged | — | P1 |
| TC-NEG-011 | FR-10 | e2e | Payment failure → retry or switch method, cart intact | Sandbox failure VPA | 1. Pay with failing method 2. Retry with card | Clean failure message; cart and checkout session intact; second attempt succeeds; only one order results | sandbox VPA `failure@upi` | P0 |
| TC-NEG-012 | FR-10 | integration | Payment timeout leaves no phantom order | Sandbox configured to never answer | 1. Initiate payment 2. Abandon 3. Wait past 15 min hold | No order created while PENDING; reconciliation sweep resolves (release or refund per gateway truth); customer messaged to retry | — | P0 |
| TC-NEG-013 | FR-11, BR-5 | integration | [COND-COD §13] COD above cap blocked | Cart value ₹1,800 > cap ₹1,500 | 1. Select payment method | COD option hidden/disabled with cap reason; prepaid methods offered; cap value read from ops config | — | P1 |
| TC-NEG-014 | FR-11, BR-5 | integration | [COND-COD §13] Risky first-time user gets no COD | New user flagged risky | 1. Reach payment selection | COD not offered regardless of cart value; no client-side-only enforcement (API also rejects) | — | P1 |
| TC-NEG-015 | FR-12 | integration | Stock race: two customers, one last unit | SKU available_qty = 1; two paid checkouts fire concurrently | 1. Trigger both confirmations in parallel (repeat ×50) | Exactly one order wins the `FOR UPDATE` reservation every run; loser gets clean failure, cart intact, auto-refund initiated; never negative stock, never double-sell | harness `tests/race/last_unit.ts` | P0 |
| TC-NEG-016 | FR-12 | integration | Any line shortfall rolls back whole reservation | 3-line cart; line 2 short by 1 | 1. Confirm payment | Full rollback: no order row, no partial reservation, refund auto-initiated (BR-4), cart intact with shortfall reason | — | P0 |
| TC-NEG-017 | FR-13, NFR-3 | integration | WebSocket loss degrades to HTTPS polling | Tracking session live | 1. Sever WS (network blip) 2. Keep screen open | Client falls back to `GET /v1/orders/{id}/track`; last-known position from Redis shown; no error screen | — | P0 |
| TC-NEG-018 | FR-14 | integration | Cancel after dispatch is blocked | Order DISPATCHED | 1. Attempt cancel via app and via API | Both refused with reason; order state unchanged; support path (FR-26) referenced | — | P0 |
| TC-NEG-019 | FR-15 | integration | Reorder with everything unavailable | Past order; all SKUs now delisted | 1. Tap reorder | Zero items added; clear "all unavailable" message; no empty-cart checkout possible | — | P2 |
| TC-NEG-020 | FR-16 | unit | Rating rejected for non-delivered order | Order in DISPATCHED | 1. POST rating via API | 4xx with reason; no rating row; no exception-queue entry | — | P2 |
| TC-NEG-021 | FR-17 | integration | Wrong barcode cannot confirm pick line | Pick list active | 1. Scan barcode of different SKU | Line stays unconfirmed; mismatch feedback; pack-complete blocked until all lines resolved (picked/substituted/refunded) | — | P0 |
| TC-NEG-022 | FR-18 | integration | Offer declines/timeouts cascade; exhaustion hits exception queue | 2 online riders; both decline | 1. Emit `order.packed` 2. Decline offer 1 3. Let offer 2 time out (30 s) | Cascade nearest→next; on exhaustion order lands in exception queue for force-assign; ops force-assign works | — | P0 |
| TC-NEG-023 | FR-19, BR-8 | integration | Delivery cannot complete without proof | Rider at drop | 1. Attempt complete without OTP/photo 2. Attempt via raw API | Both blocked; assignment stays ACCEPTED/arrived; with proof, completes normally | — | P0 |
| TC-NEG-024 | FR-20 | integration | Offline rider receives no offers | Rider toggled offline; only rider in zone | 1. Emit `order.packed` | Rider excluded from GEOSEARCH candidates; order goes to exception queue (no eligible rider), not to offline rider | — | P1 |
| TC-NEG-025 | FR-21 | integration | Malformed bulk CSV rejected row-wise | CSV: 5 valid rows, 3 malformed (bad price, missing SKU, bad category) | 1. Upload | Valid rows applied; 3 rejects reported with row number + reason; no partial-row corruption | fixture `catalog/bulk_bad.csv` | P1 |
| TC-NEG-026 | FR-22 | unit | Stock mutation without reason/actor rejected | Inventory API | 1. POST adjustment omitting reason 2. Attempt adjustment driving qty below 0 | Both rejected 4xx; no audit row, no stock change; negative stock impossible | — | P0 |
| TC-NEG-027 | FR-23, BR-6, NFR-7 | integration | Feed staler than 15 min degrades listing | Partner feed `last_ingested_at` 16 min ago | 1. Browse as customer of that partner store 2. Check checkout ETA | Store shows "delivery may take longer"; excluded from fast-ETA promises; wider ETA on order; recovers on fresh feed | — | P0 |
| TC-NEG-028 | FR-24 | unit | Invalid polygon rejected at save | Ops zone editor | 1. Submit self-intersecting polygon 2. Submit unclosed ring | Validation error; zone unchanged; serviceability unaffected | fixture `geo/bad_polygons.json` | P1 |
| TC-NEG-029 | FR-25 | integration | Exception action on terminal-state order rejected | Order already DELIVERED still visible in stale queue view | 1. Click reassign-rider | Action refused with state reason; queue row refreshes/clears; no zombie assignment created | — | P2 |
| TC-NEG-030 | FR-26, BR-4 | integration | Refund above ₹2,000 requires manual approval; ≤ ₹2,000 does not | Two cancelled prepaid orders: ₹1,999 and ₹2,001 | 1. Trigger both refunds | ₹1,999 auto-initiates with no approval step; ₹2,001 queues for finance approval, then initiates; both audit-logged | amounts ₹1,999 / ₹2,001 | P0 |
| TC-NEG-031 | FR-27 | unit | Empty date range yields zeroed report, not error | No orders in range | 1. Load report for empty range 2. Export CSV | Zeros/empty states render; CSV valid with headers; no 5xx | — | P2 |
| TC-NEG-032 | FR-28 | integration | Push fails → SMS fallback; both fail → retry + alert | FCM sandbox forced-fail for target device | 1. Drive one transition 2. Then force SMS fail too | SMS fallback row created (`fallback_of` set) ≤ 10 s; on double failure, retry with backoff + ops alert; no silent loss | — | P0 |
| TC-NEG-033 | FR-29 | security | Finance role hitting catalog-edit API gets 403 + audit | Finance-role JWT | 1. PUT catalog endpoint directly (bypass UI) | 403; attempt audit-logged with actor + denied action (FR-29 AC); no data change | — | P0 |
| TC-NEG-034 | FR-30 | integration | Customer rejects substitute → line refunded, order continues | OOS flagged; substitute offered | 1. Customer taps refund-instead 2. Complete order | Line marked refunded, refund row created (BR-4 path), remaining lines delivered; bill reflects removal | — | P1 |
| TC-NEG-035 | BR-1 | integration | Cross-store cart blocked | Cart with items from store A | 1. Switch location so serving store = B 2. Attempt add item | Single-store rule enforced: prompt to clear/switch cart; API rejects mixed-store cart writes | — | P0 |
| TC-NEG-036 | BR-3 | integration | Unpaid hold expires at 15 min and releases reservation | Payment PENDING with reservation held (edge: reservation-before-capture path via gateway retry) | 1. Hold reaches 15 min 2. Sweep runs | Reservation released back to `available`; payment marked expired/failed per gateway truth; customer notified to retry | — | P0 |
| TC-NEG-037 | BR-7 | integration | Rider with active order excluded from dispatch | Rider R1 has ACCEPTED assignment; R1 is nearest to new order | 1. Emit `order.packed` for second order | R1 never offered (max 1 active order); next-nearest rider offered instead | — | P0 |
| TC-NEG-038 | BR-9 | unit | Age-restricted/regulated item cannot publish to V1 catalog | SKU with restricted category flag | 1. Attempt publish via admin + bulk CSV | Publish blocked in both paths with compliance reason; SKU never reaches storefront/index | — | P1 |

### 3c. Integration seams (`TC-INT`) — outbox, events, webhooks, realtime, geo

| ID | Requirement | Type | Title | Preconditions | Steps | Expected | Test data (if relevant) | Priority |
|----|-------------|------|-------|----------------|-------|----------|--------------------------|----------|
| TC-INT-001 | FR-12, NFR-10, Arch §5a | integration | Outbox rows commit atomically with the state change | Checkout ready | 1. Confirm payment (success run) 2. Force txn rollback on a second run (inject line shortfall) | Success: order + `order.placed`/`payment.captured`/`stock.reserved` outbox rows in one commit. Rollback: zero outbox rows — an event can never exist without its state change | — | P0 |
| TC-INT-002 | Arch §2a | integration | Outbox relay is at-least-once across crashes | Order committed; relay killed after commit, before publish | 1. Kill relay process at the crash point 2. Restart | Event published to Redpanda after restart; `published_at` set; no event ever lost between commit and publish | fault-injection harness | P0 |
| TC-INT-003 | FR-28, Arch §3a C-9 | integration | Consumers are idempotent under duplicate delivery | `order.placed` event in topic | 1. Redeliver the same event 3× to notification, audit, picker-projection consumers | Exactly one notification, one audit row, one picker-queue entry; duplicates detected via processed-event key and skipped | — | P0 |
| TC-INT-004 | Arch §2a, NFR-10 | integration | Full topic replay rebuilds projections without duplicate side effects | Picker/analytics projections dropped | 1. Reset consumer group to offset 0 2. Replay day of events | Projections rebuilt byte-consistent with Postgres truth; side-effecting consumers (SMS/push/refund) emit nothing on replay | seeded topic fixture | P1 |
| TC-INT-005 | FR-10, Arch §5e | integration | Duplicate payment webhook is a no-op | Captured payment; webhook already processed | 1. Re-POST identical signed webhook 5× | Upsert keyed on `gateway_payment_ref`+type: no state change, no duplicate order/refund/notification; 2xx returned each time | — | P0 |
| TC-INT-006 | FR-10, Arch §5e | integration | Out-of-order webhooks resolved by gateway timestamp | `payment.captured` (T2) processed | 1. Deliver older `payment.failed` (T1) after | Older event ignored by timestamp precedence; payment remains captured; raw payload still persisted for forensics | — | P0 |
| TC-INT-007 | FR-10, BR-3, Arch §5e | integration | Lost webhook covered by reconciliation sweep | Sandbox webhooks suppressed; payment captured at gateway | 1. Wait past PENDING > 15 min 2. Sweep cycle (5 min) runs | Sweep queries gateway status API, confirms capture, creates order (or refunds if reservation gone); BR-3 hold released on failed/expired cases | — | P0 |
| TC-INT-008 | FR-10, BR-4 | integration | Captured-but-no-order auto-refunds immediately | Client killed between capture and reservation; reservation failed | 1. Deliver capture webhook | State comparison detects capture with no order → refund initiated in the same handling, idempotency key = refund ID; customer notified | — | P0 |
| TC-INT-009 | FR-14, BR-4 | integration | Refund SLA monitor alerts before 24 h breach | Refund row with `initiated_at` NULL, created 20 h ago (clock-shifted) | 1. Monitor cycle runs | Ops alert fires at ≥ 20 h uninitiated; dashboard shows breach candidate; audit trail intact | clock-shift harness | P0 |
| TC-INT-010 | FR-13, Arch §5d | integration | WebSocket reconnect resumes tracking with missed events | Active tracking session | 1. Kill socket 2. Transition order status during the gap 3. Client reconnects | Client resubscribes to `track:{order_id}`; current status + last position delivered on reconnect (state fetch on subscribe); no permanent stale screen | — | P0 |
| TC-INT-011 | NFR-3, Arch §4 | manual-ops | Realtime gateway pod kill leaves core path unharmed | ≥ 2 realtime pods; live tracking sessions; steady checkout load | 1. Kill one realtime pod | Sockets reconnect to surviving pod ≤ 10 s; checkout p95 unaffected during the event; no order failures | chaos runbook | P1 |
| TC-INT-012 | BR-6, FR-23 | unit | Feed staleness boundary at exactly 15:00 | Feeds aged 14:59, 15:00, 15:01 | 1. Evaluate freshness_status for each | 14:59 = fresh; ≥ 15:00 = stale (boundary inclusive, per BR-6 "staler than 15 min" — document and pin the chosen semantics); flag drives degraded listing deterministically | boundary fixture | P1 |
| TC-INT-013 | FR-3, FR-24 | unit | Zone polygon edge: point exactly on boundary is deterministic | Zone polygon with vertex-precise test points | 1. Evaluate points: inside, outside, exactly on edge, on vertex | `ST_Contains` semantics pinned (boundary = not contained → falls to adjacent zone or not-serviceable per spec); same input always same result; overlapping-zone tiebreak documented and asserted | fixture `geo/boundary_points.json` | P1 |
| TC-INT-014 | BR-2, FR-8 | integration | ETA promise immutable through lifecycle and drives breach math | Order placed with promise T+12 min | 1. Drive full lifecycle incl. an ops ETA-param change mid-flight 2. Read order | `eta_promised_at` never mutates after placement; exception-queue breach calc and SLA reports use the stored promise, not current params | — | P0 |
| TC-INT-015 | NFR-7, FR-21 | integration | Stock event propagates to cache + search index ≤ 60 s | SKU in Redis cache and Meili index | 1. Zero its stock via inventory API 2. Poll storefront + search | Cache invalidated and Meili updated ≤ 60 s; SKU stops rendering in browse and search within the window | — | P0 |
| TC-INT-016 | FR-18 | integration | Offer TTL expiry cascades exactly once under worker restart | Offer OFFERED with 30 s TTL; dispatch worker restarted at T+15 s | 1. Restart worker mid-offer 2. Let TTL lapse | Exactly one expiry handling: single next-rider offer, never two concurrent active offers for one order (idempotent timer/state guard) | — | P0 |
| TC-INT-017 | FR-10, FR-12 | integration | Checkout confirm is idempotent on checkout-session ID | Payment captured for session S | 1. POST confirm for S twice concurrently + once again after success | One order, one reservation, one charge; retries return the same order ID (idempotency key = checkout-session ID at gateway and API layer) | — | P0 |
| TC-INT-018 | FR-14, BR-4 | integration | Gateway refund call idempotent on refund ID | Refund initiated; gateway call timed out ambiguously | 1. Retry refund API call with same refund ID 3× | Gateway receives idempotency key = refund ID; exactly one refund settles; refund row converges to single terminal state | — | P0 |
| TC-INT-019 | FR-23, BR-4, Arch §5c | integration | Partner confirmation timeout auto-cancels cleanly | Partner order PLACED; partner never confirms; timeout configured 10 min | 1. Let timeout elapse | Auto-cancel: reservation released, refund auto-initiated, customer notified, exception-queue entry created, partner fill-rate scorecard decremented | — | P0 |
| TC-INT-020 | FR-10, Arch C-6 | integration | Money-path writes without Idempotency-Key rejected | API gateway enforcing idempotency on writes | 1. POST checkout-confirm/refund endpoints without the header | 400 with contract error; with header, retries dedupe; non-money reads unaffected | — | P1 |
| TC-INT-021 | NFR-8 | manual-ops | Order-path trace continuity and SLO alert drill | OTel + Prometheus + alerting deployed in staging | 1. Place traced order 2. Follow trace ID gateway→core→outbox→worker 3. Inject synthetic latency to burn NFR-2 SLO | One stitched trace across sync + async legs (trace ID propagated in outbox envelope); burn-rate alert pages within policy window and links its runbook | — | P1 |

### 3d. Performance, load & resilience (`TC-PERF`)

| ID | Requirement | Type | Title | Preconditions | Steps | Expected | Test data (if relevant) | Priority |
|----|-------------|------|-------|----------------|-------|----------|--------------------------|----------|
| TC-PERF-001 | NFR-1, FR-4 | load | Browse p95 < 200 ms at launch peak | Staging sized like prod; catalog 50k SKUs × 60 stores; warm cache | 1. k6/Gatling: 500 RPS browse mix (category/PDP/serviceability), 30 min | Server p95 < 200 ms, p99 < 400 ms, error rate < 0.1%; Redis hit rate ≥ 95% | load profile `perf/browse.js` | P0 |
| TC-PERF-002 | NFR-1, FR-5 | load | Search p95 < 300 ms including typo queries | Meili seeded as prod-like | 1. 100 RPS search, 20% typo-variant queries, 30 min | p95 < 300 ms; relevance spot-checks still pass under load | query corpus `perf/search_terms.txt` | P0 |
| TC-PERF-003 | NFR-2, FR-12 | load | Order confirm p95 < 3 s at surge | Gateway sandbox; full checkout path | 1. Sustain 7 orders/min (10k/day avg) 2. Surge ×5 (35/min) for 15 min | Pay-confirm→confirmed p95 < 3 s throughout; zero lost/duplicate orders; outbox lag < 5 s | `perf/checkout.js` | P0 |
| TC-PERF-004 | NFR-4 | load | 10× scale-out with zero code change | Terraform/HPA config only | 1. Scale replicas/partitions per runbook 2. Re-run TC-PERF-001..003 at 10× volumes (100k orders/day equivalent) | All SLOs hold; scaling achieved via replica/partition counts only — no code or schema change required | — | P1 |
| TC-PERF-005 | NFR-7, FR-13 | load | Tracking freshness ≤ 5 s at 10k concurrent sockets | 2k simulated riders @ 4 s GPS cadence; 10k customer/ops sockets | 1. Run 30 min soak 2. Measure GPS-fix→client-render latency distribution | p99 ≤ 5 s; no fan-out through Postgres/core (verified via metrics); socket reconnect storm (10% drop) recovers ≤ 30 s | `perf/tracking_sim.ts` | P0 |
| TC-PERF-006 | NFR-9 | manual-ops | Cold start < 3 s and offline grace on mid-range Android | Physical mid-range device (e.g., 4 GB RAM class) | 1. Cold-start ×10, measure 2. Load cart, enable airplane mode, kill app, reopen offline | Median cold start < 3 s; cart + last catalog render from cache offline; syncs cleanly on reconnect | device matrix `perf/devices.md` | P1 |
| TC-PERF-007 | NFR-3 | manual-ops | Chaos: pod kill + AZ loss keeps order path alive | Staging multi-AZ; steady checkout load running | 1. Kill a core pod 2. Then simulate full-AZ outage (cordon+drain AZ) | No failed orders (retries absorb); order-path availability ≥ 99.9% over the window; managed-Postgres failover transparent | chaos runbook `ops/chaos.md` | P0 |
| TC-PERF-008 | NFR-3 | manual-ops | Graceful degradation via kill switches | Feature flags wired for ratings, analytics ingestion, partner ingestion | 1. Flip each flag off under load 2. Sever Redpanda from one consumer group | Order path (browse→checkout→track) fully functional throughout; tracking falls back to polling if realtime shed; consumers resume from offset with zero event loss | — | P1 |

### 3e. Security, privacy & audit (`TC-SEC`)

| ID | Requirement | Type | Title | Preconditions | Steps | Expected | Test data (if relevant) | Priority |
|----|-------------|------|-------|----------------|-------|----------|--------------------------|----------|
| TC-SEC-001 | NFR-5, FR-1 | security | OTP brute-force and SMS-pump protections hold | Rate caps configured (3/min, 10/day per number; per-IP caps) | 1. Script 10 OTP requests/min for one number 2. Rotate numbers from one IP 3. Brute-force 6-digit codes | Per-number and per-IP caps enforced at edge + app; OTP compare constant-time; lockout/backoff after cap; alerts on pump pattern | attack scripts `sec/otp_abuse.ts` | P0 |
| TC-SEC-002 | NFR-5 | security | JWT expiry + refresh rotation + reuse detection | Valid session | 1. Use access token past 15 min 2. Rotate refresh 3. Replay the OLD refresh token | Expired JWT rejected; rotation issues new pair; old-refresh reuse revokes the entire token family and forces re-login | — | P0 |
| TC-SEC-003 | NFR-5, FR-29 | security | Audience claims isolate rider/customer/admin tokens | Valid rider JWT | 1. Call customer order API and admin API with rider token 2. Vice versa with customer token | All cross-audience calls 401/403; enforced at gateway guard, not client; attempts logged | — | P0 |
| TC-SEC-004 | NFR-5 | security | OWASP ASVS L2 spot checks: injection, IDOR, XSS | Staging; two customer accounts A and B | 1. SQLi payloads on search/order-lookup/CSV imports 2. Fetch B's order/address/invoice with A's token (IDOR) 3. Stored-XSS payloads in SKU name/address/rating fields rendered in admin | No injection (parameterized everywhere); all cross-user object access 403/404; payloads rendered inert (escaped) in every surface; ASVS L2 checklist items ticked in CI evidence | payload set `sec/asvs_l2.md` | P0 |
| TC-SEC-005 | NFR-5, NFR-6 | security | No raw card/UPI instrument data anywhere (PCI SAQ-A) | Full E2E payment executed with tracing + debug logs on | 1. Complete card + UPI sandbox payments 2. Sweep DB dumps, logs, traces, Redis, object storage for PAN/instrument patterns | Zero raw instrument data at rest or in logs (regex sweep clean); only gateway tokens/refs stored; checkout served from gateway-hosted fields/SDK | PAN regex sweep `sec/pan_sweep.sh` | P0 |
| TC-SEC-006 | NFR-5, FR-10 | security | Webhook forgery and replay rejected | Webhook endpoint live; real HMAC secret | 1. POST unsigned payload 2. POST valid-format wrong-signature 3. Replay a genuine webhook with timestamp outside window | All three rejected (401/400) with alert on repeated forgery; genuine in-window duplicates remain safe no-ops (TC-INT-005) | — | P0 |
| TC-SEC-007 | NFR-6 | security | DPDP consent captured, versioned, and enforced | New signup flow | 1. Sign up, inspect consent record 2. Bump consent version, log in as pre-bump user | Versioned consent stored on user with timestamp + purpose; re-consent requested on version bump; processing gates respect consent flags | — | P0 |
| TC-SEC-008 | NFR-6 | security | DPDP deletion anonymizes PII, retains statutory records | User with orders, payments, addresses, ratings | 1. Submit deletion request 2. Complete workflow 3. Inspect DB + warehouse + logs | Phone/name/address tombstone-hashed in place; user cannot log in; orders/payments/invoices/audit retained per GST/statutory carve-out; deletion itself audit-logged; confirmation issued to user | — | P0 |
| TC-SEC-009 | NFR-10, FR-22 | security | Audit completeness matrix: every money/stock mutation audited | Staging with all flows executable | 1. Execute one of each: GRN, adjustment, cycle count, reserve, release, price change, coupon apply, payment capture, refund, COD collection [COND-COD §13], commission record 2. Query `audit_event` | 100%: each mutation has exactly one append-only audit row with actor, actor_role, before/after, reason; UPDATE/DELETE on `audit_event` blocked at DB level | mutation checklist `sec/audit_matrix.md` | P0 |
| TC-SEC-010 | NFR-5, FR-9 | security | Client-tampered totals rejected — server recomputes money | Intercepting proxy on checkout | 1. Modify bill total/discount/fee fields in checkout + payment requests | Server recomputes bill from SKU prices + coupon rules; tampered values ignored/rejected; gateway amount always server-derived; attempt logged | — | P0 |
| TC-SEC-011 | NFR-5 | security | PII encrypted at rest and redacted in logs | DB volume + column crypto configured | 1. Inspect raw column bytes for phone/address 2. Look up user via HMAC phone index 3. Grep logs/traces for seeded phone number | Columns ciphertext at rest; deterministic HMAC index resolves lookups without plaintext; zero PII hits in logs/traces (logger-layer redaction) | seeded phone `+919800000099` | P1 |
| TC-SEC-012 | FR-29 | security | Partner users row-scoped to their own store | Partner users P1 (store S1), P2 (store S2) | 1. As P1, request S2's orders, stock, settlement via UI and raw API (ID enumeration) | All S2 access 403/404; no data leakage in list endpoints; attempts audit-logged | — | P0 |

### 3f. End-to-end journeys (`TC-E2E`)

| ID | Requirement | Type | Title | Preconditions | Steps | Expected | Test data (if relevant) | Priority |
|----|-------------|------|-------|----------------|-------|----------|--------------------------|----------|
| TC-E2E-001 | FR-1..10,12,13,17,18,19,28; BR-2,8,10 | e2e | Dark-store golden path: login → delivered → invoice → rate | Staging full stack; sandbox gateway; test rider + picker | 1. OTP login 2. Browse + search 3. Cart 4. Checkout with coupon, note ETA 5. Pay UPI 6. Picker packs 7. Rider accepts, picks up (OTP), delivers (proof) 8. Rate 5 stars | Every transition correct and notified ≤ 10 s; tracking live ≤ 5 s; delivered within promised-ETA machinery; GST invoice in history; all events in audit + analytics | golden fixture `e2e/golden_path.md` | P0 |
| TC-E2E-002 | FR-23; BR-1, BR-6 | e2e | Partner-store order with stale-feed degradation | Partner store serving the zone; feed aged > 15 min then refreshed | 1. Browse (observe "may take longer" while stale) 2. Refresh feed 3. Order 4. Partner confirms + marks READY 5. Dispatch → delivery | Degraded listing while stale, fast ETA only when fresh; single-store cart (BR-1); partner notification + READY flow works; commission line recorded on order | — | P0 |
| TC-E2E-003 | FR-11, FR-19; BR-5, BR-8 | e2e | [COND-COD §13] COD journey with collection + reconciliation | COD enabled; cart under cap | 1. Place COD order 2. Deliver with proof 3. Rider confirms collection 4. Check COD reconciliation report + rider cod_float | Order requires proof AND collection confirmation to complete; collected amount hits reconciliation report and rider float; audit rows present | — | P1 |
| TC-E2E-004 | FR-14; BR-4 | e2e | Cancellation + refund lands within SLA on gateway sandbox | Prepaid order in PACKED | 1. Cancel 2. Track refund through gateway sandbox webhooks to terminal state | Stock released instantly; refund initiated immediately (< 24 h SLA with 20 h alert never firing); refund webhook closes loop; customer notified at each step | — | P0 |
| TC-E2E-005 | FR-30, FR-17 | e2e | OOS at pick → substitution accepted → adjusted delivery | Order in PICKING; one line OOS on shelf | 1. Picker flags OOS 2. Customer accepts substitute within 60 s 3. Pack, dispatch, deliver | Substituted line delivered; bill and invoice reflect substitution delta; second run with timeout → line auto-refunded (cross-check TC-NEG-034) and partial order delivered | — | P1 |

## 4. Out-of-band tests (not table-friendly)
_E.g., chaos, soak, exploratory. Describe in prose._

- **Soak test (pre-launch):** 24 h continuous run at 1.5× expected launch load (browse + checkout + tracking mixes from TC-PERF-001/003/005) watching for memory leaks, consumer-lag creep, outbox-table bloat, Redis eviction pressure, and WebSocket fd exhaustion. Pass = no SLO degradation over the window and all queues/backlogs return to baseline.
- **Chaos/game-day drills (extends TC-PERF-007/008):** scripted game day covering: Redpanda broker loss (1 of 3), Meilisearch outage (search degrades, browse unaffected), Redis failover (cart durable copy proves out), payment-gateway outage (checkout messaging; COD-only degraded mode if §13 = yes), SMS provider outage (push-only operation + queued OTP alerting). Each drill has a runbook and an expected-blast-radius statement written **before** execution (NFR-3, NFR-8).
- **Backup/restore drill (Arch §11):** weekly staging restore from PITR; pre-launch full region-loss restore drill via Terraform into alternate India region — measured against RTO ≤ 1 h / RPO ≤ 5 min for the order path.
- **External penetration test (NFR-5, Phase 8 gate):** third-party pen test against OWASP ASVS L2 scope after code freeze; all high/critical findings block release. TC-SEC-004 is the internal spot-check rehearsal, not a substitute.
- **DLT/SMS template verification (manual-ops):** every registered DLT template rendered with boundary-length variables and delivered to real handsets across top 3 carriers; OTP latency sampled against the 30 s AC (FR-1).
- **Exploratory testing:** two timeboxed sessions per client (customer app, web, rider app, admin) per release candidate, charters seeded from the exception-queue taxonomy (delayed, stuck, failed-payment, low-rated) and from BRS risks #1–#7.
- **ETA promise-vs-actual calibration check (BRS risk #4, manual-ops):** after each staging load run, compare stored `eta_promised_at` vs actual delivery distribution; report feeds the weekly recalibration loop — this is a measurement harness, not a pass/fail test.

## 5. Test data strategy

- **Static fixtures:** `code/tests/fixtures/` — zone polygons + boundary points (`geo/`), store/catalog seeds (`catalog/`), coupons (`pricing/`), rider GEO positions (`dispatch/`), partner feeds incl. malformed rows (`partners/`), RBAC role matrix (`rbac/`), security payload sets (`sec/`).
- **Generated data:** faker-based factories (TypeScript, shared with NestJS test harness) for users, addresses, carts, orders; deterministic seeds per CI run so failures reproduce.
- **Production-like data:** none at V1 (no production exists pre-launch). Staging uses synthetic Delhi-NCR-shaped data: 60 stores, 50k SKUs, 2k riders, realistic zone polygons. Post-launch, anonymized snapshots only after the DPDP anonymization workflow (TC-SEC-008 machinery) is proven.
- **External sandboxes:** payment-gateway sandbox (vendor [OPEN] — adapter port lets tests run against a fake gateway implementing the same port until vendor lands), DLT SMS sandbox, FCM test channel. Race/fault cases (TC-NEG-015, TC-INT-002/016) use in-repo fault-injection harnesses, not sandbox behavior.

## 6. Test environments

| Env | Purpose | Data | Who can deploy |
|-----|---------|------|-----------------|
| local | dev loop | seed + faker | every engineer |
| ci | every PR | seed | automated |
| staging | pre-release | anonymized prod-like | release engineer |

## 7. Pass/fail tracking

The Excel export `_readable/03b_test_cases.xlsx` has a **Status** column that test runs update directly. The columns are:

```
ID | Requirement | Type | Title | Preconditions | Steps | Expected | Test data | Priority | Status | Last run | Notes
```

Status values: `not_run`, `pass`, `fail`, `flaky`, `skipped`, `design-pending` _(Mod #6 — for `TC-VIS-*` / `TC-E2E-*` tests that reference design paths not yet present in `designs/`. The test is defined but cannot be executed until designs land. `/tc-augment` after `/design-freeze` upgrades these to `not_run`.)_.

When tests fail, `/triage-failures` reads this Excel + `06_testing.md` and groups failures into Fix Packets.

## 8. Open items
- [ ] **COD decision (BRS §13)** — TC-FUNC-015, TC-NEG-013, TC-NEG-014, TC-E2E-003 and the COD leg of TC-SEC-009 are conditional; strike through (never renumber) if COD lands **no**. Due before `/tasks-freeze`.
- [ ] **Payment gateway vendor [OPEN]** — TC-FUNC-013/014, TC-NEG-011/012, TC-INT-005..008/017/018, TC-E2E-004 run against a port-conformant fake gateway until the vendor sandbox is available; re-run against the real sandbox before `/testing-freeze`.
- [ ] **Load-test tooling choice** (k6 vs Gatling vs artillery) — owner: Eng lead; affects `perf/*` fixture format only, not case definitions.
- [ ] **Maps provider [OPEN]** — TC-E2E-001 navigation-handoff step and TC-PERF-006 device matrix finalize once C-19 SDK is chosen.
- [ ] **Feed-staleness boundary semantics** — TC-INT-012 pins ≥ 15:00 = stale; confirm with Partner success at review (BR-6 wording says "staler than").
- [ ] **`TC-VIS-*` cases** — intentionally absent; generated by `/tc-augment` after `/design-freeze` (Mod #6) and reviewed by QA on the re-freeze pass.

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
- **Role:** QA lead
- **Timestamp:** 2026-07-10T08:06:46Z
- **Status:** ✅ Frozen
- **Notes:** COD cases conditional pending BRS §13 decision (due before /tasks-freeze).
