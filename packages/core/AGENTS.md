# @bpmnkit/core for agents

Do not read README.md (20 KB) or the .d.ts files first. Read the one card for your task (~1k tokens each). Each has a runnable script, the top options and the known traps.

| You write | Read |
| --- | --- |
| BPMN process | `node_modules/@bpmnkit/core/agent-cards/bpmn.md` |
| DMN decision table or DRD | `node_modules/@bpmnkit/core/agent-cards/dmn.md` |
| Camunda form | `node_modules/@bpmnkit/core/agent-cards/form.md` |

Rules that hold for all three:

- Build with the builders (`Bpmn`, `Dmn`, `Form`). Never write XML or form JSON by hand.
- Edit an existing file with `Bpmn.parse` and the `export*Preserving` writers, so layout and formatting stay.
- `formId` and `decisionId` must equal the deployed form id and decision id exactly.
- Validate before you finish: `npx @bpmnkit/cli check order.bpmn risk.dmn review.form --deploy` (`casen check` if the CLI is installed). Fix every error.
- Builder errors and check findings end with `agent-cards/<type>.md#traps`. Read that section.

The full API reference is `builder-reference.md` in this folder. Open it only when a card does not cover an option.
