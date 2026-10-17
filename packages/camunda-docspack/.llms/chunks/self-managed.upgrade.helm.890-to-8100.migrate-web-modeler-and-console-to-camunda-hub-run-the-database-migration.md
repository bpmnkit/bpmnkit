# Upgrade Camunda 8.9 to 8.10 using Helm — Migrate Web Modeler and Console to Camunda Hub — Run the database migration

Set the release to the `migrate` phase:

```bash
helm upgrade <RELEASE> camunda/camunda-platform \
  --version <CHART_VERSION> \
  --namespace <NAMESPACE> \
  -f values-8.10.yaml \
  --set camundaHub.upgrade.phase=migrate \
  --set camundaHub.restapi.livenessProbe.enabled=false \
  --set camundaHub.restapi.startupProbe.enabled=false \
  --wait \
  --timeout 10m
```

The chart disables the REST API liveness and startup probes by default. Keep these probes disabled for the `migrate` phase. Also keep a probe disabled if you enabled it under the legacy `webModeler.restapi.*` keys. The probe endpoint isn't reachable until the migration completes. Therefore, Kubernetes restarts the container after `failureThreshold` failed probes.

Measure the migration time on a test system that has a copy of your data. Set `--timeout` to a value longer than that time. If `helm upgrade` exceeds that timeout, the migration pod continues to migrate. In this case, check the logs of the migration pod before you do anything else.

The single Hub REST API pod runs the database migration during startup. The Hub Service doesn't route to the pod. Wait until the pod is ready:

```bash
kubectl -n <NAMESPACE> rollout status \
  deployment/<RELEASE>-web-modeler-restapi \
  --timeout=10m
```

Before you restore traffic, check the migrated Hub data. First, check the REST API logs:

```bash
kubectl -n <NAMESPACE> logs \
  deployment/<RELEASE>-web-modeler-restapi
```

For the Flyway log entries that show the progress and the result of the migration, see [Database migration](https://docs.camunda.io/docs/next/self-managed/components/hub/version-upgrade#database-migration). For the changes that the migration makes to your Hub data, see [Data migration](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#data-migration).

The migration also carries the clusters that your projects used into Hub as environments. It assigns the environments to their workspaces. See [environments](https://docs.camunda.io/docs/next/self-managed/upgrade/components/890-to-8100#environments).

The Hub Services don't route to the migration pod. To check the migrated data in the Hub UI before you restore traffic, forward a local port to the pod. Use `kubectl -n <NAMESPACE> port-forward deployment/<RELEASE>-web-modeler-restapi <LOCAL_PORT>:<POD_PORT>`.

If the migration fails:

1. Set `camundaHub.upgrade.phase` to `quiesce` again. Wait until both Hub Deployments reach zero replicas. See [Stop Web Modeler and Console workloads](#stop-web-modeler-and-console-workloads) for the procedure.
1. Check that no other process that can write to the Hub database runs.
1. Restore the 8.9 Hub database backup. Check the backup. For the procedure, see [Backup and restore Hub data](https://docs.camunda.io/docs/next/self-managed/operational-guides/backup-restore/modeler-backup-and-restore#restore).
1. Fix the cause of the failure. Repeat the `migrate` phase.

To return the whole release to 8.9 instead, restore the Hub database backup. Then find the last 8.9 revision with `helm history <RELEASE> --namespace <NAMESPACE>`. Then run `helm rollback <RELEASE> <REVISION> --namespace <NAMESPACE>`. The rollback applies to every component in the release.

The `quiesce` upgrade already moved the Orchestration Cluster and the other components to 8.10. Camunda doesn't support minor downgrades. Therefore, also restore the backups you created of those components before the upgrade. See [version compatibility checks](https://docs.camunda.io/docs/next/self-managed/components/orchestration-cluster/core-settings/concepts/version-compatibility).

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
