# Cluster scaling — Scale a cluster with multiple Physical Tenants

Self-Managed only

In a cluster running multiple [Physical Tenants](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index), each tenant owns its own partition group, while brokers, gateways, and the replication factor are shared. Which scaling dimension you change therefore determines whether the operation is tenant-scoped or cluster-wide.

| Dimension                          | Scope        | How to target it                                                                                    |
| ---------------------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| Partition count                    | Per tenant   | `PATCH /actuator/cluster?physicalTenant={physicalTenantId}`                                         |
| Broker count                       | Cluster-wide | `PATCH /actuator/cluster` or `POST /actuator/cluster/brokers`, without a `physicalTenant` parameter |
| Replication factor                 | Cluster-wide | `PATCH /actuator/cluster`, without a `physicalTenant` parameter                                     |
| Partition join, leave, or priority | Per tenant   | `POST` or `DELETE /actuator/cluster/brokers/{brokerId}/partitions/{partitionId}?physicalTenant=`    |
| Routing state                      | Per tenant   | `PATCH /actuator/cluster/routing-state?physicalTenant={physicalTenantId}`                           |

Partition ids restart at `1` in every Physical Tenant, so a partition is only identified by its id together with its tenant.

### Scale the partitions of a single Physical Tenant

Send the partition count change with the `physicalTenant` query parameter. Only the named tenant's partition group gains partitions, and every other tenant is left untouched:

```
curl -X 'PATCH' \
   'http://localhost:9600/orchestration/actuator/cluster?physicalTenant=tenanta' \
   -H 'accept: application/json' \
   -H 'Content-Type: application/json' \
   -d '{ "partitions": { "count": 6 } }'
```

Requests that combine `physicalTenant` with a broker change or a replication factor change are rejected with `400`, because neither dimension has a tenant to scope it to. An unknown `physicalTenant` is rejected with `404`.

**Note**
A partition count change sent **without** the `physicalTenant` parameter targets the default Physical Tenant only. Read operations behave differently: `GET /actuator/cluster` without the parameter reports every Physical Tenant. Always pass `physicalTenant` explicitly when you intend to scale a non-default tenant.

### Verify a tenant-scoped scaling operation

Monitor the change with the [monitoring API](#monitoring-api) or `GET /actuator/cluster/changes`, then confirm the result through topology:

```
curl "http://localhost:8080/physical-tenants/tenanta/v2/topology"
curl "http://localhost:8080/cluster/v2/topology"
```

Confirm that every expected partition has a leader, that the targeted tenant's partition count matches the requested value, and that the other tenants retain their previous partition counts. Cluster-wide topology requires [cluster admin](https://docs.camunda.io/docs/next/components/admin/cluster-admin) access.

Because brokers and gateways are shared, a scaling operation for one tenant changes the capacity available to all of them. Compare tenant-scoped and cluster-wide partition, latency, and storage metrics against your pre-scaling baseline before returning the cluster to normal traffic.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling
