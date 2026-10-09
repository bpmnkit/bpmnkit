# Move Raft leadership between zones — Reorder the zone priorities

The [Partitioning API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#partitioning-api) accepts a `zonePriorities` list. The first zone in the list receives the highest existing priority, the second zone receives the next highest priority, and so on.

The request must list exactly the currently configured zones. If the list doesn't exactly match the currently configured zones, the request is rejected. The operation is idempotent. To exchange the priorities of two zones, reverse their positions and leave the other zones in their current order.

For example, if `zone-a` currently has the highest priority and `zone-b` has the next highest priority, use the following request to make `zone-b` the preferred leader zone:

```bash
curl -X PUT \
  'http://{zeebe-gateway}:9600/actuator/cluster/partitioning?dryRun=true' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "zonePriorities": ["zone-b", "zone-a"]
  }'
```

Review the `plannedChanges` and `expectedTopology` fields in the dry-run response. When the result matches the intended priority order, submit the same request without the `dryRun` parameter:

```bash
curl -X PUT \
  'http://{zeebe-gateway}:9600/actuator/cluster/partitioning' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "zonePriorities": ["zone-b", "zone-a"]
  }'
```

The priority change is asynchronous. Use the [configuration change monitoring API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#monitor-a-configuration-change) with the `changeId` from the response to monitor the change until it reaches a terminal status. Wait until the change completes before rebalancing.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/move-raft-leadership
