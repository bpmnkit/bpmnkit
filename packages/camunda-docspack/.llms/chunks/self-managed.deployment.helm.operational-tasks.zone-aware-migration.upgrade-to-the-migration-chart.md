# Migrate to zone-aware brokers — Upgrade to the migration chart

Upgrade each existing release to the chart version that supports zone-aware migration, with its existing values unchanged.

Keep `orchestration.partitioning.keepUnzonedBrokers` disabled during this chart upgrade. Wait for the rollout to finish before you enable the migration flag. If you enable the flag in the same command as the chart upgrade, numbered brokers can restart during migration.

```bash
helm upgrade "$RELEASE" "$CHART" \
  --version "$CHART_VERSION" \
  --namespace "$NAMESPACE" \
  --values "$VALUES" \
  --wait \
  --timeout 15m
```

The `--timeout` value is an example. Increase it if broker rollouts in your cluster take longer.

After each rollout, [check that every broker is healthy](#check-broker-health) before you upgrade the next release or enable the migration flag.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/zone-aware-migration
