# BPMN agent card — Not in the text spec

Event sub-processes, transactions, compensation, groups, nested lanes: write `flow.mjs`, `export default (kit) => kit.Bpmn.createProcess("id")…` (pools: `createDiagram`; `.eventSubProcess(id, (b) => …)`, `.transaction(…)`), run `bpmnkit build flow.mjs`.


## Traps

- A finding `✖ order.bpmn pay: <message> [<rule id>, .bpmnlintrc "<key>"]` names c8ctl's rule key. Fix the model; never silence rules unless the task says so.
- `formId` and decision ids must equal the deployed form's and decision's ids. Generated forms do; a hand-written `.form` beside the output wins.
- A message caught after the start needs `key=`; a message start does not. An `eventgw` is followed only by catch events.
- `bpmnkit build` refuses what Camunda 8 cannot deploy (`- <id>: <message> (zeebe/<rule>)`) and writes nothing.

---
Source: https://bpmnkit.com/docs/agent-cards/bpmn
