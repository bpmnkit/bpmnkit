# Cluster scaling — API reference — Reconfiguration API

This API lets you reconfigure a cluster by adding or removing brokers, adding partitions, or changing the `replicationFactor`. You can use this instead of the Scale API.

**Note**
This endpoint does not support clusters configured with the `FIXED` partitioning scheme. Scaling requests for these clusters are rejected.

#### Request

```
PATCH actuator/cluster
{
  brokers: {
    add: [<brokerIds>]
    remove: [<brokerIds>]
    count: <integer>
    zone: <string>
  }
  {
    partitions: {
      count: <integer>
      replicationFactor: <integer>
    }
  }
}

```

`zone` is only used on zone-aware clusters, together with `count`, to select which zone's broker count is changed. It must be omitted on non-zone-aware clusters. Broker ids in `add` and `remove` follow the [broker id naming scheme](#broker-id-naming-scheme).

The `physicalTenant` query parameter scopes `partitions.count` to a single [Physical Tenant](https://docs.camunda.io/docs/next/self-managed/concepts/physical-tenants/index). See [scale a cluster with multiple Physical Tenants](#scale-a-cluster-with-multiple-physical-tenants).

  Example request

```
curl -X 'PATCH' \
   'http://localhost:9600/orchestration/actuator/cluster' \
   -H 'accept: application/json' \
   -H 'Content-Type: application/json' \
   -d '{
        "brokers": {
          "add": [3,4,5]
        },
        "partitions": {
          "count": 6,
          "replicationFactor": 3
        }
      }'
```

##### Dry run

You can do a dry run without executing the reconfiguration by setting the `dryRun` request parameter to `true`. By default, `dryRun` is set to `false`.

##### Force

**Caution**
This is a dangerous operation and must be used with caution. Incorrect use may result in split-brain scenarios or an unhealthy, unrecoverable cluster.

Usually, changes can only be made when all brokers are up. If some brokers are unreachable, you can remove them from the cluster by setting the `force` request parameter to `true`.

This operation is mainly useful for [dual-region setups](https://docs.camunda.io/docs/next/self-managed//concepts/multi-region/dual-region). For details, see the [dual-region operational procedure](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/dual-region-ops). Deviations from the process may make the cluster unusable.

**Note**
Don’t send more than one `force` request at a time.

Example request:

```
curl -X 'PATCH' \
   'http://localhost:9600/orchestration/actuator/cluster?force=true' \
   -H 'accept: application/json' \
   -H 'Content-Type: application/json' \
   -d '{
        "brokers": {
          "remove": [0,2]
        }
      }'
```

This operation doesn’t redistribute the partitions from the removed brokers. The resulting cluster has fewer replicas for the affected partitions.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling
