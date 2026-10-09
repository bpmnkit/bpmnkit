# Migrate to zone-aware brokers — Migrate each zone — Remove the numbered brokers of the migrated zone

After the zone migration completes and the zone's numbered brokers no longer own partitions or belong to the logical cluster, remove them from the release that owns the zone. Releases whose zone you haven't migrated yet keep `keepUnzonedBrokers: true` and their migration values.

Update the values of the release as follows:

- Set `keepUnzonedBrokers: false`.
- Remove `numberOfZones` and `zoneIndex`.
- Remove `orchestration.clusterSize` and `orchestration.replicationFactor`, or set them to the totals of the `zones` list.
- Keep the same complete `zones` list and the local `zone` value.

With the zone-aware scheme and without numbered brokers, the chart derives the cluster size and replication factor from the `zones` list. If the values still contain conflicting settings, the upgrade fails with errors similar to these:

```text
[camunda][error] orchestration.partitioning.numberOfZones and orchestration.partitioning.zoneIndex cannot be used with the zone-aware scheme; the zone list describes the topology instead.
[camunda][error] orchestration.clusterSize is <size> but orchestration.partitioning.zones sums to <total> brokers. With the zone-aware scheme the zone list is authoritative; remove the key or make it agree.
[camunda][error] orchestration.replicationFactor is <factor> but orchestration.partitioning.zones sums to <total> replicas. With the zone-aware scheme the zone list is authoritative; remove the key or make it agree.
```

For example, the secondary region (`zoneIndex: 1`) of the dual-region cluster uses these values:

```yaml
orchestration:
  partitioning:
    scheme: zone-aware
    zone: zone-b
    zones:
      - name: zone-a
        numberOfBrokers: 4
        numberOfReplicas: 2
        priority: 100
      - name: zone-b
        numberOfBrokers: 4
        numberOfReplicas: 2
        priority: 90
    keepUnzonedBrokers: false
```

Upgrade the release:

```bash
helm upgrade "$RELEASE" "$CHART" \
  --version "$CHART_VERSION" \
  --namespace "$NAMESPACE" \
  --values "$VALUES" \
  --wait \
  --timeout 15m
```

The upgrade removes the numbered StatefulSet and pods. The zone-aware StatefulSet and shared Services remain managed by Helm. Helm doesn't delete the numbered PVCs, so they remain bound.

Repeat the steps in [Migrate each zone](#migrate-each-zone) for each remaining zone.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration
