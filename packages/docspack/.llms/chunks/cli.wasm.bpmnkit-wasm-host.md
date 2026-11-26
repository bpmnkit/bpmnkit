# bpmnkit worker wasm — `bpmnkit-wasm-host`

```sh
bpmnkit-wasm-host run --dir <worker-dir>... [--secrets-dir <dir>]
bpmnkit-wasm-host run --registry <dir> --trusted-key <hex-file> [--poll-ms 2000] [--secrets-dir <dir>]
```

Each `--dir` is a worker (a folder with `worker.toml` and `worker.wasm`, e.g. `dist`) or a folder
of workers. The host prints `loaded <name> <version> (<world>, <digest>)` per worker, registers one
handler per job type with `max_concurrent` as the active-job limit, and runs until SIGINT or
SIGTERM, then drains running jobs. Exit `0` on a clean stop, `1` on any startup error.

| Flag | Meaning |
|------|---------|
| `--dir <dir>...` | One or more worker directories (or folders of them). Loaded unsigned, never reloaded. |
| `--registry <dir>` | Directory registry (`<name>/CURRENT`). Serves every worker with a `CURRENT` at start-up and polls it. Needs `--trusted-key`. |
| `--trusted-key <hex-file>` | Ed25519 public key (32 bytes, hex) from `bpmnkit-wasm-builder keygen --pub`. A version is used only if its signature, digest, manifest and job types check out. |
| `--poll-ms <ms>` | Registry poll interval, default `2000`, must be positive. Needs `--registry`. |
| `--secrets-dir <dir>` | One file per secret, `<dir>/<NAME>`. Without it, secrets come from `BPMNKIT_WASM_SECRET_<NAME>`. |

`--dir` and `--registry` may be combined. A bad registry version is logged and the previous one keeps serving.

---
Source: https://bpmnkit.com/docs/cli/wasm
