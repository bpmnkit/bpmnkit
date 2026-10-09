# Migrate to zone-aware brokers — Start the migration

Upgrade each release with the zone-aware values.

```bash
helm upgrade "$RELEASE" "$CHART" \
  --version "$CHART_VERSION" \
  --namespace "$NAMESPACE" \
  --values "$VALUES" \
  --wait \
  --timeout 15m
```

Each release now contains both the existing numbered StatefulSet and a new zone-specific StatefulSet. Wait for the zone-specific brokers to become ready before you continue. Don't remove the numbered brokers yet. The new brokers haven't joined the logical cluster, so the numbered brokers are still the only active members.

[Check that the numbered brokers are still healthy](#check-broker-health). The new zone-aware brokers report unhealthy until you migrate their zone.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration
