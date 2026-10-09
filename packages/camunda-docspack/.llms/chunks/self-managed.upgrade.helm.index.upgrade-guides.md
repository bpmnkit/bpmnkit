# Upgrade Helm chart — Upgrade guides

Use the Helm upgrade guide to upgrade a Camunda 8 Self-Managed deployment installation using the official Camunda Helm charts:

**Note: Patch upgrades within the same minor version**
For patch upgrades within the same minor version, such as `8.8.9` to `8.8.23`, there is no separate upgrade guide unless a specific patch's release notes specify additional required actions. Use the Helm chart [version matrix](https://helm.camunda.io/camunda-platform/version-matrix/) to identify the chart version for your target Camunda patch version, and review the relevant patch release notes before upgrading.

### Helm chart version

The Camunda Helm chart version is independent from the Camunda application version. Use the Helm chart [version matrix](https://helm.camunda.io/camunda-platform/version-matrix/) to identify the Helm chart version that deploys your Camunda application version.

You can also list available chart versions using the Helm CLI:

```bash
helm repo update
helm search repo camunda/camunda-platform --versions
```

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/index
