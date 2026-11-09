#!/usr/bin/env bash
# Builds, lints and tests bpmnkit-render in every feature set `cargo test --workspace` does not
# reach (png, system-fonts, none), and checks the wasm32 build of png + embedded-font.
set -euo pipefail
cd "$(dirname "$0")/../../.."
for features in "--no-default-features" "--features png" "--features system-fonts" "--all-features"; do
	echo "== bpmnkit-render $features"
	# shellcheck disable=SC2086
	cargo clippy -p bpmnkit-render $features --all-targets --locked -- -D warnings
	# shellcheck disable=SC2086
	cargo test -p bpmnkit-render $features --locked -q
done
if rustup target list --installed | grep -q wasm32-unknown-unknown; then
	echo "== wasm32-unknown-unknown png,embedded-font"
	cargo build -p bpmnkit-render --target wasm32-unknown-unknown --no-default-features \
		--features png,embedded-font --locked -q
else
	echo "skip wasm32: rustup target add wasm32-unknown-unknown" >&2
fi
