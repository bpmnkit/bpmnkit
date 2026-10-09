# Broker configuration — Configuration — application.yaml

```yaml
camunda:
  data:
    primary-storage:
      backup:
        required: "false"
        continuous: "true"
        schedule: "PT10M"
        checkpoint-interval: "PT1M"
        offset: 20260215115715
        retention:
          window: "P1W"
          cleanup-schedule: "PT1H"
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
