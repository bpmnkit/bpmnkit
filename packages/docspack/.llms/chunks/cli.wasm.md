# bpmnkit worker wasm

`bpmnkit worker wasm …` builds, tests and runs [Wasm job workers](/docs/guides/wasm-workers). It
forwards its arguments unchanged to the `bpmnkit-wasm` binary, so `bpmnkit worker wasm build` and
`bpmnkit-wasm build` do the same thing. The main `bpmnkit` binary carries no Wasm runtime: it looks
for `bpmnkit-wasm` on `PATH` and in `~/.bpmnkit/plugins/bin`, and fails with a hint when it is missing.

Two binaries come from the `wasm/` workspace (Rust, `cargo install --path wasm/crates/build` and
`wasm/crates/host`):

| Binary | Crate | Job |
|--------|-------|-----|
| `bpmnkit-wasm` | `bpmnkit-wasm-build` | Scaffold, check, build, test and inspect a worker; `run` starts the host |
| `bpmnkit-wasm-host` | `bpmnkit-wasm-host` | Load built workers and serve their job types against a cluster |
| `bpmnkit-wasm-builder` | `bpmnkit-wasm-builder` | Build service: `serve` runs the HTTP API, `keygen` makes the ed25519 signing key pair |

---
Source: https://bpmnkit.com/docs/cli/wasm
