# Rust crates — Numbers

FEEL numbers are exact decimals in Rust (`rust_decimal`, 28 significant digits) and float64 in
TypeScript. Results agree when compared to float64's 15 significant digits: `0.1 + 0.2` is
`0.3` in Rust and `0.30000000000000004` in TS. Beyond about 7.9 × 10²⁸ Rust has no number and
returns `null`, where TS still has a (rounded) float. Values too small for 28 fraction digits
round to 0 on both sides.


## Differential fuzzing

`crates/bpmnkit-fuzz` generates random FEEL expressions, BPMN diagrams, DMN tables (parsed and
evaluated), forms and process text, runs each through both implementations and compares the
answers with the conformance suite's rules. Disagreements are shrunk to a minimal input.

```sh
pnpm --filter @bpmnkit/feel --filter @bpmnkit/core --filter @bpmnkit/engine build
pnpm fuzz --target feel --seconds 300        # or --target all
pnpm fuzz --replay target/fuzz-mismatches/feel-42.json
```

Every real disagreement becomes a conformance case and a fix on both sides.

---
Source: https://bpmnkit.com/docs/packages/rust-crates
