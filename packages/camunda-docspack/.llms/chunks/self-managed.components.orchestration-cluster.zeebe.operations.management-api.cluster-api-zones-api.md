# Management API — Cluster API — Zones API

Use the Zones API to add, remove, or migrate zones in a [zone-aware](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters) cluster. The operations update the persisted partition distribution and run asynchronously. Use the [Monitoring API](#monitoring-api) to follow each change until its status is `COMPLETED`.

#### Add or re-add a zone

To add a zone, first deploy its brokers and connect them to the existing cluster. Configure the brokers to use the zone you want to add.
The new brokers join cluster membership, but they do not host partitions until you add the zone through the Zones API.

To re-add a previously removed zone, start the operator-supplied brokers before sending the request. If you re-add only some of the zone's brokers, list their broker IDs explicitly in the `brokers` array. The request adds the supplied brokers to the persisted partition distribution and schedules the partition-join operations needed to assign their partitions.

##### Request

```
POST actuator/cluster/zones/{zoneId}
{
  "numberOfReplicas": <integer>,
  "priority": <integer>,
  "numberOfBrokers": <integer>,
  "brokers": [<brokerId1>, <brokerId2>, ...]
}
```

The request body must include `numberOfReplicas`, `priority`, and exactly one of `numberOfBrokers` or `brokers`.

Use `numberOfBrokers` when the zone's broker IDs are contiguous. The value is the number of brokers deployed in the zone, from which the broker IDs
`<zoneId>_0` through `<zoneId>_<numberOfBrokers - 1>` are derived. These are the IDs the
brokers of a zone-aware cluster assign themselves, so a zone whose brokers are numbered
from zero without gaps needs nothing else. `numberOfBrokers` must be at least `1`; a lower
value is rejected with HTTP `400`.

Use `brokers` when the broker IDs are not contiguous. List each broker ID explicitly in this array. Setting both `numberOfBrokers` and `brokers`, or omitting both, is rejected with HTTP `400`.

  Example requests

```
curl -X 'POST' \
   'http://localhost:9600/actuator/cluster/zones/zone-b' \
   -H 'accept: application/json' \
   -H 'Content-Type: application/json' \
   -d '{
        "numberOfReplicas": 2,
        "priority": 500,
        "numberOfBrokers": 3
      }'
```

The same request naming the brokers explicitly:

```
curl -X 'POST' \
   'http://localhost:9600/actuator/cluster/zones/zone-b' \
   -H 'accept: application/json' \
   -H 'Content-Type: application/json' \
   -d '{
        "numberOfReplicas": 2,
        "priority": 500,
        "brokers": ["zone-b_0", "zone-b_1", "zone-b_2"]
      }'
```

###### Dry run

You can do a dry run without executing the change by setting the `dryRun` request parameter to `true`. By default, `dryRun` is set to `false`.

##### Response

The response is a JSON object with the same shape as the [partitioning response](#partitioning-response). The `changeId` identifies the asynchronous operation. Poll the [Monitoring API](#monitoring-api) and wait until the operation is `COMPLETED` before shutting down brokers or taking further action.

After the operation completes, verify that the zone is present under `partitioning` and that its brokers host their assigned partitions in the `brokers` array. You can also query the [Orchestration Cluster REST API specification for `GET /v2/topology`](https://docs.camunda.io/docs/next/apis-tools/orchestration-cluster-api-rest/specifications/get-topology.api) to verify the broker and partition assignments.

#### Remove a zone

By default, this operation gracefully drains the zone's partitions to the remaining zones before removing its brokers from cluster membership. Set `force=true` only if the zone is down or its brokers are unreachable.

**Warning**
Forced removal of nodes that are running/reachable may cause data loss in extreme circumstances

##### Request

```
DELETE actuator/cluster/zones/{zoneId}?force={force}
```

The `force` parameter defaults to `false`.

  Example request

```
curl -X 'DELETE' \
   'http://localhost:9600/actuator/cluster/zones/zone-b?force=false' \
   -H 'accept: application/json'
```

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api
