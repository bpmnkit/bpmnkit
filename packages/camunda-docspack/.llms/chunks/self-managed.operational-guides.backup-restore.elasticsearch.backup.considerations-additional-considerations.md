# Camunda backup creation (Elasticsearch/OpenSearch) — Considerations — Additional considerations

In this guide, `$BACKUP_ID` is the placeholder for a single backup ID, such as `1748937221`. When you create a full Camunda 8 backup using Elasticsearch or OpenSearch, use the same backup ID for each component backup in that backup set.

For example, backup `1748937221` of Camunda 8 consists of the following component backups:

- A Zeebe backup with backup ID `1748937221`, which contains one snapshot per partition.
- An Optimize backup with backup ID `1748937221`, which can contain multiple Optimize snapshots.
- A Web Applications backup with backup ID `1748937221`, which can contain multiple Operate and Tasklist snapshots.

This means one `backupId` identifies the full Camunda 8 backup set, while each component can still create multiple underlying snapshots.

The backup ID must be an integer and greater than any previous backup ID.

Optimize is not part of the Web Applications backup API and needs to be executed separately to successfully make a backup. Depending on your deployment configuration, you may not have Optimize deployed. It is safe to ignore the backup instructions for Optimize if it is not deployed.

**Warning: breaking change**
As of Camunda 8.8, the `indexPrefix` of Operate and Tasklist must match. By default, it is set to `""`. If overridden, it must be set consistently across Operate and Tasklist.

**Warning: breaking change**
As of Camunda 8.8, configuring Operate and Tasklist with different repository names will potentially create multiple backups in different repositories.

**Warning: breaking changes**
As of Camunda 8.8, the `/actuator` endpoints for backups have been moved to `/actuator/backupHistory` (Web Applications) and `/actuator/backupRuntime` (Zeebe). The previous `/actuator/backups` endpoint is still active only if the applications are deployed standalone (each application is running in its own process).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
