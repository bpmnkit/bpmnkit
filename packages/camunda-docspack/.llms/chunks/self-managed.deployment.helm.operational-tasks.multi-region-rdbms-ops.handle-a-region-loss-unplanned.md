# Multi-Region RDBMS operational procedure — Handle a region loss — unplanned

The region is gone. Follow the [Aurora Global Database unplanned recovery procedure](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database-disaster-recovery.html). The reference script doesn't automate this operation because detaching and promoting a member changes the global topology outside Terraform.

Whatever had not replicated at the time of the outage can be missing from the promoted database. With `LOG_SEQ`, recovery depends on promoting a standby whose replication was confirmed within the configured minimum. With `DELAY`, recovery depends on the actual lag staying below the configured delay. Restore the global database membership before running the Camunda failback procedure.

Camunda needs no reconfiguration and no restart, as long as the JDBC URL keeps resolving to the current writer. The reference implementation gets that from the [AWS Advanced JDBC Wrapper](https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration#usage-with-aws-aurora-postgresql). Its `failover` plugin follows the writer on established connections, and on brokers that start after the promotion. This is not general JDBC behavior. With your own database, whether connections re-resolve the writer depends on your driver and endpoint. Confirm it or plan a restart.

If the writer was not in the lost region, you need no database action.

#### Move the Raft leaders to the new writer region

Once the writer moves, the zone priorities still favor the region that hosted the old one. Partition leaders keep exporting across regions and pay the inter-region round trip on every flush. Move the leaders next to the new writer:

1. Raise the priority of the zone that now hosts the writer. See [zone-aware clusters](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters) for the priority property, and the [Partitioning API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#partitioning-api) for applying it to a running cluster.
1. Wait until the change reports `COMPLETED`. The cluster rejects a new change while one is still in progress.
1. Run a [rebalance](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/rebalancing) with `POST /cluster/v2/rebalance`. Priorities apply at the next election and don't move existing leaders on their own.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/multi-region-rdbms-ops
