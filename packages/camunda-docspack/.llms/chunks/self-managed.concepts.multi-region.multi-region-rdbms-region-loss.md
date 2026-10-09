# Region loss and recovery in Multi-Region RDBMS

How a Multi-Region RDBMS cluster behaves when a region disappears, how long recovery takes, and when to remove a lost zone.

Learn how a [Multi-Region RDBMS](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms) cluster behaves when it loses a region, and how it recovers. A region loss is an unplanned change, unlike [growing the cluster](https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms-growth).

Losing one region out of three or more removes that region's replicas of every partition. Under the default `2-2-1` layout, that is one or two replicas. The remaining replicas still form a majority if every declared zone runs and no zone holds half the replicas or more. The cluster then keeps its quorum. Processing resumes without any operator step. Partitions whose leader was in the lost region pause for a Raft re-election and then continue. Partitions led elsewhere continue without interruption.

**Warning: Two things need attention**

If the writer was in the lost region, promote a surviving member. A planned switchover loses no data. An unplanned promotion loses whatever had not replicated at the time of the outage, bounded by the replication lag your [asynchronous replication monitoring](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration#multi-region-support) strategy allows. Camunda itself needs no reconfiguration as long as the JDBC URL keeps resolving to the current writer.

Camunda clients take one REST address and one gRPC address, not a list of endpoints. Point them at one address that fails over. For example, use a DNS record with health checks and failover routing, or a global load balancer in front of the regional load balancers. Most providers offer both, for example Amazon Route 53 and AWS Global Accelerator, Azure Traffic Manager and Azure Front Door, or Google Cloud DNS routing policies and Cloud Load Balancing.

To recover, redeploy the region. There is nothing to restore: its brokers catch up from the surviving replicas, as they would after a node restart. For the step-by-step procedure, see [Multi-Region RDBMS operational procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/multi-region-rdbms-region-loss
