---
"@bpmnkit/engine": minor
---

New `@bpmnkit/engine/cpt` export: `runCptTestCases({ bpmn, cases, select? })` runs a Camunda process-test (CPT) JSON file on reebe-wasm, one fresh engine per test case, and reports each case's pass/fail with the failing instruction's index, type and reason. Also exports `isCptFile`, `parseCptFile` and the CPT types. A user-task selector skips user tasks without `zeebe:userTask`, as CPT does: Zeebe runs those as job-worker user tasks. The validator no longer crashes on instruction types such as `constructor` or `__proto__`, and reports the full path of a bad `activateElements[i].variables`.
