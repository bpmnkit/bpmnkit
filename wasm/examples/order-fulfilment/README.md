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

Run from the repository root unless a path says otherwise. The signing key pair is made once.

```sh
# 1. Keys: key.hex stays with the builder, pub.hex goes to every host
bpmnkit-wasm-builder keygen --key key.hex --pub pub.hex

# 2. Builder: sandboxed cargo, signs each good build, publishes to ./registry
BPMNKIT_BUILDER_TOKEN="$(openssl rand -hex 16)" \
  bpmnkit-wasm-builder serve --registry ./registry --signing-key key.hex --warm
# keep it running; --warm pre-compiles the SDK on a cold cache (first start is slow)
```

`serve` listens on `127.0.0.1:8787` by default (`--listen` to change it). The token is
`BPMNKIT_BUILDER_TOKEN`: one token, or `caller=token` pairs separated by commas, each at least 16
characters. Every request sends it as `Authorization: Bearer <token>`. The builder runs cargo in
`bwrap` (no network, read-only toolchain) when available, else under `prlimit` with a startup
warning.

```sh
# 3. Submit both workers and wait for each signed entry (needs curl, jq, python3 >= 3.11)
export BPMNKIT_BUILDER_TOKEN=<the token you started serve with>
./submit.sh check-stock
./submit.sh charge-card
```

`submit.sh` reads `worker.toml` (manifest), `src/lib.rs` (source) and `samples.json` (samples), posts
them as the builder's `BuildRequest` to `POST /builds`, then polls `GET /builds/{id}` until `succeeded`
or `failed`. Each success prints the published name and digest. A failure prints the diagnostics.
Equivalent by hand:

```sh
curl -sS -H "Authorization: Bearer $BPMNKIT_BUILDER_TOKEN" -H 'content-type: application/json' \
  --data-binary @body.json http://127.0.0.1:8787/builds          # -> {"id":"…"}
curl -sS -H "Authorization: Bearer $BPMNKIT_BUILDER_TOKEN" http://127.0.0.1:8787/builds/<id>
curl -N  -H "Authorization: Bearer $BPMNKIT_BUILDER_TOKEN" http://127.0.0.1:8787/builds/<id>/events
```

`./run.sh submit` runs step 3 for both workers. The registry is a directory:
`registry/<name>/<digest>/{worker.wasm,worker.toml,metadata.json,worker.sig}` plus `registry/<name>/CURRENT`.

```sh
# 4. Host: verify each CURRENT (digest, signature, manifest, inspect), serve it, poll for new versions
mkdir -p secrets && printf '%s\n' "$PAYMENT_API_KEY" > secrets/PAYMENT_API_KEY
CAMUNDA_REST_ADDRESS=http://localhost:8080 \
  bpmnkit-wasm-host run --registry ./registry --trusted-key pub.hex --poll-ms 2000 \
  --secrets-dir ./secrets
```

Start the host after the builds succeed: workers that appear after start-up need a restart. Once
running, a new build of `charge-card` (a new `CURRENT`) is verified and swapped in on the next poll.
A version that fails verification is logged and the previous one keeps serving. `--dir` still works
for unsigned local builds (`bpmnkit-wasm build <worker> --out dir`). `--registry` and `--dir` may be
combined. A secret named in `worker.toml` is read from `--secrets-dir/<NAME>` or from the
`BPMNKIT_WASM_SECRET_<NAME>` environment variable.

## 3. Against reebe

Reebe listens on `:8080` (`bpmnkit reebe start --port 8080`); its gRPC gateway is on `:26500`.
Run the host from section 2 (step 4) against it, then deploy and start instances from a second shell.

```sh
bpmnkit reebe start                                   # second shell, leave running
ZEEBE_ADDRESS=http://localhost:8080 bpmnkit deploy deploy order.bpmn
```

`bpmnkit deploy` reads `ZEEBE_ADDRESS` (its default is `http://localhost:26500`, the gRPC port, so set
it explicitly for Reebe's REST API). It posts to `POST /v2/deployments` as `resources[]`, so the
equivalent is:

```sh
curl -sS -X POST http://localhost:8080/v2/deployments -F 'resources[]=@order.bpmn'
```

Start instances with `POST /v2/process-instances`. The body takes `processDefinitionId` (the BPMN
process id, `order-fulfilment`) and `variables`:

```sh
# happy path: stock check passes, charge-card completes -> "Order fulfilled"
curl -sS -X POST http://localhost:8080/v2/process-instances -H 'content-type: application/json' \
  -d '{"processDefinitionId":"order-fulfilment","variables":{"sku":"widget","quantity":2,"customerId":"c-1"}}'

# declined path: the payment API answers 402 for this customer -> PAYMENT_DECLINED -> "Order cancelled"
curl -sS -X POST http://localhost:8080/v2/process-instances -H 'content-type: application/json' \
  -d '{"processDefinitionId":"order-fulfilment","variables":{"sku":"widget","quantity":2,"customerId":"c-2"}}'
```

Each call returns `processInstanceKey`. The host logs each job it serves; a job with no worker
stays `CREATED` until one is registered.

`api.payments.example` is a placeholder host. Point `charge-card/worker.toml` (`[network] allow`) and
the URL in `charge-card/src/lib.rs` at a payment API you control, or at a mock that returns 402 for
`c-2`, before the declined path can run for real. Without a reachable payment API, `charge-card`
jobs fail (`fail`, retried), and the order neither fulfils nor cancels.
