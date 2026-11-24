# Wasm Job Workers — The flow

```sh
bpmnkit worker wasm init charge-card      # or: bpmnkit-wasm init charge-card
cd charge-card
bpmnkit worker wasm check                 # render + cargo check, the fast fix loop
bpmnkit worker wasm build --out dist      # full pipeline: worker.wasm, worker.toml, metadata.json
bpmnkit worker wasm test                  # run samples.json through the same runner the host uses
bpmnkit worker wasm inspect dist/worker.wasm
bpmnkit worker wasm run --dir dist        # exec bpmnkit-wasm-host run --dir dist
```

`bpmnkit worker wasm …` forwards to the `bpmnkit-wasm` binary, so both spellings do the same thing.
Every command, flag, exit code and the JSON report are in the [CLI reference](/docs/cli/wasm).
`run` reads the cluster from the active profile (`BPMNKIT_PROFILE_JSON`) or from `CAMUNDA_*`
variables. `--format json` prints the build report as JSON for tools.

`init` writes three files: `worker.toml`, `src/lib.rs` and `samples.json`. You edit the first two.
You cannot add crates: the platform renders `Cargo.toml`.

---
Source: https://bpmnkit.com/docs/guides/wasm-workers
