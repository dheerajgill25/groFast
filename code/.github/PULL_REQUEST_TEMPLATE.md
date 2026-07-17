---
schema_version: "0.4"
---

# [E##-Th##-S##-T##] <verb> <object>

<!--
PR title format is mandatory: [<task-id>] <verb> <object>
Examples:
  [E01-Th01-S01-T02] Wire signup form to API
  [E02-Th01-S01-T01] Create POST /signup endpoint
-->

## Task

**Task ID:** E##-Th##-S##-T##
**Linked story:** E##-Th##-S##
**Linked FRs:** FR-x, FR-y
**Linked test cases:** TC-FUNC-XXX, TC-NEG-XXX

## What changed

<!-- Bullet list of files and the reason for each change. -->

-

## Acceptance criteria (from the parent Story)

<!-- Copy the AC list from the task brief; check what this PR satisfies. Unchecked items remain visible to reviewer. -->

- [ ]
- [ ]

## Tests

<!-- Which TC-XXX cases this PR makes pass; any new tests added; manual smoke notes. -->

- TC-FUNC-XXX: pass / pending
- TC-NEG-XXX: pass / pending
- Manual smoke:

## Architecture conformance

<!-- Brief: which sections of 02b_architecture.md you followed; any deviations + why. -->

## AI tool's self-review

<!--
REQUIRED for AI-authored PRs (Claude Code / Gemini / etc.).
Be honest about uncertainty — surface it explicitly so the human reviewer knows where to look.
-->

- **Judgment calls made:**
- **Tradeoffs:**
- **Didn't have a way to test:**
- **Open questions for the reviewer:**

## Reviewer checklist

- [ ] Code style matches the rest of the codebase
- [ ] No secrets / hardcoded URLs / credentials
- [ ] Test coverage looks reasonable
- [ ] No new lint / type-check warnings
- [ ] Acceptance criteria met
- [ ] Documentation updated where needed

## After merge

Run from the project root:

```bash
/task-complete E##-Th##-S##-T## --pr "#<PR-number>"
```

(Or directly: `python3 ${CLAUDE_PLUGIN_ROOT}/scripts/task_complete.py --root . --task E##-Th##-S##-T## --pr "#NN"`)
