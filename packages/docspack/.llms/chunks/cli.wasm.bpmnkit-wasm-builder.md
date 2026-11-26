# bpmnkit worker wasm — `bpmnkit-wasm-builder`

```text
bpmnkit-wasm-builder serve --registry DIR --signing-key FILE [options]
bpmnkit-wasm-builder keygen [--key FILE] [--pub FILE]
```

| Option | Default | Meaning |
|--------|---------|---------|
| `--registry DIR` | required | Registry root the builder publishes to (created if missing). |
| `--signing-key FILE` | required | Ed25519 private key (hex) from `keygen`. |
| `--listen ADDR` | `127.0.0.1:8787` | Listen address. |
| `--max-builds N` | `2` | Concurrent cargo runs (checks and builds share the limit). |
| `--max-queued N` | `16` | Builds allowed to wait for a free slot; beyond that `POST /builds` returns `503` with `Retry-After`. |
| `--rate-burst N` / `--rate-per-min N` | `10` / `30` | Token bucket per caller; over the limit returns `429` with `Retry-After`. |
| `--warm` | off | Compile the SDK dependency set into the shared target dir before serving. |
| `--sdk PATH` | env `BPMNKIT_WASM_SDK` | `bpmnkit-wasm-sdk` crate. Found automatically inside the repo. |
| `--target-dir PATH`, `--work-dir PATH`, `--lockfile PATH` | cache dir, system temp, built-in | Shared cargo target, rendered projects, curated `Cargo.lock`. |
| `--offline` | off | `cargo --offline`. Always on under `bwrap`. |

`keygen` writes `key.hex` (mode 0600) and `pub.hex` by default, and refuses to overwrite existing files.

Auth: `BPMNKIT_BUILDER_TOKEN` holds one token, or `caller=token` pairs separated by commas. Each token
is at least 16 characters; send it as `Authorization: Bearer <token>`. A caller sees only its own builds.

| Endpoint | Body / result |
|----------|---------------|
| `POST /check` | `BuildRequest` → build report (diagnostics, stops after `cargo check`). |
| `POST /builds` | `BuildRequest` → `202 {"id"}`. |
| `GET /builds/{id}` | `{id, state: queued\|running\|succeeded\|failed, events, report?, published? {name, digest}, error?}`. |
| `GET /builds/{id}/events` | NDJSON stage events from the start, following until the build is done. |
| `GET /healthz` | `ok`. |

`BuildRequest` is `{"manifest": <worker.toml as JSON>, "source": "<src/lib.rs>", "samples": [<samples.json>]}`.
The [order-fulfilment blueprint](https://github.com/bpmnkit/bpmnkit/tree/main/wasm/examples/order-fulfilment/submit.sh)
has a `submit.sh` that builds it from a worker directory.

The sandbox is `bwrap` (no network, read-only root) when it works on the host; otherwise builds run under
`prlimit` caps with a warning at start-up. The work dir, the target dir and the cargo home are bound
writable, and the cargo home and target dir are shared between builds, so one build can leave files that
later builds read. Treat every token holder as trusted with the builder host's build cache.

The registry has no per-name ownership: any token holder can publish any worker name. Use a single trusted
submitter, or one builder (and registry) per team. There is no rollback protection either: whoever can
write the registry can point `CURRENT` at an older signed digest, and hosts will load it.

The cluster comes from `CAMUNDA_*` variables (`CAMUNDA_REST_ADDRESS`, `CAMUNDA_AUTH_STRATEGY`,
`CAMUNDA_CLIENT_ID`, …). When `CAMUNDA_REST_ADDRESS` is unset, the active
[profile](/docs/cli/casen#connection-profiles) passed in `BPMNKIT_PROFILE_JSON` fills the gaps,
which is what happens under `bpmnkit worker wasm run`.

See [Wasm Job Workers](/docs/guides/wasm-workers) for the SDK, sandbox limits and what is not built yet.

---
Source: https://bpmnkit.com/docs/cli/wasm
