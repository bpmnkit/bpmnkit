# BPMN agent card — Not in the text spec

Event sub-processes, transactions, compensation, groups, nested lanes, a collapsed sub-process: write a module `flow.mjs` with `export default (kit) => kit.Bpmn.createProcess("id")…` (or `kit.Bpmn.createDiagram` for pools; `.eventSubProcess(id, (b) => …)`, `.transaction(id, (b) => …)`) and run `casen build flow.mjs`. The build splits a gateway that both joins and splits, and unlinks a message only thrown, as for a text spec.


## Traps

- A finding reads `✖ order.bpmn pay: <message> [<rule id>, .bpmnlintrc "<key>"]`: the key is what c8ctl lint calls the rule. Fix the model; do not silence rules unless the task says so.
- Deploy ids: `formId` and decision ids must equal the deployed form's and decision's ids. Generated forms already do; a hand-written `.form` next to the output is used instead of generating one with its id.
- A message caught after the start needs `key=` (`correlationKey`); a message start event does not. A message only thrown keeps its message and takes the key the process waits with (else `=correlationKey`).
- An event-based gateway (`eventgw`) is followed only by catch events.
- `casen build` refuses what Camunda 8 cannot deploy, one line per problem, `- <id>: <message> (zeebe/<rule>)`, and writes nothing.

---
Source: https://bpmnkit.com/docs/agent-cards/bpmn
