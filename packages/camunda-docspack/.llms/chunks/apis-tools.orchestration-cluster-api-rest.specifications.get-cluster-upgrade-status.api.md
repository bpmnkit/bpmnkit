# Get the upgrade-readiness status of the whole cluster

`GET /cluster/v2/status/upgrade`

Reports one overall upgrade-readiness status for the whole cluster, folded over every physical tenant and condition. `MIGRATED` only once every known condition has migrated for every known physical tenant; `MIGRATION_IN_PROGRESS` when at least one is confirmed not yet migrated; `UNKNOWN` otherwise (including before anything has been reported yet). No per-tenant or per-condition detail is reported here; see the `upgradeReadiness` actuator endpoint for that.

- Added in Camunda 8.10.
- Consistency: strong.

Responses:
  200 ClusterUpgradeStatusResponse — The cluster's upgrade-readiness status.

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-cluster-upgrade-status.api
