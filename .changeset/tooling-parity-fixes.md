---
"@bpmnkit/core": patch
---

Fixes found while porting lint, compat and migration to Rust: `convertCamunda8To7` no longer throws on a multi-instance loop that has an `id`; the compat check reads a timer date's month in UTC (a valid date was flagged west of UTC); the `task/reusable-group` fix gives the extracted process a valid BPMN id when the job type has colons; JUEL variables and task-listener events named like `Object.prototype` members (`constructor`, `toString`, ...) are no longer mistaken for known names; `dmn/invalid-type-ref` names an output with no name or id as `?` instead of `undefined`.
