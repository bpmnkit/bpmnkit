# BPMN agent card — Top builder options

- `Bpmn.createProcess(id)` … `.build()`; `.withAutoLayout()` before `.build()`, or the file has no shapes.
- Every element takes `(id, options)`; ids are unique and each element connects to the previous one.
- `serviceTask(id, { name, taskType, retries, ioMapping: { inputs, outputs }, taskHeaders })`: `taskType` is the job type a worker subscribes to.
- `userTask(id, { name, zeebeUserTask: true, formId, assignee, candidateGroups, dueDate })`.
- `businessRuleTask(id, { decisionId, resultVariable })`: both are required to deploy.
- `scriptTask(id, { expression: "=a + b", resultVariable })`; `callActivity(id, { processId })`.
- Gateways: `.exclusiveGateway(id)` then `.branch(name, (b) => b.condition("=x > 1")...)`, one branch `b.defaultFlow()`; `.label(text)` sets the flow label. Merge with `.connectTo(id)` and declare that id after the last branch.
- Events take named options: `timerDuration: "PT1H"`, `messageName` + `correlationKey`, `errorCode`, `signalName`. `.withBoundary(id, { errorCode }, (b) => ...)` hangs a boundary on the previous task.
- `multiInstance: { collection: "=items", elementVariable: "item" }` on any task.
- Full method list: `packages/core/builder-reference.md` in `@bpmnkit/core`, or `npx bpmnkit-docs ask "<option>"`.

---
Source: https://bpmnkit.com/docs/agent-cards/bpmn
