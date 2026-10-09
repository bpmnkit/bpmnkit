# Broker configuration — Configuration — camunda.processing.flow-control.write

| Field   | Description                                                                                                                                                                                             | Example Value |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| enabled | Set this to enable or disable flow control for all writes. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_WRITE_ENABLED`.                           | false         |
| ramp-up | Time period during which the write limit gradually increases to the configured limit. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_WRITE_RAMPUP`. | 10s           |
| limit   | The maximum number of records that can be written per second. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_WRITE_LIMIT`.                          | 1000          |

#### YAML snippet

```yaml
camunda:
  processing:
    flow-control:
      write:
        enabled: false
        ramp-up: 10s
        limit: 1000
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
