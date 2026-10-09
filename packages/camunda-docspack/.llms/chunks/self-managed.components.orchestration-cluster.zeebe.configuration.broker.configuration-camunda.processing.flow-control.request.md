# Broker configuration — Configuration — camunda.processing.flow-control.request

Configure flow control for user requests.

| Field     | Description                                                                                                                                                                                                                                                                                                                                              | Example Value |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| enabled   | Set this to enable flow control for user requests. When enabled, the broker rejects user requests when the number of inflight requests is greater than the limit. The value of the limit is determined by the configured algorithm. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_ENABLED`. | true          |
| algorithm | Configures which algorithm to use for flow control. It should be one of `vegas`, `aimd`, `fixed`, `gradient`, or `gradient2`. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_ALGORITHM`.                                                                                                     | aimd          |
| windowed  | If enabled, uses average latencies over a window as the current latency to update the limit. It is not recommended to enable this when the algorithm is `aimd`. This setting does not apply to the `fixed` algorithm. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_REQUEST_WINDOWED`.              | false         |

#### YAML snippet

```yaml
camunda:
  processing:
    flow-control:
      request:
        enabled: true
        algorithm: aimd
        windowed: false
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
