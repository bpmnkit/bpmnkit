# Schema creation and management — Upgrading the schema — Step 2b: Migrate the schema manually with SQL scripts

If `autoDDL: false`, apply the SQL migration scripts before or during the Camunda version upgrade. The SQL scripts are
forward compatible with the previous Camunda version, so you can apply them while the existing cluster is running.

(Optional) Scale the orchestration deployment to zero replicas if your maintenance process requires the application to
stop before schema changes are applied:

```bash
kubectl scale deployment camunda-orchestration --replicas=0 -n camunda
```

Apply the SQL scripts from the Camunda release bundle or from
the [Liquibase scripts page](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/access-sql-liquibase-scripts), then
deploy the new Camunda version:

```bash
helm upgrade camunda camunda/camunda-platform --version X.Y.Z -f values.yaml -n camunda
```

If you scaled the deployment to zero replicas, scale the orchestration deployment back to your desired replica count
after the upgrade:

```bash
kubectl scale deployment camunda-orchestration --replicas=3 -n camunda
```

Monitor the rollout:

```bash
kubectl rollout status deployment/camunda-orchestration -n camunda
```

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-schema-management
