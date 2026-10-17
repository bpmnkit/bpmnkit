# Storage isolation — Operational considerations — Secondary storage failures during startup and runtime (2)

The secondary-storage readiness signal is based on schema initialization and does not continuously probe storage connectivity. As a result, a storage outage after startup does not automatically make a ready node fail its readiness probe. The full health endpoint, logs, and operation-specific errors provide the live storage status. The full `/actuator/health` result can be `DOWN` for one failed tenant even when `/actuator/health/readiness` remains `UP` because another tenant is serviceable.

When a tenant is degraded because its schema has not initialized, REST query API requests, that require secondary storage for that tenant, return `HTTP 503 Service Unavailable` and a `Retry-After: 5` header. Other tenants continue to be served. After the storage problem is fixed, a retryable failure recovers in the background without restarting the node.

#### Schema-initialization health

The `physicalTenantSchemaInitialization` contributor of `/actuator/health` reports the schema-initialization state of every Physical Tenant on the node. Use it to find out which tenant is degraded, whether it recovers on its own, and why it failed.

Each tenant reports one of the following states:

| Tenant status | State          | Meaning                                                                                                 | Action                                                  |
| ------------- | -------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `UP`          | `INITIALIZED`  | The schema is applied and the tenant is serviceable.                                                    | None.                                                   |
| `DEGRADED`    | `INITIALIZING` | No attempt has finished yet.                                                                            | None.                                                   |
| `DEGRADED`    | `RETRYING`     | An attempt failed with a retryable error, and another attempt is scheduled.                             | Fix the reported cause. The tenant recovers on its own. |
| `DEGRADED`    | `RECOVERING`   | Schema initialization is held back while the cluster is in recovery mode, for example during a restore. | None. This isn't a failure.                             |
| `DOWN`        | `FAILED`       | An attempt failed with an error that retrying can't repair, so no further attempt is made.              | Fix the reported cause, then restart the node.          |
| `DOWN`        | `GAVE_UP`      | Every configured retry attempt failed, so no further attempt is made.                                   | Fix the reported cause, then restart the node.          |
| `DOWN`        | `ABORTED`      | The initialization task couldn't start, or ended outside an attempt.                                    | Check the logs for the tenant, then restart the node.   |

Unless a tenant is `INITIALIZED`, its entry also includes `failedAttempts`, the number of attempts that failed so far, once an attempt has failed. It includes `error`, the exception class and message of the most recent failure, when there is one. The error is truncated to 256 characters. The application logs contain the full error.

This contributor is informational. Camunda keeps it out of the liveness, readiness, and startup groups, so one tenant's state never restarts or removes the node. The contributor is `UP` when every tenant is `UP`, `DOWN` when every tenant is `DOWN`, and `DEGRADED` otherwise. A node that still serves at least one tenant therefore never reports this contributor as `DOWN`, and `/actuator/health` doesn't return `503` because of a single failed tenant's schema. The per-tenant `rdbmsStatus` and `searchEngineStatus` contributors still report `DOWN` while one tenant's storage is unreachable.

For example, a node whose `default` tenant is serviceable while `tenanta` failed terminally reports:

```json
"physicalTenantSchemaInitialization": {
  "status": "DEGRADED",
  "details": {
    "default": {
      "status": "UP",
      "state": "INITIALIZED"
    },
    "tenanta": {
      "status": "DOWN",
      "state": "FAILED",
      "failedAttempts": 1,
      "error": "io.camunda.search.schema.exceptions.IndexSchemaValidationException: Index names: [tenantaprefix-camunda-role-8.8.0_]. Unsupported index changes have been introduced. Data migration is required. Changes found: [PropertyDifference[name=roleId, ... (see logs)"
    }
  }
}
```

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/storage-isolation
