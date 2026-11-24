# bpmnkit worker wasm — `samples.json`

An array of jobs that `test` (and `build`) run in the sandbox. `init` writes one:

```json
[{ "name": "greets", "job_type": "charge-card", "variables": { "name": "Ada" }, "expect": "complete" }]
```

| Field | Meaning |
|-------|---------|
| `name`, `job_type` | Required. |
| `variables` | Job variables (JSON). |
| `custom_headers` | Task headers, string map. |
| `expect` | `complete`, `fail` or `throw-error`. Omit to accept any outcome. |

---
Source: https://bpmnkit.com/docs/cli/wasm
