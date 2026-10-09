# RDBMS configuration overview — Enable RDBMS as secondary storage

Set the `camunda.data.secondary-storage.type` property to `rdbms` to activate the full RDBMS backend in a single step. This automatically enables the RDBMS exporter, which streams workflow data to the database, and configures the application layer (Operate, Tasklist, Identity, REST API) to use RDBMS for secondary storage.

Example configuration:

```yaml
# Configure secondary storage for Camunda applications
camunda:
  data:
    secondary-storage:
      type: rdbms
      rdbms:
        url: jdbc:postgresql://localhost:5432/camunda
        username: camunda
        password: camunda
```

The RDBMS exporter can be used alongside other exporters, but enabling multiple exporters may affect performance.

---
Source: https://docs.camunda.io/docs/next/self-managed/concepts/databases/relational-db/configuration
