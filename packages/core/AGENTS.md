# @bpmnkit/core for agents

Do not read README.md (20 KB) or the .d.ts files. Read the one card for your task (~2k tokens each); it is self-sufficient. BPMN: write a short spec with the Write tool and run one command, `npx casen build <spec> --deploy` (`@bpmnkit/cli`); it writes the .bpmn and its forms, lints and deploys.

| You write | Read |
| --- | --- |
| BPMN process | `node_modules/@bpmnkit/core/agent-cards/bpmn.md` |
| DMN decision table or DRD | `node_modules/@bpmnkit/core/agent-cards/dmn.md` |
| Camunda form | `node_modules/@bpmnkit/core/agent-cards/form.md` |

Rules that hold for all three:

- New BPMN: a `casen build` text spec (one pool, or `## Pool` sections with lanes, message flows, data). DMN and forms: the builders (`Dmn`, `Form`). Never write a whole file by hand.
- Edit an existing BPMN file: an edit module, `npx casen build edit.mjs --edit order.bpmn` (layout kept). DMN/forms: the `export*Preserving` writers.
- `formId` and `decisionId` must equal the deployed form id and decision id exactly.
- One gate: `casen build` lints like c8ctl (bpmnlint + camunda-compat) and prints the rule's `.bpmnlintrc` key; a task-named command is the final word. Fix every error.
- Done = gate clean + deploy succeeds. Stop there and answer in one line: never hand-route DI or render images.
- Builder errors and check findings end with `agent-cards/<type>.md#traps`. Read that section.

The full API reference is `builder-reference.md` in this folder. Open it only when a card does not cover an option.
