# Broker configuration — Configuration — camunda.data

| Field           | Description                                                                                                                                             | Example Value |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| snapshot-period | How often snapshots of streams are taken (time unit). This setting can also be overridden using the environment variable `CAMUNDA_DATA_SNAPSHOTPERIOD`. | 5m            |

#### YAML snippet

```yaml
camunda:
  data:
    snapshot-period: 5m
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
