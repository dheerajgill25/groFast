---
schema_version: "0.4"
---

# 03a — Designer Prompts (Design Thread)

> **Phase 3a.** One structured prompt per screen, ready to feed Figma AI / Figma Make / human designers. The output of this phase **is** the input to designers — quality of prompts directly drives quality of designs.
>
> **Project:** GroFast · **Reads:** `02a_screens.md`, `00_kb.md` · **Writes:** this file
>
> No human-readable export — the prompts ARE the deliverable.

---

## 1. Global Design System Primer (PREPENDED TO EVERY PROMPT — NO EXCEPTION)

Every screen prompt below MUST start by pasting the block in this section. Do not skip it. It carries brand, tokens, and component library context so output is consistent across screens.

```
[GLOBAL DESIGN SYSTEM PRIMER — paste at the top of every prompt]

Brand: GroFast — hyperlocal grocery quick-commerce, Delhi NCR launch (India, INR, English).
Brand personality: fresh · fast · trustworthy. Speed you can see, honesty you can feel
(transparent bills, honest stock states, real ETAs).

Color (PROPOSAL — working tokens below; designer ratifies at 04a, tracked in §6):
- Primary: fresh green, #0FA958-class (CTAs, active states, success, ETA badge)
- Text: near-black #111417 on white/near-white surfaces
- Warm accent: amber/tangerine ~#FF8A00-class — offers, discounts, coupons ONLY (never for errors)
- Semantic: error red, warning amber, info blue; neutrals in an 8-step gray ramp
- Rider app: dark-on-light high-contrast variant, min 7:1 body contrast for sunlight readability

Typography (proposal): geometric-humanist sans (e.g., Inter/Plus Jakarta class).
Scale: 12 / 14 (body) / 16 / 20 / 24 / 32; numerals tabular for prices, timers, ETAs.
INR formatting: ₹1,234.50, Indian digit grouping. Dynamic type support in apps.

Spacing & shape: 4/8pt spacing grid. Corner radii: 8px inputs/cards, 12px sheets/modals,
pill (999px) for chips/steppers/badges. Elevation: 3 levels — flat card (1px border),
raised (soft shadow, sheets/floating bars), overlay (modal scrim 40%).

Iconography: 24px outlined, 2px stroke, rounded caps; filled variant for active tab state.

Component inventory (reuse, don't reinvent): primary/secondary/ghost buttons (44px min
height mobile), product card, order card, coupon card, category tile, pill chips (filters,
status, ETA badge), bottom sheets (app) / modals (web), qty stepper (pill, − qty +),
skeleton loaders (every list/detail), toasts (success/error, always with a reason),
map components (pin, rider marker, route line, zone polygon), stepper timeline (order
status), floating cart bar, search bar, form inputs with inline validation, data tables
(admin), left-rail nav (admin), countdown ring (30s/60s decision timers).

Motion: speed-first. 150–250ms ease-out for transitions; optimistic UI on cart/stock ops
(instant local update, reconcile with toast on server reject); skeletons never spinners
on the shopping path; sub-100ms perceived response on taps.

Accessibility: WCAG 2.1 AA on web (4.5:1 body contrast, visible focus rings, full keyboard
nav, labelled forms, announced errors). Apps: dynamic type, 44×44pt min tap targets.
Rider app: sunlight-readable — extra-high contrast, oversized type and tap targets (≥56px),
one-handed thumb-zone layout.

Platforms: customer + rider = React Native (iOS+Android customer; Android-only rider);
customer web storefront = Next.js responsive; admin = React web, desktop-first, dense,
keyboard-friendly, manage-by-exception. Picker screens run on store tablets — touch-first.

Style direction: modern, clean, food-fresh; white surfaces, generous imagery, green as the
speed/trust signal. Motion restrained, never decorative on the order path.
```

---

## 2. Screen prompts (one per `SC-XXX` from `02a_screens.md`)

### Prompt template

> Copy this template per screen and fill in. Fields in `<>` come from `02a_screens.md`.

```
[GLOBAL DESIGN SYSTEM PRIMER]
(paste from §1)

[SCREEN PROMPT]
Screen ID: <SC-XXX>
Screen name: <name>
Platform: <web / mobile / both>
  → If "both": produce one variant for desktop web (1440px wide) and one for mobile (390×844).

Purpose: <one-line>
User: <persona>

Layout intent:
<describe the spatial structure — header, body grid, side rail, footer>

Components from our library:
- <component-name> for <region>

Data shown:
<exact fields, in display order, with example values>

Primary actions:
- <action 1> → <result>

States to design (one frame each):
- Default · Empty · Loading (skeleton) · Error · Success (as applicable per 02a)

Interaction patterns:
<hover, focus, transitions, modal-vs-drawer>

Accessibility callouts:
<form labels, ARIA roles, keyboard order, error-message announcement>

Deliverables:
- High-fidelity Figma frames for every state above
- A spec sheet listing tokens used and component IDs
```

---

## 3. Prompts

> Every prompt below implicitly begins with the §1 primer — paste it first, then the block shown. Frame sizes: customer "both" screens = mobile 390×844 **and** web 1440; rider = mobile 390×844 only; admin (incl. picker) = web 1440 only.

### Client A — Customer (SC-001 … SC-020)

#### SC-001 — Login (phone entry)

```
[SCREEN PROMPT] SC-001 — Login (phone entry) · Customer · both
Context: First auth touch — capture Indian mobile number for OTP; brand's first impression.
Design: Top third = logo + brand promise strip ("Groceries in minutes"); center = phone input
with fixed +91 prefix; below = DPDP/T&C consent copy with links; primary button "Send OTP"
pinned above keyboard. Web 1440: centered card on soft brand background, guest-browse link.
States: default / loading (button spinner "Sending OTP…") / errors: invalid number (inline),
SMS send failure, rate-limited (cooldown copy). Edge: valid refresh token skips to SC-003.
A11y: labelled input, numeric keypad, error announced inline; consent copy real text not image.
Deliver: mobile 390×844 + web 1440, all states. FRs: FR-1.
```

#### SC-002 — OTP verification

```
[SCREEN PROMPT] SC-002 — OTP verification · Customer · both
Context: Verify the 6-digit OTP and establish session; must feel instant and forgiving.
Design: Masked phone with "Edit" link at top; 6-box OTP input (auto-read on Android, auto-
advance); 30s resend timer as text countdown → "Resend" link; attempt counter subtle.
States: default / loading (verifying) / errors: wrong OTP (boxes shake + red, inline reason),
expired, ≥2 failed attempts → push resend / success (checkmark beat → route onward).
Edge: returning mid-flow user goes back to the interrupted flow, not Home.
A11y: single announced error region; boxes act as one labelled input for screen readers.
Deliver: mobile 390×844 + web 1440, all states. FRs: FR-1.
```

#### SC-003 — Location & serviceability gate

```
[SCREEN PROMPT] SC-003 — Location & serviceability gate · Customer · both
Context: Resolve GPS/manual location → zone → serving store before any browsing; nothing
renders behind it. Maps provider undecided — design provider-agnostic map styling (tracked in §6).
Design: Full-height map with centered draggable pin + detected-address card at bottom (address
line, resolved zone/store, ETA-band chip e.g. "10–15 min", confirm button); saved-address list
and search-address field in a bottom sheet. Web: browser geolocation prompt + pincode fallback.
States: loading (locating pulse on pin) / default / permission-denied → manual entry fallback /
error (geocode failure, retry) / edge: outside all zones → route to SC-004.
A11y: manual search fully keyboard-usable; pin-drag has an address-search equivalent.
Deliver: mobile 390×844 + web 1440, all states. FRs: FR-2, FR-3.
```

#### SC-004 — Not serviceable

```
[SCREEN PROMPT] SC-004 — Not serviceable · Customer · both
Context: Honest dead-end when the location is outside all zones; capture demand, block catalog.
Design: Friendly illustration (style to be set by designer, tracked in §6) + "We're not in your area yet"; show the
entered location; notify-me capture (phone prefilled/email); secondary "Change location" →
SC-003. No nav into catalog from here.
States: default / success (notify-me saved — confirmation state, input replaced by check) /
error (save failed, retry toast).
A11y: single clear heading; form labelled; success announced.
Deliver: mobile 390×844 + web 1440, all states. FRs: FR-3.
```

#### SC-005 — Home / storefront

```
[SCREEN PROMPT] SC-005 — Home / storefront · Customer · both
Context: The serving-store storefront — daily entry point; speed and freshness must be visceral.
Design: Sticky header: delivery address (tap = address switcher sheet) + green ETA badge
("12 min"); search bar; promo banner carousel (warm accent); category tile grid (2×N app /
mega-menu web); "Order again" strip of product cards; active-order tracker chip docked above
tab bar when an order is live; floating cart bar once cart non-empty.
States: loading (full skeleton grid) / default / error (retry) / edges: heavy load → widened
ETA badge + banner; partner-store zone → "delivery may take longer" flag (BR-6).
Only in-stock items for the serving store appear (BR-1) — no ghost inventory.
A11y: banner carousel pausable; ETA badge readable text not color-only.
Deliver: mobile 390×844 + web 1440, all states + edge banners. FRs: FR-2, FR-4, FR-8, FR-15.
```

#### SC-006 — Category listing (PLP)

```
[SCREEN PROMPT] SC-006 — Category listing (PLP) · Customer · both
Context: Browse one category at the serving store; add-to-cart without leaving the grid.
Design: Header with category name + subcategory chip row (scrollable); product card grid
(image, name, pack size, MRP struck vs price, warm discount tag); each card: "ADD" pill that
morphs to − qty + stepper; sort/filter chips; floating cart bar; infinite scroll.
States: loading (skeleton grid) / default / empty ("nothing here at this store" + back CTA) /
error / edge: stock-cap hit → stepper "+" disabled with reason toast (FR-7).
Interactions: optimistic add (instant stepper, reconcile toast on reject), 150ms morphs.
A11y: stepper buttons labelled with product name + qty; discount not color-only.
Deliver: mobile 390×844 + web 1440, all states. FRs: FR-4, FR-7.
```

#### SC-007 — Search

```
[SCREEN PROMPT] SC-007 — Search · Customer · both
Context: Typo-tolerant search ("atta/aata/attaa" must all work); results feel instant (<300ms).
Design: Focused search field with voice icon (app); pre-query state: recent searches (chips) +
trending; results = product cards with add/stepper; "Did you mean …" strip above results when
the query was corrected.
States: default (recents/trending) / loading (skeleton rows, no spinner) / results / empty →
alternate suggestions per FR-5 (never a bare "no results") / error (retry).
Interactions: as-you-type results; keyboard stays up; cards identical to SC-006.
A11y: results count announced; suggestions keyboard-navigable on web.
Deliver: mobile 390×844 + web 1440, all states. FRs: FR-5, FR-7.
```

#### SC-008 — Product detail (PDP)

```
[SCREEN PROMPT] SC-008 — Product detail (PDP) · Customer · both
Context: Full SKU detail to close the buy decision; price/stock scoped to serving store (BR-1).
Design: Image carousel (square, dots); name + pack size/weight; price row: MRP struck, selling
price large, warm discount tag; availability line for serving store; description + expiry-
sensitive info accordion; "Similar items" card rail; sticky bottom add/stepper bar.
States: loading (skeleton) / default / error / edge: OOS at serving store → add disabled,
"out of stock" state + similar items promoted (no notify-me in V1).
Web: two-column (gallery left, buy panel right), SEO-indexable layout.
A11y: carousel swipe has button alternative; price change on discount announced properly.
Deliver: mobile 390×844 + web 1440, all states. FRs: FR-6, FR-7.
```

#### SC-009 — Cart

```
[SCREEN PROMPT] SC-009 — Cart · Customer · both
Context: Review/adjust before checkout; persists across sessions and devices (FR-7).
Design: Line-item list (thumb, name, pack, per-line price, qty stepper, remove); savings line
in warm accent; "You may have missed" strip; sticky footer: running total + "Proceed to
checkout" primary button.
States: default / empty (illustration + "Browse" CTA) / loading / error / edges: qty exceeds
stock or per-order cap → increment blocked with inline reason; item went OOS since add →
flagged red line with remove/keep-browsing options.
Interactions: optimistic stepper with server reconcile toast; row remove = 200ms collapse.
A11y: steppers labelled per product; total updates announced politely.
Deliver: mobile 390×844 + web 1440, all states. FRs: FR-7, FR-15.
```

#### SC-010 — Checkout (ETA promise, coupons, bill)

```
[SCREEN PROMPT] SC-010 — Checkout · Customer · both
Context: Commit address, show the ETA promise (stored as SLA baseline, BR-2), itemized honest bill.
Design: Stacked cards: (1) delivery address + "Change" → SC-020; (2) hero ETA promise — big
green "Arriving in 12 min"; (3) coupon row → SC-011 sheet, applied coupon = warm chip with
remove ×; (4) itemized bill: item total, delivery fee, small-cart fee, coupon discount (−),
GST-inclusive grand total (BR-10 — no hidden fees); (5) delivery instructions field. Sticky
"Proceed to pay ₹X" footer.
States: loading (computing ETA + bill skeleton) / default / error (ETA unavailable → retry) /
edges: coupon invalid → inline reason; item OOS at checkout → return to SC-009 flagged;
ETA widened under load → amber banner.
A11y: bill is a real table/list, discount rows announced; ETA text not color-only.
Deliver: mobile 390×844 + web 1440, all states. FRs: FR-8, FR-9, FR-2.
```

#### SC-011 — Coupon selection (sheet/modal)

```
[SCREEN PROMPT] SC-011 — Coupon selection · Customer · both (bottom sheet app / modal web over SC-010)
Context: List eligible coupons, apply one, bill reflects instantly.
Design: Manual code entry + "Apply" at top; coupon cards below: code (mono/caps), flat/percent
value in warm accent, min-cart condition, expiry; ineligible coupons grayed with the reason
("Add ₹120 more"); eligible cards show "APPLY".
States: loading / default / empty ("no coupons right now") / error (invalid/ineligible code
with explicit reason inline) / success (applied → sheet closes, chip lands on SC-010).
Interactions: sheet slide-up 250ms; apply gives instant optimistic bill update.
A11y: modal focus-trapped, ESC/scrim dismiss; reasons are text, announced on apply failure.
Deliver: mobile 390×844 sheet + web 1440 modal, all states. FRs: FR-9.
```

#### SC-012 — Payment

```
[SCREEN PROMPT] SC-012 — Payment · Customer · both
Context: Method selection + PCI-gateway handoff; failure must never lose the cart. Gateway
vendor undecided (tracked in §6) — design both redirect (web) and SDK-intent (app) handoff variants lightweight.
Design: Amount payable header; method list: UPI (intent apps + collect), cards (gateway-
tokenized, no raw card fields on GroFast surfaces), wallets, COD row **(CONDITIONAL — pending
BRS §13 sign-off; hidden above BR-5 cap or for risk-flagged first-timers — design shown +
hidden variants)**; "Pay ₹X" primary button.
States: default / processing (gateway pending + webhook wait — calm full-screen wait, no
dead-ends) / success → SC-013 / failure-timeout → retry or switch method, cart intact /
edge: stock reservation fails after payment → clean failure screen + auto-refund notice (BR-4).
A11y: methods = labelled radio group; processing state announces progress.
Deliver: mobile 390×844 + web 1440, all states incl. both handoff variants. FRs: FR-10, FR-11, FR-12.
```

#### SC-013 — Order confirmation

```
[SCREEN PROMPT] SC-013 — Order confirmation · Customer · both
Context: Celebrate placement (<3s post-gateway), restate the promise, hand off to tracking.
Design: Success motif (brief 250ms check animation); order ID; large promised-ETA countdown;
serving store name; collapsed item summary; payment method/status row; primary "Track order",
secondary "Continue shopping". Auto-forwards to SC-014 after a beat (~3s, cancellable).
States: success (primary) / edge: COD order → "Pay ₹X on delivery" callout card **(COD
conditional, BRS §13)**.
A11y: success announced; auto-forward can be paused/prevented; countdown is live text.
Deliver: mobile 390×844 + web 1440, success + COD variant. FRs: FR-12, FR-8, FR-28.
```

#### SC-014 — Live order tracking

```
[SCREEN PROMPT] SC-014 — Live order tracking · Customer · both — THE emotional centerpiece
Context: Real-time status + rider-on-map (≤5s refresh). Maps visuals provider-agnostic (§6).
Design: Top half = live map: store pin, rider marker (bike icon, smooth 5s interpolation),
destination pin, route line; ETA countdown chip vs promise. Bottom sheet = status stepper
(placed → packed → dispatched → delivered), rider card (name, masked-call button), order
summary link, help (phone/email), cancel (pre-dispatch only → confirm dialog → refund note).
States: loading / pre-dispatch (timeline only, map subdued) / dispatched (map live) /
delivered (→ SC-018 prompt) / cancelled (refund status) / error: map/socket degraded →
timeline-only fallback banner / edge: ETA breach → apology banner (order enters ops queue).
A11y: status changes announced live; map has full text-timeline equivalent.
Deliver: mobile 390×844 + web 1440, all 7 states. FRs: FR-13, FR-14, FR-28.
```

#### SC-015 — Substitution prompt (OOS after order)

```
[SCREEN PROMPT] SC-015 — Substitution prompt · Customer · both (blocking sheet/modal over any screen)
Context: Picker flagged an item OOS (from SC-045); customer decides substitute-or-refund in 60s.
Design: Blocking bottom sheet/modal: OOS item (thumb + name, struck); arrow to proposed
substitute (thumb, name, price delta chip "+₹6" / "−₹4"); prominent 60s countdown ring;
two equal buttons: "Accept substitute" / "Refund this item"; footnote: "No reply → this
item is refunded automatically."
States: default (countdown live) / timeout (auto-refund confirmation, FR-30) / success
(choice recorded → returns to SC-014) / error (retry within window).
A11y: countdown announced at intervals; both choices reachable in ≤1 action; focus trapped.
Deliver: mobile 390×844 + web 1440, all states. FRs: FR-30, FR-28.
```

#### SC-016 — Order history

```
[SCREEN PROMPT] SC-016 — Order history · Customer · both
Context: Past orders with one-tap reorder — the repeat-purchase engine.
Design: Scrollable order cards: date, store, item thumbnail row (max 4 + "+3"), total, status
chip (delivered/cancelled/refunded); "Reorder" button per card; tap card → SC-017.
States: loading (skeleton cards) / default / empty (first-order nudge with illustration +
"Start shopping" CTA) / error / edge: reorder with unavailable items → items added, toast
"2 items unavailable, flagged in cart" (FR-15 acceptance).
A11y: card = single link with structured label; status chips text + color.
Deliver: mobile 390×844 + web 1440, all states. FRs: FR-15.
```

#### SC-017 — Order detail (past/active order)

```
[SCREEN PROMPT] SC-017 — Order detail (customer) · Customer · both
Context: Full record of one order: items, bill, timeline, invoice, refund status, actions.
Design: Header: order ID + status chip; line items with per-line prices (substituted lines
marked); bill breakdown (same table as SC-010); status timeline (vertical stepper with
timestamps); action row: Reorder · Cancel (pre-dispatch only) · Download GST invoice (post-
delivery, FR-9/BR-10) · Rate (if delivered & unrated) · Help; delivery-proof reference.
States: loading / default / error / edges: refund in progress → refund tracker card;
cancelled → refund status; active order → "Track live" banner → SC-014.
A11y: timeline is a list with visible timestamps; invoice download labelled with format.
Deliver: mobile 390×844 + web 1440, all states. FRs: FR-14, FR-15, FR-9.
```

#### SC-018 — Rate order & delivery

```
[SCREEN PROMPT] SC-018 — Rate order & delivery · Customer · both
Context: Capture order + delivery ratings; low ratings route to ops exception queue (SC-030).
Design: Two star rows (Order quality / Delivery experience, 44px stars); when either ≤3 stars
→ mandatory reason picker chips slide in (missing item, late, damaged, rider behavior, other);
optional free-text comment; "Submit" primary, "Skip" ghost.
States: default / success ("Thanks!" beat → SC-005) / error (retry, input preserved) /
edge: ≤3 stars with no reason → submit blocked with inline prompt.
A11y: stars operable as labelled radio group; reason requirement announced.
Deliver: mobile 390×844 + web 1440, all states. FRs: FR-16, FR-28.
```

#### SC-019 — Profile & account

```
[SCREEN PROMPT] SC-019 — Profile & account · Customer · both
Context: Account hub: profile, addresses, orders, DPDP privacy, support, logout.
Design: Header: name + masked phone, edit; grouped list rows (24px icons): Orders → SC-016,
Addresses → SC-020, Notification prefs, Privacy (DPDP consent view, "Delete my data" request),
Support (phone + email only in V1), app version footer, Logout (destructive style, confirm).
States: default / loading / error / edge: data-deletion request → confirmation flow with
consequence copy + final confirm (NFR-6).
A11y: rows = real buttons/links; destructive actions confirmed and announced.
Deliver: mobile 390×844 + web 1440, all states. FRs: FR-1, FR-2, FR-15.
```

#### SC-020 — Address book (list + add/edit)

```
[SCREEN PROMPT] SC-020 — Address book · Customer · both
Context: Manage saved addresses with map-pin accuracy — feeds serviceability + ETA.
Design: List: address cards (label chip Home/Work/Other, full address, serviceable badge,
default marker, edit/delete); "Add address" primary. Editor: map with draggable pin + GPS
detect + search; fields: house/flat, floor, landmark, label picker (FR-2 acceptance);
"Save" sticky.
States: loading / default / empty ("Add your first address") / error / edge: pinned address
not serviceable → inline warning using the SC-004 pattern; selection returns to caller
(SC-010/SC-003) with the chosen address.
A11y: pin-drag has search alternative; labels are real form labels; delete confirmed.
Deliver: mobile 390×844 + web 1440 (list + editor), all states. FRs: FR-2, FR-3.
```

### Client B — Rider app, Android (SC-021 … SC-027)

> All rider screens: sunlight-readable high-contrast theme, ≥56px tap targets, one-handed thumb-zone layout, oversized type. Mobile 390×844 frames only.

#### SC-021 — Rider login

```
[SCREEN PROMPT] SC-021 — Rider login · Rider (Android) · mobile
Context: Phone-OTP login for ops-provisioned accounts — no self-serve signup in V1.
Design: Minimal: GroFast Rider lockup, phone input (+91), OTP entry (same pattern as SC-002
but oversized); onboarding/KYC status banner (pending / active / blocked); "Contact ops"
button when not yet activated.
States: default / loading / errors: unregistered number → "Contact ops" card with phone
number, wrong OTP / edge: KYC pending → read-only lock screen showing status only.
A11y: extra-large inputs; status not color-only (icon + text).
Deliver: mobile 390×844, all states. FRs: FR-1, FR-18.
```

#### SC-022 — Rider home (online/offline)

```
[SCREEN PROMPT] SC-022 — Rider home · Rider (Android) · mobile
Context: Shift hub: availability toggle, today's summary, active-job resume. Max 1 active
order (BR-7) — one job card, never a list.
Design: Dominant online/offline toggle (huge, thumb-zone, green when online); today strip:
deliveries count + earnings snapshot; active job card (order ID, stage, "Resume" CTA) when
live; GPS/network health indicators in header; menu → Earnings (SC-027).
States: offline (default, muted) / online-waiting ("Waiting for orders…" pulse) / active-job /
errors: GPS off → blocking full-screen prompt with settings CTA; no network → offline banner.
A11y: toggle state announced; all targets ≥56px; readable in direct sun (7:1).
Deliver: mobile 390×844, all states. FRs: FR-20, FR-18.
```

#### SC-023 — Job offer

```
[SCREEN PROMPT] SC-023 — Job offer · Rider (Android) · mobile (full-screen takeover)
Context: Dispatch offer with a 30s accept window; decisions happen on a moving bike — zero clutter.
Design: Full-screen takeover: 30s countdown ring at top; pickup store + distance; drop area +
distance; estimated payout (largest number on screen); COD badge if applicable **(COD
conditional, BRS §13)**; giant "ACCEPT" (green, bottom thumb zone) + smaller "Decline".
States: default (countdown) / timeout or decline → returns to SC-022 (offer cascades) /
accepted → SC-024 / edges: offer withdrawn mid-countdown (ops reassigned) → dismissal notice;
ops force-assign variant → non-declinable, reason shown, single "OK, GOT IT" button.
A11y: countdown announced; accept reachable one-handed; strong haptic/audio cue on arrival.
Deliver: mobile 390×844, all states incl. force-assign variant. FRs: FR-18, FR-28.
```

#### SC-024 — Pickup flow

```
[SCREEN PROMPT] SC-024 — Pickup flow · Rider (Android) · mobile
Context: Guide rider to store and verify pickup via OTP or bag-label scan (FR-19).
Design: Stage-based single card: store name/address + big "NAVIGATE" (external maps handoff);
order ID + item/bag count; on arrival → "I'VE ARRIVED"; pickup verification: OTP entry
(oversized) or scan button; store contact call; "Report issue — order not ready".
States: en-route / arrived / verifying / error (wrong OTP / scan mismatch, retry) / edge:
order not ready → wait state with elapsed timer, ops auto-notified banner.
A11y: one primary action per stage, always in thumb zone; scan has OTP fallback.
Deliver: mobile 390×844, all stage states. FRs: FR-19.
```

#### SC-025 — Delivery flow (drop + proof)

```
[SCREEN PROMPT] SC-025 — Delivery flow · Rider (Android) · mobile
Context: Guide to customer and enforce mandatory delivery proof (BR-8) to complete the order.
Design: Customer address + landmark/floor prominent; delivery instructions card; "NAVIGATE"
+ masked-call button; on arrival → proof capture: customer OTP entry OR photo capture (two
clear paths); COD amount banner in warm accent if COD **(COD conditional, BRS §13)**;
"MARK DELIVERED" enabled only after proof; "Customer unreachable" escalation link.
States: en-route / arrived / proof-capture / success → SC-026 (COD) or SC-022 / error (proof
failed, retry) / edge: customer unreachable → timed retry state + ops escalation notice.
A11y: camera flow has OTP alternative; completion confirmation is explicit, not swipe-only.
Deliver: mobile 390×844, all states. FRs: FR-19, FR-13, FR-28.
```

#### SC-026 — COD collection ⚠️ CONDITIONAL (pending BRS §13 COD sign-off)

```
[SCREEN PROMPT] SC-026 — COD collection · Rider (Android) · mobile — CONDITIONAL: design now,
build gated on BRS §13 COD decision.
Context: Cash must be confirmed collected before the order can complete (BR-8).
Design: Amount to collect in the largest type in the app ("₹487"); order ID beneath; single
giant "CASH COLLECTED" confirm (deliberate press — hold-to-confirm acceptable); secondary
"Short change / dispute" → flags ops.
States: default / success (order completes → SC-022) / error / edge: customer refuses to pay
→ ops escalation state, order NOT completed, guidance copy.
A11y: amount readable in sunlight; confirm action irreversible-styled and announced.
Deliver: mobile 390×844, all states. FRs: FR-11, FR-19.
```

#### SC-027 — Earnings & delivery history

```
[SCREEN PROMPT] SC-027 — Earnings & delivery history · Rider (Android) · mobile
Context: Day's deliveries + per-order payouts; display-only (payout engine deferred FU-6).
Design: Date picker header (default today); daily total hero number; per-order rows: time,
distance, payout; COD-collected total card as reconciliation aid **(COD conditional, BRS §13)**;
row tap → simple detail.
States: loading / default / empty ("No deliveries yet today") / error (retry).
A11y: tabular numerals; rows ≥56px; totals labelled not just styled.
Deliver: mobile 390×844, all states. FRs: FR-20, FR-11.
```

### Client C — Admin + ops dashboard, web (SC-028 … SC-045, incl. picker)

> All admin screens: 1440 web frames only. Dense, keyboard-friendly, left-rail module nav (per RBAC), global order/phone search in top bar, manage-by-exception. Picker screens (SC-044/045) are touch-first for store tablets but delivered at 1440 responsive.

#### SC-028 — Admin login (RBAC)

```
[SCREEN PROMPT] SC-028 — Admin login · Admin (all staff roles) · web 1440
Context: Staff auth resolving role-scoped module access (FR-29); denied attempts audit-logged.
Design: Centered card: email/username + password (SSO button placeholder), "Login"; on
success route to role home (ops → SC-029, picker → SC-044, else first permitted module).
Include the access-denied interstitial: "Your role doesn't include this module" + note that
the attempt was logged, with "Go to my home" CTA.
States: default / loading / errors: bad credentials, account locked / edge: role-denied
interstitial (separate frame).
A11y: labelled fields, error summary announced, full keyboard flow, visible focus rings.
Deliver: web 1440: login states + denied interstitial. FRs: FR-29.
```

#### SC-029 — Live ops dashboard

```
[SCREEN PROMPT] SC-029 — Live ops dashboard · Ops (Neha) · web 1440
Context: Real-time city view — the ops home; must reflect state within 30s (Objective 6).
Design: Left rail (Live Ops active); top bar with global order/phone search; KPI counter row
(active orders by stage, online riders, store load, SLA hit-rate today — each clickable →
filtered SC-031); center = city map: order/rider markers + zone polygons (provider-agnostic);
right column = alert strip (feed-staleness flags, ETA breaches) → deep-links to SC-030/037.
States: loading / default / degraded (stale data >30s → prominent amber banner with last-
updated timestamp) / error.
A11y: counters keyboard-focusable with drill-down; map has a table equivalent toggle.
Deliver: web 1440, all states. FRs: FR-25, FR-13, FR-27.
```

#### SC-030 — Exception queue

```
[SCREEN PROMPT] SC-030 — Exception queue · Ops · web 1440
Context: Manage-by-exception worklist; ETA-breach orders appear ≤30s after breach (FR-25).
Keyboard-first triage is the whole point.
Design: Filter rail (type: delayed/stuck/failed-payment/low-rated; zone/store); dense table:
exception type chip, order ID, age (live), promised vs actual ETA, zone/store; per-row
one-click actions: Reassign rider · Call customer · Cancel-refund; resolve/dismiss with
mandatory reason; row expand → mini order context; row click → SC-032.
States: loading / default / empty ("All clear ✓" — the goal state, celebrate it quietly) /
error / edge: action fails → row flagged red with retry.
A11y: full keyboard row navigation + action shortcuts (j/k/enter documented); action results announced.
Deliver: web 1440, all states. FRs: FR-25, FR-16, FR-14.
```

#### SC-031 — Order search & list

```
[SCREEN PROMPT] SC-031 — Order search & list · Ops, finance (read), read-only · web 1440
Context: Find any order by ID, phone (FR-26 acceptance), status, store, zone, date.
Design: Search bar (order ID / phone) prominent; left filter rail (status, store, zone, date
range); dense result table: order ID, status chip, store, rider, amount, ETA promised vs
actual (breach highlighted); pagination; "Export page to CSV"; row click → SC-032.
States: loading (skeleton rows) / default / empty ("No orders match" + clear-filters CTA) / error.
A11y: sortable headers announced; filters keyboard-operable; row targets full-width.
Deliver: web 1440, all states. FRs: FR-26.
```

#### SC-032 — Order detail (admin)

```
[SCREEN PROMPT] SC-032 — Order detail (admin) · Ops, finance · web 1440
Context: The canonical "what happened on this order" surface — full timeline + privileged actions.
Design: Header: order ID, status, quick actions (Modify status · Refund — auto below ₹2,000
per BR-4 · Cancel · Reassign/force-assign rider · Resend notification · Add note). Two-column
body: LEFT = line items (substitution log inline), bill, payment ledger (attempts, webhooks,
refunds); RIGHT = full status timeline (state, timestamp, actor), rider assignment history,
delivery proof (photo/OTP record), customer rating. Include the audit-reason modal: every
mutation requires a reason before commit (NFR-10) — design it once here, reuse on SC-035/036.
States: loading / default / error / edge: mutation → reason modal → success/failure toast.
A11y: timeline as list; modal focus-trapped; destructive actions double-confirmed.
Deliver: web 1440: default + reason modal + post-action states. FRs: FR-26, FR-14, FR-18, FR-12.
```

#### SC-033 — Catalog: product & category list

```
[SCREEN PROMPT] SC-033 — Catalog list · Catalog manager · web 1440
Context: Master catalog management; storefront reflects saves ≤60s (FR-21).
Design: Left panel = category tree (drag-reorder, add/rename); main = product table: image
thumb, SKU, name, category, MRP/price, per-store availability count, status chip; toolbar:
"Create product" → SC-034, "Bulk CSV upload" (modal: dropzone → progress → result summary
with downloadable row-level rejection report), archive; search + filters.
States: loading / default / empty ("Add your first product" / empty category) / error /
edge: CSV partial failure → result modal with N ok / M rejected + report download.
A11y: tree keyboard-navigable; upload progress announced; table sortable.
Deliver: web 1440, all states + CSV modal sequence. FRs: FR-21.
```

#### SC-034 — Catalog: product editor

```
[SCREEN PROMPT] SC-034 — Product editor · Catalog manager · web 1440
Context: Create/edit one SKU: content, images, category, per-store price & availability.
Design: Two-column form: LEFT = name, description, pack size/weight, category assignment,
image upload gallery (drag-reorder, cover marker); RIGHT = pricing card: MRP, selling price,
GST-inclusive flag (BR-10), and per-store price/availability override matrix (compact table);
sticky footer: Save / Publish / Archive.
States: default / saving / validation error (inline per field + summary) / success (toast) /
edge: selling price > MRP → save blocked with inline reason.
A11y: every field labelled; error summary linked to fields; image alt-text field included.
Deliver: web 1440, all states. FRs: FR-21, FR-6.
```

#### SC-035 — Inventory: stock & adjustments

```
[SCREEN PROMPT] SC-035 — Inventory: stock & adjustments · Ops / store manager · web 1440
Context: Per-dark-store stock truth; every mutation writes an immutable audit record (FR-22);
storefront reflects ≤60s.
Design: Store selector top-left; tabs: Stock / GRN (→ SC-036) / Adjustments; SKU stock table:
on-hand, reserved, available, low-stock threshold (inline-editable), status; low-stock alert
list pinned top; adjustment side-drawer: qty delta ± and MANDATORY reason field (reuses the
SC-032 audit-reason pattern); cycle-count mode toggle; per-SKU audit-trail drawer (who/when/why).
States: loading / default / empty / error / edge: adjustment without reason → blocked inline.
A11y: threshold edits keyboard-accessible; drawer focus-managed; counts tabular numerals.
Deliver: web 1440: table + adjustment drawer + audit drawer + cycle-count mode. FRs: FR-22.
```

#### SC-036 — Inventory: GRN (goods receiving)

```
[SCREEN PROMPT] SC-036 — Inventory: GRN · Ops / store manager · web 1440
Context: Manual goods-receipt entry (no procurement pipeline in V1, FU-7 deferred).
Design: GRN form: store selector, supplier ref, SKU rows (searchable SKU picker, qty,
batch/expiry where relevant) with add-row; footer: Save draft / "Commit" (increments stock,
audit-logged); below = GRN history table (date, supplier ref, lines, actor) with view/print.
States: default / saving / success ("GRN-0042 committed — stock updated") / validation error /
edge: duplicate supplier-ref → warning banner with override-with-reason.
A11y: row grid fully keyboard-enterable (tab/enter to add rows); commit confirmed.
Deliver: web 1440: form + history + all states. FRs: FR-22.
```

#### SC-037 — Partner stores: list & feed status

```
[SCREEN PROMPT] SC-037 — Partner stores: list & feed status · Partner manager, ops · web 1440
Context: Partner health monitor — feed freshness SLA is 15 min (BR-6, Objective 5).
Design: Partner table: name, zone, feed type (API/CSV chip), LAST FEED AGE (live, amber >10m,
red + staleness flag >15m), fill-rate score (mini bar), listing state chip (normal / degraded
"delivery may take longer" / delisted); row actions: Force feed re-pull · Toggle degraded ·
Delist (confirm + reason); row click → SC-038; summary tiles top (stale count, avg fill rate).
States: loading / default / empty ("No partners onboarded") / error / edge: stale feed →
highlighted row + auto-degraded listing state shown.
A11y: freshness conveyed by text + icon, not color alone; actions keyboard-reachable.
Deliver: web 1440, all states. FRs: FR-23.
```

#### SC-038 — Partner store: detail & onboarding

```
[SCREEN PROMPT] SC-038 — Partner store: detail & onboarding · Partner manager · web 1440
Context: Onboard a partner store: profile, feed config, SKU mapping with rejection handling (FR-23).
Design: Tabbed detail: (1) Profile — name, address, zone mapping, contact, GSTIN,
commission/settlement fields; (2) Feed config — API creds or CSV schedule, "Run test
ingestion" with live result panel; (3) SKU mapping — table of partner SKUs vs master catalog
(mapped / unmapped / merge candidate), resolve controls (map / merge / reject), downloadable
rejection report; (4) Ingestion history. Header: Activate / Suspend with confirm.
States: default / saving / ingesting (progress) / error (feed auth/parse failure with raw
error detail) / edge: rejected rows → count badge + report download.
A11y: tabs keyboard-navigable; mapping resolution operable without drag.
Deliver: web 1440: all 4 tabs + states. FRs: FR-23.
```

#### SC-039 — Zone editor

```
[SCREEN PROMPT] SC-039 — Zone editor · Ops · web 1440
Context: Draw/edit serviceability polygons + store mapping; publish hits new sessions ≤60s.
Delhi NCR launch polygons drawn here pre-launch. Map visuals provider-agnostic (§6).
Design: Full-height map with polygon draw/edit tools (vertex handles, snap); left panel:
zone list (name, stores mapped, status chip draft/published), store-to-zone mapping panel;
overlap warnings rendered on-map + in-panel; actions: Publish, Throttle zone (order
throttling, risk #2) with state indicator.
States: loading / default / draft-unpublished (visually distinct dashed polygons) / error /
edge: polygon overlap or store-less zone → Publish blocked with explicit warning list.
A11y: all polygon operations have panel-based (non-mouse) equivalents for edit/delete.
Deliver: web 1440: map + panels, all states. FRs: FR-24, FR-3.
```

#### SC-040 — ETA configuration

```
[SCREEN PROMPT] SC-040 — ETA configuration · Ops · web 1440
Context: Tune ETA params per zone/store so promises match capacity; conservative at launch,
recalibrated weekly (risk #4).
Design: Zone/store selector; param form: base prep time, buffer, load-widening curve (small
editable curve/graph), rider-availability factor; RIGHT = live preview of resulting promise
band ("10–15 min") + promise-vs-actual chart (last 7 days) as the recalibration aid;
footer: Preview / Publish.
States: default / saving / error / edge: params produce ETA below floor → Publish blocked
with inline reason.
A11y: curve editor has numeric input fallback; chart has data-table toggle.
Deliver: web 1440, all states. FRs: FR-24, FR-8.
```

#### SC-041 — Coupon management

```
[SCREEN PROMPT] SC-041 — Coupon management · Ops / marketing · web 1440
Context: Create/manage flat & percent coupons; feeds customer SC-011, defines invalid-coupon reasons.
Design: Coupon table: code (mono/caps), type chip (flat/percent), value, min cart, validity
window, usage caps, redemptions count, status toggle (active/inactive); "Create coupon" →
side-drawer editor form (code, type, value, min-cart, validity dates, per-user/total caps).
States: loading / default / empty ("Create your first coupon") / error / edge: overlapping/
duplicate code → save blocked with reason.
A11y: toggle states announced; drawer focus-trapped; dates keyboard-enterable.
Deliver: web 1440: table + editor drawer, all states. FRs: FR-9.
```

#### SC-042 — Analytics & reports

```
[SCREEN PROMPT] SC-042 — Analytics & reports · All stakeholders (read per role) · web 1440
Context: KPI dashboards + CSV-exportable reports; numbers must reconcile with the order
ledger (FR-27 acceptance).
Design: Date-range picker + filter bar (zone, store); KPI tile grid: GMV, orders, AOV, SLA
hit rate, fill rate, OOS-after-order, payment success, rider utilization (each: value, trend
sparkline, delta chip); zone heatmap; sales report table; promise-vs-actual view (shared
with SC-040); per-widget "Export CSV"; daily-digest config card (8am email/Slack).
States: loading (tile skeletons) / default / empty ("No data in this range") / error / edge:
KPI drill-down → filtered SC-031.
A11y: every chart has a data-table alternative; deltas text + arrow, not color-only.
Deliver: web 1440, all states. FRs: FR-27.
```

#### SC-043 — User & role management

```
[SCREEN PROMPT] SC-043 — User & role management · Admin owner · web 1440
Context: Staff accounts + role assignment (ops, catalog, finance, partner, picker, read-only);
denied-access attempts audit-logged (FR-29).
Design: Tabs: (1) Users — table: name, email, role chips, status, last login; actions:
Invite/create (drawer: email + role multiselect), assign/revoke roles, deactivate (confirm);
(2) Role matrix — read-only role × module permission grid; (3) Access audit log — table incl.
denied attempts (who, module, when), filterable.
States: loading / default / empty / error / edge: demoting the last admin-owner → blocked
with explicit reason.
A11y: matrix grid navigable by keyboard with row/column headers announced.
Deliver: web 1440: all 3 tabs + states. FRs: FR-29.
```

#### SC-044 — Picker: pick-list queue

```
[SCREEN PROMPT] SC-044 — Picker: pick-list queue · Picker (Amit) · web 1440 (touch-first for
store tablet — device decision pending (tracked in §6), design tablet-first responsive)
Context: Store-scoped queue of orders awaiting picking; picker role lands here from SC-028.
Design: Large order cards (min 72px touch rows): order ID, item count, age, promised-ETA
countdown; urgency treatment: order nearing ETA breach → red/amber urgent card pinned to top;
"my active pick" resume banner pinned above the queue; giant "ACCEPT NEXT ORDER" primary →
SC-045; auto-refresh with subtle last-updated indicator.
States: loading / default / empty ("No orders — you're all caught up") / error / edge:
urgent-breach highlight variant.
A11y: extra-large targets; countdowns text-based; refresh does not steal focus.
Deliver: web 1440 responsive (show 1024 tablet behavior note), all states. FRs: FR-17.
```

#### SC-045 — Picker: pick & pack flow

```
[SCREEN PROMPT] SC-045 — Picker: pick & pack flow · Picker · web 1440 (touch-first, store tablet)
Context: Item-by-item picking sorted by store layout, barcode verification, OOS→substitution
flow (fires customer SC-015), pack completion triggers rider dispatch (SC-023).
Design: Progress header ("6 of 12 picked" + ETA countdown); pick list sorted by store layout:
per-item card — image, name, qty, shelf location (prominent), barcode-scan status icon; item
actions: Scan-verify · Mark picked · "Flag OOS" → substitute-picker sheet (suggested subs +
search) → sends to customer, item enters 60s "waiting on customer" state with countdown ring
(mirrors SC-015); footer: "COMPLETE PACK" (enabled when all lines resolved; timestamp recorded
per FR-17) + "Print bag label".
States: in-progress / scan-error (wrong barcode — big red flash + retry) / waiting-on-customer /
packed (success — dispatch fired) / error / edge: substitution timeout → line auto-refunded
badge, pick continues uninterrupted.
A11y: scanner has manual-entry fallback; state changes announced; targets ≥56px.
Deliver: web 1440 responsive, all states incl. substitution sequence. FRs: FR-17, FR-30, FR-12, FR-18.
```

## 4. Where to save outputs

Once designers / AI design tool produce frames, save into `../designs/` with this convention:

```
designs/
  SC-001/
    web/
    mobile/
  SC-002/
  ...
```

Then reference them in `04a_design.md`.

## 5. Prompt-tuning notes
_Patterns we discover while iterating on prompts. Update freely._

- Always name the frame per state (`SC-014_dispatched`, `SC-014_error-map-degraded`) — AI tools otherwise merge states into one frame.
- Repeating "no spinners on the shopping path — skeletons" in the primer (not per prompt) was enough; per-prompt repetition bloated outputs.
- For countdown UIs (SC-015, SC-023, SC-045) explicitly say "countdown ring" — "timer" alone produced digital-clock treatments.
- Rider prompts: lead with the sunlight/one-handed constraint before layout, or tools default to standard-density consumer UI.
- Admin prompts: say "dense data table" explicitly; "list" produces card feeds that waste 1440px width.

## 6. Open items
- [ ] **Brand token ratification** — palette in §1 (fresh green #0FA958-class primary, near-black text, warm offer accent) is a PROPOSAL; designer to ratify exact hex values, gray ramp, and semantic tokens before `/design-freeze`, then backfill §1.
- [ ] **Maps provider visual style** — provider (BRS §10) unselected; SC-003/014/020/025/029/039 map components designed provider-agnostic (generic tiles, own pin/marker/polygon styles). Re-skin pass once provider chosen.
- [ ] **Illustration style** — empty/dead-end states (SC-004, SC-009 empty, SC-016 empty, SC-030 "all clear") need a ratified illustration direction (proposal: light line + green/amber spot color); placeholder OK for first frames.
- [ ] **COD conditional (BRS §13)** — SC-026 and COD elements in SC-012/013/023/025/027 are designed now but build-gated on the COD sign-off (due before `/tasks-freeze`).
- [ ] **Payment gateway handoff** — SC-012 designs both redirect (web) and SDK-intent (app) variants lightweight until the vendor (BRS §13) is selected.
- [ ] **Picker device decision** — SC-044/045 designed tablet-first responsive; confirm store tablet vs desktop terminal to lock touch-target sizing.

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
- **Role:** Designer
- **Timestamp:** 2026-07-10T08:06:45Z
- **Status:** ✅ Frozen
- **Notes:** Design tokens are proposals; ratification lands in 04a. Provider-dependent visuals kept agnostic per §6.
