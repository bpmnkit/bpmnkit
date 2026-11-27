# Wasm Job Workers — Blueprint

[`wasm/examples/order-fulfilment`](https://github.com/bpmnkit/bpmnkit/tree/main/wasm/examples/order-fulfilment)
is an end-to-end appliance: an order process (check stock, charge card, a `PAYMENT_DECLINED` boundary
error that cancels the order) with two Wasm workers. Its README walks through the local loop, the
builder, the registry and the host, and running the process on reebe. Start there when you build your
own appliance; `submit.sh` shows how to send a worker to the builder.

[`wasm/examples/playground`](https://github.com/bpmnkit/bpmnkit/tree/main/wasm/examples/playground)
has smaller cases against public APIs with no keys. `frost-alert` uses only the REST connector
(`bpmnkit connector run`). `fx-invoice` adds a Wasm worker with no HTTP access. `country-check` is a
Wasm worker that calls one allowed host itself. Each case has HTTP
stubs for an offline test and the commands for a live run on reebe.

---
Source: https://bpmnkit.com/docs/guides/wasm-workers
