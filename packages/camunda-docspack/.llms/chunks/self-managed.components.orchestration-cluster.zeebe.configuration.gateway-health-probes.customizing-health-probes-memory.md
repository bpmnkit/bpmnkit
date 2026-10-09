# Gateway health probes — Customizing health probes — Memory

This health indicator examines free memory (heap).

Settings for memory health indicator:

- `management.health.memory.enabled=true` - Enables (default) or disables this health indicator (and its liveness counterpart).
- `management.health.memory.threshold=0.1` - Defines the threshold for the required free memory. The default is 0.1 which is interpreted as 10% of max memory.
- `management.health.liveness.memory.threshold=0.01` - Defines the threshold for the required free memory for liveness. The default is 0.01 which is interpreted as 10 of max memory.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway-health-probes
