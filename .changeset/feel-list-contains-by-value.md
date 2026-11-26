---
"@bpmnkit/feel": patch
---

`list contains` compares lists, contexts and dates by value, like `index of` and the Rust evaluator: `list contains([[1]], [1])` is now `true` (was `false`).
