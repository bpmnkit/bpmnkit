# Migrate to zone-aware brokers — Configure the zone-aware values — single-region

This example migrates a single-region cluster with `clusterSize: 3` and `replicationFactor: 3`:

```yaml
orchestration:
  clusterSize: "3"
  replicationFactor: "3"
  partitioning:
    scheme: zone-aware
    zone: zone-a
    zones:
      - name: zone-a
        numberOfBrokers: 3
        numberOfReplicas: 3
        priority: 100

    # Keep the numbered brokers during the migration.
    keepUnzonedBrokers: true
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration
