# Playground: open-API use cases

Small, runnable processes that call public APIs with no keys, to try the published
`bpmnkit-cli` (0.9.0 on crates.io) and the Wasm tooling built from `wasm/`.

| Case | What it shows |
|---|---|
| [`frost-alert/`](frost-alert/) | REST connector only (`io.camunda:http-json:1`, run by `bpmnkit connector run`): Open-Meteo forecast, `resultExpression`, `errorExpression` → boundary, exclusive gateway |
| [`fx-invoice/`](fx-invoice/) | REST connector (Frankfurter rates) + a Wasm worker in the `worker` world (no HTTP) that converts and rounds line items; `UNSUPPORTED_CURRENCY` boundary |

Each folder has the BPMN, `samples.json` (HTTP stubs), `run.sh` (offline checks) and a README with
the exact live-run commands and recorded outputs.

Shared helpers:

- `connector-test.py <bpmn> <samples>`: runs a REST connector task's own input mappings and
  headers through `bpmnkit connector test` against a local stub, offline.
- `live.sh <process-id> '<vars>' [var …]`: starts an instance on reebe (or any Camunda 8 REST
  API at `CAMUNDA_REST_ADDRESS`), waits, prints the end event and variables.

## Setup

```sh
cargo install bpmnkit-cli --version 0.9.0 --locked
rustup target add wasm32-wasip2
# Wasm crates are publish = false: build them here (see fx-invoice/README.md)
cargo build --release --locked --manifest-path wasm/Cargo.toml -p bpmnkit-wasm-build -p bpmnkit-wasm-host
```

Tools: `python3`, `curl`, `jq`.

## Friction in the published 0.9.0

- `bpmnkit reebe start` (used by the order-fulfilment README) fails: "`reebe` is not ported to the
  native CLI yet and the legacy CLI (@bpmnkit/cli-legacy) was not found". Run `reebe-server`
  directly (commands in `frost-alert/README.md`).
- `bpmnkit worker wasm …` needs `bpmnkit-wasm`, which `cargo install` cannot fetch
  (`publish = false`). The error says how to build it from a checkout.
- `bpmnkit lint` reports false positives on every REST connector task: static input values (`GET`,
  `noAuth`) as undefined variables, and variables set by `resultExpression` (`tomorrowMin`) as never
  set. Fixed in the repository (`variable-flow`, TS and Rust), not in 0.9.0.
- `pattern/service-task-no-output` still warns on a connector task whose output comes from
  `resultExpression`.
- `samples.json` can only assert the outcome kind, not the variables, so `fx-invoice` keeps
  expected outputs in `expected.json` and compares them in `run.sh`.
- `bpmnkit render` crops a label that sits below the lowest shape.
