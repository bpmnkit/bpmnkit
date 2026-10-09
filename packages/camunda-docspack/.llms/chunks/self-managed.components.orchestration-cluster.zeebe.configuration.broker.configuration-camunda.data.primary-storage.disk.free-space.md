# Broker configuration — Configuration — camunda.data.primary-storage.disk.free-space

| Field       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Example Value |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| processing  | When the available free space is less than this value, the broker rejects all client commands and pauses processing. This setting can also be overridden using the environment variable `CAMUNDA_DATA_PRIMARYSTORAGE_DISK_FREESPACE_PROCESSING`.                                                                                                                                                                                                                                                                                  | 2GB           |
| replication | When the available free space is less than this value, the broker stops receiving replicated events. This value must be less than `free-space.processing`. It is recommended to configure enough free space for at least one log segment and one snapshot. This is because a partition needs enough space to take a new snapshot so it can compact log segments and make disk space available again. This setting can also be overridden using the environment variable `CAMUNDA_DATA_PRIMARYSTORAGE_DISK_FREESPACE_REPLICATION`. | 1GB           |

#### YAML snippet

```yaml
camunda:
  data:
    primary-storage:
      disk:
        free-space:
          processing: 2GB
          replication: 1GB
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
