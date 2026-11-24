# Wasm workers — implementation plan

Plan for milestones 1 + 2 of [`concept.md`](concept.md): contract, guest SDK, host, build library and
CLI, in one PR on `claude/exciting-maxwell-3y11do`. The builder service (M3: sandbox, warm pool,
signing, OCI) and the Slack agent tool (M4) are out of scope.

## Feasibility (checked 2026-11-24 in the cloud container)

- `rustup target add wasm32-wasip2` works on rustc 1.97.0; a `cdylib` builds to a 14 KB `.wasm`.
- crates.io is reachable. Latest `wasmtime` / `wasmtime-wasi` is **51.0.0, `rust-version = 1.97`**.
  The main workspace promises MSRV 1.85 (`msrv-rs` job, resolver `fallback`), so wasmtime cannot
  live in it without dragging the resolver to an old wasmtime or breaking the promise.
- A clean debug build of `wasmtime` 51 + `wasmtime-wasi` succeeds: 2 min 11 s wall (5 min 36 s
  CPU). CI needs a `rust-cache`.

## Decisions (autonomous defaults)

1. **Separate cargo workspace `wasm/`** (own `Cargo.toml`, `Cargo.lock`, `rust-version = "1.97"`),
   like `apps/reebe`. The main workspace (`members = ["crates/*"]`) is untouched, so its MSRV,
   `verify:rust`, conformance and crates release stay as they are. `wasm/` depends on main crates by
   path (`bpmnkit-worker`, `bpmnkit-jobspec`).
2. **Crate names** (`bpmnkit-wasm-*`, to keep them apart from the native `bpmnkit-worker`):
   | Concept | Crate | Dir |
   |---|---|---|
   | worker-contract | `bpmnkit-wasm-contract` | `wasm/crates/contract` |
   | worker-sdk | `bpmnkit-wasm-sdk` (import `bpmnkit_wasm_sdk`) | `wasm/crates/sdk` |
   | worker-host | `bpmnkit-wasm-host` (lib + bin `bpmnkit-wasm-host`) | `wasm/crates/host` |
   | worker-build | `bpmnkit-wasm-build` (lib + bin `bpmnkit-wasm`) | `wasm/crates/build` |
   WIT package `bpmnkit:worker@0.1.0`, worlds `worker` and `worker-http`.
3. **Reuse, no duplication.**
   - Host = one `bpmnkit_worker::Handler` per component: activation loop, OAuth, backoff, metrics,
     drain, complete/fail/throw all come from `bpmnkit-worker`. No second REST client.
   - Bundle check ("every service-task job type has a worker") uses `bpmnkit_jobspec::extract`.
   - CLI: `bpmnkit worker wasm <args…>` forwards to the `bpmnkit-wasm` binary through the existing
     subprocess-plugin exec (`crates/bpmnkit-cli/src/plugin.rs`), so the main CLI gains no wasmtime;
     `bpmnkit wasm …` works by the plugin rule for free. Profile env (`BPMNKIT_PROFILE_JSON`) gives
     `run` its cluster.
4. **Job keys are `string` in WIT** (REST `/v2` keys are strings; `ActivatedJob::job_key: String`),
   not `u64` as in the concept sketch.
5. **Publishing:** all `wasm/` crates `publish = false` in this PR, not in the facade, no changesets
   (outside `crates/`). The `bpmnkit-cli` change needs a `@crates/bpmnkit-cli` patch changeset.
6. **CI:** new `.github/workflows/wasm-workers.yml`, path-filtered (`wasm/**`,
   `crates/bpmnkit-worker/**`, `crates/bpmnkit-jobspec/**`, `crates/bpmnkit-cli/src/worker*`), weekly
   cron: `cargo fmt --check`, `clippy --workspace --all-targets --locked -D warnings`,
   `rustup target add wasm32-wasip2`, `cargo test --workspace --locked -- --include-ignored`,
   `cargo audit --file wasm/Cargo.lock --deny warnings` (reuses `.cargo/audit.toml`), and an e2e step
   against a reebe server as in `worker-e2e.yml`. No cargo-deny (the repo has none). Local:
   `pnpm verify:wasm` (root `package.json`), deliberately not part of `pnpm verify`.
7. **Tests that need the wasm target** are `#[ignore = "needs wasm32-wasip2"]` and run in CI with
   `--include-ignored`. Contract `inspect` tests need no target: fixtures are component WAT parsed
   with the `wat` dev-dependency. Guest fixtures live in `wasm/fixtures/<name>/` (own tiny crates, not
   workspace members) and a shared test helper builds them once into `wasm/target/fixtures/`.
8. **Out of scope:** signing, OCI, registry watch/hot-load (host loads a directory), tenant secret
   store (host reads secrets from env `BPMNKIT_WASM_SECRET_<NAME>` or a file), WASI 0.3 async.

## Work packages

Order: **WP1 → (WP2 ∥ WP3) → WP4 → WP5.** WP2 and WP3 touch disjoint dirs; on push conflicts in
`wasm/Cargo.lock` or `doc/progress.md`, `git fetch && git merge`, re-run `cargo generate-lockfile`
if needed. Every WP ends with: `cd wasm && cargo fmt --check && cargo clippy --workspace
--all-targets --locked -- -D warnings && cargo test --workspace --locked -- --include-ignored`, a
dated `doc/progress.md` entry, commit, push to the branch. No PR until WP5.

### WP1 — workspace + contract · Sonnet

- `wasm/Cargo.toml` (workspace, `[workspace.package]` mirrors root: version 0.7.1, licence,
  `rust-version = "1.97"`); root `.gitignore` already ignores `target`.
- `wasm/crates/contract/`: `wit/worker.wit` (package above; `job { key: string, job-type, process-
  instance-key: string, element-id, retries: u32, variables: string /*JSON*/, custom-headers }`,
  `failure`, `bpmn-error`, `outcome`, interfaces `secrets`, `log`), WIT exposed as `pub const WIT: &str`.
- `manifest.rs`: `Manifest` (serde mirror of `worker.toml`), `ValidManifest` (private field, only
  from `validate`), `ManifestError` enum, `World { Worker, WorkerHttp }`, `world_for`, `Limits` with
  `PlatformCeilings` (256 MB, 60 s, default port 443 only). Rules as in concept §Validation.
- `bundle.rs`: `Bundle { bpmn: Vec<String>, workers: Vec<ValidManifest> }`, `check_bundle` →
  missing/unused job types via `bpmnkit_jobspec::extract`.
- `api.rs`: `BuildRequest`, `BuildReport`, `Diagnostic { file, line, col, code, message,
  suggestion }`, `ArtifactMetadata`, `Digest` (sha256 hex newtype), `SampleJob`, `TestResult`.
- Feature `inspect` (wasmparser): `inspect(&[u8]) -> ComponentInfo { imports, exports }`,
  `verify(&ComponentInfo, &ValidManifest) -> Result<(), Vec<Violation>>`.
- Tests: table test per rule, TOML round trip, bundle check on a BPMN fixture, `verify` on WAT
  components (plain, http import without allow-list → fail, unknown import → fail, missing `handle`
  export → fail).
- `.github/workflows/wasm-workers.yml` (all steps except e2e), `pnpm verify:wasm`.

### WP2 — guest SDK + fixtures · Opus

Depends on WP1 (WIT). Parallel with WP3.
- `wasm/crates/sdk/`: `wit_bindgen::generate!` over the contract's `wit/` (path dep), `wasi:http`
  via the `wasi` crate (`with` mapping), `prelude` (`Job`, `Outcome`, `Worker`, `secrets`, `log`,
  `http`, serde re-exports, `json!`). `Job::variables::<T>()`, `Job::header`, `Outcome::complete
  (Value)`, `fail(msg).no_retry().backoff_ms(n)`, `throw_error(code, msg).with_variables(v)`.
  Blocking `http::{get, post, …}.bearer().header().json().form().send()`. `export!(T)` as
  `macro_rules!`, panic → `fail` via `catch_unwind`.
- Must also `cargo check` on the host target (clippy runs on `--workspace`); pure logic (outcome
  builders, form encoding, error mapping) is unit-tested natively.
- `wasm/crates/sdk/AGENT_GUIDE.md` (one page, the API + the concept's charge-card example).
- `wasm/fixtures/`: `echo` (complete with input), `throw` (BPMN error), `panic`, `spin` (endless
  loop), `http-get` (worker-http world), `secret` (reads a secret); helper
  `wasm/crates/test-support` (`publish = false`, `build_fixture(name) -> PathBuf`).
- Tests (ignored, need target): every fixture builds, `inspect` reports the expected world.

### WP3 — host · Opus

Depends on WP1. Parallel with WP2: start with WAT-component tests, switch to WP2 fixtures when merged.
- `wasm/crates/host/` lib: `Engine` (pooling allocator, epoch interruption, Cranelift, compiled-code
  cache by `Digest` in memory), `Loaded { manifest, component, world }` (`load(dir)` reads
  `worker.toml` + `worker.wasm`, runs `inspect` + `verify` again), one `Linker` per world, `Store`
  per job with `StoreLimits` (memory_mb) and epoch deadline (timeout_ms), no fs/env/sockets.
- `http.rs`: `WasiHttpView::send_request` hook: host:port must match the allow-list, host-side DNS,
  reject private/loopback/link-local/IPv6 ULA (unit-tested resolver trait).
- `secrets.rs`: `SecretSource` trait (env, file, `Map` for tests), only manifest names resolved.
- `runner.rs`: `run_job(&Loaded, Job, &dyn SecretSource) -> Outcome` (trap/timeout → `fail` with a
  clear message) — this is what WP4's smoke test calls.
- `handler.rs`: `WasmHandler: bpmnkit_worker::Handler` (`spawn_blocking` + semaphore of
  `max_concurrent`), mapping `ActivatedJob` ↔ WIT `job`, `Outcome` → `Complete`/`JobError`.
- bin `bpmnkit-wasm-host run --dir <workers…>` with `ClientConfig` from env/profile, graceful drain.
- Tests: limits (memory, timeout via `spin`), trap → fail, allow-list denial, secret scoping, handler
  against `bpmnkit_worker::testing::FakeClient`.

### WP4 — build lib + CLI · Sonnet

Depends on WP1, WP2 (SDK path for the rendered `Cargo.toml`), WP3 (`run_job`).
- `wasm/crates/build/` lib, API as concept §worker-build: `Toolchain`, `BuildInput`, `Executor`
  trait + `LocalExecutor` (std `Command`, wall-time/output caps), `render` (fixed `Cargo.toml` from
  an allow-list; SDK as path dep in-repo, `=0.x` later), `check_source` (`syn`: `extern crate`,
  `#[path]`, `include*!`, crate attrs, size caps), `check` (`cargo check --message-format=json` →
  `Diagnostic`), `build`, `verify`, `smoke_test` (WP3 runner, fake secrets, HTTP stub), `package`
  (`ArtifactMetadata`, sha2), `run_pipeline` with per-stage timings in `BuildReport`.
- bin `bpmnkit-wasm`: `init <name>` (scaffold `worker.toml`, `src/lib.rs`, `samples.json`),
  `check`, `build`, `test`, `inspect <wasm>`, `run` (exec `bpmnkit-wasm-host`), `--format json`.
- `crates/bpmnkit-cli/src/worker.rs`: `WorkerCmd::Wasm { args: Vec<String> }` (trailing var arg)
  → plugin exec of `bpmnkit-wasm`; test with a fake plugin on `PATH` like existing plugin tests;
  changeset for `@crates/bpmnkit-cli`.
- Tests: golden rendered `Cargo.toml`, each negative source fixture, fake-executor diagnostics
  mapping; ignored e2e: `init` → `build` → `test` on `echo` under a time budget, record times.

### WP5 — e2e, docs, PR · Sonnet (Haiku for docs-only edits)

Depends on WP1–4.
- e2e step in `wasm-workers.yml`: reebe server, deploy a BPMN with an `echo` service task, host
  completes it (`#[ignore]`, env `BPMNKIT_WORKER_E2E_URL`, same as `worker-e2e.yml`).
- Docs: `apps/landing/src/content/docs/guides/wasm-workers.md` (+ `pnpm --filter
  @bpmnkit/docspack build`), `doc/features.md`, `doc/roadmap.md`, measured stage timings back into
  `concept.md`'s table, README line.
- Full `pnpm verify` (main workspace unaffected) + `pnpm verify:wasm`; open the one PR.

## As built

Milestones 1 and 2 shipped as specified in the work packages above, with these deviations:

- **Toolchain:** `target_dir`, `lockfile` and `offline` instead of `vendor_dir` / `warm_target`.
- **Artifact:** no source tarball is stored with the artifact.
- **Dependency allow-list:** `bpmnkit_wasm_sdk`, `serde` and `serde_json` only (no chrono or regex).
- **Smoke-test HTTP:** a recording resolver that refuses every name; no canned-response stub yet.
- **Host runtime:** async. `run_job` is async and `run_job_blocking` wraps it for the handler.
- **Out of scope:** builder service (M3), signing and OCI distribution, Slack agent (M4).
- **E2E:** `wasm/crates/host/tests/reebe_e2e.rs` (skips without `BPMNKIT_WORKER_E2E_URL`); the
  `wasm-workers.yml` workflow builds and starts reebe before running the ignored tests.
