# Restore a backup

Learn how to restore a Camunda 8 Self-Managed backup using Elasticsearch or OpenSearch.

Restore a previous backup of your Camunda 8 Self-Managed components and cluster when using Elasticsearch or OpenSearch as secondary storage.


## Choosing a restore approach

Restore the Zeebe partitions with one of two approaches. Both include restoring the Elasticsearch/OpenSearch snapshots as one of their steps.


## About restoring a backup

A restore consists of two parts: restoring the Elasticsearch/OpenSearch snapshots, and restoring the Zeebe partitions from the Zeebe primary storage backup.

**Note**
When restoring Camunda 8 from a backup, all components must be restored from their backup that corresponds to the same backup ID.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore
