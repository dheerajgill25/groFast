---
schema_version: "0.4"
---

# GroFast — code

> Project root for the runnable code. The planning artifacts are at `../project-docs/`.

| | |
|---|---|
| **Project** | GroFast |
| **ID** | `grofast` |
| **Lead** | Devendra Sharma |
| **Generated** | 2026-07-10T07:22:19Z |

---

## Prerequisites

- Node ≥ 22 (Node 20 is EOL as of April 2026)
- pnpm ≥ 9 — `corepack enable && corepack prepare pnpm@9 --activate`

## Quick start

```bash
pnpm install       # from the repo root, not from code/
pnpm verify        # lint + typecheck + build + test — exactly what CI runs
pnpm --filter @grofast/core start:dev
curl localhost:3000/healthz
```

## Layout

The pnpm workspace root is the **repo root** (one level up from here).

```
grofast/
├── package.json           ← workspace root, `pnpm verify` lives here
├── pnpm-workspace.yaml
├── tsconfig.base.json     ← strict TS, inherited by every project
├── eslint.config.mjs
├── packages/
│   ├── types/             @grofast/types           — cross-boundary primitives
│   ├── contracts/         @grofast/contracts       — zod wire schemas + DTOs (backend & clients)
│   └── design-system/     @grofast/design-system   — ratified tokens (04a §1) + INR formatting
└── code/
    ├── CLAUDE.md          ← READ FIRST if you're an AI dev tool
    ├── README.md          ← (this file) human-facing
    ├── .github/PULL_REQUEST_TEMPLATE.md
    ├── .githooks/pre-push ← validates branch names
    ├── backend/           @grofast/core            — NestJS modular monolith
    ├── frontend/web/      @grofast/web             — customer storefront (Next.js) [E06-Th02]
    ├── frontend/admin/    @grofast/admin           — ops dashboard (React) [E07]
    ├── mobile/customer/   @grofast/mobile-customer — customer app (RN) [E06-Th01]
    ├── mobile/rider/      @grofast/mobile-rider    — rider app (RN) [E06-Th03]
    └── runbooks/
        ├── ops.md
        └── admin.md
```

Client packages are scaffolded placeholders — the task that implements each is
noted in brackets.

## Scripts (run from repo root)

| Command | What it does |
|---|---|
| `pnpm verify` | The full gate: lint → typecheck → build → test |
| `pnpm build` / `pnpm test` | Recursive across all packages |
| `pnpm lint` | ESLint, zero warnings tolerated |
| `pnpm typecheck` | `tsc --noEmit` per project |
| `pnpm format` | Prettier write |

## Two things worth knowing before you write code

**Money is paise.** Amounts are integers in paise everywhere — never float
rupees. Format via `formatInr` from `@grofast/design-system`; the Indian digit
grouping (`₹1,23,456`) and the paise-only-when-non-zero rule are non-obvious and
centrally tested. Don't reach for `toLocaleString`.

**The monolith has real seams.** `code/backend/src/modules/` are enforced
boundaries, not just folders — cross-module reach-ins fail lint, and each module
owns its own Postgres schema with no cross-schema joins or FKs. Read
`code/backend/src/modules/README.md` before adding any cross-module import;
02b §4 depends on those seams staying honest.

**Wire shapes live in `@grofast/contracts`.** One zod schema per shape, shared by
the backend and every client — the backend validates with it, clients infer
types from it, and there's no drift between the two.

## Setup

### Enable the branch-name hook

```bash
git config core.hooksPath .githooks
```

### Branch & PR conventions

- Branches: `task/E##-Th##-S##-T##-<slug>`
- PR titles: `[E##-Th##-S##-T##] <verb> <object>`
- After every merge: `/task-complete E##-Th##-S##-T## --pr "#NN"`

## Tests

Vitest across the workspace. Tests that map to a `TC-XXX` case must carry the ID
in the test name so `/test-run-ingest` can update the lifecycle:

```ts
it('TC-FUNC-001 happy signup', () => { /* ... */ });
```

To produce a report the ingester can read:

```bash
pnpm test -- --reporter=junit --outputFile=runs/junit.xml
/test-run-ingest runs/junit.xml
```

## Where to read more

- `CLAUDE.md` — full dev playbook for AI tools
- `../project-docs/_briefs/00_PROJECT_OVERVIEW.md` — project bootstrap
- `../project-docs/_briefs/INDEX.md` — what's next
