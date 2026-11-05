---
"@bpmnkit/core": minor
"@bpmnkit/cli": minor
---

`casen check <file...>` checks `.bpmn`, `.dmn` and `.form` files in one call, plus the form and decision references between them, with a rule id, element id and fix hint per finding (`--json`, `--deploy`, `--sketch`). Core adds `lintDmn(xml)` and `lintForm(json)`, and `OptimizeOptions.userTaskForms` to turn off the "user task needs a form" rule, which `casen lint` and `casen check` now report only under the deploy profile. `casen lint lint --profile sketch` skips all Camunda 8 deployability rules.
