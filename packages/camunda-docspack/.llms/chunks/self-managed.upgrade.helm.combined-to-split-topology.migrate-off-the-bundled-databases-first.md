# Move from a combined release to the split topology — Migrate off the bundled databases first

The Hub release takes over the Management Identity and Camunda Hub databases the combined release already uses, so those databases must live outside the Helm chart before you start. Camunda 8.10 removes the bundled Bitnami PostgreSQL subcharts.

If your release still runs Management Identity or Camunda Hub against a bundled Bitnami PostgreSQL (`identityPostgresql` or `webModelerPostgresql`), do the following for each database:

1. Migrate that data to a database the chart doesn't manage. This can be your own deployment of Bitnami PostgreSQL, a managed cloud database, or any other supported PostgreSQL. See [migrate from Bitnami charts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/operational-tasks/migration-from-bitnami/index).
2. Point the combined release at the external database, and confirm Management Identity or Camunda Hub works against it.
3. Only then remove the bundled database.

**Danger: Protect the bundled database's volume**
Before you remove a bundled PostgreSQL, check the reclaim policy of its PersistentVolume and the `persistentVolumeClaimRetentionPolicy` of its StatefulSet. If either deletes the volume when the StatefulSet or its PVC is removed, you lose its data: for Management Identity, users, groups, roles, and permissions; for Camunda Hub, projects, files, and settings. Set the PersistentVolume's `persistentVolumeReclaimPolicy` to `Retain`, and take a verified backup, before you disable the subchart.

The Hub release's Management Identity and Camunda Hub then use those external databases. See [upgrade Camunda 8.9 to 8.10 using Helm](https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100#remove-keys-rejected-by-chart-15x).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/combined-to-split-topology
