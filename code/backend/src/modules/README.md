# Backend modules — the seams of the monolith

`grofast-core` is a **modular monolith**, not a bag of folders. Per
`project-docs/02b_architecture.md` §4, each directory here is a module with a
real boundary, and those boundaries are enforced at lint time
(`E01-Th01-S01-T02`) rather than by convention alone.

## The rule

A module may import from another module **only** through that module's public
surface — its `index.ts` barrel. Reaching into `../orders/internal/...`, or
querying another module's tables directly, is a lint error.

Anything genuinely shared goes in `@grofast/types` (contracts) or
`src/shared/` (infrastructure primitives).

## Why this matters

02b §4 pre-declares the extraction order for 10× scale: catalog/search reads →
dispatch + tracking → payments → partner ingestion → notifications. That
sequence is only cheap if the seams are honest today. Every cross-module
shortcut taken now is a service extraction that fails later.

## Modules

| Module | Owns | Key requirements |
|---|---|---|
| `auth` | Users, phone-OTP, JWT + refresh rotation, sessions | FR-1, NFR-5 |
| `serviceability` | Zones (PostGIS), zone→store resolution, ETA inputs | FR-2, FR-3, FR-24, BR-1 |
| `catalog` | Products, categories, per-store price/availability | FR-4, FR-6, FR-21 |
| `search` | Meilisearch indexing + query surface | FR-5 |
| `cart` | Cart lifecycle, line items, caps | FR-7 |
| `pricing` | Fees, coupons, bill computation, GST | FR-9, BR-10 |
| `orders` | Order state machine, stock reservation, outbox emission | FR-12, FR-14, FR-30, BR-2, BR-3 |
| `payments` | Gateway-agnostic adapter, webhooks, reconciliation, refunds, COD | FR-10, FR-11, BR-4, BR-5 |
| `inventory` | Dark-store stock, GRN, adjustments, low-stock alerts | FR-22 |
| `partner-feeds` | Partner onboarding, API/CSV ingestion, staleness tracking | FR-23, BR-6 |
| `dispatch` | Rider assignment, job offers, tracking fan-out | FR-13, FR-18, FR-19, BR-7 |
| `notifications` | Templated push/SMS on lifecycle events | FR-28 |
| `audit` | Immutable audit log for money/stock mutations | FR-29, NFR-10 |
| `admin` | RBAC, ops surfaces, reporting reads | FR-25, FR-26, FR-27, FR-29 |

Each module's own tasks fill in its `index.ts`, service, and persistence. This
scaffold task (`E01-Th01-S01-T01`) creates only the directories and this
contract.
