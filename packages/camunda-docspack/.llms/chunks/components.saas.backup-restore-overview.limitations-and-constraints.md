# Backup and restore overview — Limitations and constraints

- Cross-cluster restore is not supported in this release.
- Cross-region in-place restore isn't supported. To recover a cluster in another region, see [cross-region cold recovery](https://docs.camunda.io/docs/next/components/saas/cross-region-cold-recovery).
- Cross-organization restore is not supported in this release.
- Replication factor and node count differences are not blocking constraints for restore.
- Backups created before the restore feature was introduced are not eligible for restore.
- Cluster endpoints do not change after restore; applications reconnect to the same endpoints.
- A new restore request is rejected while another restore is in progress.

---
Source: https://docs.camunda.io/docs/next/components/saas/backup-restore-overview
