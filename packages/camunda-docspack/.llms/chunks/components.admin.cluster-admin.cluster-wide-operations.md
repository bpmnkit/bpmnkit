# Cluster admin — Cluster-wide operations

Cluster admin protects the operations served under the `/cluster/v2/...` path prefix. These operations can act at cluster scope, with endpoint-specific parameters documented in the generated API reference.

| Area                | Endpoints                                                                                            |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| Status and topology | `GET /cluster/v2/status`, `GET /cluster/v2/topology`                                                 |
| Backup              | `/cluster/v2/backups/runtime`, `/cluster/v2/backups/runtime/state`, `/cluster/v2/backups/history`    |
| Exporting           | `GET /cluster/v2/exporting`, `POST /cluster/v2/exporting/pause`, `POST /cluster/v2/exporting/resume` |
| Recovery            | `POST /cluster/v2/restore`, `PATCH /cluster/v2/mode`                                                 |
| Partition placement | `POST /cluster/v2/rebalance`, `GET /cluster/v2/rebalance`, `DELETE /cluster/v2/rebalance`            |

Some operations can target a single Physical Tenant, while others always apply to the whole cluster. See the API reference for each operation's scope and parameters.

For the operator procedures that use these endpoints, see [back up and restore](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore#multiple-physical-tenants) and [cluster scaling](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling#scale-a-cluster-with-multiple-physical-tenants). Scaling and multi-region failover use the actuator surface rather than this API.

For endpoint details, see the [Orchestration Cluster REST API reference](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/orchestration-cluster-api-rest-overview).

Cluster admin protects every operation under this prefix except `GET /cluster/v2/status`, which is deliberately unauthenticated so load balancers and operators can use it as a health check. Cluster topology is its authenticated counterpart, because topology exposes Physical Tenant identifiers.

---
Source: https://docs.camunda.io/docs/next/components/admin/cluster-admin
