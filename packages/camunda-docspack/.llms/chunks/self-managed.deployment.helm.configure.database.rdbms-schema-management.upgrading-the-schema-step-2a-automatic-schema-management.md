# Schema creation and management — Upgrading the schema — Step 2a: Automatic schema management

If `autoDDL: true`, Liquibase applies schema migrations automatically when an upgraded Camunda orchestration pod starts.

Camunda supports rolling upgrades for RDBMS deployments. During the upgrade, the first upgraded cluster node applies the schema changes. Liquibase holds a lock on the database schema while the migration runs, and other cluster nodes wait for the lock to be released before they start.

(Optional) For large production clusters, reduce the orchestration deployment to one replica before the upgrade so only
one upgraded pod starts the Liquibase migration:

```bash
kubectl scale deployment camunda-orchestration --replicas=1 -n camunda
```

**Note**
This reduces processing capacity during the upgrade because only one orchestration replica remains. The schema
migration is performed when the first upgraded cluster node starts.

Keep the effective replica count at `1` until Liquibase completes. If your Helm values manage the replica count, make
sure the upgrade does not restore the larger replica count before the migration finishes.

Deploy the new Camunda version:

```bash
helm upgrade camunda camunda/camunda-platform --version X.Y.Z -f values.yaml -n camunda
```

For large databases and long-running schema migrations, review [Liquibase lock issues](#liquibase-lock-issues) before
upgrading. You might need to increase the DDL lock wait timeout so a long-running migration is not treated as stale.

The Helm chart defines a default `readinessProbe`. Longer-running migrations may cause the pod to be marked as not ready. If this happens, you can increase the `readinessProbe` timeout in your Helm values:

```yaml
orchestration:
  readinessProbe:
    # Allows up to 900 seconds (15m) for Liquibase to complete before the pod is marked not ready
    initialDelaySeconds: 300
    periodSeconds: 30
    failureThreshold: 20
```

After Liquibase completes, scale the orchestration deployment back to your desired replica count:

```bash
kubectl scale deployment camunda-orchestration --replicas=3 -n camunda
```

**Note**
The RDBMS upgrade is a rolling upgrade and does not require downtime of the orchestration cluster. Some schema
operations might take longer to complete when the cluster and database is under load. If you experience long-running
migrations, consider reducing the client-side load of the orchestration cluster or scale down the cluster to 0 replicas
before the upgrade.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-schema-management
