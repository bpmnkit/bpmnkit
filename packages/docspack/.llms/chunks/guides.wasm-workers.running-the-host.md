# Wasm Job Workers — Running the host

```sh
bpmnkit-wasm-host run --dir ./workers --secrets-dir ./secrets
```

The host loads each directory with `worker.toml` and `worker.wasm`, checks the imports again against
the manifest, and starts one handler per component. It shuts down on SIGINT or SIGTERM and finishes
running jobs first.


## Not yet

- The builder service (sandboxed rustc, warm pool), signing, OCI distribution and registry hot-load.
  The host loads a directory today.
- The Slack agent that generates a worker and asks for approval of its manifest.
- WASI 0.3 async. Worker code is blocking.
- Vendored or pre-warmed dependencies. The first build compiles the SDK into the shared target.
- A canned-response HTTP stub for `test`. The smoke test refuses every network name, so a worker
  that calls HTTP needs its HTTP path tested against a live host.
- Wider dependency allow-list than the SDK, serde and serde_json.

---
Source: https://bpmnkit.com/docs/guides/wasm-workers
