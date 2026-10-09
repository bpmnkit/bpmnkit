# Cross-region cold recovery — Fail over

Cross-region cold recovery is primarily designed for recovering from a primary-region outage, but you can also start failover proactively outside of a disaster recovery scenario, for example to move your cluster to a different region. Both cases follow the same cold recovery process, so the trade-offs described in [Limitations](#limitations) still apply, such as data loss since your last backup and the lack of an active-active or warm-standby configuration.

Follow these steps to fail over to your recovery region, restore a cluster from an available backup, and redirect client traffic to it:

1. Start failover in Console or API.
2. Select the backup to restore from those available in the recovery region.
3. Camunda creates a replacement cluster in the recovery region and prepares it to restore the selected backup.
4. (Optional) If your AWS cluster uses BYOK, configure the KMS key policies for the failover region. See [Restore external encryption](#restore-external-encryption).
5. Camunda copies and verifies the selected backup data before restore proceeds. You don't need to manually suspend or resume the target cluster during the restore process.
6. (Optional) If you use private connectivity on an AWS cluster, re-establish it to the recovered cluster. Use the endpoint service name shown in Console to create or switch your VPC endpoint.
7. Update your customer-managed DNS or routing configuration to direct client traffic to the recovered cluster.
8. Verify that your applications can connect to the recovered cluster and that requests are reaching it.

---
Source: https://docs.camunda.io/docs/next/components/saas/cross-region-cold-recovery
