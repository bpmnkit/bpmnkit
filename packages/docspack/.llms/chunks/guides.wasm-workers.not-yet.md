# Wasm Job Workers — Not yet

- OCI distribution, KMS or Sigstore signing keys, and a gVisor or nsjail sandbox for the builder.
  The registry is a directory and the signing key is a file.
- WASI 0.3 async. Worker code is blocking.
- Vendored or pre-warmed dependencies. The first build compiles the SDK into the shared target.
- Wider dependency allow-list than the SDK, serde and serde_json.
- A warm pool of builder sandboxes, and a source tarball stored by digest.
- A Slack agent that generates a worker and asks for approval of its manifest.

---
Source: https://bpmnkit.com/docs/guides/wasm-workers
