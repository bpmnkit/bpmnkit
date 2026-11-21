---
"@crates/bpmnkit": minor
"@crates/bpmnkit-cli": minor
"@crates/bpmnkit-codegen": minor
"@crates/bpmnkit-connector-runtime": minor
"@crates/bpmnkit-connectors": minor
"@crates/bpmnkit-jobspec": minor
"@crates/bpmnkit-profiles": minor
---

New crates: `bpmnkit-cli` (the native `bpmnkit` binary, alias `casen`), `bpmnkit-jobspec` (job-type classification), `bpmnkit-codegen` (deterministic Java/Rust worker generation), `bpmnkit-connectors` and `bpmnkit-connector-runtime` (REST connector templates and a local runner), `bpmnkit-profiles` (the shared profile store). The `bpmnkit` facade re-exports each behind a feature of the same name.
