# Priority election — Limitations

With priority election enabled, election latency and thus failover time increases.

The result of a leader election is not deterministic, and priority election can only increase the chance of having a
uniform leader distribution, not guarantee it.

Factors such as high load can prevent high-priority nodes from becoming the leader.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/priority-election
