# Restore a backup with the Restore API (RDBMS) — Handling a failed Restore API operation

If a single partition fails to restore, for example because its backup is corrupted or the backup store is temporarily unreachable, the partial data of that partition is dropped and the failed step is retried automatically with a backoff. The restore change stays pending, and the restore status keeps reporting the partition as `RESTORING`.

Because the retry is automatic, first try to fix the root cause instead of sending a new restore request. Once the cause is resolved, the pending change continues on its own and completes.

Automatic retries can't help if the problem is the backup itself, for example if the selected backup is corrupted or turns out to be the wrong restore point. In that case, retry from the outside:

1. Cancel the pending restore change on the management API, using the `changeId` the restore returned:

   ```bash
   curl -X DELETE "${ORCHESTRATION_CLUSTER_MANAGEMENT_API}/actuator/cluster/changes/8"
   ```

   The restore status reports the change as `CANCELLED`, and the cluster stays in recovery mode.

2. Send a new [restore request](#trigger-the-restore). Because each restore drops the local partition data before it writes the backup data, the new attempt does not build on the partial result of the canceled one, and you can select a different backup target.

**Warning**
Don't leave a partially failed restore unfinished. Between canceling a restore and completing a new one, Zeebe's internal data is a mix of restored and pre-restore state and cannot be trusted. Keep the cluster in recovery mode and retry until every partition reaches `RESTORED`. If you switch the cluster back to `PROCESSING` in that state, treat it as unrecoverable and restore again from a clean state.

### Restoring a backup with fewer partitions

**Warning**
If the partition count was scaled up after the backup was taken, the backup contains fewer partitions than the cluster, and the Restore API operation fails. To restore such a backup, align the cluster with the partition count of the backup first.

Do this before you [switch the cluster into recovery mode](#1-switch-the-cluster-into-recovery-mode) and trigger the restore. To align the cluster with the partition count of the backup:

1. Stop all brokers. A running broker keeps its topology in memory and can overwrite your edit.
2. Change the static configuration (`camunda.cluster.partition-count`) to the partition count of the backup on every broker.
3. Update the cluster topology on every broker with the `topology` command of the [debug CLI](https://github.com/camunda/camunda/tree/main/debug-cli). Each broker stores its cluster topology in the `.topology.meta` file in its root data directory. Retrieve the topology file as JSON:

   ```bash
   debug-cli topology -f /usr/local/camunda/data/.topology.meta > topology.json
   ```

4. In `topology.json`, find the entry for the restored Physical Tenant under `partitionGroups`. In its `routingState`, set `requestHandling.allPartitions.partitionCount` and `messageCorrelation.hashMod.partitionCount` to the partition count of the backup. Also remove any partitions that no longer exist from the `activePartitions` array. For a backup with three partitions, the result looks like this:

   ```json
   "routingState": {
     "activePartitions": [1, 2, 3],
     "requestHandling": {
       "allPartitions": { "partitionCount": 3 }
     },
     "messageCorrelation": {
       "hashMod": { "partitionCount": 3 }
     }
   }
   ```

5. Save the edited JSON back to the topology file:

   ```bash
   debug-cli topology -s -f /usr/local/camunda/data/.topology.meta --source topology.json
   ```

6. Start all brokers. The static configuration and the edited topology file are read at startup, so the change takes effect with this restart. Then continue with the restore.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api
