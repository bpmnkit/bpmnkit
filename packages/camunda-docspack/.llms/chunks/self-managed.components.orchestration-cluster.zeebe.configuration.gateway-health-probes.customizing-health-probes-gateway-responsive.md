# Gateway health probes — Customizing health probes — Gateway responsive

Settings for gateway responsiveness health indicator:

- `management.health.gateway-responsive.enabled=true` - Enables (default) or disables this health indicator.
- `management.health.gateway-responsive.requestTimeout=500ms` - Defines the timeout for the request; if the test completes before the timeout, the health status is `UP`, otherwise it is `DOWN`.
- `management.health.liveness.gateway-responsive.requestTimeout=5s` - Defines the timeout for the request for liveness probe; if the request completes before the timeout, the health status is `UP`.
- `management.health.liveness.gateway-responsive.maxdowntime=10m` - Defines the maximum downtime before the liveness health indicator for responsiveness will flip.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway-health-probes
