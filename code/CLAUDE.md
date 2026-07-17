---
schema_version: "0.4"
---

# CLAUDE.md — Dev playbook for GroFast

> This file is the **first thing** Claude Code (or any AI dev tool working in `code/`) should read at session start. It explains the conventions, contracts, and workflow for this project. The plugin generated it; do not edit it casually.

---

## What this project is

**Name:** GroFast
**ID:** `grofast`
**Lead:** Devendra Sharma
**Generated:** 2026-07-10T07:22:19Z

Built using the **AI-Native Greenfield** lifecycle. Every planning artifact lives at `../project-docs/`.

---

## Read this in order at every session

1. **This file** (you're already here)
2. `../project-docs/_briefs/00_PROJECT_OVERVIEW.md` — big-picture context
3. `../project-docs/_briefs/INDEX.md` — what's next (sequence + status)
4. `../project-docs/_briefs/<task-id>.md` — the brief for the task you'll work on

That's all. **Do not** read `01_brs.md`, `02b_architecture.md`, etc. directly — the briefs already contain everything you need (architecture is sliced into the brief).

---

## Folder layout

```
code/
├── CLAUDE.md          ← you're here
├── README.md          ← project README (build / run instructions)
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
├── .githooks/
│   └── pre-push       ← validates branch names
├── backend/           ← your territory (if backend tool)
├── frontend/          ← Gemini / Antigravity territory
└── runbooks/
    ├── ops.md         ← logs, alerts, rollbacks
    └── admin.md       ← day-to-day commands
```

If you're a backend tool (Claude Code, etc.): work in `backend/`. Don't touch `frontend/` unless the brief says so.
If you're a frontend tool (Gemini, etc.): work in `frontend/<feature>/`. See the per-story brief.

---

## Conventions you MUST follow

### Branch naming

```
task/E##-Th##-S##-T##-<slug>
```

Example: `task/E01-Th01-S01-T02-wire-signup-form`

The pre-push hook in `.githooks/pre-push` rejects non-conforming names. Configure git to use it:

```bash
git config core.hooksPath .githooks
```

### PR title

```
[E##-Th##-S##-T##] <verb> <object>
```

Example: `[E01-Th01-S01-T02] Wire signup form to API`

The bracketed task ID is **mandatory** — CI / hooks will reject without it.

### Commit messages

Atomic. Prefix with task ID. Example:

```
[E01-Th01-S01-T02] Wire signup form POST handler
```

### Test ID tagging

Every test that maps to a `TC-XXX` ID in `03b_test_cases.md` MUST be tagged. Without tagging, `/test-run-ingest` can't update the lifecycle.

| Framework | How to tag |
|---|---|
| **pytest** | `@pytest.mark.tc("TC-FUNC-001")` (define the marker in `conftest.py` or `pyproject.toml`) |
| **jest** | Test name format: `test('TC-FUNC-001 happy signup', () => { ... })` |
| **Playwright** | Test name format same as jest, or use `test.tag([{ name: 'tc', value: 'TC-FUNC-001' }])` |
| **Mocha** | Test name format: `it('TC-FUNC-001 happy signup', () => { ... })` |
| **Go** | Subtest name: `t.Run("TC_FUNC_001_happy_signup", ...)` (underscore form acceptable) |

The ingester regex is `TC-[A-Z]+-\d+` — matched against test name + classname. Either works; tagging is encouraged for clarity.

### Definition of Done (universal)

A task is done iff:
- [ ] All linked test cases pass (run via `/test-run-ingest`)
- [ ] PR reviewed by at least one human
- [ ] Acceptance criteria from the parent Story checked off in the PR description
- [ ] No new `[OPEN]` items introduced without owner + ETA
- [ ] Documentation updated (inline comments + relevant `.md` if architecture changed)
- [ ] No new lint / type-check warnings
- [ ] Branch name and PR title match the conventions above

---

## Workflow per task

```
1. Read INDEX.md → pick next eligible task
2. Read _briefs/<task-id>.md
3. Create branch: task/<task-id>-<slug>
4. Implement in code/backend/<area>/ (or frontend/<feature>/)
5. Write tests; tag them with TC-XXX IDs
6. Run tests locally; ensure they pass
7. Open PR with title [<task-id>] <title>
8. Fill PR body per .github/PULL_REQUEST_TEMPLATE.md
9. Wait for human review; iterate on comments
10. After merge: run /task-complete <task-id> --pr "#NN"
11. INDEX.md auto-regenerates; loop to step 1
```

---

## Frontend integration (if you're backend)

When the user tells you "frontend for `<story-id>` is ready in `code/frontend/<feature>/`":

1. Read `code/frontend/<feature>/INTEGRATION.md` — that's the contract
2. Wire the backend endpoints to the frontend's expectations (or vice versa if the frontend already mocked them)
3. Run integration tests
4. If anything is misaligned, raise it — don't silently change the frontend

---

## When you finish a feature (frontend tools only)

If you're Gemini / Antigravity / a frontend tool, before saying "done":

1. Make sure your code is in `code/frontend/<feature>/`
2. Write `code/frontend/<feature>/INTEGRATION.md` describing:
   - Components built
   - Routes registered
   - API calls made (URL, method, request shape, response handling)
   - State / data flow
   - Open questions for backend
3. Tell the user: *"Frontend for `<story-id>` is ready. Hand it to Claude Code for backend integration."*

---

## Things you must NOT do

- Don't read `project-docs/01_brs.md`, `02b_architecture.md`, etc. directly — use the briefs (they're sliced for you)
- Don't change branch / PR title format — automation depends on it
- Don't merge without `/task-complete` — INDEX and Excel go stale otherwise
- Don't skip `INTEGRATION.md` — backend can't integrate cleanly without it
- Don't introduce `[OPEN]` items without owner + ETA
- Don't touch `project-docs/_status/` — it's machine-managed
- Don't touch `project-docs/_briefs/` — regenerate via `/task-brief` if briefs are stale

---

## When in doubt

- **Task spec changed mid-development:** edit `04b_task_breakdown.md`, then run `/task-brief <task-id>` to regenerate that brief
- **A required design isn't ready:** if rolling mode is on, the brief will say `[OPEN — designs/<SC-XXX> pending]`. Block work on that story; pick another task. When designs land, regenerate the brief.
- **Tests fail repeatedly across iterations:** run `/triage-failures` — failures will be grouped into Fix Packets so each iteration has focused context.
- **You don't know which task to do next:** read `INDEX.md`. Pick the lowest-numbered ⏳ task with no unmet deps.

---

_Generated by `ai-native-greenfield` plugin 0.0.0._
