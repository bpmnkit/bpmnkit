# Broker configuration — Configuration — camunda.processing.flow-control.request.fixed

| Field | Description                                                                                                                                 | Example Value |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| limit | Set a fixed limit. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_FIXED_LIMIT`. | 20            |

#### YAML snippet

```yaml
camunda:
  processing:
    flow-control:
      request:
        algorithm: fixed
        fixed:
          limit: 20
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
