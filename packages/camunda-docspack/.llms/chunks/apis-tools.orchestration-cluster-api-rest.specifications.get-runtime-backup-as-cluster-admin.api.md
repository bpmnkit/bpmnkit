# Get a runtime backup across physical tenants

`GET /cluster/v2/backups/runtime/{backupId}`

Reports what every physical tenant of the cluster, or the one named by `physicalTenantId`, holds for the given backup id, plus the state aggregated over all of them. A tenant that was reached and does not hold this backup reports `DOES_NOT_EXIST`, which is a successful observation rather than a failure — so a backup only some tenants hold aggregates to `INCOMPLETE`, the same way a backup only some partitions hold does within one tenant.

The request is all-or-nothing: a physical tenant whose state cannot be read fails the whole request. Narrow the request with `physicalTenantId` to read the tenants that can still be reached.

Requires the cluster-admin security chain. Although this operation lists `bearerAuth` / `basicAuth` like the rest of the Orchestration Cluster API, it does not accept an Orchestration Cluster user's credentials — only the separate cluster-admin credentials are valid here. Use `GET /v2/backups/runtime/{backupId}` to act as a single physical tenant.

- Added in Camunda 8.10.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Parameters:
  backupId (path, BackupId, required)
  physicalTenantId (query, string)

Responses:
  200 ClusterRuntimeBackupInfo — Every targeted physical tenant was read, and at least one holds the backup. Each tenant reports either the backup or `DOES_NOT_EXIST`.
  400 ProblemDetail — The provided data is not valid.
  401 ProblemDetail — The request lacks valid authentication credentials.
  404 ProblemDetail — The requested `physicalTenantId` does not exist in this cluster, or every targeted physical tenant was read and none of them holds a backup with the given id.
  500 ProblemDetail — An internal error occurred while processing the request.
  503 ProblemDetail — The service is currently unavailable. This may happen only on some requests where the system creates backpressure to prevent the server's compute resources from being exhausted, avoiding more severe failures. In this case, the title of the error object contains `RESOURCE_EXHAUSTED`. Clients are recommended to eventually retry those requests after a backoff period. You can learn more about the backpressure mechanism here: https://docs.camunda.io/docs/components/zeebe/technical-concepts/internal-processing/#handling-backpressure .

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-runtime-backup-as-cluster-admin.api
