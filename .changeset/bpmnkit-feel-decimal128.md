---
"@crates/bpmnkit-feel": minor
"@crates/bpmnkit-compat": patch
---

FEEL numbers are DMN Decimal128 (34 significant digits, rounded half to even, Java `BigDecimal` semantics as in Camunda 8) instead of `rust_decimal`'s 28 digits (#320). Breaking: `Value::Number` holds the crate's own `bpmnkit_feel::Decimal` (a `fastnum::D256` wrapper), not `rust_decimal::Decimal`. `string()` keeps a number's scale, and `10 ** 400` or `exp(-67)` are numbers instead of `null` or `0`. The workspace MSRV rises from 1.85 to 1.94 (`fastnum` needs it).
