---
schema_version: "0.4"
---

# 04a — Design (Design Thread)

> **Phase 4a.** Final UI designs land here. Designers (and/or Figma AI) consume `03a_designer_prompts.md`, iterate, and ship polished Figma frames. This file is the **index** of those frames plus the FE-implementation spec.
>
> **Project:** GroFast · **Reads:** `03a_designer_prompts.md` · **Writes:** this file + `../designs/` folder

---

## 1. Design source of truth

- **Figma file URL:** spec-based — no Figma (pod decision 2026-07-10)
- **Last updated:** 2026-07-10
- **Figma sync owner:** n/a — this document IS the design source of truth; the build is spec-driven

> **Pod decision (2026-07-10):** GroFast v1 has no human designer and no Figma file. Each screen below carries a detailed frontend spec instead of frame links. The Global Design System Primer proposed in `03a_designer_prompts.md` §1 is hereby **RATIFIED as final** at this phase (per the same pod decision) — see §3/§4 for the sealed component inventory and tokens. `03a` §6 item "Brand token ratification" is thereby closed.
>
> **COD decision:** COD is **CONFIRMED for v1** (with BR-5 caps). All COD screens/elements below (SC-012 COD row, SC-013 COD callout, SC-023 COD badge, SC-025 COD banner, SC-026, SC-027 COD totals) are **unconditional** builds. BR-5 caps and risk-flag hiding are runtime business rules, not build gates.

### 1a. Ratified design system (FINAL — consumed by every spec below)

**Color tokens**

| Token | Value | Use |
|---|---|---|
| `color.primary` | `#0FA958` | CTAs, active states, success, ETA badge |
| `color.primary.pressed` | `#0C8746` | Pressed/active primary |
| `color.primary.tint` | `#E7F7EF` | Selected backgrounds, success surfaces |
| `color.text` | `#111417` | Body/headings on white/near-white |
| `color.text.secondary` | `#5A6169` | Secondary/meta text |
| `color.accent.warm` | `#FF8A00` | Offers, discounts, coupons, COD amount banner ONLY — never errors |
| `color.accent.warm.tint` | `#FFF3E4` | Offer chip/card backgrounds |
| `color.error` | `#DC2626` | Errors, destructive |
| `color.warning` | `#F59E0B` | Warnings, ETA-widened, feed-aging |
| `color.info` | `#2563EB` | Informational |
| `color.gray.1–8` | `#F7F8F9 · #EEF0F2 · #E1E4E8 · #C9CED4 · #A6ADB4 · #7A828B · #545C64 · #2A3138` | 8-step neutral ramp (surfaces → borders → muted text) |
| `color.surface` | `#FFFFFF` | Cards, sheets |
| `color.scrim` | `#111417 @ 40%` | Modal/sheet overlay |

**Typography:** Inter (geometric-humanist sans). Scale `12 / 14 (body) / 16 / 20 / 24 / 32`; weights 400/500/600/700. **Tabular numerals for all prices, timers, ETAs, counts.** Dynamic type supported in apps. Rider app: body min 16, key numbers 32+, ≥7:1 contrast.

**INR formatting rule (global):** `₹` prefix, Indian digit grouping (`₹1,234.50`, `₹1,23,456`), two decimals only when paise ≠ 0. Discounts render as `−₹40`; struck MRP uses `color.text.secondary` + strikethrough + selling price in `color.text` at a larger step; discount tags in `color.accent.warm`.

**Spacing & shape:** 4/8pt grid. Radii: **8px** inputs/cards, **12px** sheets/modals, **pill (999px)** chips/steppers/badges. Elevation: flat card (1px `gray.3` border) · raised (soft shadow — sheets, floating bars) · overlay (scrim 40%).

**Iconography:** 24px outlined, 2px stroke, rounded caps; filled variant = active tab state.

**Motion (global durations):** transitions 150–250ms ease-out; ADD→stepper morph 150ms; sheet slide-up 250ms; row-remove collapse 200ms; success check beat 250ms; toast auto-dismiss 3s (error toasts 5s, always with a reason). Optimistic UI on cart/stock ops (instant local update, reconcile toast on server reject). **Skeletons, never spinners, on the shopping path.** Sub-100ms perceived response on taps.

**Breakpoints:** customer web — mobile <768 / tablet 768–1119 / desktop ≥1120 (specs written at 1440); customer + rider apps — 390×844 base, responsive to device; admin — desktop-first 1440, min-supported 1280; picker surface — tablet-first 1024 landscape.

**Accessibility (global):** WCAG 2.1 AA on web (4.5:1 body contrast, visible focus rings, full keyboard nav, labelled forms, announced errors via live regions). Apps: dynamic type, 44×44pt min tap targets. Rider app: ≥56px targets, one-handed thumb-zone layout, sunlight-readable ≥7:1. Admin: dense, keyboard-first, sortable-table headers announced.

## 2. Per-screen index

> One section per `SC-XXX`. **Per pod decision 2026-07-10 the per-screen schema is adapted for a spec-based record:** each entry pins down design source, the FE spec (layout, components, platform variants, states, interactions with durations, data + formatting, accessibility), and the Interactive-elements table. The "Test case to generate" column is intentionally `—` everywhere; `/tc-augment` fills it with `TC-VIS-XXX` / `TC-E2E-XXX` after `/design-freeze`. `data-testid` hints are binding for the build.

---
### Client A — Customer (SC-001 … SC-020) — app 390×844 + responsive web

#### SC-001 — Login (phone entry)

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both (customer app + web)
- **FE spec:**
  - **Layout:** app — top third: logo + brand promise strip ("Groceries in minutes"); center: phone input with fixed non-editable `+91` prefix; below: DPDP/T&C consent copy (real text, links inline); primary "Send OTP" button pinned above keyboard. Web ≥1120: centered 400px card on `primary.tint` background + "Browse as guest" ghost link (login forced at checkout).
  - **Components:** primary button (44px), form input w/ inline validation, ghost link.
  - **Data & formatting:** 10-digit Indian mobile, numeric keypad, auto-format `98765 43210`; consent copy with tappable T&C/Privacy links.
  - **States:** default · loading (button spinner + "Sending OTP…", input locked) · error — invalid number (inline under input), SMS send failure (error toast + retry), rate-limited (inline cooldown copy with countdown). Edge: valid refresh token → skip straight to SC-003.
  - **Interactions:** button enables only on 10 valid digits; submit → loading ≤ send; errors announced inline; no full-screen blocking.
  - **Accessibility:** labelled input (`tel` semantics), numeric keypad, error text tied via `aria-describedby`; consent is selectable text, not an image.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | input | `data-testid="login-phone-input"` | Accepts 10 digits, +91 fixed, invalid → inline error | — |
  | IE-2 | button | `data-testid="login-send-otp"` | Disabled until valid; tap → loading → SC-002 | — |
  | IE-3 | link | `data-testid="login-tnc-link"` | Opens T&C/Privacy in webview/new tab | — |
  | IE-4 | link | `data-testid="login-guest-browse"` | Web only: continue without login → SC-003 | — |

#### SC-002 — OTP verification

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** masked phone (`+91 98765 4XXXX`) + "Edit" link at top; 6-box OTP input (auto-read on Android, auto-advance per digit, paste-fill); 30s resend text countdown → becomes "Resend" link; subtle attempt counter. Web: same in centered card.
  - **Components:** OTP box group (single logical input), text countdown, ghost link.
  - **States:** default · loading ("Verifying…") · error — wrong OTP (boxes shake 150ms + red border + inline reason), expired OTP, ≥2 failed attempts → resend pushed prominently · success (250ms green check beat → route). Edge: returning mid-flow user resumes the interrupted flow, not Home.
  - **Interactions:** auto-submit on 6th digit; resend disabled during 30s countdown; edit → back to SC-001 with number prefilled.
  - **Accessibility:** the 6 boxes expose as ONE labelled input to screen readers; single `aria-live` error region; countdown readable as text.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | input | `data-testid="otp-input"` | 6 digits, auto-advance/auto-read, auto-submit on complete | — |
  | IE-2 | link | `data-testid="otp-edit-phone"` | Back to SC-001, number prefilled | — |
  | IE-3 | link | `data-testid="otp-resend"` | Disabled 30s, then resends + restarts countdown | — |

#### SC-003 — Location & serviceability gate

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** full-height map (provider-agnostic tiles, own pin styles) with centered draggable pin; bottom detected-address card: address line, resolved zone/store, ETA-band pill (`"10–15 min"`, `primary`), "Confirm location" primary button. Saved-address list + search-address field in a 250ms bottom sheet. Web: browser geolocation prompt + pincode fallback field; map card centered, max-width 720px.
  - **Components:** map + pin, bottom sheet, pill chip (ETA band), primary button, search input, address card list.
  - **Data & formatting:** reverse-geocoded address line; zone + serving store name; ETA band from FR-24 config.
  - **States:** loading (locating — pulse animation on pin) · default · permission-denied → manual search/pincode fallback (no dead-end) · error (geocode failure → retry) · edge: outside all zones → route to SC-004.
  - **Interactions:** pin drag debounce 300ms then re-geocode; confirm persists address → SC-005; nothing behind this gate renders until a serviceable location resolves.
  - **Accessibility:** manual search fully keyboard-usable; pin-drag has full address-search equivalent; ETA band is text, not color-only.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | gesture | `data-testid="location-map-pin"` | Drag → debounced re-geocode → card updates | — |
  | IE-2 | button | `data-testid="location-confirm"` | Persist address → SC-005 (or SC-004 if unserviceable) | — |
  | IE-3 | input | `data-testid="location-search"` | Address/pincode search with suggestions | — |
  | IE-4 | button | `data-testid="location-use-gps"` | Request GPS; denied → fallback state | — |
  | IE-5 | list | `data-testid="location-saved-list"` | Pick saved address → serviceability re-check | — |

#### SC-004 — Not serviceable

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** friendly illustration (ratified direction: light line + green/amber spot color) + heading "We're not in your area yet"; entered location shown; notify-me capture (phone prefilled if logged in, email optional); secondary "Change location" → SC-003. **No nav into catalog from here.**
  - **Components:** illustration slot, form input, primary + secondary buttons.
  - **States:** default · success (notify-me saved — input replaced by `primary.tint` check confirmation) · error (save failed → error toast + retry, input preserved).
  - **Interactions:** submit → optimistic success state; success announced.
  - **Accessibility:** single clear H1; form labelled; success state announced via live region.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | input | `data-testid="notify-me-contact"` | Phone/email capture, validated | — |
  | IE-2 | button | `data-testid="notify-me-submit"` | Save → success check state | — |
  | IE-3 | button | `data-testid="change-location"` | → SC-003 | — |

#### SC-005 — Home / storefront

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** sticky header — delivery address (tap → address-switcher sheet) + green ETA badge (`"12 min"`); search bar; promo banner carousel (`accent.warm` family, auto-advance 5s, pausable); category tile grid (2×N app; mega-menu on web ≥1120); "Order again" horizontal product-card strip; active-order tracker chip docked above tab bar when an order is live; floating cart bar once cart non-empty. Bottom tab bar (app): Home · Categories · Search · Cart · Account.
  - **Components:** ETA badge pill, search bar, banner carousel, category tiles, product cards, floating cart bar, tracker chip, skeleton grid.
  - **Data & formatting:** only in-stock items for the serving store (BR-1 — no ghost inventory); prices per INR rule; ETA badge from FR-24.
  - **States:** loading (full skeleton grid, no spinner) · default · error (retry) · edges: heavy load → widened ETA badge + amber banner; partner-store zone → "delivery may take longer" flag (BR-6).
  - **Interactions:** address tap → switcher sheet (changing address re-runs serviceability; cross-store cart cleared with warning per BR-1); tracker chip → SC-014; all taps sub-100ms perceived.
  - **Accessibility:** carousel pausable + swipe-alternative dots as buttons; ETA badge is readable text; category tiles labelled.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="home-address-switcher"` | Opens address sheet; change re-runs serviceability | — |
  | IE-2 | input | `data-testid="home-search-bar"` | Focus → SC-007 | — |
  | IE-3 | carousel | `data-testid="home-promo-carousel"` | Auto 5s, pausable; banner tap → deep link | — |
  | IE-4 | tile | `data-testid="home-category-tile"` | → SC-006 for that category | — |
  | IE-5 | chip | `data-testid="home-active-order-chip"` | → SC-014 | — |
  | IE-6 | bar | `data-testid="floating-cart-bar"` | Shows count + total; tap → SC-009 | — |

#### SC-006 — Category listing (PLP)

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** header: category name + scrollable subcategory chip row; product card grid (2-col app / 4–5-col web): image, name, pack size, struck MRP vs selling price, warm discount tag; per-card "ADD" pill that morphs (150ms) into `− qty +` stepper; sort/filter chips; floating cart bar; infinite scroll with cache.
  - **Components:** pill chips, product card, qty stepper, floating cart bar, skeleton grid, toasts.
  - **Data & formatting:** INR rule; discount tag `−12%` or `−₹15` in `accent.warm`; pack size `500 g` / `1 L`.
  - **States:** loading (skeleton grid) · default · empty ("Nothing here at this store" + back CTA) · error (retry) · edge: stock-cap hit → stepper `+` disabled + reason toast (FR-7).
  - **Interactions:** optimistic add/step (instant stepper update; server reject → reconcile toast with reason); infinite scroll prefetch at 80% scroll.
  - **Accessibility:** stepper buttons labelled "{product}, quantity {n}"; discount conveyed as text, not color-only.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | chip | `data-testid="plp-subcategory-chip"` | Switch subcategory, grid reloads w/ skeleton | — |
  | IE-2 | button | `data-testid="plp-add-{sku}"` | ADD → morphs to stepper, optimistic cart add | — |
  | IE-3 | stepper | `data-testid="plp-stepper-{sku}"` | −/+ qty optimistic; cap hit → + disabled + toast | — |
  | IE-4 | card | `data-testid="plp-product-card-{sku}"` | → SC-008 | — |
  | IE-5 | chip | `data-testid="plp-sort-filter"` | Opens sort/filter options | — |

#### SC-007 — Search

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** focused search field with voice icon (app); pre-query state: recent-search chips + trending list; results: product cards (identical to SC-006) with add/stepper; "Did you mean …" strip above results when the query was auto-corrected.
  - **Components:** search bar, pill chips, product cards, qty stepper, skeleton rows.
  - **Data & formatting:** typo-tolerant results ("atta/aata/attaa" all resolve); results <300ms p95; INR rule on cards.
  - **States:** default (recents/trending) · loading (skeleton rows, never spinner) · results · empty → alternate suggestions per FR-5 (never a bare "no results") · error (retry).
  - **Interactions:** as-you-type results, 150ms input debounce; keyboard stays up; recent chip tap re-runs query.
  - **Accessibility:** result count announced on settle; suggestions keyboard-navigable on web; voice input has text fallback.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | input | `data-testid="search-input"` | As-you-type debounced results | — |
  | IE-2 | chip | `data-testid="search-recent-chip"` | Re-run stored query | — |
  | IE-3 | strip | `data-testid="search-did-you-mean"` | Tap → run corrected query | — |
  | IE-4 | button | `data-testid="search-add-{sku}"` | Optimistic add, same as PLP | — |
  | IE-5 | button | `data-testid="search-voice"` | App: voice query input | — |

#### SC-008 — Product detail (PDP)

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** app — square image carousel (dots); name + pack size/weight; price row (struck MRP `text.secondary`, selling price 24px, warm discount tag); serving-store availability line; description + expiry-sensitive info accordion; "Similar items" card rail; sticky bottom add/stepper bar. Web ≥1120 — two-column: gallery left, buy panel right; SEO-indexable URL/layout.
  - **Components:** carousel, accordion, product card rail, sticky action bar, qty stepper.
  - **Data & formatting:** INR rule; price/availability strictly scoped to serving store (BR-1).
  - **States:** loading (skeleton) · default · error (retry) · edge: OOS at serving store → add disabled, "Out of stock" state, similar items promoted (no notify-me in v1).
  - **Interactions:** carousel swipe + button alternative; optimistic add; 150ms ADD→stepper morph.
  - **Accessibility:** carousel controls as buttons; discount price change announced; accordion keyboard-operable.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | carousel | `data-testid="pdp-image-carousel"` | Swipe/buttons through images | — |
  | IE-2 | button | `data-testid="pdp-add"` | Optimistic add → stepper; disabled when OOS | — |
  | IE-3 | accordion | `data-testid="pdp-description-accordion"` | Expand/collapse description + expiry info | — |
  | IE-4 | card | `data-testid="pdp-similar-{sku}"` | → that SKU's PDP | — |

#### SC-009 — Cart

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** line-item list — thumb, name, pack, per-line price, qty stepper, remove; savings line in `accent.warm`; "You may have missed" strip; sticky footer: running total + "Proceed to checkout" primary button.
  - **Components:** line-item rows, qty stepper, product-card strip, sticky footer bar, toasts, empty-state illustration.
  - **Data & formatting:** per-line = unit price × qty per INR rule; savings `You save ₹64`; cart persists across sessions & devices (FR-7).
  - **States:** default · empty (illustration + "Browse" CTA) · loading · error · edges: qty exceeds stock/per-order cap → increment blocked + inline reason; item went OOS since add → red-flagged line with Remove / keep-browsing options.
  - **Interactions:** optimistic stepper with server-reconcile toast; row remove = 200ms collapse; total updates live.
  - **Accessibility:** steppers labelled per product; total updates announced politely (`aria-live="polite"`).
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | stepper | `data-testid="cart-stepper-{sku}"` | Optimistic ± qty; cap → blocked + reason | — |
  | IE-2 | button | `data-testid="cart-remove-{sku}"` | 200ms row collapse, total recalcs | — |
  | IE-3 | button | `data-testid="cart-checkout"` | → SC-010 | — |
  | IE-4 | button | `data-testid="cart-remove-oos-{sku}"` | Clears flagged OOS line | — |
  | IE-5 | button | `data-testid="cart-empty-browse"` | Empty state → SC-005 | — |

#### SC-010 — Checkout (ETA promise, coupons, bill)

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** stacked cards: (1) delivery address + "Change" → SC-020; (2) hero ETA promise — 32px green "Arriving in 12 min"; (3) coupon row → SC-011 sheet; applied coupon = warm chip with remove ×; (4) itemized bill: item total, delivery fee, small-cart fee, coupon discount (−), GST-inclusive grand total (BR-10 — no hidden fees); (5) delivery instructions field. Sticky footer "Proceed to pay ₹X".
  - **Components:** address card, ETA hero, coupon chip, bill table, form input, sticky footer button.
  - **Data & formatting:** bill rows per INR rule; discount rows as `−₹40` in `accent.warm`; ETA shown here is stored on the order as the SLA baseline (BR-2).
  - **States:** loading (ETA + bill skeleton) · default · error (ETA unavailable → retry) · edges: coupon invalid → inline reason; item OOS at checkout → return to SC-009 with line flagged; ETA widened under load → amber banner.
  - **Interactions:** coupon apply reflects in bill instantly (optimistic); footer amount always mirrors grand total.
  - **Accessibility:** bill is a real table/list; discount rows announced; ETA is text, not color-only.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="checkout-change-address"` | → SC-020; returns with selected address, ETA recalcs | — |
  | IE-2 | button | `data-testid="checkout-coupon-row"` | Opens SC-011 sheet/modal | — |
  | IE-3 | chip | `data-testid="checkout-coupon-remove"` | Removes coupon, bill recalcs | — |
  | IE-4 | input | `data-testid="checkout-instructions"` | Free-text delivery instructions | — |
  | IE-5 | button | `data-testid="checkout-proceed-pay"` | → SC-012 with grand total | — |

#### SC-011 — Coupon selection (sheet/modal)

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both — bottom sheet (app) / modal (web) over SC-010
- **FE spec:**
  - **Layout:** manual code entry + "Apply" at top; coupon cards below: code (mono/caps), flat/percent value in `accent.warm`, min-cart condition, expiry; ineligible coupons grayed with explicit reason ("Add ₹120 more"); eligible cards show "APPLY".
  - **Components:** bottom sheet/modal, form input, coupon cards, toasts.
  - **Data & formatting:** values per INR rule (`₹50 off` / `10% up to ₹80`); expiry `Valid till 31 Jul`.
  - **States:** loading · default · empty ("No coupons right now") · error (invalid/ineligible code — inline reason) · success (applied → sheet closes 250ms, chip lands on SC-010).
  - **Interactions:** sheet slide-up 250ms; apply = optimistic bill update; scrim tap / ESC dismisses.
  - **Accessibility:** focus-trapped; reasons are text and announced on apply failure; ESC + scrim dismiss on web.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | input | `data-testid="coupon-code-input"` | Manual code entry, caps-forced | — |
  | IE-2 | button | `data-testid="coupon-apply-manual"` | Validate → apply or inline reason | — |
  | IE-3 | button | `data-testid="coupon-apply-{code}"` | Apply eligible coupon → close sheet → SC-010 chip | — |
  | IE-4 | modal | `data-testid="coupon-sheet"` | Focus trap; ESC/scrim dismiss | — |

#### SC-012 — Payment

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** amount-payable header (tabular ₹); method list as labelled radio group: UPI (intent apps + collect), cards (gateway-tokenized — no raw card fields on GroFast surfaces, NFR-5), wallets, **COD row (v1 CONFIRMED — unconditional build)**; "Pay ₹X" primary button (label switches to "Place order (COD)" when COD selected). Gateway vendor pending → both handoff variants specced: web redirect + return URL; app SDK-intent.
  - **Components:** radio-group method rows, primary button, full-screen processing state, failure screen.
  - **Data & formatting:** amount per INR rule; COD row shows "Pay ₹X on delivery". **BR-5 runtime rules:** COD row hidden when order total exceeds the BR-5 cap or the user is a risk-flagged first-timer — runtime visibility logic, both variants (shown/hidden) specced and built.
  - **States:** default · processing (gateway pending + webhook wait — calm full-screen wait, no dead-ends) · success → SC-013 · failure/timeout → retry or switch method, **cart intact** · edge: stock reservation fails after payment → clean failure screen + auto-refund notice (BR-4).
  - **Interactions:** method select enables Pay; order confirm <3s post-gateway success (NFR-2); back from processing blocked until resolution.
  - **Accessibility:** methods are a labelled radio group; processing state announces progress; failure reasons in text.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | radio | `data-testid="pay-method-upi"` | Select UPI → intent/collect sub-options | — |
  | IE-2 | radio | `data-testid="pay-method-card"` | Select card → gateway-tokenized flow | — |
  | IE-3 | radio | `data-testid="pay-method-wallet"` | Select wallet | — |
  | IE-4 | radio | `data-testid="pay-method-cod"` | Select COD (visible within BR-5 cap; hidden above cap / risk-flagged) | — |
  | IE-5 | button | `data-testid="pay-submit"` | Gateway handoff or COD place-order → SC-013 | — |
  | IE-6 | button | `data-testid="pay-retry"` | Failure state: retry / switch method, cart intact | — |

#### SC-013 — Order confirmation

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** success motif (250ms check animation); order ID; large promised-ETA countdown (tabular); serving store name; collapsed item summary; payment method/status row; primary "Track order", secondary "Continue shopping". Auto-forwards to SC-014 after ~3s (cancellable — any interaction pauses it).
  - **Components:** success check, countdown text, order summary card, primary/secondary buttons.
  - **Data & formatting:** order ID `GF-2026-000123`; ETA countdown live text; amounts per INR rule.
  - **States:** success (primary) · **COD variant (unconditional):** "Pay ₹487 on delivery" callout card in `accent.warm.tint`.
  - **Interactions:** rendered <3s post-gateway (NFR-2); auto-forward 3s, paused on any tap/focus.
  - **Accessibility:** success announced; auto-forward pausable/preventable; countdown is live text.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="confirm-track-order"` | → SC-014 immediately | — |
  | IE-2 | button | `data-testid="confirm-continue-shopping"` | → SC-005, cancels auto-forward | — |

#### SC-014 — Live order tracking

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both — the emotional centerpiece
- **FE spec:**
  - **Layout:** top half — live map: store pin, rider marker (bike icon, smooth interpolation between ≤5s position updates), destination pin, route line; ETA countdown chip vs promise. Bottom sheet — status stepper (placed → packed → dispatched → delivered), rider card (name, masked-call button), order summary link, help (phone/email), cancel (pre-dispatch only → confirm dialog → refund note per BR-3/4).
  - **Components:** map suite (pins, rider marker, route line), stepper timeline, bottom sheet, pill chip (ETA), confirm dialog.
  - **Data & formatting:** rider position refresh ≤5s (NFR-7); status transitions push instantly (FR-13); ETA countdown tabular.
  - **States (7):** loading · pre-dispatch (timeline only, map subdued) · dispatched (map live) · delivered (→ SC-018 prompt) · cancelled (refund status) · error — map/socket degraded → timeline-only fallback banner · edge: ETA breach → apology banner (order also enters ops queue SC-030).
  - **Interactions:** rider marker animates between updates (linear interpolation, no teleporting); cancel available strictly pre-dispatch; sheet drag between peek/full.
  - **Accessibility:** status changes announced via live region; map has a full text-timeline equivalent; call button labelled.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="track-call-rider"` | Masked call to rider | — |
  | IE-2 | button | `data-testid="track-cancel-order"` | Pre-dispatch only → confirm dialog → cancel + refund note | — |
  | IE-3 | link | `data-testid="track-order-summary"` | Expands order summary / → SC-017 | — |
  | IE-4 | button | `data-testid="track-help"` | Phone/email help options | — |
  | IE-5 | gesture | `data-testid="track-bottom-sheet"` | Drag peek ↔ full | — |

#### SC-015 — Substitution prompt (OOS after order)

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both — blocking sheet/modal over any customer screen (push deep-link target)
- **FE spec:**
  - **Layout:** blocking bottom sheet/modal: OOS item (thumb + name, struck); arrow to proposed substitute (thumb, name, price-delta chip `+₹6` / `−₹4`); prominent 60s countdown ring; two equal-weight buttons "Accept substitute" / "Refund this item"; footnote "No reply → this item is refunded automatically."
  - **Components:** blocking sheet/modal, countdown ring (60s), price-delta chip, paired buttons.
  - **Data & formatting:** delta per INR rule with sign; countdown ring + numeric seconds.
  - **States:** default (countdown live) · timeout (auto-refund confirmation, FR-30) · success (choice recorded → returns to SC-014) · error (retry within remaining window).
  - **Interactions:** fires from picker SC-045; countdown shared with picker's waiting state; sheet non-dismissable except by choice/timeout; 250ms slide-up.
  - **Accessibility:** countdown announced at 45/30/15s intervals; both choices reachable in ≤1 action; focus trapped.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="sub-accept"` | Record acceptance → SC-014, bill delta applied | — |
  | IE-2 | button | `data-testid="sub-refund"` | Refund line → SC-014, bill reduced | — |
  | IE-3 | timer | `data-testid="sub-countdown"` | 60s ring; timeout → auto-refund state | — |

#### SC-016 — Order history

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** scrollable order cards: date, store, item thumbnail row (max 4 + "+3" overflow), total, status chip (delivered/cancelled/refunded); "Reorder" button per card; card tap → SC-017.
  - **Components:** order cards, status chips, secondary button, skeleton cards, empty illustration.
  - **Data & formatting:** date `Tue, 8 Jul`; total per INR rule; status chips text + color.
  - **States:** loading (skeleton cards) · default · empty (first-order nudge illustration + "Start shopping" CTA) · error · edge: reorder with unavailable items → available items added + toast "2 items unavailable, flagged in cart" (FR-15 acceptance).
  - **Interactions:** reorder is one tap → SC-009 with items loaded; infinite scroll on history.
  - **Accessibility:** card = single link with structured label ("Order of 8 Jul, ₹512, delivered"); reorder separately focusable.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | card | `data-testid="history-order-card-{id}"` | → SC-017 | — |
  | IE-2 | button | `data-testid="history-reorder-{id}"` | Items → cart, unavailable flagged + toast → SC-009 | — |
  | IE-3 | button | `data-testid="history-empty-shop"` | Empty state → SC-005 | — |

#### SC-017 — Order detail (past/active order)

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** header: order ID + status chip; line items with per-line prices (substituted lines marked); bill breakdown (same table pattern as SC-010); vertical status timeline with timestamps; action row: Reorder · Cancel (pre-dispatch only) · Download GST invoice (post-delivery, FR-9/BR-10) · Rate (if delivered & unrated) · Help; delivery-proof reference.
  - **Components:** status chip, bill table, stepper timeline (vertical), action buttons, refund tracker card.
  - **Data & formatting:** timestamps `14:32`; amounts per INR rule; invoice labelled "GST invoice (PDF)".
  - **States:** loading · default · error · edges: refund in progress → refund tracker card; cancelled → refund status; active order → "Track live" banner → SC-014.
  - **Interactions:** cancel gated pre-dispatch with confirm; invoice downloads/share-sheet.
  - **Accessibility:** timeline is a list with visible timestamps; invoice download labelled with format; destructive cancel confirmed.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="detail-reorder"` | Items → cart → SC-009 | — |
  | IE-2 | button | `data-testid="detail-cancel"` | Pre-dispatch: confirm → cancel + refund state | — |
  | IE-3 | button | `data-testid="detail-invoice-download"` | Post-delivery: GST invoice PDF | — |
  | IE-4 | button | `data-testid="detail-rate"` | → SC-018 | — |
  | IE-5 | banner | `data-testid="detail-track-live"` | Active order → SC-014 | — |

#### SC-018 — Rate order & delivery

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** two star rows (Order quality / Delivery experience; 44px stars); when either ≤3 stars → mandatory reason-picker chips slide in 200ms (missing item, late, damaged, rider behavior, other); optional free-text comment; "Submit" primary, "Skip" ghost.
  - **Components:** star rating (radio-group semantics), pill chips, textarea, primary/ghost buttons.
  - **States:** default · success ("Thanks!" 250ms beat → SC-005) · error (retry, input preserved) · edge: ≤3 stars with no reason → submit blocked + inline prompt.
  - **Interactions:** ≤3-star ratings route the record to ops exception queue (SC-030, FR-16).
  - **Accessibility:** stars operable as labelled radio groups; reason requirement announced when triggered.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | rating | `data-testid="rate-order-stars"` | 1–5; ≤3 triggers mandatory reasons | — |
  | IE-2 | rating | `data-testid="rate-delivery-stars"` | 1–5; ≤3 triggers mandatory reasons | — |
  | IE-3 | chip | `data-testid="rate-reason-chip"` | Multi-select reasons | — |
  | IE-4 | input | `data-testid="rate-comment"` | Optional free text | — |
  | IE-5 | button | `data-testid="rate-submit"` | Blocked if reason missing; success → SC-005 | — |
  | IE-6 | button | `data-testid="rate-skip"` | Skip → SC-005 | — |

#### SC-019 — Profile & account

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** header: name + masked phone, edit; grouped list rows (24px icons): Orders → SC-016, Addresses → SC-020, Notification prefs, Privacy (DPDP consent view + "Delete my data" request), Support (phone + email only in v1), app-version footer, Logout (destructive style, confirmed).
  - **Components:** list rows, icons, confirm dialog, destructive button style.
  - **States:** default · loading · error · edge: data-deletion request → confirmation flow with consequence copy + final confirm (NFR-6).
  - **Interactions:** logout confirm → SC-001; deletion request double-confirmed.
  - **Accessibility:** rows are real buttons/links; destructive actions confirmed and announced.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | link | `data-testid="profile-orders"` | → SC-016 | — |
  | IE-2 | link | `data-testid="profile-addresses"` | → SC-020 | — |
  | IE-3 | link | `data-testid="profile-privacy"` | DPDP consent view + delete-data entry | — |
  | IE-4 | button | `data-testid="profile-delete-data"` | Consequence copy → final confirm (NFR-6) | — |
  | IE-5 | button | `data-testid="profile-logout"` | Confirm → SC-001 | — |

#### SC-020 — Address book (list + add/edit)

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** both
- **FE spec:**
  - **Layout:** list — address cards (label chip Home/Work/Other, full address, serviceable badge, default marker, edit/delete); "Add address" primary. Editor — map with draggable pin + GPS detect + search; fields: house/flat, floor, landmark, label picker (FR-2 acceptance); sticky "Save".
  - **Components:** address cards, pill chips, map + pin (SC-003 pattern), form inputs, sticky button, confirm dialog (delete).
  - **States:** loading · default · empty ("Add your first address") · error · edge: pinned address not serviceable → inline warning using the SC-004 pattern; selection returns to caller (SC-010/SC-003) with the chosen address.
  - **Interactions:** save re-checks serviceability; delete confirmed; selecting from SC-010 returns + re-runs ETA.
  - **Accessibility:** pin-drag has search alternative; real form labels; delete confirmed and announced.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="address-add"` | Opens editor | — |
  | IE-2 | card | `data-testid="address-card-{id}"` | Select → return to caller with address | — |
  | IE-3 | button | `data-testid="address-edit-{id}"` | Opens editor prefilled | — |
  | IE-4 | button | `data-testid="address-delete-{id}"` | Confirm → delete | — |
  | IE-5 | gesture | `data-testid="address-editor-pin"` | Drag → re-geocode | — |
  | IE-6 | button | `data-testid="address-save"` | Validate + serviceability check → save | — |

---
### Client B — Rider app, Android (SC-021 … SC-027) — 390×844, sunlight-readable ≥7:1, ≥56px targets, thumb-zone

#### SC-021 — Rider login

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** mobile (Android, rider)
- **FE spec:**
  - **Layout:** minimal — GroFast Rider lockup; phone input (+91); OTP entry (SC-002 pattern, oversized boxes); onboarding/KYC status banner (pending / active / blocked — icon + text); "Contact ops" button when not yet activated.
  - **Components:** oversized form input, OTP group, status banner, primary button.
  - **States:** default · loading · errors: unregistered number → "Contact ops" card with phone number; wrong OTP · edge: KYC pending → read-only lock screen showing status only. No self-serve signup in v1.
  - **Interactions:** OTP auto-read; activated riders land on SC-022.
  - **Accessibility:** extra-large inputs; status conveyed icon + text, never color-only.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | input | `data-testid="rider-phone-input"` | Registered numbers only; unregistered → contact-ops card | — |
  | IE-2 | input | `data-testid="rider-otp-input"` | Verify → SC-022 (if KYC active) | — |
  | IE-3 | button | `data-testid="rider-contact-ops"` | Dials ops number | — |

#### SC-022 — Rider home (online/offline)

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** mobile (Android, rider)
- **FE spec:**
  - **Layout:** dominant online/offline toggle (huge, thumb-zone, `primary` when online); today strip: deliveries count + earnings snapshot (tabular ₹); active-job card (order ID, stage, "Resume" CTA) when live — **max 1 active order (BR-7): one card, never a list**; GPS/network health indicators in header; menu → Earnings (SC-027).
  - **Components:** giant toggle, summary strip, job card, health indicators.
  - **States:** offline (default, muted) · online-waiting ("Waiting for orders…" pulse) · active-job · errors: GPS off → blocking full-screen prompt with settings CTA; no network → offline banner.
  - **Interactions:** going online starts GPS streaming (≤5s cadence when on a job, NFR-7); job offer arrives as SC-023 takeover.
  - **Accessibility:** toggle state announced; all targets ≥56px; 7:1 contrast throughout.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | toggle | `data-testid="rider-online-toggle"` | Online ↔ offline; announced; starts/stops availability | — |
  | IE-2 | button | `data-testid="rider-resume-job"` | → SC-024/SC-025 at current stage | — |
  | IE-3 | button | `data-testid="rider-menu-earnings"` | → SC-027 | — |
  | IE-4 | button | `data-testid="rider-gps-settings"` | GPS-off state → OS settings | — |

#### SC-023 — Job offer

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** mobile (Android, rider) — full-screen takeover
- **FE spec:**
  - **Layout:** full-screen takeover: 30s countdown ring at top; pickup store + distance; drop area + distance; estimated payout (largest number on screen, tabular ₹); **COD badge when applicable (unconditional — COD confirmed v1)**; giant "ACCEPT" (`primary`, bottom thumb zone) + smaller "Decline".
  - **Components:** countdown ring (30s), stat rows, giant primary + secondary buttons, COD badge.
  - **States:** default (countdown) · timeout/decline → SC-022 (offer cascades to next rider) · accepted → SC-024 · edges: offer withdrawn mid-countdown (ops reassigned) → dismissal notice; **ops force-assign variant** → non-declinable, reason shown, single "OK, GOT IT" button.
  - **Interactions:** strong haptic + audio cue on arrival; accept single-tap; timeout auto-dismisses.
  - **Accessibility:** countdown announced; accept reachable one-handed; payout readable in sunlight.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="offer-accept"` | → SC-024; must win vs timeout | — |
  | IE-2 | button | `data-testid="offer-decline"` | → SC-022, offer cascades | — |
  | IE-3 | timer | `data-testid="offer-countdown"` | 30s ring; timeout = decline | — |
  | IE-4 | button | `data-testid="offer-forceassign-ack"` | Force-assign variant: acknowledge → SC-024 | — |

#### SC-024 — Pickup flow

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** mobile (Android, rider)
- **FE spec:**
  - **Layout:** stage-based single card (one primary action per stage, always thumb-zone): store name/address + big "NAVIGATE" (external maps handoff); order ID + item/bag count; on arrival → "I'VE ARRIVED"; pickup verification: oversized OTP entry OR bag-label scan button; store-contact call; "Report issue — order not ready".
  - **Components:** stage card, giant buttons, OTP input, scanner view, call button.
  - **States:** en-route · arrived · verifying · error (wrong OTP / scan mismatch → retry) · edge: order not ready → wait state with elapsed timer + "ops auto-notified" banner.
  - **Interactions:** navigate hands off to external maps app; verification success advances to SC-025; applies to dark-store and partner-store pickups alike.
  - **Accessibility:** one primary action per stage; scan always has OTP fallback; ≥56px targets.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="pickup-navigate"` | External maps handoff | — |
  | IE-2 | button | `data-testid="pickup-arrived"` | Advance to verification stage | — |
  | IE-3 | input | `data-testid="pickup-otp"` | Verify pickup OTP → SC-025 | — |
  | IE-4 | button | `data-testid="pickup-scan"` | Bag-label scan (OTP fallback) → SC-025 | — |
  | IE-5 | button | `data-testid="pickup-report-issue"` | Order-not-ready wait state, ops notified | — |
  | IE-6 | button | `data-testid="pickup-call-store"` | Calls store contact | — |

#### SC-025 — Delivery flow (drop + proof)

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** mobile (Android, rider)
- **FE spec:**
  - **Layout:** customer address + landmark/floor prominent; delivery-instructions card; "NAVIGATE" + masked-call button; on arrival → proof capture: customer OTP entry OR photo capture (two equally clear paths — delivery proof mandatory, BR-8); **COD amount banner in `accent.warm` for COD orders (unconditional — COD confirmed v1)**; "MARK DELIVERED" enabled only after proof; "Customer unreachable" escalation link.
  - **Components:** stage card, giant buttons, OTP input, camera capture, warm banner, escalation link.
  - **Data & formatting:** COD banner `Collect ₹487 in cash` (tabular, largest text on card); GPS streams ≤5s to tracking + ops (NFR-7).
  - **States:** en-route · arrived · proof-capture · success → SC-026 (COD) or SC-022 (prepaid) · error (proof failed → retry) · edge: customer unreachable → timed retry state + ops escalation notice.
  - **Interactions:** MARK DELIVERED hard-gated on proof; completion updates customer SC-014 instantly.
  - **Accessibility:** camera flow has OTP alternative; completion is an explicit confirmed action, not swipe-only.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="drop-navigate"` | External maps handoff | — |
  | IE-2 | button | `data-testid="drop-call-customer"` | Masked call | — |
  | IE-3 | input | `data-testid="drop-proof-otp"` | Customer OTP proof path | — |
  | IE-4 | button | `data-testid="drop-proof-photo"` | Photo-capture proof path | — |
  | IE-5 | button | `data-testid="drop-mark-delivered"` | Enabled only post-proof → SC-026 (COD) / SC-022 | — |
  | IE-6 | link | `data-testid="drop-unreachable"` | Timed retry + ops escalation | — |

#### SC-026 — COD collection

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** mobile (Android, rider) — **unconditional v1 build (COD confirmed, BR-5 caps enforced upstream at SC-012)**
- **FE spec:**
  - **Layout:** amount to collect in the largest type in the app (`₹487`, 32px+ tabular); order ID beneath; single giant "CASH COLLECTED" confirm — deliberate hold-to-confirm (800ms hold with fill animation); secondary "Short change / dispute" → flags ops.
  - **Components:** hero amount, hold-to-confirm button, secondary escalation button.
  - **States:** default · success (order completes → SC-022) · error (retry) · edge: customer refuses to pay → ops escalation state, order NOT completed, guidance copy shown.
  - **Interactions:** confirmation is irreversible-styled and required in addition to delivery proof (BR-8); COD-collected total feeds SC-027 reconciliation.
  - **Accessibility:** amount readable in sunlight (≥7:1); hold-to-confirm announced; escalation reachable one-handed.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="cod-collected-confirm"` | 800ms hold-to-confirm → order completes → SC-022 | — |
  | IE-2 | button | `data-testid="cod-dispute"` | Short-change/dispute → ops flag, order stays open | — |
  | IE-3 | button | `data-testid="cod-refused-escalate"` | Customer-refuses path → ops escalation | — |

#### SC-027 — Earnings & delivery history

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** mobile (Android, rider)
- **FE spec:**
  - **Layout:** date-picker header (default today); daily-total hero number (tabular ₹); per-order rows: time, distance, payout; **COD-collected total card as reconciliation aid (unconditional — COD confirmed v1)**; row tap → simple detail. Display-only — payout engine deferred (FU-6).
  - **Components:** date picker, hero stat, list rows (≥56px), stat card.
  - **Data & formatting:** payouts per INR rule, tabular; distance `4.2 km`; time `14:32`.
  - **States:** loading · default · empty ("No deliveries yet today") · error (retry).
  - **Accessibility:** tabular numerals; rows ≥56px; totals labelled, not styled-only.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | picker | `data-testid="earnings-date-picker"` | Switch date, list reloads | — |
  | IE-2 | row | `data-testid="earnings-order-row-{id}"` | → simple order detail | — |

---
### Client C — Admin + ops dashboard, web 1440 (SC-028 … SC-045, incl. picker) — dense, keyboard-first, left-rail nav per RBAC, global order/phone search in top bar

#### SC-028 — Admin login (RBAC)

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin), 1440 / min 1280
- **FE spec:**
  - **Layout:** centered card: email/username + password (SSO button placeholder), "Login". On success route to role home: ops → SC-029, picker → SC-044, else first permitted module. Separate **access-denied interstitial**: "Your role doesn't include this module" + "this attempt was logged" note + "Go to my home" CTA.
  - **Components:** form inputs w/ inline validation, primary button, interstitial card.
  - **States:** default · loading · errors: bad credentials, account locked · edge: role-denied interstitial (denied attempts audit-logged, FR-29/NFR-10).
  - **Accessibility:** labelled fields, error summary announced, full keyboard flow, visible focus rings.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | input | `data-testid="admin-login-email"` | Email/username | — |
  | IE-2 | input | `data-testid="admin-login-password"` | Password, masked | — |
  | IE-3 | button | `data-testid="admin-login-submit"` | Auth → role home | — |
  | IE-4 | button | `data-testid="admin-denied-gohome"` | Interstitial → user's role home | — |

#### SC-029 — Live ops dashboard

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin)
- **FE spec:**
  - **Layout:** left rail (Live Ops active); top bar with global order/phone search; KPI counter row — active orders by stage, online riders, store load, SLA hit-rate today (each clickable → filtered SC-031); center — city map: order/rider markers + zone polygons (provider-agnostic); right column — alert strip (feed-staleness flags, ETA breaches) deep-linking to SC-030/SC-037.
  - **Components:** left-rail nav, KPI counters, map suite (markers, polygons), alert strip, data-table toggle.
  - **Data & formatting:** must reflect order/inventory state within 30s (Objective 6); counts tabular; last-updated timestamp visible.
  - **States:** loading · default · degraded (data stale >30s → prominent amber banner with last-updated timestamp) · error.
  - **Interactions:** counters drill down; alerts deep-link; map auto-refreshes without stealing focus.
  - **Accessibility:** counters keyboard-focusable with drill-down; map has a table-equivalent toggle.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="ops-kpi-{metric}"` | → filtered SC-031 | — |
  | IE-2 | input | `data-testid="admin-global-search"` | Order ID / phone → SC-032 (available on all admin screens) | — |
  | IE-3 | link | `data-testid="ops-alert-{id}"` | Deep-link → SC-030 / SC-037 | — |
  | IE-4 | toggle | `data-testid="ops-map-table-toggle"` | Map ↔ table equivalent | — |

#### SC-030 — Exception queue

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin)
- **FE spec:**
  - **Layout:** filter rail (type: delayed / stuck / failed-payment / low-rated; zone/store); dense table: exception-type chip, order ID, age (live), promised-vs-actual ETA, zone/store; per-row one-click actions: Reassign rider · Call customer · Cancel-refund; resolve/dismiss with mandatory reason; row expand → mini order context; row click → SC-032.
  - **Components:** data table, filter rail, status chips, one-click action buttons, reason modal (shared SC-032 pattern).
  - **Data & formatting:** ETA-breach orders appear ≤30s after breach (FR-25); age as live `4m 12s`.
  - **States:** loading · default · empty ("All clear ✓" — the goal state, quiet celebration) · error · edge: action fails → row flagged red with retry.
  - **Interactions:** keyboard-first triage — j/k row navigation, enter to open, documented action shortcuts; actions announce results.
  - **Accessibility:** full keyboard row nav + shortcuts documented in-UI; action results announced.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="exc-reassign-{id}"` | One-click rider reassign | — |
  | IE-2 | button | `data-testid="exc-call-{id}"` | One-click customer call | — |
  | IE-3 | button | `data-testid="exc-cancelrefund-{id}"` | Cancel-refund with reason modal | — |
  | IE-4 | button | `data-testid="exc-resolve-{id}"` | Resolve/dismiss, mandatory reason | — |
  | IE-5 | row | `data-testid="exc-row-{id}"` | Expand context / open SC-032 | — |
  | IE-6 | chip | `data-testid="exc-filter-{type}"` | Filter queue by exception type | — |

#### SC-031 — Order search & list

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin)
- **FE spec:**
  - **Layout:** prominent search bar (order ID / phone — FR-26 acceptance); left filter rail (status, store, zone, date range); dense result table: order ID, status chip, store, rider, amount, promised-vs-actual ETA (breach highlighted); pagination; "Export page to CSV"; row click → SC-032.
  - **Components:** search bar, filter rail, data table (sortable), status chips, pagination, CSV export button.
  - **Data & formatting:** amounts per INR rule; breach rows highlighted amber + text marker.
  - **States:** loading (skeleton rows) · default · empty ("No orders match" + clear-filters CTA) · error.
  - **Accessibility:** sortable headers announced; filters keyboard-operable; row targets full-width.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | input | `data-testid="orders-search"` | Order ID / phone lookup | — |
  | IE-2 | form | `data-testid="orders-filter-rail"` | Status/store/zone/date filters | — |
  | IE-3 | row | `data-testid="orders-row-{id}"` | → SC-032 | — |
  | IE-4 | button | `data-testid="orders-export-csv"` | Export current page to CSV | — |
  | IE-5 | button | `data-testid="orders-clear-filters"` | Empty state: reset filters | — |

#### SC-032 — Order detail (admin)

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin)
- **FE spec:**
  - **Layout:** header: order ID, status, quick actions — Modify status · Refund (auto below ₹2,000 per BR-4) · Cancel · Reassign/force-assign rider · Resend notification · Add note. Two-column body: LEFT — line items (substitution log inline), bill, payment ledger (attempts, webhooks, refunds); RIGHT — full status timeline (state, timestamp, actor), rider-assignment history, delivery proof (photo/OTP record), customer rating. Contains the canonical **audit-reason modal**: every mutation requires a reason before commit (NFR-10) — defined once here, reused by SC-030/035/036.
  - **Components:** action bar, data tables, stepper timeline, audit-reason modal, toasts.
  - **Data & formatting:** ledger amounts per INR rule; timeline timestamps ISO-local `10 Jul, 14:32:07`; actor shown per entry.
  - **States:** loading · default · error · edge: any mutation → reason modal → success/failure toast.
  - **Accessibility:** timeline as list; modal focus-trapped; destructive actions double-confirmed.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="adm-order-refund"` | Reason modal → refund (auto <₹2,000, BR-4) | — |
  | IE-2 | button | `data-testid="adm-order-cancel"` | Reason modal + double confirm → cancel | — |
  | IE-3 | button | `data-testid="adm-order-reassign"` | Force-assign rider w/ reason | — |
  | IE-4 | button | `data-testid="adm-order-modify-status"` | Status change w/ reason | — |
  | IE-5 | button | `data-testid="adm-order-resend-notif"` | Resend notification | — |
  | IE-6 | modal | `data-testid="audit-reason-modal"` | Mandatory reason gate on every mutation (NFR-10) | — |
  | IE-7 | button | `data-testid="adm-order-add-note"` | Append note to order record | — |

#### SC-033 — Catalog: product & category list

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin)
- **FE spec:**
  - **Layout:** left panel — category tree (drag-reorder with keyboard alternative, add/rename); main — product table: image thumb, SKU, name, category, MRP/price, per-store availability count, status chip; toolbar: "Create product" → SC-034, "Bulk CSV upload" (modal: dropzone → progress → result summary + downloadable row-level rejection report), archive; search + filters.
  - **Components:** tree view, data table, CSV-upload modal with progress, status chips.
  - **Data & formatting:** prices per INR rule; storefront reflects saves ≤60s (FR-21); age-restricted categories excluded from v1 (BR-9).
  - **States:** loading · default · empty ("Add your first product" / empty category) · error · edge: CSV partial failure → result modal "N ok / M rejected" + report download.
  - **Accessibility:** tree keyboard-navigable; upload progress announced; table sortable with announced headers.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | tree | `data-testid="catalog-category-tree"` | Reorder/add/rename categories (keyboard alt) | — |
  | IE-2 | button | `data-testid="catalog-create-product"` | → SC-034 | — |
  | IE-3 | button | `data-testid="catalog-csv-upload"` | Modal: dropzone → progress → result + rejection report | — |
  | IE-4 | row | `data-testid="catalog-product-row-{sku}"` | → SC-034 (edit) | — |
  | IE-5 | button | `data-testid="catalog-archive-{sku}"` | Archive with confirm | — |

#### SC-034 — Catalog: product editor

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin)
- **FE spec:**
  - **Layout:** two-column form: LEFT — name, description, pack size/weight, category assignment, image-upload gallery (drag-reorder, cover marker, alt-text field per image); RIGHT — pricing card: MRP, selling price, GST-inclusive flag (BR-10), per-store price/availability override matrix (compact table); sticky footer: Save / Publish / Archive.
  - **Components:** form inputs w/ inline validation, image gallery uploader, matrix table, sticky footer.
  - **Data & formatting:** prices per INR rule; validation: selling price > MRP blocked with inline reason.
  - **States:** default · saving · validation error (inline per field + linked summary) · success (toast) · edge: price > MRP → save blocked.
  - **Accessibility:** every field labelled; error summary linked to fields; image alt-text captured.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | form | `data-testid="product-editor-form"` | Inline validation per field | — |
  | IE-2 | uploader | `data-testid="product-image-upload"` | Upload, reorder, cover-mark, alt text | — |
  | IE-3 | table | `data-testid="product-store-matrix"` | Per-store price/availability overrides | — |
  | IE-4 | button | `data-testid="product-save"` | Save draft; blocked if price > MRP | — |
  | IE-5 | button | `data-testid="product-publish"` | Publish → storefront ≤60s | — |

#### SC-035 — Inventory: stock & adjustments

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin)
- **FE spec:**
  - **Layout:** store selector top-left; tabs: Stock / GRN (→ SC-036) / Adjustments; SKU stock table: on-hand, reserved, available, low-stock threshold (inline-editable), status; low-stock alert list pinned top; adjustment side-drawer: qty delta ± + **mandatory reason** (reuses SC-032 audit-reason pattern); cycle-count mode toggle; per-SKU audit-trail drawer (who/when/why).
  - **Components:** tabs, data table (inline edit), side drawers, audit-reason pattern, toggle.
  - **Data & formatting:** counts tabular; every mutation writes an immutable audit record (FR-22); storefront reflects ≤60s (NFR-7).
  - **States:** loading · default · empty · error · edge: adjustment without reason → blocked inline.
  - **Accessibility:** threshold edits keyboard-accessible; drawers focus-managed; counts tabular numerals.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | dropdown | `data-testid="inv-store-selector"` | Switch dark store, table reloads | — |
  | IE-2 | input | `data-testid="inv-threshold-{sku}"` | Inline low-stock threshold edit | — |
  | IE-3 | drawer | `data-testid="inv-adjust-drawer"` | Qty delta ± with mandatory reason; blocked without | — |
  | IE-4 | toggle | `data-testid="inv-cyclecount-toggle"` | Enter/exit cycle-count mode | — |
  | IE-5 | drawer | `data-testid="inv-audit-drawer-{sku}"` | Per-SKU immutable audit trail | — |

#### SC-036 — Inventory: GRN (goods receiving)

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin)
- **FE spec:**
  - **Layout:** GRN form: store selector, supplier ref, SKU rows (searchable SKU picker, qty, batch/expiry where relevant) with add-row; footer: Save draft / "Commit" (increments stock, audit-logged); below — GRN history table (date, supplier ref, lines, actor) with view/print. Manual entry only (procurement pipeline deferred, FU-7).
  - **Components:** form grid (keyboard row-entry), searchable picker, data table, confirm dialog.
  - **States:** default · saving · success ("GRN-0042 committed — stock updated") · validation error · edge: duplicate supplier-ref → warning banner with override-with-reason.
  - **Interactions:** tab/enter adds rows; commit confirmed; commit writes audit record (FR-22).
  - **Accessibility:** row grid fully keyboard-enterable; commit confirmed and announced.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | picker | `data-testid="grn-sku-picker"` | Searchable SKU add per row | — |
  | IE-2 | button | `data-testid="grn-add-row"` | Add SKU row (also enter-key) | — |
  | IE-3 | button | `data-testid="grn-save-draft"` | Save without committing | — |
  | IE-4 | button | `data-testid="grn-commit"` | Confirm → stock increments, audit-logged | — |
  | IE-5 | button | `data-testid="grn-duplicate-override"` | Duplicate supplier-ref: override with reason | — |
  | IE-6 | row | `data-testid="grn-history-row-{id}"` | View/print past GRN | — |

#### SC-037 — Partner stores: list & feed status

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin)
- **FE spec:**
  - **Layout:** summary tiles top (stale count, avg fill rate); partner table: name, zone, feed-type chip (API/CSV), **LAST FEED AGE** (live; amber >10m; red + staleness flag >15m per BR-6 SLA), fill-rate mini bar, listing-state chip (normal / degraded "delivery may take longer" / delisted); row actions: Force feed re-pull · Toggle degraded · Delist (confirm + reason); row click → SC-038.
  - **Components:** stat tiles, data table, chips, mini bar, confirm + reason dialog.
  - **Data & formatting:** feed age live `7m 40s`; freshness conveyed text + icon, never color-only.
  - **States:** loading · default · empty ("No partners onboarded") · error · edge: stale feed → highlighted row + auto-degraded listing state shown.
  - **Accessibility:** freshness text + icon; actions keyboard-reachable; table sortable.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="partner-repull-{id}"` | Force feed re-pull, result toast | — |
  | IE-2 | toggle | `data-testid="partner-degraded-{id}"` | Toggle degraded listing state | — |
  | IE-3 | button | `data-testid="partner-delist-{id}"` | Confirm + reason → delist | — |
  | IE-4 | row | `data-testid="partner-row-{id}"` | → SC-038 | — |

#### SC-038 — Partner store: detail & onboarding

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin)
- **FE spec:**
  - **Layout:** tabbed detail: (1) **Profile** — name, address, zone mapping, contact, GSTIN, commission/settlement fields; (2) **Feed config** — API creds or CSV schedule, "Run test ingestion" with live result panel; (3) **SKU mapping** — table of partner SKUs vs master catalog (mapped / unmapped / merge candidate), resolve controls (map / merge / reject), downloadable rejection report; (4) **Ingestion history**. Header: Activate / Suspend with confirm.
  - **Components:** tabs, forms, data tables, progress panel, confirm dialogs.
  - **States:** default · saving · ingesting (progress) · error (feed auth/parse failure with raw error detail) · edge: rejected rows → count badge + report download (FR-23).
  - **Interactions:** mapping resolution operable without drag; test ingestion streams results.
  - **Accessibility:** tabs keyboard-navigable; mapping controls non-drag operable; errors verbose text.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | tabs | `data-testid="partner-detail-tabs"` | Profile / Feed / Mapping / History | — |
  | IE-2 | button | `data-testid="partner-test-ingestion"` | Run test ingestion, live result panel | — |
  | IE-3 | control | `data-testid="partner-map-resolve-{sku}"` | Map / merge / reject per partner SKU | — |
  | IE-4 | button | `data-testid="partner-rejection-report"` | Download row-level rejection report | — |
  | IE-5 | button | `data-testid="partner-activate-suspend"` | Confirm → activate/suspend store | — |

#### SC-039 — Zone editor

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin)
- **FE spec:**
  - **Layout:** full-height map (provider-agnostic) with polygon draw/edit tools (vertex handles, snap); left panel: zone list (name, stores mapped, draft/published status chip), store-to-zone mapping panel; overlap warnings on-map + in-panel; actions: Publish (serviceability updates for new sessions ≤60s), Throttle zone (order throttling, risk #2) with state indicator. Delhi NCR launch polygons drawn here pre-launch.
  - **Components:** map + polygon tools, panel lists, chips, warning list, confirm dialogs.
  - **States:** loading · default · draft-unpublished (dashed polygons, visually distinct) · error · edge: polygon overlap or store-less zone → Publish blocked with explicit warning list.
  - **Interactions:** all polygon operations (edit/delete vertices) have panel-based non-mouse equivalents.
  - **Accessibility:** panel-based equivalents for every map operation; warnings as text list.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | tool | `data-testid="zone-draw-polygon"` | Draw polygon, vertex handles, snap | — |
  | IE-2 | panel | `data-testid="zone-store-mapping"` | Map/unmap stores to zone | — |
  | IE-3 | button | `data-testid="zone-publish"` | Blocked on overlap/store-less; else live ≤60s | — |
  | IE-4 | toggle | `data-testid="zone-throttle"` | Order throttling on/off with state indicator | — |
  | IE-5 | panel | `data-testid="zone-vertex-editor"` | Keyboard/panel polygon editing (non-mouse) | — |

#### SC-040 — ETA configuration

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin)
- **FE spec:**
  - **Layout:** zone/store selector; param form: base prep time, buffer, load-widening curve (editable curve with numeric-input fallback), rider-availability factor; RIGHT — live preview of resulting promise band (`"10–15 min"`) + promise-vs-actual chart (last 7 days, shared with SC-042) as recalibration aid; footer: Preview / Publish. Conservative launch values, weekly recalibration (risk #4).
  - **Components:** selectors, form, curve editor, chart w/ data-table toggle, preview pill.
  - **States:** default · saving · error · edge: params produce ETA below floor → Publish blocked with inline reason.
  - **Accessibility:** curve editor has numeric fallback; chart has data-table toggle.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | dropdown | `data-testid="eta-scope-selector"` | Pick zone/store | — |
  | IE-2 | editor | `data-testid="eta-curve-editor"` | Edit load-widening curve (numeric fallback) | — |
  | IE-3 | button | `data-testid="eta-preview"` | Recompute promise-band preview | — |
  | IE-4 | button | `data-testid="eta-publish"` | Publish; blocked below ETA floor | — |

#### SC-041 — Coupon management

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin)
- **FE spec:**
  - **Layout:** coupon table: code (mono/caps), type chip (flat/percent), value, min cart, validity window, usage caps, redemptions count, active/inactive status toggle; "Create coupon" → side-drawer editor (code, type, value, min-cart, validity dates, per-user/total caps). Feeds customer SC-011; invalid-coupon reasons defined here.
  - **Components:** data table, side drawer form, toggles, chips.
  - **Data & formatting:** values per INR rule (`₹50` / `10%`); dates keyboard-enterable `dd/mm/yyyy`.
  - **States:** loading · default · empty ("Create your first coupon") · error · edge: overlapping/duplicate code → save blocked with reason.
  - **Accessibility:** toggle states announced; drawer focus-trapped; dates keyboard-enterable.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="coupon-create"` | Opens editor drawer | — |
  | IE-2 | form | `data-testid="coupon-editor-form"` | Validate; duplicate code blocked | — |
  | IE-3 | toggle | `data-testid="coupon-status-{code}"` | Activate/deactivate, announced | — |
  | IE-4 | row | `data-testid="coupon-row-{code}"` | Open editor prefilled; shows redemptions | — |

#### SC-042 — Analytics & reports

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin)
- **FE spec:**
  - **Layout:** date-range picker + filter bar (zone, store); KPI tile grid: GMV, orders, AOV, SLA hit rate, fill rate, OOS-after-order, payment success, rider utilization — each tile: value, trend sparkline, delta chip (text + arrow); zone heatmap; sales-report table; promise-vs-actual view (shared with SC-040); per-widget "Export CSV"; daily-digest config card (8am email/Slack).
  - **Components:** KPI tiles, sparklines, heatmap, data tables, CSV export, config card.
  - **Data & formatting:** GMV/AOV per INR rule (lakh grouping, e.g. `₹4,52,310`); percentages 1 decimal; numbers reconcile with the order ledger (FR-27 acceptance).
  - **States:** loading (tile skeletons) · default · empty ("No data in this range") · error · edge: KPI drill-down → filtered SC-031.
  - **Accessibility:** every chart has a data-table alternative; deltas text + arrow, not color-only.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | picker | `data-testid="analytics-date-range"` | Change range, all widgets reload | — |
  | IE-2 | tile | `data-testid="analytics-kpi-{metric}"` | Drill-down → filtered SC-031 | — |
  | IE-3 | button | `data-testid="analytics-export-{widget}"` | Per-widget CSV export | — |
  | IE-4 | form | `data-testid="analytics-digest-config"` | Configure 8am email/Slack digest | — |
  | IE-5 | toggle | `data-testid="analytics-chart-table-{widget}"` | Chart ↔ data-table alternative | — |

#### SC-043 — User & role management

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin) — admin-owner only
- **FE spec:**
  - **Layout:** tabs: (1) **Users** — table: name, email, role chips, status, last login; actions: Invite/create (drawer: email + role multiselect), assign/revoke roles, deactivate (confirm); (2) **Role matrix** — read-only role × module permission grid; (3) **Access audit log** — table incl. denied attempts (who, module, when), filterable (FR-29).
  - **Components:** tabs, data tables, drawer form, permission grid, confirm dialogs.
  - **States:** loading · default · empty · error · edge: demoting the last admin-owner → blocked with explicit reason.
  - **Accessibility:** matrix grid keyboard-navigable with row/column headers announced; role changes announced.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="users-invite"` | Drawer: email + role multiselect → invite | — |
  | IE-2 | control | `data-testid="users-roles-{id}"` | Assign/revoke roles; last-owner demote blocked | — |
  | IE-3 | button | `data-testid="users-deactivate-{id}"` | Confirm → deactivate | — |
  | IE-4 | table | `data-testid="users-audit-log"` | Filterable audit log incl. denied attempts | — |

#### SC-044 — Picker: pick-list queue

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin surface on store tablet) — touch-first, specced at 1440 responsive with 1024-tablet behavior
- **FE spec:**
  - **Layout:** large order cards (min 72px touch rows): order ID, item count, age, promised-ETA countdown; urgency: order nearing ETA breach → red/amber urgent card pinned to top; "my active pick" resume banner pinned above the queue; giant "ACCEPT NEXT ORDER" primary → SC-045; auto-refresh with subtle last-updated indicator (never steals focus).
  - **Components:** order cards, countdown text, urgent-card variant, giant primary button, resume banner.
  - **Data & formatting:** store-scoped queue; countdowns tabular text; age live.
  - **States:** loading · default · empty ("No orders — you're all caught up") · error · edge: urgent-breach highlight variant.
  - **Accessibility:** extra-large targets; countdowns text-based; refresh does not steal focus.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="picker-accept-next"` | Claim next order → SC-045 | — |
  | IE-2 | banner | `data-testid="picker-resume-active"` | → SC-045 at current progress | — |
  | IE-3 | card | `data-testid="picker-queue-card-{id}"` | Order context; urgent variant pinned top | — |

#### SC-045 — Picker: pick & pack flow

- **Design source:** spec-based — no Figma (pod decision 2026-07-10)
- **Platform:** web (admin surface on store tablet) — touch-first, ≥56px targets
- **FE spec:**
  - **Layout:** progress header ("6 of 12 picked" + ETA countdown); pick list **sorted by store layout**: per-item card — image, name, qty, shelf location (prominent), barcode-scan status icon; item actions: Scan-verify · Mark picked · "Flag OOS" → substitute-picker sheet (suggested subs + search) → sends customer SC-015, line enters 60s "waiting on customer" state with countdown ring (mirrors SC-015); footer: "COMPLETE PACK" (enabled only when all lines resolved; timestamp recorded per FR-17) + "Print bag label".
  - **Components:** progress header, item cards, scanner integration (manual-entry fallback), substitute sheet, countdown ring (60s), giant footer buttons.
  - **Data & formatting:** pack-completion timestamps feed SLA analytics (FR-17); substitution price deltas per INR rule.
  - **States:** in-progress · scan-error (wrong barcode — big red flash + retry) · waiting-on-customer · packed (success — rider dispatch SC-023 fires) · error · edge: substitution timeout → line auto-refunded badge, pick continues uninterrupted (FR-30).
  - **Interactions:** scan-verify per line; OOS flow non-blocking for other lines; COMPLETE PACK hard-gated on all lines resolved.
  - **Accessibility:** scanner has manual-entry fallback; state changes announced; targets ≥56px.
- **Interactive elements:**

  | Element ID | Type | Selector hint | Expected behavior | Test case to generate |
  |------------|------|---------------|--------------------|------------------------|
  | IE-1 | button | `data-testid="pick-scan-{line}"` | Barcode verify; mismatch → red flash + retry | — |
  | IE-2 | button | `data-testid="pick-mark-{line}"` | Mark line picked (manual fallback) | — |
  | IE-3 | button | `data-testid="pick-flag-oos-{line}"` | Substitute sheet → fires customer SC-015, 60s wait | — |
  | IE-4 | sheet | `data-testid="pick-substitute-sheet"` | Suggested subs + search, pick one to propose | — |
  | IE-5 | button | `data-testid="pick-complete-pack"` | Enabled when all lines resolved → dispatch fires | — |
  | IE-6 | button | `data-testid="pick-print-label"` | Print bag label | — |

## 3. Component library deltas
_Anything the design phase added or modified in the shared component library._

| Component | Change | Reason |
|---|---|---|
| Buttons (primary/secondary/ghost, 44px min mobile; rider 56px giant variant; hold-to-confirm variant) | Created — v1 baseline, ratified from 03a primer | All CTAs; SC-026 hold-to-confirm |
| Product card + qty stepper (ADD→stepper 150ms morph, pill) | Created — v1 baseline | SC-005/006/007/008/009 |
| Order card, coupon card, category tile, address card | Created — v1 baseline | Customer lists |
| Pill chips (filter, status, ETA badge, price-delta) | Created — v1 baseline | Cross-client |
| Bottom sheet (app, 250ms) / modal (web, focus-trapped) | Created — v1 baseline | SC-011/015, address switcher |
| Skeleton loaders (list/grid/detail/table variants) | Created — v1 baseline | Every loading state; no spinners on shopping path |
| Toasts (success 3s / error 5s, always with reason) | Created — v1 baseline | Optimistic-UI reconcile, action results |
| Map suite (pin, rider marker, route line, zone polygon) — provider-agnostic | Created — v1 baseline | SC-003/014/020/029/039; re-skin pass after provider selection (non-blocking) |
| Stepper timeline (horizontal + vertical) | Created — v1 baseline | SC-014/017/032 |
| Floating cart bar, search bar, form inputs w/ inline validation | Created — v1 baseline | Customer shopping path |
| Countdown ring (30s / 60s) + text countdowns | Created — v1 baseline | SC-015/023/045 |
| Admin: data table (dense, sortable, keyboard nav), left-rail nav, filter rail, side drawer, audit-reason modal, KPI tile, tree view, permission grid | Created — v1 baseline | SC-028–045 |
| Rider theme variant (≥7:1 contrast, oversized type, 56px targets) | Created — v1 baseline | SC-021–027 |

## 4. Token deltas
_New brand colors, type ramps, spacings introduced for this project._

| Token name | Value | Purpose |
|---|---|---|
| `color.primary` | `#0FA958` | Brand green — CTAs, active, success, ETA (RATIFIED 2026-07-10) |
| `color.primary.pressed` | `#0C8746` | Pressed primary |
| `color.primary.tint` | `#E7F7EF` | Success/selected surfaces |
| `color.text` | `#111417` | Near-black body text (RATIFIED) |
| `color.text.secondary` | `#5A6169` | Secondary text |
| `color.accent.warm` | `#FF8A00` | Offers/discounts/coupons/COD banner only (RATIFIED) |
| `color.accent.warm.tint` | `#FFF3E4` | Offer surfaces |
| `color.error` / `color.warning` / `color.info` | `#DC2626` / `#F59E0B` / `#2563EB` | Semantic |
| `color.gray.1–8` | `#F7F8F9 → #2A3138` (8-step ramp, values in §1a) | Neutrals |
| `type.scale` | 12 / 14 / 16 / 20 / 24 / 32 — Inter, tabular numerals for figures | Type ramp (RATIFIED) |
| `space.grid` | 4/8pt | Spacing grid |
| `radius.input` / `radius.sheet` / `radius.pill` | 8px / 12px / 999px | Shape |
| `motion.fast` / `motion.sheet` / `motion.collapse` | 150–250ms ease-out / 250ms / 200ms | Durations |
| `elevation.1/2/3` | 1px border / soft shadow / scrim 40% | Elevation |

> Tokens above adopt the `03a` §1 primer proposal as **FINAL** — ratification recorded at this phase per pod decision 2026-07-10 (no separate designer sign-off cycle; spec-based project).

## 5. Designs folder map

```
designs/
  (reserved — empty in v1)
```

> Spec-based project: no exported Figma assets exist. The `designs/` folder is reserved for any future exported assets (e.g., post-v1 if a designer/Figma joins); FE specs in §2 are the build source. Screenshot evidence from visual QA lands in Phase 6 artifacts, not here.

## 6. Open items / known gaps
- [x] None blocking — all 45 screens (SC-001…SC-045) fully specced; design tokens ratified (§1a/§4); COD confirmed unconditional for v1 (BR-5 caps are runtime rules).
- [ ] **Non-blocking (Phase 6):** visual QA against real devices (Android/iOS customer app, Android rider devices in sunlight, store tablets at 1024, admin at 1280/1440) happens in Phase 6 testing — TC-VIS stubs seeded from the Interactive-elements tables via `/tc-augment`.
- [ ] **Non-blocking:** map components are provider-agnostic; a light re-skin pass follows maps-provider selection (BRS §10) — no layout impact.
- [ ] **Non-blocking:** SC-012 carries both gateway-handoff variants (web redirect / app SDK-intent) until the vendor is selected — no design impact either way.

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
- **Role:** Designer
- **Timestamp:** 2026-07-17T09:36:18Z
- **Status:** ✅ Frozen
- **Notes:** Spec-based design record per pod decision 2026-07-10 — no Figma; tokens ratified here. COD unconditional.
