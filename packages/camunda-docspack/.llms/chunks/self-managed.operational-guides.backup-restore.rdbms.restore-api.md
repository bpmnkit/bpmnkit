# Restore a backup with the Restore API (RDBMS)

Learn how to restore a Camunda 8 Self-Managed backup with the Orchestration Cluster Restore API when using a relational database as secondary storage.

Restore Zeebe partition data through the Orchestration Cluster Restore API without restarting the brokers, when using a relational database management system (RDBMS) as secondary storage.

This page is part of the RDBMS [restore procedure](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore). To compare it with the legacy Restore Application, see [choosing a restore approach](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore#choosing-a-restore-approach).


## About the Restore API

With Camunda 8.10 and later, a Restore API recovery runs during a downtime window while the cluster is in recovery mode. It runs in four phases, driven by two API requests:

1. **Entering recovery mode**: every broker deactivates its partitions and switches to a restricted partition manager. While the cluster is in recovery mode it processes no work, and only read-only operations and restore remain available.
2. **Restoring secondary storage**: while the cluster is in recovery mode, restore the RDBMS to the intended point that the primary storage backup aligns to.
3. **Restoring the partitions**: the cluster plans a single change that, for every broker and partition, first drops the local partition data and then restores that partition from the selected backups. The steps of that plan run one at a time across the cluster.
4. **Returning to processing**: once every partition is restored, the same change switches all brokers back to `PROCESSING` and the partitions become active again.

Both requests are non-blocking. Each is acknowledged as soon as the cluster accepts the change and returns the `changeId` of the cluster configuration change that carries it out.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api
