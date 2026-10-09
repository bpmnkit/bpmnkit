# RDBMS example deployment for Camunda with Helm — Installation workflow — Step 8: Verify the installation

Check that tables were created and data is being written:

```bash
# Port-forward to the database (if not directly accessible)
kubectl port-forward -n camunda svc/postgres 5432:5432

# Connect and verify
psql -h localhost -U camunda -d camunda -c "SELECT * FROM zeebe_process;"
```

Deploy a test process using Web Modeler and verify it appears in the database:

```sql
SELECT COUNT(*) FROM process_instances;
```

For a full post-deployment checklist, see [validate RDBMS connectivity](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/validate-rdbms).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/install/helm-with-rdbms
