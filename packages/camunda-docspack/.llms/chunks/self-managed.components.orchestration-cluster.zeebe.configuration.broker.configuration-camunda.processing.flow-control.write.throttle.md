# Broker configuration — Configuration — camunda.processing.flow-control.write.throttle

| Field              | Description                                                                                                                                                                                                                                                                                                    | Example Value |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| enabled            | Set this to enable or disable write throttling based on the exporting backlog. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_WRITE_THROTTLE_ENABLED`.                                                                                                     | false         |
| acceptable-backlog | The number of records that can be in the exporting backlog. The write rate is throttled so that the backlog stabilizes around this value when exporting is a bottleneck. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_WRITE_THROTTLE_ACCEPTABLEBACKLOG`. | 100000        |
| minimum-limit      | The minimum write limit that is guaranteed even when throttling. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_WRITE_THROTTLE_MINIMUMLIMIT`.                                                                                                              | 100           |
| resolution         | The frequency at which throttling is updated. This setting can also be overridden using the environment variable `CAMUNDA_PROCESSING_FLOWCONTROL_WRITE_THROTTLE_RESOLUTION`.                                                                                                                                   | 15s           |

#### YAML snippet

```yaml
camunda:
  processing:
    flow-control:
      write:
        throttle:
          enabled: false
          acceptable-backlog: 100000
          minimum-limit: 100
          resolution: 15s
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
