# Upgrade Camunda 8.9 to 8.10 using Helm — Migrate Web Modeler and Console to Camunda Hub — Stop Web Modeler and Console workloads

Upgrade the release to 8.10 in the `quiesce` phase. This `helm upgrade` also upgrades every other component in the release to 8.10:

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

Check that both Web Modeler Deployments show zero desired and available replicas:

```bash
kubectl -n <NAMESPACE> get deployment \
  <RELEASE>-web-modeler-restapi \
  <RELEASE>-web-modeler-websockets
```

The Deployment status doesn't count terminating pods. Check that no Web Modeler pods remain. Continue when the command returns `No resources found`:

```bash
kubectl -n <NAMESPACE> get pods \
  -l app.kubernetes.io/instance=<RELEASE>,app.kubernetes.io/name=web-modeler
```

Also check that the 8.9 Console Deployment and pods no longer exist. Helm removes the Console Deployment during this upgrade, so the first command returns `NotFound` and the second command returns `No resources found`:

```bash
kubectl -n <NAMESPACE> get deployment <RELEASE>-console
kubectl -n <NAMESPACE> get pods \
  -l app.kubernetes.io/instance=<RELEASE>,app.kubernetes.io/component=console
```

Stop any external processes that write to the Hub database. Check that no Hub writers remain before you continue.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
