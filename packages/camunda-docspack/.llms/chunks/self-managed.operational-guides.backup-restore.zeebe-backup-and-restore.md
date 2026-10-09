# Zeebe backup management API

Backup API to create a backup of a running Zeebe cluster comprised of a consistent snapshot of all partitions.

**Tip**
From Camunda 8.10, you can also use the Orchestration Cluster REST API to create, query, and manage runtime backups. See the [Orchestration Cluster REST API reference](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/take-runtime-backup.api).

**Warning: breaking changes**
As of the Camunda 8.8 release, the `/actuator` endpoints for backups have been moved to `/actuator/backupRuntime`. The previous `/actuator/backups` endpoint is still active only if the applications are deployed standalone (each application is running in its own process).

Back up a running Zeebe cluster using the Backup Management API.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore
