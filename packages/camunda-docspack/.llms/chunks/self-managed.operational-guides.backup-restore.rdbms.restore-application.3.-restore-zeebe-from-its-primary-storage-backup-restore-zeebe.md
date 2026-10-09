# Restore a backup with the Restore Application (RDBMS) — 3. Restore Zeebe from its primary storage backup {#restore-zeebe}

Camunda provides a standalone restore application that must be run on each node where a Zeebe Broker will be running. This is a Spring Boot application similar to the broker and can run using the binary provided as part of the distribution. The app can be configured the same way a broker is configured — via environment variables or using the configuration file located in `config/application.yaml`.

**Warning**
Persistent volumes or disks must not contain any pre-existing data before restoring Zeebe. If data exists from a previous deployment, it must be cleared first. On physical tenant enabled environments, only the data directory for the specific tenant must be cleared.

**Warning**
When restoring, provide the same configuration (node id, data directory, cluster size, and replication count) as the broker that will be running on this node. The partition count **must be the same** as in the backup.

The number of partitions backed up is also visible via the [backup management API](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore#list-backups-api).
If brokers were dynamically scaled between backup and restore, this is not an issue — as long as the partition count remains unchanged.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-application
