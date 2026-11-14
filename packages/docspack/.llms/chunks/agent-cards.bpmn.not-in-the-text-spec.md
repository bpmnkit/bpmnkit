# BPMN agent card — Not in the text spec

Event sub-processes, transactions, compensation, groups, nested lanes: write `flow.mjs`, `export default (kit) => kit.Bpmn.createProcess("id")…` (pools: `createDiagram`; `.eventSubProcess(id, (b) => …)`, `.transaction(…)`), run `casen build flow.mjs`.


## Traps

- A finding reads `✖ order.bpmn pay: <message> [<rule id>, .bpmnlintrc "<key>"]`: the key is c8ctl's rule name. Fix the model; do not silence rules unless the task says so.
- `formId` and decision ids must equal the deployed form's and decision's ids. Generated forms already do; a hand-written `.form` next to the output is used instead.
- A message caught after the start needs `key=`; a message start does not. An `eventgw` is followed only by catch events.
- `casen build` refuses what Camunda 8 cannot deploy, one line per problem, `- <id>: <message> (zeebe/<rule>)`, and writes nothing.

---
Source: https://bpmnkit.com/docs/agent-cards/bpmn
