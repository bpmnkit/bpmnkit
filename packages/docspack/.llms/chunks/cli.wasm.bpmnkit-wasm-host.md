# bpmnkit worker wasm — `bpmnkit-wasm-host`

```sh
bpmnkit-wasm-host run --dir <worker-dir>... [--secrets-dir <dir>]
```

Each `--dir` is a worker (a folder with `worker.toml` and `worker.wasm`, e.g. `dist`) or a folder
of workers. The host prints `loaded <name> <version> (<world>, <digest>)` per worker, registers one
handler per job type with `max_concurrent` as the active-job limit, and runs until SIGINT or
SIGTERM, then drains running jobs. Exit `0` on a clean stop, `1` on any startup error.

The cluster comes from `CAMUNDA_*` variables (`CAMUNDA_REST_ADDRESS`, `CAMUNDA_AUTH_STRATEGY`,
`CAMUNDA_CLIENT_ID`, …). When `CAMUNDA_REST_ADDRESS` is unset, the active
[profile](/docs/cli/casen#connection-profiles) passed in `BPMNKIT_PROFILE_JSON` fills the gaps,
which is what happens under `bpmnkit worker wasm run`.

See [Wasm Job Workers](/docs/guides/wasm-workers) for the SDK, sandbox limits and what is not built yet.

---
Source: https://bpmnkit.com/docs/cli/wasm
