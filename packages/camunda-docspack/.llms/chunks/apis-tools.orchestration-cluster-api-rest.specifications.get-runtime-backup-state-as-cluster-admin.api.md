# Get runtime backup state across physical tenants

`GET /cluster/v2/backups/runtime/state`

Reports the checkpoint and backup state of every partition of every physical tenant of the cluster, or of the one named by `physicalTenantId`, grouped by physical tenant. Checkpoint ids and log positions only mean anything within one physical tenant's partitions, so nothing is aggregated across tenants.

The request is all-or-nothing: a physical tenant whose state cannot be read fails the whole request rather than contributing an empty section, which an operator making a delete or restore decision could not tell apart from "nothing to report yet". Narrow the request with `physicalTenantId` to read the tenants that can still be reached.

Requires the cluster-admin security chain. Although this operation lists `bearerAuth` / `basicAuth` like the rest of the Orchestration Cluster API, it does not accept an Orchestration Cluster user's credentials — only the separate cluster-admin credentials are valid here. Use `GET /v2/backups/runtime/state` to act as a single physical tenant.

- Added in Camunda 8.10.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Parameters:
  physicalTenantId (query, string)

Responses:
  200 ClusterRuntimeBackupState — The runtime backup state of every targeted physical tenant, ordered by physical tenant id.
  401 ProblemDetail — The request lacks valid authentication credentials.
  404 ProblemDetail — The requested `physicalTenantId` does not exist in this cluster.
  500 ProblemDetail — An internal error occurred while processing the request.
  503 ProblemDetail — The service is currently unavailable. This may happen only on some requests where the system creates backpressure to prevent the server's compute resources from being exhausted, avoiding more severe failures. In this case, the title of the error object contains `RESOURCE_EXHAUSTED`. Clients are recommended to eventually retry those requests after a backoff period. You can learn more about the backpressure mechanism here: https://docs.camunda.io/docs/components/zeebe/technical-concepts/internal-processing/#handling-backpressure .

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-runtime-backup-state-as-cluster-admin.api
