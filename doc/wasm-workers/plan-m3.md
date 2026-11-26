# Wasm workers — M3-lite plan + blueprint

Follows [`plan.md`](plan.md) (M1+M2 shipped). One PR on `claude/charming-ride-n2nsom`.

## Scope

- In: builder HTTP service, ed25519 signing, directory registry, host verify + hot-load, canned HTTP
  stub for `test`, an example appliance (blueprint) run end-to-end against reebe.
- Out: gVisor/nsjail, OCI push, KMS/Sigstore, Slack agent (M4), WASI 0.3, wider dep allow-list.

## Decisions

1. **Signing:** `ed25519-dalek` 2 in `bpmnkit-wasm-contract` (feature `signing`). Signature over the
   component `Digest` (sha256 hex) plus the manifest's canonical JSON. Keys: 32-byte raw, hex files.
2. **Registry = directory:** `<root>/<name>/<digest>/{worker.wasm,worker.toml,metadata.json,worker.sig}`
   and `<root>/<name>/CURRENT` (digest, written by atomic rename). Trait `RegistryStore` +
   `DirRegistry` in contract (feature `registry`), so OCI can be a second impl later.
3. **HTTP stub:** `SampleJob.http: Vec<HttpStub { method, url, status, headers, body }>` (serde
   default empty). Smoke test answers matching requests from stubs, still enforces the manifest
   allow-list first; unmatched request → error naming the URL.
4. **Builder** `wasm/crates/builder` (bin `bpmnkit-wasm-builder`, axum 0.8): `POST /check`,
   `POST /builds` (→ `{id}`), `GET /builds/{id}` (report + stage events), `GET /builds/{id}/events`
   (NDJSON stream). Bearer token auth (`BPMNKIT_BUILDER_TOKEN`), per-caller token bucket, a
   semaphore for concurrent builds, warm shared target dir pre-built at start (`--warm`).
   `SandboxExecutor`: `bwrap` (no net, ro toolchain, tmpfs work dir) when present, else
   `LocalExecutor` + `prlimit` caps with a startup warning. Success → sign → publish to registry.
5. **Host:** `bpmnkit-wasm-host run --registry <dir> --trusted-key <hex-file> [--poll-ms 2000]`.
   Polls `CURRENT`, verifies digest + signature + `inspect`/`verify`, swaps the worker's handler;
   a bad version is logged and the previous one keeps running. `--dir` keeps working (unsigned).
6. **Blueprint** `wasm/examples/order-fulfilment/` (not a workspace member, like `fixtures/`):
   `order.bpmn` (check stock → charge card, error boundary `PAYMENT_DECLINED` → notify → end),
   workers `check-stock` (`worker`) and `charge-card` (`worker-http`, secret `PAYMENT_API_KEY`,
   host `api.payments.example`), `samples.json` with HTTP stubs, `README.md` walkthrough, `run.sh`.

## Work packages

Order: **WP6 → (WP7 ∥ WP8 ∥ WP9) → WP10.** Each ends with `cd wasm && cargo fmt --check && cargo
clippy --workspace --all-targets --locked -- -D warnings && cargo test --workspace --locked --
--include-ignored`, a dated `doc/progress.md` entry, commit, push. Push rejected → `git fetch origin
claude/charming-ride-n2nsom && git merge --no-edit FETCH_HEAD` (re-run `cargo generate-lockfile`
only on lock conflicts). No PR before WP10.

- **WP6 — contract (Sonnet):** decisions 1–3 types + tests (sign/verify round trip, tampered digest
  and manifest fail, registry publish/current/list, `HttpStub` serde default).
- **WP7 — builder (Opus):** decision 4. Tests: auth, rate limit, `/check` diagnostics, full build of
  the `echo` fixture → signed registry entry (ignored, needs target), fake executor unit tests.
- **WP8 — host + stub (Opus):** decisions 3 (host side + `build::smoke` wiring) and 5. Tests: stub
  match/unmatched/allow-list, hot-swap to new digest, bad signature keeps previous, tampered wasm.
- **WP9 — blueprint (Sonnet):** decision 6. `bpmnkit worker wasm test` passes both workers with
  stubs; ignored test builds them. README: local loop, then builder → registry → host vs reebe.
- **WP10 — e2e, docs, PR (Sonnet):** reebe e2e: builder builds both blueprint workers, host
  hot-loads them, a process instance takes the happy and the declined path. CI step in
  `wasm-workers.yml`. Docs: guide (`apps/landing/.../guides/wasm-workers.md` + docspack build),
  `cli/wasm.md`, `features.md`, `roadmap.md` (M3-lite), `concept.md` as-built. Open the PR.
