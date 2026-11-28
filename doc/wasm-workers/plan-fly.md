# Plan: Wasm workers on Fly

project: bpmnkit
pr: one

One Fly app, one machine, one volume (`/data`: registry, warm cargo target, reebe data). Three
processes under `start.sh`: `reebe-server`, `bpmnkit-wasm-builder serve` and
`bpmnkit-wasm-host run`. Public: builder API (bearer token) and reebe REST. Workers are built,
signed and hot-loaded into the one host; no machine per worker. Lives in `wasm/examples/fly/`.

## M1: Fly appliance

area: fly
shape: single

### Tasks

- T1: Builder `GET /healthz` (no auth, 200 + version) with a test
  touch: wasm/crates/builder/src/**, wasm/crates/builder/tests/**
  size: 60
- T2: Image and entry script: multi-stage Dockerfile (builds reebe-server, builder, host; runtime keeps rustup + wasm32-wasip2 for builds, bwrap), `start.sh` runs the three, exits when one dies; keys from Fly secrets
  touch: wasm/examples/fly/Dockerfile, wasm/examples/fly/start.sh, wasm/examples/fly/.dockerignore
  size: 200
- T3: `fly.toml` (one machine, 4 GB, volume `/data`, services for builder and reebe, `/healthz` check, auto-stop), `deploy.sh` (app, volume, secrets `BPMNKIT_BUILDER_TOKEN`, signing key, `fly deploy --remote-only`)
  touch: wasm/examples/fly/fly.toml, wasm/examples/fly/deploy.sh
  size: 150
- T4: Scenario `smoke.sh`: submit a worker source to the builder, wait for the signed build, deploy its BPMN to reebe, start an instance, assert it completes; README walkthrough with the live run's output
  touch: wasm/examples/fly/smoke.sh, wasm/examples/fly/README.md
  depends: T1, T2, T3
  size: 200
- T5: Docs: guide section (`apps/landing/src/content/docs/guides/wasm-workers.md`, docspack build), `doc/features.md`, `doc/roadmap.md`, `doc/progress.md`
  touch: apps/landing/src/content/docs/guides/wasm-workers.md, packages/docspack/**, doc/features.md, doc/roadmap.md, doc/progress.md
  depends: T4
  kind: bookkeeping
  size: 80

### Done when

- UC-M1-1: `deploy.sh` brings up the app; `/healthz` answers 200.
- UC-M1-2: `smoke.sh` against the deployed app builds a worker via the API, the host hot-loads it, and a process instance completes.
