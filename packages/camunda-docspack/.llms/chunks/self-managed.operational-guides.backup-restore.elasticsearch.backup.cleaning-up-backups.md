# Camunda backup creation (Elasticsearch/OpenSearch) — Cleaning up backups

Depending on your company’s backup policies (for example, retention periods and number of backups to keep) you should consider regularly cleaning up your old backups to reduce storage costs and efficiently manage resources.

You can use the **delete backup APIs** for each component to remove the associated resources from the configured backup storage. You will have to provide the same backup ID for all calls to remove it from all backup stores.

- Web Applications (history backup): [`DELETE /backups/history/{backupId}`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/delete-history-backup.api) (REST API), or the [management API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/webapps-backup#delete-backup-api)
- Zeebe (runtime backup): [`DELETE /backups/runtime/{backupId}`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/delete-runtime-backup.api) (REST API), or the [management API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore#delete-backup-api)
- [Optimize](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup#delete-backup-api) (management API only, no REST equivalent)

The REST API also lists backups: [`GET /backups/history`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/list-history-backups.api) and [`GET /backups/runtime`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/list-runtime-backups.api), each with an optional `prefix` filter.

For Zeebe, you would also have to remove the separately backed up `zeebe-record` index snapshot using the [Elasticsearch](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-snapshot-delete) / [OpenSearch](https://docs.opensearch.org/docs/latest/api-reference/snapshots/delete-snapshot/) API directly.

### Primary storage retention

**Note**
This only affects the primary storage and does not interfere with Elasticsearch/OpenSearch backups.

With Camunda 8.9 you now have the option to enable a retention mechanism over primary storage (Zeebe's) backups. This will periodically delete backups from the configured blob storage based on the preconfigured retention window. Learn more about configuring backup retention [here](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/configuration/properties#camundadataprimary-storagebackupretention).

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/backup
