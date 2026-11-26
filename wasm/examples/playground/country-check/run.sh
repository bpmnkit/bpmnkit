#!/usr/bin/env bash
# Offline: lint, test the Wasm worker against samples.json (HTTP answered by stubs), and compare
# each sample's outcome with check-country/expected.json.
set -euo pipefail
cd "$(dirname "$0")"
bpmnkit lint country.bpmn
report=$(bpmnkit worker wasm test check-country --format json)
jq -r '.tests[] | "\(if .passed then "ok  " else "FAIL" end) \(.name)"' <<<"$report"
jq -e '.ok' <<<"$report" >/dev/null
# samples.json can only assert the outcome kind; expected.json pins the mapped fields and messages.
jq -n --argjson r "$report" --slurpfile want check-country/expected.json '
  [$want[0] | to_entries[] | . as $w | ($r.tests[] | select(.name == $w.key) | .message) as $got
   | select($got != $w.value) | "\($w.key): got \($got)"] | if length > 0 then error(join("\n")) else "outputs match expected.json" end' -r
