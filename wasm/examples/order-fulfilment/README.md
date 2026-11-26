# Order fulfilment blueprint

An appliance end to end: one BPMN process and two Wasm job workers.

```
Order received → Check stock → Charge card → Order fulfilled
                                  ╰ PAYMENT_DECLINED → Notify customer → Order cancelled
```

| Worker | Job type | Does |
|---|---|---|
| `check-stock/` | `check-stock` | looks up `sku` in a demo catalogue; completes `{ inStock, amountCents }`, throws `OUT_OF_STOCK` / `UNKNOWN_SKU` |
| `charge-card/` | `charge-card` | `POST https://api.payments.example/v1/charges` with secret `PAYMENT_API_KEY`; 402 → BPMN error `PAYMENT_DECLINED` |

`order.bpmn` is the process (`order-fulfilment`). Start it with `sku`, `quantity` and `customerId`.
"Notify customer" is a script task, so the declined path needs no third worker.

## 1. Local loop

```sh
./run.sh                                   # test both workers
bpmnkit-wasm test charge-card              # one worker
bpmnkit-wasm check charge-card             # fast compile check
```

`samples.json` lists sample jobs with the expected outcome. `charge-card` samples carry `http`
stubs (method, url, status, body): the smoke test answers matching requests from them, still
enforces the `[network] allow` list, and fails on an unmatched URL. No packet leaves the machine.

## 2. Builder → registry → host

```sh
# Builder: submit source + manifest + samples, get a signed registry entry
bpmnkit-wasm-builder serve --registry ./registry --signing-key key.hex
# Host: verify digest + signature, hot-load, swap on a new CURRENT
bpmnkit-wasm-host run --registry ./registry --trusted-key pub.hex
```

(Builder and host registry flags land with WP7/WP8; see `doc/wasm-workers/plan-m3.md`.) Without a
registry, `bpmnkit-wasm build <worker> --out dir` and `bpmnkit-wasm-host run --dir dir…` work.

## 3. Against reebe

```sh
bpmnkit reebe start
bpmnkit deploy order.bpmn
```

Give the host `PAYMENT_API_KEY` through its secrets dir. A `customerId` that the payment API
declines takes the boundary path to "Order cancelled".
