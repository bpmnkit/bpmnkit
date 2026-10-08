# Delete a runtime backup across physical tenants

`DELETE /cluster/v2/backups/runtime/{backupId}`

Deletes the runtime backup with the given id from every physical tenant of the cluster, or from the one named by `physicalTenantId`. A tenant that does not hold the backup has already reached the requested end state, so it counts as deleted rather than as a failure — the same as deleting an unknown backup id through the per-physical-tenant endpoint.

The request is all-or-nothing: a physical tenant the backup cannot be deleted from fails the whole request, and the deletions that already succeeded on other tenants are not undone. Narrow the request with `physicalTenantId` to delete from the tenants that can still be reached.

Requires the cluster-admin security chain. Although this operation lists `bearerAuth` / `basicAuth` like the rest of the Orchestration Cluster API, it does not accept an Orchestration Cluster user's credentials — only the separate cluster-admin credentials are valid here. Use `DELETE /v2/backups/runtime/{backupId}` to act as a single physical tenant.

- Added in Camunda 8.10.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Parameters:
  backupId (path, BackupId, required)
  physicalTenantId (query, string)

Responses:
  204 — No targeted physical tenant holds the backup any more.
  400 ProblemDetail — The provided data is not valid.
  401 ProblemDetail — The request lacks valid authentication credentials.
  404 ProblemDetail — The requested `physicalTenantId` does not exist in this cluster.
  500 ProblemDetail — The backup could not be deleted from every targeted physical tenant, so it may still exist on some of them. The deletions that already succeeded are not undone, so a retry has only the remaining tenants left to reach.
  503 ProblemDetail — The service is currently unavailable. This may happen only on some requests where the system creates backpressure to prevent the server's compute resources from being exhausted, avoiding more severe failures. In this case, the title of the error object contains `RESOURCE_EXHAUSTED`. Clients are recommended to eventually retry those requests after a backoff period. You can learn more about the backpressure mechanism here: https://docs.camunda.io/docs/components/zeebe/technical-concepts/internal-processing/#handling-backpressure .

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/delete-runtime-backup-as-cluster-admin.api
