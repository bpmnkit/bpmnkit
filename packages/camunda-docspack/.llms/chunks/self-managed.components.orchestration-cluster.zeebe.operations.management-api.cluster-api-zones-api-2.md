# Management API — Cluster API — Zones API (2)

###### Dry run

You can do a dry run without executing the change by setting the `dryRun` request parameter to `true`. By default, `dryRun` is set to `false`.

##### Response

The response is a JSON object with the same shape as the [partitioning response](#partitioning-response). The `changeId` identifies the asynchronous operation. Poll the [Monitoring API](#monitoring-api) and wait until the operation is `COMPLETED` before shutting down brokers or taking further action.

After the operation completes, verify that the removed zone is no longer present under `partitioning` and that its brokers no longer host partitions. Only then shut down the removed zone's brokers or scale down its StatefulSet.

#### Migrate a zone to a zone-aware topology

Migrates one zone of a bare or partially zoned cluster to a zone-aware topology. The request contains only the zone name. Before migrating a zone, update the persisted partition distribution with [`PUT /cluster/partitioning`](#partitioning-api), using a zone-aware partition distribution.

**Note**
For dual-region clusters, migrate the secondary zone first (odd-numbered nodes), then migrate the primary zone.

The zone must already exist in the persisted partitioning configuration. When all configured zones have been migrated, the cluster becomes fully zoned and subsequent operations address zones by name.

##### Request

```
PUT actuator/cluster/zones
{
  "zone": <string>
}
```

  Example request

```
curl -X 'PUT' \
   'http://localhost:9600/actuator/cluster/zones' \
   -H 'accept: application/json' \
   -H 'Content-Type: application/json' \
   -d '{
        "zone": "zone-b"
      }'
```

###### Dry run

You can do a dry run without executing the change by setting the `dryRun` request parameter to `true`. By default, `dryRun` is set to `false`.

##### Response

The response is a JSON object with the same shape as the [partitioning response](#partitioning-response). The `changeId` identifies the asynchronous operation. Poll the [Monitoring API](#monitoring-api) and wait until the operation is `COMPLETED` before taking further action.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api
