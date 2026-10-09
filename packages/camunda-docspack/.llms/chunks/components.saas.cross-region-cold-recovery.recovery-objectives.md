# Cross-region cold recovery — Recovery objectives

You can configure a 15-minute backup schedule for the organization, but this schedule doesn't guarantee a 15-minute recovery point objective (RPO). The actual RPO depends on successful backup creation, completed replication, and the consistent restore point you select.


## After recovery

- Verify that the recovered cluster is serving traffic correctly.
- Treat the recovered cluster's primary backup bucket as the source for new backups while it is active.
- Before starting failback, wait for the backup bucket in the original region to be created and fully synchronized with the active cluster's primary backup bucket.
- Start failback only after the system reports that backup storage is ready.

---
Source: https://docs.camunda.io/docs/next/components/saas/cross-region-cold-recovery
