---
"@bpmnkit/core": patch
"@bpmnkit/cli": patch
---

The published agent docs now say it themselves: `AGENTS.md` and the BPMN card tell an agent to read them once, that the card is self-sufficient (`casen build`: spec to lint-clean `.bpmn` and forms in one command) and not to search `dist/*.d.ts`; `casen agent-card <bpmn|dmn|form>` prints the same cards.
