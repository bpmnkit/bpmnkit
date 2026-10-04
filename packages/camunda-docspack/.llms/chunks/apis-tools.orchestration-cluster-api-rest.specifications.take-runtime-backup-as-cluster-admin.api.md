# Take a runtime backup on one or every physical tenant

`POST /cluster/v2/backups/runtime`

Triggers a runtime backup on every physical tenant of the cluster, or on the one named by `physicalTenantId`. A cluster-wide backup is a set of independent per-tenant backups, not an atomic snapshot of the cluster: they are neither coordinated nor rolled back together, and each tenant stores its own, so the same `backupId` can be used for all of them.

Every targeted physical tenant must be in the same backup-id mode. `backupId` must be omitted when every targeted tenant generates its own ids (because continuous backups and/or a backup or checkpoint schedule is enabled for it), and is required when none of them does. A cluster whose targeted tenants mix the two modes is rejected with 400 and has to be driven one tenant at a time through `POST /v2/backups/runtime`. In generated-id mode each tenant generates its own id, so the response reports an id per physical tenant rather than one for the cluster.

The trigger is all-or-error, and never silent about a partial trigger: if any targeted tenant cannot be triggered the response carries an error status, but its body still lists every targeted tenant — which ones were triggered, under which `backupId` to monitor or delete them, and why the others failed. Nothing is rolled back, so the backups that were triggered keep running and have to be deleted explicitly. A request rejected before any tenant was triggered answers with a problem detail instead, and nothing is running.

Requires the cluster-admin security chain. Although this operation lists `bearerAuth` / `basicAuth` like the rest of the Orchestration Cluster API, it does not accept an Orchestration Cluster user's credentials — only the separate cluster-admin credentials are valid here. Use `POST /v2/backups/runtime` to act as a single physical tenant.

- Added in Camunda 8.10.
- Consistency: strong.

Authentication: bearerAuth or basicAuth

Parameters:
  physicalTenantId (query, string)

Request body:
  application/json: TakeRuntimeBackupRequest
    backupId (BackupId) — The id of the backup to take. Must be omitted if continuous backups and/or a backup or checkpoint schedule is enabled for the physical tenant.

Responses:
  202 ClusterTakeRuntimeBackupResponse — The backup was triggered on every targeted physical tenant.
  400 ProblemDetail — The request names a `backupId` while at least one targeted physical tenant generates its own ids, or omits it while at least one does not, or the id is not a positive number. No tenant was triggered. A targeted tenant that rejects the request as invalid during the fan-out answers with the same status but the cluster body, listing the tenants that were triggered.
  401 ProblemDetail — The request lacks valid authentication credentials.
  404 ProblemDetail — The requested `physicalTenantId` does not exist in this cluster, so no tenant was triggered.
  409 ClusterTakeRuntimeBackupResponse — At least one targeted physical tenant already holds a backup with this id or a higher one. Backups are triggered without a preceding check, so the tenants that accepted the id are listed in the body and keep running; delete them before retrying.
  500 ClusterTakeRuntimeBackupResponse — At least one targeted physical tenant could not be triggered, and the failures do not agree on a single status. The body lists the tenants that were triggered and keep running.
  502 ClusterTakeRuntimeBackupResponse — The connection to the broker was cut mid-flight on at least one targeted physical tenant, which may or may not have accepted the request. Those tenants are reported as `UNKNOWN` with the id to check them under, and the tenants that were triggered keep running.
  503 ClusterTakeRuntimeBackupResponse — At least one targeted physical tenant could not be reached. The body lists the tenants that were triggered and keep running.
  504 ClusterTakeRuntimeBackupResponse — The request from gateway to broker timed out on at least one targeted physical tenant, which may or may not have accepted it. Those tenants are reported as `UNKNOWN` with the id to check them under, and the tenants that were triggered keep running.

---
Source: https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/take-runtime-backup-as-cluster-admin.api
