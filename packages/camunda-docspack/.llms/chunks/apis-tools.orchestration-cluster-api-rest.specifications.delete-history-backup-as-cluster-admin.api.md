# Delete a history backup across physical tenants

`DELETE /cluster/v2/backups/history/{backupId}`

Deletes the history backup with the given id from every physical tenant of the cluster, or from the one named by `physicalTenantId`. A tenant that does not hold the backup has already reached the requested end state, so it counts as deleted rather than as a failure.

The request is all-or-nothing: a physical tenant the backup cannot be deleted from fails the whole request, and the deletions that already succeeded on other tenants are not undone. Narrow the request with `physicalTenantId` to delete from the tenants that can still be reached.

Requires the cluster-admin security chain. Although this operation lists `bearerAuth` / `basicAuth` like the rest of the Orchestration Cluster API, it does not accept an Orchestration Cluster user's credentials — only the separate cluster-admin credentials are valid here. Only available on clusters whose secondary storage is Elasticsearch or OpenSearch. Use `DELETE /v2/backups/history/{backupId}` to act as a single physical tenant.

- Added in Camunda 8.10.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Parameters:
  backupId (path, BackupId, required)
  physicalTenantId (query, string)

Responses:
  204 — No targeted physical tenant holds the backup any more, because it was deleted from every tenant that held it. At least one tenant held it.
  400 ProblemDetail — The provided data is not valid.
  401 ProblemDetail — The request lacks valid authentication credentials.
  403 ProblemDetail — The cluster's secondary storage cannot serve history backups, or a targeted physical tenant's snapshot repository is absent from the store. Unlike the per-physical-tenant backup endpoints, the cluster-admin surface performs no fine-grained authorization, so a missing `BACKUP` permission is never the reason. Deletion fans out with no preceding check, so an absent repository is found only once that tenant is reached, by which time the backup may already be deleted from the others; those deletions are not undone. Narrow the request with `physicalTenantId` to work with the tenants whose repository is usable.
  404 ProblemDetail — The requested `physicalTenantId` does not exist in this cluster, or every targeted physical tenant was reached and none of them holds a backup with the given id.
  500 ProblemDetail — The backup could not be deleted from every targeted physical tenant, because one of them hit an internal error, so it may still exist on some of them. The deletions that already succeeded are not undone, so a retry has only the remaining tenants left to reach.
  503 ProblemDetail — The service is currently unavailable. This may happen only on some requests where the system creates backpressure to prevent the server's compute resources from being exhausted, avoiding more severe failures. In this case, the title of the error object contains `RESOURCE_EXHAUSTED`. Clients are recommended to eventually retry those requests after a backoff period. You can learn more about the backpressure mechanism here: https://docs.camunda.io/docs/components/zeebe/technical-concepts/internal-processing/#handling-backpressure .

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/delete-history-backup-as-cluster-admin.api
