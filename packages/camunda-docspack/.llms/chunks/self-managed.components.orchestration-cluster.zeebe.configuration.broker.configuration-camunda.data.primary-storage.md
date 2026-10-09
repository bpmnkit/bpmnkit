# Broker configuration — Configuration — camunda.data.primary-storage

| Field             | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Example Value |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| directory         | Specify the directory in which data is stored. This setting can also be overridden using the environment variable `CAMUNDA_DATA_PRIMARYSTORAGE_DIRECTORY`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | data          |
| runtime-directory | Specify the directory in which runtime is stored. By default, runtime is stored in the data directory. If `runtime-directory` is configured, that directory is used instead. It contains a subdirectory for each partition to store its runtime. There is no need to store runtime on persistent storage. This configuration allows you to place runtime on another disk to optimize performance and disk usage. Note: If runtime is on a different disk than the data directory, files must be copied to the data directory while taking a snapshot. This can affect disk I/O or performance during snapshotting. This setting can also be overridden using the environment variable `CAMUNDA_DATA_PRIMARYSTORAGE_RUNTIMEDIRECTORY`. | null          |

#### YAML snippet

```yaml
camunda:
  data:
    primary-storage:
      directory: data
      runtime-directory: null
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
