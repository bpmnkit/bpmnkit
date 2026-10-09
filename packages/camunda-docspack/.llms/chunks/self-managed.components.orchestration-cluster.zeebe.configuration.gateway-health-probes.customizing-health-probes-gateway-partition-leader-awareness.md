# Gateway health probes — Customizing health probes — Gateway partition leader awareness

Settings for gateway partition leader awareness health indicator:

- `management.health.gateway-partitionleaderawareness.enabled=true` - Enables (default) or disables this health indicator (and its liveness counterpart).
- `management.health.liveness.gateway-partitionleaderawareness.maxdowntime=5m` - Defines the maximum downtime before the liveness health indicator for partition leader awareness will flip. In other words, this health indicator will report `DOWN` after the gateway was unaware of partition leaders for more than five minutes.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway-health-probes
