# Upgrade Camunda 8.9 to 8.10 using Helm — Run the Helm upgrade

If your 8.9 release doesn't run Web Modeler, run the upgrade in one step:

```bash
helm repo update
helm upgrade <RELEASE> camunda/camunda-platform \
  --version <CHART_VERSION> \
  --namespace <NAMESPACE> \
  -f values-8.10.yaml
```

The one-step upgrade applies to a Console-only release after you enable Camunda Hub. To enable Hub, see [Deploy Camunda Hub for a Console-only release](#deploy-camunda-hub-for-a-console-only-release).

If your release runs Web Modeler, don't run this command. Follow [Migrate Web Modeler and Console to Hub](#migrate-web-modeler-and-console-to-camunda-hub) instead. The first `helm upgrade` of that procedure, in the `quiesce` phase, also upgrades every other component to 8.10.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
