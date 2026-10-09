# Move Raft leadership between zones — Check the current zone priorities

Use the Management API to retrieve the current cluster topology and partitioning:

```bash
curl \
  'http://{zeebe-gateway}:9600/actuator/cluster' \
  -H 'accept: application/json' \
  | jq '.partitioning.zones | sort_by(-.priority)[] | {name, priority}'
```

The command returns each configured zone's name and priority, sorted from highest to lowest priority. If `partitioning.zones` is missing or empty, the cluster isn't zone-aware and can't use this procedure. If `jq` isn't installed, omit the pipe to `jq` and manually inspect `partitioning.zones` in the JSON response. You can also inspect `brokers[].partitions[]` in the full response to see the priority assigned to each partition replica.

A higher priority makes a replica the preferred leader during an election. The zone with the highest configured priority is therefore the preferred zone for Raft partition leaders. Recording the current order also ensures that you preserve the relative priorities of any zones you aren't swapping.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/move-raft-leadership
