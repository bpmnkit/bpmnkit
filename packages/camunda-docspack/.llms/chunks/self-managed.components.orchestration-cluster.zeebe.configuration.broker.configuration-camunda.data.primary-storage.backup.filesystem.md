# Broker configuration — Configuration — camunda.data.primary-storage.backup.filesystem

To store your backups in the local filesystem, choose the `FILESYSTEM` backup store and specify where to store the backups locally.

**Caution**
Since the durability of the backups largely depends on the target file system and underlying storage, it is recommended to use known durable solutions in production, such as S3, GCS, or Azure. To ensure that this can be used properly in production, you must use a POSIX-compliant file system and, at a minimum, replicated disks (for example, RAID-configured disks).

**Note: Backup encryption**
Zeebe does not support backup encryption natively, but it _can_ use filesystem-based encryption. This is then a feature of the filesystem and not Zeebe itself.

| Field     | Description                                                                                                                                                                                                                                                                                            | Example Value      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| base-path | The base path is used to define the parent directory of all created backups and backup manifest files. **This directory must exist and be writable by the Zeebe broker**. This setting can also be overridden using the environment variable `CAMUNDA_DATA_PRIMARYSTORAGE_BACKUP_FILESYSTEM_BASEPATH`. | /mnt/backups/zeebe |

#### YAML snippet

```yaml
camunda:
  data:
    primary-storage:
      backup:
        store: FILESYSTEM
        filesystem:
          base-path: /mnt/backups/zeebe
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
