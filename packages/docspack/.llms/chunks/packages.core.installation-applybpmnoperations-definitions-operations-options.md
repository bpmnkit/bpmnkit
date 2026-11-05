# @bpmnkit/core — Installation — `applyBpmnOperations(definitions, operations, options?)`

Applies edit operations to the full model. The operation vocabulary is the same one an LLM
produces; applying it here rather than to a `CompactDiagram` means an edit touches only what it
names and leaves the document's pools, lanes, data wiring and Zeebe detail alone.

```typescript
import { applyBpmnOperations } from "@bpmnkit/core";

const { definitions, applied } = applyBpmnOperations(parsed, [
  { op: "rename", id: "Task_1", name: "Approve invoice" },
  { op: "update", id: "Task_1", patch: { jobType: "approve" } },
]);
```

**What `update` can patch.** Any compact field (`name`, `jobType`, `formId`, `inputs`,
`outputs`, `taskHeaders`, …) plus the user-task configuration — `assignee`, `candidateGroups`,
`candidateUsers`, `dueDate`, `followUpDate`, `priority` — and `properties` (`zeebe:properties`).
Each sets one attribute, so an existing `assignee` survives a patch that only adds
`candidateGroups`. `correlationKey` writes the `zeebe:subscription` of the `bpmn:message` the
element references, so every element sharing that message gets it; an element that references
no message is reported. A field whose extension the Zeebe schema does not allow on the element
(`assignee` on a service task) is reported rather than written. An empty string for `assignee`,
`candidateGroups`, `candidateUsers`, `dueDate`, `followUpDate` or `priority` removes that
attribute, an extension left with nothing in it is removed, and `properties: {}` removes
`zeebe:properties`.

`update` also edits event definitions, listeners and multi-instance. `messageName`, `errorCode`,
`escalationCode` and `signalName` are written on the root `bpmn:message` / `bpmn:error` /
`bpmn:escalation` / `bpmn:signal` the event references, which is created when the reference is
missing; a root shared by several elements is reported, not changed for all of them.
`timerDuration`, `timerDate`, `timerCycle` and `condition` set the timer or conditional event
definition. `multiInstance` changes only the parts it names (`collection`, `element`, `sequential`,
`outputCollection`, `outputElement`, `completionCondition`) and keeps the rest of the loop; an empty
string clears one, and an empty `collection` removes the loop. `executionListeners` and
`taskListeners` replace the whole list. An empty string clears these event fields too.

```typescript
applyBpmnOperations(parsed, [
  { op: "update", id: "Review", patch: { candidateGroups: "reviewers", priority: 80 } },
  { op: "update", id: "WaitForPayment", patch: { correlationKey: "=order.id" } },
]);
```

**Strict by default.** An operation naming an element that does not exist throws an
`OperationError` and nothing is applied — the previous implementation skipped such operations
silently, so a patch with a misspelled id reported success and changed nothing. Pass
`{ strict: false }` to get `{ definitions, applied, problems }` instead and decide for
yourself. The input is never mutated either way.

---
Source: https://bpmnkit.com/docs/packages/core
