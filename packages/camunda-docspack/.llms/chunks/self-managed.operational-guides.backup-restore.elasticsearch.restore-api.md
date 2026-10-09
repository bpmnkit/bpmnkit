# Restore a backup with the Restore API

Learn how to restore a Camunda 8 Self-Managed backup with the Orchestration Cluster Restore API when using Elasticsearch or OpenSearch.

Restore Zeebe partition data through the Orchestration Cluster Restore API without restarting the brokers, when using Elasticsearch or OpenSearch as secondary storage.

This page is part of the Elasticsearch/OpenSearch [restore procedure](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore). To compare it with the legacy Restore Application, see [choosing a restore approach](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore#choosing-a-restore-approach).


## About the Restore API

With Camunda 8.10 and later, a Restore API recovery runs during a downtime window while the cluster is in recovery mode. It runs in four phases, driven by two API requests:

1. **Entering recovery mode**: every broker deactivates its partitions and switches to a restricted partition manager. While the cluster is in recovery mode it processes no work, and only read-only operations and restore remain available.
2. **Restoring secondary storage**: while the cluster is in recovery mode, restore the Elasticsearch/OpenSearch snapshots for the intended backup ID.
3. **Restoring the partitions**: the cluster plans a single change that, for every broker and partition, first drops the local partition data and then restores that partition from the selected backup. The steps of that plan run one at a time across the cluster.
4. **Returning to processing**: once every partition is restored, the same change switches all brokers back to `PROCESSING` and the partitions become active again.

Both requests are non-blocking. Each is acknowledged as soon as the cluster accepts the change and returns the `changeId` of the cluster configuration change that carries it out.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/elasticsearch/restore-api
