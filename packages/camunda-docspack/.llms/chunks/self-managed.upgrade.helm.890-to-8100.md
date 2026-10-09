# Upgrade Camunda 8.9 to 8.10 using Helm

Upgrade a Camunda 8 Self-Managed deployment from version 8.9 to 8.10 using Helm, including the deprecated application configuration Helm keys that move to extraConfiguration.

Upgrade a Helm-managed Camunda 8 Self-Managed deployment from version 8.9 to 8.10.

**Info: Upgrade procedure**
All Camunda 8 upgrades must follow the required upgrade procedure: upgrade to the latest patch of your current minor first, then upgrade one minor version at a time without skipping minors. Skipping a minor version fails the schema compatibility check and blocks startup. Upgrading to the latest patch of each minor is strongly recommended for fix coverage, but the check itself compares minor versions.

See [version compatibility checks](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/version-compatibility#required-upgrade-procedure).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
