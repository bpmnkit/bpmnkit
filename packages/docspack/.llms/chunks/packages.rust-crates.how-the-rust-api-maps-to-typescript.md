# Rust crates — How the Rust API maps to TypeScript

- One function or method per TS function, in snake_case: `parseBpmn` is `parse_bpmn`,
  `applyAutoLayout` is `apply_auto_layout`, `.serviceTask()` is `.service_task()`.
- Option objects are structs that deserialize from the same camelCase JSON.
- Where TS throws, Rust returns `Result` with TS's message. The builders keep the first error
  and return it from `build()`.


## Numbers

FEEL numbers are exact decimals in Rust (`rust_decimal`, 28 significant digits) and float64 in
TypeScript. Results agree when compared to float64's 15 significant digits: `0.1 + 0.2` is
`0.3` in Rust and `0.30000000000000004` in TS. Beyond about 7.9 × 10²⁸ Rust has no number and
returns `null`, where TS still has a (rounded) float. Values too small for 28 fraction digits
round to 0 on both sides.

---
Source: https://bpmnkit.com/docs/packages/rust-crates
