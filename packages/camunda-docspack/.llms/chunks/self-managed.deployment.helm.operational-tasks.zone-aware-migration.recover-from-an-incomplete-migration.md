# Migrate to zone-aware brokers — Recover from an incomplete migration

You can't revert the migration after you update the persisted partitioning configuration. If a step fails, keep `keepUnzonedBrokers: true` and both broker generations running, fix the cause, and complete the migration. Don't delete the numbered PVCs until you have [verified the migration](#verify-the-migration).

### A zone migration stays in progress

If the change started by `PUT /actuator/cluster/zones` stays `IN_PROGRESS`, a partition usually can't start on one of the brokers involved:

1. [Monitor the change](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#monitor-a-configuration-change) and note the operations in `pending`, and the brokers they target.
1. [Check the health](#check-broker-health) of those brokers and of every other broker in the logical cluster, and inspect the logs of the brokers that report unhealthy.
1. Fix the cause, for example missing CPU, memory, or storage, a pod that can't be scheduled, or a networking problem. The change continues after the brokers can apply the pending operations.

Only one configuration change can run at a time, so don't send another zone migration request while the change is `IN_PROGRESS`.

You can cancel a change with `DELETE /actuator/cluster/changes/<changeId>`, but canceling doesn't revert the operations already applied and leaves the cluster in an intermediate state that needs manual intervention. Only cancel a change that can't make progress, and contact Camunda support before you do.

### Numbered brokers were removed too early

If you removed the numbered brokers of a zone while they still owned partitions or belonged to the logical cluster, restore them before you continue:

1. In the values of the release, restore the migration values: `keepUnzonedBrokers: true`, `numberOfZones`, `zoneIndex`, `orchestration.clusterSize`, and `orchestration.replicationFactor`.
1. Upgrade the release. The chart recreates the numbered StatefulSet with the same name, so its pods reattach to the retained numbered PVCs and rejoin the cluster with their data.
1. [Check that the numbered brokers are healthy](#check-broker-health), then continue with [Add the zone's brokers to the cluster](#add-the-zones-brokers-to-the-cluster).

If the numbered PVCs were deleted, you can't restore these brokers. Try to complete the migration without them first: if every partition still has a quorum of replicas on the remaining brokers, the zone migration can finish, and the zone-aware brokers replicate the data from the other replicas. [Monitor the change](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#monitor-a-configuration-change), or start it with [Add the zone's brokers to the cluster](#add-the-zones-brokers-to-the-cluster) if you haven't sent the request yet. Restore the cluster from the [backup](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore) you took before the migration only if the migration can't complete.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration
