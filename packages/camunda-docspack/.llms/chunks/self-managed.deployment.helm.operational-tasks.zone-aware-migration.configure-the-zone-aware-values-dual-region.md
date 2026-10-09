# Migrate to zone-aware brokers — Configure the zone-aware values — dual-region

This example migrates a dual-region cluster with `clusterSize: 8` and `replicationFactor: 4`. The values below belong to the primary region. In the secondary region's release, set `zone: zone-b` and `zoneIndex: 1`, and keep everything else identical.

```yaml
orchestration:
  clusterSize: "8"
  replicationFactor: "4"
  partitioning:
    scheme: zone-aware

    # The zone owned by this Helm release and Kubernetes cluster.
    zone: zone-a

    # Include every zone, not only the local zone. Use the same list
    # in every participating Helm release.
    zones:
      - name: zone-a
        numberOfBrokers: 4
        numberOfReplicas: 2
        priority: 100
      - name: zone-b
        numberOfBrokers: 4
        numberOfReplicas: 2
        priority: 90

    # Keep the numbered brokers during the migration.
    keepUnzonedBrokers: true

    # Values of the existing numbered brokers.
    numberOfZones: 2
    zoneIndex: 0
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration
