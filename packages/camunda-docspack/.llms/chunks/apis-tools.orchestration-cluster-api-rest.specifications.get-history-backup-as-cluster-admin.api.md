# Get a history backup across physical tenants

`GET /cluster/v2/backups/history/{backupId}`

Reports what every physical tenant of the cluster, or the one named by `physicalTenantId`, holds for the given backup id. There is no aggregated cluster-level state: a tenant that was reached and does not hold this backup reports `NOT_FOUND`, which is a successful observation rather than a failure.

The request is all-or-nothing: a physical tenant whose state cannot be read fails the whole request. Narrow the request with `physicalTenantId` to read the tenants that can still be reached.

Requires the cluster-admin security chain. Although this operation lists `bearerAuth` / `basicAuth` like the rest of the Orchestration Cluster API, it does not accept an Orchestration Cluster user's credentials — only the separate cluster-admin credentials are valid here. Only available on clusters whose secondary storage is Elasticsearch or OpenSearch. Use `GET /v2/backups/history/{backupId}` to act as a single physical tenant.

- Added in Camunda 8.10.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Parameters:
  backupId (path, BackupId, required)
  physicalTenantId (query, string)

Responses:
  200 ClusterHistoryBackupInfo — Every targeted physical tenant was read. Each one reports either the backup or `NOT_FOUND`; at least one holds the backup.
  400 ProblemDetail — The provided data is not valid.
  401 ProblemDetail — The request lacks valid authentication credentials.
  403 ProblemDetail — The cluster's secondary storage is neither Elasticsearch nor OpenSearch and therefore cannot serve history backups, or a targeted physical tenant's snapshot repository is absent from the store — configured under a name the store does not have, or not configured at all. Both are deployment faults the caller cannot correct by changing its request; narrow the request with `physicalTenantId` to work with the tenants whose repository is usable. Unlike the per-physical-tenant backup endpoints, the cluster-admin surface performs no fine-grained authorization, so a missing `BACKUP` permission is never the reason.
  404 ProblemDetail — The requested `physicalTenantId` does not exist in this cluster, or every targeted physical tenant was read and none of them holds a backup with the given id.
  500 ProblemDetail — An internal error occurred while processing the request.
  503 ProblemDetail — The service is currently unavailable. This may happen only on some requests where the system creates backpressure to prevent the server's compute resources from being exhausted, avoiding more severe failures. In this case, the title of the error object contains `RESOURCE_EXHAUSTED`. Clients are recommended to eventually retry those requests after a backoff period. You can learn more about the backpressure mechanism here: https://docs.camunda.io/docs/components/zeebe/technical-concepts/internal-processing/#handling-backpressure .

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-history-backup-as-cluster-admin.api
