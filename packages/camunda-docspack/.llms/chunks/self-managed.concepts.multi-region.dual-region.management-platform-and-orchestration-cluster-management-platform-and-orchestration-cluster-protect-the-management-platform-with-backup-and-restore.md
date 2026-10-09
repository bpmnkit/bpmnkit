# Dual-Region — Management platform and Orchestration Cluster {#management-platform-and-orchestration-cluster} — Protect the management platform with backup and restore

Back up Management Identity and Camunda Hub on their own schedule. If Optimize shares the Elasticsearch instance of the Orchestration Cluster, back it up together with the Orchestration Cluster, using the same backup ID. Replicate all backups to a second region, so they survive the loss of the management platform region.

| Component           | Backup method                                                                                                                                                                                              |
| :------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Management Identity | Back up its PostgreSQL database using your database's native tooling. Also back up your OIDC provider, such as Keycloak, and keep user IDs unchanged when you restore it                                   |
| Camunda Hub         | Back up its PostgreSQL database. Console needs no backup of its own. See [Web Modeler backup and restore](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/modeler-backup-and-restore)                   |
| Optimize            | Use the Optimize backup API with the same backup ID as the Orchestration Cluster backup. See [Optimize backup and restore](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup-and-restore) |

The management platform's recovery point and recovery time follow from your backup interval and restore procedure. The dual-region [recovery objectives](#recovery-objectives) don't cover them, because those objectives apply to the Orchestration Cluster only.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region
