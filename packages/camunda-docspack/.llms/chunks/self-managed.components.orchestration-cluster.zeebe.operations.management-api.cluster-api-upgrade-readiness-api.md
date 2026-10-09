# Management API — Cluster API — Upgrade Readiness API

Use the Upgrade Readiness API to check if the Orchestration Cluster is ready for an upgrade to the next minor version. The API reports the status of each registered upgrade-readiness condition, grouped by physical tenant.

#### Check the upgrade readiness status

To check the upgrade readiness status, send a request to the Upgrade Readiness API. The API returns whether every registered condition has reached the `MIGRATED` state for every known physical tenant.

##### Request

```
GET actuator/upgradeReadiness
```

##### Response

The response is a JSON object. See the [OpenAPI spec](https://github.com/camunda/camunda/blob/main/dist/src/main/resources/api/cluster/upgrade-readiness-api.yaml) for details:

```
{
  "upgradeable": true,
  "physicalTenants": {
    "default": {
      "rdbmsSchemaMigrated": {
        "state": "MIGRATED",
        "detail": "schema version 8.10.0 matches the application version"
      },
      "brokerVersionMigrated": {
        "state": "MIGRATED",
        "detail": "every broker is running 8.10.0"
      },
      "exporterMigrated": {
        "state": "MIGRATED",
        "detail": "All partitions migrated"
      },
      "rocksDbMigrated": {
        "state": "MIGRATED",
        "detail": "All partitions migrated"
      }
    }
  }
}
```

- `upgradeable`: Whether the cluster is upgradeable to the next minor version.
  - `true`: Every registered condition reported `MIGRATED` for every known physical tenant.
  - `false`: At least one condition is not `MIGRATED`, or readiness data is not available yet. Check the detailed status reports.
- `physicalTenants`: A map of physical tenants and their upgrade readiness status.
- `rdbmsSchemaMigrated`: Whether the RDBMS schema has been migrated to the latest minor version.
- `brokerVersionMigrated`: Whether all brokers are running the expected version.
- `exporterMigrated`: Whether the exporters have exported and acknowledged all records of the previous minor version.
- `rocksDbMigrated`: Whether the RocksDB has been migrated and the last snapshot is of the latest minor version.

Each condition has a `state` of `MIGRATED`, `MIGRATION_IN_PROGRESS`, or `UNKNOWN`, and a human-readable `detail` message. The set of conditions depends on the providers registered in the cluster. Do not treat `upgradeable` as meaningful until all planned conditions are registered.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api
