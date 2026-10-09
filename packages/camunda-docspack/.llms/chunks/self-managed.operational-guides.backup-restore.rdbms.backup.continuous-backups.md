# Camunda backup creation (RDBMS) — Continuous backups

Continuous backups must be enabled for RDBMS backup and restore.

### How continuous backups work

Continuous backups rely on a Zeebe feature that retains data records in the log stream until they are backed up.
This ensures that after restore, the state of primary and secondary storage is in sync, without the need to orchestrate primary and secondary storage backups.

When continuous backups are enabled:

1. Zeebe prevents log compaction from deleting any segment that hasn't been backed up yet, and tracks backup metadata so you can query available backup ranges.
2. The system tracks **backup ranges** — unbroken sequences of consecutive backups. These ranges define the time windows available for restore and can be queried via the [backup state actuator](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/zeebe-backup-and-restore#request-runtime-state).

**Warning**
Without [scheduled backups](#scheduled-backup) or regular manual backups, continuous mode causes disk usage to grow indefinitely because Zeebe cannot compact any log segments. Always pair continuous backups with a backup schedule.

### Enable continuous backups

Set the following configuration property:

  
### yaml

```yaml
camunda:
  data:
    primary-storage:
      backup:
        store: S3 # or GCS, AZURE, FILESYSTEM
        continuous: true
```

  
  
### env

```bash
export CAMUNDA_DATA_PRIMARYSTORAGE_BACKUP_STORE=S3
export CAMUNDA_DATA_PRIMARYSTORAGE_BACKUP_CONTINUOUS=true
```

  

### Checkpoint interval

The checkpoint interval controls how frequently Zeebe injects marker checkpoints into the log stream. These markers serve as potential restore points — since a cluster can only be restored to a checkpoint that exists on all partitions, more frequent markers enable finer-grained [point-in-time restore](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/restore-api#trigger-the-restore).

```yaml
camunda:
  data:
    primary-storage:
      backup:
        checkpoint-interval: PT15M # inject a marker checkpoint every 15 minutes
```

Note that the checkpoint interval does **not** determine how frequently backups are taken — that is controlled by the [backup schedule](#scheduled-backup). A shorter checkpoint interval provides more precise restore points within the backed-up range, at the cost of slightly more metadata overhead.

---
Source: https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/rdbms/backup
