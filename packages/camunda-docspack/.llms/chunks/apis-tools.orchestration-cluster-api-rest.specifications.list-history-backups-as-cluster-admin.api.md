# List history backups across physical tenants

`GET /cluster/v2/backups/history`

Lists the history backups of every physical tenant of the cluster, or of the one named by `physicalTenantId`, grouped by backup id. A backup id that only some physical tenants hold is a supported outcome rather than a degraded one, so only the tenants that hold it are listed under it.

The request is all-or-nothing: a physical tenant whose backups cannot be read fails the whole request rather than silently dropping out of the listing. Narrow the request with `physicalTenantId` to list the backups of the tenants that can still be read.

Requires the cluster-admin security chain. Although this operation lists `bearerAuth` / `basicAuth` like the rest of the Orchestration Cluster API, it does not accept an Orchestration Cluster user's credentials — only the separate cluster-admin credentials are valid here. Only available on clusters whose secondary storage is Elasticsearch or OpenSearch. Use `GET /v2/backups/history` to act as a single physical tenant.

- Added in Camunda 8.10.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Parameters:
  physicalTenantId (query, string)
  prefix (query, BackupIdPrefix)
  verbose (query, boolean)

Responses:
  200 ClusterHistoryBackupInfo[] — The history backups of every targeted physical tenant, grouped by backup id and ordered by backup id, descending. Deliberately not the per-physical-tenant endpoint's order, which is by snapshot start time: start times are per tenant, so a group spanning several tenants has no single one to sort on. Descending id is only recency for ids that ascend with time. Empty when every targeted tenant was read and none of them holds a matching backup.
  400 ProblemDetail — The provided data is not valid.
  401 ProblemDetail — The request lacks valid authentication credentials.
  403 ProblemDetail — The cluster's secondary storage is neither Elasticsearch nor OpenSearch and therefore cannot serve history backups, or a targeted physical tenant's snapshot repository is absent from the store — configured under a name the store does not have, or not configured at all. Both are deployment faults the caller cannot correct by changing its request; narrow the request with `physicalTenantId` to work with the tenants whose repository is usable. Unlike the per-physical-tenant backup endpoints, the cluster-admin surface performs no fine-grained authorization, so a missing `BACKUP` permission is never the reason.
  404 ProblemDetail — The requested `physicalTenantId` does not exist in this cluster.
  500 ProblemDetail — An internal error occurred while processing the request.
  503 ProblemDetail — The service is currently unavailable. This may happen only on some requests where the system creates backpressure to prevent the server's compute resources from being exhausted, avoiding more severe failures. In this case, the title of the error object contains `RESOURCE_EXHAUSTED`. Clients are recommended to eventually retry those requests after a backoff period. You can learn more about the backpressure mechanism here: https://docs.camunda.io/docs/components/zeebe/technical-concepts/internal-processing/#handling-backpressure .

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/list-history-backups-as-cluster-admin.api
