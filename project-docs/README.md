---
schema_version: "0.4"
---

# GroFast

> Zepto-style hyperlocal grocery delivery platform (hybrid: dark stores + local store marketplace) with ultra-fast ordering, real-time tracking, secure payments, inventory management, and analytics

| | |
|---|---|
| **Project ID** | `grofast` |
| **Type** | greenfield |
| **Lead** | Devendra Sharma |
| **Started** | 2026-07-10 |

This project follows the **AI-Native Greenfield** lifecycle. Every phase produces a canonical `.md` file that the next phase reads as input. Hard human gates between phases are enforced via `/X-freeze` slash commands.

---

## Phase index

| # | Phase | File | Human-readable | Status |
|---|---|---|---|---|
| 0  | Knowledge Base       | `00_kb.md`                  | —                                  | ⚪️ Not started |
| 1  | BRS                  | `01_brs.md`                 | `_readable/01_brs.pdf`             | ⚪️ Not started |
| 2a | Screens              | `02a_screens.md`            | `_readable/02a_screens.pdf`        | ⚪️ Not started |
| 2b | Architecture         | `02b_architecture.md`       | `_readable/02b_architecture.html`  | ⚪️ Not started |
| 3a | Designer Prompts     | `03a_designer_prompts.md`   | —                                  | ⚪️ Not started |
| 3b | Test Cases           | `03b_test_cases.md`         | `_readable/03b_test_cases.xlsx`    | ⚪️ Not started |
| 4a | Design               | `04a_design.md`             | (designs/ folder)                  | ⚪️ Not started |
| 4b | Task Breakdown       | `04b_task_breakdown.md`     | `_readable/04b_task_breakdown.xlsx`| ⚪️ Not started |
| 5  | Development          | `05_development.md`         | —                                  | ⚪️ Not started |
| 6  | Testing              | `06_testing.md`             | —                                  | ⚪️ Not started |
| 7  | Code Review          | `07_code_review.md`         | —                                  | ⚪️ Not started |
| 8  | Release              | `08_release.md`             | —                                  | ⚪️ Not started |
| 9  | PM Status (auto)     | `09_pm_status.md`           | `_readable/dashboard.html`         | 🟢 Live        |

> Status icons: ⚪️ not started · 🟡 in progress · 🟠 awaiting review · ✅ frozen · 🔒 blocked · 🔄 revising · 🟢 live

The **canonical status** lives in `_status/status.json` and `_status/events.jsonl`. `09_pm_status.md` is auto-regenerated from those.

---

## Sibling folders

- `../designs/` — Figma exports / images / videos for approved designs
- `../code/` — runnable monorepo (apps, packages, runbooks)

---

## How phases unlock

```
00_kb ──▶ 01_brs ──▶ ┬─▶ 02a_screens ──▶ 03a_designer_prompts ──▶ 04a_design ──┐
                     │                                                          ├──▶ 05_development ⇄ 06_testing ──▶ 07_code_review ──▶ 08_release
                     └─▶ 02b_architecture ──▶ 03b_test_cases ──▶ 04b_task_breakdown ┘
```

A phase **cannot** be started until every dependency is ✅ frozen. The fork at BRS means `02a_screens` and `02b_architecture` can run truly in parallel.

---

## Open items

`[OPEN]` markers across the docs are tracked in `_status/status.json → open_items.count`.
Resolve them (or carry them forward with explicit owner + ETA) at every phase boundary.

---

_This file is a project README — it is hand-edited as phases progress. The canonical status surface is `_status/status.json`._
