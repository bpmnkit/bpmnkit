# Broker configuration — Configuration — camunda.data.primary-storage.backup

Configure backup store.

**Note**
Use the same configuration on all brokers of this cluster.

**Caution**
Backups created with one store are not available or restorable from another store.

This is especially relevant if you were using GCS through the S3 compatibility mode and want to switch to the new built-in support for GCS now.
Even when the underlying storage bucket is the same, backups from one are not compatible with the other.

| Field | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Example Value |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| store | Set the backup store type. Supported values are [NONE, S3, GCS, AZURE, FILESYSTEM]. Default value is NONE. When NONE, no backup store is configured and no backup will be taken. Use S3 to use any S3 compatible storage, including, but not limited to, Amazon S3. Use GCS to use Google Cloud Storage. Use AZURE to use Azure Cloud Storage. Use FILESYSTEM to store backups directly via the filesystem to a particular folder. This setting can also be overridden using the environment variable `CAMUNDA_DATA_PRIMARYSTORAGE_BACKUP_STORE`. | NONE          |

#### YAML snippet

```yaml
camunda:
  data:
    primary-storage:
      backup:
        store: NONE
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
