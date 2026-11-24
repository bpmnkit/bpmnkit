# bpmnkit worker wasm — Commands

```text
bpmnkit-wasm <command> [options]

  init <name> [--dir D]       scaffold worker.toml, src/lib.rs, samples.json
  check [DIR]                 render + cargo check (fast fix loop)
  build [DIR] [--out D]       full pipeline, writes worker.wasm, worker.toml, metadata.json
  test [DIR]                  full pipeline, prints the sample results
  inspect <wasm>              imports and exports of a component
  run [ARGS…]                 exec bpmnkit-wasm-host run ARGS…
```

`DIR` defaults to `.`. The `build` output directory defaults to `DIR/dist`.

| Command | What it does |
|---------|--------------|
| `init <name>` | Writes `worker.toml` (job type = `<name>`), `src/lib.rs` (a greeting worker) and `samples.json` into `./<name>` or `--dir`. Refuses a directory that already has a `worker.toml`. |
| `check` | Validates the manifest and sources, renders the Cargo project, runs `cargo check`. Compiler errors come back as diagnostics. |
| `build` | The full pipeline up to packaging. Writes `worker.wasm`, `worker.toml` and `metadata.json` to `--out` only when a component was produced. |
| `test` | The same pipeline, then runs every job in `samples.json` through the runner the host uses. Without samples the test fails: a worker nobody ran is not tested. Writes no files. |
| `inspect <wasm>` | Prints the component's imports and exports (`import …` / `export …`, or `{"imports":[…],"exports":[…]}` with `--format json`). |
| `run` | Execs `bpmnkit-wasm-host run` with the remaining arguments and returns its exit code. |

---
Source: https://bpmnkit.com/docs/cli/wasm
