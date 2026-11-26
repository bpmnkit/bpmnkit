#!/usr/bin/env bash
# Start one process instance on a running engine and print how it ended.
#
#   live.sh <process-id> '<variables json>' [variable ...]
#
# Prints the instance state, the end event it reached and the named variables.
# Engine: CAMUNDA_REST_ADDRESS (default http://localhost:8080). Needs curl and jq.
set -euo pipefail
base="${CAMUNDA_REST_ADDRESS:-http://localhost:8080}"
pid="${1:?usage: live.sh <process-id> <variables-json> [variable ...]}"
vars="${2:?variables json}"
shift 2

post() { curl -fsS -X POST "$base$1" -H 'content-type: application/json' -d "$2"; }

key=$(post /v2/process-instances "$(jq -nc --arg p "$pid" --argjson v "$vars" '{processDefinitionId:$p,variables:$v}')" |
  jq -r .processInstanceKey)
filter=$(jq -nc --arg k "$key" '{filter:{processInstanceKey:$k}}')

state=ACTIVE
for _ in $(seq 60); do
  state=$(post /v2/process-instances/search "$filter" | jq -r '.items[0].state // "MISSING"')
  [ "$state" = ACTIVE ] || break
  sleep 1
done

end=$(post /v2/element-instances/search "$(jq -nc --arg k "$key" '{filter:{processInstanceKey:$k,type:"END_EVENT"}}')" |
  jq -r '[.items[].elementId] | join(",")')
echo "instance $key: $state at ${end:-<none>}"
for name in "$@"; do
  post /v2/variables/search "$(jq -nc --arg k "$key" --arg n "$name" '{filter:{processInstanceKey:$k,name:$n}}')" |
    jq -r --arg n "$name" '"  \($n) = \(.items[0].value // "<unset>")"'
done
[ "$state" = COMPLETED ]
