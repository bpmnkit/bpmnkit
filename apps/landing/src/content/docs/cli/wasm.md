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
```

Each `--dir` is a worker (a folder with `worker.toml` and `worker.wasm`, e.g. `dist`) or a folder
of workers. The host prints `loaded <name> <version> (<world>, <digest>)` per worker, registers one
handler per job type with `max_concurrent` as the active-job limit, and runs until SIGINT or
SIGTERM, then drains running jobs. Exit `0` on a clean stop, `1` on any startup error.

The cluster comes from `CAMUNDA_*` variables (`CAMUNDA_REST_ADDRESS`, `CAMUNDA_AUTH_STRATEGY`,
`CAMUNDA_CLIENT_ID`, …). When `CAMUNDA_REST_ADDRESS` is unset, the active
[profile](/docs/cli/casen#connection-profiles) passed in `BPMNKIT_PROFILE_JSON` fills the gaps,
which is what happens under `bpmnkit worker wasm run`.

See [Wasm Job Workers](/docs/guides/wasm-workers) for the SDK, sandbox limits and what is not built yet.
