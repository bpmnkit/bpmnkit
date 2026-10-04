# Take a history backup on one or every physical tenant

`POST /cluster/v2/backups/history`

Triggers a history backup on every physical tenant of the cluster, or on the one named by `physicalTenantId`. Every targeted tenant uses the same caller-supplied `backupId`, but the backups are independent: they are neither coordinated nor rolled back together.

The request is all-or-nothing: the `backupId` is checked on every targeted tenant before any snapshot is scheduled, so a tenant that already holds this id, or that cannot be reached, fails the whole request and no backup is started anywhere. There is no aggregated cluster-level state in the response.

Requires the cluster-admin security chain. Although this operation lists `bearerAuth` / `basicAuth` like the rest of the Orchestration Cluster API, it does not accept an Orchestration Cluster user's credentials — only the separate cluster-admin credentials are valid here. Only available on clusters whose secondary storage is Elasticsearch or OpenSearch. Use `POST /v2/backups/history` to act as a single physical tenant.

- Added in Camunda 8.10.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Parameters:
  physicalTenantId (query, string)

Request body:
  application/json: TakeHistoryBackupRequest (required)
    backupId (BackupId, required) — The id of the backup to take.

Responses:
  202 ClusterTakeHistoryBackupResponse — The backup has been scheduled on every targeted physical tenant.
  400 ProblemDetail — The provided data is not valid.
  401 ProblemDetail — The request lacks valid authentication credentials.
  403 ProblemDetail — The cluster's secondary storage is neither Elasticsearch nor OpenSearch and therefore cannot serve history backups, or a targeted physical tenant's snapshot repository is absent from the store — configured under a name the store does not have, or not configured at all. Both are deployment faults the caller cannot correct by changing its request; narrow the request with `physicalTenantId` to work with the tenants whose repository is usable. Unlike the per-physical-tenant backup endpoints, the cluster-admin surface performs no fine-grained authorization, so a missing `BACKUP` permission is never the reason.
  404 ProblemDetail — The requested `physicalTenantId` does not exist in this cluster.
  409 ProblemDetail — At least one targeted physical tenant already holds a backup with this id, or already has another backup running. The check that precedes the fan-out normally rejects the request before anything is scheduled; a tenant that takes the id in between rejects it during the fan-out instead, which can leave snapshots behind on the tenants already reached, so delete this backup id before retrying.
  500 ProblemDetail — The backup could not be scheduled on every targeted physical tenant, because one of them hit an internal error. The check that precedes the fan-out rejects the request before anything is scheduled, but a failure during the fan-out itself can leave snapshots behind on the tenants already reached, so delete this backup id before retrying.
  503 ProblemDetail — The service is currently unavailable. This may happen only on some requests where the system creates backpressure to prevent the server's compute resources from being exhausted, avoiding more severe failures. In this case, the title of the error object contains `RESOURCE_EXHAUSTED`. Clients are recommended to eventually retry those requests after a backoff period. You can learn more about the backpressure mechanism here: https://docs.camunda.io/docs/components/zeebe/technical-concepts/internal-processing/#handling-backpressure .

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/take-history-backup-as-cluster-admin.api
