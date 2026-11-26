# Wasm Job Workers — Blueprint

[`wasm/examples/order-fulfilment`](https://github.com/bpmnkit/bpmnkit/tree/main/wasm/examples/order-fulfilment)
is an end-to-end appliance: an order process (check stock, charge card, a `PAYMENT_DECLINED` boundary
error that cancels the order) with two Wasm workers. Its README walks through the local loop, the
builder, the registry and the host, and running the process on reebe. Start there when you build your
own appliance; `submit.sh` shows how to send a worker to the builder.


## Not yet

- OCI distribution, KMS or Sigstore signing keys, and a gVisor or nsjail sandbox for the builder.
  The registry is a directory and the signing key is a file.
- WASI 0.3 async. Worker code is blocking.
- Vendored or pre-warmed dependencies. The first build compiles the SDK into the shared target.
- Wider dependency allow-list than the SDK, serde and serde_json.
- A warm pool of builder sandboxes, and a source tarball stored by digest.
- A Slack agent that generates a worker and asks for approval of its manifest.

---
Source: https://bpmnkit.com/docs/guides/wasm-workers
