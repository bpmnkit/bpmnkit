---
"@bpmnkit/feel": patch
"@crates/bpmnkit-feel": patch
---

`sum([])` (and `sum()`) now returns null, as DMN 1.5 (Table 75) and Camunda 8 do, instead of 0. `sum([0])` is still 0.
