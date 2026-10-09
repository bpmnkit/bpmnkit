# Broker configuration — Configuration — camunda.processing.flow-control.request.gradient2

| Field         | Description                                                                                                                                                                                                                                                                                                                                                                | Example Value |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| min-limit     | The minimum limit. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_GRADIENT2_MINLIMIT`.                                                                                                                                                                                                                         | 10            |
| initial-limit | The initial limit to use when the broker starts. The limit is reset to this value when the broker restarts. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_GRADIENT2_INITIALLIMIT`.                                                                                                                            | 20            |
| rtt-tolerance | Tolerance for changes from minimum latency. A value `>= 1.0` indicating how much change from minimum latency is acceptable before reducing the limit. For example, a value of `2.0` means that a 2x increase in latency is acceptable. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_GRADIENT2_RTTTOLERANCE`. | 2.0           |
| long-window   | Length of the window, in number of samples, used to calculate the exponentially smoothed average latency. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_GRADIENT2_LONGWINDOW`.                                                                                                                                | 600           |

#### YAML snippet

```yaml
camunda:
  processing:
    flow-control:
      request:
        algorithm: gradient2
        gradient2:
          min-limit: 10
          initial-limit: 20
          rtt-tolerance: 2.0
          long-window: 600
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
