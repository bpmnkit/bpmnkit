# Move Raft leadership between zones — Rebalance the cluster

Changing zone priorities doesn't trigger a leader election. After the priority change completes, [manually rebalance the cluster](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/rebalancing#manual-rebalancing) to move partition leadership toward the newly preferred zone.

Before rebalancing, review the guide's [limitations](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/rebalancing#limitations), [impact](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/rebalancing#rebalancing-impact), and [readiness checks](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/rebalancing#when-to-rebalance). During rebalancing, partitions can be temporarily unavailable while new leaders are elected.

After rebalancing completes, use the Orchestration Cluster REST API [`GET /v2/topology`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-topology.api) endpoint to verify the partition leaders. You can also use `GET /actuator/cluster` and your cluster metrics to confirm the updated priorities, partition assignments, and replication health. The topology endpoint uses the v2 API rather than the Management API and requires different access permissions. Ensure your credentials are authorized for the v2 API before using it.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/move-raft-leadership
