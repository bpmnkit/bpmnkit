---
"@crates/bpmnkit-feel": patch
---

Rounding looks at every dropped digit, as `BigDecimal` does: `decimal(850.01, -2)` is `900` (was `800`), `decimal(0.2501, 1)` is `0.3`, `round half down(8.5001, 0)` is `9`, and a 34-digit result just past a tie rounds up (`1 + 0.00000000000000000000000000000000050001`). `fastnum`'s `rescale` decided half-even/half-down from the first dropped digit alone; it now only truncates.
