# Gateway health probes — Customizing health probes — Liveness probe

Settings for liveness probe:

- `management.endpoint.health.group.liveness.show-details=never` - Toggles whether a summary (default) or details of the liveness probe will be returned.
- `management.endpoint.health.group.liveness.include=gatewayStarted,livenessGatewayResponsive,livenessGatewayClusterAwareness,livenessGatewayPartitionLeaderAwareness,livenessDiskSpace,livenessMemory` - Defines which health indicators are included in the liveness probe.

**Note**
The individual contributing health indicators of the liveness probe can be configured as well (see below).

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway-health-probes
