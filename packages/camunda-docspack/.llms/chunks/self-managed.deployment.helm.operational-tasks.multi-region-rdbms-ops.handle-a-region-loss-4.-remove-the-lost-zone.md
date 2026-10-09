# Multi-Region RDBMS operational procedure — Handle a region loss — 4. Remove the lost zone

Remove the brokers of the lost zone. One atomic change evicts them. It also drops the zone from the persisted partition distribution, so quorum stops counting replicas that cannot answer:

```bash
./failover.sh <lost-region-slot> --drain-brokers
```

This issues [`DELETE /actuator/cluster/zones/<zone>?force=true`](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#remove-a-zone) against a surviving region. Without `force=true`, the API tries a graceful drain, which fails when the zone is down. Only do this for a zone that is down and unreachable, and for one zone at a time. See the [cluster management API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api).

In a planned evacuation, the zone is still reachable, so don't force-remove it. Drain it gracefully instead: send `DELETE /actuator/cluster/zones/<zone>` without `force=true` through the [Remove a zone API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#remove-a-zone). The engine moves the zone's partitions to the remaining zones before it removes the brokers. The request is asynchronous. Wait until `GET /actuator/cluster` reports the change as `COMPLETED` before you shut down the zone's brokers.

This step applies to a cluster with three or more zones. You must remove the zone when it held half the replicas or more. The replica count decides this, not the number of zones. See [step 1](#1-confirm-the-quorum-is-intact).

Don't remove a zone from a cluster that still runs on its two-zone bootstrap. Bring the lost zone back instead, then add the third region. An evenly split [Dual-Region](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region) cluster does need a force-removal, which is why it has its own failover runbook.

The trade-off is failback cost. You must add a removed zone back when you bring the region back, and its brokers start empty.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops
