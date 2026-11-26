#!/usr/bin/env bash
# Submit one blueprint worker to bpmnkit-wasm-builder and wait for its signed registry entry.
#
#   BPMNKIT_BUILDER_TOKEN=<token> ./submit.sh <worker-dir> [builder-url]
#
# Builds the BuildRequest JSON (manifest from worker.toml, source from src/lib.rs, samples from
# samples.json). Workers here have a single src/lib.rs; a worker with more files needs the
# builder's full source map, which this script does not send.
set -euo pipefail

dir="${1:?usage: submit.sh <worker-dir> [builder-url]}"
url="${2:-${BPMNKIT_BUILDER_URL:-http://127.0.0.1:8787}}"
: "${BPMNKIT_BUILDER_TOKEN:?set BPMNKIT_BUILDER_TOKEN to the token the builder was started with}"

body=$(python3 -I - "$dir" <<'PY'
import json, pathlib, sys, tomllib

d = pathlib.Path(sys.argv[1])
manifest = tomllib.loads((d / "worker.toml").read_text())
samples = json.loads((d / "samples.json").read_text()) if (d / "samples.json").exists() else []
source = (d / "src" / "lib.rs").read_text()
print(json.dumps({"manifest": manifest, "source": source, "samples": samples}))
PY
)

auth=(-H "Authorization: Bearer ${BPMNKIT_BUILDER_TOKEN}")
id=$(curl -fsS "${auth[@]}" -H 'content-type: application/json' --data-binary "$body" \
  "$url/builds" | jq -r '.id')
echo "$dir: build $id queued" >&2

# Poll until the build reaches a final state (succeeded | failed).
while :; do
  status=$(curl -fsS "${auth[@]}" "$url/builds/$id")
  state=$(jq -r '.state' <<<"$status")
  case "$state" in
    succeeded | failed) break ;;
  esac
  sleep 2
done

if [ "$state" = succeeded ]; then
  jq -r '"\(.published.name) published, digest \(.published.digest)"' <<<"$status"
else
  echo "$dir: build failed" >&2
  jq -r '.error // empty, (.report.diagnostics[]? | "\(.file):\(.line):\(.col): \(.code): \(.message)")' <<<"$status" >&2
  exit 1
fi
