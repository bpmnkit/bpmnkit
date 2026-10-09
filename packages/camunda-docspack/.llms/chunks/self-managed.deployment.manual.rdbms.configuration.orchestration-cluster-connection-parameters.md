# Configure RDBMS for manual installations — Orchestration Cluster connection parameters

The Orchestration Cluster uses a single RDBMS configuration shared across orchestration services and UIs that read from secondary storage. Set the connection properties as shown in [Step 2: Configure connection](#step-2-configure-connection) above.

### Zeebe exporter configuration

Configure Zeebe's exporter flush behavior:

```bash
export CAMUNDA_DATA_SNAPSHOTPERIOD=5m
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_FLUSHINTERVAL=PT0.5S
export CAMUNDA_DATA_SECONDARY_STORAGE_RDBMS_QUEUESIZE=1000
```


## Schema management

### Liquibase (recommended)

Liquibase is the recommended approach for schema management. It is supported for the Orchestration Cluster and automatically applies migrations on startup (when `auto-ddl=true`, the default).

When Liquibase runs successfully, you'll see this log entry at INFO level:

```text
[INFO] io.camunda.application.commons.rdbms.MyBatisConfiguration - Initializing Liquibase for RDBMS with global table trimmedPrefix ''.
```

### Manual SQL execution

Manual SQL execution is supported as an alternative. When using manual SQL:

- You must strictly adhere to the bundled scripts in the order provided.
- Camunda cannot guarantee future updates will work if you modify scripts.
- This approach is useful when DBAs require strict control over database changes.

Download scripts: [Access SQL and Liquibase scripts](https://docs.camunda.io/docs/next/self-managed/deployment/helm/configure/database/access-sql-liquibase-scripts).

---
Source: https://docs.camunda.io/docs/next/self-managed/deployment/manual/rdbms/configuration
