# Dual-region operational procedure (ECS Fargate) — Recover when the Aurora writer's region is lost

A planned switchover needs the failed region's Aurora cluster to still be available. If the region is gone, its Aurora cluster included, run `failover.sh` with `--keep-writer`:

```bash
./procedure/failover.sh --failed-region 0 --keep-tasks --keep-writer
```

The script removes the zone, leaves the writer where it is, and finishes. Camunda keeps processing in the surviving region, and exporting to secondary storage waits until a writer is available again.

Without `--keep-writer`, `failover.sh` still removes the zone, then stops with one of these errors instead of switching the writer:

```text
[<time>] ERROR: The Aurora writer in <failed-region> is <status>, so a planned switchover cannot run.
[<time>] ERROR: The planned switchover to <surviving-region> did not complete.
```

The second one appears when AWS still reports the old writer as available early in an outage, then rejects the switchover or doesn't finish it.

In both cases, promote the surviving region's Aurora cluster with the [Aurora Global Database unplanned recovery procedure](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database-disaster-recovery.html#aurora-global-database-failover). The scripts don't automate it, because it can lose data that hasn't replicated yet:

1. List the global cluster members and copy the ARN of the surviving region's cluster:

   ```bash
   aws rds describe-global-clusters \
     --global-cluster-identifier "${AURORA_GLOBAL_CLUSTER_ID}" \
     --query "GlobalClusters[0].GlobalClusterMembers[*].{Cluster:DBClusterArn,Writer:IsWriter}" \
     --output table
   ```

1. Promote that cluster with `aws rds failover-global-cluster`. Run the command in the surviving region and pass `--allow-data-loss`. Without the flag, Aurora runs a switchover, which needs a healthy writer and fails when the writer's region is lost.

   ```bash
   aws rds failover-global-cluster \
     --region <surviving-region> \
     --global-cluster-identifier "${AURORA_GLOBAL_CLUSTER_ID}" \
     --target-db-cluster-identifier <surviving-cluster-arn> \
     --allow-data-loss
   ```

1. Run the command from the first step again and confirm that the surviving cluster shows `Writer` as `True`.

The Orchestration Cluster connects through the global writer endpoint, and the AWS JDBC Wrapper `failover` plugin reconnects to the new writer once the promotion completes. As described in [Secondary storage replication lag](https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region#secondary-storage-replication-lag), the promoted cluster may be missing records that hadn't replicated yet. Zeebe replays that gap from its log.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/containers/cloud-providers/amazon/aws-ecs-dual-region-ops
