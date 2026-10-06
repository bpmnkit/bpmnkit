# Force-write runtime backup state across physical tenants

`POST /cluster/v2/backups/runtime/state/sync`

Force-writes the checkpoint and backup metadata of every partition of every physical tenant of the cluster, or of the one named by `physicalTenantId`, to that tenant's backup store, independent of any backup being taken or confirmed, and returns the updated state per physical tenant.

The request is all-or-nothing: a physical tenant whose metadata cannot be written fails the whole request, and the writes that already succeeded on other tenants are not undone. The operation is idempotent, so retrying the same call is the correct remedy. Narrow the request with `physicalTenantId` to write the tenants that can still be reached.

Requires the cluster-admin security chain. Although this operation lists `bearerAuth` / `basicAuth` like the rest of the Orchestration Cluster API, it does not accept an Orchestration Cluster user's credentials — only the separate cluster-admin credentials are valid here. Use `POST /v2/backups/runtime/state/sync` to act as a single physical tenant.

- Added in Camunda 8.10.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Parameters:
  physicalTenantId (query, string)

Responses:
  200 ClusterRuntimeBackupState — The updated runtime backup state of every targeted physical tenant, ordered by physical tenant id.
  401 ProblemDetail — The request lacks valid authentication credentials.
  404 ProblemDetail — The requested `physicalTenantId` does not exist in this cluster.
  500 ProblemDetail — An internal error occurred while processing the request.
  503 ProblemDetail — The service is currently unavailable. This may happen only on some requests where the system creates backpressure to prevent the server's compute resources from being exhausted, avoiding more severe failures. In this case, the title of the error object contains `RESOURCE_EXHAUSTED`. Clients are recommended to eventually retry those requests after a backoff period. You can learn more about the backpressure mechanism here: https://docs.camunda.io/docs/components/zeebe/technical-concepts/internal-processing/#handling-backpressure .
  504 ProblemDetail — The request from gateway to broker timed out on at least one targeted physical tenant.

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/sync-runtime-backup-state-as-cluster-admin.api
