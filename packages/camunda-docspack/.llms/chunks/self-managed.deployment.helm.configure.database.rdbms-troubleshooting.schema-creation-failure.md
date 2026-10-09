# RDBMS troubleshooting and operations — Schema creation failure

**Symptom:** Liquibase errors; tables not created.

**Diagnosis:**

1. Check Liquibase logs:

```bash
kubectl logs <pod-name> | grep -i liquibase
```

2. Verify `autoDDL` is enabled (default: `true`):

```yaml
orchestration:
  extraConfiguration:
    - file: "manual-schema-management.yaml"
      content: |
        camunda:
          data:
            secondary-storage:
              rdbms:
                auto-ddl: false # Confirm this is set
```

3. Test database user permissions (see [schema management](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-schema-management#database-user-permissions)).

**Fix:** Ensure database user has DDL permissions or disable autoDDL and apply schema manually. See [schema management](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-schema-management).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-troubleshooting
