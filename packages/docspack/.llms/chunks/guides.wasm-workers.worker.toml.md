# Wasm Job Workers — `worker.toml`

```toml
[worker]
name      = "charge-card"
version   = "0.1.0"
job_types = ["charge-card"]

[limits]
memory_mb      = 64
timeout_ms     = 10_000
max_concurrent = 8

[network]
allow = ["api.stripe.com:443"]   # omit when the worker makes no HTTP calls

[secrets]
names = ["STRIPE_KEY"]
```

A bundle check (`check_bundle` in `bpmnkit-wasm-contract`) reports a service-task job type that no worker
handles, and a worker job type that no service task uses.


## Sandbox limits

| Limit | Rule |
| --- | --- |
| Memory | `memory_mb`, at most 256. A job that exceeds it traps with a clear message. |
| Time | `timeout_ms`, at most 60 000, wall clock. A runaway job is stopped and failed. |
| Concurrency | `max_concurrent`, at most 64, bounded by a semaphore in the host. |
| Store | A fresh store per job: no state survives between jobs. |
| HTTP | `https` only, exact `host:port` allow-list, default port 443. Calls outside it fail the job at run time. A worker with no `[network]` allow-list cannot call HTTP at all. |
| HTTP addresses | The host resolves the name itself. Private, loopback, link-local, ULA and CGNAT addresses are refused. |
| HTTP body | Responses over 16 MiB are refused. |
| Secrets | Only names in `[secrets] names` resolve. The host reads `BPMNKIT_WASM_SECRET_<NAME>` or a secrets directory. |
| Source | No `build.rs`, proc macros, `include!`/`#[path]` tricks, or `unsafe`. Only `bpmnkit_wasm_sdk`, `serde` and `serde_json` may be used. |

---
Source: https://bpmnkit.com/docs/guides/wasm-workers
