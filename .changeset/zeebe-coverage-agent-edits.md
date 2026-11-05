---
"@bpmnkit/core": minor
"@bpmnkit/proxy": minor
"@bpmnkit/docspack": patch
"@bpmnkit/plugins": patch
---

Zeebe coverage and agent edits.

- `@bpmnkit/core`:
  - The builder now covers call-activity I/O mappings and variable propagation, multi-instance on every task type, execution and task listeners, user-task form keys, external references and embedded forms, and conditional events.
  - `applyBpmnOperations` update patches set user-task assignment, schedule, priority, properties and message correlation keys; an empty string clears a value.
  - `getZeebeExtensions` now reads everything the writer emits.
  - `applyTemplates` takes `omitDefaults`.
  - Annotations inside sub-processes get diagram shapes.
  - Multi-instance `completionCondition` is no longer dropped.
- `@bpmnkit/proxy`: the MCP `update_element` tool applies these patches and reports unknown or misplaced keys.
- `@bpmnkit/docspack`: `bpmnkit-docs` works in a fresh source checkout, and recipe pages are added.
- `@bpmnkit/plugins`: the BPMN config panel handles user tasks that use a form key or an external reference.
