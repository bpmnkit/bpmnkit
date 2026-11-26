---
title: Wasm Job Workers
description: Write a Camunda 8 job worker in Rust, build it to a sandboxed WebAssembly component, and run it on a shared host. The bpmnkit worker wasm commands, the worker.toml manifest, sandbox limits, and what is not built yet.
sidebar:
  order: 4
---

A Wasm worker is a Rust function that handles one or more Camunda 8 job types. It is compiled to a
`wasm32-wasip2` component and run by `bpmnkit-wasm-host`, which talks to the cluster over the REST
API. The component cannot touch the host beyond what its manifest grants: no files, no environment,
no sockets, and HTTP only to the hosts it lists.

The manifest is the security boundary, not the Rust. A worker written by a model or a stranger is
run with the same limits as one you reviewed: memory, time, outbound hosts and secret names are
enforced by the build and again by the host.

## The flow

```sh
bpmnkit worker wasm init charge-card      # or: bpmnkit-wasm init charge-card
cd charge-card
bpmnkit worker wasm check                 # render + cargo check, the fast fix loop
bpmnkit worker wasm build --out dist      # full pipeline: worker.wasm, worker.toml, metadata.json
bpmnkit worker wasm test                  # run samples.json through the same runner the host uses
bpmnkit worker wasm inspect dist/worker.wasm
bpmnkit worker wasm run --dir dist        # exec bpmnkit-wasm-host run --dir dist
```

`bpmnkit worker wasm …` forwards to the `bpmnkit-wasm` binary, so both spellings do the same thing.
Every command, flag, exit code and the JSON report are in the [CLI reference](/docs/cli/wasm).
`run` reads the cluster from the active profile (`BPMNKIT_PROFILE_JSON`) or from `CAMUNDA_*`
variables. `--format json` prints the build report as JSON for tools.

`init` writes three files: `worker.toml`, `src/lib.rs` and `samples.json`. You edit the first two.
You cannot add crates: the platform renders `Cargo.toml`.

## The worker

```rust
use bpmnkit_wasm_sdk::prelude::*;

#[derive(Deserialize)]
struct Input { customer_id: String, amount_cents: u64 }

struct ChargeCard;

impl Worker for ChargeCard {
    fn handle(job: Job) -> Outcome {
        let input: Input = match job.variables() {
            Ok(v) => v,
            Err(e) => return Outcome::fail(format!("bad input: {e}")).no_retry(),
        };
        let Some(key) = secrets::get("STRIPE_KEY") else {
            return Outcome::fail("secret STRIPE_KEY missing").no_retry();
        };
        let res = http::post("https://api.stripe.com/v1/charges")
            .bearer(&key)
            .form(&[("customer", input.customer_id.as_str()),
                    ("amount", &input.amount_cents.to_string()),
                    ("currency", "eur")])
            .send();
        match res {
            Ok(r) if r.status() == 200 => Outcome::complete(json!({ "charged": true })),
            Ok(r) if r.status() == 402 => Outcome::throw_error("PAYMENT_DECLINED", "card declined"),
            Ok(r) => Outcome::fail(format!("stripe returned {}", r.status())),
            Err(e) => Outcome::fail(e.to_string()).backoff_ms(5_000),
        }
    }
}

bpmnkit_wasm_sdk::export!(ChargeCard);
```

The SDK API (`Job`, `Outcome`, `secrets`, `log`, `http`) is listed in
`wasm/crates/sdk/AGENT_GUIDE.md`.

## `worker.toml`

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

## Build stage timing

Measured with the debug test build in the cloud container, scaffold worker, on the WP4 branch.
The shared target directory was cold for the first row and warm for the rest.

| Stage | Time |
| --- | --- |
| Render project | 1 ms |
| `check` (cargo check) | 18.3 s cold, 0.36 s warm |
| `build` (release to wasm32-wasip2) | 14.6 s |
| Verify imports | 0 ms |
| Smoke test (`test`) | 2.6 s (3.1 s warm) |
| Package | 3 ms |
| Total, cold | 35.5 s |

A release build of a real worker will take longer than the scaffold. The 1 to 2 minute target in
[the design notes](https://github.com/bpmnkit/bpmnkit/blob/main/doc/wasm-workers/concept.md) is for
the full agent loop, not for one build.

## Running the host

```sh
bpmnkit-wasm-host run --dir ./workers --secrets-dir ./secrets
```

The host loads each directory with `worker.toml` and `worker.wasm`, checks the imports again against
the manifest, and starts one handler per component. It shuts down on SIGINT or SIGTERM and finishes
running jobs first.

## Builder, signed registry and hot-load

For a shared host, workers are built by a service, not on the developer's machine:

```sh
bpmnkit-wasm-builder keygen --key key.hex --pub pub.hex          # ed25519; pub.hex goes to hosts
BPMNKIT_BUILDER_TOKEN=<16+ chars> bpmnkit-wasm-builder serve --registry ./registry --signing-key key.hex
bpmnkit-wasm-host run --registry ./registry --trusted-key pub.hex --poll-ms 2000
```

- The builder takes a worker's manifest, source and samples over HTTP (`POST /builds`), runs the same
  pipeline as `bpmnkit-wasm build` in a sandbox (`bwrap` with no network, else `prlimit`), signs the
  component digest and manifest, and publishes to the registry. Build status and stage events are
  polled or streamed from `/builds/{id}`.
- The registry is a directory: `<name>/<digest>/` holds the component, manifest, metadata and
  signature, and `<name>/CURRENT` names the live version. A second registry backend can follow the same trait.
- Limits to know: the registry has no per-name ownership, so any token holder can publish any worker name
  (deploy with one trusted submitter, or one builder per team). There is no rollback protection: whoever
  can write the registry can point `CURRENT` at an older signed digest. The `bwrap` sandbox has no
  network and a read-only root, but the cargo home is bound writable and shared between builds. The
  builder queues at most `--max-queued` waiting builds (default 16) and answers `503` with `Retry-After`
  beyond that. Republishing a digest with a different manifest or signature is refused.
- The host verifies each `CURRENT` (digest, signature by the trusted key, inspect, job types) and swaps
  the handler when it moves. A version that fails verification is logged and the previous one keeps
  serving. Running jobs finish on the version they started with.
- Workers that appear after start-up need a host restart. A new version of a running worker is a hot-load.

The builder and host flags are in the [CLI reference](/docs/cli/wasm).

## Blueprint

[`wasm/examples/order-fulfilment`](https://github.com/bpmnkit/bpmnkit/tree/main/wasm/examples/order-fulfilment)
is an end-to-end appliance: an order process (check stock, charge card, a `PAYMENT_DECLINED` boundary
error that cancels the order) with two Wasm workers. Its README walks through the local loop, the
builder, the registry and the host, and running the process on reebe. Start there when you build your
own appliance; `submit.sh` shows how to send a worker to the builder.

[`wasm/examples/playground`](https://github.com/bpmnkit/bpmnkit/tree/main/wasm/examples/playground)
has smaller cases against public APIs with no keys. `frost-alert` uses only the REST connector
(`bpmnkit connector run`). `fx-invoice` adds a Wasm worker with no HTTP access. Each case has HTTP
stubs for an offline test and the commands for a live run on reebe.

## Not yet

- OCI distribution, KMS or Sigstore signing keys, and a gVisor or nsjail sandbox for the builder.
  The registry is a directory and the signing key is a file.
- WASI 0.3 async. Worker code is blocking.
- Vendored or pre-warmed dependencies. The first build compiles the SDK into the shared target.
- Wider dependency allow-list than the SDK, serde and serde_json.
- A warm pool of builder sandboxes, and a source tarball stored by digest.
- A Slack agent that generates a worker and asks for approval of its manifest.
