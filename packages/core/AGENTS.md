# @bpmnkit/core for agents

Do not read README.md (20 KB) or the .d.ts files first. Read the one card for your task (~1k tokens each). Each has a runnable script, the top options and the known traps.

| You write | Read |
| --- | --- |
| BPMN process | `node_modules/@bpmnkit/core/agent-cards/bpmn.md` |
| DMN decision table or DRD | `node_modules/@bpmnkit/core/agent-cards/dmn.md` |
| Camunda form | `node_modules/@bpmnkit/core/agent-cards/form.md` |

Rules that hold for all three:

- New files: build with the builders (`Bpmn`, `Dmn`, `Form`), never write a whole file by hand. One pool, up to ~15 nodes: compact JSON + `expand` (BPMN card, first example). Several pools or message flows: `Bpmn.createDiagram()`.
- Edit an existing file: ≤ 3 nodes or flows, edit the XML directly; bigger, `Bpmn.parse` and the `export*Preserving` writers, so layout and formatting stay.
- `formId` and `decisionId` must equal the deployed form id and decision id exactly.
- One gate: the lint/deploy command your task names; with none, `npx @bpmnkit/cli check order.bpmn risk.dmn review.form --deploy`. Fix every error.
- Done = gate clean + deploy succeeds. Stop there: never hand-route DI or render images.
- Builder errors and check findings end with `agent-cards/<type>.md#traps`. Read that section.

The full API reference is `builder-reference.md` in this folder. Open it only when a card does not cover an option.
