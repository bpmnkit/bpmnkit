# Dual-Region — Requirements — Upgrade considerations

Follow the upgrade recommendations in the [Camunda Helm chart](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/index) and the [component-specific upgrade guides](https://docs.camunda.io/docs/next/self-managed/upgrade/components/index).

Review the [upgrade overview](https://docs.camunda.io/docs/next/self-managed/upgrade/index) before starting, and always create a [Camunda-supported backup](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/backup-and-restore) first.

For dual-region setups, use a **staged upgrade approach**: upgrade one region at a time. Upgrading both regions simultaneously risks **quorum loss** in Zeebe partitions. Complete the upgrade in one region before starting the other, updating only one Zeebe broker at a time.

Certain **minor version upgrades** might require you to upgrade both regions simultaneously to complete migration steps. Always check the release notes and migration instructions for your version before proceeding.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/multi-region/dual-region
