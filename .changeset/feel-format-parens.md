---
"@bpmnkit/feel": patch
"@crates/bpmnkit-feel": minor
---

`formatFeel` keeps the parentheses the printed text needs, so formatting a parsed expression no longer changes its value or breaks re-parsing (`(1 + 2) * 3`, `x in (1, 2)`, …). New Rust `bpmnkit_feel::format()` (and `Expression::format()`, `UnaryTests::format()`) gives the same output.
