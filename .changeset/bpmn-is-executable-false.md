---
"@bpmnkit/core": patch
---

BPMN model: `process.isExecutable` now keeps an explicit `isExecutable="false"` (absent, `true` and `false` are three states) instead of dropping it, and `isForCompensation` is kept on `subProcess`, `adHocSubProcess`, `transaction` and `eventSubProcess`, as it already was on tasks. The type is unchanged.
