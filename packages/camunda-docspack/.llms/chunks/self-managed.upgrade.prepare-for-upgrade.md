# Prepare for upgrade

Prepare your Camunda 8.9 Self-Managed environment for an upgrade to 8.10 by confirming eligibility and completing any required pre-upgrade actions.

Prepare your Self-Managed environment for an upgrade to Camunda 8.10.


## About

Use this guide to confirm upgrade eligibility, understand platform-level changes, and identify actions you may need to take before running an upgrade.

All Camunda upgrades must follow the required upgrade procedure: upgrade to the latest patch of your current minor first, then upgrade one minor version at a time without skipping minors. Skipping a minor version fails the schema compatibility check and blocks startup. Upgrading to the latest patch of each minor is strongly recommended for fix coverage, but the check itself compares minor versions.

See [version compatibility checks](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/version-compatibility#required-upgrade-procedure) and [supported upgrade paths](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/version-compatibility#supported-upgrade-paths).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/prepare-for-upgrade
