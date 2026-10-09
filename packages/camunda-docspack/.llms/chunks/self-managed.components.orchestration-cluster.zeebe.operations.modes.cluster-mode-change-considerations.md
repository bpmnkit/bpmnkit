# Cluster mode — Cluster mode change considerations

- Entering recovery mode stops all processing in the cluster. Plan the change as a maintenance operation, and expect client requests to fail while the cluster is recovering.
- Brokers already in the target mode are not included in the plan. Repeating the same request after the change completes results in an empty plan.
- A mode change is a cluster configuration change, so only one cluster configuration operation can be in progress at a time. You can cancel an active cluster configuration change.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/modes
