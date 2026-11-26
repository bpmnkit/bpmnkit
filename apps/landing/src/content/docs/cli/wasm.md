---
title: bpmnkit worker wasm
description: Reference for bpmnkit worker wasm and the bpmnkit-wasm / bpmnkit-wasm-host binaries — commands, flags, the worker.toml manifest, samples.json, exit codes and the JSON build report.
sidebar:
  order: 10
---

`bpmnkit worker wasm …` builds, tests and runs [Wasm job workers](/docs/guides/wasm-workers). It
forwards its arguments unchanged to the `bpmnkit-wasm` binary, so `bpmnkit worker wasm build` and
`bpmnkit-wasm build` do the same thing. The main `bpmnkit` binary carries no Wasm runtime: it looks
for `bpmnkit-wasm` on `PATH` and in `~/.bpmnkit/plugins/bin`, and fails with a hint when it is missing.

Two binaries come from the `wasm/` workspace (Rust, `cargo install --path wasm/crates/build` and
`wasm/crates/host`):

| Binary | Crate | Job |
|--------|-------|-----|
| `bpmnkit-wasm` | `bpmnkit-wasm-build` | Scaffold, check, build, test and inspect a worker; `run` starts the host |
| `bpmnkit-wasm-host` | `bpmnkit-wasm-host` | Load built workers and serve their job types against a cluster |
| `bpmnkit-wasm-builder` | `bpmnkit-wasm-builder` | Build service: `serve` runs the HTTP API, `keygen` makes the ed25519 signing key pair |

## Commands

```text
bpmnkit-wasm <command> [options]

  init <name> [--dir D]       scaffold worker.toml, src/lib.rs, samples.json
  check [DIR]                 render + cargo check (fast fix loop)
  build [DIR] [--out D]       full pipeline, writes worker.wasm, worker.toml, metadata.json
  test [DIR]                  full pipeline, prints the sample results
  inspect <wasm>              imports and exports of a component
  run [ARGS…]                 exec bpmnkit-wasm-host run ARGS…
```

`DIR` defaults to `.`. The `build` output directory defaults to `DIR/dist`.

| Command | What it does |
|---------|--------------|
| `init <name>` | Writes `worker.toml` (job type = `<name>`), `src/lib.rs` (a greeting worker) and `samples.json` into `./<name>` or `--dir`. Refuses a directory that already has a `worker.toml`. |
| `check` | Validates the manifest and sources, renders the Cargo project, runs `cargo check`. Compiler errors come back as diagnostics. |
| `build` | The full pipeline up to packaging. Writes `worker.wasm`, `worker.toml` and `metadata.json` to `--out` only when a component was produced. |
| `test` | The same pipeline, then runs every job in `samples.json` through the runner the host uses. Without samples the test fails: a worker nobody ran is not tested. Writes no files. |
| `inspect <wasm>` | Prints the component's imports and exports (`import …` / `export …`, or `{"imports":[…],"exports":[…]}` with `--format json`). |
| `run` | Execs `bpmnkit-wasm-host run` with the remaining arguments and returns its exit code. |

## Options

| Option | Applies to | Meaning |
|--------|-----------|---------|
| `--format text\|json` | all but `run` | Output format. Default `text`. |
| `--dir D` | `init` | Target directory instead of `./<name>`. |
| `--out D` | `build` | Output directory instead of `DIR/dist`. |
| `--sdk PATH` | `check`, `build`, `test` | Path to the `bpmnkit-wasm-sdk` crate. Env `BPMNKIT_WASM_SDK`; inside the repo it is found automatically. |
| `--target-dir PATH` | `check`, `build`, `test` | Shared cargo target directory. Env `BPMNKIT_WASM_TARGET_DIR`; default `$XDG_CACHE_HOME/bpmnkit-wasm/target` (else `~/.cache/…`). |

An unknown command prints the usage and fails; an unknown option prints an error and fails.

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success (`ok: true` in the report). |
| `1` | The build or test ran and failed (`ok: false`), `run` returned the host's failure, or `run` could not start `bpmnkit-wasm-host`. |
| `2` | Usage or I/O error: no command, unknown command or option, missing argument, unreadable file (not for `run`), `init` over an existing worker, SDK not found. Printed on stderr as `bpmnkit-wasm: …`. |

## `worker.toml`

The manifest is what a human approves. Unknown keys are rejected. Everything except `[worker]` is optional.

```toml
[worker]
name      = "charge-card"      # ^[a-z0-9][a-z0-9-]{0,62}$
version   = "0.1.0"            # semver
job_types = ["charge-card"]    # same pattern, no wildcards, no duplicates, at least one

[limits]
memory_mb      = 64            # default 64,     ceiling 256
timeout_ms     = 10_000        # default 10 000, ceiling 60 000
max_concurrent = 8             # default 8,      ceiling 64

[network]
allow = ["api.stripe.com:443"] # exact host:port, port 443 only; empty = no HTTP at all

[secrets]
names = ["STRIPE_KEY"]         # ^[A-Z][A-Z0-9_]{0,63}$
```

| Field | Rule |
|-------|------|
| `limits.*` | Greater than 0 and at most the platform ceiling; a manifest may ask for less, never more. |
| `network.allow` | An empty list builds the `worker` world (no HTTP import); a non-empty list builds `worker-http`. Entries must be unique. |
| `secrets.names` | The host resolves a name from `BPMNKIT_WASM_SECRET_<NAME>` or a file in `--secrets-dir`. |

Violations are listed together, e.g. ``limit memory_mb = 512 exceeds the platform ceiling 256``.

## `samples.json`

An array of jobs that `test` (and `build`) run in the sandbox. `init` writes one:

```json
[{ "name": "greets", "job_type": "charge-card", "variables": { "name": "Ada" }, "expect": "complete" }]
```

| Field | Meaning |
|-------|---------|
| `name`, `job_type` | Required. |
| `variables` | Job variables (JSON). |
| `custom_headers` | Task headers, string map. |
| `expect` | `complete`, `fail` or `throw-error`. Omit to accept any outcome. |
| `http` | Canned HTTP answers: `[{ "method", "url", "status", "headers"?, "body"? }]`. The smoke test answers a matching request from the first stub with that method and URL; the `[network] allow` list is still checked first; an unmatched request fails the job and names the URL. |

## JSON output

`--format json` prints the build report that `check`, `build` and `test` produce:

```json
{
  "ok": false,
  "diagnostics": [
    { "file": "src/lib.rs", "line": 7, "col": 9, "code": "E0308", "message": "mismatched types", "suggestion": "…" }
  ],
  "tests": [{ "name": "greets", "passed": true, "duration_ms": 4 }],
  "timings": [{ "stage": "check", "ms": 360 }],
  "artifact": { "component_digest": "…", "source_digest": "…", "manifest": {}, "contract_version": "…", "sdk_version": "…", "toolchain": "rustc …", "lock_digest": "…" }
}
```

`suggestion` and `tests[].message` appear only when set; `artifact` only after a successful package
stage. The text format prints one `file:line:col: code: message` line per diagnostic (with an
indented `hint:`), one `ok` / `FAIL` line per sample, and a final `ok|failed — stage N ms, …` line.
`build` also writes the same artifact data to `metadata.json`.

## `bpmnkit-wasm-host`

```sh
bpmnkit-wasm-host run --dir <worker-dir>... [--secrets-dir <dir>]
bpmnkit-wasm-host run --registry <dir> --trusted-key <hex-file> [--poll-ms 2000] [--secrets-dir <dir>]
```

Each `--dir` is a worker (a folder with `worker.toml` and `worker.wasm`, e.g. `dist`) or a folder
of workers. The host prints `loaded <name> <version> (<world>, <digest>)` per worker, registers one
handler per job type with `max_concurrent` as the active-job limit, and runs until SIGINT or
SIGTERM, then drains running jobs. Exit `0` on a clean stop, `1` on any startup error.
Outbound HTTPS trusts the built-in web PKI roots and, when `SSL_CERT_FILE` names a PEM file, its
certificates too. An unreadable file or one with no certificate is logged and ignored.

| Flag | Meaning |
|------|---------|
| `--dir <dir>...` | One or more worker directories (or folders of them). Loaded unsigned, never reloaded. |
| `--registry <dir>` | Directory registry (`<name>/CURRENT`). Serves every worker with a `CURRENT` at start-up and polls it. Needs `--trusted-key`. |
| `--trusted-key <hex-file>` | Ed25519 public key (32 bytes, hex) from `bpmnkit-wasm-builder keygen --pub`. A version is used only if its signature, digest, manifest and job types check out. |
| `--poll-ms <ms>` | Registry poll interval, default `2000`, must be positive. Needs `--registry`. |
| `--secrets-dir <dir>` | One file per secret, `<dir>/<NAME>`. Without it, secrets come from `BPMNKIT_WASM_SECRET_<NAME>`. |

`--dir` and `--registry` may be combined. A bad registry version is logged and the previous one keeps serving.

## `bpmnkit-wasm-builder`

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
