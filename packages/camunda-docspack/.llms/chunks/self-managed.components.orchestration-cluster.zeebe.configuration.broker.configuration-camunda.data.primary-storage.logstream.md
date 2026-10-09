# Broker configuration — Configuration — camunda.data.primary-storage.logstream

| Field            | Description                                                                                                                                                    | Example Value |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| log-segment-size | The size of data log segment files. This setting can also be overridden using the environment variable `CAMUNDA_DATA_PRIMARYSTORAGE_LOGSTREAM_LOGSEGMENTSIZE`. | 128MB         |

#### YAML snippet

```yaml
camunda:
  data:
    primary-storage:
      logstream:
        log-segment-size: 128MB
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
