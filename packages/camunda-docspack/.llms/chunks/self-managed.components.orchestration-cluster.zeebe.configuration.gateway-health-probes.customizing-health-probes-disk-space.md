# Gateway health probes — Customizing health probes — Disk space

This is arguably the least critical health indicator given the standalone gateway does not write to disk. The only exception may be the writing of log files, which depend on the log configuration.

Settings for disk space health indicator:

- `management.health.diskspace.enabled=true` - Enables (default) or disables this health indicator (and its liveness counterpart).
- `management.health.diskspace.threshold=10MB` - Defines the threshold for the required free disk space.
- `management.health.diskspace.path=.` - Defines the path for which the free disk space is examined.
- `management.health.liveness.diskspace.threshold=1MB` - Defines the threshold for the required free disk space for liveness.
- `management.health.liveness.diskspace.path=.` - Defines the path for which the free disk space for liveness is examined.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/gateway-health-probes
