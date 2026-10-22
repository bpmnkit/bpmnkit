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
(`assignee` on a service task) is reported rather than written.

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
