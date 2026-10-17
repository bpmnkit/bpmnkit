---
"@bpmnkit/core": patch
---

`pattern/gateway-no-default-flow` and `pattern/subprocess-no-error-boundary` report warnings instead of errors. Camunda's own reference diagrams trip both and its lint gate does not flag them, so a correct model now passes `--profile deploy` with 0 errors.
