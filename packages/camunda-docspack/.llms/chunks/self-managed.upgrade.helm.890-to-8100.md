# Upgrade Camunda 8.9 to 8.10 using Helm

Upgrade a Camunda 8 Self-Managed deployment from version 8.9 to 8.10 with Helm. This page includes the deprecated Helm keys for application configuration that move to extraConfiguration.

Upgrade a Helm-managed Camunda 8 Self-Managed deployment from version 8.9 to 8.10.

**Info: Upgrade procedure**
All Camunda 8 upgrades must follow the required upgrade procedure. First, upgrade to the latest patch of your current minor. Then, upgrade one minor version at a time. Don't skip minor versions.

If you skip a minor version, the schema compatibility check fails and blocks startup. We strongly recommend that you upgrade to the latest patch of each minor for fix coverage. However, the check itself compares minor versions.

See [version compatibility checks](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/version-compatibility#required-upgrade-procedure).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
