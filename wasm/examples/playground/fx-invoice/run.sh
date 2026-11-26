#!/usr/bin/env bash
# Offline: lint, run the rates task against connector-samples.json stubs, then test the Wasm worker
# and compare each sample's outcome with convert-invoice/expected.json.
set -euo pipefail
cd "$(dirname "$0")"
bpmnkit lint invoice.bpmn
python3 -I ../connector-test.py invoice.bpmn connector-samples.json
report=$(bpmnkit worker wasm test convert-invoice --format json)
jq -r '.tests[] | "\(if .passed then "ok  " else "FAIL" end) \(.name)"' <<<"$report"
jq -e '.ok' <<<"$report" >/dev/null
# samples.json can only assert the outcome kind; expected.json pins the converted amounts.
jq -n --argjson r "$report" --slurpfile want convert-invoice/expected.json '
  [$want[0] | to_entries[] | . as $w | ($r.tests[] | select(.name == $w.key) | .message) as $got
   | select($got != $w.value) | "\($w.key): got \($got)"] | if length > 0 then error(join("\n")) else "outputs match expected.json" end' -r
