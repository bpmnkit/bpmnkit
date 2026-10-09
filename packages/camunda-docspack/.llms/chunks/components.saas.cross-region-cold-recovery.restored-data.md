# Cross-region cold recovery — Restored data

The failover flow restores backup buckets only. Document buckets follow the standard [backup and restore](https://docs.camunda.io/docs/next/components/saas/backup-restore-overview) process and are not part of the cross-region failover.


## Prepare for recovery

Before you can use cross-region cold recovery, ensure the following prerequisites are met:

- Dual-region backup is enabled when you create the cluster.
- The backup schedule is running and healthy. Backup interval will determine your expected RPO.
- Before starting failback, wait until Console indicates that backup synchronization is complete and failback is ready.
- Prepare the VPC infrastructure required to connect to a cluster in the recovery region. Pre-provisioning the required endpoints and security groups can reduce recovery time.
- After failover, re-establish private connectivity to the recovered cluster by creating or switching the regional VPC endpoint. This is the customer's responsibility.

---
Source: https://docs.camunda.io/docs/next/components/saas/cross-region-cold-recovery
