# Upgrade Camunda 8.9 to 8.10 using Helm — Migrate Web Modeler and Console to Camunda Hub — Restore Hub traffic

After validating the migration, set the release to the `normal` phase:

```bash
helm upgrade <RELEASE> camunda/camunda-platform \
  --version <CHART_VERSION> \
  --namespace <NAMESPACE> \
  -f values-8.10.yaml \
  --set camundaHub.upgrade.phase=normal \
  --wait \
  --timeout 10m
```

Wait for both Hub workloads:

```bash
kubectl -n <NAMESPACE> rollout status \
  deployment/<RELEASE>-web-modeler-restapi \
  --timeout=10m
kubectl -n <NAMESPACE> rollout status \
  deployment/<RELEASE>-web-modeler-websockets \
  --timeout=10m
```

**Note**
The lifecycle phases currently rely on the operator to follow this sequence. The chart does not yet prevent you from selecting `normal` before migration completes.

For a fresh 8.10 installation, leave `camundaHub.upgrade.phase` at its default value, `normal`. The `quiesce` and `migrate` phases apply only when upgrading an existing 8.9 Hub database.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
