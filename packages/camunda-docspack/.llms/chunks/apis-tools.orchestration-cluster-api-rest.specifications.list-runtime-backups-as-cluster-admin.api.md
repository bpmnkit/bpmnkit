# List runtime backups across physical tenants

`GET /cluster/v2/backups/runtime`

Lists the runtime backups of every physical tenant of the cluster, or of the one named by `physicalTenantId`, grouped by backup id. Every group reports every targeted tenant, including the ones holding nothing for that id, so a backup only some tenants hold aggregates to `INCOMPLETE` here exactly as it does when looked up directly — the state of a listed group can be trusted to say whether the cluster can be restored from it. A backup id that only some physical tenants hold is a supported outcome rather than a degraded one; tenants that generate their own backup ids never share one, so in that mode each backup forms its own group and the other tenants report `DOES_NOT_EXIST` under it.

The request is all-or-nothing: a physical tenant whose backups cannot be read fails the whole request rather than silently dropping out of the listing. Narrow the request with `physicalTenantId` to list the backups of the tenants that can still be read.

Requires the cluster-admin security chain. Although this operation lists `bearerAuth` / `basicAuth` like the rest of the Orchestration Cluster API, it does not accept an Orchestration Cluster user's credentials — only the separate cluster-admin credentials are valid here. Use `GET /v2/backups/runtime` to act as a single physical tenant.

- Added in Camunda 8.10.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Parameters:
  physicalTenantId (query, string)
  prefix (query, BackupIdPrefix)

Responses:
  200 ClusterRuntimeBackupInfo[] — The runtime backups of every targeted physical tenant, grouped by backup id and sorted in descending order of backup id, as the per-physical-tenant listing is. Empty when every targeted tenant was read and none of them holds a matching backup.
  400 ProblemDetail — The provided data is not valid.
  401 ProblemDetail — The request lacks valid authentication credentials.
  404 ProblemDetail — The requested `physicalTenantId` does not exist in this cluster.
  500 ProblemDetail — An internal error occurred while processing the request.
  503 ProblemDetail — The service is currently unavailable. This may happen only on some requests where the system creates backpressure to prevent the server's compute resources from being exhausted, avoiding more severe failures. In this case, the title of the error object contains `RESOURCE_EXHAUSTED`. Clients are recommended to eventually retry those requests after a backoff period. You can learn more about the backpressure mechanism here: https://docs.camunda.io/docs/components/zeebe/technical-concepts/internal-processing/#handling-backpressure .

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/list-runtime-backups-as-cluster-admin.api
