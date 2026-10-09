# Upgrade Camunda 8.9 to 8.10 using Helm — Migrate Web Modeler and Console to Camunda Hub — Run the database migration

Set the release to the `migrate` phase:

```bash
helm upgrade <RELEASE> camunda/camunda-platform \
  --version <CHART_VERSION> \
  --namespace <NAMESPACE> \
  -f values-8.10.yaml \
  --set camundaHub.upgrade.phase=migrate \
  --set camundaHub.restapi.livenessProbe.enabled=false \
  --wait \
  --timeout 10m
```

Disabling the REST API liveness probe prevents Kubernetes from restarting the pod during a long-running migration. Wait for the single Hub REST API pod to become ready. The pod runs the database migration during startup but remains fenced from the Hub Service:

```bash
kubectl -n <NAMESPACE> rollout status \
  deployment/<RELEASE>-web-modeler-restapi \
  --timeout=10m
```

Review the REST API logs and validate the migrated Hub data before restoring traffic:

```bash
kubectl -n <NAMESPACE> logs \
  deployment/<RELEASE>-web-modeler-restapi
```

Look for an entry as follows:

```
[2026-09-11 15:05:06.501] [main] INFO
	org.flywaydb.core.internal.command.DbMigrate - Successfully applied 33 migrations to schema "public", now at version v20260828 (execution time 00:00.380s)
```

Note that the number of migrations, the final version, and the execution time may vary depending on the exact versions you migrate between and your database setup.

If migration fails and you must return to 8.9:

1. Set `camundaHub.upgrade.phase` back to `quiesce` and wait for both Hub Deployments to reach zero replicas, as described in [Stop Web Modeler and Console workloads](#stop-web-modeler-and-console-workloads).
1. Confirm all other processes that can write to the Hub database are stopped.
1. Restore and verify the 8.9 Hub database backup.
1. Roll back the Helm release to the intended 8.9 release revision.

---
Source: https://docs.camunda.io/docs/next/self-managed/upgrade/helm/890-to-8100
