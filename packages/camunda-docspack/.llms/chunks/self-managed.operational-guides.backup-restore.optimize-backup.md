# Optimize backup management API

Backup API to perform a backup of Optimize data.

Back up your Optimize data using the Backup Management API.


## About this API

Optimize is a dedicated application that stores its data over multiple indices in the database. To ensure data integrity across indices, a backup of Optimize data consists of two Elasticsearch/OpenSearch snapshots, each containing a different set of Optimize indices. Each backup is identified by a positive integer backup ID. For example, a backup with ID `123456` consists of the following snapshots:

```
camunda_optimize_123456_8.8.0_part_1_of_2
camunda_optimize_123456_8.8.0_part_2_of_2
```

Optimize provides an API to trigger a backup and retrieve information about a given backup's state. During backup creation Optimize can continue running. The backed up data can later be restored using the standard Elasticsearch/OpenSearch snapshot restore API.

**Warning**
Usage of this API requires the backup store to be configured for the component.

- Optimize configuration
  - [Elasticsearch](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#elasticsearch-backup-settings)
  - [OpenSearch](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration#opensearch-backup-settings)

1. A snapshot repository of your choice must be registered with Elasticsearch/OpenSearch.
2. The repository name must be specified using the `CAMUNDA_OPTIMIZE_BACKUP_REPOSITORY_NAME` environment variable, or by adding it to your Optimize [`environment-config.yaml`](https://docs.camunda.io/docs/next/self-managed/components/optimize/configuration/system-configuration):

- [Elasticsearch snapshot repository](https://www.elastic.co/docs/deploy-manage/tools/snapshot-and-restore/manage-snapshot-repositories)
- [OpenSearch snapshot repository](https://docs.opensearch.org/docs/latest/tuning-your-cluster/availability-and-recovery/snapshots/snapshot-restore/)

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/optimize-backup
