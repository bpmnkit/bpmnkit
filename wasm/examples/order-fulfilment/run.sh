#!/usr/bin/env bash
# Local loop: test both workers against their samples.json (HTTP answered by stubs, no network).
# `./run.sh submit` sends both workers to a running bpmnkit-wasm-builder (README section 2).
set -euo pipefail
cd "$(dirname "$0")"

if [ "${1:-}" = submit ]; then
  : "${BPMNKIT_BUILDER_TOKEN:?set BPMNKIT_BUILDER_TOKEN}"
  for w in check-stock charge-card; do ./submit.sh "$w"; done
  exit 0
fi

root=../..
for w in check-stock charge-card; do
  echo "== $w"
  cargo run -q --locked --manifest-path "$root/Cargo.toml" -p bpmnkit-wasm-build --bin bpmnkit-wasm -- test "$w"
done
