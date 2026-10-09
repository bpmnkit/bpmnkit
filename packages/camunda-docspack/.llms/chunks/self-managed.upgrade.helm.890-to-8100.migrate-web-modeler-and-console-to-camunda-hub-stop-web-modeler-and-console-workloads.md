# Upgrade Camunda 8.9 to 8.10 using Helm — Migrate Web Modeler and Console to Camunda Hub — Stop Web Modeler and Console workloads

Upgrade the release to 8.10 in the `quiesce` phase:

```bash
helm repo update
helm upgrade <RELEASE> camunda/camunda-platform \
  --version <CHART_VERSION> \
  --namespace <NAMESPACE> \
  -f values-8.10.yaml \
  --set camundaHub.upgrade.phase=quiesce \
  --wait \
  --timeout 10m
```

Confirm both Web Modeler Deployments show zero desired and available replicas. Also confirm the 8.9 Console Deployment and pods have terminated:

```bash
kubectl -n <NAMESPACE> get deployment \
  <RELEASE>-web-modeler-restapi \
  <RELEASE>-web-modeler-websockets
```

Stop any external processes that write to the Hub database. Confirm no Hub writers remain before continuing.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
