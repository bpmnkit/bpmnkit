# Wasm Job Workers — Running the host

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

---
Source: https://bpmnkit.com/docs/guides/wasm-workers
