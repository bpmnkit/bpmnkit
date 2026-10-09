# RDBMS troubleshooting and operations — Liquibase lock after pod crash or restart

**Symptom:** Pod startup appears stuck on Liquibase, or repeated restarts fail while waiting for `databasechangeloglock`.

**Cause:** A previous pod may have been terminated while Liquibase was still running, leaving a lock row behind.

**Behavior:** Camunda waits for a stale Liquibase DDL lock using `camunda.data.secondary-storage.rdbms.ddl-lock-wait-timeout` (default: `PT15M`).

**Fix:**

1. Increase the timeout for slow migrations (for example, large index creation):

```yaml
orchestration:
  extraConfiguration:
    - file: "rdbms-liquibase-lock-timeout.yaml"
      content: |
        camunda:
          data:
            secondary-storage:
              rdbms:
                ddl-lock-wait-timeout: PT30M
```

2. Avoid terminating Orchestration Cluster pods while Liquibase is actively applying migrations.
3. Only release `databasechangeloglock` manually when you have verified no migration is still running.

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/rdbms-troubleshooting
