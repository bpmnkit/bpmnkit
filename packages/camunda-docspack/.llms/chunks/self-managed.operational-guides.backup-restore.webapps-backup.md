# Web applications backup management API

Backup API to perform a backup of web application (Operate and Tasklist) data.

**Tip**
From Camunda 8.10, you can also use the Orchestration Cluster REST API to create, query, and manage history backups for Operate and Tasklist. See the [Orchestration Cluster REST API reference](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/take-history-backup.api).

**Warning: breaking changes**
As of the Camunda 8.8 release, the `/actuator` endpoints for backups have been moved to `/actuator/backupHistory`. The previous `/actuator/backups` endpoint is still active only if the applications are deployed standalone (each application is running in its own process).

**Note**
This page refers to the components Operate and Tasklist as "web applications".

Optimize is not backed up as part of this process. Optimize is a dedicated application with its own backup system. Please see the [documentation for Optimize](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup) to perform a backup.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/webapps-backup
