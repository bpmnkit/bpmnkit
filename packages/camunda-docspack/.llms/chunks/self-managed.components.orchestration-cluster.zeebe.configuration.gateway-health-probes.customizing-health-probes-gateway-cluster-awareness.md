# Gateway health probes — Customizing health probes — Gateway cluster awareness

Settings for gateway cluster awareness health indicator:

- `management.health.gateway-clusterawareness.enabled=true` - Enables (default) or disables this health indicator (and its liveness counterpart).
- `management.health.liveness.gateway-clusterawareness.maxdowntime=5m` - Defines the maximum downtime before the liveness health indicator for cluster awareness will flip. In other words, this health indicator will report `DOWN` after the gateway was unaware of other members in the cluster for more than five minutes.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway-health-probes
