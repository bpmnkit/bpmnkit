# @crates/bpmnkit-cli

## 0.9.1

## 0.9.0

## 0.8.0

## 0.7.2

### Patch Changes

- 2680965: Add `bpmnkit worker wasm <args…>`, which forwards to the `bpmnkit-wasm` plugin (build, test and run Wasm job workers).
- 1ce4bd7: Help text and crate description no longer call `casen` an alias; `self update` on a Homebrew install suggests `brew upgrade bpmnkit-cli`.

## 0.7.1

## 0.7.0

### Minor Changes

- b638979: New crates: `bpmnkit-cli` (the native `bpmnkit` binary, alias `casen`), `bpmnkit-jobspec` (job-type classification), `bpmnkit-codegen` (deterministic Java/Rust worker generation), `bpmnkit-connectors` and `bpmnkit-connector-runtime` (REST connector templates and a local runner), `bpmnkit-profiles` (the shared profile store). The `bpmnkit` facade re-exports each behind a feature of the same name.
