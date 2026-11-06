---
"@bpmnkit/core": minor
"@bpmnkit/cli": patch
---

An agent with only `@bpmnkit/core` installed now finds the agent cards: the package ships `AGENTS.md`, `llms.txt` and `agent-cards/{bpmn,dmn,form}.md` (new `agents` field in `package.json`). The README opens with a pointer to them, the `.d.ts` has a `@packageDocumentation` and `@see` card links on `Bpmn`, `Dmn`, `Dmn.drd()` and `Form`, and builder errors and `lintDmn`/`lintForm`/`casen check` findings end with `agent-cards/<type>.md#traps`.
