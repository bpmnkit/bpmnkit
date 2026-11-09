# Rust crates — Requirements

- Rust 1.85 or later (MSRV). CI checks the crates on exactly that toolchain.
- Licence: `MIT OR Apache-2.0`.
- All crates share one version and are released together.


## Where they are published

Releases go to [crates.io](https://crates.io/crates/bpmnkit). API docs are built on
[docs.rs](https://docs.rs/bpmnkit). The source is in the `crates/` directory of the
[repository](https://github.com/bpmnkit/bpmnkit).


## How the Rust API maps to TypeScript

- One function or method per TS function, in snake_case: `parseBpmn` is `parse_bpmn`,
  `applyAutoLayout` is `apply_auto_layout`, `.serviceTask()` is `.service_task()`.
- Option objects are structs that deserialize from the same camelCase JSON.
- Where TS throws, Rust returns `Result` with TS's message. The builders keep the first error
  and return it from `build()`.

---
Source: https://bpmnkit.com/docs/packages/rust-crates
