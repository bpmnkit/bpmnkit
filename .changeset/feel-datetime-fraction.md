---
"@bpmnkit/feel": patch
---

`date and time + duration` keeps fractional seconds exact: `@"2023-12-31T23:59:59" + 0.001 * @"P1D"` is `2024-01-01T00:01:25.4`, not `…25.40000009536743`. The fraction was added at epoch magnitude, where float64 keeps only about 1e-7 s; it is now added apart and rounded to nanoseconds.
