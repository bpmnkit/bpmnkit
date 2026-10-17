# SaaS clusters — Recovery objectives by outage type — Region failure

A region failure is the loss of every availability zone in the cluster's region at once, for example, during a regional cloud provider outage. Camunda SaaS clusters run in a [single region](https://docs.camunda.io/docs/next/components/saas/regions). By default, backups are stored in the same region as the cluster. If you select a [dual-region backup location](https://docs.camunda.io/docs/next/components/saas/backups#backup-location), backups are also replicated to the secondary backups region. For [supported region pairs](https://docs.camunda.io/docs/next/components/saas/cross-region-cold-recovery#supported-region-pairs), you can then use [cross-region cold recovery](https://docs.camunda.io/docs/next/components/saas/cross-region-cold-recovery) to recover the cluster in the secondary region.

**RTO/RPO assessment:** Recovery from a region failure is a manual cold recovery that you start in Console or the API. Camunda creates a new cluster in the recovery region and restores the backup you select. Without a dual-region backup location in a supported region pair, recovery to another region isn't possible.

- **RPO** is the time between the backup you restore and the failure. It depends on your backup schedule, on backups being created and replicated successfully, and on the restore point you select. A 15-minute backup schedule doesn't guarantee a 15-minute RPO.
- **RTO** is the time needed to detect the outage, start failover, restore the backup, and reconnect your applications. The more data your cluster holds, the longer the restore takes, which increases the RTO. The recovered cluster has new endpoints, so you must update your DNS or client configuration. Preparing network infrastructure in the recovery region in advance reduces the RTO.

**Your responsibilities:** Choose a dual-region backup location in a supported region pair when you create the cluster, and keep your backup schedule healthy. Prepare network infrastructure in the recovery region in advance. After failover, point your clients and job workers at the recovered cluster, and don't use the original cluster again. For the full procedure, see [fail over](https://docs.camunda.io/docs/next/components/saas/cross-region-cold-recovery#fail-over).

---
Source: https://docs.camunda.io/docs/next/components/saas/clusters
