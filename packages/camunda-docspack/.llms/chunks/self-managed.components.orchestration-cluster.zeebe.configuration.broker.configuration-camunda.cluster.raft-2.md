# Broker configuration — Configuration — camunda.cluster.raft (2)

#### YAML snippet

```yaml
camunda:
  cluster:
    raft:
      priority-election-enabled: true
      flush-enabled: true
      flush-delay: 0s
      heartbeat-interval: 250ms
      election-timeout: 2500ms
      rebalance:
        replication-lag-threshold: 8MB
        replication-timeout: 10s
        max-transfer-attempts: 3
        leader-wait-timeout: 1m
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/broker
