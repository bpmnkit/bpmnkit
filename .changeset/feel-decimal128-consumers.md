---
"@bpmnkit/engine": minor
"@bpmnkit/core": patch
"@bpmnkit/plugins": patch
---

Adapt to `@bpmnkit/feel` numbers being Decimal128 `FeelNumber`s (#320). The engine evaluates exactly inside a FEEL expression, so a gateway condition such as `= amount * 1.1 <= 110` with `amount = 100` takes the conditional flow, as on Camunda 8, and `0.1 + 0.2 = 0.3` is `true`. Process and DMN variables, DMN decision results and `feel:evaluated` event results stay plain JSON-like data: numbers are converted with `toJs` (a variable set from `0.1 + 0.2` is the JS number `0.3`). DMN `COLLECT` aggregations (`SUM`, `MIN`, `MAX`, `COUNT`) now add and compare exactly. The FEEL playground shows a number result with its scale (`100 * 1.1` is `110.0`), and the Zeebe validator recognises FEEL numbers when reporting a result type.
