#!/usr/bin/env bash
# Local loop: test both workers against their samples.json (HTTP answered by stubs, no network).
set -euo pipefail
cd "$(dirname "$0")"
root=../..
for w in check-stock charge-card; do
  echo "== $w"
  cargo run -q --locked --manifest-path "$root/Cargo.toml" -p bpmnkit-wasm-build --bin bpmnkit-wasm -- test "$w"
done
