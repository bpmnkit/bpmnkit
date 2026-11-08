# Rust crates — Overview

The `bpmnkit-*` crates are a Rust implementation of BPMN Kit's core, built next to the
TypeScript packages rather than instead of them. JavaScript hosts (browser, Node, the editor)
keep using `@bpmnkit/*`; Rust programs (CLIs, the reebe engine, the desktop app, servers) use
the crates natively, with no JS runtime.

The two are kept identical by a shared conformance suite under `conformance/` in the
repository: about 3,300 cases recorded from the TypeScript packages (the oracle) that the Rust
crates must reproduce byte for byte — models, serialized XML, lint findings, layout
coordinates, FEEL results. CI runs it on every pull request, and a nightly job fuzzes both
implementations against each other (see [Differential fuzzing](#differential-fuzzing)).

---
Source: https://bpmnkit.com/docs/packages/rust-crates
