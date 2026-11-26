---
"@bpmnkit/core": patch
"@crates/bpmnkit-lint": patch
---

Lint `data-flow` no longer warns on connector tasks: static input values (`GET`, `noAuth`) are not read as undefined variables, and variables set by `resultExpression` or a script's `resultVariable` count as set.
