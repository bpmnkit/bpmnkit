# Broker configuration — Configuration — camunda.processing.flow-control.request.vegas

| Field         | Description                                                                                                                                                                                                                                 | Example Value |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| initial-limit | The initial limit to use when the broker starts. The limit is reset to this value when the broker restarts. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_VEGAS_INITIALLIMIT`. | 20            |
| alpha         | The limit is increased if the queue size is less than this value. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_VEGAS_ALPHA`.                                                  | 3             |
| beta          | The limit is decreased if the queue size is greater than this value. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_VEGAS_BETA`.                                                | 6             |

#### YAML snippet

```yaml
camunda:
  processing:
    flow-control:
      request:
        algorithm: vegas
        vegas:
          initial-limit: 20
          alpha: 3
          beta: 6
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
