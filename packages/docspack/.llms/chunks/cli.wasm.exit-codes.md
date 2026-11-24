# bpmnkit worker wasm — Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success (`ok: true` in the report). |
| `1` | The build or test ran and failed (`ok: false`), `run` returned the host's failure, or `run` could not start `bpmnkit-wasm-host`. |
| `2` | Usage or I/O error: no command, unknown command or option, missing argument, unreadable file (not for `run`), `init` over an existing worker, SDK not found. Printed on stderr as `bpmnkit-wasm: …`. |

---
Source: https://bpmnkit.com/docs/cli/wasm
