---
"@bpmnkit/feel": patch
---

FEEL fixes found by differential fuzzing against the Rust twin: `**` returns `null` instead of `NaN` or `Infinity` (`(-8) ** (1/3)`, `10 ** 400`), as do `exp()` overflow and scaling a duration by zero; a list never equals a context (`[] in [{}]` was `true`); `decimal()` with a scale past ±300 rounds instead of returning its input (`decimal(1, -301)` is `0`); scaling a years-and-months duration gives whole months, rounded half away from zero (`@"P1Y2M" * 0.1` is `P1M`, not `P1.4M`); `union()` and `distinct values()` drop repeated dates, lists and contexts; `count`, `sum`, `product`, `mean`, `median`, `stddev`, `mode`, `all`, `any`, `min` and `max` no longer unwrap a one-item list of lists twice (`sum([[1, 2]])` is `null`, `count([[1, 2]])` is `1`, as the DMN spec has it); a long `for` no longer slows down quadratically when its body does not read `partial`.
