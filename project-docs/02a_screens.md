---
schema_version: "0.4"
---

# 02a — Screen Definition (Design Thread)

> **Phase 2a.** Identify every screen / view / surface implied by the BRS, before any design work starts. After this is frozen, `03a_designer_prompts.md` is generated.
>
> **Project:** GroFast · **Reads:** `01_brs.md` · **Writes:** this file

---

## 1. Platform decision (REQUIRED)
_Set this first — drives the prompt generation in `03a`._

- **Web app:** Yes — (a) customer responsive web storefront, (b) admin + ops dashboard (desktop-first web, incl. picker surface on store terminals/tablets)
- **Mobile app:** Yes — (a) customer app (Android + iOS), (b) rider app (Android only, per BRS §4a)
- **Native or responsive web:** Customer + rider apps native mobile; customer storefront responsive web (shares screen list with the app — web variants noted per screen); admin dashboard responsive web optimized for desktop
- **Tablet variant:** N/A as a dedicated design; customer web is responsive, and the admin picker screens (SC-044/045) must work on store tablets

## 2. Global navigation / IA
_Top-level structure that all screens live within._

- **Primary navigation:**
  - **Customer (app + web):** bottom tab bar (app) / top nav (web): Home · Categories · Search · Cart · Account. Persistent header: delivery address + live ETA badge. Persistent floating cart bar once cart is non-empty.
  - **Rider (Android):** single-stack task UI — Home (online/offline) is the hub; active job takes over the screen; Earnings via top-level menu. One-handed, sunlight-readable (BRS §9).
  - **Admin (web):** left rail by module: Live Ops · Exceptions · Orders · Picking · Catalog · Inventory · Partners · Zones & ETA · Coupons · Analytics · Users. Global order/phone search in the top bar. Modules visible per RBAC role (FR-29).
- **Secondary navigation:** Customer — Account hub fans out to Orders, Addresses, Profile/Privacy. Admin — in-module tabs (e.g., Inventory: Stock / GRN / Adjustments; Partners: List / Feed status).
- **Deep-link entry points:** push/SMS → order tracking (SC-014), substitution prompt (SC-015), rating (SC-018), rider job offer (SC-023); marketing links → PDP (SC-008) / category (SC-006); admin alert emails → exception queue (SC-030). All deep links pass the auth + serviceability gates first.

### 2a. Screen-flow overview (per client)

**A. Customer (app + web)**
- First run: SC-001 → SC-002 → SC-003 → (serviceable? SC-005 : SC-004)
- Shop & buy: SC-005 → SC-006/SC-007 → SC-008 → SC-009 → SC-010 (→ SC-011 coupon) → SC-012 → SC-013 → SC-014
- Post-order: SC-014 → (OOS? SC-015 → SC-014) → delivered → SC-018 → SC-005
- Manage: SC-005 → SC-019 → SC-016 → SC-017 (reorder → SC-009; cancel → refund state); SC-019 → SC-020

**B. Rider (Android)**
- SC-021 → SC-022 (go online) → SC-023 (offer) → accept → SC-024 (pickup) → SC-025 (drop) → [COD: SC-026] → SC-022
- SC-022 → SC-027 (earnings) → SC-022

**C. Admin + ops (web)**
- SC-028 → SC-029 (hub) → SC-030 → SC-032 (act) → SC-030
- SC-029 → SC-031 → SC-032; Catalog: SC-033 ↔ SC-034; Inventory: SC-035 ↔ SC-036; Partners: SC-037 → SC-038; Config: SC-039 → SC-040, SC-041; Reporting: SC-042; Access: SC-043
- Picker (store terminal, admin surface): SC-028 → SC-044 → SC-045 → (OOS → triggers customer SC-015) → pack complete → SC-044

### 2b. Global design principles

- Speed-first: skeleton loads everywhere, optimistic UI on cart/stock ops, sub-100 ms perceived interactions (BRS §9)
- Live tracking map is the emotional centerpiece post-order; transparent billing, honest stock states (no ghost inventory)
- Rider app: one-handed, high-contrast, sunlight-readable, minimal taps per step
- Admin: dense, keyboard-friendly, manage-by-exception (queue-driven, not watch-the-wall)
- Accessibility: WCAG 2.1 AA on web surfaces; dynamic type support in apps

## 3. Screen inventory

> One row per screen. Stable IDs `SC-001`, `SC-002`. Never renumber.
>
> Linked FRs come from `01_brs.md`.

### Schema for each screen

```
ID             SC-XXX
Name           <screen name>
Platform       web / mobile / both
Purpose        <one-line>
User role(s)   <which personas see this>
Data shown     <fields / entities displayed>
Primary actions <what user can do>
States         default / empty / loading / error / success
Navigation in  <where user arrives from>
Navigation out <where user goes next>
Linked FRs     FR-1, FR-2 …
Notes
```

### Screens

---
### Client A — Customer (mobile app + web storefront; shared list, web variants noted)

#### SC-001 — Login (phone entry)
- **Platform:** both (customer app + web)
- **Purpose:** Capture Indian mobile number to start OTP auth.
- **User role(s):** Customer (Priya, Sunita)
- **Data shown:** Phone input (+91 fixed), T&C/DPDP consent copy, brand promise strip
- **Primary actions:** Enter number → Send OTP; accept consent
- **States:** default / loading (sending OTP) / error (invalid number, SMS send failure, rate-limited) / edge: returning session with valid refresh token skips to SC-003
- **Navigation in:** App launch (logged out), web `/login`, any auth-gated action
- **Navigation out:** SC-002
- **Linked FRs:** FR-1
- **Notes:** Guest browse allowed pre-login on web; login forced at checkout.

#### SC-002 — OTP verification
- **Platform:** both
- **Purpose:** Verify the OTP and establish a session (JWT + refresh).
- **User role(s):** Customer
- **Data shown:** 6-digit OTP input, masked phone, resend timer (30 s), attempt counter
- **Primary actions:** Enter OTP (auto-read on Android), resend, edit number
- **States:** default / loading (verifying) / error (wrong OTP, expired, ≥ 2 failed attempts → resend) / success (session created)
- **Navigation in:** SC-001
- **Navigation out:** SC-003 (first run) or return to interrupted flow
- **Linked FRs:** FR-1
- **Notes:** OTP must arrive within 30 s per FR-1 acceptance; SMS via DLT-registered templates (BRS §10).

#### SC-003 — Location & serviceability gate
- **Platform:** both
- **Purpose:** Resolve GPS/manual location → zone → serving store before any browsing.
- **User role(s):** Customer
- **Data shown:** Map pin + detected address, saved-address list, search-address field, resolved zone/store + ETA band
- **Primary actions:** Allow GPS, confirm detected address, pick saved address, search & pin manually
- **States:** loading (locating) / permission-denied (manual entry fallback) / error (geocode failure) / edge: location outside all zones → SC-004
- **Navigation in:** SC-002, app relaunch, address-change tap from SC-005 header
- **Navigation out:** SC-005 (serviceable) or SC-004 (not serviceable)
- **Linked FRs:** FR-2, FR-3
- **Notes:** Web variant: browser geolocation prompt + pincode fallback.

#### SC-004 — Not serviceable
- **Platform:** both
- **Purpose:** Honest dead-end with notify-me capture when location is outside all zones.
- **User role(s):** Customer
- **Data shown:** "Not serviceable yet" message, entered location, notify-me phone/email capture
- **Primary actions:** Register notify-me, change location
- **States:** default / success (notify-me saved) / error (save failed)
- **Navigation in:** SC-003
- **Navigation out:** SC-003 (change location)
- **Linked FRs:** FR-3
- **Notes:** Prevents dead carts; no catalog access from here.

#### SC-005 — Home / storefront
- **Platform:** both
- **Purpose:** Serving-store storefront: category grid, promos, entry to search and reorder.
- **User role(s):** Customer
- **Data shown:** Address + ETA badge header, search bar, category tiles, promo banners, "order again" strip, active-order tracker chip
- **Primary actions:** Open category, open search, tap banner, tap active-order chip, change address
- **States:** loading (skeleton) / default / error (retry) / edge: store under heavy load → widened ETA badge; partner-store-served zone → "delivery may take longer" flag (BR-6)
- **Navigation in:** SC-003, tab bar, deep links
- **Navigation out:** SC-006, SC-007, SC-008, SC-009, SC-014, SC-019, SC-003
- **Linked FRs:** FR-2, FR-4, FR-8 (ETA band preview), FR-15 (order-again strip)
- **Notes:** Only in-stock-priced items for the serving store render (BR-1). Web variant: mega-menu for categories.

#### SC-006 — Category listing (PLP)
- **Platform:** both
- **Purpose:** Browse products of one category/subcategory at the serving store.
- **User role(s):** Customer
- **Data shown:** Subcategory chips, product cards (image, name, pack size, MRP vs price, discount tag), add/stepper controls
- **Primary actions:** Add to cart / step qty (optimistic), open PDP, switch subcategory, sort/filter
- **States:** loading (skeleton grid) / default / empty (category empty at this store) / error / edge: item hits stock cap → stepper blocked with reason (FR-7)
- **Navigation in:** SC-005, SC-007, deep links
- **Navigation out:** SC-008, SC-009 (floating cart bar)
- **Linked FRs:** FR-4, FR-7
- **Notes:** p95 < 200 ms server target (NFR-1); infinite scroll with cache.

#### SC-007 — Search
- **Platform:** both
- **Purpose:** Typo-tolerant product search with suggestions and empty-state alternates.
- **User role(s):** Customer
- **Data shown:** Query input, recent searches, trending, result cards with add/stepper, "did you mean" strip
- **Primary actions:** Type/voice query, tap suggestion, add to cart, open PDP
- **States:** default (recents/trending) / loading / results / empty (alternate suggestions per FR-5) / error
- **Navigation in:** SC-005 search bar, tab bar
- **Navigation out:** SC-008, SC-006, SC-009
- **Linked FRs:** FR-5, FR-7
- **Notes:** < 300 ms p95; "atta/aata/attaa" class typo tolerance is an explicit acceptance case.

#### SC-008 — Product detail (PDP)
- **Platform:** both
- **Purpose:** Full SKU detail to support the buy decision.
- **User role(s):** Customer
- **Data shown:** Image carousel, name, pack size/weight, MRP vs price + discount, availability at serving store, description, expiry-sensitive info, similar items
- **Primary actions:** Add/step qty, view similar
- **States:** loading / default / error / edge: OOS at serving store → disabled add + "notify me" not in V1, show similar items
- **Navigation in:** SC-006, SC-007, deep links, SC-005 banners
- **Navigation out:** SC-009, back to PLP/search
- **Linked FRs:** FR-6, FR-7
- **Notes:** Price/availability always scoped to the serving store (BR-1). Web variant: SEO-indexable URL.

#### SC-009 — Cart
- **Platform:** both
- **Purpose:** Review and adjust the order with a running total before checkout.
- **User role(s):** Customer
- **Data shown:** Line items (qty steppers, per-line price), running total, savings, stock-cap warnings, "you may have missed" strip
- **Primary actions:** Step/remove items, proceed to checkout, continue shopping
- **States:** default / empty (browse CTA) / loading / error / edge: qty exceeds available stock or per-order cap → increment blocked with reason; item went OOS since add → flagged line
- **Navigation in:** Floating cart bar, tab bar, SC-017 reorder
- **Navigation out:** SC-010, SC-005
- **Linked FRs:** FR-7, FR-15
- **Notes:** Cart persists across sessions and devices (FR-7); optimistic UI with server reconcile.

#### SC-010 — Checkout (ETA promise, coupons, bill)
- **Platform:** both
- **Purpose:** Commit the delivery address, show the ETA promise, apply coupons, and present the itemized bill.
- **User role(s):** Customer
- **Data shown:** Delivery address (editable), **dynamic ETA promise (e.g., "12 min")**, itemized bill: item total, delivery fee, small-cart fee, coupon discount, GST-inclusive grand total; coupon entry/applied chip; delivery instructions field
- **Primary actions:** Change address (→ SC-020), apply/remove coupon (→ SC-011), proceed to pay (→ SC-012)
- **States:** loading (computing ETA + bill) / default / error (ETA unavailable → retry) / edge: coupon invalid → inline failure reason; cart item OOS at checkout → return to SC-009 flagged; ETA widened under load
- **Navigation in:** SC-009
- **Navigation out:** SC-012, SC-011, SC-020, SC-009
- **Linked FRs:** FR-8, FR-9, FR-2
- **Notes:** ETA shown here is stored on the order as the SLA baseline (BR-2). All prices GST-inclusive (BR-10).

#### SC-011 — Coupon selection (sheet/modal)
- **Platform:** both
- **Purpose:** List eligible coupons and apply one with instant bill reflection.
- **User role(s):** Customer
- **Data shown:** Coupon cards (code, flat/percent value, min-cart condition, expiry), manual code entry, eligibility state per coupon
- **Primary actions:** Apply, remove, enter code manually
- **States:** loading / default / empty (no coupons) / error (invalid/ineligible code with reason)
- **Navigation in:** SC-010
- **Navigation out:** SC-010 (with applied coupon)
- **Linked FRs:** FR-9
- **Notes:** Rendered as bottom sheet (app) / modal (web) over SC-010.

#### SC-012 — Payment
- **Platform:** both
- **Purpose:** Select payment method and complete payment via the PCI-compliant gateway.
- **User role(s):** Customer
- **Data shown:** Amount payable, methods: UPI (intent/collect), cards (gateway-tokenized), wallets, **COD (conditional — pending §13 sign-off; hidden above BR-5 cap or for risk-flagged first-timers)**
- **Primary actions:** Pick method, pay (gateway redirect/intent handoff), place COD order, retry / switch method on failure
- **States:** default / processing (gateway pending, webhook wait) / success (→ SC-013) / failure-timeout (retry or switch method **without losing cart**) / edge: stock reservation fails after payment → clean failure screen + auto-refund notice (FR-12, BR-4)
- **Navigation in:** SC-010
- **Navigation out:** SC-013 (success), SC-010 (back), failure state loops here
- **Linked FRs:** FR-10, FR-11, FR-12
- **Notes:** Order confirm < 3 s post gateway success (NFR-2). No raw card data on GroFast surfaces (NFR-5). Web variant: gateway redirect + return URL.

#### SC-013 — Order confirmation
- **Platform:** both
- **Purpose:** Confirm placement, restate the ETA promise, and hand off to tracking.
- **User role(s):** Customer
- **Data shown:** Order ID, promised ETA countdown, serving store, item summary, payment method/status
- **Primary actions:** Track order (→ SC-014), continue shopping
- **States:** success (primary) / edge: COD order → "amount to pay on delivery" callout
- **Navigation in:** SC-012
- **Navigation out:** SC-014, SC-005
- **Linked FRs:** FR-12, FR-8, FR-28 (confirmation push/SMS mirrors this screen)
- **Notes:** Auto-forwards to SC-014 after a beat.

#### SC-014 — Live order tracking
- **Platform:** both
- **Purpose:** Real-time status timeline + rider-on-map; the emotional centerpiece post-order.
- **User role(s):** Customer
- **Data shown:** Status stepper (placed → packed → dispatched → delivered), live map with rider position (≤ 5 s refresh), ETA countdown vs promise, rider name + masked call, order summary, help (phone/email)
- **Primary actions:** Call rider (masked), cancel (pre-dispatch only → confirmation → refund note), view bill, help
- **States:** loading / pre-dispatch (timeline only) / dispatched (map live) / delivered (→ SC-018 prompt) / cancelled / error (map/socket degraded → timeline-only fallback) / edge: ETA breach → apology banner (order also enters ops exception queue)
- **Navigation in:** SC-013, SC-005 active-order chip, SC-017, push deep link
- **Navigation out:** SC-018, SC-015 (if OOS prompt fires), SC-005
- **Linked FRs:** FR-13, FR-14, FR-28
- **Notes:** Status transitions push instantly (FR-13); cancellation releases stock + auto-refund ≤ 24 h (FR-14, BR-3/4).

#### SC-015 — Substitution prompt (OOS after order)
- **Platform:** both
- **Purpose:** Instant substitute-or-refund decision when the picker flags an item OOS.
- **User role(s):** Customer
- **Data shown:** OOS item, proposed substitute (image, price delta), **60 s countdown**, refund-of-line fallback note
- **Primary actions:** Accept substitute / refund that line
- **States:** default (countdown) / timeout (auto-refund of line, per FR-30) / success (choice recorded) / error (retry within window)
- **Navigation in:** Push deep link, in-app modal over SC-014
- **Navigation out:** SC-014
- **Linked FRs:** FR-30, FR-28
- **Notes:** Triggered from picker flow SC-045. Rendered as blocking sheet/modal.

#### SC-016 — Order history
- **Platform:** both
- **Purpose:** List past orders with one-tap reorder.
- **User role(s):** Customer
- **Data shown:** Order cards (date, store, item thumbnails, total, status), reorder button
- **Primary actions:** Open order detail, one-tap reorder (available items → cart; unavailable flagged)
- **States:** loading / default / empty (first-order nudge) / error
- **Navigation in:** SC-019, SC-005
- **Navigation out:** SC-017, SC-009 (reorder)
- **Linked FRs:** FR-15
- **Notes:** Reorder flags unavailable items explicitly (FR-15 acceptance).

#### SC-017 — Order detail (past/active order)
- **Platform:** both
- **Purpose:** Full record of one order: items, bill, status timeline, invoice, actions.
- **User role(s):** Customer
- **Data shown:** Line items, bill breakdown, GST invoice (download, post-delivery), status timeline, refund status, delivery proof reference
- **Primary actions:** Reorder, cancel (if pre-dispatch), download invoice, rate (if delivered & unrated), help
- **States:** loading / default / error / edge: refund in progress → refund tracker; cancelled → refund status
- **Navigation in:** SC-016, SC-014 (post-delivery)
- **Navigation out:** SC-009 (reorder), SC-018, SC-014 (if active)
- **Linked FRs:** FR-14, FR-15, FR-9 (invoice)
- **Notes:** GST-compliant invoice generated on delivery (FR-9, BR-10).

#### SC-018 — Rate order & delivery
- **Platform:** both
- **Purpose:** Capture order + delivery rating; surface quality issues to ops.
- **User role(s):** Customer
- **Data shown:** Star rating (order, delivery), reason picker (**appears when ≤ 3 stars**), free-text comment
- **Primary actions:** Rate, pick reasons, submit, skip
- **States:** default / success (thanks) / error (retry) / edge: ≤ 3 stars → reason picker mandatory; record routed to ops exception queue
- **Navigation in:** SC-014 (delivered), SC-017, push deep link
- **Navigation out:** SC-005
- **Linked FRs:** FR-16, FR-28
- **Notes:** Low ratings feed SC-030 exception queue.

#### SC-019 — Profile & account
- **Platform:** both
- **Purpose:** Account hub: profile, addresses, orders, privacy, support, logout.
- **User role(s):** Customer
- **Data shown:** Name/phone, links: Orders, Addresses, notification prefs, DPDP privacy (consent, data deletion request), support (phone + email), app version
- **Primary actions:** Edit profile, open sub-sections, request data deletion, logout
- **States:** default / loading / error / edge: data-deletion request → confirmation flow (NFR-6)
- **Navigation in:** Tab bar / account menu
- **Navigation out:** SC-016, SC-020, SC-001 (logout)
- **Linked FRs:** FR-1 (session), FR-2, FR-15 (entry)
- **Notes:** Support is phone + email only in V1 (BRS §4b).

#### SC-020 — Address book (list + add/edit)
- **Platform:** both
- **Purpose:** Manage saved addresses with map-pin accuracy for serviceability and ETA.
- **User role(s):** Customer
- **Data shown:** Address cards (label, full address, serviceable badge); editor: map pin, GPS detect, search, house/floor, landmark, label (Home/Work/Other)
- **Primary actions:** Add, edit, delete, set default, select for delivery
- **States:** loading / default / empty (add first address) / error / edge: pinned address not serviceable → warning + SC-004 pattern inline
- **Navigation in:** SC-019, SC-010 (change address), SC-003
- **Navigation out:** back to caller with selected address
- **Linked FRs:** FR-2, FR-3
- **Notes:** Label, floor, landmark fields per FR-2 acceptance.

---
### Client B — Rider app (Android)

#### SC-021 — Rider login
- **Platform:** mobile (Android, rider)
- **Purpose:** Phone-OTP login for ops-provisioned rider accounts (KYC-lite: verification done by back-office, app shows status only).
- **User role(s):** Rider (Ravi)
- **Data shown:** Phone input, OTP entry, onboarding/KYC status banner (pending / active / blocked)
- **Primary actions:** Request OTP, verify, contact ops (if not yet activated)
- **States:** default / loading / error (unregistered number → "contact ops", wrong OTP) / edge: KYC pending → read-only lock screen with status
- **Navigation in:** App launch (logged out)
- **Navigation out:** SC-022
- **Linked FRs:** FR-1 (auth pattern), FR-18 (eligibility gated on active status)
- **Notes:** No self-serve signup in V1 — riders onboarded by ops (BRS §4c).

#### SC-022 — Rider home (online/offline)
- **Platform:** mobile (Android, rider)
- **Purpose:** Shift control hub: availability toggle, today's summary, active-job resume.
- **User role(s):** Rider
- **Data shown:** Large online/offline toggle, today's deliveries count + earnings snapshot, active job card (if any), GPS/health indicators
- **Primary actions:** Go online/offline, resume active job, open earnings
- **States:** offline (default) / online-waiting (idle, listening for offers) / active-job / error (GPS off → blocking prompt; no network → offline banner)
- **Navigation in:** SC-021, back from completed job
- **Navigation out:** SC-023 (offer arrives), SC-024/025 (resume), SC-027
- **Linked FRs:** FR-20, FR-18
- **Notes:** Max 1 active order (BR-7) — no job list, just the one card. High-contrast sunlight-readable theme.

#### SC-023 — Job offer
- **Platform:** mobile (Android, rider)
- **Purpose:** Present a dispatch offer with a 30 s accept/decline window.
- **User role(s):** Rider
- **Data shown:** Pickup store + distance, drop area + distance, estimated payout, **30 s countdown**, COD badge if applicable
- **Primary actions:** Accept / decline
- **States:** default (countdown) / timeout or decline (offer cascades to next rider, return to SC-022) / accepted (→ SC-024) / edge: offer withdrawn (ops force-assigned elsewhere)
- **Navigation in:** Full-screen takeover / push while online (SC-022)
- **Navigation out:** SC-024 (accept), SC-022 (decline/timeout)
- **Linked FRs:** FR-18, FR-28
- **Notes:** Ops force-assign (FR-18) lands as a non-declinable variant with reason shown.

#### SC-024 — Pickup flow
- **Platform:** mobile (Android, rider)
- **Purpose:** Guide the rider to the store and verify pickup via OTP/scan.
- **User role(s):** Rider
- **Data shown:** Store name/address, navigate button (maps handoff), order ID, item/bag count, pickup OTP/scan field, store contact
- **Primary actions:** Navigate (external maps), arrive, verify pickup (OTP entry or bag-label scan), report issue (order not ready)
- **States:** en-route / arrived / verifying / error (wrong OTP/scan mismatch) / edge: order not ready → wait state + ops notified
- **Navigation in:** SC-023 (accept)
- **Navigation out:** SC-025
- **Linked FRs:** FR-19
- **Notes:** Applies to dark-store and partner-store pickups alike.

#### SC-025 — Delivery flow (drop + proof)
- **Platform:** mobile (Android, rider)
- **Purpose:** Guide to the customer and enforce delivery proof to complete the order.
- **User role(s):** Rider
- **Data shown:** Customer address + landmark/floor, navigate button, masked-call button, delivery instructions, proof capture (customer OTP or photo), COD amount banner (if COD)
- **Primary actions:** Navigate, call customer (masked), capture proof (OTP or photo), mark delivered; report failed delivery (customer unreachable → ops)
- **States:** en-route / arrived / proof-capture / success (→ SC-026 if COD, else SC-022) / error (proof failed) / edge: customer unreachable → timed retry + ops escalation
- **Navigation in:** SC-024
- **Navigation out:** SC-026 (COD) or SC-022; completion updates customer SC-014
- **Linked FRs:** FR-19, FR-13 (GPS feed), FR-28
- **Notes:** Delivery proof mandatory (BR-8). Rider GPS streams ≤ 5 s to tracking + ops (NFR-7).

#### SC-026 — COD collection (conditional)
- **Platform:** mobile (Android, rider)
- **Purpose:** Confirm cash collected before the order can complete. **Conditional screen — ships only if COD is signed off (§13).**
- **User role(s):** Rider
- **Data shown:** Amount to collect (large type), order ID, collection confirmation control, short-change/dispute option
- **Primary actions:** Confirm collection, flag dispute (→ ops)
- **States:** default / success (order completes) / error / edge: customer refuses to pay → ops escalation, order not completed
- **Navigation in:** SC-025 (COD orders only)
- **Navigation out:** SC-022
- **Linked FRs:** FR-11, FR-19
- **Notes:** BR-8: COD requires collection confirmation in addition to delivery proof. BR-5 cap enforced upstream at SC-012.

#### SC-027 — Earnings & delivery history
- **Platform:** mobile (Android, rider)
- **Purpose:** Show the day's deliveries and per-order payouts; basic display only (no payout engine in V1).
- **User role(s):** Rider
- **Data shown:** Daily total, per-order rows (time, distance, payout), date picker, COD-collected total (reconciliation aid)
- **Primary actions:** Switch date, view order row detail
- **States:** loading / default / empty (no deliveries) / error
- **Navigation in:** SC-022
- **Navigation out:** SC-022
- **Linked FRs:** FR-20, FR-11 (COD totals)
- **Notes:** Incentive/payout engine deferred (FU-6).

---
### Client C — Admin + ops dashboard (web) — includes picker surface

#### SC-028 — Admin login (RBAC)
- **Platform:** web (admin)
- **Purpose:** Authenticate staff and resolve role-scoped module access.
- **User role(s):** Ops manager (Neha), catalog, finance, partner manager, picker (Amit), read-only
- **Data shown:** Email/username + password (or SSO placeholder), role-denied messaging
- **Primary actions:** Login, logout (global)
- **States:** default / loading / error (bad credentials, locked) / edge: role lacks module → access-denied interstitial, attempt audit-logged (FR-29)
- **Navigation in:** Dashboard URL, session expiry
- **Navigation out:** SC-029 (ops), SC-044 (picker role), or first permitted module per role
- **Linked FRs:** FR-29
- **Notes:** Every module below is gated by RBAC; denied attempts audit-logged (NFR-10).

#### SC-029 — Live ops dashboard
- **Platform:** web (admin)
- **Purpose:** Real-time city view: orders, riders, stores — the ops home.
- **User role(s):** Ops
- **Data shown:** Live counters (active orders by stage, online riders, store load), city map (orders/riders/zones), SLA hit-rate today, feed-staleness flags, alert strip
- **Primary actions:** Drill into any counter → filtered SC-031, open exception queue, open order/rider/store detail
- **States:** loading / default / degraded (stale data > 30 s banner) / error
- **Navigation in:** SC-028, left rail
- **Navigation out:** SC-030, SC-031, SC-032, SC-037
- **Linked FRs:** FR-25, FR-13 (rider positions), FR-27 (today KPIs)
- **Notes:** Must reflect order/inventory state within 30 s (Objective 6).

#### SC-030 — Exception queue
- **Platform:** web (admin)
- **Purpose:** Manage-by-exception worklist: delayed, stuck, failed-payment, low-rated orders.
- **User role(s):** Ops
- **Data shown:** Exception rows (type, order, age, promised vs actual ETA, zone/store), filters by type/zone, one-click action buttons
- **Primary actions:** **Reassign rider · call customer · cancel-refund** (one-click, per FR-25), open order detail, resolve/dismiss with reason
- **States:** loading / default / empty ("all clear") / error / edge: action fails → row flagged with retry
- **Navigation in:** SC-029, alert deep links, left rail
- **Navigation out:** SC-032
- **Linked FRs:** FR-25, FR-16 (low-rating entries), FR-14 (cancel-refund action)
- **Notes:** ETA-breach orders must appear within 30 s of breach (FR-25 acceptance). Keyboard-first triage.

#### SC-031 — Order search & list
- **Platform:** web (admin)
- **Purpose:** Find any order by ID, phone, status, store, zone, or date.
- **User role(s):** Ops, finance (read), read-only
- **Data shown:** Search bar (order ID / phone), filter rail, result rows (status, store, rider, amounts, ETA vs actual)
- **Primary actions:** Search, filter, open order detail, export page to CSV
- **States:** loading / default / empty (no match) / error
- **Navigation in:** SC-029, global top-bar search, left rail
- **Navigation out:** SC-032
- **Linked FRs:** FR-26
- **Notes:** Phone-number search per FR-26 acceptance.

#### SC-032 — Order detail (admin)
- **Platform:** web (admin)
- **Purpose:** Full order timeline with every state transition + actor, and privileged actions.
- **User role(s):** Ops, finance (refund actions)
- **Data shown:** Line items, bill, payment ledger (attempts, webhooks, refunds), full status timeline (state, timestamp, actor), rider assignment history, delivery proof, substitution log, customer rating
- **Primary actions:** Modify status, refund (auto below ₹2,000 threshold, per BR-4), cancel, reassign rider (force-assign), resend notification, add note
- **States:** loading / default / error / edge: every mutation requires a reason and writes to the audit log (NFR-10)
- **Navigation in:** SC-030, SC-031, SC-029
- **Navigation out:** back to caller
- **Linked FRs:** FR-26, FR-14, FR-18 (force-assign), FR-12 (reservation view)
- **Notes:** The canonical "what happened on this order" surface for support.

#### SC-033 — Catalog: product & category list
- **Platform:** web (admin)
- **Purpose:** Browse/manage the master catalog: products, categories, per-store price/availability.
- **User role(s):** Catalog manager
- **Data shown:** Product table (SKU, name, category, image thumb, MRP/price, per-store availability count, status), category tree, bulk CSV upload entry
- **Primary actions:** Create product (→ SC-034), edit, archive, manage categories, **bulk CSV upload** (with row-level error report)
- **States:** loading / default / empty / error / edge: CSV partial failure → downloadable rejection report
- **Navigation in:** Left rail
- **Navigation out:** SC-034
- **Linked FRs:** FR-21
- **Notes:** Storefront reflects saves within 60 s (FR-21 acceptance). Age-restricted category flags excluded from V1 catalog (BR-9).

#### SC-034 — Catalog: product editor
- **Platform:** web (admin)
- **Purpose:** Create/edit one SKU: content, images, category, per-store price & availability.
- **User role(s):** Catalog manager
- **Data shown:** Name, description, images (upload/reorder), pack size/weight, MRP + selling price, GST-inclusive flag, category assignment, per-store price/availability matrix
- **Primary actions:** Save/publish, upload images, set per-store overrides, archive
- **States:** default / saving / error (validation) / success / edge: price > MRP blocked
- **Navigation in:** SC-033
- **Navigation out:** SC-033
- **Linked FRs:** FR-21, FR-6 (feeds PDP)
- **Notes:** All prices GST-inclusive (BR-10).

#### SC-035 — Inventory: stock & adjustments
- **Platform:** web (admin)
- **Purpose:** Per-dark-store stock view with adjustments, cycle counts, and low-stock alerts.
- **User role(s):** Ops / store manager
- **Data shown:** Store selector, SKU stock table (on-hand, reserved, available, threshold), low-stock alert list, adjustment form (qty delta, **reason — mandatory**), cycle-count mode, audit-trail viewer per SKU
- **Primary actions:** Adjust stock (with reason), run cycle count, set low-stock thresholds, view audit trail
- **States:** loading / default / empty / error / edge: every mutation writes immutable audit record (who/when/why, FR-22)
- **Navigation in:** Left rail, low-stock alert links
- **Navigation out:** SC-036 (GRN tab)
- **Linked FRs:** FR-22
- **Notes:** Stock changes visible on storefront ≤ 60 s (NFR-7).

#### SC-036 — Inventory: GRN (goods receiving)
- **Platform:** web (admin)
- **Purpose:** Manual goods-receipt entry to bring stock into a dark store (V1 has no procurement pipeline).
- **User role(s):** Ops / store manager
- **Data shown:** GRN form (store, SKU rows: qty, batch/expiry where relevant, supplier ref), GRN history list with audit records
- **Primary actions:** Create GRN, commit (stock increments), view/print past GRN
- **States:** default / saving / success / error (validation) / edge: duplicate supplier-ref warning
- **Navigation in:** SC-035 tab, left rail
- **Navigation out:** SC-035
- **Linked FRs:** FR-22
- **Notes:** Procurement/PO automation deferred (FU-7).

#### SC-037 — Partner stores: list & feed status
- **Platform:** web (admin)
- **Purpose:** Monitor partner-store health: feed freshness, fill rate, listing status.
- **User role(s):** Partner manager, ops
- **Data shown:** Partner rows (name, zone, feed type API/CSV, **last feed age**, staleness flag > 15 min, fill-rate score, listing state normal/degraded/delisted)
- **Primary actions:** Open partner detail, force feed re-pull, toggle degraded listing, delist
- **States:** loading / default / empty / error / edge: stale feed → auto "delivery may take longer" listing (BR-6), highlighted row
- **Navigation in:** Left rail, SC-029 staleness flags
- **Navigation out:** SC-038
- **Linked FRs:** FR-23
- **Notes:** Feed freshness SLA 15 min (Objective 5, BR-6).

#### SC-038 — Partner store: detail & onboarding
- **Platform:** web (admin)
- **Purpose:** Onboard a partner store and manage its feed config, SKU mapping, and settlement info.
- **User role(s):** Partner manager
- **Data shown:** Store profile (name, address, zone mapping, contact, GSTIN), feed config (API creds / CSV schedule), **SKU mapping table with rejection report** (unmapped/merge candidates), commission/settlement fields, feed ingestion history
- **Primary actions:** Create/edit store, configure feed, run test ingestion, resolve mapping rejections (map/merge to master catalog), activate/suspend
- **States:** default / saving / ingesting / error (feed auth/parse failure) / edge: rejected rows → downloadable report per FR-23
- **Navigation in:** SC-037
- **Navigation out:** SC-037
- **Linked FRs:** FR-23
- **Notes:** Deep POS integrations are post-V1 per-partner projects (BRS §4c).

#### SC-039 — Zone editor
- **Platform:** web (admin)
- **Purpose:** Draw/edit geofenced serviceability polygons and map stores to zones.
- **User role(s):** Ops
- **Data shown:** Map with polygon draw/edit tools, zone list (name, stores mapped, status draft/published), store-to-zone mapping panel, overlap warnings
- **Primary actions:** Draw/edit/delete polygon, map/unmap stores, publish (serviceability updates for new sessions ≤ 60 s), throttle zone (order throttling per risk #2)
- **States:** loading / default / draft-unpublished / error / edge: polygon overlap or store-less zone → publish blocked with warning
- **Navigation in:** Left rail
- **Navigation out:** SC-040 (ETA tab)
- **Linked FRs:** FR-24, FR-3 (drives serviceability)
- **Notes:** Delhi NCR launch polygons are a pre-launch ops-config task (BRS §13).

#### SC-040 — ETA configuration
- **Platform:** web (admin)
- **Purpose:** Tune ETA parameters per zone/store so promises match capacity.
- **User role(s):** Ops
- **Data shown:** Per-zone/store ETA params (base prep time, buffer, load-widening curve, rider-availability factor), promise-vs-actual chart (recalibration aid), preview of resulting promise band
- **Primary actions:** Edit params, preview, publish
- **States:** default / saving / error / edge: params producing ETA below floor → blocked
- **Navigation in:** SC-039 tab, left rail
- **Navigation out:** SC-039
- **Linked FRs:** FR-24, FR-8 (feeds checkout promise)
- **Notes:** Conservative launch ETAs + weekly recalibration (risk #4).

#### SC-041 — Coupon management
- **Platform:** web (admin)
- **Purpose:** Create and manage flat/percent coupons with eligibility rules.
- **User role(s):** Ops / marketing (catalog role)
- **Data shown:** Coupon table (code, type flat/percent, value, min cart, validity window, usage caps, status, redemptions), editor form
- **Primary actions:** Create, edit, activate/deactivate, view redemption count
- **States:** loading / default / empty / error / edge: overlapping code → blocked
- **Navigation in:** Left rail
- **Navigation out:** —
- **Linked FRs:** FR-9
- **Notes:** Feeds customer SC-011; invalid-coupon reasons defined here.

#### SC-042 — Analytics & reports
- **Platform:** web (admin)
- **Purpose:** KPI dashboards and CSV-exportable reports for data-driven decisions.
- **User role(s):** All stakeholders (read scope per role)
- **Data shown:** Date-range picker; KPIs: GMV, orders, AOV, SLA hit rate, fill rate, OOS-after-order, payment success, rider utilization; zone heatmaps; sales reports; daily-digest config (8 am email/Slack)
- **Primary actions:** Change range/filters, export CSV, configure daily digest
- **States:** loading / default / empty (no data in range) / error / edge: numbers reconcile with order ledger (FR-27 acceptance)
- **Navigation in:** Left rail
- **Navigation out:** SC-031 (drill to orders)
- **Linked FRs:** FR-27
- **Notes:** Promise-vs-actual view shared with SC-040 for recalibration.

#### SC-043 — User & role management
- **Platform:** web (admin)
- **Purpose:** Manage staff accounts and role assignments (ops, catalog, finance, partner, picker, read-only).
- **User role(s):** Admin owner
- **Data shown:** User table (name, email, role(s), status, last login), role-permission matrix (read-only view), access audit log (incl. denied attempts)
- **Primary actions:** Invite/create user, assign/revoke roles, deactivate, view audit log
- **States:** loading / default / empty / error / edge: last admin-owner cannot be demoted
- **Navigation in:** Left rail (admin-owner only)
- **Navigation out:** —
- **Linked FRs:** FR-29
- **Notes:** Denied-access attempts are audit-logged per FR-29 acceptance.

#### SC-044 — Picker: pick-list queue
- **Platform:** web (admin surface on store terminal/tablet)
- **Purpose:** Queue of new dark-store orders awaiting picking at this store. **Picker workflow lives inside the admin dashboard (picker role), not a separate app.**
- **User role(s):** Picker (Amit)
- **Data shown:** Store-scoped order cards (order ID, item count, age, promised ETA countdown), my-active-pick banner
- **Primary actions:** Accept next order (→ SC-045), resume active pick
- **States:** loading / default / empty ("no orders") / error / edge: order nearing ETA breach → urgent highlight
- **Navigation in:** SC-028 (picker role lands here)
- **Navigation out:** SC-045
- **Linked FRs:** FR-17
- **Notes:** Auto-refresh; large touch targets for tablet use.

#### SC-045 — Picker: pick & pack flow
- **Platform:** web (admin surface on store terminal/tablet)
- **Purpose:** Item-by-item picking in store-layout order with barcode verification, OOS flow, and pack completion.
- **User role(s):** Picker
- **Data shown:** Pick list **sorted by store layout**, per-item: image, name, qty, shelf location, barcode-scan status; OOS control with substitute suggestion; pack summary + bag label
- **Primary actions:** Scan-verify item, mark picked, **flag OOS → propose substitute (fires customer SC-015) or refund line**, complete pack (timestamp recorded), print bag label
- **States:** in-progress / scan-error (wrong barcode) / waiting-on-customer (substitution 60 s window) / packed (success → dispatch offer fires) / error / edge: substitution timeout → line auto-refunded, pick continues
- **Navigation in:** SC-044
- **Navigation out:** SC-044; pack completion triggers rider dispatch (SC-023)
- **Linked FRs:** FR-17, FR-30, FR-12 (reservation consumed), FR-18 (triggers dispatch)
- **Notes:** Pack-completion timestamps feed SLA analytics (FR-17 acceptance).

## 4. Screens summary table

| ID | Name | Platform | Linked FRs | Priority |
|----|------|----------|------------|----------|
| SC-001 | Login (phone entry) | both (customer) | FR-1 | P0 |
| SC-002 | OTP verification | both (customer) | FR-1 | P0 |
| SC-003 | Location & serviceability gate | both (customer) | FR-2, FR-3 | P0 |
| SC-004 | Not serviceable | both (customer) | FR-3 | P0 |
| SC-005 | Home / storefront | both (customer) | FR-2, FR-4, FR-8, FR-15 | P0 |
| SC-006 | Category listing (PLP) | both (customer) | FR-4, FR-7 | P0 |
| SC-007 | Search | both (customer) | FR-5, FR-7 | P0 |
| SC-008 | Product detail (PDP) | both (customer) | FR-6, FR-7 | P1 |
| SC-009 | Cart | both (customer) | FR-7, FR-15 | P0 |
| SC-010 | Checkout (ETA, coupons, bill) | both (customer) | FR-8, FR-9, FR-2 | P0 |
| SC-011 | Coupon selection | both (customer) | FR-9 | P0 |
| SC-012 | Payment | both (customer) | FR-10, FR-11, FR-12 | P0 |
| SC-013 | Order confirmation | both (customer) | FR-12, FR-8, FR-28 | P0 |
| SC-014 | Live order tracking | both (customer) | FR-13, FR-14, FR-28 | P0 |
| SC-015 | Substitution prompt | both (customer) | FR-30, FR-28 | P1 |
| SC-016 | Order history | both (customer) | FR-15 | P1 |
| SC-017 | Order detail (customer) | both (customer) | FR-14, FR-15, FR-9 | P0 |
| SC-018 | Rate order & delivery | both (customer) | FR-16, FR-28 | P2 |
| SC-019 | Profile & account | both (customer) | FR-1, FR-2, FR-15 | P1 |
| SC-020 | Address book | both (customer) | FR-2, FR-3 | P0 |
| SC-021 | Rider login | mobile (rider) | FR-1, FR-18 | P0 |
| SC-022 | Rider home (online/offline) | mobile (rider) | FR-20, FR-18 | P0 |
| SC-023 | Job offer | mobile (rider) | FR-18, FR-28 | P0 |
| SC-024 | Pickup flow | mobile (rider) | FR-19 | P0 |
| SC-025 | Delivery flow (drop + proof) | mobile (rider) | FR-19, FR-13, FR-28 | P0 |
| SC-026 | COD collection (conditional) | mobile (rider) | FR-11, FR-19 | P1 |
| SC-027 | Earnings & delivery history | mobile (rider) | FR-20, FR-11 | P1 |
| SC-028 | Admin login (RBAC) | web (admin) | FR-29 | P0 |
| SC-029 | Live ops dashboard | web (admin) | FR-25, FR-13, FR-27 | P0 |
| SC-030 | Exception queue | web (admin) | FR-25, FR-16, FR-14 | P0 |
| SC-031 | Order search & list | web (admin) | FR-26 | P0 |
| SC-032 | Order detail (admin) | web (admin) | FR-26, FR-14, FR-18, FR-12 | P0 |
| SC-033 | Catalog: product & category list | web (admin) | FR-21 | P0 |
| SC-034 | Catalog: product editor | web (admin) | FR-21, FR-6 | P0 |
| SC-035 | Inventory: stock & adjustments | web (admin) | FR-22 | P0 |
| SC-036 | Inventory: GRN | web (admin) | FR-22 | P0 |
| SC-037 | Partner stores: list & feed status | web (admin) | FR-23 | P0 |
| SC-038 | Partner store: detail & onboarding | web (admin) | FR-23 | P0 |
| SC-039 | Zone editor | web (admin) | FR-24, FR-3 | P0 |
| SC-040 | ETA configuration | web (admin) | FR-24, FR-8 | P0 |
| SC-041 | Coupon management | web (admin) | FR-9 | P0 |
| SC-042 | Analytics & reports | web (admin) | FR-27 | P1 |
| SC-043 | User & role management | web (admin) | FR-29 | P0 |
| SC-044 | Picker: pick-list queue | web (admin/store) | FR-17 | P0 |
| SC-045 | Picker: pick & pack flow | web (admin/store) | FR-17, FR-30, FR-12, FR-18 | P0 |

**FR traceability:** every FR-1 … FR-30 maps to ≥ 1 screen above. FR-28 (notifications engine) is backend-driven with no dedicated screen; its user-facing surfaces are the push/SMS deep-link targets SC-013/014/015/018/023 (see §5).

**Counts:** Customer 20 (SC-001–020) · Rider 7 (SC-021–027) · Admin + ops incl. picker 18 (SC-028–045) · **Total 45**.

## 5. Cross-screen interactions
_Wizards, modals, toasts that span multiple screens._

- **Floating cart bar** (customer): persists across SC-005/006/007/008 once cart non-empty; taps into SC-009. Optimistic add/step with toast on server reject (stock cap reason).
- **Address switcher sheet:** SC-003/020 pattern invoked from the header on SC-005 and from SC-010; changing address re-runs serviceability and may reroute to SC-004 (and clears cross-store cart per BR-1 with a warning).
- **Substitution modal (SC-015):** blocking sheet over whatever customer screen is open, launched by push; 60 s countdown shared with picker's waiting state on SC-045.
- **Notification deep links (FR-28):** order milestones → SC-014; substitution → SC-015; delivered → SC-018; rider offer → SC-023; push→SMS fallback carries the same links.
- **ETA-widened banner:** appears on SC-005/010 when store load widens the promise (risk #2 mitigation).
- **Admin audit-reason modal:** every money/stock-touching mutation (SC-032/035/036) requires an actor reason before commit (NFR-10).
- **Global admin search:** top-bar order-ID/phone search available on all admin screens → SC-032.
- **Toasts:** success/failure toasts standardized across clients; errors always carry a reason (no bare "something went wrong" on the order path).

## 6. Out-of-scope screens (parked for V2+)
- Ads manager & sponsored-listing placements (FU-1)
- Subscription/membership management (FU-2)
- Loyalty points, referral screens (FU-3)
- Delivery-slot picker / scheduled delivery (FU-4)
- Language/city switcher (FU-5)
- Rider incentive & payout-engine screens (FU-6 — SC-027 stays display-only)
- Procurement / PO / supplier screens (FU-7 — manual GRN only, SC-036)
- In-app support chat / CRM console (FU-8)
- Rider multi-order batching UI (FU-9 — BR-7 caps at 1 active order)
- Partner-store self-serve portal (partner mgmt is ops-side SC-037/038 in V1)

## 7. Open items
- [ ] **COD pending §13 sign-off** — SC-026 and all COD elements (SC-012 COD option, SC-025 COD banner, SC-027 COD totals) are **conditional**; design them but gate build on the decision (due before `/tasks-freeze`)
- [ ] Maps/geo provider (BRS §10) affects map components on SC-003/014/020/025/029/039 — provider-agnostic design until selected
- [ ] Payment gateway vendor (BRS §13) affects SC-012 handoff pattern (redirect vs SDK intent) — design both variants lightweight
- [ ] Delhi NCR launch-zone polygons to be drawn in SC-039 pre-launch (ops task, BRS §13)
- [ ] Picker surface device decision (store tablet vs desktop terminal) for SC-044/045 — affects touch-target sizing; default: tablet-first responsive

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
- **Role:** PM + Designer
- **Timestamp:** 2026-07-10T07:48:14Z
- **Status:** ✅ Frozen
- **Notes:** _(none)_
