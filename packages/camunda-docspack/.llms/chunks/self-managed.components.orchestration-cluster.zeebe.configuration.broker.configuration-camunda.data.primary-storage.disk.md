# Broker configuration — Configuration — camunda.data.primary-storage.disk

| Field               | Description                                                                                                                                                                                                                                                                                                                                                        | Example Value |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| monitoring-enabled  | Configure disk monitoring to prevent getting into a non-recoverable state due to running out of disk space. When monitoring is enabled, the broker rejects commands and pauses replication when the required free space is not available. This setting can also be overridden using the environment variable `CAMUNDA_DATA_PRIMARYSTORAGE_DISK_MONITORINGENABLED`. | true          |
| monitoring-interval | Sets the interval at which disk usage is monitored. This setting can also be overridden using the environment variable `CAMUNDA_DATA_PRIMARYSTORAGE_DISK_MONITORINGINTERVAL`.                                                                                                                                                                                      | 1s            |

#### YAML snippet

```yaml
camunda:
  data:
    primary-storage:
      disk:
        monitoring-enabled: true
        monitoring-interval: 1s
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
