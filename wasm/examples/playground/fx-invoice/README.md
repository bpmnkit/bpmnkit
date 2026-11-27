# fx-invoice: REST connector + Wasm worker

Converts EUR invoice lines into another currency. The REST connector fetches the day's ECB rates
from [Frankfurter](https://frankfurter.dev) (no key); a Wasm worker in the `worker` world (no HTTP
import at all) converts and rounds the lines.

```
Invoice drafted → Fetch EUR rates → Convert line items → Invoice converted
                    ╰ RATES_UNAVAILABLE   ╰ UNSUPPORTED_CURRENCY
                      → Note rates outage     → Flag for manual review → Needs review
                      → Left in EUR
```

| Task | Does |
|---|---|
| `rates` (REST connector) | `GET https://api.frankfurter.dev/v1/latest?base=EUR`; `resultExpression` keeps `rates` and `rateDate`; 404 / 422 → BPMN error `RATES_UNAVAILABLE`; other errors retry after `PT20S` |
| `convert` (`convert-invoice/`, Wasm) | each unit price × rate, rounded half away from zero to the currency's minor unit (none for JPY, KRW, ISK), then × quantity; completes `{ convertedLines, invoiceTotal, currency, rate }`. A currency with no rate throws `UNSUPPORTED_CURRENCY` with `unsupportedCurrency`. Bad input fails without retry. |

Start variables: `targetCurrency` (ISO code) and `lines` (`[{ description, quantity, unitPrice }]`, EUR).
`fxBase` is optional and overrides `https://api.frankfurter.dev` for the offline test.

`convert-invoice/worker.toml` has no `[network]` section, so the component is built for the
`worker` world and cannot make HTTP calls even if its code tried.

## Offline test

```sh
./run.sh
```

1. `bpmnkit lint invoice.bpmn`
2. `connector-samples.json` through `../connector-test.py` (the `rates` task's own mappings against
   a local stub; see `../frost-alert/README.md`)
3. `bpmnkit worker wasm test convert-invoice` on `convert-invoice/samples.json` (6 samples)
4. each sample's outcome compared with `convert-invoice/expected.json`, because `samples.json`
   can only assert the outcome kind (`complete` / `fail` / `throw-error`)

```
ok   latest EUR rates (/v1/latest?base=EUR)
ok   404 is the BPMN error RATES_UNAVAILABLE (/v1/latest?base=EUR)
ok   rates api down (/v1/latest?base=EUR)
3/3 connector samples passed
ok   eur to usd, rounded per unit
ok   eur to jpy, no minor units
ok   eur to eur needs no rate
ok   unsupported currency
ok   negative price
ok   bad input
outputs match expected.json
```

## Live run (reebe + the real API)

`bpmnkit worker wasm` forwards to `bpmnkit-wasm`, which is not on crates.io (`publish = false`).
Build it and the host from `wasm/` and put them where the published CLI looks:

```sh
rustup target add wasm32-wasip2
cargo build --release --locked --manifest-path wasm/Cargo.toml -p bpmnkit-wasm-build -p bpmnkit-wasm-host
mkdir -p ~/.bpmnkit/plugins/bin
ln -sf "$PWD/wasm/target/release/bpmnkit-wasm" "$PWD/wasm/target/release/bpmnkit-wasm-host" ~/.bpmnkit/plugins/bin/
```

Then, with reebe and `bpmnkit connector run` running as in `../frost-alert/README.md`:

```sh
cd wasm/examples/playground/fx-invoice
bpmnkit worker wasm build convert-invoice --out dist/convert-invoice
CAMUNDA_REST_ADDRESS=http://localhost:8080 bpmnkit worker wasm run --dir dist   # leave running
curl -sS -X POST http://localhost:8080/v2/deployments -F resources=@invoice.bpmn

L='"lines":[{"description":"Widget","quantity":2,"unitPrice":12.5},{"description":"Gizmo","quantity":1,"unitPrice":9.99}]'
../live.sh fx-invoice "{\"targetCurrency\":\"USD\",$L}" rateDate rate convertedLines invoiceTotal currency
../live.sh fx-invoice "{\"targetCurrency\":\"XXX\",$L}" unsupportedCurrency reviewNote
../live.sh fx-invoice '{"targetCurrency":"JPY","lines":[{"description":"Widget","quantity":3,"unitPrice":12.5}]}' rate convertedLines invoiceTotal
```

Recorded on 2026-11-26 (host: `loaded convert-invoice 0.1.0 (Worker, 9e59be53…)`):

```
instance 2251799813685554: COMPLETED at converted
  rateDate = "2026-11-25"
  rate = 1.0935
  convertedLines = [{"description":"Widget","lineTotal":27.34,"quantity":2,"unitPrice":13.67},{"description":"Gizmo","lineTotal":10.92,"quantity":1,"unitPrice":10.92}]
  invoiceTotal = 38.26
  currency = "USD"
instance 2251799813685581: COMPLETED at needs-review
  unsupportedCurrency = "XXX"
  reviewNote = "manual review: no rate for XXX"
instance 2251799813685405: COMPLETED at converted
  rate = 174.22
  convertedLines = [{"description":"Widget","lineTotal":6534.0,"quantity":3,"unitPrice":2178.0}]
  invoiceTotal = 6534.0
```
