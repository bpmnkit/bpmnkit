# Move Raft leadership between zones

Change zone priorities and rebalance a zone-aware Zeebe cluster to move Raft partition leadership between zones.

You can move Raft partition leadership from one zone to another by reordering zone priorities and then rebalancing the cluster.

This procedure changes only the priorities used for leader election. It doesn't change the partitioning or move replicas between zones.

Use this procedure to:

- Perform a planned zone switchover.
- Restore the preferred leadership placement after a zone failover.
- Follow the sun by moving leadership to the preferred active region.


## Align leadership with secondary storage

Raft leadership placement is especially important when the writer for RDBMS secondary storage, such as an Amazon Aurora writer instance, and Raft leaders are in different regions. Cross-region communication with the secondary storage writer adds network round-trip latency. After the RDBMS secondary storage writer moves to another region, use this procedure to move Raft leadership to the same region when possible.

The placement of Elasticsearch or OpenSearch secondary storage has less impact on this decision. In a multi-region setup, records are exported to secondary storage in both regions concurrently, so exporting has less dependency on cross-region network round-trip latency. Consider the location of the RDBMS secondary storage writer first when choosing the preferred leader zone.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/move-raft-leadership
