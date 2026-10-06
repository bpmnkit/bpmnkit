# Delete runtime backup state across physical tenants

`DELETE /cluster/v2/backups/runtime/state`

Resets the runtime backup state of every partition of every physical tenant of the cluster, or of the one named by `physicalTenantId`, clearing all checkpoint info, backup info, checkpoint metadata, and backup ranges. Used when switching backup stores.

The request is all-or-nothing: a physical tenant whose state cannot be reset fails the whole request, and the resets that already succeeded on other tenants are not undone. Narrow the request with `physicalTenantId` to reset the tenants that can still be reached.

Requires the cluster-admin security chain. Although this operation lists `bearerAuth` / `basicAuth` like the rest of the Orchestration Cluster API, it does not accept an Orchestration Cluster user's credentials — only the separate cluster-admin credentials are valid here. Use `DELETE /v2/backups/runtime/state` to act as a single physical tenant.

- Added in Camunda 8.10.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Parameters:
  physicalTenantId (query, string)

Responses:
  204 — The runtime backup state was reset on every targeted physical tenant.
  401 ProblemDetail — The request lacks valid authentication credentials.
  404 ProblemDetail — The requested `physicalTenantId` does not exist in this cluster.
  500 ProblemDetail — The state could not be reset on every targeted physical tenant, so it may still be set on some of them. The resets that already succeeded are not undone, so a retry has only the remaining tenants left to reach.
  503 ProblemDetail — The service is currently unavailable. This may happen only on some requests where the system creates backpressure to prevent the server's compute resources from being exhausted, avoiding more severe failures. In this case, the title of the error object contains `RESOURCE_EXHAUSTED`. Clients are recommended to eventually retry those requests after a backoff period. You can learn more about the backpressure mechanism here: https://docs.camunda.io/docs/components/zeebe/technical-concepts/internal-processing/#handling-backpressure .

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/delete-runtime-backup-state-as-cluster-admin.api
