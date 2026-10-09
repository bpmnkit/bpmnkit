# Version compatibility checks — Broker behavior

The broker validates the previous persisted version against the new binary version during startup:

- **Compatible:** Proceeds with state (DB) migration if required (skipped for restarts or no-op cases).
- **Incompatible:** Starts but marks itself unhealthy and does not apply any state or data migration. Check startup logs, fix the unsupported upgrade path, and restart.

### Why incompatible paths are blocked

Skipping minors, downgrading, or involving pre-release versions can result in an incompatible state that the broker cannot safely reconcile. Blocking these paths prevents partial or irreversibly invalid migrations.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/version-compatibility
