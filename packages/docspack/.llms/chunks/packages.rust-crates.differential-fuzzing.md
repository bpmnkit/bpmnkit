# Rust crates — Differential fuzzing

`crates/bpmnkit-fuzz` generates random FEEL expressions, BPMN diagrams, DMN tables (parsed and
evaluated), forms and process text, runs each through both implementations and compares the
answers with the conformance suite's rules. Disagreements are shrunk to a minimal input.

```sh
pnpm --filter @bpmnkit/feel --filter @bpmnkit/core --filter @bpmnkit/engine build
pnpm fuzz --target feel --seconds 300        # or --target all
pnpm fuzz --replay target/fuzz-mismatches/feel-42.json
```

Every real disagreement becomes a conformance case and a fix on both sides.


## Versioning

The crates are versioned in lockstep, independently of the npm packages, and published
manually from a GitHub workflow. Each release notes which `@bpmnkit/core` and `@bpmnkit/feel`
versions its conformance corpus was recorded from.

---
Source: https://bpmnkit.com/docs/packages/rust-crates
