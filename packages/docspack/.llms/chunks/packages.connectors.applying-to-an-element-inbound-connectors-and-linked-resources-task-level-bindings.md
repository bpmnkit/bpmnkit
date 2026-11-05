# @bpmnkit/connectors — Applying to an element — inbound connectors and linked resources — Task-level bindings

Besides `zeebe:input`, `zeebe:output` and friends, a template may bind a task's own Zeebe
extensions. `applyTemplateToElement` writes them; `applyElementTemplate` (builder options) reports
them as not expressible.

| Binding | `property` values |
| --- | --- |
| `zeebe:calledElement` | `processId`, `bindingType`, `versionTag`, `propagateAllParentVariables`, `propagateAllChildVariables` |
| `zeebe:calledDecision` | `decisionId`, `resultVariable`, `bindingType`, `versionTag` |
| `zeebe:userTask` | none — a flag: an active property marks a Camunda user task |
| `zeebe:formDefinition` | `formId`, `externalReference`, `bindingType`, `versionTag` |
| `zeebe:assignmentDefinition` | `assignee`, `candidateGroups`, `candidateUsers` |
| `zeebe:taskSchedule` | `dueDate`, `followUpDate` |
| `zeebe:priorityDefinition` | `priority` |
| `zeebe:script` | `expression`, `resultVariable` |

`bindingType` is `latest`, `deployment` or `versionTag`. An extension missing a required attribute
is not written and comes back as a problem. Re-applying a template to an element that already
carries its id owns all of these, so a binding a newer version dropped is removed.

---
Source: https://bpmnkit.com/docs/packages/connectors
