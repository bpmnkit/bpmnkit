# Management API — Cluster API — Partitioning API

Use this endpoint to update the [zone-aware](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/configuration/zone-aware-clusters) partition distribution configuration. Exactly one of `config` or `zonePriorities` must be set in the request body.

- Setting `config` persists a new partition distribution configuration and applies it immediately, computing the necessary partition join, leave, and priority-reconfiguration operations. When migrating a bare or partially zoned cluster to zone-aware, list zones in `config.zones` in the order they should receive the existing (bare) nodes: the first zone receives node `0`, the second node `1`, and so on, wrapping around by zone count. This order only matters for that one-time migration; once all zones are migrated, every other operation addresses zones by name.
- Setting `zonePriorities` reorders the zones' priorities on a fully zone-aware cluster. The existing priority values are reused and reassigned to a different zone based on the order of the zones in the request: the first zone gets the highest existing priority value, the second zone the next highest, and so on. No new priority values are introduced. This only updates the priorities; it does not itself move partition leaders — leaders move to the newly-preferred zone on the next election (for example, one triggered by a separate rebalance). The request must list exactly the currently configured zones, and is idempotent.

#### Request

```
PUT actuator/cluster/partitioning
```

  Example request: set partition distribution config

```
curl -X 'PUT' \
   'http://localhost:9600/actuator/cluster/partitioning' \
   -H 'accept: application/json' \
   -H 'Content-Type: application/json' \
   -d '{
        "config": {
          "scheme": "ZONE_AWARE",
          "zones": [
            {
              "name": "zone-a",
              "numberOfReplicas": 2,
              "priority": 1000
            },
            {
              "name": "zone-b",
              "numberOfReplicas": 1,
              "priority": 500
            }
          ]
        }
      }'
```

  Example request: reorder zone priorities

```
curl -X 'PUT' \
   'http://localhost:9600/actuator/cluster/partitioning' \
   -H 'accept: application/json' \
   -H 'Content-Type: application/json' \
   -d '{
        "zonePriorities": ["zone-b", "zone-a"]
      }'
```

##### Dry run

You can do a dry run without executing the change by setting the `dryRun` request parameter to `true`. By default, `dryRun` is set to `false`.

#### Response {#partitioning-response}

The response is a JSON object. See the [OpenAPI spec](https://github.com/camunda/camunda/blob/main/dist/src/main/resources/api/cluster/cluster-api.yaml) for details:

```
{
  "changeId": <changeId>,
  "currentTopology": [...],
  "plannedChanges": [...],
  "expectedTopology": [...]
}
```

- `changeId`: The ID of the changes initiated by this request. This can be used to monitor the progress of the operation.
- `currentTopology`: A list of current brokers and the partition distribution.
- `plannedChanges`: A sequence of operations that must be executed to reach the new configuration.
- `expectedTopology`: The expected list of brokers and the partition distribution once the change has completed.

---
Source: https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api
