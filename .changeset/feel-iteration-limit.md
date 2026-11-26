---
"@bpmnkit/feel": minor
"@crates/bpmnkit-feel": minor
---

Ranges and `for` / `some` / `every` stop at 1,000,000 items (`MAX_ITERATIONS`); past it the expression is null instead of running for minutes. Rust reports a new `WarningKind::IterationLimitExceeded` (`ITERATION_LIMIT_EXCEEDED`). Camunda has no such bound.
