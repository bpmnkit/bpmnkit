# Migrate to zone-aware brokers — Update the partitioning configuration

Use the [partitioning API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#partitioning-api) once to update the persisted partitioning configuration. This is the point after which you can't revert the migration.

The order of the zones is significant during this one-time migration. The first zone must be the zone of the numbered brokers with `zoneIndex: 0`, the second zone the one with `zoneIndex: 1`.

The sum of the zones' `numberOfReplicas` values must equal the cluster's current replication factor. Otherwise, the request fails with an error similar to:

```text
Sum of zone replicas [2] must equal the current replication factor [1] before zone migration starts.
```

If the target topology needs a higher factor, first increase the numbered cluster's replication factor with the [cluster scaling API](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/cluster-scaling#2c-scaling-only-partitions), and [monitor the change](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#monitor-a-configuration-change) until it completes. Then set `orchestration.replicationFactor` in the values of every release to the new factor and upgrade the releases, so the retained numbered brokers use the updated configuration.

### single-region

```bash
curl --fail --request PUT \
  "$MANAGEMENT_URL/actuator/cluster/partitioning" \
  --header 'Content-Type: application/json' \
  --data @- <<'JSON'
{
  "config": {
    "scheme": "ZONE_AWARE",
    "zones": [
      {"name": "zone-a", "numberOfReplicas": 3, "priority": 100}
    ]
  }
}
JSON
```

### dual-region

```bash
curl --fail --request PUT \
  "$MANAGEMENT_URL/actuator/cluster/partitioning" \
  --header 'Content-Type: application/json' \
  --data @- <<'JSON'
{
  "config": {
    "scheme": "ZONE_AWARE",
    "zones": [
      {"name": "zone-a", "numberOfReplicas": 2, "priority": 100},
      {"name": "zone-b", "numberOfReplicas": 2, "priority": 90}
    ]
  }
}
JSON
```

The response includes a `changeId`. [Monitor the change](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/zeebe/operations/management-api#monitor-a-configuration-change) until it completes.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration
