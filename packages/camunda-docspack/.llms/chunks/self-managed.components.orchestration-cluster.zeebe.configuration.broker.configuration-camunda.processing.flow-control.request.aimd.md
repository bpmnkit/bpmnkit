# Broker configuration — Configuration — camunda.processing.flow-control.request.aimd

| Field           | Description                                                                                                                                                                                                                                | Example Value |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| request-timeout | The limit is reduced if the observed latency is greater than `request-timeout`. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_AIMD_REQUESTTIMEOUT`.                           | 200ms         |
| initial-limit   | The initial limit to use when the broker starts. The limit is reset to this value when the broker restarts. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_AIMD_INITIALLIMIT`. | 100           |
| min-limit       | The minimum limit. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_AIMD_MINLIMIT`.                                                                                              | 1             |
| max-limit       | The maximum limit. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_AIMD_MAXLIMIT`.                                                                                              | 1000          |
| backoff-ratio   | A double value between `0` and `1` that determines the factor by which the limit is decreased. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_AIMD_BACKOFFRATIO`.              | 0.9           |

#### YAML snippet

```yaml
camunda:
  processing:
    flow-control:
      request:
        algorithm: aimd
        aimd:
          request-timeout: 200ms
          initial-limit: 100
          min-limit: 1
          max-limit: 1000
          backoff-ratio: 0.9
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
