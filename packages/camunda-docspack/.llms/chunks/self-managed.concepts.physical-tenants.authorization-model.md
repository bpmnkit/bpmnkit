# Authorization model for Physical Tenants

Learn how cluster-wide and tenant-local authorization work for Physical Tenants.


## About

Learn how Camunda authorizes Physical Tenant operations at the cluster-wide and tenant-local scopes. For identity provider connections and token routing, see [authentication and authorization](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authentication-authorization). For the cluster-admin role itself, see [cluster admin](https://docs.camunda.io/docs/next/components/admin/cluster-admin).

Authorization is divided into two scopes: cluster-wide operations, which affect the entire orchestration cluster, and tenant-local operations, which are scoped to a single Physical Tenant. Tenant-local operations are fully available in Camunda 8.10.

Two new authorization resource types were added for the per-tenant management APIs introduced alongside Physical Tenants:

| Resource type | Permissions                           | Backs                                                                                                                      |
| ------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `BACKUP`      | `CREATE`, `READ`, `DELETE`, `RESTORE` | Per-tenant runtime and history backup endpoints (`/v2/backups/runtime`, `/v2/backups/history`) and restore (`/v2/restore`) |
| `EXPORTER`    | `PAUSE`                               | Per-tenant exporting pause/resume endpoints (`/v2/exporting/pause`, `/v2/exporting/resume`)                                |

The default **admin** role receives all four `BACKUP` permissions and `EXPORTER:PAUSE` automatically. The default **readonly-admin** role receives only `BACKUP:READ` (there is no read-only permission for `EXPORTER`, since `PAUSE` isn't a read operation).

An Elasticsearch or OpenSearch history backup needs both `BACKUP:CREATE` and `EXPORTER:PAUSE`, because exporting must be paused for the duration of the backup. Grant the two together to any role that performs backups.

Permissions apply to the whole resource type. Fine-grained authorization for an individual backup ID or exporter is not available; only the `*` resource ID is supported.

For the operational procedures that use these permissions, see [back up a cluster with multiple Physical Tenants](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore#multiple-physical-tenants).

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/authorization-model
